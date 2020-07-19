import React from "react";
import { Request } from "../lib/types";
import { withRouter, RouteComponentProps } from "react-router-dom";
import * as Async from "../lib/async";
import * as Wallet from "../lib/wallet";
import * as Config from "../config.json";

// Main Page
class Home extends React.Component<RouteComponentProps> {
    // Set default state
    state = {
        AppHeight: 360,
        Balance: 0,
        Value: 0,
        Currency: "USD",
        CancellationToken: new Async.CancellationToken()
    };

    // Constructor
    constructor(props: RouteComponentProps) {
        super(props);

        // Bind event listeners
        this.OnOptionsClick = this.OnOptionsClick.bind(this);
        this.OnWithdrawClick = this.OnWithdrawClick.bind(this);
        this.OnDepositClick = this.OnDepositClick.bind(this);

        // Get wallet balance
        Async.Loop(() => {
            Wallet.GetBalance().then(Balance => {
                // Get readable amount
                let AtomicUnits = Balance.Balance;
                let Readable = AtomicUnits / Math.pow(10, Config.DecimalPlaces)

                // Set state values
                this.setState({
                    Balance: Readable.toLocaleString(),
                    Value: Balance.Value,
                    Currency: Balance.Currency
                });
            });
        }, this.state.CancellationToken);
    }

    // Options icon clicked
    OnOptionsClick() {
        console.log("Options clicked");
    }

    // Withdraw button clicked
    OnWithdrawClick() {
        console.log("Withdraw clicked");
    }

    // Deposit button clicked
    OnDepositClick() {
        console.log("Deposit clicked");

        // TODO - remove this debug code
        chrome.runtime.sendMessage({
            Request: Request.Wipe
        }, Response => console.log("Wiped storage"));
    }

    // Render
    render() {
        return (
            <div className="Fit Panel">
                <div className="OptionsIcon" onClick={this.OnOptionsClick}/>
                <div className="Panel Gradient Body">
                    <h2>Balance:</h2>
                    <h1>{this.state.Balance} TRTL</h1>
                    <h3>({this.state.Value} {this.state.Currency})</h3>
                    <h2>Locked Balance:</h2>
                    <h3>(TODO) TRTL</h3>
                    <button onClick={this.OnDepositClick}>Deposit</button>
                    <button onClick={this.OnWithdrawClick}>Withdraw</button>
                </div>
            </div>
        );
    }
}

export default withRouter(Home);