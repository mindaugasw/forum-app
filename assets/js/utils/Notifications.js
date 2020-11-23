import React from "react";
import {FontAwesomeIcon as FA} from "@fortawesome/react-fontawesome";
import {
    faCheck,
    faExclamationCircle,
    faExclamationTriangle,
    faInfoCircle
} from "@fortawesome/free-solid-svg-icons";

class Notifications {
    static ReactComponent = null; // Is set inside <NotificationGenerator />

    /**
     * Add new notification. Possible options:
     * type,
     * headline,
     * message,
     * timeout,
     * id
     * @param {type<string>, headline<string>, message<object>, timeout<number>} options
     */
    static AddOptions(options) {
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
                        <h4 className='d-inline-block mr-2 mb-0'>{options.headline}</h4>
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
            timeout: options.timeout || options.timeout === 0 ? options.timeout : 5000,
        });
    }

    static Add(type, headline, message, timeout = 8000) {
        this.AddOptions({type, headline, message, timeout});
    }

    static UnhandledError(errorMessage) {
        const message =
            <>
                An unknown error occurred. Try <a href="" className='font-weight-bold'>refreshing</a> the page to fix the error.<br/><br/>
                More information about the error:<br/>
                <code>{JSON.stringify(errorMessage)}</code>
            </>;

        this.AddOptions({
            type: 'danger',
            headline: 'Error!',
            message,
            timeout: 0,
        });
    }
}

window.Notifications = Notifications;

export default Notifications;