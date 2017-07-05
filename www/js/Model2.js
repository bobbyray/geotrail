'use strict';
/* 
Copyright (c) 2015, 2016 Robert R Schomburg
Licensed under terms of the MIT License, which is given at
https://github.com/bobbyray/MitLicense/releases/tag/v1.0
*/
// Object for settings for My Geo Trail saved/loaded by model.
function wigo_ws_GeoTrailSettings() {
    // Boolean indicating geo location tracking is allowed.
    this.bAllowGeoTracking = true;

    // Boolean indicating that navigator.geolocation.watchPosition(...) is used for tracking.
    // For false, a wakeup timer is used for tracking.
    // If this.bAllowGeoTracking is false, this property is ignored.
    this.bUseWatchPositionForTracking = true; 

    // Float for period for updating geo tracking location in seconds.
    this.secsGeoTrackingInterval = 3 * 60; // Initially default was 30;
    // Float for distance in meters for threshold beyond which nearest distance to path is 
    // considered to be off-path.
    this.mOffPathThres = 30;
    // Float for distance in meters from previous tracking geolocation for which
    // alert is issued if off trail.  
    this.mOffPathUpdate = 50; 
    // Boolean indicating geo location tracking is initially enabled.
    // Note: If this.bAllowGeoTracking is false, this.bEnableAbleTracking is ignored
    //       and tracking is not enabled.
    // Note 20161205: this.this.bEnableGeoTracking is no longer used.
    this.bEnableGeoTracking = false;
    // String whose value is english or metric to indicete units displayed for distances.
    // Note: Internally distances are in meters and converted to english or metric on display.
    this.distanceUnits = 'english'; 
    // Boolean to indicate phone alert is initially enabled.
    // Note: bOffPathAlert is misnamed. Still using the misleading name 
    //       so that localData storage key is not changed. 
    this.bOffPathAlert = true;
    // Boolean to indicate a phone alert (vibration) is given when off-path. 
    this.bPhoneAlert = true;
    // Float for number of seconds for phone to vibrate on an alert.
    this.secsPhoneVibe = 0.0;
    // Integer for number of beeps on an alert. 0 indicates no beep.
    this.countPhoneBeep = 1;
    // Distance in kilometers to issue periodic alert that specified distance interval 
    // has been travel when recording. 
    this.kmRecordDistancAlertInterval = 2.0 * 1.60934;  //0.5  miles convert to meters. 
    // Boolean to indicate a Pebble watch alert (vibration) is given when off-path.
    this.bPebbleAlert = true;
    // Integer for number of times to vibrate Pebble on a Pebble alert. 0 indicates no vibration.
    this.countPebbleVibe = 1;
    // Float for distance in meters for threshold for minimum change in distance
    // for previous geolocation to be updated wrt to current geolocation.
    this.dPrevGeoLocThres =5.0; //20161205 was 40.0;
    // Float for velocity in meters/sec for velocity limit used in filtering spurious record points.
    this.vSpuriousVLimit = 5.0; 
    // Float for body mass in kilograms.
    this.kgBodyMass = 75.0; 
    // Float for converting kinetic Calories to burned calories, equals kinetic calories / burned calories.
    // Note: burned calories are calculated as follows: kinetic calories / this conversion factor.
    this.calorieConversionEfficiency = 0.10; 
    // Boolean to indicate a mouse click (touch) simulates getting the geolocation
    // at the click point. For debug only.
    this.bClickForGeoLoc = false;
    // Boolean to indicate compass heading arrow is drawn on map.
    this.bCompassHeadingVisible = true; // 20160609 added.
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

    // Schema level (version) for this object.
    // Remarks:
    // Always constructed to 0. Set to schema level when object is persisted (saved to localStorage).
    this.nSchema = 0;  
    // ** 
}

// Object for version for My Geo Trail saved/loaded by model.
function wigo_ws_GeoTrailVersion() { // 20160610 added.
    // String for app version id saved in settings.
    // Note: Used to detect when app version has changed.
    this.sVersion = ""; 
    // Boolean to indicated Terms of Use has been accepted.
    this.bTermsOfUseAccepted = false; 
}

