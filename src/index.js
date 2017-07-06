import React from 'react';
import fetchAPIStatus from './utilities';
import { render } from 'react-dom';
import "./styles.css";

const App = () => (
    <div>
        <StatusList/>
    </div>
);

class StatusList extends React.PureComponent{
    constructor(props){
        super(props);
        this.state = { name: this.props.name, data: [] }
        this.getData();
    }

    getData(){
        fetchAPIStatus().then((data) => {
            this.setState({ data });
        }).catch();
    }

    render(){
        return (
            <div className="menu">
                { this.state.data.map((item, idx) => <StatusItem key={idx} service={item.service} info={item.info}/> )}
            </div>
        );
    }
}

class StatusItem extends React.PureComponent{
    constructor(props){
        super(props);
        this.state = { service: this.props.service, info: this.props.info }
    }

    render() {
        const { info } = this.props;
        const { service } = this.props;

        if (info.git && info.git.commit) {
            return (<div className="row">
                        <div>{ service }</div>
                        <div>{ info.git.branch }</div>
                        <div>{ info.git.commit.id }</div>
                        <div>{ info.git.commit.time }</div>
                        <div>ACTIVE</div>
                    </div>);
        }
        return (<div className="row">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div>{ info }</div>
                </div>);
    };
}

render(<App />, document.getElementById('root'));