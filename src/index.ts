import { WebSocketHandler } from './utils/websocket.js';
export class TetherClient {
    private websocketHandler: WebSocketHandler = new WebSocketHandler();
    private subscribedQueries = new Map<string, { callback: (data: any) => void, params: any }>();

    connect = (url: string) => {
        this.websocketHandler.startConnection(url);
        this.websocketHandler.onQuery = (location, data) => {
            if (location) {
                const { callback } = this.subscribedQueries.get(location) || { callback: () => {} };
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
    
    subscribe = (queryName: string, params: any, callback: (data: any) => void) => {
        this.subscribedQueries.set(queryName, { callback, params });
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
        const mutation_id = crypto.randomUUID();
        this.websocketHandler.send(JSON.stringify({
            type: 'mutation',
            location: mutationName,
            params: params,
            mutation_id: mutation_id
        }));
        return new Promise((resolve, reject) => {
            this.websocketHandler.onMutation = (data) => {
                if (data.mutation_id === mutation_id) {
                    resolve(data);
                }
            };
            setTimeout(() => {
                reject(new Error('Mutation timeout'));
            }, 10000);
        });
    };
}