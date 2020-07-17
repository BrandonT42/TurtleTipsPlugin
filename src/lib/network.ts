import * as Async from "./async";
import * as Config from "../config.json";
import * as Constants from "./constants";
import { Http } from "./http";
import { Transaction, Interfaces } from "turtlecoin-utils";

// Connection to daemon/blockapi
const Daemon = new Http(Config.DaemonHost, Config.DaemonPort, Config.DaemonHttps);

// Last known network height
export let Height:number = 0;

// Initializes network monitor
export async function Init(CancellationToken:Async.CancellationToken) {
    // Begin height update loop
    Async.Loop(async () => {
        // Request height from daemon
        let Response = await Daemon.Get(Constants.DAEMON_API.HEIGHT);
        if (Response && Response.network_height) {
            Height = Response.network_height;
        }
        await Async.Sleep(Constants.NETWORK_HEIGHT_INTERVAL);
    }, CancellationToken);
}

// Gets random outputs for transaction creation
export async function GetRandomOutputs(Amounts:number[]) {
    // Create an output array to hold our outputs
    let RandomOutputs:Interfaces.RandomOutput[] = [];

    // Fetch random outputs for these amounts
    let Response = await Daemon.Post("/randomOutputs", {
        amounts: Amounts,
        mixin: Config.Mixin
    }) as {
        amount:number,
        outs: {
            global_amount_index: number,
            out_key: string
        }[]
    }[];

    // Parse outputs and push them into our output array
    Response.forEach(Output => {
        Output.outs.forEach(Out => {
            RandomOutputs.push({
                key: Out.out_key,
                globalIndex: Out.global_amount_index
            });
        });
    });

    // Return parsed random outputs
    return RandomOutputs;
}

// Broadcasts a transaction to the network
export async function SendTransaction(Transaction:Transaction) {
    // Send transaction to daemon
    let Response = await Daemon.Post(Constants.DAEMON_API.SEND_TRANSACTION, {
        tx_as_hex: Transaction.toBuffer()
    });

    // Check if transaction was sent without error
    // TODO - verify this works
    if (!Response.error) return true;
    return false;
}