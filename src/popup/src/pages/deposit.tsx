import React from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import * as Router from "../lib/routing";
import * as Config from "../config.json";
import * as Wallet from "../lib/wallet";
import * as App from "../App";

// Main Page
class DepositPage extends React.Component<RouteComponentProps> {
    // Set default state
    state = {
        Opacity: 1,
        Address: ""
    };

    // Constructor
    constructor(props: RouteComponentProps) {
        super(props);

        // Resize app window
        App.Current.Resize(300, 230);

        // Bind event handlers
        this.OnBackArrowClick = this.OnBackArrowClick.bind(this);
        this.OnCopyButtonClick = this.OnCopyButtonClick.bind(this);

        // Get wallet info and populate seed box
        Wallet.GetWalletInfo().then(Wallet => {
            console.log(Wallet);
            this.setState({
                Address: Wallet.Address
            });
        });
    }

    // Back arrow clicked
    OnBackArrowClick(Event:React.MouseEvent<HTMLDivElement, MouseEvent>) {
        this.setState({Opacity: 0});
        Router.Route("/home");
    }

    // Copy to clipboard button was clicked
    OnCopyButtonClick(Event:React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        // Get seed textbox and copy contents
        let SeedBox = document.getElementById("Address") as HTMLTextAreaElement;
        SeedBox.select();
        document.execCommand("copy");

        // Flash the textbox
        SeedBox.animate([
            { borderColor: "rgba(255, 255, 255, 0.5)" },
            { borderColor: "#FFE4B4" },
            { borderColor: "rgba(255, 255, 255, 0.5)" }
        ], {
            duration: 500,
            iterations: 1
        });

        // Empty selection and unfocus
        document.getSelection()?.empty();
        SeedBox.blur();
    }

    // Render
    render() {
        return (
            <div className="Fit Gradient Panel" style={{opacity: this.state.Opacity}}>
                <div onClick={this.OnBackArrowClick} className="BackArrow"/>
                <br/>
                <h1 className="FadeIn Delay100">Deposit {Config.Ticker}.</h1>
                <p className="FadeInPartial Delay200">
                    Here is your wallet's address. To deposit or receive funds, 
                    just send them to this address, and TurtleTips will take care of the rest.
                </p>
                <textarea id="Address" className="FadeInPartial Delay300" readOnly value={this.state.Address}/>
                <button onClick={this.OnCopyButtonClick} className="FadeIn Delay400">Copy to Clipboard</button>
            </div>
        );
    }
}

export default withRouter(DepositPage);