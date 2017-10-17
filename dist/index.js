#!/usr/bin/env node
'use strict';

var fs = require('fs');
var Slacker = require('./Slacker');
var tokenPath = process.env.HOME + '/.slack_token';

var token = null;

try {
    token = fs.readFileSync(tokenPath).toString().trim();
} catch (e) {
    console.log("Could not find a slack token at " + tokenPath);
    process.exit(1);
}

var app = new Slacker(token);
app.init();