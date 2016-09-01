'use strict';
// wigo_ws_Model oject is in js/Model.js.

// wigo_GeoPathMap object is in js/GeoPathMapView.js.

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
                            // Note: bounds, center above are for cached map. gpxPath as similar properties for the trail. 
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
    var sVersion = "1.1.019  06/13/2016"; // Constant string for App version.

    // ** Events fired by the view for controller to handle.
    // Note: Controller needs to set the onHandler function.

    // OwnerId entered.
    // Signature of handler:
    //  sOwnerId: string for owner id.
    this.onOwnerId = function (sOwnerId) { };

    /* ////20160831 move below
    // Returns ref to Edit Finite State Machine editing path path.
    this.fsmEdit = function () {
        return fsmEdit;
    }
    */

    // The view mode has changed.
    // Handler Signature:
    //  nMode: byte value of this.eMode enumeration for the new mode.
    this.onModeChanged = function (nMode) { };

    // User selected a geo path from the list of paths.
    // Handler Signature:
    //  nMode: byte value of this.eMode enumeration.
    //  nIx: integer for selection in the list. 
    this.onPathSelected = function (nMode, nIx) { };

    // User request saving selected geo path in list of geo paths offline.
    // Handler Signature:
    //  nMode: byte value of this.eMode enumeration.
    //  params: wigo_ws_GeoPathMap.OfflineParams object geo path to save offline.
    //          params.nId and params.name are not set, they have default constructed values. 
    this.onSavePathOffline = function (nMode, params) { };

    // Get list of geo paths to show in a list.
    // Handler Signature:
    //  nMode: byte value of this.eMode enumeration.
    //  sPathOwnerId: string for path owner id for getting the paths from server.
    this.onGetPaths = function (nMode, sPathOwnerId) { };


    // Enumeration for values of selectFind control.
    this.eFindIx = {find: 0, home_area: 1, on_screen: 2, all_public: 3, all_mine: 4, my_public: 5, my_private: 6,
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

    // Upload to server a path given by a list GeoPt elements.
    // Handler Signature:
    //  nMode: byte value of this.eMode enumeration.
    //  path: {nId: int, sPathName: string, sOwnerId: string, sShare: int, arGeoPt: array}
    //      nId: integer for path record id. 0 indicates new path.
    //      sPathName: string for name of path.
    //      sOwnerId: string for owner id of path.
    //      sShare: string for share value, public or private. 
    //              Note: Matches name of wigo_ws_GeoPathsRESTfulApi.eShare property.
    //      arGeoPt:array of wigo_ws_GeoPt elements defining the path.
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

    // ** Public members

    // Initializes the view.
    // Remarks:
    //  Call once after event handlers have been set.
    this.Initialize = function () {
        // Helper to complete initialization after map has been initialized.
        function CompleteInitialization(bOk, sMsg) {
            that.ShowStatus(sMsg, !bOk)
            SetMapPanelTop();
            var settings = that.onGetSettings();
            SetSettingsParams(settings);
            // Set view find paramters for search for geo paths to the home area.
            viewFindParams.setRect(that.eFindIx.home_area, settings.gptHomeAreaSW, settings.gptHomeAreaNE);
            that.setModeUI(that.curMode());  
            selectMode.setSelectedIndex(that.curMode()); /* ////20160816 added */
            map.FitBounds(settings.gptHomeAreaSW, settings.gptHomeAreaNE);

            if (!map.isOfflineDataEnabled()) {
                var sMsg = "Offline Maps cannot be used.\n" +
                           "Check that permissions for this app in the device settings allow storage to be used.\n";
                alert(sMsg);
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
            map.GoOffline(false);
            map.InitializeMap(function (bOk, sMsg) {
                CompleteInitialization(bOk, sMsg);
            });
        }

        // alert("Waiting to continue for debug."); 
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
            ConfirmYesNo(TermsOfUseMsg(), function(bConfirm) {
                if (bConfirm) {
                    version.bTermsOfUseAccepted = true;
                    that.onSaveVersion(version);
                    DoInitialization();
                } else {
                    var sMsg = "GeoTrail cannot be used unless you accept the Terms of Use.<br/><br/>";
                    sMsg += "Uninstall GeoTrail or end the app, start it again and accept the Terms of Use.<br/>";
                    that.ShowStatus(sMsg);
                    that.setModeUI(that.eMode.tou_not_accepted);
                }
            },'Terms of Use', 'Accept,Reject');
        }
    };

    // Enumeration of Authentication status (login result)
    this.eAuthStatus = function () {
        return fb.EAuthResult;
    };

    // Enumeration of mode for processing geo paths.
    // NOTE: the values must match the index of the option in selectMode drop list in trail2.html.
    this.eMode = {
        ////20160816Set Order to droplist order online_view: 0, online_edit: 1, online_define: 2, offline: 3, tou_not_accepted: 4,
        online_view: 0, offline: 1, online_edit: 2, online_define: 3, select_mode: 4, tou_not_accepted: 5,
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
                default: sMode = 'online_view';
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
        var bFound = false;
        var opt;
        for (var i = 0; i < selectShare.options.length; i++) {
            opt = selectShare.options[i];
            if (sShare === opt.value) {
                opt.selected = true;
                bFound = true;
                break;
            }
        }
        if (!bFound) {
            selectShare.selectedIndex = 0;
        }
    };

    // Returns reference to home area rectangle.
    // Returned object ref:
    //  gptSW: wigo_ws_GeoPt object for SW corner .
    //  gptNE: wigo_ws_GeoPt object for NE corner.
    this.getHomeArea = function () {
        return homeArea;
    };

    // Returns reference to viewFindParams.
    // Note: viewFindParams are by controller to get paths for the view.
    this.getViewFindParams = function () {
        return viewFindParams;
    };

    // Displays a status message.
    // Arg:
    //  sStatus: string of html to display.
    //  bError: boolean, optional. Indicates an error msg. Default to true.
    this.ShowStatus = function (sStatus, bError) {
        /* ////20160805 redo
        if (typeof (bError) === 'undefined')
            bError = true;
        if (bError)
            divStatus.className = 'ErrorMsg';
        else
            divStatus.className = 'NormalMsg';
        divStatus.style.display = "block";
        divStatus.innerHTML = sStatus;
        SetMapPanelTop();
        */
        divStatus.set(sStatus, bError);
        SetMapPanelTop();
    };

    // Appends a status messages starting on a new line to current status message and
    // shows the full message.
    // Arg:
    //  sStatus: string of html to display.
    //  bError: boolean, optional. Indicates an error msg. Default to true.
    this.AppendStatus = function (sStatus, bError) {
        /* ////20160805
        var sMsg = divStatus.innerHTML;
        if (sMsg.length > 0)
            sMsg += "<br/>";
        sMsg += sStatus;
        this.ShowStatus(sMsg, bError);
        */
        if (!divStatus.isEmpty()) {
            sStatus = "<br/>" + sStatus;
        }

        divStatus.add(sStatus, bError);
        SetMapPanelTop();
    };

    // Displays an Alert message box which user must dismiss.
    // Arg:
    //  sMsg: string for message displayed.
    this.ShowAlert = function (sMsg) {
        var reBreak = new RegExp('<br/>', 'g'); // Pattern to replace <br/>.
        var s = sMsg.replace(reBreak, '\n');    // Replace <br/> with \n.
        AlertMsg(s);
    };

    // Clears the status message.
    this.ClearStatus = function () {
        /* ////20160805 redo
        divStatus.innerHTML = "";
        divStatus.style.display = 'none';
        SetMapPanelTop();
        */
        divStatus.clear();
        SetMapPanelTop();
    };

    // Set the user interface for a new mode.
    // Arg:
    //  newMode: eMode enumeration value for the new mode.
    this.setModeUI = function (newMode) {
        // Helper to hide all bars.
        function HideAllBars() {
                ShowElement(defineBar, false);
                ShowElement(editDefineBar2, false);
                ShowElement(editDefineCursorsBar, false);
                ShowElement(onlineOfflineEditBar, false);
                ShowElement(onlineAction, false);
                ShowElement(offlineAction, false);
                ShowElement(editAction, false);
                ShowElement(modeBar, false);
                ShowOwnerIdDiv(false); 
        }

        nMode = newMode;
        // Show SignIn control, which may have been hidden by Edit or Define mode.
        ShowSignInCtrl(true); 
        switch (nMode) {
            case this.eMode.online_view:
                /* ////20160815
                ShowPathInfoDiv(true); 
                ShowMapCacheSelect(false);
                ShowSaveOfflineButton(true);
                ShowMenu(true);
                ShowFind(true);
                // Hide ctrls for editing path.
                HidePathEditCtrls();
                */
                /* ////20160830 refactor
                ShowElement(defineBar, false);
                ShowElement(editDefineBar2, false);
                ShowElement(editDefineCursorsBar, false);
                ShowElement(offlineAction, false);
                ShowElement(editAction, false);
                ShowElement(modeBar, false);
                ShowElement(onlineOfflineEditBar, true);
                ShowElement(onlineAction, true);
                */
                HideAllBars();
                ShowElement(onlineOfflineEditBar, true);
                ShowElement(onlineAction, true);
                
                ShowMapPanelForMode(nMode);
                SetMapPanelTop(); 
                // Clear path on map in case one exists because user needs to select a path
                // from the new list of paths.
                map.ClearPath();
                this.onGetPaths(nMode, that.getOwnerId()); 
                break;
            case this.eMode.offline:
                /* ////20160816 
                ShowPathInfoDiv(true); 
                ShowMapCacheSelect(true);
                ShowSaveOfflineButton(false);
                ShowMenu(true);
                ShowFind(false);
                // Hide ctrls for editing path.
                HidePathEditCtrls();
                */
                ////20160831 ShowElement(defineBar, false);
                ////20160831 ShowElement(editDefineBar2, false);
                ////20160831 ShowElement(editDefineCursorsBar, false);
                ////20160831 ShowElement(offlineAction, true);
                ////20160831 ShowElement(editAction, false);
                ////20160831 ShowElement(onlineAction, false);
                HideAllBars();
                ShowElement(onlineOfflineEditBar, true);
                ShowElement(offlineAction, true);

                ShowMapPanelForMode(nMode);
                SetMapPanelTop(); 
                // Clear path on map in case one exists because user needs to select a path
                // from the new list of paths.
                map.ClearPath();
                this.onGetPaths(nMode, that.getOwnerId()); 
                break;
            case this.eMode.online_edit:
                fsmEdit.Initialize(false); // false => not new, ie edit existing path.
                break;
            case this.eMode.online_define:
                fsmEdit.Initialize(true); // true => new, ie define new path.
                break;
            case this.eMode.select_mode: 
                /* ////2060830 refactor
                ShowElement(defineBar, false);
                ShowElement(editDefineBar2, false);
                ShowElement(editDefineCursorsBar, false);
                ShowElement(offlineAction, false);
                ShowElement(editAction, false);
                ShowElement(offlineAction, false);
                ShowElement(editAction, false);
                ShowElement(onlineAction, false);
                ShowElement(onlineOfflineEditBar, false);
                */
                HideAllBars();
                ShowOwnerIdDiv(true);
                ShowElement(modeBar, true);
                selectMode.setSelected(this.eMode.toStr(nMode));
                
                ShowMapPanelForMode(nMode);
                SetMapPanelTop(); 
                break;
            case this.eMode.tou_not_accepted: // Terms of Use not accepted. Added 20160609 
                ShowOwnerIdDiv(false);
                ShowModeDiv(false);
                
                ShowMapPanelForMode(nMode);
                break;
        }
    };

    // Returns ref to Edit Finite State Machine editing path path.
    this.fsmEdit = function () {
        return fsmEdit;
    };

    // Fill the list of paths that user can select.
    // Arg:
    //  arPath is an array of strings for geo path names.
    //  bSort is optional boolean to display sorted version of arPath.
    //        Defaults to true if not given.
    this.setPathList = function (arPath, bSort) {
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

        ////20160813 InitPathList("Select a Geo Trail");
        selectGeoTrail.empty();
        selectGeoTrail.appendItem("-1", "Select a Geo Trail", true); // true => show header as value.

        // Add the list of geo paths.
        ////20160808 var name, iStr;
        var name, dataIx;
        for (var i = 0; i < arSelect.length; i++) {
            name = arSelect[i].s;
            ////20160808 iStr = arSelect[i].i.toString();
            ////20160808 var option = new Option(name, iStr);
            ////20160808 selectGeoPath.add(option);
            ////20160813
            ////20160813 dataIx = arSelect[i].i
            ////20160813 selectGeoTrail.appendItem(dataIx, name);
            
            dataIx = arSelect[i].i.toString();
            // dataIx is data-value attribute of item and is index to arPath element.
            selectGeoTrail.appendItem(dataIx, name);
        }
    };

    // Clears the list of paths that the user can select.
    this.clearPathList = function () {
        // Call setPathList(..) with an empty list.
        this.setPathList([]);
    };

    // Returns selected Path Name from selectGeoPath drop list.
    // Returns empty string for no selection.
    this.getSelectedPathName = function () {
        /* ////20160808 redo
        var sName = "";
        var nCount = selectGeoPath.options.length;
        var i = selectGeoPath.selectedIndex;
        // Note: ignore option 0, which is prompt to select a path.
        if (nCount > 0 && i > 0 && i < nCount) {
            sName = selectGeoPath.options[i].innerText;
        }
        */
        var sName = "";
        if (selectGeoTrail.getSelectedIndex() > 0) 
            sName = selectGeoTrail.getSelectedValue();
        return sName;
    };

    // Shows geo path information.
    // Args:
    //  bShow: boolean. Show or hide displaying the geo path info.
    //  path: wigo_ws_GpxPath object defining the path. null indicates do not set. 
    this.ShowPathInfo = function (bShow, path) {
        ShowPathInfoDiv(bShow);
        map.DrawPath(path);
    }

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
            map.DrawPath(offlineParams.gpxPath); 
        }
    };


    // ** Private members for html elements
    var that = this;
    ////20160806 var divStatus = $('#divStatus')[0];
    ////20160831 var divOwnerId = $('#divOwnerId')[0];
    var divOwnerId = document.getElementById('divOwnerId'); 

    var txbxOwnerId = $('#txbxOwnerId')[0];
    var selectSignIn = $('#selectSignIn')[0];

    var divMode = $('#divMode')[0];
    ////20160811 var selectMode = $('#selectMode')[0];
    ////20160816 var buSaveOffline = $('#buSaveOffline')[0];
    ////20160813 var selectMapCache = $('#selectMapCache')[0];
    ////20160817 var selectFind = $('#selectFind')[0];
    ////20160807 var selectMenu = $('#selectMenu')[0];

    var divSettings = $('#divSettings')[0];
    var selectAllowGeoTracking = $('#selectAllowGeoTracking')[0];
    var numberGeoTrackingSecs = $('#numberGeoTrackingSecs')[0];
    var numberOffPathThresMeters = $('#numberOffPathThresMeters')[0];
    var selectOffPathAlert = $('#selectOffPathAlert')[0];
    var selectPhoneAlert = $('#selectPhoneAlert')[0];
    var selectPebbleAlert = $('#selectPebbleAlert')[0];
    var selectClickForGeoLoc = $('#selectClickForGeoLoc')[0];
    var selectCompassHeadingVisible = $('#selectCompassHeadingVisible')[0];
    var numberPrevGeoLocThresMeters = $('#numberPrevGeoLocThresMeters')[0];
    var numberHomeAreaSWLat = $('#numberHomeAreaSWLat')[0];
    var numberHomeAreaSWLon = $('#numberHomeAreaSWLon')[0];
    var numberHomeAreaNELat = $('#numberHomeAreaNELat')[0];
    var numberHomeAreaNELon = $('#numberHomeAreaNELon')[0];
    var buSetHomeArea = $('#buSetHomeArea')[0];
    var buSettingsDone = $('#buSettingsDone')[0];
    var buSettingsCancel = $('#buSettingsCancel')[0];

    var divPathInfo = $('#divPathInfo')[0];
    ////20160808 var selectGeoPath = $('#selectGeoPath')[0];
    var divPathDescr = $('#divPathDescr')[0];
    ////20160815 var divCursors = $('#divCursors')[0];
    var selectPtAction = $('#selectPtAction')[0];
    var buPtDo = $('#buPtDo')[0];
    var buCursorLeft = $('#buCursorLeft')[0];
    var buCursorRight = $('#buCursorRight')[0];
    var buCursorUp = $('#buCursorUp')[0];
    var buCursorDown = $('#buCursorDown')[0];

    ////20160815 var divPathIx = $('#divPathIx')[0];
    var buPathIxPrev = $('#buPathIxPrev')[0];
    var buPathIxNext = $('#buPathIxNext')[0];
    var buPtDeleteDo = $('#buPtDeleteDo')[0];  

    var txbxPathName = $('#txbxPathName')[0];
    var labelPathName = $('#labelPathName')[0];
    var selectShare = $('#selectShare')[0];
    var labelShare = $('#labelShare')[0];
    var buUpload = $('#buUpload')[0];
    var buDelete = $('#buDelete')[0];
    var buCancel = $('#buCancel')[0];

    var onlineOfflineEditBar = document.getElementById('onlineOfflineEditBar');
    var onlineAction = document.getElementById('onlineAction');
    var offlineAction = document.getElementById('offlineAction');
    var editAction = document.getElementById('editAction');
    var defineBar = document.getElementById('defineBar');
    var editDefineBar2 = document.getElementById('editDefineBar2');
    var editDefineCursorsBar = document.getElementById('editDefineCursorsBar');
    var divCursors = document.getElementById('divCursors');
    var divPathIx = document.getElementById('divPathIx');

    

    var panel = $('#panel')[0];
    var buGeoLocate = $('#buGeoLocate')[0];     /* ////20160814 Can be deleted if panel for map overlay is not used. */ 
    var selectGeoTrack = $('#selectGeoTrack')[0];
    var labelGeoTrack = $('#labelGeoTrack')[0];
    var selectAlert = $('#selectAlert')[0];
    var labelAlert = $('#labelAlert')[0];
    var buGoToPath = $('#')[0];
    var buMinMaxMap = $('#buMinMaxMap')[0];

    var selectEnableGeoTracking = $('#selectEnableGeoTracking')[0];
    var numberPhoneVibeSecs = $('#numberPhoneVibeSecs')[0];
    var numberPhoneBeepCount = $('#numberPhoneBeepCount')[0];
    var numberPebbleVibeCount = $('#numberPebbleVibeCount')[0];

    // Returns ref to div for the map-canvas element.
    // Note: The div element seems to change dynamically. 
    //       Therefore setting a var for $('#map-canvas')[0] does not work.
    function getMapCanvas() {
        var mapCanvas = document.getElementById('map-canvas');
        return mapCanvas;
    }

    // ** Use jquery to attach event handler for controls.
    // Note: All the control event handlers clear status first thing.

    $(selectSignIn).bind('change', function (e) {
        var val = this.selectedValue;
        if (this.selectedIndex > 0) {
            var option = this[this.selectedIndex];
            if (option.value === 'facebook') {
                that.ClearStatus();
                fb.Authenticate();
            } else if (option.value === 'logout') {
                // Only allow Logout for View or Offline mode.
                var nMode = that.curMode();
                if (nMode === that.eMode.online_edit ) {
                    that.AppendStatus("Complete editing the path, then logout.", false);
                } else if (nMode === that.eMode.online_define) {
                    that.AppendStatus("Complete defining a new path, then logout.", false);
                } else {
                    that.ClearStatus();
                    fb.LogOut();
                }
            } else {
                that.ClearStatus();
            }
            this.selectedIndex = 0;
        }
    });

    /* ////20160808 redo deleted
    $(selectGeoPath).bind('change', function (e) {
        that.ClearStatus();
        if (this.selectedIndex >= 0) {
            var iList = parseInt(this.value);
            if (iList < 0) {
                // No path selected.
                map.ClearPath();
            } else {
                // Path is selected
                that.onPathSelected(that.curMode(), iList);
                // Update status for track timer unless editing.
                if (that.curMode() === that.eMode.online_view ||
                    that.curMode() === that.eMode.offline) {
                    if (trackTimer.bOn) {
                        if (map.IsPathDefined()) {
                            // Tracking timer is on so show current geo location right away.
                            DoGeoLocation();
                        }
                    } else {
                        that.ShowStatus("Geo tracking off.", false); // false => not an error.
                    }
                }
            }
        }
    });
    */
    /* ////20160816 
    $(buSaveOffline).bind('click', function (e) {
        that.ClearStatus();

        ////20160808 if (selectGeoPath.selectedIndex === 0) {
        var selectedDataIx =selectGeoTrail.getSelectedIndex(); 
        if ( selectedDataIx < 1) {
            that.ShowStatus("Select a Geo Trail first before saving.")
        } else if (nMode === that.eMode.online_view) {
            var oMap = map.getMap();
            var params = new wigo_ws_GeoPathMap.OfflineParams();
            ////20160808 params.nIx = parseInt(selectGeoPath.value);
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
            that.onSavePathOffline(nMode, params);
        } else {
            that.ShowStatus("Must be in online mode to save for offline.");
        }
    });
    */

    var onlineSaveOffline = document.getElementById('onlineSaveOffline');
    onlineSaveOffline.addEventListener('click', OnlineSaveOfflineClicked, false);
    function OnlineSaveOfflineClicked(event) {
        that.ClearStatus();

        ////20160808 if (selectGeoPath.selectedIndex === 0) {
        var selectedDataIx =selectGeoTrail.getSelectedIndex(); 
        if ( selectedDataIx < 1) {
            that.ShowStatus("Select a Geo Trail first before saving.")
        } else if (nMode === that.eMode.online_view) {
            var oMap = map.getMap();
            var params = new wigo_ws_GeoPathMap.OfflineParams();
            ////20160808 params.nIx = parseInt(selectGeoPath.value);
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
            that.onSavePathOffline(nMode, params);
        } else {
            that.ShowStatus("Must be in online mode to save for offline.");
        }
    }

    /* ////20160816 now using wigo_ws_DropListControl.
    $(selectMode).bind('change', function (e) {
        // this.value is value of selectMode control.
        var nMode = that.eMode.toNum(this.value);

        // Helper function to change mode.
        function AcceptModeChange() {
            that.ClearStatus();
            // Inform controller of the mode change.
            that.onModeChanged(nMode);
            var bOffline = nMode === that.eMode.offline;
            var result = map.GoOffline(bOffline);
            that.setModeUI(nMode);
        }

        if (fsmEdit.IsPathChanged()) {
            ConfirmYesNo("The geo path has been changed. OK to continue and loose any change?", function (bConfirm) {
                if (bConfirm) {
                    fsmEdit.ClearPathChange();
                    AcceptModeChange();
                } else {
                    // Restore the current mode selected before the change.
                    selectMode.selectedIndex = that.curMode();
                }
            });
        } else {
            AcceptModeChange();
        }
    });
    */ 

    /* ////20160813 use wigo_ws DropDownControl
    $(selectMapCache).bind('change', function (e) {
        if (that.curMode() === that.eMode.offline) {
            if (this.value === 'clear') {
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
            } else if (this.value === 'size') {
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
        selectMapCache.selectedIndex = 0;
    });
    */
    /* ////20160817 
    $(selectFind).bind('change', function (e) {
        // The Find droplist is only valid in view mode.
        if (that.curMode() !== that.eMode.online_view)
            return; // Note: should not happen because selectFind should only be visible in view mode.

        // Save parameters for view for finding paths.
        var nFindIx = that.eFindIx.toNum(this.value);
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
            if (!sOwnerId) {
                that.ShowStatus("You must be signed in to find your paths.", true);
                bClearPath = false;
            } else {
                viewFindParams.init(nFindIx);
                if (that.onFindPaths)
                    that.onFindPaths(sOwnerId, nFindIx, gptSW, gptNE);
            }
        } else {
            bClearPath = false;
        }

        this.selectedIndex = 0;
        // Clear the drawn map path because the selectGeoPath drop has been reloaded.
        if (bClearPath)
            map.ClearPath();
    });
    */


    /* ////20160807 
    $(selectMenu).bind('change', function (e) {
        if (this.value === 'settings') {
            var settings = that.onGetSettings();
            SetSettingsValues(settings);
            ShowSettingsDiv(true);
            SetMapPanelTop();
        } else if (this.value === 'startpebble') {
            if (pebbleMsg.IsConnected()) {
                if (pebbleMsg.IsEnabled()) {
                    pebbleMsg.StartApp();
                } else {
                    AlertMsg("Pebble watch is not enabled. Use Menu > Settings to enable.")
                }
            } else {
                AlertMsg("Pebble watch is not connected.");
            }
            this.selectedIndex = 0;
        } else if (this.value === 'about') {
            AlertMsg(AboutMsg())
            this.selectedIndex = 0;
        } else if (this.value === 'license') {
            AlertMsg(LicenseMsg());
            this.selectedIndex = 0;
        } else if (this.value === 'help') {
            AlertMsg(HelpMsg());
            this.selectedIndex = 0;
        } else if (this.value === 'back_to_trail') {
            AlertMsg(BackToTrailHelp());
            this.selectedIndex = 0;
        } else if (this.value === 'terms_of_use') {
            AlertMsg(TermsOfUseMsg());
            this.selectedIndex = 0;
        } else if (this.value === 'battery_drain') {
            AlertMsg(BatteryDrainVsTrackingHelp());
            this.selectedIndex = 0;
        }
        that.ClearStatus();
    });
    */

    $(selectAllowGeoTracking).bind('change', function(e) {
        // No longer disabling some settings ctrls for allow geo tracking off.
    });

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
            SetSettingsParams(settings);
            ////20160807 selectMenu[0].selected = true;
            that.onSaveSettings(settings);
        }
    });
    $(buSettingsCancel).bind('click', function (e) {
        ShowSettingsDiv(false);
        that.ClearStatus();
        ////20160807 selectMenu[0].selected = true;
    });

    /* ////20160814 Can be deleted if panel for map overlay is not used. */ 
    $(buGeoLocate).bind('click', function (e) {
        DoGeoLocation();
    });

    var onlineMyLoc = document.getElementById('onlineMyLoc');
    onlineMyLoc.addEventListener('click', MyLocClicked, false);
    var offlineMyLoc = document.getElementById('offlineMyLoc');
    onlineMyLoc.addEventListener('click', MyLocClicked, false);
    offlineMyLoc.addEventListener('click', MyLocClicked, false);
    // Event handler for MyLoc button clicked.
    function MyLocClicked(event) {  ////20160814 added
        DoGeoLocation();
    }

    $(selectGeoTrack).bind('change', function (e) {
        that.ClearStatus(); 
        // Save state of flag to track geo location.
        trackTimer.bOn = IsGeoTrackValueOn();    // Allow/disallow geo-tracking.
        if (!trackTimer.bOn) {
            // Send message to Pebble that tracking is off.
            pebbleMsg.Send("Track Off", false, false); // no vibration, no timeout.
        }
        // Start or clear trackTimer.
        RunTrackTimer();
    });

    // Selects droplist for Tracking on/off and runs the tract timer accordingly.
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


    $(selectAlert).bind('change', function () {
        // Enable/disable alerts.
        alerter.bPhoneEnabled = selectAlert.value === 'on';
    });

    $(buGoToPath).bind('click', function (e) {
        that.ClearStatus();
        var bOk = map.PanToPathCenter();
        if (!bOk) {
            that.ShowStatus("No Geo Path currently defined to pan-to.");
        }
    });

    $(buMinMaxMap).bind('click', function (e) {
        that.ClearStatus();
        // Toggle minimum/maximum display of map.
        var minState = $(this).prop('data-minState')
        if (minState === undefined)
            minState = 'true';
        var bMin = minState === 'true';
        bMin = !bMin;
        // For bMin true, show the edit mode and path info so that map is shown
        // only in a small portion at bottom of the screen.
        // Otherwise, hide edit mode and path info so map is shown full screen.
        // Set the value of this button, which is the button caption, to be opposite of 
        // bMin because pressing the button toggles the current state.
        if (bMin) {
            MinimizeMap();
            this.value = 'Full Screen';
        } else {
            MaximizeMap();
            this.value = 'Reduce';
        }
        // Save the current minState.
        $(this).prop('data-minState', bMin.toString());
    });

    $(selectShare).bind('change', function () { 
        var fsm = that.fsmEdit();
        fsm.setPathChanged();
        fsm.DoEditTransition(fsm.eventEdit.ChangedShare);
    });

    $(txbxPathName).bind('change', function (e) {
        var fsm = that.fsmEdit();
        // Ensure soft keyboard is removed after the change.
        txbxPathName.blur();
        fsm.setPathChanged();   
        fsm.DoEditTransition(fsm.eventEdit.ChangedPathName);
    });

    $(buCursorLeft).bind('touchstart', function (e) {  
        fsmEdit.CursorDown(fsmEdit.dirCursor.left);
    });
    $(buCursorLeft).bind('touchend', function (e) {     
        fsmEdit.CursorUp(fsmEdit.dirCursor.left);
    });

    $(buCursorRight).bind('touchstart', function (e) {
        fsmEdit.CursorDown(fsmEdit.dirCursor.right);
    });
    $(buCursorRight).bind('touchend', function (e) {
        fsmEdit.CursorUp(fsmEdit.dirCursor.right);
    });

    $(buCursorUp).bind('touchstart', function (e) {
        fsmEdit.CursorDown(fsmEdit.dirCursor.up);
    });
    $(buCursorUp).bind('touchend', function (e) {
        fsmEdit.CursorUp(fsmEdit.dirCursor.up);
    });

    $(buCursorDown).bind('touchstart', function (e) {
        fsmEdit.CursorDown(fsmEdit.dirCursor.down);
    });
    $(buCursorDown).bind('touchend', function (e) {
        fsmEdit.CursorUp(fsmEdit.dirCursor.down);
    });

    $(buPtDo).bind('click', function (e) {
        fsmEdit.DoEditTransition(fsmEdit.eventEdit.Do);
    });

    $(buPathIxNext).bind('click', function (e) {
        fsmEdit.DoEditTransition(fsmEdit.eventEdit.PathIxNext);
    });

    $(buPathIxPrev).bind('click', function (e) {
        fsmEdit.DoEditTransition(fsmEdit.eventEdit.PathIxPrev);
    });

    $(buPtDeleteDo).bind('click', function (e) {
        fsmEdit.DoEditTransition(fsmEdit.eventEdit.DeletePtDo);
    });


    $(buUpload).bind('click', function (e) {
        fsmEdit.DoEditTransition(fsmEdit.eventEdit.Upload);
    });

    $(buDelete).bind('click', function (e) {
        fsmEdit.DoEditTransition(fsmEdit.eventEdit.Delete);
    });

    $(buCancel).bind('click', function (e) {
        fsmEdit.DoEditTransition(fsmEdit.eventEdit.Cancel);
    });

    $(selectPtAction).bind('change', function (e) {
        // Note: the selection value is the EditFSM event.
        fsmEdit.DoEditTransition(Number(selectPtAction.value));
    });

    //20160507 Added only to debug problem with filesytem for TileLayer for map.
    /* Normally commented out
    $('#buInitView').bind('click', function (e) {
        that.Initialize();
    });
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

    /* ////20160831 not used yet.
    // Returns true if Owner is signed in.
    ////20160830 added function.
    function IsOwnerSignedIn() { 
        var bSignedIn =  _ownerId && _ownerId.length > 0;
        return bSignedIn;
    }
    */


    // **  State Machine for Editing Path, New or Existing

    // Object for Server Action


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
            ChangedShare: 18
        };

        this.Initialize = function(bNewArg) {
            bNew = bNewArg;
            // Ensure track timer is not selected and is not running.
            SelectAndRunTrackTimer(false);
            curEditState = stEditInit;
            this.DoEditTransition(this.eventEdit.Init);
        };

        // Sets variable indicating path has been changed qne
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
                        // Show Path Name textbox, but not Share select.
                        ShowPathDescrCtrls(true);
                        ShowPathNameCtrl(true);
                        txbxPathName.value = "";   
                        ShowShareCtrl(false);
                        // Hide server action buttons.
                        ShowPtActionCtrl(false);  
                        ShowUploadButton(false);
                        ShowDeleteButton(false);
                        ShowCancelButton(false);
                    } else {
                        // Hide path description including textbox and server action buttons.
                        ShowPathDescrCtrls(false);
                    }
                    // Hide buttons for online-view and offline.
                    ShowMapCacheSelect(false);
                    ShowSaveOfflineButton(false);
                    ShowMenu(false);
                    ShowFind(false);
                    // Hide select path drop list.
                    ShowPathInfoDiv(false);
                    // Hide cursors.
                    ShowPathCursors(false);
                    ShowPathIxButtons(false); 
                    ShowMapPanelForMode(view.curMode()); 
                    // Check if  user is signed in.
                    if (view.getOwnerId()) {
                        // Fire signed in event for this same state.
                        that.DoEditTransition(that.eventEdit.SignedIn);
                    } else {
                        sMsg = bNew ? "Sign In to define a new path." : "Sign In to edit a path."
                        view.AppendStatus(sMsg, false); 
                    }
                    break;
                case that.eventEdit.SignedIn:
                    // Hide SignIn ctrl so that SignIn or Logout is not available.
                    // (Do not allow user to SignIn again or Logout while editing.)
                    ShowSignInCtrl(false);
                    if (bNew) {
                        view.AppendStatus("Enter a name for a new path.", false);
                    } else {
                        // Load path drop list for select of path to edit.
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
            ShowPathInfoDiv(!bNew); // Note: divPathInfo only has selectGeoPath and its label.
            ShowPathDescrCtrls(true);
            // Show Path Name text box.
            ShowPathNameCtrl(true);
            // Show sharing select ctrl for path (public, private).
            ShowShareCtrl(true);
            // Show  Server Action ctrls for Cancel button and PtAction select ctrl.
            ShowUploadButton(false);
            ShowDeleteButton(false);
            ShowCancelButton(true);
            ShowPtActionCtrl(true); 
            // Hide cursors.
            ShowPathCursors(false);
            ShowPathIxButtons(false); 
            // Enable touch to define a point for stEdit.
            bTouchAllowed = true;
            // Do output actions for next state and transition to next state.
            switch (editEvent) {
                case that.eventEdit.SelectedPath:
                    curPathName = view.getSelectedPathName();
                    // Set path name for editing.
                    txbxPathName.value = curPathName;
                    // Disable selectGeoPath droplist (by hiding) selection of different path.
                    ShowPathInfoDiv(false);
                    // Set options and show message for appending.
                    PrepareForEditing();
                    // Show Delete button only for not new.
                    ShowDeleteButton(!bNew);
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
                    map.DrawAppendSegment(curTouchPt.getGpt());
                    curEditState = stAppendPt;
                    break;
                case that.eventEdit.ChangedPathName:
                case that.eventEdit.ChangedShare:
                    // Changed path name or share (public/private).
                    // Ensure Upload button is shown and Delete button hidden.
                    ShowUploadButton(true);
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
                    ConfirmYesNo("OK to delete selected path?", function (bConfirm) {
                        if (bConfirm) {
                            // Delete path at server.
                            view.ShowStatus("Deleting GPX path at server.", false);
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
        function stUploadPending(event) { ////20160828???? What happened
            switch(event) {
                case that.eventEdit.Init:
                    // Fire  init event to re-initialize.
                    curEditState = stEditInit;
                    that.DoEditTransition(that.eventEdit.Init);
                    break;
                case that.eventEdit.Cancel:
                    CancelIfUserOks("Quit waiting for acknowlegement from server of upload?");
                    // Goes to stEditInit if user oks.
                    break;
            }
        }

        // Waiting for delete to be completed
        function stDeletePending(event) {
            switch (event) {
                case that.eventEdit.Init:
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
                        view.ShowPathInfo(false, that.gpxPath);
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
                        view.ShowStatus("Use Prev/Next to move selected point along path. Select Move Pt, Insert Pt, or Delete Pt.", false);
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
                    // Set PtAction options to Move and Select only with Move selected.
                    opts.Init(false);
                    opts.Insert = true;
                    opts.Select = true;
                    opts.SetOptions();
                    opts.SelectOption(EPtAction.Inserting);
                    view.ShowStatus("Touch where to insert touch point into the path.", false);
                    curEditState = stInsertPt;
                    break;
                case that.eventEdit.DeletePt:  
                    // Show previous, next buttons to index points on path.
                    ShowPathCursors(false);
                    ShowPathIxButtons(true);
                    ShowPtDeleteDoButton(true);
                    // Hide Upload button, which is shown when selecting a point on path.
                    ShowUploadButton(false);
                    // Set PtAction options to Move and Select only with Move selected.
                    opts.Init(false);
                    opts.Delete = true;
                    opts.Select = true;
                    opts.SetOptions();
                    opts.SelectOption(EPtAction.Deleting);
                    view.ShowStatus("OK to confirm Delete Pt. Use Prev/Next to move selected point along path.", false);
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
                    // Goes to stUploadPending unless path does not exist.
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
                        view.ShowPathInfo(false, that.gpxPath);  
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
                        view.ShowPathInfo(false, that.gpxPath);  
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
                        view.ShowPathInfo(false, that.gpxPath);  
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
                var nCount = selectPtAction.length;
                for (var i=0; i < nCount; i++) {
                    selectPtAction.remove(0);
                }
                // Fill the drop list. 
                // Note: Set value to string for EditFSM.event enumeration value.
                //       SelectPt: 1, AppendPt: 2, InsertPt: 3, MovePt: 4, DeletePt: 5,
                if (this.Select)
                    selectPtAction.add(NewOption(ToPtActionValue(EPtAction.Selecting), "Select Pt"));
                if (this.Append)
                    selectPtAction.add(NewOption(ToPtActionValue(EPtAction.Appending), "Append Pt"));
                if (this.Insert)
                    selectPtAction.add(NewOption(ToPtActionValue(EPtAction.Inserting), "Insert Pt"));
                if (this.Move)
                    selectPtAction.add(NewOption(ToPtActionValue(EPtAction.Moving), "Move Pt"));
                if (this.Delete)
                    selectPtAction.add(NewOption(ToPtActionValue(EPtAction.Deleting), "Delete Pt"));

                ShowElement(buPtDo, this.Do);
            }

            // Selects a single option.
            // Also sets fsm.curPtAction to selected option.
            // Arg:
            //  ePtAction: EPtAction enumeration number for option to select.
            this.SelectOption = function (ePtAction) {
                var opt;
                var sValue = ToPtActionValue(ePtAction);
                var nCount = selectPtAction.options.length;
                // Note: loop thru all options so that only one will be selected.
                for (var i = 0; i < nCount; i++) {
                    opt = selectPtAction.options[i];
                    if (opt.value === sValue) {
                        opt.selected = true;
                    } else {
                        opt.selected = false;
                    }
                }
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
            // Show Upload if path has been changed.
            ShowUploadButton(bPathChanged);  

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
            var sMsg = bPathEmpty ? "Touch to start a new path." :
                                    "Touch to append point to end of path or change Append Pt to Select Pt."
            view.ShowStatus(sMsg, false);
        }

        function PrepareForSelectingPt() {
            // Show Upload and hide Delete button.
            ShowUploadButton(bPathChanged);
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
            view.ShowStatus("Touch to choose point on path.", false);
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
        // Returns true if path can be uploaded and sets current state to stUploadPending.
        // If paths can not be uploaded returns false and stays in same state.
        function DoUpload() {
            var bOk = false;
            if (that.gpxPath) { // Ignore if gpxPath obj does not exists.
                if (that.gpxPath.arGeoPt.length > 1) {
                    var path = NewUploadPathObj();
                    path.nId = that.nPathId;
                    path.sOwnerId = view.getOwnerId();
                    path.sPathName = txbxPathName.value;
                    path.sShare = selectShare.value;
                    path.arGeoPt = that.gpxPath.arGeoPt;
                    view.onUpload(view.curMode(), path);
                    view.ShowStatus("Uploading path to server.", false);
                    bOk = true;
                    curEditState = stUploadPending;

                } else {
                    var sMsg = "Cannot upload the geo path because it must have more than one point.";
                    AlertMsg(sMsg);
                }
            }
            return bOk;
        }
    }


    // ** More private members
    var ctrls = Wigo_Ws_CordovaControls();
    var divStatus = new ctrls.StatusDiv();

    var fsmEdit = new EditFSM(this);

    var nMode = that.eMode.online_view; // Current mode.
    
    // Initial home are to rectangle area around Oregon.
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
        nFindIx: this.eFindIx.home_area, gptSW: new wigo_ws_GeoPt(), gptNE: new wigo_ws_GeoPt(),
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
        that.ShowStatus("Getting Geo Location ...", false);
        TrackGeoLocation(trackTimer.dCloseToPathThres, function (updateResult) {
            ShowGeoLocUpdateStatus(updateResult);
        });
    }

    // Returns About message for this app.
    function AboutMsg() {
        var sCopyright = "2015, 2016";
        var sMsg =
        "Version {0}\nCopyright (c) {1} Robert R Schomburg\n".format(sVersion, sCopyright);
        return sMsg;
    }

    // Returns message for source code license for this app.
    function LicenseMsg() {
        var sMsg = '\
The main source code for this app is open source licensed under\n\
The MIT License (MIT)\n\n\
The open source Cordova / Appache platform is used to build this mobile app. Refer to \
the Cordova / Appache license.\n\
Plugins and modules used by the main code have individual open source licenses \
and are listed below. Refer to them individually to determine their kind of license.\n\n\
jquery 1-11.3\n\n\
Leaflet 0.7.3 for maps\n\n\
L.TileLayer.Cordova for caching map tiles\n\n\
com.jetboystudio.pebble.PebblePGPlugin 0.2.6 "Pebble"\n\n\
com.phonegap.plugins.facebookconnect 0.11.0 "Facebook Connect"\n\n\
cordova-plugin-compat 1.0.0 "Compat"\n\n\
cordova-plugin-device-orientation 1.0.3 "Device Orientation"\n\n\
cordova-plugin-dialogs 1.2.1 "Notification"\n\n\
cordova-plugin-file 4.2.0 "File"\n\n\
cordova-plugin-file-transfer 1.5.1 "File Transfer"\n\n\
cordova-plugin-geolocation 2.2.0 "Geolocation"\n\n\
cordova-plugin-vibration 2.2.1-dev "Vibration"\n\n\
cordova-plugin-whitelist 1.2.2 "Whitelist"\n\n\
org.nypr.cordova.wakeupplugin 0.1.0 "WakeupTimer"\n\n\
';
        return sMsg;
    }

    // Returns string for help message.
    function HelpMsg() {
        var sMsg = '\
Select Sign In > Facebook to sign in. Your sign-in id is remembered so \
you do not need to sign in again unless you log out.\n\
You do not need to sign in, but you can only view public trails if not signed in.\n\n\
View, Edit, Define, or Offline Mode\n\
View lets you select a trail from ones saved online. Edit lets you edit a trail that \
you have saved online. Define lets you create a new trail and save it online. \
Offline lets you view trails when you are \
not connected to the web. You need to select the trails to save to your phone when \
you are online. \
More details about these modes are given below.\n\n\
View Mode\n\
View lets you \
access Geo-paths from the web that others have made public and ones \
that are private to you. \
Select a path from the drop list to view.\n\n\
Save Offline\n\
Touch the Save Offline button to save a path you are viewing so that you can \
view it when you are offline. (See Offline Mode below.)\n\n\
Find\n\
Select an option from the Find drop list to search for paths to view. \n\
The Select a Path drop list is filled with the paths found:\n\n\
Find > Home Area\n\
Searches for paths that are in your Home Area, which is a geo-rectangle \
defined in Menu > Settings. \
All public paths and your private paths are included.\n\n\
Find > On Screen\n\
Searches for paths that are in the area displayed on the screen. \
First, pan, zoom, and pinch to select the area you see on the screen.\n\n\
Find > All Paths\n\
Searches for all your public and private paths.\n\n\
Find > All Mine\n\
Searchs for all your paths, both public and private. \
You must be logged in to search for your paths.\n\n\
Find > My Public\n\
Searches for all of your public paths, paths that anyone can see.\n\n\
Find > My Private\n\
Searches for your private paths, paths that only you can see.\n\n\
Menu Provides More Options\n\
Menu > Settings presents a dialog to set preferences for geo-location tracking and alerts:\n\n\
* Allow Geo Tracking Yes | No: For No, geo-location is NOT obtained automatically, \
and Track and Ph Alert are ignored. \
However, the MyLoc button will still get your geo-location.\n\n\
* Geo Tracking Initially On Yes | No: Yes to start with Track On when app loads.\n\n\
* Geo Tracking Interval (secs): number of seconds to check your geo-location when tracking is allowed.\n\n\
* Off-Path Threshold (m): number of meters that you need to be off-path for an alert to be given.\n\n\
* Allow Phone Alert Yes | No: detemines if alerts (beeps) from you phone are given. \n\n\
* Phone Alert Initially On Yes | No: Yes to start with Phone Alert On when app loads.\n\n\
* Phone Vibration in Secs: number of seconds phone vibrates for an alert. Set to 0 for no vibration.\n\n\
* Phone Beep Count: number of beeps to give for an alert. Set to 0 for no beepings.\n\n\
* Pebble Watch Yes | No: Yes to show messages on a Pebble Watch that is connected to the phone.\n\n\
* Pebble Vibration Count: number of vibrations given on Pebble Watch for message indicating \
off trail. Count of 0 disables vibrations. \
Note that Ph Alert Off does not inhibit vibrations for being off-trail.\n\n\
* Prev Geo Loc Thres (m): number of meters of current geo-location with respect to previous location \
for change in location to be considered valid. (This prevents small variations in the geo-location of \
the same point to appear to be a change in location.)\n\n\
* Show Compass Heading on Map? Yes | No:\n\
An arrow for the compass heading from your current location may be shown on the map.\n\n\
* Touch Map for Geo Location Testing? Yes | No:\n\
Touching a point on the map simulates getting the geo location for the point on the map. \
This is just for testing.\n\n\
* Set Home Area to Screen:\n\
Touch the Set button to set your home area to be that shown on the screen. \
First, pan, zoom, and pinch to display the area you want on the screen. \n\
The paths in the Home Area are found when the app starts. \
Also, the Home Area can be chosen in View mode, from the Find drop list.\n\n\
Menu > Start Pebble\n\
Starts the Pebble app on the watch. The Pebble app should be started automatically so it is unlikely \
you need to do this.\n\n\
Using Controls at Top of Map\n\
Ctr Trail brings the map to the center of the selected path.\n\n\
MyLoc displays your current location on the map.\n\n\
Full Screen / Reduce Screen switches between the map filling the screen and \
the map being below the selection controls.\n\n\
Track switches between geo-location tracking On or Off.\n\
Note: Track On will run down your battery more quickly.\n\n\
Ph Alert, which is given if you are off the trail, switches between Ph Alert On or Off.\n\n\
Offline Mode\n\
Offline lets you select paths you have saved offline. Select a Geo Path from the \
list you have saved.\n\n\
Map Cache shows information about the cache of map tiles.\n\
Select Size to see the number of files and the size in MB of all the files.\n\
Select Clear to empty the cache of map files. Once the cache is cleared, \
all the offline paths are deleted from the phone.\n\n\
Define Mode\n\
Define provides a way to create a trail and save it online. \
You must be signed into Facebook to define a trail.\n\n\
Instructions are shown at the top of the screen to guide you through the process, \
which is outlined below.\n\n\
Enter a path name for the trail.\n\n\
Touch on the screen to define the first point on the path.\n\n\
Soft Cursor Keys\n\
Use the cursor keys \
that appear to nudge the point left, right, up, or down to get the point exactly where \
you want it. Holding down a cursor button causes the point to move faster on the screen. \
Touch OK to confirm that the point is to be added. Repeat the process to define \
all the points for your trail.\n\n\
Upload Button\n\
Touch the Upload button to upload (save online) the data for your trail.\n\n\
Cancel Button\n\
Touch the Cancel button if you decide not to create the trail.\n\n\
Select Pt\n\
You can edit an existing point in the trail by selecting Select Pt instead of Append Pt. \
Touch on the trail near the point you want to edit.\n\n\
Prev, Next Buttons\n\
If the correct point is not highlighted on the trail, use \
the Prev and Next buttons to move to the previous or next point on the trail.\n\n\
Move Pt, Insert Pt, Delete Pt\n\
Then select Move Pt, Insert Pt, or Delete Pt instead of Select Pt to \
move, insert, or delete the selected (highlighted) point.\n\n\
Move Pt\n\
When moving a point, touch where the point should go and nudge it with the cursors. \
Touch OK to confirm that the point is where you want it.\n\n\
Insert Pt\n\
When inserting a point, touch where the inserted point should be and use the cursors to nudge it.\
Touch OK to confirm the location is correct. The point is inserted in the \
path before the selected point.\n\n\
Delete Pt\n\
When deleting a point, confirm the deletion of the point by Touching OK. Use the Prev and Next buttons \
to move to a different point on the path if the correct point is not selected (highlighted).\n\n\
Edit Mode\n\
Edit provides a way to edit a trail you have saved online. \
The precedure is the same as for defining a new path, except that you select a path to edit first. \
You must be signed in to edit a path, and you can only edit paths that you have defined.\n\n\
Creating Trail Maps at Hillmap\n\
An alternative to creating a trail on your phone is to \
use the site http://www.hillmap.com to create a trail from a laptop or desktop computer. \
Use the Path tab to define your trail.\n\
Use Tools > Download Gpx to save your path.\n\n\
Use the site http://wigo.ws/geopaths/gpxpaths.html to upload and save the path that you have \
downloaded from hillmap.com so that you can access the path (aka trail) online from this phone app.\
';
        return sMsg;
    }

    // Returns string for message describing what back to trail instructions mean.
    function BackToTrailHelp() {
        var sMsg = '\
The instructions for returning to the trail give the heading \
to return to the nearest point on the trail from your \
current location.\n\n\
There are also suggestions on how to turn from your current traveling direction \
to return back to the trail. While the heading back to the trail is accurate, \
suggestions for turning may not be. Since a turning suggestion may be \
inaccurate, it is prefixed with a "?" mark.\n\
THE TURNS ARE ONLY SUGGESTIONS AND MAYBE WRONG:\n\
    * One kind of suggestion is based on the heading from your previous locaton. \
You may not have traveled in a straight line from your previous location.\n\
    * The second kind of suggestion is based on the compass heading that your phone \
may be able to provide. The compass heading is the direction your phone indicates \
you are traveling and is most accurate when you are holding \
your phone level with its top pointing in the direction you are traveling. \
The compass may need to be calibrated to show accurately.\n\n\
To calibrate your compass, rotate it three times or so around each axis:\n\
    Hold the phone vertically facing you.\n\
    1) Tilt top of phone down and then back up toward you.\n\
    2) Rotate top of phone phone left and right keeping the face of phone towards you.\n\
    3) Rotate face of phone away and back toward you, keeping the phone vertical.\n\n\
To get an accurate turning suggestion from your previous location:\n\
    1) Touch MyLoc button to get your location.\n\
    2) Walk in a straight line more than the previous geo location threshold, typically 40 meters (44 yards). \
The Prev Geo Loc Thres is given in Settings.\n\
    3) Touch MyLoc button again to see the off-path distance, return heading, and turning suggestion.\n\n\
Of course, if you know accurate compass directions yourself, follow the heading back to the trail. \
The turning suggestions are only an aid if you do not know accurate compass directions.';
        return sMsg;
    }

    // Returns string for message describing how tracking interval affects battery usage.
    function BatteryDrainVsTrackingHelp() {
        var sMsg = '\
When automatic tracking is on, the battery in the phone is drained more quickly.\
The shorter the time interval for automatic tracking, the quicker the battery drains.\n\n\
Menu > Settings > Geo Tracking sets the time interval. So make the time interval longer \
to reduce the drain on the battery. \
When automatic tracking is off, the drain on the battery is mininal.\n\n\
Menu > Settings > Allow Geo Tracking can be set to not allow automatic tracking, \
which minimizes the battery drain. You can still check your geo location manually by touching \
the MyLoc button on the top of the map. \
Also, if using a Pebble watch, the Select (middle) button does the same thing.\n\n\
The Track control on the top of the map lets you toggle automatic tracking On or Off.\n\n\
When this app is in the background (not showing) with automatic tracking off, the app is not draining the battery. \
However, if the app is in the background with automatic tracking on, the app is draining the battery.\n\n\
Note that if the phone is turned off (not powered totally off, just turned off), automatic tracking when enabled \
is still occurring, which is draining the battery.\
';
        return sMsg;
    }

    function TermsOfUseMsg() {
        var sMsg = '\
TERMS OF USE\n\n\
IF YOU DO NOT AGREE WITH THESE TERMS OF USE, UNINSTALL THIS APP.\n\n\
This app is released free of charge in the hope that it will be useful. \
However, it is provided without any warranty of any kind; without even the implied warranty of \
usefulness, accuracy, reliability, availability, or free of software defects.\n\n\
ADVICE FOR TURNING TO RETURN TO TRAIL MAYBE WRONG\n\
The heading back to the trail should be accurate, but the suggestions for turning back to the trail \
may not be. \
A suggestion for turning to return to the trail starts to a "?" to indicate it may be inaccurate and \
is only a SUGGESTION TO BE VERIFIED BY YOU. The suggestions for turning my be wrong for various reasons:\n\
    * The heading from your previous geo-location is a straight line, and you may not have traveled in a straight line.\n\
    * The compass may need to be calibrated.\n\
    * The compass heading depends on the orientation of your phone. The compass heading (the direction you are traveling) \
is most accurate when you are holding the phone level with its top pointing in the direction you want to travel.\n\
    * The geolocation provided by your phone has tolerances for its accuracy.\n\n\
DATA AND PRIVACY\n\
Server Data\n\
For trails that you define, data is stored on a server. The data has latitude and longitude for points \
defining the trail. Your Facebook public identification (not your name) is associated with your trails. \
The data is not encrypted. Minual protection for the database is provided through access controlled by a password. \
Be aware that data could be obtained illegally by hackers or legally by an authorized governmental authority. \n\n\
Data on Your Phone\n\
Data is saved on your phone for defining trails and caching map sections when you are offline. \
It can be deleted by you from your phone by managing the application on your phone.\n\n\
Making Your Trails Public or Private\n\
When you define a trail you mark it as Public or Private. If a trail is Public, it can be seen by anyone \
using this app. If the trail is marked Private, the trail is only visible by you when using the app.\
However, as mentioned above, the data at the server could be compromised, in which case your Private trails could be known.\n\n\
A FURTHER CAUTION\n\
Hiking depends on your own self reliance and good judgment. Realize that trails you find \
may not be appropriate for your ablities and that the trails could have inaccuracies.\
';
        return sMsg;
    }

    // Displays alert message given the string sMsg.
    function AlertMsg(sMsg) {
        var sTitle = document.title;
        if (navigator.notification)
            navigator.notification.alert(sMsg, null, sTitle);
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


    // Removes all elements after the first element (index 0) from selectGeoPath control,
    // provide the current mode is offline. Also clears the path drawn on the map.
    function ClearOfflineGeoPathSelect(select) {
        if (that.curMode() === that.eMode.offline) {
            /* ////201608087 redo 
            var nCount = selectGeoPath.length;
            for (var i = 1; i < nCount; i++) {
                selectGeoPath.remove(1);
            }
            */
            selectGeoTrail.empty(1); // Keeps first item in the list.
            map.ClearPath();
        }
    }

    // Runs the trackTimer object.
    // If trackTimer.bOn is false, clears trackTimer; otherwise starts the periodic timer.
    // Remarks: Provides the callback function that is called after each timer period completes.
    function RunTrackTimer() {
        if (trackTimer.bOn) {
            var bInProgress = false;
            trackTimer.SetTimer(function (result) {
                if (result.bError) {
                    trackTimer.ClearTimer();
                    var sError = 'Timer for automatic geo-tracking failed.<br/>';
                    ShowGeoTrackingOff(sError);
                    alerter.DoAlert();
                    pebbleMsg.Send("Tracking timer failed", true, false); // vibrate, no timeout.
                } else {
                    if (bInProgress)
                        return;
                    bInProgress = true;
                    if (result.bRepeating) {
                        if (map.IsPathDefined()) {
                            DoGeoLocation();
                        }
                    } else {
                        trackTimer.ClearTimer();
                        ShowGeoTrackingOff();
                    }
                    bInProgress = false;
                }
            });
        } else {
            trackTimer.ClearTimer();
            ShowGeoTrackingOff();
        }
    }

    // Checks that the control values for settings are valid.
    // Shows dialog for an invalid setting and sets focus to the control.
    // Returns true for all settings valid.
    function CheckSettingsValues() {
        // Helper to checking select droplist.
        function IsSelectCtrlOk(ctrl) {
            var bOk = ctrl.selectedIndex >= 0;
            var sMsg = "Selection is invalid. Select a valid option from drop list.";
            ShowOrClearError(bOk, ctrl, sMsg);
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
            // Remove class name indicating ErrorMsg.
            var sClass = ctrl.getAttribute('class');
            if (sClass) { // Note: class is null if it does not exist for the ctrl.
                sClass = sClass.replace(/ErrorMsg/g,"").trim();
                ctrl.setAttribute('class', sClass);
            } else {
                sClass = "";
            }
            if (!bOk) {
                sClass += ' ErrorMsg';
                ctrl.setAttribute('class', sClass);
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

        // Check each ctrl for validity one by one.
        if (!IsSelectCtrlOk(selectAllowGeoTracking))
            return false;

        if (!IsSelectCtrlOk(numberOffPathThresMeters))
            return false;

        if (!IsSelectCtrlOk(numberGeoTrackingSecs))
            return false;

        if (!IsSelectCtrlOk(selectEnableGeoTracking))
            return false;
        if (!IsSelectCtrlOk(selectOffPathAlert))
            return false;
        if (!IsSelectCtrlOk(selectPhoneAlert))
            return false;
        if (!IsSelectCtrlOk(numberPhoneVibeSecs))
            return false;
        if (!IsSelectCtrlOk(numberPhoneBeepCount))
            return false;
        if (!IsSelectCtrlOk(selectPebbleAlert))
            return false;
        if (!IsSelectCtrlOk(numberPebbleVibeCount))
            return false;
        if (!IsSelectCtrlOk(numberPrevGeoLocThresMeters))
            return false;
        if (!IsSelectCtrlOk(selectClickForGeoLoc))
            return false;

        if (!IsLatCtrlOk(numberHomeAreaSWLat))
            return false;
        if (!IsLonCtrlOk(numberHomeAreaSWLon))
            return false;
        if (!IsLatCtrlOk(numberHomeAreaNELat))
            return false;
        if (!IsLonCtrlOk(numberHomeAreaNELon))
            return false;

        return true;
    }

    // Returns settings object wigo_ws_GeoTrailSettings from values in controls.
    function GetSettingsValues() {
        var settings = new wigo_ws_GeoTrailSettings();
        settings.bAllowGeoTracking = selectAllowGeoTracking.value === 'yes';
        settings.mOffPathThres = parseFloat(numberOffPathThresMeters.value);
        settings.secsGeoTrackingInterval = parseFloat(numberGeoTrackingSecs.value);
        settings.bEnableGeoTracking = selectEnableGeoTracking.value === 'yes';
        settings.bOffPathAlert = selectOffPathAlert.value === 'yes';
        settings.bPhoneAlert = selectPhoneAlert.value === 'yes';
        settings.secsPhoneVibe = parseFloat(numberPhoneVibeSecs.value);
        settings.countPhoneBeep = parseInt(numberPhoneBeepCount.value);
        settings.bPebbleAlert = selectPebbleAlert.value === 'yes';
        settings.countPebbleVibe = parseInt(numberPebbleVibeCount.value);
        settings.dPrevGeoLocThres = parseFloat(numberPrevGeoLocThresMeters.value);
        settings.bCompassHeadingVisible = selectCompassHeadingVisible.value === 'yes'; 
        settings.bClickForGeoLoc = selectClickForGeoLoc.value === 'yes';
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
        selectAllowGeoTracking.value = settings.bAllowGeoTracking ? 'yes' : 'no';
        numberOffPathThresMeters.value = settings.mOffPathThres.toFixed(0);
        numberGeoTrackingSecs.value = settings.secsGeoTrackingInterval.toFixed(0);
        selectEnableGeoTracking.value = settings.bEnableGeoTracking ? 'yes' : 'no';
        selectOffPathAlert.value = settings.bOffPathAlert ? 'yes' : 'no';
        selectPhoneAlert.value = settings.bPhoneAlert ? 'yes' : 'no';
        numberPhoneVibeSecs.value = settings.secsPhoneVibe.toFixed(1);
        numberPhoneBeepCount.value = settings.countPhoneBeep.toFixed(0);
        selectPebbleAlert.value = settings.bPebbleAlert ? 'yes' : 'no';
        numberPebbleVibeCount.value = settings.countPebbleVibe.toFixed(0);
        numberPrevGeoLocThresMeters.value = settings.dPrevGeoLocThres.toFixed(0);
        selectCompassHeadingVisible.value = settings.bCompassHeadingVisible ? 'yes' : 'no'; 
        selectClickForGeoLoc.value = settings.bClickForGeoLoc ? 'yes' : 'no';
        numberHomeAreaSWLat.value = settings.gptHomeAreaSW.lat;
        numberHomeAreaSWLon.value = settings.gptHomeAreaSW.lon;
        numberHomeAreaNELat.value = settings.gptHomeAreaNE.lat;
        numberHomeAreaNELon.value = settings.gptHomeAreaNE.lon;
    }

    // Enables/disables, shows/hides, and sets values for the Track and Alert select controls
    // on the map panel. 
    // Arg:
    //  settings: wigo_ws_GeoTrailSettings object for user settings (preferences).
    function EnableMapPanelGeoTrackingOptions(settings) {
        var bAllow = settings.bAllowGeoTracking;
        var bOffPathAlert = settings.bOffPathAlert;
        var bTracking = settings.bEnableGeoTracking;
        if (bAllow) {
            $(selectGeoTrack).show();
            $(labelGeoTrack).show();
            if (settings.bPhoneAlert) {
                $(selectAlert).show();
                $(labelAlert).show();
            } else {
                $(selectAlert).hide();
                $(labelAlert).hide();
            }
            $(selectGeoTrack).val(bTracking ? 'on' : 'off');
            $(selectAlert).val(bOffPathAlert ? 'on' : 'off');
        } else {
            $(selectGeoTrack).hide();
            $(labelGeoTrack).hide();
            $(selectAlert).hide();
            $(labelAlert).hide();
            $(selectGeoTrack).val('off');
            $(selectAlert).val('off');
        }
        $(selectGeoTrack).prop('disabled', !bAllow);
        $(selectAlert).prop('disabled', !bAllow);
    }

    // Sets parameters in other member vars/objects based on settings.
    function SetSettingsParams(settings) {
        EnableMapPanelGeoTrackingOptions(settings);
        EnableMapDropDownGeoTrackingOptions(onlineMapDropDown,settings); 
        // Clear tracking timer if it not on to ensure it is stopped.
        map.bIgnoreMapClick = !settings.bClickForGeoLoc;
        map.dPrevGeoLocThres = settings.dPrevGeoLocThres;
        // Enable phone alerts.
        alerter.bAlertsAllowed = settings.bAllowGeoTracking && settings.bPhoneAlert;
        if (settings.bAllowGeoTracking) {
            alerter.bPhoneEnabled = settings.bPhoneAlert && settings.bOffPathAlert;
        } else {
            alerter.bPhoneEnabled = false;
        }
        alerter.msPhoneVibe = Math.round(settings.secsPhoneVibe * 1000);
        alerter.countPhoneBeep = settings.countPhoneBeep;

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
        pebbleMsg.SetTimeOut(settings.secsGeoTrackingInterval);
        // Start Pebble app if it is enabled.
        if (settings.bPebbleAlert)
            pebbleMsg.StartApp();

        trackTimer.dCloseToPathThres = settings.mOffPathThres;
        trackTimer.setIntervalSecs(settings.secsGeoTrackingInterval);
        // Clear or start the trackTimer running.
        trackTimer.bOn = IsGeoTrackValueOn();
        RunTrackTimer();
    }

    // Shows or hides the divSettings.
    // Arg:
    //  bShow: boolean to indicate to show.
    function ShowSettingsDiv(bShow) {
        var sShowSettings = bShow ? 'block' : 'none';
        var sShowMap = bShow ? 'none' : 'block'; 
       
        panel.style.display = sShowMap;
        divSettings.style.display = sShowSettings;
    }

    // Returns true if HTML el is hiddent.
    // Note: Do not use for a fixed position element, which is not used anyway.
    function IsElementHidden(el) {
        var bHidden = el.offsetParent === null;
        return bHidden;
    }

    // Clears geo tracking objects from map (circles, lines for tracking) and 
    // displays status of geo tracking off. 
    // Sets selectGeoTrack control to show off.
    // Arg:
    //  sError: optional string for an error msg prefix.
    //      The status always includes text indicating geo tracking is off.
    //      When sError is given, the status shows as an error.
    function ShowGeoTrackingOff(sError) {
        // Set selectGeoTrack control to show off.
        SetGeoTrackValue(false);
        // Clear map of update objects and show status.
        var bError = typeof (sError) === 'string';
        var sMsg = bError ? sError : "";
        sMsg += "Geo tracking off";
        map.ClearGeoLocationUpdate();
        that.ShowStatus(sMsg, bError); // false => not an error.
    }

    // Sets value for selectGeoTrack control.
    // Arg:
    //  bTracking: boolean indicating tracking is on.
    function SetGeoTrackValue(bTracking) {
        $(selectGeoTrack).val(bTracking ? 'on' : 'off');
    }

    // Returns true if value of selectGeoTrack indicate on.
    function IsGeoTrackValueOn() {
        var bOn = selectGeoTrack.value === 'on';
        return bOn;
    }

    var trackTimer = new GeoTrackTimer(); // Timer for tracking geo location.
    trackTimer.bOn = IsGeoTrackValueOn();

    // Object for tracking geo location on periodic time intervals.
    function GeoTrackTimer() {
        var that = this;
        this.bOn = false; // Boolean indicating timer runs repeatedly.

        // Threshold in meters for distance to nearest point on path.
        // If distance from geo-location to nearest point on the path
        // is > dCloseToPathThres, then geo location is off-path.
        this.dCloseToPathThres = -1;

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

        // Starts or clears the timer.
        // If this.bOn is false, clears the time (stops the timer).
        // If this.bOn is true, timer runs repeated based on timer interval.
        // Arg:
        //  callback is function called when interval expires. Signature:
        //      bRepeating: boolean indicating timer is repeating.
        //          Note: when bRepeating is false, the timer has been cleered.           
        this.SetTimer = function (callback) {
            if (this.bOn) {
                // Set new timer id as integer for current time.
                myTimerId = Date.now();
                // Set wake wake for time interval.
                var nSeconds = Math.round(msInterval / 1000);
                myTimerCallback = callback;
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
            } else {
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
        }

        // Event handler success snooze wake up.
        function SnoozeWakeUpSuccess(result) {
            if (typeof(result) === 'string') {
                console.log('wakeup string result:' + result);
                // Note: extra is not member of result here.
                if (result === 'OK') {
                    if (myTimerCallback)
                        myTimerCallback({ bRepeating: that.bOn, bError: false });
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
            if (myTimerCallback)
                myTimerCallback({bRepeating: that.bOn, bError: true });
        }


        var msInterval = 15 * 1000;    // Interval period of timer in milliseconds.
        var myTimerId = null;
        var myTimerCallback = null;
    }


    // Gets current geo location and shows the location figures on the map.
    // Arg:
    //  dCloseToPath: meters. If distance to nearest point on path is < dCloseToPath,
    //      then the location figures are not shown. (Specify as less than 0 to always
    //      show the location figures.)
    // Arg: 
    //  callbackUpd: Callback function called asynchronously after geolocation has been updated.
    //      Arg: {bToPath: boolean, dToPath: float, bearingToPath: float, bRefLine: boolean, bearingRefLine: float, 
    //            bCompass: boolean, bearingCompass: float, compassError: CompassError or null}:
    //          The arg object returned by method property SetGeoLocationUpdate(..) of wigo_ws_GeoPathMap object.
    //          See description of SetGeoLocationUpdate(..) method for more details.    
    function TrackGeoLocation(dCloseToPath, callbackUpd) {
        var geoLocationOptions = { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 };
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
                    callbackUpd(updResult);
            }); 
        },
        function (positionError) {
            // Error occurred trying to get location.
            var sMsg = "Geolocation Failed!\nCheck your device settings for this app to enable Geolocation.\n" + positionError.message;
            that.ShowStatus(sMsg);
        },
        geoLocationOptions);
    }

    /* ////20160813 Not used, moved to SetPathList(..).
    // Initialize selectGeoPath droplist to empty list of path.
    // Arg:
    //  sHeader: string for item 0 in the droplist, which is a header desribing the list.
    function InitPathList(sHeader) {
        // Remove any existing elements from selectGeoPath.
        ////20160813 / * ////20160808 redo
        ////20160813 var nCount = selectGeoPath.length;
        ////20160813 for (var i = 0; i < nCount; i++) {
        ////20160813     selectGeoPath.remove(0);
        ////20160813 
        ////20160813 }
        ////20160813 // Add header element.
        ////20160813 var option = new Option(sHeader, "-1");
        ////20160813 selectGeoPath.add(option);
        ////20160813 * /


        selectGeoTrail.empty();
        selectGeoTrail.appendItem("0", sHeader, true); // true => show header as value.

    }
    */

    // Shows or hides divOwnerId.
    // Arg:
    //  bShow: boolean indicating to show.
    function ShowOwnerIdDiv(bShow) {
        ////20160831 if (bShow)
        ////20160831     divOwnerId.style.display = 'block';
        ////20160831 else
        ////20160831     divOwnerId.style.display = 'none';
        ShowElement(divOwnerId, bShow); ////20160831 refactore fix
    }

    // Show selectSignIn control.
    // Arg: bShow is boolean to show or hide.
    function ShowSignInCtrl(bShow) {
        ShowElement(selectSignIn, bShow);
    }

    // Shows or hides selectMapCacke.
    // Arg:
    //  bShow: boolean indicating to show.
    function ShowMapCacheSelect(bShow)
    {
        /* ////20160813 probably can delete this function.
        if (bShow)
            selectMapCache.style.display = 'block';
        else
            selectMapCache.style.display = 'none';
        */            
    }

    // Shows or hides buSaveOffline button.
    // Arg:
    //  bShow: boolean indicating to show.
    function ShowSaveOfflineButton(bShow) {
        /* ////20160813 this function is probably not needed. 
        if (bShow)
            buSaveOffline.style.display = 'block';
        else
            buSaveOffline.style.display = 'none';
        */
    }

    // Shows or hides divPathInfo, which has textbox for Path Name.
    // Arg:
    //  bShow: boolean indicating to show.
    function ShowPathInfoDiv(bShow) {
        /* ////20160809 
        if (bShow)
            divPathInfo.style.display = 'block';
        else
            divPathInfo.style.display = 'none';
        */
        ShowElement(divTrailInfo, bShow);
    }

    function ShowElement(el, bShow) {
        // var sShow = bShow ? 'block' : 'none';
        // el.style.display = sShow;
        // Use class name to show or hide.  ////20160815 changed
        if (bShow) {
            el.classList.add('wigo_ws_Show');
            el.classList.remove('wigo_ws_NoShow');
        } else {
            el.classList.remove('wigo_ws_Show');
            el.classList.add('wigo_ws_NoShow');
        }
    }

    // Shows or hides the selectMenu droplist.
    function ShowMenu(bShow) {
        ////20160807 ShowElement(selectMenu, bShow);
        ////20160807!!!! Probable can delete this function.
    }

    // Shows or hides the selectFind droplist.
    function ShowFind(bShow) {
        ShowElement(selectFind, bShow);
    }

    // Shows or hides divPathDescr, which contains controls for
    // path name, sharing, and server action.
    function ShowPathDescrCtrls(bShow) {
        ShowElement(divPathDescr, bShow);
    }

    // Shows or hides textbox for Path Name and its label.
    function ShowPathNameCtrl(bShow) {
        ShowElement(labelPathName, bShow);
        ShowElement(txbxPathName, bShow);
    }

    // Shows or hides Share select ctrl and its label.
    function ShowShareCtrl(bShow) {
        ShowElement(labelShare, bShow);
        ShowElement(selectShare, bShow);
    }

    // Shows or hides select point action ctrl.
    function ShowPtActionCtrl(bShow) {
        ShowElement(selectPtAction, bShow);
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

    // Hide controls for editing path.
    function HidePathEditCtrls() {
        ShowPathDescrCtrls(false);
        ShowPathCursors(false);
        ShowPathIxButtons(false);
    }

    // Shows or hides sectEditMode.
    // Arg:
    //  bShow: boolean indicating to show.
    function ShowModeDiv(bShow) {
        if (bShow)
            divMode.style.display = 'block';
        else
            divMode.style.display = 'none';
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
        this.DoAlert = function() {
            if (this.bAlertsAllowed) {
                if (this.bPhoneEnabled) {
                    // Issue phone alert.
                    if (navigator.notification) {
                        if (this.msPhoneVibe > 0.001)
                            navigator.notification.vibrate(this.msPhoneVibe);
                        if (this.countPhoneBeep > 0)
                            navigator.notification.beep(this.countPhoneBeep);
                    }
                }
            }
        }

        // ** Private members

    }

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

    // Shows Status msg for result from map.SetGeoLocUpdate(..).
    // Arg:
    //  upd is {bToPath: boolean, dToPath: float, bearingToPath: float, bRefLine: float, bearingRefLine: float,
    //          bCompass: bool, bearingCompass: float, compassError: CompassError or null}:
    //    See SetGeoLocationUpdate(..) member of wigo_ws_GeoPathMap for details about upd, which is returned
    //    by the method. 
    function ShowGeoLocUpdateStatus(upd) {
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
                s += "Fr Beg: {0}m{1}<br/>".format(upd.dFromStart[i].toFixed(0), sMore);
            }

            for (i = 0; i < count; i++) {
                if (i === 0)
                    dTotal += upd.dToEnd[i];
                sMore = count > 1 && i < count - 1 ? "/" : "";
                s += "To End: {0}m{1}<br/>".format(upd.dToEnd[i].toFixed(0), sMore);
            }
            s += "Total: {0}m<br/>".format(dTotal.toFixed(0));
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
                s += "<- {0}m{1}<br/>".format(upd.dFromStart[i].toFixed(0), sMore);
            }

            for (i = 0; i < count; i++) {
                if (i === 0)
                    dTotal += upd.dToEnd[i];
                sMore = count > 1 && i < count - 1 ? "/" : "";
                s += "-> {0}m{1}<br/>".format(upd.dToEnd[i].toFixed(0), sMore);
            }
            s += "Tot {0}m<br/>".format(dTotal.toFixed(0));
            return s;
        }

        that.ClearStatus();
        if (!upd.bToPath) {
            if (map.IsPathDefined()) {
                var sMsg = "On Path<br/>";
                sMsg += PathDistancesMsg(upd);
                that.ShowStatus(sMsg, false); // false => not an error.
                sMsg = "On Path<br/>";
                sMsg += PathDistancesPebbleMsg(upd);
                pebbleMsg.Send(sMsg, false, trackTimer.bOn) // no vibration, timeout if tracking.
            } else {
                // Show lat lng for the current location since there is no trail.
                var sAt = "lat/lng({0},{1})<br/>".format(upd.loc.lat.toFixed(6), upd.loc.lng.toFixed(6));
                if (upd.bCompass) {
                    sAt +=  "Compass Heading: {0}&deg;<br/>".format(upd.bearingCompass.toFixed(0));
                }
                that.ShowStatus(sAt, false); // false => no error.
                sAt = "lat/lng\n{0}\n{1}\n".format(upd.loc.lat.toFixed(6), upd.loc.lng.toFixed(6));
                if (upd.bCompass) {
                    sAt += "Cmps Hdg: {0}{1}\n".format(upd.bearingCompass.toFixed(0), sDegree);
                }
                pebbleMsg.Send(sAt, false, false); // no vibration, no timeout.
            }
        } else {
            // vars for off-path messages.
            var sBearingToPath = upd.bearingToPath.toFixed(0);
            var sDtoPath = upd.dToPath.toFixed(0);
            var sToPathDir = map.BearingWordTo(upd.bearingToPath);
            var phi = upd.bearingToPath - upd.bearingRefLine;
            var phiCompass = upd.bearingToPath -  upd.bearingCompass;
            var sTurn = 'right';
            var sTurnCompass = 'right';
            // Show distance and heading from off-path to on-path location.
            var s = "Head {0} ({1}&deg; wrt N) to go to path ({2}m).<br/>".format(sToPathDir, sBearingToPath, sDtoPath);
            var sMsg = s;
            if (upd.bRefLine) {
                // Calculate angle to turn to return to path based on previous heading.
                if (phi < 0)
                    phi += 360.0;
                if (phi > 180.0) {
                    sTurn = 'left';
                    phi = 360.0 - phi;
                }
                s = "?Turn {1} {0}&deg; from PrevLoc Hdg {2}&deg;.<br/>".format(phi.toFixed(0), sTurn, upd.bearingRefLine.toFixed(0));
                sMsg += s;
            }
            // Show angle to turn based on compass bearing.
            if (upd.bCompass) {
                // Calculate angle to turn to return to path based on previous heading.
                if (phiCompass < 0)
                    phiCompass += 360.0;
                if (phiCompass > 180.0) {
                    sTurnCompass = 'left';
                    phiCompass = 360.0 - phiCompass;
                }
                s = "?Turn {1} {0}&deg; from Compass Hdg {2}&deg;.<br/>".format(phiCompass.toFixed(0), sTurnCompass, upd.bearingCompass.toFixed(0));
                sMsg += s;
            }
            // Show distance from start and to end.
            sMsg += PathDistancesMsg(upd);
            that.ShowStatus(sMsg, false);
            // Issue alert to indicated off-path.
            alerter.DoAlert();

            // Issue alert to Pebble watch.
            sMsg = "Off {0} m\n".format(sDtoPath);
            // sMsg += "Head {0} ({1}{2})\n".format(sCompassDir,sBearingToPath, sDegree);
            // Decided not to show compass degrees, just direction: N, NE, etc.
            sMsg += "Head {0}\n".format(sToPathDir);
            // Show angle to turn. Use compass if available.
            if (upd.bCompass) {
                sMsg += "?C {0} {1}{2}\n".format(sTurnCompass, phiCompass.toFixed(0), sDegree);
            }
            sMsg += "?P {0} {1}{2}\n".format(sTurn, phi.toFixed(0), sDegree);
            sMsg += PathDistancesPebbleMsg(upd); 
            pebbleMsg.Send(sMsg, true, trackTimer.bOn); // vibration, timeout if tracking.
        }
    }

    // ** Private members for Open Source map
    var map = new wigo_ws_GeoPathMap(false); // false => do not show map ctrls (zoom, map-type).
    map.onMapClick = function (llAt) {
        // Show map click as a geo location point only for Edit or Offline mode. Also,
        // Showing a map click is only for debug and is ignored by wigo_ws_GeoPathMap
        // object unless Settings indicates a click for geo location on.
        var nMode = that.curMode();
        if (nMode === that.eMode.online_view || 
            nMode === that.eMode.offline) {
            map.SetGeoLocationUpdate(llAt, trackTimer.dCloseToPathThres, function(updateResult){
                ShowGeoLocUpdateStatus(updateResult);
            });
        }
    };

    // Shows panel of controls over the map based on mode.
    // For mode of online_edit or online_define, only shows
    // the Fullscreen/Reduce button.
    // For mode 
    // Arg:
    //  nMode is value given by eMode enumeration.
    //      For online_edit or online_define, only shows Fullscreen/Reduce button.
    //      For online_view or offline, shows all the buttons.
    function ShowMapPanelForMode(nMode) {
        var bShow = true;
        switch (nMode) {
            case that.eMode.online_edit:
            case that.eMode.online_define:
            case that.eMode.tou_not_accepted: 
                bShow = false;
                break;
        }
        // Show or hide the panel rather just showing/hiding certain ctrls on panel.
        ShowElement(panel, bShow);
    }

    // Sets panel of controls for map at top of the map.
    function SetMapPanelTop() {
        var top = getMapCanvas().offsetTop;
        panel.style.top = top + 'px';
    }

    // Returns true if divSettings container is hidden.
    function IsSettingsHidden() {
        var bHidden = divSettings.style.display === 'none' || divSettings.style.dispaly === '';
        return bHidden;
    }

    // Display map below divPath info rather than at the top of the screen.
    // Also positions panel to be over the top of the map.
    function MinimizeMap() {
        ShowOwnerIdDiv(true);
        ShowModeDiv(true);
        ShowPathInfoDiv(true);
        SetMapPanelTop();
    }

    // Display map at top of screen by hiding edit mode and path info.
    // Also positions panel to be over the top of the map.
    function MaximizeMap() {
        ShowOwnerIdDiv(false);
        ShowModeDiv(false);
        ShowPathInfoDiv(false);
        SetMapPanelTop();
    }

    // ** Private members for Facebook
    // Callback after Facebook authentication has completed.
    function cbFbAuthenticationCompleted(result) {
        if (that.onAuthenticationCompleted)
            that.onAuthenticationCompleted(result);
    }

    // ** Constructor initialization.
    // Create modeBar
    var modeBar = document.getElementById('modeBar');
    // Fill the main menu drop list.
    var parentEl = document.getElementById('mainMenu');
    var mainMenu = new ctrls.DropDownControl(parentEl, "mainMenuDropDown", null, null, "img/ws.wigo.menuicon.png"); 
    /* /////20160813
    var eMainMenuValues = {
        terms_of_use: 0,
        settings: 1,
        start_pebble: 2,
        help: 3,
        back_to_trail: 4,
        battery_drain: 5,
        about: 6,
        license: 7
    }; 
    */                       
    var mainMenuValues = [['terms_of_use','Terms of Use'],                       // 0
                          ['settings', 'Settings'],                               // 1
                          ['start_pebble', 'Start Pebble'],                       // 2
                          ['help', 'Help - Guide'],                               // 3 
                          ['back_to_trail', 'Help - Back To Trail'],              // 4
                          ['battery_drain', 'Help - Tracking vs Battery Drain'],  // 5
                          ['about', 'About'],                                     // 6
                          ['license', 'License']                                  // 7
                         ];
    mainMenu.fill(mainMenuValues);

    /* ////20160806 Not needed
    mainMenu.onClicked = function () {
        ///20160804 editModeTab.drop(false); // Ensure Edit mode drop down (Edit Trail, New Trail) is hidden.
    };
    */

    mainMenu.onListElClicked = function (dataValue) {
        divStatus.addLine("Main menu item  dataValue: " + dataValue); ////20160813DebugOnly delete

        if (dataValue === 'settings') {
            var settings = that.onGetSettings();
            SetSettingsValues(settings);
            ShowSettingsDiv(true);
            SetMapPanelTop();
        } else if (dataValue === 'start_pebble') {
            if (pebbleMsg.IsConnected()) {
                if (pebbleMsg.IsEnabled()) {
                    pebbleMsg.StartApp();
                } else {
                    AlertMsg("Pebble watch is not enabled. Use Menu > Settings to enable.")
                }
            } else {
                AlertMsg("Pebble watch is not connected.");
            }
            this.selectedIndex = 0;
        } else if (dataValue === 'about') {
            AlertMsg(AboutMsg())
            this.selectedIndex = 0;
        } else if (dataValue === 'license') {
            AlertMsg(LicenseMsg());
            this.selectedIndex = 0;
        } else if (dataValue === 'help') {
            AlertMsg(HelpMsg());
            this.selectedIndex = 0;
        } else if (dataValue === 'back_to_trail') {
            AlertMsg(BackToTrailHelp());
            this.selectedIndex = 0;
        } else if (dataValue === 'terms_of_use') {
            AlertMsg(TermsOfUseMsg());
            this.selectedIndex = 0;
        } else if (dataValue === 'battery_drain') {
            AlertMsg(BatteryDrainVsTrackingHelp());
            this.selectedIndex = 0;
        }
        that.ClearStatus();
    };


    parentEl = document.getElementById('selectMode');
    var selectMode = new ctrls.DropDownControl(parentEl, "selectMenuDropDown", null, "", "img/ws.wigo.dropdownicon.png");
    var selectModeValues = [['select_mode', 'Select Map View'],
                            ['online_view',   'Online'],        
                            ['offline',       'Offline'],       
                            ['online_edit',   'Edit a Trail'],        
                            ['online_define', 'Define a Trail']       
                           ]; 

    /* ////20160813 not used
    var eSelectModeValues = {
        online_view:       0,
        online_edit:       1,
        online_define:     2,
        offline:           3
    };
    */

    selectMode.fill(selectModeValues);

    selectMode.onListElClicked = function(dataValue) {
        // this.value is value of selectMode control.
        var nMode = that.eMode.toNum(dataValue);

        // Helper function to change mode.
        function AcceptModeChange() {
            that.ClearStatus();
            // Inform controller of the mode change.
            that.onModeChanged(nMode);
            var bOffline = nMode === that.eMode.offline;
            var result = map.GoOffline(bOffline);
            that.setModeUI(nMode);
        }

        if (fsmEdit.IsPathChanged()) {
            ConfirmYesNo("The geo path has been changed. OK to continue and loose any change?", function (bConfirm) {
                if (bConfirm) {
                    fsmEdit.ClearPathChange();
                    AcceptModeChange();
                } else {
                    // Restore the current mode selected before the change.
                    selectMode.selectedIndex = that.curMode();
                }
            });
        } else {
            AcceptModeChange();
        }

    };

    // -1        <option value="menu">Menu</option>
    //  0        <option value="terms_of_use">Terms of Use</option>
    //  1        <option value="settings">Settings</option>
    //  2        <option value="startpebble">Start Pebble</option>
    //  3        <option value="help">Help - Guide</option>
    //  4        <option value="back_to_trail">Help - Back To Trail</option>
    //  5        <option value="battery_drain">Help - Tracking vs Battery Drain</option>
    //  6        <option value="about">About</option>
    //  7        <option value="license">License</option>
                     


    /* ////20160811 Not using tabs for mode.
    // Fill drop list for EditMode tab.
    parentEl = document.getElementById('editModeTab');
    var editModeTab = new ctrls.DropDownControl(parentEl, "editModeDropDown", "Edit", null, "img/ws.wigo.dropdownicon.png");
    var editModeValues = ['Edit Trail', 'New Trail'];
    editModeTab.fill(editModeValues);
    editModeTab.onListElClicked = function (editIx) {
        tabs.select(2);
        switch (editIx) {
            case 0:
                if (that.curMode() !== that.eMode.online_edit) {
                    alert("Switching to Edit Trail mode.");
                    that.setModeUI(that.eMode.online_edit);
                }
                break;
            case 1:
                if (that.curMode() !== that.eMode.online_define) {
                    alert("Switching to DefineTrail mode.");
                    that.setModeUI(that.eMode.online_define);
                }
                break;
        }
    };

    // Set tabs for the mode selection.
    var tabEls = [document.getElementById("onlineModeTab"),
                    document.getElementById("offlineModeTab"),
                    document.getElementById("editModeTab"),
                    ];
    var tabs = new ctrls.TabControl(tabEls);
    tabs.onTabClicked = function (iTab, tab) {
        switch (iTab) {
            case 0:
                tabs.select(iTab);
                if (that.curMode() !== that.eMode.online_view) {
                    alert("Switching to Online mode");
                    that.setModeUI(that.eMode.online_view);
                }
                break;
            case 1:
                tabs.select(iTab);
                if (that.curMode() !== that.eMode.offline) {
                    alert("Switching to Offline mode");
                    that.setModeUI(that.eMode.offline);
                }
                break;
            case 2:
                // Note: Select Edit tab when drop list item (Edit Trail, New Trail) is selected.
                //       Only show dropdown when icon is clicked.
                break; // Ignore Edit mode tab clicked. Selecting from edit mode drop list changes mode.
        }
    }
    */

    // Initialize online bar.
    // Select GeoTrail control
    parentEl = document.getElementById('divTrailInfo');
    var selectGeoTrail = new ctrls.DropDownControl(parentEl, "selectGeoTrailDropDown", "Trail:", "Select a Geo Trail", "img/ws.wigo.menuicon.png");
    selectGeoTrail.onListElClicked = function(dataValue) { 
        var listIx = parseInt(dataValue)
        that.ClearStatus();
        // Always hide sign-in bar when path is selected to conserver screen space.
        ShowOwnerIdDiv(false);              ////20160831 added
        ////20160818 if (listIx >= 0) {
        ////20160808 var iList = parseInt(this.value);
        if (listIx < 0) {  ////20160818 was 1 
            // No path selected.
            map.ClearPath();
        } else {
            // Path is selected
            that.onPathSelected(that.curMode(), listIx);
            // Update status for track timer unless editing.
            if (that.curMode() === that.eMode.online_view ||
                that.curMode() === that.eMode.offline) {
                if (trackTimer.bOn) {
                    if (map.IsPathDefined()) {
                        // Tracking timer is on so show current geo location right away.
                        DoGeoLocation();
                    }
                } else {
                    that.ShowStatus("Geo tracking off.", false); // false => not an error.
                }
            }
        }
        ////20160818 }
    };


    parentEl = document.getElementById('onlineSelectFind');
    var onlineSelectFind = new ctrls.DropDownControl(parentEl, "onlineSelectFindDropDown", "Find Trails", null, "img/ws.wigo.dropdownicon.png"); 
    /* //// example
            <option value="find">Find</option>
            <option value="home_area">Home Area</option>
            <option value="on_screen">On Screen</option>
            <option value="all_public">All Paths</option>
            <option value="all_mine">All Mine</option>
            <option value="my_public">My Public</option>
            <option value="my_private">My Private</option>
    */
    onlineSelectFind.fill([ ['find', 'Find'],
                            ['home_area', 'Home Area'],
                            ['on_screen', 'On Screen'],
                            ['all_public', 'All Trails'],
                            ['all_mine', 'All Mine'],
                            ['my_public', 'My Public'],
                            ['my_private','My Private']
                          ]); 
    onlineSelectFind.onListElClicked = function(dataValue) { ////20160817 replace selectFind bind function.
        // The Find droplist is only valid in view mode.
        if (that.curMode() !== that.eMode.online_view)
            return; // Note: should not happen because selectFind should only be visible in view mode.

        // Save parameters for view for finding paths.
        var nFindIx = that.eFindIx.toNum(dataValue);  ////20160818 arg was this.value
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
            if (!sOwnerId) {
                that.ShowStatus("You must be signed in to find your paths.", true);
                ShowOwnerIdDiv(true); // Shopw sign-in bar ////20160831 added. 
                bClearPath = false;
            } else {
                viewFindParams.init(nFindIx);
                if (that.onFindPaths)
                    that.onFindPaths(sOwnerId, nFindIx, gptSW, gptNE);
            }
        } else {
            bClearPath = false;
        }

        ////20160817 this.selectedIndex = 0;
        // Clear the drawn map path because the selectGeoPath drop has been reloaded.
        if (bClearPath)
            map.ClearPath();
    }
    

    parentEl = document.getElementById("onlineMapMenu");
    var onlineMapDropDown = new ctrls.DropDownControl(parentEl, "onlineMapDropDown", "Map", null, "img/ws.wigo.menuicon.png");
    /* //// example for fill
    <div id="panel" class="wigo_ws_NoShow">
        <input id="buGoToPath" type="button" title="Center Geo Path" value="Ctr Trail" />
        <input id="buGeoLocate" type="button" title="Get My Geo Location" value="MyLoc" />
        <input id="buMinMaxMap" type="button" title="Toggle Full Screen" data-minstate="true" value="Full Screen" />
        <label id="labelGeoTrack" for="selectGeoTrack">Track</label>
        <select id="selectGeoTrack">
            <option value="on">On</option>
            <option value="off" selected="selected">Off</option>
        </select>
        <label id="labelAlert" for="selectAlert">Ph Alert</label>
        <select id="selectAlert">
            <option value="on">On</option>
            <option value="off" selected="selected">Off</option>
        </select>
    </div>
    */
    
    onlineMapDropDown.fill([["center_trail","Center Geo Trail"],
                            ["my_geo_loc", "My Geo Location"],
                            ["toggle_full_screen","Full Screen"],
                            ["toggle_track", ""],           ////20160826 Was Track On
                            ["toggle_phone_alert", ""]
                           ]);
    
    ////20160826NotNeeded // Extended property for tracking contronl.
    ////20160826NotNeeded parentEl = onlineMapDropDown.getListEl('toggle_track');
    ////20160826NotNeeded onlineMapDropDown.trackingCtrl = new ctrls.OnOffControl(parentEl, null, "Tracking", 0);

    // Set event handler for tracking ctrl in DropDownListItem changed.
    parentEl = onlineMapDropDown.getListEl('toggle_track');
    var trackingCtrl = new ctrls.OnOffControl(parentEl, null, "Tracking", -1);
    trackingCtrl.onChanged = function(nState) {
        that.ClearStatus(); 
        // Save state of flag to track geo location.
        ////20160826 trackTimer.bOn = IsGeoTrackValueOn();    // Allow/disallow geo-tracking.
        trackTimer.bOn = nState === 1;    // Allow/disallow geo-tracking.
        if (!trackTimer.bOn) {
            // Send message to Pebble that tracking is off.
            pebbleMsg.Send("Track Off", false, false); // no vibration, no timeout.
        } else {
            // Show status that tracking is on. The Alert On/Fff ctrl on Panel used to indicate the state.
            that.ShowStatus("Tracking on", false); ////20160827
        }
        // Start or clear trackTimer.
        RunTrackTimer();
    }

    // Set event handler for tracking ctrl in DropDownListItem changed.
    parentEl = onlineMapDropDown.getListEl('toggle_phone_alert');
    var alertCtrl = new ctrls.OnOffControl(parentEl, null, "Ph Alert", -1);
    alertCtrl.onChanged = function(nState) {
        // Enable/disable alerts.
        ////20160826 alerter.bPhoneEnabled = selectAlert.value === 'on';
        alerter.bPhoneEnabled = nState === 1;
        // Show status because Ph Alert on Panel is no longer used.
        var sMsg = nState === 1 ? "Phone Alert On." : "Phone Alert Off.";
        that.ShowStatus(sMsg, false); 
    }


    // Enables/disables, shows/hides, and sets values for the Track and Alert select items
    // in the dropdown menu for the map. 
    // Arg:
    //  dropDown: DropDownControl. Ref to DropDown control.
    //  settings: wigo_ws_GeoTrailSettings object for user settings (preferences).
    function EnableMapDropDownGeoTrackingOptions(dropDown, settings) {
        ////$$$$ fix this
        var bAllow = settings.bAllowGeoTracking;
        var bOffPathAlert = settings.bOffPathAlert;
        var bTracking = settings.bEnableGeoTracking;
        dropDown.hideListEl('toggle_track', !bAllow);
        dropDown.hideListEl('toggle_phone_alert', !settings.bPhoneAlert);
        if (bAllow) {
            ////20160820 $(selectGeoTrack).show();
            ////20160820 $(labelGeoTrack).show();
            ////20160828 dropDown.hideListEl('toggle_track', false);
            ////20160828 dropDown.hideListEl('toggle_phone_alert', !settings.bPhoneAlert);
            ////20160820 if (settings.bPhoneAlert) {
            ////20160820     ////20160820 $(selectAlert).show();
            ////20160820     ////20160820 $(labelAlert).show();
            ////20160820     dropDown.dimListEl('toggle_phone_alert', false);
            ////20160820 } else {
            ////20160820     ////20160820 $(selectAlert).hide();
            ////20160820     ////20160820 $(labelAlert).hide();
            ////20160820     dropDown.dimListEl('toggle_phone_alert', true);
            ////20160820 }
            ////20160828 $(selectGeoTrack).val(bTracking ? 'on' : 'off');
            ////20160828 $(selectAlert).val(bOffPathAlert ? 'on' : 'off');
            var nState = bTracking ? 1 : 0;
            trackingCtrl.setState(nState);
            nState = bOffPathAlert ? 1 : 0;
            alertCtrl.setState(nState);    
        } else {
            ////20160828 $(selectGeoTrack).hide();
            ////20160828 $(labelGeoTrack).hide();
            ////20160828 $(selectAlert).hide();
            ////20160828 $(labelAlert).hide();
            ////20160828 $(selectGeoTrack).val('off');
            ////20160828 $(selectAlert).val('off');
            ////20160828 dropDown.hideListEl('toggle_track', true);
            ////20160828 dropDown.hideListEl('toggle_phone_alert', true)
            trackingCtrl.setState(0);
            alertCtrl.setState(0);
        }
        ////20160828 $(selectGeoTrack).prop('disabled', !bAllow);
        ////20160828 $(selectAlert).prop('disabled', !bAllow);

    }

    onlineMapDropDown.onListElClicked = function(dataValue) {
        if (dataValue === "center_trail") {
            that.ClearStatus();
            var bOk = map.PanToPathCenter();
            if (!bOk) {
                that.ShowStatus("No Geo Path currently defined to pan-to.");
            }
        } else if (dataValue === "my_geo_loc") {
            DoGeoLocation();
        } else if (dataValue === "toggle_full_screen") {

        } else if (dataValue === "toggle_track") {
            ; // No op, handled by trackingCtrl.onChanged(nState) above.
        } else if (dataValue === "toggle_phone_alert") {
            ; // No op, handled by alertCtrl.onChanged(nState) above.
        }
    };

    // Event hanndler for click on back arrow icon for online, offline, and edit bars..
    var onlineOfflineEditBackArrow = document.getElementById("onlineOfflineEditBackIcon");
    onlineOfflineEditBackArrow.addEventListener('click', function(event) { 
        that.setModeUI(that.eMode.select_mode);
    }, 
    false);

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
        ////20160813 selectMapCache.selectedIndex = 0;
    };



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

    // Set current mode for processing geo paths based on selectEditMode ctrl.
    MinimizeMap();

    // Set Facebook login.
    var fb = new wigo_ws_FaceBookAuthentication('694318660701967');
    fb.callbackAuthenticated = cbFbAuthenticationCompleted;
}




// Object for controller of the page.
function wigo_ws_Controller() {
    var that = this;
    var view = new wigo_ws_View();
    var model = new wigo_ws_Model();

    // ** Handlers for events fired by view.

    // Initialize after a mode change.
    view.onModeChanged = function (nNewMode) {
        gpxArray = null;
        gpxOfflineArray = null;
    }

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
    }

    // Save offline parameters for the selected geo path.
    view.onSavePathOffline = function (nMode, params) {
        // Save the params to storage.
        if (params.nIx >= 0 && gpxArray && params.nIx < gpxArray.length) {
            var gpx = gpxArray[params.nIx];
            params.name = gpx.sName;
            params.nId = gpx.nId;
            params.gpxPath = model.ParseGpxXml(gpx.xmlData);
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
    //  path: path data object which contains array of GeoPt elements and other members.
    //        In view obj, see this.onUpload description for this handler.
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
            var bOk = model.putGpx(gpx,
                // Async callback upon storing record at server.
                function (bOk, sStatus) {
                    if (bOk) {
                        var oStatus = JSON.parse(sStatus);
                        var eDuplicate = model.eDuplicate();
                        if (oStatus.eDup === eDuplicate.Renamed) {
                            // Show message about renaming path.
                            view.ShowStatus(oStatus.sMsg, true); // true shows message hightlighted.
                        } else if (oStatus.eDup === eDuplicate.Match) {
                            // gpx obj has same name as its record in database so there is no name change.
                            // No need to reload the list of paths.
                            view.ShowStatus("Successfully uploaded GPX path.", false);
                        } else if (oStatus.eDup === eDuplicate.NotDup) {
                            view.ShowStatus("Successfully uploaded GPX path.", false);
                        } else {
                            view.ShowStatus("Error occurred uploading GPX path.");
                        }
                    } else {
                        // Show error message.
                        view.ShowStatus(sStatus, !bOk)
                    }
                    // Fire event to initialize edit fsm reload path list.
                    var fsm = view.fsmEdit();
                    fsm.DoEditTransition(fsm.eventEdit.Init);
                });
            if (!bOk) {
                var sError = "Cannot upload GPX path to server because another transfer is already in progress."
                view.ShowStatus(sError, !bOk);
            }
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
                    var sMsg = bOk ? "Successfully deleted GPX path at server." : sStatus;
                    view.ShowStatus(sMsg, !bOk);
                    fsm.DoEditTransition(fsm.eventEdit.Init);

                });
            if (!bOk) {
                var sError = "Cannot delete GPX path at server because another transfer is already in progress."
                view.ShowStatus(sError, !bOk);
                fsm.DoEditTransition(fsm.eventEdit.Init);
            }
        } else {
            ShowStatus("Owner must be signed in to delete GPX path at server.");
            fsm.DoEditTransition(fsm.eventEdit.Init);
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
        return settings;
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
            // Show success, refine later.
            view.ShowStatus("Successfully authenticated by OAuth.", false);
            // Update database for authenticated owner.
            model.authenticate(result.accessToken, result.userID, result.userName, function (result) {
                // Save user info to localStorage.
                model.setOwnerId(result.userID);
                model.setOwnerName(result.userName);
                model.setAccessHandle(result.accessHandle);
                view.setOwnerName(result.userName);
                view.setOwnerId(result.userID);
                if (result.status === model.eAuthStatus().Ok) {
                    view.ShowStatus("User successfully logged in.", false);
                    var nMode = view.curMode();
                    if (nMode === view.eMode.online_view) {
                        // Cause geo paths to be displayed for user.
                        view.onGetPaths(view.curMode(), view.getOwnerId());
                    } else if (nMode === view.eMode.online_edit ||
                               nMode === view.eMode.online_define) {
                        // Fire SignedIn event.
                        var fsm = view.fsmEdit();
                        fsm.DoEditTransition(fsm.eventEdit.SignedIn);
                    }
                } else {
                    // var sMsg = "Authentication failed:{0}status: {1}{0}UserID: {2}{0}User Name: {3}{0}AccessHandle: {4}{0}msg: {5}".format("<br/>", result.status, result.userID, result.userName, result.accessHandle, result.msg);
                    // Note: result has info for debug.
                    var sMsg = "Server-side authentication failed.<br/>" +
                               "Please go to Facebook and Log Out<br/>" +
                               "so that your old authentication is reset.";
                    view.ShowStatus(sMsg);
                }
            });
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
                        var sError = "Error logging out: {0}".format(sMsg);
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


    // ** More private members
    var gpxArray = null; // Array of wigo_ws_Gpx object obtained from model.
    var gpxOfflineArray = null; // Array of wigo_ws_GeoPathMap.OfflineParams objects obtained from model.

    // Get list of geo paths from the model and show the list in the view.
    // Args:
    //  nMode: view.eMode for current view mode.
    //  sPathOwnerId: string for owner id for the list.
    function GetGeoPaths(nMode, sPathOwnerId) {
        // Get list of geo paths from the server.
        gpxArray = new Array(); // Clear existing gpxArray.
        var arPath = new Array(); // List of path names to show in view.

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
            // Show the list of paths in the view.
            var oParams;
            var arPathName = new Array();
            for (var i = 0; i < gpxOfflineArray.length; i++) {
                oParams = gpxOfflineArray[i];
                arPathName.push(oParams.name); 
            }
            view.setPathList(arPathName);
        }
    }

    // Find list of geo paths from the model and show the list in the view.
    // An optional rectangle for the geo area including the paths may be given. 
    // Similar to GetGeoPaths(..) above, except used to find by lat/lon rectangle as well
    // as be user id.
    // Args
    //  sOwnerId: string for path owner id.
    //  nFindIx: number this.eFindIx enumeration for kind of find to do.
    //  gptSW: wigo_ws_GeoPt for Southwest corner of rectangle. If null, do not find by lat/lon.
    //  gptNE: wigo_ws_GeoPt for NorthEast corner of rectangle. If null, do not find by lat/lon.
    //  bQuiet: boolean, optional. true indicates no interum status msg is shown on success. If there
    //          is an error, a status msg is shown regardless. However a final status message is shown.
    //          For true, the final message is appended to current messages displayed. For false, 
    //          the final message replaces previous displayed message(s).
    //          Defaults to false (show interum status msg and replaces messages displayed for final message).
    function FindGeoPaths(sPathOwnerId, nFindIx, gptSW, gptNE, bQuiet) {
        if (typeof (bQuiet) !== 'boolean')
            bQuiet = false;

        gpxArray = new Array(); // Clear existing gpxArray.
        var arPath = new Array(); // List of path names to show in view.

        // Local helper to call after getting geo list is completed.
        // Appends to path list and shows status message.
        function AppendToPathList (bOk, gpxList, sStatus) {
            if (bOk) {
                for (var i = 0; i < gpxList.length; i++) {
                    arPath.push(gpxList[i].sName);
                    gpxArray.push(gpxList[i]);
                }
            }
            if (!bOk || !bQuiet)
                view.ShowStatus(sStatus, !bOk);
        }

        // Local helper that returns a status message for ok.
        function StatusOkMsg(nCount) {
            var sMsg;
            if (nCount <= 0) {
                sMsg = "No paths found."
            } else {
                var sFound = nCount === 1 ? "Found 1 path" : "Found {0} paths".format(nCount);
                var sMsg = "{0}. Select path from droplist.".format(sFound);
            }
            return sMsg;
        }

        // Local helper to set path list in the view.
        function SetPathList(bOk) {
            // Set path list in the view.
            view.setPathList(arPath, true);
            // Show number of paths found.
            if (bOk) {
                if (!bQuiet)
                    view.ShowStatus(StatusOkMsg(arPath.length), false);
                else 
                    view.AppendStatus(StatusOkMsg(arPath.length), false); 
            }
        }

        var eShare = model.eShare();
        switch (nFindIx) {
            case view.eFindIx.home_area:
            case view.eFindIx.on_screen:
                if (gptSW && gptNE) {
                    // Get all public paths found on screen.
                    model.getGpxListByLatLon("any", eShare.public, gptSW, gptNE, function (bOk, gpxList, sStatus) {
                        AppendToPathList(bOk, gpxList, sStatus);
                        if (bOk && sPathOwnerId) {
                            // Append all private paths for path owner found on screen.
                            model.getGpxListByLatLon(sPathOwnerId, eShare.private, gptSW, gptNE, function (bOk, gpxList, sStatus) {
                                AppendToPathList(bOk, gpxList, sStatus);
                                SetPathList(bOk);
                            });
                        } else {
                            SetPathList(bOk);
                        }
                    });
                }
                break;
            case view.eFindIx.all_public:
                // Get all public paths for any path owner.
                model.getGpxList("any", eShare.public, function (bOk, gpxList, sStatus) {
                    AppendToPathList(bOk, gpxList, sStatus);
                    if (bOk && sPathOwnerId) {
                        // Append all private paths for path owner.
                        model.getGpxList(sPathOwnerId, eShare.private, function (bOk, gpxList, sStatus) {
                            AppendToPathList(bOk, gpxList, sStatus);
                            SetPathList(bOk);
                        });
                    } else {
                        SetPathList(bOk);
                    }
                });

                break;
            case view.eFindIx.all_mine:
                // Get all public paths for path owner.
                model.getGpxList(sPathOwnerId, eShare.public, function (bOk, gpxList, sStatus) {
                    AppendToPathList(bOk, gpxList, sStatus);
                    if (bOk && sPathOwnerId) {
                        // Append all private paths for path owner.
                        model.getGpxList(sPathOwnerId, eShare.private, function (bOk, gpxList, sStatus) {
                            AppendToPathList(bOk, gpxList, sStatus);
                            SetPathList(bOk);
                        });
                    } else {
                        SetPathList(bOk);
                    }
                });
                break;
            case view.eFindIx.my_public:
                // Get all public paths for path owner.
                model.getGpxList(sPathOwnerId, eShare.public, function (bOk, gpxList, sStatus) {
                    AppendToPathList(bOk, gpxList, sStatus);
                    SetPathList(bOk);
                });
                break;
            case view.eFindIx.my_private:
                // Get all private paths for path owner.
                model.getGpxList(sPathOwnerId, eShare.private, function (bOk, gpxList, sStatus) {
                    AppendToPathList(bOk, gpxList, sStatus);
                    SetPathList(bOk);
                });
                break;
        }
    }

    // ** Constructor initialization
    var sOwnerId = model.getOwnerId();
    view.setOwnerId(sOwnerId);
    view.setOwnerName(model.getOwnerName());
    // Comment out next stmt only if debugging map initialization, in case handler for buInitView does initialization.
    view.Initialize();
}

// Set global var for the controller and therefore the view and model.
window.app = {};
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
