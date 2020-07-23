import React from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import * as Wallet from "../lib/wallet";
import * as Router from "../lib/routing";
import * as App from "../App";
import * as Config from "../config.json";

// Main Page
class SendPage extends React.Component<RouteComponentProps> {
    // Set default state
    state = {
        Opacity: 1,
        Amount: "0.00"
    };

    // Constructor
    constructor(props: RouteComponentProps) {
        super(props);

        // Resize app window
        App.Current.Resize(300, 310);

        // Bind event handlers
        this.OnBackArrowClick = this.OnBackArrowClick.bind(this);
        this.OnSendButtonClick = this.OnSendButtonClick.bind(this);
        this.OnAmountChange = this.OnAmountChange.bind(this);
    }

    // Back arrow clicked
    OnBackArrowClick(Event:React.MouseEvent<HTMLDivElement, MouseEvent>) {
        this.setState({Opacity: 0});
        Router.Route("/home");
    }

    // Send transaction button was clicked
    OnSendButtonClick(Event:React.MouseEvent<HTMLFormElement, MouseEvent>) {
        // Show loading icon
        App.Current.StartLoading();

        // Get form elements
        let Children = Event.currentTarget.children;
        let Address = Children.namedItem("address") as HTMLInputElement;
        let Amount = Children.namedItem("amount") as HTMLInputElement;
        let PaymentId = Children.namedItem("paymentid") as HTMLInputElement;

        // Attempt to create transaction
        Wallet.Send(Address.value, +Amount.value, PaymentId.value).then(Response => {
            // Check for an existing response
            if (!Response) {
                App.Current.DisplayError("Failed to create transaction");
                return;
            }

            // Check if successful
            if (!Response.Success) {
                App.Current.DisplayError(Response.Error, { Duration:1200 });
                return;
            }

            // Success
            Wallet.SetTransaction(Response.Value);
            this.setState({Opacity: 0});
            Router.Route("/confirm");
        });

        // Finish loading and prevent form submit
        App.Current.DoneLoading();
        Event.preventDefault();
    }

    // Triggers when amount input value is modified
    OnAmountChange(Event:React.ChangeEvent<HTMLInputElement>) {
        // Get value
        let Value = Event.target.value;

        // Only 2 decimal places
        let Split = Value.split(".");
        if (Split.length >= 2 && Split[1].length > 2) {
            let NewValue = Split[1].substr(0, 2);
            Value = `${Split[0]}.${NewValue}`;
        }

        // Set value
        this.setState({
            Amount: Value
        });
    }

    // Render
    render() {
        return (
            <div className="Fit Panel Gradient" style={{opacity: this.state.Opacity}}>
                <div onClick={this.OnBackArrowClick} className="BackArrow"/>
                <br/>
                <h1 className="FadeIn Delay100">Send {Config.Ticker}.</h1>
                <form onSubmit={this.OnSendButtonClick}>
                    <p className="FadeInPartial Delay200">Where would you like to send to?</p>
                    <input className="FadeIn Delay250" name="address" autoFocus/>
                    <br/>
                    <p className="FadeInPartial Delay300">How much would you like to send?</p>
                    <input className="FadeIn Delay350" name="amount" type="number" step="0.01"
                        onChange={this.OnAmountChange} value={this.state.Amount}/>
                    <br/>
                    <p className="FadeInPartial Delay400">Enter a payment ID (Optional)</p>
                    <input className="FadeIn Delay450" name="paymentid"/>
                    <br/>
                    <button className="FadeIn Delay500">Send Transaction</button>
                </form>
            </div>
        );
    }
}

export default withRouter(SendPage);