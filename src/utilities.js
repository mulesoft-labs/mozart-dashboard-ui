export default function fetchAPIStatus(){
    return new Promise((resolve, reject) => {
        fetch('https://devx.anypoint.mulesoft.com/designcenter/api/v1/info').then(  
            function(response) {
                if (response.status !== 200) {  
                    console.log('Looks like there was a problem. Status Code: ' + response.status);
                    return;  
                }

                // Examine the text in the response  
                response.json().then(function(data) {  
                    console.log(data);
                    resolve(data);
                });  
            }  
        ).catch(function(err) {  
            console.log('Fetch Error :-S', err);  
        });
    });
}


/*

function tick() {
  ReactDOM.render(
    <Clock date={new Date()} />,
    document.getElementById('root')
  );
}

setInterval(tick, 1000);

 */