import React from 'react';
import { fetchAPIStatus, Sources, Status } from './utilities';
import { render } from 'react-dom';
import * as _ from 'lodash';
import moment from 'moment/src/moment'
import "./styles.css";
import Icon from '@mulesoft/anypoint-icons/lib/Icon';
import '@mulesoft/anypoint-styles/anypoint-styles.css';

const Interval = 10000;

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
        setInterval(() => this.getData(), Interval);
        this.setState({
            data: {}
        })
    }

    getData() {
        console.log("Getting data...");
        this.fetchEnvironmentData(Sources.DEVX);
        this.fetchEnvironmentData(Sources.QAX);
        this.fetchEnvironmentData(Sources.STGX);
        this.fetchEnvironmentData(Sources.PROD);
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

        var timeStamp = Math.floor(Date.now());
        Object.keys(props).forEach(function(key) {
            const keyToAdd = Object.keys(props[key])[0];
            if (data[key] && data[key][keyToAdd]){
                const currentObject = JSON.stringify(_.omit(data[key][keyToAdd], 'lastChange'));
                const objectToAdd = JSON.stringify(props[key][keyToAdd]);
                // resets lastChange or adds Interval
                if (objectToAdd != currentObject){
                    props[key][keyToAdd]["lastChange"] = timeStamp;
                }
            } else {
                // initializes lastChange
                props[key][keyToAdd]["lastChange"] = timeStamp;
            }
            data = { ...data, [key]: { ...data[key], ...props[key] }};
        });

        console.log("Extended data");
        this.setState({ data })
        console.log(JSON.stringify(data));
    }

    getEnvironmentStatus(serviceStatus, currentStatus){
        if (currentStatus == Status.INACTIVE){
            return Status.INACTIVE;
        }

        if (serviceStatus){
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
                <div className="menu">
                    <div className="row">
                        <div className="title service-header"><h1>Service</h1></div>
                        <EnvironmentHeader name={ Sources.DEVX.stylizedName } status={ devxStatus }/>
                        <EnvironmentHeader name={ Sources.QAX.stylizedName } status={ qaxStatus }/>
                        <EnvironmentHeader name={ Sources.STGX.stylizedName } status={ stgxStatus }/>
                        <EnvironmentHeader name={ Sources.PROD.stylizedName } status={ prodStatus }/>
                    </div>
                    { rows }
                </div>
            );
        }
        return (<div>Empty matrix</div>)
        
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
        this.state = { data: this.props.data };
    }

    render(){
        
        if (this.props.data && this.props.data.lastChange){
            return(
                
                <div className="timestamp">{ moment(this.props.data.lastChange, "x").fromNow() }</div>
            );
        }
        console.log
        return (<div></div>);
        
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
                        { (data[Sources.DEVX.name] && !data[Sources.DEVX.name].info.git) ?
                                <div className="status down" key={ Sources.DEVX.name }>
                                    <div className="icon">
                                        <ServiceTimestamp data={data[Sources.DEVX.name]} />
                                        </div>
                                    </div> :
                                    (data[Sources.DEVX.name]) ? 
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
                        { (data[Sources.QAX.name] && !data[Sources.QAX.name].info.git) ?
                                <div className="status down" key={ Sources.QAX.name }>
                                    <div className="icon">
                                        <ServiceTimestamp data={data[Sources.QAX.name]}/>
                                        </div>
                                    </div> :
                                    (data[Sources.QAX.name]) ? 
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
                        { (data[Sources.STGX.name] && !data[Sources.STGX.name].info.git) ?
                                <div className="status down" key={ Sources.STGX.name }>
                                    <div className="icon">
                                        <ServiceTimestamp data={data[Sources.STGX.name]}/>
                                        </div>
                                    </div> :
                                    (data[Sources.STGX.name]) ? 
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
                        { (data[Sources.PROD.name] && !data[Sources.PROD.name].info.git) ?
                                <div className="status down" key={ Sources.PROD.name }>
                                    <div className="icon">
                                        <ServiceTimestamp data={data[Sources.PROD.name]}/>
                                        </div>
                                    </div> :
                                    (data[Sources.PROD.name]) ? 
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