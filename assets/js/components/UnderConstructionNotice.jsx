import React from "react";

function UnderConstructionNotice() {
    return (
        <div style={{color: '#f92626'}}>
            <b>App frontend is still under development, this is not a final version.</b><br/>
            Backend is finished and API is available at <a href='/api/threads' target='_blank'>/api/...</a><br/>
            API also has documentation: <a href="https://documenter.getpostman.com/view/2542393/TVRg6V1E" target='_blank'>Postman documentation</a><br/>
            More info and source code on <a href="https://github.com/mindaugasw/forum-app" target='_blank'>GitHub</a><br/>
            <hr/>
            <br/>
        </div>
    );
}

export default UnderConstructionNotice;