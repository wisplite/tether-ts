export class WebSocketHandler {
    ws = null;
    url = '';
    onOpen = () => { };
    onQuery = () => { };
    onClose = () => { };
    reconnectAttempts = 0;
    maxReconnectAttempts = 5;
    reconnectInterval = 1000;
    sendQueue = [];
    onMutation = () => { };
    startConnection = (url) => {
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
        ws.onmessage = (event) => {
            const data = JSON.parse(String(event.data));
            if (data.type === 'query') {
                this.onQuery(data.location, data.data);
            }
            else if (data.type === 'mutation') {
                this.onMutation(data.data);
            }
            else if (data.type === 'error') {
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
    send = (message) => {
        if (this.ws?.readyState !== WebSocket.OPEN) {
            this.sendQueue.push(message);
            return;
        }
        this.ws?.send(message);
    };
}
