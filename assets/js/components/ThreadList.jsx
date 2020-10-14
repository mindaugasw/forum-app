import React from "react";
// import { v4 as uuid } from 'uuid';
import ThreadListItem from "./ThreadListItem";
import ThreadForm from "./ThreadForm";
import { getThreadList } from "../Api/thread_api";


function countThreadsNumber(threads) {
    return threads.length;
}

export default class ThreadList extends React.Component {
    constructor(props) {
        super(props);
        

        
        this.state = {
            redRowId: null,
            threads: [
                // { uuid: uuid(), id: 1, name: 'Alice. \'I\'M not wish.' },
                // { uuid: uuid(), id: 2, name: 'Alice folded her great hurry; \'and that green leaves. As.' },
                // { uuid: uuid(), id: 3, name: 'The Rabbit angrily. \'It was sitting.' },
            ]
        }
        
        this.handleRowClick = this.handleRowClick.bind(this);
        this.handleNewItemAdd = this.handleNewItemAdd.bind(this);
        this.handleDeleteItem = this.handleDeleteItem.bind(this);
    }

    componentDidMount() {
        getThreadList()
            .then((data) =>
                this.setState({threads: data.items})
            );
    }

    handleRowClick(id) {
        this.setState({
            redRowId: id
        });
    }

    handleNewItemAdd(id, title) {
        const newId = isNaN(id) ? Math.random() : id;

        const newThread = {
            id: newId,
            title: title
        };
        
        this.setState(prevState => {
            return {
                threads: [...prevState.threads, newThread]
            };
        });
    }
    
    handleDeleteItem(id) {
        this.setState(prevState => {
           return {
               threads: prevState.threads.filter(t => t.id !== id)
           };
        });
    }
    
    render() {
        const { redRowId } = this.state;
        
        const threadsJsx = this.state.threads.map((item) => {
           return (
               <ThreadListItem key={item.id}
                   {...item}
                   isRed={redRowId === item.id}
                   onRowClick={this.handleRowClick}
                   onDeleteItem={this.handleDeleteItem}
               />
           );
        });
        
        return (
        <div>
            <ThreadForm onNewItemAdd={this.handleNewItemAdd} />
            <b>Threads list</b><br/>
            Total items: {countThreadsNumber(this.state.threads)}
            {threadsJsx}
        </div>
        );
    }
}