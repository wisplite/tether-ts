import { WebSocketHandler } from './utils/websocket.js';
export class TetherClient {
    private websocketHandler: WebSocketHandler = new WebSocketHandler();
    private subscribedQueries = new Map<string, (data: any) => void>();

    connect = (url: string) => {
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
    
    subscribe = (queryName: string, params: any, callback: (data: any) => void) => {
        this.subscribedQueries.set(queryName, callback);
        this.websocketHandler.send(JSON.stringify({
            type: 'subscribe',
            location: queryName,
            params: params
        }));
    };
    
    unsubscribe = (query: string) => {
        this.subscribedQueries.delete(query);
        this.websocketHandler.send(JSON.stringify({
            type: 'unsubscribe',
            query: query
        }));
    };
    
    sendMutation = (mutationName: string, params: any) => {
        this.websocketHandler.send(JSON.stringify({
            type: 'mutation',
            name: mutationName,
            params: params,
        }));
    };
}