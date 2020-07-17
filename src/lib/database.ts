import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Input } from './types';

// Specifies the schema for our database, where the key is an input's keyimage, and value is the input itself
interface InputDB extends DBSchema {
    Inputs: {
        key: string;
        value: Input;
    };
}

// Internal database connection
let DB:IDBPDatabase<InputDB>;

// Initializes the database connection, ensuring the schema matches
export async function Init() {
    DB = await openDB<InputDB>("inputs-db", 1, {
        upgrade(DB) {
            DB.createObjectStore("Inputs", {
                keyPath: "KeyImage"
            });
        },
    });
}

// Stores an input in the database
export async function StoreInput(Input:Input):Promise<number> {
    let Transaction = DB.transaction("Inputs", "readwrite");
    let InputStore = Transaction.objectStore("Inputs");
    let BalanceChange = 0;

    // Check for balance change
    let ExistingInput = await InputStore.get(Input.KeyImage);
    if (ExistingInput != undefined) {
        BalanceChange += Input.Amount - ExistingInput.Amount;
    }
    else BalanceChange += Input.Amount;
    InputStore.put(Input);

    // Wait for transaction to complete
    await Transaction.done;

    // Return the balance change
    return BalanceChange;
}

// Stores a set of inputs in the database
export async function StoreInputs(Inputs:Input[]):Promise<number> {
    let Transaction = DB.transaction("Inputs", "readwrite");
    let InputStore = Transaction.objectStore("Inputs");
    let BalanceChange = 0;

    // Iterate over each input
    Inputs.forEach(async Input => {
        // Check for balance change
        let ExistingInput = await InputStore.get(Input.KeyImage);
        if (ExistingInput != undefined) {
            BalanceChange += Input.Amount - ExistingInput.Amount;
        }
        else BalanceChange += Input.Amount;

        // Store this input
        InputStore.put(Input);
    });

    // Wait for transaction to complete
    await Transaction.done;

    // Return the balance change
    return BalanceChange;
}

// Removes an input from the database
export async function DeleteInput(Input:Input):Promise<void> {
    return await DB.delete("Inputs", Input.KeyImage);
}

// Removes a set of inputs from the database
export async function DeleteInputs(Inputs:Input[]):Promise<void> {
    let Transaction = DB.transaction("Inputs", "readwrite");
    let InputStore = Transaction.objectStore("Inputs");
    Inputs.forEach(Input => {
        InputStore.delete(Input.KeyImage);
    });
    return await Transaction.done;
}

// Marks a set of inputs spent at a specified height, and returns the changed amount
export async function SpendInputs(KeyImages:string[], Height:number):Promise<number> {
    let Transaction = DB.transaction("Inputs", "readwrite");
    let InputStore = Transaction.objectStore("Inputs");
    let BalanceChange = 0;

    // Iterate over each key image
    KeyImages.forEach(async KeyImage => {
        // Ensure input exists and is not already spent
        let Input = await InputStore.get(KeyImage);
        if (Input != undefined && Input.SpentHeight === 0) {
            Input.SpentHeight = Height;
            BalanceChange -= Input.Amount;
            InputStore.put(Input);
        }
    });

    // Wait for transaction to complete
    await Transaction.done;

    // Return the balance change
    return BalanceChange;
}

// Returns unspent inputs in ascending order
export async function GetUnspentInputs():Promise<Input[]> {
    let Inputs = await DB.getAll("Inputs");
    Inputs = Inputs.filter(Input => Input.SpentHeight === 0);
    return Inputs.sort((A, B) => A.Amount - B.Amount);
}

// Returns a stored input based on a specified key image
export async function GetInput(KeyImage:string):Promise<Input> {
    return await DB.get("Inputs", KeyImage);
}

// Clears the entire database of all stored data
export async function Clear():Promise<void> {
    let Transaction = DB.transaction("Inputs", "readwrite");
    let InputStore = Transaction.objectStore("Inputs");
    InputStore.clear();
    return await Transaction.done;
}