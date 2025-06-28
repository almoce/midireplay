import { useEffect, useMemo, useRef } from "react"

interface I_P_MIDI_KEY {
	note: number
	flag: boolean
    speed: number
    dynamic?: boolean
}
export default function MidiKey(props: I_P_MIDI_KEY) {
	const {note, flag, speed = 0, dynamic = false} = props
	const svgRef = useRef<SVGSVGElement>(null)
    
    const shift = useMemo(() => {
        return dynamic ? 0 : Math.floor(note / 12 - 5)
    }, [note])


    useEffect(() => {
        const activeId = note % 12
        const targetNode = svgRef?.current?.querySelector(`#m${activeId}`)
        if (!targetNode) {
            return
        }
        if (dynamic) {
            const backWhite = [1,3,6,8,10].includes(activeId) ? 'black' : 'white'
            targetNode?.setAttribute('fill', flag ? '#7cff00' : backWhite)
        } else {
            targetNode?.setAttribute('fill', flag ? '#7cff00' : '#b7004a')
        }
    }, dynamic ? [note, flag] : [])

	return <>
	<svg width="100px" height="30px" ref={svgRef} viewBox="0 0 619 160" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" opacity={flag ? 1 : 0.2}>
            <g id="Group"  transform="translate(100,0)">
                <rect id="m0" stroke="#000000" strokeWidth="5" fill="#FFFFFF" x="2.5" y="2.5" width="58.6766467" height="151"></rect>
                <rect id="m2" stroke="#000000" strokeWidth="5" fill="#FFFFFF" x="60.0538922" y="2.5" width="58.6766467" height="151"></rect>
                <rect id="m4" stroke="#000000" strokeWidth="5" fill="#FFFFFF" x="117.607784" y="2.5" width="58.6766467" height="151"></rect>
                <rect id="m5" stroke="#000000" strokeWidth="5" fill="#FFFFFF" x="175.161677" y="2.5" width="58.6766467" height="151"></rect>
                <rect id="m7" stroke="#000000" strokeWidth="5" fill="#FFFFFF" x="232.715569" y="2.5" width="58.6766467" height="151"></rect>
                <rect id="m9" stroke="#000000" strokeWidth="5" fill="#FFFFFF" x="290.269461" y="2.5" width="58.6766467" height="151"></rect>
                <rect id="m11" stroke="#000000" strokeWidth="5" fill="#FFFFFF" x="347.823353" y="2.5" width="58.6766467" height="151"></rect>
                <rect id="m1" fill="#000000" x="34.1702432" y="-7.10542736e-15" width="48.923445" height="95.5432526"></rect>
                <rect id="m3" fill="#000000" x="94.835315" y="-7.10542736e-15" width="48.923445" height="95.5432526"></rect>
                <rect id="m6" fill="#000000" x="208.316176" y="-7.10542736e-15" width="48.923445" height="95.5432526"></rect>
                <rect id="m8" fill="#000000" x="267.02431" y="-7.10542736e-15" width="48.923445" height="95.5432526"></rect>
                <rect id="m10" fill="#000000" x="326.732444" y="-7.10542736e-15" width="48.923445" height="95.5432526"></rect>
            </g>
            <rect  fill="#7cff00" x="100" y="160" width={speed * 410} height="10"></rect>
            <text x="30" y="60" fontSize="60px" fill="black" opacity={shift < 0 ? 1 : 0}>{shift}</text>
            <text x="530" y="60" fontSize="60px" fill="black" opacity={shift > 0 ? 1 : 0}>+{shift}</text>
    </g>
</svg>
</>
}