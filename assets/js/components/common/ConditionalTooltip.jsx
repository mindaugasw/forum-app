import React from "react";
import PropTypes from 'prop-types'
import {OverlayTrigger, Tooltip} from "react-bootstrap";

/**
 * Tooltip wrapper, providing easier conditional tooltip showing (only need to toggle show prop).
 * Also makes it easier to show tooltip on disabled elements (set pointerEventsNone prop to true).
 */
function ConditionalTooltip(props) {
    const show = props.show ? {} : {show: false};
    const styleProp = props.pointerEventsNone && props.show ? {style: {pointerEvents: 'none'}} : {};
    const wrapperPropsFinal = props.wrapperProps ? props.wrapperProps : {className: 'd-inline-block'};

    return (
        <OverlayTrigger
            placement={props.placement}
            overlay={<Tooltip id={props.tooltipId}>
                {props.tooltip}
            </Tooltip>}
            // show={null}
            {...show}
        >
            <div {...wrapperPropsFinal}> {/* Additional div sometimes needed for tooltips on disabled buttons */}
                {React.cloneElement(props.children, styleProp)}
            </div>
        </OverlayTrigger>
    );
}
ConditionalTooltip.propTypes = {
    placement: PropTypes.oneOf(['top', 'right', 'bottom', 'left']).isRequired,
    tooltip: PropTypes.any.isRequired, // Tooltip content
    tooltipId: PropTypes.oneOfType([PropTypes.string, PropTypes.number,]).isRequired,

    show: PropTypes.bool, // should the tooltip be displayed?
    pointerEventsNone: PropTypes.bool, // If true, will add to the topmost child, when tooltip should be shown: style={{pointerEvents: 'none'}}. Needed on disabled buttons.
    wrapperProps: PropTypes.object, // Props for div wrapper around children content
}

export default ConditionalTooltip;

export const msg_MustBeLoggedIn = 'You must be logged in to do that.';
export const msg_NotImplemented = 'Not implemented yet. Coming soon!';
