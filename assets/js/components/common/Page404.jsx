import React from 'react';
import {Container} from "react-bootstrap";
import UrlBuilder from "../../utils/UrlBuilder";

function Page404(props) {
    return (
        <Container className='mt-5 pt-5'>
            <span style={{
                display: 'block',
                fontSize: '120px',
                fontWeight: 'bold',
                fontFamily: 'system-ui, sans-serif',
                lineHeight: '1em',
            }}>404</span>
            The requested page was not found.<br/>
            Requested page: <pre className='d-inline'>{window.location.pathname}</pre><br/>
            <a href={UrlBuilder.Home()}>Go back to homepage</a> {/* <a> instead of <Link> to completely reset page, in case 404 was due to some corrupted app state */}
        </Container>
    );
}
Page404.propTypes = {
    // No props
}

export default Page404;
