import * as Config from "../config.json";
import * as Constants from "./constants";
import * as Async from "./async";
import * as Wallet from "./wallet";
import { Http } from "./http";
import { SyncData } from "./types";

// Connection to TurtleTips backend
const Backend = new Http(Config.BackendHost, Config.BackendPort, Config.BackendHttps);

// Last known backend height
export let Height:number = 0;

// Initializes backend connection
export async function Init(CancellationToken:Async.CancellationToken) {
    // Begin height update loop
    Async.Loop(async () => {
        // Request height from backend
        let Response = await Backend.Get(Constants.BACKEND_API.HEIGHT);
        if (Response && Response.height) {
            Height = Response.height;
        }
        await Async.Sleep(Constants.BACKEND_HEIGHT_INTERVAL);
    }, CancellationToken);
}

// Attempts to register a spend key with the backend
export async function RegisterSpendKey() {
    // Send spend key to backend
    let Response = await Backend.Post(Constants.BACKEND_API.REGISTER_KEY, {
        pubkey: Wallet.Info.Keys.publicKey
    }, Wallet.Info.Keys);

    // Check if successful
    if (Response && Response.Success && Response.Success === true) {
        Wallet.Info.Registered = true;
    }

    // Check if registration was successful
    return Wallet.Info.Registered;
}

// Gets a chunk of wallet sync data
export async function GetSyncData(Height:number, Count:number):Promise<SyncData> {
    return await Backend.Post("/api/v0/sync", {
        pubkey: Wallet.Info.Keys.publicKey,
        height: Height,
        count: Count
    }, Wallet.Info.Keys) as SyncData;
}