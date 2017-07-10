import React from 'react';
import { fetchAPIStatus, extend, Sources } from './utilities';
import { render } from 'react-dom';
import "./styles.css";

const App = () => (
    <div>
        <StatusList />
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

        fetchAPIStatus(Sources.QAX).then((fetchedData) => {
            console.log("Got QAX");
            const mappedData = fetchedData.reduce((acc, val) => {
                const startOfName = val.service.indexOf("://") + 3;
                const endOfName = val.service.indexOf(".");
                const res = val.service.substring(startOfName, endOfName);

                acc[res] = {};
                acc[res]["qax"] = val;
                return acc;
            }, {});

            this.extendData(mappedData);
        }).catch();

        fetchAPIStatus(Sources.DEVX).then((fetchedData) => {
            console.log("Got DEVX");
            const mappedData = fetchedData.reduce((acc, val) => {
                const startOfName = val.service.indexOf("://") + 3;
                const endOfName = val.service.indexOf(".");
                const res = val.service.substring(startOfName, endOfName);

                acc[res] = {};
                acc[res]["devx"] = val;
                return acc;
            }, {});
            
            this.extendData(mappedData);
        }).catch();
        
        fetchAPIStatus(Sources.STGX).then((fetchedData) => {
            console.log("Got STGX");
            const mappedData = fetchedData.reduce((acc, val) => {
                const startOfName = val.service.indexOf("://") + 3;
                const endOfName = val.service.indexOf(".");
                const res = val.service.substring(startOfName, endOfName);

                acc[res] = {};
                acc[res]["stgx"] = val;
                return acc;
            }, {});

            this.extendData(mappedData);
        }).catch();
        
    }
    
    extendData(props){
        const data = this.state.data;
        Object.keys(props).forEach(function(key) {
            if (data[key] == null){
                data[key] = {};
            }
            const test = extend(data[key], props[key])
            data[key] = test;
        });
        this.setState({ data })
        console.log(JSON.stringify(data));
    }

    render() {
        //console.log('render', this.state.matrix.length);

        if (false) {
            return (
                <div className="menu">
                    <div className="row">
                        <div className="service column"><h1>Service</h1></div>
                        <div className="status column"><h1>DEVx</h1></div>
                        <div className="status column"><h1>QAx</h1></div>
                        <div className="status column"><h1>STGx</h1></div>
                        <div className="status column"><h1>PROD</h1></div>
                    </div>
                    {/*<ServiceRow services={this.state.matrix}/>*/}
                </div>
            );
        }
        return (<div>Empty matrix</div>);
    }
}

class ServiceRow extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = { services: this.props.services }
    }

    render() {
        const { services } = this.props;

        console.log(services);

        if (info.git && info.git.commit) {
            return (<div className="row">
                <div className="service column">{service}</div>
                <div className="status column">ACTIVE</div>
                <div className="status column">ACTIVE</div>
                <div className="status column">ACTIVE</div>
                <div className="status column">ACTIVE</div>
            </div>);
        }
        return (<div className="row">
            <div className="service column">{service}</div>
            <div className="error column">ERROR</div>
            <div className="status column">ACTIVE</div>
            <div className="status column">ACTIVE</div>
            <div className="status column">ACTIVE</div>
        </div>);
    };
}

render(<App />, document.getElementById('root'));