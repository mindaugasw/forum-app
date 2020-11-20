import React from "react";

function Loading() {
    console.error('Replace <Loading /> with <Spinner />');
    let loader = require('../../images/loading.gif').default;
    return <img src={loader} />;
    // TODO delete this component
}

export default Loading;