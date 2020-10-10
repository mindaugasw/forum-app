import React from "react";
import ThreadListItem from "./ThreadListItem";
import ThreadForm from "./ThreadForm";

function countThreadsNumber(threads) {
    return threads.length;
}

export default class ThreadList extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            redRowId: null,
            threads: [
                { id: 1, name: 'Alice. \'I\'M not wish.' },
                { id: 2, name: 'Alice folded her great hurry; \'and that green leaves. As.' },
                { id: 3, name: 'The Rabbit angrily. \'It was sitting.' },
            ]
        }
        
        this.handleRowClick = this.handleRowClick.bind(this);
        this.handleNewItemSubmit = this.handleNewItemSubmit.bind(this);
    }

    handleRowClick(id) {
        this.setState({
            redRowId: id
        });
    }

    handleNewItemSubmit(id, name) {
        console.log(id + ' - ' + name);
    }
    
    render() {
        const { redRowId } = this.state;
        
        const threadsJsx = this.state.threads.map((item) => {
           return (
               <ThreadListItem key={item.id}
                   {...item}
                   // id={item.id}
                   // name={item.name}
                   isRed={redRowId === item.id}
                   onRowClick={this.handleRowClick}
               />
           );
        });
        
        return <div>
            {threadsJsx}
            Total threads {countThreadsNumber(this.state.threads)}
            <ThreadForm onNewItemSubmit={this.handleNewItemSubmit} />
        </div>;
    }
}