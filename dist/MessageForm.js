'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var blessed = require('blessed');

var MessageForm = function () {
    function MessageForm(channel) {
        var _this = this;

        _classCallCheck(this, MessageForm);

        this.channel = channel;
        this.screen = this.channel.screen;
        this.api = this.channel.api;

        this.form = blessed.form({
            parent: this.channel.box,
            keys: true,
            left: 0,
            bottom: 0,
            width: '100%-2',
            height: 4,
            bg: 'black'
            // border: {type: 'line'}
        });

        this.textbox = blessed.textbox({
            parent: this.form,
            left: 0,
            top: 0,
            width: '100%',
            height: 4,
            bg: 'black',
            fg: 'white',
            input: true,
            mouse: true,
            keys: true,
            inputOnFocus: true,
            label: 'Write Message (Ctrl-o)',
            border: { type: 'line' }
        });

        this.textbox.key('enter', function (ch, key) {
            _this.form.submit();
        });

        this.form.on('submit', function (data) {
            var message = data.textbox;
            if (message.length > 0) {
                _this.api.postMessage(_this.channel.channel, message, function (err, resp, body) {
                    _this.form.reset();
                    _this.screen.render();
                    _this.textbox.focus();
                });
            }
        });
    }

    _createClass(MessageForm, [{
        key: 'destroy',
        value: function destroy() {
            this.form.destroy();
            this.textbox.destroy();
        }
    }]);

    return MessageForm;
}();

exports.default = MessageForm;


module.exports = MessageForm;