#!/usr/bin/env node
'use strict';

var fs = require('fs');
var commandLineArgs = require('command-line-args');
var Slacker = require('./Slacker');
var tokenPath = process.env.HOME + '/.slack_token';
var values = require('object.values');

if (!Object.values) {
    values.shim();
}

var optionsDef = [{ name: 'channels-width', type: Number, defaultValue: 25 }];
var options = commandLineArgs(optionsDef, { camelCase: true });

var token = null;

try {
    token = fs.readFileSync(tokenPath).toString().trim();
} catch (e) {
    console.log("Could not find a slack token at " + tokenPath);
    process.exit(1);
}

var app = new Slacker(token, options);
app.init();