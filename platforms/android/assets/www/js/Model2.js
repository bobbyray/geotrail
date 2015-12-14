'use strict';
// Object for the Model (data) used by html page.

// Object for settings for My Geo Trail saved/loaded by model.
function wigo_ws_GeoTrailSettings() {
    // Boolean indicating geo location tracking is allowed.
    this.bAllowGeoTracking = true;
    // Float for period for updating geo tracking location in seconds.
    this.secsGeoTrackingInterval = 30;
    // Float for distance in meters for threshold beyond which nearest distance to path is 
    // considered to be off-path.
    this.mOffPathThres = 30;
    // Boolean indication geo location tracking is enabled.
    // Note: If this.bAllowGeoTracking is false, this.bEnableAbleTracking is ignored
    //       and tracking is not enabled.
    this.bEnableGeoTracking = false;
    // Boolean to indicate alert is issued when off-path.
    this.bOffPathAlert = true;
    // Boolean to indicate a phone alert (vibration) is given when off-path. 
    this.bPhoneAlert = true;
    // Float for number of seconds for phone to vibrate on an alert.
    this.secsPhoneVibe = 0.0;
    // Integer for number of beeps on an alert. 0 indicates no beep.
    this.countPhoneBeep = 1;
    // Boolean to indicate a Pebble watch alert (vibration) is given when off-path.
    this.bPebbleAlert = true;
    // Integer for number of times to vibrate Pebble on a Pebble alert. 0 indicates no vibration.
    this.countPebbleVibe = 1;
    // Float for distance in meters for threshold for minimum change in distance
    // for previous geo-location to be updated wrt to current geo-location.
    this.dPrevGeoLocThres = 40.0;
    // Boolean to indicate a mouse click (touch) simulates getting the geo-location
    // at the click point. For debug only.
    this.bClickForGeoLoc = false;

    // ** 20151204 Settings added for home area rectangle.
    // Southwest corner of home area rectangle.
    this.gptHomeAreaSW = new wigo_ws_GeoPt();
    // NorthEastCorner of home areo rectangle.
    this.gptHomeAreaNE = new wigo_ws_GeoPt();
    // Initialize home area to Mount Hood National Forest.
    // This is the home area used if user has not saved one,
    // and is the ome area when app is initially installed.
    this.gptHomeAreaSW.lat = 45.02889163330814;
    this.gptHomeAreaSW.lon = -122.00729370117188;
    this.gptHomeAreaNE.lat = 45.622682153628226;
    this.gptHomeAreaNE.lon = -121.51290893554688;
    // ** 
}


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
        var bOk = api.GpxPut(gpx, this.getAccessHandle(), onDone);
        return bOk;
    };

    // Deletes gpx data record from server.
    // Returns true for data transfer started; false if another transfer is already in progress. 
    // Uses aysnc callback onDone.
    // Args:
    //  gpxId: {sOwnerId, string, nId: integer}
    //      sOwner: owner id of record to delete.
    //      nId: unique record id of record to delete.
    //  onDone: async callback on completion with this signature:
    //      bOk: boolean for success.
    //      sStatus: status string describing result.
    this.deleteGpx = function (gpxId, onDone) {
        var bOk = api.GpxDelete(gpxId, this.getAccessHandle(), onDone);
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
    //      gpxList: array of wigo_ws_Gpx objects found in database.
    //      sStatus: string indicating result. (For bOk false, an error msg.)
    this.getGpxList = function (sOwnerId, nShare, onDone) {
        var bOk = api.GpxGetList(sOwnerId, nShare, this.getAccessHandle(), onDone);
        return bOk;
    }

    // Gets list of gpx data objects from the server for paths within a geo rectangle.
    // Returns true for data transfer started; false if another transfer is already started.
    // Uses async callback onDone.
    // Args:
    //  sOwnerId: string for owner id of Gpx data objecct.
    //  nShare: byte for enumeration of sharing mode for Gpx data object.
    //  gptSW: wigo_ws_GeoPt object for SouthWest corner of rectangle.
    //  gptNE: wigo_ws_GeoPt object for NorthEast corner of rectangle.
    //  onDone: async callback on completion with this signature:
    //      bOk: boolean indicating success.
    //      gpxList: array of wigo_ws_Gpx objects found in database.
    //      sStatus: string indicating result. (For bOk false, an error msg.)
    this.getGpxListByLatLon = function (sOwnerId, nShare, gptSW, gptNE, onDone) {
        var bOk = api.GpxGetListByLatLon(sOwnerId, nShare, gptSW, gptNE, this.getAccessHandle(), onDone);
        return bOk;
    }

    // Authenticates user with database server.
    // Returns true for request to server started, 
    //  false if another request is already in progress.
    // Args:
    //  accessToken: string for accessToken, which server uses to verify authentication.
    //  userID: string for unique user id.
    //  userName: string or user name.
    //  onDone: callback on async completion, Signature:
    //      json {status, accessHandle, msg}:
    //          status: integer for status define by this.EAuthStatus().
    //          accessHandle: string for data access handle (user identifier) from GeoPaths server.
    //          msg: string describing the status.
    //      
    this.authenticate = function (accessToken, userID, userName, onDone) {
        var authData = { 'accessToken': accessToken, 'userID': userID, 'userName': userName };
        var bOk = api.Authenticate(authData, onDone);
        return bOk;
    };


    // Logouts (revokes authentication) for owner at the database server.
    // Args:
    //  onDone: callback on asynchronous completion, Signature:
    //      bOk: boolean indicating success.
    //      sMsg: string describing the result.
    // Returns boolean synchronously indicating successful post to database server.
    this.logout = function (onDone) {
        var logoutData = { 'accessHandle': this.getAccessHandle(), 'userID': this.getOwnerId() };
        var bOk = api.Logout(logoutData, onDone);
        return bOk;
    };

    // Returns true if there is an owner id and access handle.
    this.IsOwnerAccessValid = function () {
        var ah = this.getAccessHandle();
        var id = this.getOwnerId();
        var bOk = ah.length > 0 && id.length > 0;
        return bOk;
    };

    // Returns enumeration object for sharing mode of gpx data.
    // Returned obj: { public: 0, protected: 1, private: 2 }
    this.eShare = function () { return api.eShare(); };

    // Returns enumeration object authentication status received from database server.
    // See GeoPathsRESTful.eAuthStatus for enumeration.
    this.eAuthStatus = function () {
        return api.eAuthStatus();
    }

    // Returns ref to enumeration object for duplication of sName of Gpx object.
    this.eDuplicate = function () {
        return api.eDuplicate(); 
    };

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


    // Returns OwnerId (aka user ID) string from localStorage.
    // Returns empty string if OwnerId does not exist.
    this.getOwnerId = function () {
        var sOwnerId;
        if (localStorage[sOwnerIdKey])
            sOwnerId = localStorage[sOwnerIdKey];
        else
            sOwnerId = "";
        return sOwnerId;
    }

    // Sets OwnerId (aka user ID) in localStorage.
    // Arg:
    //  sOwnerId: string for the OwnerId.
    this.setOwnerId = function (sOwnerId) {
        localStorage[sOwnerIdKey] = sOwnerId;
    }

    // Returns owner name string from localStorage.
    // Returns empty string if name does not exist.
    this.getOwnerName = function () {
        var sOwnerName;
        if (localStorage[sOwnerNameKey])
            sOwnerName = localStorage[sOwnerNameKey];
        else
            sOwnerName = "";
        return sOwnerName;
    };

    // Sets owner name in localStorage.
    // Arg:
    //  sOwnerName is string for the owner name.
    this.setOwnerName = function (sOwnerName) {
        localStorage[sOwnerNameKey] = sOwnerName;
    };

    // Returns access handle string from localStorage.
    // Returns empty string if access handle does not exist.
    this.getAccessHandle = function () {
        var sAccessHandle;
        if (localStorage[sAccessHandleKey])
            sAccessHandle = localStorage[sAccessHandleKey];
        else
            sAccessHandle = "";
        return sAccessHandle;
    };

    // Returns access handle from localStorage.
    // Arg:
    //  sAccessHandle is string for the access handle.
    this.setAccessHandle = function (sAccessHandle) {
        localStorage[sAccessHandleKey] = sAccessHandle;
    };

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

    // Clears the list of offline parameters and saves the empty list to localStorage.
    this.clearOffLineParamsList = function () {
        arOfflineParams.Clear();
        arOfflineParams.SaveToLocalStorage();
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
    var sAccessHandleKey = "GeoPathsAccessHandleKey";
    var sOwnerNameKey = "GeoPathsOwnerNameKey";

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
        
        // Removes all elementsw of this array.
        this.Clear = function () {
            var nCount = arParams.length;
            for (var i = 0; i < nCount; i++) {
                arParams.pop();
            }
        };

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
                if (!settings.countPhoneBeep)
                    settings.countPhoneBeep = 1;
                if (!settings.countPebbleVibe)
                    settings.countPebbleVibe = 1;
                // ** 20151294 Members added for home area rectangle.
                if (!settings.gptHomeAreaSW || !settings.gptHomeAreaNE) {
                    // Default to area around Oregon.
                    settings.gptHomeAreaSW = new wigo_ws_GeoPt();
                    settings.gptHomeAreaSW.lat = 38.03078569382296;
                    settings.gptHomeAreaSW.lon = -123.8818359375;
                    settings.gptHomeAreaNE = new wigo_ws_GeoPt();
                    settings.gptHomeAreaNE.lat = 47.88688085106898;
                    settings.gptHomeAreaNE.lon = -115.97167968750001;
                }
                // **
            }
            return settings;
        };

        var settings = new wigo_ws_GeoTrailSettings(); // Local var of settings.
    }
    
    // Settings for My Geo Trail.
    var geoTrailSettings = new GeoTrailSettings();
    geoTrailSettings.LoadFromLocalStorage();
}
