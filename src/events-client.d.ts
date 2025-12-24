declare const EventsClientLib: {
  EventsClient: new () => {
    connect(hubUrl: string): Promise<void>;
    onEvent?(handler: (data: any) => void): void;
    onAck?(handler: (ack: any) => void): void;
    sendAck?(requestId: string, status: string): Promise<void>;
    // The bundled EventsClient exposes the underlying SignalR hub as `hub` after connect
    hub?: any;
  };
};