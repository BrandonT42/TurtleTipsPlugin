import React from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import * as Router from "../lib/routing";
import * as Wallet from "../lib/wallet";
import * as App from "../App";
import * as Config from "../config.json";

// Main Page
class ConfirmPage extends React.Component<RouteComponentProps> {
    // Set default state
    state = {
        Opacity: 1,
        Raw: {},
        Amount: 0,
        Fee: 0,
        Change: 0,
        Hash: ""
    };

    // Constructor
    constructor(props: RouteComponentProps) {
        super(props);

        // Resize app window
        App.Current.Resize(300, 180);

        // Bind event handlers
        this.OnBackArrowClick = this.OnBackArrowClick.bind(this);
        this.OnSendButtonClick = this.OnSendButtonClick.bind(this);

        // Assign transaction values
        this.state = {
            Opacity: 1,
            Raw: Wallet.Transaction.Raw,
            Hash: Wallet.Transaction.Hash,
            Amount: Wallet.Transaction.Amount,
            Fee: Wallet.Transaction.Fee,
            Change: Wallet.Transaction.Change
        };
    }

    // Back arrow clicked
    OnBackArrowClick(Event:React.MouseEvent<HTMLDivElement, MouseEvent>) {
        this.setState({Opacity: 0});
        Router.Route("/send");
    }

    // Send transaction button was clicked
    OnSendButtonClick(Event:React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        Wallet.SendTransaction().then(Success => {
            console.log("Success: " + Success);
            // Sent successfully
            if (Success) {
                App.Current.DisplayError("Transaction sent.", { Duration: 1000 });
                this.setState({Opacity: 0});
                Router.Route("/sent");
            }

            // Failed to send
            else {
                App.Current.DisplayError("Failed to send transaction, please try again.", { Duration: 1000 });
            }
        });
    }

    // Render
    render() {
        return (
            <div className="Fit Panel Gradient" style={{opacity: this.state.Opacity}}>
                <div onClick={this.OnBackArrowClick} className="BackArrow"/>
                <br/>
                <h1 className="FadeIn Delay100">Confirm Amount.</h1>
                <p className="FadeInPartial Delay200">
                    After fees, this transaction will cost you <b>{this.state.Amount + this.state.Fee} {Config.Ticker}</b>.
                    Until this transaction processes on the network, <b>{this.state.Change} {Config.Ticker}</b> will also 
                    be locked and temporarily unspendable.
                </p>
                <p className="FadeInPartial Delay300">
                    <b>Would you like to send this transaction?</b>
                </p>
                <button className="FadeIn Delay400" onClick={this.OnSendButtonClick}>Send Transaction</button>
            </div>
        );
    }
}

export default withRouter(ConfirmPage);