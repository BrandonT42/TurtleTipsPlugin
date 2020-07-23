import React from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import * as Wallet from "../lib/wallet";
import * as Router from "../lib/routing";
import * as App from "../App";

// Main Page
class LoginPage extends React.Component<RouteComponentProps> {
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
        App.Current.Resize(300, 300);

        // Bind event handlers
        this.OnLoginClick = this.OnLoginClick.bind(this);
    }

    // Login form submitted
    OnLoginClick(Event:React.FormEvent<HTMLFormElement>) {
        // Get form elements
        let Children = Event.currentTarget.children;
        let Password = Children.namedItem("password") as HTMLInputElement;
        
        // Attempt login
        Wallet.Login(Password.value).then(Success => {
            // Login successful
            if (Success) {
                this.setState({Opacity: 0});
                Router.Route("/home");
            }

            // Login failed
            else {
                App.Current.DisplayError("Invalid password", {
                    Parent: Password
                });
            }
        });
        Event.preventDefault();
    }

    // Render
    render() {
        return (
            <div className="Fit Panel Gradient" style={{opacity: this.state.Opacity}}>
                <div className="Logo"/>
                <h1 className="FadeIn Delay100">Welcome back.</h1>
                <p className="FadeInPartial Delay200">Please enter your password to continue.</p>
                <form onSubmit={this.OnLoginClick}>
                    <input className="FadeIn Delay300" name="password" type="password" autoFocus/>
                    <br/>
                    <button className="FadeIn Delay350">Login</button>
                </form>
            </div>
        );
    }
}

export default withRouter(LoginPage);