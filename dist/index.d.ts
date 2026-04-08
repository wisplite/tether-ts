export declare class TetherClient {
    private ws;
    private subscribedQueries;
    connect: (url: string) => void;
    disconnect: () => void;
    subscribe: (query: string, callback: (data: any) => void) => void;
    unsubscribe: (query: string) => void;
    sendMutation: (mutationName: string, params: any) => void;
}
