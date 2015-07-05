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

// Object for settings for My Geo Trail.
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
    // Boolean to indicate a Pebble watch alert (vibration) is given when off-paht.
    this.bPebbleAlert = true;
    // Float for number of seconds for Pebble watch to vibrate on an alert.
    this.secsPebbleVibe = 1.0;
    // Float for distance in meters for threshold for minimum change in distance
    // for previous geo-location to be updated wrt to current geo-location.
    this.dPrevGeoLocThres = 10.0;
    // Boolean to indicate a mouse click (touch) simulates getting the geo-location
    // at the click point. For debug only.
    this.bClickForGeoLoc = false;
}

// Object for View present by page.
function wigo_ws_View() {
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

    // Save the settings paramaters.
    // Handler Signature:
    //  settings: wigo_ws_GeoTrailSettings object for the settings to save.
    this.onSaveSettings = function (settings) { };

    // Get the current settings parameters.
    // Handler Signature:
    //  Args: none
    //  Returns: wigo_ws_GeoTrailSettings object for current setting. May be null.
    this.onGetSettings = function () { null; };

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


    // Enumeration of mode for processing geo paths.
    this.eMode = {
        online: 0, offline: 1,
        toNum: function (sMode) { // Returns byte value for sMode property name.
            var nMode = this[sMode];
            if (nMode === undefined)
                nMode = this.online;
            return nMode;
        },
        toStr: function (nMode) { // Returns string for property name of nMode byte value.
            var sMode;
            switch (nMode) {
                case this.online: sMode = 'online'; break;
                case this.offline: sMode = 'offline'; break;
                default: sMode = 'online';
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
        return txbxOwnerId.value;
    };

    // Sets OwnerId of signed-in user to string given by sOwnerId.
    this.setOwnerId = function (sOwnerId) {
        txbxOwnerId.value = sOwnerId;
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
        switch (nMode) {
            case this.eMode.online:
                break;
            case this.eMode.offline:
                break;
        }
    };

    // Fill the list of paths that user can select.
    // Arg:
    //  arPath is an array of strings for geo path names.
    this.setPathList = function (arPath) {
        InitPathList("Select a Geo Path");
        // Add the list of geo paths.
        var name, iStr;
        for (var i = 0; i < arPath.length; i++) {
            name = arPath[i];
            iStr = i.toString();
            var option = new Option(name, iStr);
            selectGeoPath.add(option);
        }
    };

    // Clears the list of paths that the user can select.
    this.clearPathList = function () {
        // Call setPathList(..) with an empty list.
        this.setPathList([]);
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
    var buSetOwnerId = $('#buSetOwnerId')[0];

    var divMode = $('#divMode')[0];
    var selectMode = $('#selectMode')[0];
    var buSaveOffline = $('#buSaveOffline')[0];
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
    var numberPebbleVibeSecs = $('#numberPebbleVibeSecs')[0];

    // Returns ref to div for the map-canvas element.
    // Note: The div element seems to change dynamically. 
    //       Therefore setting a var for $('#map-canvas')[0] does not work.
    function getMapCanvas() {
        var mapCanvas = document.getElementById('map-canvas');
        return mapCanvas;
    }

    // ** Use jquery to attach event handler for controls.
    // Note: All the control event handlers clear status first thing.

    $(buSetOwnerId).bind('click', function (e) {
        that.ClearStatus();
        var sOwnerId = txbxOwnerId.value;
        that.onOwnerId(sOwnerId);
        // Initial to upload mode, same as when page is loaded.
        var newMode = that.eMode.online;
        selectMode.value = that.eMode.toStr(newMode);
        that.setModeUI(newMode);
        // Inform controller of the mode change.
        that.onModeChanged(newMode);
        // For online mode, request loading the geo paths drop list for current user
        ShowSaveOfflineButton(true);
        that.onGetPaths(nMode, that.getOwnerId());
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
                if (trackTimer.bOn) {
                    if (map.IsPathDefined()) {
                        // Tracking timer is on so show current geo location right away.
                        that.ShowStatus("Getting Geo Location ...", false);
                        TrackGeoLocation(trackTimer.dCloseToPathThres, function (updateResult) {
                            ShowGeoLocUpdateStatus(updateResult);
                        });
                    }
                } else {
                    that.ShowStatus("Geo tracking off.", false); // false => not an error.
                }
            }
        }
    });

    $(buSaveOffline).bind('click', function (e) {
        that.ClearStatus();

        if (selectGeoPath.selectedIndex === 0) {
            that.ShowStatus("Select a Geo Path first before saving.")
        } else if (nMode === that.eMode.online) {
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
        that.ClearStatus();
        // Set current mode to the new mode.
        nMode = that.eMode.toNum(this.value);
        // Inform controller of the mode change.
        that.onModeChanged(nMode);
        var bOffline = nMode === that.eMode.offline;
        var result = map.GoOffline(bOffline);
        result.bOk = true; //???? Helps for debug. May be ok to always avoid showing status msg.
        if (!result.bOk)  {
            that.ShowStatus(result.sMsg);
        } else {
            if (nMode === that.eMode.offline) {
                ShowSaveOfflineButton(false);
                map.GoOffline(true);
                // Clear path on map in case one exists because user needs to select a path
                // from the new list of paths.
                map.ClearPath();
                // For offline mode, request loading the geo paths drop list for current user
                that.onGetPaths(nMode, that.getOwnerId());
            } else if (nMode === that.eMode.online) {
                ShowSaveOfflineButton(true);
                map.GoOffline(false);
                // Clear path on map in case one exists because user needs to select a path
                // from the new list of paths.
                map.ClearPath();
                // For online mode, request loading the geo paths drop list for current user
                that.onGetPaths(nMode, that.getOwnerId());
            }
        }
    });

    $(selectMenu).bind('change', function (e) {
        if (this.value === 'settings') {
            var settings = that.onGetSettings();
            SetSettingsValues(settings);
            EnableSettingControlOptions(settings.bAllowGeoTracking);
            ShowSettingsDiv(true);
            SetMapPanelTop();
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
        that.ShowStatus("Getting Geo Location ...", false);
        TrackGeoLocation(trackTimer.dCloseToPathThres, function (updateResult) {
            ShowGeoLocUpdateStatus(updateResult);
        });

    });

    $(selectGeoTrack).bind('change', function (e) {
        // Save state of flag to track geo location.
        trackTimer.bOn = IsGeoTrackValueOn();    // Allow/disallow geo-tracking.
        // Start or clear trackTimer.
        RunTrackTimer();
    });

    $(selectAlert).bind('change', function () {
        // Allow/disallow alerts.
        alerter.bAlertsAllowed = selectAlert.value === 'on';
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


    // ** More private members
    var nMode = that.eMode.online; // Current mode.

    var dCloseToPathThreshold = 30; // Off-path locations < dCloseToPathThresdhold considered to be on-Path.

    // Returns About message for this app.
    function AboutMsg() {
        var sVersion = "1.0.001  07/02/2015";
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
and are listed below. Refer to them individually to determine their kind of license.\n\
   jquery 1-11.3\n\
   Leaflet 0.7.3 for maps\n\
   L.TileLayer.Cordova for caching map tiles\n\
   cordova-plugin-dialogs 1.1.2-dev "Notification"\n\
   cordova-plugin-file 2.0.0 "File"\n\
   cordova-plugin-file-transfer 1.1.0 "File Transfer"\n\
   cordova-plugin-geolocation 1.0.0 "Geolocation"\n\
   cordova-plugin-vibration 1.2.1-dev "Vibration"\n\
   cordova-plugin-whitelist 1.0.0 "Whitelist"\n\
   org.nypr.cordova.wakeupplugin 0.1.0 "WakeupTimer"\n\
';
        return sMsg;
    }

    function HelpMsg() {
        var sMsg = '\
Enter a Sign-in id and press Set. Your sign-in id is remembered so \
that you only need to set it once.\n\n\
Online/Offline switches between accessing trails from the Internet of from locally saved maps.\n\n\
Select Online\n\
Online allows you to select Geo-paths that others have shared or ones \
that are private to you.\
Touch the Save Offline button to save a path you are viewing so that you can \
view it when you are offline.\n\n\
Select Offline to use the paths you have saved offline. Select a Geo Path from the \
list you have saved.\n\n\
Using Controls at Top of Map\n\
Ctr Trail brings the map to the center of the selected path.\n\n\
MyLoc displays your current location on the map.\n\n\
Full Screen / Reduce Screen switches between the map filling the screen and \
the map being below the selection controls.\n\n\
Track switches between geo-location tracking On or Off.\n\n\
Alert, which is given if you are off the trail, switches between Alert On or Off.\n\n\
Menu Provides More Options\n\
Menu > Settings presents a dialog to set preferences for geo-location tracking and alerts:\n\
Allow Geo Tracking Yes | No: For No, geo-location is NOT obtained automatically, \
and Track and Alert are ignored. \
However, the MyLoc button will still get your geo-location.\n\n\
Geo Tracking Interval (secs): number of seconds to check your geo-location when tracking is allowed.\n\n\
Off-path Threshold (m): number of meters that you need to be off-path for an alert to be given.\n\n\
Initially Enable Geo Tracking Yes | No: Yes to start with Track On when app loads.\n\n\
Initially warn when Off-Path Yes | No: Yes to start with Alert On when app loads.\n\n\
Phone Alert Yes | No: detemines if alerts from you phone are given. The alerts can be \
a vibration or a beep.\n\n\
Phone beep count: number of beeps to give for an alert. Set to 0 for no beepings.\n\n\
Phone vibration in secs: number of seconds phone vibrates for an alert. Set to 0 for no vibration.\n\n\
Prev Geo Loc Thres (m): number of meters of current geo-location with respect to previous location \
for change in location to be considered valid. (This prevents small variations in the geo-location of \
the same point to appear to be a change in location.)\n\n\
Creating Trail Maps\n\
Use the site http://www.hillmap.com to create a trail map. Use the Path tab to define your trail.\n\
Use Tools > Download Gpx to save your path.\n\
Be sure to export the path as Track, \
NOT Route, which is the default.\n\n\
Use the site http://wigo.ws/geopaths/gpxpaths.html to upload and save the path that you have \
downloaded from hillmap.com so that you can access the path (aka trail) online from this app.\
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

    // Runs the trackTimer object.
    // If trackTimer.bOn is true, clears trackTimer; otherwise starts the periodic timer.
    // Remarks: Provides the callback function that is called after each timer period completes.
    function RunTrackTimer() {
        if (trackTimer.bOn) {
            var bInProgress = false;
            trackTimer.SetTimer(function (result) {
                if (result.bError) {
                    trackTimer.ClearTimer();
                    var sError = 'Timer for automatic geo-tracking failed.<br/>';
                    ShowGeoTrackingOff(sError);
                    navigator.notification.beep(4);
                } else {
                    if (bInProgress)
                        return;
                    bInProgress = true;
                    if (result.bRepeating) {
                        if (map.IsPathDefined()) {
                            that.ShowStatus("Getting Geo Location ...", false);
                            TrackGeoLocation(trackTimer.dCloseToPathThres, function (updateResult) {
                                ShowGeoLocUpdateStatus(updateResult);
                            });
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
        settings.secsPebbleVibe = parseFloat(numberPebbleVibeSecs.value);
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
        numberPebbleVibeSecs.value = settings.secsPebbleVibe.toFixed(1);
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
            $(selectAlert).show();
            $(labelAlert).show();
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
        // Enable alerts.
        alerter.bAlertsAllowed = settings.bAllowGeoTracking;
        if (settings.bAllowGeoTracking) {
            alerter.bPhoneEnabled = settings.bPhoneAlert;
            alerter.bPebbleEnabled = settings.bPebbleAlert;
        } else {
            alerter.bPhoneEnabled = false;
            alerter.bPebbleEnabled = false;
        }
        alerter.msPhoneVibe = Math.round(settings.secsPhoneVibe * 1000);
        alerter.countPhoneBeep = settings.countPhoneBeep;
        alerter.msPebbleVibe = Math.round(settings.secsPebbleVibe * 1000);

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
                    window.wakeuptimer.snooze(SnoozeWakeUpSuccess,
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

    // Shows or hides buSaveOffline button.
    // Arg:
    //  bShow: boolean indicating to show.
    function ShowSaveOfflineButton(bShow) {
        if (bShow)
            buSaveOffline.style.display = 'block';
        else
            buSaveOffline.style.display = 'none';
    }

    // Shows or hides divPathInfo.
    // Arg:
    //  bShow: boolean indicating to show.
    function ShowPathInfoDiv(bShow) {
        if (bShow)
            divPathInfo.style.display = 'block';
        else
            divPathInfo.style.display = 'none';
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

    // Object for issuing alerts: phone and pebble watch alerts.
    function Alerter() {

        // Boolean to indicate alerts for any device are allowed.
        this.bAlertsAllowed = false;

        // Boolean to indicate a phone alert can be given. 
        this.bPhoneEnabled = false;

        // Float for number of milli-seconds for phone to vibrate on an alert.
        this.msPhoneVibe = 1000;

        // Integer for number of phone beeps.
        this.countPhoneBeep = 0;

        // Boolean to indicate a Pebble watch alert can be given. 
        this.bPebbleEnabled = false;

        // Float for number of milli-seconds for phone to vibrate on an alert.
        this.msPebbleVibe = 1000;

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
                if (this.bPebbleEnabled) {
                    // Issue Pebble watch alert.
                }
            }
        }

        // ** Private members

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
    function ShowGeoLocUpdateStatus(upd) {
        if (!upd.bToPath) {
            that.ClearStatus();
        } else {
            // Show distance and heading from off-path to on-path location.
            var sCompassDir = map.BearingWordTo(upd.bearingToPath);
            var s = "Head {0} ({1} degs wrt N) to go to path ({2}m).<br/>".format(sCompassDir, upd.bearingToPath.toFixed(0), upd.dToPath.toFixed(0));
            var sMsg = s;
            if (upd.bRefLine) {
                // Calculate angle to turn to return to path.
                var phi = upd.bearingToPath - upd.bearingRefLine;
                var sTurn = 'right';
                if (phi < 0)
                    phi += 360.0;
                if (phi > 180.0) {
                    sTurn = 'left';
                    phi = 360.0 - phi;
                }
                s = "Suggest turning {0} degs to {1} to go to path.<br/>".format(phi.toFixed(0), sTurn);
                sMsg += s;
            }
            that.ShowStatus(sMsg, false);
            // Issue alert to indicated off-path.
            alerter.DoAlert();
        }
    }

    // ** Private members for Open Source map
    var map = new wigo_ws_GeoPathMap(false); // false => do not show map ctrls (zoom, map-type).
    map.onMapClick = function (llAt) {
        var updateResult = map.SetGeoLocationUpdate(llAt, dCloseToPathThreshold);
        ShowGeoLocUpdateStatus(updateResult);
    };

    // Sets panel of controls for map at top of the map.
    function SetMapPanelTop() {
        var top = getMapCanvas().offsetTop;
        panel.style.top = top + 'px';
    }

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

    // ** Constructor initialization.
    var alerter = new Alerter(); // Object for issusing alert to phone or Pebble watch.

    // Set current mode for processing geo paths based on selectEditMode ctrl.
    this.setModeUI(this.eMode.toNum(selectMode.value));
    MinimizeMap();
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
        if (nMode === view.eMode.online) {
            if (gpxArray && iPathList >= 0 && iPathList < gpxArray.length) {
                var gpx = gpxArray[iPathList];
                // Show the geo path info.
                var path = model.ParseGpxXml(gpx.xmlData); // Parse the xml to get path data.
                view.ShowPathInfo(true, path); // true => show path info instead of hide.
            }
        } else if (nMode === view.eMode.offline) {
            // Show the geo path info for an offline map. 
            if (gpxOfflineArray && iPathList >= 0 && iPathList < gpxOfflineArray.length) {
                var oParams = gpxOfflineArray[iPathList];
                view.ShowOfflinePathInfo(true, oParams);
            }
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

        model.setOfflineParams(params);
        // Cache the map tiles.
        view.CacheMap(function (status) {
            // Show Status updates.
            view.ShowStatus(status.sMsg, status.bError);
        });
    };

    // Get list of geo paths from model to show in a list in the view.
    //  nMode: byte value of this.eMode enumeration.
    //  sPathOwnerId: string for path owner id for getting the paths from server.
    view.onGetPaths = function (nMode, sPathOwnerId) {
        GetGeoPaths(nMode, sPathOwnerId, true); // true => bIncludePublic true.
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

    // ** More private members
    var gpxArray = null; // Array of wigo_ws_Gpx object obtained from model.
    var gpxOfflineArray = null; // Array of wigo_ws_GeoPathMap.OfflineParams objects obtained from model.

    // Get list of geo paths from the model and show the list in the view.
    // Args:
    //  nMode: view.eMode for current view mode.
    //  sPathOwnerId: string for owner id for the list.
    //  bIncludePublic: boolean to indicate public records are included in the list.
    //                  All records for the sPathOwnerId are in the list.
    //                  bIncludePublic indicates if public records of other 
    //                  owners are also included.
    function GetGeoPaths(nMode, sPathOwnerId, bIncludePublic) {
        var sOwnerId = sPathOwnerId;
        if (nMode === view.eMode.online) {
            // Get list of geo paths from the server.
            // Get any share state for record owner.
            var nShare = model.eShare().any;
            model.getGpxList(sOwnerId, nShare, function (bOk, gpxList, sStatus) {
                var sErrorPrefix = "Failed to get list of trails from server. "
                if (bOk) {
                    gpxArray = gpxList; // Save a ref to the list, which is an array.

                    var arPath = new Array();
                    for (var i = 0; i < gpxArray.length; i++) {
                        arPath.push(gpxArray[i].sName);
                    }

                    if (bIncludePublic) {
                        // Also include all public paths.
                        nShare = model.eShare().public;
                        model.getGpxList("any", nShare, function (bOk, gpxList, sStatus) {
                            if (bOk) {
                                for (var i = 0; i < gpxList.length; i++) {
                                    if (gpxList[i].sOwnerId === sOwnerId)
                                        continue; // Item with same owner id as sOwnerId is already in list.
                                    gpxArray.push(gpxList[i]); // Add to array of Gpx objects that correspond to list of path names to be set in the view. 
                                    arPath.push(gpxList[i].sName);
                                }
                                view.setPathList(arPath);
                            } else {
                                view.ShowStatus(sErrorPrefix + sStatus);
                                view.clearPathList();
                            }
                        });
                    } else
                        view.setPathList(arPath);
                } else {
                    view.ShowStatus(sErrorPrefix + sStatus);
                    view.clearPathList();
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
    view.setOwnerId(model.getOwnerId());
    if (sOwnerId) {
        // Get and show the list of geo paths for the signed-in owner.
        GetGeoPaths(view.curMode(), sOwnerId, true); // true => IncludePublic.
    }

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
