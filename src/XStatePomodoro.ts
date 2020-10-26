import { interpret } from '@xstate/compiled';
import { Interpreter, State, StateMachine } from 'xstate';
// import { TimerStatus, TimerContext, TimerEvent, TimerState } from './types';
// const { Paused, Idle } = TimerStatus;
import { pomodoroMachine, PomodoroContext, PomodoroEvent } from './Pomodoro.machine'
const TICK_INTERVAL = 500; // TODO: optionally pass this in

export type CreatePomodoroServiceOptions = {
	workMinutes: number;
};

const createPomdoroService = (options: CreatePomodoroServiceOptions) => {
	// debugger
	const machine: any = pomodoroMachine.withContext({
		...options,
	})
	// debugger
	const service = interpret(machine, { devTools: true });
	return service;
};


class Pomodoro {
	// private _status: PpStatus;
	// private _currentPomodoro: pomdoroMachine | undefined;
	private _currentPomodoroService: any

	public get secondsRemaining() {
		return 0
		// return this._timer
		// 	? this._timer.secondsRemaining
		// 	: this._config.workMinutes * 60;
	}

	// public get status() {
	// 	return this._status;
	// }

	// public get tickCount() {
	// 	// return 1;
	// 	return this._timer ? this._timer.tickCounter : 0;
	// }

	// public get paused() {
	// 	return this._timer?.paused;
	// }

	// public set status(status: PpStatus) {
	// 	this._status = status;
	// }

	constructor(
		// private _config: PomoConfig,
		private workMinutes: number,
		public onUpdate: () => void,
		public onFinish: () => void,
	) {
		this._currentPomodoroService = createPomdoroService({ workMinutes: 0.2 }).onTransition(
			this._onPomodoroUpdate
		)
		this._currentPomodoroService.start()
		window._pomo = this._currentPomodoroService
	}

	private _onPomodoroUpdate = (state: any) => {
		console.log(state)

		if (state.value === 'WorkDone') {
			// debugger
			window.setTimeout(
				()=>this._currentPomodoroService.send({type: 'START_BREAK', durationMinutes: 0.2}), 3000)
		}
		if (state.event.type === 'UNPAUSE') {
			console.log('unpausing!!!')
		}
		if (state.event.type === 'PAUSE') {
			console.log('PAUSE event detected')
			// debugger
			window.setTimeout(()=>this._currentPomodoroService.send('UNPAUSE', {to: 'timer3'}), 3000)
		}
		if (state.event.type === 'xstate.init') {
			window.setTimeout(()=>this._currentPomodoroService.send('PAUSE', {to: 'shazbot'}), 3000)
		}
	}
// 		console.log(state.event.type), state;

// 		if (state.value === Idle) {
// 			this._onFinish();
// 		}

// 		if (state.event.type === 'TICK') {
// 			this.tickCounter++;
// 			// Would be nice if timer kept track of tickCounter and it auto adjusted based on time
// 			// would be nice if there was a secondsRemaining prop on the timer.context
// 			this.secondsRemaining =
// 				state.context.duration - state.context.elapsed;
// 			this._onTick();
// 		}
// 	};
// }

	// public start(long: boolean = false) {
	// 	if (this._status === PpStatus.NotStarted) {
	// 		this._status = PpStatus.Working;
	// 		this._timer = new Timer(
	// 			this._config.workMinutes * 60,
	// 			this.onUpdate,
	// 			this._onFinish,
	// 		);
	// 	} else if (this._status === PpStatus.WorkDone) {
	// 		this._status = long ? PpStatus.LongBreak : PpStatus.Break;
	// 		const duration = long
	// 			? this._config.longBreakMinutes
	// 			: this._config.shortBreakMinutes;
	// 		this._timer = new Timer(
	// 			duration * 60,
	// 			this.onUpdate,
	// 			this._onFinish,
	// 		);
	// 	}
	// }

	// public extendWork(extensionMinutes: number) {
	// 	this._status = PpStatus.Working;
	// 	this._timer?.extend(extensionMinutes * 60);
	// }

	// private _advanceStatus() {
	// 	if (this._status === PpStatus.Working) {
	// 		this._status = PpStatus.WorkDone;
	// 	} else if (this.status === PpStatus.Break) {
	// 		this._status = PpStatus.PomodoroDone;
	// 	} else if (this.status === PpStatus.LongBreak) {
	// 		this._status = PpStatus.SetDone;
	// 	}
	// }

	// private _stopTimer = () => {
	// 	if (this._timer !== undefined) {
	// 		this._timer.kill();
	// 		this._timer = undefined;
	// 	}
	// };
	// public skip = () => {
	// 	this._stopTimer();
	// 	this._onFinish();
	// };

	// public cancel() {
	// 	this._timer?.kill();
	// }

	// public pause = () => {
	// 	this._timer?.pause();
	// };

	// public unpause = () => {
	// 	this._timer?.unpause();
	// };

	// private _onFinish = () => {
	// 	this._advanceStatus();
	// 	this.onFinish();
	// };
}
// const onUpdate = ()=>console.log('updated!')
// const onFinish = ()=>console.log('finishd!')
// const yyy = new Pomodoro(0.1, onUpdate, onFinish)

export { Pomodoro }