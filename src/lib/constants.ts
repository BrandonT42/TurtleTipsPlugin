import * as Config from "../config.json";

// Backend API endpoints
export enum BACKEND_API {
    HEIGHT = "/api/v0/height",
    REGISTER_KEY = "/api/v0/register",
    HOSTS = "/api/v0/hosts",
    SYNC = "/api/v0/sync"
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

// How often to update network height (in ms)
export const NETWORK_HEIGHT_INTERVAL = 10000;

// How often to update backend height (in ms)
export const BACKEND_HEIGHT_INTERVAL = 10000;

// Host often to update backend hosts (in ms)
export const BACKEND_HOSTS_INTERVAL = 60000;

// How often to update price data (in ms)
export const COINGECKO_PRICE_INTERVAL = 10000;

// The most amount of blocks that can be synced at one time
export const MAXIMUM_SYNC_CHUNK_SIZE = 1000;

// Transaction constants
const KEY_IMAGE_SIZE: number = 32;
const OUTPUT_KEY_SIZE: number = 32;
const AMOUNT_SIZE = 10;
const GLOBAL_INDEXES_VECTOR_SIZE_SIZE: number = 1;
const GLOBAL_INDEXES_INITIAL_VALUE_SIZE: number = 4;
const SIGNATURE_SIZE: number = 64;
const EXTRA_TAG_SIZE: number = 1;
const INPUT_TAG_SIZE: number = 1;
const OUTPUT_TAG_SIZE: number = 1;
const PUBLIC_KEY_SIZE: number = 32;
const TRANSACTION_VERSION_SIZE: number = 1;
const TRANSACTION_UNLOCK_TIME_SIZE: number = 8 + 2;
const EXTRA_DATA_SIZE: number = 0;
const PAYMENT_ID_SIZE: number = 0;

// The size of the transaction header
export const TRANSACTION_HEADER_SIZE: number = TRANSACTION_VERSION_SIZE
    + TRANSACTION_UNLOCK_TIME_SIZE
    + EXTRA_TAG_SIZE
    + EXTRA_DATA_SIZE
    + PUBLIC_KEY_SIZE
    + PAYMENT_ID_SIZE;

// The size of each transaction input
export const INPUT_SIZE: number = INPUT_TAG_SIZE
    + AMOUNT_SIZE
    + KEY_IMAGE_SIZE
    + SIGNATURE_SIZE
    + GLOBAL_INDEXES_VECTOR_SIZE_SIZE
    + GLOBAL_INDEXES_INITIAL_VALUE_SIZE
    + Config.Mixin * SIGNATURE_SIZE;

// The size of each transaction output
export const OUTPUT_SIZE: number = OUTPUT_TAG_SIZE
    + OUTPUT_KEY_SIZE
    + AMOUNT_SIZE;

// Maximum size of a fusion transaction
export const MAXIMUM_FUSION_SIZE = 30000;

// Minimum number of inputs needed to create a fusion transaction
export const MINIMUM_FUSION_INPUT_COUNT = 12;

// Maximum number of inputs that can be used to create a fusion transaction
export const MAXIMUM_FUSION_INPUT_COUNT = MAXIMUM_FUSION_SIZE / INPUT_SIZE;

// Desired input to output ratio for fusion transactions
export const FUSION_INPUT_RATIO = 4;

// Max amount of time a signature is valid for (in ms)
export const SIGNATURE_TIME_DELTA = 300000;