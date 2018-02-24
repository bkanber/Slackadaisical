
const blessed = require('blessed');
const wrap = require('word-wrap');
const moment = require('moment');

const TIME_FORMAT = 'HH:mm';

class MessagesList {

    constructor(channel) {
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
                    fg: 'yellow',
                }
            }
        });

        this.messages = [
            'Loading messages, please wait.'
        ];

        // Initial (blank) render
        this.render();

        this.init();

        this.loadHistory = this.loadHistory.bind(this);
    }

    getUserReplacementMap() {
        let map = {};
        Object.values(this.api.users).forEach(u => {
            map['@' + u.id] = '@' + u.name;
        });
        return map;
    }

    init() {
        this.refresh();
        this.api.on('receive message', this.receiveMessage.bind(this));
    }

    receiveMessage(obj) {
        if (!this.exists) return null;
        if (obj.channel === this.channel.channel.id) {
            this.messages.push(obj);
            if (obj.type === 'message' && this.api.identity.user_id !== obj.user) {
                this.api.markChannelRead(this.channel.channel);                
            }
            this.render();
        }
    }

    refresh() {
        this.api.fetchChannelHistory(this.channel.channel, history => {this.loadHistory(history)});
    }

    destroy() {
        this.api.removeAllListeners('receive message');
        this.exists = false;
        this.box.destroy();
    }

    renderIm(m, userName) {
        let time = moment.unix(m.ts);
        let formattedTime = time.format(TIME_FORMAT);
        
        return `{bold}{green-fg}${userName}{/green-fg}{/bold} {cyan-fg}${formattedTime}{/cyan-fg}: \n${m.text}`;
    }
    
    renderAttachments(attachments, userName) {
        return attachments.map(attachment => {
            return `{bold}${attachment.title}{/bold}\n${attachment.title_link}`
        }).join('\n');
    }

    render() {
        // prevent against
        if (!this.box) return null;
        const width = parseInt(this.box.width) - 15;
        const userMap = this.getUserReplacementMap();
        let lines = [];
        this.messages
            .filter(m => m.type === 'message')
            .forEach((m, l) => {
                const userName = (typeof m.user !== 'undefined')
                    ? this.api.getUserName(m.user)
                    : (m.username ? m.username : 'Unknown User')
                ;

                let content;
                if (m.text) {
                    content = this.renderIm(m, userName)
                } else if (m.message && m.message.attachments) {
                    content = this.renderAttachments(m.message.attachments, userName);
                } else {
                    content = '';
                }
                for (const replaceId in userMap) {
                    const replaceName = userMap[replaceId];
                    content = content.replace(replaceId, replaceName);
                }
                const wrapped = content + "\n";
                lines.push(wrapped);
            });

        this.box.setContent(lines.join("\n") + "\n");
        this.box.setScrollPerc(100);
        this.screen.render();
    }

    loadHistory(body) {
        if (body.ok) {
            this.messages = body.messages.slice(0).reverse();
            this.screen.log("MessagesList: Attempt to mark channel " + this.channel.channel.id + " read");
            this.api.markChannelRead(this.channel.channel);
        } else {
            this.messages = [{
                text: 'Trouble loading this room. Error message was: ' + body.error + '. Try again later.',
                username: 'Slacker App',
                type: 'message',
                ts: (Date.now() / 1000)
            }];
        }
        this.render();
    }
}

module.exports = MessagesList;
