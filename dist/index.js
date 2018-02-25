#!/usr/bin/env node
'use strict';

var fs = require('fs');
var Slacker = require('./Slacker');
var tokenPath = process.env.HOME + '/.slack_token';

var token = null;

try {
    var tokenFileContents = fs.readFileSync(tokenPath).toString().trim();

    try {
        // Try to parse as JSON, where keys are workspace names
        var data = JSON.parse(tokenFileContents);

        // If that succeeds, then we need a workspace name
        // which will be the last commandline arg. If we look
        // for it and we get back the name of this executable,
        // then the user forgot the workspace name.
        var wsName = process.argv.slice(-1)[0];
        if (wsName.endsWith("slackadaisical") || wsName.endsWith("index.js")) {
            console.error("If using multi-workspace mode, you must specify a workspace " + "with `slackadaisical [workspacename]`.");
            process.exit(1);
        }

        // If we CAN find that workspace name in the JSON,
        // then set it as the token for this session.
        if (!!data[wsName]) {
            token = data[wsName];
        } else {
            // Otherwise, warn the user and exit.
            console.log('Couldn\'t find workspace [' + wsName + '] in ~/.slack_token.');
            process.exit(1);
        }
    } catch (e) {
        // Fall back to a file that contains only one token (for
        // backwards compatibility)
        token = tokenFileContents;
    }
} catch (e) {
    console.log("Could not find a slack token at " + tokenPath);
    process.exit(1);
}

var app = new Slacker(token);
app.init();