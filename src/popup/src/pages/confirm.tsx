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
        App.Current.Resize(300, 170);

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
    OnSendButtonClick(Event:React.MouseEvent<HTMLFormElement, MouseEvent>) {
        // TODO - broadcast then print back transaction info
        App.Current.DisplayError("TODO");
        Event.preventDefault();
    }

    // Render
    render() {
        return (
            <div className="Fit Panel Gradient" style={{opacity: this.state.Opacity}}>
                <div onClick={this.OnBackArrowClick} className="BackArrow"/>
                <br/>
                <h1 className="FadeIn Delay100">Confirm Amount.</h1>
                <p className="FadeInPartial Delay200">
                    Do you really want to send <b>{this.state.Amount} {Config.Ticker}</b>?
                </p>
                <p className="FadeInPartial Delay300">
                    This transaction will cost you <b>{this.state.Fee} {Config.Ticker}</b> to send, 
                    and <b>{this.state.Change} {Config.Ticker}</b> will be temporarily locked until this 
                    transaction processes.
                </p>
                <button className="FadeIn Delay400">Send Transaction</button>
            </div>
        );
    }
}

export default withRouter(ConfirmPage);