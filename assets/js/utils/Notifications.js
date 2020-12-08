import React from "react";
import {FontAwesomeIcon as FA} from "@fortawesome/react-fontawesome";
import {
    faCheck,
    faExclamationCircle,
    faExclamationTriangle,
    faInfoCircle
} from "@fortawesome/free-solid-svg-icons";
import {Link} from "react-router-dom";
import UrlBuilder from "./UrlBuilder";

class Notifications {
    static ReactComponent = null; // Is set inside <NotificationRenderer />

    /**
     * Add new notification. Possible options:
     * type,
     * headline,
     * message,
     * timeout,
     * id
     * @param {type<string>, headline<string>, message<object>, timeout<number>, id<string|number>} options
     */
    static Add(options) {
        const icons = {
            success: faCheck,
            danger: faExclamationTriangle,
            info: faInfoCircle,
            warning: faExclamationCircle,
        };

        const body =
            <table className='notification-content'>
                <tbody>
                <tr>
                    <td rowSpan={2}>
                        <FA icon={icons[options.type]} size='2x' className='mr-2' />
                    </td>
                    <td>
                        <h4 className='d-inline-block mr-2 mb-0' style={{overflowWrap: 'anywhere'}}>
                            {options.headline}
                        </h4>
                    </td>
                </tr>
                <tr>
                    <td className='lh-1'>
                        {options.message}
                    </td>
                </tr>
                </tbody>
            </table>;

        this.ReactComponent.addNew({
            id: options.id || Math.random(),
            type: options.type || 'info',
            headline: null,
            message: body,
            timeout: options.timeout || options.timeout === 0 ? options.timeout : 7000,
        });
    }

    /**
     * Shortcut for new success notification
     * @param {string} headline
     * @param {string|null} message
     */
    static Success(headline, message = null) {
        this.Add({type:'success', headline, message});
    }

    /**
     * Shortcut for notification informing about unhandled error. Optionally
     * can also include additional debug info.
     * @param args Optional additional info about the error
     */
    static UnhandledError(...args) {
        const errorDetails = args.map((element, index) => {
            return (
                <code key={index} className='d-block mb-2' style={{overflowWrap: 'anywhere'}}>
                    {JSON.stringify(element)}
                </code>
            );
        });


        const message =
            <>
                An unknown error occurred. Try <a href="" className='font-weight-bold'>refreshing</a> the page to fix the error.

                {args.length !== 0 ?
                    <>
                        <br/><br/>
                        More information about the error:<br/>
                        {errorDetails}
                    </>
                : null }
            </>;

        this.Add({
            type: 'danger',
            headline: 'Error!',
            message,
            timeout: 0,
        });
    }

    /**
     * Shortcut for notification informing that user must be logged in. Provides links to log in and register.
     * Ensures that only one such notification is displayed at a time, no matter how many times called.
     */
    static Unauthenticated() {
        const message =
            <>
                <Link to={UrlBuilder.Login()}>Log in</Link> or <Link to={UrlBuilder.Register()}>Register</Link>.
            </>;

        this.Add({
            type: 'danger',
            headline: 'You must be logged in to do that!',
            message,
            timeout: 5000,
            id: 'unauthenticated-notification' // Same id for all notifications to keep only one notification of this type
        });
    }

    /**
     * Shortcut for notification informing that user is unauthorized to perform attempted action.
     */
    static Unauthorized() {
        this.Add({
            type: 'danger',
            headline: 'You do not have permission to do that!',
            message: null,
        });
    }
}

export default Notifications;