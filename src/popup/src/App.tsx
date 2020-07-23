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
import OptionsPage from "./pages/options";
import SendPage from "./pages/send";
import ConfirmPage from "./pages/confirm";
import DepositPage from "./pages/deposit";

// Holds a reference to the current running app window
export let Current:App;

// Main app screen
class App extends Component {
    // Set default state
    state = {
        StartingPage: CreatePage,
        Width: 300,
        Height: 1,
        ErrorMessage: React.createRef<HTMLParagraphElement>(),
        LastError: "",
        Loading: React.createRef<HTMLDivElement>()
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
    public DisplayError(Message:string, Params?:{Duration?:number, Parent?:HTMLElement}) {
        // Set error message
        this.setState({
            LastError: Message
        });

        // Flash parent element and focus it
        if (Params?.Parent) {
            Params?.Parent.animate([
                { borderColor: "rgba(255, 255, 255, 0.5)" },
                { borderColor: "#E27F7E" },
                { borderColor: "#FFE4B4" }
            ], {
                duration: Params?.Duration ?? 500,
                iterations: 1
            });
            Params?.Parent.focus();
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

    // Shows loading icon
    public StartLoading() {
        this.state.Loading.current?.style.setProperty("opacity", "1");
        this.state.Loading.current?.style.setProperty("z-index", "2");
    }

    // Hides loading icon
    public DoneLoading() {
        this.state.Loading.current?.style.setProperty("opacity", "0");
        this.state.Loading.current?.style.setProperty("z-index", "-1");
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
                                <Route path="/options" component={OptionsPage}/>
                                <Route path="/send" component={SendPage}/>
                                <Route path="/confirm" component={ConfirmPage}/>
                                <Route path="/deposit" component={DepositPage}/>
                            </Switch>
                        </CSSTransition>
                    </TransitionGroup>
                )}/>
            </MemoryRouter>
            <p className="ErrorMessage" ref={this.state.ErrorMessage}>
                {this.state.LastError}
            </p>
            <div className="Loading" ref={this.state.Loading}>
                <div className="LoadingIcon"/>
            </div>
        </div>
        );
    }
}

export default App;