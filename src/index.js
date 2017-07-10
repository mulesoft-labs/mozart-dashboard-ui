import React from 'react';
import { fetchAPIStatus, Sources } from './utilities';
import { render } from 'react-dom';
import { assign } from 'lodash/assign';
import "./styles.css";
import Icon from '@mulesoft/anypoint-icons/lib/Icon';
import '@mulesoft/anypoint-styles/anypoint-styles.css';

const App = () => (
    <div>
        <StatusList/>
    </div>
);

class StatusList extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = { 
            data: {}
         }
    }

    componentDidMount() {
        this.getData();
        setInterval(() => this.getData(), 10000);
        this.setState({
            data: {}
        })
    }

    getData() {
        console.log("Getting data...");
        //this.fetchEnvironmentData(Sources.DEVX);
        this.fetchEnvironmentData(Sources.QAX);
        this.fetchEnvironmentData(Sources.STGX);
    }

    fetchEnvironmentData(props){
        fetchAPIStatus(props.url).then((fetchedData) => {
            console.log("Got " + props.name);
            const mappedData = fetchedData.reduce((acc, val) => {
                const stringToSkipFrom = "://";
                const startOfName = val.service.indexOf(stringToSkipFrom) + stringToSkipFrom.length;
                const endOfName = val.service.indexOf(".");
                const res = val.service.substring(startOfName, endOfName);

                acc[res] = {};
                acc[res][props.name] = val;
                return acc;
            }, {});
            this.extendData(mappedData);
        }).catch();
    }
    
    extendData(props){
        let data = { ...this.state.data };
        // TODO: change this to a reduce
        Object.keys(props).forEach(function(key) {
            data = { ...data, [key]: { ...data[key], ...props[key] }}
        });

        console.log("Extended data");
        this.setState({ data })
    }

    render() {
        console.log("Renders");
        if (this.state.data != null) {
            // TODO: change this to a reduce
            var rows = [];
            Object.keys(this.state.data).forEach((key) => {
                rows.push(<ServiceRow key={key} data={this.state.data[key]} name={key}/>);
            });

            return (
                <div className="menu">
                    <div className="row">
                        <div className="title service-header"><h1>Service</h1></div>
                        <div className="title environment-header"><h1>DEVx</h1></div>
                        <div className="title environment-header"><h1>QAx</h1></div>
                        <div className="title environment-header"><h1>STGx</h1></div>
                    </div>
                    { rows }
                </div>
            );
        }
        return (<div>Empty matrix</div>)
        
    }
}

class ServiceRow extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = { data: this.props.data, name: this.props.name}
    }

    render() {
        const { data } = this.props;

        const keys = Object.keys(data)
        if (!keys.length) { return <div>EMPTY</div>; }

        // TODO: what if didnt fetch particular environment? shouldnt be UP nor DOWN
        return (<div className="row">
                    <div className="service-name"> { this.state.name } </div>
                        { (data[Sources.DEVX.name] && !data[Sources.DEVX.name].info.git) ?
                                <div className="status down" key={ Sources.DEVX.name }>
                                    <div className="icon">
                                        <Icon name="close" size="m"/>
                                        </div>
                                    </div> :

                                        (data[Sources.DEVX.name]) ? 
                                            <div className="status up" key={ Sources.DEVX.name }>
                                                <div className="icon">
                                                    <Icon name="check" size="m"/>
                                                    </div>
                                                </div> :
                                            <div className="status unknown" key={ Sources.DEVX.name }>
                                                <div className="icon">
                                                    <Icon name="support-small" size="m"/>
                                                    </div>
                                                </div> 
                                                
                                                 }
                        { (data[Sources.QAX.name] && !data[Sources.QAX.name].info.git) ?
                                <div className="status down" key={ Sources.QAX.name }>
                                    <div className="icon">
                                        <Icon name="close" size="m"/>
                                        </div>
                                    </div> :
                                <div className="status up" key={ Sources.QAX.name }>
                                    <div className="icon">
                                        <Icon name="check" size="m"/>
                                        </div>
                                    </div> }
                        { (data[Sources.STGX.name] && !data[Sources.STGX.name].info.git) ?
                                <div className="status down" key={ Sources.STGX.name }>
                                    <div className="icon">
                                        <Icon name="close" size="m"/>
                                        </div>
                                    </div> :
                                <div className="status up" key={ Sources.STGX.name }>
                                    <div className="icon">
                                        <Icon name="check" size="m"/>
                                        </div>
                                    </div> }
                </div>);
        
    };
}

render(<App />, document.getElementById('root'));