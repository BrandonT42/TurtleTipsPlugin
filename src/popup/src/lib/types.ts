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

    // Gets wallet info
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

// Wallet information
export type WalletInfo = {
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