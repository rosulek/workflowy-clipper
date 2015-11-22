// WorkFlowy clipper: popup.js
// by Mike Rosulek <rosulekm@eecs.oregonstate.edu>
// available under MIT license


function g(){return((1+Math.random())*65536|0).toString(16).substring(1)}
function generateUUID(){return g()+g()+"-"+g()+"-"+g()+"-"+g()+"-"+g()+g()+g()}

// send console messages to background page
console = chrome.extension.getBackgroundPage().console;

document.addEventListener('DOMContentLoaded', function() {

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var tab = tabs[0];
        console.log("browser action got clicked @ " + tab.url);

        $("body").on("click", "a", function() {
            chrome.tabs.create({url: $(this).attr("href") });
            return false;
        });

        if (tab.url.match(/^https?:\/\/(?:www\.)?workflowy.com/)) {
            initConfigPopup(tab);
        } else {
            initClipperPopup(tab);
        }

    });

});

function initClipperPopup(tab) {
    console.log("Trying to show clipper popup");

    if (! localStorage.userid || ! localStorage.inbox) {
        showErrMsg("Extension not configured. " 
            + "<a href=\"https://workflowy.com\">Navigate " 
            + "to WorkFlowy</a> then press this button again.");
        console.log("extension not configured");
        return;
    }

    setPopupMode("clip");

    $("#title").val( tab.title );
    $("#comment").val( tab.url );    
    $("#title").add("#comment").on("focus", function() { $(this).select() });
    $("#title").focus();

    $("#inboxlink").attr("href",
        "https://workflowy.com/#/" + localStorage.inbox.substr(24) );

    $("#title").on("keyup", function (e) {
        if (e.keyCode == 13) $("#clipbutton").click();
    });

    $("#clipbutton").on("click", function () {  
        clipToWorkflowy( $("#title").val(), $("#comment").val() );
    });
}

function initConfigPopup(tab) {
    console.log("showing workflowy config popup");
    setPopupMode("config");
    
    var status;
    if (! localStorage.userid) {
        status = "Not synchronized";
        $("#inboxbutton").prop("disabled", true);
    } else if (! localStorage.inbox) {
        status = "No inbox location set";
    } else {
        status = "<b>Ready</b>";
    }
    $("#status").html("Status: " + status);

    chrome.tabs.executeScript(null, {file: "inject.js"});

    $("#inboxbutton").on("click", function() {
        console.log("asking inject.js for current projid...");
        chrome.tabs.sendMessage(tab.id, {}, function(response) {
            console.log("inject.js responded with " + response);
            if (response && response != "None") {
                localStorage.inbox = response;
                showSuccessMsg("Clipped items will now appear in this list.");
            } else {
                showErrMsg("Problem setting inbox location. Cannot be top-level Workflowy list.");
            }
        });
    });

    $("#resetbutton").on("click", function() {
        chrome.extension.getBackgroundPage().refreshWorkflowyData(function(err) {
            if (err) {
                showErrorMsg("Error syncing to WorkFlowy. Please ensure you are signed in.");
            } else {
                $("#status").html("Sync successful! Now you must set the inbox location by zooming into it then pressing the button below.");
                $("#inboxbutton").prop("disabled", false);
            }
        });
    });

}


function htmlEsc(str) {
    return str.replace(/&/g,"&amp;").replace(/>/g,"&gt;").replace(/</g,"&lt;");
}

function clipToWorkflowy(title, comment) {
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

    console.log("Trying to clip something to workflowy:",
        { timestamp: timestamp,
          title: title,
          comment: comment,
          escapedTitle: htmlEsc(title),
          escapedComment: htmlEsc(comment),
          localstorage: localStorage }
    );

    var data = new FormData();
    data.append("client_id",          "2015-11-17 19:25:15.397732");
    data.append("client_version",     15);
    data.append("push_poll_id",       localStorage.pollid);
    data.append("push_poll_data",     JSON.stringify(request));
    data.append("crosscheck_user_id", localStorage.userid);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://workflowy.com/push_and_poll', true);
    xhr.onload = function () {
        var respObj = JSON.parse(this.responseText);
        console.log("XHR response from server:", respObj);
        
        if (respObj.logged_out) {
            showErrMsg("WorkFlowy thinks you're logged out! Make sure you're logged in, and if this message persists then try resynchronizing the extension.");
        } else if ( ! respObj.results ) {
            showErrMsg("Unknown error!");
        } else if (respObj.results[0].error_encountered_in_remote_operations) {
            showErrMsg("Unknown error!");
        } else {
            var oldid = localStorage.transid;
            localStorage.transid = respObj.results[0].new_most_recent_operation_transaction_id;
            console.log("got new transid: changed from " + oldid + " to " + localStorage.transid);
            showSuccessMsg("Successfully clipped!<br><br>"
                + "<small><a href=\"https://workflowy.com/#/"
                + newuuid.substr(24) + "\">view in WorkFlowy</a>"
                + "</small>");                    
        }
    };
    xhr.send(data);
    
}

function setPopupMode(mode) {
    $("body").removeClass("clip info config").addClass(mode);
}


function showSuccessMsg(msg) {
    $("#info").html(msg);
    setPopupMode("info");
    setTimeout( function() { window.close() }, 3000 );
}

function showErrMsg(msg) {
    $("#info").html(msg);
    setPopupMode("info");
}

