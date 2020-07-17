import * as Config from "../config.json";
import * as Network from "./network";
import * as Backend from "./backend";
import * as TurtleCoin from "./turtlecoin";
import * as Utils from "./utils";
import * as Sync from "./sync";
import { Address as Addresses, KeyPair } from "turtlecoin-utils";
import { WalletInfo } from "./types";

// Currently loaded wallet
export let Info:WalletInfo;

// Logs into an existing wallet
export async function Login(Password:string) {
    return new Promise(async Resolve => {
        chrome.storage.local.get([
            "password", "address", "balance", "height", "registered", "sk", "pk", "sync"
        ], async Response => {
            // TODO - encrypt keys in local storage for extra layer of security,
            // even if I don't think you can access that storage outside of the plugin's context

            // Verify password
            let HashedPassword = Utils.Hash(Password);
            if (Response["password"] && Response["password"] === HashedPassword) {
                // Cache wallet info
                Info = {
                    Address: Response["address"],
                    Balance: Response["balance"],
                    Height: Response["height"],
                    Registered: Response["registered"],
                    Keys: new KeyPair(Response["pk"], Response["sk"])
                }
                Sync.ResetHeight(Response["sync"]);
                console.log("Logged into wallet with key " + Info.Keys.publicKey);
                Resolve(true);
            }
            else Resolve(false);
        });
    });
}

// Logs out of a wallet and clears currently cached data
export async function Logout() {
    await Save();
    Info = undefined;
    console.log("Logged out of wallet");
}

// Saves wallet data to local storage
export async function Save() {
    return new Promise(async Resolve => {
        // Saves wallet data to local storage
        console.log("Saving wallet");
        chrome.storage.local.set({
            address: Info.Address,
            balance: Info.Balance,
            height: Info.Height,
            registered: Info.Registered,
            sk: Info.Keys.privateKey,
            pk: Info.Keys.publicKey,
            sync: Sync.Height
        }, () => Resolve());
    });
}

// Generates a new set of wallet keys and seeds them with the current height
export async function New(Password:string) {
    return new Promise(Resolve => {
        let WaitForHeight = async () => {
            // Wait for height to sync with network so we can grab a proper creation height
            if (Network.Height > 0) {
                // Generate a new keypair and address, cache it
                let Keys = new KeyPair();
                let Address = Addresses.fromPublicKeys(Keys.publicKey, Config.PublicViewKey);
                Info = {
                    Keys: Keys,
                    Address: Address.address,
                    Balance: 0,
                    Height: Network.Height,
                    Registered: false
                };

                // Reset sync height
                Sync.ResetHeight(Network.Height);

                // Save wallet data and new password to local storage
                console.log("Created new wallet with key " + Info.Keys.publicKey);
                chrome.storage.local.set({
                    address: Info.Address,
                    balance: Info.Balance,
                    height: Info.Height,
                    registered: Info.Registered,
                    sk: Info.Keys.privateKey,
                    pk: Info.Keys.publicKey,
                    sync: Sync.Height,
                    password: Utils.Hash(Password)
                }, () => Resolve());
            }
            else setTimeout(WaitForHeight, 100);
        }
        setTimeout(WaitForHeight, 100);
    });
}

// Restores a wallet from a seed consisting of private key + creation height
export async function Restore(Seed:string, Password:string) {
    return new Promise(Resolve => {
        // Check if seed length is valid
        if (Seed.length < 64) Resolve(false);

        // Extract private key
        let PrivateKey = Seed.substring(0, 64);

        // Extract creation height
        let Height = Config.SyncHeight;
        if (Seed.length > 64) {
            Height = +Seed.substring(64);
        }

        // Try to restore keys
        try {
            let PublicKey = TurtleCoin.Crypto.secretKeyToPublicKey(PrivateKey);
            let Keys = new KeyPair(PublicKey, PrivateKey);
            let Address = Addresses.fromPublicKeys(PublicKey, Config.PublicViewKey);
            Info = {
                Keys: Keys,
                Address: Address.address,
                Balance: 0,
                Height: Height,
                Registered: false
            };

            // Reset sync height
            Sync.ResetHeight(Height);

            // Save wallet data and new password to local storage
            console.log("Restored wallet with key " + Info.Keys.publicKey);
            chrome.storage.local.set({
                address: Info.Address,
                balance: Info.Balance,
                height: Info.Height,
                registered: Info.Registered,
                sk: Info.Keys.privateKey,
                pk: Info.Keys.publicKey,
                sync: Sync.Height,
                password: Utils.Hash(Password)
            }, () => Resolve(true));
        }
        catch {
            Resolve(false);
        }
    });
}

// Adjust the current wallet balance
export async function AddBalance(Amount:number) {
    if (Amount === 0) return;
    Info.Balance += Amount;
    console.log("Wallet balance adjusted, new balance: " + Info.Balance);
    await Save();
}

// Wipes all stored wallet data
export async function Wipe() {
    chrome.storage.local.clear();
    await Sync.ResetHeight();
    console.log("Wallet cache wiped");
}