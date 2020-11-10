import React from 'react';
import { connect } from 'react-redux';
import { addThread } from "../../redux/threads";

/*const mapDispatchtoProps = dispatch => {
    return {
        addThread: thread => dispatch(addThread(thread))
    };
}*/

const mapDispatchtoProps = {
    addThread
}

class ConnectedForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: ''
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({ [event.target.id]: event.target.value });
    }

    handleSubmit(event) {
        event.preventDefault();
        const { title } = this.state;
        this.props.addThread({ title });
        // this.setState({ title: "" });
    }

    render() {
        const { title } = this.state;
        return (
            <form onSubmit={this.handleSubmit}>
                <div>
                    MAH FORM<br/>
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={this.handleChange}
                    />
                </div>
                <button type="submit">Save</button>
            </form>
        );
    }
}

const ThreadFormRedux = connect(null, mapDispatchtoProps)(ConnectedForm);

export default ThreadFormRedux;