import * as Config from "../config.json";
import * as Network from "./network";
import * as TurtleCoin from "./turtlecoin";
import * as Database from "./database";
import * as Wallet from "./wallet";
import * as Constants from "./constants";
import { Interfaces } from "turtlecoin-utils";
import { Transfer } from "./types";

// Creates a new transaction that can be broadcast to the network
export async function Create(Destinations:Transfer[]) {
    // Generate transaction outputs
    let Outputs:Interfaces.GeneratedOutput[] = [];
    let TransactionAmount = 0;
    Destinations.forEach(Destination => {
        let GeneratedOutputs = TurtleCoin.Utils.generateTransactionOutputs(
            Destination.Address, Destination.Amount);
        Outputs = Outputs.concat(GeneratedOutputs);
        TransactionAmount += Destination.Amount;
    });

    // Get unspent inputs
    let UnspentInputs = await Database.GetUnspentInputs();

    // Begin adding inputs to transaction
    let Inputs:Interfaces.Output[] = [];
    let InputTotal = 0;
    for (let i = 0; i < UnspentInputs.length; i++) {
        // Add input to our transaction's input list
        let Input = UnspentInputs[i];
        InputTotal += Input.Amount;
        Inputs.push({
            key: Input.PublicEphemeral,
            keyImage: Input.KeyImage,
            input: {
                privateEphemeral: Input.PrivateEphemeral,
                publicEphemeral: undefined,
                transactionKeys: undefined
            },
            index: Input.TransactionIndex,
            globalIndex: Input.GlobalIndex,
            amount: Input.Amount
        })

        // Check if we've hit our quota
        if (InputTotal >= TransactionAmount) {
            // Set remaining change amount
            let Change = InputTotal - TransactionAmount;

            // Estimate transaction fee and subtract from change
            let TransactionSize = estimateTransactionSize(Config.Mixin, Inputs.length, Outputs.length);
            let Fee = Math.ceil(TransactionSize / 256) * Constants.FEE_PER_BYTE;
            Change -= Fee;
            if (Change < 0) continue;

            // Create change transfer
            if (Change > 0) {
                let GeneratedOutputs = TurtleCoin.Utils.generateTransactionOutputs(
                    Wallet.Info.Address, Change);
                Outputs = Outputs.concat(GeneratedOutputs);
            }

            // Check if out input amount covers the required total
            let EstimatedAmount: number = TransactionAmount + Fee;
            if (InputTotal >= EstimatedAmount) {
                // Request random outputs from the network
                let Amounts = Inputs.map(Input => Input.amount);
                let RandomOutputs:Interfaces.RandomOutput[][] = [];
                RandomOutputs.push(await Network.GetRandomOutputs(Amounts));
                let Transaction = TurtleCoin.Utils.createTransaction(Outputs, Inputs,
                    RandomOutputs, Config.Mixin, Fee);
                return Transaction;
            }
        }
    }
}

// Courtesy of zpalmtree from turtlecoin-wallet-backend-js:
export function estimateTransactionSize(
    mixin: number,
    numInputs: number,
    numOutputs: number): number {

    const KEY_IMAGE_SIZE: number = 32;
    const OUTPUT_KEY_SIZE: number = 32;
    const AMOUNT_SIZE = 8 + 2; // varint
    const GLOBAL_INDEXES_VECTOR_SIZE_SIZE: number = 1 // varint
    const GLOBAL_INDEXES_INITIAL_VALUE_SIZE: number = 4; // varint
    const SIGNATURE_SIZE: number = 64;
    const EXTRA_TAG_SIZE: number = 1;
    const INPUT_TAG_SIZE: number = 1;
    const OUTPUT_TAG_SIZE: number = 1;
    const PUBLIC_KEY_SIZE: number = 32;
    const TRANSACTION_VERSION_SIZE: number = 1;
    const TRANSACTION_UNLOCK_TIME_SIZE: number = 8 + 2; // varint
    const EXTRA_DATA_SIZE: number = 0;
    const PAYMENT_ID_SIZE: number = 0;

    /* The size of the transaction header */
    const headerSize: number = TRANSACTION_VERSION_SIZE
                             + TRANSACTION_UNLOCK_TIME_SIZE
                             + EXTRA_TAG_SIZE
                             + EXTRA_DATA_SIZE
                             + PUBLIC_KEY_SIZE
                             + PAYMENT_ID_SIZE;

    /* The size of each transaction input */
    const inputSize: number = INPUT_TAG_SIZE
                            + AMOUNT_SIZE
                            + KEY_IMAGE_SIZE
                            + SIGNATURE_SIZE
                            + GLOBAL_INDEXES_VECTOR_SIZE_SIZE
                            + GLOBAL_INDEXES_INITIAL_VALUE_SIZE
                            + mixin * SIGNATURE_SIZE;

    const inputsSize: number = inputSize * numInputs;

    /* The size of each transaction output. */
    const outputSize: number = OUTPUT_TAG_SIZE
                             + OUTPUT_KEY_SIZE
                             + AMOUNT_SIZE;

    const outputsSize: number = outputSize * numOutputs;

    return headerSize + inputsSize + outputsSize;
}