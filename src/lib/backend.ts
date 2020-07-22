import * as Config from "../config.json";
import * as Constants from "./constants";
import * as Async from "./async";
import * as Wallet from "./wallet";
import * as Database from "./database";
import { Http } from "./http";
import { SyncData, Host } from "./types";

// Connection to TurtleTips backend
const Backend = new Http(Config.BackendHost, Config.BackendPort, Config.BackendHttps);

// Last known backend height
export let Height:number = 0;

// Connection status
export let Connected:boolean = false;

// Initializes backend connection
export async function Init(CancellationToken:Async.CancellationToken) {
    // Begin hosts update loop
    Async.Loop(async () => {
        // Request host list from backend
        let Response = await Backend.Get(Constants.BACKEND_API.HOSTS);
        if (Response && Response.hosts) {
            let Hosts = [];
            Response.hosts.forEach(Host => {
                Hosts.push({
                    Host: Host.host,
                    PublicKey: Host.pubkey
                });
            });
            await Database.UpdateHosts(Hosts);
            Connected = true;
        }
        else Connected = false;
        await Async.Sleep(Constants.BACKEND_HOSTS_INTERVAL);
    }, CancellationToken);

    // Begin height update loop
    Async.Loop(async () => {
        // If not connected, wait
        if (!Connected) {
            await Async.Sleep(Constants.BACKEND_HOSTS_INTERVAL);
            return;
        }

        // If wallet isn't loaded, wait
        if (!Wallet.Info) {
            await Async.Sleep(1000);
            return;
        }

        // Request height from backend
        let Response = await Backend.Get(Constants.BACKEND_API.HEIGHT);
        if (Response && Response.height) {
            Height = Response.height;
        }
        await Async.Sleep(Constants.BACKEND_HEIGHT_INTERVAL);
    }, CancellationToken);
}

// Attempts to register a spend key with the backend
export async function RegisterSpendKey():Promise<boolean> {
    // Send spend key to backend
    let Response = await Backend.Post(Constants.BACKEND_API.REGISTER_KEY, {
        pubkey: Wallet.Info.Keys.publicKey
    }, Wallet.Info.Keys);

    // Check if successful
    if (Response && Response.Success && Response.Success === true) {
        Wallet.Info.Registered = true;
        return true;
    }

    // Failed to register
    else return false;
}

// Gets a chunk of wallet sync data
export async function GetSyncData(Height:number, Count:number):Promise<SyncData> {
    return await Backend.Post("/api/v0/sync", {
        pubkey: Wallet.Info.Keys.publicKey,
        height: Height,
        count: Count
    }, Wallet.Info.Keys) as SyncData;
}