// Backend API endpoints
export enum BACKEND_API {
    HEIGHT = "/api/v0/height",
    REGISTER_KEY = "/api/v0/register"
};

// Daemon API endpoints
export enum DAEMON_API {
    HEIGHT = "/height",
    RANDOM_OUTS = "/randomOutputs",
    SEND_TRANSACTION = "/transaction"
};

// The amount of time to wait between checking for cancellation in an async function (in ms)
export const CANCELLATION_INTERVAL = 100;

// How often to update network height (in ms)
export const NETWORK_HEIGHT_INTERVAL = 10000;

// How often to update backend height (in ms)
export const BACKEND_HEIGHT_INTERVAL = 10000;

// Fee-per-byte (in atomic units)
export const FEE_PER_BYTE = 500;

// The most amount of blocks that can be synced at one time
export const MAX_SYNC_CHUNK_SIZE = 1000;