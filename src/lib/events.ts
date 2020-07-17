import * as TurtleCoin from "./turtlecoin";
import * as Wallet from "./wallet";

// Lists all accepted messages
export enum Request {
    // Generates a new key pair
    GenerateKeys,

    // Restores wallet keys from a seed
    RestoreKeys,

    // Registers a set of wallet keys with the backend
    RegisterKeys,

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

// Assigns event handlers
export async function Assign() {
    chrome.runtime.onInstalled.addListener(OnInstalled);
    chrome.runtime.onStartup.addListener(OnStartup);
    chrome.runtime.onSuspend.addListener(OnSuspend);
    chrome.runtime.onMessage.addListener(OnMessage);
}

// Runs when extension is installed, updated, or chrome is updated
async function OnInstalled() {}

// Runs when a profile with this extension is launched
async function OnStartup() {}

// Runs just before being unloaded
async function OnSuspend() {
    await Wallet.Save();
}

// Runs when a message is sent by another script owned by this extension
function OnMessage(Message, _, SendResponse) {
    // Check message request
    switch(Message["Request"]) {
        case Request.GenerateKeys: ;
        case Request.GetWalletInfo: SendResponse(Wallet.Info);
        case Request.RegisterKeys: ;
        case Request.RequestDomainKey: ;
        case Request.RequestTip: ;
        case Request.RequestWithdrawal: ;
        case Request.RestoreKeys: ;
        case Request.SendTransaction: ;
        case Request.Wipe: ;
        default: ;
    }

    // End operation
    return true;
}