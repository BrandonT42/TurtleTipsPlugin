import * as TurtleCoin from "../lib/turtlecoin";
import * as Database from "../lib/database";
import * as Events from "../lib/events";
import * as Wallet from "../lib/wallet";
import * as Async from "../lib/async";
import * as Network from "../lib/network";
import * as Backend from "../lib/backend";
import * as Sync from "../lib/sync";
import * as Transactions from "../lib/transactions";

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
    // Wipe data
    await Wallet.Wipe();
    await Database.Clear();
    // Restore wallet
    await Wallet.Restore("881579e7c864c86e7bb4de577a92f68ecef4815463a1a2997fe29d992a29ee032715430", "12345");
    // Start sync
    await Sync.Start(CancellationToken);
    // Wait 1 second
    await Async.Sleep(1000);
    // Log out
    await Wallet.Logout();
    // Wait 1 second
    await Async.Sleep(1000);
    // Log back in
    await Wallet.Login("12345");
    // Wait 1 second
    await Async.Sleep(1000);
    // Attempt a 1 TRTL tip
    let Transaction = await Transactions.Create([{
        Address: "TRTLuxi89oXJ8QDXT2E4uj94nqfD4xUyaHTQZ5BPNZzMA6hkHQaSmvk9GEcCKRjbNSHRrTmqZKaSM9jX6m4NnqbxHTSk3dn65CMMpDbsJmh3GBQeLTMXeZGGTGaKuZB4Zzvt1L3JAmU7GZsZ9ftZeHh641f2XDctnjegGM8d7gH9rFkRFvzQX5UBqEV",
        Amount: 100
    }])
    console.log("Created transaction with hash " + Transaction.hash);
}
Start();