export declare class WebSocketHandler {
    private ws;
    private url;
    onOpen: () => void;
    onQuery: (location: string | undefined, data: any) => void;
    onClose: () => void;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private reconnectInterval;
    private sendQueue;
    onMutation: (mutation_id: string, data: any) => void;
    startConnection: (url: string) => void;
    attemptReconnect: () => void;
    close: () => void;
    send: (message: string) => void;
}
