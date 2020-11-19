import React from "react";

function Loading() {
    let loader = require('../../images/loading.gif').default;
    return <img src={loader} />;
    // TODO delete this component
}

export default Loading;