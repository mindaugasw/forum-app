import React from 'react';
import PropTypes from 'prop-types';

export default class __ThreadListItem extends React.Component {
    render() {
        const { id, title, isRed, onRowClick, onDeleteItem } = this.props;
        
        const handleDeleteClick = function (event, threadId) {
            event.preventDefault();
            onDeleteItem(threadId);
        }
        
        return (
            <div 
                className={ isRed ? 'activeRow' : '' }
                onClick={() => onRowClick(id)}
            >
                Thread #{id}: {title+' '}
                {/*<a href='#' onClick={(event) => handleDeleteClick(event, id)}>
                    <span className='fa fa-trash'/>
                </a>*/}
            </div>);
    }
    
    static get propTypes() {
        return {
            id: PropTypes.number.isRequired,
            title: PropTypes.string.isRequired,
            isRed: PropTypes.bool.isRequired,
            onRowClick: PropTypes.func.isRequired,
            onDeleteItem: PropTypes.func.isRequired,
        };
    }
}
