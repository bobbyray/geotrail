'use strict';

// Object for the view presented by html pages
function wigo_ws_View() {
    var that = this;

    // Events fired by the view for controller to handle.
    // Note: Controller needs to set the onHandler function.

    // File selected for uploading Gpx file.
    // Handler Signature:
    //  fileList: FileList javascript object, list of file selected.
    //  Returns nothing.
    this.onUpload = function (fileList) { };

    // Button clicked to get list of Gpx records from server.
    this.onGpxGetList = function () { };

    // Button clicked to parse gpx. 
    this.onParseGpx = function () { };
    


    // Public Members
    this.ShowStatus = function (sMsg) {
        divStatus.innerHTML = sMsg;
    };

    var divStatus = $q('#divStatus');
    var fileUploadPath = $q('#fileUploadPath');
    var buGpxGetList = $q('#buGpxGetList');
    var buParseGpx = $('#buParseGpx'); // Note: using jquery instead of helper $q().

    fileUploadPath.addEventListener('change', function (e) {
        // this is the html element.
        that.onUpload(this.files);
    });

    buGpxGetList.addEventListener('click', function (e) {
        // this is the html element.
        that.onGpxGetList();
    });

    // Use jquery to attach event handler.
    $('#buParseGpx').bind('click', function (e) {
        that.onParseGpx();
    });

}

// Controller for hmtl page. implementing the Model View Controller pattern
function wigo_ws_Controller() {
    var that = this;
    var view = new wigo_ws_View();
    var model = new wigo_ws_Model();

    // Read gpx file from disk and upload to server.
    view.onUpload = function (fileList) {
        if (fileList.length < 1) {
            view.ShowStatus("No file selected to upload!");
            return;
        }
        var file = fileList[0]
        view.ShowStatus("Reading file " + file.name);

        // Read the text from the file.
        var bOk = model.readTextFile(file, function (bOk, sResult) {
            // Asynce callback when reading file is done.
            if (bOk) {
                // Form Gpx oject from file text and put to server.
                var gpx = new wigo_ws_Gpx();
                gpx.sOwnerId = "BobSchomburg";
                //gpx.nId = 6; // Use this stmt to Update, otherwise nId is 0 causing an Insert.
                gpx.sName = "Mt Hood East Loop";
                gpx.xmlData = sResult;
                var bOk = model.putGpx(gpx,
                    // Async callback upon storing record at server.
                    function (bOk, sStatus) {
                        var sMsg = bOk ? "GpxPut succeeded.<br/>" : "GpxPut failed.<br/>";
                        sMsg += sStatus;
                        view.ShowStatus(sMsg);
                    });
                if (!bOk) {
                    var sError = "Cannot put file " + file.name + " to server because another transfer is already in progress."
                    view.ShowStatus(sError);
                }
            } else {
                var sError = "Cannot read file " + file.name + " because reading another file is already in progress."
                view.ShowStatus(sError);
            }
        });
    }

    // Async get of list of Gpx records from server.
    view.onGpxGetList = function () {
        //var sOwnerId = "BobSchomburg";
        var sOwnerId = "any";
        var nShare = model.eShare().public;
        model.getGpxList(sOwnerId, nShare, function (bOk, gpxList, sStatus) {
            if (bOk) {
                var sMsg = "GpxList Count: " + gpxList.length + "<br />";
                sMsg += "gpxList[0].tModified: " + gpxList[0].tModified + "<br/>";
                sMsg += "tModified local value<br/>";
                var tModified = gpxList[0].tModified.parseJsonDate();
                var sModified = tModified.toISOString();
                sMsg += "tModified parsed (iso): " + sModified + "<br/>";
                sMsg += "tModified parsed: " + tModified.toString() + "<br/>";
                sMsg += "tModified UTC value <br/>";
                var tModifiedUTC = gpxList[0].tModified.parseJsonDateGmt();
                var sModifiedUTC = tModifiedUTC.toISOString();
                sMsg += "tModifiedUTC parsed (iso): " + sModifiedUTC + "<br/>";
                sMsg += "tModifiedUTC parse: " + tModifiedUTC.toString();
                view.ShowStatus(sMsg);
            } else {
                view.ShowStatus(sStatus);
            }
        });
    };
    
    // Parse gpx file into jquery document object.
    view.onParseGpx = function () {
        // Get list of gpx records from server.
        var nShare = model.eShare().public;
        model.getGpxList("any", nShare, function(bOk, liGpx, sStatus)
        // Async callback upon getting list from server.
        {
            if (!bOk) {
                var sMsg = "Failed to get list of Gpx records from server.<br/>";
                sMsg += sStatus + "<br/>";
                view.ShowStatus(sMsg);
            } else {
                var iLast = liGpx.length - 1;
                if (iLast < 0) {
                    view.ShowStatus("Failed to find Gpx records at server.")
                } else {
                    var oGpx = liGpx[iLast];
                    var path = model.ParseGpxXml(oGpx.xmlData );
                    //ForceError var path = model.ParseGpxXml("<xml dlkdlkd />");

                    var sMsg = "wigo_ws_GeoPt Array: <br/>";
                    sMsg += "Parsing xml " + (path.arGeoPt.length > 0 ? "succeeded" : "failed!") + "<br/>";
                    path.arGeoPt.forEach(function (el, ix, ary) {
                        sMsg += "ix: " + ix + " lat: " + el.lat + " lon: " + el.lon + "<br/>";
                    });
                    sMsg += "SW Corner: (" + path.gptSW.lat + ", " + path.gptSW.lon + ")<br/>";
                    sMsg += "NE Corner: (" + path.gptNE.lat + ", " + path.gptNE.lon + ")<br/>";
                    sMsg += "Begin Pt: (" + path.gptBegin.lat + ", " + path.gptBegin.lon + ")<br/>";
                    sMsg += "End Pt: (" + path.gptEnd.lat + ", " + path.gptEnd.lon + ")<br/>";
                    view.ShowStatus(sMsg);
                }
            }
        });
    };
}

// Set global var for the controller and therefore the view and model.
window.app = {};
window.app.OnDocReady = function (e) {
    // Create the controller and therefore the view and model therein.
    window.app.ctlr = new wigo_ws_Controller();
};

// Handle DOMCententLoaded event to create the model, view and controller. 
// first choice is DOMContentLoaded event
//WorksButUseJquery document.addEventListener("DOMContentLoaded", window.app.OnDocReady);
// backup is window load event
// window.addEventListener("load", window.app.ctlr.DocReady, false);

$(document).ready(window.app.OnDocReady);