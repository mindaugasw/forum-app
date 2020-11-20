import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Card, Col, Container, Row} from "react-bootstrap";
import {Link} from "react-router-dom";
import UrlBuilder from "../../utils/UrlBuilder";
import {FontAwesomeIcon as FA} from "@fortawesome/react-fontawesome";
import {faChevronDown, faChevronUp} from "@fortawesome/free-solid-svg-icons";

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
                                {/*There was standing before the hookah out of her swim in a good deal: this remark, and read the way YOU must be executed for her, leaning her. There was standing before the hookah out of her swim in a good deal: this remark, and read the way YOU must be executed for her, leaning her.*/}
                            </Link>

                            {/* - CreatedAt, author -*/}
                            <div className='text-muted small' >Started {(new Date(t.createdAt)).timeAgo()} &nbsp;·&nbsp;{' '}
                                <Link to={UrlBuilder.Users.Single(t.author.id)} className='text-muted'>{t.author.username}</Link>
                            </div>
                        </Col>

                        {/* - Replies - */}
                        <Col sm={2} className={'d-none d-sm-block text-center m-auto'}>
                            {t.commentsCount}
                        </Col>

                        {/* TODO Voting needs vertical centering */}
                        {/* - Voting - */}
                        <Col xs={2} sm={1} className='' style={{margin: '-5px 0 -5px 0'}}>
                            <Col xs={12} className='lh-1 p-0 text-center bsg'>
                                <FA icon={faChevronUp} size={'lg'} className='color-upvote bsr' />
                            </Col>
                            <Col xs={12} className='lh-1 p-0 text-center bsg color-upvote' style={{fontWeight: 'bold'}}>
                                {t.votesCount}
                            </Col>
                            <Col xs={12} className='lh-1 p-0 text-center bsg'>
                                <FA icon={faChevronDown} size={'lg'} className='bsr' />
                            </Col>
                        </Col>
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
