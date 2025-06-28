import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import MediaDevice, { type I_MIDI_STATE } from "./utils/mediadevice";
import KeyHistroy from "./components/keyHistory";
import { Toaster } from "@/components/ui/sonner";
import { toast, type Action } from "sonner";
import { Button } from "@/components/ui/button";
import Timer, { type REF_ACTION as TIMER_REF_ACTION } from "./components/timer";
import Progress, {
	type REF_ACTION as PROGRESS_REF_ACTION,
} from "./components/progress";
import ActiveMidiKey, {
	type REF_ACTION as ACTIVE_MIDI_KEY_REF_ACTION,
} from "./components/activeMidiKey";
import { defaultEmptyHandler } from "./utils";
import { useKeyHistory, useTimer, useConfig } from "./store";
import Configuration from "./components/config";
import FileDialog from "./components/fileDialog";
import InfoDialog from "./components/infoDialog";
import * as Tone from "tone";
import midinote from "./utils/midinote.js";
import TimeMap from "./components/timeMap";
import type { KEY_HISTORY_STATE } from "./store/keyHistory.js";

const device = new MediaDevice();

function App() {
	const [input, setInput] = useState("");
	const [output, setOutput] = useState("");

	const activeSynth = useRef<Tone.PolySynth>(null);
	const config = useConfig((state) => state);

	const addHistory = useKeyHistory((state) => state.add);
	const clearHistory = useKeyHistory((state) => state.clear);
	const setHistory = useKeyHistory((state) => state.set);
	const history = useKeyHistory((state) => state.history);

	const getTime = useTimer((state) => state.get);
	const updateStoreTime = useTimer((state) => state.update);

	const timerRef = useRef<TIMER_REF_ACTION>(null);
	const progressRef = useRef<PROGRESS_REF_ACTION>(null);
	const activeMidiKeyRef = useRef<ACTIVE_MIDI_KEY_REF_ACTION>(null);

	async function init() {
		await device.init();
		updateStateName();
		if (!history.length) {
			const demo = await fetch('./demo.json').then(r => r.json())
			replaceHistory(demo.history)
		}
	}

	function updateStateName() {
		if (device?.input?.name) {
			setInput(device?.input?.name);
		}
		if (device?.output?.name) {
			setOutput(device?.output?.name);
		}
	}

	function updateDevice(name: string | null) {
		if (name) {
			device.findAndSetDevice(name);
			updateStateName();
		} else {
			setInput("");
			setOutput("");
		}
	}

	function showToast(
		tType: "" | "info" | "warning" | "success" | "error",
		{ name, manufacturer, state, type }: I_MIDI_STATE,
		action: Action,
	) {
		const t = tType ? toast[tType] : toast;
		t(`${name} is ${state} - [${type}]`, {
			description: manufacturer ? `from ${manufacturer}` : "",
			action,
			position: "bottom-right",
			richColors: tType ? true : false,
		});
	}

	function stateChangeEventBind({ name, manufacturer, state, type}: I_MIDI_STATE) {
		if (state === "connected") {
			if (!input && !output) {
				showToast(
					"",
					{ name, manufacturer, state, type },
					{
						label: "Set",
						onClick: () => updateDevice(name),
					},
				)
				updateDevice(name)
			}
		} else {
			showToast(
				"warning",
				{ name, manufacturer, state, type },
				{
					label: "Close",
					onClick: defaultEmptyHandler,
				},
			);
			updateDevice(null);
		}
	}

	const onInputCallback = useCallback(
		(data: Uint8Array) => {
			// console.log(data)
			if (activeMidiKeyRef.current && (data[0] === 144 || data[0] === 128)) {
				activeMidiKeyRef.current.update(data[1]);
			}

			const isAutoRecord = config.get("autoRecord");
			if (isAutoRecord) {
				timerRef?.current?.start();
				addHistory(data, getTime());
			} else if (
				timerRef?.current?.getCounter &&
				timerRef?.current?.getCounter() > 0
			) {
				addHistory(data, getTime());
			}
		},
		[config.autoRecord],
	);
	const onStateChange = useCallback(stateChangeEventBind, []);

	useEffect(() => {
		device.onInputCallback = onInputCallback;
		device.onStateChange = onStateChange;
		return () => {
			device.onInputCallback = defaultEmptyHandler;
			device.onStateChange = defaultEmptyHandler;
		};
	}, [onInputCallback, onStateChange]);

	function doReplay() {
		doStop();

		if (!output || !device.output) {
			if (activeSynth.current) {
				activeSynth.current.dispose();
			}
			const synth = new Tone.PolySynth(Tone.Synth).toDestination();
			activeSynth.current = synth;
			const now = Tone.now();
			history.forEach((i) => {
				const { data, time } = i;
				const [command, note, _velocity] = data;

				const n = midinote[note as unknown as keyof typeof midinote];

				if (command === 144) {
					synth.triggerAttack(n, now + time / 1000);
				} else {
					synth.triggerRelease(n, now + time / 1000);
				}
			});
		} else {
			const now = window.performance.now();
			history.forEach((i) => {
				const { data, time } = i;
				device?.output?.send(data, now + time);
			});
		}

		progressRef?.current?.start(() => {
			if (config.get("loop")) {
				doReplay();
			}
		});
	}

	function doClearn() {
		clearHistory();
		timerRef?.current?.stop();
		doStop();
	}

	function doStop() {
		progressRef?.current?.reset();
		if (activeSynth.current) {
			activeSynth.current.dispose();
		}

		// some device does not support
		// device?.output?.send([0xB1, 123, 0])
	}

	useEffect(() => {
		init();
	}, []);

	// function setChannel(idx: number) {
	// 	const history: { data: number[]; time: number }[] = [];
	// 	test.tracks[idx].notes.forEach((i) => {
	// 		const notesOn = [0x90, i.midi, Math.floor(i.velocity * 127)];
	// 		const notesOff = [0x80, i.midi, Math.floor(i.velocity * 127)];
	// 		history.push(
	// 			{
	// 				data: notesOn,
	// 				time: i.time * 1000,
	// 			},
	// 			{
	// 				data: notesOff,
	// 				time: (i.time + i.duration) * 1000,
	// 			},
	// 		);
	// 	});
	// 	history.sort((a, b) => b.time - a.time);

	// 	replaceHistory(history);
	// }

	function replaceHistory(h2i: KEY_HISTORY_STATE['history']) {
		doClearn();
		setHistory(h2i);
		updateStoreTime(Math.max(...h2i.map((i) => i.time)));
	}

	return (
		<>
			<div className="flex flex-col absolute w-full h-full">
				<div className="flex flex-col gap-2">
					<div className="flex flex-col gap-1 text-[18px]">
						<div className="absolute flex p-1 left-1 top-0">
							IN: {input || "NONE"}
						</div>
						<div className="absolute flex p-1 right-1 top-0">
							OUT: {output || "NONE"}
						</div>
						{/*<InfoDialog />*/}
					</div>

					<div className="flex justify-center flex-row gap-1">
						<ActiveMidiKey ref={activeMidiKeyRef} />
					</div>

					<Timer ref={timerRef} />

					<Configuration />

					<div className="flex flex-row gap-2 justify-center">
						{/*<Button onClick={doReplay}>Rec&Play</Button>*/}
						<Button onClick={doReplay}>Replay</Button>
						<Button onClick={doClearn} variant="destructive">
							Clear
						</Button>
						<Button onClick={doStop} variant="outline">
							Stop
						</Button>
						<FileDialog replaceHistory={replaceHistory} />
						<InfoDialog />
					</div>

					{/*	<div className="flex items-center flex-row gap-1">
						<div className="flex p-1">Channel:</div>
						{test.tracks.map((i, idx) => {
							return <Button onClick={() => setChannel(idx)} key={idx} variant='ghost'>{idx}</Button>
						})}
					</div>
*/}
				</div>
				<div className="block relative mx-auto w-full max-w-[1024px] p-1 mt-2">
					<Progress ref={progressRef} />
				</div>

				{config.keyMap ? (
					<div className="block relative mx-auto w-full max-w-[1024px] mt-2">
						<TimeMap />{" "}
					</div>
				) : (
					<KeyHistroy />
				)}
			</div>

			<Toaster />
		</>
	);
}

export default App;
