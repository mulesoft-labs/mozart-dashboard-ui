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
    }

    componentDidMount(){
        this.getData();
        setInterval(() => this.getData(), 10000);
    }

    getData(){
        console.log("Getting data");
        fetchAPIStatus().then((data) => {
            this.setState({ data });
        }).catch();
    }

    render(){
        return (
            <div className="menu">
                <div className="row">
                        <div className="service column"><h1>SERVICE</h1></div>
                        <div className="branch column"><h1>BRANCH</h1></div>
                        <div className="commit column"><h1>COMMIT</h1></div>
                        <div className="time column"><h1>TIME</h1></div>
                        <div className="status column"><h1>STATUS</h1></div>
                </div>

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
                        <div className="service column">{ service }</div>
                        <div className="branch column">{ info.git.branch }</div>
                        <div className="commit column">{ info.git.commit.id }</div>
                        <div className="time column">{ info.git.commit.time }</div>
                        <div className="status column">ACTIVE</div>
                    </div>);
        }
        return (<div className="row">
                    <div className="service column">{ service }</div>
                    <div className="error column">ERROR: { info }</div>
                    <div className="status column">INACTIVE</div>
                </div>);
    };
}

render(<App />, document.getElementById('root'));