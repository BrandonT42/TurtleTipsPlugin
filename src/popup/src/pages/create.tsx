import React from "react";
import * as Router from "../lib/routing";
import { withRouter, RouteComponentProps } from "react-router-dom";
import * as Wallet from "../lib/wallet";
import * as App from "../App";

// Main Page
class Initialize extends React.Component<RouteComponentProps> {
    // Set default state
    state = {
        Opacity: 1
    };

    // Constructor
    constructor(props: RouteComponentProps) {
        super(props);

        // Resize window
        App.Current.Resize(300, 316);

        // Set util's router history object
        Router.SetRouter(this.props.history);

        // Bind event handlers
        this.OnNewWalletClicked = this.OnNewWalletClicked.bind(this);
        this.OnRestoreWalletClicked = this.OnRestoreWalletClicked.bind(this);
    }

    // New wallet clicked
    OnNewWalletClicked() {
        this.setState({Opacity: 0});
        Router.Route("/new");
    }

    // Restore wallet clicked
    OnRestoreWalletClicked() {
        this.setState({Opacity: 0});
        Router.Route("/restore");
        // TODO - remove debug code
        /*let Seed = "881579e7c864c86e7bb4de577a92f68ecef4815463a1a2997fe29d992a29ee032715430";
        let Password = "12345";
        Wallet.Restore(Seed, Password).then(Success => {
            Wallet.GetKeys().then(WalletKeys => {
                this.setState({Opacity: 0});
                Router.Route("/restore");
            });
        });*/
    }

    // Render
    render() {
        return (
            <div className="Fit Panel Gradient" style={{opacity: this.state.Opacity}}>
                <div className="Logo"/>
                <h1 className="FadeIn Delay100">Welcome to TurtleTips.</h1>
                <p className="FadeIn Delay200">Before you can start tipping, you'll need a wallet.</p>
                <p className="FadeIn Delay300">Let's get you started. Which would you like to do?</p>
                <button className="FadeIn Delay400" 
                    onClick={this.OnNewWalletClicked}>Create New Wallet</button>
                <br/>
                <button className="FadeIn Delay450"
                    onClick={this.OnRestoreWalletClicked}>Restore Existing Wallet</button>
            </div>
        );
    }
}

export default withRouter(Initialize);