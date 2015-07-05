'use strict';
// Object for the Model (data) used by html page.
// Model should be sharable by all html pages for GeoPaths site.
// However, Controller and View are different for each page.
function wigo_ws_Model() {
    // ** Public members

    // Puts gpx data to server.
    // Returns true for data transfer started; false if another transfer is already in progress. 
    // Uses aysnc callback onDone.
    // Args:
    //  gpx: wigo_ws_Gpx object to be stored at server.
    //  onDone: async callback on completion with this signature:
    //      bOk: boolean for success.
    //      sStatus: status string describing result.
    this.putGpx = function (gpx, onDone) {
        var bOk = api.GpxPut(gpx, onDone);
        return bOk;
    };

    // Gets list of gpx data objects from the server.
    // Returns true for data transfer started; false if another transfer is already started.
    // Uses async callback onDone.
    // Args:
    //  sOwnerId: string for owner id of Gpx data objecct.
    //  nShare: byte for enumeration of sharing mode for Gpx data object.
    //  onDone: async callback on completion with this signature:
    //      bOk: boolean indicating success.
    //      gpxList: array of Gpx objects found in database.
    //      sStatus: string indicating result. (For bOk false, an error msg.)
    this.getGpxList = function (sOwnerId, nShare, onDone) {
        var bOk = api.GpxGetList(sOwnerId, nShare, onDone);
        return bOk;
    }

    // Returns enumeration object for sharing mode of gpx data.
    // Returned obj: { public: 0, protected: 1, private: 2 }
    this.eShare = function () { return api.eShare(); };

    // Reads a text file.
    // Return true for reading stared, false for reading already in progress. 
    // Uses async callback when reading file has completed.
    // Args:
    //  file: object obtained from FileList for the input file control.
    //  onDone: callback when file text has been read. Handler Signature:
    //          bOk: boolean indicating success.
    //          sResult: result of reading the file.
    //              For bOk true, the string of text read.
    //              For bOk false, an error message.
    this.readTextFile = function (file, onDone) {
        if (bReadingFile)
            return false; // Reading a file already in progress.
        reader.onload = function (e) {
            bReadingFile = false;
            // this is reader object.
            if (onDone)
                onDone(true, this.result)
        };
        reader.onerror = function (e) {
            bReadingFile = false;
            var sError = "Failed to read file " + file.name + ".";
            if (onDone)
                onDone(false, sError);
        }
        bReadingFile = true;
        reader.readAsText(file);
    };


    // Parse a string of xml for Gpx data.
    // Returns wigo_ws_GpxPath obj for the path defined by the Gpx data.
    // wigo_ws_GpxPath.arGeoPt is empty if parsing fails.
    // Arg:
    //  xmlGpx: string of xml for the Gpx data.
    this.ParseGpxXml = function (xmlGpx) {
        var path = new wigo_ws_GpxPath();
        var bOk = path.Parse(xmlGpx);
        if (!bOk) {
            path.arGeoPt.length = 0;
        }
        return path;
    };


    // Returns OwnerId string from localStorage.
    // Returns empty string if OwnerId does not exist.
    this.getOwnerId = function () {
        var sOwnerId;
        if (localStorage[sOwnerIdKey])
            sOwnerId = localStorage[sOwnerIdKey];
        else
            sOwnerId = "";
        return sOwnerId;
    }

    // Sets OwnerId in localStorage.
    // Arg:
    //  sOwnerId: string for the OnwerId.
    this.setOwnerId = function (sOwnerId) {
        localStorage[sOwnerIdKey] = sOwnerId;
    }

    // Sets offline params for a map in local storage.
    // Args:
    //  oParams: wigo_ws_GeoPathMap.OfflineParams object for a geo path.
    //           oParams.nId is used to find an existing object in the array.
    //           On a match the oParams replaces the array element, otherwise 
    //           oParams is added to the array.
    this.setOfflineParams = function (oParams) {
        arOfflineParams.setId(oParams);
        arOfflineParams.SaveToLocalStorage();
    };

    // Returns wigo_ws_GeoPathMap.OfflineParameters object saved in local storage.
    // Return null if object is not found.
    // Arg:
    //  nId is record id of a wigo_ws_GeoMap.OfflineParams object (object for a geo path).
    //      nId is used to find the wigo_ws_GeoMap.OfflineParams object.
    this.getOfflineParams = function (nId) {
        var oParamsFound = arOfflineParams.findId(nId);
        return oParamsFound;
    };

    // Returns list, which is an Array object of wigo_ws_GeoPathMap.OfflineParams elements.
    this.getOfflineParamsList = function() {
        return arOfflineParams.getAll();
    }

    // Sets settings in localStorage.
    // Arg:
    //  settings: wigo_ws_GeoTrailSettings object for the settings.
    this.setSettings = function (settings) {
        geoTrailSettings.SaveToLocalStorage(settings);
    }

    // Returns current settings, a wigo_ws_GeoTrailSettings object.
    this.getSettings = function () {
        return geoTrailSettings.getSettings();
    }


    // ** Private members
    var sOwnerIdKey = "GeoPathsOwnerId";
    var sOfflineParamsKey = 'GeoPathsOfflineParamsKey';
    var sGeoTrailSettingsKey = 'GeoTrailSettingsKey'; 

    var api = new wigo_ws_GeoPathsRESTfulApi(); // Api for data exchange with server.

    var bReadingFile = false;
    var reader = new FileReader(); // Text file reader.

    // Object for storing Offline Parameters for geo paths in local storage.
    // Manages an array of wigo_ws_GeoPathMap.OfflineParams objects.
    function OfflineParamsAry() {
        // Searches for element in this array.
        // Returns wigo_ws_GeoPath.OfflineParams object of the element found, or null for no match.
        // Arg:
        //  nId: integer for unique record id of Gpx element in this array.
        this.findId = function (nId) {
            var oFound = null;
            var iFound = this.findIxOfId(nId);
            if (iFound >= 0)
                oFound = arParams[iFound];
            return oFound;

        }

        // Searches for element in this array.
        // Returns index in the array at which the element was found, or -1 for no match.
        // Arg:
        //  nId: integer for unique record id of Gpx element in this array.
        this.findIxOfId = function (nId) {
            var iFound = -1;
            for (var i = 0; i >= 0 && i < arParams.length; i++) {
                if (arParams[i].nId === nId) {
                    iFound = i;
                    break;
                }
            }
            return iFound;
        }

        // Sets an element of this array to oParams.
        // If element already exits base on oParams.nId, the element is replaced.
        // Otherwise the element is added.
        // Arg:
        //  oParams: a wigo_ws_GeoPathMap.OfflineParams object.
        this.setId = function(oParams) {
            var iFound = this.findIxOfId(oParams.nId);
            if (iFound >= 0) {
                arParams[iFound] = oParams;
            } else {
                arParams.push(oParams);
            }
        }

        // Returns an Array of all the wigo_ws_GeoPathMap.OfflineParams elements.
        this.getAll = function () {
            return arParams;
        }
        
        // Returns number of elements in this array.
        this.Count = function () {
            return arParams.length;
        }

        // Loads this object from local storage.
        this.LoadFromLocalStorage = function () {
            var sParams = localStorage[sOfflineParamsKey];
            if (sParams !== undefined)
                arParams = JSON.parse(sParams);
            
            var gpxPathLS, oParam;
            for (var i = 0; i < arParams.length; i++) {
                oParam = arParams[i];
                // Attach functions to the restored gpxPath object because
                // the functions are lost when saved to local storage.
                gpxPathLS = oParam.gpxPath;
                if (gpxPathLS)
                    wigo_ws_GpxPath.AttachFcns(gpxPathLS);
            }
        };
        // Saves this object to local storage.
        this.SaveToLocalStorage = function () {
            localStorage[sOfflineParamsKey] = JSON.stringify(arParams);
        }
        var arParams = new Array(); // Array of wigo_ws_GeoPathMap.OfflineParams.

        this.LoadFromLocalStorage();
    }

    // Array of offline parameters for geo paths.
    var arOfflineParams = new OfflineParamsAry();

    // Object for the My Trail Settings.
    function GeoTrailSettings() {
        // Returns the current settings, a wigo_ws_GeoTrailSettings object.
        // Note: The current settings are the save as those in localStorage.
        //       However, for efficiency localStorage is only accessed 
        //       during construction and this.SaveToLocalStorage(settings)
        //       updates the local settings var.
        this.getSettings = function () {
            return settings;
        };

        // Saves settings for My Geo Trail to local storage.
        // Arg
        //  settings: wigo_ws_GeoTrailSettings object giving the settings.
        this.SaveToLocalStorage = function (oSettings) {
            settings = oSettings; // Save to local var.
            if (localStorage)
                localStorage[sGeoTrailSettingsKey] = JSON.stringify(settings);
        };

        // Loads this object from local storage. 
        this.LoadFromLocalStorage = function() {
            if (localStorage && localStorage[sGeoTrailSettingsKey]) {
                settings = JSON.parse(localStorage[sGeoTrailSettingsKey]);
                // Check for new members of GeoTrailSettings that could be missing from old data.
                if (!settings.dPrevGeoLocThres)
                    settings.dPrevGeoLocThres = 10.0;
                if (!settings.bEnableGeoTracking)
                    settings.bEnableGeoTracking = false;
                if (!settings.secsPhoneVibe)
                    settings.secsPhoneVibe = 0.0;
                if (!settings.secsPebbleVibe)
                    settings.secsPebbleVibe = 1.0;
                if (!settings.countPhoneBeep)
                    settings.countPhoneBeep = 1;
            }
            return settings;
        };

        var settings = new wigo_ws_GeoTrailSettings(); // Local var of settings.
    }
    
    // Settings for My Geo Trail.
    var geoTrailSettings = new GeoTrailSettings();
    geoTrailSettings.LoadFromLocalStorage();
}
