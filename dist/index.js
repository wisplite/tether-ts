import { WebSocketHandler } from './utils/websocket.js';
export class TetherClient {
    websocketHandler = new WebSocketHandler();
    subscribedQueries = new Map();
    connect = (url) => {
        this.websocketHandler.startConnection(url);
    };
    disconnect = () => {
        this.websocketHandler.close();
    };
    subscribe = (query, callback) => {
        this.subscribedQueries.set(query, callback);
        this.websocketHandler.send(JSON.stringify({
            type: 'subscribe',
            query: query
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
            payload: params,
        }));
    };
}
