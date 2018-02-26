#!/usr/bin/env node

const fs = require('fs');
const commandLineArgs = require('command-line-args');
const Slacker = require('./Slacker');
const tokenPath = process.env.HOME + '/.slack_token';
const values = require('object.values');

if (!Object.values) {
    values.shim();
}

const optionsDef = [
    { name: 'channels-width', type: Number, defaultValue: 25 }
];
const options = commandLineArgs(optionsDef, { camelCase: true });

let token = null;

try {
    token = fs.readFileSync(tokenPath).toString().trim();
} catch (e) {
    console.log("Could not find a slack token at " + tokenPath);
    process.exit(1);
}

const app = new Slacker(token, options);
app.init();


