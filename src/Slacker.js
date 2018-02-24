const blessed = require('blessed');
const moment = require('moment');

const SlackAPI = require('./SlackAPI');
const ui = require('./ui');


class Slacker {
    constructor(token) {
        this.token = token;

        this.screen = blessed.screen({
            smartCSR: true,
            log: process.env.PWD + '/slacker.log',
            debug: true,
            dockBorders: true,
            autoPadding: true,
            ignoreDockContrast: true,
            fullUnicode: true,
        });

        this.api = new SlackAPI(this.token, this.screen);
        this.channelsList = new ui.ChannelsList(this.screen, this.api);
        this.channel = null;
        this.channelBox = null;

        this.screen.log(moment().format() + ": Slacker Init");
    }

    changeChannel(channel) {
        this.channel = channel;

        if (this.channelBox) {
            this.channelBox.destroy();
            this.channelBox = null;
        }

        this.channelBox = new ui.ChannelBox(this.channel, this.screen, this.api);
        this.channelBox.messageForm.textbox.focus();
    }

    init() {

        this.screen.key(['escape', 'C-c', 'C-q'], function(ch, key) {
            return process.exit(0);
        });

        this.screen.key(['C-l'], (ch, key) => {
            if (this.channelsList) {
                this.channelsList.box.focus();
            }
        });

        this.screen.key(['C-o'], (ch, key) => {
            if (this.channelBox && this.channelBox.messageForm && this.channelBox.messageForm.textbox) {
                this.channelBox.messageForm.textbox.focus();
            }
        });

        this.screen.key(['C-y'], (ch, key) => {
            if (this.channelBox && this.channelBox.messagesList && this.channelBox.messagesList.box) {
                this.channelBox.messagesList.box.focus();
            }
        });

        this.channelsList.on('select_channel', (ch) => {
            this.changeChannel(ch);
        });

        this.channelsList.init();
        // Focus channels list right away as there's nothing else interactive on screen
        this.channelsList.box.focus();
    }

}

module.exports = Slacker;