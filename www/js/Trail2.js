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
        switch (nMode) {
            case this.eMode.online:
                ShowMapCacheSelect(false);
                ShowSaveOfflineButton(true);
                map.GoOffline(false);
                // Clear path on map in case one exists because user needs to select a path
                // from the new list of paths.
                map.ClearPath();
                break;
            case this.eMode.offline:
                ShowMapCacheSelect(true);
                ShowSaveOfflineButton(false);
                map.GoOffline(true);
                // Clear path on map in case one exists because user needs to select a path
                // from the new list of paths.
                map.ClearPath();
                break;
        }
    };

    // Selects item in the selectMode drop list.
    // Sets user interface for the new mode.
    // Fires this.onModeChanged(..) event.
    // Arg:
    //  newMode: integer for new mode defined by this.eMode enumberation.
    this.selectModeUI = function (newMode) {
        selectMode.selectedIndex = newMode;
        selectMode.value = this.eMode.toStr(newMode);

        this.setModeUI(newMode)

        if (this.onModeChanged)
            this.onModeChanged(newMode);
    }

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
        that.ClearStatus();
        var val = this.selectedValue;
        if (this.selectedIndex > 0) {
            var option = this[this.selectedIndex];
            if (option.value === 'facebook') {
                fb.Authenticate();
            } else if (option.value === 'logout') {
                fb.LogOut();
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
            that.setModeUI(nMode);
            that.onGetPaths(nMode, that.getOwnerId());
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

    // ** More private members
    var nMode = that.eMode.online; // Current mode.

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
        var sVersion = "1.1.008  09/11/2015";
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
   cordova-plugin-dialogs\n\
   com.jetboystudio.pebble.PebblePGPlugin\n\
   cordova-plugin-file 2.0.0 "File"\n\
   cordova-plugin-file-transfer 1.1.0 "File Transfer"\n\
   cordova-plugin-geolocation 1.0.0 "Geolocation"\n\
   cordova-plugin-vibration 1.2.1-dev "Vibration"\n\
   cordova-plugin-whitelist 1.0.0 "Whitelist"\n\
   org.nypr.cordova.wakeupplugin 0.1.0 "WakeupTimer"\n\
';
        return sMsg;
    }

    // Returns string for help message.
    function HelpMsg() {
        var sMsg = '\
Select Sign In > Facebook to sign in. Your sign-in id is remembered so \
you do not need to sign in again unless you log out.\n\
You do not need to sign in, but you can only view public trails if not signed in.\n\n\
Online/Offline switches between accessing trails from the Internet of from locally saved maps.\n\n\
Online lets you \
select Geo-paths that others have made public and ones \
that are private to you.\n\n\
Save Offline\n\
Touch the Save Offline button to save a path you are viewing so that you can \
view it when you are offline.\n\n\
Offline lets you select paths you have saved offline. Select a Geo Path from the \
list you have saved.\n\n\
Map Cache shows information about the cache of map tiles.\n\
Select Size to see the number of files and the size in MB of all the files.\n\
Select Clear to empty the cache of map files.\n\n\
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
Initially alert by phone when Off-Path Yes | No: Yes to start with Phone Alert On when app loads.\n\n\
Phone Alert Yes | No: detemines if alerts (beeps) from you phone are given. \n\n\
Phone beep count: number of beeps to give for an alert. Set to 0 for no beepings.\n\n\
Phone vibration in secs: number of seconds phone vibrates for an alert. Set to 0 for no vibration.\n\n\
Pebble Watch Yes | No: Yes to show messages on a Pebble Watch that is connected to the phone.\n\n\
Pebble Vibration Count: number of vibrations given on Pebble Watch for message indicating \
off trail. Count of 0 disables vibrations.\n\n\
Prev Geo Loc Thres (m): number of meters of current geo-location with respect to previous location \
for change in location to be considered valid. (This prevents small variations in the geo-location of \
the same point to appear to be a change in location.)\n\n\
Menu > Start Pebble\n\
Starts the Pebble app on the watch. The Pebble app should be started automatically so this is unlikely \
to be needed.\n\n\
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
                    // Set ui to online mode.
                    view.selectModeUI(view.eMode.online);
                    // Cause geo paths to be displayed for user.
                    view.onGetPaths(view.curMode(), view.getOwnerId());
                } else {
                    var sMsg = "Authentication failed:{0}status: {1}{0}UserID: {2}{0}User Name: {3}{0}AccessHandle: {4}{0}msg: {5}".format("<br/>", result.status, result.userID, result.userName, result.accessHandle, result.msg);
                    view.ShowStatus("")
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
                        view.ShowStatus("Successfully logged out.", false);
                        // Initialize UI for same mode.
                        var nMode = view.curMode();
                        view.setModeUI(nMode);
                        // Show geo path for no user logged in.
                        view.onGetPaths(nMode, view.getOwnerId());
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

        if (nMode === view.eMode.online) {

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
