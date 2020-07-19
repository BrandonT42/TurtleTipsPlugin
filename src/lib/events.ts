import * as Network from "./network";
import * as Wallet from "./wallet";
import * as Transactions from "./transactions";
import { Transaction } from "turtlecoin-utils";

// Lists all accepted messages
export enum Request {
    // Generates a new key pair
    CreateKeys,

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

// Assigns event handlers
export async function Assign() {
    chrome.runtime.onInstalled.addListener(OnInstalled);
    chrome.runtime.onStartup.addListener(OnStartup);
    chrome.runtime.onSuspend.addListener(OnSuspend);
    chrome.runtime.onMessage.addListener(OnMessage);
}

// Runs when extension is installed, updated, or chrome is updated
async function OnInstalled(Details) {}

// Runs when a profile with this extension is launched
async function OnStartup() {}

// Runs just before being unloaded
async function OnSuspend() {
    await Wallet.Save();
}

// Runs when a message is sent by another script owned by this extension
async function OnMessage(Message, Sender, SendResponse) {
    // Check message request
    switch(Message["Request"]) {
        case Request.GetWalletInfo:
            SendResponse(Wallet.Info);

        case Request.CreateKeys:
            let NewWalletPassword = Message["Password"] as string;
            await Wallet.New(NewWalletPassword);
            SendResponse(Wallet.Info);

        case Request.RestoreKeys:
            let WalletSeed = Message["Seed"] as string;
            let RestoreWalletPassword = Message["Password"] as string;
            await Wallet.Restore(WalletSeed, RestoreWalletPassword);
            SendResponse(Wallet.Info);

        case Request.Login:
            let LoginPassword = Message["Password"] as string;
            await Wallet.Login(LoginPassword);
            SendResponse(Wallet.Info);

        case Request.Logout:
            await Wallet.Logout();
            SendResponse();

        case Request.RequestDomainKey: ;

        case Request.RequestTip:
            let PublicSpendKey = Message["PublicSpendKey"] as string;
            let TipAmount = Message["Amount"] as number;
            let TipTransaction = await Transactions.Withdraw(PublicSpendKey, TipAmount);
            SendResponse(TipTransaction);

        case Request.RequestWithdrawal:
            let Address = Message["Address"] as string;
            let WithdrawalAmount = Message["Amount"] as number;
            let WithdrawalTransaction = await Transactions.Withdraw(Address, WithdrawalAmount);
            SendResponse(WithdrawalTransaction);

        case Request.SendTransaction:
            let Transaction = Message["Transaction"] as Transaction;
            let Success = await Network.SendTransaction(Transaction);
            SendResponse(Success);

        case Request.Wipe: ;

        default:
            SendResponse();
    }

    // End operation
    return true;
}