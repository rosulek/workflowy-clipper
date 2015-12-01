// WorkFlowy clipper: background.js
// by Mike Rosulek <rosulekm@eecs.oregonstate.edu>
// available under MIT license


function g(){return((1+Math.random())*65536|0).toString(16).substring(1)}
function generateUUID(){return g()+g()+"-"+g()+"-"+g()+"-"+g()+"-"+g()+g()+g()}

function debug() {
    if (localStorage.debug)
        console.log.apply(console,arguments);
}

chrome.contextMenus.create({
    "title":    "Configure",
    "contexts": ["browser_action"],
    "onclick":  function() {
        chrome.tabs.create({ url: chrome.extension.getURL("config.html") });
    }
});


localStorage.pollid = g() + g();
debug("Initializing with localstorage = ", localStorage);

function refreshWorkflowyData(callback) {
    debug("refreshing workflowy data...");
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

            debug("succesfully got initialization data:", localStorage);
            callback(0);

        } catch (e) {
            localStorage.clear();
            debug("error extracting initialization data", e);
            callback(1);
        }

    };
    xhr.send();
    debug("sending XHR");
}

function htmlEsc(str) {
    return str.replace(/&/g,"&amp;").replace(/>/g,"&gt;").replace(/</g,"&lt;");
}

function clipToWorkflowy(title, comment, callback) {
    var newuuid = generateUUID();
    var timestamp = Math.floor((new Date()).getTime()/1000) - localStorage.joined;
    
    var request = [{
        "most_recent_operation_transaction_id": localStorage.transid,
        "operations": [
            { "type": "create",
              "data": {
                  "projectid": newuuid,
                  "parentid":  localStorage.inbox,
                  "priority":  9999
               },
              "client_timestamp": timestamp,
              "undo_data":        {}
            },
            { "type":"edit",
              "data": {
                  "projectid":   newuuid,
                  "name":        htmlEsc(title),
                  "description": htmlEsc(comment)
              },
              "client_timestamp": timestamp,
              "undo_data": {
                   "previous_last_modified": timestamp,
                   "previous_name":          "",
                   "previous_description":   ""
              }
            }
        ]
    }];

    debug("Trying to clip something to workflowy:",
        { timestamp: timestamp,
          title: title,
          comment: comment,
          escapedTitle: htmlEsc(title),
          escapedComment: htmlEsc(comment),
          localstorage: localStorage }
    );

    var postdata = {
        "client_id":          "2015-11-17 19:25:15.397732",
        "client_version":     15,
        "push_poll_id":       localStorage.pollid,
        "push_poll_data":     JSON.stringify(request),
        "crosscheck_user_id": localStorage.userid,
    };

    var urlEncData = "";
    var sep = "";
    for (var key in postdata) {
        urlEncData += sep + encodeURIComponent(key) + "=" + encodeURIComponent(postdata[key]);
        sep = "&";
    }
    
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://workflowy.com/push_and_poll', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function () {
        try {
            err = "parsing JSON";
            respObj = JSON.parse(this.responseText);
            debug("XHR response from server:", respObj);
        } catch (e) {
            debug("error processing XHR response: ", e);
            callback(newuuid, "parsing JSON");
            return;
        }

        if (respObj.logged_out) {
            callback(newuuid, "logged out");
        } else if ( ! respObj.results ) {
            callback(newuuid, "no results");
        } else if (respObj.results[0].error) {
            callback(newuuid, "generic: " + respObj.results[0].error);
//        } else if (respObj.results[0].error_encountered_in_remote_operations) {
//            callback(newuuid, "unknown: " + respObj.results[0].error_encountered_in_remote_operations);
        } else {
            var oldid = localStorage.transid;
            localStorage.transid = respObj.results[0].new_most_recent_operation_transaction_id;
            debug("got new transid: changed from " + oldid + " to " + localStorage.transid);
            callback(newuuid);
        }

    };
    xhr.send(urlEncData);
}


