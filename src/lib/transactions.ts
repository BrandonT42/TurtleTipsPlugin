import * as Config from "../config.json";
import * as Network from "./network";
import * as TurtleCoin from "./turtlecoin";
import * as Database from "./database";
import * as Wallet from "./wallet";
import * as Utils from "./utils";
import * as Constants from "./constants";
import { Interfaces, Address as Addresses, Transaction as GeneratedTransaction } from "turtlecoin-utils";
import { Transfer, Errorable, Input, Transaction } from "./types";

// Gets inputs to create a fusion transaction with
// Ported from zpalmtree's code in turtlecoin-wallet-backend-js
async function GetFusionInputs():Promise<Input[]> {
    return new Promise(async Resolve => {
        // Get spendable inputs and shuffle them
        let Inputs = await Database.GetUnspentInputs();
        Utils.Shuffle(Inputs);

        // Split inputs based on power of ten
        let SortedInputs:Map<number, Input[]>  = new Map();
        Inputs.forEach(Input => {
            let Pow = Math.ceil(Math.log10(Input.Amount + 1));
            let Temp = SortedInputs.get(Pow) || [];
            Temp.push(Input);
            SortedInputs.set(Pow, Temp);
        });
        
        // Determine if any set of inputs meets the minimum fusion requirement
        let FullInputs:Input[][] = [];
        SortedInputs.forEach(Bucket => {
            if (Bucket.length >= Constants.MINIMUM_FUSION_INPUT_COUNT) {
                FullInputs.push(Bucket);
            }
        });
        Utils.Shuffle(FullInputs);
        
        // If there are any sets of inputs meeting the minimum fusion requirement, use them
        let EligibleInputs:Input[][] = [];
        if (FullInputs.length > 0) EligibleInputs = [FullInputs[0]];
        else {
            EligibleInputs.forEach(Inputs => {
                EligibleInputs.push(Inputs);
            });
        }

        // Decide on final inputs
        let FusionInputs:Input[] = [];
        EligibleInputs.forEach(Bucket => {
            Bucket.forEach(Input => {
                FusionInputs.push(Input);
                if (FusionInputs.length >= Constants.MAXIMUM_FUSION_INPUT_COUNT) {
                    Resolve(FusionInputs);
                }
            });
        });
        Resolve(FusionInputs);
    });
}

