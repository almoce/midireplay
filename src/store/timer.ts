import { create } from 'zustand'


type TIMER = {
	time: number
	progress: number
	update: (v: number) => void
	get: () => number
	updateProgress: (v: number) => void
	getProgress: () => number
}


const useTimer = create<TIMER>((set, get) => ({
	time: 0,
	progress: 0,
	update: (v:number) => set({time: v}),
	get: () => get().time,
	updateProgress: (v: number) => set({progress: v}),
	getProgress: () => get().progress
}))


export default useTimer