import React, {Component} from "react";
import { Alert, AlertContainer } from "react-bs-notifier";
import Notifications from "../utils/Notifications";

class NotificationGenerator extends Component {
    constructor(props) {
        super(props);

        this.state = {
            alerts: [],
        };

        this.addNew = this.addNew.bind(this);

        Notifications.ReactComponent = this;
    }

    /*componentDidMount() {
        Notifications.AddCustomStyle({type: 'success', headline: 'Whoa, success!', message: 'This is a test', timeout: 0});
        Notifications.AddCustomStyle({type: 'info', headline: 'Whoa, success!', message: 'This is a test', timeout: 0});
        Notifications.AddCustomStyle({type: 'warning', headline: 'Whoa, success!', message: 'This is a test d-inline-block mr-2 mb-0 d-inline-block mr-2 mb-0 d-inline-block mr-2 mb-0 d-inline-block mr-2 mb-0 d-inline-block mr-2 mb-0 d-inline-block mr-2 mb-0', timeout: 0});
        Notifications.AddCustomStyle({type: 'danger', headline: 'Whoa, success!', message: 'This is a test', timeout: 0});

        // Notifications.AddRegularRandom(0);
        // Notifications.AddRegularRandom(0);
        Notifications.AddRandom(0);
        Notifications.AddRandom(0);
    }*/

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
            console.log(a);
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

export default NotificationGenerator;