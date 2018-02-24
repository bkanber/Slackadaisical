'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var blessed = require('blessed');
var wrap = require('word-wrap');
var moment = require('moment');

var MessagesList = function () {
    function MessagesList(channel) {
        _classCallCheck(this, MessagesList);

        this.channel = channel;
        this.screen = this.channel.screen;
        this.api = this.channel.api;
        this.exists = true;

        this.box = blessed.box({
            parent: this.channel.box,
            top: 'top',
            left: '0%',
            width: '100%-2',
            height: '100%-6',
            tags: true,
            scrollable: true,
            alwaysScroll: true,
            input: true,
            mouse: true,
            vi: true,
            keys: true,
            scrollbar: {
                ch: " ",
                inverse: true
            },
            style: {
                border: {
                    fg: 'yellow'
                }
            }
        });

        this.messages = [];

        this.init();

        this.loadHistory = this.loadHistory.bind(this);
    }

    _createClass(MessagesList, [{
        key: 'getUserReplacementMap',
        value: function getUserReplacementMap() {
            var map = {};
            Object.values(this.api.users).forEach(function (u) {
                map['@' + u.id] = '@' + u.name;
            });
            return map;
        }
    }, {
        key: 'init',
        value: function init() {
            this.refresh();
            this.api.on('receive message', this.receiveMessage.bind(this));
        }
    }, {
        key: 'receiveMessage',
        value: function receiveMessage(obj) {
            if (!this.exists) return null;
            if (obj.channel === this.channel.channel.id) {
                this.messages.push(obj);
                this.render();
            }
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            var _this = this;

            this.api.fetchChannelHistory(this.channel.channel, function (history) {
                _this.loadHistory(history);
            });
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this.api.removeAllListeners('receive message');
            this.exists = false;
            this.box.destroy();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            // prevent against
            if (!this.box) return null;
            var lines = [];
            var width = parseInt(this.box.width) - 15;
            var userMap = this.getUserReplacementMap();
            this.messages.filter(function (m) {
                return m.type === 'message';
            }).forEach(function (m) {
                var userName = typeof m.user !== 'undefined' ? _this2.api.getUserName(m.user) : m.username ? m.username : 'Unknown User';
                var time = moment.unix(m.ts);
                var formattedTime = time.format('h:mma');
                var text = m.text ? m.text : JSON.stringify(m);
                var content = '{bold}{green-fg}' + userName + '{/bold}{green-fg} ' + '{cyan-fg}' + formattedTime + "{/cyan-fg}: \n" + text;
                for (var replaceId in userMap) {
                    var replaceName = userMap[replaceId];
                    content = content.replace(replaceId, replaceName);
                }
                var wrapped = wrap(content, { width: width }) + "\n";
                var exploded = wrapped.split("\n");
                lines = lines.concat(exploded);
            });

            this.box.setContent(lines.join("\n") + "\n");
            this.box.setScrollPerc(100);
            this.screen.render();
        }
    }, {
        key: 'loadHistory',
        value: function loadHistory(body) {
            if (body.ok) {
                this.messages = body.messages.slice(0).reverse();
                this.screen.log("MessagesList: Attempt to mark channel " + this.channel.channel.id + " read");
                this.api.markChannelRead(this.channel.channel);
            } else {
                this.messages = [{
                    text: 'Trouble loading this room. Error message was: ' + body.error + '. Try again later.',
                    username: 'Slacker App',
                    type: 'message',
                    ts: Date.now() / 1000
                }];
            }
            this.render();
        }
    }]);

    return MessagesList;
}();

exports.default = MessagesList;


module.exports = MessagesList;