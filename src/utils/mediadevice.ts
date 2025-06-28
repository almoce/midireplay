 import { defaultEmptyHandler } from ".";

export interface I_MIDI_STATE {
	name: string | null
	manufacturer: string | null
	state: string | null
	type: string | null
}

export default class MediaDevice {
	midiPromise: undefined | Promise<MIDIAccess>
	devices: {
		inputs: MIDIInput[];
		outputs: MIDIOutput[];
	};
	input: undefined | MIDIInput;
	output: undefined | MIDIOutput;
	onInputCallback: (d: Uint8Array) => void
	onStateChange:(prop: I_MIDI_STATE) => void
	constructor() {
		this.devices = {
			inputs: [],
			outputs: [],
		}

		this.input = undefined
		this.output = undefined
		this.midiPromise = undefined

		this.onInputCallback = defaultEmptyHandler
		this.onStateChange = defaultEmptyHandler
	}
	async init() {

		try {
			if (!navigator.requestMIDIAccess) {
				throw new Error("Web MIDI API not supported");
			}
			this.midiPromise = this.midiPromise ?? navigator.requestMIDIAccess()
			const midiAccess = await this.midiPromise;

			if (midiAccess) {
				midiAccess.onstatechange = (event) => {
					this.listenDevice(event)
					this.devices = {
						inputs: Array.from(midiAccess.inputs.values()),
						outputs: Array.from(midiAccess.outputs.values()),
					}
				}

				this.devices = {
					inputs: Array.from(midiAccess.inputs.values()),
					outputs: Array.from(midiAccess.outputs.values()),
				}

				this.setDevice(this.devices.inputs[0], this.devices.outputs[0]);
			}
			return true;
		} catch (error) {
			console.error("MIDI initialization failed:", error);
			throw error;
		}
	}
	listenDevice(event: MIDIConnectionEvent) {
		const {name, manufacturer, state, type} = event?.port as MIDIPort

		this.onStateChange({
			name,
			manufacturer,
			state,
			type
		})

	}
	findAndSetDevice(name: string) {
		const input = this.devices.inputs.find(i => i.name === name)	
		const output = this.devices.outputs.find(i => i.name === name)
		

		if (input && output) {
			this.setDevice(input, output)
		}
	}
	setDevice(i: MIDIInput, o: MIDIOutput) {
		this.input = i;
		this.output = o;
		if (this.input) {
			this.input.onmidimessage = (e) => this.onInputMessage(e);
		}
	}

	onInputMessage(data: MIDIMessageEvent) {
		if (data?.data?.length && data?.data?.length > 1) {
			this.onInputCallback(data.data);
		}
	}

	send(note: number, velocity = 127, noteOn = true) {

		// • Status byte: 0x90 (for Note On, channel 1)
		// • Data byte 1: Note number (e.g., 60 for Middle C)
		// • Data byte 2: Velocity (e.g., 127 for maximum)
		// const noteOnMessage = [144, 60, 0x7f]; // note on, middle C, full velocity
		// if (note) {
		// 	  this.output?.send([144, note, 10])
		// 	  setTimeout(() => {
		// 		  this.output?.send([128, note, 0])
		// 	  }, 500)
		// }

		this.output?.send([noteOn ? 0x90 : 0x80, note, noteOn ? velocity : 0]);

	}
}
