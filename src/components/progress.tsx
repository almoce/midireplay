import {useRef, useImperativeHandle, useMemo} from 'react'
import { useKeyHistory } from '@/store'
import { useTimer } from "@/store"
import { defaultEmptyHandler } from '@/utils'

export type REF_ACTION = {
	start: (c: () => void) => void
	reset: () => void
}

export default function Progress({ref}: {ref: React.Ref<REF_ACTION>}) {
	
	const progress = useTimer(state => state.progress)
	const updateProgress = useTimer(state => state.updateProgress)

	const history = useKeyHistory(state => state.history)

	const requestFrameRef = useRef<number>(0)

	const timeframe = useMemo(() => {
		const alltimes = history.map(i => ({
			v: i.data[0] === 144,
			t: i.time,
		}))
		const lastFrameTime = Math.max(...alltimes.map(i => i.t))

		return alltimes.map(i => ({v: i.v, t: i.t/lastFrameTime * 100}))
	}, [history])

	function start(endcallback: () => void = defaultEmptyHandler) {
		const alltimes = history.map(i => i.time)
		const lastFrameTime = Math.max(...alltimes)
		 
		let now = 0
		const end = lastFrameTime
		reset()

		function update() {
			const a = window.performance.now()
			requestFrameRef.current = requestAnimationFrame(() => {
				const b = window.performance.now()
				now += (b - a)
				const p = now/end
				updateProgress(p)
				if (p >= 1) {
					cancelAnimationFrame(requestFrameRef.current)
					endcallback()
				} else {
					update()
				}
			})			
		}
		update()
	}


	function reset() {
		updateProgress(0)
		cancelAnimationFrame(requestFrameRef.current)
	}

	useImperativeHandle(ref, () => ({
		start,
		reset
	}))

	return	<div className='relative block w-full h-[5px] bg-white'>
		{timeframe.map((i, idx) => {
			return <div className="absolute w-[1px] h-full" key={idx} style={{left: `${i.t}%`, background: i.v ? 'black' : 'white'}}></div>
		})}
		<div className='absolute left-0 top-0 h-[2px] bg-black' style={{width: `${progress * 100}%`}}></div>
	</div>
}