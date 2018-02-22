#!/usr/bin/env node
'use strict';

var fs = require('fs');
var Slacker = require('./Slacker');
var tokenPath = process.env.HOME + '/.slack_token';

var token = null;

try {
    var tokenFileContents = fs.readFileSync(tokenPath).toString().trim();

    try {
        var wsName = process.argv.slice(-1)[0];
        if (wsName.endsWith("slackadaisical") || wsName.endsWith("index.js")) {
            console.error("If using multi-workspace mode, you must specify a workspace with `slackadaisical [workspacename]`.");
            process.exit(1);
        }

        // Try to parse as JSON, where keys are workspace names
        var data = JSON.parse(tokenFileContents);
        if (!!data[wsName]) {
            token = data[wsName];
        } else {
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