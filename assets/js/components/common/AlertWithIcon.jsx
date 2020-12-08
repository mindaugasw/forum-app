import React from "react";
import {FontAwesomeIcon as FA} from "@fortawesome/react-fontawesome";
import {faCheck, faExclamationCircle, faExclamationTriangle, faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import {Alert} from "react-bootstrap";

/**
 * Renders alert with appropriate icon included
 * @param props All props will be passed to inner <Alert/> element
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
AlertWithIcon.propTypes = {
    // Props same as <Alert/>
    // All props will be passed to the inner <Alert/>
}

export default AlertWithIcon;