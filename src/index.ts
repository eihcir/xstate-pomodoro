import { inspect } from '@xstate/inspect';
import { Timer } from './XStateTimer'
inspect({
  // options
  // url: 'https://statecharts.io/inspect', // (default)
  iframe: false // open in new window
});

const onTick = ()=>console.log('tick')
const onFinish = ()=>console.log('finish')
const timer = new Timer(10, onTick, onFinish)


// old package.json scripts:
// "scripts": {
//     "start:build": "tsc -w",
//     "start:run": "nodemon build/index.js",
//     "start": "concurrently npm:start:*"
//   },
