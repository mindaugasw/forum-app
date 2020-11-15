import React from "react";
import {resultAction, subscribeAction} from "../../redux/events";
import {connect} from "react-redux";


const mapDispatchToProps = {
    resultAction,
    subscribeAction
}

class ConnectedEventTest extends React.Component {
    constructor(props) {
        super(props);
        console.log('E @ component call, EventTest.jsx');
        // this.props.resultAction();
        // console.log(this.props.resultAction);
        // store.dispatch(this.props.resultAction);
        // this.props.resultAction();
        this.props.subscribeAction({
            asd: 'wtf',
            // newAct: this.props.resultAction,
            callback: this.props.resultAction
        });
    }

    render() {
        return null;
    }
}
const EventTest = connect(null, mapDispatchToProps)(ConnectedEventTest);

export default EventTest;