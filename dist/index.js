import { WebSocketHandler } from './utils/websocket.js';
export class TetherClient {
    websocketHandler = new WebSocketHandler();
    subscribedQueries = new Map();
    connect = (url) => {
        this.websocketHandler.startConnection(url);
        this.websocketHandler.onQuery = (location, data) => {
            if (location) {
                const { callback } = this.subscribedQueries.get(location) || { callback: () => { } };
                callback?.(data);
            }
        };
        this.websocketHandler.onOpen = () => {
            this.subscribedQueries.forEach(({ params }, queryName) => {
                this.websocketHandler.send(JSON.stringify({
                    type: 'subscribe',
                    location: queryName,
                    params: params
                }));
            });
        };
    };
    disconnect = () => {
        this.websocketHandler.close();
    };
    subscribe = (queryName, params, callback) => {
        this.subscribedQueries.set(queryName, { callback, params });
        this.websocketHandler.send(JSON.stringify({
            type: 'subscribe',
            location: queryName,
            params: params
        }));
    };
    unsubscribe = (query) => {
        this.subscribedQueries.delete(query);
        this.websocketHandler.send(JSON.stringify({
            type: 'unsubscribe',
            query: query
        }));
    };
    sendMutation = (mutationName, params) => {
        const mutation_id = crypto.randomUUID();
        this.websocketHandler.send(JSON.stringify({
            type: 'mutation',
            location: mutationName,
            params: params,
            mutation_id: mutation_id
        }));
        return new Promise((resolve, reject) => {
            this.websocketHandler.onMutation = (mutation_id, data) => {
                if (mutation_id === mutation_id) {
                    resolve(data);
                }
            };
            setTimeout(() => {
                reject(new Error('Mutation timeout'));
            }, 10000);
        });
    };
}
