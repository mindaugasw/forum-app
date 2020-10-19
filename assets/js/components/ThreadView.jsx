import React from 'react';


export default class ThreadView extends React.Component {
    constructor(props) {
        super(props);

    }


    render() {
        const {id, name} = this.props;
        return (
            <div>
                {id}: {name}
            </div>
        );
    }
}