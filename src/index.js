import React from 'react';
import { fetchAPIStatus, Sources, Status, deepCompare, humanizeTime } from './utilities';
import { render } from 'react-dom';
import * as _ from 'lodash';
import moment from 'moment/src/moment'
import { Line } from 'rc-progress';
import "./styles.css";
import Icon from '@mulesoft/anypoint-icons/lib/Icon';
import '@mulesoft/anypoint-styles/anypoint-styles.css';

const Interval = 5000;

const App = () => (
    <div>
        <StatusList/>
    </div>
);

const timeout = (name) => new Promise(resolve => setTimeout(() => resolve({ env: name, success: false, data: null }), Interval + 1000))

class StatusList extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = { 
            data: {},
            progress: 0
        }
    }

    componentDidMount() {
        this.getData();
        setInterval(() => this.getData(), Interval);
        setInterval(() => this.updateProgress(), 10);

        let data = {};

        try { data = JSON.parse(localStorage.getItem('data')) } catch(e) {}
        this.setState({ data })
    }

    updateProgress(){
        const progress = this.state.progress + 100 / (Interval / 10)
        this.setState({ progress })
    }

    getData() {
        console.log("Getting data...");
        let data = { ...this.state.data };
        this.fetchEnvironmentData(Sources.DEVX);
        this.fetchEnvironmentData(Sources.QAX);
        this.fetchEnvironmentData(Sources.STGX);
        this.fetchEnvironmentData(Sources.PROD);
        this.setState({ progress: 0 });
    }

    fetchEnvironmentData(props){

        const status = fetchAPIStatus(props.url).then(data => ({ env: props.name, success: true, data })).catch();
        Promise.race([
            status,
            timeout(props.name)
            
        ]).then((fetchedData) => {
            var mappedData = {};
            if (!fetchedData.success){
                Object.keys(this.state.data).forEach(function(key) {
                    mappedData[key] = {}
                    mappedData[key][fetchedData.env] = {}
                });
            } else {
                console.log("Got " + props.name);
                mappedData = fetchedData.data.reduce((acc, val) => {
                    const stringToSkipFrom = "://";
                    const startOfName = val.service.indexOf(stringToSkipFrom) + stringToSkipFrom.length;
                    const endOfName = val.service.indexOf(".");
                    const res = val.service.substring(startOfName, endOfName);

                    acc[res] = {};
                    acc[res][props.name] = val;
                    return acc;
                }, {});
            }
            this.extendData(mappedData);
        })
    }
    
    extendData(props){
        let data = { ...this.state.data };
        var timeStamp = Math.floor(Date.now() / 1000);

        // TODO: change this to a reduce
        Object.keys(props).forEach(function(key) {
            const keyToAdd = Object.keys(props[key])[0];

            if (data[key] && data[key][keyToAdd]){
                const currentObject = JSON.stringify(_.omit(data[key][keyToAdd], 'lastTimestamp'));
                const objectToAdd = JSON.stringify(props[key][keyToAdd]);

                // leaves timestamp or updates with current timestamp
                props[key][keyToAdd]["lastTimestamp"] = objectToAdd == currentObject ? data[key][keyToAdd]["lastTimestamp"] : timeStamp;
            } else {
                // sets current timestmap
                props[key][keyToAdd]["lastTimestamp"] = timeStamp;
            }
            data = { ...data, [key]: { ...data[key], ...props[key] }};
        });

        console.log("Extended data");
        this.setState({ data })
        localStorage.setItem('data', JSON.stringify(data));
    }

    getEnvironmentStatus(serviceStatus, currentStatus){
        if (currentStatus == Status.INACTIVE){
            return Status.INACTIVE;
        }

        if (serviceStatus && serviceStatus.info){
            if (!serviceStatus.info.git){
                return Status.INACTIVE;
            } else {
                return Status.ACTIVE;
            }
        }
        return Status.UNKNOWN;
    }

    render() {
        console.log("Renders");
        if (this.state.data != null) {

            // generates ServiceRow
            var rows = [];
            var devxStatus = Status.UNKNOWN; var qaxStatus = Status.UNKNOWN; var stgxStatus = Status.UNKNOWN; var prodStatus = Status.UNKNOWN;

            Object.keys(this.state.data).forEach((key) => {

                const serviceStatus = this.state.data[key];
                rows.push(<ServiceRow key={key} data={serviceStatus} name={key}/>);

                devxStatus = this.getEnvironmentStatus(serviceStatus[Sources.DEVX.name], devxStatus);
                qaxStatus = this.getEnvironmentStatus(serviceStatus[Sources.QAX.name], qaxStatus);
                stgxStatus = this.getEnvironmentStatus(serviceStatus[Sources.STGX.name], stgxStatus);
                prodStatus = this.getEnvironmentStatus(serviceStatus[Sources.PROD.name], prodStatus);

            });
            
            return (
                <div className="app">
                    <div className="menu">
                        <div className="row header">
                            <div className="title service-header"><h1>Service</h1></div>
                            <EnvironmentHeader name={ Sources.DEVX.stylizedName } status={ devxStatus }/>
                            <EnvironmentHeader name={ Sources.QAX.stylizedName } status={ qaxStatus }/>
                            <EnvironmentHeader name={ Sources.STGX.stylizedName } status={ stgxStatus }/>
                            <EnvironmentHeader name={ Sources.PROD.stylizedName } status={ prodStatus }/>
                        </div>
                        { rows }
                        <div className="row button">
                            <Button/>
                        </div>
                    </div>
                </div>
            );
        }
        return (<div>Empty matrix</div>)
        
    }
}

