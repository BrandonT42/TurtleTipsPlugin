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

    // Registers a host public key
    RegisterHostKey,

    // Requests a tip to the current domain
    RequestTip,

    // Requests a transaction
    RequestTransaction,

    // Sends a transaction
    SendTransaction,

    // Wipes all stored and cached data
    Wipe
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

    // Wallet address
    Address:string;
}

// An error-able, variable return type interface
export type Errorable<T> = {
    Success: false,
    Error: string
} | {
    Success: true,
    Value: T
}

// Created transaction information
export type TransactionInfo = {
    // Raw transaction blob
    Raw:string;

    // Transaction hash
    Hash:string

    // Total of destinations
    Amount:number;

    // Change to be returned
    Change:number;

    // Transaction fee
    Fee:number;
}