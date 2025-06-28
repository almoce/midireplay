import { useKeyHistory } from "@/store"
import midinote from "@/utils/midinote"
import MidiKey from "./midiKey"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function KeyHistroy() {
	const history = useKeyHistory(state => state.history)
	const remove = useKeyHistory(state => state.remove)
	
	return <div className="flex flex-1 flex-col overflow-auto p-1">
		{history.map((i, idx) => {
			const [command, note, velocity] = i?.data || []
			const cflag = command === 144
			const speed = velocity / 127
			return <div className="flex flex-row justify-center p-1 gap-2" key={`${idx}_${note}_${command}`}>
				<Tooltip>
				  <TooltipTrigger>
				  	<MidiKey note={note} flag={cflag} speed={speed} />
				  </TooltipTrigger>
				  <TooltipContent sideOffset={-7}>
				  	<div className="flex flex-row gap-3 sans">
				  		<span>{speed.toFixed(2)}</span>
				  		<span>{midinote[note as unknown as keyof typeof midinote]}</span>
				  		<span className="cursor-pointer" onClick={() => remove(idx)}>❌</span>
				    </div>
				  </TooltipContent>
				</Tooltip>
			</div>
		})}
	</div>
}



