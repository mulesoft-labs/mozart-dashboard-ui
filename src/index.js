import React from 'react';
import fetchTest from './utilities';
import { render } from 'react-dom';

const styles = {
  fontFamily: 'sans-serif',
  textAlign: 'center',
};

const App = () => (
  <div style={styles}>
    <Hello name="Jonathan" />
    <h2>Start editing to see some magic happen {'\u2728'}</h2>
    <Test/>
  </div>
);

class Test extends React.PureComponent{
    render(){
        return (
            <h2>This is a test {fetchTest()}</h2>
        );
    }
}

const Hello = (props) => (
    <h1>Hello {props.name}!</h1>
);

render(<App />, document.getElementById('root'));

