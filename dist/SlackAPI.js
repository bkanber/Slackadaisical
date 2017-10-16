'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require('events').EventEmitter;
var request = require('request');
var WebSocketClient = require('websocket').client;

var SLACK_API = exports.SLACK_API = 'https://slack.com/api/';

var SlackAPI = function (_EventEmitter) {
    _inherits(SlackAPI, _EventEmitter);

    function SlackAPI(token, screen) {
        _classCallCheck(this, SlackAPI);

        var _this = _possibleConstructorReturn(this, (SlackAPI.__proto__ || Object.getPrototypeOf(SlackAPI)).call(this));

        _this.screen = screen; // used only for logging here
        _this.token = token;
        _this.users = {};
        _this.channels = {};
        _this.messages = [];
        _this.rtm = null;

        _this.init();
        return _this;
    }

    _createClass(SlackAPI, [{
        key: 'init',
        value: function init() {
            this.fetchUsers();
            this.connectRTM();
        }
    }, {
        key: 'connectRTM',
        value: function connectRTM() {
            var _this2 = this;

            this.rtm = new WebSocketClient();

            this.get('rtm.connect', {}, function (err, resp, body) {
                if (err || !body.ok) {
                    _this2.screen.log("API: rtm.connect failed");
                    _this2.screen.log(err);
                    _this2.screen.log(body);
                    console.log("Failed connecting to slack. See log for details.");
                    process.exit(1);

                    return;
                }

                _this2.rtm.on('connect', function (connection) {

                    connection.on('error', function (error) {
                        console.log("Connection Error: " + error.toString());
                    });

                    connection.on('message', function (message) {
                        var data = message.utf8Data;
                        var obj = JSON.parse(data);
                        _this2.messages.push(obj);
                        _this2.emit('message', obj);

                        if (_this2.channels[obj.channel]) {
                            if (typeof _this2.channels[obj.channel].history === 'undefined') {
                                _this2.channels[obj.channel].history = { messages: [] };
                            }
                            if (typeof _this2.channels[obj.channel].history.messages === 'undefined') {
                                _this2.channels[obj.channel].history.messages = [];
                            }
                            _this2.channels[obj.channel].history.messages.unshift(obj);
                            _this2.screen.log("API: Added message to channel history, now " + _this2.channels[obj.channel].history.messages.length + " messages in " + obj.channel);
                        } else {
                            _this2.screen.log("API: couldn't add message to channel history, channel does not exist " + obj.channel);
                            _this2.screen.log(obj);
                        }
                    });
                });

                _this2.rtm.on('connectFailed', function (error) {
                    console.log('Connect Error: ' + error.toString());
                });

                _this2.rtm.connect(body.url);
            });
        }
    }, {
        key: 'getChannelDisplayName',
        value: function getChannelDisplayName(channel) {
            var display_name = channel.name || '';

            if (channel.is_im) {
                display_name = '@' + this.getUserName(channel.user);
            } else if (channel.is_mpim) {
                display_name = '@' + display_name.replace('mpdm-', '').replace('-1', '').replace(/--/g, ', ');
            } else if (channel.is_channel || channel.is_private) {
                display_name = '#' + display_name;
            }

            return display_name;
        }
    }, {
        key: 'markChannelRead',
        value: function markChannelRead(channel, callback) {
            var _this3 = this;

            var endpoint = 'channels.mark';
            if (channel.is_im) endpoint = 'im.mark';else if (channel.is_private) endpoint = 'groups.mark';else if (channel.is_mpim) endpoint = 'mpim.mark';

            if (this.channels[channel.id] && this.channels[channel.id].history && this.channels[channel.id].history.messages) {
                var mostRecentMessages = this.channels[channel.id].history.messages.filter(function (m) {
                    return typeof m.ts !== 'undefined';
                }).sort(function (a, b) {
                    var ats = 0;
                    var bts = 0;
                    if (a.ts) ats = parseFloat(a.ts);
                    if (b.ts) bts = parseFloat(b.ts);
                    return ats < bts ? 1 : -1;
                });

                var mostRecentMessage = mostRecentMessages[0];
                var payload = { channel: channel.id, ts: mostRecentMessage.ts };

                this.screen.log("API: Marking channel as read");
                this.screen.log(mostRecentMessage);
                this.screen.log(JSON.stringify(payload));

                this.post(endpoint, payload, function (err, resp, body) {
                    _this3.screen.log("API: Marking channel as read got response");
                    _this3.screen.log(JSON.stringify(body));
                    if (typeof callback === 'function') callback(body);
                });
            } else {
                this.screen.log("API: Couldn't mark channel " + channel.id + " as read");
                this.screen.log(JSON.stringify(this.channels[channel.id]));
                this.screen.log(JSON.stringify(Object.keys(this.channels)));
            }
        }
    }, {
        key: 'fetchChannelHistory',
        value: function fetchChannelHistory(channel, callback) {
            var _this4 = this;

            this.screen.log("API: Fetching channel history for " + channel.id);
            return this.get('conversations.history', { channel: channel.id }, function (err, resp, body) {
                if (err) {
                    _this4.screen.log("Error fetching history");
                    _this4.screen.log(err);
                }
                _this4.channels[channel.id].history = body;
                if (typeof callback === 'function') callback(body);
            });
        }
    }, {
        key: 'getUser',
        value: function getUser(id) {
            return this.users[id] || { id: id, name: id };
        }
    }, {
        key: 'getUserName',
        value: function getUserName(id) {
            return this.getUser(id).name;
        }
    }, {
        key: 'postMessage',
        value: function postMessage(channel, text, callback) {
            this.post('chat.postMessage', { channel: channel.id, text: text, as_user: true }, callback);
        }
    }, {
        key: 'fetchChannels',
        value: function fetchChannels(callback) {
            var _this5 = this;

            return this.get('conversations.list', { exclude_archived: true, types: 'public_channel,private_channel,mpim,im', limit: 500 }, function (err, resp, body) {

                var out = {};
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = body.channels[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var channel = _step.value;

                        out[channel.id] = channel;
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                _this5.channels = out;

                if (typeof callback === 'function') callback(out);
            });
        }
    }, {
        key: 'fetchUsers',
        value: function fetchUsers(callback) {
            var _this6 = this;

            return this.get('users.list', {}, function (err, resp, body) {
                var out = {};
                body.members.forEach(function (member) {
                    out[member.id] = member;
                });
                _this6.users = out;
                if (typeof callback === 'function') callback(out);
            });
        }
    }, {
        key: 'get',
        value: function get(methodName) {
            var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            var callback = arguments[2];

            var url = SLACK_API + methodName;

            if (args === null) {
                args = {};
            }

            args['token'] = this.token;

            return request({
                method: 'GET',
                url: url,
                json: true,
                qs: args
            }, callback);
        }
    }, {
        key: 'post',
        value: function post(methodName) {
            var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            var callback = arguments[2];


            var url = SLACK_API + methodName;
            if (args === null) {
                args = {};
            }

            args['token'] = this.token;

            return request({
                method: 'POST',
                url: url,
                form: args
            }, callback);
        }
    }]);

    return SlackAPI;
}(EventEmitter);

exports.default = SlackAPI;

module.exports = SlackAPI;