import * as Config from "../config.json";
import * as Constants from "./constants";
import * as Wallet from "./wallet";
import * as Options from "./options";
import * as Utils from "./utils";
import { Http } from "./http";

// Connection to CoinGecko API
const CoinGecko = new Http("api.coingecko.com", 443, true);

// Attempts to register a spend key with the backend
export async function GetPrice() {
    // Get coin and currency information
    let Coin = Config.Coin.toLowerCase();
    let Currency = (await Options.GetCurrency()).toLowerCase();

    // Get converted balance
    let Balance = Utils.GetReadableAmount(Wallet.Info.Balance);

    // Request price information
    let Response = await CoinGecko.Get(Constants.COINGECKO_API.PRICE, {
        ids: Coin, vs_currencies: Currency
    });

    // Check if successful
    console.log(Response);
    if (Response && Response[Coin] && Response[Coin][Currency]) {
        let ConversionRate = Response[Coin][Currency];
        let Price = Math.floor(ConversionRate * Balance * 100) / 100;
        return Price;
    }

    // Failed to fetch price data
    else return 0;
}