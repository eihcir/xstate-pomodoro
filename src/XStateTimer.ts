import { interpret, Interpreter, State, StateMachine } from 'xstate';
import { createTimerService } from './TimerMachine';
import { TimerStatus, TimerContext, TimerEvent, TimerState } from './types';
const { Paused, Idle } = TimerStatus;
const TICK_INTERVAL = 500; // TODO: optionally pass this in

class Timer {
	public secondsRemaining: number;
	public tickCounter: number;
	public get paused() {
		return this._service.state.value === Paused;
	}

	private _service: Interpreter<TimerContext, TimerState, TimerEvent>;

	constructor(
		private _targetSeconds: number,
		private _onTick: () => void,
		private _onFinish: () => void,
	) {
		this.secondsRemaining = this._targetSeconds;
		const options = {
			duration: this._targetSeconds,
			interval: 0.5,
			onTick: this._onTick,
			onFinish: this._onFinish,
		};
		this.tickCounter = 0;
		this._service = createTimerService(options).onTransition(
			this._onTimerUpdate,
		);
		this._service.start();
	}
	public pause = () => {
		this._service.send('PAUSE');
	};

	public unpause = () => {
		this._service.send('UNPAUSE');
	};

	public extend = (value: number) => {
		const event: TimerEvent = {
			type: 'DURATION.UPDATE',
			value,
		};
		this._service.send(event);
	};

	public kill = () => this._service.stop();

	private _onTimerUpdate = (state: State<TimerContext, TimerEvent>) => {
		console.log(state.event.type), state;

		if (state.value === Idle) {
			this._onFinish();
		}

		if (state.event.type === 'TICK') {
			this.tickCounter++;
			// Would be nice if timer kept track of tickCounter and it auto adjusted based on time
			// would be nice if there was a secondsRemaining prop on the timer.context
			this.secondsRemaining =
				state.context.duration - state.context.elapsed;
			this._onTick();
		}
	};
}
export { Timer };
