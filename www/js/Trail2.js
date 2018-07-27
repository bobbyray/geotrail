'use strict';
/* 
Copyright (c) 2015 - 2017 Robert R Schomburg
Licensed under terms of the MIT License, which is given at
https://github.com/bobbyray/MitLicense/releases/tag/v1.0
*/
// wigo_ws_Model oject is in js/Model.js.

// wigo_GeoPathMap object is in js/GeoPathMapView.js.

// Note: I was thinking of removing the dependency on jquery since the target platforms are ios and android only.
// However, the $.parseXML() function is used to parse an XML string for the gpx data for a path in js/GeoPathsApi2.js.
// While many of the JqueryObject.bind(..) and $(selector) functions have been replaced by 
// HtmlElement.addEventListener(..) and document.getElementById(HTML_ELMENT_id), some have not been 
// converted because jquery is still a requirement. 

// Object for parameters for this.onSavePathOffline()
wigo_ws_GeoPathMap.OfflineParams = function () {
    this.nIx = -1;      // Number for index of wigo_ws_Gpx object in list of objects.
    this.tStamp = new Date(Date.now()); // Date object for when this object is created.
    this.name = '';    // Name of geo path.
    this.nId = -1;      // Record sq id for geo path.
    this.bounds = { sw: new wigo_ws_GeoPt(), ne: new wigo_ws_GeoPt() }; // wigo_ws_GeoPt objects for SouthWest and NorthEast corner of bounds of map.
    this.center = new wigo_ws_GeoPt(); // wigo_ws_GeoPt object for center of map.
    this.zoom = 0;      // Map zoom number.
    this.gpxPath = null;    // wigo_ws_GpxPath object for the geo path.
                            // Note: bounds, center above are for cached map. gpxPath has similar properties for the trail. 
    // Assigns all members of other oject of same type to this object.
    this.assign = function (other) {
        this.nIx = other.nIx;
        this.tStamp = other.tStamp;
        this.name = other.name;
        this.nId = other.nId;
        this.bounds = other.bounds;
        this.center = other.center;
        this.zoom = other.zoom;
        this.gpxPath = other.gpxPath;
    };
};


// Object for View present by page.
function wigo_ws_View() {
    // Work on RecordingTrail2 branch. Filter spurious record points.
    var sVersion = "1.1.033-20180317-1541"; // Constant string for App version. // not yet RecStatsArchive

    // ** Events fired by the view for controller to handle.
    // Note: Controller needs to set the onHandler function.

    // OwnerId entered.
    // Signature of handler:
    //  sOwnerId: string for owner id.
    this.onOwnerId = function (sOwnerId) { };

    // The view mode has changed.
    // Handler Signature:
    //  nMode: byte value of this.eMode enumeration for the new mode.
    this.onModeChanged = function (nMode) { };

    // User selected a geo path from the list of paths.
    // Handler Signature:
    //  nMode: byte value of this.eMode enumeration.
    //  nIx: integer for data index from item in selection list control. 
    this.onPathSelected = function (nMode, nIx) { };

    // Returns offline parameters item for an offline path.
    // Returned object: wigo_ws_GeoPathMap.OfflineParams.
    // Args:
    //  nMode: value of view.eMode. Currently assumes view.eMode.offline.
    //  nIx: number. index of item in list of offline paths. 
    // Note: Returns null if item is not found.
    this.onGetPathOffline = function(nMode, nIx) { return null;};  

    // User requested saving selected geo path in list of geo paths offline.
    // Handler Signature:
    //  nMode: byte value of this.eMode enumeration.
    //  params: wigo_ws_GeoPathMap.OfflineParams object geo path to save offline.
    // Note: Used to save selected trail locally or the map area if no trail is selected.
    //       See this.onSavePathLocally for saving the current recorded trail locally.
    this.onSavePathOffline = function (nMode, params) { };

    // Save locally parameters for a trail.
    // Args
    //  nMode: byte value of this.eMode enumeration. 
    //  params: wigo_ws_GeoPathMap.OfflineParams object geo path to save offline.
    //          Note: For nMode equal view.eMode.online_view and not recording a trail,
    //          params.nId and params.sName are set by this function from corresponding item in gpxArray.
    // Note: Used to save the current recorded trail locally.
    //       See this.onSavePathOffline for saving selected trail or map area locally.
    this.onSavePathLocally = function(nMode, params) { }; 

    // Replaces offline path in list of geo paths.
    // Handler Signature:
    //  nMode: value of view.eMode. Currently assumes view.eMode.offline.
    //  nId: number. id of offline path to replace.
    //  params: wigo_ws_GeoPathMap.OfflineParams object. The oject that replaces object identified by nId.
    // Note: If nId is not found in list of offline geo paths, the list is unchanged.
    this.onReplacePathOffline = function(nMode, params) { };

    // Deletes offline path in list of geo paths.
    // Handler Signature:
    //  nMode: value of view.eMode. Currently assumes view.eMode.offline.
    //  nId: number. id of offline path to replace. 
    //               id is member of  wigo_ws_GeoPathMap.OfflineParams object in the offline list.
    // Note: If nId is not found in list of offline geo paths, the list is unchanged.
    this.onDeletePathOffline = function(nMode, nId) { };  

    // Get list of geo paths to show in a list.
    // Handler Signature:
    //  nMode: byte value of this.eMode enumeration.
    //  sPathOwnerId: string for path owner id for getting the paths from server.
    this.onGetPaths = function (nMode, sPathOwnerId) { };

    // Enumeration for values of selectFind control.
    this.eFindIx = {no_change: 0, home_area: 1, on_screen: 2, all_public: 3, all_mine: 4, my_public: 5, my_private: 6,
        toNum: function (sValue) { // Returns sValue, which is string property name, as a number.
            var ix = this[sValue];
            if (ix === undefined)
                ix = 0;
            return ix;
        }
    };

    // Find list of geo paths to show in a list. 
    // Similar to this.onGetPaths(..) above, except used to find by lat/lon rectangle as well
    // as be user id.
    // Handler Signature
    //  sOwnerId: string for path owner id.
    //  nFindIx: number, this.eFindIx enumeration for kind of find to do.
    //  gptSW: wigo_ws_GeoPt for Southwest corner of rectangle. If null, do not find by lat/lon.
    //  gptNE: wigo_ws_GeoPt for NorthEast corner of rectangle. If null, do not find by lat/lon.
    this.onFindPaths = function (sOwnerId, nFindIx, gptSW, gptNE) { };

    // Gets wigo_ws_GpxPath object for a path.
    // Signature of Handler:
    //  nMode: view.eMode enumeration.
    //  iPathList: number. index to array of data for the paths. 
    //  Returns: wigo_ws_GpxPath obj. Data for path. null if iPathList is invalid.
    this.onGetPath = function(nMode, iPathList) { return null}; 

    //  Creates and returns {nId: int, sPathName: string, sOwnerId: string, sShare: int, arGeoPt: array}:
    //      nId: integer for path record id. 0 indicates new path.
    //      sPathName: string for name of path.
    //      sOwnerId: string for owner id of path.
    //      sShare: string for share value, public or private. 
    //              Note: Matches name of wigo_ws_GeoPathsRESTfulApi.eShare property.
    //      arGeoPt: array of wigo_ws_GeoPt elements defining the path.
    // NOTE: this is NOT an event fired by the view, rather an object to be filled in.
    this.NewUploadPathObj = function() { return NewUploadPathObj();};  

    // Upload to server a path given by a list GeoPt elements.
    // Handler Signature:
    //  nMode: byte value of this.eMode enumeration.
    //  path: Obj created by this.NewUploadPathObj(), see above.
    this.onUpload = function (nMode, path) { };

    // Delete at server a path record by gpxId.
    // Handler signature:
    //  nMode: byte value of this.eMode enumeration.
    //  gpxId: {sOwnerId: string, nId: integer} 
    //      sOwnerId: owner (user) id of logged in user.
    //      nId: unique id for gpx path record at server.
    this.onDelete = function (nMode, gpxId) { };

    // Save the settings paramaters.
    // Handler Signature:
    //  settings: wigo_ws_GeoTrailSettings object for the settings to save.
    this.onSaveSettings = function (settings) { };

    // Get the current settings parameters.
    // Handler Signature:
    //  Args: none
    //  Returns: wigo_ws_GeoTrailSettings object for current setting. May be null.
    this.onGetSettings = function () { };

    // Returns record stats for item specified by a timestamp.
    // Returns: wigo_ws_GeoTrailRecordStats obj or null if not found.
    // Arg:
    //  nTimeStamp: number. the timestamp of stats item to find.
    this.onGetRecordStats = function(nTimeStamp) {return null};
    
    // Gets the last record stats object for a record trail.
    // Handler signature:
    //  Args: none.
    //  Returns wigo_ws_GeoTrailRecordStats object for last stats saved, 
    //      or null if there is no record stats object.
    this.onGetLastRecordStats = function() {};  

    // Gets list of recorded stats.
    // Arg: none.
    // Returns: Array of wigo_ws_GeoTrailRecordStat objects.
    this.onGetRecordStatsList = function() { return [];} 

    // Accessor to  RecordStatsXfr info and residue.
    // Returns: RecordStatsXfr obj.
    this.onGetRecordStatsXfr = function() { return null};
 
    // Sets recorded stats in localStorage.
    // Args: 
    //    stats: literal obj from recordPath.getStats() | wigo_ws_GeoTrailRecordStats obj. stats to be set.
    //           If stats is literal obj from recordPath.getStats, stats is converted to wigo_ws_GeoTrailRecordStats
    //           object that is set in localStorage.
    // Note: 
    // literal obj for stats from recordPath.getStats():
    //   {bOk: boolean, dTotal:number,  msRecordTime: number, msElapsedTime: number, 
    //    tStart: Date | null, kJoules: number, calories: number, nExcessiveV: number, calories2: number, calories3: number}; 
    this.onSetRecordStats = function(stats) {};  

    // Deletes elements from the record stats and saves to localStorage.
    // Arg:
    //  arEl: {keyi: nTimeSamp, ...}. Object (not array). List specifying elements to delete.
    //      keyi: string. keys for ith element.
    //      nTimeStamp: number. Timestamp in milliseconds, which is unique, for element to delete.
    this.onDeleteRecordStats = function(arEl) {}; 

    // Clears the list of record stats objects for recorded trails.
    // Handler signature:
    //  Args: none.
    //  Returns nothing.
    this.onClearRecordStats = function(){}; 

    // Save current version.
    // Handler Signature:
    //  version: wigo_ws_GeoTrailVersion object for the version.
    this.onSaveVersion = function(version) { };

    // Get the current version.
    // Handler signature:
    //  Args: None
    //  Returns: wigo_ws_Version obj for current version. May be null.
    this.onGetVersion = function() { };

    // Map cache has been cleared.
    this.onMapCacheCleared = function () { };

    // Login authentication has completed.
    // Handler Signature:
    //  result: json {userName, userID, accessToken, nAuthResult}
    //    userID: Facebook user id or empty string when authentication fails.
    //    accessToken: access token string acquired from FaceBook, or empty string
    //      when athentication fails or is cancelled.
    //    nAuthResult: integer result of authentication, value of which is given 
    //      by EAuthStatus in Service.cs.
    this.onAuthenticationCompleted = function (result) { };

    // Reset http request that may be in progress.
    // Handler Signature:
    //  nMode: byte value of this.eMode enumeration.
    this.onResetRequest = function(nMode) { }; 

    // ** Public members

    // Initializes the view. 
    // Remarks:
    //  Call once when app is loaded after event handlers have been set.
    this.Initialize = function () {
        // Helper to complete initialization after map has been initialized.
        function CompleteInitialization(bOk, sMsg) {  
            that.ShowStatus(sMsg, !bOk)
            if (bOk) { 
                // Reset click for geo location testing when initializing
                // due to loading this app. 
                // Note: settings.bClickForGeoLoc can be set later by user in Main Menu > Settings.
                var settings = that.onGetSettings();
                if (settings.bClickForGeoLoc) {
                    settings.bClickForGeoLoc = false;
                    that.onSaveSettings(settings);
                }
                SetSettingsParams(settings);

                // Set view find paramters for search for geo paths to the home area.
                viewFindParams.setRect(that.eFindIx.home_area, settings.gptHomeAreaSW, settings.gptHomeAreaNE);
                that.setModeUI(that.curMode());  
                selectMode.setSelectedIndex(0);  
                map.FitBounds(settings.gptHomeAreaSW, settings.gptHomeAreaNE);

                // if (!map.isOfflineDataEnabled()) {
                //    var sMsg = "Offline Maps cannot be used.\n" +
                //             "Check that permissions for this app in the device settings allow storage to be used.\n";
                //    alert(sMsg);
                //}
                // Note: Testing map.isOfflineDataEnabled() is not reliable. 
                //       An error is now detected if map caching by L.TileLayer fails to write to storage.
                //       Handling the error shows a message to check app permissions for GeoTrail storage.
                // Log message indicating if map initialized ok.  
                var sLogMsg = "View Map: {0}, {1}".format(bOk ? "Ok" : "FAILED", sMsg);
                console.log(sLogMsg); 
                // Initialize to use background mode.
                backgroundMode.initialize();  
            }
        }
        
        // Helper to check if version of app has changed.
        // Returns true if app version has changed.
        // Arg: 
        //  version: ws_wigo_GeoTrailVersion object for current version.
        function IsNewVersion(version) {
            var bNew = version.sVersion !== sVersion;
            return bNew;
        }

        // Helper to do initialization. Completes asynchronously. 
        function DoInitialization() {
            // Set parameters from settings before initializing the map. 
            // Reset click for geo location testing when initializing
            // due to loading this app. 
            // Note: settings.bClickForGeoLoc can be set later by user in Main Menu > Settings.
            map.GoOffline(false);
            map.InitializeMap(function (bOk, sMsg) {
                CompleteInitialization(bOk, sMsg);  
            });
        }

        var version = that.onGetVersion();
        if (!version)
            version = new wigo_ws_GeoTrailVersion();
        if (IsNewVersion(version)) {
            // Save new version as current version.
            version.sVersion = sVersion;
            // Require to accept terms of use for a new version.
            version.bTermsOfUseAccepted = false;
            that.onSaveVersion(version);
        }

        if (version.bTermsOfUseAccepted) {
            DoInitialization();
        } else {
            ConfirmTermsOfUse(true, function(bConfirm) {
                ConfirmTermsOfUse(false); // Hide the Terms of Use div.
                if (bConfirm) {
                    version.bTermsOfUseAccepted = true;
                    that.onSaveVersion(version);
                    DoInitialization();
                } else {
                    var sMsg = "GeoTrail cannot be used unless you accept the Terms of Use.<br/><br/>";
                    sMsg += "Uninstall GeoTrail or end the app, start it again and accept the Terms of Use.<br/>";
                    that.ShowStatus(sMsg, false); // false => no error highlite.
                    that.setModeUI(that.eMode.tou_not_accepted);
                }
            });
            
        }
    };

    // Initializes the meterics for Record Stats.
    // Arg:
    //  arRecStats: array of wigo_ws_GeoTrailRecordStats objects from which the metrics are initialized.
    this.InitializeRecordStatsMetrics = function(arRecStats) {
        recordStatsMetrics.init(arRecStats);
    };

    // Enumeration of Authentication status (login result)
    this.eAuthStatus = function () {
        return fb.EAuthResult;
    };

    // Enumeration of mode for processing geo paths.
    // NOTE: the values must match the index of the option in selectMode drop list in trail2.html.
    this.eMode = {
        online_view: 0, offline: 1, online_edit: 2, online_define: 3, select_mode: 4, tou_not_accepted: 5, record_stats_view: 6, unknown: 7,
        toNum: function (sMode) { // Returns byte value for sMode property name.
            var nMode = this[sMode];
            if (nMode === undefined)
                nMode = this.online;
            return nMode;
        },
        toStr: function (nMode) { // Returns string for property name of nMode byte value.
            var sMode;
            switch (nMode) {
                case this.online: sMode = 'online_view'; break;
                case this.online_edit: sMode = 'online_edit'; break;
                case this.online_define: sMode = 'online_define'; break;
                case this.offline: sMode = 'offline'; break;
                case this.select_mode:sMode = 'select_mode'; break;
                case this.tou_not_accepted: sMode = 'tou_not_accepted'; break;
                case this.record_stats_view: sMode = 'record_stats_view'; break;  
                default: sMode = 'online_view'; break;  
            }
            return sMode;
        }
    };

    // Returns current mode for processing geo paths.
    this.curMode = function () {
        return nMode;
    };

    // Returns OwnerId string of signed-in user.
    this.getOwnerId = function () {
        return _ownerId;
    };
    var _ownerId = "";

    // Sets OwnerId of signed-in user to string given by sOwnerId.
    this.setOwnerId = function (sOwnerId) {
        _ownerId = sOwnerId;
    };

    // Returns Owner Name string of signed in user.
    this.getOwnerName = function () {
        return txbxOwnerName.value;
    }

    // Sets Owner Name string for signed in user.
    this.setOwnerName = function (sOwnerName) {
        txbxOwnerName.value = sOwnerName;
    }

    // Clears owner Id and owner Name for signed in user.
    this.clearOwner = function () {
        this.setOwnerId("");
        this.setOwnerName("");
    }

    // Selects option for selectShare drop list.
    // Arg: 
    //  sShare: string for the value of option.
    //          Value is property name of wigo_ws_GeoPathsRESTfulApi eShare enumeration.
    this.setShareOption = function (sShare) {
        selectShareDropDown.setSelected(sShare);
    };

    // Returns reference to home area rectangle.
    // Returned object ref:
    //  gptSW: wigo_ws_GeoPt object for SW corner .
    //  gptNE: wigo_ws_GeoPt object for NE corner.
    this.getHomeArea = function () {
        return homeArea;
    };

    // Returns reference to viewFindParams.
    // Note: viewFindParams are set by controller to get paths for the view.
    this.getViewFindParams = function () {
        return viewFindParams;
    };

    // Displays a status message.
    // Arg:
    //  sStatus: string of html to display.
    //  bError: boolean, optional. Indicates an error msg. Default to true.
    this.ShowStatus = function (sStatus, bError) {
        divStatus.set(sStatus, bError);
        titleBar.scrollIntoView(); 
    };

    // Appends a status messages starting on a new line to current status message and
    // shows the full message.
    // Arg:
    //  sStatus: string of html to display.
    //  bError: boolean, optional. Indicates an error msg. Default to true.
    this.AppendStatus = function (sStatus, bError) {
        if (!divStatus.isEmpty()) {
            sStatus = "<br/>" + sStatus;
        }

        divStatus.add(sStatus, bError);
        titleBar.scrollIntoView(); 
    };

    // Appends a status messages starting on a new line to current status message and
    // shows the full message.
    // Arg:
    //  sStatus: string of html to display.
    //  bError: boolean, optional. Indicates an error msg. Default to true.
    // Note: appends a div element, whereas this.AppendStatus appends a span element.
    this.AppendStatusDiv = function (sStatus, bError) {  
        if (!divStatus.isEmpty()) {
            sStatus = "<br/>" + sStatus;
        }

        divStatus.addDiv(sStatus, bError);
        titleBar.scrollIntoView(); 
    };

    // Forms current status message.
    // Current status indicates Track On/Off, Record On/Off, and Acccel Sensing On/Off/Disabled.
    // Returns {phone: string, pebble: string}
    //  phone is message to display on phone.
    //  pebble is message to sent to Pebble.
    this.FormCurrentStatus = function() {  
        let sStatus = '';
        let sStatusPebble = '';

        // Helper to update status for tracking.
        function TrackStatus() {
            if (trackTimer.bOn) {
                sStatus += "Track On<br/>"
                sStatusPebble += "Track On\n";
            } else {
                sStatus += "Track Off<br/>"
                sStatusPebble += "Track Off\n";
            }
        }

        // Helper to update status for recording.
        function RecordStatus() {
            if (recordFSM.isRecording()) {
                sStatus += 'Record On<br/>';
                sStatusPebble += 'Record On\n';
            } else if (recordFSM.isOff()) {  
                sStatus += 'Record Off<br/>';
                sStatusPebble += 'Record Off\n';
            } else if (recordFSM.isStopped()) {  
                sStatus += 'Record Stopped<br/>';
                sStatusPebble += 'Recrd Stopped\n'; // Shorten to Recrd to fit on one line.
            } else {                             
                sStatus += 'Record Pended<br/>';
                sStatusPebble += 'Record Pended\n';
            }
        }
        
        // Helper to update status for acceleration sensing.
        function AccelStatus() {
            if (app.deviceDetails.isAndroid()) {
                if (deviceMotion.bAvailable) {
                    let sSensing = deviceMotion.isSensing() ? 'On' : 'Off';
                    sStatus += 'Accel Sensing: {0}<br/>'.format(sSensing)
                    sStatusPebble += 'Accel: {0}\n'.format(sSensing)
                } else {
                    sStatus += 'Accel Sensing Disabled<br/>';
                    sStatusPebble += 'Accel Disabled\n';
                }
            } 
            // Note: For iPhone, no status at all because not used.
        }

        // Form status message.
        TrackStatus();
        RecordStatus();
        AccelStatus();

        return {phone: sStatus, pebble: sStatusPebble};
    };

    // Shows current  status.
    // Current status indicates Track On/Off, Record On/Off, and Acccel Sensing On/Off/Disabled.
    // Shows the status change in the status div and on Pebble.
    this.ShowCurrentStatus = function() { 
        var msg = this.FormCurrentStatus();
        this.ShowStatus(msg.phone, false);
        pebbleMsg.Send(msg.pebble, false, false);
    };    
    
    // Shows the signin control bar. 
    // Arg:
    //  bShow: boolean. true to show. 
    this.ShowSignInCtrl = function(bShow) { 
        ShowSignInCtrl(bShow);
    }

    // Displays an Alert message box which user must dismiss.
    // Arg:
    //  sMsg: string for message displayed.
    // Args:
    //  sMsg: string. message to display.
    //  onDone: function, optional, defaults to null. callback after user dismisses the dialog. callback has no arg.
    // Note: ShowAlert(..) returns immediately. callback after dialog is dismissed is asynchronous.
    this.ShowAlert = function (sMsg, onDone) {  
        var reBreak = new RegExp('<br/>', 'g'); // Pattern to replace <br/>.
        var s = sMsg.replace(reBreak, '\n');    // Replace <br/> with \n.
        AlertMsg(s, onDone);  
    };

    // Display confirmation dialog with Yes, No as default for buttons.
    // Arg:
    //  onDone: asynchronous callback with signature:
    //      bConfirm: boolean indicating Yes.
    //  sTitle: string, optional. Title for the dialog. Defauts to Confirm.
    //                            Use empty string, null, or undefined for default.
    //  sAnswerBtns: string, optional. Caption for the two buttons delimited by a comma.  
    //               Defaults to 'Yes,No'.
    // Returns synchronous: void. Only onDone callback is meaningful.
    this.ShowConfirm = function(sMsg, onDone, sTitle, sAnswerBtns) {
        ConfirmYesNo(sMsg, onDone, sTitle, sAnswerBtns);
    }

    // Clears the status message.
    this.ClearStatus = function () {
        divStatus.clear();
        titleBar.scrollIntoView(); 
    };

    // Set the user interface for a new mode.
    // Arg:
    //  newMode: eMode enumeration value for the new mode.
    this.setModeUI = function (newMode) {
        // Helper to hide all bars.
        function HideAllBars() {
            ShowPathDescrBar(false); 
            ShowElement(editDefineBar2, false);
            ShowElement(editDefineCursorsBar, false);
            ShowElement(onlineOfflineEditBar, false);
            ShowElement(onlineAction, false);
            ShowElement(offlineAction, false);
            ShowElement(mapBar, false);
            ShowOwnerIdDiv(false);
            ShowPathInfoDiv(false);  
            if (recordStatsHistory && nMode !== that.eMode.record_stats_view)  
                recordStatsHistory.close();
        }

        var nPrevMode = nMode; 

        nMode = newMode;
        var bOffline = nMode === this.eMode.offline;
        map.GoOffline(bOffline);  

        // Set default leaflet map click2 handler.
        // Note: EditFSM sets its own map click2 handler for online_edit and online_define modes.
        map.onMapClick2 = OnMapClick2; 
         
        switch (nMode) {
            case this.eMode.online_view:
                selectOnceAfterSetPathList.nPrevMode = nPrevMode;                         
                selectOnceAfterSetPathList.sPathName = selectGeoTrail.getSelectedText();  
                HideAllBars();
                titleBar.setTitle("Online Map"); 
                ShowElement(onlineOfflineEditBar, true);
                ShowElement(onlineAction, true);
                ShowPathInfoDiv(true); 
                ShowElement(mapBar, true);
                // Clear path on map in case one exists because user needs to select a path
                // from the new list of paths.
                map.ClearPath();
                selectGeoTrail.clearValueDisplay(); 
                recordFSM.initialize(onlineRecord); 
                this.onGetPaths(nMode, that.getOwnerId()); 
                break;
            case this.eMode.offline:
                selectOnceAfterSetPathList.nPrevMode = nPrevMode;                         
                selectOnceAfterSetPathList.sPathName = selectGeoTrail.getSelectedText();  
                HideAllBars();
                titleBar.setTitle("Offline Map");
                ShowElement(onlineOfflineEditBar, true);
                ShowElement(offlineAction, true);
                ShowPathInfoDiv(true);  
                ShowElement(mapBar, true);
                // Clear path on map in case one exists because user needs to select a path
                // from the new list of paths.
                map.ClearPath();
                selectGeoTrail.clearValueDisplay(); 
                this.onGetPaths(nMode, that.getOwnerId());
                var listLength = selectGeoTrail.getListLength();
                if (listLength < 2) {
                    // Inform user that offline path must be saved from Online Map.
                    var sMsg = "You need to save Offline trail(s) from the Online Map first.\n\n";
                    var sAnswerBtns = "Go Online, Stay Offline";
                    ConfirmYesNo(sMsg, function(bConfirm){
                        if (bConfirm) {
                            that.setModeUI(that.eMode.online_view);
                        }
                    },"",sAnswerBtns);
                }
                recordFSM.initialize(offlineRecord);  
                break;
            case this.eMode.online_edit:
                selectOnceAfterSetPathList.nPrevMode = nPrevMode;                         
                selectOnceAfterSetPathList.sPathName = selectGeoTrail.getSelectedText();  
                HideAllBars();
                titleBar.setTitle("Editing a Trail");
                fsmEdit.Initialize(false); // false => not new, ie edit existing path.
                break;
            case this.eMode.online_define:
                HideAllBars();
                titleBar.setTitle("Drawing a Trail");
                fsmEdit.Initialize(true); // true => new, ie define new path.
                break;
            case this.eMode.select_mode: 
                // Note: view show sign-on bar.
                HideAllBars();
                titleBar.setTitle("Select Map View", false); // false => do not show back arrow.
                this.ClearStatus();
                map.ClearPath();
                ShowOwnerIdDiv(true);
                selectMode.setSelected(this.eMode.toStr(nMode));
                break;
            case this.eMode.tou_not_accepted: // Terms of Use not accepted. Added 20160609 
                HideAllBars();
                titleBar.show(false);
                ShowMapCanvas(false);
                break;
            case this.eMode.record_stats_view: 
                HideAllBars();
                titleBar.setTitle("Stats History");
                recordStatsHistory.update();
                recordStatsHistory.uploadAdditions();  
                // Ensure no items are displayed (marked) as selected because selected indicates to be deleted.
                recordStatsHistory.open(titleHolder.offsetHeight); 
                break;
        }
    };

    // Returns ref to Edit Finite State Machine editing path path.
    this.fsmEdit = function () {
        return fsmEdit;
    };

    // Returns ref to wigo_ws_NetworkInformation object.
    // Note: object indicated type and state of internet connection.
    this.refNetorkInfo = function() {  
        return networkInfo; 
    };

    // Creates and returns a PathMarkerEl object.
    // The fields of the returned object should be set approppriatedly
    // and the object appended to an array that is the arg of this.FillPathMarks(..).
    // Fields of a returned PathMarkerEl object are initialized as follows:
    //      pathName = ""; // string: path name.
    //      dataIx = -1;   // interger: index in a array of data corresponding to the PathMarkerEl.
    //      sDescr = "";   // string: description for the path. (For example could be total distance.)
    //      latLngMarker = L.latLng(0, 0); // Leaflet L.LatLng obj. location on map of the marker.
    this.newPathMarkerEl = function() { 
        return map.newPathMarkerEl();
    };

    // Fill the list of paths that user can select.
    // Uses selectOnceAfterSetPathList obj to select a path and to draw it
    // if path is found by selectOnceAfterSetPathList.
    // Arg:
    //  arPath is an array of strings for geo path names.
    //  bSort is optional boolean to display sorted version of arPath.
    //        Defaults to true if not given.
    //  arPathMarker is optional array of PathMarkerEl objects. Each element
    //        gives the info for a marker on the map of the corresponding path.
    //        If the array is empty, there are no path markers.
    //        Default to empty array.
    this.setPathList = function (arPath, bSort, arPathMarker) {
        FillPathList(arPath, bSort);
        map.FillPathMarkers(arPathMarker);

        // Select previous path if indicated.
        var bSelected = selectOnceAfterSetPathList.select();  
        if (!bSelected) { 
            // For Online mode, show path markers when a path has not been selected.
            if (nMode === this.eMode.online_view) {
                map.ShowPathMarkers();  
            }
        }
    };


    // Helper to fill the list of paths that user can select.
    // Arg:
    //  arPath is an array of strings for geo path names.
    //  bSort is optional boolean to display sorted version of arPath.
    //        Defaults to true if not given.
    function FillPathList(arPath, bSort) { 
        if (typeof (bSort) !== 'boolean')
            bSort = true;

        // For arSelect to use as a sorted version of arPath.
        var arSelect = new Array();
        for (var i = 0; i < arPath.length; i++) {
            arSelect.push({ s: arPath[i], i: i });
        }
        if (arSelect.length > 1 && bSort) {
            // Do a case insensitive sort.
            arSelect.sort(function (a, b) {
                var n = a.s.toLowerCase().localeCompare(b.s.toLowerCase());
                return n;
            });
        }

        // Append first time, which is Select a Geo Trail.
        selectGeoTrail.appendFirstItem();  // data-value is -1.

        // Add the list of geo paths.
        var name, dataIx;
        for (var i = 0; i < arSelect.length; i++) {
            name = arSelect[i].s;
            dataIx = arSelect[i].i.toString();
            // dataIx is data-value attribute of item and is index to arPath element.
            selectGeoTrail.appendItem(dataIx, name);
        }
    }

    // Fill the list of paths that user can select.
    // Similar to this.setPathList, but does NOT use the selectOnceAfterSetPathList object.
    // Instead selects currently selected path before reloading and does NOT redraw the trail on the map.
    // Arg:
    //  arPath is an array of strings for geo path names.
    //  bSort is optional boolean to display sorted version of arPath.
    //        Defaults to true if not given.
    this.loadPathList = function(arPath, bSort) {  
        // Save selected index.
        var sDataIx = selectGeoTrail.getSelectedValue();
        // Fill the selectGeoPath ctrl.
        FillPathList(arPath, bSort);
        // Select item that was selected before filling.
        selectGeoTrail.setSelected(sDataIx);
    }; 

    // Clears the list of paths that the user can select.
    this.clearPathList = function () {
        // Call setPathList(..) with an empty list.
        this.setPathList([]);
    };

    // Clears the current drawn path from the map.
    this.clearPath = function() { 
        if (map)
            map.ClearPath();
    };

    // Updates item in the list of paths that user can select and 
    // the display for the item if it is currently selected.
    // Arg:
    //  dataValue: string. dataValue attribute for the item in the selectGeoTrail ctrl.
    //  sText: string. text for the item matching dataValue.
    this.updatePathItem = function(dataValue, sText) { 
        selectGeoTrail.setListElText(dataValue, sText);
        var selectedValue = selectGeoTrail.getSelectedValue();
        if (selectedValue === dataValue) {
            selectGeoTrail.setSelected(dataValue);
        }
    };

    // Returns selected Path Name from selectGeoTrail drop list.
    // Returns empty string for no selection.
    this.getSelectedPathName = function () {
        var sName = selectGeoTrail.getSelectedPlainText(); 
        return sName;
    };

    // Returns selected Path value from selectGeoTrail drop list.
    // Returns empty string for no selection.
    this.getSelectedPathValue = function() { 
        var sValue = selectGeoTrail.getSelectedValue();
        return sValue;
    }

    // Draws geo path on map and shows the information about it.
    // Useful for drawing an existing path.
    // Args:
    //  bShow: boolean. Show or hide displaying the info about the path (droplist of trail names.)
    //  path: wigo_ws_GpxPath object defining the path. null indicates do not set. 
    this.ShowPathInfo = function (bShow, path) {
        ShowPathInfoDiv(bShow);
        map.DrawPath(path);
        // #### If do not want trail animation to start automatically, remove the folowwing (map.AnimatedPath()).
        // Automatically start path animation if auto animation is needed.
        if (nMode === this.eMode.online_view) { 
            // Animate the path by showing an icon traveling from start to end of the path.
            map.AutoAnimatePath(); 
        };
    };

    // Draws geo path on map and shows the information about it.
    // Useful when drawing a path for Draw or Edit view.
    // Args:
    //  bShow: boolean. Show or hide displaying the geo path info.
    //  path: wigo_ws_GpxPath object defining the path. null indicates do not set. 
    this.ShowEditPathInfo = function(bShow, path) { 
        ShowPathInfoDiv(bShow);
        map.DrawEditPath(path);
    };

    // Caches current map view.
    // Arg:
    //  onStatusUpdate: callback for status update. Maybe null. callback signature:
    //    arg object {sMsg: string, bDone: boolean, bError: boolean}: 
    //      sMsg: Status msg.
    //      bDone: Indicates done, no more callbacks.
    //      bError: Indicates an error.
    this.CacheMap = function (onStatusUpdate) {
        map.CacheMap(onStatusUpdate);
    };

    // Shows geo path info for an offline map.
    // Args:
    //  bShow: boolean. Show or hide displaying the geo path info.
    //  offlineParams: wigo_ws_GeoPathMap.OfflineParams object for showing the info.
    this.ShowOfflinePathInfo = function (bShow, offlineParams) {
        ShowPathInfoDiv(bShow);
        if (bShow) {
            map.DrawPath(offlineParams.gpxPath, offlineParams.zoom, offlineParams.center); 
            // Fill offlineLocalData drop list for actions to take on selected path.
            offlineLocalData.setPathParams(offlineParams); 
            map.AutoAnimatePath();  
        }
    };

    // Indicates that uploading or deleting a path has completed.
    // Args:
    //  nMode: enumeration value of this.eMode(). Mode for the uplooad.
    //  bOk: boolean. true for upload successful.
    //  sStatusMsg: string. status msg to show.
    //  nId: number. record id at server for uploated path.
    //  sPathName: string. name of the path. (server may rename path to avoid duplicate name.)
    //  bUpload: boolean. true for uploaded, false for deleted.
    this.uploadPathCompleted = function(nMode, bOk, sStatusMsg, nId, sPathName, bUpload) { 
        if (nMode === this.eMode.online_view) {
            this.ShowStatus(sStatusMsg, !bOk);
            recordFSM.uploadPathCompleted(bOk, nId, sPathName); 
        } else if (nMode === this.eMode.online_edit || nMode === this.eMode.online_define ) {
            this.ShowStatus(sStatusMsg, !bOk);
            fsmEdit.uploadPathCompleted(bOk, sStatusMsg);
        } else if (nMode === this.eMode.offline) {  
            offlineLocalData.uploadCompleted(bOk, nId, sPathName, sStatusMsg); 
            // Update displayed path name in case the path name has been changed by useer or
            // by server to avoid duplicate name.
        }
    };

    // Returns true if recording trail is in a state of defining a new trail name.
    // Note: When login authentication is completed, this property can be queried to
    //       to see if a list of trails should be loaded. If the login is for recording
    //       a new trail, the list of trails should not be reloaded because such 
    //       a download from the server server interfers with uploading a new trail.
    this.IsRecordingSignInActive = function() {
        return recordFSM.isSignInActive();
    }

    // Clears and initializes the RecordStatsHistory ui list.
    this.clearRecordStatsHistory = function() {  
        recordStatsHistory.clearStatsItems(); 
    };

    // ** Private members for html elements
    var that = this;

    // Object specifying selection of path after paths have been loaded into droplist.
    // nPrevMode: eMode enumeration. Previous mode for sPathName.
    // sPathName: string. Path name to match in the droplist.
    // select: function(). Does selection in droplist if there is a match.
    //         Clears nPrevMode and sPathName unless droplist is empty.
    //         Therefore auto selection is only done once until nPrevMode and sPathName
    //         are set again.
    //         Returns: boolean. true if a selection is made.
    // Remarks: 
    //  selectGeoTrail is the droplist control. 
    //  If nPrevNode is unknown, there is no selection to match.
    //  if sPathName is not found in droplist, the droplis selection is not changed.
    //  View setModeUI() initializes nPrevMode, sPathName.
    //  View setPathList(..) calls select() after filling selectGeoTrail.
    var selectOnceAfterSetPathList = {nPrevMode: that.eMode.unknown, sPathName: "",
        select: function() {
            var bSelected = false; 
            var nCurMode = that.curMode();
            switch (nCurMode)
            {
                case that.eMode.online_view:
                case that.eMode.offline:
                //DoesNotWork case that.eMode.online_edit:   
                    // Note: Do NOT use "case that.eMode.online_edit:" because Edit mode must start by user 
                    // selecting a trail so that message to append to path is shown.
                    switch(this.nPrevMode) {
                        case that.eMode.online_view:
                        case that.eMode.offline:
                        case that.eMode.online_edit:
                        case that.eMode.select_mode:  
                            var dataValue = selectGeoTrail.selectByText(this.sPathName);
                            if (dataValue) {
                                selectGeoTrail.onListElClicked(dataValue);
                                bSelected = true;  
                            }
                            // Clear after selecting unless droplist is empty.
                            if (selectGeoTrail.getListLength() > 1) { // First entry is Select a Trail, which is same as empty.
                                this.nPrevMode = that.eMode.unknown;
                                this.sPathName = "";
                            }
                            break;
                    }
                    break;
            }
            return bSelected;  
        }};


    var divOwnerId = document.getElementById('divOwnerId'); 

    var txbxOwnerId = $('#txbxOwnerId')[0];

    var divMode = document.getElementById('divMode');

    var divSettings = $('#divSettings')[0];
    var divSettingsTitle = $('#divSettingsTitle')[0];   
    var divSettingsScroll = $('#divSettingsScroll')[0]; 
    var divSettingsDoneCancel = $('#divSettingsDoneCancel')[0]; 

    var numberHomeAreaSWLat = $('#numberHomeAreaSWLat')[0];
    var numberHomeAreaSWLon = $('#numberHomeAreaSWLon')[0];
    var numberHomeAreaNELat = $('#numberHomeAreaNELat')[0];
    var numberHomeAreaNELon = $('#numberHomeAreaNELon')[0];
    var buSetHomeArea = $('#buSetHomeArea')[0];
    var buSettingsDone = $('#buSettingsDone')[0];
    var buSettingsCancel = $('#buSettingsCancel')[0];

    var buPathIxPrev = $('#buPathIxPrev')[0];
    var buPathIxNext = $('#buPathIxNext')[0];
    var buPtDeleteDo = $('#buPtDeleteDo')[0];  

    var buPtDo = document.getElementById('buPtDo');
    buPtDo.addEventListener('click', function(event){
        fsmEdit.DoEditTransition(fsmEdit.eventEdit.Do);
    }, false);
    var buCursorLeft = document.getElementById('buCursorLeft');
    buCursorLeft.addEventListener('touchstart', function(event){
        fsmEdit.CursorDown(fsmEdit.dirCursor.left);
    }, false);
    buCursorLeft.addEventListener('touchend', function(event){
        fsmEdit.CursorUp(fsmEdit.dirCursor.left);
    }, false);
    var buCursorRight = document.getElementById('buCursorRight');
    buCursorRight.addEventListener('touchstart', function(event){
        fsmEdit.CursorDown(fsmEdit.dirCursor.right);
    }, false);
    buCursorRight.addEventListener('touchend', function(event){
        fsmEdit.CursorUp(fsmEdit.dirCursor.right);
    }, false);
    var buCursorUp = document.getElementById('buCursorUp');
    buCursorUp.addEventListener('touchstart', function(event){
        fsmEdit.CursorDown(fsmEdit.dirCursor.up);
    }, false);
    buCursorUp.addEventListener('touchend', function(event){
        fsmEdit.CursorUp(fsmEdit.dirCursor.up);
    }, false);
    var buCursorDown = document.getElementById('buCursorDown');
    buCursorDown.addEventListener('touchstart', function(event){
        fsmEdit.CursorDown(fsmEdit.dirCursor.down);
    }, false);
    buCursorDown.addEventListener('touchend', function(event){
        fsmEdit.CursorUp(fsmEdit.dirCursor.down);
    }, false);

    var buPathIxPrev = document.getElementById('buPathIxPrev');
    buPathIxPrev.addEventListener('click', function(event){
        fsmEdit.DoEditTransition(fsmEdit.eventEdit.PathIxPrev);
    }, false);
    var buPathIxNext = document.getElementById('buPathIxNext');
    buPathIxNext.addEventListener('click', function(event){
        fsmEdit.DoEditTransition(fsmEdit.eventEdit.PathIxNext);
    }, false);
    var buPtDeleteDo = document.getElementById('buPtDeleteDo'); 
    buPtDeleteDo.addEventListener('click', function(event){
        fsmEdit.DoEditTransition(fsmEdit.eventEdit.DeletePtDo);
    }, false); 

    var txbxPathName = document.getElementById('txbxPathName');
    txbxPathName.addEventListener('change', function(event){
        if (that.curMode() === that.eMode.online_edit ||    
            that.curMode() === that.eMode.online_define) {
            // Note: Only do for editing or defining a trail.
            var fsm = that.fsmEdit();
            // Ensure soft keyboard is removed after the change.
            txbxPathName.blur();
            fsm.setPathChanged();   
            fsm.DoEditTransition(fsm.eventEdit.ChangedPathName);
        } else if (that.curMode() === that.eMode.online_view) { 
            // Note: This happens because of Record trail.
            // Ensure soft keyboard is removed after the change.
            txbxPathName.blur();
            ShowRecordUploadMsgIfNeeded(); 
        } else if (that.curMode() === that.eMode.offline) { 
            // Note: This happens because of Record trail.
            // Ensure soft keyboard is removed after the change.
            txbxPathName.blur();
            // Show message for saving a trail locally, or for uploading a saved Record trail.
            ShowRecordUploadMsgIfNeeded(); 
            ShowLocalDataUploadIfNeeded(); 
        }
    }, false); 

    txbxPathName.addEventListener('keydown', function(event){
        function IsTextEmpty() {
            var text = event.target.value.trim();
            return text.length === 0;
        }

        var bEnterKey = IsEnterKey(event);
        if (that.curMode() === that.eMode.offline) {
            if (bEnterKey) {
                if (!IsTextEmpty()) {
                    ShowRecordUploadMsgIfNeeded(); // Status msg needed in case there is no change to textbox.
                    ShowLocalDataUploadIfNeeded(); 
                    event.target.blur();  // ensure soft keyboard is removed.
                } else { 
                    that.ShowStatus("Trail name cannot be blank.", false);
                }
            }
        } else if (that.curMode() === that.eMode.online_view) { 
            var bEnterKey = IsEnterKey(event);
            // Use blur and let txbxPathName change event handler show a message
            // rather than trying to upload due to Enter key.  
            if (bEnterKey)  {
                // Show status to Upload to server.
                if (!IsTextEmpty()) {
                    ShowRecordUploadMsgIfNeeded(); // Status msg needed in case there is no change to textbox.
                    event.target.blur(); // blur() ensures soft keyboard is removed.
                } else { 
                    that.ShowStatus("Trail name cannot be blank.", false);
                }
            }
        }
    }, false); // Try true to use capture instead of bubble. true does not capture.

    // Returns true if a keyboad event is for the Enter key.
    // Arg:
    //  event: KeyboardEvent object.
    function IsEnterKey(event) {
        var bYes = false;
        if (event instanceof KeyboardEvent) {
            if (event.key !== undefined) {
                // Handle the event with KeyboardEvent.key and set handled true.
                bYes = event.key === 'Enter';
            } else if (event.keyIdentifier !== undefined) {
                bYes = event.keyIdentifier === 'Enter';
            } else if (event.keyCode !== undefined) {
                bYes = event.keyCode === 13;
            }
        }
        return bYes;
    }

    function ShowRecordUploadMsgIfNeeded() { 
        if (recordFSM.isDefiningTrailName()) { 
            that.ShowStatus("Touch Upload to complete saving.", false);
            var nMode = that.curMode();
            if (nMode === that.eMode.online_view) {
                if (recordFSM.isDefineTrailNameUploading()) {
                    that.ShowStatus("Touch Upload to complete saving.", false);
                } else {
                    that.ShowStatus("Touch Save Offline to complete saving.", false);
                }
            } else if (nMode === that.eMode.offline) {
                that.ShowStatus("Touch Save Offline to complete saving.", false);
            } 
        }
    }
    
    function ShowLocalDataUploadIfNeeded() { 
        if (offlineLocalData.isDefiningTrailName()) 
            
            that.ShowStatus("Touch Upload to complete uploading.", false);
    }

    function ShowLocalDataSaveOfflineIfNeeded() {  
        thsi.ShowStatus("Touch Save Offline to complete saving.");
    }

    var labelPathName = document.getElementById('labelPathName');

    var buUpload = document.getElementById('buUpload');
    buUpload.addEventListener('click', function(event){
        var nMode = that.curMode();
        if (nMode === that.eMode.online_view) { 
            if (recordFSM.isDefiningTrailName()) {
                recordFSM.nextState(recordFSM.event.upload);
            }
        } else if (nMode === that.eMode.online_edit || nMode === that.eMode.online_define)  {
            fsmEdit.DoEditTransition(fsmEdit.eventEdit.Upload);
        } else if (nMode === that.eMode.offline) {
             if ( offlineLocalData.isDefiningTrailName()) {
                offlineLocalData.do(offlineLocalData.event.upload); 
             }
        }
    }, false);
    var buDelete = document.getElementById('buDelete');
    buDelete.addEventListener('click', function(event){
        fsmEdit.DoEditTransition(fsmEdit.eventEdit.Delete);
    }, false);
    var buCancel = document.getElementById('buCancel');
    buCancel.addEventListener('click', function(event){
        // Note: This cancel handler is only for editing or defining a new trail.
        //       The cancel handlers for record upload, local data upload, and
        //       saving a map area pffline without a trail selected are added when defining 
        //       the trail name, and removed when defining the trail name ends.
        //       Only one of these handlers is attached at any time. 
        if (nMode === that.eMode.online_edit || nMode === that.eMode.online_define) { 
            fsmEdit.DoEditTransition(fsmEdit.eventEdit.Cancel);        
        }
    }, false);


    // Resturns number: the integer for data index attr of selected item in selectGeoTrail droplist.
    // Note: return value is NOT index of selected item in droplist, but rather the data-index attrib
    // of the selected item.
    function GetSelectedDataIx() {  
        var sSelectedDataIx = selectGeoTrail.getSelectedValue();
        var selectedDataIx = parseInt(sSelectedDataIx); 
        return selectedDataIx;        
    }

    var onlineOfflineEditBar = document.getElementById('onlineOfflineEditBar');
    var onlineAction = document.getElementById('onlineAction');
    var offlineAction = document.getElementById('offlineAction');
    var editAction = document.getElementById('editAction');
    var pathDescrBar = document.getElementById('pathDescrBar');
    var editDefineBar2 = document.getElementById('editDefineBar2');
    var editDefineCursorsBar = document.getElementById('editDefineCursorsBar');
    var divCursors = document.getElementById('divCursors');
    var divPathIx = document.getElementById('divPathIx');

    var mapBar = document.getElementById('mapBar');
    var mapGoToPath = document.getElementById('mapGoToPath');
    mapGoToPath.addEventListener('click', function(event ) {
        that.ClearStatus();
        titleBar.scrollIntoView(); 
        map.ClearPathMarkers(); 
        var bOk = map.PanToPathCenter();
        if (!bOk) {
            // Try zooming to recorded trail. 
            bOk = !recordFSM.isOff();
            if (bOk) {
                bOk = map.recordPath.zoomToTrail(500); 
            }
            if (!bOk)
                that.ShowStatus("No Geo Trail or Recorded Trail currently defined to pan-to.")                
        }
    }, false);
    var mapGeoLocate = document.getElementById('mapGeoLocate');
    mapGeoLocate.addEventListener('click', function() {
        DoGeoLocation();
    }, false);

    // Returns ref to div for the map-canvas element.
    // Note: The div element seems to change dynamically. 
    //       Therefore setting a var for $('#map-canvas')[0] does not work.
    function getMapCanvas() {
        var mapCanvas = document.getElementById('map-canvas');
        return mapCanvas;
    }

    var divRecordStatsEdit = document.getElementById('divRecordStatsEdit'); 
    
    // ** Attach event handler for controls.
    var onlineSaveOffline = document.getElementById('onlineSaveOffline');
    onlineSaveOffline.addEventListener('click', OnlineSaveOfflineClicked, false);
    function OnlineSaveOfflineClicked(event) {
        that.ClearStatus();

        var sSelectedDataIx = selectGeoTrail.getSelectedValue();
        var selectedDataIx = parseInt(sSelectedDataIx); 
        if (nMode === that.eMode.online_view) {
            if ( selectedDataIx < 0) { 
                // No trail is selected. Cache map area displayed offline.
                // Note: User is prompted for an area name first.
                offlineMapAreaSaver.setPathNameUI(); 
            } else { 
                offlineMapAreaSaver.saveTrail(selectedDataIx);  
            }
        } else {
            that.ShowStatus("Must be in online mode to save for offline.");
        }
    }

    
    // Object for saving screen map area viewed online for use offline. 
    // If a trail is currenlty selected it is saved also by the
    // saveTrail(selectedDataIx) method.
    function OfflineMapAreaSaver(view) { 
        var that = this;

        // Shows UI for defining the name name, which allows canceling.
        this.setPathNameUI = function() {
            AddCancelHandler();
            // Save current map displayed as path with single point at the center.
            view.ShowStatus("Enter a name for the map area to save offline.<br/>Then touch Save Offline to save.", false); 
            // Hide the online/offline/edit bar that has trail name and action ctrls.
            txbxPathName.value = ""; // Clear path name. 
            ShowPathAndMapBars(false); 
            // Show the path description bar for user to enter a name for the area.
            ShowPathDescrBarWithSaveAreaOfflineButton(true);
            // Note: Saving the area offline is done after users enters a name.
            // Set focus to txbxPathName to show keyboard. 
            txbxPathName.focus();  
        };

        // Saves the displayed map area without a trail.
        // If path name is proper, cleard the path name UI.
        // Note: Saves is trail of only a single point at the center of the area.
        // Arge: 
        //  selectedDataIx: integer < 0.  
        this.saveNoTrail = function(selectedDataIx) {
            // Only call in online mode, but check to be sure.
            var nMode = view.curMode();
            if (nMode === view.eMode.online_view) {
                var sName = txbxPathName.value.trim(); 
                var bOk = sName.length > 0;
                if (bOk) {
                    // Form offline params to save locally for the screan area.
                    // Make a path that is only one geo pt at the center of map screen area.
                    // This path should work like any other real path to be saved offline.
                    this.clearPathNameUI();              
                    var params = FormOfflinePathParamsNoTrail(selectedDataIx);
                    params.name = sName;
                    view.onSavePathOffline(nMode, params);
                } else { // else not expected.
                    view.ShowStatus("Trail name cannot be blank.", false); 
                }
            }
        };

        // Saves the display map area and trail.
        // Arg:
        //  selectedDataIx: integer >= 0. data index of currently selected trail.
        this.saveTrail = function(selectedDataIx){
            // Only call in online mode, but check to be sure.
            var nMode = view.curMode();
            if (nMode === view.eMode.online_view) {
                // Save selected trail and cache map area displayed offline.
                var oMap = map.getMap();
                var params = new wigo_ws_GeoPathMap.OfflineParams();
                params.nIx = selectedDataIx;
                var bounds = oMap.getBounds();
                params.bounds.ne.lat = bounds.getNorthEast().lat;
                params.bounds.ne.lon = bounds.getNorthEast().lng;
                params.bounds.sw.lat = bounds.getSouthWest().lat;
                params.bounds.sw.lon = bounds.getSouthWest().lng;
                var center = oMap.getCenter();
                params.center.lat = center.lat;
                params.center.lon = center.lng;
                params.zoom = oMap.getZoom();
                // Save new params object because local params is reused.
                var oParams = new wigo_ws_GeoPathMap.OfflineParams(); 
                oParams.assign(params); 
                view.onSavePathOffline(nMode, oParams);  
            }
        }

        // Hides the UI shown for defining a path name.
        this.clearPathNameUI = function() {
            RemoveCancelHandler(); 
            ShowPathDescrBarWithSaveAreaOfflineButton(false); // Hide trail name and action ctrls.
            ShowPathAndMapBars(true); // Show the path selection droplist with actions and map bar.
            view.ClearStatus();  
        };
        
        function AddCancelHandler() {
            RemoveCancelHandler(); // Ensure only add once.
            buCancel.addEventListener('click', OnCancel, false);
        }

        function RemoveCancelHandler() {
            buCancel.removeEventListener('click', OnCancel, false);
        }

        // Returns new wigo_ws_GeoPathMap.OfflineParams object for offline
        // parameters for the currently displayed map area when there is no trail.
        // Arg:
        //  selectedDataIx: number. integer for currently data index
        //                  Note: the currently selected value in selectGeoTrail droplist
        //                  has the string for the data index.
        function FormOfflinePathParamsNoTrail(selectedDataIx) {  
                var oMap = map.getMap();
                var params = new wigo_ws_GeoPathMap.OfflineParams();
                params.nId = 0; // 0 indicates a new data object to add to offline data.
                params.nIx = selectedDataIx;
                var bounds = oMap.getBounds();
                params.bounds.ne.lat = bounds.getNorthEast().lat;
                params.bounds.ne.lon = bounds.getNorthEast().lng;
                params.bounds.sw.lat = bounds.getSouthWest().lat;
                params.bounds.sw.lon = bounds.getSouthWest().lng;
                var center = oMap.getCenter();
                params.center.lat = center.lat;
                params.center.lon = center.lng;
                params.zoom = oMap.getZoom();
                return params; 
        }
        
        // Event handler for buCancel.
        // Hides the UI for defining a path name.
        function OnCancel(evt) {
            that.clearPathNameUI();
        }
    }
    var offlineMapAreaSaver = new OfflineMapAreaSaver(this); 

    var buSaveAreaOffline = document.getElementById("buSaveAreaOffline"); 
    buSaveAreaOffline.addEventListener('click', function(evt){
        var nMode = that.curMode();
        if (nMode === that.eMode.online_view) { 
            if (recordFSM.isDefiningTrailName()) { 
                // Save locally offline the recorded trail.
                recordFSM.nextState(recordFSM.event.save_locally);
            } else { 
                // Save locally offline the map area on screen without a trail.
                var sSelectedDataIx = selectGeoTrail.getSelectedValue();
                var selectedDataIx = parseInt(sSelectedDataIx);                
                offlineMapAreaSaver.saveNoTrail(selectedDataIx);
            }
        } else if (nMode === that.eMode.offline) { 
            // For offline view, save locally the recorded trail.
            recordFSM.nextState(recordFSM.event.save_locally);
        }
    }, false);   


    var divHomeArea = document.getElementById('divHomeArea'); 

    $(buSetHomeArea).bind('click', function (e) {
        var corners = map.GetBounds();
        numberHomeAreaSWLat.value = corners.gptSW.lat;
        numberHomeAreaSWLon.value = corners.gptSW.lon;
        numberHomeAreaNELat.value = corners.gptNE.lat;
        numberHomeAreaNELon.value = corners.gptNE.lon;
    });

    $(buSettingsDone).bind('click', function (e) {
        if (CheckSettingsValues()) { 
            ShowSettingsDiv(false); 
            that.ClearStatus();
            var settings = GetSettingsValues();
            SetSettingsParams(settings, false); // false => not initially setting when app is loaded. 
            that.onSaveSettings(settings);
            titleBar.scrollIntoView();   
        }
    });
    $(buSettingsCancel).bind('click', function (e) {
        // Do not cancel if setting Calorie Conversion Eficiency is active.
        if (IsSettingCCEActive()) { 
            return;
        }

        ShowSettingsDiv(false);
        that.ClearStatus();
        titleBar.scrollIntoView();   
    });

    // Controls for Calorie Conversion Efficiency 
    var divCCEItem = document.getElementById('divCCEItem');
    var cceLabelValue = new CCELabel('labelCCEValue', 3, true);

    var divCCEUpdate = document.getElementById('divCCEUpdate');

    var divCCEUpdateCtrls = document.getElementById('divCCEUpdateCtrls');
    var divCCEUpdateNote = document.getElementById('divCCEUpdateNote');

    var buCCESet = document.getElementById('buCCESet');
    buCCESet.addEventListener('click', function(event) {
        ShowCCEItem(false);
    }, false);

    var buCCEApply = document.getElementById('buCCEApply');
    buCCEApply.addEventListener('click', function(event) {
        var dataValue = cceNewEfficiencyNumber.getValue();
        // New efficiency is valid only if > 0.
        if (dataValue > 0) { 
            // Set new efficiency number for Settings. 
            // Note that the change for Settings is not saved until user click Done button for Settings.
            cceLabelValue.set(dataValue);
            ShowCCEItem(true);
        } else {
            AlertMsg("Set Actual Calories or New Efficiency.")
        }
    }, false);
    var buCCECancel = document.getElementById('buCCECancel');
    buCCECancel.addEventListener('click', function(event) {
        ShowCCEItem(true);
    }, false);

    // Shows or hides Calorie Conversion Item in Settings.
    // Arg:
    //  bShow: boolean. true to show divCCEItem and hide divCCEUpdate. 
    function ShowCCEItem(bShow) {
        // ShowElement(divCCEItem, bShow); 
        // Note: Leave divCCEItem showing. It is covered by divCCEUpdate with position of fixed, top 0.
        ShowElement(divHomeArea, bShow);   // Added for iPhone. 
        ShowElement(divCCEUpdate, !bShow); 
        if (!bShow) { 
            // Set height of divCCEUpdateNote to fill available space.
            var yBody = document.body.offsetHeight;
            var yCtrls = divCCEUpdateCtrls.offsetHeight;
            var yScroll =  yBody - yCtrls;
            divCCEUpdateNote.style.height = yScroll.toFixed(0) + 'px';
        }
    }

    // Object for calorie conversion efficency number control.
    // Construct Arg:
    //  id: string. id of html input control of type number.
    //  decPlaces: integer, optional. number of decimal places. Defaults to 2.
    //  bPercentage. boolean, optional. true indicates to set value as a percent, 
    //               which is 100 times data-value attribute.
    //               Defaults to false;                
    function CCENumber(id, decPlaces, bPercentage) { 
        if ((typeof(decPlaces) != 'number')) {
            decPlaces = 2;
        }
        if ((typeof(bPercentage) !== 'boolean'))
            bPercentage =false;

        // Html control element.
        this.ctrl = document.getElementById(id);

        // Sets the value for the control.
        // Arg:
        //  value: number. data-value attribute of ctrl set to this number.
        this.set = function(value) {
            this.ctrl.setAttribute('data-value', value.toFixed(decPlaces));
            if (bPercentage) {
                var valuePlaces = decPlaces - 2; 
                if (valuePlaces < 0)
                    valuePlaces = 0;
                this.ctrl.value = (value*100).toFixed(valuePlaces);
            } else {
                this.ctrl.value = value.toFixed(decPlaces);
            }
        };

        // Return number for data-value of this control.
        this.get = function() {
            var sValue = this.ctrl.getAttribute('data-value');
            var value = parseFloat(sValue);
            return value;
        };

        // Shows or hides the parent this control.
        // Arg:
        //  bShow: boolean. true to show row, false to hide row.
        this.showParent = function(bShow) {
            if (this.ctrl.parentElement) {
                ShowElement(this.ctrl.parentElement, bShow);
            }
        };

        // Save decPlaces and bPer for prototype to use.
        this.decPlaces = decPlaces;
        this.bPercentage = bPercentage;
    };

    // Returns number. Displayed string converted to data value. 
    //  Also data-value attribute is set and converted value redisplayed.
    CCENumber.prototype.getValue = function() {  
        var value = parseFloat(this.ctrl.value);
        if (this.bPercentage) 
            value = value / 100;
        this.set(value);
        return value;
    };

    // Object for calorie conversion label using a Label control.
    // Note: CCENumber() is base class. this.set member is over-ridden.
    function CCELabel(id, decPlaces, bPercentage) {
        // Initialize members from base class CCENumber.
        CCENumber.call(this, id, decPlaces, bPercentage);
        
        // Override set member. (Uses innerText instead of value attribute of ctrl.)
        // Sets the value for the control.
        // Arg:
        //  value: number. data-value attribute of ctrl set to this number.
        //  suffix: string, optional. suffix to append to numeric value shown.
        //          Defaults to % for bPercentage true, otherwise to empty string.
        //          If an empty suffix is needed for percentage, provide empty string
        //          as the suffix (do not use the default).
        this.set = function(value, suffix) {
            if (typeof(suffix) !== 'string') {
                suffix = bPercentage ? '%' : '';
            }
            this.ctrl.setAttribute('data-value', value.toFixed(decPlaces));
            if (bPercentage) {
                var valuePlaces = decPlaces - 2; 
                if (valuePlaces < 0)
                    valuePlaces = 0;
                this.ctrl.innerText = (value*100).toFixed(valuePlaces) + suffix;
            } else {
                this.ctrl.innerText = value.toFixed(decPlaces) + suffix;
            }
        };
    }
    
    var cceDistancLabel = new CCELabel('cceDistance', 2);
    var cceTimeLabel = new CCELabel('cceTime',1);
    var cceSpeedLabel = new CCELabel('cceSpeed',1);                     
    var cceKineticCaloriesLabel = new CCELabel('cceKineticCalories',2); 
    var cceCaloriesBurnedLabel = new CCELabel('cceCaloriesBurned',2);   

    var cceActualCaloriesNumber = new CCENumber('cceActualCalories', 0);
    cceActualCaloriesNumber.ctrl.addEventListener('focus', SelectNumberOnFocus, false); 
    cceActualCaloriesNumber.ctrl.addEventListener('change', function(event) {
        // Calcuate new efficency.
        var actualCalories = cceActualCaloriesNumber.getValue();
        // Note: getValue shows the value again closing the soft keyboard.
        var kineticCalories = cceKineticCaloriesLabel.get();
        var efficency = kineticCalories / actualCalories;
        cceNewEfficiencyNumber.set(efficency);
    }, false);
    // Evant handler for Enter Key for cceActualCaloriesNumber.
    // Kills focus for cceActualCaloriesNumber if key is Enter.
    cceActualCaloriesNumber.ctrl.addEventListener('keydown', function(event) { 
        var bEnterKey = IsEnterKey(event);
        if (bEnterKey) {
            this.blur();
        }
    }, false); 
    
    var cceNewEfficiencyNumber = new CCENumber('cceNewEfficiency', 3, true); // true => percentage
    cceNewEfficiencyNumber.ctrl.addEventListener('focus', SelectNumberOnFocus, false);  
    cceNewEfficiencyNumber.ctrl.addEventListener('change', function(event){
        // Calculate and show actual calories based on the new efficiency.  
        var newEfficincy = cceNewEfficiencyNumber.getValue();
        var kineticCalories = cceKineticCaloriesLabel.get();
        var actualCalories = kineticCalories / newEfficincy;
        cceActualCaloriesNumber.set(actualCalories);
    }, false);
    // Evant handler for Enter Key for cceNewEfficiencyNumber.
    // Kills focus for cceNewEfficiencyNumber if key is Enter.
    cceNewEfficiencyNumber.ctrl.addEventListener('keydown', function(event) { 
        var bEnterKey = IsEnterKey(event);
        if (bEnterKey) {
            this.blur();
        }
    }, false); 

    var cceCurEfficiencyLabel = new CCELabel('cceCurEfficiency', 3, true);  // true => percentage

    // Selects state for Tracking on/off and runs the track timer accordingly.
    // Arg: 
    //  bTracking: boolean to indicate tracking is on (true) or off (false).
    function SelectAndRunTrackTimer(bTracking) {
        SetGeoTrackValue(bTracking);
        trackTimer.bOn = bTracking;    // Allow/disallow geo-tracking.
        if (!trackTimer.bOn) {
            // Send message to Pebble that tracking is off.
            pebbleMsg.Send("Track Off", false, false); // no vibration, no timeout.
        }
        // Start or clear trackTimer.
        RunTrackTimer();
    }

    //20160507 Added only to debug problem with filesytem for TileLayer for map.
    /* Normally commented out
    document.getElementById('buInitView').addEventListener('click', function(event) {
        that.Initialize();
    }, false);
    */

    /* //20150716 Trying to detect app ending does not work. These events do NOT fire
    $(window).bind('unload', function (e) {
        console.log('window unload');
        // Inform Pebble watch that this app has ended.
        var sMsg = "{0} unload.".format(document.title);
        pebbleMsg.Send(sMsg, false)
    });

    window.addEventListener('beforeunload', function (event) {
        console.log('window beforunload');
        // Inform Pebble watch that this app has ended.
        var sMsg = "{0} beforeunload.".format(document.title);
        pebbleMsg.Send(sMsg, false)
    });

    window.addEventListener('error', function (event) {
        console.log('window error');
        // Inform Pebble watch that this app has ended.
        var sMsg = "{0} error.".format(document.title);
        pebbleMsg.Send(sMsg, false)
    });
    */



    // Returns new obj for path upload. See path arg for this.onUpload(..) handler
    function NewUploadPathObj() {
        var path = {
            nId: 0,
            sPathName: "",
            sOwnerId: "",
            sShare: "private",
            arGeoPt: []
        }
        return path;
    }

    // **  State Machine for Editing Path, New or Existing

    // Object for FSM for editing path.
    function EditFSM(view) {
        var that = this; // Ref for private function to this object.
        // view is local ref to view object.

        this.gpxPath = null; // Ref to wigo_ws_GpxPath object for selected path.
        this.nPathId = 0;    // Unique id for this.gpxPath.

        // Events for Server Action FSM.
        this.eventServerAction = {
            Upload: 0,
            Delete: 1,
            Cancel: 2
        };

        // Events for Edit FSM.
        this.eventEdit = {
            Unknown: -1,
            Touch: 0,
            SelectPt: 1, AppendPt: 2, InsertPt: 3, MovePt: 4, DeletePt: 5, 
            Do: 6, 
            SelectedPath: 7, ChangedPathName: 8, SignedIn: 9,
            Init: 10,
            Cursor: 11,
            Upload: 12,
            Delete: 13,
            Cancel: 14,
            PathIxNext: 15,
            PathIxPrev: 16,
            DeletePtDo: 17,
            ChangedShare: 18,
            Error: 19, 
            Completed_Ok: 20, // Upload or Delete completed successfully. 
        };

        this.Initialize = function(bNewArg) {
            bNew = bNewArg;
            // Ensure track timer is not selected and is not running.
            SelectAndRunTrackTimer(false);
            curEditState = stEditInit;
            this.DoEditTransition(this.eventEdit.Init);
        };

        // Sets variable indicating path has been changed.
        this.setPathChanged = function () {
            bPathChanged = true;
        };

        // Returns true if editing or defining a new path indicates the path 
        // has been changed.
        this.IsPathChanged = function () {
            return bPathChanged;
        };

        // Clear path change. Call when a change to another view is confirmed
        // by user even though a path change has occurred without uploading the change. 
        this.ClearPathChange = function () {
            bPathChanged = false;
            // Clear the drop list for selection a geo path.
            view.setPathList([]);

        };

        // Uploading to server or deleting at server has completed.
        // Arg:
        //  bOk: boolean. true for success. 
        //  sMsg: string. messages showing the result.
        this.uploadPathCompleted = function(bOk, sMsg) {  
            view.ShowAlert(sMsg);
            // Note: ShowAlert(sMsg) presents dialog box with Ok button, but code flow
            //       continues immediately. Therefore dialog box is shown rather 
            //       than a status message, which would be over-written by eventEdit.Init.
            if (bOk)
                this.DoEditTransition(this.eventEdit.Completed_Ok);
            else 
                this.DoEditTransition(this.eventEdit.Error);
        };

        // Transition for Edit FSM.
        // Arg: 
        //  event: event from this.eventEdit enumeration.
        this.DoEditTransition = function (event) {
            curEditState(event);
        };

        // Enumeration of cursor directions.
        this.dirCursor = { left: 0, right: 1, up: 2, down: 3 };

        // Cursor down occurred.
        // Arg:
        //  eDir: enumeration, a direction value in dirCursor.
        this.CursorDown = function (eDir) {
            curTouchPt.CursorDown(eDir);
        };

        // Cursor up occurred.
        // Arg:
        //  eDir: enumeration, a direction value in dirCursor.
        this.CursorUp = function (eDir) {
            curTouchPt.CursorUp(eDir);
        };


        // ** Private vars
        var bNew = true; // New path or existing path.
        
        // Enumeration of pending edit action for a point in a path.
        var EPtAction = {
            Selecting: 0, Moving: 1, Inserting: 2, Appending: 3, Deleting: 4
        };

        var bPathChanged = false; // Path change not saved at served.
        var curEditState = stEditInit; // Current state function for Edit FSM.
        
        var opts = new PtActionOptions(this, false);  // Options for path point action drop list.

        var curPathName = ''; // Current path name.

        // Object for data about a Touch point.
        // Constructor Arg:
        //  fsm is ref to EditFSM object.
        function TouchPoint(fsm) {
            // Boolean to indicate that touch point is valid.
            // this.set() sets bValid to true. However, bValid can be set false
            // to indicate no longer valid.
            this.bValid = false;

            // Sets this object for a touch point.
            // Args:
            //  lat: number for latitude.
            //  lon: number for longitude.
            //  x: integer for x pixel on screen.
            //  y: integer for y pixel on screen.
            this.set = function (lat, lon, x, y) {
                // Ensure cursor down timer is stopped.
                // Occasionally timer keeps running after touch up event.
                // Do not know why, but this at least stops the timer when user touches again.
                StopCursorDownTimer();
                if (!lat)
                    return;
                gpt.lat = lat;
                gpt.lon = lon;
                px.x = x;
                px.y = y;
                this.bValid = true;
            }

            // Returns ref to wigo_ws_GeoPt object for this object.
            // Returns null if this object is invalid.
            this.getGpt = function () {
                if (this.bValid)
                    return gpt;
                else 
                    return null;
            };

            // Returns new wigo_ws_GeoPt that is a copy geo pt for this object.
            // Return null if this.bValid is false.
            this.newGpt = function () {
                var newGpt;
                if (this.bValid && gpt) {
                    newGpt = new wigo_ws_GeoPt();
                    newGpt.lat = gpt.lat;
                    newGpt.lon = gpt.lon;
                } else {
                    newGpt = null;
                }
                return newGpt;
            }

            // Cursor down occurred.
            this.CursorDown = function (eDir) {
                // Stop cursor down timer if it is running.
                StopCursorDownTimer();
                nCursorDownCt = 0;
                dirCursorDown = eDir;
                // view.ShowStatus("Cursor down ...", false); // for debug
                // Start timer for latched cursor down.
                handleCursorDownTimer = window.setInterval(CursorDownLatched, msCursorDownInterval);
            };

            // Cursor up occurred.
            this.CursorUp = function (eDir) {
                // Stop cursor down timer if it is running.
                StopCursorDownTimer();
                nCursorDownCt = 0;
                var nPixels = 1;
                // view.ShowStatus("Cursor up ...", false); // for debug
                UpdateForCursorMovement(eDir, nPixels);
                fsm.DoEditTransition(fsmEdit.eventEdit.Cursor);
            };

            // Lat / lon of touch point.
            var gpt = new wigo_ws_GeoPt();

            // Pixel x, y coordinate of point on screen.
            var px = L.point(0, 0);

            var dirCursorDown = fsm.dirCursor.left; // Cursor down direction.

            // Update px coordinate and gpt lat/lon due to cursor movement.
            // Args:
            //  eDir: fsm.dirCursor enumeration value indicating direction of movement.
            //  nPixels: integer for number of pixels on map to move.
            function UpdateForCursorMovement(eDir, nPixels) {
                switch (eDir) {
                    case fsm.dirCursor.left:
                        px.x -= nPixels;
                        break;
                    case fsm.dirCursor.right:
                        px.x += nPixels;
                        break;
                    case fsm.dirCursor.down:
                        px.y += nPixels;
                        break;
                    case fsm.dirCursor.up:
                        px.y -= nPixels;
                }
                // Update lat/lon for new cursor location.
                gpt = map.PixelToLatLon(px);
            }

            // Timer for cursor movement when cursor down is latched.
            var handleCursorDownTimer = null;
            var msCursorDownInterval = 500; // Was 1000 millisecs;
            var nCursorDownCt = 0;
            var nPxsPerCursorDownInterval = 2; // Was 1;
            var nMaxPxsInCursorDownInterval = 10; // Was 5;
            
            function CursorDownLatched() {
                nCursorDownCt++;
                var nPixels = nCursorDownCt * nPxsPerCursorDownInterval;
                if (nPixels > nMaxPxsInCursorDownInterval)
                    nPixels = nMaxPxsInCursorDownInterval;
                UpdateForCursorMovement(dirCursorDown, nPixels);
                // Draw the change in the touch point.
                map.DrawTouchPt(curTouchPt.getGpt());
            }

            // Stops (clears) the cursor down interval timer.
            // If timer is not running, does nothing.
            function StopCursorDownTimer() {
                if (handleCursorDownTimer) {
                    window.clearInterval(handleCursorDownTimer);
                    handleCursorDownTimer = null;
                }
            }

        }

        // Current TouchPoint.
        var curTouchPt = new TouchPoint(this);
        // Boolean to indicate curTouchPut can be set by a mouse click (touch).
        var bTouchAllowed= false;

        // Object for data about selected point on the path.
        function SelectPoint(fsm) {  
            var that = this; 

            // Sets index to path point.
            // Args:
            //  ix: integer for index in fsm.gpxPath for array of path points.
            this.setPathIx = function (ix) {
                var bValid = fsm.gpxPath && (ix >= 0 && ix < fsm.gpxPath.arGeoPt.length);
                curPathIx = bValid ? ix : -1;
            }

            // Returns index to current point in the path.
            this.getPathIx = function () {
                return curPathIx;
            };

            // Returns ref to current wigo_ws_GeoPt object for this object.
            // Returns null if current wigo_ws_GeoPt object is invalid.
            this.getGpt = function () {
                var bOk = fsm.gpxPath && (curPathIx >= 0 && curPathIx < fsm.gpxPath.arGeoPt.length);
                var gpt = bOk ? fsm.gpxPath.arGeoPt[curPathIx] : null;
                return gpt;
            };

            // Increment the curPathIx.
            this.incrPathIx = function () {
                if (fsm.gpxPath && curPathIx >= 0 && curPathIx < fsm.gpxPath.arGeoPt.length - 1)
                    curPathIx += 1;
            };

            // Decrement the curPathIx.
            this.decrPathIx = function () {
                if (fsm.gpxPath && curPathIx > 0 && curPathIx < fsm.gpxPath.arGeoPt.length)
                    curPathIx -= 1;
            };

            // Returns current new wigo_ws_GeoPt object that is a copy of geo pt.
            // Returns null if current wigo_ws_GeoPt object is invalid.
            this.newGpt = function () {
                var gpt = this.getGpt();
                var newGpt;
                if (gpt) {
                    newGpt = new wigo_ws_GeoPt()
                    newGpt.lat = gpt.lat;
                    newGpt.lon = gpt.lon;
                } else {
                    newGpt = null;
                }
                return newGpt;
            };

            // Current index to fsm.gpxPath. 
            var curPathIx = -1;
        }

        // Current select point in the path.
        var curSelectPt = new SelectPoint(this);
        
        // ** State Functions for Editing

        // Initialization state for Editing.
        function stEditInit(event) {
            var sMsg;
            bTouchAllowed = false;
            bPathChanged = false;
            // Ensure select for path drop list is empty initially.
            // Note: SignedIn event will load list of paths to select for editing.
            view.setPathList([]);
            ShowSignInCtrl(true);  
            switch (event) {
                case that.eventEdit.Init:
                    // Ensure path is empty initally. It is set later if selected for editing.
                    that.gpxPath = new wigo_ws_GpxPath();
                    that.nPathId = 0;
                    // Initialize for Edit mode.
                    curSelectPt.setPathIx(-1);  
                    curTouchPt.bValid = false;
                    map.onMapClick2 = OnMapClick2;
                    map.ClearPath();  
                    opts.Init(false);
                    opts.Select = true;
                    opts.Append = true;
                    opts.SetOptions();
                    opts.SelectOption(EPtAction.Appending);
                    if (bNew) {
                        ShowOwnerIdDiv(true); // Hidden after signin.
                        ShowElement(onlineOfflineEditBar, false);
                        ShowElement(pathDescrBar, false); // Show after signin.
                        ShowUploadButton(false);  
                        ShowDeleteButton(false);  
                        ShowCancelButton(false);  
                        ShowElement(editDefineBar2, false);
                        ShowElement(editDefineCursorsBar, false);                    
                        txbxPathName.value = "";   
                        // Initially select public share for drawing a new path. 
                        // See property property of  wigo_ws_GeoPathsRESTfulApi for sharing enumeration ;
                        view.setShareOption("private");  
                    } else {
                        // Hide path description including textbox and server action buttons.
                        ShowOwnerIdDiv(true); // Hidden after signin.
                        ShowElement(onlineOfflineEditBar, false); // Shown after signin.
                        ShowElement(pathDescrBar, false);
                        ShowElement(editDefineBar2, false);
                        ShowElement(editDefineCursorsBar, false);                    
                        txbxPathName.value = "";   
                    }
                    // Hide buttons for online-view and offline.
                    // Check if  user is signed in.
                    if (view.getOwnerId()) {
                        // Fire signed in event for this same state.
                        that.DoEditTransition(that.eventEdit.SignedIn);
                    } else {
                        sMsg = bNew ? "Sign In to define a new trail." : "Sign In to edit a trail."
                        view.AppendStatus(sMsg, false); 
                    }
                    break;
                case that.eventEdit.SignedIn:
                    // Hide SignIn ctrl so that SignIn or Logout is not available.
                    // (Do not allow user to SignIn again or Logout while editing.)
                    ShowSignInCtrl(false);
                    if (bNew) {
                        ShowElement(pathDescrBar, true);  
                        view.AppendStatus("Enter a name for a new trail.", false);
                    } else {
                        // Load path drop list for select of path to edit.
                        ShowElement(onlineOfflineEditBar, true);  
                        ShowPathInfoDiv(true); // Show the select Path drop list.
                        view.onGetPaths(view.curMode(), view.getOwnerId());
                        // Note: view.onGetPaths(..) will show a message to select path after droplist is loaded.
                    }
                    
                    curEditState = stSelectPath;
                    break;
            }
        }

        // State for selecting path from drop list of geo paths.
        function stSelectPath(editEvent) {
            // State entry actions.
            // Set UI states.
            // Only show select path drop list for editing existing path.
            // Show pathDescrBar and bar2 for Share and PtAction ctrls.
            ShowElement(pathDescrBar, true);
            ShowElement(editDefineBar2, true);
            // Enable showing cursor arrows and index buttons, 
            // but show arrows and hide index buttons.
            ShowElement(editDefineCursorsBar, true); 
            ShowPathCursors(true);
            ShowPathIxButtons(false); 

            // Show  Server Action ctrls for Cancel button.
            // Enable touch to define a point for stEdit.
            bTouchAllowed = true;
            // Do output actions for next state and transition to next state.
            switch (editEvent) {
                case that.eventEdit.SelectedPath:
                    curPathName = view.getSelectedPathName();
                    // Set path name for editing.
                    txbxPathName.value = curPathName;
                    // Disable selectGeoTrail droplist (by hiding) selection of different path.
                    ShowPathInfoDiv(false);
                    // Set options and show message for appending.
                    PrepareForEditing();
                    // Show Delete and Cancel buttons only for not new.
                    ShowDeleteButton(!bNew);
                    ShowCancelButton(!bNew);  
                    // Show path on map.
                    view.ShowPathInfo(false, that.gpxPath); 
                    if (!bNew) {   // May help first touch point to correct, not sure.
                        map.PanToPathCenter(); 
                    }
                    curEditState = stEdit;
                    break;
                case that.eventEdit.ChangedPathName:
                    bPathChanged = true;   
                    curPathName = txbxPathName.value;
                    if (bNew) {
                        PrepareForEditing();
                        // Always hide Upload button (it is shown after a change has been made). 
                        ShowUploadButton(false); 
                        curEditState = stEdit;
                    } 
                    break;
            }
        }

        function stEdit(event) {
            // State entry actions.
            bTouchAllowed = true;
            // Note: Do not change state for Upload button. Do event will show Upload button.
            ShowCancelButton(true);
            // Always start with appending point to path.
            // Ensure Cursors are hidden. (Will be shown after a touch).
            ShowPathCursors(false);
            ShowPathIxButtons(false); 

            // Do output actions for next state and transition to next state.
            switch (event) {
                case that.eventEdit.Touch:
                    // Enable the Do button and select option for appending.
                    opts.Do = true; // Enable Do button.
                    opts.SetOptions();
                    opts.SelectOption(EPtAction.Appending);
                    ShowInstrForCursors();
                    ShowPathCursors(true);
                    ShowPathIxButtons(false); 
                    ShowDeleteButton(false);
                    ShowUploadButton(false);
                    ShowCancelButton(false);  
                    map.DrawAppendSegment(curTouchPt.getGpt());
                    curEditState = stAppendPt;
                    break;
                case that.eventEdit.ChangedPathName:
                case that.eventEdit.ChangedShare:
                    // Changed path name or share (public/private).
                    // Ensure Upload button is shown and Delete button hidden.
                    ShowUploadButton(true);
                    ShowCancelButton(true); 
                    ShowDeleteButton(false);
                    // Stay in same state.
                    break;
                case that.eventEdit.SelectPt: 
                    // Hide path cursors. (Show again after point on path is selected.)
                    PrepareForSelectingPt();
                    curEditState = stSelectPt;
                    break;
                case that.eventEdit.Upload:
                    // Form path upload data and send to server.
                    DoUpload();
                    // Note: curEditState becomes stUploadPending, unless path does not exist
                    // in which case state remains the same.
                    break;
                case that.eventEdit.Delete:
                    ConfirmYesNo("OK to delete selected trail?", function (bConfirm) {
                        if (bConfirm) {
                            // Delete path at server.
                            view.ShowStatus("Deleting GPX trail at server.", false);
                            curEditState = stDeletePending;
                            var gpxId = { sOwnerId: view.getOwnerId(), nId: that.nPathId };
                            view.onDelete(view.curMode(), gpxId);
                        }
                    });
                    break;
                case that.eventEdit.Cancel:
                    CancelIfUserOks();
                    // Goes to stEditInit if user oks.
                    break;
            }
        }

        // Waiting for upload to be completed.
        function stUploadPending(event) { 
            switch(event) {
                case that.eventEdit.Completed_Ok:
                    // Fire  init event to re-initialize.
                    curEditState = stEditInit;
                    that.DoEditTransition(that.eventEdit.Init);
                    break;
                case that.eventEdit.Cancel:
                    CancelIfUserOks("Quit waiting for acknowlegement from server of upload?");
                    // Goes to stEditInit if user oks.
                    break;
                case that.eventEdit.Error:  
                    // stay in same state. 
                    ShowSignInCtrl(true);
                    view.ShowAlert("Upload failed. You may need to sign-in. Please try again.");
                    PrepareForEditing();
                    curEditState = stEdit;
                    break;
            }
        }

        // Waiting for delete to be completed
        function stDeletePending(event) {
            switch (event) {
                case that.eventEdit.Completed_Ok:
                    // Deletion was successful.
                    // Fire  init event to re-initialize.
                    // The initialization will reload the drop list for selection of a geo path.
                    curEditState = stEditInit;
                    that.DoEditTransition(that.eventEdit.Init);
                    break;
                case that.eventEdit.Cancel:
                    CancelIfUserOks("Quit waiting for acknowlegement from server of delete?");
                    // Goes to stEditInit if user oks.
                    break;
                case that.eventEdit.Error:  
                    // stay in same state. 
                    ShowSignInCtrl(true);
                    view.ShowAlert("Delete failed. You may need to sign-in. Please try again.");
                    PrepareForEditing();
                    curEditState = stEdit;
                    break;
            }
        }
        
        function stAppendPt(event) {
            // Do output actions for next state and transition to next state.
            switch (event) {
                case that.eventEdit.Touch:
                    // Draw the touch point.
                    map.DrawAppendSegment(curTouchPt.getGpt());
                    // Stay in same state. (Touch point has been saved in map click handler.)
                    break;
                case that.eventEdit.Cursor:
                    // Draw the change in the touch point.
                    map.DrawAppendSegment(curTouchPt.getGpt());
                    break;
                case that.eventEdit.Do:
                    // Append touch point as update by cursor movement to the path.
                    var gpt = curTouchPt.newGpt();
                    // Note: ignore if gpt is null. Not expected to happen.
                    if (gpt) {
                        bPathChanged = true;
                        that.gpxPath.arGeoPt.push(gpt);
                        // Clear touch point from map.
                        // Draw the updated path on the map (touch point is cleared from map).
                        view.ShowEditPathInfo(false, that.gpxPath);  
                        // Draw edit circle for last point on path.
                        map.DrawEditPt(that.gpxPath.arGeoPt.length - 1);
                        // Pan to the append point. This avoids problem of next touch being off.
                        map.PanTo(gpt);
                        PrepareForEditing();
                        curEditState = stEdit;
                    }
                    break;
                case that.eventEdit.SelectPt:
                    PrepareForSelectingPt();
                    curEditState = stSelectPt;
                    break;
                case that.eventEdit.Cancel:
                    CancelIfUserOks();
                    // Goes to stEditInit if user oks.
                    break;
            }
        }

        function stSelectPt(event) {
            switch (event) {
                case that.eventEdit.Touch:
                    if (IsPathEmpty()) {
                        // Show message if path is empty.This can happen if all points are deleted.
                        PrepareForEditing();
                        curEditState = stEdit;
                    } else {
                        // Fill the droplist for selectPtAction with all options..
                        opts.Init(true);
                        opts.SetOptions();
                        opts.SelectOption(EPtAction.Selecting);
                        // Show the path cursors.
                        ShowPathCursors(false);
                        ShowPathIxButtons(true);
                        view.ShowStatus("Use Prev/Next to move selected point along trail. Select Move Pt, Insert Pt, or Delete Pt.", false);
                        // Get the the touch point.
                        var gpt = curTouchPt.getGpt();
                        // map.DrawTouchPt(gpt); // Helps for debug, not needed.
                        // Draw the edit point.
                        var ix = map.FindEditIx(gpt)
                        curSelectPt.setPathIx(ix);
                        map.DrawEditPt(ix);
                    }
                    // Stay in same state.
                    break;
                case that.eventEdit.PathIxNext:  
                    // Select next point in path.
                    // Draw the change in the select point.
                    curSelectPt.incrPathIx();
                    map.DrawEditPt(curSelectPt.getPathIx());
                    // Stay in same state.
                    break;
                case that.eventEdit.PathIxPrev:  
                    // Select next point in path.
                    // Draw the change in the select point.
                    curSelectPt.decrPathIx();
                    map.DrawEditPt(curSelectPt.getPathIx());
                    // Stay in same state.
                    break;
                case that.eventEdit.MovePt:
                    // Hide path cursors. (Show again after a touch.)
                    // Show path cursors because selected point on path
                    // is set to curTouchPt below and is ready to be nudged by the cursors.
                    ShowPathCursors(true);
                    ShowPathIxButtons(false);
                    // Hide Upload button, which is shown when selecting a point on path.
                    ShowUploadButton(false);
                    ShowCancelButton(false); 
                    // Set PtAction options to Move and Select only with Move selected.
                    opts.Init(false);
                    opts.Move = true;
                    opts.Do = true; 
                    opts.Select = true;
                    opts.SetOptions();
                    opts.SelectOption(EPtAction.Moving);
                    // Set current touch point to selected point on path.
                    var gptSelected = curSelectPt.getGpt();
                    var pixel = map.LatLonToPixel(gptSelected);
                    curTouchPt.set(gptSelected.lat, gptSelected.lon, pixel.x, pixel.y);
                    view.ShowStatus("Nudge selected point or touch where to move it.", false);
                    curEditState = stMovePt;
                    break;
                case that.eventEdit.InsertPt:  
                    // Hide path cursors. (Show again after a touch.)
                    ShowPathCursors(false);
                    ShowPathIxButtons(false);
                    // Hide Upload button, which is shown when selecting a point on path.
                    ShowUploadButton(false);
                    ShowCancelButton(false); 
                    // Set PtAction options to Move and Select only with Move selected.
                    opts.Init(false);
                    opts.Insert = true;
                    opts.Select = true;
                    opts.SetOptions();
                    opts.SelectOption(EPtAction.Inserting);
                    view.ShowStatus("Touch where to insert point into the trail.", false);
                    curEditState = stInsertPt;
                    break;
                case that.eventEdit.DeletePt:  
                    // Show previous, next buttons to index points on path.
                    ShowPathCursors(false);
                    ShowPathIxButtons(true);
                    ShowPtDeleteDoButton(true);
                    // Hide Upload button, which is shown when selecting a point on path.
                    ShowUploadButton(false);
                    ShowCancelButton(false); 
                    // Set PtAction options to Move and Select only with Move selected.
                    opts.Init(false);
                    opts.Delete = true;
                    opts.Select = true;
                    opts.SetOptions();
                    opts.SelectOption(EPtAction.Deleting);
                    view.ShowStatus("OK to confirm Delete Pt. Use Prev/Next to move selected point along trail.", false);
                    map.DrawDeleteSegment(curSelectPt.getPathIx());    
                    curEditState = stDeletePt;
                    break;
                case that.eventEdit.AppendPt:
                    PrepareForEditing();
                    curEditState = stEdit;
                    break;
                case that.eventEdit.Upload:
                    // Upload path data to server.
                    DoUpload();
                    // Goes to stUploadPending.
                    break;
                case that.eventEdit.Cancel:
                    CancelIfUserOks();
                    // Goes to stEditInit if user oks.
                    break;
            }
        }

        function stMovePt(event) {
            switch (event) {
                case that.eventEdit.Touch:
                    // Draw the touch point.
                    map.DrawMoveSegment(curTouchPt.getGpt(), curSelectPt.getPathIx());
                    // Show path cursors.
                    ShowPathCursors(true);
                    // Show Do Pt Action Option.
                    opts.Do = true;
                    opts.SetOptions();
                    opts.SelectOption(EPtAction.Moving);
                    // Show instructions for using cursors to nudge draw circle.
                    ShowInstrForCursors();
                    // Stay in same state. (Touch point has been saved in map click handler.)
                    break;
                case that.eventEdit.Cursor:
                    // Draw the change in the touch point nudged by the cursor.
                    map.DrawMoveSegment(curTouchPt.getGpt(), curSelectPt.getPathIx());
                    break;
                case that.eventEdit.Do:
                    // Move path edit point to touch point location.
                    var gpt = curTouchPt.getGpt();
                    // Note: ignore if gpt is null. Not expected to happen.
                    if (gpt) {
                        bPathChanged = true;
                        // Set edit pt to new location.
                        var gptEdit = curSelectPt.getGpt();
                        gptEdit.lat = gpt.lat;
                        gptEdit.lon = gpt.lon;
                        // Draw the updated path on the map (touch point is cleared from map).
                        view.ShowEditPathInfo(false, that.gpxPath);  
                        // Pan to the append point. This avoids problem of next touch being off.
                        map.PanTo(gpt);
                        PrepareForSelectingPt();
                        curEditState = stSelectPt;
                    }
                    break;  
                case that.eventEdit.SelectPt:
                    // Show Pt Action options and message for select a point on the path.
                    PrepareForSelectingPt();
                    curEditState = stSelectPt;
                    break;
                case that.eventEdit.Cancel:
                    CancelIfUserOks();
                    // Goes to stEditInit if user oks.
                    break;
            }
        }
        
        function stInsertPt(event) {
            switch (event) {
                case that.eventEdit.Touch:
                    // Draw the touch point.
                    map.DrawInsertSegment(curTouchPt.getGpt(), curSelectPt.getPathIx());
                    // Show path cursors.
                    ShowPathCursors(true);
                    // Show Do Pt Action Option.
                    opts.Do = true;
                    opts.SetOptions();
                    opts.SelectOption(EPtAction.Inserting);
                    // Show instructions for using cursors to nudge draw circle.
                    ShowInstrForCursors();
                    // Stay in same state. (Touch point has been saved in map click handler.)
                    break;
                case that.eventEdit.Cursor:
                    // Draw the change in the touch point nudged by cursor.
                    map.DrawInsertSegment(curTouchPt.getGpt(), curSelectPt.getPathIx());
                    break;
                case that.eventEdit.Do:
                    // Insert touch point location before current path index.
                    var gpt = curTouchPt.newGpt();
                    var ixPath = curSelectPt.getPathIx();
                    // Note: ignore if gpt is null. Not expected to happen.
                    if (gpt && ixPath >= 0) {
                        bPathChanged = true;
                        // Insert touch point before selected point on the path.
                        that.gpxPath.arGeoPt.splice(ixPath, 0, gpt);
                        // Draw the updated path on the map (touch point is cleared from map).
                        view.ShowEditPathInfo(false, that.gpxPath);  
                        // Pan to the append point. This avoids problem of next touch being off.
                        map.PanTo(gpt);
                        PrepareForSelectingPt();
                        curEditState = stSelectPt;
                    }
                    break;  
                case that.eventEdit.SelectPt:
                    // Show Pt Action options and message for select a point on the path.
                    PrepareForSelectingPt();
                    curEditState = stSelectPt;
                    break;
                case that.eventEdit.Cancel:
                    CancelIfUserOks();
                    // Goes to stEditInit if user oks.
                    break;
            }
        }

        function stDeletePt(event) { 
            switch (event) {
                case that.eventEdit.PathIxNext:
                    // Select next point in path.
                    // Draw the change in the select point.
                    curSelectPt.incrPathIx();
                    map.DrawDeleteSegment(curSelectPt.getPathIx());    
                    // Stay in same state.
                    break;
                case that.eventEdit.PathIxPrev:
                    // Select next point in path.
                    // Draw the change in the select point.
                    curSelectPt.decrPathIx();
                    map.DrawDeleteSegment(curSelectPt.getPathIx());    
                    // Stay in same state.
                    break;
                case that.eventEdit.DeletePtDo:
                    bPathChanged = true;
                    // Insert touch point location before current path index.
                    var gpt = curTouchPt.newGpt();
                    var ixPath = curSelectPt.getPathIx();
                    // Note: ignore if gpt is null. Not expected to happen.
                    if (gpt && ixPath >= 0) {
                        bPathChanged = true;
                        // Delete selected point on the path.
                        that.gpxPath.arGeoPt.splice(ixPath, 1);
                        // Draw the updated path on the map (touch point is cleared from map).
                        view.ShowEditPathInfo(false, that.gpxPath);  
                        // Pan to the append point. This avoids problem of next touch being off.
                        map.PanTo(gpt);
                        if (IsPathEmpty()) {
                            // Last point in the path has been deleted. 
                            PrepareForEditing()
                            curEditState = stEdit;
                        } else {
                            // Typical case where there points left in the path.
                            PrepareForSelectingPt();
                            curEditState = stSelectPt;
                        }

                    }
                    break; 
                case that.eventEdit.SelectPt:
                    // Show Pt Action options and message for select a point on the path.
                    PrepareForSelectingPt();
                    curEditState = stSelectPt;
                    break;
                case that.eventEdit.Cancel:
                    CancelIfUserOks();
                    // Goes to stEditInit if user oks.
                    break;
            }

        }


        // ** Helpers for Editing State Functions
        // Object for filling the selectPtAction drop list.
        // Constructor arg:
        //  fsm: EditFSM object.
        //  bSet: boolean to indicate initial state of all options in drop list.
        function PtActionOptions(fsm, bSet) {
            // Inclusion of options for drop list.
            this.Select = false;
            this.Append = false; 
            this.Insert= false; 
            this.Move = false;
            this.Delete = false;
            // Option for showing Do button.
            this.Do = false;
            
            // Initialize all option members above to true or false.
            // Arg: bSet is boolean to set option.
            this.Init = function (bSet) {
                this.Select = bSet;
                this.Append = bSet;
                this.Insert = bSet;
                this.Move = bSet;
                this.Delete = bSet;
                // Option for showing Do button.
                this.Do = bSet;
            }

            // Fills the selectPtAction drop list based on options selected for inclusion.
            // Shows buPtDo based on option for Do.
            this.SetOptions = function() {
                // Empty the drop list.
                selectPtActionDropDown.empty();

                // Fill the droplist.
                // Fill the drop list. 
                // Note: Set value to string for EditFSM.event enumeration value.
                //       SelectPt: 1, AppendPt: 2, InsertPt: 3, MovePt: 4, DeletePt: 5,
                if (this.Select)
                    selectPtActionDropDown.appendItem(ToPtActionValue(EPtAction.Selecting), "Select Pt");
                if (this.Append)
                    selectPtActionDropDown.appendItem(ToPtActionValue(EPtAction.Appending), "Append Pt");
                if (this.Insert)
                    selectPtActionDropDown.appendItem(ToPtActionValue(EPtAction.Inserting), "Insert Pt");
                if (this.Move)
                    selectPtActionDropDown.appendItem(ToPtActionValue(EPtAction.Moving), "Move Pt");
                if (this.Delete)
                    selectPtActionDropDown.appendItem(ToPtActionValue(EPtAction.Deleting), "Delete Pt");

                ShowElement(buPtDo, this.Do);
            }

            // Selects a single option.
            // Also sets fsm.curPtAction to selected option.
            // Arg:
            //  ePtAction: EPtAction enumeration number for option to select.
            this.SelectOption = function (ePtAction) {
                var sValue = ToPtActionValue(ePtAction);
                selectPtActionDropDown.setSelected(sValue);
            }

            // Returns string value for an EPtAction enumeration number.
            // The return value is a string for a fsm.eventEdit enumeration value
            // is therefore a string for a number.
            // Arg:
            //  ePtAction: number of ePtAction enumeration.
            function ToPtActionValue(ePtAction) {
                var sValue = fsm.eventEdit.SelectPt.toString();
                switch (ePtAction) {
                    case EPtAction.Selecting:
                        sValue = fsm.eventEdit.SelectPt.toString();
                        break;
                    case EPtAction.Appending:
                        sValue = fsm.eventEdit.AppendPt.toString();
                        break;
                    case EPtAction.Moving:
                        sValue = fsm.eventEdit.MovePt.toString();
                        break;
                    case EPtAction.Inserting:
                        sValue = fsm.eventEdit.InsertPt.toString();
                        break;
                    case EPtAction.Deleting:
                        sValue = fsm.eventEdit.DeletePt.toString();
                        break;
                }
                return sValue;
            }

            function NewOption(sValue, sText) {
                var opt = document.createElement("OPTION");
                opt.value = sValue;
                opt.text = sText;
                return opt;
            }
            // Initialize properties.
            this.Init(bSet);
        }

        // Returns true if gpx path (that.gpxPath) is empty.
        function IsPathEmpty() {
            var bEmpty = true;
            if (that.gpxPath && that.gpxPath.arGeoPt.length > 0)
                bEmpty = false;
            return bEmpty;
        }

        // Prepare for editing, which initially appends point to end of the path.
        // Set PtAction options and show instructions.
        function PrepareForEditing() {
            // Ensure onlineOfflineEditBar for select a path is hidden.
            ShowElement(onlineOfflineEditBar, false); 

            // Show Upload if path has been changed.
            ShowUploadButton(bPathChanged);  
            // Show Cancel if path has changed.
            ShowCancelButton(bPathChanged); 

            // Ensure cursors and next/previous buttons are hidden.
            ShowPathCursors(false);
            ShowPathIxButtons(false);
            // Enssure edit circle and draw circle are cleared.
            map.DrawEditPt(-1);
            // Hilite last point of path for appending.
            if (that.gpxPath) { 
                var ixPath = that.gpxPath.arGeoPt.length - 1;
                if (ixPath >= 0) {
                    map.DrawEditPt(ixPath);
                }
            }

            var bPathEmpty = IsPathEmpty();
            opts.Init(false);
            opts.Append = true;
            opts.Select = !bPathEmpty;
            opts.SetOptions();
            opts.SelectOption(EPtAction.Appending);
            var sMsg = bPathEmpty ? "Touch to start a new trail." :
                                    "Touch to append point to end of trail or change Append Pt to Select Pt."
            view.ShowStatus(sMsg, false);
        }

        function PrepareForSelectingPt() {
            // Show Upload and hide Delete button.
            ShowUploadButton(bPathChanged);
            ShowCancelButton(bPathChanged); 
            ShowDeleteButton(false);
            // Hide cursor buttons. (Will be shown after a touch).
            ShowPathCursors(false);
            ShowPathIxButtons(false);
            // Ensure edit and touch circle are cleared for path.
            map.DrawEditPt(-1);
            // Ensure overlay for editing (moving or inserting) are cleared from path.
            map.ClearEditSegment();
            // Prepare for stSelectPt.
            opts.Init(false);
            opts.Select = true;
            opts.Append = true;
            opts.SetOptions();
            opts.SelectOption(EPtAction.Selecting);
            view.ShowStatus("Touch to choose point on trail.", false);
        }

        // Shows instructions for moving a draw circle. 
        function ShowInstrForCursors() {
            view.ShowStatus("Use cursor keys to nudge point a bit. Use OK to confirm.", false); // false => not an error
        }

        // Handles click event on map. 
        // If mode is online_edit or online_define:
        //      Saves lat/lng and pixel coordinate of click.
        //      Fires Touch event.
        // Else ignores the click.
        function OnMapClick2(e) {
            // Ignore map click if mode is not for online_edit or online_define.
            if (view.curMode() === view.eMode.online_edit || view.curMode() === view.eMode.online_define) {
                if (bTouchAllowed) {
                    curTouchPt.set(e.latlng.lat, e.latlng.lng, e.layerPoint.x, e.layerPoint.y);
                    var event = that.eventEdit.Touch;
                    that.DoEditTransition(event);
                }
            }
        }
        
        // Cancels editing initializing to stEditInit.
        // If user does not confirm cancel, remains in current state.
        // If path data has not be changed, accepts cancel without asking user to confirm.
        // Arg:
        //  sMsg: Optional. String for message to display. Default message shown if not given.
        function CancelIfUserOks(sMsg) {
            // Helper function to accept confirmation by user for cancel.
            function AcceptCancel() {
                // Fire  init event to re-initialize.
                // Clear so that only instructional message is gone for reinitialization.
                view.ShowStatus("", false);
                curEditState = stEditInit;
                that.DoEditTransition(that.eventEdit.Init);
            }

            if (that.IsPathChanged()) {
                if (!sMsg)
                    sMsg = "OK to cancel editing and lose all changes?";
                ConfirmYesNo(sMsg, function (bConfirm) {
                    if (bConfirm) {
                        AcceptCancel();
                    }
                });
            } else {
                // Accept cancel without asking user if there is no data change.
                AcceptCancel();
            }
        }

        // Uploads path data to server.
        // Returns true if upload is initiated and sets current state to stUploadPending.
        // If paths can not be uploaded returns false.
        function DoUpload() {
            var bOk = false;
            if (that.gpxPath) { // Ignore if gpxPath obj does not exists.
                if (that.gpxPath.arGeoPt.length > 1) {
                    var path = NewUploadPathObj();
                    path.nId = that.nPathId;
                    path.sOwnerId = view.getOwnerId();
                    path.sPathName = txbxPathName.value;
                    path.sShare = selectShareDropDown.getSelectedValue();
                    path.arGeoPt = that.gpxPath.arGeoPt;
                    curEditState = stUploadPending; 
                    view.onUpload(view.curMode(), path);
                    view.ShowStatus("Uploading trail to server.", false);
                    bOk = true;
                } else {
                    var sMsg = "Cannot upload the geo trail because it must have more than one point.";
                    AlertMsg(sMsg);
                }
            }
            return bOk;
        }
    }

    // Object for FSM for recording a path.
    // Constructor arg:
    //  view: ref to wigo_ws_View object.
    function RecordFSM(view) {
        var that = this;

        // Events for RecordFSM.
        this.event = {
            unknown: -1,
            start: 0,
            append_to_trail: 1,
            unclear: 2,
            pause: 3,  // No longer used.
            stop: 4,
            resume: 5,
            clear: 6,
            save_trail: 7,   // Upload trail
            append_trail: 8, // No longer used
            upload: 9,       
            cancel: 10,
            show_stats: 11, 
            filter: 12,     
            unfilter: 13,
            save_locally: 14, // save trail offline. 
            animate_trail: 15, 
        }; 

        // Initialize the RecordFSM (this object).
        // Arg:
        //  recordCtrlRef: RecordCtrl object, optional. Ref to DropDownControl from Wigo_Ws_CordovaControls.
        //                 If not given, current DropDownControl remains the same. 
        // Note: var recordCtrl is updated for the current state
        //       as RecordFSM object changees states.
        this.initialize = function(recordCtrlRef) {
            if (recordCtrlRef)   
                recordCtrl = recordCtrlRef;
            bOnline = view.curMode() === view.eMode.online_view;  
            stateInitial.reset();  
            stateInitial.prepare();
            curState = stateInitial;
        };
        var recordCtrl = null;
        var bOnline = true; 

        // Saves stats for recorded trail locally and returns to initial state 
        // with record recorded path cleared. (Recorded path can be uncleared.)
        // Note: Raises event.stop, which transitions to StateStopped if recornding is on.
        //       Raise event.clear, which clears recorded trail (allowing it to be uncleared)
        //       and transitions to StateInitial from StateStopped.
        this.saveStats = function() { 
            if (this.isOff())                                          
                return; // Quit if recording off, no path for stats.   
            
            // Ensure stopped. StateStopped saves stats locally.
            this.nextState(this.event.stop);  

            this.nextState(this.event.clear); // Clear recorded trail.
        };


        // Saves stats and updates stats metrics.
        function SaveStats() { 
            // Filter the record path.
            map.recordPath.filter();
            // Get stats and save locally.
            var stats = map.recordPath.getStats();
            if (stats.bOk) {
                var statsData = view.onSetRecordStats(stats); // Save stats data. 
                recordStatsMetrics.update(statsData); // Update metrics for stats. 
                recordStatsHistory.queueStatsUpdateItem(statsData); // Queue stats for display in Stats History.
            }
        }

        // Transitions this FSM to its next state given an event.
        // Arg:
        //  evenValue: property value of this.event causing the transition.
        this.nextState = function(eventValue) {
            if (curState) 
                curState.nextState(eventValue);
        };

        // Indicates completion of uploading a path to the server.
        // Args:
        //  bOk: boolean. true indicates success.
        //  nId: number. record id at server for the uploaded path.
        //  sPathName: string. name of the path. (server might rename path to avoid duplicates.)
        this.uploadPathCompleted = function(bOk, nId, sPathName) { 
            uploader.uploadCompleted(bOk, nId, sPathName);    
        };

        // Returns value for an eventName.
        // Arg:
        //  sEventName: string. property name in this.event enumeration object.
        this.eventValue = function(sEventName) {
            var eventValue = this.event[sEventName];
            if (typeof(eventValue) === 'undefined')
                eventValue = this.event.unknown;
            return eventValue;
        };


        // Returns true if recording points for path is active.
        this.isRecording = function() {
            var bYes = curState === stateOn;
            return bYes;
        };

        // Returns true if recording points for a path is stopped.
        this.isStopped = function() {
            var bYes = curState === stateStopped;
            return bYes; 
        }; 

        // Reeturns true if in state for defining a trail name.
        this.isSignInActive = function() { 
            return signin.isSignInActive();  
        };

        // Returns true if recording is off.
        // Note: When recording is off, the the current state is Initial.
        this.isOff = function() { 
            var bYes = curState === stateInitial;
            return bYes;
        };

        // Returns true if current state is for defining the trail name.
        this.isDefiningTrailName = function() {  
            var bYes = curState === stateDefineTrailName;
            return bYes; 
        };

        // Returns true if current state is DefineTrailName and uploading the trail.
        // false indicates saving the trail locally (offline) or current state
        // is not DefineTrailName.
        this.isDefineTrailNameUploading = function() {
            var bUploading = this.isDefiningTrailName();
            if (bUploading) {
                bUploading = stateDefineTrailName.isUploading();
            }
            return bUploading;
        };


        // Returns true if given psuedo Reccord path id matches that of the currently saved
        // Record trail.
        // Arg:
        //  nId: number. id to check for a match with the saved Record path id. 
        this.isCurPathSaved = function(nId) { 
            var bYes = localSaver.isCurPathSaved(nId);
            return bYes; 
        };

        // Set flag to indicate testing.
        // Arg:
        //  bTestingArg: boolean. true indicates testing.
        // Note: When testing, a touch on the map simulates a recording point
        //       was captured.
        this.setTesting = function(bTestingArg) {
            bTesting = bTestingArg;
        }
        var bTesting = false;

        // Returns boolean state for testing active.
        this.isTesting = function() {
            return bTesting;
        }

        // Hepler for testing recording a watch point.
        // Append and draws a point to the record path.
        // Return true if a point is appended to the path, which is done if testing is
        // enabled and recording is active. false indicates no point was appended.
        // Arg:
        //  llNext: L.LatLng. A simulated watch point to append.
        this.testWatchPt = function(llNext) {
            var bRecordPt = bTesting && this.isRecording();
            if (bRecordPt) {
                recordWatcher.testWatchPt(llNext);
            }
            return bRecordPt;
        };

        // Returns reference to Uploader() object available for use.
        // See function Uploader() below, nested in RecordFSM().
        this.refUploader = function() {
            return uploader; 
        }; 

        this.refSignIn = function() {
            return signin;
        };

        // ** Private members
        var curState = null; // Current state.

        // Object for tracking geo location using window.navigator.geolocation.watchPosition(..)
        // when recording a trail.
        function RecordWatcher() {
            var that = this;

            // Start watching changes in location for recording.
            // Note: Clears a previous watch if one exists.
            this.watch = function() {
                var prevPosition = null;  
                // Ensure a previous watch is cleared. This might prevent getting a stale position if 
                // previous watch has not been cleared. Maybe not, but can't hurt.
                ClearOnly(); // Only clears the watch and does not disable background mode, which is enabled below. Avoids a conflict.
                // Save start time for watch to filter out a stale position that might be reported.
                msWatchStart = Date.now();  
                myWatchId = navigator.geolocation.watchPosition(
                    function (position) {
                        // Success.
                        // Note: One would think myWatchId could not be null here. However, I think I have seen
                        //       the record path redraw after clearing, although it seldoms happens.
                        //       Therefore add a test, && myWatchId !== null, just in case this function is called
                        //       when trying to clear watch. The test should not hurt and might help.
                        if (!bTesting && myWatchId !== null) {  
                            // Check for stale position whose time stamp is before start time of watching.
                            if (position.timestamp >= msWatchStart) { 
                                // Ignore position if its timestamp is invalid wrt timestamp of the previous position.
                                if (!prevPosition || prevPosition.timestamp < position.timestamp) { 
                                    prevPosition = position;                                        
                                    var llNext = new L.LatLng(position.coords.latitude, position.coords.longitude);
                                    AppendAndDrawPt(llNext, position.timestamp);
                                }
                            } else {
                                // Log the stale position
                                var dateStale = new Date(position.timestamp);
                                var dateWatchStart = new Date(msWatchStart);
                                var sStaleDate = dateStale.toLocaleDateString();
                                var sStaleTime = dateStale.toLocaleTimeString();
                                var sWatchStartDate = dateWatchStart.toLocaleDateString();
                                var sWatchStartTime = dateWatchStart.toLocaleTimeString(); 
                                var sConsoleMsg = "Stale Watch: {0} {1} < start {2} {3}".format(sStaleDate, sStaleTime, sWatchStartDate, sWatchStartTime);
                                console.log(sConsoleMsg);             
                            }
                        }
                    },
                    function (positionError) {
                        // Error getting geo location.
                        ShowGeoLocPositionError(positionError);
                    },
                    geoLocationOptions    
                );
                backgroundMode.enableRecord(); 
            };

            // Clear watching the geolocation.
            this.clear = function() {
                if (myWatchId) {
                    backgroundMode.disableRecord(); 
                    navigator.geolocation.clearWatch(myWatchId); 
                }
                myWatchId = null;
            };

            // Draws and appends a point to record path, but only if testing is active.
            // Returns boolean for testing active.
            this.testWatchPt = function(llNext) {
                if (bTesting) {
                    var msTimeStamp = Date.now();
                    AppendAndDrawPt(llNext, msTimeStamp);
                }
                return bTesting
            };

            // ** Private members
            // Clears watch without affecting background mode.
            // Note: this.watch() calls this function and then 
            //       enables background mode. There was a conflict (race?)
            //       if background was disabled and then enabled immediately.
            function ClearOnly() {
                if (myWatchId) {
                    navigator.geolocation.clearWatch(myWatchId); 
                }
                myWatchId = null;
            }

            // Helper to draw and append a recorded point.
            // Args:
            //  llNext: L.LatLng. point to append to map.recordPath.
            //  msTimeStamp: number. timestamp in milliseconds.
            // Note: This function is shared by navigator.geolocation.watchPosition(...) and
            //       simulating a watch point for testing.
            function AppendAndDrawPt(llNext, msTimeStamp) {
                map.recordPath.appendPt(llNext, msTimeStamp);  
                map.recordPath.draw();
                // After adding first point only, zoom to first record point.
                map.recordPath.zoomToFirstCoordOnce(500); 
            }
            var myWatchId = null;
            var msWatchStart = 0;  // Current time in milliseconds when watch is started.
        } 
        var recordWatcher = new RecordWatcher(); 

        
        // ** State objects
        // Record is off. Ready to start.
        function StateInitial() {
            // Reset for StateInitial.
            // Note: Does NOT reset geo points in recordPath. Need to call map.recordPath.reset() to reset geo points.
            this.reset = function() {
                // Set default for recordShare droplist.
                selectRecordShareDropDown.setSelected('private');
                // Reset the uploader for the recorded trail.
                uploader.clear();
                // Initialize parameters for saving a Record trail offline.
                localSaver.initParams();
            };

            this.prepare = function() {
                recordWatcher.clear(); // Ensure watching for gps is cleared. 
                recordCtrl.setLabel("Off")
                recordCtrl.empty();
                recordCtrl.appendItem("start", "Start");
                // Allow undoing clear if recording path exists.
                if (!map.recordPath.isEmpty()) 
                    recordCtrl.appendItem("unclear", "Unclear");
                map.recordPath.clear();
                // Ensure trail name textbox is hidden.
                ShowPathDescrBar(false);  
                view.ClearStatus();
            };

            this.nextState = function(event) {
                switch (event) {
                    case that.event.start: 
                        this.reset(); 
                        map.recordPath.reset(); // Clear geo points for recordPath. 
                        stateOn.prepare();
                        map.recordPath.enableZoomToFirstCoordOnce(); 
                        curState = stateOn;
                        view.ShowCurrentStatus(); // Show status for Record, Track, and Accel. 
                        break;
                    case that.event.unclear:
                        // Display the trail that has been restored.
                        map.recordPath.draw();
                        stateStopped.prepare();
                        curState = stateStopped;
                        break;
                }
            };
        }
        var stateInitial = new StateInitial();

        // Record is running.
        function StateOn() {
            this.prepare = function() {
                recordCtrl.setLabel("On");
                recordCtrl.empty();
                recordCtrl.appendItem("stop", "Stop");
                map.ClearPathMarkers();  // Ensure path markers are cleared when recording. 
                // Start watching for location change.
                recordWatcher.watch();
                // Check device motion for excessive acceleration.
                deviceMotion.enableForRecording(); 
            };

            this.nextState = function(event) {
                switch (event) {
                    case that.event.stop:
                        var msTimeStamp = Date.now();
                        map.recordPath.appendPt(null, msTimeStamp, map.recordPath.eRecordPt.PAUSE); 
                        SaveStats(); // Save stats locally when stopping. 
                        stateStopped.prepare();
                        curState = stateStopped;
                        view.ShowCurrentStatus(); // Show status for Record, Track, and Accel. 
                        break; 
                }
            }

        }
        var stateOn = new StateOn();
        
        // Record trail is completed.
        function StateStopped() {
            this.prepare = function() {
                recordWatcher.clear(); // Ensure watching for location change is stopped.
                deviceMotion.disableForRecording(); // Stop checking device motion. 
                recordCtrl.setLabel("Stopped");
                recordCtrl.empty();
                var bSavePathValid = uploader.isSavePathValid(); 
                if (bSavePathValid) {
                    if (bOnline)                                             
                        recordCtrl.appendItem("save_trail", "Upload"); // Upload only for online.
                    recordCtrl.appendItem("save_locally", "Save Offline");   
                    recordCtrl.appendItem("animate_trail", "Animate Trail"); 
                }
                // Decided not use append_trail. Instead use Edit mode to insert another trail.
                // var bAppendPathValid = bOnline && uploader.isAppendPathValid();
                recordCtrl.appendItem("show_stats", "Show Stats");
                recordCtrl.appendItem("resume", "Resume");
                recordCtrl.appendItem("clear", "Clear");
                recordCtrl.appendItem("filter", "Filter");
                if (map.recordPath.isUnfilterEnabled()) {
                        recordCtrl.appendItem("unfilter", "Unfilter");
                }

                // Ensure signin ctrl is hidden.
                signin.hide();
                ShowPathDescrBar(false); 
                if (!bSavePathValid) { 
                    view.ShowAlert("There is no recorded trail.");
                }
            };

            this.nextState = function(event) {
                switch (event) {
                    case that.event.save_trail: // Upload to server. Only valid for online.
                        if (uploader.isUploadInProgress() && nUploadWaitBeforeRetryCountDown > 0 ) { 
                            // Issue warning that uploading is in progress, but after max tries try to upload again.
                            nUploadWaitBeforeRetryCountDown--;  
                            view.ShowAlert("Uploading recording of trail has not completed.<br/>Please wait.");
                        } else if (uploader.isPathAlreadyDefined()) {
                            nUploadWaitBeforeRetryCountDown = nUploadWaitBeforeRetryMax; 
                            // Update existing Record trail that has already been uploaded.
                            uploader.setArGeoPt(); 
                            uploader.upload();
                            stateStopped.prepare();
                            curState = stateStopped;
                        } else {
                            nUploadWaitBeforeRetryCountDown = nUploadWaitBeforeRetryMax; 
                            // Define params for a new recorded trail.
                            if (networkInfo.isOnline()) {   
                                // Define params for a new recorded trail.
                                var bUpload = true;
                                stateDefineTrailName.prepare(bUpload);  
                                curState = stateDefineTrailName;
                            } else {
                                // Indicate internet is not available, stay in same state.
                                view.ShowStatus("Internet access is not available. Cannot upload."); 
                                view.AppendStatusDiv(networkInfo.getBackOnlineInstr(), false);  
                                var sMsg = "Alternatively you can:"
                                sMsg += "<ul><li>Use Record > Save Offline to save locally.</li>"
                                sMsg += "<li>Then later upload:<ul>";
                                sMsg += "<li>View > Offline.</li>"
                                sMsg += "<li>Select saved trail from Trails droplist.</li>"
                                sMsg += "<li>Local Data > Begin Upload.</li></ul></ul>";
                                view.AppendStatusDiv(sMsg, false);
                            }
                        }
                        break;
                    case that.event.save_locally:  
                        // Save record trail offline locally.
                        if (localSaver.isPathNameDefined()) {
                            // Update Record trail and save it locally.
                            var bSaveOk = localSaver.save();
                            ShowOfflineSavePathResult(bSaveOk); 
                            // Stay in same state.
                            stateStopped.prepare();
                            curState = stateStopped;
                        } else {
                            // Define trail name  for a new recorded trail.
                            var bUpload = false;
                            stateDefineTrailName.prepare(bUpload);
                            curState = stateDefineTrailName;
                        }
                        break;
                    // case that.event.append_trail: // Note: this case is no longer used.
                    //     if (uploader.isUploadInProgress() ) { 
                    //         view.ShowAlert("Uploading recording of trail has not completed.<br/>Please wait.");
                    //     } else {
                    //         // Upload recorded trail appended to main trail.
                    //         // Note: If later decide to use append_trail, change to present confirm dialog, view.ShowConfirm(..).
                    //         uploader.uploadMainPath();
                    //         stateStopped.prepare();
                    //         curState = stateStopped; 
                    //     }
                    //     break;
                    case that.event.animate_trail: 
                        map.recordPath.animatePath();
                        // Stay in same state, which is already prepared.
                        break;
                    case that.event.show_stats:
                        map.recordPath.filter();   // Filter path before showing stats. 
                        ShowStats();
                        stateStopped.prepare();
                        curState = stateStopped;
                        break;
                    case that.event.resume: 
                        var msTimeStamp = Date.now();
                        map.recordPath.appendPt(null, msTimeStamp, map.recordPath.eRecordPt.RESUME); 
                        stateOn.prepare();
                        curState = stateOn;
                        view.ShowCurrentStatus(); // Show status for Record, Track, and Accel. 
                        break;
                    case that.event.clear:
                        stateInitial.prepare();
                        curState = stateInitial;
                        break;
                    case that.event.filter: 
                        var filterResult = map.recordPath.filter();
                        var sMsg;
                        var sAdditional = filterResult.nAlreadyDeleted > 0 ? "additional " : "";
                        if (filterResult.nDeleted <= 0)
                            sMsg = "No {0}points filtered out.".format(sAdditional);    
                        else if (filterResult.nDeleted === 1)
                            sMsg = "1 {0}point filtered out.".format(sAdditional);      
                        else 
                            sMsg = "{0} {1}points filtered out.".format(filterResult.nDeleted, sAdditional); 
                        view.ShowStatus(sMsg, false);
                        stateStopped.prepare();
                        curState = stateStopped;
                        break;
                    case that.event.unfilter: 
                        map.recordPath.unfilter();
                        view.ShowStatus("Filter removed.", false);  
                        stateStopped.prepare();
                        curState = stateStopped;
                        break;
                }
            };
            
            // Shows current stats. 
            function ShowStats() {
                // Helper that returns minutes and seconds for a time interval.
                // Returns string for minutes and  seconds.
                // Arg: 
                //  msInterval: number of milliseconds in the interval.
                function TimeInterval(msInterval) {
                    var nSecs = msInterval / 1000;
                    var nMins = Math.floor(nSecs/60);
                    var nSecs = nSecs % 60; 
                    // Note: Must use  nSecs < 9.5, not <= 9.5 because 9.5.toFixed(0) rounds to 10 and 9.5 < 9.5 is false.
                    var sSecs = nSecs < 9.5 ? "0" + nSecs.toFixed(0) : nSecs.toFixed(0);  
                    sSecs = "{0} : {1}".format(nMins, sSecs); 
                    return sSecs;
                }
                var stats = map.recordPath.getStats();
                var sMsg = "";
                if (stats.bOk) {
                    var sStartDate = stats.tStart.toLocaleDateString();
                    var sStartTime = stats.tStart.toLocaleTimeString();
                    var s = "Stats for {0} {1}<br/>".format(sStartDate, sStartTime);
                    sMsg += s;
                    var sLen = lc.to(stats.dTotal); // lc is LengthConvert() object in view.
                    s = "Distance: {0}<br/>".format(sLen);
                    sMsg += s;
                    s = "Run Time (mins:secs): {0}<br/>".format(TimeInterval(stats.msRecordTime));
                    sMsg += s;
                    // Show speed in miles per hour (MPH) or kilometers per hour (KPH). 
                    var speed = lc.toSpeed(stats.dTotal, stats.msRecordTime/1000.0);    
                    s = "Speed: {0}<br/>".format(speed.text);                           
                    sMsg += s;                                                          
                    // Elapsed time does not seem useful, probably confusing.
                    // s = "Elapsed Time: {0}<br/>".format(TimeInterval(stats.msElapsedTime));
                    // sMsg += s;
                    s = "Kinetic Calories: {0}<br/>".format(stats.calories.toFixed(1)); 
                    sMsg += s;
                    s = "Calories Burned: {0}<br/>".format(stats.calories3.toFixed(0));  
                    sMsg += s;   
                    if (stats.nExcessiveV > 0) { // Check for points ommitted because of excessive velocity. 
                        s = "{0} points ignored because of excessive velocity.<br/>".format(stats.nExcessiveV);
                        sMsg += s;
                    }
                    var sStatsMetricsMsg = recordStatsMetrics.formStatusMsg();
                    view.ShowStatus(sStatsMetricsMsg, true); // Show stats metrics status as error for highlighting. Maybe change later.
                    view.AppendStatus(sMsg, false);
                } else {
                    view.ShowStatus("Failed to calculate stats!");
                }
            }
            
            var nUploadWaitBeforeRetryMax = 3;  // Max number of times to wait on upload when upload is in progress.
            var nUploadWaitBeforeRetryCountDown = nUploadWaitBeforeRetryMax; // Current count down for waiting on upload before retrying to upload.
        }
        var stateStopped = new StateStopped();

        // Define name of the trail.
        function StateDefineTrailName() {
            // Prepares UI for this state.
            // Arg:
            //  bUpload: boolean. true for upload trail to server, false to save trail locally.
            this.prepare = function(bUpload) { 
                bUploading = bUpload;
                SetPathNameUI(bUpload); 
                recordCtrl.setLabel("TrName");
                recordCtrl.empty();
                view.ShowStatus("Enter a name for the trail", false);
                if (bUpload)                                                 
                    recordCtrl.appendItem("upload", "Upload");               
                else                                                         
                    recordCtrl.appendItem("save_locally", "Save Offline");   
                recordCtrl.appendItem("cancel", "Cancel");
                // Note: the above items for recordCtrl droplist are not actually used because SetPathNameUI() shows two buttons to use instead.
                if (bUpload)        
                    signin.showIfNeedBe(); 
                txbxPathName.focus();  // Set focus to textbox so keyboard is presented. 
            };

            this.nextState = function(event) {
                switch(event) {
                    case that.event.upload:
                        // Get trail name and upload 
                        var ok = UploadNewPath();
                        if (ok.empty) {
                            stateStopped.prepare();
                            curState = stateStopped;
                            view.ShowStatus("The recorded trail is empty.");
                        } else if (ok.upload) {
                            ClearPathNameUI(); 
                            stateStopped.prepare();
                            curState = stateStopped;
                        }
                        // Note: If something is wrong for upload stay in same state.
                        break;
                    case that.event.save_locally: 
                        // Set params.name name from txbxPathName.
                        var bOk = localSaver.setPathName();
                        // Save the 
                        if (bOk)
                            bOk = localSaver.save();
                        ShowOfflineSavePathResult(bOk); 
                        if (bOk) {
                            ClearPathNameUI(); 
                            stateStopped.prepare();
                            curState = stateStopped;
                        } 
                        // Note: If somethng is wrong for saving, stay in same state.
                        break;
                    case that.event.cancel:
                    case that.event.stop: 
                        stateStopped.prepare();
                        view.ClearStatus();    
                        ClearPathNameUI();  // Clear UI for defining path name.
                        curState = stateStopped;
                        break;
                }
            };

            // Return boolean indicating if StateDefineTrailName is for uploading.
            // true indicates uploading, false indicates saving.
            this.isUploading = function() {
                return bUploading;
            }

            var bUploading = false; 

            // Helper to upload new recorded trail. Shows a status message for the result.
            // Returns {empty: boolean, upload: boolean}:
            //  empty: boolean. true if path coords are empty (one or no points).
            //  upload: boolean. upload initiated.
            // Note: true is returned if recorded path is uploaded or if recorded path is empty or only one coord.
            function UploadNewPath() {
                bNewUploadPath = false; // Set to true later if successful.
                var ok = {empty: false, upload: false};
                uploader.uploadPath.nId = 0;  // Database record id is 0 for new record.
                // Set coords to upload.
                var bOk = uploader.setArGeoPt();
                if (!bOk) {
                    ok.empty = true;
                    return ok;
                }
                
                // Set owner id.
                bOk = uploader.setOwnerId();
                if (!bOk)
                    return ok;
                
                bOk = uploader.setPathName();
                if (!bOk)
                    return ok;

                // Set share value.
                uploader.setShare();
                
                uploader.upload();
                ok.upload = true;
                bNewUploadPath  = true;
                return ok;
            }

            // Shows the UI for defining a path name enabling cancel.
            // Arg:
            //  bUpload: boolean. true to upload trail to server, false to save trail locally.
            function SetPathNameUI(bUpload) { 
                txbxPathName.value = ""; // Clear path name. 
                AddCancelHandler();
                ShowPathAndMapBars(false);
                if (bUpload) { 
                    // For upload, show path descr bar with Upload button.
                    ShowPathDescrBar(true);
                } else {
                    // For save locally, show path descr bar with Save Offline button.
                    ShowPathDescrBarWithSaveAreaOfflineButton(true);
                }
            }

            // Hides the UI for defining a path name disabling cancel,
            function ClearPathNameUI() { 
                RemoveCancelHandler();
                ShowPathAndMapBars(true);
                ShowPathDescrBar(false); // Note: Hides path descr bar and all ctrls. Samo for online or offline.
            }

            function AddCancelHandler() { 
                RemoveCancelHandler(); // Ensure only add once.
                buCancel.addEventListener('click', OnCancel, false);
            }

            function RemoveCancelHandler() {  
                buCancel.removeEventListener('click', OnCancel, false);
            }

            // Event handler for the cancel button.
            function OnCancel(evt) {  
                that.nextState(that.event.cancel);
            }
        }
        var stateDefineTrailName = new StateDefineTrailName();
        var bNewUploadPath = false; // Indicates a new path for trail has been uploaded to server.

        // Object for managing sign-in control bar for Record.
        function SignIn() {
            // Shows the signin control bar.
            this.show = function() {
                bSignInActive = true;
                ShowSignInCtrl(true);
            };

            // Gets owner id and shows signin ctrl if owner id is empty.
            // Returns owner id string.
            this.showIfNeedBe = function() {
                var sOwnerId = view.getOwnerId();
                var bOk = sOwnerId.length > 0;
                if (!bOk) {
                    view.ShowStatus("Sign-in to upload the recorded trail.<br/>Then enter a name for the trail.", false); 
                    this.show();
                }
                return sOwnerId;
            };

            // Hides the signin control bar.
            this.hide = function() {
                bSignInActive = false;
                ShowSignInCtrl(false);
            };

            // Returns boolean to indicate if signin for Record is active.
            // Note: this.show() sets active, this.hide() claars active.
            this.isSignInActive = function() {
                return bSignInActive;
            }

            var bSignInActive = false; // Indicates that signin is active.
        }
        var signin = new SignIn();

        // ** Object to upload a record trail.
        function Uploader() {
            // Object describing the upload path:
            //  nId: number. database record id.
            //  sPathName: string. path name.
            //  sShare: string: share value (public or private).
            //  arGeoPt: array of wigo_ws_GeoPt obj. Lattitude and longitude of points in the path.
            this.uploadPath = NewUploadPathObj();

            // Add methods to set properties of this.uploadPath.
            // Sets path name from textbox and check if it  is ok for upload. 
            // If not ok shows a status message.
            // Returns true for ok.
            this.setPathName = function() {
                this.uploadPath.sPathName = txbxPathName.value.trim(); 
                var bOk = this.uploadPath.sPathName.length > 0;
                if (!bOk) {
                    view.ShowStatus("Enter a name for the trail.");
                    return bOk;
                }
                return bOk;            
            }; 

            // Assigns owner id and checks if ownerid is ok for upload.
            // If not ok, shows a status message and the signin control.
            // Returns true for ok.
            this.setOwnerId = function() {
                this.uploadPath.sOwnerId = signin.showIfNeedBe(); 
                var bOk = this.uploadPath.sOwnerId.length > 0;
                return bOk;
            };

            // Assigns uploadPath.arGeoPt for the recocrd path coords to upload.
            // Checks if length of path is ok. If not shows a status message.
            // Return true if ok. 
            this.setArGeoPt = function() {
                this.uploadPath.arGeoPt = map.recordPath.getGeoPtArray();
                var bOk = this.uploadPath.arGeoPt.length > 1;
                if (!bOk) {
                    view.ShowStatus("No points for the trail have been recorded.");
                }
                return bOk; 
            };

            // Assigns uploadPath.arGeoPt to an array of wigo_ws_GeoPt objects.
            // Checks if length of path is ok. If not shows a status message.
            // Return true if ok. 
            // Arg:
            //  arGeoGpt: array of wigo_ws_GeoPt objects.
            this.setArGeoPtFromArray = function(arGeoPt) { 
                var bOk = arGeoPt && arGeoPt.length > 1;
                if (bOk) {
                    this.uploadPath.arGeoPt = arGeoPt; 
                } else {
                    view.ShowStatus("No points in path.");
                 }
                return bOk;
            }

            // Assigns uploadPath.share value from the record share control.
            this.setShare = function() {
                this.uploadPath.sShare = selectRecordShareDropDown.getSelectedValue();
            };

            // Clears the upload path.
            this.clear = function() {
                this.uploadPath.nId = 0;
                this.uploadPath.sOwnerId = "";
                this.uploadPath.sPathName = "";
                this.uploadPath.Share = 'private';
                // Note: Remove ref to this.uploadPath.arGeoPt (set to null) rather than 
                // setting length to 0 because object is also referenced by array 
                // for offline paths in the model due to shallow copies.
                this.uploadPath.arGeoPt = null; 
                bNewUploadPath = false;  
                txbxPathName.value = ""; 
                bUploadInProgress = false; 
            };

            // Indicates the upload has completed.
            // Arg:
            //  bOk: boolean. true for upload successful.
            //  nId: number. database id for the uploaded path. Ignored if bOk is false.
            //  sPathName: string. path name (server might rename to avoid duplicate name in database).
            this.uploadCompleted = function(bOk, nId, sPathName) {  
                if (bOk) {
                    if (typeof(nId) === 'number')
                        this.uploadPath.nId = nId;
                    this.uploadPath.sPathName = sPathName; 
                } else {
                    view.ShowAlert("Upload failed. You may need to sign-in. Please try again.",
                        function() {  
                            signin.show(); 
                        }
                    );
                }
                bUploadInProgress = false;
            };

            // Upload the path to server. Display status message. 
            // Returns: nothing.
            // Note: Call when uploading a recorded trail without a main trail prepended.
            //       Call this.uploadMainPath() instead if prepending a main trail.
            this.upload = function() {
                bUploadInProgress = true;
                bNewUploadPath = true;      
                view.ShowStatus("Uploading recorded trail.", false); 
                view.onUpload(view.curMode(), this.uploadPath);
            };

            // Returns true if path is already defined.
            // Note: true indicates the path is properly defined, which means 
            // that the this.uploadPath.nId is not 0 because 0 indicates 
            // a new path is being defined. If the upload of a new path
            // is in progress, nId is 0 until the upload has completed.
            // If the upload is for an existing path, the upload may or may not
            // be completed.
            this.isPathAlreadyDefined = function() {
                var bYes = this.uploadPath.nId > 0; 
                return bYes;
            };

            // Returns true if an upload is still in progress.
            this.isUploadInProgress = function() {
                return bUploadInProgress;   
            };

            // Returns true if it is valid to save the recorded path.
            // Note: If a mainUploadPath has been uploaded, returns false.
            this.isSavePathValid = function() {
                var bYes = map.recordPath.getLength() > 1;
                return bYes;
            }

            var bUploadInProgress = false;
        }
        var uploader = new Uploader();
        // **

        // ** Object to save a record trail to local storage (used in offline view).
        function LocalSaver() {
            // Initializes parameters for saving current Record trail to local storage.
            this.initParams = function() {
                params.nIx = -1; // Not used.
                params.nId = 0;  // New record id.
                params.tStamp = new Date(Date.now());
                params.name = ''; 
                params.gpxPath = null; // Record trail not defined yet.
            };

            // Returns true if user has entered a path name.
            this.isPathNameDefined = function() {
                var bYes = params.name.trim().length > 0;
                return bYes;
            };

            // Sets params path name from the txbxPathName text box.
            // Returns true for success. 
            this.setPathName = function() { 
                var bOk = SetPathName();
                return bOk;
            };

            // Returns path name.
            this.getPathName = function() { 
                return params.name;
            }

            // Returns true if given psuedo Reccord path id matches that of the currently saved
            // Record trail.
            // Arg:
            //  nId: number. id to check for a match with the saved Record path id. 
            this.isCurPathSaved = function(nId) { 
                var bYes = nId === params.nId;
                return bYes;
            };

            // Saves Record trail to local storage.
            this.save = function() { 
                var bOk = params.name.length > 0;
                if (bOk) {
                    // Save current Record trail locally.
                    var oMap = map.getMap();
                    var bounds = oMap.getBounds();
                    params.bounds.ne.lat = bounds.getNorthEast().lat;
                    params.bounds.ne.lon = bounds.getNorthEast().lng;
                    params.bounds.sw.lat = bounds.getSouthWest().lat;
                    params.bounds.sw.lon = bounds.getSouthWest().lng;
                    var center = oMap.getCenter();
                    params.center.lat = center.lat;
                    params.center.lon = center.lng;
                    params.zoom = oMap.getZoom();

                    // Set params.gpxPath properties. 
                    params.gpxPath = new wigo_ws_GpxPath();
                    var arGeoPt = map.recordPath.getGeoPtArray();
                    params.gpxPath.arGeoPt = arGeoPt;
                    params.gpxPath.gptBegin.lat = arGeoPt[0].lat;
                    params.gpxPath.gptBegin.lon = arGeoPt[0].lon;
                    var iLast = params.gpxPath.arGeoPt.length - 1;
                    params.gpxPath.gptEnd.lat = arGeoPt[iLast].lat;
                    params.gpxPath.gptEnd.lon = arGeoPt[iLast].lon;
                    /* Note: NOT using path bound for gpxPath corners. Use screen bounds instead.
                    var corners = new wigo_ws_GeoPt.Corners();
                    for (var i = 0; i < arGeoPt.length; i++) {
                        corners.Update(arGeoPt[i]); // Update bounding rectangle for route.
                    }
                    params.gpxPath.gptSW.lat = corners.gptSW.lat;
                    params.gpxPath.gptSW.lon = corners.gptSW.lon;
                    params.gpxPath.gptNE.lat = corners.gptNE.lat;
                    params.gpxPath.gptNE.lon = corners.gptNE.lon;
                    */
                    params.gpxPath.gptSW.lat = params.bounds.sw.lat;
                    params.gpxPath.gptSW.lon = params.bounds.sw.lon;
                    params.gpxPath.gptNE.lat = params.bounds.ne.lat;
                    params.gpxPath.gptNE.lon = params.bounds.ne.lon;

                    // param.nId == 0 means a Record path has not been saved before.
                    // Save new params object because local params is reused.
                    var oParams = new wigo_ws_GeoPathMap.OfflineParams(); 
                    oParams.assign(params); 
                    view.onSavePathLocally(view.curMode(), oParams); 

                    // oParams.nId is updated if a new object is saved, so set params.nId to updated nId.
                    params.nId = oParams.nId;  
                } else {
                    view.ShowStatus("Enter a Trail Name", false);
                }
                return bOk;
            };

            // Helper that sets path name for Record trail to be saved.
            // Returns boolean:
            //  true if path name is valid.
            function SetPathName() {
                var sName = txbxPathName.value.trim(); 
                var bOk = sName.length > 0;
                if (bOk) {
                    params.name = sName;
                } 
                return bOk;            
            }

            // Current offline parameters to save.
            var params = new wigo_ws_GeoPathMap.OfflineParams();
            this.initParams();
        }
        var localSaver = new LocalSaver();
        // **

        // Helper to show status for saving a path locally, offline.
        // Arg:
        //  bOk: boolean. true for successful save.
        function ShowOfflineSavePathResult(bOk) {
        // view.ShowStatus("Successfully saved Record trail locally.", false); 
            var s = bOk ? "Successfully saved Record trail locally." : 
                             "Failed to save Record trail locally.";
            var pathName = localSaver.getPathName();
            var sMsg = "{0}<br/>{1}".format(s, pathName);
            view.ShowStatus(sMsg, !bOk);
        }
    }

    // Object for offline local data.
    // Offline trail can be deleted. 
    // Offline saved Record trail can be uploaded or deleted.
    // Constructor args:
    //  view: ref to wigo_ws_View object.
    //  droplist: ref to Wigo_Ws_CordovaControls().DropDownControl object. 
    //            The drop down control for offline local data.
    //  uploader: Uploader object in RecordFSM object. Used to upload selected, local Record trail to server.
    function OfflineLocalData(view, dropList, uploader) {  
        var that = this;
        
        // Enumeration nof events for actions.
        this.event = {  unknown: -1, 
                        begin_upload: 0,         // Begin uploading selected, local, saved Record trail.
                        delete: 1,               // Delete selected trail locally.
                        upload: 2,               // Upload selected local, recored trail.
                        cancel: 3,               // Cancel upload.
                    };

        // Returns value for an eventName.
        // Arg:
        //  sEventName: string. property name in this.event enumeration object.
        this.EventValue = function(sEventName) {
            var eventValue = this.event[sEventName];
            if (typeof(eventValue) === 'undefined')
                eventValue = this.event.unknown;
            return eventValue;
        };

        // Saves ref to parameters for selected offline trail.
        // Arg:
        //  params: ref to wigo_ws_GeoPathMap.OfflineParams object.
        //          Has offline information for the trail.
        //          May be null for no selected trail.
        this.setPathParams = function(params) {
            offlineParams = params;
            FillDropListForParams();
        };
        var offlineParams = null;

        // Indicates completion of uploading a path to the server.
        // Args:
        //  bOk: boolean. true indicates success.
        //  nId: number. record id at server for the uploaded path.
        //  sPathName: string. name of the path. (server might rename path to avoid duplicates.)
        //  sStatusMsg: string. status msg for result of uploading.
        this.uploadCompleted = function(bOk, nId, sPathName, sStatusMsg) {
            uploader.uploadCompleted(bOk, nId, sPathName, sStatusMsg);
            if (bOk) {
                // Update params from fields returns from server.
                if (offlineParamsUploading) {
                    var nCurId = offlineParamsUploading.nId;
                    offlineParamsUploading.nId = nId;
                    // Server may have ranmed path name, or user may have renamed path name saved locally. 
                    // If server has renamed, sStatusMsg indicates this. Don't care if user renamed local path name.
                    offlineParamsUploading.name = sPathName; // Ensure path name is that used at server.
                    // Save copy of offlineParams that was uploaded.  
                    var bReplaced = view.onReplacePathOffline(view.eMode.offline, nCurId, offlineParamsUploading); 
                    if (!bReplaced) {
                        sStatusMsg += "<br/>Trail no longer found locally at server.";
                    }
                }
            }
            view.ShowStatus(sStatusMsg, !bOk);
            offlineParamsUploading = null;  
              
            // Update offline parameters due to uploading. 
            // Note: This is necessary so that FillDropListForParams() no longer adds an 
            // item for Upload, only an item for Delete. Also since upload is async,
            // the selected offline path could be different, and the selected path
            // should not be drawn again.
            var dataValue = view.getSelectedPathValue();
            if (dataValue){
                var params = view.onGetPathOffline(view.eMode.offline, parseInt(dataValue, 10));
                if (params)
                    this.setPathParams(params);
                // Note: this.setPathParams calls FillDropListForParams().
            }
        };

        // Process an event.
        // Arg:
        //  sEventName: string. property name of event enumeration object. 
        this.do = function(eventValue) {
            // Helper to prepare for user to enter Path name and share.
            // Returns true if signin is needed, in which case a signin 
            // status msg is shown.
            function IsShowSigninNeeded() { 
                var signin = recordFSM.refSignIn();
                var sOwnerId = signin.showIfNeedBe(); 
                var bNo = sOwnerId.length > 0;
                return !bNo; 
            }

            function PreparePathName() {
                // Quit if offlienParams does not exists.
                if (!offlineParams) {
                    view.ShowStatus("Cannot upload trail.");
                    return;
                }

                view.ShowStatus("Enter a name for the trail", false);
                SetPathNameUI(); 
                // Set path name and share for editing.
                txbxPathName.value = offlineParams.name;
                selectRecordShareDropDown.setSelected('private'); 
                var signin = recordFSM.refSignIn();
                signin.showIfNeedBe(); 
                dropList.empty();
                dropList.appendItem("upload", "Upload");
                dropList.appendItem("cancel", "Cancel");
            }

            function AddCancelHandler() { 
                RemoveCancelHandler(); // Ensure only add once.
                buCancel.addEventListener('click', OnCancel, false);
            }

            function RemoveCancelHandler() {  
                buCancel.removeEventListener('click', OnCancel, false);
            }

            function SetPathNameUI() {   
                txbxPathName.value = ""; // Clear path name. 
                ShowPathAndMapBars(false); 
                ShowPathDescrBar(true); 
                AddCancelHandler(); 
            }

            function ClearPathNameUI() {
                ShowPathAndMapBars(true); 
                ShowPathDescrBar(false); 
                RemoveCancelHandler(); 
            }

            // Event handler for the cancel button.
            function OnCancel(evt) {  
                that.do(that.event.cancel);
            }
            

            switch (eventValue) {
                case this.event.begin_upload:
                    if (networkInfo.isOnline()) { 
                        if (offlineParams && recordFSM.isCurPathSaved(offlineParams.nId) ) { 
                            // Warn user that recording of current trail will be ended because it is being uploaded.
                            var sMsg = "Recording the current trail will be ended because it is selected for uploading to server.";
                            view.ShowConfirm(sMsg, function(bConfirm){
                                if (bConfirm) {
                                    // End recording current trail because it is being uploaded.
                                    recordFSM.initialize(offlineRecord); 
                                    // Present UI for defining path name and share for uploading.
                                    PreparePathName(); 
                                }
                            }, "", "Ok,Cancel");
                        } else {
                            // Present UI for defining path name and share for uploading.
                            PreparePathName(); 
                        }
                    } else { 
                        view.ShowStatus("Internet is not available, cannot upload.");
                        view.AppendStatusDiv(networkInfo.getBackOnlineInstr(), false);  
                    }
                    break;
                case this.event.delete:
                    // Delete selected path 
                    // Prompt if ok to delete the trail.
                    if (offlineParams) { 
                        var sNote = offlineParams.nId > 0 ? "\n\nNote: Trail is NOT deleted from web server, only from local data." : "";
                        var sPrompt = "Ok to delete trail\n{0}?{1}".format(offlineParams.name, sNote);
                        view.ShowConfirm(sPrompt, function(bConfirm){
                            if (bConfirm) {
                                // Note: No need to ClearPathNameUI() because Delete is only invoked from droplist.
                                Delete();
                            }
                        },
                        "Delete Trail", "Ok, Cancel");
                    }
                    break;
                case this.event.upload:
                    if (IsShowSigninNeeded()) { 
                        // Show signin status msg has been shown. Quit.
                        // Set eventValue arg to begin_upload because trail name needs to be defined.
                        eventValue = that.event.begin_upload; 
                        break; 
                    }

                    ClearPathNameUI(); 
                    Upload(); 
                    view.ShowStatus("Uploading trail to server.", false);
                    break;
                case this.event.cancel: // Upload canceled.
                    ClearPathNameUI(); 
                    view.ShowStatus("Canceled uploading.", false);
                    offlineParamsUploading = null;
                    FillDropListForParams();
                    break;
            }
            eventProcessed = eventValue;
        };

        // Returns true if defining a trail name to upload is current state. 
        this.isDefiningTrailName = function() {  
            var bYes = eventProcessed === this.event.begin_upload;
            return bYes;
        };

        // Helper to fill droplist for offline parameters.
        function FillDropListForParams() {
            uploader.clear();
            ShowPathDescrBar(false); 
            dropList.empty();
            if (offlineParams) {
                // Fill drop list.
                if (offlineParams.nId < 0) {
                    // Selected a Record trail
                    dropList.appendItem("begin_upload", "Begin Upload");
                    dropList.appendItem("delete", "Delete");
                } else {
                    // Selected a regular trail already at server.
                    dropList.appendItem("delete", "Delete");
                }
            }
        }

        // Helper to upload saved, local Record trail. Shows a status message for the result.
        // Returns {empty: boolean, upload: boolean}:
        //  empty: boolean. true if path coords are empty (one or no points).
        //  upload: boolean. upload initiated.
        //  busy: boolean. true indicates previous upload has not completed and another upload is not started.
        // Note: true is returned if recorded path is uploaded or if recorded path is empty or only one coord.
        function Upload() {
            var ok = {empty: false, upload: false, busy: false}; 

            // Quit if previous upload has not completed. 
            if (offlineParamsUploading) {
                ok.busy = true;
                return ok;
            }

            // Quit if offlineParams does not exist. 
            if (!offlineParams) {
                ok.empty = true;
                return ok; 
            }

            uploader.uploadPath.nId = 0;  // Database record id is 0 for new record.
            // Set coords to upload.
            var bOk = uploader.setArGeoPtFromArray(offlineParams.gpxPath.arGeoPt);
            if (!bOk) {
                ok.empty = true;
                return ok;
            }

            // Set owner id.
            bOk = uploader.setOwnerId();
            if (!bOk)
                return ok;
            
            bOk = uploader.setPathName();
            if (!bOk)
                return ok;

            // Set share value.
            uploader.setShare();

            // Save copy of offlineParams being uploaded.  
            offlineParamsUploading = new wigo_ws_GeoPathMap.OfflineParams();
            offlineParamsUploading.assign(offlineParams);
            
            uploader.upload();
            ok.upload = true;
            return ok;
        }

        // Helper to delete current path from local data (local storage).
        function Delete() {
            if (offlineParams) {
                var bDeleted = view.onDeletePathOffline(view.eMode.offline, offlineParams.nId); 
                if (bDeleted) {
                    view.onGetPaths(view.eMode.offline, ""); // Note: owner id is ignored for offline node.
                    // Clear displayed path from the map.
                    view.clearPath();  
                    // Clear the offline local data droplist.
                    offlineLocalData.setPathParams(null); 
                } else {
                    var sPathName = offlineParams ? "<br/> " + offlineParams.name : ""; 
                    var sMsg = "Failed to delete tail{0} from local storage".format(sPathName);
                    view.ShowStatus(sMsg);
                }
            }
        };

        var offlineParamsUploading = null; // Copy of offlineParams being uploaded. 
        var eventProcessed = this.event.unknown; // Current event that was processed.
    }

    // Shows path description bar, which has textbox for trail name and action controls.
    // Arg:
    //  bShow: boolean. true to show path descr text box, recordShare droplist, Upload button, and Cancel button.
    //         Always hides Delete button and Save Area Offline button..
    // Note: Shared by RecordFSM and OfflineLocalData.
    function ShowPathDescrBar(bShow) {   
        ShowElement(pathDescrBar, bShow);
        ShowElement(recordShare, bShow);  
        ShowUploadButton(bShow);  
        ShowCancelButton(bShow);  
        ShowDeleteButton(false);
        ShowElement(buSaveAreaOffline, false); 
    }

    // Shows path description bar, which has textbox for trail name.
    // Always hides upload, delete, and recordShare buttons.
    // Arg:
    //  bShow: boolean. true to show path descr bar, buSaveAreaOffline, and Canccel buttons.
    // Note: Only expected to be call in Online View to save map area wht not trail selected.
    function ShowPathDescrBarWithSaveAreaOfflineButton(bShow) { 
        ShowElement(pathDescrBar, bShow);
        ShowElement(buSaveAreaOffline, bShow); 
        ShowCancelButton(bShow);  
        ShowElement(recordShare, false);  
        ShowUploadButton(false);  
        ShowDeleteButton(false);
    }
    
    // Shows/hides bars related to a path: selectGeoTrail droplist with action and map bar. 
    // Arg:
    //  bShow: boolean. true to show the bars.
    function ShowPathAndMapBars(bShow) { 
        ShowElement(onlineOfflineEditBar, bShow);
        ShowElement(mapBar, bShow);
    }


    // ** More private members
    
    var ctrls = Wigo_Ws_CordovaControls();
    var divStatus = document.getElementById('divStatus');
    var divStatus = new ctrls.StatusDiv(divStatus);
    divStatus.onTouchEnd = function(event) {
        // Ensure titlebar is at top after scrolling divStatus.
        titleBar.scrollIntoView();
    };

    var titleHolder = document.getElementById('titleHolder');
    var spanTitle = document.getElementById('spanTitle');
    var spanHelp = document.getElementById('spanHelp');
    var titleBar = new ctrls.TitleBar2(titleHolder, spanTitle, spanHelp);

    titleBar.onHelpClicked = function(event) {
        ShowHelpGuide(true);
    }

    var fsmEdit = new EditFSM(this);

    var recordFSM = new RecordFSM(this); 

    var nMode = that.eMode.online_view; // Current mode.
    
    // Initial home area is rectangle area around Oregon.
    var homeArea = { gptSW: new wigo_ws_GeoPt(), gptNE: new wigo_ws_GeoPt() };
    homeArea.gptSW.lat = 38.03078569382296;
    homeArea.gptSW.lon = -123.8818359375;
    homeArea.gptNE.lat = 47.88688085106898;
    homeArea.gptNE.lon = -115.97167968750001;

    // Search parameters for finding geo paths for view.
    // Properties:
    //  nFindIx: enumeration given by this.eFindIx for kind for of search.
    //  gptSW: wigo_ws_GeoPt object for SouthWest corner of retanctangle for search. 
    //         (Some kinds of search do not use the rectangle.)
    //  gptSW: wigo_ws_GeoPt object for NorthEast corner of retanctangle for search. 
    //         (Some kinds of search do not use the rectangle.)
    // Methods:
    //  init(nFindIx)
    //      Initials this object for nFindIx.
    //      Rectangle is set to invalid corners.
    //  setRect(nFindIx, gptSW, gptNE)
    //      Initializes this object for nFindIx.
    //      Rectangle is set to corners given by gptSW and gptNE.
    //  getCenter()
    //      Returns center of rectangle given by corners.
    //      If corners are invalid, returns null.
    //      (For some kinds of search, the rectangle is not used, ie is invalid.)
    var viewFindParams = {
        nFindIx: that.eFindIx.home_area, gptSW: new wigo_ws_GeoPt(), gptNE: new wigo_ws_GeoPt(),  
        setRect: function (nFindIx, gptSW, gptNE) {
            this.nFindIx = nFindIx;
            this.gptSW.lat = gptSW.lat;
            this.gptSW.lon = gptSW.lon;
            this.gptNE.lat = gptNE.lat;
            this.gptNE.lon = gptNE.lon;
        },
        getCenter: function () {
            var gptCenter = null;
            if (this.gptSW.lat > -90.5) {
                gptCenter = new wigo_ws_GeoPt();
                gptCenter.lat = (this.gptSW.lat + this.gptNE.lat) / 2;
                gptCenter.lon = (this.gptSW.lon + this.gptNE.lon) / 2;
            }
            return gptCenter;
        },
        init: function (nFindIx) {
            this.nFindIx = nFindIx;
            this.gptSW.lat = -91.0;   // Set to invalid lat.
            this.gptSW.lon = -181.0;  // Set to invalid lon.
            this.gptNE.lat = -91.0;   // Set to invalid lat.
            this.gptNE.lon = -181.0;  // Set to invalid lon.
        }
    };
    viewFindParams.setRect(this.eFindIx.home_area, homeArea.gptSW, homeArea.gptNE);

    // Get current geo location, show on the map, and update status in phone and Pebble.
    function DoGeoLocation() {
        // Show distance traveled if recording. 
        var sPrefixMsg = '';
        var sPebblePrefixMsg = '';  
        if (!recordFSM.isOff()) {
            var mRecordDist = map.recordPath.getDistanceTraveled(true); 
            if (mRecordDist > 0.0001) {
                sPrefixMsg = 'Distance traveled: {0}<br/>'.format(lc.to(mRecordDist));
                sPebblePrefixMsg = 'Traveled: {0}<br/>'.format(lc.to(mRecordDist));  
            }
        }
        that.ShowStatus(sPrefixMsg + "Getting Geo Location ...", false); 
        var curStatus = that.FormCurrentStatus(); // Get current status as suffix for pebble msg.
        // Getting geolocation may wait forever because timeout is set to be infinite.
        // Therefore show current status for Pebble now expecting it to be updated shortly showing loc plus current status.
        pebbleMsg.Send("Getting loc...\n" + curStatus.pebble, false); // false => no vibe.
        TrackGeoLocation(trackTimer.dCloseToPathThres, function (updateResult, positionError) {
            if (positionError)
                ShowGeoLocPositionError(positionError); 
            else 
                ShowGeoLocUpdateStatus(updateResult, false, sPrefixMsg, sPebblePrefixMsg, curStatus.pebble);  // false => no notification.
        });
    }

    // Returns About message for this app.
    function AboutMsg() {
        var sCopyright = "2015 - 2018";
        var sMsg =
        "Version {0}\nCopyright (c) {1} Robert R Schomburg\n".format(sVersion, sCopyright);
        return sMsg;
    }

    // Displays alert message given the string sMsg.
    // Args:
    //  sMsg: string. message to display.
    //  onDone: function, optional. callback after user dismisses the dialog. callback has no arg.
    //          Defaults to null.
    // Note: AlertMsg(..) returns immediately. callback after dialog is dismissed is asynchronous.
    function AlertMsg(sMsg, onDone) {
        if (typeof(onDone) !== 'function')  
            onDone = null;                 
        var sTitle = document.title;
        if (navigator.notification)
            navigator.notification.alert(sMsg, onDone, sTitle); 
        else
            alert(sMsg);

    }

    // Display confirmation dialog with Yes, No buttons.
    // Arg:
    //  onDone: asynchronous callback with signature:
    //      bConfirm: boolean indicating Yes.
    //  sTitle: string, optional. Title for the dialog. Defauts to Confirm.
    //  sAnswer: string, optional. Caption for the two buttons delimited by a comma.  
    //           Defaults to 'Yes,No'.
    // Returns synchronous: false. Only onDone callback is meaningful.
    function ConfirmYesNo(sMsg, onDone, sTitle, sAnswer) {
        if (!sTitle)
            sTitle = 'Confirm';
        if (!sAnswer)
            sAnswer = 'Yes,No';
        if (navigator.notification) {
            navigator.notification.confirm(sMsg, function (iButton) {
                if (onDone) {
                    var bYes = iButton === 1;
                    onDone(bYes);
                }
            },
            sTitle, sAnswer);
        } else {
            var bConfirm = window.confirm(sMsg);
            if (onDone)
                onDone(bConfirm);
        }
        return false;
    }


    // Removes all elements after the first element (index 0) from selectGeoTrail control,
    // provide the current mode is offline. Also clears the path drawn on the map.
    function ClearOfflineGeoPathSelect(select) {
        if (that.curMode() === that.eMode.offline) {
            selectGeoTrail.empty(1); // Keeps first item in the list.
            selectGeoTrail.setSelectedIndex(0); // Show only the first element.
            map.ClearPath();
            // Clear the OfflineLocalData droplist. 
            offlineLocalData.setPathParams(null); 
        }
    }

    // Runs the trackTimer object.
    // If trackTimer.bOn is false, clears trackTimer; otherwise starts the periodic timer.
    // Remarks: Provides the callback function that is called after each timer period completes.
    function RunTrackTimer() {
        if (trackTimer.bOn) {
            // Enable detecting motion for tracking.
            deviceMotion.enableForTracking();
            trackTimer.SetTimer(function (result) {
                if (result.bError) {
                    trackTimer.ClearTimer();
                    var sError = 'Tracking failed.<br/>';
                    ShowGeoTrackingOff(sError);
                    alerter.DoAlert();
                    pebbleMsg.Send(sError, true, false); // vibrate, no timeout.
                } else {
                    if (result.bRepeating) {
                        if (map.IsPathDefined()) {
                            trackTimer.showCurGeoLocation(trackTimer.dCloseToPathThres, function(updResult, positionError){
                                if (positionError) {
                                    ShowGeoLocPositionError(positionError);
                                } else if (updResult) {
                                    ShowGeoLocUpdateStatus(updResult, true); // true => add notification also when an alert is given for off trail. 
                                }
                            });
                        }
                    } else {
                        trackTimer.ClearTimer();
                        ShowGeoTrackingOff();
                    }
                }
            });
        } else {
            // Disable detecting motion for tracking.
            deviceMotion.disableForTracking();  
            trackTimer.ClearTimer();
            ShowGeoTrackingOff();
        }
    }

    // ** Controls for Settings
    var holderAllowGeoTracking = document.getElementById('holderAllowGeoTracking');
    var selectAllowGeoTracking = new ctrls.DropDownControl(holderAllowGeoTracking, null, 'Allow Geo Tracking', '', 'img/ws.wigo.dropdownhorizontalicon.png');
    var selectAllowGeoTrackingValues; 
    if (app.deviceDetails.isAndroid() )
        selectAllowGeoTrackingValues =  
            [
                ['no', 'No'],
                ['watch', 'Continuous' ], // Use geolocation.watchPosition() for tracking.
                ['timer', 'Periodic']     // Use wakeup timer for tracking.
            ];
    else
        selectAllowGeoTrackingValues =  
            [
                ['no', 'No'],
                ['watch', 'Continuous'], // Use geolocation.watchPosition() for tracking.
            ];
    selectAllowGeoTracking.fill(selectAllowGeoTrackingValues);   
    // Show or hide other settings related to allow geo tracking selection.        
    selectAllowGeoTracking.onListElClicked = function(dataValue) {
        ShowOrHideDependenciesForAllowGeoTrackingItem(dataValue);
    };
    // Helper to show or hide dependent settings items for selectAllowGeoTracking droplist item.
    // Arg:
    //  dataValue: string for value of selected item for selectAllowGeoTracking droplist control.
    function ShowOrHideDependenciesForAllowGeoTrackingItem(dataValue) {
        if (dataValue === 'no') {
            ShowElement(holderOffPathUpdateMeters, false);
            ShowElement(holderGeoTrackingSecs, false);
        } else if (dataValue === 'watch') {
            ShowElement(holderOffPathUpdateMeters, true);
            ShowElement(holderGeoTrackingSecs, false);
        } else if (dataValue === 'timer') {
            ShowElement(holderOffPathUpdateMeters, false);
            ShowElement(holderGeoTrackingSecs, true);
        }
    } 

    // Note 20161205: selectEnableGeoTracking control no longer exists.

    var holderGeoTrackingSecs = document.getElementById('holderGeoTrackingSecs');
    var numberGeoTrackingSecs = new ctrls.DropDownControl(holderGeoTrackingSecs, null, 'Geo Tracking Interval', '', 'img/ws.wigo.dropdownhorizontalicon.png');
    var numberGeoTrackingSecsValues = 
    [
        ['5',   '5 secs'],
        ['10', '10 secs'],
        ['30', '30 secs'],
        ['40', '40 secs'],
        ['50', '50 secs'],        
        ['60', '60 secs'],
        ['90', '1.5 mins'],
        ['120', '2.0 mins'],        
        ['150', '2.5 mins'],
        ['180', '3.0 mins'],
        ['240', '4.0 mins'],        
        ['300', '5.0 mins'],
        ['600', '10.0 mins'],
        ['900', '15.0 mins'],        
        ['1800', '30.0 mins'],        
        ['3600', '60.0 mins']        
    ];
    numberGeoTrackingSecs.fill(numberGeoTrackingSecsValues);

    var parentEl = document.getElementById('holderOffPathThresMeters');
    var numberOffPathThresMeters = new ctrls.DropDownControl(parentEl, null, 'Off Trail Threshold', '',  'img/ws.wigo.dropdownhorizontalicon.png');
    var numberOffPathThresMetersValues = 
    [
        ['30', '30m (33yds)'],
        ['40', '40m (44yds)'],
        ['50', '50m (55yds)'],
        ['60', '60m (66yds)'],
        ['60', '60m (66yds)'],
        ['70', '70m (77yds)'],
        ['80', '80m (87yds)'],
        ['90', '90m (98yds)'],
        ['100', '100m (109yds)'],
        ['200', '200m (219yds)'],
        ['300', '300m (328yds)'],
        ['400', '400m (437yds)'],
        ['500', '500m (547yds)'],
        ['600', '600m (656yds)'],
        ['700', '700m (766yds)'],
        ['800', '800m (875yds)'],
        ['900', '900m (984yds)'],
        ['1000','1km (1094yds)']
    ];
    numberOffPathThresMeters.fill(numberOffPathThresMetersValues);

    var holderOffPathUpdateMeters = parentEl = document.getElementById('holderOffPathUpdateMeters');
    var numberOffPathUpdateMeters = new ctrls.DropDownControl(parentEl, null, 'Geo Tracking Update', '',  'img/ws.wigo.dropdownhorizontalicon.png');
    var numberOffPathUpdateMetersValues = 
    [
        ['0',   '0m (always)'],
        ['2',   '2m (2yds)'],
        ['5',   '5m (5yds)'],
        ['10',  '10m (11yds)'],
        ['20', '20m (22yds)'],
        ['30', '30m (33yds)'],
        ['40', '40m (44yds)'],
        ['50', '50m (55yds)'],
        ['60', '60m (66yds)'],
        ['60', '60m (66yds)'],
        ['70', '70m (77yds)'],
        ['80', '80m (87yds)'],
        ['90', '90m (98yds)'],
        ['100', '100m (109yds)'],
        ['200', '200m (219yds)'],
        ['300', '300m (328yds)'],
        ['400', '400m (437yds)'],
        ['500', '500m (547yds)'],
        ['600', '600m (656yds)'],
        ['700', '700m (766yds)'],
        ['800', '800m (875yds)'],
        ['900', '900m (984yds)'],
        ['1000','1km (1094yds)']
    ];
    numberOffPathUpdateMeters.fill(numberOffPathUpdateMetersValues);

    parentEl = document.getElementById('holderDistanceUnits');  
    var distanceUnits = new ctrls.DropDownControl(parentEl, null, 'Measuring System', '',  'img/ws.wigo.dropdownhorizontalicon.png');
    var distanceUnitsValues = 
    [
        ['metric', 'Metric'],
        ['english', 'English']
    ];
    distanceUnits.fill(distanceUnitsValues);
    distanceUnits.onListElClicked = function(dataValue) { 
        var bMetric = dataValue === 'metric';
        bodyMass.bMetric = bMetric;
        bodyMass.show();
        recordDistanceAlert.bMetric = bMetric;  
        recordDistanceAlert.show();             
    }


    parentEl = document.getElementById('holderPhoneAlert');
    var selectPhoneAlert = ctrls.NewYesNoControl(parentEl, null, 'Allow Phone Alert?', -1);

    parentEl = document.getElementById('holderOffPathAlert');
    var selectOffPathAlert = ctrls.NewYesNoControl(parentEl, null, 'Phone Alert Initially On?', -1);

    parentEl = document.getElementById('holderPhoneVibeSecs');
    var numberPhoneVibeSecs = new ctrls.DropDownControl(parentEl, null, 'Phone Vibration in Secs', '',  'img/ws.wigo.dropdownhorizontalicon.png');
    var numberPhoneVibeSecsValues = 
    [
        ['0.0', '0.0 secs (no vibe)'],
        ['0.5', '0.5 secs'],
        ['1.0', '1.0 secs'],
        ['1.5', '1.5 secs'],
        ['2.0', '2.0 secs'],
        ['2.5', '2.5 secs'],
        ['3.0', '3.0 secs']
    ];
    numberPhoneVibeSecs.fill(numberPhoneVibeSecsValues);

    parentEl =document.getElementById('holderPhoneBeepCount');
    var numberPhoneBeepCount = new ctrls.DropDownControl(parentEl, null, 'Phone Beep Count', '',  'img/ws.wigo.dropdownhorizontalicon.png'); 
    var numberPhoneBeepCountValues = 
    [
        ['0', '0 (none)'],
        ['1', '1'],
        ['2', '2'],
        ['3', '3'],
        ['4', '4'],
        ['5', '5']
    ];
    numberPhoneBeepCount.fill(numberPhoneBeepCountValues);

    // Distance record alert that occurs periodically after a specified distance traveled.  
    var numberRecordDistanceAlert = document.getElementById('numberRecordDistanceAlert');
    var labelRecordDistanceAlert = document.getElementById('labelRecordDistanceAlert'); 
    function RecordDistanceAlert() {
        // Call base class.
        LabelNumberCtrl.call(this, labelRecordDistanceAlert, numberRecordDistanceAlert);
        
        // **  Over-ride properties for this derived class.
        this.labelTextMetric = "Record Distance Alert (km)";
        
        this.labelTextEnglish = "Record Distance Alert (miles)";
        
        // Returns float. kilometers converted to miles.
        // Arg:
        //  nNumber. float. number of kilometers.
        this.metricToEnglish = function(nNumber) {
            nNumber = 0.621371 * nNumber;
            return nNumber;
        };

        // Returns float. kilometers for number in miles.
        // Arg:
        //  nNumber: float. number value in English units to convert to Metric units.
        // NOTE: This method should be over-ridden.
        this.englishToMetric = function(nNumber) {
            nNumber = nNumber /  0.621371;
            return nNumber;
        };
        // **
    }
    var recordDistanceAlert = new RecordDistanceAlert(); // Record Distance Alert object.

    var labelDistanceGoalPerDay = document.getElementById('labelDistanceGoalPerDay');
    var numberDistanceGoalPerDay = document.getElementById('numberDistanceGoalPerDay');
    function DistanceGoalPerDay() {
        // Call base class.
        LabelNumberCtrl.call(this, labelDistanceGoalPerDay, numberDistanceGoalPerDay);
        
        // **  Over-ride properties for this derived class.
        this.labelTextMetric = "Daily Distance Goal (km)";
        
        this.labelTextEnglish = "Daily Distance Goal (miles)";
        
        // Returns float. kilometers converted to miles.
        // Arg:
        //  nNumber. float. number of kilometers.
        this.metricToEnglish = function(nNumber) {
            nNumber = 0.621371 * nNumber;
            return nNumber;
        };

        // Returns float. kilometers for number in miles.
        // Arg:
        //  nNumber: float. number value in English units to convert to Metric units.
        // NOTE: This method should be over-ridden.
        this.englishToMetric = function(nNumber) {
            nNumber = nNumber /  0.621371;
            return nNumber;
        };
    }
    var distanceGoalPerDay = new DistanceGoalPerDay(); 

    // Acceleration Alert composite control.
    var labelAccelThres = document.getElementById('labelAccelThres');
    var numberAccelThres = document.getElementById('numberAccelThres');
    function AccelAlertThresCtrl() { // Object for Accel Alert composite label, number control.
        // Call base class.
        LabelNumberCtrl.call(this, labelAccelThres, numberAccelThres);

        // **  Over-ride properties for this derived class.
        // Show only one decimal place for number.
        this.nDecimalPlaces = 1; 
        
        // Note: English units not used, only metric.
        this.labelTextMetric = "Accel Alert Thres (m/sec^2)";
        this.labelTextEnglish = "Accel Alert Thres (m/sec^2)";
        
        // Returns float. acceleration in m/sec^2 in metric units. 
        // Note: English units not used. Use base class, which just returns number.
        // Arg:
        //  nNumber. float. acceleration in m/sec^2.
        // this.metricToEnglish = function(nNumber) {return nNumber;};

        // Returns float. acceleration in m/sec^2.
        // Note: English units not used. Use base class which just returns number.
        // Arg:
        //  nNumber: float. number value in English units to convert to Metric units.
        // this.englishToMetric = function(nNumber) {return nNumber;};
        
        // ** Members for this object.
        // Enables alert for excessive acceleration.
        this.enable = function(){ 
            enabledCtrl.setState(1);
        };

        // Disables alert for excessive acceleration.
        this.disable = function() {
            enabledCtrl.setState(0);
        };

        // Returns true if accel alert is enabled.
        this.isEnabled = function() {
            var bEnabled = enabledCtrl.getState() === 1;
            return bEnabled;
        };

        // ** private members
        var holderAccelAlert = document.getElementById('holderAccelAlert');
        var enabledCtrl = ctrls.NewYesNoControl(holderAccelAlert, null, "Accel Alert?", -1);
    }
    var accelAlertThres = new AccelAlertThresCtrl();

    // Acceleration Alert Velocity composite control.
    var labelAccelVThres = document.getElementById('labelAccelVThres');
    var numberAccelVThres = document.getElementById('numberAccelVThres');
    function AccelAlertVThresCtrl() { // Object for Accel Alert Velocity composite label, number control.
        // Call base class.
        LabelNumberCtrl.call(this, labelAccelVThres, numberAccelVThres);

        // **  Over-ride properties for this derived class.
        // Show only one decimal place for number.
        this.nDecimalPlaces = 1; 
        
        // Note: English units not used, only metric.
        this.labelTextMetric = "Accel Velocity Thres (m/sec)";
        this.labelTextEnglish = "Accel Velocity Thres (m/sec)";
        
        // Returns float. acceleration in m/sec^2 in metric units. 
        // Note: English units not used. Use base class, which just returns number.
        // Arg:
        //  nNumber. float. acceleration in m/sec^2.
        // this.metricToEnglish = function(nNumber) {return nNumber;};

        // Returns float. acceleration in m/sec^2.
        // Note: English units not used. Use base class which just returns number.
        // Arg:
        //  nNumber: float. number value in English units to convert to Metric units.
        // this.englishToMetric = function(nNumber) {return nNumber;};
        
        // **

    }
    var accelAlertVThres = new AccelAlertVThresCtrl(); 

    // Composite Control object for label and a number.
    // Constructor args:
    //  labelCtrl: HTMLElement. a label control.
    //  numberCtrl: HTMLElement. an input control with type='number'.
    // Note: This is base class. Derived object constructor calls this function:
    //       LabelNumberCtrl.call(this, labelCtrl, numberCtrl);
    //       Then contructor over-rides properties specific to its object.
    function LabelNumberCtrl(labelCtrl, numberCtrl) {
        var that = this;
        // boolean. true for UI value shown in metric. false for UI value shown in English units. 
        this.bMetric = false;

        // ** Properties to over-ride 
        // Number of decimal places for showing number.
        this.nDecimalPlaces = 2;

        // string. Text to show in label UI for metric 
        this.labelTextMetric = "metric";
        // string. Text to show in label UI for English.
        this.labelTextEnglish = "English";

        // Returns float. English equivalent for number in metric units.
        // Arg:
        //  nNumber: float. number value in metric units to convert to English units.
        // NOTE: This method should be over-ridden.
        this.metricToEnglish = function(nNumber) {
            return nNumber;
        };

        // Returns float. Metric equivalent for number in English units.
        // Arg:
        //  nNumber: float. number value in English units to convert to Metric units.
        // NOTE: This method should be over-ridden.
        this.englishToMetric = function(nNumber) {
            return nNumber;
        }
        // **

        // Sets data attribute of number control in metric units.
        // Arg:
        //  number: float. value for number.
        this.setNumber = function(number) {
            var sNumber = number.toFixed(nDataDecimalPlaces);
            numberCtrl.setAttribute('data-number', sNumber);
        };

        // Returns float. data-number attribute in netric units.
        this.getNumber = function() {
            var sValue = numberCtrl.getAttribute('data-number');
            var nValue = Number(sValue);
            return nValue; 
        };

        // Show label and number value in the UI.
        this.show = function() {
            var nValue = this.getNumber();
            var bOk = nValue !== Number.NaN;
            if (bOk) {
                if (this.bMetric) {
                    labelCtrl.innerHTML = this.labelTextMetric;
                } else {
                    nValue = this.metricToEnglish(nValue);      
                    labelCtrl.innerHTML = this.labelTextEnglish;
                }
                var sValue = nValue.toFixed(this.nDecimalPlaces);
                numberCtrl.value = sValue;
            }
        };

        // Add event hanlder for change on numberCtrl.
        // Event handler save data attribute of numberCtrl in metric
        // and shows value in UI again using number of decicmal places property.
        numberCtrl.addEventListener('change', function(event){
            var nValue = Number(numberCtrl.value);
            var bOk = nValue !== Number.NaN;
            if (bOk) {
                if (!that.bMetric) {
                    nValue = that.englishToMetric(nValue); 
                }
                that.setNumber(nValue); 
                // Display again to show number of decimal places indicated.
                that.show();
            }
        }, false);

        // Event handler for numberCtrl getting focus: 
        // Handler function selects text (digits) in the numberMass control.
        numberCtrl.addEventListener('focus', SelectNumberOnFocus, false); 

        // Evant handler for Enter Key for numberCtrl.
        // Kills focus for numberCtrl is key is Enter.
        numberCtrl.addEventListener('keydown', function(event) {
            var bEnterKey = IsEnterKey(event);
            if (bEnterKey) {
                numberCtrl.blur();
            }
        }, false); 

        var nDataDecimalPlaces = 4; 
    }

    // setting UI for Auto Trail Animation. 
    var holderAutoPathAnimation = document.getElementById('holderAutoPathAnimation');
    var selectAutoPathAnimation = ctrls.NewYesNoControl(holderAutoPathAnimation, null, "Auto Trail Animation?", -1);

    var holderPebbleAlert = document.getElementById('holderPebbleAlert');
    var selectPebbleAlert = ctrls.NewYesNoControl(holderPebbleAlert, null, 'Pebble Watch?', -1);

    var holderPebbleVibeCount = document.getElementById('holderPebbleVibeCount');
    var numberPebbleVibeCount = new ctrls.DropDownControl(holderPebbleVibeCount, null, 'Pebble Vibration Count', '',  'img/ws.wigo.dropdownhorizontalicon.png');;
    var numberPebbleVibeCountValues = 
    [
        ['0', '0 (no vibe)'],
        ['1', '1'],
        ['2', '2'],
        ['3', '3'],
        ['4', '4'],
        ['5', '5']
    ];
    numberPebbleVibeCount.fill(numberPebbleVibeCountValues);
    
    parentEl = document.getElementById('holderPrevGeoLocThresMeters');
    var numberPrevGeoLocThresMeters = new ctrls.DropDownControl(parentEl, null, 'Prev Geo Loc Thres', '',  'img/ws.wigo.dropdownhorizontalicon.png'); 
    var numberPrevGeoLocThresMetersValues =
    [
        ['0', '0 m (none)'],
        ['5', '5 m (5 yds)'],
        ['10', '10 m (11 yds)'],
        ['20', '20 m (22 yds)'],
        ['30', '30 m (33 yds)'],
        ['40', '40 m (44 yds)'],
        ['50', '50 m (55 yds)'],
        ['60', '60 m (66 yds)']
    ];
    numberPrevGeoLocThresMeters.fill(numberPrevGeoLocThresMetersValues);

    parentEl = document.getElementById('holderSpuriousVLimit'); 
    var numberSpuriousVLimit = new ctrls.DropDownControl(parentEl, null, 'Spurious V Limit', '', 'img/ws.wigo.dropdownhorizontalicon.png');
    var numberSpuriousVLimitValues = 
    [
        ["1",  " 1 meter/sec  (  2.2 mph)"],
        ["2",  " 2 meters/sec (  4.5 mph)"],
        ["3",  " 3 meters/sec (  6.7 mph)"],
        ["4",  " 4 meters/sec (  8.9 mph)"],
        ["5",  " 5 meters/sec ( 11.2 mph)"],
        ["10", "10 meters/sec ( 22.4 mph)"],
        ["15", "15 meters/sec ( 33.6 mph)"],
        ["20", "20 meters/sec ( 44.7 mph)"],
        ["25", "25 meters/sec ( 55.9 mph)"],
        ["30", "30 meters/sec ( 67.1 mph)"],
        ["35", "35 meters/sec ( 78.2 mph)"],
        ["40", "40 meters/sec ( 89.5 mph)"],
        ["45", "45 meters/sec (100.7 mph)"],
        ["50", "50 meters/sec (111.8 mph)"],
    ];
    numberSpuriousVLimit.fill(numberSpuriousVLimitValues);

    parentEl = document.getElementById('holderCompassHeadingVisible');
    var selectCompassHeadingVisible = ctrls.NewYesNoControl(parentEl, null, 'Show Compass on Map?', -1);

    parentEl = document.getElementById('holderClickForGeoLoc');
    var selectClickForGeoLoc = ctrls.NewYesNoControl(parentEl, null, 'Touch for Loc Testing?', -1);

    var numberBodyMass = document.getElementById('numberBodyMass'); 
    var labelBodyMass = document.getElementById('labelBodyMass');
    
    // Composite control for Body Mass.
    var bodyMass = new BodyMassCtrl(labelBodyMass, numberBodyMass);
    // Object for composite HMTLElemeent control for UI to enter body mass.
    // Constructor args:
    //  labelMass: ref to html Element. Control for label indicating kilograms or pound.
    //  numberMass: ref to HTMLInputElement of type='number'. UI for entering a number. 
    function BodyMassCtrl(labelMass, numberMass) {
        var that = this; // ref to this for private functions to use.
        // boolean Indicates if metric or english units are displayed.
        // For true, displayed value is in kilograms. For false displayed value in pounds.
        this.bMetric = false; 

        // Sets data-mass attribute.
        // Arg:
        //  kgMass: number. data-mass attribute value in kilograms.
        this.setMass = function(kgMass) {
            numberMass.setAttribute('data-mass', kgMass);
        };

        // Returns the data-mass attribute as a number in kgs.
        // Returns Number.NaN if data-mass attribute is invalid.
        this.getMass = function() {
            var sMass = numberMass.getAttribute('data-mass');
            var nMass = Number(sMass);
            return nMass; 
        }

        // Show number value and label text.
        // For this.bMetric is true:
        //  label is: Body Mass (kgs).
        //  number is: data-mass in kgs.
        // For this.bMetric false:
        //  label is: Body Weight (lbs).
        //  number is: data-mass in lbs.
        // Returns true if data-mass is valid, in which case 
        //  the number value and label text are updated.
        //  If false is return, display is not changed. 
        this.show = function() {
            var sMass = numberMass.getAttribute('data-mass');
            var nMass = Number(sMass);
            var bOk = nMass !== Number.NaN;   
            if (bOk) {
                if (this.bMetric) {
                    sMass = nMass.toFixed(1);
                    labelMass.innerHTML = this.labelTextKgs;
                } else {
                    // Convert kgs to lbs.
                    var nLbs = nMass * 2.2046;
                    sMass = nLbs.toFixed(1);
                    labelMass.innerHTML = this.labelTextLbs;
                }
                numberMass.value = sMass;
            }
            return bOk;
        };

        // Text for label when showing mass in kilograms.
        this.labelTextKgs = 'Body Mass (kgs)';

        // Text for label when showing mass in pounds.
        this.labelTextLbs = 'Body Weight (lbs)'; 

        // Event handler for change of value numberBodyMass control.
        numberMass.addEventListener('change', function(event){
            SetMassFromValue();
            that.show();  // Show to see decimal point.
        }, false);


        // Event handler for numberMass control getting focus: 
        // Handler function selects text (digits) in the numberMass control.
        numberMass.addEventListener('focus', SelectNumberOnFocus, false); 

        // Sets data-mass attribute based on value of numberMass and this.bMetric.
        // For this.bMetric false converts displayed numberMass value from pounds to kilograms.
        // For this.bMetric true, uses displayed numberMass value as is since it is in kilograms.
        // Returns true if value of numberMass control is a valid number.
        // Note: Does not change numberMass value of labelMass text (does change display).
        function SetMassFromValue() {
            var nValue = Number(numberMass.value);
            var bOk = nValue !== Number.NaN;
            if (bOk) {
                if (!that.bMetric) {
                    // Convert pounds to kilograms.
                    nValue = nValue / 2.2046; 
                }
                var sMass = nValue.toFixed(4);
                numberMass.setAttribute('data-mass', sMass)
            }
            return bOk;
        };
    }

    // Flags for showing layers on map. 
    var holderTopologyLayer = document.getElementById('holderTopologyLayer');
    var selectTopologyLayer = ctrls.NewYesNoControl(holderTopologyLayer, null, 'Show Topology Layer?', -1);
    var holderSnowCoverLayer = document.getElementById('holderSnowCoverLayer');
    var selectSnowCoverLayer = ctrls.NewYesNoControl(holderSnowCoverLayer, null, 'Show Snow Cover Layer?', -1);

    // ** Helper for Settings

    // Event handler that selects all chars in an input control on focus.
    // Arg:
    //  event: FocusEvent. not currently used.
    // Note: this is for an html input element of type number.
    function SelectNumberOnFocus(event) { 
        var iLast = this.value.length;
        var el = this;
        if (iLast >= 0) { 
            // Select all the text (digits) for edition.
            // Set selection after this ui thread ends, otherwise the selection is removed when soft keyboard appears.
            window.setTimeout(function(){
                if (typeof el.type === 'string' ) {
                    // HTML5 specifies that text selection can be done for type=text, but not number.
                    el.type = 'text';
                    el.setSelectionRange(0, iLast); 
                    el.type = 'number';
                }
            }, 100);    // Delay of 0 milliseconds means timer runs as soom as ui thread ends. 0 probably works.
        }
    }    

    // Helper to check if setting calorie converion efficiency is active.
    function IsSettingCCEActive() {  
        var bYes = IsElementShown(divCCEUpdate);
        if (bYes) {
            divCCEUpdate.scrollIntoView(); 
            AlertMsg("Please complete Setting Calorie Conversion Efficiency.");   
        }
        return bYes;
    }

    // Checks that the control values for settings are valid.
    // Shows dialog for an invalid setting and sets focus to the control.
    // Returns true for all settings valid.
    function CheckSettingsValues() {
        // Helper to checking html select droplist.
        function IsSelectCtrlOk(ctrl) {
            var bOk = ctrl.selectedIndex >= 0;
            var sMsg = "Selection is invalid. Select a valid option from drop list.";
            ShowOrClearError(bOk, ctrl, sMsg);
            return bOk;
        }

        // Helper for checking wigo_ws_cordova dropdown list.
        function IsSelectCtrlOk2(dropDownCtrl) {
            var bOk = dropDownCtrl.getSelectedIndex() >= 0;
            var sMsg = "Selection is invalid. Select a valid option from drop list.";
            ShowOrClearError(bOk, dropDownCtrl.ctrl, sMsg);
            return bOk;
        }
        
        // Helper for checking if an OnOffControl or YesNoControl is valid.
        function IsYesNoCtrlOk(onOffCtrl) {
            var nState = onOffCtrl.getState();
            var bOk = nState >= 0 && nState <= 1;
            var sMsg = "Selection is invalid. Select Yes or No";
            ShowOrClearError(bOk, onOffCtrl.ctrl, sMsg);
            return bOk;
        }
        // Helper for checking latitude of home area.
        function IsLatCtrlOk(ctrl) {
            var bOk = IsLatOk(ctrl.value);
            var sMsg = "Latitude is invalid. Touch Set button to select map area on screen for Home Area."
            ShowOrClearError(bOk, buSetHomeArea, sMsg);
            return bOk;
        }
        // Helper for checking longitude of home area.
        function IsLonCtrlOk(ctrl) {
            var bOk = IsLonOk(ctrl.value);
            var sMsg = "Longitude is invalid. Touch Set button to select map area on screen for Home Area."
            ShowOrClearError(bOk, buSetHomeArea, sMsg);
            return bOk;
        }
        // Helper for clearing or shown background for a control.
        function ShowOrClearError(bOk, ctrl, sMsg) {
            if (bOk) {
                // Remove class name indicating ErrorMsg.
                ctrl.classList.remove('ErrorMsg');
            } else {
                // Set class name indicationg ErrorMsg.
                ctrl.classList.add('ErrorMsg');
                ctrl.focus();
                AlertMsg(sMsg);
            }
        }
        // Helper for checking lattitude.
        function IsLatOk(lat) {
            var bOk = lat >= -91.9 && lat <= 90.1;
            return bOk;
        }
        // Helper for checking longitude.
        function IsLonOk(lon) {
            var bOk = lon >= -181.9 && lon < 180.1;
            return bOk;
        }
        // Helper to check that at least one map layer is selected. 
        function IsLayerSelectionOk() {
            // Check that layer ctrls have valid state.    
            let bTopoOk = IsYesNoCtrlOk(selectTopologyLayer);
            if (!bTopoOk)
                return false;
            let bSnowCoverOk = IsYesNoCtrlOk(selectSnowCoverLayer);
            if (!bSnowCoverOk)
                return false;
            return true;
        }

        // Check each ctrl for validity one by one.
        if (!IsSelectCtrlOk2(selectAllowGeoTracking))  
            return false;

        if (!IsSelectCtrlOk2(numberOffPathThresMeters)) 
            return false;

        if (!IsSelectCtrlOk2(numberOffPathUpdateMeters))
            return false;

        if (!IsSelectCtrlOk2(distanceUnits))  
            return false;

        if (!IsSelectCtrlOk2(numberGeoTrackingSecs))
            return false;

        // Note 20161205: selectEnableGeoTracking no longer exits.

        if (!IsYesNoCtrlOk(selectOffPathAlert))  
            return false;
        if (!IsYesNoCtrlOk(selectPhoneAlert)) 
            return false;
        if (!IsSelectCtrlOk2(numberPhoneVibeSecs))
            return false;
        if (!IsSelectCtrlOk2(numberPhoneBeepCount))
            return false;
        if (!IsYesNoCtrlOk(selectPebbleAlert))  
            return false;
        if (!IsSelectCtrlOk2(numberPebbleVibeCount))
            return false;
        if (!IsSelectCtrlOk2(numberPrevGeoLocThresMeters))
            return false;
        if (!IsSelectCtrlOk2(numberSpuriousVLimit)) 
            return false;
        if (!IsYesNoCtrlOk(selectClickForGeoLoc))  
            return false;

        if (!IsLatCtrlOk(numberHomeAreaSWLat))
            return false;
        if (!IsLonCtrlOk(numberHomeAreaSWLon))
            return false;
        if (!IsLatCtrlOk(numberHomeAreaNELat))
            return false;
        if (!IsLonCtrlOk(numberHomeAreaNELon))
            return false;

        if (IsSettingCCEActive())  
            return false;

        // Check map layers. 
        if (!IsLayerSelectionOk())
            return false;
        return true;
    }

    // Returns settings object wigo_ws_GeoTrailSettings from values in controls.
    function GetSettingsValues() {
        var settings = new wigo_ws_GeoTrailSettings();
        var allowGeoTrackingValue = selectAllowGeoTracking.getSelectedValue();
        if (allowGeoTrackingValue === 'no') {
            settings.bAllowGeoTracking = false;
            settings.bUseWatchPositionForTracking = true;
        } else if (allowGeoTrackingValue === 'timer') {
            settings.bAllowGeoTracking = true;
            settings.bUseWatchPositionForTracking = false;
        } else { // (allowGeoTrackingValue === 'watch') 
            settings.bAllowGeoTracking = true;
            settings.bUseWatchPositionForTracking = true;
        }
        
        settings.mOffPathThres = parseFloat(numberOffPathThresMeters.getSelectedValue());
        settings.mOffPathUpdate = parseFloat(numberOffPathUpdateMeters.getSelectedValue());   
        settings.distanceUnits = distanceUnits.getSelectedValue();   
        settings.secsGeoTrackingInterval = parseFloat(numberGeoTrackingSecs.getSelectedValue());
        // Note 20161205: settings.bEnableGeoTracking, which used to indicate Track On initially, is no longer used.
        settings.bOffPathAlert = selectOffPathAlert.getState() === 1;
        settings.bPhoneAlert = selectPhoneAlert.getState() === 1;
        settings.secsPhoneVibe = parseFloat(numberPhoneVibeSecs.getSelectedValue());
        settings.countPhoneBeep = parseInt(numberPhoneBeepCount.getSelectedValue());
        settings.kmRecordDistancAlertInterval = recordDistanceAlert.getNumber();   

        settings.kmDistanceGoalPerDay = distanceGoalPerDay.getNumber();  

        settings.bAccelAlert = accelAlertThres.isEnabled(); 
        settings.nAccelThres = accelAlertThres.getNumber(); 
        settings.nAccelVThres = accelAlertVThres.getNumber();

        settings.bAutoPathAnimation = selectAutoPathAnimation.getState() === 1; 
        settings.bPebbleAlert = selectPebbleAlert.getState() === 1;
        settings.countPebbleVibe = parseInt(numberPebbleVibeCount.getSelectedValue());
        settings.dPrevGeoLocThres = parseFloat(numberPrevGeoLocThresMeters.getSelectedValue());
        settings.vSpuriousVLimit = parseFloat(numberSpuriousVLimit.getSelectedValue()); 
        settings.kgBodyMass = bodyMass.getMass(); 
        settings.calorieConversionEfficiency = cceLabelValue.get(); 
        settings.bTopologyLayer = selectTopologyLayer.getState() === 1;  
        settings.bSnowCoverLayer = selectSnowCoverLayer.getState() === 1; 
        settings.bCompassHeadingVisible = selectCompassHeadingVisible.getState() === 1; 
        settings.bClickForGeoLoc = selectClickForGeoLoc.getState() === 1;
        settings.gptHomeAreaSW.lat = numberHomeAreaSWLat.value;
        settings.gptHomeAreaSW.lon = numberHomeAreaSWLon.value;
        settings.gptHomeAreaNE.lat = numberHomeAreaNELat.value;
        settings.gptHomeAreaNE.lon = numberHomeAreaNELon.value;
        return settings;
    }

    // Set the values for the settings in controls.
    // Arg:
    //  settings: wigo_ws_GeoTrailSettings object defining values for the settings.
    function SetSettingsValues(settings) {
        if (!settings)
            return;
        var allowGeoTrackingValue;
        if (settings.bAllowGeoTracking) {
            allowGeoTrackingValue = settings.bUseWatchPositionForTracking ? 'watch' : 'timer';
        } else {
            allowGeoTrackingValue = 'no';
        }
        selectAllowGeoTracking.setSelected(allowGeoTrackingValue);

        numberOffPathThresMeters.setSelected(settings.mOffPathThres.toFixed(0));
        numberOffPathUpdateMeters.setSelected(settings.mOffPathUpdate.toFixed(0)); 
        distanceUnits.setSelected(settings.distanceUnits);  
        numberGeoTrackingSecs.setSelected(settings.secsGeoTrackingInterval.toFixed(0));
        // Show or hide numberOffPathUpdateMeters and numberGeoTrackingSecs depending on selection for selectAllowGeoTracking.
        ShowOrHideDependenciesForAllowGeoTrackingItem(allowGeoTrackingValue); 
        // Note: settings.bEnableGeoTracking, which used to indicate Track On initially, is no longer used.
        selectOffPathAlert.setState(settings.bOffPathAlert ? 1 : 0);
        selectPhoneAlert.setState(settings.bPhoneAlert ? 1 : 0);
        numberPhoneVibeSecs.setSelected(settings.secsPhoneVibe.toFixed(1));
        numberPhoneBeepCount.setSelected(settings.countPhoneBeep.toFixed(0));

        recordDistanceAlert.bMetric = settings.distanceUnits === 'metric';  
        recordDistanceAlert.setNumber(settings.kmRecordDistancAlertInterval); 
        recordDistanceAlert.show();      

        distanceGoalPerDay.bMetric = settings.distanceUnits === 'metric';
        distanceGoalPerDay.setNumber(settings.kmDistanceGoalPerDay); 
        distanceGoalPerDay.show();
        
        if (settings.bAccelAlert)
            accelAlertThres.enable();
        else
            accelAlertThres.disable();
        accelAlertThres.setNumber(settings.nAccelThres);
        accelAlertThres.show();
        accelAlertVThres.setNumber(settings.nAccelVThres);
        accelAlertVThres.show();
        
        selectAutoPathAnimation.setState(settings.bAutoPathAnimation ? 1 : 0); 
        selectPebbleAlert.setState(settings.bPebbleAlert ? 1 : 0);
        numberPebbleVibeCount.setSelected(settings.countPebbleVibe.toFixed(0));
        numberPrevGeoLocThresMeters.setSelected(settings.dPrevGeoLocThres.toFixed(0));
        numberSpuriousVLimit.setSelected(settings.vSpuriousVLimit.toFixed(0)); 
        
        bodyMass.bMetric = settings.distanceUnits === 'metric';   
        bodyMass.setMass(settings.kgBodyMass); 
        bodyMass.show();

        cceLabelValue.set(settings.calorieConversionEfficiency); 
        // Set ctrls for calculating and updating calorie conversion efficiency. 
        var bShowCCERow = true;
        var lastStats = that.onGetLastRecordStats();
        if (lastStats === null) {
            // Hide label ctls that have invalid values.
            bShowCCERow = false;
            cceNewEfficiencyNumber.set(settings.calorieConversionEfficiency);
            cceActualCaloriesNumber.set(0);  // Value is set to 0, but row is hidden. 
            cceKineticCaloriesLabel.set(0);  // Value is set ot 0, but row is hidden. 
        } else {
            bShowCCERow = true;
            var lc2 = new LengthConverter();
            lc2.bMetric = lc.bMetric;
            lc2.feetLimit = -1;  // Always use miles or kilometers.
            lc2.meterLimit = -1; // Always use miles or kilometers.
            var cceDistance = lc2.toNum(lastStats.mDistance);
            cceDistancLabel.set(cceDistance.n, cceDistance.unit);
            cceTimeLabel.set(lastStats.msRunTime/(1000*60.0), "mins");
            var cceSpeed = lc2.toSpeed(lastStats.mDistance, lastStats.msRunTime/1000.0);
            cceSpeedLabel.set(cceSpeed.speed, cceSpeed.unit); 
            cceKineticCaloriesLabel.set(lastStats.caloriesKinetic); 
            cceCaloriesBurnedLabel.set(lastStats.caloriesBurnedCalc, "");
            cceActualCaloriesNumber.set(0); 
            cceNewEfficiencyNumber.set(0);  

            var curEfficiency = lastStats.caloriesKinetic / lastStats.caloriesBurnedCalc;
            if (!Number.isFinite(curEfficiency)) {
                curEfficiency = 0;
            }
            cceCurEfficiencyLabel.set(curEfficiency);
        }
        cceDistancLabel.showParent(bShowCCERow);
        cceTimeLabel.showParent(bShowCCERow);
        cceSpeedLabel.showParent(bShowCCERow); 
        cceKineticCaloriesLabel.showParent(bShowCCERow);  
        cceCaloriesBurnedLabel.showParent(bShowCCERow); 
        cceActualCaloriesNumber.showParent(bShowCCERow);
        ShowElement(cceNewEfficiencyNumber.ctrl, true);
        cceCurEfficiencyLabel.showParent(bShowCCERow);

        // Set ctrls for showing layers on map.
        selectTopologyLayer.setState(settings.bTopologyLayer ? 1 : 0);
        selectSnowCoverLayer.setState(settings.bSnowCoverLayer ? 1: 0); 

        selectCompassHeadingVisible.setState(settings.bCompassHeadingVisible ? 1 : 0); 
        selectClickForGeoLoc.setState(settings.bClickForGeoLoc ? 1 : 0);
        numberHomeAreaSWLat.value = settings.gptHomeAreaSW.lat;
        numberHomeAreaSWLon.value = settings.gptHomeAreaSW.lon;
        numberHomeAreaNELat.value = settings.gptHomeAreaNE.lat;
        numberHomeAreaNELon.value = settings.gptHomeAreaNE.lon;
    }

    // Sets parameters in other member vars/objects based on settings.
    // Args:
    //  settings: wigo_ws_GeoTrailSettings object. 
    //  bInitial: boolean, optional. true for initially setting when app is loaded. Defaults to true.
    function SetSettingsParams(settings, bInitial) {
        if (typeof(bInitial) !== 'boolean')
            bInitial = true;
        EnableMapBarGeoTrackingOptions(settings, bInitial); 
        // Clear tracking timer if it not on to ensure it is stopped.
        map.bIgnoreMapClick = !settings.bClickForGeoLoc;
        map.dPrevGeoLocThres = settings.dPrevGeoLocThres;
        // Set VLimit for filtering spurious points in recorded trail.
        map.recordPath.setVLimit(settings.vSpuriousVLimit); 
        // Set record distance alert interal. 
        map.recordPath.setDistanceAlertInterval(settings.kmRecordDistancAlertInterval); 

        // Set distance goal per day for a recorded path.
        recordStatsMetrics.setDistanceGoalPerDay(settings.kmDistanceGoalPerDay);  

        // Set parameters for excessive acceleration.
        deviceMotion.bAvailable = settings.bAccelAlert; 
        var bAllowAfterReset = settings.bAccelAlert && window.app.deviceDetails.isAndroid();
        deviceMotion.reset(bAllowAfterReset);
        deviceMotion.setAccelThres(settings.nAccelThres);
        deviceMotion.setAccelVThres(settings.nAccelVThres); 
        if (recordFSM.isRecording())           
            deviceMotion.enableForRecording(); 
        // Note: RunTrackTimer() below will enable device motion for tracking if tracking is on.

        // Set body mass. (Used to calculate calories for a recorded path and stats item editor.
        map.recordPath.setBodyMass(settings.kgBodyMass);  
        recordStatsHistory.setBodyMass(settings.kgBodyMass);
        // Set calorie conversion efficiency factor for a recorded path and stats item editor. 
        map.recordPath.setCaloriesBurnedEfficiency(settings.calorieConversionEfficiency); 
        recordStatsHistory.setCaloriesBurnedEfficiency(settings.calorieConversionEfficiency);
        // Testing mode for RecordFSM.
        recordFSM.setTesting(settings.bClickForGeoLoc);   
        // Set auto animation for loading a path. 
        map.EnableAutoPathAnimation(settings.bAutoPathAnimation);  
        // Enable phone alerts.
        alerter.bAlertsAllowed = settings.bPhoneAlert;
        alerter.bPhoneEnabled = settings.bPhoneAlert && settings.bOffPathAlert;

        alerter.msPhoneVibe = Math.round(settings.secsPhoneVibe * 1000);
        alerter.countPhoneBeep = settings.countPhoneBeep;

        // Set flags for map layers. 
        map.setSnowCoverLayerFlag(settings.bSnowCoverLayer); 
        map.setTopologyLayerFlag(settings.bTopologyLayer); 
        // Update which layers show on the map.
        map.updateMapLayers();

        // Set boolean for showing compass heading on the map.
        map.SetCompassHeadingVisibleState(settings.bCompassHeadingVisible); // 20160609 added. 

        // Set home area parameters.
        homeArea.gptSW.lat = settings.gptHomeAreaSW.lat; 
        homeArea.gptSW.lon = settings.gptHomeAreaSW.lon;
        homeArea.gptNE.lat = settings.gptHomeAreaNE.lat; 
        homeArea.gptNE.lon = settings.gptHomeAreaNE.lon;

        // Enable using Pebble and allowing vibration.
        pebbleMsg.Enable(settings.bPebbleAlert); // Enable using pebble.
        pebbleMsg.countVibe = settings.countPebbleVibe;
        
        // For period tracking given by time interval, set pebble message timeout to the time interval.
        // For continuous trracking, set pebble messaage timeout to 0, which means there is no timeout
        // check by pebble for the next message.
        if (settings.bUseWatchPositionForTracking) 
            pebbleMsg.ClearTimeOut();  // Continuous tracking
        else 
            pebbleMsg.SetTimeOut(settings.secsGeoTrackingInterval); // Periodic tracking

        // Start Pebble app if it is enabled.
        if (settings.bPebbleAlert)
            pebbleMsg.StartApp();

        // Set distanceUnits for english or metric.
        lc.bMetric = settings.distanceUnits === 'metric';  

        // Clear both trackTimer objs and select watch or timer object for trackTimer.
        geoTrackTimerBase.ClearTimer(); 
        geoTrackWatcher.ClearTimer(); 
        if (settings.bAllowGeoTracking) {
            trackTimer =  settings.bUseWatchPositionForTracking ? geoTrackWatcher : geoTrackTimerBase; 
        } else {
            trackTimer = geoTrackWatcher;
        }

        trackTimer.dCloseToPathThres = settings.mOffPathThres;
        trackTimer.dOffPathUpdate = settings.mOffPathUpdate;  
        trackTimer.setIntervalSecs(settings.secsGeoTrackingInterval);
        // Clear or start the trackTimer running.
        trackTimer.bOn = IsGeoTrackValueOn();
        RunTrackTimer();
    }


    // Shows or the map-canvas div.
    // Arg:
    //  bShow: boolean to indicate to show.
    function ShowMapCanvas(bShow)
    {
        var sShowMap = bShow ? 'block' : 'none'; 
        var mapCanvas = getMapCanvas();
        mapCanvas.style.display = sShowMap;
    }

    // Shows or hides the divSettings.
    // Arg:
    //  bShow: boolean to indicate to show.
    function ShowSettingsDiv(bShow) {
        if (app.deviceDetails.isiPhone()) { 
            // Do not show settings for tracking nor Pebble.
            ShowElement(holderPebbleAlert, false);
            ShowElement(holderPebbleVibeCount, false);
            // Accel Alert is not available for iPhone. 
            ShowElement(document.getElementById('holderAccelAlert'), false);
            ShowElement(document.getElementById('holderAccelThres'), false);
            ShowElement(document.getElementById('holderAccelVThres'), false);
        }

        var sShowSettings = bShow ? 'block' : 'none';
        divSettings.style.display = sShowSettings;

        if (bShow) { 
            // Set height of divSettingsScroll to fill available space.
            var yBody = document.body.offsetHeight;
            var yScrollTitle = divSettingsTitle.offsetHeight;
            var yDoneCancel = divSettingsDoneCancel.offsetHeight;
            var yScroll =  yBody - yScrollTitle - yDoneCancel;
            divSettingsScroll.style.height = yScroll.toFixed(0) + 'px';
        }
    }

    function ShowHelpDiv(div, bShow) {
        HideCloseDialogBackButton(); // Hide back button, enable later if needed. 
        ShowModeDiv(!bShow);
        ShowElement(div, bShow);
        ShowElement(closeDialogBar, bShow);
        ShowMapCanvas(!bShow);    
    }

    // Shows or hides the divHelpGuide.
    // Arg:
    //  bShow: boolean to indicate to show.
    var divHelpGuide = document.getElementById('divHelpGuide');
    function ShowHelpGuide(bShow) {
        ShowHelpDiv(divHelpGuide, bShow);
        if (bShow)
            linkBackNavigationHelpGuide.showBackButtonIfNeeded(); 
    }

    // Shows or hides the divHelpBackToTrail.
    // Arg:
    //  bShow: boolean to indicate to show.
    var divHelpBackToTrail = document.getElementById('divHelpBackToTrail');
    function ShowHelpBackToTrail(bShow) {
        ShowHelpDiv(divHelpBackToTrail, bShow);    
    }

    // Shows or hides the divHelpTrackingVsBattery.
    // Arg:
    //  bShow: boolean to indicate to show.
    var divHelpTrackingVsBattery = document.getElementById('divHelpTrackingVsBattery');
    function ShowHelpTrackingVsBattery(bShow) {
        ShowHelpDiv(divHelpTrackingVsBattery, bShow);    
    }

    // Shows or hides the divHelpLicense.
    // Arg:
    //  bShow: boolean to indicate to show.
    var divHelpLicense;
    if (app.deviceDetails.isiPhone())
        divHelpLicense = document.getElementById('divHelpIPhoneLicense');
    else
        divHelpLicense = document.getElementById('divHelpLicense');
    function ShowHelpLicense(bShow) {
        ShowHelpDiv(divHelpLicense, bShow);
    }

    // Shows or hides the divHelpTrackingVsBattery.
    // Arg:
    //  bShow: boolean to indicate to show.
    var divTermsOfUse = document.getElementById('divTermsOfUse');
    function ShowTermsOfUse(bShow) {
        ShowHelpDiv(divTermsOfUse, bShow);    
    }

    // Shows or hides the divTermsOfUse with confirmDialogBar at the bottom.
    // Arg:
    //  bShow: boolean to indicate to show.
    var confirmDialogBar = document.getElementById('confirmDialogBar');
    
    function ConfirmTermsOfUse(bShow, onDone) {
        ShowModeDiv(!bShow);
        ShowElement(divTermsOfUse, bShow);
        ShowElement(confirmDialogBar, bShow);
        // Note: Do NOT hide map-canvas div because doing so prevents map from initializing.  
        if ( bShow) 
            onConfirmTermsOfUseAnswer = onDone;
        else 
           onConfirmTermsOfUseAnswer = null;     
    }
    var buAcceptConfirmDialogBar = document.getElementById('buAcceptConfirmDialogBar');
    var buRejectConfirmDialogBar = document.getElementById('buRejectConfirmDialogBar');
    // Callback for Confirm Terms of Use.
    // Signature:
    //  bConfirm: boolean. true indicated accepted.
    //  Returns nothing. 
    var onConfirmTermsOfUseAnswer = null;
    buAcceptConfirmDialogBar.addEventListener('click', function(event){
        if (typeof onConfirmTermsOfUseAnswer === 'function')
            onConfirmTermsOfUseAnswer(true);
    }, false);
    buRejectConfirmDialogBar.addEventListener('click', function(event){
        if (typeof onConfirmTermsOfUseAnswer === 'function')
            onConfirmTermsOfUseAnswer(false);
    }, false);


    // Button and event handler to close the HelpGuide.
    var closeDialogBar = document.getElementById('closeDialogBar');
    var buCloseDialogBar = document.getElementById('buCloseDialogBar');
    buCloseDialogBar.addEventListener('click', CloseHelpDiv, false);
    function CloseHelpDiv() {
        ShowHelpGuide(false);
        ShowHelpBackToTrail(false);
        ShowHelpTrackingVsBattery(false);
        ShowTermsOfUse(false);
        ShowHelpLicense(false);
        that.ClearStatus();
        titleBar.scrollIntoView();   
    }

    // ** More functions 

    // Returns true if HTML el is hiddent.
    // Note: Do not use for a fixed position element, which is not used anyway.
    function IsElementHidden(el) {
        var bHidden = el.offsetParent === null;
        return bHidden;
    }

    // Clears geo tracking objects from map (circles, lines for tracking) and 
    // displays status of geo tracking off. 
    // Sets mapTrackingCtrl control to show off.
    // Arg:
    //  sError: optional string for an error msg prefix.
    //      The status always includes text indicating geo tracking is off.
    //      When sError is given, the status shows as an error.
    function ShowGeoTrackingOff(sError) {
        // Set mapTrackingCtrl control to show off.
        SetGeoTrackValue(false);
        // Clear map of update objects and show status.
        var bError = typeof (sError) === 'string';
        var sMsg = bError ? sError : "";
        sMsg += "Geo tracking off";
        map.ClearGeoLocationUpdate();
        that.ShowStatus(sMsg, bError); // false => not an error.
    }

    // Sets value for mapTrackingCtrl control.
    // Arg:
    //  bTracking: boolean indicating tracking is on.
    function SetGeoTrackValue(bTracking) {
        var nState = bTracking ? 1 : 0; 
        mapTrackingCtrl.setState(nState);
    }

    // Returns true if value of mapTrackingCtrl indicate on.
    function IsGeoTrackValueOn() {
        var nState = mapTrackingCtrl.getState();
        var bOn = nState === 1;
        return bOn;
    }

    // Object for tracking geo location on periodic time intervals.
    function GeoTrackTimer() {
        var that = this;
        this.bOn = false; // Boolean indicating timer runs repeatedly.

        // Threshold in meters for distance to nearest point on path.
        // If distance from geolocation to nearest point on the path
        // is > dCloseToPathThres, then geo location is off-path.
        this.dCloseToPathThres = -1;

        // Distance in meters traveling from previous tracking geolocation 
        // when before issuing an alert again. 
        this.dOffPathUpdate = 50; 

        // Sets period of timer interval.
        // Arg:
        //  nSecs: float for number of seconds for interval period. 
        this.setIntervalSecs = function (nSecs) {
            msInterval = nSecs * 1000;
        }
        // Returns number of seconds as integer for timer interval.
        this.getIntervalSecs = function () {
            var bSecs = msInterval / 1000;
            return bSecs;
        };

        // Returns number of milliseconds as integer for timer interval.  
        this.getIntervalMilliSecs = function() {  
            return msInterval;
        }

        // Starts or clears the timer.
        // If this.bOn is false, clears the time (stops the timer).
        // If this.bOn is true, timer runs repeated based on timer interval.
        // Arg:
        //  callback is function called when interval expires.
        //  Callback Signature:
        //    Arg: 
        //      updateResult: object. {bRepeating: boolean, bError: boolean} 
        //        bRepeating: boolean indicating timer is repeating.
        //          Note: when bRepeating is false, the timer has been cleered.           
        //        bError: boolean indicating an error.
        //    Return: not used.
        this.SetTimer = function (callback) {
            if (this.bOn) {
                backgroundMode.enableTrack(); 
                // Set new timer id as integer for current time.
                myTimerId = Date.now();
                // Set wake wake for time interval.
                var nSeconds = Math.round(msInterval / 1000);
                myTimerCallback = callback;
                // Only set timer if a path exists. 
                if (map.IsPathDefined()) { 
                    if (window.wakeuptimer) {
                        window.wakeuptimer.snooze(
                            SnoozeWakeUpSuccess,
                            SnoozeWakeUpError,
                            {
                                alarms: [{
                                    type: 'snooze',
                                    time: { seconds: nSeconds }, // snooze for nSeconds 
                                    extra: { id: myTimerId } // json containing app-specific information to be posted when alarm triggers
                                }]
                            }
                        );
                    }
                }
            } else {
                backgroundMode.disableTrack(); 
                // Clear timer.
                myTimerId = null;
                myTimerCallback = null;
                if (callback)
                    callback(false);
            }
        }

        // Unconditionally clears (stops) the timer.
        this.ClearTimer = function () {
            this.bOn = false;
            this.SetTimer(null);
        };

        // Gets current geo location and shows the location figures on the map.
        // Args:
        //  dCloseToPath: meters. If distance to nearest point on path is < dCloseToPath,
        //      then the location figures are not shown. (Specify as less than 0 to always
        //      show the location figures.)
        //  callbackUpd: Optional. Callback function called asynchronously after geolocation has been updated on map. 
        //  Callback Signature:
        //    Args: 
        //      updResult: {bToPath: boolean, dToPath: float, bearingToPath: float, bRefLine: boolean, bearingRefLine: float, 
        //                  bCompass: boolean, bearingCompass: float, compassError: CompassError or null} or null.
        //        The object is returned by method property SetGeoLocationUpdate(..) of wigo_ws_GeoPathMap object.
        //        See description of SetGeoLocationUpdate(..) method for more details. 
        //        If updResult is null, there is error given by positionError arg.
        //      positionError: PostionError related to Navigator.geoloation object or null. null for no position error.
        //      Return: not used.   
        this.showCurGeoLocation = function(dCloseToPath, callbackUpd) { 
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    // Successfully obtained location.
                    //  position is a Position object:
                    //      .coords is a coordinates object:
                    //          .coords.latitude  is latitude in degrees
                    //          .coords.longitude is longitude in degrees 
                    //      position has other members too. See spec on web for navigator.geolocation.getCurrentPosition.
                    var location = L.latLng(position.coords.latitude, position.coords.longitude);
                    map.SetGeoLocationUpdate(location, dCloseToPath, function(updResult){
                        if (callbackUpd)
                            callbackUpd(updResult, null);
                    }); 
                },
                function (positionError) {
                    // Error occurred trying to get location.
                    if (callbackUpd)
                        callbackUpd(null, positionError);
                },
                geoLocationOptions);
        };


        // Returns new object for this.SetTimer() callback result. 
        // Remarks: A property method for extended class to get an 
        // update result object. Normally not called.
        this.newUpdateResult = function() { 
            return { bRepeating: this.bOn, bError: false };
        };

        // Event handler success snooze wake up.
        function SnoozeWakeUpSuccess(result) {
            if (typeof(result) === 'string') {
                console.log('wakeup string result:' + result);
                // Note: extra is not member of result here.
                if (result === 'OK') {
                    if (myTimerCallback) {
                        myTimerCallback(that.newUpdateResult());
                    }
                }
            } else if (result.type === 'wakeup') {
                console.log('wakeup alarm detected--' + result.extra);
                var extra = JSON.parse(result.extra);
                if (extra.id === myTimerId) {
                    if (that.bOn)
                        that.SetTimer(myTimerCallback);
                }
            } else if (result.type === 'set') {
                console.log('wakeup alarm set--' + result);
                // Note: extra is not member of result here.
                // Note: Do NOT do callback here because this case does not
                //       occur the first time the timer is started.
                //       The result of type string === 'OK' occurs first time and
                //       every time after that when timer is set.
            } else {
                console.log('wakeup unhandled type (' + result.type + ')');
            }
        }

        // Event handler for snooze wake up error.
        function SnoozeWakeUpError(result) {
            if (typeof (result) === 'string')
                console.log('wakeup string result:' + result);
            else 
                console.log('Error for wakeup type (' + result.type + ')');
            if (myTimerCallback) {
                var errorResult = that.newUpdateResult();
                errorResult.bError = true;
                myTimerCallback(errorResult);
            }
        }


        var msInterval = 15 * 1000;    // Interval period of timer in milliseconds.
        var myTimerId = null;
        var myTimerCallback = null;
    }


    // Object for tracking geo location using window.navigator.geolocation.watchPosition(..).
    // Rather than using a timer to get new geolocation, navigator.geolocation.watchPosition(..)
    // is used to obtain updates to the current geolocation when it changes.
    // prototype is GeoLocationTimer object.
    function GeoTrackWatcher() { 
        var that = this;
        // Over-ride SetTimer(callback) in prototype. Use navigator.geolocation.watchPosition(...) to track 
        // current geolocation.
        this.SetTimer = function(callback) {
            if (this.bOn) {
                backgroundMode.enableTrack(); 
                myWatchCallback = callback;
                // Only set watch (timer) if a path exists. 
                if (map.IsPathDefined() ) { 
                    myWatchId = navigator.geolocation.watchPosition(
                        function (position) {
                            // Success.
                            curPositionError = null;
                            curPosition = position;
                            if (myWatchCallback)
                                myWatchCallback(that.newUpdateResult());
                        },
                        function (positionError) {
                            // Error. 
                            curPositionError = positionError;
                            curPosition = null;
                            if (myWatchCallback) {
                                // Note: Return successful result, evern though there is an error.
                                //       The error is indicated when  this.showCurGeoLocation(..) is called.
                                myWatchCallback(that.newUpdateResult());
                            }
                        },
                        geoLocationOptions    
                    );
                }  
            } else {
                backgroundMode.disableTrack(); 
                // Clear watch.
                if (myWatchId)
                    navigator.geolocation.clearWatch(myWatchId); 
                myWatchId = null;
                myWatchCallback = null;
                curPosition = null;
                curPositionError = null;

                curMapUpdateLocation = null;  // L.latLng(..) object defined in Leaflet for current location shown on map.
            }
        };

        // Gets current geo location and shows the location figures on the map.
        // Args:
        //  dCloseToPath: meters. If distance to nearest point on path is < dCloseToPath,
        //      then the location figures are not shown. (Specify as less than 0 to always
        //      show the location figures.)
        //  callbackUpd: Optional. Callback function called asynchronously after geolocation has been updated on map. 
        //  Callback Signature:
        //    Args: 
        //      updResult: {bToPath: boolean, dToPath: float, bearingToPath: float, bRefLine: boolean, bearingRefLine: float, 
        //                  bCompass: boolean, bearingCompass: float, compassError: CompassError or null} or null.
        //        The object is returned by method property SetGeoLocationUpdate(..) of wigo_ws_GeoPathMap object.
        //        See description of SetGeoLocationUpdate(..) method for more details. 
        //        If updResult is null, there is error given by positionError arg.
        //      positionError: PostionError related to Navigator.geoloation object or null. null for no position error.
        //      Return: not used.   
        this.showCurGeoLocation = function(dCloseToPath, callbackUpd) { 
            if (!curPositionError && curPosition) {
                // Successfully obtained location.
                //  position is a Position object:
                //      .coords is a coordinates object:
                //          .coords.latitude  is latitude in degrees
                //          .coords.longitude is longitude in degrees 
                //      position has other members too. See spec on web for navigator.geolocation.getCurrentPosition.
                var location = L.latLng(curPosition.coords.latitude, curPosition.coords.longitude);
                if (IsMapUpdateNeeded(location)) { 
                    map.SetGeoLocationUpdate(location, dCloseToPath, function(updResult){
                        if (callbackUpd)
                            callbackUpd(updResult, null);
                    }); 
                }
            } else if (curPositionError) {
                // Error occurred trying to get current location.
                if (callbackUpd)
                    callbackUpd(null, curPositionError);
            }
        };

        // Returns true if next location to show on map is needed.
        // Saves current location when an update is needed.
        // Arg:
        //  nextMapUpdateLocation: LatLng object from Leaflet for next location to show on map.
        // Remarks:
        // The map needs to be updated if distance from previous location has changed by minimum required amount.
        function IsMapUpdateNeeded(nextMapUpdateLocation) {  
            var bYes = false;
            if (curMapUpdateLocation) {
                var distance = curMapUpdateLocation.distanceTo(nextMapUpdateLocation)
                bYes = distance > that.dOffPathUpdate;
            } else {
                bYes = true;
            }

            if (bYes) {
                // Update current map position.
                curMapUpdateLocation = nextMapUpdateLocation;
            }
            
            return bYes;
        }

        var myWatchId = null;
        var myWatchCallback = null;
        var curPosition = null; // Position object related to Geolocation object implemented by navigator.
        var curPositionError = null;

        var minMapUpdateDistance = 50;    // Minimum distance in meters from previous map update location to update again. 
        var curMapUpdateLocation = null;  // L.latLng(..) object defined in Leaflet for current location shown on map.
    }
    
    var geoTrackTimerBase = new GeoTrackTimer();
    GeoTrackWatcher.prototype = geoTrackTimerBase;
    GeoTrackWatcher.prototype.constructor = GeoTrackWatcher;

    var geoTrackWatcher = new GeoTrackWatcher();
    var trackTimer = geoTrackWatcher;   // Initialize to track by using GeoTrackWatcher obj, switch later to timer obj if settings indicates. 

    // Opitons for getting current geolocation.
    // geoLocationOptions.maximumAge is 0 to always get new geolocation, Otherwise it is max time to use cached location in milliseconds.
    var geoLocationOptions = { enableHighAccuracy: true, timeout: Infinity, maximumAge: 0 }; // maximumAge of 0 means no caching.

    // Gets current geo location and shows the location figures on the map.
    // Args:
    //  dCloseToPath: meters. If distance to nearest point on path is < dCloseToPath,
    //      then the location figures are not shown. (Specify as less than 0 to always
    //      show the location figures.)
    //  callbackUpd: Callback function called asynchronously after geolocation has been updated.
    //  Callback Signature:
    //    Args: 
    //      updResult: {bToPath: boolean, dToPath: float, bearingToPath: float, bRefLine: boolean, bearingRefLine: float, 
    //                  bCompass: boolean, bearingCompass: float, compassError: CompassError or null} or null.
    //        The object is returned by method property SetGeoLocationUpdate(..) of wigo_ws_GeoPathMap object.
    //        See description of SetGeoLocationUpdate(..) method for more details. 
    //        If updResult is null, there is error given by positionError arg.
    //      positionError: PostionError object related to Navigator.geolocation object or null. null for no position error.
    //      Return: not used.   
    function TrackGeoLocation(dCloseToPath, callbackUpd) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                // Successfully obtained location.
                //  position is a Position object:
                //      .coords is a coordinates object:
                //          .coords.latitude  is latitude in degrees
                //          .coords.longitude is longitude in degrees 
                //      position has other members too. See spec on web for navigator.geolocation.getCurrentPosition.
                var location = L.latLng(position.coords.latitude, position.coords.longitude);
                map.SetGeoLocationUpdate(location, dCloseToPath, function(updResult){
                    if (callbackUpd)
                        callbackUpd(updResult, null);
                }); 
            },
            function (positionError) {
                // Error occurred trying to get location.
                if (callbackUpd)
                    callbackUpd(null, positionError);
            },
            geoLocationOptions
        );
    }

    // Shows or hides divOwnerId.
    // Arg:
    //  bShow: boolean indicating to show.
    function ShowOwnerIdDiv(bShow) {
        ShowElement(divOwnerId, bShow); 
    }

    // Show selectSignIn control.
    // Arg: bShow is boolean to show or hide.
    function ShowSignInCtrl(bShow) {
        ShowOwnerIdDiv(bShow);
    }

    // Shows or hides divTrailInfo, which has dropdown list for Path Name.
    // Arg:
    //  bShow: boolean indicating to show.
    function ShowPathInfoDiv(bShow) {
        ShowElement(divTrailInfo, bShow);
    }

    // Shows or hides an html element.
    // Args:
    //  el: HtmlElement to show or hide.
    //  bShow: boolean indicating show.
    function ShowElement(el, bShow) {
        // var sShow = bShow ? 'block' : 'none';
        // el.style.display = sShow;
        // Use class name to show or hide.  
        if (el) {
            if (bShow) {
                el.classList.add('wigo_ws_Show');
                el.classList.remove('wigo_ws_NoShow');
            } else {
                el.classList.remove('wigo_ws_Show');
                el.classList.add('wigo_ws_NoShow');
            }
        } else {
            that.ShowStatus("element to show is undefined.");
        }
    }

    // Returns true is an HtmlElement has class of wigo_show.
    // Note: Only valid for an element shown by ShowElement(el, bShow) above.
    function IsElementShown(el) { 
        var bShown = false;
        if (el instanceof HTMLElement) {
            bShown = el.classList.contains("wigo_ws_Show");
        }
        return bShown;
    }

    // Shows or hides the selectFind droplist.
    function ShowFind(bShow) {
        ShowElement(selectFind, bShow);
    }

    // Show or hide Delete button.
    function ShowDeleteButton(bShow) {
        ShowElement(buDelete, bShow);
    }

    // Show or hide Upload button.
    function ShowUploadButton(bShow) {
        ShowElement(buUpload, bShow);
    }

    // Show or hide Cancel button.
    function ShowCancelButton(bShow) {
        ShowElement(buCancel, bShow);
    }

    // Show or hide cursor controls for editing path.
    function ShowPathCursors(bShow) {
        ShowElement(divCursors, bShow);
    }

    // Show or hide prev/next buttons for moving to selected path ix point.
    // Note: Always hides buPtDeleteDo.
    function ShowPathIxButtons(bShow) {
        ShowElement(divPathIx, bShow);
        ShowElement(buPtDeleteDo, false);
    }

    // Show or hide Do button for deleting a point.
    // Note: buPtDeleteDo is containd in divPathIx so divPathIx must visible to see 
    //       buPtDeleteDo.
    function ShowPtDeleteDoButton(bShow) {
        ShowElement(buPtDeleteDo, bShow);
    }

    // Shows or hides sectEditMode.
    // Arg:
    //  bShow: boolean indicating to show.
    function ShowModeDiv(bShow) {
        ShowElement(divMode, bShow); 
    }

    // Object for issuing phone alerts.
    function Alerter() {

        // Boolean to indicate alerts for phone are allowed.
        this.bAlertsAllowed = false;

        // Boolean to indicate a phone alert can be given. 
        this.bPhoneEnabled = false;

        // Float for number of milli-seconds for phone to vibrate on an alert.
        this.msPhoneVibe = 1000;

        // Integer for number of phone beeps.
        this.countPhoneBeep = 0;

        // Issues an alert to devices that are enabled.
        // Arg:
        //  bNotifyToo boolean, optional. Indicated a notification is added to notification center
        //             in addition to a beep. Defaults to false. 
        this.DoAlert = function(bNotifyToo) {
            if (this.bAlertsAllowed) {
                if (this.bPhoneEnabled) {
                    // Issue phone alert.
                    if (navigator.notification) {
                        if (this.msPhoneVibe > 0.001)
                            navigator.notification.vibrate(this.msPhoneVibe);
                        if (this.countPhoneBeep > 0)
                            navigator.notification.beep(this.countPhoneBeep);
                    }
                    if (typeof bNotifyToo !== 'boolean')
                        bNotifyToo = false;
                    if (bNotifyToo)  
                        DoNotify();
                }
            }
        }


        // ** Private members
        function DoNotify () {
            var now   = new Date().getTime(), alertAt = new Date(now + 5*1000);
            // Note: I think now would work for at property, probably no need to add 5 seconds.
            var schedule = {
                    id: 1, // Use same id replacing any previous notification.
                    title: "GeoTrail Alert",
                    at: alertAt,
                    text: FormNotifyText(),
                    //sound: window.app.deviceDetails.isAndroid() ? 'file://sound.mp3' : 'file://beep.caf'
                };

            if (cordova.plugins && cordova.plugins.notification && cordova.plugins.notification.local) {
                cordova.plugins.notification.local.schedule(schedule);           
            }
        }

        
        // Returns a string for the notification text for the current time and date.
        function FormNotifyText() {
            var curDate = new Date(Date.now());
            var sText = "Off Trail at {0}:{1}, {2} {3}".format(curDate.getHours(), curDate.getMinutes(), MonthName[curDate.getMonth()], curDate.getDate());
            return sText;
        } 

        var MonthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    }

    // Object for converting meters to English units, or to use meters.
    function LengthConverter() {
        // boolean. true to use metric for lenths. false for English units.
        this.bMetric = false;

        // number. Limit in feet at or below which a length in meters is converted to feet and
        //         above which length is converted to miles.
        //         Only relevant for English units.
        this.feetLimit = 500;  

        // number. Limit in meters below which a length is meters and
        //         above which length is converted to kilometers.
        //         Only relevant for Metric units.
        this.meterLimit = 1000;

        // number. Number of fixed point decimal places for miles.
        this.mileFixedPoint = 2;

        // number. Number of fixed point decimal places for kilometers.
        this.kmeterFixedPoint = 2;

        // Return length in metric or English units based on this.bMetric.
        // Returns: {n: number, unit: string}, where
        //  n is number for the length.
        //  unit: is string specifying kind of unit:
        //        m for meter
        //        ft for foot
        //        mi for mile
        // Arg:
        //  mLen: number. Length in meters to be converted.
        this.toNum = function(mLen) {
            var result = { n: 0, unit: 'm'};
            if (this.bMetric) {
                result.n = mLen; 
                if (Math.abs(result.n) >= this.meterLimit) {
                    result.n = result.n / 1000.0;
                    result.unit = 'km';
                }
            } else {
                // 1 m = 3.2808399 ft
                // 1 foot =  0.3048 meters
                result.n = mLen / 0.3048;
                if (Math.abs(result.n) > this.feetLimit) {
                    // 1 mile = 5280 feet
                    result.n = result.n / 5280;
                    result.unit = 'mi';
                } else {
                    result.unit = 'ft';
                }
            }
            return result;            
        };

        // Returns length in miles or kilometers based on bMetric.
        // Returns: {n: number, unit: string}, where
        //  n is number for the distance.
        //  unit is string specifying kind of unit.
        //      mi for miles
        //      km for kilometers.
        // Arg:
        this.toDist = function(mLen) { 
            var result = { n: 0, unit: 'km'};
            if (this.bMetric) {
                result.n = mLen / 1000.0;
                result.unit = 'km';
            } else {
                // 1 m = 3.2808399 ft
                // 1 foot =  0.3048 meters
                result.n = mLen / 0.3048;
                // 1 mile = 5280 feet
                result.n = result.n / 5280;
                result.unit = 'mi';
            }
            return result;            
        };
        
        // Returns a string for conversion of a length in meters.
        // The string has a suffix for the kind of unit.
        // Arg:
        //  mLen: number. length in meters to be converted.
        this.to = function(mLen) {
            var result = this.toNum(mLen);
            var nFixed = 0;
            if (result.unit === 'mi') 
                nFixed = this.mileFixedPoint;
            else if (result.unit === 'km')
                nFixed = this.kmeterFixedPoint;
            var s = result.n.toFixed(nFixed) + " " + result.unit; 
            return s; 
        };


        // Returns number in meters give a distance to convert.
        // Arg:
        //  dist: number. The distance to convert in kilometers or miles.
        //        For this.bMetric true, distance is in kilometers.
        //        Otherwise distance is in files.   
        this.toMeters = function(dist) { 
            let n;
            if (this.bMetric) {
                n = dist * 1000.0;
            } else {
                // 1 mi = 1.60934 km.
                n =  dist * 1.60934 * 1000.0;  
            }
            return n;
        };

        // Returns literal object for speed:
        //  speed: number. speed value.
        //  unit:  string: unit for speed:
        //         For English: mph
        //           mph is for miles per hour.
        //         For Metric: kpm
        //           kph is for kilometers per hour.
        //  text: string. speed value with unit suffix.
        // Args:
        //  mLen: number. Length (distance) in meters.
        //  secTime: number. Elapsed time in seconds.
        this.toSpeed = function(mLen, secTime) { 
            var result = {speed: 0, unit: "mph", text: ""};  
            var dist;
            var hrTime = secTime / 3600; // 3600 seconds in an hour.
            if (this.bMetric) {
                // Concvert meters to kilometes.
                dist = mLen / 1000.0;
                result.unit = "kph";   
            } else {
                // Convert meters to miles.
                dist = mLen / 1609.34;
                result.unit = "mph";   
            }
            result.speed = dist / hrTime;
            if (Number.isFinite(result.speed)) {
                var nFixed = this.bMetric ? this.kmeterFixedPoint : this.mileFixedPoint;
                result.text = "{0} {1}".format(result.speed.toFixed(nFixed), result.unit);
            } else {
                result.text = "error " + result.unit;  
            }
            return result;
        };
    }
    var lc = new LengthConverter(); // Length converter object for displaying status to phone or pebble.

    // Object to access Pebble message api.
    function PebbleMessage() {
        var that = this;

        // Enables the adapter to send messages to Pebble.
        // Arg:
        //  bEnable: boolean. true to enable, false to disable.
        this.Enable = function (bEnable) {
            pebble.bEnabled = bEnable;
        }

        // Returns boolean indicating if adapter is enabled.
        this.IsEnabled = function () {
            return pebble.bEnabled;
        }

        // Returns boolean indicated if a Pebble watch is connected. 
        this.IsConnected = function () {
            var bConnected = pebble.IsConnected();
            return bConnected;
        };

        // Number of vibrations given when vibration is issued.
        this.countVibe = 0;

        // Set time out in seconds when tracking. 
        // When > 0, the Pebble should expect to receive text before this time out.
        // Arg:
        //  secsTrackingPeriod: number of seconds in tracking period. The time out
        //  is set to slightly longer than secsTrackingPeriod.
        this.SetTimeOut = function(secsTrackingPeriod) {
            pebble.secsTimeOut = secsTrackingPeriod + 10.0;
        }

        
        // Clear time out used when tracking.
        this.ClearTimeOut = function() { 
            pebble.secsTimeOut = 0.0;
        }

        // Starts the Pebble app.
        // Shows an alert on failure.
        this.StartApp = function () {
            pebble.StartApp(function (bOk) {
                var sMsg = "Pebble app started: {0}".format(bOk ? "OK" : "FAILED");
                console.log(sMsg);
                if (bOk) {
                    // Show message on pebble that MyTrail is started.
                    that.Send(document.title, true, false); // vibrate, no timeout.
                } else {
                    AlertMsg("Failed to start Pebble app.")
                }
            });
        };

        // Sends a message to Pebble.
        // Args:
        //  sText: string of text sent.
        //  bVibe: boolean indicating if Pebble should vibrate.
        //  bCheckTimeOut: boolean indicating if Pebble should check for a 
        //                 timeout before next message is received.
        this.Send = function (sText, bVibe, bCheckTimeOut) {
            var nVibe = bVibe ? this.countVibe : 0;
            if (this.IsEnabled()) {
                sText = sText.replace(/\<br\/\>/g, "\n");
                pebble.SendText(sText, nVibe, bCheckTimeOut, function (bAck) {
                    // Just log to console, showing status on phone looses direction to trail.
                    var sStatus = "Received {0} to Pebble message sent.".format(bAck ? 'ACK' : 'NACK');
                    console.log(sStatus);
                });
            }
        };

        // ** Events fired for message received from Pebble.
        //    Creator of this object sets member callback functions below to handle the event.

        // Select button single click received from Pebble.
        this.onSelect1Click = function () { };

        // Text received from Pebble.
        // Arg:
        //  sText: string. The texted received.
        this.onTextReceived = function (sText) { };
    
        // ** Private members
        // May need to provide uuid for pebble app. Defaults to PebbleMsg app.
        // May want to write special GeoTrail pebble app.
        var pebble = new wigo_ws_PebbleAdapter();

        // Fire event for Pebble click received.
        pebble.onClickReceived = function (nButtonId, nClickType) {
            if (nButtonId === pebble.eButtonId.Select && 
                nClickType === pebble.eClickType.Single) {
                if (that.onSelect1Click)
                    that.onSelect1Click();
            }
        };
        
        // Fire event for Pebble text received.
        pebble.onTextReceived = function (sText) {
            if (that.onTextReceived)
                that.onTextReceived(sText);
        };
    }

    // Object to control backgound mode. 
    // Wrapper for cordova-plugin-background-mode.
    function BackgroundMode() { 
        // Enable background mode for recording a trail.
        this.enableRecord = function() {
            enabled.bRecord = true;
            cordova.plugins.backgroundMode.enable();
        };
        
        // Disable background mode for recording a trail.
        this.disableRecord = function() {
            enabled.bRecord = false;
            if (!enabled.isEnabled()) {
                cordova.plugins.backgroundMode.disable();
            }
        };

        // Enable background mode for tracking geo location.
        this.enableTrack = function() {
            enabled.bTrack = true;
            cordova.plugins.backgroundMode.enable();
        };

        // Disable background mode for tracking geo location.
        this.disableTrack = function() {
            enabled.bTrack = false;
            if (!enabled.isEnabled()) {
                cordova.plugins.backgroundMode.disable();
            }
        };

        // Initializes the object.
        // Note: Handlers log event that is raised to console.
        //       For activate event only, background mode is allowed by disabling web view optimizations.
        this.initialize = function() {
            cordova.plugins.backgroundMode.on('enable', 
                function(){
                    console.log("Background mode event: enable");
                });

            cordova.plugins.backgroundMode.on('disable', 
            function(){
                console.log("Background mode event: disable");
            });

            cordova.plugins.backgroundMode.on('activate', 
            function(){
                console.log("Background mode event: activate");
                cordova.plugins.backgroundMode.disableWebViewOptimizations(); 
            });

            cordova.plugins.backgroundMode.on('deactivate', 
            function(){
                console.log("Background mode event: deactivate");
            });


        };

        // Private members
        // Object for state of tracking and/or recording enabled.
        var enabled = { bRecord: false,  // Indicates recording a trail is enabled.
                        bTrack: false,   // Indicates tracking a trail is enabled.
                        // Returns true if any boolean property is enabled.
                        isEnabled: function() {
                            var bEnabled = false;
                            for (var prop in this) {
                                if (this.hasOwnProperty(prop) && typeof this[prop] === 'boolean') {
                                    if (this[prop]) {
                                        bEnabled = true;
                                        break;
                                    }
                                }
                            }
                            return bEnabled;
                        }
                      };
        
    }
    var backgroundMode = new BackgroundMode(); 

    // Object to use if background mode is unavailable.
    // Note: Does nothing, does not use background plugin.
    //       All the properties must be same as properites for BackgroundMode() object.
    function BackgroundModeUnavailable() {
        // Enable background mode for recording a trail.
        this.enableRecord = function() {
        };
        
        // Disable background mode for recording a trail.
        this.disableRecord = function() {
        };

        // Enable background mode for tracking geo location.
        this.enableTrack = function() {
        };

        // Disable background mode for tracking geo location.
        this.disableTrack = function() {
        };

        // Initializes the object.
        // Note: Currently handlers simply log event that is raised to console.
        this.initialize = function() {
        };
    }
    // For iPhone, background mode does not work.
    if (window.app.deviceDetails.isiPhone())
        backgroundMode = new BackgroundModeUnavailable(); 
    
    /* //20171116 redo to use plugin.
    // This worked once but quite working.
    // Tried hard to get working but failed.
    // The plugin is deprecated and may not be supported
    // in the future. Leave code commented out 
    // in case it is needed in the future.
    // Object for detection device motion.
    // Constructor arg:
    //  view: ref to wigo_ws_View.
    function DeviceMotion(view) { 
        // Allows device motion to be detected.
        this.allow = function() {
            bAllow = true;
        };
        var bAllow = false;

        // Disallows detecting device motion.
        this.disallow = function() {
            bAllow = false;
            bTracking = false;
            bRecording = false;
            UnHandleDeviceMotion();
        };

        // Sets the accessive acceleration threshold.
        // Arg:
        //  thres: float. acceleration in m/sec%2.
        this.setAccelThres = function(thres) {
            nAccelThres = thres;
        };
        var nAccelThres = 9.8;

        // Sets the accessive acceleration velocity threshold.
        // Arg:
        //  thres: float. velocity in m/sec.
        this.setAccelVThres = function(thres) {
            nAccelVThres = thres;
        };
        var nAccelVThres = 6.0; 

        // Enables receiving device motion events for tracking.
        this.enableForTracking = function() {
            if (!bAllow)
                return;  // Quit if not allowed.
            if (!bRecording && !bTracking) {
                HandleDeviceMotion();
            }
            bTracking = true;
        };

        // Disables receiving device motion events for tracking.
        this.disableForTracking = function() {
            if (bTracking && !bRecording) {
                UnHandleDeviceMotion();
            }
            bTracking = false;
        };

        // Enables receiving device motion events for recording.
        this.enableForRecording = function() {  
            if (!bAllow)
                return;  // Quit if not allowed.
            if (!bRecording && !bTracking) {
                HandleDeviceMotion();
            }
            bRecording = true;
        };

        // Disables receiving device motion events for tracking.
        this.disableForRecording = function() { 
            if (!bTracking && bRecording) {
                UnHandleDeviceMotion();
            }
            bRecording = false;
        };

        // Event handler for calibrating compass.
        function OnCompassNeedsCalibration(event) {
            // ask user to wave device in a figure-eight motion.  
            if (!ackCalibrationNeededPending) {
                ackCalibrationNeededPending = true;
                AlertMsg('Your compass needs calibrating! Wave your device in a figure-eight motion', function() {
                    ackCalibrationNeededPending = false;
                }); 
            }
            event.preventDefault();
        }
        var ackCalibrationNeededPending = false; // Boolean flag indicating calibration by user is pending.

        // Event handler for device motion.
        // Checks for excessive acceleration.
        function OnDeviceMotion(event) {
            var sMsg;
            // Note: Events occur even if motion is not occurring. Cannot detect previously stationary by
            //       testing for long duration since previous event.

            prevAcceleration = curAcceleration; 
            curAcceleration = event.acceleration;
            curInterval = event.interval;
            if (!ackCalibrationNeededPending) {
                var deltaV = VelocityDelta();
                alertVelocity.x += deltaV.x;
                alertVelocity.y += deltaV.y;
                alertVelocity.z += deltaV.z;

                var speed = Magnitude(alertVelocity); 
                var accel = Magnitude(curAcceleration);
                if (accel > nAccelThres) {  
                    // Set alert velocity to zero. Alert velocity will need to exceed threshold before alert is issued again.
                    if (speed > nAccelVThres) {
                        ResetAlertVelocity(); 
                        sMsg = "Accel alert: a={0}m/sec^2, v={1}m/sec".format(accel.toFixed(1), speed.toFixed(1)); 
                        view.ShowStatus(sMsg, false);
                        console.log(sMsg);
                        alerter.DoAlert(); 
                        pebbleMsg.Send("Accel alert\nA={0}m/sec^2\nV={1}m/sec".format(accel.toFixed(1), speed.toFixed(1)),true,false); // true => vibrate, false => no timeout
                    }
                } else {
                    ResetAlertVelocity(); 
                }
            }
        }

        var bTracking = false;  // Boolean to enable event handling for tracking.
        var bRecording = false; // Boolean to enable event handling for recording.

        // Start handling events for device motion.
        function HandleDeviceMotion() {
            window.addEventListener("compassneedscalibration", OnCompassNeedsCalibration, false);
            ResetDeviceMotion();
            window.addEventListener("devicemotion", OnDeviceMotion, false);
        }

        // Stop handling events for device motion.
        function UnHandleDeviceMotion() {
            window.removeEventListener("compassneedscalibration", OnCompassNeedsCalibration, false);
            window.removeEventListener("devicemotion", OnDeviceMotion, false);
            ResetDeviceMotion();
        }

        // Resets variables for device motion.
        function ResetDeviceMotion() {
            curAcceleration = {x: 0, y: 0, z: 0};
            curInterval = 0;
            ResetAlertVelocity(); 
        }

        // Sets all components of alert velocity vector to 0.
        function ResetAlertVelocity() {
            alertVelocity.x = 0;
            alertVelocity.y = 0;
            alertVelocity.z = 0; 
        }

        var curAcceleration = {x: 0, y: 0, z: 0} ; // current acceleration vector in meters/sec. (z = -9.81 is free fall due to gravity)
        var curInterval = 0;  // Current interval in milliseconds wrt to previous. Note should be constant set by event handler.
        var alertVelocity = {x: 0, y: 0, z: 0}; // Velocity vector.
        var prevAcceleration = {x: 0, y: 0, z: 0}; // previous acceleration vector.
        var maxAccelerationMagnitude =  3.0; // Magnitude of acceleration beyond which and alert is given.
        
        // Returns vector for the change in velocity from current acceleration wrt previous acceleration.
        // Returns obj: {x: float, y: float, z: float}. Units for each component is meters/sec.
        function VelocityDelta() {
            // Helper to calculation area under acceleration segment for time delta, which change in velocity.
            // Args:
            // a, b: vectors wiith x, y, z components as floats.
            // dt: float. delta time in seconds.
            function DeltaArea(b, a, dt) {
                var c = {x: dt*(b.x + a.x)/2, y: dt*(b.y + a.y)/2, z: dt*(b.z + a.z)/2};
                return c;
            }
            var deltaV = DeltaArea(curAcceleration, prevAcceleration, curInterval/1000);
            return deltaV;
        }

        // Returns float for magnitude of a vector.
        // Arg:
        //  av: object with x, y, and z members of a vector.
        function Magnitude(av) {
            var mag = Math.sqrt(av.x*av.x + av.y*av.y + av.z*av.z);
            return mag;
        }
    }
    */
    // Note: The webview support for the DeviceMotionEvent is supposed to work.
    //       It does work for mobile Chrome, but I could not get it to work for GeoTrail
    //       The DeviceEvent did work at one time for GeoTrail, but I cannot get it 
    //       to work now. I tried hard, but no luck. Cannnot imagine what changed.
    // Object for detection device motion.
    // Constructor arg:
    //  view: ref to wigo_ws_View.
    function DeviceMotion(view) {
        // Boolean flag indicating sensing device motion is available. 
        this.bAvailable = false; 

        // Allows device motion to be detected.
        this.allow = function() {
            bAllow = true;
        };
        var bAllow = false;

        // Disallows detecting device motion.
        this.disallow = function() {
            bAllow = false;
            bTracking = false;
            bRecording = false;
            UnHandleDeviceMotion();
        };

        // Sets the exccessive acceleration threshold.
        // Arg:
        //  thres: float. acceleration in m/sec%2.
        this.setAccelThres = function(thres) {
            nAccelThres = thres;
        };
        var nAccelThres = ACCEL_GRAVITY;

        // Sets the accessive acceleration velocity threshold.
        // Arg:
        //  thres: float. velocity in m/sec.
        this.setAccelVThres = function(thres) {
            nAccelVThres = thres;
        };
        var nAccelVThres = 6.0; 

        // Enables receiving device motion events for tracking.
        this.enableForTracking = function() {
            if (!bAllow)
                return;  // Quit if not allowed.
            if (!bRecording && !bTracking) {
                HandleDeviceMotion();
            }
            bTracking = true;
        };

        // Disables receiving device motion events for tracking.
        this.disableForTracking = function() {
            if (bTracking && !bRecording) {
                UnHandleDeviceMotion();
            }
            bTracking = false;
        };

        // Enables receiving device motion events for recording.
        this.enableForRecording = function() {  
            if (!bAllow)
                return;  // Quit if not allowed.
            if (!bRecording && !bTracking) {
                HandleDeviceMotion();
            }
            bRecording = true;
        };

        // Disables receiving device motion events for tracking.
        this.disableForRecording = function() { 
            if (!bTracking && bRecording) {
                UnHandleDeviceMotion();
            }
            bRecording = false;
        };

        // Resets device motion.
        // Arg:
        //  bAllow: boolean. true to allow device motion sensing after resetting.
        this.reset = function(bAllow) { 
            this.disallow();
            this.disableForTracking();
            this.disableForRecording();
            if (bAllow) 
                this.allow();
        }

        // Returns true if acceleration is being sensed.
        this.isSensing = function() { // Added function.
            return bTracking || bRecording;
        }

        // Event handler (callback) for successfully checking device motion.
        // Checks for excessive acceleration.
        function OnDeviceMotion(acceleration) { 
            var sMsg;
            // Note: Events occur even if motion is not occurring. Cannot detect previously stationary by
            //       testing for long duration since previous event.

            prevAcceleration = curAcceleration; 
            curAcceleration = acceleration;
            var deltaV = VelocityDelta();
            alertVelocity.x += deltaV.x;
            alertVelocity.y += deltaV.y;
            alertVelocity.z += deltaV.z;

            var speed = Magnitude(alertVelocity); 
            var accel = Magnitude(curAcceleration) - ACCEL_GRAVITY; // Note: accel thres does not include acceleration due to gravity.
            if (accel > nAccelThres) {  
                // Set alert velocity to zero. Alert velocity will need to exceed threshold before alert is issued again.
                if (speed > nAccelVThres) {
                    ResetAlertVelocity(); 
                    sMsg = "Accel alert: a={0}m/sec^2, v={1}m/sec".format(accel.toFixed(1), speed.toFixed(1)); 
                    view.ShowStatus(sMsg, false);
                    console.log(sMsg);
                    alerter.DoAlert(); 
                    pebbleMsg.Send("Accel alert\nA={0}m/s^2\nV={1}m/s".format(accel.toFixed(1), speed.toFixed(1)),true,false); // true => vibrate, false => no timeout
                }
            } else {
                ResetAlertVelocity(); 
            }
        }

        // Event handler (callback) for an error when checking device motion.
        function OnDeviceMotionError() {
            view.ShowStatus("Error checking acceleration.", true); // true hightlites an error.
        }

        var bTracking = false;  // Boolean to enable event handling for tracking.
        var bRecording = false; // Boolean to enable event handling for recording.
        var watchID = 0; // ID set when watching acceration.  Needed to clear watching.

        // Start handling events for device motion.
        function HandleDeviceMotion() {
            ResetDeviceMotion();
            if (navigator && navigator.accelerometer && navigator.accelerometer.watchAcceleration) { // Ignore if navigator.accelerometer does not exist. 
                watchID = navigator.accelerometer.watchAcceleration(
                OnDeviceMotion, // accelerometerSuccess,
                OnDeviceMotionError, // accelerometerError,
                // accelerometerOptions
                {frequency: 30 } // Update every 30 milliseconds.
                );            
            } 
        }

        // Stop handling events for device motion.
        function UnHandleDeviceMotion() {
            if (navigator && navigator.accelerometer && navigator.accelerometer.clearWatch)  // Ignore if navigator.accelerometer does not exist.
                navigator.accelerometer.clearWatch(watchID);
            watchID = 0;
            ResetDeviceMotion();
        }

        // Resets variables for device motion.
        function ResetDeviceMotion() {
            curAcceleration = {x: 0, y: 0, z: ACCEL_GRAVITY};  
            ResetAlertVelocity(); 
        }

        // Sets all components of alert velocity vector to 0.
        function ResetAlertVelocity() {
            alertVelocity.x = 0;
            alertVelocity.y = 0;
            alertVelocity.z = ACCEL_GRAVITY; 
        }
        
        var ACCEL_GRAVITY = 9.81; // Constant for earth's gravity acceleration in meters/second^2.
        var curAcceleration = {x: 0, y: 0, z: ACCEL_GRAVITY} ; // current acceleration vector in meters/sec. (z was 0). 
        var curInterval = 30;  // Current interval in milliseconds wrt to previous. Constant for the sample period.
        var alertVelocity = {x: 0, y: 0, z: 0}; // Velocity vector.
        var prevAcceleration = {x: 0, y: 0, z: ACCEL_GRAVITY}; // previous acceleration vector. 
        var maxAccelerationMagnitude =  3.0; // Magnitude of acceleration beyond which and alert is given.
        
        // Returns vector for the change in velocity from current acceleration wrt previous acceleration.
        // Returns obj: {x: float, y: float, z: float}. Units for each component is meters/sec.
        function VelocityDelta() {
            // Helper to calculation area under acceleration segment for time delta, which change in velocity.
            // Args:
            // a, b: vectors wiith x, y, z components as floats.
            // dt: float. delta time in seconds.
            function DeltaArea(b, a, dt) {
                var c = {x: dt*(b.x + a.x)/2, y: dt*(b.y + a.y)/2, z: dt*(b.z + a.z)/2};
                return c;
            }
            var deltaV = DeltaArea(curAcceleration, prevAcceleration, curInterval/1000);
            return deltaV;
        }

        // Returns float for magnitude of a vector.
        // Arg:
        //  av: object with x, y, and z members of a vector.
        function Magnitude(av) {
            var mag = Math.sqrt(av.x*av.x + av.y*av.y + av.z*av.z);
            return mag;
        }
    }
    var deviceMotion = new DeviceMotion(this); // Object to detect acceleration.


    // Shows Status msg for result from map.SetGeoLocUpdate(..).
    // Arg:
    //  upd is {bToPath: boolean, dToPath: float, bearingToPath: float, bRefLine: float, bearingRefLine: float,
    //          bCompass: bool, bearingCompass: float, compassError: CompassError or null}:
    //    See SetGeoLocationUpdate(..) member of wigo_ws_GeoPathMap for details about upd, which is returned
    //    by the method. 
    //  bNotifyToo boolean, optional. true to indicate that a notification is given in addition to a beep 
    //             when an alert is issued because geolocation is off track. Defaults to false.
    //  sPrefixMsg string, optional. prefix message for update status msg. Defaults to empty string.
    //  sPebblePrefixMsg string, optional. prefix for update status msg sent to Pebble. Defaults to empty string.
    //  sPebbleSuffixMsg string, optional. suffix for update status msg sent to Pebble. Defaults to empty string.
    function ShowGeoLocUpdateStatus(upd, bNotifyToo, sPrefixMsg, sPebblePrefixMsg, sPebbleSuffixMsg) { 
        // Return msg for paths distances from start and to end for phone.
        function PathDistancesMsg(upd) {
            // Set count for number of elements in dFromStart or dToEnd arrays.
            var count = upd.dFromStart.length;
            if (upd.dToEnd.length < count)
                count = upd.dToEnd.length;

            var dTotal = 0;
            var s = "";
            var sMore;
            for (var i = 0; i < count; i++) {
                if (i === 0)
                    dTotal += upd.dFromStart[i];
                sMore = count > 1 && i < count - 1 ? "/" : "";
                s += "Fr Beg: {0}{1}<br/>".format(lc.to(upd.dFromStart[i]), sMore);
            }

            for (i = 0; i < count; i++) {
                if (i === 0)
                    dTotal += upd.dToEnd[i];
                sMore = count > 1 && i < count - 1 ? "/" : "";
                s += "To End: {0}{1}<br/>".format(lc.to(upd.dToEnd[i]), sMore);
            }
            s += "Total: {0}<br/>".format(lc.to(dTotal));
            return s;
        }

        // Return msg for paths distances from start and to end for Pebble.
        function PathDistancesPebbleMsg(upd) {
            // Set count for number of elements in dFromStart or dToEnd arrays.
            var count = upd.dFromStart.length;
            if (upd.dToEnd.length < count)
                count = upd.dToEnd.length;

            var dTotal = 0;
            var s = "";
            var sMore;
            for (var i = 0; i < count; i++) {
                if (i === 0)
                    dTotal += upd.dFromStart[i];
                sMore = count > 1 && i < count - 1 ? "/" : "";
                s += "<- {0}{1}<br/>".format(lc.to(upd.dFromStart[i]), sMore);
            }

            for (i = 0; i < count; i++) {
                if (i === 0)
                    dTotal += upd.dToEnd[i];
                sMore = count > 1 && i < count - 1 ? "/" : "";
                s += "-> {0}{1}<br/>".format(lc.to(upd.dToEnd[i]), sMore);
            }
            s += "Tot {0}<br/>".format(lc.to(dTotal));
            return s;
        }
        if (typeof sPrefixMsg !== 'string') 
            sPrefixMsg = '';       
        if (typeof sPebblePrefixMsg !== 'string')  
            sPebblePrefixMsg = '';    
        if (typeof sPebbleSuffixMsg !== 'string') 
            sPebbleSuffixMsg = '';    
        that.ClearStatus();
        if (!upd.bToPath) {
            if (map.IsPathDefined()) {
                var sMsg = "On Trail<br/>";
                sMsg += PathDistancesMsg(upd);
                that.ShowStatus(sPrefixMsg + sMsg, false); // false => not an error. 
                sMsg = "On Trail<br/>";
                sMsg += PathDistancesPebbleMsg(upd);
                pebbleMsg.Send(sPebblePrefixMsg + sMsg + sPebbleSuffixMsg, false, trackTimer.bOn) // no vibration, timeout if tracking.
            } else {
                // Show lat lng for the current location since there is no trail.
                var sAt = "lat/lng({0},{1})<br/>".format(upd.loc.lat.toFixed(6), upd.loc.lng.toFixed(6));
                if (upd.bCompass) {
                    sAt +=  "Compass Heading: {0}&deg;<br/>".format(upd.bearingCompass.toFixed(0));
                }
                that.ShowStatus(sPrefixMsg + sAt, false); // false => no error.
                sAt = "lat/lng\n{0}\n{1}\n".format(upd.loc.lat.toFixed(6), upd.loc.lng.toFixed(6));
                if (upd.bCompass) {
                    sAt += "Cmps Hdg: {0}{1}\n".format(upd.bearingCompass.toFixed(0), sDegree);
                }
                pebbleMsg.Send(sPebblePrefixMsg + sAt + sPebbleSuffixMsg, false, false); // no vibration, no timeout.
            }
        } else {
            // vars for off-path messages.
            var sBearingToPath = upd.bearingToPath.toFixed(0);
            var sDtoPath = lc.to(upd.dToPath);
            var sToPathDir = map.BearingWordTo(upd.bearingToPath);
            var phi = upd.bearingToPath - upd.bearingRefLine;
            var phiCompass = upd.bearingToPath -  upd.bearingCompass;
            var sTurn = 'Right';
            var sTurnCompass = 'Right';
            // Show distance and heading from off-path to on-path location.
            var s = "Off trail {2}.<br/>Head {0} ({1}&deg; wrt N) to go to trail.<br/>".format(sToPathDir, sBearingToPath, sDtoPath);
            var sMsg = s;
            if (upd.bRefLine) {
                // Calculate angle to turn to return to path based on previous heading.
                if (phi < 0)
                    phi += 360.0;
                if (phi > 180.0) {
                    sTurn = 'Left';
                    phi = 360.0 - phi;
                }
                s = "?P {1} {0}&deg; from Previous Hdg of {2}&deg;.<br/>".format(phi.toFixed(0), sTurn, upd.bearingRefLine.toFixed(0));
                sMsg += s;
            }
            // Show angle to turn based on compass bearing.
            if (upd.bCompass) {
                // Calculate angle to turn to return to path based on previous heading.
                if (phiCompass < 0)
                    phiCompass += 360.0;
                if (phiCompass > 180.0) {
                    sTurnCompass = 'Left';
                    phiCompass = 360.0 - phiCompass;
                }
                s = "?C {1} {0}&deg; from Compass Hdg of {2}&deg;.<br/>".format(phiCompass.toFixed(0), sTurnCompass, upd.bearingCompass.toFixed(0));
                sMsg += s;
            }
            // Show distance from start and to end.
            sMsg += PathDistancesMsg(upd);
            that.ShowStatus(sPrefixMsg + sMsg, false);  
            // Issue alert to indicated off-path.
            alerter.DoAlert(bNotifyToo); 

            // Issue alert to Pebble watch.
            sMsg = "Off {0}\n".format(sDtoPath);
            // sMsg += "Head {0} ({1}{2})\n".format(sCompassDir,sBearingToPath, sDegree);
            // Decided not to show compass degrees, just direction: N, NE, etc.
            sMsg += "Head {0}\n".format(sToPathDir);
            // Show angle to turn. Use compass if available.
            if (upd.bRefLine) {   
                sMsg += "?P {0} {1}{2}\n".format(sTurn, phi.toFixed(0), sDegree);
            }
            if (upd.bCompass) {
                sMsg += "?C {0} {1}{2}\n".format(sTurnCompass, phiCompass.toFixed(0), sDegree);
            }
            sMsg += PathDistancesPebbleMsg(upd); 
            pebbleMsg.Send(sPebblePrefixMsg + sMsg + sPebbleSuffixMsg, true, trackTimer.bOn); // vibration, timeout if tracking. 
        }
    }

    // Shows status message for a error obtaining current geolocation.
    // Arg:
    //  positionError: PositionError object related to navigator.geolocation object.
    function ShowGeoLocPositionError(positionError) {
        var sMsg = "Geolocation Failed!\nCheck your device settings for this app to enable Geolocation.\n" + positionError.message;
        console.log(sMsg);
        switch (positionError.code) {
            case 1: 
                sMsg = "Permission to use geolocation denied.\nCheck your device settings for this app to enable geolocation.";
                break;
            case 2:
                sMsg = "Failed to get geolocation.";
                break;
            case 3:
                sMsg = "Timeout occurred trying to get geolocation.";
                break;
        }   
        that.ShowStatus(sMsg);
    }

    // ** Private members for Open Source map
    var map = new wigo_ws_GeoPathMap(false); // false => do not show map ctrls (zoom, map-type).
    // Event handler for click on leaflet map when debugging using click point as Lat/Lng
    // for a geo location update.
    map.onMapClick = function (llAt) {
        // Show map click as a geo location point only for Edit or Offline mode. Also,
        // Showing a map click is only for debug and is ignored by wigo_ws_GeoPathMap
        // object unless Settings indicates a click for geo location on.
        var nMode = that.curMode();
        if (nMode === that.eMode.online_view || 
            nMode === that.eMode.offline) {
            // First check if testing reccording a point.
            var bRecordedPt = recordFSM.testWatchPt(llAt);
            // If not a recorded point, update geo location wrt main trail.
            if (!bRecordedPt) {
                map.SetGeoLocationUpdate(llAt, trackTimer.dCloseToPathThres, function(updateResult){
                    ShowGeoLocUpdateStatus(updateResult);
                });
            }
        }
    };

    // Event handler for a click on the leaflet map.
    // Note: EditFSM object has its own OnMapClick2 event handler.
    function OnMapClick2(llAt) { 
        if (nMode === that.eMode.online_view || 
            nMode === that.eMode.offline) {
                // Clear trail animation in case it is running.
                map.ClearPathAnimation();
                map.recordPath.clearPathAnimation(); 
        }
    }
    map.onMapClick2 = OnMapClick2; 

    // Show a path on the map due to selection from a path marker.
    // Signature of handler:
    //  sDataIx: string. index of data element for the path to shown.
    map.onShowPath = function(sDataIx) {  
        var nDataIx = parseInt(sDataIx, 10);
        that.onPathSelected(that.curMode(), nDataIx);
        selectGeoTrail.setSelected(sDataIx); 
        // Insert Animate Trail Item in selectGeoTrail droplist if needed.
        selectGeoTrail.insertAnimatePathItem(); 
    };

    // Gets distance for a path.
    // Signature of handler:
    //  sDataIx: string. index of data element for the path to shown.
    //  Returns: {n: number, s: string}:
    //      n: number. total distance of path in meters.
    //      s: string. total distance of path with suffix for units.
    map.onGetPathDistance = function(sDataIx) { 
        var result = {n: 0, s: "?"};
        var nDataIx = parseInt(sDataIx, 10);
        var path = that.onGetPath(that.curMode(), nDataIx); 
        var pathSegs = map.newPathSegs();
        pathSegs.Init(path);
        var dist = pathSegs.getTotalDistance();
        result.n = dist; // distance of path in meters.
        result.s = lc.to(dist);
        return result;
    };

     // Event handler for distance traveled alert when recording a path.
    map.recordPath.onDistanceAlert = function(stats) { 
        var sDist = lc.to(stats.dTotal);
        var sMsg = "Distance Alert: traveled {0}".format(sDist);
        alerter.DoAlert();
        that.ShowStatus(sMsg, false); 
        pebbleMsg.Send(sMsg, true, false); // true => vibration, false not timeout check. 
    };

    // Returns true if divSettings container is hidden.
    function IsSettingsHidden() {
        var bHidden = divSettings.style.display === 'none' || divSettings.style.dispaly === '';
        return bHidden;
    }

    // ** Private members for Facebook
    // Callback after Facebook authentication has completed.
    function cbFbAuthenticationCompleted(result) {
        if (that.onAuthenticationCompleted)
            that.onAuthenticationCompleted(result);
    }

    // ** Constructor initialization.

    // **** provide event handler for preventing dragging of divMode area off the screen.
    //      divMode area contains the bars and other user interface.
    divMode.addEventListener('touchmove', function(event){
        // Allow scrolling of selectGoTrail dropdown list.
        if (!(selectGeoTrail.isDropDownListScrolling() || nMode === that.eMode.record_stats_view)) {  
            // Scrolling is prevented except for selectGeoTrail droplist or Stats History View.
            event.preventDefault();
            event.stopPropagation();
        }
        
        // Note: The statusDiv is not allowed to scroll to avoid 
        // problems with divMode scrolling off the screen.
        // Tried to have statusDiv indicate it was scrolling but 
        // was unsuccessful. The scheme used for selectGeoTrail
        // did not work for statusDiv.
    }, false);

    // Create mainMenu and fill its drop list.
    parentEl = document.getElementById('mainMenu');
    var mainMenu = new ctrls.DropDownControl(parentEl, "mainMenuDropDown", null, null, "img/ws.wigo.menuicon.png"); 
    var mainMenuValues; 
    if (app.deviceDetails.isiPhone()) {  
        // For iPhone, no start pebble, no tracking vs battery drain.
        mainMenuValues = [['terms_of_use','Terms of Use'],                        
                          ['settings', 'Settings'],                               
                          // ['start_pebble', 'Start Pebble'],          // No Pebble
                          ['help', 'Help - Guide'],                                
                          ['back_to_trail', 'Help - Back To Trail'],              
                          ['battery_drain', 'Help - Reducing Battery Drain'],  
                          ['about', 'About'],                                     
                          ['license', 'Licenses'],
                          // ['screenshot', 'Screen Shot Report'],  //20161215 Not working in hockepapp plugin for ios.                         
                          ['crash', 'Crash Test']
                         ];
        // iPhone. Do not show help features not available on iPhone.
        var noHelp = document.getElementsByClassName("noIosHelp");
        for (var iNoHelp=0; iNoHelp < noHelp.length; iNoHelp++) {
            ShowElement(noHelp[iNoHelp], false);
        }
    } else {
        mainMenuValues = [['terms_of_use','Terms of Use'],                        // 0
                          ['settings', 'Settings'],                               // 1
                          ['start_pebble', 'Start Pebble'],                       // 2
                          ['help', 'Help - Guide'],                               // 3 
                          ['back_to_trail', 'Help - Back To Trail'],              // 4
                          ['battery_drain', 'Help - Reducing Battery Drain'],     // 5 
                          ['about', 'About'],                                     // 6
                          ['license', 'Licenses'],                                // 7
                          // ['screenshot', 'Screen Shot Report'],                //20161215 Not available for Android.      
                          // ['crash', 'Crash Test']                              //20161215 Not available for Android.
                         ];
        // Android. Do not show help for info about iPhone that does apply for Android.
        var noHelp = document.getElementsByClassName("noAndroidHelp");
        for (var iNoHelp=0; iNoHelp < noHelp.length; iNoHelp++) {
            ShowElement(noHelp[iNoHelp], false);
        }
    }

    mainMenu.fill(mainMenuValues);
    mainMenu.onListElClicked = function (dataValue) {
        divStatus.addLine("Main menu item  dataValue: " + dataValue); 

        if (dataValue === 'settings') {
            var settings = that.onGetSettings();
            SetSettingsValues(settings);
            ShowSettingsDiv(true);
        } else if (dataValue === 'start_pebble') {
            // Note: pebbleMsg.IsConnected() does not work. Do not check for Pebble connected.
            if (pebbleMsg.IsEnabled()) {
                pebbleMsg.StartApp();
            } else {
                AlertMsg("Pebble watch is not enabled. Use Menu > Settings to enable.")
            }
            this.selectedIndex = 0;
        } else if (dataValue === 'about') {
            AlertMsg(AboutMsg())
            this.selectedIndex = 0;
        } else if (dataValue === 'license') {
            ShowHelpLicense(true);
            this.selectedIndex = 0;
        } else if (dataValue === 'help') {
            ShowHelpGuide(true);
            this.selectedIndex = 0;
        } else if (dataValue === 'back_to_trail') {
            ShowHelpBackToTrail(true);
            this.selectedIndex = 0;
        } else if (dataValue === 'terms_of_use') {
            ShowTermsOfUse(true);
            this.selectedIndex = 0;
        } else if (dataValue === 'battery_drain') {
            ShowHelpTrackingVsBattery(true);
            this.selectedIndex = 0;
        } else if (dataValue === 'crash') {
            ConfirmYesNo("Is it ok to CRASH and end this app in order to test generating a crash report? ", 
            function(bYes) {
                if (bYes) {
                    if (typeof(hockeyapp) !== 'undefined') {
                        hockeyapp.addMetaData(null, null, {CrashTest: 'Testing forced crash.'});
                        hockeyapp.forceCrash();
                    }
                } else {
                    AlertMsg("OK, no crash -- continuing as usual.");
                }
            })

        } else if (dataValue === 'screenshot') {
            ConfirmYesNo("Is it ok to send a screen shot to report a problem?", 
            function(bYes) {
                if (bYes) {
                    if (typeof(hockeyapp) !== 'undefined') {
                        /* //20161214 Does not work currently. Maybe some day plugin will be fixed.
                           //         Disable by removing Crash Test item for mainMenu. 
                        hockeyapp.composeFeedback(function(){
                            // Success.
                            AlertMsg('A screen shot has been sent.');
                        }, 
                        function(){
                            // Error.
                            AlertMsg('Failed to send screen shot!');
                        }, 
                        true, 
                        {ScreenShot: 'Screen Shot'});
                        */
                        // hockeyapp.feedback(); // Does not take screen shot. Kind of works, but crashes if user selects Add Image.
                    }
                } else {
                    AlertMsg("No screen shot sent.");
                }
            });
        }
        that.ClearStatus();
    };

    // ** Select Mode dropdown ctrl.
    parentEl = document.getElementById('selectMode');
    var selectMode = new ctrls.DropDownControl(parentEl, "selectModeDropDown", "View", null, "img/ws.wigo.dropdownicon.png");
    var selectModeValues = [['select_mode', 'Sign-in/off'],   
                            ['online_view',   'Online'],        
                            ['offline',       'Offline'],       
                            ['online_edit',   'Edit a Trail'],        
                            ['online_define', 'Draw a Trail'],
                            ['record_stats_view', 'Stats History']      
                           ]; 
    selectMode.fill(selectModeValues);

    selectMode.onListElClicked = function(dataValue) {
        // this.value is value of selectMode control.
        var nMode = that.eMode.toNum(dataValue);

        // Helper function to change mode.
        function AcceptModeChange() {
            that.ClearStatus();
            // Inform controller of the mode change, not needed.
            // that.onModeChanged(nMode); // not needed.
            that.setModeUI(nMode);
        }

        // Signin is no longer a mode change. Instead show the signin control bar.
        if (that.eMode[dataValue] === that.eMode.select_mode) {  
            ShowSignInCtrl(true);
            return;
        }

        if (fsmEdit.IsPathChanged()) {
            ConfirmYesNo("The geo trail has been changed. OK to continue and loose any change?", function (bConfirm) {
                if (bConfirm) {
                    fsmEdit.ClearPathChange();
                    AcceptModeChange();
                } else {
                    // Restore the current mode selected before the change.
                    selectMode.selectedIndex = that.curMode();
                }
            });
        } else if (!recordFSM.isOff()) { 
            ConfirmYesNo("Recording a trail is in progress. OK to continue and clear the recording?", function(bConfirm){
                if (bConfirm) {
                    recordFSM.saveStats(); // Ensure stats for recording have been saved. 
                    AcceptModeChange();
                } else {
                    // Restore the current mode selected before the change.
                    selectMode.selectedIndex = that.curMode();
                }
            });
        } else if (recordStatsHistory && recordStatsHistory.isEditingStatsActive()) { 
            AlertMsg("Complete editing the stats item before changing the view.", null)
        } else {
            AcceptModeChange();
        }
    };

    // *** Signin dropdown ctrl
    parentEl = document.getElementById('selectSignInHolder');
    var selectSignIn = new ctrls.DropDownControl(parentEl, "signinDropDown", "Sign-In", null, "img/ws.wigo.dropdownhorizontalicon.png"); 
    selectSignIn.fill([['facebook', 'Facebook'],
                       ['logout', 'Logout'],
                       ['reset','Reset Server Access'], 
                      ]);

    selectSignIn.onListElClicked = function(dataValue) {

        // Check for resetting http access first. 
        if (dataValue === 'reset') {  
            that.onResetRequest(nMode);
            that.ShowStatus("Reset server access.", false);
            return;
        }

        // Quit if there is no internet access. 
        if (!networkInfo.isOnline()) {
            var sAction = dataValue === 'facebook' ? 'sign in' :
                            dataValue === 'logout' ? 'log out' : 'action'; 
            var sError = "Facebook {0} failed.<br/>Internet access is not available.".format(sAction);
            that.ShowStatus(sError);
            that.AppendStatusDiv(networkInfo.getBackOnlineInstr(), false);  
            return;
        }

        if (dataValue === 'facebook') {
            that.ClearStatus();
            fb.Authenticate();
        } else if (dataValue === 'logout') {
            // Only allow Logout for View or Offline mode.
            var nMode = that.curMode();
            if (nMode === that.eMode.online_edit ) {
                that.AppendStatus("Complete editing the trail, then logout.", false);
            } else if (nMode === that.eMode.online_define) {
                that.AppendStatus("Complete defining a new trail, then logout.", false);
            } else {
                that.ClearStatus();
                // Save record stats residue for current user if need be.
                var sOwnerId =  that.getOwnerId();
                var recordStatsXfr = that.onGetRecordStatsXfr();
                var arUploadRecStats = recordStatsXfr.getRecordStatsUploadNeeded();
                if (arUploadRecStats.length > 0) {
                    if (sOwnerId) {
                        recordStatsXfr.clearResidue(sOwnerId); 
                        recordStatsXfr.appendResidueAry(sOwnerId, arUploadRecStats);
                        recordStatsXfr.setUploadTimeStamp(arUploadRecStats[0].nTimeStamp); // Note: element 0 is most recent 
                    }
                }
                // Save previous owner id before logging out.
                if (sOwnerId ) {
                    recordStatsXfr.setPreviousOwnerId(sOwnerId);
                }
                fb.LogOut();
            }
        } else if (dataValue === 'set') {
            that.ClearStatus();
        } else {
            that.ClearStatus();
        }
        selectSignIn.setSelected('set'); // Select Signin element.
    };

    // ** Initialize online bar.
    // Select GeoTrail control
    parentEl = document.getElementById('divTrailInfo');
    var selectGeoTrail = new ctrls.DropDownControl(parentEl, "selectGeoTrailDropDown", "Trails", "Select a Geo Trail", "img/ws.wigo.menuicon.png");
    // Provide additional function properties for selectGeoTrail. 
    // Returns number for droplist element data-value attribute for Animate Current Path item.
    selectGeoTrail.getAnimatePathDataIxNum = function()
    {
        return -2;
    };
    // Returns number for droplist element data-value attribute for Select a Geo Trail, 
    // which is first item in droplist.
    selectGeoTrail.getSelectPathsDataIxNum = function() {
        return -1;
    };
    // Currently selected GeoTrail data-value. 
    // Note:
    //  -1 is for droplist item Select a Geo Trail.
    //  -2 is for droplist item Animate Current Trail.
    //  -3 indicates no item currently selected item, initial state.
    //  >= 0 indicates data-value for currently selected trail.
    //   
    selectGeoTrail.curSelectedDataValue = -3;  
    // Clears 
    selectGeoTrail.clearSelectedDataValue = function() {
        selectGeoTrail.curSelectedDataValue = -3;
    };
    // Empty selectGeoTrail droplist and append first item.
    selectGeoTrail.appendFirstItem = function() {
        selectGeoTrail.empty();
        var sDataIx = selectGeoTrail.getSelectPathsDataIxNum();
        selectGeoTrail.appendItem(sDataIx, "Select a Geo Trail", true); // true => show header as value.
    };
    // Insert item to Animate Current Trail at index position 1 in the selectGeoTrail droplist.
    selectGeoTrail.insertAnimatePathItem = function() {
        var sDataIx = selectGeoTrail.getAnimatePathDataIxNum().toFixed(0);
        selectGeoTrail.insertItemAtIx(1, sDataIx, "Animate Current Trail");  
    };
    // selectGeoTrail event handler for a droplist element clicked.
    // Arg:
    //  dataValue: string. data-value attributed of droplist element clicked.
    selectGeoTrail.onListElClicked = function(dataValue) { 
        var listIx = parseInt(dataValue)
        that.ClearStatus();
        // Always hide sign-in bar when path is selected to conserve screen space.
        ShowOwnerIdDiv(false); 
        // Ensure tracking is off and do not show compass for current geolocation
        // because the compass arrow may be way out of scale. It seems the compass
        // must be drawn after this thread has ocmpleted in order for scaling to be 
        // correct for the drawing polygons on the map.
        // Also, it makes sense to ensure tracking is off when selecting a different trail.
        mapTrackingCtrl.setState(0);
        trackTimer.ClearTimer();
        that.ShowCurrentStatus(); // Show status for Track Off, Record, and Accel.
        if (listIx === selectGeoTrail.getSelectPathsDataIxNum()) {  // -1 
            // No path selected.
            map.ClearPath();
            // Set current selected data-value to indicate no path is selected (set to -1);
            selectGeoTrail.curSelectedDataValue = dataValue;  
            // Remove the Animate Current Trail item from the droplist because there is no currently selected path.
            selectGeoTrail.removeItem(selectGeoTrail.getAnimatePathDataIxNum().toFixed(0)); 
            map.ShowPathMarkers(); 
        } else if (listIx === selectGeoTrail.getAnimatePathDataIxNum()) { // -2 
            map.AnimatePath();
            // Restore currently selected path that than Animate Current Path Item.
            selectGeoTrail.setSelected(selectGeoTrail.curSelectedDataValue);  
        } else {
            // Path is selected. 
            selectGeoTrail.curSelectedDataValue = selectGeoTrail.getSelectedValue();  // Save data-value for selected item.
            that.onPathSelected(that.curMode(), listIx);
            selectGeoTrail.insertAnimatePathItem(); 
        }
        titleBar.scrollIntoView();
    };

    // Determine and return height available for selectGeoTrail droplist.
    // Returns: number. number of pixels available. <= 0 means do not change height.
    selectGeoTrail.onMeasureMaxHeight = function() {
        var height = 0; // Note: 0 means no change in height.
        var mapCanvas = map.getMapCanvas(); 
        if (mapCanvas && mapBar) {
            height = mapBar.offsetTop - mapCanvas.offsetTop 
        }
        return height;
    }

    selectGeoTrail.onNoSelectionClicked = function() {
        // Ensure titlebar is scrolled into view.
        // Scrolling the dropdown list can cause titlebar to go off screen.
        titleBar.scrollIntoView();
    }


    parentEl = document.getElementById('onlineSelectFind');
    var onlineSelectFind = new ctrls.DropDownControl(parentEl, "onlineSelectFindDropDown", "Find Trails", null, "img/ws.wigo.dropdownicon.png"); 
    onlineSelectFind.fill([ ['home_area', 'Home Area'],
                            ['on_screen', 'On Screen'],
                            ['all_public', 'All Public Trails'],
                            ['all_mine', 'All Mine'],
                            ['my_public', 'My Public'],
                            ['my_private','My Private']
                          ]); 
    onlineSelectFind.onListElClicked = function(dataValue) { 
        // The Find droplist is only valid in view mode.
        if (that.curMode() !== that.eMode.online_view)
            return; // Note: should not happen because selectFind should only be visible in view mode.

        // Save parameters for view for finding paths.
        var nFindIx = that.eFindIx.toNum(dataValue); 
        var sOwnerId = that.getOwnerId();
        var bClearPath = true;
        if (nFindIx === that.eFindIx.home_area) {
            viewFindParams.setRect(nFindIx, homeArea.gptSW, homeArea.gptNE);
            if (that.onFindPaths)
                that.onFindPaths(sOwnerId, nFindIx, homeArea.gptSW, homeArea.gptNE);
        } else if (nFindIx === that.eFindIx.on_screen) {
            var oMap = map.getMap(); // Get underlying Leaflet map object.
            var bounds = oMap.getBounds();
            var ptSW = bounds.getSouthWest();
            var ptNE = bounds.getNorthEast();
            var gptSW = new wigo_ws_GeoPt();
            gptSW.lat = ptSW.lat;
            gptSW.lon = ptSW.lng;
            var gptNE = new wigo_ws_GeoPt();
            gptNE.lat = ptNE.lat;
            gptNE.lon = ptNE.lng;
            viewFindParams.setRect(nFindIx, gptSW, gptNE);
            if (that.onFindPaths)
                that.onFindPaths(sOwnerId, nFindIx, gptSW, gptNE);
        } else if (nFindIx === that.eFindIx.all_public) { 
            viewFindParams.init(nFindIx);
            if (that.onFindPaths)
                that.onFindPaths(sOwnerId, nFindIx, gptSW, gptNE);
        } else if (nFindIx === that.eFindIx.all_mine ||
                   nFindIx === that.eFindIx.my_public  ||
                   nFindIx === that.eFindIx.my_private) {
            viewFindParams.init(nFindIx);
            if (!sOwnerId) {
                that.ShowStatus("You must be signed in to find your trails.", true);
                ShowOwnerIdDiv(true); // Show sign-in bar 
                bClearPath = false;
            } else {
                if (that.onFindPaths)
                    that.onFindPaths(sOwnerId, nFindIx, gptSW, gptNE);
            }
        } else {
            bClearPath = false;
        }

        // Clear the drawn map path because the selectGeoTrail droplist has been reloaded.
        if (bClearPath)
            map.ClearPath();
    };

    parentEl = document.getElementById('onlineRecord'); 
    var onlineRecord = new ctrls.DropDownControl(parentEl, "onlineRecordDropDown", "Off", null, "img/recordicon.png");
    onlineRecord.onListElClicked = function(dataValue) {
        recordFSM.nextState(recordFSM.eventValue(dataValue));
    };

    parentEl = document.getElementById('offlineRecord');  
    var offlineRecord = new ctrls.DropDownControl(parentEl, "offlineRecordDropDown", "Off", null, "img/recordicon.png");
    offlineRecord.onListElClicked = function(dataValue) {
        recordFSM.nextState(recordFSM.eventValue(dataValue));
    };

    parentEl = document.getElementById('offlineLocalData'); 
    var offlineLocalDataCtrl = new ctrls.DropDownControl(parentEl, "offlineLocalDataDropDown", "Local Data", null, "img/ws.wigo.dropdownicon.png");
    offlineLocalDataCtrl.onListElClicked = function(dataValue) {
        var nEvent = offlineLocalData.EventValue(dataValue);
        offlineLocalData.do(nEvent);
    };     
    var offlineLocalData = new OfflineLocalData(this, offlineLocalDataCtrl, recordFSM.refUploader()); 

    // OnOffControl for Phone Alert on map bar.
    var holderMapPhAlertToggle = document.getElementById('mapPhAlertToggle');
    var mapAlertCtrl = new ctrls.OnOffControl(holderMapPhAlertToggle, null, "Alert", -1);
    mapAlertCtrl.onChanged = function(nState) {
        // Enable/disable alerts.
        alerter.bPhoneEnabled = nState === 1;
        // Show status because Ph Alert on Panel is no longer used.
        var sMsg = nState === 1 ? "Phone Alert On." : "Phone Alert Off.";
        that.ShowStatus(sMsg, false); 
    };

    // OnOffControl for Tracking on map bar.
    var holderMapTrackToggle = document.getElementById('mapTrackToggle');
    var mapTrackingCtrl = new ctrls.OnOffControl(holderMapTrackToggle, null, "Track", -1);
    mapTrackingCtrl.onChanged = function(nState) {
        that.ClearStatus(); 
        // Save state of flag to track geo location.
        trackTimer.bOn = nState === 1;    // Allow/disallow geo-tracking.
        // Start or clear trackTimer.
        RunTrackTimer();
        that.ShowCurrentStatus(); // Show status for Track, Record, and Accel.
    };

    // Sets values for the Track and Alert OnOffCtrls on the mapBar.
    // Arg:
    //  settings: wigo_ws_GeoTrailSettings object for user settings (preferences).
    //  bInitial: boolean. true to indicate initial call after app is loaded.
    function EnableMapBarGeoTrackingOptions(settings, bInitial) {
        var bAllowTracking = settings.bAllowGeoTracking;
        var bAllowPhoneAlert = settings.bPhoneAlert;
        var bEnablePhoneAlert = settings.bOffPathAlert; 
        ShowElement(holderMapTrackToggle, bAllowTracking);  
        ShowElement(holderMapPhAlertToggle, bAllowPhoneAlert);  

        // Set Track control to Off when app is initially loaded.
        // Otherwise leave of Track control as is.
        // Note: settings.bEnableGeoTracking, which used to indicate Track On initially, is no longer used.
        if (bInitial)  
            mapTrackingCtrl.setState(0);
        var nState = bAllowPhoneAlert && bEnablePhoneAlert ? 1 : 0;
        mapAlertCtrl.setState(nState);
    }

    parentEl = document.getElementById("selectMapCache");
    var selectMapCache = new ctrls.DropDownControl(parentEl, "selectMapCacheDropDown", "Map Cache", null, "img/ws.wigo.dropdownicon.png");
    var selectMapCacheValues = [['size', 'Size'],
                                ['clear', 'Clear']];
    selectMapCache.fill(selectMapCacheValues);
    selectMapCache.onListElClicked = function(dataValue) {
        if (that.curMode() === that.eMode.offline) {
            if (dataValue === 'clear') {
                // Confirm it is ok to clear the cache.
                var sMsg =
"Clearing the map cache deletes all the trail maps you have saved.\n\
Are you sure you want to delete the maps?";
                ConfirmYesNo(sMsg, function (bYes) {
                    if (bYes) {
                        that.ShowStatus("Clearing map cache ...", false); // false => not an error.
                        map.ClearCache(function (nFilesDeleted, nFilesIfError) {
                            var sResult;
                            if (nFilesIfError > 0)
                                sResult = "Error occurred, deleted {0} files.".format(nFilesIfError);
                            else
                                sResult = "Deleted {0} cache files.".format(nFilesDeleted);
                            AlertMsg(sResult);
                            that.ClearStatus();
                            ClearOfflineGeoPathSelect();
                            if (that.onMapCacheCleared)
                                that.onMapCacheCleared();
                        });
                    }
                });
            } else if (dataValue === 'size') {
                // Display number of files and size of cache.
                that.ShowStatus("Calculating map cache size ...", false); // false => not an error.
                map.CacheSize(function (nFiles, nBytes) {
                    var sMBytes = (nBytes / 1000).toFixed(2);
                    var sMsg = "Map cache contains:\n{0} files\n{1} MB".format(nFiles, sMBytes);
                    AlertMsg(sMsg);
                    that.ClearStatus();
                });
            }
        }
    };

    // DropDownControl for share state for trail when editing a trail.
    parentEl = document.getElementById('editDefineShare');
    var selectShareDropDown = new ctrls.DropDownControl(parentEl, "selectShareDropDown", "Share", 'public', "img/ws.wigo.dropdownicon.png");
    var selectShareDropDownValues = [['public', 'Public'], ['private', 'Private']];
    selectShareDropDown.fill(selectShareDropDownValues);
    selectShareDropDown.onListElClicked = function(dataValue) {
        var fsm = that.fsmEdit();
        fsm.setPathChanged();
        fsm.DoEditTransition(fsm.eventEdit.ChangedShare);
    };

    // DropDownControl for share state for trail when recording a trail.
    var recordShare = parentEl = document.getElementById('recordShare');  
    var selectRecordShareDropDown = new ctrls.DropDownControl(parentEl, "selectRecordShareDropDown", "", 'private', "img/ws.wigo.dropdownhorizontalicon.png");
    selectRecordShareDropDown.fill(selectShareDropDownValues);
    //NotNeeded selectRecordShareDropDown.onListElClicked = function(dataValue) {
    //NotNeeded };
    
    // DropDownCpmtrol for selectiong point action when editing a trail
    parentEl = document.getElementById('editDefinePtAction');
    var selectPtActionDropDown = new ctrls.DropDownControl(parentEl, "selectPtActionDropDown", "Pt Action", "", "img/ws.wigo.dropdownicon.png")
    selectPtActionDropDown.onListElClicked = function(dataValue) {
        var nValue = Number(dataValue);
        fsmEdit.DoEditTransition(nValue);
    };

    var objScrollableListBase = new ctrls.ScrollableListBase(); 
    // Composite control for displaying history of recorded stats. 
    // Constructor args:
    //  view: ref to wigo_ws_View object.
    //  ctrlIds: {holderDivId: 'divRecordStatsHistory', // id of holder div for the stats list.
    //            editDivId: 'divRecordStatsEdit1', // id of div for editing stats times. 
    //            // Controls composing the editing div follow:
    //              dateId: 'dateRecordStats', // id of input, type=date 
    //              timeId: 'timeRecordStats', // id of input, type=time
    //              distanceId: 'numRecordStatsDistance', // id of input, type=number
    //              distanceUnitId: 'spanRecordStatsDistanceUnit', // id of span.  
    //              bEnglishUnit: true, // boolean. true indicates English for miles, false indicates Metric, km.
    //              runTimeMinsId: 'minsRecordStatsRunTime', // id of input, type=number. 
    //              runTimeSecsId: 'secsRecordStatsRunTime', // id of input,type=number.
    //              doneId: 'buRecordStatsEditDone', // id of button.
    //              cancelId:'buRecordStatsEditCancel'}. 
    //            Optional, Defaults to values shown. Identifies controls composing this control.
    // Note: The stats list and its header are created within the holder div when this object is contructed.
    //       The holder div html must contain the editing div and its child controls.
    //       When the editing div is shown, the stats list and its header are hidden, and vice versa.
    // Class Names for CSS Formatting
    //  stats_history_header     -- div for header row.
    //  holderStatsHistoryMenu   -- cell in header row for drop down menu.
    //  stats_history_month      -- cell in header row for month.
    //  stats_history_year       -- cell in header row year.
    //  stats_history_list       -- div for list of items.
    function RecordStatsHistory(view, ctrlIds) {
        // Initialize to begin showing stats history.
        // Arg:
        //  nShrinkPels: number, optional. number of pels to reduce calculated height.
        //               Defaults to 0.
        this.open = function(nShrinkPels) {
            // Ensure no items are displayed (marked) as selected because selected indicates to be deleted.
            // Note: Do NOT hide map-canvas because it would cause problem when returning from stats history view.
            this.clearSelections(); 
            ShowRecordStatsEditDiv(false);  // Hide stats item edit div. 
            ShowRecordStatsMetricsDiv(false); // Hide stats metrics report div. 
            ShowElement(holderDiv, true);
            this.showMonthDate(); 
            this.setListHeight(stats, titleHolder.offsetHeight); 
            // Set item editor to fill screen so touching map is not a problem.
            itemEditor.setHeight(titleHolder.offsetHeight); 
        };

        // Ends showing stats history.
        this.close =function() {
            this.clearSelections();
            ShowRecordStatsEditDiv(false);
            ShowRecordStatsMetricsDiv(false); // Hide stats metrics report div. 
            ShowElement(holderDiv, false);
            // Note: Do NOT show map-canvas because it must not be hidden to avoid problem when returning from stats history view.
        };

        // Set body mass.
        // Arg:
        //  kgMass: number. body mass in kilograms.
        this.setBodyMass = function(kgMass) {
            itemEditor.kgBodyMass = kgMass;
        };

        // Set calorie burned conversion efficiency.
        // Arg:
        //  cce: number. The calorie conversion efficiency.
        this.setCaloriesBurnedEfficiency = function(cce) {
            itemEditor.calorieConversionEfficiency = cce;
        };

        // Set month/year in header to date.
        // Arg:
        // date: integer or Date object. For an integer, Date object value in milliseconds.
        this.setMonthYear = function(date) {
            if (typeof(date) === 'number') {
                date = new Date(date); 
            }
            if (!(date instanceof Date))
                throw new Error("StatsHistory.setDate() arg must be a valid Date.");
            
            // Get year and month for the date.
            var year = date.getFullYear();
            var month = date.toLocaleString('en-US', { month: "long" });
            //Display year and month.
            yearDiv.innerHTML = year.toFixed(0); 
            monthDiv.innerHTML = month;
        };

        // Returns number of stats items in the list.
        // Note: length of list is greater than item count because of separator rows.
        this.getItemCount = function() {
            return itemCount;
        };

        // Finds stats data for a stats item in the list.
        // Returns wigo_ws_GeoTrailRecordStats obj for the data.
        // Arg:
        //  idItemDiv: string. id of the stats item div in the list.
        this.getItemData = function(idItemDiv) { 
            let recStats = null;
            let itemDiv = document.getElementById(idItemDiv);
            if (itemDiv) {
                let timestamp = itemDiv.getAttribute('data-timestamp');
                if (timestamp) {
                    timestamp = Number(timestamp);
                    recStats = view.getRecordStats(timestamp);
                }
            }
            return recStats;
        }

        // Clears all the div rows in this list and initializes for an empty list.
        this.clearStatsItems = function() { 
            RemoveAllStatsRows(); 
        };

        // Updates this list from an array of wigo_ws_GeoTrailRecordStats objects.
        // Note: Updates efficiently. Only adds items new items at end of arRecStats.
        this.update = function() { 
            // Add stats items that are not aready in this list.
            var arRecStats = view.onGetRecordStatsList();
            if (!arRecStats)
                return; // Quit if arRecStats is not defined or is null.

            //AddTestItems(arRecStats, 10);  // Only for debug. Add 10 test items before oldest item, which is element 0.
            var recStats;
            if (itemCount === 0) {
                // Update the display for all the stats items in arRecStats.
                for (var i=itemCount; i < arRecStats.length; i++) {
                    recStats = arRecStats[i];
                    AddStatsItem(recStats);
                }
            } else {
                var recordStatsXfr =  view.onGetRecordStatsXfr(); // 
                // Update for the display only for the queued rec stats items.
                recStats = arStatsUpdate.next();
                while (recStats) {
                    AddStatsItem(recStats);
                    // Reduce the upload needed timestamp if necessary.
                    recordStatsXfr.reduceUploadTimeStamp(recStats.nTimeStamp);
                    recStats = arStatsUpdate.next();
                }
            }
            // Clear the stats update queue.
            arStatsUpdate.clear();
        };

        // Reloads this list of items from localStorage.
        this.reload = function() { ////20180727 added
            itemCount = 0;
            let arRecStats = view.onGetRecordStatsList();
            // Set arRecStats to empty array if it is null or undefined.
            if (!arRecStats)
                arRecStats = []; 
            
            // Update the display for all the stats items in arRecStats.
            let recStats; 
            for (var i=itemCount; i < arRecStats.length; i++) {
                recStats = arRecStats[i];
                AddStatsItem(recStats);
            }
        }

        // Queues stats to a list updates to be displayed.
        // Arg:
        //  stats: wigo_ws_GeoTrailRecordStats obj. the stats to queue.
        this.queueStatsUpdateItem = function(stats) { 
            arStatsUpdate.add(stats);
        };

        // Uploads to server record stats items that have been added since last upload.
        // Synchronous Return: boolean. 
        //      true indicates upload started. 
        //      false indicates upload is not needed or upload failed to start.          
        // Asynchronous Completion: If an uploaded is started, the completion is asynchronous
        // Note: Iff upload is needed, shows status message for the result.
        //       User must be signed in for upload to success.
        this.uploadAdditions = function() { 
            // Upload updated stats items to server if needed and if user is signed in.
            var bStarted = false;
            var recordStatsXfr = view.onGetRecordStatsXfr();
            var arUploadRecStats = recordStatsXfr.getRecordStatsUploadNeeded();
            if (arUploadRecStats.length > 0) {
                if (view.getOwnerId()) {
                    var nUploadTimeStamp = arUploadRecStats[0].nTimeStamp; // Note: arUploadRecStats[0].nTimeStamp is most recent (greatest).
                    bStarted = recordStatsXfr.uploadRecordStatsList(arUploadRecStats, function(bOk, sStatus) { 
                        if (bOk) { 
                            recordStatsXfr.setUploadTimeStamp(nUploadTimeStamp);
                        }
                        var sMsg = bOk ? "Uploaded {0} RecordStats item(s).".format(arUploadRecStats.length) : 
                                        "Upload failed for {0} Record Stats items.<br/>{1}".format(arUploadRecStats.length, sStatus +
                                        "You may need to Sign-in (View > Sign-in/off) so that uploading is allowed.");
                        view.ShowStatus(sMsg, !bOk);
                    }); 
                } else {
                    view.ShowStatus("To upload recent stats, first sign-in (View > Sign-in/off, Sign-in > Facebook).", false);
                }
            } 
            return bStarted;
        };

        // Shows month/date for first item visible in the list.
        // Note: this control must be visible.
        this.showMonthDate = function() {
            // Set month date of first visible item in the list.
            // Equivalent to processing done for scrolling completed.
            OnScrollComplete(stats.listDiv.scrollTop, 0);
        };

        // Deselects the items in the stats list that are selected.
        // Note: The selected background color is removed for the selected items.
        this.clearSelections = function() {
            let arId = Object.keys(itemsSelected);
            for (let i=0; i < arId.length; i++) {
                SelectItem(arId[i], false);
            }
            // Empty the itemsSelected obj since no items are selected.
            itemsSelected = {}; // Empty the list 
        };

        // Sets height of list. Needs to be set for scrolling to occur.
        // Args:
        //  nShrinkPels: number, optional. number of pels to reduce calculated height..
        //               Defaults to 0.
        // Note: Calculates list height = height of body - nShrinkPels.
        // Note: Base class function in prototype chain, ScrollableListBase obj.
        // this.setListHeight = function(nShrinkPels){..};
        
        // Returns true is editing stats div is active.
        this.isEditingStatsActive = function() {
            var bYes = IsElementShown(editDiv);
            return bYes;
        };

        // Private members
        var that = this;
        // Handler for scroll completed event.
        // Sets (displays) month/date for first item visible in the list.
        function OnScrollComplete(pxScrollTop, nScrollEventCount) {
            // Find first item in list that is visible.
            let prevRowOffsetTop = 0;
            for (var i=0; i < stats.listDiv.children.length; i++) {
                var row = stats.listDiv.children[i];
                var timestamp = row.getAttribute('data-timestamp');
                // Note: timestamp is null for separator div.
                if (timestamp && row.offsetTop + row.offsetHeight > stats.listDiv.scrollTop) { 
                    // Found first visible item.
                    // Set scroll top of list to top of first visbile item.
                    // Display month, date in header for first visible item.
                    that.setMonthYear(Number(timestamp)); 
                    break;
                } else {
                    prevRowOffsetTop = row.offsetTop;
                }
            }
        }

        // Click event handler for cell in an item.
        // Indicates the item is to selected by dimming backgroud of row.
        function OnSelectItem(event) {
            if (event.target instanceof HTMLElement) {
                let itemDiv = event.target.parentElement;
                let nMoreCount = 5; // Safety count for looping.
                while (itemDiv && nMoreCount > 0) {
                    nMoreCount--; 
                    if (itemDiv.classList.contains('stats_item')) {
                        itemDiv.classList.toggle('stats_item_select');
                        let nTimeStamp = parseInt(itemDiv.getAttribute('data-timestamp'), 10);
                        if (isNaN(nTimeStamp))
                            nTimeStamp = 0; 
                        ToggleSelectedItem(itemDiv.id, nTimeStamp); 
                        nMoreCount = 0;
                        break;
                    } else {
                        itemDiv = itemDiv.parentElement;
                    }
                }
            }
        }

        // Add a stats item to the list keeping the list in descending display order of timestamps.
        // The most recent is at the top of the list. List element at index 0 is the top item.
        // Arg:
        //  recStats: wigo_ws_GeoTrailRecordStats object. Contains stats info for item to add to list.
        //            If recStats.nTimeStamp is the same as for an existing item in the list, the item 
        //            is replaces.
        // Notes: 
        // Class names for formatting stats item:
        //  stats_history_title - div for title, iff title is given in constructor.
        //  stats_item -- row for the stats item cells.
        //  stats_date - cell for date and time.
        //      stats_time       - start time, eg 01:15 pm
        //      stats_month_day  - day of month, eg 19
        //      stats_week_day   - day of week, eg Wed
        //  stats_distance_time - distance in english or metric units and runtime in mins:secs.
        //  stats_speed_calories - speed in english or metreic units and calories.
        // Class names for formatting stats month, year row separator:
        //  stats_separator:  - row for the stats separator, eg December 2017
        function AddStatsItem(recStats) {  
            // Helper to insert row div to this list.
            // Arg:
            //  ixAt: integer: insertion is before stats.listDiv.children[ixAt].
            //  row: HTML Div Element. the row div to insert in stats.listDiv.children[]
            //  Note: if ixAt div is out of range for stats.listDiv.children[], row is append.
            function InsertRowDiv(ixAt, rowDiv) {  
                if (ixAt >= 0 && ixAt < stats.listDiv.children.length) {
                        stats.listDiv.insertBefore(rowDiv, stats.listDiv.children[ixAt]); 
                } else {
                    stats.listDiv.appendChild(rowDiv); 
                }
            }
            
            // Compares compares two dates to see if month and year of each date are the same.
            // Ars:
            //  dt1: Date object or number for date timestamp in milliseconds.
            //  dt2: Date object or number for date timestamp in milliseconds.
            // Returns: boolean. true if dates are the same.
            function IsMonthYearSame(dt1, dt2) {
                if (typeof dt1 === 'number') 
                    dt1 =  new Date(Number(dt1));
                if (typeof dt2 === 'number') 
                    dt2 = new Date(Number(dt2));
                var bSame = dt1.getMonth() === dt2.getMonth() && dt1.getFullYear() === dt2.getFullYear();
                return bSame;
            }


            // Returns true if a row is a separation header.
            // Arg:
            //  row: HTML Div element. the row to check.
            function IsSeparatorDiv(row) {
                var bYes = row.classList.contains('stats_separator');
                return bYes;
            }

            // Inserts a separator div before an item row div.
            // Arg: 
            //  ixAt: integer. index of item row before which the separator div is inserted.
            //        The separator div shows the month and year of the item row div.
            // Returns: integer. the index of the inserted separator div.
            function InsertSeparatorDiv(ixAt) {
                while (ixAt - 1 >= 0 && IsSeparatorDiv(stats.listDiv.children[ixAt-1])) {
                    stats.listDiv.removeChild(stats.listDiv.children[ixAt-1]);
                    ixAt--;
                }

                var row = stats.listDiv.children[ixAt];
                var separatorTimeStamp = row.getAttribute('data-timestamp');
                if (separatorTimeStamp.length > 0) {
                    var dt = new Date(Number(separatorTimeStamp));
                    var separator = that.create('div', null, 'stats_separator');
                    separator.innerHTML = "{0} {1}".format(dt.toLocaleString('en-US', {month: 'long'}),
                                                           dt.toLocaleString('en-US', {year: 'numeric'}));
                    InsertRowDiv(ixAt, separator);
                }
                return ixAt;
            }

            // Create item div. 
            var dt = new Date(recStats.nTimeStamp); 
            var item = that.create('div', null, 'stats_item');
            item.setAttribute('data-timestamp', recStats.nTimeStamp.toFixed(0));
            item.setAttribute('data-distance', recStats.mDistance); 
            var cellDate = that.create('div', null, 'stats_date');
            cellDate.addEventListener('click', OnSelectItem, false); // Add click handler to indicate item is to be deleted.
            item.appendChild(cellDate);

            var cellDistanceRunTime = that.create('div', null, 'stats_distance_time');    
            item.appendChild(cellDistanceRunTime);
            var cellSpeedCalories = that.create('div', null, 'stats_speed_calories');  
            item.appendChild(cellSpeedCalories);

            // Display date, example: // 01:30 PM, 10,  Fri  Note: month shown at top of list or by separator. 
            // Display date cell.
            var sTime = dt.toLocaleTimeString('en-US', {hour: "2-digit", minute: "2-digit"});
            var sMonthDay = dt.toLocaleString('en-US', {day: '2-digit'});
            // var sMonth = dt.toLocaleString('en-US', {month: 'short'});
            var sWeekDay = dt.toLocaleString('en-US', {weekday: 'short'});
            cellDate.innerHTML = "<span class='stats_time'>{0}</span><span class='stats_month_day'>{1}</span><span class='stats_week_day'>{2}</span>".format(sTime, sMonthDay, sWeekDay);    
            // Display display distance, runtime cell and speed, calories cell.
            var sDistance = lc.to(recStats.mDistance);
            let runTime = new HourMinSec(recStats.msRunTime); 
            var sSpeed = lc.toSpeed(recStats.mDistance, recStats.msRunTime/1000).text; // speed in metric or english units.            
            var sCalories = recStats.caloriesBurnedCalc.toFixed(0);
            cellDistanceRunTime.innerHTML = "{0}<br/>{1}".format(sDistance, runTime.getStr()); 
            cellSpeedCalories.innerHTML = "{0}<br/>{1} cals".format(sSpeed, sCalories);
            
            // Search for insertion location.
            var row;
            var nRowTimeStamp = null;
            var ixAt = stats.listDiv.children.length; // Set later to exact index at which to insert item.
            var bReplaced = false;
            var bSepartorNeeded = false;
            for (var i=0; i < stats.listDiv.children.length; i++) {
                row = stats.listDiv.children[i]; 
                if (IsSeparatorDiv(row)) {
                    // Ignore separator div.
                    continue;
                }
                nRowTimeStamp = Number(row.getAttribute('data-timestamp')); 
                if (recStats.nTimeStamp >= nRowTimeStamp) { 
                    if (recStats.nTimeStamp === nRowTimeStamp) {
                        // Replacement point found.
                        bReplaced = true; 
                        // Remove existing node and insert its replacement next.
                        stats.listDiv.removeChild(row);
                        InsertRowDiv(i, item);
                        // Note: no need to check for month separator header for replacement.
                    } else {
                        // Insertion point found.
                        ixAt = i;
                    }
                    break;
                }
            }

            if (!bReplaced) {
                // Check if a month separator header is needed for row at insertion index.
                // Note: this checks if a separator div is needed after the item.
                var bSameMonthYear =  nRowTimeStamp === null || IsMonthYearSame(dt, nRowTimeStamp);
                if (ixAt >= 0 && ixAt < stats.listDiv.children.length) {
                    if (!bSameMonthYear) {
                        // Need a separator div because month has changed between item and row at insertion.
                        ixAt = InsertSeparatorDiv(ixAt);
                        // Note: ixAt is now ix of separator div, which is correct.
                    } 
                }
                
                // Insert the item.
                InsertRowDiv(ixAt, item);
                // Note: ixAt is now the index of item row.

                if (!bSameMonthYear) {
                    // Check if a month separator is needed before the item row just inserted.
                    var ixBefore = ixAt - 1;
                    var rowBefore = null;
                    // Skip over any previous separator div (there should not be any to skip over).
                    while (ixBefore >= 0) {
                        rowBefore = stats.listDiv.children[ixBefore];
                        if (IsSeparatorDiv(rowBefore)) {
                            ixBefore--
                            continue;
                        }
                        break;
                    }
                    if (rowBefore) { 
                        var nRowBeforeTimeStamp = Number(rowBefore.getAttribute('data-timestamp')); 
                        if (!IsMonthYearSame(dt, nRowBeforeTimeStamp)) {
                            // Separator div is needed before the item row.
                            // Insert the separator div.
                            ixAt = InsertSeparatorDiv(ixAt);
                            // Note: ixAt is now ix of separator div, which is correct.
                        } 
                    }
                }
                itemCount++;
            }
        }

        // Object for list stats items that need to added the stats history list display.
        function StatsUpdateAry() { 
            // Adds a stats to the list of updates.
            // If stats.nTimeStamp already exists in the list, the list element is replaced;
            // otherwise the stats is added to the top (end) of the list.
            // The list is kept in ascending order of timestamps
            // Arg:
            //  stats: wigo_ws_GeoTrailRecordStats obj. The stats to add to the list.
            this.add = function(stats) {
                for (var i=arStats.length-1; i >= 0; i--) {
                    if (stats.nTimeStamp > arStats[i]) {
                        arStats.splice(i, 0, stats);
                        break;
                    } else if (stats.nTimeStamp === arStats[i].nTimeStamp) {
                        arStats[i] = stats;
                        break;
                    }
                }
                if (i < 0) {
                    // Add stats to top (end) of the array.
                    arStats.push(stats);
                }
            };

            // Gets next element of the list in order from least timestamp to greatest timestamp (most recent).
            // Returns: wigo_ws_GeoTrailRecordStats obj. the next stats element in the list.
            //          null. There is no next element to get.
            this.next = function() {
                var stats = null;
                if (iNext >= 0 && iNext < arStats.length) {
                    stats = arStats[iNext];
                    iNext++;
                }
                return stats;
            };

            // Clears the list.
            this.clear = function() {
                arStats.splice(0); // remove all the elements.
                iNext = 0;
            }

            // ** Private Members
            var arStats = []; // List of wigo_ws_GeoTrailRecordStats objs.
            var iNext = 0;   // Index for getting next element of arStats.
        }
        var arStatsUpdate = new StatsUpdateAry();

        // Adds items to the list in order to test changing from month to month.
        // Only for debug. Delete when no longer needed.
        // Args:
        //  arRecStats: array of wigo_ws_GeoTrailRecordStats objs. array for which test item are inserted at top of array.
        //  nItemsToAdd: number of test items to add.
        var bTestItemsAdded = false;
        function AddTestItems(arRecStats, nItemsToAdd) {
            if (bTestItemsAdded) {
                return; // Only do once.
            }
            bTestItemsAdded = true;

            // Add items each 12 days apart from latest item in the list from date before the latest item.
            // Note: latest item is arRecStats[0]. The newest item is at the end of the list.
            var msDays = 12 * 24 * 60 * 60 * 1000; // number of days to inscrement insert items in milliseconds.
            var stats0 = arRecStats.length > 0 ? arRecStats[0] : new wigo_ws_GeoTrailRecordStats();
            stats0.msRunTime = 59510; // Test for seconds > 59.5 seconds.
            for (let i=0; i < nItemsToAdd; i++) {
                let stats = new wigo_ws_GeoTrailRecordStats();
                stats.nTimeStamp = stats0.nTimeStamp - msDays;
                stats.msRunTime = stats0.msRunTime + 2000 + 123 * 60 * 1000; 
                stats.mDistance = stats0.mDistance + 100; 
                stats.caloriesKinetic = stats0.caloriesKinetic + 11;      
                stats.caloriesBurnedCalc = stats0.caloriesBurnedCalc + 12;   
                arRecStats.unshift(stats); // Insert at beginning of list.
                stats0 = stats;  
            }
        }

        // List of items selected.
        // Each Properties is an id of an item div in the stats list.
        //  Value of each property: {nTimeStamp: number, bSelected: boolean} obj.
        //      nTimeStamp: number. Timestamp in milliseconds, which is unique, for element.
        //      bSelected: boolean. True to indicate element is selected. 
        // Note: A property can be selected and later deselected.
        var itemsSelected = {}; 
       
        // Toggles selected for an element in itemsSelected if it exists,
        // otherwise add the added to itemsSelected as selected.
        // Arg:
        //  id: string. id of the item div to be selected in var itemsSelected.
        //  nTimeStamp: number. timestamp in milliseconds for selected item.
        function ToggleSelectedItem(id, nTimeStamp) {
            let selectedItem = itemsSelected[id];
            if (selectedItem) {
                // Delete property from itemsSelected.
                delete itemsSelected[id];
            } else {
                // Add property to itemsSelected.
                itemsSelected[id] = nTimeStamp;
            }
        }

        // Select an item in the stats list.
        // Arg:
        //  id: string. id of item div to select.
        //  bSelect: boolean. true to select the item, false to deselect.
        // Note: Sets the class for the item div. The class name 
        //       is used to determine the background color of the item div.
        function SelectItem(id, bSelect) {
            let itemDiv = document.getElementById(id);
            if (itemDiv) {
                if (bSelect)
                    itemDiv.classList.add('stats_item_select');
                else
                    itemDiv.classList.remove('stats_item_select');
            }
        };
        
        // Deletes stats item from list being displayed.
        // Arg:
        //  id: string. html id of stats item div to delete.
        function DeleteItem(id) {
            let statsDiv = document.getElementById(id);
            if (statsDiv && statsDiv.parentElement) {
                statsDiv.parentElement.removeChild(statsDiv);
                itemCount--;  
            }
        }

        // Search list of stats items for item identified by a timestamp.
        // Returns HTMLElement for a div. ref to stats item div if found, otherwise null.
        // Arg:
        //  sTimeStamp: string. data-timestamp attribute value for the stats item to find.
        function FindStatsItem(sTimeStamp) { 
            let itemDiv, itemDivFound = null;
            let msData;
            for (let i=0; i < stats.listDiv.children.length; i++) {
                itemDiv = stats.listDiv.children[i];
                if (!itemDiv.classList.contains('stats_item'))
                    continue; // Skip row in list that is not a stats items.
                if (sTimeStamp === itemDiv.getAttribute('data-timestamp')) {
                    itemDivFound = itemDiv;
                    break;
                }
            }
            return itemDivFound;
        }

        // Removes all the div rows from the stats list, which includes
        // all the stats items and the separator rows.
        function RemoveAllStatsRows() {
            // Ensure all selections are cleared first.
            that.clearSelections();
            // Remove all the child html elements from the stats list.
            let rowDiv;
            while(stats.listDiv.children.length > 0) {
                stats.listDiv.removeChild(stats.listDiv.children[0]);
            }
            itemCount = 0; 
            stats.listDiv.scrollTop = 0; 
            curMonthYear.reset(); 
        }

        // Event handler for Done button on edit div.
        function OnEditDone(event) {
            // Helper to check if two dates are the same, ignoring seconds and millisecond component.
            // Returns true if same.
            // Arg:
            //  msTimeStamp1: number. timestamp in milliseconds for date1 to compare with date2.
            //  msTimeStamp2: number. timestamp in milliseconds for date2 to compare with date1.
            // Note: Check year, month, day, hour, minute.
            //       The seonds and milliseconds components are not checked because
            //       they are not given as editor controls.
            function IsSameDate(msTimeStamp1, msTimeStamp2) {
                let date1 = new Date(msTimeStamp1);
                let date2 = new Date(msTimeStamp2); 
                let bSame = date1.getFullYear() === date2.getFullYear() &&
                            date1.getMonth() === date2.getMonth() &&
                            date1.getDate() === date2.getDate() &&
                            date1.getHours() === date2.getHours() &&
                            date1.getMinutes() === date2.getMinutes();
                return bSame;
            }

            // Helper to update localStorage for itemData.
            function UpdateLocalStorage() {
                // Timestamp for itemData to add is unique.
                // Set itemData in localStorage.
                view.onSetRecordStats(itemData);
                // Clear the stats list by removing all html child elements.
                RemoveAllStatsRows();
                // Get the new array of stats data recs from localStorage and
                // update (display) the stats list.
                that.update(); 
                that.showMonthDate(); 

                // Update the record stats metrics.
                recordStatsMetrics.init(view.onGetRecordStatsList());  
            }

            // Helper to make a copy of RecordStats obj.
            function NewRecordStatsObj(other) {
                var stats = new wigo_ws_GeoTrailRecordStats();
                wigo_ws_GeoTrailRecordStats.Copy(stats, other);
                return stats;
            }

            // Helper to do async upload of itemData to server.
            // Iff upload is successful, updates itemData in localStorage.
            function DoUpload() {
                // upload the new item to server.
                var bStarted = recordStatsXfr.uploadRecordStatsList([itemData], function(bOk, sStatus) {
                    if (bOk) {
                        UploadCompleted();
                    } else {
                        var sMsg = "Failed to upload stats item to server: {0}".format(sStatus);
                        view.ShowStatus(sMsg);
                    }
                });
                if (!bStarted) {
                    var sMsg = "Failed to start uploading stats items to server:<br/>{0}";
                    view.ShowStatus(sMsg);
                }
            }

            // Delete old stats item from server and from localStorage..
            // Then iff update stats items at server and in localStorage.
            function DoDeleteAndUpload() {
                // Delete the old item at server.
                var arUploadDelete = [];  
                arUploadDelete.push(new wigo_ws_GeoTrailTimeStamp(nDeleteItemTimeStamp)); 
                var bStarted = recordStatsXfr.deleteRecordStatsList(arUploadDelete, function(bOk, sStatus) { 
                    if (bOk) {
                        // Delete the item from localStorage.
                        view.onDeleteRecordStats({0: nDeleteItemTimeStamp}); 
                        // upload the new item to server.
                        DoUpload(); 
                    } else {
                        var sMsg = "Failed to delete old stats item at server: {0}".format(sStatus);
                        view.ShowStatus(sMsg);
                    }
                });
                if (!bStarted) {
                    var sMsg = "Failed to start deleting old stats items from server:<br/>{0}";
                    view.ShowStatus(sMsg);
                }
            }
            
            // Helper function called after successful upload to server.
            function UploadCompleted() { 
                // Update local storage, the stat history list, and stats metrics.
                if (bChanged) {
                    UpdateLocalStorage();
                    var sMsg = bAdd ? "Successfully Added stats item." : "Successfully Edited stats item."; 
                    view.ShowStatus(sMsg, false);                                                    
                }
            }

            // Quit if stats item controls are not all valid.
            if (!itemEditor.areCtrlsValid()) {
                return; // Note that a status error has been displayed.
            }

            // Hide the editor's div.
            ShowRecordStatsEditDiv(false); 
            // Get the edited item data from the editor.
            let nDeleteItemTimeStamp = null; // timestamp of item data to delete.
            let itemData = itemEditor.getEditData();
            let bAdd = !itemEditor.bEditing;
            let bChanged = false; 
            let originalItemData = itemEditor.getOriginalItemData(); // Get ref to original itemData before it was edited. 
            if (itemEditor.bEditing && originalItemData) {  
                // Check if timestamp has been changed.
                bChanged = false;  
                if (!itemEditor.isSpeedChanged()) {  
                    // Set calorie fields from the original data item because
                    // the speed has not changed. The item data from controls has estimated 
                    // the calorie fields, so want to replace these fields.
                    itemData.caloriesKinetic = originalItemData.caloriesKinetic;
                    itemData.caloriesBurnedCalc = originalItemData.caloriesBurnedCalc;
                } else {
                    bChanged = true;
                }
                let bSameDate = IsSameDate(originalItemData.nTimeStamp, itemData.nTimeStamp);
                if (bSameDate) {
                    // Date entered has not changed. Use timestamp in milliseconds from original data.
                    // timestamp is key for finding the element to update so must match original date exactly.
                    itemData.nTimeStamp = originalItemData.nTimeStamp;
                } else {
                    // Date entered by user has changed. 
                    // Therefore delete original item from data and add new item.
                    bChanged = true;
                    bAdd = true; // Add a new stats item to local data below.
                    nDeleteItemTimeStamp = originalItemData.nTimeStamp; 
                }
            }
            if (bAdd) { 
                let itemFound = FindStatsItem(itemData.nTimeStamp.toFixed(0));
                // Adding new stats item. nTimeStamp of new stats item must be unique.
                for (let i=0; itemFound && i < 100; i++) {
                    itemData.nTimeStamp++; // Increment timestamp by one millisecond to make it unique.
                    itemFound = FindStatsItem(itemData.nTimeStamp.toFixed(0));
                    if (!itemFound) {
                        // Now itemData.nTimeStamp is unique.
                        break;
                    }
                }
                if (!itemFound) {
                    bChanged = true;
                } else {
                    AlertMsg("Failed to save item data!");
                    return; 
                }
            }

            var recordStatsXfr = view.onGetRecordStatsXfr();
            // Delete stats item data at server if need be.
            if (nDeleteItemTimeStamp) { 
                // Delete the old item at server and iff ok, delete locally.
                // Then iff ok, upload edited item  to server and iff ok, save locally.
                DoDeleteAndUpload();
            } else {
                if (bChanged) {
                    // Upload change to server and then, iif ok, save to localStorage. 
                    DoUpload();
                }
            }
        }

        // Event handler for Cancel button on edit div.
        function OnEditCancel(event) {
            ShowRecordStatsEditDiv(false); 
        }

        // Deletes stats items given by var itemsSelected from the list being displayed.
        function DeleteSelections() {
            let arId = Object.keys(itemsSelected);
            for (let i=0; i < arId.length; i++) {
                DeleteItem(arId[i]);
            }
            // Empty the itemsSelected obj since no items are selected.
            itemsSelected = {}; // Empty the list 
        }

        // Get a list of stats items to be deleted from server.
        // Returns: array of wigo_ws_GeoTrailTimeStamp objs. 
        //          the deletion list for server wigo_ws_GeoPathsRESTfulApi(), DeleteRecordStatsList(..) method.
        function GetServerDeleteSelections() { 
            var arServerDelete = [];
            let arId = Object.keys(itemsSelected);
            let nTimeStamp = 0;
            let itemDiv = null;
            for (let i=0; i < arId.length; i++) {
                // arId[i] is ith property name (string) of the div id for a selected row in the RecordStatsHistory list.
                itemDiv = document.getElementById(arId[i]);
                if (itemDiv) {
                    nTimeStamp = Number(itemDiv.getAttribute('data-timestamp'));
                    arServerDelete.push(new wigo_ws_GeoTrailTimeStamp(nTimeStamp));
                }
            }
            return arServerDelete;
        }

        // Handler for keydown event for various controls.
        // Arg:
        //  event: KeyboardEvent obj. keyboard event from an input control.
        function OnKeyDown(event) {
            let bEnterKey = IsEnterKey(event);
            if (bEnterKey) {
                // Remove software keyboard.
                event.target.blur();
            }
        }

        // Helper object for converting milliseconds to hours, minutes, and seconds.
        // Arg:
        //  msRunTime: number. milliseconds to convert to hours, mins, and seconds, and a suffix.
        function HourMinSec(msRunTime) {
            var runTimeHoursFloor = 0; 
            var runTimeMins = msRunTime /(1000 * 60);
            var runTimeMinsFloor = Math.floor(runTimeMins)
            var runTimeSecs = (runTimeMins - runTimeMinsFloor)*60; // Convert fractional minute to seconds.
            if (Math.round(runTimeSecs) >= 60) {
                // runTimeSecs rounds to 60, so increment mins and set secs to 0.
                runTimeSecs = 0;  
                runTimeMinsFloor++;
            }
            while (runTimeMinsFloor >= 60) {  
                runTimeMinsFloor -= 60;
                runTimeHoursFloor++;
            }
            
            // Helper to pad a string with leading zero(s) if padding is needed.
            // Returns: padded string.
            // Arg:
            //  str: string. string to pad with leading zero(s).
            //  nMinLen: number. number of zero char(s) prepended to str until str.length reaches nMinLen.
            //           If str.length >= nMinLen, str is not changed.
            function ZeroPad(str, nMinLen) {
                for (let i = str.length; i < nMinLen; i++) {
                    str = "0" + str;
                }
                return str;
            }

            // Properties.
            this.ms = msRunTime;  // number. total milliseconds for runtime.
            this.hour = runTimeHoursFloor; // number. hour component.
            this.min = runTimeMinsFloor;   // number. minute component.
            this.sec = runTimeSecs;        // number. second component.

            // Returns string for this.sec as two digits.
            this.getSec = function() {
                return ZeroPad(this.sec.toFixed(0), 2);
            };

            // Returns string for this.min as two digits.
            this.getMin = function() {
                return ZeroPad(this.min.toFixed(0), 2);
            };

            // Returns string for total minutes as two digits.
            // Note: total minutes = this.min + 60 * this.hour.
            this.getAllMins = function() {
                let s = ZeroPad((this.min + 60 * this.hour).toFixed(0), 2);
                return s;
            }

            // Returns a string for this.hour.
            this.getHour = function() {
                return this.hour.toFixed(0);
            };

            
            // Returns a string for hours, mins, secs of this object.
            // Format of returned string has two possibilities:
            //      n:nn:nn h:mm:ss  (hours, minutes, seconds when this obj is >= one hour.
            //      nn:nn m:s        (minutes, seconds when this obj is < one hour.)
            this.getStr = function() {
                let s;
                if (this.hour <= 0) {
                    s = "{0}:{1} m:s".format(this.getMin(), this.getSec());
                } else {
                    s = "{0}:{1}:{2} h:m:s".format(this.getHour(), this.getMin(), this.getSec());
                }
                return s;
            };  

            // Returns string for mins, secs of this object.
            // Hours are added to mins to form returned string.
            // Format of returned string:
            //      nn:nn m:s        (minutes, seconds where hours converted to minutes..)
            this.getMinSecStr = function() {
                let mins = this.min + 60 * this.hour;
                let s = "{0}:{1} m:s".format(ZeroPad(mins, 2), this.getSec());
                return s;
            };
        }

        // Object for displaying stats metrics.
        // ScrollableListBase is the base class. 
        // Use this.setListHeight(nShrinkPels) to set the scroll height for the list.
        // Class Names for CSS Formatting: 
        //  RecordStatsMetricsReport  -- title div
        //  RecordStatsMetricsReportCloseDiv -- div for Close button
        //  RecordStatsMetricsReportCloseBtn -- close button
        //  StatsMetricsReportSectionHeader -- section div
        //  StatsMetricsReportLine -- line div under a section.
        //  StatsMetricsReportLabel -- span for label in line div.
        //  StatsMetricsReportValue -- span for value in line div.
        function StatsMetricsReport() { 
            // Fills the report based on the recordStatsMetrics obj.
            this.fill = function() {
                var sDistGoal = lc.to(recordStatsMetrics.getDistanceGoalPerDay()); 

                // Add line to report list under last 30 days header.
                // Returns: {item: div, label: span, value: span} object. See InsertLineAfter(..) function.
                // Arg:
                //  afterItem: HTML Div obj. item in report list after which the monthDayEl is inserted.
                //  monthDayEl: MonthDayEl obj. info for month day to stats metrics report.
                //              See function MonthDayEl() below for properties of a MonthDayEl obj.
                function AddMonthDayLine(afterItem, monthDayEl) {
                    var date = new Date(monthDayEl.nDate);
                    // Convert UTC value of date to local component values.
                    // Note: hour, minute, second, milliseconds of converted date is 12:00:00:000. 
                    // Conversion is probably not necessary, but is done because some times have timezone offsets > 12,
                    // which could throw off determining the correct date without a conversion.
                    date = new Date(date.getTime() + date.getTimezoneOffset()*60*1000); 
                    var sLabel = "{0}: ".format(date.toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', weekday: 'short' })); 
                    var sValue; 
                    if (monthDayEl.nUpdates > 0) {
                        var runTime = new HourMinSec(monthDayEl.msRunTime);
                        var sTimes = monthDayEl.nUpdates > 1 ? " ({0}x)".format(monthDayEl.nUpdates.toFixed(0)) : "";
                        sValue = "{0} at {1} for {2}{3}".format(lc.to(monthDayEl.mDistance),
                                                                 lc.toSpeed(monthDayEl.mDistance, monthDayEl.msRunTime/1000).text,
                                                                 runTime.getStr(),
                                                                sTimes); 
                    } else {
                        sValue = "no recording"; 
                    }
                    return InsertLineAfter(afterItem, sLabel, sValue);  
                }

                // Finds goals met and activity for last 7 days and last 30 days.
                // Returns: {nGoalMet7Days: number, nGoalMet30Days: number, nActivity7Days: number, nActivity30Days: number}
                //      nDistance7Days: number of days daily distance goal was met in last 7 days.
                //      nDistance30Days: number of days daily distance goal was met in last 30 days.
                //      nActivity7Days: number of days there was activity in last 7 days.
                //      nActivity30Days: number of days there was activity in last 30 days.
                // Arg:
                //  arMonthDay: array of MonthDayEl obj. Each obj is info for month day to stats metrics report.
                //              See function MonthDayEl() below for properties of a MonthDayEl obj.
                function FindGoals(arMonthDay) { 
                    var goalsMet = {nDistance7Days: 0, nDistance30Days: 0, nActivity7Days: 0, nActivity30Days: 0};
                    var mDistanceGoal = recordStatsMetrics.getDistanceGoalPerDay();
                    var el;
                    for (var i=0; i < arMonthDay.length; i++) {
                        el = arMonthDay[i];

                        if (el.nUpdates > 0) {
                            goalsMet.nActivity30Days++;
                            if (i < 7) {
                                goalsMet.nActivity7Days++;
                            }

                            if (el.mDistance >= mDistanceGoal) {
                                goalsMet.nDistance30Days++;
                                if ( i < 7) {
                                    goalsMet.nDistance7Days++;
                                }
                            }
                        }
                    }
                    return goalsMet;
                }
                
                // Adds line for a daily distance goal to report list under the goals header.
                // Return: HTML Div obj for the added line.
                // Args:
                //  afterItem: HTML Div obj. item in report list after which a distance goal item is inserted.
                //  nMetDays: number of days distance goal was met.
                //  nTotalDays: number of total days.
                function AddDistanceGoalLine(afterItem, nMetDays, nTotalDays) { 
                    var perCent = nMetDays/nTotalDays*100;
                    var sLine ="Distance goal of {0} met {1} of {2} days ({3}%)".format(sDistGoal, nMetDays.toFixed(0), nTotalDays.toFixed(0), perCent.toFixed(0));
                    return  InsertSimpleLineAfter(afterItem, sLine) 
                }

                // Adds item for a daily distance goal to report list under the goals header.
                // Return: HTML Div obj for the added line.
                // Args:
                //  afterItem: HTML Div obj. item in report list after which a distance goal item is inserted.
                //  nMetDays: number of days distance goal was met.
                //  nTotalDays: number of total days.
                function AddActivityGoalLine(afterItem, nMetDays, nTotalDays) {
                    var perCent = nMetDays/nTotalDays*100;
                    var sLine = "Recorded {0} of {1} days ({2}%)".format(nMetDays.toFixed(0), nTotalDays.toFixed(0), perCent.toFixed(0));
                    return InsertSimpleLineAfter(afterItem, sLine);
                }

                // Returns normalized date as milliseconds.
                // Arg: msDate: number. date in milliseconds to normalize and  return.
                function NormalizedDateMs(msDate) {
                    var date = new Date(msDate);
                    date.setHours(12, 0, 0, 0);
                    return date.getTime();
                }
                
                var recStats = recordStatsMetrics.getCurrent();
                if (!recStats)
                    return; // Should not happen.
                // Current meterics.
                var value = FormDistanceSpeedDate(recStats);
                lineCurrentDistance.value.innerText = value.distance;
                lineCurrentSpeed.value.innerText = value.speed;
                var msToDay =   NormalizedDateMs(Date.now());  
                var msCurDate = NormalizedDateMs(recStats.nTimeStamp); 
                var msDaysAgo = msToDay - msCurDate;
                var msOneDay = 24*60*60*1000;
                var nDaysAgo = msDaysAgo / msOneDay;
                var sDaysAgo = nDaysAgo < 1 ? "today" : nDaysAgo < 2 ? "1 day ago" : "{0} days ago".format(nDaysAgo.toFixed(0));
                lineCurrentDate.value.innerText = "{0} {1}".format(value.date, sDaysAgo);

                // Metrics for last 30 days
                var arMonthDay = recordStatsMetrics.getMonthDays(); 
                var goals = FindGoals(arMonthDay);
                // Goals  
                var inserted;
                // Add activity goals and distance goals for last 7 days and last 30 days.
                inserted = AddActivityGoalLine(headerGoals, goals.nActivity7Days, 7);
                inserted = AddActivityGoalLine(inserted, goals.nActivity30Days, 30)
                inserted = AddDistanceGoalLine(inserted, goals.nDistance7Days, 7);
                inserted = AddDistanceGoalLine(inserted, goals.nDistance30Days, 30);

                // Best Monthly (last 30 days) metrics.
                value = FormDistanceSpeedDate(recordStatsMetrics.getBestMonthlyDistance())
                var sLine = "{0} at {1} on {2}".format(value.distance, value.speed, value.date); 
                lineBestMonthlyDistance.value.innerText = sLine;
                value = FormDistanceSpeedDate(recordStatsMetrics.getBestMonthlySpeed());
                sLine = "{0} over {1} on {2}".format(value.speed, value.distance, value.date); 
                lineBestMonthlySpeed.value.innerText = sLine;

                for (var i=arMonthDay.length-1; i >= 0; i--) {
                    AddMonthDayLine(headerMonthlyMetrics, arMonthDay[i]);
                }

                // Best Metrics ever.
                value = FormDistanceSpeedDate(recordStatsMetrics.getBestDistance());
                sLine = "{0} at {1} on {2}".format(value.distance, value.speed, value.date);
                lineBestDistance.value.innerText = sLine;
                value = FormDistanceSpeedDate(recordStatsMetrics.getBestSpeed());
                sLine = "{0} over {1} on {2}".format(value.speed, value.distance, value.date); 
                lineBestSpeed.value.innerText = sLine;
            };

            
            // Clears the list including the header by removing the div elements.
            this.clear = function() { 
                this.removeList(metrics); // Call base class function.
            };

            // Sets height of list for proper scrolling of the list.
            // Arg:
            //  nShrinkPels: number of pels to reduce calculated height so that list and header fit in body.
            //               Note: header does not scroll, only the list.
            this.setListHeight = function(nShrinkPels) {
                // this.__proto__.setListHeight(metrics, nShrinkPels);  // same as below, but is deprecated.
                Object.getPrototypeOf(this).setListHeight(metrics, nShrinkPels); 
            };

            // Forms string values for distance, speed, and for record stats obj.
            // Arg:
            //  recStats: wigo_ws_GeoTrailRecordStats obj for record stats.
            // Returns: {distance: string, speed: string, date: string}:
            //  distance: string for distance in miles or kilometers based on English or Metric setting.
            //  speed: string for speed in mph or kph based on English or Metric setting.
            //  date: string for date in mm/dd/yyyy format.
            function FormDistanceSpeedDate(recStats) {
                var sDistance = lc.to(recStats.mDistance);
                var oSpeed = lc.toSpeed(recStats.mDistance, recStats.msRunTime/1000);
                var oDate = new Date(recStats.nTimeStamp); 
                return {distance: sDistance, speed: oSpeed.text, date: oDate.toLocaleDateString()};
            }

            // Adds a section header to the report list.
            // Returns: HTMLElement for a div. ref to the div for the section header.
            // Arg:
            //  sHeader: string. text for the header. 
            function AddSectionHeader(sHeader) {
                var item = that.addItem(metrics.listDiv, 0);
                item.className = 'StatsMetricsReportSectionHeader';
                item.innerHTML =  sHeader; 
                return item;
            }

            // ** Private members

            // Creates the content  a line to the report list.
            // Returns: {item: div, label: span, value: span} object.
            //      item: HTML Div element ref for the item containing the label and value.
            //      label HTML Span element ref for the label.
            //      value HTML Span elenet ref for the value.
            // Arg:
            //  sLabel: string. text for a label.
            //  sValue: string. text for a value. 
            
            // Adds span ctrls for label and value to an item div in the report list. 
            // Returns: {item: div, label: span, value: span} object.
            //      item: HTML Div element ref for the item containing the label and value.
            //      label HTML Span element ref for the label.
            //      value HTML Span elenet ref for the value.
            function FormLineContent(item, sLabel, sValue) { 
                item.className = 'StatsMetricsReportLine';
                var label = that.create('div', null, 'StatsMetricsReportLabel'); 
                label.innerHTML = sLabel;  
                var value = that.create('div', null, 'StatsMetricsReportValue'); 
                value.innerHTML = sValue;
                item.appendChild(label);
                item.appendChild(value);
                return {item: item, label: label, value: value};
            }
            
            
            // Inserts a line in the report list after an existing item.
            // Returns: {item: div, label: span, value: span} object. the new inserted item.
            //      item: HTML Div element ref for the item containing the label and value.
            //      label HTML Span element ref for the label.
            //      value HTML Span elenet ref for the value.
            // Arg:
            //  afterItem: HTML Div obj. item in report list after which a new item is inserted.
            //  sLabel: string. text for a label for the new item.
            //  sValue: string. text for a value for the new item. 
            function InsertLineAfter(afterItem, sLabel, sValue) { 
                var item = that.insertItemAfter(afterItem);
                return FormLineContent(item, sLabel, sValue);
            }

            // Inserts a line in the report list after an existing item.
            // Returns: HTML Div element for the inserted item.
            // Arg: 
            //  sText: string. Text that is set innerHTML of the item inserted.
            function InsertSimpleLineAfter(afterItem, sText) { 
                var item = that.insertItemAfter(afterItem);
                item.className = 'StatsMetricsReportLine';
                item.innerHTML = sText;
                return item;
            }
            
            // Add a line to the report list.
            // Returns: {item: div, label: span, value: span} object.
            //      item: HTML Div element ref for the item containing the label and value.
            //      label HTML Span element ref for the label.
            //      value HTML Span elenet ref for the value.
            // Arg:
            //  sLabel: string. text for a label.
            //  sValue: string. text for a value. 
            function AddLine(sLabel, sValue) {
                var item = that.addItem(metrics.listDiv, 0);
                return FormLineContent(item, sLabel, sValue); 
            }

            // ** Constructor initialization.
            var that = this;
            // Create empty, scrollable list.
            var metrics = this.createList(metricsDiv, 2); // metrics is {headerDiv: div, listDiv: div} obj.
            var titleDiv = metrics.headerDiv.getElementsByClassName('wigo_ws_cell0')[0]; 
            titleDiv.className = 'RecordStatsMetricsReport';
            titleDiv.innerHTML = 'Metrics Report'; 
            var cell1 = metrics.headerDiv.getElementsByClassName('wigo_ws_cell1')[0];
            cell1.className = 'RecordStatsMetricsReportCloseDiv';
            var buClose = this.create('button', null, 'RecordStatsMetricsReportCloseBtn');
            buClose.innerHTML = 'Close';  
            cell1.appendChild(buClose);

            // Initialize each section with label and empty value.
            var headerCurrentMetrics = AddSectionHeader('Current Metrics');
            var lineCurrentDistance = AddLine('Distance: ', '');
            var lineCurrentSpeed = AddLine('Speed: ', '');
            var lineCurrentDate = AddLine('Date: ', ''); 

            var headerGoals = AddSectionHeader("Goals", '');
            
            var headerBestMonthly = AddSectionHeader('Best Metrics for Last 30 Days');
            var lineBestMonthlyDistance = AddLine('Longest Distance: ', '');
            var lineBestMonthlySpeed = AddLine('Fastest Speed: ', '' );

            var headerBestMetrics = AddSectionHeader('Best Metrics Ever');
            var lineBestDistance = AddLine('Longest Distance: ', '');
            var lineBestSpeed = AddLine('Fastest Speed: ', '' );

            var headerMonthlyMetrics = AddSectionHeader('Metrics for Last 30 Days'); 
            
            // Add a blank line at end to help with last line being visible when scrolling.
            var lineSpacer = AddLine('&nbsp;','&nbsp;'); 

            buClose.addEventListener('click', function(event) {
                ShowRecordStatsMetricsDiv(false);
            }, false);

        }
        StatsMetricsReport.prototype = objScrollableListBase;
        StatsMetricsReport.constructor = StatsMetricsReport;

        // Helper object for editing a stats item.
        function StatsItemEditor() { 
            // number for body mass in kilograms.
            this.kgBodyMass = 50.0; 
            
            // number for Calorie conversion efficiency.
            this.calorieConversionEfficiency = 0.10; 

            // boolean flag to indicating editing existing stats item (true),
            // or adding a new stats item (false).
            this.bEditing = false; 

            // Sets title.
            // Arg:
            //  sTitle: string. the title.
            this.setTitle = function(sTitle) { 
                statsEditInstr.innerHTML = sTitle;
            };

            // Set height of control to fill screen, less an amount to shrink.
            // Args:
            //  nShrinkPels: number of pels to shrink the height 
            this.setHeight = function(nShrinkPels) {  
                let yBody = document.body.offsetHeight;
                let yHeight = yBody - nShrinkPels;
                holderDiv.style.height = yHeight.toFixed(0) + 'px';
            };

            // Sets editor's controls based on itemData.
            // Arg:
            //  itemData: wigo_ws_GeoTrailRecordStats obj. 
            this.setEditCtrls = function(itemData){
                // Helper. Returns a string of at least 2 digits.
                // A zero char is prepended if need be to form a length of 2 digits.
                // Arg: 
                // digits:number or string. If number converted to a string.
                function TwoDigits(digits) {
                    if (typeof digits === 'number')
                        digits = digits.toFixed(0);
                    for (let i=digits.length; i < 2; i++) {
                        digits = '0' + digits;
                    }
                    return digits;
                }

                // Save ref to the orginal item data set into the edit controls.
                originalItemData = itemData; 

                // Clear speed changed flag.
                this.setSpeedChanged(false); 
                // Set starting date.
                let itemDate = new Date(itemData.nTimeStamp);
                let nYear = itemDate.getFullYear();
                let nMonth = itemDate.getMonth() + 1; 
                let nMonthDay = itemDate.getDate();
                let nHour = itemDate.getHours();
                let nMinute = itemDate.getMinutes();
                let sValue = "{0}-{1}-{2}".format(nYear, TwoDigits(nMonth), TwoDigits(nMonthDay));
                date.value = sValue;
                // Set starting time.
                time.value = "{0}:{1}".format(TwoDigits(nHour), TwoDigits(nMinute));

                // Set distance.
                let distValue = lc.toDist(itemData.mDistance);  
                distance.value = distValue.n.toFixed(2);
                distanceUnit.innerText = distValue.unit;

                // Set run time.
                let runTime = new HourMinSec(itemData.msRunTime);
                runTimeMins.value = runTime.getAllMins();
                runTimeSecs.value = runTime.getSec();
            };

            // Gets ref to the original item data that is arg to this.setEditCtrls(itemData); 
            // Returns: ref to wigo_ws_GeoTrailRecordStats obj. 
            //          Could be null if not set by this.setEditCtrls(itemData).
            this.getOriginalItemData = function() { 
                return originalItemData; 
            };

            // Checks if control values are valid.
            // Shows error msg in status div for an invalid control value and sets
            // focus to the control.
            // Returns: boolean. true if all control values are valid.
            this.areCtrlsValid = function() {
                // Helper that returns true if num is an integer.
                function IsInteger(num) {
                    let bYes = num === Math.floor(num);
                    return bYes;
                }

                // Helper to indicate a ctrl has an invalid entry
                // by setting focus to control and setting class name
                // used to designate background color.
                // Args
                //  ctrl: HTML Element obj for the control.
                //  bError: boolean. true indicates invalid entry.
                function IndicateError(ctrl, bError) {
                    if (bError) {
                        ctrl.focus();
                        ctrl.classList.add('stats_item_editor_ctrl_error');
                    } else {
                        ctrl.classList.remove('stats_item_editor_ctrl_error');
                    }
                }
                
                let bOk = true;
                let sMsg; 
                this.clearStatus();
                // Check that date/time is < current time. Do not allow adding dates in the future
                // because a date/time that may be added later by record needs to be after
                // the date of last (oldest) item in the stats list because stats history only 
                // updates for items starting at itemCount.
                let timestamp = ParseDateTime(date, time);
                let now = Date.now();
                if (timestamp > now) {
                    let dt = new Date(now);
                    sMsg = "Starting Date/Time must be less than current Date/Time\nof {0}".format(dt.toLocaleString('en-US'));
                    status.addLine(sMsg);
                    IndicateError(date, true);
                    IndicateError(time, true); 
                    bOk = false;
                } else {
                    // Indicate an error if either date or time is not given.
                    if (date.value.length === 0) {
                        status.addLine("Date must be entered.");
                        IndicateError(date, true);
                        bOk = false;
                    } else if (time.value.length === 0) {
                        status.addLine("Time must be given.");
                        IndicateError(time, true);
                        bOk = false;
                    } else {
                        // date and time are ok.
                        IndicateError(date, false);
                        IndicateError(time, false);
                    }
                }
                // Check that distance is not negative.
                let dist = GetNumFromCtrl(distance);
                if (dist < 0) {
                    status.addLine("Distance cannot be negative.");
                    IndicateError(distance, true);
                    bOk = false;
                } else {
                    IndicateError(distance, false);
                }
                // Check run time minutes.
                let nMins = GetNumFromCtrl(runTimeMins);
                if (nMins < 0) {
                    status.addLine("Run Time Minutes cannot be negative.");
                    IndicateError(runTimeMins, true);
                    bOk = false;
                } else if (!IsInteger(nMins)) {
                    status.addLine("Run Time Minutes must be whole mumber.");
                    IndicateError(runTimeMins, true);
                    bOk = false;
                } else {
                    IndicateError(runTimeMins, false);
                }
                // Check run time seconds.
                let nSecs = GetNumFromCtrl(runTimeSecs);
                if (nSecs < 0) {
                    status.addLine("Run Time Secs cannot be negative.");
                    IndicateError(runTimeSecs, true);
                    bOk = false;
                } else if (nSecs > 59 || !IsInteger(nSecs)) { 
                    status.addLine("Run Time Secs must be whole number from 0, 1, ... 59");
                    IndicateError(runTimeSecs, true);
                    bOk = false;
                } else {
                    IndicateError(runTimeSecs, false);
                }
                // Check run time is not zero.
                if (nSecs <= 0 && nMins <= 0) {
                    status.addLine("Run Time must be greater than 0.");
                    IndicateError(runTimeMins, true);
                    bOk = false;
                }

                return bOk;
            };

            // Sets flag to indicated speed has changed.
            // Arg: 
            //  bChanged: boolean. true indicates runtime mins, runtime secs, or distance control has been changed.
            // 
            this.setSpeedChanged = function(bChanged) { 
                bSpeedChanged = bChanged;
            };
            var bSpeedChanged = false; 

            // boolean. Returns true is distance or runtime control has been changed.
            this.isSpeedChanged = function() { 
                return bSpeedChanged;
            };

            // Returns new wigo_ws_GeoTrailRecordStats object based on values in the editor's ctrls.
            this.getEditData = function() {
                let itemData = new wigo_ws_GeoTrailRecordStats();
                // Set distance in meters from input in miles or kilometers.
                itemData.mDistance = lc.toMeters(GetNumFromCtrl(distance));
                // Set runtime in milliseconds.
                let nMins = GetNumFromCtrl(runTimeMins);
                let nSecs = GetNumFromCtrl(runTimeSecs);
                itemData.msRunTime = (60 * nMins + nSecs) * 1000.0;
                // Estimate calories.
                if (itemData.msRunTime > 0) {
                    // Calculate kinetic engery to move body mass in calories.
                    let speed = itemData.mDistance / (itemData.msRunTime / 1000.0);
                    let ke = 0.5 * this.kgBodyMass * speed * speed; // engery in joules to move body mass to ave velocity.
                    ke += ke; // Add engery in joules to move body mass from ave velectity to rest.
                    // Calculate  energy to overcome friction for traveling along the path in joules.
                    // 0.032 is estimate for coefficient of friction.
                    let fe = coeffFriction * this.kgBodyMass * accelGravity * itemData.mDistance;
                    itemData.caloriesKinetic = (ke + fe)/1000; // Calculated energy in kilojoules.
                    itemData.caloriesKinetic /= kjoulesPerCalorie; // kjoules converted to food calories.
                    // Set calories burned accounting for conversion of food to calories.
                    itemData.caloriesBurnedCalc = itemData.caloriesKinetic / this.calorieConversionEfficiency;
                }

                // Set timestamp from date and time ctrls.
                itemData.nTimeStamp = ParseDateTime(date, time);
                return itemData;
            };

            // Clears the status div so that it is not shown.
            this.clearStatus = function() {  
                status.clear();
            };

            // Returns new wigo_ws_GeoTrailRecordStats object.
            this.newItemData = function() {
                return new wigo_ws_GeoTrailRecordStats();
            };

            // Helper that returns a number from a control.
            // Arg:
            //  ctrl: HTMLInput. control whose value is returned as a number.
            // Note: If control value is NaN, returns 0.
            function GetNumFromCtrl(ctrl) {
                let num = Number(ctrl.value);
                if (num === NaN)
                    num = 0;
                return num;
            }

            // Parses Date and Time input controls.
            // Returns millisecond value for a Date object.
            // Returns 0 date if date control does not have a valid value.
            // Args:
            //  dateCtrl: HTMLInput, type=date obj. ref to date ctrl.
            //  timeCtrl: HTMLInput, type=time obj. ref to time ctrl.
            function ParseDateTime(dateCtrl, timeCtrl) {
                //let ms = 0; 
                //let sDate = dateCtrl.value;
                //let sTime = timeCtrl.value;
                // The following worked differently for android and ios. 
                // android used local time and ios used utc.
                // Mozilla documents recommends NOT number Date(dateString) consructor.
                //if (sDate.length > 0 && sTime.length > 0) {
                //    let sDateTime = "{0}T{1}:00".format(sDate, sTime);   
                //    let datetime = new Date(sDateTime);
                //    ms = datetime.getTime();
                //} else if (sDate.length > 0) {
                //    // The followinf worked different for android and ios.
                //    let sDateFmt = "{0}".format(sDate);   
                //    let date = new Date(sDateFmt);
                //    ms = date.getTime();
                //}
                //return ms;

                // Parses string for year, month, day.
                // Arg:
                //  sDate: string. date format is yyyy-mm-dd
                //  sTime: string. time format is hh:ss
                // Returns: {year: number, month: number_origin_0, date: number, hour: number, minute: number} or null if sDate is invalid.
                //          If sTime is invalid, hour = 0 and minute = 0. 
                //          Returned month is origin 0 for January for compatability with Date constructor.
                //          sDate month part is origin 1 for January.
                function ParseStr(sDate, sTime) {
                    var matches =sDate.match(/(\d\d\d\d)\-(\d\d)\-(\d\d)/);
                    var ymdhm = null;
                    if (matches) {
                        ymdhm = {year: Number(matches[1]), month: Number(matches[2]-1), date: Number(matches[3]), hour: 0, minute: 0};
                        matches = sTime.match(/(\d\d)\:(\d\d)/);
                        if (matches) {
                            ymdhm.hour = Number(matches[1]);
                            ymdhm.minute = Number(matches[2]);
                        }
                    }
                    return ymdhm;
                }

                let ms = 0; 
                let sDate = dateCtrl.value;
                let sTime = timeCtrl.value;
                let ymdhm = ParseStr(sDate, sTime);
                if (ymdhm) {
                    ms = (new Date(ymdhm.year, ymdhm.month, ymdhm.date, ymdhm.hour, ymdhm.minute)).getTime();
                }
                return ms;
            }

            // Coeffient of friction for calculating engery consumed.
            let coeffFriction = 0.032; 
            let accelGravity = 9.81;
            let kjoulesPerCalorie = 4.184; // Kilojoules per food Calorie.

            // Status msg div.
            let status = new ctrls.StatusDiv(); 

            let originalItemData = null; // ref to wigo_ws_GeoTrailRecordStats. the item data that is set into the edit controls. 

            // Blur all ctrls that might have soft keyboard showing.
            distance.blur();
            runTimeMins.blur();
            runTimeSecs.blur();
            date.blur();
            time.blur();
        }

        // Shows a div for editing a stats item and hides the stats header and list, 
        // or vice versa.
        // Arg:
        //  bShow: boolean. true indicates to show the edit div.
        function ShowRecordStatsEditDiv(bShow) { 
            // Clear stats editor status div regardless of bShow.
            itemEditor.clearStatus(); 
            // Hide stats list and header.
            ShowElement(stats.headerDiv, !bShow);
            ShowElement(stats.listDiv, !bShow);
            // Show the edit div.
            ShowElement(editDiv, bShow);
        }

        // Show a div the metrics report and hides the stats header and list,
        // or vice versa.
        // Arg:
        //  bShow: boolean. true indicates to show the metrics div.
        function ShowRecordStatsMetricsDiv(bShow) { 
            // Hide stats list and header.
            ShowElement(stats.headerDiv, !bShow);
            ShowElement(stats.listDiv, !bShow);
            // Show the metrics div.
            ShowElement(metricsDiv, bShow);
        }

        // Handler for change event for controls that affect a change in speed.
        // Arg:
        //  event: html Event object.
        function SpeedChangedHandler(event) { 
            itemEditor.setSpeedChanged(true);
        }

        // Helper object for syncing stats data with server and localStorage.
        function StatsSyncer() { ////20180723

            // Synchronizes stats between server and local stats.
            // Arg:
            //  onDone: callback function with signature:
            //    bOk: boolean. Successfully completed sync
            //    nLocalStatsAdded: number. number of local stats added.
            //    sStatus: string. message describing result of syncing.
            // Synchronous return: boolean. 
            //  true indicates sync started.
            //  false indicates cannot start syncing because
            //        some other exchange with server is in progrss.
            this.sync = function(onDone) {
                if (recordStatsXfr === null)
                    recordStatsXfr =  view.onGetRecordStatsXfr(); // 

                let bStarted  = CompareStats(onDone);
                return bStarted;
            };
            
            // Compares stats downloaded from server with stats in localStorage.
            // Adds stats from server that are missing to local stats and saves to localStorage.
            // Adds stats from local stats that are missing in server data and uploads missing stats to server.
            // Arg: 
            //  OnDone: callback with this signature:
            //      bOk: boolean: true for sucess.
            //      nLocalStatsAdded: number. number of local stats added.
            //      sStatus: string: description for the syncing result.
            function CompareStats(onDone) {
                let bStarted = recordStatsXfr.downloadRecordStatsAry(function(bOk, aryServerStats, sStatus){
                    let sLineEnd = '<br/>';
                    let sStatusMsg = '';
                    let nLocalStatsAdded = 0; 

                    
                    function DoDone(bDoneOk) {
                        if (onDone) {
                            onDone(bDoneOk, nLocalStatsAdded, sStatusMsg);
                        }
                    }

                    if (bOk) {
                        // Add missing stats to local stats and saves to localStorage if there are missing stats.
                        let arMissingStats = AddMissingToLocalStats(aryServerStats); 
                        nLocalStatsAdded = arMissingStats.length;
                        if (arMissingStats.length > 0) {
                            sStatusMsg += 'Saved {0} stats from server missing in local data.{1}'.format(arMissingStats.length, sLineEnd);
                        }
                        
                        // Add missing stats to server stats.
                        arMissingStats = AddMissingToServerStats(aryServerStats);
                        if (arMissingStats.length > 0) { 
                            // Upload server stats that have been added.
                            let bUploadStarted = recordStatsXfr.uploadRecordStatsList(arMissingStats, function(bOk, sStatus){
                                if (bOk) {
                                    sStatusMsg += 'Uploaded {0} stats missing at server.{1}'.format(arMissingStats.length, sLineEnd);
                                } else {
                                    sStatusMsg += 'Error uploading {0} stats missing at server.{1}{2}{1}'.format(arMissingStats.length, sLineEnd, sStatus);
                                }
                                DoDone(bOk);
                            });
                            if (!bUploadStarted) {
                                // Failed to start uploading data to server. Should not happen.
                                sStatusMsg += 'Failed to start uploading {0} missing stats to server.{1}'.format(arMissingStats.length, sLineEnd);
                                DoDone(false);
                            }
                        } else {
                            if (sStatusMsg.length === 0) {
                                sStatusMsg += 'Sync determined local stats and stats saved at server are the same.{0}'.format(sLineEnd);
                            }
                            DoDone(bOk);
                        }
                    } else {
                        sStatusMsg += 'Sync failed to download stats from server.{0}{1}{0}'.format(sLineEnd, sStatus);
                        DoDone(bOk);
                    }
                });
                return bStarted;  
            }

            // Add any missing stats from the server to local stats.
            // If there are missing stats, the localStorage for stats is updated (saved).
            // Arg:
            //  aryServerStats: RecordStatsAryServer object. stats from server.
            // Retuns: array of wigo_ws_GeoTrailRecordStats objs. the missing stats. Empty array if none are missing.
            function AddMissingToLocalStats(aryServerStats) {
                ////let arLocalStats = aryLocalStats.getAll();
                let arMissingStats = []; // Array of missing stats.
                let bMissing = false;
                let aryLocalStats = recordStatsXfr.getLocalRecordStatsAry();
                let arServerStats = aryServerStats.getAll();
                for (let i=0; i < arServerStats.length; i++) {
                    bMissing = aryLocalStats.insertMissingNoSave(arServerStats[i]);                   
                    if (bMissing) {
                        arMissingStats.push(arServerStats[i]);
                    }
                }
                if (arMissingStats.length > 0)
                    aryLocalStats.SaveToLocalStorage();
                return arMissingStats;
            }

            // Add any missing stats from the local stats to server stats.
            // Note: Does NOT upload missing stats to server.
            // Arg:
            //  aryServerStats: RecordStatsAryServer object. stats from server.
            // Retuns: number. number of missing stats added to server stats.
            function AddMissingToServerStats(aryServerStats) {
                let arMissingStats = []; // Array of missing stats.
                let bMissing = false;
                let aryLocalStats = recordStatsXfr.getLocalRecordStatsAry();
                let arLocalStats = aryLocalStats.getAll();
                for (let i=0; i < arLocalStats.length; i++) {
                    bMissing = aryServerStats.insertMissingNoSave(arLocalStats[i]);
                    if (bMissing) {
                        arMissingStats.push(arLocalStats[i])
                    }
                }
                return arMissingStats;
            }

            var that = this;
            var recordStatsXfr = null; // ref to RecordStatsXfr set by this.sync().

            ////20180726 var arServerStats = []; // Array of wigo_ws_GeoTrailRecordStats objects download from server.
            ////20180726 var arLocalStats = [];  // Ref to array of local stats.

        }

        // ** Constructor initialization.
        // Set ref and event handlers for controls used for editing a stats item.
        if (!ctrlIds) {
            ctrlIds =  {holderDivId: 'divRecordStatsHistory', // id of holder div. 
                        metricsDivId: 'divRecordStatsMetrics', // id of div for showing a stats metrics report 
                        editDivId: 'divRecordStatsEdit',     // id of div for editing stats times. 
                        statsEditInstrId: 'statsEditInstr',  // id for instructions for editing stats.
                        dateId: 'dateRecordStats', // id of input, type=date 
                        timeId: 'timeRecordStats', // id of input, type=time
                        distanceId: 'numRecordStatsDistance', // id of input, type=number
                        distanceUnitId: 'spanRecordStatsDistanceUnit', // id of span. Displays mi or km based on bEnglishUnit.
                        runTimeMinsId: 'minsRecordStatsRunTime', // id of input, type=number. 
                        runTimeSecsId: 'secsRecordStatsRunTime', // id of input,type=number.
                        doneId: 'buRecordStatsEditDone', // id of button.
                        cancelId:'buRecordStatsEditCancel'};
        }
        var holderDiv = document.getElementById(ctrlIds.holderDivId);
        var metricsDiv = document.getElementById(ctrlIds.metricsDivId);  
        var editDiv = document.getElementById(ctrlIds.editDivId);
        var statsEditInstr = document.getElementById(ctrlIds.statsEditInstrId);  
        var date = document.getElementById(ctrlIds.dateId);
        var time = document.getElementById(ctrlIds.timeId);
        var distance = document.getElementById(ctrlIds.distanceId);
        var distanceUnit = document.getElementById(ctrlIds.distanceUnitId);
        var runTimeMins = document.getElementById(ctrlIds.runTimeMinsId); 
        var runTimeSecs = document.getElementById(ctrlIds.runTimeSecsId);
        var done = document.getElementById(ctrlIds.doneId);
        var cancel = document.getElementById(ctrlIds.cancelId);
        if (done)
            done.addEventListener('click', OnEditDone, false); 
        if (cancel)
            cancel.addEventListener('click', OnEditCancel, false);
       
        distance.addEventListener('keydown', OnKeyDown, false);
        distance.addEventListener('change', SpeedChangedHandler, false); 
        runTimeMins.addEventListener('keydown', OnKeyDown, false);
        runTimeMins.addEventListener('change', SpeedChangedHandler, false); 
        runTimeSecs.addEventListener('keydown', OnKeyDown, false);
        runTimeSecs.addEventListener('change', SpeedChangedHandler, false); 
        distance.addEventListener('focus', SelectNumberOnFocus, false);
        runTimeMins.addEventListener('focus', SelectNumberOnFocus, false);
        runTimeSecs.addEventListener('focus', SelectNumberOnFocus, false);

        // Helper object for editing a stats item.
        var itemEditor = new StatsItemEditor(); 

        // Number of items in the list.
        // Note length of list is greater than item count because of separator rows.
        var itemCount = 0; 

        // Object to detect change in current month and year.
        var curMonthYear = {month: -1, year: -1,
                            isValid: function(){
                                // Note: Time for ms value of 0 is 1970-01-01T00:00:00 GMT. For timezone not GMT,
                                //       the time can be in 1969-12-31. For example for PST (GMT-8), 1969-12-31T16:00:00.
                                return this.month >= 0 && this.month <= 11 && this.year >= 1969;  
                            },
                            // Checks for a change. If true, sets this object for new  date.
                            // Args: nMonth, nYear: number for month and year to check.
                            // Returns: boolean. true if there is a change.
                            // Note: This object is initially invalid. If invalid,
                            //       sets this object to nMonth, nYear and returns false,
                            //       i.e. initially first check in not a change.
                            checkChange: function(nMonth, nYear) {
                                var bChange = false;
                                if (this.isValid()) {
                                    bChange = !(this.month === nMonth && this.year === nYear);
                                    if (bChange) {
                                        this.month = nMonth;
                                        this.year = nYear;
                                    }
                                } else {
                                    this.month = nMonth;
                                    this.year = nYear;
                                } 
                                return bChange; 
                            },
                            // Initialize this object.
                            // Arg: timestamp: Date object or integer for Date value.
                            set: function(timeStamp) {
                                if (typeof(timeStamp) === 'number') {
                                    timeStamp = new Date(timeStamp);
                                }
                                this.month = timeStamp.getMonth();
                                this.year = timeStamp.getFullYear();
                            }, 
                            // Resets to invalid.
                            reset: function() {
                                this.month = -1;
                                this.year = -1;
                            }
                            };

        
        // Create empty, scrollable list.
        var stats = this.createList(holderDiv, 5); // stats is {headerDiv: div, listDiv: div} obj.

        stats.headerDiv.className = 'stats_history_header'; 
        stats.listDiv.className = 'stats_history_list';     
        // Ref to div to hold a memu for stats history.   
        var menuHolder = stats.headerDiv.getElementsByClassName('wigo_ws_cell0')[0]; 
        menuHolder.className = 'holderStatsHistoryMenu';
        var menuStatsHistory = new ctrls.DropDownControl(menuHolder, "menuStatsHistory", null, null, "img/ws.wigo.menuicon.png"); 
        var menuStatsHistoryValues = [['show_metrics', 'Show Metrics'],        // 0
                                      ['add_stats_item', 'Add Stats Item'],    // 1
                                      ['edit_stats_item','Edit Stats Item'],   // 2
                                      ['delete_selected','Delete Selected'],   // 3
                                      ['clear_selected', 'Clear Selected'],    // 4
                                      ['sync_server', 'Sync w/ Server'],       // 5 ////20180723 added 
                                    ]; 
        menuStatsHistory.fill(menuStatsHistoryValues);

        // Ref to divs for month and year in header.
        var monthDiv = stats.headerDiv.getElementsByClassName('wigo_ws_cell1')[0];
        monthDiv.className = 'stats_history_month'; 
        var yearDiv = stats.headerDiv.getElementsByClassName('wigo_ws_cell2')[0];
        yearDiv.className = 'stats_history_year'; 
        
        // Call back handler for selection in menuStatsHistory.
        var metricsReport = null; 
        menuStatsHistory.onListElClicked = function(dataValue) {
            // Helper that checks if user is signed in. 
            // Arg:
            //  sNotSignedInMsg: string. status msg shown if user is not signed in.
            // Returns: boolean. true if signed.
            function IsUserSignedIn(sNotSignedInMsg) { 
                var bSignedIn = view.getOwnerId().length > 0;
                if (!bSignedIn) {
                    var sMsg = sNotSignedInMsg + "<br>View > Sign-in/off.<br>Sign-in> Facebook.";
                    view.ShowStatus(sMsg);
                }
                return bSignedIn;
            }

            
            // Helper that gets list of item descriptions.
            // Arg:
            //  arId: array of unique html id of selected data items.
            // Returns: array of string. Each element is a description of the data itsm.
            function GetItemDescrList(arId) { 
                let itemData;
                let arDescr = [];
                let sDescr;
                let date;
                let sDate, sValue;
                for (let i=0; i < arId.length; i++) {
                    itemData = that.getItemData(arId[i]);
                    date = new Date(itemData.nTimeStamp);
                    sDate = "{0}, ".format(date.toLocaleDateString('en-US', {year: '2-digit', month: '2-digit', day: '2-digit', weekday: 'short', hour12: true, hour: '2-digit', minute: '2-digit' })); 
                    sValue = " {0}".format(lc.to(itemData.mDistance));
                    sDescr = sDate + sValue;
                    arDescr.push(sDescr);
                }
                return arDescr;
            }


            // Helper to form a confirmation msg for deleting a list of items.
            // Arg:
            //  arId: array of unique html id of selected data items.
            // Returns: string. Confirmation msg describing list of items to delete.
            function GetConfirmDeleteListMsg(arId) { 
                let sMsg = 'OK to delete these selected items?\n';
                let arDescr = GetItemDescrList(arId);
                for (let i=0; i < arDescr.length; i++) {
                    sMsg += '{0}\n'.format(arDescr[i]);
                }
                return sMsg;
            }

            if (dataValue === 'show_metrics') {
                recordStatsMetrics.updateMonthDays(view.onGetRecordStatsList()); 
                if (metricsReport)          
                    metricsReport.clear();  
                metricsReport = new StatsMetricsReport(); // Note: create new metricReport obj each time in order to only fill monthDays once.
                metricsReport.fill();
                ShowRecordStatsMetricsDiv(true); // Show stats metrics report div. 
                // Set metrics report to fill screen.
                metricsReport.setListHeight(titleHolder.offsetHeight); 
            } else if (dataValue === 'add_stats_item') {
                if (IsUserSignedIn("You must sign-in to Add a Stats Item.")) { 
                    itemEditor.bEditing = false; 
                    itemEditor.setTitle("Add a New Record Stats Item"); 
                    let itemData = itemEditor.newItemData();
                    itemData.nTimeStamp = Date.now();
                    itemEditor.setEditCtrls(itemData);
                    ShowRecordStatsEditDiv(true); 
                } 
            } else if (dataValue === 'edit_stats_item') { 
                if (IsUserSignedIn("You must sign-n to Edit a Stats Item.")) { 
                    let arId = Object.keys(itemsSelected);
                    if (arId.length === 1) {
                        itemEditor.bEditing = true;
                        itemEditor.setTitle("Edit a Record Stats Item"); 
                        let itemData = that.getItemData(arId[0]);
                        itemEditor.setEditCtrls(itemData);
                        ShowRecordStatsEditDiv(true);
                    } else {
                        AlertMsg('Select only one item to edit.\nTouch a Date of an item to select it.');
                    }
                }
            } else if (dataValue === 'delete_selected') {
                if (IsUserSignedIn("You must sign-n to Delete Stats Item(s).")) { 
                    // Prompt user if no item is selected.
                    let arId = Object.keys(itemsSelected);  
                    if (arId.length > 0) {  
                        ConfirmYesNo(GetConfirmDeleteListMsg(arId),
                            function(bConfirm) {
                                if (bConfirm) {
                                    // Delete the items at server first.
                                    // Iff deletion at server is successful, then delete locally.
                                    // Delete the old item at server first.
                                    var arUploadDelete = GetServerDeleteSelections();
                                    var recordStatsXfr = view.onGetRecordStatsXfr();  
                                    var bStarted = recordStatsXfr.deleteRecordStatsList(arUploadDelete, function(bOk, sStatus) { 
                                        if (bOk) {
                                            view.onDeleteRecordStats(itemsSelected); 
                                            // Update the stats metrics 
                                            recordStatsMetrics.init(view.onGetRecordStatsList()); 
                                            // Remove selected items from list displayed.
                                            DeleteSelections();
                                            that.showMonthDate(); 
                                            var sMsg = "Deleted {0} stats item(s).".format(arUploadDelete.length);
                                            view.ShowStatus(sMsg, false); 
                                        } else {
                                            var sMsg = "Failed to delete {0} stats item(s).".format(arUploadDelete.length);
                                            view.ShowStatus(sMsg)
                                        }
                                    });
                                    if (!bStarted) {
                                        view.ShowStatus("Failed to start deleting stats item(s) at server.");
                                    }
                                }
                            }); 
                    } else { 
                        let sMsg = "Select one or more items for deletion by touching the Date of an item.";
                        AlertMsg(sMsg);
                    } 
                }
            } else if (dataValue === 'clear_selected') {
                // Prompt user if no item is selected.
                let arId = Object.keys(itemsSelected);  
                if (arId.length > 0) {  
                    that.clearSelections(); 
                } else {  
                    AlertMsg("No item is selected.");
                }
            } else if (dataValue === 'sync_server') {  ////20180726 added 
                if (IsUserSignedIn("You must sign-in to Sync Stats with Server.")) {
                    let bStarted = statsSyncer.sync(function(bOk, nLocalStatsAdded, sStatus){
                        view.ShowStatus(sStatus, !bOk);  
                        if (nLocalStatsAdded > 0) {
                            // Reload the history list since local stats have changed.
                            that.reload();
                        }
                    });
                    if (!bStarted) {
                        // Some previous exchange with server has not completed. 
                        // If exchange with server is hung, View > Sign-in/off > Sign-in > Reset Server Access may help.
                        view.ShowStatus('Exchange with server is in progress. Wait and try again.', true);
                    }    
                }
            }
        };

        var statsSyncer = new StatsSyncer(); // Object to sync stats with server. ////20180726 added 

        // New ScrollComplete object. See ScrollableListBase in ws.wigo.cordovacontrols.js.
        var scrollComplete = this.newOnScrollComplete(stats.listDiv); 
        scrollComplete.onScrollComplete = OnScrollComplete; // Attach callback for scroll complete event.
    }
    RecordStatsHistory.prototype = objScrollableListBase; 
    RecordStatsHistory.constructor = RecordStatsHistory;
    var recordStatsHistory = new RecordStatsHistory(this); 

    // Object for extracting metrics from the stats data. 
    function RecordStatsMetrics() {
        // Initializes this object.
        // Arg: 
        //  arRecStats: array of wigo_ws_GeoTrailRecordStats objects, optional. array of stats.
        //              If given, updates metrics for the array of stats. Ignored if not a valid array.
        this.init = function(arRecStats) {
            recBestDistance = null;        // ref to wigo_ws_GeoTrailRecordStats object for longest distance.
            recBestMonthlyDistance = null; // ref to wigo_ws_GeoTrailRecordStats object for longest distance in last 30 days.
            recBestSpeed = null;           // ref to wigo_ws_GeoTrailRecordStats object for best speed.
            recBestMonthlySpeed = null;    // ref to wigo_ws_GeoTrailRecordStats object for best speed in last 30 days.
            
            bestSpeed = 0;
            bestMonthlySpeed = 0;
    
            recCurrent = null;            // ref to wigo_ws_GeoTrailRecordStats object for current stats object update.
            recPrevious = null;           // ref to wigo_ws_GeoTrailRecordStats object for previous stats object.
    
            if (arRecStats instanceof Array) {
                var rec;
                for (var i = 0; i < arRecStats.length; i++) {
                    this.update(arRecStats[i]);
                }
            }
        };
        
        // Updates the stats metrics for a given stats object.
        // Args:
        //  recStats: wigo_ws_GeoTrailRecordStats object.
        this.update = function(recStats) {
            // Ignore if recStats.msTimeStamp is greater than current date/time value.
            // This can happen if test recStats objects have been added.
            // In normaal operation, the recStats.msTimeStamp should alway be < current date/time value.
            var msNow = Date.now();
            if (recStats.nTimeStamp > msNow)
                return;

            // Check for personal best distance.
            if (recBestDistance) {
                if (recBestDistance.mDistance < recStats.mDistance)
                    recBestDistance = recStats;
            } else {
                recBestDistance = recStats;
            }

            // Check for personal best speed.
            let speed = recStats.msRunTime > 0 ? recStats.mDistance / (recStats.msRunTime/1000) : 0;
            if (recBestSpeed) {
                if (bestSpeed < speed) {
                    recBestSpeed = recStats;
                    bestSpeed = speed;
                }
            } else {
                if (speed > 0) {
                    recBestSpeed = recStats;
                    bestSpeed = speed;
                }
            }

            // Check for previous stats obj wrt to current (newest) recStats.
            if (recCurrent) {
                if (recStats.nTimeStamp >= recCurrent.nTimeStamp) { // Note: equal is for case when resuming recording.
                    recPrevious = recCurrent;
                    recCurrent = recStats;
                }
            } else {
                recCurrent = recStats;
                recPrevious = null;
            }
        };

        // Fills an array of elements for describing recent stats within 30 days.
        // Arg:
        //  arRecStats: array of wigo_ws_GeoTrailRecordStats objects.
        //              The recent stats elements of arRecStats are used to fill
        //              an arry of month day info for the 30 days.
        //              Use this.getMonthDays() to get a ref to the month day array.
        this.updateMonthDays = function(arRecStats) {
            monthDayAry.fill(arRecStats);
        };

        // Sets distance goal for a day.
        // Arg:
        //  kmDistance: number. distance goal in kilometers.
        this.setDistanceGoalPerDay = function(kmDistance) { 
            mDistanceGoalPerDay = kmDistance * 1000;
        };

        // Gets distance goals for a day.
        // Returns: number. distance goal in meters.
        this.getDistanceGoalPerDay = function() { 
            return mDistanceGoalPerDay;
        }

        // Returns a ref to array of month day info for the recent 30 days.
        // Returns: array of 30 MonthDayEl objects. [MonthDayEl obj, ...].
        //          See function MonthDayEl() below for properties of a MonthDayEl obj.
        // Note: this.updateMonthDays(..) fills the array that is returned.
        this.getMonthDays = function() {
            return monthDayAry.get();
        };

        // Returns ref to wigo_ws_GeoTrailRecordStats object for current stats.
        this.getCurrent = function() {
            return recCurrent;
        }

        // Returns ref to wigo_ws_GeoTrailRecordStats object for longest distance.
        this.getBestDistance = function() {
            return recBestDistance;
        };
        
        // Returns ref to wigo_ws_GeoTrailRecordStats object for longest distance in last 30 days.
        this.getBestMonthlyDistance = function() {
            return recBestMonthlyDistance;
        };

        // Returns ref to wigo_ws_GeoTrailRecordStats object for best speed.
        this.getBestSpeed = function() {
            return recBestSpeed;
        }

        // Returns ref to wigo_ws_GeoTrailRecordStats object for best speed in last 30 days.
        this.getBestMonthlySpeed = function() {
            return recBestMonthlySpeed
        };

        // Returns true if recStats is ref to stats obj for the best distance.
        // Arg:
        //  recStats: wigo_ws_GeoTrailRecordStats obj, optional.
        //            Defaults to var recCurrent saved by this.update(..).
        this.isBestDistance = function(recStats) {
            if (!(recStats instanceof wigo_ws_GeoTrailRecordStats)) {
                recStats = recCurrent;
            }
            
            var bYes = recBestDistance === recStats;    
            return bYes;
        };
        // Returns true if recStats is ref to stats obj for the best monthly distance.
        // Arg:
        //  recStats: wigo_ws_GeoTrailRecordStats obj, optional.
        //            Defaults to var recCurrent saved by this.update(..).
        this.isBestMonthlyDistance = function(recStats) {
            if (!(recStats instanceof wigo_ws_GeoTrailRecordStats)) {
                recStats = recCurrent;
            }
            var bYes = recBestMonthlyDistance === recStats; 
            return bYes;
        }; 

        // Returns true if recStats is ref to stats obj for the best speed.
        // Arg:
        //  recStats: wigo_ws_GeoTrailRecordStats obj, optional.
        //            Defaults to var recCurrent saved by this.update(..).
        this.isBestSpeed = function(recStats) {
            if (!(recStats instanceof wigo_ws_GeoTrailRecordStats)) {
                recStats = recCurrent;
            }
            var bYes = recBestSpeed === recStats;   
            return bYes;
        };
        // Returns true if recStats is ref to stats obj for the best monthly speed.
        // Arg:
        //  recStats: wigo_ws_GeoTrailRecordStats obj, optional.
        //            Defaults to var recCurrent saved by this.update(..).
        this.isBestMonthlySpeed = function(recStats) {
            if (!(recStats instanceof wigo_ws_GeoTrailRecordStats)) {
                recStats = recCurrent;
            }
            var bYes = recBestMonthlySpeed === recStats; 
            return bYes;
        }; 
    
        // Returns integer number of days from previous stats.
        // Note: returns 0 if there is no current or no previous stats.
        // Args:
        //  recCur: wigo_ws_GeoTrailRecordStats, optional. Current stats obj.
        //          Defatult to var recCurrent saved by this.update(..);
        //  recPrev: wigo_ws_GeoTrailRecordStats, optional. Previous stats obj.
        //           Defatult to var recPrevious saved by this.update(..);
        this.daysFromPrevious = function(recCur, recPrev) {
            var nDays = 0;
            var msDays = 0;
            var msFrac = 0;

            if (!(recCur instanceof wigo_ws_GeoTrailRecordStats)) {
                recCur = recCurrent;
            }
            if (!(recPrev instanceof wigo_ws_GeoTrailRecordStats)) {
                recPrev = recPrevious;
            }
            if (recCur && recPrev) {
                msDays = recCur.nTimeStamp - recPrev.nTimeStamp;
                nDays = msDays / (24 * 60 * 60 * 1000); 
                msFrac = nDays - Math.floor(nDays);
                msFrac = msFrac * 24 * 60 * 60 * 1000;
                var dtCur = new Date(recCur.nTimeStamp);
                var dtFrac = new Date(recCur.nTimeStamp + msFrac)
                nDays = Math.floor(nDays);
                // If fractional date over flows into next day, increment nDays.
                if (dtCur.getDate() != dtFrac.getDate()) { // Note: .getDate() returns number for day of month.
                    nDays++;
                }
            }
            return nDays;
        };

        // Returns a string in HTML for a status message based on the metrics.
        this.formStatusMsg = function() {
            var s = "";
            // Helper to append lines.
            // First line does is NOT prepended with a break.
            // Second and following lines are.
            // Note: Prevents final line from ending with a break, which can cause
            //       a blank line before appending another status msg.
            function AppendLine(sText) {
                if (s.length > 0)
                    s += "<br/>";
                s += sText;
            }
            // Form message for distance traveled.
            if (recCurrent) {
                let mDelta = recCurrent.mDistance - mDistanceGoalPerDay;
                if (mDelta > 10) {
                    AppendLine("Great, you exceeded goal of {0} by {1}.".format(lc.to(mDistanceGoalPerDay), lc.to(mDelta)));
                } else if (mDelta > 0) {
                    AppendLine("Great, you met goal of {0}.".format(lc.to(mDistanceGoalPerDay)));
                } else {
                    AppendLine("Keep going {0} to reach goal of {1}.".format(lc.to(-mDelta), lc.to(mDistanceGoalPerDay)));
                }
            }
            // Form message for best distance.
            if (this.isBestDistance(recCurrent)) {
                AppendLine("WOW, longest distance ever, {0}.".format(lc.to(recCurrent.mDistance)));
            } else if (this.isBestMonthlyDistance(recCurrent)) {
                AppendLine("Longest distance, {0}, in {1} days.".format(lc.to(recCurrent.mDistance), (msMonth/msOneDay).toFixed(0))); 
            }
            var nDays = this.daysFromPrevious();
            if (nDays > nMinDaysApart) {
                AppendLine("Try to walk everyday. It is {0} days since your previous walk.".format(nDays.toFixed(0)));
            }
            return s;
        };

        // ** Private Members.
        // Object for element of MonthlyDayAry.
        // Construct Arg:
        //  normalizedDate: Date object with UTC value with hours, minutes, seconds, milliseconds of 12, 0, 0, 0.
        function MonthDayEl(normalizedDate) {
            this.nDate = normalizedDate.getTime(); // number for Data value for the date at 12:00 (noon).
            this.mDistance = 0; // number. distance in meters.
            this.msRunTime = 0; // Number. milliseconds for runtime.
            this.nUpdates = 0; // number. number of times other properties have been upded from various stats obj.
        }
        
        // Object for array of stats for last 30 days.
        function MonthDayAry() {
            // Fills this array from an array of stats objects.
            // Arg:
            //  arRecStat: array of wigo_ws_GeoTrailRecordStats objs used to fill this array.
            // Returns: nothing
            // Sets [out]: var recBestMonthlyDistance, var recBestMonthlySpeed, var bestMonthlySpeed. 
            this.fill = function(arRecStats) {
                // Helper. Normalizes date for a day using UTC, which is useful for finding element of
                // arMonthDay by .nDate.
                // Sets date components hours, minutes, seconds, milliseconds to 12,0,0,0.
                // Arg:
                //  date: ref to Date object that is normalized. data is NOT changed.
                // Returns Date. the normalized date. 
                function ClearHrMinSec(date) {
                    //No date.setHours(12, 0, 0, 0); // Does not work because of daylight saving time
                    //because a date one day before daylight saving time change and date the day after are NOT 24 hours apart.
                    
                    var normalizedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0));
                    // Must use UTC so that the day before daylight saving time change and the day after have the millisecond time difference of of one day.:
                    // For example, Date before: 2018-03-10_04:00:00:00 -TZ 8 PST vs Date after: 2018-03-11_12:05:00:00:00 -TZ 7 PDT.
                    // The getTime() value is one day difference, (24*12*60*1000) in milliseconds. 
                    // The UTC time is 2018-03-10_12:00:00:00 vs 2018-03-11_12:00:00:00
                    return normalizedDate;
                }
                
                // Pads arMonthDay array by pushing new elements that are cleared
                // except each has a previous date.
                // Arg:
                //  toDate: Date obj with normalized hour, minute, second, millisecond components.
                //          Pads up to but not included toDate.
                function PadTo(toDate) {
                    var monthDayEl;
                    if (arMonthDay.length < 1)
                        return; // Should not happen
                    
                    var msOneDay = 24*60*60*1000; // fime for one day in milliseconds.
                    var nFromDate = arMonthDay[arMonthDay.length-1].nDate;
                    var nToDate = toDate.getTime();  
                    for (var i = arMonthDay.length; i < maxSizeOfArMonthDay; i++) {
                        nFromDate -= msOneDay;
                        if (nFromDate <= nToDate) { 
                            // quit when fromDate equals toDate. < should not happen, but check for safety.
                            break;
                        } else {
                            // push a pad element, which indicates no walking activity.
                            monthDayEl = new MonthDayEl(new Date(nFromDate));
                            arMonthDay.push(monthDayEl)
                        }
                    } 
                }
                
                arMonthDay = []; 
                var now = new Date(Date.now());
                now = ClearHrMinSec(now);
                var monthDayEl = new MonthDayEl(now);

                if (arRecStats.length < 1) {
                    // Push current day to array.
                    arMonthDay.push(monthDayEl)
                    // arRecStats is empty so quit, unlikely to happen.
                    return;
                }

                var statsDate = new Date(arRecStats[arRecStats.length-1].nTimeStamp);
                statsDate = ClearHrMinSec(statsDate);

                if (monthDayEl.nDate > statsDate.getTime()) {
                    // Current date more recent than last stats date.
                    // Push current monthDayEl and pad to last stats date.
                    arMonthDay.push(monthDayEl);
                    PadTo(statsDate);
                }               

                // Loop thru arRecStats in descending order from most recent to least recent.
                var stats;
                var prevStatsDate = null;
                var speed; 
                recBestMonthlyDistance = null; 
                recBestMonthlySpeed = null;    
                bestMonthlySpeed = 0;   
                for (var i=arRecStats.length-1; i >= 0; i--) {

                    if (arMonthDay.length >= maxSizeOfArMonthDay)
                        break; // Quit because arMonthDay if full.

                    stats = arRecStats[i];
                    
                    // Check for best distance and speed within a month for each individual run
                    // (not for sum of runs on same day).
                    // Check for best distance.
                    if (!recBestMonthlyDistance)
                        recBestMonthlyDistance = stats;
                    else if (stats.mDistance > recBestMonthlyDistance.mDistance)
                        recBestMonthlyDistance = stats;
                    // Check for best speed.
                    speed = stats.msRunTime > 0 ? stats.mDistance / (stats.msRunTime/1000) : 0;
                    if (!recBestMonthlySpeed) {
                        recBestMonthlySpeed = stats;
                        bestMonthlySpeed = speed;
                    } else if (speed > bestMonthlySpeed) {
                        recBestMonthlySpeed = stats;
                        bestMonthlySpeed = speed;
                    }

                    statsDate = new Date(stats.nTimeStamp); 
                    statsDate = ClearHrMinSec(statsDate); 

                    // Check if prevStatsDate is same as ith monthDay date.
                    if (prevStatsDate ) {
                        if (prevStatsDate.getTime() === statsDate.getTime()) {
                            // Previous stats date is same at ith stats date so update monthDayEl
                            // instead of pushing a new one onto the array.
                            monthDayEl.mDistance += stats.mDistance;
                            monthDayEl.msRunTime += stats.msRunTime;
                            monthDayEl.nUpdates++; 
                            continue; 
                        } else {
                            // Previous stats date is different than ith stats date so
                            // pad array with elements up to ith stats date.
                            PadTo(statsDate);
                        }
                    }
                    if (arMonthDay.length < maxSizeOfArMonthDay) {  
                        // Create and fill new MonthDayEl from ith stats obj.
                        monthDayEl = new MonthDayEl(statsDate);
                        monthDayEl.mDistance = stats.mDistance;
                        monthDayEl.msRunTime = stats.msRunTime;
                        monthDayEl.nDate = statsDate.getTime();
                        monthDayEl.nUpdates++; 
                        // Push the the new monthDayEl to the array.
                        arMonthDay.push(monthDayEl);
                        prevStatsDate = statsDate;  
                    }
                }
            };

            // Returns ref to array array of MonthDayEl objs.
            // The returned array has 30 elements including the current day
            // and 29 previous days:
            //  [29]: MonthDayEl. current day as determined by Date.now().
            //        [29].nDate: number. has least value for date and has most recent (newest) creation date.
            //  ...
            //  [1]: MonthEl. Day previous to day given by [0].
            //       [1].nDate. number. has value < [0].nDay and has creation more recent than [0].nDate.
            //  [0]: MonthEl. Day previous to day given by [1].
            //       [0].nDateDay. number. has least value and has least recent (oldest) creation date.
            this.get = function() {
                return arMonthDay;
            };

            // ** Private members
            var maxSizeOfArMonthDay = 30; // Fixed value for max size of the arMonthDay array.

            // element 0 has smallest date value (oldest creation date).
            // element 29 has the greatest data value (newest creation date),
            var arMonthDay = []; // Array of MonthDayEl objs.

        }

        // Constructor Initialization.
        var msOneDay = 24 * 60 * 60 * 1000;
        var msMonth = 30 * msOneDay; // Time for 30 days, one month, in milliseconds.
        var nMinDaysApart = 2;       // Minimum number of days to skip walking before a warning is shown.
        var mDistanceGoalPerDay = 2 * 1609.34;  // Goal for distance in meters for one day.

        var recBestDistance = null;        // ref to wigo_ws_GeoTrailRecordStats object for longest distance.
        var recBestMonthlyDistance = null; // ref to wigo_ws_GeoTrailRecordStats object for longest distance in last 30 days.
        var recBestSpeed = null;           // ref to wigo_ws_GeoTrailRecordStats object for best speed.
        var recBestMonthlySpeed = null;    // ref to wigo_ws_GeoTrailRecordStats object for best speed in last 30 days.
        
        var bestSpeed = 0;
        var bestMonthlySpeed = 0;

        var recCurrent = null;            // ref to wigo_ws_GeoTrailRecordStats object for current stats object update.
        var recPrevious = null;           // ref to wigo_ws_GeoTrailRecordStats object for previous stats object.
        var monthDayAry = new MonthDayAry(); // MonthDay obj. Used to fill array of days 30 before most recent stats.
    }
    var recordStatsMetrics = new RecordStatsMetrics(); 

    // Object for sending message to Pebble watch.
    var sDegree = String.fromCharCode(0xb0); // Degree symbol.
    var alerter = new Alerter(); // Object for issusing alert to phone.
    var pebbleMsg = new PebbleMessage(); // Object for sending/receiving to/from Pebble watch.
    // Handler for Select button single click received from Pebble.
    pebbleMsg.onSelect1Click = function () {
        DoGeoLocation();
    };

    // Handler for text message received from Pebble.
    pebbleMsg.onTextReceived = function (sText) {
        that.ShowStatus(sText, false); 
    };

    // Set Facebook login.
    var fb = new wigo_ws_FaceBookAuthentication('694318660701967');
    fb.callbackAuthenticated = cbFbAuthenticationCompleted;

    // Object for network (internet) connection state.
    var networkInfo = wigo_ws_NewNetworkInformation(window.app.deviceDetails);

    // Object for navigating back from a link that has been followed in an HTML description. 
    // Construct Arg:
    //  jqsDiv: string for jquery selector of html div element containing the html to be navigated.
    //         Note: For an id, must include # prefix for jquery selector.
    //  jqsBackButton: string for jquery selector of back button. May select multiple buttons.
    //         Note: For an id, must include # prefix for jquery selector.
    //               Any html element that raises a click event can be used.
    function LinkBackNavigation(jqsDiv, jqsBackButton) {  

        // Shows the back button(s) if needed, otherwise hides.
        this.showBackButtonIfNeeded = function() {
            ShowBackButtonIfNeeded();
        };

        // Find all the links in the div.
        var div = $(jqsDiv)[0]; 
        var jqLinks = $(jqsDiv + " a"); // list of jquery elements for HTML link elements.
        jqLinks.on('click', function(event) {
            // Event handler for a link clicked.
            arScrollTop.push(div.scrollTop);
            ShowBackButtonIfNeeded();

        });

        var jqBackButton = $(jqsBackButton);
        jqBackButton.on('click', function(event) {
            // Event handler for back button.
            if (arScrollTop.length > 0) {
                var scrollTop = arScrollTop.pop();
                ShowBackButtonIfNeeded();
                if (div) {
                    div.scrollTop = scrollTop;
                }
            }
        });

        // Shows the back button(s) if needed, otherwise hides.
        function ShowBackButtonIfNeeded() {
            var bVisible = arScrollTop.length > 0;
            if (bVisible)
                jqBackButton.show();
            else 
                jqBackButton.hide();
        }

        // Stack of scroll top number. When link is clicked, 
        // the current scroll top is pushed to stack.
        var arScrollTop = []; 
        // Initially hide the back button when object is constructed.
        ShowBackButtonIfNeeded(); 
    }
    var linkBackNavigationHelpGuide = new LinkBackNavigation('#divHelpGuide','#buBackDialogBar'); 
    var buBackDialogBar = document.getElementById('buBackDialogBar');  
    
    // Hide back button on CloseDialogBar.
    // Note: img is used for element and ShowElement(bu, false) fails because img style is forced to display: block.
    var jqbuBackDialogBar = $('#buBackDialogBar'); 
    function HideCloseDialogBackButton() {  
        jqbuBackDialogBar.hide();
    }
}

// Object for controller of the page.
function wigo_ws_Controller() {
    var that = this;
    var view = new wigo_ws_View();
    var model = new wigo_ws_Model(window.app.deviceDetails);

    // ** Handlers for events fired by view.

    // Initialize after a mode change.
    view.onModeChanged = function (nNewMode) {
        gpxArray = null;
        gpxOfflineArray = null;
    };

    // Save OwnerId that was entered.
    view.onOwnerId = function (sOwnerId) {
        model.setOwnerId(sOwnerId);
    };

    // Show the geo path info (map) for the selected path.
    view.onPathSelected = function (nMode, iPathList) {
        if (nMode === view.eMode.online_view) {
            if (gpxArray && iPathList >= 0 && iPathList < gpxArray.length) {
                var gpx = gpxArray[iPathList];
                // Show the geo path info.
                var path = model.ParseGpxXml(gpx.xmlData); // Parse the xml to get path data.
                view.ShowPathInfo(true, path); // true => show droplist for selecting a path instead of hide. Path is always drawn.
            }
        } else if (nMode === view.eMode.offline) {
            // Show the geo path info for an offline map. 
            if (gpxOfflineArray && iPathList >= 0 && iPathList < gpxOfflineArray.length) {
                var oParams = gpxOfflineArray[iPathList];
                view.ShowOfflinePathInfo(true, oParams);
            }
        } else if (nMode === view.eMode.online_edit) {
            // Fire path selected event for editing.
            var fsm = view.fsmEdit();
            fsm.gpxPath = null;
            fsm.nPathId = 0;
            if (gpxArray && iPathList >= 0 && iPathList < gpxArray.length) {
                var gpx = gpxArray[iPathList];
                // Select options for the selectShare drop list.
                var eShare = model.eShare();
                var sShare = eShare.toStr(gpx.eShare);
                view.setShareOption(sShare);
                // Set the gpx data for the selected path.
                fsm.nPathId = gpx.nId;  
                fsm.gpxPath = model.ParseGpxXml(gpx.xmlData); // Parse the xml to get path data.
            }
            fsm.DoEditTransition(fsm.eventEdit.SelectedPath);
        } else if (nMode === view.eMode.online_define) {
            // Fire path selected event for editing.
            var fsm = view.fsmEdit();
            fsm.DoEditTransition(fsm.eventEdit.SelectedPath);
        }
    };


    // Gets wigo_ws_GpxPath object for a path.
    // Signature of Handler:
    //      nMode: view.eMode enumeration.
    //      iPathList: number. index to array of data for the paths. 
    //      Returns: wigo_ws_GpxPath obj. Data for path. null if iPathList is invalid.
    view.onGetPath = function(nMode, iPathList) { 
        var path = null;
        var nMode = view.curMode(); 
        if (nMode === view.eMode.online_view) {
            if (gpxArray && iPathList >= 0 && iPathList < gpxArray.length) {
                var gpx = gpxArray[iPathList];
                // Show the geo path info.
                path = model.ParseGpxXml(gpx.xmlData); // Parse the xml to get path data.
            }
        }
        return path;
    }

    // Returns offline parameters item for an offline path.
    // Returned object: wigo_ws_GeoPathMap.OfflineParams.
    // Args:
    //  nMode: value of view.eMode. Currently assumes view.eMode.offline.
    //  nIx: number. index of item in list of offline paths. 
    // Note: Returns null if item is not found.
    view.onGetPathOffline = function(nMode, nIx) {
        var params = null;
        if (gpxOfflineArray && nIx >= 0 && nIx < gpxOfflineArray.length) {
            params = gpxOfflineArray[nIx];
        }
        return params;
    }

    // Save offline parameters for the selected geo path.
    // Args
    //  nMode: byte value of this.eMode enumeration. 
    //  params: wigo_ws_GeoPathMap.OfflineParams object geo path to save offline.
    //          Note: For nMode equal view.eMode.online_view and not recording a trail,
    //          params.nId and params.sName are set by this function from corresponding item in gpxArray.
    // Note: Used to save selected trail locally or the map area if no trail is selected.
    //       See view.onSavePathLocally for saving the current recorded trail locally.
    view.onSavePathOffline = function (nMode, params) {
        if ( nMode === view.eMode.online_view) { 
            // Save the params to storage.
            if (params.nIx >= 0 && gpxArray && params.nIx < gpxArray.length) {
                var gpx = gpxArray[params.nIx];
                params.name = gpx.sName;
                params.nId = gpx.nId;
                params.gpxPath = model.ParseGpxXml(gpx.xmlData);
            } else { 
                // Save map area instead of a trail.
                params.gpxPath = new wigo_ws_GpxPath();
                params.nId = 0; // 0 neams a new params object to save offline using next sequential negative params.NId when saving.
                params.gpxPath.gptSW = params.bounds.sw;
                params.gpxPath.gptNE = params.bounds.ne;
                params.gpxPath.gptBegin = params.center;
                params.gpxPath.gptEnd = params.center;
                params.gpxPath.arGeoPt  = []; // Array of wigo_ws_GeoPt objs. Single point for center of map on screen.
                params.gpxPath.arGeoPt.push(params.gpxPath.gptBegin);
                params.gpxPath.arGeoPt.push(params.gpxPath.gptEnd);
                params.gpxPath.bOk = true;
            }

            // Cache the map tiles.
            view.CacheMap(function (status) {
                // Show Status updates.
                view.ShowStatus(status.sMsg, status.bError);
                if (status.bDone) {
                    if (!status.bCancel)
                        view.ShowAlert(status.sMsg);
                    view.ClearStatus();
                    if (!status.bError && !status.bCancel) {
                        // Save the offline params in localStorage for 
                        // using trail offline from cache.
                        model.setOfflineParams(params);
                    }
                }
            });
        } 
    };

    // Save locally parameters for a trail.
    // Args
    //  nMode: byte value of this.eMode enumeration. 
    //  params: wigo_ws_GeoPathMap.OfflineParams object geo path to save offline.
    //          Note: For nMode equal view.eMode.online_view and not recording a trail,
    //          params.nId and params.sName are set by this function from corresponding item in gpxArray.
    // Note: Used to save the current recorded trail locally.
    //       See view.onSavePathOffline for saving selected trail or map area locally.
    view.onSavePathLocally = function(nMode, params) { 
        if (nMode === view.eMode.offline) {  
            // Save parameters to local storage, but do not cache map tiles because offline.
            model.setOfflineParams(params);
            // Reload the path list without redrawing on map, and keep previous selection before reloading.
            var pathNames = GetOfflinePathNameArray();
            view.loadPathList(pathNames.arPathName, true); // true => sort
        } else if (nMode === view.eMode.online_view) {
            // Save parameters to local storage, but do not cache map tiles.
            model.setOfflineParams(params);
        }
    }

    // Replaces offline path in list of geo paths.
    //  nMode: value of view.eMode. Currently assumes view.eMode.offline.
    //  nId: number. id of offline path to replace.
    //  params: wigo_ws_GeoPathMap.OfflineParams object. The oject that replaces object identified by nId.
    //  Returns: boolean. true for params replaced, false if nId is not found.
    // Note: If nId is not found in list of offline geo paths, the list is unchanged.
    view.onReplacePathOffline = function(nMode, nId, params) { 
        var bReplaced = model.replaceOfflineParams(nId, params); 
        // Update display for in case path name has changed for the display.
        if (bReplaced) {
            if (gpxOfflineArray) {
                var el; // ref to el, wigo_ws_GeoPathMap.OfflineParams object.
                for (var i=0; i < gpxOfflineArray.length; i++) {
                    el = gpxOfflineArray[i];
                    if (el.nId === params.nId)  {
                        // Update display for the new path.
                        var sDataValue = i.toFixed(0);
                        view.updatePathItem(sDataValue, params.name); 
                    }
                }
            }
        }

        return bReplaced;
    };

    // Deletes offline path in list of geo paths.
    //  nMode: value of view.eMode. Currently assumes view.eMode.offline.
    //  nId: number. id of offline path to replace. 
    //               id is member of  wigo_ws_GeoPathMap.OfflineParams object in the offline list.
    //  Returns: boolean. true for path object deleted, false if nId is not found.
    // Note: If nId is not found in list of offline geo paths, the list is unchanged.
    view.onDeletePathOffline = function(nMode, nId) { 
        var bDeleted = model.deleteOfflineParams(nId);
        return bDeleted;
    };  
    

    // Get list of geo paths from model to show in a list in the view.
    //  nMode: byte value of this.eMode enumeration.
    //  sPathOwnerId: string for path owner id for getting the paths from server.
    view.onGetPaths = function (nMode, sPathOwnerId) {
        GetGeoPaths(nMode, sPathOwnerId);
    };

    // Find list of geo paths to show in a list. 
    // Similar to this.onGetPaths(..) above, except used to find by lat/lon rectangle as well
    // as be user id.
    // Handler Signature
    //  sOwnerId: string for path owner id.
    //  nFindIx: number this.eFindIx enumeration for kind of find to do.
    //  gptSW: wigo_ws_GeoPt for Southwest corner of rectangle. If null, do not find by lat/lon.
    //  gptNE: wigo_ws_GeoPt for NorthEast corner of rectangle. If null, do not find by lat/lon.
    view.onFindPaths = function (sOwnerId, nFindIx, gptSW, gptNE) {
        FindGeoPaths(sOwnerId, nFindIx, gptSW, gptNE);
    };

    // Upload a path to the server.
    //  nMode: byte value of this.eMode enumeration.
    //  path: Obj created by view.NewUploadPathObj().
    //        upload path object which contains array of GeoPt elements and other members.
    view.onUpload = function (nMode, path) { 
        if (model.IsOwnerAccessValid()) {
            var gpx = new wigo_ws_Gpx();
            gpx.nId = path.nId;
            gpx.sOwnerId = path.sOwnerId;
            gpx.eShare = model.eShare().toNum(path.sShare);
            gpx.sName = path.sPathName;

            // Set gpx.xmlData, gpx.gptBegin, gpx.gptEnd, gpx.gptSW, gpx.gptNE 
            // based on the array of GeoPt elements in path.
            wigo_ws_Gpx.FillGeoPts(gpx, path.arGeoPt);

            // gpx.tModified is dont care because server sets tModified when storing record to database.
            // Put Gpx object to server via the model.
            var bPutOk = model.putGpx(gpx,
                // Async callback upon storing record at server.
                function (bOk, sStatus) {
                    var nId = 0;
                    var sPathName = ""; 
                    var sStatusMsg;
                    var sUploadOkMsg = "Successfully uploaded GPX trail:<br/>{0}.".format(gpx.sName);
                    if (bOk) {
                        var oStatus = JSON.parse(sStatus);
                        nId = oStatus.nId;
                        sPathName = oStatus.sName;  
                        var eDuplicate = model.eDuplicate();
                        if (oStatus.eDup === eDuplicate.Renamed) {
                            // Set message about renaming path.
                            sStatusMsg = sUploadOkMsg;
                            sStatusMsg += "<br/>";
                            sStatusMsg += oStatus.sMsg;
                        } else if (oStatus.eDup === eDuplicate.Match) {
                            // gpx obj has same name as its record in database so there is no name change.
                            // No need to reload the list of paths.
                            sStatusMsg = sUploadOkMsg;
                        } else if (oStatus.eDup === eDuplicate.NotDup) {
                            sStatusMsg = sUploadOkMsg;
                        } else {
                            sStatusMsg = "Error occurred uploading GPX trail.";
                        }
                    } else {
                        // Set error message.
                        if (!sStatus) 
                            sStatus = "Error trying to upload GPX trail to server.";
                        sStatusMsg = sStatus;
                    }
                    view.uploadPathCompleted(nMode, bOk, sStatusMsg, nId, sPathName, true); // true => upload. 
                });
            if (!bPutOk) {
                var sError = "Cannot upload GPX trail to server because another transfer is already in progress.";
                view.uploadPathCompleted(nMode, false, sError, path.nId, path.sPathName, true); // false => not ok, true => upload.  
            }
        } else { 
            var sError = "Owner must be signed in to upload GPX trail to server.";
            view.ShowStatus(sError);
            view.uploadPathCompleted(nMode, false, sError, path.nId, path.sPathName, true); // false => not ok, true => upload. 
        }        
    };

    // Delete a geo path record at the server.
    //  nMode: byte value of this.eMode enumeration.
    //  gpxId: {sOwnerId: string, nId: integer} 
    //      sOwnerId: owner (user) id of logged in user.
    //      nId: unique id for gpx path record at server.
    view.onDelete = function (nMode, gpxId) {
        var fsm = view.fsmEdit();
        if (model.IsOwnerAccessValid()) {
            var bOk = model.deleteGpx(gpxId,
                // Async callback upon storing record at server.
                function (bOk, sStatus) {
                    if (!sStatus) 
                        sStatus = "Error trying to delete GPX trail at server.";
                    var sMsg = bOk ? "Successfully deleted GPX trail at server." : sStatus;
                    view.ShowStatus(sMsg, !bOk);
                    view.uploadPathCompleted(nMode, bOk, sMsg, gpxId.nId, "", false); // Note: empty string for path name means not known. false => delete.
                });
            if (!bOk) {
                var sError = "Cannot delete GPX trail at server because another transfer is already in progress.";
                view.ShowStatus(sError, !bOk);
                view.uploadPathCompleted(nMode, bOk, sError, gpxId.nId, "", false); // Note: empty string for path name means not known. false => delete.
            }
        } else {
            var sError = "Owner must be signed in to delete GPX trail at server.";
            view.ShowStatus(sError);
            view.uploadPathCompleted(nMode, bOk, sError, gpxId.nId, "", false); // Note: empty string for path name means not known. false => delete.
        }
    };

    // Saves the settings to localStorage and as the current settings.
    // Arg:
    //  settings: wigo_ws_GeoTrailSettings object to save to localStorage.
    view.onSaveSettings = function (settings) {
        return model.setSettings(settings);
    }

    // Returns current settings, a wigo_ws_GeoTrailSettings object.
    view.onGetSettings = function () {
        var settings = model.getSettings();
        if (app.deviceDetails.isiPhone()) {  
            //???? // Do no allow automatic geo tracking nor Pebble watch.
            //???? settings.bAllowGeoTracking = false;
            settings.bPebbleAlert = false; 
        }
        return settings;
    };

    // Gets the last record stats object for a record trail.
    //  Args: none.
    //  Returns wigo_ws_GeoTrailRecordStats object for last stats saved, 
    //      or null if there is no record stats object.
    view.onGetLastRecordStats = function() {
        return model.getLastRecordStats();
    };  

    // Gets a record stats obj specified by a timestamp.
    // Arg:
    //  nTimeStamp: number. timestamp in milliseconds to find.
    view.getRecordStats = function(nTimeStamp) { 
        return model.getRecordStats(nTimeStamp); 
    };

    // Gets list of recorded stats.
    // Arg: none.
    // Returns: Array of wigo_ws_GeoTrailRecordStat objects.
    view.onGetRecordStatsList = function() { 
        return model.getRecordStatsList(); 
    };

    // Sets recorded starts.
    //  Args: 
    //    stats: literal obj from recordPath.getStats() | wigo_ws_GeoTrailRecordStats obj. stats to be set.
    //           If stats is literal obj from recordPath.getStats, stats is converted to wigo_ws_GeoTrailRecordStats
    //           object that is set in localStorage.
    //  Returns: wigo_ws_GeoTrailRecordStats obj.
    // Note: 
    // literal obj for stats from recordPath.getStats():
    //   {bOk: boolean, dTotal:number,  msRecordTime: number, msElapsedTime: number, 
    //    tStart: Date | null, kJoules: number, calories: number, nExcessiveV: number, calories2: number, calories3: number}; 
    //   The returned object is converted to a wigo_ws_GeoTrailRecordStats obj.
    view.onSetRecordStats = function(stats) { 
        var data = null;
        if (typeof stats !== 'undefined') {
            if (stats instanceof wigo_ws_GeoTrailRecordStats) {
                data = stats;
            } else if ( typeof stats.kJoules === 'number') {
                data = ConvertRecordStatsToData(stats);
            }
        }
        if (data)
            model.setRecordStats(data);
        return data; 
    }; 

    // Deletes elements from the record stats and saves to localStorage.
    // Arg:
    //  arEl: {keyi: timestamp, ...}. Object (not array). List specifying elements to delete.
    //      keyi: string. key for ith element.
    //      nTimeStamp: number. Timestamp in milliseconds, which is unique, for element to delete.
    view.onDeleteRecordStats = function(arEl) { 
        model.deleteRecordStats(arEl);
    }; 

    // Clears the list of record stats objects for recorded trails.
    //  Args: none.
    //  Returns nothing.
    view.onClearRecordStats = function() {
        model.clearRecordStats();
    };

    // Gets accessor to RecordStatsXfr info and residue.
    // Returns: ref to RecordStatsXfr obj.
    view.onGetRecordStatsXfr = function() { 
        return model.getRecordStatsXfr();
    };

    // Saves app version to localStorage.
    // Arg:
    //  version: wigo_ws.GeoTrailVersion object to save to localStorage.
    view.onSaveVersion = function(version) {
         model.setVersion(version);
    };

    // Returns current app version, a wigo_ws_GeoTrailVersion object.
    view.onGetVersion = function() {
        return model.getVersion();
    };

    // Clears offline parameters in local storage when map cache has been cleared.
    view.onMapCacheCleared = function () {
        model.clearOffLineParamsList();
    };

    view.onAuthenticationCompleted = function (result) {

        // result = {userName: _userName, userID: _userID, accessToken: _accessToken, status: nStatus}
        var eStatus = view.eAuthStatus();
        if (result.status === eStatus.Ok) {
            // Show success.
            view.ShowStatus("Successfully authenticated by OAuth.", false);
            // Update database for authenticated owner.
            var bOk = model.authenticate(result.accessToken, result.userID, result.userName, function (result) {
                var recordStatsXfr = model.getRecordStatsXfr();
                var sPreviousOwnerId = recordStatsXfr.getPreviousOwnerId();
                var bSameUser = result.userID === sPreviousOwnerId; 
                // Save user info to localStorage.
                model.setOwnerId(result.userID);
                model.setOwnerName(result.userName);
                model.setAccessHandle(result.accessHandle);
                view.setOwnerName(result.userName);
                view.setOwnerId(result.userID);
                if (result.status === model.eAuthStatus().Ok) {
                    // Upload record stats residue if need be for user that signed in and download record stats.
                    // Helper to complete successful athentication after download Record Stats items for new user.
                    function DoForAuthOk() { 
                        view.AppendStatus("User successfully logged in.", false);
                        var nMode = view.curMode();
                        if (nMode === view.eMode.online_view) {
                            // Check if logon is due to recording a trail, in which case 
                            // do not call view.onGetPaths(..) because the download from server
                            // takes time and the upload for the recorded trail fails if another transfer
                            // request is in already in progress. Always calling view.onGetPaths() works
                            // fairly well, but can be confusing to user if it causes uploading a new trail to fail,
                            // in which case the user would need to retry uploading the trail.
                            if (!view.IsRecordingSignInActive())   
                                view.onGetPaths(view.curMode(), view.getOwnerId());
                        } else if (nMode === view.eMode.online_edit ||
                                   nMode === view.eMode.online_define) {
                            // Fire SignedIn event.
                            var fsm = view.fsmEdit();
                            fsm.DoEditTransition(fsm.eventEdit.SignedIn);
                        }
    
                    }

                    // Helper to upload residue for result.sOwnerId.
                    // Arg:
                    //  onDone: Async callback after upload is completed. Signature:
                    //              Arg:
                    //                  bOk: boolean: true for successful upload of residue.
                    //              Return: none.
                    //          If there is no residue to upload, callback is immediate  with bOk true.
                    // Synchronous Return: boolean. true for ok. false for failed to start upload.
                    function DoUploadResidue(onDone) {
                        // Upload record stats residue if there is a residue then download record stats.
                        var bOk = true;
                        var arResidueRecStats = recordStatsXfr.getResideAry(result.userID);
                        if (arResidueRecStats.length > 0) {
                            bOk = model.uploadRecordStatsList(arResidueRecStats, function(bOk, sStatus) {
                                if (bOk) {
                                    recordStatsXfr.clearResidue(result.userID); 
                                } else { 
                                    view.AppendStatus("Failed to upload residual Record Stats items: " + sStatus);
                                }
                                onDone(bOk);
                            });
                        } else {
                            onDone(true);
                        }
                        return bOk;
                    }

                    // Helper to download record stats for user.
                    // Note: Only call afer a successful upload.
                    function DoDownloadRecStats() {
                        var bOk = model.downloadRecordStatsList(function(bOk, arRecStats, sStatus){
                            if (bOk) {
                                // Know that any residue for new user has been uploaded.
                                // Thus, the first time a user signs in with some record stats, those stats have
                                // been uploaded as a residue. If the download for new user is empty, the new
                                // user has no record stats.
                                
                                // Set Record Stats History data in localStorage for the new user.
                                model.setRecordStatsList(arRecStats);
                                // Set the most recent upload timestamp for updating a new record stats item at server.
                                var nUploadTimeStamp = arRecStats.length > 0 ? arRecStats[arRecStats.length-1].nTimeStamp : 0;
                                recordStatsXfr.setUploadTimeStamp(nUploadTimeStamp);
                                // Clear the RecordStatsHistory ui.
                                view.clearRecordStatsHistory(); 
                                // If view is Stats History, reload the view.
                                if (view.curMode() === view.eMode.record_stats_view) {
                                    view.setModeUI(view.eMode.record_stats_view);
                                } 
                            } else {
                                view.AppendStatus("Failed to download Record Stats items: " + sStatus);
                                DoXfrErrorCleanup();
                            }
                            // Complete the successful authentication.
                            DoForAuthOk();
                        });
                        // Check syncrhonous return. Expect to always be ok.
                        if (!bOk) { 
                            DoXfrErrorCleanup();  // Upload could not start. Unusual conflict for exchange with server.
                            DoForAuthOk(); 
                        }
                    }

                    // Helper to clean up after an upload or download error.
                    // Resets the local stats history data if for a different user.
                    // Clears the RecordStatsHistory ui list.
                    function DoXfrErrorCleanup() { 
                        // If sPreviousOwnerId is empty, the local record stats are for no user signed in.
                        // In this case leave the them as is, otherwise reset for the new user.
                        if (sPreviousOwnerId.length > 0 && sPreviousOwnerId !== result.userId) {
                            // The local record stats are for a different user.
                            // Clear the list of record stats in memory and in localStorage.
                            model.setRecordStatsList([]); 
                            recordStatsXfr.setUploadTimeStamp(0);
                        }
                        // Clear the RecordStatsHistory ui so it will be loaded again when Stats History View is selected.
                        view.clearRecordStatsHistory();   
                    }

                    view.ClearStatus();
                    // Append existing record stats that have not been uploade (if any) to residie of new user.
                    var arUploadRecStats = recordStatsXfr.getRecordStatsUploadNeeded();
                    recordStatsXfr.appendResidueAry(result.userID, arUploadRecStats); 
                    if (bSameUser) {
                        // Upload residue (if any) of new user.
                        DoUploadResidue(function(bOk){
                            // For an upload error, do cleanup.
                            if (!bOk) {
                                DoXfrErrorCleanup();
                            }
                            // Complete the successful authentication regardless.
                            DoForAuthOk();
                        });
                    } else {
                        // User has changed so need to get the record stats history for the new user.
                        // For new user upload record stats residue (if any) then download record stats.
                        var bOk = DoUploadResidue(function(bOk) {
                            // Download stats for new user.
                            if (bOk) {
                                DoDownloadRecStats();
                            } else {
                                // Clean up after a residue upload error.
                                DoXfrErrorCleanup();
                                // Complete successful authentication regardless.
                                DoForAuthOk();
                            }  
                        });
                        // Check syncrhonous return. Expect to always be ok.
                        if (!bOk) { 
                            DoXfrErrorCleanup();  // Upload could not start. Unusual conflict for exchange with server.
                            DoForAuthOk(); 
                        }
                    }
                } else {
                    // var sMsg = "Authentication failed:{0}status: {1}{0}UserID: {2}{0}User Name: {3}{0}AccessHandle: {4}{0}msg: {5}".format("<br/>", result.status, result.userID, result.userName, result.accessHandle, result.msg);
                    // Note: result has info for debug.
                    var sMsg = "Server-side authentication failed.<br/>" +
                               "You may need to go to Facebook and Log Out<br/>" +
                               "so that your old authentication is reset.";
                    if (result.msg)                       
                        sMsg += "<br/>" + result.msg;     
                    view.ShowStatus(sMsg);
                }
            });
            // Check synchronous return. Expect to always be ok. 
            if (!bOk) { 
                // Failed to start transfer with server. 
                view.ShowStatus("Sign-in failed. Check network access and try again."); 
            }
        } else if (result.status === eStatus.Logout) {
            // Note: result not meaningful on logout completed because 
            //       result.userID, result.accessToken have been set to empty.
            // Successfully logged out of OAuth provider (Facebook).
            view.ShowStatus("Successfully logged out by OAuth.", false);
            var sOwnerId = model.getOwnerId();
            var bOwnerIdValid = sOwnerId.length > 0;
            if (bOwnerIdValid) {
                model.logout(function (bOk, sMsg) {
                    if (bOk) {
                        var nMode = view.curMode();
                        if (nMode === view.eMode.online_view ||
                            nMode === view.eMode.offline) {
                            view.ShowStatus("Successfully logged out.", false);
                            // Show geo path for no user logged in.
                            view.onGetPaths(nMode, view.getOwnerId());
                        } else {
                            // Edit or Define mode.
                            // Note: Logout should not be possible for Define or Edit mode.
                            view.ShowStatus("Successfully logged out.", false);
                        }

                    } else {
                        var sError = "Error logging out: <br/>{0}".format(sMsg);
                        view.ShowStatus(sError);
                    }
                });
            } else {
                view.ShowStatus("No owner logged in.");
            }

            // Clear user info in localStorage.
            model.setAccessHandle("");
            model.setOwnerId("");
            model.setOwnerName("");
            // Clear textbox and id view for owner.
            view.clearOwner();
        } else if (result.status === eStatus.Canceled) {
            view.ShowStatus("Login cancelled.", false);
        } else {
            // Show error.
            var sError = "Authentication failed. " + result.sError;
            view.ShowStatus(sError);
        }
    };


    // Reset http request that may be in progress.
    // Handler Signature:
    //  nMode: byte value of this.eMode enumeration.
    view.onResetRequest = function(nMode) {  
        model.resetRequest();
    };

    // ** More private members
    var gpxArray = null; // Array of wigo_ws_Gpx object obtained from model.
    var gpxOfflineArray = null; // Array of wigo_ws_GeoPathMap.OfflineParams objects obtained from model.

    // Converts record path stats to data to save to local storage.
    // Returns: wigo_ws_GeoTrailRecordStats object. 
    //  Args: 
    //    stats: literal obj. stats from recordPath.getStats() member of wigo_ws_GeoPathMap object.
    // Note: 
    // literal obj for stats:
    //   {bOk: boolean, dTotal:number,  msRecordTime: number, msElapsedTime: number, 
    //    tStart: Date | null, kJoules: number, calories: number, nExcessiveV: number, calories2: number, calories3: number}
    function ConvertRecordStatsToData(stats) {
        var data = new wigo_ws_GeoTrailRecordStats();
        data.nTimeStamp = stats.tStart ? stats.tStart.getTime() : 0;
        data.msRunTime = stats.msRecordTime;
        data.mDistance = stats.dTotal;
        data.caloriesKinetic = stats.calories;
        data.caloriesBurnedCalc = stats.calories3;
        return data;
    }

    // Get list of geo paths from the model and show the list in the view.
    // Args:
    //  nMode: view.eMode for current view mode.
    //  sPathOwnerId: string for owner id for the list.
    function GetGeoPaths(nMode, sPathOwnerId) {
        // Get list of geo paths from the server.
        if (nMode === view.eMode.online_view) {
            // Use FindGeoPaths(..), which finds paths within a geo rectangle as well 
            // as by user id.
            var viewFindParams = view.getViewFindParams();
            FindGeoPaths(sPathOwnerId, viewFindParams.nFindIx, viewFindParams.gptSW, viewFindParams.gptNE);
        } else if (nMode === view.eMode.online_edit) {
            // Use FindGeoPaths(..), which finds paths within a geo rectangle as well 
            // as by user id.
            var bQuiet = true; // Do not show status msg on success.
            var homeArea = view.getHomeArea();
            FindGeoPaths(sPathOwnerId, view.eFindIx.all_mine, null, null, bQuiet);
        } else if (nMode === view.eMode.offline) {
            // Get list of offline geo paths from local storage.
            gpxOfflineArray = model.getOfflineParamsList();
            
            var pathNames = GetOfflinePathNameArray(); 
            view.setPathList(pathNames.arPathName);
        }
    }

    // Forms an array of path names from gpxOfflineArray, an array of offline parameters for paths.
    // Returns: {arPathName: arPathName, minId: minId}
    //  arPathNane: array of string. Each element is a path name.
    //      order of elements in array is same order as in gpxOfflineArray.           
    //  minId: number. minumum psuedo path database id, which is 0 if there is no psuedo id.
    //      Note: A negative id indicates the path has not been saved to server.
    function GetOfflinePathNameArray() { 
        // Show the list of paths in the view.
        var minId = 0; // Miniumun psuedo id for offline trails. 
        var oParams;
        var arPathName = new Array();
        for (var i = 0; i < gpxOfflineArray.length; i++) {
            oParams = gpxOfflineArray[i];
            arPathName.push(oParams.name); 
            if (oParams.nId < minId)  
                minId = oParams.nId;  
        }
        var result = {arPathName: arPathName, minId: minId};
        return result;
    }

    // Find list of geo paths from the model and show the list in the view.
    // An optional rectangle for the geo area including the paths may be given. 
    // Similar to GetGeoPaths(..) above, except used to find by lat/lon rectangle as well
    // as be user id.
    // Args
    //  sOwnerId: string for path owner id.
    //  nFindIx: number view.eFindIx enumeration for kind of find to do.
    //  gptSW: wigo_ws_GeoPt for Southwest corner of rectangle. If null, do not find by lat/lon.
    //  gptNE: wigo_ws_GeoPt for NorthEast corner of rectangle. If null, do not find by lat/lon.
    //  bQuiet: boolean. No longer used.
    function FindGeoPaths(sPathOwnerId, nFindIx, gptSW, gptNE) {
        gpxArray = new Array(); // Clear existing gpxArray.
        var arPath = new Array(); // List of path names to show in view.

        // Local helper to create and return an array of path markers for the map.
        // Note: path markers are only created for online_view, otherwise an
        //       empty array of path markers is returned.
        function CreatePathMarkerArray() { 
            var arPathMarker = [];
            if (view.curMode() === view.eMode.online_view) {
                var markerEl, gpxEl;
                for (var i=0; gpxArray && i < gpxArray.length; i++) {
                    gpxEl = gpxArray[i];
                    markerEl = view.newPathMarkerEl();
                    markerEl.pathName = gpxEl.sName;
                    markerEl.dataIx = i;
                    markerEl.sDescr = "Some description: ";
                    markerEl.latLngMarker = L.latLng(gpxEl.gptBegin.lat, gpxEl.gptBegin.lon); 
                    arPathMarker.push(markerEl);
                }
            }
            return arPathMarker;
        }
        
        // Local helper to call after getting geo list is completed.
        // Appends to path list and shows status message.
        function AppendToPathList (bOk, gpxList, sStatus) {  // sStatus no longer used.
            if (bOk) {
                for (var i = 0; gpxArray && gpxList && i < gpxList.length; i++) { // Added check for gpxArray not null. Saw it happen in debug once.
                    arPath.push(gpxList[i].sName);
                    gpxArray.push(gpxList[i]);
                }
            }
        }

        // Local helper to form part of msg indicating trails <for kind of search>.
        // <for kind of search> is determined base on nFindIx.
        // Returns: string. " for <kind of search>" 
        //          <kind of search> is a phrase for the kind of search, e.g All Trails.
        function TrailsForMsg() {
            var sMsg;
            switch (nFindIx) {
                case view.eFindIx.home_area:  sMsg = ' for Home Area Trails'; break;
                case view.eFindIx.on_screen:  sMsg = ' for On Screen Trails'; break;
                case view.eFindIx.all_public: sMsg = ' for All Public Trails'; break; 
                case view.eFindIx.all_mine:   sMsg = ' for All My Trails'; break;
                case view.eFindIx.my_public:  sMsg = ' for My Public Trails'; break;
                case view.eFindIx.my_private: sMsg = ' for My Private Trails'; break;
                default: sMsg = "";
            }
            return sMsg;
        }


        // Local helper that returns a status message for ok.
        function StatusOkMsg(nCount) {
            var sMsg;
            if (nCount <= 0) {
                sMsg = "No trails found{0}.".format(TrailsForMsg());
            } else {
                sMsg = "Found {0}{1}.<br/>Select from droplist.".format(nCount, TrailsForMsg());
            }
            return sMsg;
        }

        // Local helper to set path list in the view.
        function SetPathList(bOk, sStatus) {  
            // Set path list in the view.
            var arPathMarker = CreatePathMarkerArray(); 
            view.setPathList(arPath, true, arPathMarker);  
            // Show number of paths found.
            if (bOk) {
                view.AppendStatus(StatusOkMsg(arPath.length), false);  
                // Ensure signin control bar is hidden in case it was shown
                // due to an authentication failure.
                view.ShowSignInCtrl(false); 
            } else { 
                // The error is typically due to authentication failure. 
                // Show signin controll bar so that user can signin.
                view.ShowSignInCtrl(true);  
                view.AppendStatus(sStatus, !bOk); 
            }
        }

        var eShare = model.eShare();
        switch (nFindIx) {
            case view.eFindIx.home_area:
            case view.eFindIx.on_screen:
                var sSearchingFor = nFindIx === view.eFindIx.home_area ? "Searching for trails in Home Area." : "Searching for trails On Screen."
                view.ShowStatus(sSearchingFor, false);   
                if (gptSW && gptNE) {
                    // Get all public paths found on screen.
                    model.getGpxListByLatLon("any", eShare.public, gptSW, gptNE, function (bOk, gpxList, sStatus) {
                        AppendToPathList(bOk, gpxList, sStatus);
                        if (bOk && sPathOwnerId) {
                            // Append all private paths for path owner found on screen.
                            model.getGpxListByLatLon(sPathOwnerId, eShare.private, gptSW, gptNE, function (bOk, gpxList, sStatus) {
                                AppendToPathList(bOk, gpxList, sStatus);
                                SetPathList(bOk, sStatus);
                            });
                        } else {
                            SetPathList(bOk, sStatus);
                        }
                    });
                }
                break;
            case view.eFindIx.all_public:
                // Get all public paths for any path owner.
                view.ShowStatus("Searching for All Public Trails.", false);
                model.getGpxList("any", eShare.public, function (bOk, gpxList, sStatus) {
                    AppendToPathList(bOk, gpxList, sStatus);
                    /* Comment out getting private trails of logged in user. Confusing to mix public and private.
                    if (bOk && sPathOwnerId) {
                        // Append all private paths for path owner.
                        model.getGpxList(sPathOwnerId, eShare.private, function (bOk, gpxList, sStatus) {
                            AppendToPathList(bOk, gpxList, sStatus);
                            SetPathList(bOk);
                        });
                    } else {
                        SetPathList(bOk);
                    }
                    */
                    SetPathList(bOk, sStatus); 
                });
                break;
            case view.eFindIx.all_mine:
                // Get all public paths for path owner.
                view.ShowStatus("Searching for All My trails.", false);
                model.getGpxList(sPathOwnerId, eShare.public, function (bOk, gpxList, sStatus) {
                    AppendToPathList(bOk, gpxList, sStatus);
                    if (bOk && sPathOwnerId) {
                        // Append all private paths for path owner.
                        model.getGpxList(sPathOwnerId, eShare.private, function (bOk, gpxList, sStatus) {
                            AppendToPathList(bOk, gpxList, sStatus);
                            SetPathList(bOk, sStatus);
                        });
                    } else {
                        SetPathList(bOk, sStatus);
                    }
                });
                break;
            case view.eFindIx.my_public:
                // Get all public paths for path owner.
                view.ShowStatus("Searching for My Public trails.", false);
                model.getGpxList(sPathOwnerId, eShare.public, function (bOk, gpxList, sStatus) {
                    AppendToPathList(bOk, gpxList, sStatus);
                    SetPathList(bOk, sStatus);
                });
                break;
            case view.eFindIx.my_private:

                // Get all private paths for path owner.
                view.ShowStatus("Searching for My Private trails.", false);
                model.getGpxList(sPathOwnerId, eShare.private, function (bOk, gpxList, sStatus) {
                    AppendToPathList(bOk, gpxList, sStatus);
                    SetPathList(bOk, sStatus);
                });
                break;
            default:
                view.ShowStatus("Unknown search type for finding trails.");
                break;
        }
    }

    // ** Constructor initialization
    var sOwnerId = model.getOwnerId();
    view.setOwnerId(sOwnerId);
    view.setOwnerName(model.getOwnerName());

    // Initialize the Record Stats Metrics that have been saved in local storage.
    view.InitializeRecordStatsMetrics(model.getRecordStatsList());  

    // Comment out next stmt only if debugging map initialization, in which case handler for buInitView does initialization.
    view.Initialize();
}

// Set global var for the controller and therefore the view and model.
window.app = {};
window.app.deviceDetails = new Wigo_Ws_CordovaDeviceDetails();  
Wigo_Ws_InitDeviceDetails(window.app.deviceDetails);


// Windows.app.OnDocReady() handler was not initializing HockeyApp for reporting.
// Try deviceready() handler instead.
// Note: It seems HockeyApp works for distribution even if Cordova plugin 
// for hockeyapp is not used. 
document.addEventListener("deviceready", function(e) {
    //20161210 Initialize hockeyapp for distruction of app for ios.
    if (typeof(hockeyapp) !== 'undefined') {
        // hockeyapp.start(null, null, "296f229a3907490abd795f3a70760dea");
        hockeyapp.start(function(){
            // Success.
            var sMsg = 'Successfully started HockeyApp.';
            //debug alert(sMsg);
            console.log(sMsg);
        }, 
        function(){
            // Failure.
            var sMsg = 'Failed to initialize HockeyApp!';
            //debug alert(sMsg);
            console.log(sMsg);
        }, 
        "296f229a3907490abd795f3a70760dea",
        true); // true => autoSend crash report if one exists on start.
    } 
    console.log('Device is ready.');
}, 
false);



window.app.OnDocReady = function (e) {
    // Create the controller and therefore the view and model therein.
    window.app.ctlr = new wigo_ws_Controller();
};

// Handle DOMCententLoaded event to create the model, view and controller. 
//20150617NeedWindowLoadInsteadIthink $(document).ready(window.app.OnDocReady);
// Using $(window).load(..) instead of $(document).ready(..) avoids error 
// that device does not support requestFileSystem.
// Note: Occasionally still get error using $(window).load(..). Retry on 
// error has been added and I think that will ensure the tile layer 
$(window).load(window.app.OnDocReady); 
