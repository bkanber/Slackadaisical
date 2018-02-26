'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var blessed = require('blessed');
var MessagesList = require('./MessagesList');
var MessageForm = require('./MessageForm');

var ChannelBox = function () {
    function ChannelBox(channel, screen, api) {
        _classCallCheck(this, ChannelBox);

        this.channel = channel;
        this.screen = screen;
        this.api = api;

        this.box = blessed.box({
            parent: this.screen,
            label: this.api.getChannelDisplayName(channel) + ' (Ctrl-y)',
            top: 'top',
            left: 25,
            width: '100%-25',
            height: '100%',
            input: true,
            mouse: true,
            border: {
                type: 'line'
            },
            style: {
                fg: 'white',
                border: {
                    fg: 'yellow'
                }
            }
        });

        this.messagesList = new MessagesList(this);
        this.messageForm = new MessageForm(this);
    }

    _createClass(ChannelBox, [{
        key: 'refresh',
        value: function refresh() {
            this.messagesList.refresh();
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this.messagesList.destroy();
            this.messageForm.destroy();
            this.box.destroy();
        }
    }]);

    return ChannelBox;
}();

module.exports = ChannelBox;