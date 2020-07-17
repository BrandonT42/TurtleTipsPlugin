import * as Async from "./async";
import * as Wallet from "./wallet";
import * as Backend from "./backend";
import * as Constants from "./constants";
import * as TurtleCoin from "./turtlecoin";
import * as Database from "./database";
import * as Network from "./network";

// Last known sync height
export let Height = 0;

// Loads last sync information and begins syncing
export async function Start(CancellationToken:Async.CancellationToken) {
    // Start wallet sync loop
    Async.Loop(async () => {
        // Check that wallet exists and is already registered with the backend
        if (Wallet.Info == undefined) {
            console.log("No wallet to sync, waiting...");
            await Async.Sleep(5000, CancellationToken);
            return;
        }

        // Ensure wallet is registered
        if (!Wallet.Info.Registered) {
            console.log("Attempting to register wallet");
            let Registered = await Backend.RegisterSpendKey();
            if (!Registered) {
                console.log("Failed to register, waiting...");
                await Async.Sleep(5000, CancellationToken);
                return;
            }
        }

        // Check if already synced and wait if so
        if (Height >= Backend.Height) {
            console.log("Sync height >= backend height, waiting...");
            await Async.Sleep(5000, CancellationToken);
            return;
        }

        // Calculate sync chunk size
        let ChunkSize = Backend.Height - Height;
        ChunkSize = ChunkSize <= Constants.MAX_SYNC_CHUNK_SIZE ? ChunkSize : Constants.MAX_SYNC_CHUNK_SIZE;

        // Get sync data for this chunk
        let SyncData = await Backend.GetSyncData(Height + 1, ChunkSize);
        if (!SyncData || SyncData === undefined) return;
        
        // Scan outputs for received amounts
        let BalanceChange = 0;
        if (SyncData.Outputs && SyncData.Outputs != undefined) {
            // Convert outputs to spendable inputs
            let Inputs = [];
            SyncData.Outputs.forEach(async Output => {
                // Derive private ephemeral key
                let PrivateEphemeral = TurtleCoin.Crypto.deriveSecretKey(
                    Output.derivation, Output.transaction_index, Wallet.Info.Keys.privateKey
                );

                // Generate key image
                let KeyImage = TurtleCoin.Crypto.generateKeyImage(
                    Output.public_ephemeral, PrivateEphemeral
                );

                // Return storable input value
                Inputs.push({
                    Amount: Output.amount,
                    TransactionIndex: Output.transaction_index,
                    GlobalIndex: Output.global_index,
                    KeyImage: KeyImage,
                    PublicEphemeral: Output.public_ephemeral,
                    PrivateEphemeral: PrivateEphemeral,
                    SpentHeight: 0,
                    UnlockTime: Output.unlock_time
                });
            });
            BalanceChange += await Database.StoreInputs(Inputs);
        }

        // Scan inputs for spent amounts
        if (SyncData.Inputs && SyncData.Inputs != undefined) {
            // Mark owned inputs as spent
            let KeyImages = SyncData.Inputs.map(Input => Input.key_image);
            BalanceChange += await Database.SpendInputs(KeyImages, Height);
        }

        // Adjust wallet balance
        Wallet.AddBalance(BalanceChange);

        // Set new sync height
        Height += ChunkSize;
        console.log("Synced to height " + Height + " / " + Network.Height);
    }, CancellationToken);
}

// Resets the sync position to 0
export async function Reset() {
    Height = 0;
}