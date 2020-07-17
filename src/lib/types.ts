import { KeyPair, Address } from "turtlecoin-utils"

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

// Transaction destinations
export type Transfer = {
    // Destination address
    Address:string;

    // Amount of TurtleCoin to send
    Amount:number;
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