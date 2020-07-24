import { KeyPair } from "turtlecoin-utils";

// This contains input data which we will store locally
export type Input = {
    // Key image is a unique identifier for this input
    KeyImage:string;

    // The atomic unit value of this input
    Amount:number;

    // The index of this input in its origin transaction
    TransactionIndex:number;

    // This input's global index position
    GlobalIndex:number;

    // Keys used to sign this input when transacting
    PublicEphemeral:string;
    PrivateEphemeral:string;

    // What height (if any) this input was spent at
    SpentHeight:number;

    // The height at which this input becomes available for spending
    UnlockTime:number;
}

// Background wallet information
export type Wallet = {
    // Spend key pair
    Keys:KeyPair;

    // TurtleCoin address
    Address:string;

    // Current balance
    Balance:number;

    // Synced height
    Height:number;

    // Whether or not the wallet has been registered with the backend
    Registered:boolean;
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

// Transaction destinations
export type Transfer = {
    // Destination address
    Address:string;

    // Amount of TurtleCoin to send
    Amount:number;
}

// Created transaction information
export type Transaction = {
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

// Output to be converted into a spendable input
export type Output = {
    // Origin transaction's hash
    transaction_hash:string;

    // Origin transaction's public key
    transaction_key:string;

    // Index of output in origin transaction
    transaction_index:number;

    // Global index of output
    global_index:number;

    // Amount this output represents
    amount:number;

    // This output's public ephemeral signing key
    public_ephemeral:string;

    // Derivation used for conversion
    derivation:string;

    // The height or time this output becomes spendable
    unlock_time:number;
}

// Sync data received from backend
export type SyncData = {
    // Inputs to be marked spent
    Inputs:{
        // Origin transaction's hash
        transaction_hash:string;

        // Input's unique key image
        key_image:string;

        // Amount this input represents
        amount:number;
    }[];

    // Outputs to be converted into spendable inputs
    Outputs:Output[];
}

// Tip information about a domain
export type Host = {
    Host:string;
    PublicKey:string;
}

// An error-able, variable return type interface
export type Errorable<T> = {
    Success: false,
    Error: string
} | {
    Success: true,
    Value: T
}

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

    // Requests a transaction
    RequestTransaction,

    // Sends a transaction
    SendTransaction,

    // Wipes all stored and cached data
    Wipe
}