import { Button } from "@/components/ui/button"
import { useConfig } from "@/store";
import {type KEY_OF_CONFIG}	from '@/store/config'

export default function Configuration() {
	
	const autoRecord = useConfig(state => state.autoRecord)
	const loop = useConfig(state => state.loop)
	const keyMap = useConfig(state => state.keyMap)

	const config = useConfig(state => state)

	function toggleConfig(k: keyof KEY_OF_CONFIG) {
		const v = config.get(k)
		config.set(k, !v)
	}

	return <div className="flex flex-row gap-2 justify-center">
		<Button size="sm" onClick={() => toggleConfig('autoRecord')} variant='secondary' className={autoRecord ? '!border-[2px] border-[blue]' : 'bg-white !border-[2px]'} >Auto</Button>
		<Button size="sm" onClick={() => toggleConfig('loop')} variant='secondary' className={loop ? 'border-[2px] border-[blue]' : 'bg-white !border-[2px]'} >Loop</Button>						
		<Button size="sm" onClick={() => toggleConfig('keyMap')} variant='secondary' className={keyMap ? 'border-[2px] border-[blue] w-[80px]' : 'bg-white !border-[2px] w-[80px]'} >{keyMap ? 'Time' : 'Key'} Map</Button>						
	</div>
}