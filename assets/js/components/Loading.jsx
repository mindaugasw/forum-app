import React from "react";

function Loading() {
    let loader = require('../../images/loading.gif').default;
    return <img src={loader} />;
}

export default Loading;