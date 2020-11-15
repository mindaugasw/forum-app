import React from 'react';

export default class __Paginator extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        const {
            totalCount,             // Total items matching criteria
            currentItemCount,       // Actual items in this page
            numItemsPerPage,        // Requested items per page

            firstItemNumber,        // Id of first item in the page
            lastItemNumber,         // Id of last item in the page

            first,                  // First page number
            previous,               // Previous page number. !!! Not available on 1st page
            current,                // Current page number
            next,                   // Next page number. !!! Not available on last page
            last,                   // Last page number

            pageCount,              // Pages count, of items matching criteria
            pageRange,              // Pages count in this range

            firstPageInRange,       // First page number in this range
            lastPageInRange,        // Last page number in this range
            pagesInRange            // Array of page numbers for this range
        } = this.props;

        let rangeJsx = null;
        if (pagesInRange) {
            rangeJsx = pagesInRange.map(page => {
                return <li key={page}><a href='#'>Page {page}</a></li>;
            });
            rangeJsx.unshift(<li key={first+'-first'}><a href='#'>First ({first})</a></li>);
            rangeJsx.push(<li key={last+'-last'}><a href='#'>Last ({last})</a></li>);
        }

        return (
            <div>
                Page {current}/{last}, items {firstItemNumber}-{lastItemNumber} out of {totalCount}, {numItemsPerPage} items per page<br/>
                <ul>
                    {rangeJsx}
                </ul>
            </div>
        );
    }

}