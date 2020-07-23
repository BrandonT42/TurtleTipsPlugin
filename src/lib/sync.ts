import * as Async from "./async";
import * as Wallet from "./wallet";
import * as Backend from "./backend";
import * as Constants from "./constants";
import * as TurtleCoin from "./turtlecoin";
import * as Database from "./database";
import * as Transaction from "./transactions";
import * as Network from "./network";

// Last known sync height
export let Height = 0;

// Whether or not the wallet is synced
export let Synced = false;

// Percentage synced
export let Percentage = 0;

// Loads last sync information and begins syncing
export async function Start(CancellationToken:Async.CancellationToken) {
    // Start wallet sync loop
    Async.Loop(async () => {
        // Check that wallet exists and is already registered with the backend
        if (!Wallet.Info) {
            console.log("No wallet loaded, waiting...");
            await Async.Sleep(5000, CancellationToken);
            return;
        }
        
        // Check that the backend is reachable
        if (!Backend.Connected) {
            console.log("Backend unreachable, waiting...");
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
            else console.log("Registration successful");
        }

        // Check if already synced and wait if so
        if (Height >= Backend.Height) {
            // Wallet is synced
            Synced = true;

            // Attempt auto optimization
            let Fusion = await Transaction.CreateFusion();
            if (Fusion.Success) {
                console.log("Attempting optimization...");
                let Success = Network.SendTransaction(Fusion.Value.Raw);
                if (Success) console.log("Fusion transaction sent");
                else console.log("Failed to send fusion transaction");
            }

            // Sleep then start over
            await Async.Sleep(5000, CancellationToken);
            return;
        }
        else Synced = false;

        // Calculate sync chunk size
        let ChunkSize = Backend.Height - Height;
        ChunkSize = ChunkSize <= Constants.MAXIMUM_SYNC_CHUNK_SIZE ? ChunkSize : Constants.MAXIMUM_SYNC_CHUNK_SIZE;

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

        // Set new sync height
        Height += ChunkSize;
        Percentage = Math.floor(Height / Backend.Height * 10000) / 100;
        console.log(`Synced to height ${Height} / ${Backend.Height} (${Percentage}%)`);

        // Adjust wallet balance
        await Wallet.AddBalance(BalanceChange);
    }, CancellationToken);
}

// Resets the sync position to 0
export async function ResetHeight(NewHeight?:number) {
    Height = NewHeight ?? 0;
    Synced = false;
    console.log("Sync reset to height " + Height);
}