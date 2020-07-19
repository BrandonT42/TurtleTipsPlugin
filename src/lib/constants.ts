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

// CoinGecko API endpoints
export enum COINGECKO_API {
    PRICE = "/api/v3/simple/price"
};

// CoinGecko supported currencies
export const COINGECKO_CURRENCIES = [
    "AED", "ARS", "AUD", "BCH", "BDT", "BHD", "BMD", "BNB",
    "BRL", "BTC", "CAD", "CHF", "CLP", "CNY", "CZK", "DKK",
    "EOD", "ETH", "EUR", "GBP", "HKD", "HUF", "IDR", "ILS",
    "INR", "JPY", "KRW", "KWD", "LKR", "LTC", "MMK", "MXN",
    "MYR", "NOK", "NZD", "PHP", "PKR", "PLN", "RUB", "SAR",
    "SEK", "SGD", "THB", "TRY", "TWD", "UAH", "USD", "VEF",
    "VND", "XAG", "XAU", "XDR", "XLM", "XRP", "ZAR"
];

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