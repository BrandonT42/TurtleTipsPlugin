import * as TurtleCoin from "../lib/turtlecoin";
import * as Database from "../lib/database";
import * as Events from "../lib/events";
import * as Wallet from "../lib/wallet";
import * as Async from "../lib/async";
import * as Network from "../lib/network";
import * as Backend from "../lib/backend";
import * as Sync from "../lib/sync";

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
    Wallet.Restore("881579e7c864c86e7bb4de577a92f68ecef4815463a1a2997fe29d992a29ee032715430", "12345");
    Sync.Start(CancellationToken);
}
Start();