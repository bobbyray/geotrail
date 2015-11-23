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
    // ** Events fired by the view for controller to handle.
    // Note: Controller needs to set the onHandler function.

    // OwnerId entered.
    // Signature of handler:
    //  sOwnerId: string for owner id.
    this.onOwnerId = function (sOwnerId) { };

    // Returns ref to Edit Finite State Machine editing path path.
    this.fsmEdit = function () {
        return fsmEdit;
    }

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
        function CompleteInitialization(bOk, sMsg) {
            that.ShowStatus(sMsg, !bOk)
            SetMapPanelTop();
            var settings = that.onGetSettings();
            SetSettingsParams(settings);
        }

        map.InitializeMap(function (bOk, sMsg) {
            CompleteInitialization(bOk, sMsg);
        });
    };

    // Enumeration of Authentication status (login result)
    this.eAuthStatus = function () {
        return fb.EAuthResult;
    };

    // Enumeration of mode for processing geo paths.
    // NOTE: the values must match the index of the option in selectGeoPath drop list in trail2.html.
    this.eMode = {
        online_view: 0, online_edit: 1, online_define: 2, offline: 3,
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

    // Displays a status message.
    // Arg:
    //  sStatus: string of html to display.
    //  bError: boolean, optional. Indicates an error msg. Default to true.
    this.ShowStatus = function (sStatus, bError) {
        if (typeof (bError) === 'undefined')
            bError = true;
        if (bError)
            divStatus.className = 'ErrorMsg';
        else
            divStatus.className = 'NormalMsg';
        divStatus.style.display = "block";
        divStatus.innerHTML = sStatus;
        SetMapPanelTop();
    };

    // Appends a status message to current status message and
    // shows the full message.
    // Arg:
    //  sStatus: string of html to display.
    //  bError: boolean, optional. Indicates an error msg. Default to true.
    this.AppendStatus = function (sStatus, bError) {
        var sMsg = divStatus.innerHTML;
        if (sMsg.length > 0)
            sMsg += "<br/>";
        sMsg += sStatus;
        this.ShowStatus(sMsg, bError);
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
        divStatus.innerHTML = "";
        divStatus.style.display = 'none';
        SetMapPanelTop();
    };

    // Set the user interface for a new mode.
    // Arg:
    //  newMode: eMode enumeration value for the new mode.
    this.setModeUI = function (newMode) {
        nMode = newMode;
        // Show SignIn control, which may have been hidden by Edit or Define mode.
        ShowSignInCtrl(true); 
        switch (nMode) {
            case this.eMode.online_view:
                ShowPathInfoDiv(true); 
                ShowMapCacheSelect(false);
                ShowSaveOfflineButton(true);
                ShowMenu(true); 
                // Hide ctrls for editing path.
                HidePathEditCtrls();
                ShowMapPanelForMode(nMode);
                SetMapPanelTop(); 
                map.GoOffline(false);
                // Clear path on map in case one exists because user needs to select a path
                // from the new list of paths.
                map.ClearPath();
                this.onGetPaths(nMode, that.getOwnerId()); 
                break;
            case this.eMode.offline:
                ShowPathInfoDiv(true); 
                ShowMapCacheSelect(true);
                ShowSaveOfflineButton(false);
                ShowMenu(true); 
                // Hide ctrls for editing path.
                HidePathEditCtrls();
                ShowMapPanelForMode(nMode);
                SetMapPanelTop(); 
                map.GoOffline(true);
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
        }
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

        InitPathList("Select a Geo Path");
        // Add the list of geo paths.
        var name, iStr;
        for (var i = 0; i < arSelect.length; i++) {
            name = arSelect[i].s;
            iStr = arSelect[i].i.toString();
            var option = new Option(name, iStr);
            selectGeoPath.add(option);
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
        var sName = "";
        var nCount = selectGeoPath.options.length;
        var i = selectGeoPath.selectedIndex;
        // Note: ignore option 0, which is prompt to select a path.
        if (nCount > 0 && i > 0 && i < nCount) {
            sName = selectGeoPath.options[i].innerText;
        }
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
    var divStatus = $('#divStatus')[0];
    var divOwnerId = $('#divOwnerId')[0];
    var txbxOwnerId = $('#txbxOwnerId')[0];
    var selectSignIn = $('#selectSignIn')[0];

    var divMode = $('#divMode')[0];
    var selectMode = $('#selectMode')[0];
    var buSaveOffline = $('#buSaveOffline')[0];
    var selectMapCache = $('#selectMapCache')[0];
    var selectMenu = $('#selectMenu')[0];

    var divSettings = $('#divSettings')[0];
    var selectAllowGeoTracking = $('#selectAllowGeoTracking')[0];
    var numberGeoTrackingSecs = $('#numberGeoTrackingSecs')[0];
    var numberOffPathThresMeters = $('#numberOffPathThresMeters')[0];
    var selectOffPathAlert = $('#selectOffPathAlert')[0];
    var selectPhoneAlert = $('#selectPhoneAlert')[0];
    var selectPebbleAlert = $('#selectPebbleAlert')[0];
    var selectClickForGeoLoc = $('#selectClickForGeoLoc')[0];
    var numberPrevGeoLocThresMeters = $('#numberPrevGeoLocThresMeters')[0];
    var buSettingsDone = $('#buSettingsDone')[0];
    var buSettingsCancel = $('#buSettingsCancel')[0];

    var divPathInfo = $('#divPathInfo')[0];
    var selectGeoPath = $('#selectGeoPath')[0];

    var divPathDescr = $('#divPathDescr')[0];
    var divCursors = $('#divCursors')[0];
    var selectPtAction = $('#selectPtAction')[0];
    var buPtDo = $('#buPtDo')[0];
    var buCursorLeft = $('#buCursorLeft')[0];
    var buCursorRight = $('#buCursorRight')[0];
    var buCursorUp = $('#buCursorUp')[0];
    var buCursorDown = $('#buCursorDown')[0];

    var divPathIx = $('#divPathIx')[0];
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

    var panel = $('#panel')[0];
    var buGeoLocate = $('#buGeoLocate')[0];
    var selectGeoTrack = $('#selectGeoTrack')[0];
    var labelGeoTrack = $('#labelGeoTrack')[0];
    var selectAlert = $('#selectAlert')[0];
    var labelAlert = $('#labelAlert')[0];
    var buGoToPath = $('#buGoToPath')[0];
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

    $(buSaveOffline).bind('click', function (e) {
        that.ClearStatus();

        if (selectGeoPath.selectedIndex === 0) {
            that.ShowStatus("Select a Geo Path first before saving.")
        } else if (nMode === that.eMode.online_view) {
            var oMap = map.getMap();
            var params = new wigo_ws_GeoPathMap.OfflineParams();
            params.nIx = parseInt(selectGeoPath.value);
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

    $(selectMenu).bind('change', function (e) {
        if (this.value === 'settings') {
            var settings = that.onGetSettings();
            SetSettingsValues(settings);
            EnableSettingControlOptions(settings.bAllowGeoTracking);
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
        }
        that.ClearStatus();
    });

    $(selectAllowGeoTracking).bind('change', function(e) {
        var bTrack = this.value ===  'yes';
        EnableSettingControlOptions(bTrack);
    });

    $(buSettingsDone).bind('click', function (e) {
        ShowSettingsDiv(false);
        that.ClearStatus();
        var settings = GetSettingsValues();
        SetSettingsParams(settings);
        selectMenu[0].selected = true;
        that.onSaveSettings(settings);
    });
    $(buSettingsCancel).bind('click', function (e) {
        ShowSettingsDiv(false);
        that.ClearStatus();
        selectMenu[0].selected = true;
    });


    $(buGeoLocate).bind('click', function (e) {
        DoGeoLocation();
    });

    $(selectGeoTrack).bind('change', function (e) {
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
        // by user even a path change has occurred without uploading the change. 
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

            // Returns index to current path in the path.
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
            ShowSignInCtrl(true);  ////20151120 added
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
                        view.AppendStatus("Select a path to edit.", false);
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
                    // Show path on map.
                    view.ShowPathInfo(false, that.gpxPath); 
                    // Disable selectGeoPath droplist (by hiding) selection of different path.
                    ShowPathInfoDiv(false);
                    // Set options and show message for appending.
                    PrepareForEditing();
                    // Show Delete button only for not new.
                    ShowDeleteButton(!bNew);
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
                    map.DrawTouchPt(curTouchPt.getGpt());
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
        function stUploadPending(event) { 
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
                    map.DrawTouchPt(curTouchPt.getGpt());
                    // Stay in same state. (Touch point has been saved in map click handler.)
                    break;
                case that.eventEdit.Cursor:
                    // Draw the change in the touch point.
                    map.DrawTouchPt(curTouchPt.getGpt());
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
                    ShowPathCursors(false);
                    ShowPathIxButtons(false);
                    // Hide Upload button, which is shown when selecting a point on path.
                    ShowUploadButton(false);
                    // Set PtAction options to Move and Select only with Move selected.
                    opts.Init(false);
                    opts.Move = true;
                    opts.Select = true;
                    opts.SetOptions();
                    opts.SelectOption(EPtAction.Moving);
                    view.ShowStatus("Touch where to move selected point.", false);
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
                    map.DrawTouchPt(curTouchPt.getGpt());
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
                    // Draw the change in the touch point.
                    map.DrawTouchPt(curTouchPt.getGpt());
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
                    map.DrawTouchPt(curTouchPt.getGpt());
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
                    // Draw the change in the touch point.
                    map.DrawTouchPt(curTouchPt.getGpt());
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
            var sMsg = bPathEmpty ? "Touch to Append point to end of path" :
                                     "Touch to Append point to end of path or choose Select Pt."
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
            }
            return bOk;
        }

    }


    // ** More private members
    var fsmEdit = new EditFSM(this);

    var nMode = that.eMode.online_view; // Current mode.

    var dCloseToPathThreshold = 30; // Off-path locations < dCloseToPathThresdhold considered to be on-Path.

    // Get current geo location, show on the map, and update status in phone and Pebble.
    function DoGeoLocation() {
        that.ShowStatus("Getting Geo Location ...", false);
        TrackGeoLocation(trackTimer.dCloseToPathThres, function (updateResult) {
            ShowGeoLocUpdateStatus(updateResult);
        });
    }

    // Returns About message for this app.
    function AboutMsg() {
        var sVersion = "1.1.013  11/22/2015";
        var sCopyright = "2015";
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
cordova-plugin-dialogs\n\n\
com.jetboystudio.pebble.PebblePGPlugin\n\n\
cordova-plugin-file 2.0.0 "File"\n\n\
cordova-plugin-file-transfer 1.1.0 "File Transfer"\n\n\
cordova-plugin-geolocation 1.0.0 "Geolocation"\n\n\
cordova-plugin-vibration 1.2.1-dev "Vibration"\n\n\
cordova-plugin-whitelist 1.0.0 "Whitelist"\n\n\
org.nypr.cordova.wakeupplugin 0.1.0 "WakeupTimer"\n\n\
https://github.com/Wizcorp/phonegap-facebook-plugin/blob/master/LICENSE \n\n\
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
More details about these options are given below.\n\n\
View Mode\n\
View lets you \
access Geo-paths from the web that others have made public and ones \
that are private to you. \
Select a path from the drop list to view.\n\n\
Save Offline\n\
Touch the Save Offline button to save a path you are viewing so that you can \
view it when you are offline.\n\n\
Offline Mode\n\
Offline lets you select paths you have saved offline. Select a Geo Path from the \
list you have saved.\n\n\
Map Cache shows information about the cache of map tiles.\n\
Select Size to see the number of files and the size in MB of all the files.\n\
Select Clear to empty the cache of map files. Once the cache is cleared, \
all the offline paths are deleted from the phone.\n\n\
Using Controls at Top of Map\n\
Ctr Trail brings the map to the center of the selected path.\n\n\
MyLoc displays your current location on the map.\n\n\
Full Screen / Reduce Screen switches between the map filling the screen and \
the map being below the selection controls.\n\n\
Track switches between geo-location tracking On or Off.\n\n\
Ph Alert, which is given if you are off the trail, switches between Ph Alert On or Off.\n\n\
Menu Provides More Options\n\
Menu > Settings presents a dialog to set preferences for geo-location tracking and alerts:\n\n\
Allow Geo Tracking Yes | No: For No, geo-location is NOT obtained automatically, \
and Track and Ph Alert are ignored. \
However, the MyLoc button will still get your geo-location.\n\n\
Geo Tracking Interval (secs): number of seconds to check your geo-location when tracking is allowed.\n\n\
Off-path Threshold (m): number of meters that you need to be off-path for an alert to be given.\n\n\
Initially Enable Geo Tracking Yes | No: Yes to start with Track On when app loads.\n\n\
Initially warn when Off-Path Yes | No: Yes to start with Phone Alert On when app loads.\n\n\
Phone Alert Yes | No: detemines if alerts (beeps) from you phone are given. \n\n\
Phone vibration in secs: number of seconds phone vibrates for an alert. Set to 0 for no vibration.\n\n\
Phone beep count: number of beeps to give for an alert. Set to 0 for no beepings.\n\n\
Pebble Watch Yes | No: Yes to show messages on a Pebble Watch that is connected to the phone.\n\n\
Pebble Vibration Count: number of vibrations given on Pebble Watch for message indicating \
off trail. Count of 0 disables vibrations. \
Note that Ph Alert Off does not inhibit vibrations for being off-trail.\n\n\
Prev Geo Loc Thres (m): number of meters of current geo-location with respect to previous location \
for change in location to be considered valid. (This prevents small variations in the geo-location of \
the same point to appear to be a change in location.)\n\n\
Menu > Start Pebble\n\
Starts the Pebble app on the watch. The Pebble app should be started automatically so this is unlikely \
to be needed.\n\n\
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
move, insert, or delete the selected (highlighted) pointed.\n\n\
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
    // Returns synchronous: false. Only onDone callback is meaningful.
    function ConfirmYesNo(sMsg, onDone) {
        if (navigator.notification) {
            navigator.notification.confirm(sMsg, function (iButton) {
                if (onDone) {
                    var bYes = iButton === 1;
                    onDone(bYes);
                }
            },
            "Confirm", "Yes,No");
        } else {
            var bConfirm = window.confirm(sMsg);
            if (onDone)
                onDone(bConfirm);
        }
        return false;
    }


    // Removes all elements after the first element (index 0) from selectGeoPathSelect control,
    // provide the current mode is offline. Also clears the path drawn on the map.
    function ClearOfflineGeoPathSelect(select) {
        if (that.curMode() === that.eMode.offline) {
            var nCount = selectGeoPath.length;
            for (var i = 1; i < nCount; i++) {
                selectGeoPath.remove(1);
            }
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
        settings.bClickForGeoLoc = selectClickForGeoLoc.value === 'yes';
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
        selectClickForGeoLoc.value = settings.bClickForGeoLoc ? 'yes' : 'no';
    }

    // Enables/disables controls for setting options.
    // Arg:
    //  bEnable: boolean. true to enable, false to disable the controls.
    function EnableSettingControlOptions(bEnable) {
        $('.GeoTrackingOption').prop('disabled', !bEnable); 
    };

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
        var sShowMap = bShow ? 'none' : '';
       
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
    //      Arg: {bToPath: boolean, dToPath: float, bearingToPath: float, bRefLine: boolean, bearingRefLine: float}:
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
            var updResult = map.SetGeoLocationUpdate(location, dCloseToPath); 
            if (callbackUpd)
                callbackUpd(updResult);
        },
        function (positionError) {
            // Error occurred trying to get location.
            var sMsg = "Geolocation Failed! Check your browser options to enable Geolocation.\n" + positionError.message;
            that.ShowStatus(sMsg);
        },
        geoLocationOptions);
    }

    // Initialize selectGeoPath droplist to empty list of path.
    // Arg:
    //  sHeader: string for item 0 in the droplist, which is a header desribing the list.
    function InitPathList(sHeader) {
        // Remove any existing elements from selectGeoPath.
        var nCount = selectGeoPath.length;
        for (var i = 0; i < nCount; i++) {
            selectGeoPath.remove(0);
        }
        // Add header element.
        var option = new Option(sHeader, "-1");
        selectGeoPath.add(option);

    }

    // Shows or hides divOwnerId.
    // Arg:
    //  bShow: boolean indicating to show.
    function ShowOwnerIdDiv(bShow) {
        if (bShow)
            divOwnerId.style.display = 'block';
        else
            divOwnerId.style.display = 'none';
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
        if (bShow)
            selectMapCache.style.display = 'block';
        else
            selectMapCache.style.display = 'none';
    }

    // Shows or hides buSaveOffline button.
    // Arg:
    //  bShow: boolean indicating to show.
    function ShowSaveOfflineButton(bShow) {
        if (bShow)
            buSaveOffline.style.display = 'block';
        else
            buSaveOffline.style.display = 'none';
    }

    // Shows or hides divPathInfo, which has textbox for Path Name.
    // Arg:
    //  bShow: boolean indicating to show.
    function ShowPathInfoDiv(bShow) {
        if (bShow)
            divPathInfo.style.display = 'block';
        else
            divPathInfo.style.display = 'none';
    }

    function ShowElement(el, bShow) {
        var sShow = bShow ? 'block' : 'none';
        el.style.display = sShow;
    }

    // Shows or hides the selectMenu droplist.
    function ShowMenu(bShow) {
        ShowElement(selectMenu, bShow);
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
    //  upd is {bToPath: boolean, dToPath: float, bearingToPath: float, bRefLine: float, bearingRefLine: float}:
    //    bToPath indicates path from geo location off path to nearest location on the path is valid.
    //      For bToPath false, dToPath and bearingToPath are invalid.
    //      Distance from location off-path to on-path must be > arg dOffPath for 
    //      bToPath to be true.
    //    dToPath: distance in meters from off-path location to on-path location.
    //    bearingToPath is bearing (y-North cw) in degrees (0.0 to 360.0) for location to 
    //      nearest point on the path.
    //    bRefLine indicates bearingRefLine is valid.
    //    bearingRefLine is bearing (y-North cw) in degrees (0.0 to 360.0) for reference 
    //      line from previous off-path location to current off-path location.
    //    loc: L.LatLng object for location.
    //    dFromStart: distance in meters from start to nearest point on the path.
    //    dToEnd: distance in meters from nearest point on the path to the end.
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

        if (!upd.bToPath) {
            that.ClearStatus();
            if (map.IsPathDefined()) {
                var sMsg = "On Path<br/>";
                sMsg += PathDistancesMsg(upd);
                that.ShowStatus(sMsg, false); // false => not an error.
                sMsg = "On Path<br/>";
                sMsg += PathDistancesPebbleMsg(upd);
                pebbleMsg.Send(sMsg, false, trackTimer.bOn) // no vibration, timeout if tracking.
            } else {
                // Show lat lng for the current location since there is no trail.
                var sAt = "lat/lng({0},{1})".format(upd.loc.lat.toFixed(8), upd.loc.lng.toFixed(8));
                that.ShowStatus(sAt, false); // false => no error.
                sAt = "lat/lng\n{0}\n{1}".format(upd.loc.lat.toFixed(8), upd.loc.lng.toFixed(8));
                pebbleMsg.Send(sAt, false, false); // no vibration, no timeout.
            }
        } else {
            // vars for off-path messages.
            var sBearingToPath = upd.bearingToPath.toFixed(0);
            var sDtoPath = upd.dToPath.toFixed(0);
            var sCompassDir = map.BearingWordTo(upd.bearingToPath);
            var phi = upd.bearingToPath - upd.bearingRefLine;
            var sTurn = 'right';
            // Show distance and heading from off-path to on-path location.
            var s = "Head {0} ({1}&deg; wrt N) to go to path ({2}m).<br/>".format(sCompassDir, sBearingToPath, sDtoPath);
            var sMsg = s;
            if (upd.bRefLine) {
                // Calculate angle to turn to return to path.
                if (phi < 0)
                    phi += 360.0;
                if (phi > 180.0) {
                    sTurn = 'left';
                    phi = 360.0 - phi;
                }
                s = "Suggest turning {0}&deg; to {1} to go to path.<br/>".format(phi.toFixed(0), sTurn);
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
            sMsg += "Head {0}\n".format(sCompassDir);
            sMsg += "? {0} {1}{2}\n".format(sTurn, phi.toFixed(0), sDegree);
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
            var updateResult = map.SetGeoLocationUpdate(llAt, dCloseToPathThreshold);
            ShowGeoLocUpdateStatus(updateResult);
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
    this.setModeUI(this.eMode.toNum(selectMode.value));
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

        // Local helper function to get all geo paths for owner.
        // On error shows status in view.
        // Args
        //  onDone: asynchronous callback when done, Signature:
        //      bOk: boolean indicating success.
        function GetAllGeoPathsForOwner(onDone) {
            // Get all geo paths for the owner.
            var nShare = model.eShare().any;
            model.getGpxList(sPathOwnerId, nShare, function (bOk, gpxList, sStatus) {
                if (bOk) {
                    for (var i = 0; i < gpxList.length; i++) {
                        arPath.push(gpxList[i].sName);
                        gpxArray.push(gpxList[i]);
                    }
                } else {
                    view.ShowStatus(sStatus);
                }
                if (onDone)
                    onDone(bOk);
            });
        }

        // Local helper function to get public geo paths.
        // On error shows status in view.
        // Args:
        //  bExcludeOwner: boolean to exclude owner paths from the list.
        //  onDone: asynchronous callback when done, Signature:
        //      bOk: boolean indicating success.
        function GetPublicGeoPaths(bExcludeOwner, onDone) {
            // Also include all public paths.
            var nShare = model.eShare().public;
            model.getGpxList("any", nShare, function (bOk, gpxList, sStatus) {
                if (bOk) {
                    for (var i = 0; i < gpxList.length; i++) {
                        if (bExcludeOwner) {
                            if (gpxList[i].sOwnerId === sPathOwnerId)
                                continue; // Item with same owner id as sOwnerId is already in list.
                        }
                        gpxArray.push(gpxList[i]); // Add to array of Gpx objects that correspond to list of path names to be set in the view. 
                        arPath.push(gpxList[i].sName);
                    }
                } else {
                    view.ShowStatus(sStatus);
                }
                if (onDone)
                    onDone(bOk);
            });
        }

        if (nMode === view.eMode.online_view) {

            if (!sPathOwnerId) {
                // Owner is not signed in. Get all public geo paths.
                // false => do not exclude owner paths.
                GetPublicGeoPaths(false, function (bOk, sStatus) {
                    // Show path list obtained even if there is an error. (Likely empty on error).
                    view.setPathList(arPath);
                });

            } else {
                // Owner is signed in. Get all geo paths for owner
                // plus all public geo paths.
                GetAllGeoPathsForOwner(function (bOk, sStatus) {
                    if (bOk) {
                        // Get public geo paths excluding owner (true => exclude owner).
                        GetPublicGeoPaths(true, function (bOk, status) {
                            // Show path list obtained even if error has occured.
                            view.setPathList(arPath);
                        });
                    } else {
                        // Show paths obtained before error, likely empty list.
                        view.setPathList(arPath);
                    }
                });
            }
        } else if (nMode === view.eMode.online_edit) {
            // Get all paths for owner.
            GetAllGeoPathsForOwner(function (bOk, sStatus) {
                if (bOk) {
                    // Show path list obtained even if error has occured.
                    view.setPathList(arPath);
                } else {
                    // Show paths obtained before error, likely empty list.
                    view.setPathList(arPath);
                }
            });
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


    // ** Constructor initialization
    var sOwnerId = model.getOwnerId();
    view.setOwnerId(sOwnerId);
    view.setOwnerName(model.getOwnerName());
    GetGeoPaths(view.curMode(), sOwnerId);
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
