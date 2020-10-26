import {
	createMachine,
} from '@xstate/compiled';
import { MachineOptions, sendParent } from 'xstate'
import { assign } from '@xstate/immer';
import {
	CreateTimerServiceOptions,
	TimerSchema,
	TimerContext,
	TimerEvent,
	TimerStatus,
} from './types';


const TICK_INTERVAL = 500

const { Running, Paused, Done } = TimerStatus;

const enterRunning = assign<TimerContext, TimerEvent>(context => {
	console.log('entered timer running')
	context.offSet = context.elapsed | 0;
	context.startTime = Date.now();
});


const updateElapsed = assign<TimerContext, TimerEvent>(context => {
	const elapsed = Math.min(
		(Date.now() - context.startTime) / 1000 + context.offSet,
		context.duration,
	);
	console.log('elapsed', elapsed)
	context.elapsed = parseInt(elapsed.toFixed(0));
});

const handleExpire = assign<TimerContext, TimerEvent>(context => {
	context.elapsed = context.duration;
});


const actions = {
	enterRunning,
	updateElapsed,
	handleExpire,
};

const checkExpired = (context: TimerContext) =>
	context.elapsed >= context.duration;


const guards = {
	checkExpired,
}

const ticker = (context: TimerContext) => (cb: (message: string) => void) => {
	const interval = setInterval(() => {
		console.log('ticking', TICK_INTERVAL)
		cb('TICK');
	}, TICK_INTERVAL);

	return () => {
		clearInterval(interval);
	};
};

const services = {
	ticker,
}


const options: MachineOptions<TimerContext, TimerEvent>  = {
	actions,
	guards,
	services,
	delays: {},
	activities: {},
};

// const context: TimerContext = {
// 	interval: 0.5,
// 	offSet: 0,
// 	elapsed: 0,
// 	duration: 0,
// 	startTime: Date.now(),
// };

const timerMachine = createMachine<TimerContext, TimerEvent, 'timer2'>(
	{
		id: 'timer3',
		initial: Running,
		states: {
			[Running]: {
				entry: ['enterRunning', context=>{console.log('context on enterRunning', context)}],
				always: {
					target: Done,
					cond: 'checkExpired',
				},
				invoke: {
					src: 'ticker',
				},
				on: {
					PAUSE: {
						target: Paused,
					},
					TICK: {
						actions: ['updateElapsed', sendParent('TICK')],
					},
				},
			},
			[Paused]: {
				entry: { actions: ()=>console.log('paused')},
				on: {
					UNPAUSE: {
						target: Running,
					}
				}
			},
			[Done]: {
				type: 'final',
			},
		},
	},
	options,
);

export { timerMachine };
