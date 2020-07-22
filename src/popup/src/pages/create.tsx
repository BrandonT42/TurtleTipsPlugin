import React from "react";
import * as Router from "../lib/routing";
import { withRouter, RouteComponentProps } from "react-router-dom";
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

        // Set util's router history object
        Router.SetRouter(this.props.history);

        // Resize app window
        App.Current.Resize(300, 316);

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
    }

    // Render
    render() {
        return (
            <div className="Fit Panel Gradient" style={{opacity: this.state.Opacity}}>
                <div className="Logo"/>
                <h1 className="FadeIn Delay100">Welcome to TurtleTips.</h1>
                <p className="FadeInPartial Delay200">Before you can start tipping, you'll need a wallet.</p>
                <p className="FadeInPartial Delay300">Let's get you started. Which would you like to do?</p>
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