import * as Network from "./network";
import * as Wallet from "./wallet";
import * as Transactions from "./transactions";
import * as Database from "./database";
import * as CoinGecko from "./coingecko";
import * as Options from "./options";
import { Transaction } from "turtlecoin-utils";
import { Request } from "./types";

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
function OnMessage(Message, Sender, SendResponse) {
    // Check message request
    switch(Message["Request"] as Request) {
        case Request.CheckForWallet:
            Wallet.CheckForWallet().then(WalletExists => {
                SendResponse(WalletExists);
            });
            return true;

        case Request.GetKeys:
            SendResponse(Wallet.Info.Keys);
            return true;

        case Request.GetBalance:
            CoinGecko.GetPrice().then(Value => {
                Options.GetCurrency().then(Currency => {
                    SendResponse({
                        Balance: Wallet.Info.Balance,
                        Value: Value,
                        Currency: Currency
                    });
                });
            });
            return true;

        case Request.NewKeys:
            let NewWalletPassword = Message["Password"] as string;
            Wallet.New(NewWalletPassword).then(() => {
                SendResponse(Wallet.Info);
            });
            return true;

        case Request.RestoreKeys:
            let WalletSeed = Message["Seed"] as string;
            let RestoreWalletPassword = Message["Password"] as string;
            Wallet.Restore(WalletSeed, RestoreWalletPassword).then(Success => {
                SendResponse({
                    Success: Success,
                    Wallet: Wallet.Info
                });
            });
            return true;

        case Request.Login:
            let LoginPassword = Message["Password"] as string;
            Wallet.Login(LoginPassword).then(Success => {
                SendResponse(Success);
            });
            return true;

        case Request.Logout:
            Wallet.Logout().then(() => {
                SendResponse();
            });
            return true;

        case Request.RequestDomainKey:
            SendResponse();
            return true;

        case Request.RequestTip:
            let PublicSpendKey = Message["PublicSpendKey"] as string;
            let TipAmount = Message["Amount"] as number;
            Transactions.Withdraw(PublicSpendKey, TipAmount).then(Transaction => {
                SendResponse(Transaction);
            });
            return true;

        case Request.RequestWithdrawal:
            let Address = Message["Address"] as string;
            let WithdrawalAmount = Message["Amount"] as number;
            Transactions.Withdraw(Address, WithdrawalAmount).then(Transaction => {
                SendResponse(Transaction);
            });
            return true;

        case Request.SendTransaction:
            let Transaction = Message["Transaction"] as Transaction;
            Network.SendTransaction(Transaction).then(Success => {
                SendResponse(Success);
            })
            return true;

        case Request.Wipe:
            Wallet.Wipe().then(() => Database.Clear());
            return true;

        default:
            SendResponse();
            return true;
    }
}