import { WebSocketHandler } from './utils/websocket.js';
export class TetherClient {
    private websocketHandler: WebSocketHandler = new WebSocketHandler();
    private subscribedQueries = new Map<string, (data: any) => void>();

    connect = (url: string) => {
        this.websocketHandler.startConnection(url);
    };
    
    disconnect = () => {
        this.websocketHandler.close();
    };
    
    subscribe = (query: string, callback: (data: any) => void) => {
        this.subscribedQueries.set(query, callback);
        this.websocketHandler.send(JSON.stringify({
            type: 'subscribe',
            query: query
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
            payload: params,
        }));
    };
}