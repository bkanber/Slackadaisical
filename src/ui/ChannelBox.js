
var blessed = require('blessed');
const MessagesList = require('./MessagesList');
const MessageForm = require('./MessageForm');

class ChannelBox {
    constructor(channel, screen, api) {
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
                    fg: 'yellow',
                }
            }
        });

        this.messagesList = new MessagesList(this);
        this.messageForm = new MessageForm(this);
    }

    refresh() {
        this.messagesList.refresh();
    }

    destroy() {
        this.messagesList.destroy();
        this.messageForm.destroy();
        this.box.destroy();
    }
}

module.exports = ChannelBox;
