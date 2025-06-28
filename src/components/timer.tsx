import { useEffect, useRef, useState, useImperativeHandle } from "react"
import { Button } from "@/components/ui/button"
import { useTimer } from "@/store"

export type REF_ACTION = {
	getCounter: () => number
	start: () => void
	stop: () => void
}

export default function Timer({ref}: {ref: React.Ref<REF_ACTION>}) {

	const domRfe = useRef<HTMLDivElement>(null)
	const counter = useRef<number>(-1)
	const [state, setState] = useState(0)

	const storeTime = useTimer(state => state.time)
	const updateStoreTime = useTimer(state => state.update)
	const getTime = useTimer(state => state.get)

	useEffect(() => {
		updateTimeInDom()
	}, [storeTime])

	function updateTimeInDom() {
		if (domRfe.current) {
			const ms = getTime()
			const s = Math.floor(ms / 1000)
			const m = Math.floor(s / 60)
			const msv = Number((Math.floor(ms/10)/100).toFixed(2).slice(-2))/100
			const reverse = s % 2 === 0 ? 1 : -1
			const sp = Number(msv * 600 - 300) / 10  * reverse

			domRfe.current.innerHTML = `
				<div class="flex gap-1 p-1">
						<div style="width: 50px">
							${m}:${s % 60} 
						</div>
						<svg width="15px" viewBox="0 0 250 300" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
			    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(20,0)">
	                <path d="M139.023488,2.5 C141.58346,2.5 143.956812,3.42317996 145.797431,4.97730085 C147.638049,6.53142175 148.945935,8.71648358 149.374974,11.2402473 L195.954974,285.240247 C196.440917,288.098731 195.722225,290.88357 194.167427,293.075273 C192.612629,295.266976 190.221725,296.865544 187.363241,297.351486 C186.781868,297.45032 186.193202,297.5 185.603488,297.5 L15.3459855,297.5 C12.4464905,297.5 9.82149055,296.324747 7.92136428,294.424621 C6.02123801,292.524495 4.84598548,289.899495 4.84598548,287 C4.84598548,286.421651 4.89376929,285.844291 4.98884928,285.273811 L50.6555159,11.2738106 C51.0774304,8.74232379 52.3835117,6.54887113 54.2257157,4.98829018 C56.0679198,3.42770924 58.4462466,2.5 61.0126521,2.5 Z" id="Rectangle" stroke="#000000" stroke-width="15" fill="#FFFFFF"></path>
	                <g transform-origin="20 200" transform="translate(82, 29) rotate(${sp})" >
	                    <line x1="18.5" y1="200" x2="18.5" y2="18.5" id="Line" stroke="#000000" stroke-width="20" stroke-linecap="square"></line>
	                    <circle id="Oval" fill="#000000" cx="18.5" cy="18.5" r="30"></circle>
	                </g>
			    </g>
			</svg>
				</div>
			`
		}	
	}
	function start() {
		setState(1)
		cancelAnimationFrame(counter.current)
		const now = window.performance.now()
		counter.current = requestAnimationFrame(() => {
			const next = window.performance.now()
			const currentTime = getTime() + (next - now)
			// sync with store timer data
			updateStoreTime(currentTime)
			start()
		})
	}


	function stop() {
		setState(0)
		cancelAnimationFrame(counter.current)
		counter.current = -1
		updateStoreTime(0)
	}

	function pause() {
		setState(0)
		cancelAnimationFrame(counter.current)
		counter.current = -1
	}


	function clickRecord() {
		if (!state) {
			start()
		} else {
			pause()
		}
	}


	useEffect(() => {
		updateTimeInDom()
	}, [])

	useImperativeHandle(ref, () => ({
		getCounter: () => counter.current,
		start,
		stop
	}))


	return <div className="flex flex-col items-center">
		<div ref={domRfe}></div>
		<div className="flex flex-row gap-2">
			<Button size="icon" variant="ghost" onClick={clickRecord} className={state ? '!bg-[red] !text-white' : 'text-[red]'}> {state ? '⏸︎' : '⏺︎'}</Button>
			<Button size="icon" variant="ghost" onClick={stop}>⏹︎</Button>
		</div>
	</div>
}