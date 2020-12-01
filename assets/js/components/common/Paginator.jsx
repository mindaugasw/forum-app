import React, {Component} from 'react';
import PropTypes from "prop-types";
import {Link} from "react-router-dom";
import {Col, Collapse, Row} from "react-bootstrap";
import Utils from "../../utils/Utils";

/**
 * Page Link wrapper, to replace <Link> inside <Pagination.Item>, as they're incompatible.
 */
function PageLink(props) {
    const {text, url, active, disabled, onClick, borderRadius} = props;
    return (
        <li className={`page-item ${active ? 'active' : ''} ${disabled ? 'disabled' : ''} ${borderRadius ? 'last-pagination-item-md-up' : ''}`}>
            <Link to={url} onClick={onClick} className='page-link'>
                {text}
            </Link>
        </li>
    );
}
PageLink.propTypes = {
    text: PropTypes.node.isRequired,
    url: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    borderRadius: PropTypes.bool,
}

class Paginator extends Component {
    constructor(props) {
        super(props);

        this.toggleExtraControls = this.toggleExtraControls.bind(this);
        this.handleLinkClick = this.handleLinkClick.bind(this);

        this.state = {
            extraControlsOpen: false,
        }
    }

    toggleExtraControls(event) {
        event.preventDefault();
        this.setState(s => {
            return {
                extraControlsOpen: !s.extraControlsOpen
            };
        });
    }

    // Used by Per page, Sort by controls to manually redirect, as react-router.Link does not work with <select>
    handleLinkClick(event) {
        const t = event.target;
        const url = t.options[t.selectedIndex].value;
        Utils.Redirect(url);
        this.props.onClick();
    }

