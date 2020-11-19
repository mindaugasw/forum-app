import React, {Component} from 'react';
import PropTypes from "prop-types";
import {Link} from "react-router-dom";

class Paginator extends Component {
    getLink(page, text = null, key = null) {
        if (!key)
            return (
                <Link to={this.props.linkGenerator(page)}
                      onClick={this.props.onClick}>
                    {text !== null ? text : page}
                </Link>
            );
        else
            return (
                <Link key={key}
                      to={this.props.linkGenerator(page)}
                      onClick={this.props.onClick}>
                    {text !== null ? text : page}
                </Link>
            );
    }

    render() {
        const p = this.props.pagination;

        const pageRange = p.pagesInRange.map(page => {
            let link = this.getLink(page, page, page);
            if (page === p.current)
                return <b key={page}><i>{link}</i></b>;
            return link;
        }).reduce((prev, curr) => [prev, ' ', curr]);

        const first = p.first === p.current ? '' : this.getLink(p.first, 'First');
        const last = p.last === p.current ? '' : this.getLink(p.last, 'Last');

        return (
            // TODO hide pagination if there's no elements
            <div>
                Pagination:
                {first}{' '}
                {pageRange}{' '}
                {last}
            </div>
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