import * as Async from "./async";
import * as Config from "../config.json";
import * as Constants from "./constants";
import { Http } from "./http";
import { Interfaces } from "turtlecoin-utils";

// Connection to daemon/blockapi
const Daemon = new Http(Config.DaemonHost, Config.DaemonPort, Config.DaemonHttps);

// Last known network height
export let Height:number = 0;

// Connection status
export let Connected:boolean = false;

// Initializes network monitor
export async function Init(CancellationToken:Async.CancellationToken) {
    // Begin height update loop
    Async.Loop(async () => {
        // Request height from daemon
        let Response = await Daemon.Get(Constants.DAEMON_API.HEIGHT);
        if (Response
            && Response.Value.network_height) {
            Height = Response.Value.network_height;
            Connected = true;
        }
        else Connected = false;
        await Async.Sleep(Constants.NETWORK_HEIGHT_INTERVAL);
    }, CancellationToken);
}

// Gets random outputs for transaction creation
export async function GetRandomOutputs(Amounts:number[]) {
    // Check if we even need to request
    if (Config.Mixin === 0) return [];

    // Fetch random outputs for these amounts
    let Response = await Daemon.Post("/randomOutputs", {
        amounts: Amounts,
        mixin: Config.Mixin + 1
    });
    if (!Response) return undefined;
    let Outs = Response.Value as {
        amount:number,
        outs: {
            global_amount_index: number,
            out_key: string
        }[]
    }[];
    if (!Outs) return [];

    // Sort into a proper array of outputs
    let RandomOutputs:Interfaces.RandomOutput[][] = [];
    Outs.forEach(Output => {
        let Participant:Interfaces.RandomOutput[] = [];
        Output.outs.forEach(Out => {
            Participant.push({
                key: Out.out_key,
                globalIndex: Out.global_amount_index
            });
        });
        RandomOutputs.push(Participant);
    });
    return RandomOutputs;
}

// Broadcasts a transaction to the network
export async function SendTransaction(Transaction:string) {
    // Send transaction to daemon
    let Response = await Daemon.Post(Constants.DAEMON_API.SEND_TRANSACTION, {
        tx_as_hex: Transaction
    });

    // Check is response exists
    if (!Response) return false;

    // Check if transaction failed
    if (Response.Value.status == "Failed") return false;

    // Transaction successful
    return true;
}