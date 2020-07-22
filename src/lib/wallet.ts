import * as Config from "../config.json";
import * as Network from "./network";
import * as TurtleCoin from "./turtlecoin";
import * as Utils from "./utils";
import * as Sync from "./sync";
import * as CoinGecko from "./coingecko";
import * as Options from "./options";
import * as Backend from "./backend";
import { Address as Addresses, KeyPair } from "turtlecoin-utils";
import { WalletInfo } from "./types";

// Currently loaded wallet
export let Info:WalletInfo;

// Checks for whether or not a wallet exists
export async function CheckForWallet():Promise<boolean> {
    if (Info) return true;
    else return false;
}

// Loads wallet data for syncing in the background
export async function Init() {
    return new Promise(async Resolve => {
        chrome.storage.local.get([
            "address", "balance", "height", "registered", "sk", "pk", "sync"
        ], async Response => {
            // Check if keys exist
            if (Response["sk"] && Response["pk"]) {
                // Cache wallet info
                Info = {
                    Address: Response["address"],
                    Balance: Response["balance"],
                    Height: Response["height"],
                    Registered: Response["registered"],
                    Keys: new KeyPair(Response["pk"], Response["sk"])
                }
                await Sync.ResetHeight(Response["sync"]);
                console.log(`Loaded wallet with key ${Info.Keys.publicKey}`);
            }
            Resolve();
        });
    });
}

// Logs into an existing wallet
export async function Login(Password:string):Promise<boolean> {
    return new Promise(async Resolve => {
        chrome.storage.local.get([
            "password"
        ], async Response => {
            // Check password
            let HashedPassword = Utils.Hash(Password);
            if (Response["password"] === HashedPassword) {
                console.log("Login successful");
                Resolve(true);
            }

            // Invalid password
            else {
                console.log("Login failed, incorrect password");
                Resolve(false);
            }
        });
    });
}

// Logs out of a wallet and clears currently cached data
export async function Logout() {
    // Save wallet, clear cache
    await Save();
    Info = undefined;
    console.log("Logged out of wallet");
}

// Saves wallet data to local storage
export async function Save() {
    if (!Info) return;
    return new Promise(async Resolve => {
        // Saves wallet data to local storage
        chrome.storage.local.set({
            balance: Info.Balance,
            registered: Info.Registered,
            sync: Sync.Height
        }, () => Resolve());
    });
}

// Generates a new set of wallet keys and seeds them with the current height
export async function New(Password:string):Promise<boolean> {
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
                console.log(`Created new wallet with key ${Info.Keys.publicKey}`);
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
            else setTimeout(WaitForHeight, 100);
        }
        setTimeout(WaitForHeight, 100);
    });
}

// Restores a wallet from a seed consisting of private key + creation height
export async function Restore(Seed:string, Password:string):Promise<boolean> {
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
            console.log(`Restored wallet with key ${Info.Keys.publicKey}, sync height ${Height}`);
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
    if (Amount > 0) {
        Info.Balance += Amount;
        console.log(`Wallet balance adjusted, new balance: ${Info.Balance}`);
    }
    await Save();
}

// Gets wallet information, including balance and sync state
export async function GetWalletInfo() {
    // Get currency preference
    let Currency = await Options.GetCurrency();

    // Check if wallet is loaded
    if (!Info) {
        return {
            Balance: "0.00",
            Locked: "0.00",
            Value: "0.00",
            Currency: Currency
        };
    }

    // Get converted locale string
    let Converted = Info.Balance / Math.pow(10, Config.DecimalPlaces);
    let Balance = Converted.toLocaleString(undefined, {
        minimumFractionDigits: Config.DecimalPlaces,
        maximumFractionDigits: Config.DecimalPlaces
    });

    // Calculate currency value
    let Price = Math.floor(CoinGecko.ConversionRate * Converted * 100) / 100;
    let Value = Price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    // Get wallet sync state
    let Synced = Sync.Synced;
    let Height = Sync.Height;
    let NetworkHeight = Backend.Height;
    let SyncPercentage = Sync.Percentage;

    // Return balance information
    return {
        Balance: Balance,
        Locked: "0.00", // TODO
        Value: Value,
        Currency: Currency,
        Synced: Synced,
        Height: Height,
        NetworkHeight: NetworkHeight,
        SyncPercentage: SyncPercentage
    };
}

// Wipes all stored wallet data
export async function Wipe() {
    return new Promise(Resolve => {
        chrome.storage.local.clear(async () => {
            Info = undefined;
            await Sync.ResetHeight();
            console.log("Wallet cache wiped");
            Resolve();
        });
    });
}