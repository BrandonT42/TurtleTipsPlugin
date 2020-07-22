import React from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import * as Router from "../lib/routing";
import * as Wallet from "../lib/wallet";
import * as App from "../App";

// Main Page
class NewPage extends React.Component<RouteComponentProps> {
    // Set default state
    state = {
        Opacity: 1
    };

    // Constructor
    constructor(props: RouteComponentProps) {
        super(props);

        // Resize window
        App.Current.Resize(300, 366);

        // Bind event handlers
        this.OnBackArrowClick = this.OnBackArrowClick.bind(this);
        this.OnCreateWalletClick = this.OnCreateWalletClick.bind(this);
    }

    // Back arrow clicked
    OnBackArrowClick(Event:React.MouseEvent<HTMLDivElement, MouseEvent>) {
        Router.Route("/create");
    }

    // Create wallet form submitted
    OnCreateWalletClick(Event:React.FormEvent<HTMLFormElement>) {
        // Get form elements
        let Children = Event.currentTarget.children;
        let Password = Children.namedItem("password") as HTMLInputElement;
        let ConfirmPassword = Children.namedItem("confirmpassword") as HTMLInputElement;

        // Test password strength
        let Regex = new RegExp("^(?=.{8,})");
        if (!Regex.test(Password.value)) {
            App.Current.DisplayError("Password must be 8 characters or longer.", Password);
        }

        // Verify passwords match
        else if (Password.value !== ConfirmPassword.value) {
            App.Current.DisplayError("Passwords do not match.", ConfirmPassword);
        }

        // Passwords check out
        else {
            Wallet.New(Password.value).then(Success => {
                // If wallet was successfully created, move to backup screen
                if (Success) {
                    this.setState({Opacity: 0});
                    Router.Route("/backup");
                }

                // Otherwise an unknown error took place
                else {
                    App.Current.DisplayError("Unknown error, please try again.")
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
                <form onSubmit={this.OnCreateWalletClick}>
                    <p className="FadeIn Delay200">Enter a password</p>
                    <input className="FadeIn Delay250" name="password" type="password" autoFocus/>
                    <br/>
                    <p className="FadeIn Delay300">Confirm your password</p>
                    <input className="FadeIn Delay350" name="confirmpassword" type="password"/>
                    <br/>
                    <button className="FadeIn Delay400">Create Wallet</button>
                </form>
            </div>
        );
    }
}

export default withRouter(NewPage);