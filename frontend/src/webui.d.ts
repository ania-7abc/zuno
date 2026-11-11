type WebuiArgument = string | number | boolean | Uint8Array;

type WebuiEvent = 0 | 1; // CONNECTED | DISCONNECTED

interface WebuiApi {
    readonly event: {
        readonly CONNECTED: 0;
        readonly DISCONNECTED: 1;
    };

    isConnected(): boolean;

    setEventCallback(callback: (event: WebuiEvent) => void): void;

    call(
        backendFunction: string,
        ...args: WebuiArgument[]
    ): Promise<any>;

    encode(str: string): string;

    decode(base64: string): string;

    isHighContrast(): boolean;

    setLogging(enabled: boolean): void;

    allowNavigation(allow: boolean): void;
}

declare var webui: WebuiApi;
