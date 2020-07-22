import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Input, Host } from './types';

// Schema for database
interface LocalDBSchema extends DBSchema {
    Inputs: {
        key: string;
        value: Input;
    };
    Hosts: {
        key: string;
        value: Host;
    };
}

// Internal database connections
let DB:IDBPDatabase<LocalDBSchema>;

// Initializes the database connection, ensuring the schema matches
export async function Init() {
    // Open database connection
    DB = await openDB<LocalDBSchema>("turtletips-db", 1, {
        upgrade(DB) {
            DB.createObjectStore("Inputs", {
                keyPath: "KeyImage"
            });
            DB.createObjectStore("Hosts", {
                keyPath: "Host"
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
    await InputStore.put(Input);

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
        console.log("Storing input " + Input.KeyImage);
        // Check for balance change
        let ExistingInput = await InputStore.get(Input.KeyImage);
        if (ExistingInput != undefined) {
            BalanceChange += Input.Amount - ExistingInput.Amount;
        }
        else BalanceChange += Input.Amount;

        // Store this input
        await InputStore.put(Input);
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
    Inputs.forEach(async Input => {
        await InputStore.delete(Input.KeyImage);
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
            console.log("Spending input " + KeyImage);
            Input.SpentHeight = Height;
            BalanceChange -= Input.Amount;
            await InputStore.put(Input);
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

// Updates the stored host keys
export async function UpdateHosts(Hosts:Host[]):Promise<number> {
    let Transaction = DB.transaction("Hosts", "readwrite");
    let HostsStore = Transaction.objectStore("Hosts");
    let ModifiedHosts = 0;

    // Iterate over each host
    Hosts.forEach(async Host => {
        // Check if this is a new or modified host
        let ExistingHost = await HostsStore.get(Host.Host);
        if (!ExistingHost || ExistingHost != Host) {
            ModifiedHosts++;
            await HostsStore.put(Host);
        }
    });

    // Wait for transaction to complete
    await Transaction.done;

    // Return the number of new or updated hosts
    return ModifiedHosts;
}

// Returns a stored host public key
export async function GetHost(Host:string):Promise<Host> {
    return await DB.get("Hosts", Host);
}

// Clears the entire database of all stored data
export async function Clear():Promise<void> {
    let Transaction = DB.transaction(["Inputs", "Hosts"], "readwrite");
    let InputStore = Transaction.objectStore("Inputs");
    InputStore.clear();
    let HostsStore = Transaction.objectStore("Hosts");
    HostsStore.clear();
    await Transaction.done;
}