import { WebSocketHandler } from './utils/websocket.js';
type PendingMutation = {
    resolve: (value: unknown) => void;
    reject: (reason: Error) => void;
    timeoutId: ReturnType<typeof setTimeout>;
};

export class TetherClient {
    private websocketHandler: WebSocketHandler = new WebSocketHandler();
    private subscribedQueries = new Map<string, { callback: (data: any) => void, params: any }>();
    private pendingMutations = new Map<string, PendingMutation>();
    private authMethod: Function | null = null;
    private authenticated: boolean = false;
    private userInfo: Map<string, any> = new Map();

    
    connect = (url: string) => {
        this.websocketHandler.startConnection(url);
        this.websocketHandler.onQuery = (location, data) => {
            if (location) {
                const { callback } = this.subscribedQueries.get(location) || { callback: () => {} };
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
        this.websocketHandler.onAuth = (data) => {
            this.authenticated = true;
            this.userInfo.set('user_id', data.user_id);
        };
        this.websocketHandler.onOpen = () => {
            this.websocketHandler.send(JSON.stringify({
                type: 'auth',
                token: this.authMethod?.()
            }));
            this.subscribedQueries.forEach(({ params }, queryName) => {
                this.websocketHandler.send(JSON.stringify({
                    type: 'subscribe',
                    location: queryName,
                    params: params
                }));
            });
        };
        this.websocketHandler.onClose = () => {
            this.pendingMutations.forEach(pending => {
                clearTimeout(pending.timeoutId);
                pending.reject(new Error('Connection closed'));
            });
            this.pendingMutations.clear();
            this.authenticated = false;
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

    setAuthMethod = (authMethod: Function) => { // Function that returns a token
        this.authMethod = authMethod;
    };
}