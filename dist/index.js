import { WebSocketHandler } from './utils/websocket.js';
export class TetherClient {
    websocketHandler = new WebSocketHandler();
    subscribedQueries = new Map();
    connect = (url) => {
        this.websocketHandler.startConnection(url);
        this.websocketHandler.onQuery = (location, data) => {
            if (location) {
                const callback = this.subscribedQueries.get(location);
                callback?.(data);
            }
        };
    };
    disconnect = () => {
        this.websocketHandler.close();
    };
    subscribe = (queryName, params, callback) => {
        this.subscribedQueries.set(queryName, callback);
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
        this.websocketHandler.send(JSON.stringify({
            type: 'mutation',
            name: mutationName,
            params: params,
        }));
    };
}
