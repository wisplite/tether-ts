export declare class WebSocketHandler {
    private ws;
    private url;
    private subscribedQueries;
    private onOpen;
    private onClose;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private reconnectInterval;
    private sendQueue;
    startConnection: (url: string) => void;
    attemptReconnect: () => void;
    close: () => void;
    send: (message: string) => void;
}
