'use strict';
/* 
Copyright (c) 2015 - 2018 Robert R Schomburg
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
    this.kmRecordDistancAlertInterval = 2.0 * 1.60934;  // 2.0 miles in kilometers. 
    // Distance in kilometers for distance goal per day for a recorded path.
    this.kmDistanceGoalPerDay = 2.0 * 1.60934;  // 2.0 miles in kilometers. 
    // Boolean to indicate excessive acceleration alert is enabled.
    this.bAccelAlert = false; 
    // Float for excessive acceleration threshold in m/sec^2.
    this.nAccelThres = 35.0;  
    // Float for excessive acceleration velocity in m/sec.
    this.nAccelVThres = 10.0; 
    // Boolean to indicate amination of a path is started automatically when a path is loaded. 
    this.bAutoPathAnimation = false;  
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
    // Boolean to show topology layer on map.     
    this.bTopologyLayer = false;
    // Boolean to show snow cover layer on map.   
    this.bSnowCoverLayer = true; 
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

// Object for RecordStats Xfr with Server
function wigo_ws_RecordStatsXfrInfo() { ////20180319 added
    // number of milliseconds for timestamp of most recent stats item uploaded to server.
    this.nUploadTimeStamp = 0; 
    // Owner (user) id of  previously signed in user.
    this.sPreviousOwnerId = "";
}

// Object for element of array of residual RecordStats items than need to be 
// uploaded to web server for an owner id.
function wigo_ws_RecordStatsXfrResidue() { ////20180321 added
    this.sOwnerId = ""; // String for owner id.
    this.arRecStats = []; // Array of wigo_ws_GeoTrailRecordStats objects for sOwnerId.        
}

// Object for the Model (data) used by html page.
// Model should be sharable by all html pages for GeoPaths site.
// However, Controller and View are different for each page.
function wigo_ws_Model(deviceDetails) {   
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
    };

    // Uploads recorded stats list to server.
    // Args:
    //  arStats: ref to array of wigo_ws_GeoTrailRecordStats objs. the list to upload.
    //  onDone: Asynchronous completion handler. Signature:
    //      bOk: boolean: true for sucessful upload.
    //      sStatus: string: description for the upload result.
    //      Returns: void
    //  Synchronous return: boolean. true indicates upload successfully started.
    // Remarks: User must be signed in. If user is not signed in, calls onDone(..) 
    // immediately indicating user is not signed in and returns false.
    this.uploadRecordStatsList = function (arStats, onDone) { 
        var ah = this.getAccessHandle();
        var id = this.getOwnerId();
        var bStarted = false;
        if (ah.length > 0 && id.length > 0) {
            bStarted = api.UploadRecordStatsList(id, ah, arStats, onDone);
        } else {
            // Can not upload because user id is invalid. 
            bStarted = false;  
            if (onDone) {
                onDone(false, "User must be signed in.");
            }
        }
        return bStarted;
    };

    // Deletes recorded stats list at server.
    // Args:
    //  arTimeStamp: ref to array of number. the list of timestamps identifying wigo_ws_GeoTrailRecordStats objs to delete. 
    //  onDone: Asynchronous completion handler. Signature:
    //      bOk: boolean: true for sucessful delete.
    //      sStatus: string: description for the delete result.
    //      Returns: void
    //  Synchronous return: boolean. true indicates delete successfully started.
    // Remarks: User must be signed in. If user is not signed in, calls onDone(..) 
    // immediately indicating user is not signed in and returns false.
    this.deleteRecordStatsList = function (arTimeStamp, onDone) { 
        var ah = this.getAccessHandle();
        var id = this.getOwnerId();
        var bStarted = false;
        if (ah.length > 0 && id.length > 0) {
            bStarted = api.DeleteRecordStatsList(id, ah, arTimeStamp, onDone);
        } else {
            // Can not delete at server because user id is invalid. 
            bStarted = false; 
            if (onDone) {
                onDone(false, "User must be signed in.");
            }
        }
        return bStarted;
    };

    // Downloads recorded stats list from server.
    // Args:
    //  onDone: Asynchronous completion handler. Signature:
    //      bOk: boolean: true for sucessful upload.
    //      arStats: array of wigo_ws_GeoTrailRecordStats objs. the list that has been downloaded.
    //      sStatus: string: description for the upload result.
    //      Returns: void
    //  Synchronous return: boolean. true indicates download successfully started.
    // Remarks: User must be signed in. If user is not signed in, calls onDone(..) 
    // immediately indicating user is not signed in and returns false.
    this.downloadRecordStatsList = function (onDone) { 
        var ah = this.getAccessHandle();
        var id = this.getOwnerId();
        var bStarted = false;
        if (ah.length > 0 && id.length > 0) {
            bStarted = api.DownloadRecordStatsList(id, ah, onDone);
        } else {
            // Can not upload because user id is invalid. 
            bStarted = false;  
            if (onDone) {
                onDone(false, [], "User must be signed in.");
            }
        }
        return bStarted;
    }

    // Resets flag that indicates http request (get or post) is still in progress.
    // Note: May be needed if trying to issue subsequent requests fails due to 
    //       a previous request not completed. 
    this.resetRequest = function() { 
        api.ResetRequest();     
    };

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

    // Sets offline params object for a trail map in local storage.
    // Args:
    //  oParams: wigo_ws_GeoPathMap.OfflineParams object for a geo path.
    //           oParams.nId is used to find an existing object in the array.
    //           For oParams.nId === 0, oParam.nId is converted to next
    //           least negative integer in the array of params so that a unique 
    //           params object is set.  The first negative id is -1.
    //           Note: A negative params.nId inicates the trail for the object 
    //                 has not been uploaded to the web server, but could be.
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

    // Clears record stats array in memory.
    // Note: Does not clear recorded stats in localStorage.
    this.clearRecordStats = function() { 
        arRecordStats.Clear();
    };
    
    // Sets record stats object in memory and in localStorage.
    // Arg:
    //  status: wigo_ws_GeoTrailRecordStats obj. The stats to save.
    this.setRecordStats = function(stats) { 
        arRecordStats.setId(stats);
    };

    // Sets the list of Record Stats items in memory and in localStorage.
    // Arg:
    //  arRecStats: array of wigo_ws_GeoTrailRecordStats obj. The list to set in memory and localStorage.
    this.setRecordStatsList = function(arRecStats) { ////20180323 added
        arRecordStats.setList(arRecStats);
    }

    // Returns list of record stats objects, which is
    // Array object of wigo_ws_GeoTrailRecordStats objects.
    this.getRecordStatsList = function() { 
        return arRecordStats.getAll();
    };

    // Deletes elements from record stats array and saves to localStorage.
    // Arg:
    //  arEl: {keyi: nTimeStamp, ...}. Object (not array). List specifying elements to delete.
    //      keyi: object property name. ith timestamp in the list.
    //      nTimeStamp: number. Timestamp in milliseconds, which is unique, for element to delete.
    this.deleteRecordStats = function(arEl) { 
        arRecordStats.DeleteEls(arEl);
    };

    // Returns ref to last wigo_ws_GeoTrailRecordStats in this array.
    this.getLastRecordStats = function() {
        return arRecordStats.getLast();
    };

    // Returns ref to wigo_ws_GeoTrailRecordStats in this array specified by a timestamp.
    // Returns null if not found.
    // Arg:
    //  nTimeStamp: number. timestamp in milliseconds to find.
    this.getRecordStats = function(nTimeStamp) { 
        return arRecordStats.getId(nTimeStamp);
    };

    // Returns ref to RecordStatsXfr obj. 
    // Summary of object's properties (see function RecordStatsXfr for details):
    //    .getUploadTimeStamp()
    //    .setUploadTimeStamp(nTimeStamp)
    //    .getRecordStatsUploadNeeded() : returns arRecStats portion.
    //    .uploadRecordStatsList(arRecStats, onDone); async call to onDone. same as this.uploadRecordStats(...) property of model.
    //    .deleteRecordStatsList(arTimeStamp, onDone); async all to onDone. same as this.deleteRecordStats(...) property of model.
    //    .getResideAry(sOwnerId) : returns arRecStats residue for owner.
    //    .appendResidueAry(sOwnerId, arRecStats)
    //    .clearResidue(sOwnerId) 
    //  
    this.getRecordStatsXfr = function() { ////20180319 added
        return geoTrailRecordStatsXfr;
    };

    ////20180323 // Sets record stats xfr info to localStorage.
    ////20180323 // Arg:
    ////20180323 //  recordStatsXfr: wigo_ws_RecordStatsXfr obj. the record stats xfr info.
    ////20180323 this.setRecordStatsXfr = function(recordStatsXfr) { ////20180319 added
    ////20180323     geoTrailRecordStatsXfr.SaveToLocalStorage(recordStatsXfr);
    ////20180323 };

    ////20180323 // Returns ref to RecordStatsXfrResidue obj to manage record stats residue 
    ////20180323 // for a user.
    ////20180323 // Properties of returned ref obj:
    ////20180323 //  .getResideAry(sOwnerId) : returns arRecStats.
    ////20180323 //  .appendResidueAry(sOwnerId, arRecStats) 
    ////20180323 //  .clearResidue(sOwnerId)
    ////20180323 //  See function RecordStatsXfrResidue() object description for details.
    ////20180323 this.getRecordStatsXfrResidue = function() {
    ////20180323     return geoTrailRecordStatsXfrResidue;
    ////20180323 };

    
    // Sets settings in localStorage.
    // Arg:
    //  settings: wigo_ws_GeoTrailSettings object for the settings.
    this.setSettings = function (settings) {
        geoTrailSettings.SaveToLocalStorage(settings);
    };

    // Returns current settings, a wigo_ws_GeoTrailSettings object.
    this.getSettings = function () {
        return geoTrailSettings.getSettings();
    };

    // Sets version in localStorage.
    this.setVersion = function(version) {
        geoTrailVersion.SaveToLocalStorage(version);
    };

    // Returns current version, a wigo_ws_GeoTrailVersion object.
    this.getVersion = function() {
        return geoTrailVersion.getVersion();
    };

    // ** Private members
    var sOwnerIdKey = "GeoPathsOwnerId";
    var sAccessHandleKey = "GeoPathsAccessHandleKey";
    var sOwnerNameKey = "GeoPathsOwnerNameKey";

    var sOfflineParamsKey = 'GeoPathsOfflineParamsKey';
    var sGeoTrailSettingsKey = 'GeoTrailSettingsKey'; 
    var sGeoTrailVersionKey = 'GeoTrailVersionKey'; 
    var sRecordStatsKey = 'GeoTrailRecordStatsKey';  
    var sRecordStatsSchemaKey = 'GeoTrailRecordStatsSchemaKey';  
    var sRecordStatsXfrInfoKey = 'GeoTrailRecordStatsXfrInfoKey'; ////20180319 added.
    var sRecordStatsXfrResidueKey = 'GeoTrailRecordStatsXfrResidueKey'; ////20180321 added

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
        // Returns wigo_ws_GeoPathMap.OfflineParams object of the element found, or null for no match.
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
        // If element already exits based on oParams.nId, the element is replaced.
        // Otherwise the element is added.
        // Arg:
        //  oParams: a wigo_ws_GeoPathMap.OfflineParams object.
        //           oParams.nId: integer. Has a special case as follows:
        //              === 0:  Indicates new object to add to the array. 
        //                      Find min nId in array: 
        //                          For min nId negative, convert oParams.nId to 1 less
        //                          For min nId >= 0, convert oParams.nId to -1.
        //                      Negative oParams.nId is used to indicate a data object
        //                      that could be uploaded to server, but has not been.
        //                      The negative nId's need to be unique.
        //                      Note: For first oParams.nId of 0 added, oParams.nId is converted to -1.
        //              otherwise: Replace existing oParams object or add a new one if no match.
        this.setId = function(oParams) {
            var iFound = 0;
            if(oParams.nId === 0) {
                // Add new oParams object.
                // Use least negative oParams.nId, or -1 if no existing negative nId.
                var nIdMin = FindnIdMin();
                oParams.nId = nIdMin < 0 ? nIdMin - 1 : -1;
            } 
            iFound = this.findIxOfId(oParams.nId)
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
        
        // Returns minium nId found in the array.
        // Returns 0 if array is empty.
        function FindnIdMin() { 
            var nIdMin = 0;
            for (var i = 0; i >= 0 && i < arParams.length; i++) {
                if (i === 0) {
                    nIdMin = arParams[0].nId;
                } else if (arParams[i].nId < nIdMin) {
                    nIdMin = arParams[i].nId;
                }
            }
            return nIdMin;
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
        //  stats wigo_ws_GeoTrailRecordStats. stats element to set.
        //        stats.nTimeStamp is the unique id for the element.
        //        If stats.nTimeStamp matches an existing element, the
        //        element is replaced; otherwise it is added.
        this.setId = function(stats) {  
            var iAt = FindIxOfId(stats.nTimeStamp);
            if (iAt < 0) {
                // Redo to insert before timestamp that stats.nTimeStamp is less than
                // searching backwards from last element in the array.
                if (arRecordStats.length == 0) {
                    arRecordStats[0] = stats;
                } else {
                    // Search backwards through the array.
                    let bInserted = false;
                    let i = arRecordStats.length - 1;
                    for (i; i >= 0; i--) {
                        if (stats.nTimeStamp > arRecordStats[i].nTimeStamp) {
                            // Insert stats before previous item which stats was less than.
                            // Note: if stats.nTimeStamp is > timestamp of last array element, 
                            //       then stats is inserted at the end of the array, which should be the typical case.
                            arRecordStats.splice(i+1, 0, stats);
                            bInserted = true;
                            break;
                        }
                    }
                    if (!bInserted)
                        arRecordStats.splice(0, 0, stats); 
                }
            } else {      
                arRecordStats[iAt] = stats;
            }

            this.SaveToLocalStorage();    
        };

        // Sets this array to list of record stats elements and saves to localStorage.
        // Arg:
        //  arRecStats: array of wigo_ws_GeoTrailRecordStats objs. the list to assign to this array.
        this.setList = function(arRecStats) { ////20180323 added
            // Assign the arRecStats to this array without changing ref to this array.
            arRecordStats.splice(0); // Empty this array without changing ref.
            for (var i=0; i < arRecStats.length; i++) {
                arRecordStats.push(arRecStats[i]);
            } 
            this.SaveToLocalStorage(); 
        };

        // Returns ref to record stats obj specified by a timestamp.
        // Returns: wigo_ws_GeoTrailRecordStats ref or null if not found.
        // Arg:
        //  nTimeStamp: number. timestamp in milliseconds to find.
        this.getId = function(nTimeStamp) {
            var recStats = null;
            var iAt = FindIxOfId(nTimeStamp);
            if (iAt >= 0) {
                recStats = arRecordStats[iAt];
            }
            return recStats;
        };

        // Returns ref to array of all the wigo_ws_GeoTrailRecordStats objects.
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
        this.LoadFromLocalStorage = function () {
            // Get schema for arRecordStats from localStorage.
            if (localStorage && localStorage[sRecordStatsSchemaKey]) {
                schema = JSON.parse(localStorage[sRecordStatsSchemaKey]);
            } else {
                schema.level = 0;
            }

            var sRecordStats = localStorage[sRecordStatsKey];
            if (sRecordStats !== undefined) {
                arRecordStats = JSON.parse(sRecordStats);
                // Check for updating schema.
                if (schema.level < nSchemaSaved) {
                    // Change for scheme.level 1.
                    if (schema.level < 1)
                        UpdateSchemaTo1();

                    // ** Changes for next schema.level x goes here.
                    // **** BE SURE to set nSchemaSaved below to x. 
                    this.SaveToLocalStorage();
                }
            } else {
                arRecordStats = [];
            }
        };
        // Schema number for arRecordStats when saving settings.
        // Increase nSchemaSaved when updating property of elements of arRecordStats.
        var nSchemaSaved = 1;  // Must be set to new number when nSchema change is added. 
        var schema = { level: 0 }; // Current schema leval.
        // Update each element of arRecords. Each element is a wigo_ws_GeoTrailRecordStats obj:
        //      add property nModifiedTimeStamp.
        //      remove property caloriesBurnedActual.
        function UpdateSchemaTo1() {
            var statsEl;
            for (var i = 0; i < arRecordStats.length; i++) {
                statsEl = arRecordStats[i];
                // Ensure there is no nModifiedTimeStamp property.
                if ((typeof (statsEl.nModifiedTimeStamp) !== 'undefined')) {
                    delete statsEl.nModifiedTimeStamp;
                }
                // Remove caloriesBurnedActual if it exists.
                if (typeof (statsEl.caloriesBurnedActual) !== 'undefined') {
                    delete statsEl.caloriesBurnedActual;
                }
            }
        }

        // Deletes elements (wigo_ws_GeoTrailRecordStats objs) from the array.
        // Saves updated array to localStorage.
        // Arg:
        //  arEl: {keyi: nTimeStamp, ...}. Object (not array). List specifying elements to delete.
        //      keyi: object property name. key for ith element.
        //      nTimeStamp: number. Timestamp in milliseconds, which is unique, for element to delete.
        this.DeleteEls = function(arEl) { 
            let bChanged = false;
            let ix = -1;
            let arKey = Object.keys(arEl);
            for (let i=0; i < arKey.length; i++) {
                ix = FindIxOfId(arEl[arKey[i]]);
                if (ix >= 0) {
                    arRecordStats.splice(ix, 1); // Delete element at ix.
                    bChanged = true;
                }
            }
            if (bChanged) {
                this.SaveToLocalStorage();
            }
        }

        // Saves this object to local storage.
        this.SaveToLocalStorage = function() {
            localStorage[sRecordStatsKey] = JSON.stringify(arRecordStats);
            schema.level = nSchemaSaved;   
            localStorage[sRecordStatsSchemaKey] = JSON.stringify(schema);
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
                UpdateIfNeeded('bAutoPathAnimation', 5, false);

                // ** Changes for nSchema 6. 
                UpdateIfNeeded('bAccelAlert', 6, false); 
                UpdateIfNeeded('nAccelThres', 6, 35.0);
                UpdateIfNeeded('nAccelVThres', 6, 10.0);

                // ** Changes for nSchema 7. 
                UpdateIfNeeded('bTopologyLayer', 7, false);
                UpdateIfNeeded('bSnowCoverLayer', 7, true); 

                // ** Changes for nSchema 8. 
                UpdateIfNeeded('kmDistanceGoalPerDay', 8, 2.0 * 1.60934); 

                // ** Changes for next nSchema x goes here.
                // **** BE SURE to set nSchemaSaved below to x. 
                
                this.SaveToLocalStorage(settings);
            }
            return settings;
        };
        // Schema number for settings.nSchema when saving settings.
        // Increase nSchemaSaved when adding new settings property or 
        // changing default for a settings property. 
        var nSchemaSaved = 8;  // Must be set to new number when nSchema change is added.

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

    /* ////20180323 REDO to simplify
    // Object for RecordStatsXfr saved in localStorage. 
    // wigo_ws_RecordStatsXfr
    function RecordStatsXfr() { ////20180319 added
        // Returns ref to RecordStatsXfr obj.
        // Note: The obj returned is same as in localStorage.
        //       However for efficiency localStorage is only loaded during
        //       construction and this.SaveToLocalStorage updates the local 
        //       recordStatsXfr var and saves it to localStorage.
        this.getRecordStatsXfr = function() {
            return recordStatsXfr;
        };

        // Loads this obj from localStorage.
        // Returns: wigo_ws_RecordStatsXfr obj.
        this.LoadFromLocalStorage = function() {
            if (localStorage && localStorage[sRecordStatsXfrKey]) { 
                recordStatsXfr = JSON.parse(localStorage[sRecordStatsXfrKey]);
            }
            return recordStatsXfr;
        };

        // Saves record stats info to localStorage.
        // Arg:
        //  oRecordStatsXfr: wigo_ws_RecordStatsXfr obj saved to localStorage.
        this.SaveToLocalStorage = function(oRecordStatsXfr) {
            recordStatsXfr = oRecordStatsXfr;
            if (localStorage) {
                localStorage[sRecordStatsXfrKey] = JSON.stringify(oRecordStatsXfr);
            }
        }
        // Private members.
        var recordStatsXfr = new wigo_ws_RecordStatsXfr();
    }
    */

    // Object for RecordStatsXfr info and residue saved in localStorage.
    // When a new record stats item is formed, it can be uploaded to server.
    // The timestamp of most recent record stats item is saved in order to
    // to only upload items more recent than the previous upload.
    // When an owner (user) logs out, there may be a residue of 
    // wigo_ws_GeoTrailRecordStats objs that have not been upload to the server.
    // This object saves the residue for an owner, so that when the owner signs
    // in again, the residue can be uploaded. Normally wigo_ws_GeoTrailRecordStats
    // objs are uploaded to the server when switching to Stats History View.
    // Constructor arg:
    //  model: ref to wigo_ws_Model, the outer object.
    function RecordStatsXfr(model) { ////20180321 added  ////20180323 was RecordStatsXfrResidue
        // Gets the timestamp of record stats time most recently upload to server.
        // Returns: number. milliseconds for the timestamp.
        this.getUploadTimeStamp = function() {
            return recordStatsXfrInfo.nUploadTimeStamp;
        };

        // Sets the timestamp of record stats item most recently uploaded to server and
        // saves to localStorage.
        // Arg:
        //  nTimeStamp: number. timestamp in milliseconds.
        this.setUploadTimeStamp = function(nTimeStamp) {``
            recordStatsXfrInfo.nUploadTimeStamp = nTimeStamp;
            SaveInfoToLocalStorage();
        };


        // Sets the previous signed in owner (user) id and saves to localStorage.
        this.setPreviousOwnerId = function(sOwnerId) {
            recordStatsXfrInfo.sPreviousOwnerId = sOwnerId;
            SaveInfoToLocalStorage();
        };

        // Previous owner (user) id that is different than currently signed in user.
        // Returns: string. the previous owner id. 
        //          empty string if there was no previous user, which should only
        //          be the case if no one has ever signed in.
        this.getPreviousOwnerId = function() {
            return recordStatsXfrInfo.sPreviousOwnerId;
        };

        // Checks if there are RecordStats items that need to be uploaded to server.
        // Returns: array of wigo_ws_GeoTrailRecordStats objs that need to be uploaded
        //          for current user (owner). 
        //          Returned array is empty if there is nothing to upload
        //          Element 0 of the returned array is the most recent timestamp.
        // Note: the wigo_ws_GeoTrailRecordStats objs in the returned array are those
        //       whose timestamp is more recent than timestamp given by this.getUploadTimeStamp().
        this.getRecordStatsUploadNeeded = function() { ////20180324 added
            var arRecStats = model.getRecordStatsList(); ;
            var nPreviousUploadTimeStamp = this.getUploadTimeStamp();
            // Check if RecordStats items have been added locally that have not been uploaded to server.
            var recStats; 
            var arUploadRecStats = []; 
            for (var i= arRecStats.length-1; i >= 0; i--) {
                recStats = arRecStats[i];
                // If recent local RecStats item is more recent (greater) than last upload, add
                // the item to the upload list.
                if (recStats.nTimeStamp > nPreviousUploadTimeStamp) {
                    arUploadRecStats.push(recStats);
                } else {
                    break;
                }
            }
            return arUploadRecStats;
        };

        // Uploads record stats list to server.
        // Same as model.uploadRecordStatsList(arRecStats, onDone)
        this.uploadRecordStatsList = function(arRecStats, onDone) { ////20180326 added 
            return model.uploadRecordStatsList(arRecStats, onDone);
        };

        // Deletes record stats list at server.
        // Same as model.model.uploadRecordStatsList(arTimeStamp, onDone);
        this.deleteRecordStatsList = function(arTimeStamp, onDone) { ////2080326 added $$$$
            return model.deleteRecordStatsList(arTimeStamp, onDone); 
        };

        // Gets residue of wigo_ws_GeoTrailRecordStats objs for an owner.
        // Arg:
        //  sOwnerId: string for owner id of the residue.
        // Returns: ref to array of wigo_ws_GeoTrailRecordStats objs.
        //          null if there is no residue for sOwnerId.
        //          Note: sOwner may be found, but return an empty array if there no residue.
        this.getResideAry = function(sOwnerId) {
            var arRecStats = null;
            for (var i=0; i < arResidue.length; i++){
                if (arResidue[i].sOwnerId === sOwnerId) {
                    arRecStats = arResidue[i].arRecStats;
                    break;
                }
            }
            return arRecStats;
        };

        // Appends residue of RecordStats items and saves to localStorage.
        // Args:
        //  sOwnerId: string for owner id of the residue.
        //  arRecStats: array of wigo_ws_GeoTrailRecordStats objs. the residue to append.
        // Returns: ref to array of wigo_ws_GeoTrailRecordStats objs. the total residue 
        //          after appending arRecStats.
        this.appendResidueAry = function(sOwnerId, arRecStats) {
            var residue = null;
            for (var i=0; i < arResidue.length; i++) {
                if (arResidue[i].sOwnerId === sOwnerId) {
                    residue = arResidue[i];
                    break;
                }
            }
            if (!residue) {
                // Add new element for owner to arResidue.
                residue = new wigo_ws_RecordStatsXfrResidue();
                residue.sOwnerId = sOwnerId;
                arResidue.push(residue);
            }
            for (var i=0; i < arRecStats.length; i++) {
                residue.arRecStats.push(arRecStats[i]);
            }
            
            SaveResidueToLocalStorage();
            return residue.arRecStats; 
        };

        // Clears the residue for an owner and saves to localStorage.
        // If no owner is found does nothing.
        // Arg:
        //  sOwnerId: string for owner id.
        this.clearResidue = function(sOwnerId) {
            for (var i=0; i < arResidue.length; i++) {
                if (arResidue[i].sOwnerId === sOwnerId) {
                    arResidue[i].arRecStats.splice(0); // Clears array with ref unchanged.
                    SaveResidueToLocalStorage();
                    break;
                }
            }
        };

        // **** Private members

        // Loads record stats xfr info from localStorage.
        // Returns: wigo_ws_RecordStatsXfr obj.
        function LoadInfoFromLocalStorage() {
            if (localStorage && localStorage[sRecordStatsXfrInfoKey]) { 
                recordStatsXfrInfo = JSON.parse(localStorage[sRecordStatsXfrInfoKey]);
            }
            return recordStatsXfrInfo;
        };

        // Saves record stats xfr info to localStorage.
        function SaveInfoToLocalStorage() {
            if (localStorage) {
                localStorage[sRecordStatsXfrInfoKey] = JSON.stringify(recordStatsXfrInfo);
            }
        }

        // Loads arResidue from localStorage.
        function LoadResidueFromLocalStorage() {
            if (localStorage && localStorage[sRecordStatsXfrResidueKey]) { 
                arResidue = JSON.parse(localStorage[sRecordStatsXfrResidueKey]);
            } else {
                arResidue = [];
            }
        };

        // Saves arResidue to localStorage.
        // Arg:
        //  oRecordStatsXfr: wigo_ws_RecordStatsXfr obj saved to localStorage.
        function SaveResidueToLocalStorage() {
            if (localStorage) {
                localStorage[sRecordStatsXfrResidueKey] = JSON.stringify(arResidue);
            }
        }

        // Constructor initialization.
        var arResidue; // Array of wigo_ws_RecordStatsXfrResidue objs.
        LoadResidueFromLocalStorage(); // Sets arResidue from localStorate. 

        var recordStatsXfrInfo = new wigo_ws_RecordStatsXfrInfo();
        LoadInfoFromLocalStorage();
    }


    // Settings for My Geo Trail.
    var geoTrailSettings = new GeoTrailSettings();
    geoTrailSettings.LoadFromLocalStorage();

    // Version for GeoTrail app in localStorage.
    var geoTrailVersion = new GeoTrailVersion();
    geoTrailVersion.LoadFromLocalStorage();

    var geoTrailRecordStatsXfr = new RecordStatsXfr(this); ////20180319 added  
    ////20180323 geoTrailRecordStatsXfr.LoadFromLocalStorage();

    ////20180323 var geoTrailRecordStatsXfrResidue = new RecordStatsXfrResidue(); // constructor loads obj from localStorage. ////20180322 added.

    // Network information object. Wrapper for cordova-plugin-network-information.
    var networkInfo = wigo_ws_NewNetworkInformation(deviceDetails);
}
