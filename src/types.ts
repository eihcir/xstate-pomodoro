export interface TimerContext {
	offSet: number;
	elapsed: number;
	duration: number;
	interval: number;
	startTime: number;
}

export enum TimerStatus {
	Idle = 'idle',
	Running = 'running',
	Paused = 'paused',
}

export type TimerEvent =
	| {
			type: 'START';
	  }
	| {
			type: 'DURATION.UPDATE';
			value: number;
	  }
	| {
			type: 'TICK';
	  }
	| {
			type: 'RESET';
	  }
	| {
			type: 'PAUSE';
	  }
	| {
			type: 'UNPAUSE';
	  };

export type TimerState =
	| {
			value: TimerStatus.Running;
			context: TimerContext & { elapsed: number; duration: number };
	  }
	| {
			value: TimerStatus.Paused;
			context: TimerContext & {
				elapsed: number;
				duration: number;
				interval: number;
			};
	  }
	| {
			value: TimerStatus.Idle;
			context: TimerContext;
	  };

export type CreateTimerServiceOptions = {
	duration: number;
	interval?: number;
	onTick: () => any;
	onFinish: () => any;
};
