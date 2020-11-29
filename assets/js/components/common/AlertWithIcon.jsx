import React from "react";
import {FontAwesomeIcon as FA} from "@fortawesome/react-fontawesome";
import {faCheck, faExclamationCircle, faExclamationTriangle, faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import {Alert} from "react-bootstrap";

// TODO replace all alerts with this
/**
 * Renders alert with appropriate icon included
 * @param props Same as Alert props
 * @returns {JSX.Element}
 */
function AlertWithIcon(props) {
    let icon;
    switch (props.variant) {
        case 'danger':
            icon = faExclamationTriangle;
            break;
        case 'success':
            icon = faCheck;
            break;
        case 'warning':
            icon = faExclamationCircle;
            break;
        case 'info':
        default:
            icon = faInfoCircle;
            break;
    }

    return (
        <Alert {...props}>
            <table>
                <thead></thead>
                <tbody>
                    <tr>
                        <td className='pr-2'>
                            <FA icon={icon} />
                        </td>
                        <td>
                            {props.children}
                        </td>
                    </tr>
                </tbody>
            </table>
        </Alert>
    );
}

export default AlertWithIcon;