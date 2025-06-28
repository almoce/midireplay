import { useKeyHistory } from "@/store"
import { useEffect, useRef } from "react"
import midinote from "@/utils/midinote"
// import { useTimer } from "@/store"

export default function TimeMap() {
	const svgRef = useRef<SVGSVGElement>(null)
	const history = useKeyHistory(state => state.history)
	const vW = 500
	const vH = 200


	// const getProgress = useTimer(state => state.getProgress)
	// const timmerLine = useRef<SVGElement>(null)

	function init() {
		const svg = svgRef.current as SVGElement
		const keyMap = new Map()
		let min: number|undefined = undefined
		let max: number|undefined = undefined
		history.forEach(i => {
			const [, n] = i.data
			const time = i.time
			let target = keyMap.get(n)
			if (!target) {
				target = []
				keyMap.set(n, target)
			}
			if (!min || time < min) {
				min = time
			}
			if (!max || time > max) {
				max = time
			}
			target.push(time)
		})
		const count = keyMap.size
		const vd = vH/count

		const arr = []
		for(const i of keyMap) {
			const [k, v] = i
			arr.push({k,v})
		}

		arr.sort((a,b) => a.k - b.k)


		let idx = 0
		for(const i of arr) {
			const {k, v} = i
			idx++
			const y = idx * vd - (vd/2)
			
			const text = document.createElementNS("http://www.w3.org/2000/svg", "text")

			text.textContent = midinote[k as unknown as keyof typeof midinote]
			text.setAttribute('fill','black')
			text.setAttribute('font-size','5')
			text.setAttribute('x', '2')
			text.setAttribute('y', `${y + 2}`)

			const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
			let d = ''
			v.reverse()
			v.map((value:number, idx:number) => {
				const p1 = value/(max as number)
				const p = p1 * (vW - 20) + 20
				const odd = idx % 2
				if (!odd) {
					d+= `M ${p} ${y} `
				} else {
					d+= `L ${p} ${y} `
				}
			})

			
			path.setAttribute('d', d)
			path.setAttribute('fill', 'none')
			path.setAttribute('stroke', 'black')
			path.setAttribute('stroke-width', '5')
			svg.append(text, path)
		}

		// const l = document.createElementNS("http://www.w3.org/2000/svg", "path")
		// l.setAttribute('d', `M 0 0 V ${vH}`)
		// l.setAttribute('fill', 'none')
		// l.setAttribute('stroke', 'red')
		// l.setAttribute('stroke-width', '0.5')

		// timmerLine.current = l
		// svg.append(l)


		// return showTimeFrame()
	}


	// function showTimeFrame() {
	// 	return requestAnimationFrame(() => {
	// 		const now = getProgress() 
	// 		const x = now * (vW - 20) + 20

	// 		timmerLine?.current?.setAttribute('d', `M ${x || 0} 0 V ${vH}`)
	// 		timmerLine?.current?.setAttribute('opacity', now ? '1' : '0')
	// 		showTimeFrame()
	// 	})
	// }

	useEffect(() => {
		// const ani = init()
		init()
		
		return () => {
			if (svgRef.current) {
				const svg = svgRef.current
				while (svg.firstChild) {
				  svg.removeChild(svg.firstChild);
				}
			}

			// cancelAnimationFrame(ani)
		}
	}, [svgRef, history])


	return <svg ref={svgRef} className="w-full" style={{background: 'rgba(255,255,255, 0.5)'}} viewBox={`0 0 ${vW} ${vH}`} version="1.1" xmlns="http://www.w3.org/2000/svg">
	</svg>
}