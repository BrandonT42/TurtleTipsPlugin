import React from "react";
import { Request } from "../lib/types";
import { withRouter, RouteComponentProps } from "react-router-dom";
import * as Async from "../lib/async";
import * as Wallet from "../lib/wallet";
import * as App from "../App";

// Main Page
class HomePage extends React.Component<RouteComponentProps> {
    // Set default state
    state = {
        AppHeight: 360,
        Balance: 0,
        Locked: 0,
        Value: 0,
        Currency: "USD",
        SyncPercentage: "0.00%",
        CancellationToken: new Async.CancellationToken()
    };

    // Constructor
    constructor(props: RouteComponentProps) {
        super(props);

        // Resize window
        App.Current.Resize(300, 208);

        // Bind event listeners
        this.OnOptionsClick = this.OnOptionsClick.bind(this);
        this.OnWithdrawClick = this.OnWithdrawClick.bind(this);
        this.OnDepositClick = this.OnDepositClick.bind(this);

        // Begin wallet info update look
        Async.Loop(async () => {
            // Get wallet balance
            let WalletInfo = await Wallet.GetWalletInfo();

            // Set state values
            this.setState({
                Balance: WalletInfo.Balance,
                Locked: WalletInfo.Locked,
                Value: WalletInfo.Value,
                Currency: WalletInfo.Currency,
                SyncPercentage: WalletInfo.SyncPercentage + "%"
            });
            
            // Sleep
            await Async.Sleep(1000);
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
                <div onClick={this.OnOptionsClick} className="OptionsIcon"/>
                <p className="SyncStatus">
                    {this.state.SyncPercentage}
                </p>
                <div className="Panel Gradient Body">
                    <h2 className="FadeIn Delay100">Balance:</h2>
                    <h1 className="FadeIn Delay100">{this.state.Balance} TRTL</h1>
                    <h3 className="FadeIn Delay100">({this.state.Value} {this.state.Currency})</h3>
                    <h2 className="FadeIn Delay200">Locked Balance:</h2>
                    <h3 className="FadeIn Delay 300">{this.state.Locked} TRTL</h3>
                    <button className="FadeIn Delay400" onClick={this.OnDepositClick}>Deposit</button>
                    <button className="FadeIn Delay450" onClick={this.OnWithdrawClick}>Withdraw</button>
                </div>
            </div>
        );
    }
}

export default withRouter(HomePage);