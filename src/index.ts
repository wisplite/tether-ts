export class TetherClient {
    private ws: WebSocket | null = null;
    private subscribedQueries = new Map<string, (data: any) => void>();

    connect = (url: string) => {
        this.ws = new WebSocket(url);
        this.ws.onopen = () => {
            console.log('Connected to Tether');
        };
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'query') {
                this.subscribedQueries.forEach((callback, query) => {
                    if (data.query === query) {
                        callback(data.data);
                    }
                });
            } else if (data.type === 'error') {
                console.error(data.error);
            }
        };
        this.ws.onclose = () => {
            console.log('Disconnected from Tether');
        };
    };
    
    disconnect = () => {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('Not connected to Tether');
        }
        this.ws.close();
        this.ws = null;
    };
    
    subscribe = (query: string, callback: (data: any) => void) => {
        this.subscribedQueries.set(query, callback);
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('Not connected to Tether');
        }
        this.ws.send(JSON.stringify({
            type: 'subscribe',
            query: query
        }));
    };
    
    unsubscribe = (query: string) => {
        this.subscribedQueries.delete(query);
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('Not connected to Tether');
        }
        this.ws.send(JSON.stringify({
            type: 'unsubscribe',
            query: query
        }));
    };
    
    sendMutation = (mutationName: string, params: any) => {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('Not connected to Tether');
        }
        this.ws.send(JSON.stringify({
            type: 'mutation',
            name: mutationName,
            payload: params,
        }));
    };
}