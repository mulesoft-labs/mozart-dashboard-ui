export var Sources = {
    DEVX : {
        url: "https://devx.anypoint.mulesoft.com/designcenter/api/v1/info",
        name: "devx"
    },
    QAX : {
        url: "https://qax.anypoint.mulesoft.com/designcenter/api/v1/info",
        name: "qax"
    },
    STGX : {
        url: "https://stgx.anypoint.mulesoft.com/designcenter/api/v1/info",
        name: "stgx"
    }
}

export function fetchAPIStatus(props){
    return new Promise((resolve, reject) => {
        fetch(props).then(  
            function(response) {
                if (response.status !== 200) {  
                    console.log('Looks like there was a problem. Status Code: ' + response.status);
                    return;  
                }

                // Examine the text in the response  
                response.json().then(function(data) {  
                    resolve(data);
                });  
            }  
        ).catch(function(err) {  
            console.log('Fetch Error :-S', err);  
        });
    });
}