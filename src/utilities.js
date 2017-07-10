export var Sources = {
    DEVX : "https://devx.anypoint.mulesoft.com/designcenter/api/v1/info",
    QAX : "https://qax.anypoint.mulesoft.com/designcenter/api/v1/info",
    STGX : "https://stgx.anypoint.mulesoft.com/designcenter/api/v1/info"
}

export function extend(obj, src){
    Object.keys(src).forEach(function(key) { obj[key] = src[key]; });
    return obj;
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