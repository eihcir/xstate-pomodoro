"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var inspect_1 = require("@xstate/inspect");
var XStateTimer_1 = require("./XStateTimer");
inspect_1.inspect({
    // options
    // url: 'https://statecharts.io/inspect', // (default)
    iframe: false // open in new window
});
var onTick = function () { return console.log('tick'); };
var onFinish = function () { return console.log('finish'); };
var timer = new XStateTimer_1.Timer(10, onTick, onFinish);
// old package.json scripts:
// "scripts": {
//     "start:build": "tsc -w",
//     "start:run": "nodemon build/index.js",
//     "start": "concurrently npm:start:*"
//   },
