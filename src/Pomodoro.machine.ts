import { createMachine, forwardTo } from '@xstate/compiled';
import { MachineOptions } from 'xstate';
import { assign } from '@xstate/immer';
import {
	CreateTimerServiceOptions,
	TimerSchema,
	TimerContext,
	TimerEvent,
	TimerStatus,
} from './types';
import { timerMachine } from './Timer.machine';

const defaultPartialContext = {
	offSet: 0,
	elapsed: 0,
	duration: 0,
};

const getTimerMachine = (durationMinutes: number) => {
	// debugger
	return timerMachine.withContext({
		...defaultPartialContext,
		duration: durationMinutes * 60,
		startTime: Date.now()
	})
}

const { Running, Paused, Done } = TimerStatus;

type PomodoroEvent =
	| {
			type: 'START_BREAK';
			durationMinutes: number;
	  }
	| {
			type: 'PAUSE';
	  }
	| {
			type: 'UNPAUSE';
	  }
	| {
			type: 'TICK';
	  };

interface PomodoroContext {
	workMinutes: number;
	breakMinutes?: number;
}

enum PomodoroStatus {
	Working = 'Working',
	WorkDone = 'WorkDone',
	Break = 'OnBreak',
	PomodoroDone = 'PomodoroDone',
	SetDone = 'PomodoroSetDone',
}

const { Working, WorkDone, Break, PomodoroDone, SetDone } = PomodoroStatus;

const context: PomodoroContext = {
	workMinutes: 25,
	breakMinutes: 5,
};

const setBreakMinutes = assign<PomodoroContext, PomodoroEvent>(
	(context, event) => {
		if (event.type == 'START_BREAK') {
			context.breakMinutes = event.durationMinutes;
		}
	},
);

const pomodoroMachine = createMachine<
	PomodoroContext,
	PomodoroEvent,
	'pomdoromachine'
>({
	id: 'pomodoromachine',
	initial: Working,
	context,
	states: {
		[Working]: {
			invoke: {
				id: 'shazbot',
				src: context => getTimerMachine(context.workMinutes),
				onDone: {
					target: WorkDone,
				},
			},
		},
		[WorkDone]: {
			entry: 'promptUser',
			on: {
				START_BREAK: {
					target: Break,
					actions: setBreakMinutes,
				},
			},
		},
		[Break]: {
			invoke: {
				id: 'shazbot',
				src: context => getTimerMachine(context.breakMinutes || 0),
				onDone: {
					target: PomodoroDone,
				},
			},
		},
		[PomodoroDone]: {
			type: 'final',
		},
	},
	on: {
		PAUSE: { actions: forwardTo('shazbot') },
		UNPAUSE: { actions: forwardTo('shazbot') }
	  }
});

export { pomodoroMachine, PomodoroContext, PomodoroEvent, PomodoroStatus };
