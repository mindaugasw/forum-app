import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { increment, decrement } from "../../redux/actions/actions";

export default function Counter() {

        const counter = useSelector(state => state.counter);
        const dispatch = useDispatch();


        // const counter = 'null';
        return (
            <div>
                <button id="incButton" onClick={() => dispatch(increment())}>+1</button>
                <button id="decButton" onClick={() => dispatch(decrement())}>-1</button>
                {/*<div id="miDiv" style={{display: 'none'}} >*/}
                {/*    <h1>Redux working</h1>*/}
                {/*</div>*/}
                Value: {counter}
            </div>
        );
}