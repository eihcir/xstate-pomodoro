"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var xstate_1 = require("xstate");
var immer_1 = require("@xstate/immer");
var types_1 = require("./types");
var Running = types_1.TimerStatus.Running, Idle = types_1.TimerStatus.Idle, Paused = types_1.TimerStatus.Paused;
var timerMachineConfig = {
    states: (_a = {},
        _a[Running] = {
            entry: 'enterRunning',
            always: {
                target: Idle,
                cond: 'checkExpired',
            },
            invoke: {
                src: 'ticker',
            },
            on: {
                PAUSE: {
                    target: 'paused',
                },
                TICK: {
                    actions: 'updateElapsed',
                },
            },
        },
        _a[Paused] = {
            entry: 'updateElapsed',
            on: {
                UNPAUSE: {
                    target: Running,
                    actions: 'onUnpause',
                },
            },
        },
        _a[Idle] = {
            always: {
                target: Running,
                cond: 'checkDuration',
            },
        },
        _a),
    on: {
        RESET: {
            actions: 'resetTimer',
        },
        'DURATION.UPDATE': {
            actions: 'handleDurationUpdate',
        },
    },
};
var resetTimer = immer_1.assign(function (context) {
    context.startTime = Date.now();
    context.offSet = 0;
    context.elapsed = 0;
});
var checkExpired = function (context) {
    return context.elapsed >= context.duration;
};
var checkDuration = function (context) {
    return context.elapsed < context.duration;
};
var ticker = function (context) { return function (cb) {
    var interval = setInterval(function () {
        cb('TICK');
    }, 1000 * context.interval);
    return function () {
        clearInterval(interval);
    };
}; };
var updateElapsed = immer_1.assign(function (context) {
    var elapsed = Math.min((Date.now() - context.startTime) / 1000 + context.offSet, context.duration);
    context.elapsed = parseInt(elapsed.toFixed(0));
});
var handleExpire = immer_1.assign(function (context) {
    context.elapsed = context.duration;
});
var enterRunning = immer_1.assign(function (context) {
    context.offSet = context.elapsed;
    context.startTime = Date.now();
});
var handleDurationUpdate = immer_1.assign(function (context, event) {
    if (event.type === 'DURATION.UPDATE') {
        context.duration = context.duration + (event.value || 10);
    }
});
var timerOptions = {
    actions: {
        updateElapsed: updateElapsed,
        enterRunning: enterRunning,
        handleExpire: handleExpire,
        resetTimer: resetTimer,
        handleDurationUpdate: handleDurationUpdate,
    },
    guards: {
        checkExpired: checkExpired,
        checkDuration: checkDuration,
    },
    activities: {},
    delays: {},
    services: {
        ticker: ticker,
    },
};
exports.createTimerMachine = function (options) {
    var context = __assign(__assign({ interval: 0.1 }, options), { offSet: 0, elapsed: 0, startTime: Date.now() });
    return xstate_1.createMachine(__assign(__assign({}, timerMachineConfig), { initial: Running, context: context }), timerOptions);
};
exports.createTimerService = function (options) {
    var machine = exports.createTimerMachine(options);
    var service = xstate_1.interpret(machine, { devTools: true });
    return service;
};
