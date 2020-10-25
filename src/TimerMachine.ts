import {
	createMachine,
	MachineConfig,
	MachineOptions,
	ServiceConfig,
	StateMachine,
	interpret,
} from 'xstate';
import { assign } from '@xstate/immer';
import {
	CreateTimerServiceOptions,
	TimerContext,
	TimerEvent,
	TimerState,
	TimerStatus,
} from './types';

const { Running, Idle, Paused } = TimerStatus;

const timerMachineConfig: MachineConfig<
	TimerContext,
	TimerState,
	TimerEvent
> = {
	states: {
		[Running]: {
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
		[Paused]: {
			entry: 'updateElapsed',
			on: {
				UNPAUSE: {
					target: Running,
					actions: 'onUnpause',
				},
			},
		},
		[Idle]: {
			always: {
				target: Running,
				cond: 'checkDuration',
			},
		},
	},
	on: {
		RESET: {
			actions: 'resetTimer',
		},
		'DURATION.UPDATE': {
			actions: 'handleDurationUpdate',
		},
	},
};


const resetTimer = assign<TimerContext, TimerEvent>(context => {
	context.startTime = Date.now();
	context.offSet = 0;
	context.elapsed = 0;
})

const checkExpired = (context: TimerContext) =>
	context.elapsed >= context.duration;

const checkDuration = (context: TimerContext) =>
	context.elapsed < context.duration;

const ticker = (context: TimerContext) => (cb: (message: string) => void) => {
	const interval = setInterval(() => {
		cb('TICK');
	}, 1000 * context.interval);

	return () => {
		clearInterval(interval);
	};
};

const updateElapsed = assign<TimerContext, TimerEvent>(context => {
	const elapsed = Math.min(
		(Date.now() - context.startTime) / 1000 + context.offSet,
		context.duration,
	);
	context.elapsed = parseInt(elapsed.toFixed(0));
});

const handleExpire = assign<TimerContext, TimerEvent>(context => {
	context.elapsed = context.duration;
});

const enterRunning = assign<TimerContext, TimerEvent>(context => {
	context.offSet = context.elapsed

	context.startTime = Date.now();
});

const handleDurationUpdate = assign<TimerContext, TimerEvent>((context, event) => {
	if (event.type === 'DURATION.UPDATE') {
		context.duration = context.duration + (event.value || 10);
	}
});

const timerOptions: MachineOptions<TimerContext, TimerEvent> = {
	actions: {
		updateElapsed,
		enterRunning,
		handleExpire,
		resetTimer,
		handleDurationUpdate,
	},
	guards: {
		checkExpired,
		checkDuration,
	},
	activities: {},
	delays: {},
	services: {
		ticker,
	},
};

export const createTimerMachine = (
	options: CreateTimerServiceOptions,
): StateMachine<TimerContext, TimerState, TimerEvent> => {
	const context: TimerContext = {
		interval: 0.1,
		...options,
		offSet: 0,
		elapsed: 0,
		startTime: Date.now(),
	};

	return createMachine<TimerContext, TimerEvent>(
		{
			...timerMachineConfig,
			initial: Running,
			context,
		},
		timerOptions,
	);
};

export const createTimerService = (options: CreateTimerServiceOptions) => {
	const machine = createTimerMachine(options);
	const service = interpret(machine, { devTools: true });
	return service;
};
