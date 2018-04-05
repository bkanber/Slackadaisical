#!/usr/bin/env node

const fs = require('fs');
const Slacker = require('./Slacker');
const configPath = process.env.HOME + '/.slackadaisical.json';
const tokenPath = process.env.HOME + '/.slack_token';

let token = null;


try {
    // Try to read the config file as JSON. Failing this will fall back to
    // the old slack_token file.
    let config = JSON.parse(fs.readFileSync(configPath).toString());

    // Get the workspace name (the last arg from the CLI call)
    let wsName = process.argv.slice(-1)[0];
    if (
        wsName.endsWith("slackadaisical") ||
        wsName.endsWith("index.js")
    ) {
        // The user forgot to specify a workspace!
        console.error(
            "If using multi-workspace mode, you must specify a workspace " +
            "with `slackadaisical [workspacename]`."
        )
        process.exit(1);
    }

    if (!!config.workspaces[wsName]) {
        token = config.workspaces[wsName].token;
    } else {
        // Otherwise, warn the user and exit.
        console.log(
            `Couldn't find workspace [${wsName}] in ~/.slackadaisical.json. ` +
            `Your options are: \n` +
            Object.keys(config.workspaces).map(i => `* ${i}`).join("\n")
        );
        process.exit(1);
    }
} catch (e) {
    // Perhaps the user is using the old slack_token file?
    console.log(
        `Couldn't parse ~/.slackadaisical.json, falling back to ~/.slack_token.`
    );
    token = fs.readFileSync(tokenPath).toString().trim();
}


const app = new Slacker(token);
app.init();


