const subscribedQueries = new Map<string, (data: any) => void>();
let ws: WebSocket | null = null;

export const connect = async (url: string): Promise<WebSocket> => {
    ws = new WebSocket(url);
    ws.onopen = () => {
        console.log('Connected to Tether');
    };
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'query') {
            subscribedQueries.forEach((callback, query) => {
                if (data.query === query) {
                    callback(data.data);
                }
            });
        } else if (data.type === 'error') {
            console.error(data.error);
        }
    };
    ws.onclose = () => {
        console.log('Disconnected from Tether');
    };
    return ws;
};

export const disconnect = (ws: WebSocket) => {
    ws.close();
};

export const subscribe = (query: string, callback: (data: any) => void) => {
    subscribedQueries.set(query, callback);
};

export const unsubscribe = (query: string) => {
    subscribedQueries.delete(query);
};

export const sendMutation = (mutationName: string, params: any) => {
    if (!ws) {
        throw new Error('Not connected to Tether');
    }
    ws.send(JSON.stringify({
        type: 'mutation',
        name: mutationName,
        payload: params,
    }));
};