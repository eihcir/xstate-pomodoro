export interface TimerContext {
	offSet: number;
	elapsed: number;
	duration: number;
	startTime: number;
}

export enum TimerStatus {
	Running = 'running',
	Paused = 'paused',
	Done = 'done',
	Idle = 'idle'
}

export type TimerEvent =
	| {
			type: 'TICK';
	  }
	| {
			type: 'PAUSE';
	  }
	| {
			type: 'UNPAUSE';
	  };


export interface TimerSchema {
	states: {
		[TimerStatus.Running]: {};
		[TimerStatus.Paused]: {};
		[TimerStatus.Done]: {};
	};
}

// export type TimerState = SubState &
// 	{
// 			value: TimerStatus.Running;
// 			context: TimerContext;
// 	  }
// 	| {
// 			value: TimerStatus.Paused;
// 			context: TimerContext;
// 	  }
// 	| {
// 			value: TimerStatus.Done;
// 			context: TimerContext;
// 	  };

export type CreateTimerServiceOptions = {
	duration: number;
	interval?: number;
	onTick: () => any;
	onFinish: () => any;
};
