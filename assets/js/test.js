import React from 'react';
import { render } from 'react-dom';
import ThreadListItem from "./components/ThreadListItem";

export default function () {
    console.log('React stuff');
    
    const el = <ThreadListItem />
    render(el, document.getElementById('sample-div'));
}