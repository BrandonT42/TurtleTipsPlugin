import * as TurtleCoin from "../lib/turtlecoin";
import * as Database from "../lib/database";
import * as Events from "../lib/events";
import * as Async from "../lib/async";
import * as Network from "../lib/network";
import * as Backend from "../lib/backend";
import * as Sync from "../lib/sync";
import * as CoinGecko from "../lib/coingecko";
import * as Wallet from "../lib/wallet";
import * as Tab from "../lib/tab";

// Cancellation token that can cancel all async operations
export const CancellationToken = new Async.CancellationToken();

// Begins background operations
async function Start() {
    // Initialize TurtleCoin utilities
    await TurtleCoin.Init();

    // Initialize database connection
    await Database.Init();

    // TODO - remove debug code
    await Wallet.Wipe();
    await Database.Clear();

    // Initialize network monitor
    await Network.Init(CancellationToken);

    // Initialize backend connection
    await Backend.Init(CancellationToken);

    // Initialize coingecko monitor
    await CoinGecko.Init(CancellationToken);

    // Assign chrome events
    await Events.Assign();

    // Start sync manager
    await Sync.Start(CancellationToken);

    // Load wallet info
    await Wallet.Init();

    // Start tab monitoring
    await Tab.Init();
}
Start();