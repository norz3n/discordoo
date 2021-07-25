export enum WebSocketClientStates {
  CREATED,
  READY,
  CONNECTING,
  RECONNECTING,
  CONNECTED,
  DISCONNECTED,
  WAITING_FOR_GUILDS,
  IDENTIFYING,
  RESUMING,
}