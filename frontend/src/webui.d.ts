interface WebuiApi {
    isConnected(): boolean

    setEventCallback(callback: (event: number) => void): void
}

declare var webui: WebuiApi | undefined