    render() {
        const p = this.props.pagination,
            lg = this.props.linkGenerator,
            oc = this.props.onClick,
            {perPage, orderBy} = this.props,
            open = this.state.extraControlsOpen;

        // --- Pagination links ---
        const first = <PageLink text='«' url={lg({page: p.first})} active={false} disabled={p.first === p.current} onClick={oc} />;
        const last = <PageLink text='»' url={lg({page: p.last})} active={false} disabled={p.last === p.current} onClick={oc} borderRadius={true} />;
        const prev = <PageLink text='‹' url={lg({page: p.previous || -1})} active={false} disabled={!('previous' in p)} onClick={oc} />;
        const next = <PageLink text='›' url={lg({page: p.next || -1})} active={false} disabled={!('next' in p)} onClick={oc} />;

        const pageRange = p.pagesInRange.map(page => {
            return <PageLink key={page} text={page} url={lg({page})} active={page === p.current} disabled={false} onClick={oc} />
        });

        // --- Expand button ---
        // Expands or collapses Per page and Sort by controls on xs-sm sizes
        const extraControlsExpandBtnJsx = orderBy !== false || perPage !== false ?
            <li className='page-item d-md-none'>
                <a
                    href='#'
                    className='page-link'
                    onClick={this.toggleExtraControls}
                >
                    <span style={{transform: `rotate(${open ? '-' : ''}90deg)`, display: 'block'}}>›</span>
                </a>
            </li>
            : null;


        function perPageJsx(linkClickCallback) {
            if (perPage !== false) {
                let perPageSelectedValue = -1;
                const perPageValues = perPage.map(x => {
                    const val = lg({page: 1, perpage: x});
                    if (x === p.numItemsPerPage)
                        perPageSelectedValue = val;
                    return {text: x, value: val};
                });

                return (
                    <div className='d-inline-block'>
                        Per page{' '}
                        <select
                            className='custom-select d-inline mr-2 mb-1'
                            style={{width: '62px', paddingLeft: '7px', paddingRight: '0px'}}
                            onChange={linkClickCallback}
                            defaultValue={perPageSelectedValue}
                        >
                            {perPageValues.map(x => {
                                return (
                                    <option
                                        key={x.text}
                                        value={x.value}
                                    >{x.text}</option>
                                );
                            })}
                        </select>
                    </div>
                );
            } else
                return null;
        }
        const perPageJsxResult = perPageJsx(this.handleLinkClick);

        function orderByJsx(linkClickCallback) {
            if (orderBy !== false) {
                let orderBySelectedValue = -1;
                const orderByValues = orderBy.map(x => {
                    const val = lg({page: 1, orderby: x.orderby, orderdir: x.orderdir});
                    if (x.selected === true)
                        orderBySelectedValue = val;
                    return {...x, value: val};
                });

                return (
                    <div className='d-inline-block'>
                        Sort by{' '}
                        <select
                            className='custom-select d-inline'
                            style={{width: '160px', paddingLeft: '7px', paddingRight: '0px'}}
                            onChange={linkClickCallback}
                            defaultValue={orderBySelectedValue}
                        >
                            {orderByValues.map(x => {
                                return (
                                    <option
                                        key={x.text}
                                        value={x.value}
                                    >{x.text}</option>
                                );
                            })}
                        </select>
                    </div>
                );
            } else
                return null;
        }
        const orderByJsxResult = orderByJsx(this.handleLinkClick);

        return (
            <div className='mx-15-md-down'>
                <Row className='justify-content-between'>
                    {/* --- Pagination --- */}
                    <Col xs='auto' className='pr-0'>
                        <nav aria-label="Page navigation example">
                            <ul className="pagination">
                                {first}
                                {prev}
                                {pageRange}
                                {next}
                                {last}
                                {extraControlsExpandBtnJsx}
                            </ul>
                        </nav>
                    </Col>

                    {/* --- Per page, sort by controls --- */}
                    {/* --- XS-SM --- */}
                    <Collapse in={open} className='w-100 d-md-none mx-15-md-down'>
                        <div id='pagination-collapse'>
                            {perPageJsxResult}
                            {orderByJsxResult}
                        </div>
                    </Collapse>

                    {/* --- MD-XL --- */}
                    <Col xs='auto' className='pl-0 d-none d-md-inline-block'>
                        {perPageJsxResult}
                        {orderByJsxResult}
                    </Col>
                </Row>
            </div>
        );
    }

    static get propTypes() {
        return {
            linkGenerator: PropTypes.func.isRequired, // Should be a function from parent component, accepting page number and returning target link
            onClick: PropTypes.func.isRequired, // Can be used to force update component on page navigation
            perPage: PropTypes.oneOfType([PropTypes.array, PropTypes.bool,]).isRequired, // Items for Per page control, e.g. [10, 20, ...]. If false, control won't be rendered
            orderBy: PropTypes.oneOfType([PropTypes.array, PropTypes.bool,]).isRequired, // Items for Sort by control, e.g. [{text<string>, orderby<string>, orderdir<string>, selected<bool>}, ...]. If false, control won't be rendered
            pagination: PropTypes.object.isRequired, /* pagination structure: {
                "totalCount": 100,      // Total items matching criteria
                "pageCount": 5,         // Total pages count of matching items
                "currentItemCount": 20, // Actual items in this page
                "numItemsPerPage": 20,  // Requested items per page

                "firstItemNumber": 1,   // Page start item id
                "lastItemNumber": 20,   // Page end item id

                // Page navigation:
                "first": 1,
                "previous": 1,          // Not available on 1st page
                "current": 2,
                "next": 3,              // Not available on last page
                "last": 5,

                // Page range:
                "pageRange": 5,         // Items count in this page range
                "firstPageInRange": 1,  // First page number in range
                "pagesInRange": [1, 2, 3, 4, 5],
                "lastPageInRange": 5,   // Last page number in range

                "startPage": 1,         // same as firstPageInRange (?)
                "endPage": 5            // same as lastPageInRange (?)
            }*/
        };
    }
}

export default Paginator;