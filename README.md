# xstate-timer
A simple timer built with Typescript and [xstate.js](https://github.com/davidkpiano/xstate)


Usage:
```
import Timer from 'XStateTimer'

const onTick = ()=>null 
const onFinish = ()=>null

const timer = new Timer(20, onTick, onFinish)

timer.start()
timer.pause()
timer.unpause()
timer.reset()
```
