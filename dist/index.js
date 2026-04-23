import { WebSocketHandler } from './utils/websocket.js';
export class TetherClient {
    websocketHandler = new WebSocketHandler();
    subscribedQueries = new Map();
    pendingMutations = new Map();
    connect = (url) => {
        this.websocketHandler.startConnection(url);
        this.websocketHandler.onQuery = (location, data) => {
            if (location) {
                const { callback } = this.subscribedQueries.get(location) || { callback: () => { } };
                callback?.(data);
            }
        };
        this.websocketHandler.onMutation = (incoming_id, data) => {
            const pending = this.pendingMutations.get(incoming_id);
            if (!pending) {
                return;
            }
            clearTimeout(pending.timeoutId);
            this.pendingMutations.delete(incoming_id);
            pending.resolve(data);
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
        const promise = new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.pendingMutations.delete(mutation_id);
                reject(new Error('Mutation timeout'));
            }, 10000);
            this.pendingMutations.set(mutation_id, { resolve, reject, timeoutId });
        });
        this.websocketHandler.send(JSON.stringify({
            type: 'mutation',
            location: mutationName,
            params: params,
            mutation_id: mutation_id
        }));
        return promise;
    };
}
