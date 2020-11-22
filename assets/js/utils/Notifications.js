import React from "react";
import {FontAwesomeIcon as FA} from "@fortawesome/react-fontawesome";
import {
    faCheck,
    faExclamationCircle,
    faExclamationTriangle,
    faInfoCircle
} from "@fortawesome/free-solid-svg-icons";

class Notifications {
    static ReactComponent = null; // Set inside React component

    /**
     * Add new notification. Possible options:
     * type: success | warning | danger | info
     * headline,
     * message
     * timeout, in ms, 0 for no timeout
     * @param options
     */
    static AddCustomStyle(options) {
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

    /*static AddRegularRandom(timeout = 5000) {
        const types = ['success', 'warning', 'danger', 'info'];
        this.AddNew({
            type: types.randomItem(),
            timeout,
            headline: 'Whoa, success!',
            // message: 'This is a test of the Emergency Broadcast System. This is only a test.',
            message: 'This is a test.',
        });
    }

    static AddRandom(timeout = 5000) {
        // const headline = <span className='d-inline-block mr-3'><FA icon={faCheck} size='2x' /> Whoa, success!</span>;
        // const headline = null;
        const headline = 'Whoa, success!';

        const message = <>This is a test</>;
        /!*const body =
            <div>
                <div className='d-inline-block h-100'>
                    <FA icon={faCheck} size='2x' />
                </div>
                <h4 className='d-inline-block mr-3'>{headline}</h4>
                <div>{message}</div>
            </div>;*!/

        const body =
            <table className='notification-content'>
                <tr>
                    <td rowSpan={2}>
                        <FA icon={faCheck} size='2x' className='mr-2' />
                    </td>
                    <td>
                        <h4 className='d-inline-block mr-2 mb-0'>{headline}</h4>
                    </td>
                </tr>
                <tr>
                    <td className='lh-1'>
                        {message}
                    </td>
                </tr>
                {/!*<div className='d-inline-block h-100'>

                </div>

                <div></div>*!/}
            </table>;




        const types = ['success', 'warning', 'danger', 'info'];
        this.AddNew({
            type: types.randomItem(),
            timeout,
            // headline: 'Whoa, success!',
            // headline,
            headline: null,
            // message: 'This is a test of the Emergency Broadcast System. This is only a test.'
            message : body,
            // message,
        });
    }




    /!**
     * Add new notification. Possible options:
     * type: success | warning | danger | info
     * headline,
     * message
     * timeout, in ms, 0 for no timeout
     * @param options
     *!/
    static AddNew(options) {

        this.ReactComponent.addNew({
            id: options.id || Math.random(),
            type: options.type || 'info',
            // headline: options.headline || 'Notification',
            headline: options.headline,
            message: options.message || 'Notification content',
            timeout: options.timeout || options.timeout === 0 ? options.timeout : 5000,
        });
    }*/
}

// window.Notifications = Notifications;

export default Notifications;