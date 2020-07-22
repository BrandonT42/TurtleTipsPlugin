import { Request, WalletInfo } from "./types";

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