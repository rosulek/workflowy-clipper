// WorkFlowy clipper: popup.js
// by Mike Rosulek <rosulekm@eecs.oregonstate.edu>
// available under MIT license


// send console messages to background page
debug = chrome.extension.getBackgroundPage().debug;

document.addEventListener('DOMContentLoaded', function() {

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var tab = tabs[0];
        debug("browser action got clicked @ " + tab.url);

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
    debug("Trying to show clipper popup");

    if (! localStorage.userid || ! localStorage.inbox) {
        showErrMsg("Extension not configured. " 
            + "<a href=\"https://workflowy.com\">Navigate " 
            + "to WorkFlowy</a> then press this button again.");
        debug("extension not configured");
        return;
    }

    setPopupMode("clip");


    $("#title").val( tab.title );
    $("#comment").val( tab.url );    
    $("#title").add("#comment").on("focus", function() { $(this).select() });
    $("#title").focus();

    chrome.tabs.executeScript(
        { code: "window.getSelection().toString();" },
        function(selection) {
            // trim leading/trailing whitespace
            var txt = selection[0].replace(/^\s+|\s+$/g, "");
            if (txt) {
                $("#comment").val( $("#comment").val() + "\n\n" + txt );
            }
    });

    $("#inboxlink").attr("href",
        "https://workflowy.com/#/" + localStorage.inbox.substr(24) );

    $("#title").on("keyup", function (e) {
        if (e.keyCode == 13) $("#clipbutton").click();
    });

    $("#clipbutton").on("click", function () {  
        chrome.extension.getBackgroundPage().clipToWorkflowy( $("#title").val(), $("#comment").val(), function(newuuid,errmsg) {

            if (!errmsg) {
                showSuccessMsg("Successfully clipped!<br><br>"
                    + "<small><a href=\"https://workflowy.com/#/"
                    + newuuid.substr(24) + "\">view in WorkFlowy</a>"
                    + "</small>");

            } else if (errmsg.match(/logged/)) {
                showErrMsg("WorkFlowy thinks you're logged out! Make sure you're logged in, and if this message persists then try resynchronizing the extension.");
            } else if (errmsg.match(/results/)) {
                showErrMsg("Malformed response from WorkFlowy, possible connection error.");
            } else if (errmsg.match(/generic/)) {
                showErrMsg("Error adding item, destination list may no longer exist.");
            } else if (errmsg.match(/unknown/)) {
                showErrMsg("Unknown error!");
            } else {
            }

        });
    });
}

function initConfigPopup(tab) {
    debug("showing workflowy config popup");
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

    $("#inboxbutton").on("click", function() {
        debug("asking page for current project id");
        chrome.tabs.executeScript(
            { code: "document.getElementsByClassName(\"project selected\")[0].getAttribute(\"projectid\");" },
            function(response) {
                debug("page responded with " + response);
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

