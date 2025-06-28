import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import useTimer from './timer'

export type KEY_HISTORY_STATE = {
    name: string,
    history: {data: number[], time: number}[]
}


type KEY_HISTORY_ACTION = {
    clear: () => void
    add: (data: Uint8Array, time: number) => void
    setName: (name: string) => void
    remove: (idx: number) => void
    get: () => KEY_HISTORY_STATE
    set: (l: KEY_HISTORY_STATE['history']) => void
}

const inicialState: KEY_HISTORY_STATE  = {
    name: 'untitled',
    history: []
}


const useKeyHistory = create(
    persist<KEY_HISTORY_STATE & KEY_HISTORY_ACTION>((set, get) => ({
        ...inicialState,
        clear: () => {
            useTimer.getState().update(0)
            return set({
                ...inicialState,
                history: []
            })
        },
        get: () => get(),
        setName: (name: string) => set(() => ({name: name})),
        add: (data: Uint8Array, time: number) => set((state: KEY_HISTORY_STATE) => {
            const last = state.history[0]
            const newTime = last?.time === time ? time + 0.1 : time
            state.history.unshift({
                data: Array.from(data),
                time: newTime
            })
            return {
                history: [...state.history]
            }
        }),
        set: (history: KEY_HISTORY_STATE['history']) => set((() => {
            return {
                history: [...history]
            }
        })),
        remove: (idx: number) => set(state => {
            const history = state.history
            history.splice(idx, 1)
            return {
                history: [...history]
            }
        })
    }), {
        name: 'midihistory',
        storage: createJSONStorage(() => localStorage),
        onRehydrateStorage: () => {
            return (state, erro) => {
                if (!erro) {
                    let times = state?.history.map(i => i.time)
                    times = times?.length ? times : [0]
                    const lastTime = Math.max(...times) || 0
                    // sync timer with the last time frame event
                    useTimer.getState().update(lastTime)
                }
            }
        }
    })
    
)


export default useKeyHistory