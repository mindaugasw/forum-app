import React from 'react';
import { connect } from 'react-redux';
import ThreadFormRedux from "./ThreadFormRedux";

const mapStateToProps = state => {
    return { threads: state.threads.list };
};

const ConnectedList = ({ threads }) => {
    return (
    <div>
        <hr />
        <b>TESTING ZONE - ThreadListRedux.jsx</b><br />
        <ThreadFormRedux />

        <ul>
            {threads.map(el => (
                <li key={el.id}>{el.id}: {el.title}</li>
            ))}
        </ul>
        <hr />
    </div>);
};

const ThreadListRedux = connect(mapStateToProps)(ConnectedList);

export default ThreadListRedux;