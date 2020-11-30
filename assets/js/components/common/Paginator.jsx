import React, {Component} from 'react';
import PropTypes from "prop-types";
import {Link} from "react-router-dom";
import {Pagination} from "react-bootstrap";

/**
 * Page Link wrapper, to replace <Link> inside <Pagination.Item>, as they're incompatible.
 */
function PageLink(props) {
    const {text, url, active, disabled, onClick} = props;
    return (
        <li className={`page-item ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`}>
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
}

class Paginator extends Component {
    render() {
        const p = this.props.pagination,
            lg = this.props.linkGenerator,
            oc = this.props.onClick;

        const first = <PageLink text='«' url={lg(p.first)} active={false} disabled={p.first === p.current} onClick={oc} />;
        const last = <PageLink text='»' url={lg(p.last)} active={false} disabled={p.last === p.current} onClick={oc} />;
        const prev = <PageLink text='‹' url={lg(p.previous || -1)} active={false} disabled={!('previous' in p)} onClick={oc} />;
        const next = <PageLink text='›' url={lg(p.next || -1)} active={false} disabled={!('next' in p)} onClick={oc} />;

        const pageRange = p.pagesInRange.map(page => {
            return <PageLink key={page} text={page} url={lg(page)} active={page === p.current} disabled={false} onClick={oc} />
        });

        return (
            <nav aria-label="Page navigation example">
                <ul className="pagination">
                    {first}
                    {prev}
                    {pageRange}
                    {next}
                    {last}
                </ul>
            </nav>
        );
    }

    static get propTypes() {
        return {
            linkGenerator: PropTypes.func.isRequired, // Should be a function from parent component, accepting page number and returning target link
            onClick: PropTypes.func.isRequired, // Can be used to force update component on page navigation
            pagination: PropTypes.object.isRequired, /*{
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