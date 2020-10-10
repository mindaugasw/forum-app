import React from "react";
import ThreadList from "./ThreadList";
import ThreadForm from "./ThreadForm";

export default class ReactApp extends React.Component {
        
    render() {
        return (<div>
            <ThreadList/>
        </div>);
    }
}