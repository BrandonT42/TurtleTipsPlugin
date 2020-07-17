import * as TurtleCoin from "./turtlecoin";

// Converts a string to a hexadecimal representation of that string
export function StringToHex(Value:string) {
    var Hex:string = "";
    for (let i = 0; i < Value.length; i++) {
        let Char = Value.charCodeAt(i).toString(16);
        Hex += ("000" + Char).slice(-4);
    }
    return Hex
}

// Returns a JSON-ified error message
export function Error(Message:string) {
    return JSON.stringify({Error: Message});
}

// Hashes an arbitrary string
export function Hash(Value:string) {
    let Hex = StringToHex(Value);
    return TurtleCoin.Crypto.cn_fast_hash(Hex);
}