// Object for statistics for a trail that has been recorded.
function wigo_ws_GeoTrailRecordStats() { 
    this.nTimeStamp = 0; // integer. Time value of javascript Date object as an integer.
    this.msRunTime = 0;  // number. Run time for the recorded path in milliseconds.
    this.mDistance = 0;  // number. Distance of path in meters.
    this.caloriesKinetic = 0;      // number. Kinetic engery in calories to move body mass along the path.
    this.caloriesBurnedCalc = 0;   // number. Calories burned calculated by the GeoTrail app.
    this.caloriesBurnedActual = 0; // number. Actual calories looked up by user from some web site. 
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
        // Quit if internet access is not available.
        if (!CheckNetAccess(onDone)) {  
            return true; 
        }        
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
        // Quit if internet access is not available.
        if (!CheckNetAccess(onDone)) {  
            return true; 
        }        
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
        // Quit immediately if internet access is not available.
        if (!CheckNetAccessGetList(onDone)) { 
            return true;
        }
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
        // Quit immediately if internet access is not available.
        if (!CheckNetAccessGetList(onDone)) { 
            return true;
        }
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
    //     errorResult: AuthResult object from api:  {status, accessHandle, msg}:
    //          errorResult.status: integer for status define by this.EAuthStatus().Error.
    //          error.msg: string describing the status.
    //          other fields of errorResult are defaults, empty strings.
    this.authenticate = function (accessToken, userID, userName, onDone) {
        var bNetOnline = networkInfo.isOnline();  
        var authData = { 'accessToken': accessToken, 'userID': userID, 'userName': userName };
        var bOk = api.Authenticate(authData, onDone, bNetOnline);  
        return bOk;
    };


    // Logouts (revokes authentication) for owner at the database server.
    // Args:
    //  onDone: callback on asynchronous completion, Signature:
    //      bOk: boolean indicating success.
    //      sMsg: string describing the result.
    // Returns boolean synchronously indicating successful post to database server.
    this.logout = function (onDone) {  
        // Quit if internet access is not available.
        if (!CheckNetAccess(onDone)) { 
            return true; 
        }        
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

    // Sets offline params object for a map in local storage.
    // Args:
    //  oParams: wigo_ws_GeoPathMap.OfflineParams object for a geo path.
    //           oParams.nId is used to find an existing object in the array.
    //           On a match the oParams replaces the array element, otherwise 
    //           oParams is added to the array.
    this.setOfflineParams = function (oParams) {
        arOfflineParams.setId(oParams);
        arOfflineParams.SaveToLocalStorage();
    };

    // Replaces offline params object for a map in local storage.
    // Args:
    //  nId: number. id of offline path to replace.
    //  oParams: wigo_ws_GeoPathMap.OfflineParams object. The oject that replaces object identified by nId.
    // Note: If nId is not found in list of offline geo paths, the list is unchanged.
    this.replaceOfflineParams = function(nId, oParams) {
        var bReplaced = arOfflineParams.replaceId(nId, oParams);
        arOfflineParams.SaveToLocalStorage(); 
        return bReplaced;
    };

    // Deletes offline params object for a map in local storage.
    // Args:
    //  nId: number. id of offline path to replace.
    //               nId matches a member of wigo_ws_GeoPathMap.OfflineParams object in the list.
    //  oParams: wigo_ws_GeoPathMap.OfflineParams object. The oject that replaces object identified by nId.
    // Note: If nId is not found in list of offline geo paths, the list is unchanged.
    this.deleteOfflineParams = function(nId) { 
        var bDeleted = arOfflineParams.deleteId(nId);
        arOfflineParams.SaveToLocalStorage(); 
        return bDeleted;
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
        // Always reload from local storage. arOfflineParams.arParms may have been reset.
        // (Resetting arOfflineParams.arParms actually happened.)
        return arOfflineParams.getAll();
    };

    // Clears the list of offline parameters and saves the empty list to localStorage.
    this.clearOffLineParamsList = function () {
        arOfflineParams.Clear();
        arOfflineParams.SaveToLocalStorage();
    };

    // Clears record stats object in local storage.
    this.clearRecordStats = function() { 
        arRecordStats.Clear();
    };
    
    // Sets record stats object in local storage.
    // Arg:
    //  status: wigo_ws_GeoTrailRecordStats obj. The stats to save.
    this.setRecordStats = function(stats) { 
        arRecordStats.setId(stats);
    };

    // Returns list of record stats objects, which is
    // Array oibjec of wigo_ws_GeoTrailRecordStats objects.
    this.getRecordStatsList = function() { 
        return arRecordStats.getAll();
    };

    // Returns ref to last wigo_ws_GeoTrailRecordStats in this array.
    this.getLastRecordStats = function() {
        return arRecordStats.getLast();
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

    // Sets version in localStorage.
    this.setVersion = function(version) {
        geoTrailVersion.SaveToLocalStorage(version);
    };

    // Returns current version, a wigo_ws_GeoTrailVersion object.
    this.getVersion = function() {
        return geoTrailVersion.getVersion();
    }

    // ** Private members
    var sOwnerIdKey = "GeoPathsOwnerId";
    var sAccessHandleKey = "GeoPathsAccessHandleKey";
    var sOwnerNameKey = "GeoPathsOwnerNameKey";

    var sOfflineParamsKey = 'GeoPathsOfflineParamsKey';
    var sGeoTrailSettingsKey = 'GeoTrailSettingsKey'; 
    var sGeoTrailVersionKey = 'GeoTrailVersionKey'; 
    var sRecordStatsKey = 'GeoTrailRecordStatsKey';  

    var api = new wigo_ws_GeoPathsRESTfulApi(); // Api for data exchange with server.

    var bReadingFile = false;
    var reader = new FileReader(); // Text file reader.

    // Helper to check if internet access is available.
    // Returns true if internet access is available.
    // Arg:
    //  onDone: callback function(bOk, gpxList, sStatus).
    //      Called only if internet access is NOT available.
    //      bOk: boolean. false indicating failure.
    //      gpxList:  array of wigo_ws_Gpx objects. empty array.
    //      sStatus: string. status indicating internet access is not available.
    function CheckNetAccessGetList(onDone) {
        var bOk = true;
        if (!networkInfo.isOnline()) {
            bOk = false;
            if (typeof(onDone) === 'function' ) {
                onDone(bOk, [], "Internet access is not available.");
            }
        }
        return bOk;
    }

    // Helper to check if internet access is available.
    // Returns true if internet access is available.
    // Arg:
    //  onDone: callback function(bOk, gpxList, sStatus).
    //      Called only if internet access is NOT available.
    //      bOk: boolean. false indicating failure.
    //      sStatus: string. status indicating internet access is not available.
    function CheckNetAccess(onDone) {
        var bOk = true;
        if (!networkInfo.isOnline()) { 
            bOk = false;
            if (typeof(onDone) === 'function' ) {
                onDone(bOk, "Internet access is not available.");
            }
        }
        return bOk;
    }


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
        };

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
        };

        // Replaces an element of this array with oParams.
        // If element is not found, there is no change.
        // Return true if element is found, false otherwise.
        // Arg:
        //  nId: number. id of the path for element for element to replace.        
        //  oParams: a wigo_ws_GeoPathMap.OfflineParams object. The replacement object.
        this.replaceId = function(nId, oParams) { 
            var iFound = this.findIxOfId(nId);
            if (iFound >= 0) {
                arParams[iFound] = oParams;
            }
            var bReplaced = iFound >= 0;
            return bReplaced;
        };

        // Deletes an element of this array.
        // If element is not found, there is no change.
        // Return true if element is found, false otherwise.
        // Arg:
        //  nId: number. id of the path for element for element to replace.        
        //       nId matches nId member of a wigo_ws_GeoPathMap.OfflineParams object in the path list.
        this.deleteId = function(nId, oParams) { 
            var iFound = this.findIxOfId(nId);
            if (iFound >= 0) {
                // Delete the element found.
                arParams.splice(iFound, 1); 
            }
            var bDeleted = iFound >= 0;
            return bDeleted;
        };

        // Returns an Array of all the wigo_ws_GeoPathMap.OfflineParams elements.
        this.getAll = function () {
            return arParams;
        };
        
        // Removes all elements of this array.
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

    // Object for storing an array of wigo_ws_GeoTrailRecordStats objects.
    // Note: Construction loads this object from localStorage.
    function RecordStatsAry() { 
        // Sets a record stats element in this array and saves array to localStorage. 
        // Arg: 
        //  stats wigo_ws_RecordStats. stats element to set.
        //        stats.nTimeStamp is the unique id for the element.
        //        If stats.nTimeStamp matches an existing element, the
        //        element is replaced; otherwise it is added.
        this.setId = function(stats) {  
            var iAt = FindIxOfId(stats.nTimeStamp);
            if (iAt < 0) {
                iAt = arRecordStats.length;
            }       
            arRecordStats[iAt] = stats;
            this.SaveToLocalStorage();    
        };
        // Returns ref to array of all the wigo_ws_RecordStats objects.
        this.getAll = function() {
            return arRecordStats;
        };

        // Returns ref to last wigo_ws_GeoTrailRecordStats object in array.
        // Returns null if there is no last element.
        this.getLast = function() {
            var iLast = arRecordStats.length-1;
            var last = iLast >= 0 ? arRecordStats[iLast] : null;
            return last;
        };

        // Clears this array.
        this.Clear = function() {
            var nCount = arRecordStats.length;
            for (var i=0; i < nCount; i++) {
                arRecordStats.pop();
            }
        };

        // Loads this object from local storage.
        this.LoadFromLocalStorage = function() {
            var sRecordStats = localStorage[sRecordStatsKey];
            if (sRecordStats !== undefined) 
                arRecordStats = JSON.parse(sRecordStats)
            else 
                arRecordStats = [];
        };

        // Saves this object to local storage.
        this.SaveToLocalStorage = function() {
            localStorage[sRecordStatsKey] = JSON.stringify(arRecordStats);
        };

        // Searches for record stats element.
        // Returns index of element if found, or -1 if not found.
        // Arg:
        //  nTimeStamp: number. nTimeStamp id of element to match.
        function FindIxOfId(nTimeStamp) { 
            var iFound = -1;
            var el;
            for (var i=0; i < arRecordStats.length; i++) {
                el = arRecordStats[i];
                if (el.nTimeStamp === nTimeStamp) {
                    iFound = i;
                    break;
                }
            }
            return iFound;
        }

        var arRecordStats = []; // Array of wigo_ws_GeoTrailRecordStats objects.

        this.LoadFromLocalStorage();
    }
    var arRecordStats = new RecordStatsAry();  

    // Object for the Geo Trail Settings persisted to localStorage.
    function GeoTrailSettings() {
        // Returns the current settings, a wigo_ws_GeoTrailSettings object.
        // Note: The current settings are the same as those in localStorage.
        //       However, for efficiency localStorage is only loaded 
        //       during construction and this.SaveToLocalStorage(settings)
        //       updates the local settings var and saves to localStorage.
        this.getSettings = function () {
            return settings;
        };

        // Saves settings for My Geo Trail to local storage.
        // Arg
        //  oSettings: wigo_ws_GeoTrailSettings object giving the settings.
        // Remarks:
        // The local var nSchemaSaved is assigned by this.SaveToLocalStorage() to the nSchema property of settings
        // so that nSchema is correct when saved.
        this.SaveToLocalStorage = function (oSettings) {
            settings = oSettings; // Save to local var.
            settings.nSchema = nSchemaSaved;
            if (localStorage)
                localStorage[sGeoTrailSettingsKey] = JSON.stringify(settings);
        };

        // Loads this object from local storage. 
        // Remarks:
        // The defaults for the underlying wigo_ws_GeoTrailSettings object can be changed
        // for a new release of code. The property nSchema of wigo_ws_GeoTrailSettings
        // provides a way to determine if defaults for settings are updated for a new release.
        // If defaults need to be updated when loading from local storage, the updates 
        // are applied and then saved to local storage.
        // The local var nSchemaSaved is assigned by this.SaveToLocalStorage() to the nSchema property of settings.
        // var nSchemaSaved needs to be incremented when defaults for a new release are changed.
        this.LoadFromLocalStorage = function() {
            if (localStorage && localStorage[sGeoTrailSettingsKey]) {
                settings = JSON.parse(localStorage[sGeoTrailSettingsKey]);
                if (typeof(settings.nSchema) === 'undefined')
                    settings.nSchema = 0;
            } else {
                    settings.nSchema = 0;
            }
            
            // If settings loaded from localStorage is downlevel, update and save it.
            if (settings.nSchema < nSchemaSaved) {
                // ** changes for nSchema 1
                UpdateIfNeeded('secsPhoneVibe', 1, 0.0);
                UpdateIfNeeded('countPhoneBeep', 1, 1);
                UpdateIfNeeded('countPebbleVibe', 1, 1);
                UpdateIfNeeded('bPebbleAlert', 1, false);
                //20151294 Members added for home area rectangle.
                // Default to area around Oregon.
                var gptHomeAreaSW = new wigo_ws_GeoPt();
                gptHomeAreaSW.lat = 38.03078569382296;
                gptHomeAreaSW.lon = -123.8818359375;
                UpdateIfNeeded('gptHomeAreaSW', 1, gptHomeAreaSW);
                var gptHomeAreaNE = new wigo_ws_GeoPt();
                gptHomeAreaNE.lat = 47.88688085106898;
                gptHomeAreaNE.lon = -115.97167968750001;
                UpdateIfNeeded('gptHomeAreaNE', 1, gptHomeAreaNE);
                // member added for compass heading visible on map.
                UpdateIfNeeded('bCompassHeadingVisible', 1, true);
                // **

                // ** Changes for nSchema 2.
                // Check for new members of GeoTrailSettings that could be missing from old data.
                UpdateIfNeeded('dPrevGeoLocThres', 2, 5.0);  // Was 40 meters.
                //12052016 settings.bEnableGeoTracking is no longer used. Ensure set to false for safety.
                UpdateIfNeeded('bEnableGeoTracking', 2, false);
                //20161119 added member settings.mOffPathUpdate
                UpdateIfNeeded('mOffPathUpdate', 2, 50);
                //20161121 added member settings.bUseWatchPositionForTracking,
                UpdateIfNeeded('bUseWatchPositionForTracking', 2, true);
                //20161203 added member settings.distanceUnits 
                UpdateIfNeeded('distanceUnits', 2, 'english');
                // **

                // ** Changes for nSchema 3.
                // 20170216 Added setting.vSpuriousVLimit
                UpdateIfNeeded('vSpuriousVLimit', 3, 5.0); 
                // 20170223 Added setting.kgBodyMass.
                UpdateIfNeeded('kgBodyMass', 3, 75.0)
                // ** 

                // ** Changes for nSchema 4.
                // 20170501 added setting.calorieConversionEfficiency
                UpdateIfNeeded('calorieConversionEfficiency', 4, 0.10); 
                // **

                // ** Changes for nSchema 5.  
                UpdateIfNeeded('kmRecordDistancAlertInterval', 5, 2.0*1.60934);
                // **

                // ** Changes for next nSchema x goes here.
                // **** BE SURE to set nSchemaSaved below to x. 
                
                this.SaveToLocalStorage(settings);
            }
            return settings;
        };
        // Schema number for settings.nSchema when saving settings.
        // Increase nSchemaSaved when adding new settings property or 
        // changing default for a settings property. 
        var nSchemaSaved = 5;  // Must be set to next number when next nSchema change is added.

        var settings = new wigo_ws_GeoTrailSettings(); // Local var of settings.

        // Updates settings if settings.nSchema is down level.
        // Args:
        //  propertyName: string. Name of property to update in settings.
        //  nSchema: integer. property is updated if nSchema > settings.nSchema.
        //  value: any type. value assigned to property if updated.
        function UpdateIfNeeded(propertyName, nSchema, value) { 
            if (typeof(settings[propertyName]) === 'undefined') {
                settings[propertyName] = value;
            } else if (nSchema > settings.nSchema) {
                settings[propertyName] = value;
            }
        }

    }
    
    // Object for GeoTrail Version saved in localStorage.
    function GeoTrailVersion() {
        // Returns the current version, a wigo_ws_GeoTrailVersion object.
        // Note: The current version is the same as in localStorage.
        //       However, for efficiency localStorage is only loaded 
        //       during construction and this.SaveToLocalStorage(version)
        //       updates the local version var and saves to localStorage.
        this.getVersion = function () {
            return version;
        };
        
        // Loads this object from local storage. 
        this.LoadFromLocalStorage = function() {
            if (localStorage && localStorage[sGeoTrailVersionKey]) {
                version = JSON.parse(localStorage[sGeoTrailVersionKey]);
            }
            return version;
        }

        // Saves version for GeoTrail to local storage.
        // Arg
        //  oVersion: wigo_ws_GeoTrailVersion object for the version.
        this.SaveToLocalStorage = function (oVersion) {
            version = oVersion; // Save to local var.
            if (localStorage)
                localStorage[sGeoTrailVersionKey] = JSON.stringify(oVersion);
        };
        var version = new wigo_ws_GeoTrailVersion();

    }
    
    // Settings for My Geo Trail.
    var geoTrailSettings = new GeoTrailSettings();
    geoTrailSettings.LoadFromLocalStorage();

    // Version for GeoTrail app in localStorage.
    var geoTrailVersion = new GeoTrailVersion();
    geoTrailVersion.LoadFromLocalStorage();

    // Network information object. Wrapper for cordova-plugin-network-information.
    var networkInfo = wigo_ws_NewNetworkInformation(window.app.deviceDetails.isiPhone());
}
