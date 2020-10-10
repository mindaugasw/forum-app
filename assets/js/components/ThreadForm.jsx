import React from "react";
import PropTypes from 'prop-types';

export default class ThreadForm extends React.Component {
    constructor(props) {
        super(props);
        
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
    }
    
    handleFormSubmit(event) {
        event.preventDefault();
        const { onNewItemSubmit } = this.props;
        onNewItemSubmit(event.target.elements.namedItem('id').value, event.target.elements.namedItem('name').value);
    }
    
    render() {
        return (
            <form onSubmit={ this.handleFormSubmit }>
                ID: <input name='id' type='number'/>
                Name: <input name='name' type='text'/>
                <button type='submit'>Add</button>
            </form>
        );
    }
}

ThreadForm.propsType = {
    onNewItemSubmit: PropTypes.func.isRequired,
};