import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Card, Col, Container, Row} from "react-bootstrap";
import {Link} from "react-router-dom";
import UrlBuilder from "../../utils/UrlBuilder";
import NewVoting from "../__old/NewVoting";
import VotingGeneral from "./VotingGeneral";

// TODO make functional component?
class ThreadListItem extends Component {
    render() {
        const t = this.props.thread;
        return (
            <>
            <Card.Body className='py-2'>
                <Container fluid className='p-0'>
                    <Row className='no-gutters'>
                        <Col>

                            {/* - Thread title - */}
                            <Link to={UrlBuilder.Threads.Single(t.id)} style={{
                                overflow: 'hidden',         // Ellipsis overflow on 2nd line
                                textOverflow: 'ellipsis',   // https://stackoverflow.com/a/13924997/4110469
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                            }} >
                                {t.title}
                            </Link>

                            {/* - CreatedAt, author -*/}
                            <div className='text-muted small' >Started {(new Date(t.createdAt)).timeAgo()} &nbsp;·&nbsp;{' '}
                                <Link to={UrlBuilder.Users.Single(t.author.id)} className='text-muted'>{t.author.username}</Link>
                                {APP_ENV === 'dev' ? <> &nbsp;·&nbsp; #{t.id}</> : ''}
                            </div>
                        </Col>

                        {/* - Replies - */}
                        <Col sm={2} className={'d-none d-sm-block text-center m-auto'}>
                            {t.commentsCount}
                        </Col>

                        <VotingGeneral post={t} isThread={true} isVertical={true} />

                    </Row>
                </Container>
            </Card.Body>
            <hr className='m-0'/>
            </>
        );
    }
}

ThreadListItem.propTypes = {
    thread: PropTypes.object.isRequired,
};

export default ThreadListItem;
