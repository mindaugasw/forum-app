import React, {Component} from "react";
import { Alert, AlertContainer } from "react-bs-notifier";
import Notifications from "../../utils/Notifications";

/**
 * This needs to be rendered for notifications to work. Preferably in a top-level component.
 * Use Notifications class to add notifications.
 */
class NotificationRenderer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            alerts: [],
        };

        this.addNew = this.addNew.bind(this);

        Notifications.ReactComponent = this;
    }

    addNew(alertObj) {
        this.setState(state => {
            return {
                alerts: [
                    ...state.alerts,
                    alertObj
                ]
            };
        });
    }

    onDismiss(id) {
        const filteredAlerts = this.state.alerts.filter(a => a.id !== id);
        this.setState({alerts: filteredAlerts});
    }

    render() {
        const alertsList = this.state.alerts.map(a => {
            return <Alert
                key={a.id}
                type={a.type}
                onDismiss={() => this.onDismiss(a.id)}
                headline={a.headline}
                timeout={a.timeout}
                dismissTitle=''
                showIcon={false}
            >   {/* showIcon broken, not showing icons */}
                {a.message}
            </Alert>;
        });

        return (
            <AlertContainer position='top-right'>
                {alertsList}
            </AlertContainer>
        );
    }
}
NotificationRenderer.propTypes = {
    // No props
}

export default NotificationRenderer;