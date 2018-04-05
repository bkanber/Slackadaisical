#!/usr/bin/env node
'use strict';

var fs = require('fs');
var Slacker = require('./Slacker');
var configPath = process.env.HOME + '/.slackadaisical.json';
var tokenPath = process.env.HOME + '/.slack_token';
var values = require('object.values');

if (!Object.values) {
    values.shim();
}

var token = null;

try {
    // Try to read the config file as JSON. Failing this will fall back to
    // the old slack_token file.
    var config = JSON.parse(fs.readFileSync(configPath).toString());

    // Get the workspace name (the last arg from the CLI call)
    var wsName = process.argv.slice(-1)[0];
    if (wsName.endsWith("slackadaisical") || wsName.endsWith("index.js")) {
        // The user forgot to specify a workspace!
        console.error("If using multi-workspace mode, you must specify a workspace " + "with `slackadaisical [workspacename]`.");
        process.exit(1);
    }

    if (!!config.workspaces[wsName]) {
        token = config.workspaces[wsName].token;
    } else {
        // Otherwise, warn the user and exit.
        console.log('Couldn\'t find workspace [' + wsName + '] in ~/.slackadaisical.json. ' + 'Your options are: \n' + Object.keys(config.workspaces).map(function (i) {
            return '* ' + i;
        }).join("\n"));
        process.exit(1);
    }
} catch (e) {
    // Perhaps the user is using the old slack_token file?
    console.log('Couldn\'t parse ~/.slackadaisical.json, falling back to ~/.slack_token.');
    token = fs.readFileSync(tokenPath).toString().trim();
}

var app = new Slacker(token);
app.init();