import React from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import * as Router from "../lib/routing";
import * as App from "../App";

// Main Page
class OptionsPage extends React.Component<RouteComponentProps> {
    // Set default state
    state = {
        Opacity: 1
    };

    // Constructor
    constructor(props: RouteComponentProps) {
        super(props);

        // Resize app window
        App.Current.Resize(300, 300);

        // Bind event handlers
        this.OnBackArrowClick = this.OnBackArrowClick.bind(this);
    }

    // Back arrow clicked
    OnBackArrowClick(Event:React.MouseEvent<HTMLDivElement, MouseEvent>) {
        this.setState({Opacity: 0});
        Router.Route("/home");
    }

    // Render
    render() {
        return (
            <div className="Fit Panel Gradient" style={{opacity: this.state.Opacity}}>
                <div onClick={this.OnBackArrowClick} className="BackArrow"/>
                
            </div>
        );
    }
}

export default withRouter(OptionsPage);