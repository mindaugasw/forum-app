import React from "react";
import {Spinner} from "react-bootstrap";

/**
 * Big loading spinner in the middle of the screen
 */
function Loader() {
    return <div className='text-center mt-5 pt-5'><Spinner animation='border' /></div>;
}

Loader.Small = function LoaderSmall () {
    return <Spinner animation='border' size='sm' />;
}

export default Loader;