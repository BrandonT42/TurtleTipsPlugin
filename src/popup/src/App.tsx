import React, { Component } from "react";
import { MemoryRouter, Route, Switch, RouteComponentProps } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import * as Wallet from "./lib/wallet";

// Import app styles
import "./index.css";

// Import pages
import CreatePage from "./pages/create";
import NewPage from "./pages/new";
import RestorePage from "./pages/restore";
import BackupPage from "./pages/backup";
import LoginPage from "./pages/login";
import HomePage from "./pages/home";

// Holds a reference to the current running app window
export let Current:App;

// Main app screen
class App extends Component {
    // Set default state
    state = {
        StartingPage: CreatePage,
        Width: 300,
        Height: 360,
        ErrorMessage: React.createRef<HTMLParagraphElement>(),
        LastError: ""
    }

    // Constructor
    constructor(props: RouteComponentProps) {
        super(props);

        // Set window to this app
        Current = this;

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

    // Displays an error message and flashes the parent element
    public DisplayError(Message:string, Parent?:HTMLElement) {
        // Set error message
        this.setState({
            LastError: Message
        });

        // Flash parent element and focus it
        if (Parent) {
            Parent.animate([
                { borderColor: "rgba(255, 255, 255, 0.5)" },
                { borderColor: "#E27F7E" },
                { borderColor: "#FFE4B4" }
            ], {
                duration: 500,
                iterations: 1
            });
            Parent.focus();
        }

        // Animate error message
        this.state.ErrorMessage.current?.animate([
            { opacity: 0 },
            { opacity: 0.65 },
            { opacity: 0.8 },
            { opacity: 0.65 },
            { opacity: 0 }
        ], {
            duration: 2000,
            iterations: 1
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
                                <Route path="/new" component={NewPage}/>
                                <Route path="/restore" component={RestorePage}/>
                                <Route path="/backup" component={BackupPage}/>
                                <Route path="/login" component={LoginPage}/>
                                <Route path="/home" component={HomePage}/>
                            </Switch>
                        </CSSTransition>
                    </TransitionGroup>
                )}/>
            </MemoryRouter>
            <p className="ErrorMessage" ref={this.state.ErrorMessage}>
                {this.state.LastError}
            </p>
        </div>
        );
    }
}

export default App;