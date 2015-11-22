// WorkFlowy clipper: inject.js
// by Mike Rosulek <rosulekm@eecs.oregonstate.edu>
// available under MIT license

var INCLUDEONCE;

if (!INCLUDEONCE) {

    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
          console.log("inject.js received request for current projectID");
    
          var projid;
          try { 
            projid = document.getElementsByClassName("project selected")[0].getAttribute("projectid");
          } catch(e) {}

          sendResponse(projid);
      });

    console.log("inject.js is alive");

}

INCLUDEONCE = 1;
