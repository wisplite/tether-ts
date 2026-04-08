export class TetherClient {
    ws = null;
    subscribedQueries = new Map();
    connect = (url) => {
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
            }
            else if (data.type === 'error') {
                console.error(data.error);
            }
        };
        this.ws.onclose = () => {
            console.log('Disconnected from Tether');
        };
    };
    disconnect = () => {
        if (!this.ws) {
            throw new Error('Not connected to Tether');
        }
        this.ws.close();
        this.ws = null;
    };
    subscribe = (query, callback) => {
        this.subscribedQueries.set(query, callback);
    };
    unsubscribe = (query) => {
        this.subscribedQueries.delete(query);
    };
    sendMutation = (mutationName, params) => {
        if (!this.ws) {
            throw new Error('Not connected to Tether');
        }
        this.ws.send(JSON.stringify({
            type: 'mutation',
            name: mutationName,
            payload: params,
        }));
    };
}
