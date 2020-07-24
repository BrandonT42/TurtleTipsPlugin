import { Request, WalletInfo, Errorable, TransactionInfo } from "./types";
import * as Config from "../config.json";

// The last made transaction
export let Transaction:TransactionInfo;
export function SetTransaction(Value:TransactionInfo) {
    Transaction = Value;
}

// Checks to see if a wallet has been created
export async function CheckForWallet():Promise<boolean> {
    return await new Promise(Resolve => {
        chrome.runtime.sendMessage({
            Request: Request.CheckForWallet
        }, Response => {
            Resolve(Response);
        });
    });
}

// Gets loaded wallet information
export async function GetKeys():Promise<WalletInfo> {
    return await new Promise(Resolve => {
        chrome.runtime.sendMessage({
            Request: Request.GetKeys
        }, Response => {
            Resolve(Response);
        });
    });
}

// Attempts to log into an existing wallet
export async function Login(Password:string):Promise<boolean> {
    return await new Promise(Resolve => {
        chrome.runtime.sendMessage({
            Request: Request.Login,
            Password: Password
        }, Response => {
            Resolve(Response);
        });
    });
}

// Creates a new wallet and returns the newly created wallet data
export async function New(Password:string):Promise<boolean> {
    return await new Promise(Resolve => {
        chrome.runtime.sendMessage({
            Request: Request.NewKeys,
            Password: Password
        }, Response => {
            Resolve(Response);
        });
    });
}

// Attempts to restore a wallet from a seed
export async function Restore(Seed:string, Password:string):Promise<boolean> {
    return await new Promise(Resolve => {
        chrome.runtime.sendMessage({
            Request: Request.RestoreKeys,
            Seed: Seed,
            Password: Password
        }, Response => {
            Resolve(Response);
        });
    });
}

// Gets current wallet balance
export async function GetWalletInfo():Promise<WalletInfo> {
    return await new Promise(Resolve => {
        chrome.runtime.sendMessage({
            Request: Request.GetWalletInfo
        }, Response => {
            Resolve(Response);
        });
    });
}

// Requests a tip be created
export async function CreateTip(PublicSpendKey:string, Amount:number):Promise<Errorable<TransactionInfo>> {
    return await new Promise(Resolve => {
        chrome.runtime.sendMessage({
            Request: Request.RequestTip,
            PublicSpendKey: PublicSpendKey,
            Amount: Amount
        }, Response => {
            Resolve(Response);
        });
    });
}

// Requests a transaction be created
export async function CreateTransaction(Address:string, Amount:number, PaymentId?:string):Promise<Errorable<TransactionInfo>> {
    return await new Promise(Resolve => {
        let AtomicUnits = Amount * Math.pow(10, Config.DecimalPlaces);
        chrome.runtime.sendMessage({
            Request: Request.RequestTransaction,
            Address: Address,
            Amount: AtomicUnits,
            PaymentId: PaymentId
        }, Response => {
            Resolve(Response);
        });
    });
}

// Requests a transaction be broadcast to the network
export async function SendTransaction():Promise<boolean> {
    return await new Promise(Resolve => {
        console.log("Sending: ");
        console.log(Transaction.Raw);
        chrome.runtime.sendMessage({
            Request: Request.SendTransaction,
            Transaction: Transaction.Raw
        }, Response => {
            Resolve(Response);
        });
    });
}