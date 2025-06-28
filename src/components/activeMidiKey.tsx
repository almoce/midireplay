import { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react"
import * as Tone from "tone";
import midinote from "@/utils/midinote";
const monoSynth = new Tone.Synth().toDestination();

export type REF_ACTION = {
    update: (n: number) => void
}

export default function ActiveMidiKey({ref}: {ref: React.Ref<REF_ACTION>}) {


	const svgRef = useRef<SVGSVGElement>(null)
    const [notes, setNotes] = useState<number[]>([])

    useEffect(() => {
        const elms = svgRef?.current?.querySelectorAll(`rect`) as NodeListOf<SVGElement>
        const allNodes = Array.from<SVGElement>(elms)
        allNodes.forEach((n: SVGElement) => {
            const attr = n.getAttribute('id')
            const id = Number(attr?.split('m')[1])
            const backWhite = [1,3,6,8,10].includes(id) ? 'black' : 'white'
            n.setAttribute('fill', backWhite)
        })

        notes.forEach(n => {
            const activeId = n % 12
            const targetNode = svgRef?.current?.querySelector(`#m${activeId}`)
            
            if (!targetNode) {
                return
            }
            targetNode?.setAttribute('fill', '#7cff00')
        })

    }, [notes])


    const notesUpdate = useCallback((note: number) => {
        setNotes((oldNotes) => {
                const idx = oldNotes.indexOf(note)
                if (idx >= 0) {
                    oldNotes.splice(idx, 1)
                } else {
                    oldNotes.push(note)
                }
                return [...oldNotes]
            })
    }, [notes])

    useImperativeHandle(ref, () => ({
        update: notesUpdate
    }))



    function fireNote(note: number) {
        notesUpdate(note)
        const n = midinote[note as unknown as keyof typeof midinote]
        monoSynth.triggerAttackRelease(n, "8n");
        setTimeout(() => {
            notesUpdate(note)
        }, 200)
    }

	return <>
	<svg width="100px" height="30px" ref={svgRef} viewBox="0 0 619 160" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
            <g id="Group"  transform="translate(100,0)">
                <rect onClick={() => fireNote(60)} className="cursor-pointer" id="m0" stroke="#000000" strokeWidth="5" fill="#FFFFFF" x="2.5" y="2.5" width="58.6766467" height="151"></rect>
                <rect onClick={() => fireNote(62)} className="cursor-pointer" id="m2" stroke="#000000" strokeWidth="5" fill="#FFFFFF" x="60.0538922" y="2.5" width="58.6766467" height="151"></rect>
                <rect onClick={() => fireNote(64)} className="cursor-pointer" id="m4" stroke="#000000" strokeWidth="5" fill="#FFFFFF" x="117.607784" y="2.5" width="58.6766467" height="151"></rect>
                <rect onClick={() => fireNote(65)} className="cursor-pointer" id="m5" stroke="#000000" strokeWidth="5" fill="#FFFFFF" x="175.161677" y="2.5" width="58.6766467" height="151"></rect>
                <rect onClick={() => fireNote(67)} className="cursor-pointer" id="m7" stroke="#000000" strokeWidth="5" fill="#FFFFFF" x="232.715569" y="2.5" width="58.6766467" height="151"></rect>
                <rect onClick={() => fireNote(69)} className="cursor-pointer" id="m9" stroke="#000000" strokeWidth="5" fill="#FFFFFF" x="290.269461" y="2.5" width="58.6766467" height="151"></rect>
                <rect onClick={() => fireNote(71)} className="cursor-pointer" id="m11" stroke="#000000" strokeWidth="5" fill="#FFFFFF" x="347.823353" y="2.5" width="58.6766467" height="151"></rect>
                <rect onClick={() => fireNote(61)} className="cursor-pointer" id="m1" fill="#000000" x="34.1702432" y="-7.10542736e-15" width="48.923445" height="95.5432526"></rect>
                <rect onClick={() => fireNote(63)} className="cursor-pointer" id="m3" fill="#000000" x="94.835315" y="-7.10542736e-15" width="48.923445" height="95.5432526"></rect>
                <rect onClick={() => fireNote(66)} className="cursor-pointer" id="m6" fill="#000000" x="208.316176" y="-7.10542736e-15" width="48.923445" height="95.5432526"></rect>
                <rect onClick={() => fireNote(68)} className="cursor-pointer" id="m8" fill="#000000" x="267.02431" y="-7.10542736e-15" width="48.923445" height="95.5432526"></rect>
                <rect onClick={() => fireNote(70)} className="cursor-pointer" id="m10" fill="#000000" x="326.732444" y="-7.10542736e-15" width="48.923445" height="95.5432526"></rect>
            </g>
    </g>
</svg>
</>
}