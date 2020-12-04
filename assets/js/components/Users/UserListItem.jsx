import React from "react";
import PropTypes from "prop-types";
import {Badge, Card, Col, Container, Image, Row} from "react-bootstrap";
import {FontAwesomeIcon as FA} from "@fortawesome/react-fontawesome";
import {faEye} from "@fortawesome/free-solid-svg-icons";
import {Link} from "react-router-dom";
import UrlBuilder from "../../utils/UrlBuilder";
import Utils from "../../utils/Utils";

function UserListItem(props) {
    const u = props.user;

    return (
        <>
            <Card.Body className='py-2'>
                <Container fluid className='p-0'>
                    <Row className='no-gutters py-1'>
                        <Col>
                            <Link to={UrlBuilder.Users.Single(u.id)}>
                                <Image
                                    className='avatar-image-small'
                                    src={UrlBuilder.RoboHash(u.username, 2, 100)}
                                    roundedCircle />
                                <span className='ml-2'>{u.username}</span>
                                {Utils.Roles.IsUserAdmin(u) ? <Badge.Admin /> : null}
                            </Link>

                            {APP_ENV === 'dev' ?
                                <span className='text-muted small'>&nbsp;·&nbsp; #{u.id}</span>
                            : null }
                        </Col>

                        <Col xs={2} className='text-center'>
                            <Link to={UrlBuilder.Users.Single(u.id)}>
                                <FA icon={faEye} className='mr-1'/>View
                            </Link>
                        </Col>
                    </Row>
                </Container>

            </Card.Body>
            <hr className='m-0'/>
        </>
    );
}
UserListItem.propTypes = {
    user: PropTypes.object.isRequired,
}

export default UserListItem;