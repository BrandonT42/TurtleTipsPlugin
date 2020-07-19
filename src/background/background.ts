import * as TurtleCoin from "../lib/turtlecoin";
import * as Database from "../lib/database";
import * as Events from "../lib/events";
import * as Wallet from "../lib/wallet";
import * as Async from "../lib/async";
import * as Network from "../lib/network";
import * as Backend from "../lib/backend";
import * as Sync from "../lib/sync";
import * as Options from "../lib/options";
import * as CoinGecko from "../lib/coingecko";

// Cancellation token that can cancel all async operations
const CancellationToken = new Async.CancellationToken();

// Begins background operations
async function Start() {
    // Initialize TurtleCoin utilities
    await TurtleCoin.Init();

    // Initialize database connection
    await Database.Init();

    // Initialize network monitor
    await Network.Init(CancellationToken);

    // Initialize backend connection
    await Backend.Init(CancellationToken);

    // Assign chrome events
    await Events.Assign();

    // TODO - remove this debug code
    // Log back in successfully
    await Wallet.Login("12345");
    // Start sync
    await Sync.Start(CancellationToken);
}
Start();