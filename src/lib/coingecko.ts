import * as Config from "../config.json";
import * as Constants from "./constants";
import * as Wallet from "./wallet";
import * as Options from "./options";
import * as Utils from "./utils";
import * as Async from "./async";
import { Http } from "./http";

// Connection to CoinGecko API
const CoinGecko = new Http("api.coingecko.com", 443, true);

// The current conversion rate
export let ConversionRate = 0;

// Initializes CoinGecko price monitor
export async function Init(CancellationToken:Async.CancellationToken) {
    // Begin price update loop
    Async.Loop(async () => {
        // Get coin and currency information
        let Coin = Config.Coin.toLowerCase();
        let Currency = (await Options.GetCurrency()).toLowerCase();
        
        // Request price information
        let Response = await CoinGecko.Get(Constants.COINGECKO_API.PRICE, {
            ids: Coin, vs_currencies: Currency
        });

        // Check if successful
        if (Response && Response[Coin] && Response[Coin][Currency]) {
            ConversionRate = Response[Coin][Currency];
        }
        await Async.Sleep(Constants.COINGECKO_PRICE_INTERVAL);
    }, CancellationToken);
}

// Attempts to register a spend key with the backend
export async function GetPrice() {
    // Get converted balance
    let Balance = Utils.GetReadableAmount(Wallet.Info.Balance);

    // Return price data
    return Math.floor(ConversionRate * Balance * 100) / 100;
}