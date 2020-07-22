// Lists all accepted messages
export enum Request {
    // Checks whether or not a wallet exists
    CheckForWallet,

    // Generates a new key pair
    NewKeys,

    // Restores wallet keys from a seed
    RestoreKeys,

    // Attempts a wallet login
    Login,

    // Logs out of a wallet
    Logout,

    // Gets wallet keys
    GetKeys,

    // Gets wallet information, including balance and sync state
    GetWalletInfo,

    // Requests a domain's registered key
    RequestDomainKey,

    // Requests a tip to the current domain
    RequestTip,

    // Requests a withdrawal
    RequestWithdrawal,

    // Sends a tip or withdrawal transaction
    SendTransaction,

    // Wipes all stored and cached data
    Wipe
}

// ED25519 key pair
export type KeyPair = {
    // Private key
    privateKey:string;

    // Public key
    publicKey:string;
}

// Frontend wallet information
export type WalletInfo = {
    // Available balance
    Balance:string;

    // Locked balance
    Locked:string;

    // Value in preferred currency
    Value:string;

    // Preferred currency
    Currency:string;

    // Whether or not the wallet is synced
    Synced:boolean;

    // Synced height
    Height:number;

    // Known network height
    NetworkHeight:number;

    // Percentage synced
    SyncPercentage:string;

    // Wallet restoration seed
    Seed:string;
}

// Wallet balance data
export type WalletBalance = {
    // Balance in atomic units
    Balance:number;

    // Balance in preferred currency
    Value:number;

    // Preferred currency
    Currency:string;
}