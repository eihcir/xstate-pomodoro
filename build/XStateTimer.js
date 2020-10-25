"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TimerMachine_1 = require("./TimerMachine");
var types_1 = require("./types");
var Paused = types_1.TimerStatus.Paused, Idle = types_1.TimerStatus.Idle;
var TICK_INTERVAL = 500; // TODO: optionally pass this in
var Timer = /** @class */ (function () {
    function Timer(_targetSeconds, _onTick, _onFinish) {
        var _this = this;
        this._targetSeconds = _targetSeconds;
        this._onTick = _onTick;
        this._onFinish = _onFinish;
        this.pause = function () {
            _this._service.send('PAUSE');
        };
        this.unpause = function () {
            _this._service.send('UNPAUSE');
        };
        this.extend = function (value) {
            var event = {
                type: 'DURATION.UPDATE',
                value: value,
            };
            _this._service.send(event);
        };
        this.kill = function () { return _this._service.stop(); };
        this._onTimerUpdate = function (state) {
            console.log(state.event.type), state;
            if (state.value === Idle) {
                _this._onFinish();
            }
            if (state.event.type === 'TICK') {
                _this.tickCounter++;
                // Would be nice if timer kept track of tickCounter and it auto adjusted based on time
                // would be nice if there was a secondsRemaining prop on the timer.context
                _this.secondsRemaining =
                    state.context.duration - state.context.elapsed;
                _this._onTick();
            }
        };
        this.secondsRemaining = this._targetSeconds;
        var options = {
            duration: this._targetSeconds,
            interval: 0.5,
            onTick: this._onTick,
            onFinish: this._onFinish,
        };
        this.tickCounter = 0;
        this._service = TimerMachine_1.createTimerService(options).onTransition(this._onTimerUpdate);
        this._service.start();
    }
    Object.defineProperty(Timer.prototype, "paused", {
        get: function () {
            return this._service.state.value === Paused;
        },
        enumerable: true,
        configurable: true
    });
    return Timer;
}());
exports.Timer = Timer;
