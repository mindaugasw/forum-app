import React, {Component} from "react";
import PostFrame from "./PostFrame";

function validateTitle(state) {
    const s = state;
    let rest = {
        title: false, // Error message for field
        titleValid: false
    }
}


class PostFrame_Thread {

}

class PostFrame_Comment {

}

export class PostFrame_Thread_Create extends Component {
    constructor(props) {
        super(props);

        this.handleFormChange = this.handleFormChange.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);

        this.state = {
            formLoading: false,
        }
    }

    handleFormChange(event, state) {
        console.log('z1 change');
    }

    handleFormSubmit(event, state) {
        console.log('z2 submit');
        this.setState({
            formLoading: true,
        });
    }


    render() {
        return (
            <PostFrame
                post={null}
                isThread={true}
                formMode={true}
                formLoading={this.state.formLoading}
                onChange={this.handleFormChange}
                onSubmit={this.handleFormSubmit}
            />
        );
    }
}

class PostFrame_Comment_Create {

}