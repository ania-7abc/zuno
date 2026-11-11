import { readonly, ref, watch } from 'vue'

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

function waitForConnected(timeoutMs = 10000) {
    if (state.isConnected.value) return Promise.resolve()

    return new Promise((resolve, reject) => {
        let timer = null

        const stop = watch(
            state.isConnected,
            (val) => {
                if (val) {
                    if (timer) clearTimeout(timer)
                    stop()
                    resolve()
                }
            },
        )

        if (timeoutMs > 0) {
            timer = setTimeout(() => {
                stop()
                reject(new Error('waitForConnected: timeout'))
            }, timeoutMs)
        }
    })
}

export function useWebui() {
    initialize()

    return {
        isAvailable: readonly(state.isAvailable),
        isConnected: readonly(state.isConnected),
        waitForConnected,
    }
}
