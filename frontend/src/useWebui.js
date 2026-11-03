import {readonly, ref} from 'vue'

const EVENT_CONNECTED = 0
const EVENT_DISCONNECTED = 1

const state = {
    isAvailable: ref(false),
    isConnected: ref(false),
    initialized: false,
}

function initialize() {
    if (state.initialized) return
    state.initialized = true

    if (typeof document === 'undefined') return

    document.addEventListener('DOMContentLoaded', function () {
        if (typeof webui !== 'undefined') {
            state.isAvailable.value = true
            state.isConnected.value = webui.isConnected()

            webui.setEventCallback((e) => {
                if (e === EVENT_CONNECTED) {
                    state.isConnected.value = true
                } else if (e === EVENT_DISCONNECTED) {
                    state.isConnected.value = false
                }
            })
        }
    })
}

export function useWebui() {
    initialize()

    return {
        isAvailable: readonly(state.isAvailable),
        isConnected: readonly(state.isConnected),
    }
}
