import * as Constants from "./constants";
import * as Config from "../config.json";

// Gets which currency CoinGecko prices will be returned as
export async function GetCurrency():Promise<string> {
    return new Promise(Resolve => {
        chrome.storage.local.get([
            "currency"
        ], async Response => {
            let Currency = Response["currency"] as string;
            if (Currency && Constants.COINGECKO_CURRENCIES.includes(Currency)) {
                Resolve(Currency);
            }
            else {
                await SetCurrency(Config.DefaultCurrency);
                Resolve(Config.DefaultCurrency);
            }
        });
    });
}

// Sets which currency CoinGecko prices will be returned as
export async function SetCurrency(Currency:string) {
    return new Promise(Resolve => {
        console.log("Setting currency preference to " + Currency);
        chrome.storage.local.set({
            currency: Currency
        }, () => Resolve());
    });
}

// Resets all options to default values
export async function Reset() {
    return new Promise(Resolve => {
        console.log("Resetting all options");
        chrome.storage.local.set({
            currency: Config.DefaultCurrency
        }, () => Resolve());
    });
}