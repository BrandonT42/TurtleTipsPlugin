import React from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import * as Router from "../lib/routing";
import * as Config from "../config.json";
import * as Wallet from "../lib/wallet";
import * as App from "../App";

// Main Page
class BackupPage extends React.Component<RouteComponentProps> {
    // Set default state
    state = {
        Opacity: 1,
        Seed: ""
    };

    // Constructor
    constructor(props: RouteComponentProps) {
        super(props);

        // Resize app window
        App.Current.Resize(300, 300);

        // Bind event handlers
        this.OnCopyButtonClick = this.OnCopyButtonClick.bind(this);
        this.OnDoneButtonClick = this.OnDoneButtonClick.bind(this);

        // Get wallet info and populate seed box
        Wallet.GetWalletInfo().then(Wallet => {
            console.log(Wallet);
            this.setState({
                Seed: Wallet.Seed
            });
        });
    }

    // Copy to clipboard button was clicked
    OnCopyButtonClick(Event:React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        // Get seed textbox and copy contents
        let SeedBox = document.getElementById("Seed") as HTMLTextAreaElement;
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

    // Done button was clicked
    OnDoneButtonClick(Event:React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        this.setState({Opacity: 0});
        Router.Route("/home");
    }

    // Render
    render() {
        return (
            <div className="Fit Gradient Panel" style={{opacity: this.state.Opacity}}>
                <br/>
                <h1 className="FadeIn Delay100">Backup your seed.</h1>
                <p className="FadeInPartial Delay200">
                    This is your wallet's seed, back it up somewhere safe. 
                    This seed is the <b>only</b> way to restore your wallet if your forget your password. 
                    Anyone that has access to this seed can claim your {Config.Ticker} as their own.
                </p>
                <textarea id="Seed" className="FadeInPartial Delay300" readOnly value={this.state.Seed}/>
                <button onClick={this.OnCopyButtonClick} className="FadeIn Delay400">Copy to Clipboard</button>
                <button onClick={this.OnDoneButtonClick} className="FadeIn Delay500">Done</button>
            </div>
        );
    }
}

export default withRouter(BackupPage);