import React from 'react';
import PropTypes from 'prop-types';

export default class ThreadListItem extends React.Component {
    render() {
        const { id, name, isRed, onRowClick } = this.props;
        
        return (
            <div 
                className={ isRed ? 'activeRow' : '' }
                onClick={() => onRowClick(id)}
            >
                Thread #{id}: {name}
            </div>);
    }
}

ThreadListItem.propTypes = {
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    isRed: PropTypes.bool.isRequired,
    onRowClick: PropTypes.func.isRequired
}