export var Sources = {
    DEVX : {
        url: "https://devx.anypoint.mulesoft.com/designcenter/api/v1/info",
        name: "devx",
        stylizedName: "DEVx"
    },
    QAX : {
        url: "https://qax.anypoint.mulesoft.com/designcenter/api/v1/info",
        name: "qax",
        stylizedName: "QAx"
    },
    STGX : {
        url: "https://stgx.anypoint.mulesoft.com/designcenter/api/v1/info",
        name: "stgx",
        stylizedName: "STGx"
    },
    PROD : {
        url: "https://anypoint.mulesoft.com/designcenter/api/v1/info",
        name: "prod",
        stylizedName: "PROD"
    }
}

export var Status = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    UNKNOWN: "unknown"
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