import React, {Component} from "react";
import PostFrame from "./PostFrame";
import FormUtils from "../../utils/FormUtils";
import {LOG_IN_MANUAL} from "../../redux/auth";
import Notifications from "../../utils/Notifications";
import UrlBuilder from "../../utils/UrlBuilder";
import {connect} from "react-redux";
import {createThread} from "../../redux/postsCRUD";

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

class PostFrame_Thread_Create_connected extends Component {
    constructor(props) {
        super(props);

        this.handleThreadCreateChange = this.handleThreadCreateChange.bind(this);
        this.handleThreadCreateSubmit = this.handleThreadCreateSubmit.bind(this);

        this.state = {
            formLoading: false,
        }
    }

    handleThreadCreateChange(event, state) {
        const target = event.target;

        const updatedState = { // Manual state update, as passed state is late by 1 onChange event
            ...state,
            [target.id]: target.value
        };

        // Validate only edited field (to not show errors on still untouched fields)
        let validationData = null;
        if (target.id === 'title')
            // validationData = {...this.validateFieldNotEmpty(updatedState, 'username')};
            validationData = {...FormUtils.ValidateTextField(target.value, 'title', {minLength: 10, maxLength: 255})};

        if (target.id === 'content')
            // validationData = {...this.validateFieldNotEmpty(updatedState, 'password')};
            validationData = {...FormUtils.ValidateTextField(target.value, 'content', {minLength: 1, maxLength: 30000})};

        // Join all validation data to check full form validity
        validationData = mergeDeep(state.validation, validationData);

        validationData.valid = validationData.titleValid && validationData.contentValid;

        return {
            validation: {
                ...validationData
            }
        };
    }

    handleThreadCreateSubmit(event, state) {
        if (!state.validation.valid) {
            console.error('Tried submitting invalid form');
            return;
        }

        this.setState({formLoading: true});
        let response = this.props.createThread({title: state.post.title, content: state.post.content});

        return response.then(action => {
            this.setState({formLoading: false});

            if (action.type.endsWith(REJECTED)) {
                const p = action.payload;
                const e = p.error;
                if (e && e.status === 400) {
                    return {
                        validation: {
                            alert: {
                                show: true,
                                type: 'danger',
                                message: 'Could not complete the request. There were following errors: '+e.message,
                            }
                        }
                    };
                }

                console.error('Unknown error in thread create form', action);
                Notifications.UnhandledError('Form error in PostFrame_Thread_Create', action);
                return;

            } else {
                console.log('Thread created successfully');
                // redirect(UrlBuilder.Home());
                redirect(UrlBuilder.Threads.Single(action.payload.id));
                Notifications.Add('success', 'New topic created', '');
                return;
            }
        });
    }


    render() {
        return (
            <PostFrame
                post={null}
                isThread={true}
                formMode={true}
                formLoading={this.state.formLoading}
                onChange={this.handleThreadCreateChange}
                onSubmit={this.handleThreadCreateSubmit}
            />
        );
    }
}

class PostFrame_Comment_Create {

}

export const PostFrame_Thread_Create = connect(null, {createThread})(PostFrame_Thread_Create_connected);