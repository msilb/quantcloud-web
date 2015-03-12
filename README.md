# QuantCloud Web

## Overview

This is an experimental HTML5 front-end for a yield curve calculation engine QuantCloud. It is showcasing the use of the following client-side technologies:

* [WebSocket JS](https://www.websocket.org) for communication with the back-end.
* [gridster.js](http://gridster.net) for laying out portlets + Bootstrap for general web layout and CSS.
* [Highcharts](http://highcharts.com) for charting.
* [npm](https://npmjs.org), [Bower](http://bower.io) and [Grunt](http://gruntjs.com) for building the app.

## Getting Started

After cloning, perform the following tasks:

1. Make sure you have all dependencies installed (Node.js incl. npm, grunt, and bower).
2. Run `npm install`.
3. Run `bower update`.
4. Run `grunt serve`, this should display the main page.

## Dependencies Management

To add js dependencies run e.g. `bower install gridster --save`, remove dependencies with `bower uninstall jquery --save`.
The `--save` switch is important because then you can use grunt to automatically inject dependencies into your index.html with `grunt bowerInstall`.

## Deploying

Run `grunt` to build minified version (html + js + css) in `<root>/dist` ready for deployment to server.
