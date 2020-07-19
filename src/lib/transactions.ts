import * as Config from "../config.json";
import * as Network from "./network";
import * as TurtleCoin from "./turtlecoin";
import * as Database from "./database";
import * as Wallet from "./wallet";
import * as Constants from "./constants";
import { Interfaces, Address as Addresses, Transaction } from "turtlecoin-utils";
import { Transfer, Errorable } from "./types";

// Creates a new transaction that can be broadcast to the network
async function Create(Destinations:Transfer[], PaymentId?:string):Promise<Errorable<Transaction>> {
    // Validate payment id
    if (PaymentId && (PaymentId.length != 64 || !PaymentId.match("-?[0-9a-fA-F]+"))) {
        return { Success: false, Error: Error("Invalid payment id") };
    }

    // Generate transaction outputs and validate destinations
    let Outputs:Interfaces.GeneratedOutput[] = [];
    let TransactionAmount = 0;
    Destinations.forEach(Destination => {
        // Attempt to generate outputs
        try {
            let GeneratedOutputs = TurtleCoin.Utils.generateTransactionOutputs(
                Destination.Address, Destination.Amount);
            Outputs = Outputs.concat(GeneratedOutputs);
            TransactionAmount += Destination.Amount;
        }
        // Failed to generate outputs from transfer array
        catch {
            return { Success: false, Error: Error("Invalid transfers array, could not generate outputs") };
        }
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
            let TransactionSize = EstimateTransactionSize(Config.Mixin, Inputs.length, Outputs.length);
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
                let RandomOutputs:Interfaces.RandomOutput[][] = [];
                RandomOutputs = await Network.GetRandomOutputs(Inputs.map(Input => Input.amount));

                // Attempt to create transaction
                try {
                    let Transaction = await TurtleCoin.Utils.createTransaction(Outputs, Inputs,
                        RandomOutputs, Config.Mixin, Fee, PaymentId);
                    return { Success: true, Value: Transaction };
                }
                catch (Error) {
                    return { Success: false, Error: Error };
                }
            }
        }
    }

    // Insufficient balance after taking into account fees
    return { Success: false, Error: Error("Insufficient balance") };
}

// Creates a new tip transaction
export async function Tip(PublicSpendKey:string, Amount:number):Promise<Errorable<Transaction>> {
    // Check if wallet contains sufficient balance
    if (Wallet.Info.Balance < Amount) {
        return { Success: false, Error: Error("Insufficient balance") };
    }

    // Form destination transfer array
    let Transfers:Transfer[] = [];
    try {
        // Create destination address
        let Address = Addresses.fromPublicKeys(PublicSpendKey, Config.PublicViewKey);

        // Create transfer
        Transfers.push({
            Address: Address.address,
            Amount: Amount
        });
    }

    // Failed to create destination transfer
    catch {
        return { Success: false, Error: Error("Invalid destination address") };
    }

    // Attempt to create transaction
    return await Create(Transfers);
}

// Creates a new withdrawal transaction
export async function Withdraw(Address:string, Amount:number):Promise<Errorable<Transaction>> {
    // Check if withdrawal amount meets minimum
    if (Amount < Config.MinimumWithdrawal) {
        return { Success: false, Error: Error("Amount is less than withdrawal minimum") };
    }

    // Check if wallet contains sufficient balance
    let DonationAmount = Amount * Config.DonationPercentage;
    if (Wallet.Info.Balance < Amount + DonationAmount) {
        return { Success: false, Error: Error("Insufficient balance") };
    }

    // Form destination transfer array
    let Transfers:Transfer[] = [];
    try {
        // Create destination address
        let Destination = Addresses.fromAddress(Address);

        // Create transfer
        Transfers.push({
            Address: Destination.address,
            Amount: Amount
        });
    }

    // Invalid address supplied
    catch {
        return { Success: false, Error: Error("Invalid withdrawal address") };
    }

    // Add donation transfer
    Transfers.push({
        Address: Config.DonationAddress,
        Amount: DonationAmount
    });

    // Attempt to create transaction
    return await Create(Transfers);
}

// Courtesy of zpalmtree from turtlecoin-wallet-backend-js:
function EstimateTransactionSize(
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