import React from "react";
import { Request } from "../lib/types";
import { withRouter, RouteComponentProps } from "react-router-dom";

// Main Page
class Home extends React.Component<RouteComponentProps> {
    // Set default state
    state = {
        AppHeight: 360
    };

    // Constructor
    constructor(props: RouteComponentProps) {
        super(props);

        // Bind event listeners
        this.OnOptionsClick = this.OnOptionsClick.bind(this);
        this.OnWithdrawClick = this.OnWithdrawClick.bind(this);
        this.OnDepositClick = this.OnDepositClick.bind(this);
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
                    <h1>1,000,000.99 TRTL</h1>
                    <h3>(123.45 USD)</h3>
                    <h2>Locked Balance:</h2>
                    <h3>1,234.56 TRTL</h3>
                    <button onClick={this.OnDepositClick}>Deposit</button>
                    <button onClick={this.OnWithdrawClick}>Withdraw</button>
                </div>
            </div>
        );
    }
}

export default withRouter(Home);