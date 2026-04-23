export class WebSocketHandler {
    private ws: WebSocket | null = null;
    private url: string = '';
    public onOpen: () => void = () => {};
    public onQuery: (location: string | undefined, data: any) => void = () => {};
    public onClose: () => void = () => {};
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectInterval: number = 1000;
    private sendQueue: string[] = [];
    public onMutation: (data: any) => void = () => {};
    startConnection = (url: string) => {
        this.url = url;
        this.ws = new WebSocket(url);
        const ws = this.ws;

        ws.onopen = () => {
            console.log('Connected to Tether');
            this.onOpen();
            if (this.sendQueue.length > 0) {
                this.sendQueue.forEach(message => this.ws?.send(message));
                this.sendQueue = [];
            }
            this.reconnectAttempts = 0;
        };

        ws.onmessage = (event: MessageEvent) => {
            const data = JSON.parse(String(event.data)) as {
                type: string;
                location?: string;
                data?: unknown;
                error?: string;
            };
            if (data.type === 'query') {
                this.onQuery(data.location, data.data);
            } else if (data.type === 'mutation') {
                this.onMutation(data.data);
            } else if (data.type === 'error') {
                console.error(data.error);
            }
        };

        ws.onclose = () => {
            console.log('Disconnected from Tether');
            this.attemptReconnect();
        };
    };

    attemptReconnect = () => {
        this.ws?.close();
        this.reconnectAttempts++;
        if (this.reconnectAttempts > this.maxReconnectAttempts) {
            console.error('Max reconnect attempts reached');
            return;
        }
        setTimeout(() => {
            this.startConnection(this.url);
        }, this.reconnectInterval);
    };

    close = () => {
        this.ws?.close();
        this.ws = null;
    };

    send = (message: string) => {
        if (this.ws?.readyState !== WebSocket.OPEN) {
            this.sendQueue.push(message);
            return;
        }
        this.ws?.send(message);
    };

}
