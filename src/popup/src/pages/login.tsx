import React from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import * as Wallet from "../lib/wallet";
import * as Router from "../lib/routing";
import * as App from "../App";

// Main Page
class LoginPage extends React.Component<RouteComponentProps> {
    // Set default state
    state = {
        Password: "",
        Opacity: 1
    };

    // Constructor
    constructor(props: RouteComponentProps) {
        super(props);

        // Set util's router history object
        Router.SetRouter(this.props.history);

        // Bind event handlers
        this.OnPasswordChange = this.OnPasswordChange.bind(this);
        this.OnLoginClick = this.OnLoginClick.bind(this);
    }

    // Password input changed
    OnPasswordChange(Event:React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            Password: Event.target.value 
        });
    }

    // Login form submitted
    OnLoginClick(Event:React.FormEvent<HTMLFormElement>) {
        Wallet.Login(this.state.Password).then(Success => {
            // Login successful
            if (Success) {
                this.setState({Opacity: 0});
                App.Window.Resize(300, 208);
                Router.Route("/home");
            }

            // Login failed
            else {
                console.log("Login failed");
            }
        });
        Event.preventDefault();
    }

    // Render
    render() {
        return (
            <div className="Fit Panel Gradient" style={{opacity: this.state.Opacity}}>
                <div className="Logo"/>
                <h1 className="FadeIn Delay1000">Welcome back.</h1>
                <p className="FadeIn Delay2000">Please enter your password to continue.</p>
                <form onSubmit={this.OnLoginClick}>
                    <input className="FadeIn Delay3000" name="password" type="password"
                        value={this.state.Password} onChange={this.OnPasswordChange} autoFocus/>
                    <br/>
                    <button className="FadeIn Delay3500">Login</button>
                </form>
            </div>
        );
    }
}

export default withRouter(LoginPage);