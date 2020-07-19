import React from "react";
import * as Router from "../lib/routing";
import { withRouter, RouteComponentProps } from "react-router-dom";
import * as Wallet from "../lib/wallet";
import * as App from "../App";

// Main Page
class Initialize extends React.Component<RouteComponentProps> {
    // Constructor
    constructor(props: RouteComponentProps) {
        super(props);

        // Set util's router history object
        Router.SetRouter(this.props.history);

        // Bind event handlers
        this.OnNewWalletClicked = this.OnNewWalletClicked.bind(this);
        this.OnRestoreWalletClicked = this.OnRestoreWalletClicked.bind(this);
    }

    // New wallet clicked
    OnNewWalletClicked() {
        // TODO - remove debug code

    }

    // Restore wallet clicked
    OnRestoreWalletClicked() {
        // TODO - remove debug code
        let Seed = "881579e7c864c86e7bb4de577a92f68ecef4815463a1a2997fe29d992a29ee032715430";
        let Password = "12345";
        Wallet.Restore(Seed, Password).then(Success => {
            Wallet.GetWalletInfo().then(WalletInfo => {
                this.setState({Opacity: 0});
                App.Window.Resize(300, 208);
                Router.Route("/home");
            });
        });
    }

    // Render
    render() {
        return (
            <div className="Fit Panel Gradient">
                <div className="Logo"/>
                <h1 className="FadeIn Delay1000">Welcome to TurtleTips.</h1>
                <p className="FadeIn Delay2000">Before you can start tipping, you need a wallet.</p>
                <p className="FadeIn Delay3000">Let's get you started. Which would you like to do?</p>
                <button className="FadeIn Delay4000" 
                    onClick={this.OnNewWalletClicked}>Create New Wallet</button>
                <br/>
                <button className="FadeIn Delay4500"
                    onClick={this.OnRestoreWalletClicked}>Restore Existing Wallet</button>
            </div>
        );
    }
}

export default withRouter(Initialize);