// Creates a new fusion transaction that can be broadcast to the network
// Ported from zpalmtree's code in turtlecoin-wallet-backend-js
export async function CreateFusion():Promise<Errorable<Transaction>> {
    // Get fusion inputs
    let Inputs = await GetFusionInputs();

    // Loop until fusion transaction is made or fails to get created
    while (true) {
        // Verify there are enough inputs to create a fusion transaction
        if (Inputs.length < Constants.MINIMUM_FUSION_INPUT_COUNT) {
            return { Success: false, Error: "Wallet fully optimized" };
        }

        // Sum input amounts and get transaction outputs
        let Amount = Inputs.reduce((A, B) => A + B.Amount, 0);
        let Outputs = TurtleCoin.Utils.generateTransactionOutputs(Wallet.Info.Address, Amount);

        // Check if input to output ratio has been met
        if (Outputs.length == 0 || Inputs.length / Outputs.length < Constants.FUSION_INPUT_RATIO) {
            // Pop last input and try again
            Inputs.pop();
            continue;
        }

        // Create transaction inputs array
        let FusionInputs = [];
        Inputs.forEach(Input => {
            FusionInputs.push({
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
        });

        // Request random outputs from the network
        let RandomOutputs:Interfaces.RandomOutput[][] = [];
        RandomOutputs = await Network.GetRandomOutputs(FusionInputs.map(Input => Input.amount));

        // Attempt to create a fusion transaction
        let Transaction: GeneratedTransaction;
        try {
            Transaction = await TurtleCoin.Utils.createTransaction(Outputs, FusionInputs,
                RandomOutputs, Config.Mixin, 0);
        }
        catch (Error) {
            return {
                Success: false,
                Error: Error.message
            };
        }

        // Estimate transaction size to see if it exceeds maximum fusion size
        const InputsSize = Constants.INPUT_SIZE * FusionInputs.length;
        const OutputsSize = Constants.OUTPUT_SIZE * Outputs.length;
        let TransactionSize = Constants.TRANSACTION_HEADER_SIZE + InputsSize + OutputsSize;
        if (TransactionSize > Constants.MAXIMUM_FUSION_SIZE) {
            // Pop last input and try again
            Inputs.pop();
            continue;
        }

        // Fusion transaction was successful
        return {
            Success: true,
            Value: {
                Raw: Transaction,
                Hash: Transaction.hash,
                Amount: 0,
                Change: 0,
                Fee: 0
            }
        };
    }
}

// Creates a new simple transaction that can be broadcast to the network
async function CreateSimple(Destinations:Transfer[], PaymentId?:string):Promise<Errorable<Transaction>> {
    // Validate payment id
    if (PaymentId && (PaymentId.length != 64 || !PaymentId.match("-?[0-9a-fA-F]+"))) {
        return { Success: false, Error: "Invalid payment id" };
    }

    // Convert destinations to outputs and calculate transaction total
    let DestinationOutputs:Interfaces.GeneratedOutput[] = [];
    let TransactionAmount = 0;
    Destinations.forEach(Destination => {
        // Attempt to generate outputs
        try {
            let GeneratedOutputs = TurtleCoin.Utils.generateTransactionOutputs(
                Destination.Address, Destination.Amount);
            DestinationOutputs = DestinationOutputs.concat(GeneratedOutputs);
            TransactionAmount += Destination.Amount;
        }
        // Failed to generate outputs from transfer array
        catch(Error) {
            return { Success: false, Error: "Invalid transfers array, could not generate outputs" };
        }
    });

    // Check that amount is valid
    if (TransactionAmount <= 0) {
        return { Success: false, Error: "Invalid amount" };
    }

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

            // Start forming transaction destination output array
            let Outputs = DestinationOutputs.slice();
            if (Change > 0) {
                let GeneratedOutputs = TurtleCoin.Utils.generateTransactionOutputs(Wallet.Info.Address, Change);
                Outputs = Outputs.concat(GeneratedOutputs);
            }

            // Estimate transaction fee
            const InputsSize = Constants.INPUT_SIZE * Inputs.length;
            const OutputsSize = Constants.OUTPUT_SIZE * Outputs.length;
            let TransactionSize = Constants.TRANSACTION_HEADER_SIZE + InputsSize + OutputsSize;
            let Fee = TurtleCoin.Utils.calculateMinimumTransactionFee(TransactionSize);
            
            // Check if our input amount covers the required total
            let TotalAmount = TransactionAmount + Fee;
            if (InputTotal < TotalAmount) continue;

            // Request random outputs from the network
            let RandomOutputs:Interfaces.RandomOutput[][] = [];
            RandomOutputs = await Network.GetRandomOutputs(Inputs.map(Input => Input.amount));

            // Attempt to create a transaction
            let Transaction: GeneratedTransaction;
            try {
                Transaction = await TurtleCoin.Utils.createTransaction(Outputs, Inputs,
                    RandomOutputs, Config.Mixin, Fee, PaymentId);
            }
            catch (Error) {
                return {
                    Success: false,
                    Error: Error.message
                };
            }

            // Transaction was successful
            return {
                Success: true,
                Value: {
                    Raw: Transaction,
                    Hash: Transaction.hash,
                    Amount: Utils.FormatAmount(TransactionAmount),
                    Change: Utils.FormatAmount(Change - Fee),
                    Fee: Utils.FormatAmount(Fee)
                }
            };
        }
    }

    // Insufficient balance after taking into account fees
    return { Success: false, Error: "Insufficient balance" };
}

// Creates a new tip transaction
export async function Tip(PublicSpendKey:string, Amount:number):Promise<Errorable<Transaction>> {
    // Check if wallet contains sufficient balance
    if (Wallet.Info.Balance < Amount) {
        return { Success: false, Error: "Insufficient balance" };
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
        return { Success: false, Error: "Invalid destination address" };
    }

    // Attempt to create transaction
    return await CreateSimple(Transfers);
}

// Creates a new withdrawal transaction
export async function Send(Address:string, Amount:number, PaymentId?:string):Promise<Errorable<Transaction>> {
    // Check if withdrawal amount meets minimum
    // TODO - re-implement this
    /*if (Amount < Config.MinimumWithdrawal) {
        return { Success: false, Error: "Amount is less than withdrawal minimum" };
    }*/

    // Check if wallet contains sufficient balance
    let DonationAmount = Amount * Config.DonationPercentage;
    if (Wallet.Info.Balance < Amount + DonationAmount) {
        return { Success: false, Error: "Insufficient balance" };
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
        return { Success: false, Error: "Invalid destination address" };
    }

    // Add donation transfer
    Transfers.push({
        Address: Config.DonationAddress,
        Amount: DonationAmount
    });

    // Attempt to create transaction
    return await CreateSimple(Transfers, PaymentId);
}