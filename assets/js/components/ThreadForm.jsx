import React from "react";
import PropTypes from 'prop-types';

export default class ThreadForm extends React.Component {
    constructor(props) {
        super(props);
        
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
    }
    
    handleFormSubmit(event) {
        event.preventDefault();
        
        const idInput = event.target.elements.namedItem('id');
        const titleInput = event.target.elements.namedItem('title');
        
        this.props.onNewItemAdd(
            parseInt(idInput.value, 10),
            titleInput.value
        );
        
        // idInput.value = '';
        // titleInput.value = '';
    }
    
    render() {
        return (
            <form onSubmit={ this.handleFormSubmit }>
                ID: <input name='id' type='number' />
                title: <input name='title' type='text' />
                <button type='submit'>Add</button>
            </form>
        );
    }
    
    static get propTypes() {
        return {
            onNewItemAdd: PropTypes.func.isRequired
        };
    }
}
