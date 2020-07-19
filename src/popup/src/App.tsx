import React, { Component } from "react";
import { MemoryRouter, Route, Switch, RouteComponentProps } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import * as Wallet from "./lib/wallet";

// Import app styles
import "./index.css";

// Import pages
import CreatePage from "./pages/create";
import LoginPage from "./pages/login";
import HomePage from "./pages/home";

// Workaround to be able to resize popup window
export let Window:App;

// Main app screen
class App extends Component {
    // Set default state
    state = {
        StartingPage: CreatePage,
        Width: 300,
        Height: 360
    }

    // Constructor
    constructor(props: RouteComponentProps) {
        super(props);

        // Set window to this app
        Window = this;

        // Check if a wallet exists
        Wallet.CheckForWallet().then(WalletExists => {
            this.setState({
                StartingPage: WalletExists ? LoginPage : CreatePage
            });
        });
    }

    // Resizes the popup window to a specified size
    public Resize(Width:number, Height:number) {
        this.setState({
            Width: Width,
            Height: Height
        });
    }

    // Render
    render() {
        return (
            <div className="App" id="App" style={{
                width: this.state.Width, height: this.state.Height
            }}>
            <MemoryRouter>
                <Route render={({location}) => (
                    <TransitionGroup>
                        <CSSTransition key={location.key} timeout={450} classNames="fade">
                            <Switch location={location}>
                                <Route exact path="/" component={this.state.StartingPage}/>
                                <Route path="/create" component={CreatePage}/>
                                <Route path="/login" component={LoginPage}/>
                                <Route path="/home" component={HomePage}/>
                            </Switch>
                        </CSSTransition>
                    </TransitionGroup>
                )}/>
            </MemoryRouter>
        </div>
        );
    }
}

export default App;