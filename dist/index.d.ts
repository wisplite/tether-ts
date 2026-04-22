export declare class TetherClient {
    private websocketHandler;
    private subscribedQueries;
    connect: (url: string) => void;
    disconnect: () => void;
    subscribe: (queryName: string, params: any, callback: (data: any) => void) => void;
    unsubscribe: (query: string) => void;
    sendMutation: (mutationName: string, params: any) => void;
}