class Button extends React.PureComponent{

    emptyCache(){
        console.log("Emptied cache");
        localStorage.setItem('data', null);
    }

    render(){
        return(<div className="button" onClick={this.emptyCache}>Clear cache</div>);
    }
}

class EnvironmentHeader extends React.PureComponent{
    constructor(props){
        super(props);
        this.state = { name: this.props.name, status: this.props.status };
    }

    render(){
        
        var toDisplay;
        if (this.props.status == Status.ACTIVE){
            toDisplay = <div className="general-status-active"></div>
        } else if (this.props.status == Status.INACTIVE) {
            toDisplay = <div className="general-status-inactive"></div>
        } else {
            toDisplay = <div className="general-status-unknown"></div>
        }
        
        return(<div className="title environment-header">
                    { toDisplay }
                    <h1>{ this.state.name }</h1>
               </div>);
    }

}

class ServiceTimestamp extends React.PureComponent{
    constructor(props){
        super(props);
    }

    render(){
        const data = this.props.data;
        var timeStamp = Math.floor(Date.now() / 1000);
        if (data && data.lastTimestamp){
            return (<div className="timestamp">{ humanizeTime(timeStamp - data.lastTimestamp) }</div>);
        }
        return (<div className="timestamp">{ humanizeTime(0) }</div>);
    }
}

class ServiceRow extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = { data: this.props.data, name: this.props.name}
    }

    render() {
        const { data } = this.props;
        const keys = Object.keys(data);

        return (<div className="row">
                    <div className="service-name"> { this.state.name } </div>
                        { (data[Sources.DEVX.name] && data[Sources.DEVX.name].info && !data[Sources.DEVX.name].info.git) ?
                                <div className="status down" key={ Sources.DEVX.name }>
                                    <div className="icon">
                                        <ServiceTimestamp data={data[Sources.DEVX.name]} />
                                        </div>
                                    </div> :
                                    (data[Sources.DEVX.name] && data[Sources.DEVX.name].info) ? 
                                        <div className="status up" key={ Sources.DEVX.name }>
                                            <div className="icon">
                                                <ServiceTimestamp data={data[Sources.DEVX.name]}/>
                                                </div>
                                            </div> :
                                        <div className="status unknown" key={ Sources.DEVX.name }>
                                            <div className="icon">
                                                <ServiceTimestamp data={data[Sources.DEVX.name]}/>
                                                </div>
                                            </div> 
                                                
                        }
                        { (data[Sources.QAX.name] && data[Sources.QAX.name].info && !data[Sources.QAX.name].info.git) ?
                                <div className="status down" key={ Sources.QAX.name }>
                                    <div className="icon">
                                        <ServiceTimestamp data={data[Sources.QAX.name]}/>
                                        </div>
                                    </div> :
                                    (data[Sources.QAX.name] && data[Sources.QAX.name].info) ? 
                                        <div className="status up" key={ Sources.QAX.name }>
                                            <div className="icon">
                                                <ServiceTimestamp data={data[Sources.QAX.name]}/>
                                                </div>
                                            </div> :
                                        <div className="status unknown" key={ Sources.QAX.name }>
                                            <div className="icon">
                                                <ServiceTimestamp data={data[Sources.QAX.name]}/>
                                                </div>
                                            </div> 
                                                
                        }
                        { (data[Sources.STGX.name] && data[Sources.STGX.name].info && !data[Sources.STGX.name].info.git) ?
                                <div className="status down" key={ Sources.STGX.name }>
                                    <div className="icon">
                                        <ServiceTimestamp data={data[Sources.STGX.name]}/>
                                        </div>
                                    </div> :
                                    (data[Sources.STGX.name] && data[Sources.STGX.name].info) ? 
                                        <div className="status up" key={ Sources.STGX.name }>
                                            <div className="icon">
                                                <ServiceTimestamp data={data[Sources.STGX.name]}/>
                                                </div>
                                            </div> :
                                        <div className="status unknown" key={ Sources.STGX.name }>
                                            <div className="icon">
                                                <ServiceTimestamp data={data[Sources.STGX.name]}/>
                                                </div>
                                            </div> 
                                                
                        }
                        { (data[Sources.PROD.name] && data[Sources.PROD.name].info && !data[Sources.PROD.name].info.git) ?
                                <div className="status down" key={ Sources.PROD.name }>
                                    <div className="icon">
                                        <ServiceTimestamp data={data[Sources.PROD.name]}/>
                                        </div>
                                    </div> :
                                    (data[Sources.PROD.name] && data[Sources.PROD.name].info) ? 
                                        <div className="status up" key={ Sources.PROD.name }>
                                            <div className="icon">
                                                <ServiceTimestamp data={data[Sources.PROD.name]}/>
                                                </div>
                                            </div> :
                                        <div className="status unknown" key={ Sources.PROD.name }>
                                            <div className="icon">
                                                <ServiceTimestamp data={data[Sources.PROD.name]}/>
                                                </div>
                                            </div> 
                                                
                        }
                </div>);
        
    };
}

render(<App />, document.getElementById('root'));