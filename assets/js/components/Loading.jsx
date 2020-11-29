import React from "react";

function Loading() {
    console.error('Replace <Loading /> with <Spinner />');
    let loader = require('../../images/loading.gif').default;
    // TODO delete loading.gif
    return <img src={loader} />;
    // TODO delete this component
}

export default Loading;