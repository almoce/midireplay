import { create } from 'zustand'

export type KEY_OF_CONFIG = {
	loop: boolean,
	autoRecord: boolean,
	keyMap: boolean
}

type CONFIG = {
	get: (k: keyof KEY_OF_CONFIG) => boolean
	set: (k: keyof KEY_OF_CONFIG, v: boolean) => void
}

const useConfig = create<KEY_OF_CONFIG & CONFIG>((set, get) => ({
	loop: false,
	autoRecord: false,
	keyMap: true,
	get: (k: keyof KEY_OF_CONFIG) => get()[k],
	set: (k: keyof KEY_OF_CONFIG, v: boolean) => set({[k]: v})
}))



export default useConfig