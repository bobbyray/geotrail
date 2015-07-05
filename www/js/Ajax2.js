'use strict';
// Class providing core members for AJAX (XMLHttpReq).
// Constructor Arg:
//  sBaseUri is URL for path to the web service.
//      Defaults to Service.svc/ if not given.
//      If sBaseUri does not end with /, a / is appended. 
function wigo_ws_Ajax(sBaseUri) {
    // Events fired for this object. Owner assigns function to handle the events.

    // Called when XMLHttpRequest has completed. Owner assigns handler. 
    // Handler signature:
    //  nState is state given when request was initiated.
    //  bOk is boolean indicating successul response.
    //  req is the XMLHttpRequest obj that initiated the request.
    //  Returns nothing.
    // Remarks: 
    // Request can be a get or post. The response is anynchronous to the request,
    // and only one request is outstanding at a time. If concurrent requests are
    // needed, use separate wigo_ws_Ajax() object for each.
    this.onRequestServed = function (nState, bOk, req) { };

    // Initiates a get XMLHttpRequest.
    // Returns true for request sent; false if another request is already in progress.
    // this.onRequestServed handler is used for async result.
    // Args:
    //  nStateArg is state caller defines to keep track of request.
    this.Get = function (nStateArg, sRelURI) {
        if (bRequestInProgress)
            return false;
        bRequestInProgress = true;
        var sUri = sBaseUri + sRelURI;
        req.open("GET", sUri, true);
        nState = nStateArg;
        req.send();
        return true;
    };

    // Initiates a get XMLHttpRequest.
    // Returns true for request sent; false if another request is already in progress.
    // this.onRequestServed handler is used for async result.
    // Args:
    //  nStateArg is state caller defines to keep track of request.
    this.Post = function (nStateArg, sRelUri, oJSON) {
        if (bRequestInProgress)
            return false;
        bRequestInProgress = true;
        var sUri = sBaseUri + sRelUri;
        req.open("POST", sUri, true);
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        nState = nStateArg;
        var sPost = JSON.stringify(oJSON);
        req.send(sPost);
        return true;
    }


    // Returns msg from xmlHttpRequest.responseText for status.
    // Arg:
    //  xmlHttpReq is the XMLHttpRequest javascript object.
    this.FormCompletionStatus = function (xmlHttpReq) {
        var sMsg = "Status Code: " + xmlHttpReq.status;
        if (xmlHttpReq.statusText)
            sMsg += ", " + xmlHttpReq.statusText;
        if (xmlHttpReq.responseText) {
            if (xmlHttpReq.responseText.length > 0 && xmlHttpReq.responseText[0] == '\"')
                sMsg += "\n" + JSON.parse(xmlHttpReq.responseText);
        }
        return sMsg;
    };

    // Event handler for notification of ajax request completed.
    function RequestServedHandler(e) {
        if (req.readyState == 4) {
            bRequestInProgress = false;
            var bOk = req.status == 200;
            that.onRequestServed(nState, bOk, req);
        }
    }

    // Constructor initialization.
    var that = this;
    // Base URI for web service.
    if (sBaseUri === undefined)
        var sBaseUri = "Service.svc/";
    if (sBaseUri.substr(sBaseUri.length-1) !== '/')
        sBaseUri += '/';

    var bRequestInProgress = false; // Only one XMLHttpRequest at a time is accepted.
    var nState = 0; // State meaningful to derived class for identifying request responses.
    var req = new XMLHttpRequest();  // Xml Http Request obj for async transfer with server (ajax). 
    req.onreadystatechange = RequestServedHandler;
}