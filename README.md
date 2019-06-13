# q2g-ext-scramble
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/b571357db4464b669486f547da8dd3de)](https://www.codacy.com/app/thomashaenig/q2g-ext-bookmark?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=q2g/q2g-ext-bookmark&amp;utm_campaign=Badge_Grade)
[![TravisCI](https://travis-ci.org/q2g/q2g-ext-scramble.svg?branch=master)](https://travis-ci.org/q2g/q2g-ext-scramble)
<a href="https://m.sense2go.net/extension-package"><img src="https://m.sense2go.net/downloads.svg" alt="drawing" width="130"/></a>

This extension was developed, to scramble fields in the datamodel of an app.

<aside class="warning">
The scramble function is not working with the actual qlik sense releases. For a workaround you have to duplicate the app after scrambling. Important is, that you do not close the session in which you have scrambled bevor duplicating the app.
</aside>

## Intro

![teaser](./docs/teaser.gif "Short teaser")

## Settings

### Options

In the configuration options you can toggle additional fields, to show them in the list.

In the accessibillity options you can switch the use of shortcuts from the default values to customise shortcuts. The recommendation ist to use the combination of "strg + alt + {any keycode}", so that you do not get in truble with screenreaders shortcuts.

![settings](./docs/screenshot_2.PNG?raw=true "Settings")

## Install

### binary

1. [Download the ZIP](https://m.sense2go.net/extension-package) and unzip
2. Qlik Sense Desktop
   Copy it to: %homeptah%\Documents\Qlik\Sense\Extensions and unzip
3. Qlik Sense Entripse
   Import in the QMC

### source

1. Clone the Github Repo into extension directory
2. Install [nodejs](https://nodejs.org/)
3. Open Node.js command prompt
4. npm install
5. npm run build
