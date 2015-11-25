// WorkFlowy clipper: background.js
// by Mike Rosulek <rosulekm@eecs.oregonstate.edu>
// available under MIT license


function g(){return((1+Math.random())*65536|0).toString(16).substring(1)}
localStorage.pollid = g() + g();

console.log("Initializing with localstorage = ", localStorage);

function refreshWorkflowyData(callback) {
    console.log("refreshing workflowy data...");
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://workflowy.com/get_initialization_data?client_version=15');
    xhr.onload = function () { 

        var obj = JSON.parse( this.responseText );

        try {
            var globals = [];
            for (i in obj.globals) globals[ obj.globals[i][0] ] = obj.globals[i][1];

            localStorage.userid = globals.USER_ID;
            localStorage.joined = obj.projectTreeData.mainProjectTreeInfo.dateJoinedTimestampInSeconds;
            localStorage.transid = obj.projectTreeData.mainProjectTreeInfo.initialMostRecentOperationTransactionId;
            delete localStorage["inbox"];

            console.log("succesfully got initialization data:", localStorage);
            callback(0);

        } catch (e) {
            localStorage.clear();
            console.log("error extracting initialization data", e);
            callback(1);
        }

    };
    xhr.send();
    console.log("sending XHR");
}

