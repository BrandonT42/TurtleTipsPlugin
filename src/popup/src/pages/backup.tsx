import React from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import * as Router from "../lib/routing";

// Main Page
class BackupPage extends React.Component<RouteComponentProps> {
    // Set default state
    state = {
        Opacity: 1
    };

    // Constructor
    constructor(props: RouteComponentProps) {
        super(props);
    }

    componentDidMount() {    
        // TODO - remove debug code
        this.setState({Opacity: 0});
        Router.Route("/home");
    }

    // Render
    render() {
        return (
            <div className="Fit Panel Gradient" style={{opacity: this.state.Opacity}}>
                
            </div>
        );
    }
}

export default withRouter(BackupPage);