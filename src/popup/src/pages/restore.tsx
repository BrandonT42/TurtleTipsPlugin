import React from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import * as Router from "../lib/routing";
import * as Wallet from "../lib/wallet";
import * as App from "../App";

// Main Page
class RestorePage extends React.Component<RouteComponentProps> {
    // Set default state
    state = {
        Opacity: 1
    };

    // Constructor
    constructor(props: RouteComponentProps) {
        super(props);

        // Resize app window
        App.Current.Resize(300, 440);

        // Bind event handlers
        this.OnBackArrowClick = this.OnBackArrowClick.bind(this);
        this.OnRestoreWalletClick = this.OnRestoreWalletClick.bind(this);
    }

    // Back arrow clicked
    OnBackArrowClick(Event:React.MouseEvent<HTMLDivElement, MouseEvent>) {
        this.setState({Opacity: 0});
        Router.Route("/create");
    }

    // Create wallet form submitted
    OnRestoreWalletClick(Event:React.FormEvent<HTMLFormElement>) {
        // Get form elements
        let Children = Event.currentTarget.children;
        let Seed = Children.namedItem("seed") as HTMLInputElement;
        let Password = Children.namedItem("password") as HTMLInputElement;
        let ConfirmPassword = Children.namedItem("confirmpassword") as HTMLInputElement;

        // Test password strength
        let Regex = new RegExp("^(?=.{8,})");
        if (!Regex.test(Password.value)) {
            App.Current.DisplayError("Password must be 8 characters or longer.", {
                Parent: Password
            });
        }

        // Verify passwords match
        else if (Password.value !== ConfirmPassword.value) {
            App.Current.DisplayError("Passwords do not match.", {
                Parent: ConfirmPassword
            });
        }

        // Passwords check out
        else {
            Wallet.Restore(Seed.value, Password.value).then(Success => {
                // If wallet was successfully created, move to backup screen
                if (Success) {
                    this.setState({Opacity: 0});
                    Router.Route("/backup");
                }

                // Otherwise an unknown error took place, likely a bad seed
                else {
                    App.Current.DisplayError("Invalid seed, please try again.", {
                        Parent: Seed
                    });
                }
            });
        }
        Event.preventDefault();
    }

    // Render
    render() {
        return (
            <div className="Fit Panel Gradient" style={{opacity: this.state.Opacity}}>
                <div onClick={this.OnBackArrowClick} className="BackArrow"/>
                <div className="Logo"/>
                <h1 className="FadeIn Delay100">Let's get started.</h1>
                <form onSubmit={this.OnRestoreWalletClick}>
                    <p className="FadeInPartial Delay200">Enter your wallet seed</p>
                    <input className="FadeIn Delay250" name="seed" type="password" autoFocus/>
                    <br/>
                    <p className="FadeInPartial Delay300">Enter a password</p>
                    <input className="FadeIn Delay350" name="password" type="password"/>
                    <br/>
                    <p className="FadeInPartial Delay400">Confirm your password</p>
                    <input className="FadeIn Delay450" name="confirmpassword" type="password"/>
                    <br/>
                    <button className="FadeIn Delay500">Restore Wallet</button>
                </form>
            </div>
        );
    }
}

export default withRouter(RestorePage);