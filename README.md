Slackadaisical
==============

Introduction
------------

Slackadaisical is a simple weekend project CLI interface to Slack. This is not a library and is not yet intended to be developed on top of. It's not even very good. This is just a simple, silly command line Slack client. But if you live in tmux or the command line like me, you might just like it.

![Slacker Screenshot](https://imgur.com/IVN7fvV.gif)

Right now this is a goof project. But if the world loves it and wants to
contribute to it, then I will maintain the app and make it a little more
robust. Currently there's no testing, autoloading, no options, documentation,
logging, or any niceties that a real app should enjoy. I will build those
things if the project ends up warranting it, and that's all up to you.

Installation
------------

Quick version:

    $ echo "YOUR_SLACK_API_USER_TOKEN" | tee ~/.slack_token # see below
	$ git clone https://github.com/bkanber/Slackadaisical.git
	$ cd Slackadaisical
    $ npm install
    $ npm start


Configuration
-------------

The app will yell at you if you don't install a file with your slack token in
it.

Visit https://api.slack.com/custom-integrations/legacy-tokens and generate a token for yourself.

You can install the token with the command `echo "YOUR_TOKEN" | tee ~/.slack_token`, 
or simply paste that token into `~/.slack_token` and all will be well.

Usage
-----

Hit Escape or Ctrl-c to exit.

**Navigating**: Hit Ctrl-l to jump to the channels list (j/k or arrows to move, Enter to select), Ctrl-o to compose (Enter to send), and Ctrl-y to jump to the channel messages history. Hit Esc to exit compose mode.

**Mouse**: If your terminal supports mouse events, you may try clicking or scrolling in things. 

TODO: More stuff here.

Known Issues
------------

Ordering of channels -- because of Slack's API structure, to put the channels in a most-recently-used order we'd need to call conversations.history on every channel. However, Slack's rate limits make that untenable for teams with over 50 channels. For now, channels appear unordered (but bubble to the top upon receiving new messages).


Contributing
------------

Use github, create github issues, use topic branches, make pull requests, be
polite, be patient.

Changelog
---------

Check out `git log` for the Changelog. I will semver and tag once we hit v1.0.0.

License
-------

Everything here is GPL v3.

About the Author
----------------

Burak Kanber is co-founder and CTO of Tidal Labs, a tech startup in digital
marketing. He loves the command line and wants to spend even more time in it,
so he took a day and built a simple CLI app using the Slack API.

Right now the plan for this repository is for me to continue contributing it
just to clean up some code and add the occasional feature. If I start using the
app every day, I'm sure certain things will bug me and I'll fix them. But this
isn't professional-grade software and isn't intended to be. There are no unit
tests and the code is poorly organized. If you want to help me
fix that, please feel free to contribute! I'm happy to maintain this
repository, but I don't want to hear criticism about not making this code
professional enough as I was never planning on sharing it publicly and only
made an attempt to clean if up after deciding to open source it ;).
