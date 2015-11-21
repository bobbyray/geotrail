'use strict';
// wigo_ws_Model oject is in js/Model.js.

// wigo_GeoPathMap object is in js/GeoPathMapView.js.

// Object for parameters for this.onSavePathOffline()
wigo_ws_GeoPathMap.OfflineParams = function () {
    this.nIx = -1;      // Number for index of wigo_ws_Gpx object in list of objects.
    this.tStamp = new Date(Date.now()); // Date object for when this object is created.
    this.name = '';    // Name of geo path.
    this.nId = -1;      // Record sq id for geo path.
    this.sDivHtml = ''; // String of outerHTML for div container of map.
    this.bounds = { sw: new wigo_ws_GeoPt(), ne: new wigo_ws_GeoPt() }; // wigo_ws_GeoPt objects for SouthWest and NorthEast corner of bounds.
    this.center = new wigo_ws_GeoPt(); // wigo_ws_GeoPt object.
    this.zoom = 0;      // Google maps zoom number.
    this.gpxPath = null;    // wigo_ws_GpxOath object for the geo path.
    
    // Assigns all members of other oject of same type to this object.
    this.assign = function (other) {
        this.nIx = other.nIx;
        this.tStamp = other.tStamp;
        this.name = other.name;
        this.nId = other.nId;
        this.sDivHtml = other.sDivHtml;
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


    // ** Public members
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


    // Shows geo path information.
    // Args:
    //  bShow: boolean. Show or hide displaying the geo path info.
    //  path: wigo_ws_GpxPath object defining the path. null indicates do not set. 
    this.ShowPathInfo = function (bShow, path) {
        ShowPathInfoDiv(bShow);
        map.DrawPath(path);
    }

    // Shows geo path info for an offline map.
    // Args:
    //  bShow: boolean. Show or hide displaying the geo path info.
    //  offlineParams: wigo_ws_GeoPathMap.OfflineParams object for showing the info.
    this.ShowOfflinePathInfo = function (bShow, offlineParams) {
        ShowPathInfoDiv(bShow);
        if (bShow) {
            that.ShowStatus("Displaying offline geo path is not available yet.");
            /* !!!! Did NOT work. divMap.outerHTML could be set, but Google Map Api
                    to draw or pan cause fatal error -- not unexpected.
                    Will need to use static Google Map Image URL. 
                    For offline, draw static Google Map Image on HTML5 canvas.
                    Save the canvas as base64 data string in local storage. 
                    Reload canvas from local storage and draw on it.
            var divMap = getMapCanvas();
            divMap.outerHTML = offlineParams.sDivHtml;

            // Set state for the map.
            // var gpt = new wigo_ws_GeoPt(); Not allowed, use literal object.
            var llCenter =  new google.maps.LatLng(offlineParams.center.lat, offlineParams.center.lon);

            var oOptions = {
                disableDefaultUI: true,
                center: llCenter,
            };

            var oMap = map.getMap();
            //???? oMap.setOptions(oOptions);

            // map.DrawPath(offlineParams.gpxPath); offlineParams.gpxPath needs gptCenter function.
            */
        }
    };


    // ** Private members for html elements
    var that = this;
    var divOwnerId = $('#divOwnerId')[0];
    var txbxOwnerId = $('#txbxOwnerId')[0];
    var buSetOwnerId = $('#buSetOwnerId')[0];

    var divMode = $('#divMode')[0];
    var selectMode = $('#selectMode')[0];
    var buSaveOffline = $('#buSaveOffline')[0];

    var divPathInfo = $('#divPathInfo')[0];
    var selectGeoPath = $('#selectGeoPath')[0];

    var panel = $('#panel')[0];
    var buGeoLocate = $('#buGeoLocate')[0];
    var buGoToPath = $('#buGoToPath')[0];
    var buMinMaxMap = $('#buMinMaxMap')[0];

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
            that.onPathSelected(that.curMode(), iList);
        }
    });

    $(buSaveOffline).bind('click', function (e) {
        that.ClearStatus();

        if (selectGeoPath.selectedIndex === 0) {
            that.ShowStatus("Select a Geo Path first before saving.")
        } else {
            var oMap = map.getMap();
            var params = new wigo_ws_GeoPathMap.OfflineParams();
            params.nIx = parseInt(selectGeoPath.value);
            params.sDivHtml = getMapCanvas().outerHTML;
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
        }
    });

    $(selectMode).bind('change', function (e) {
        that.ClearStatus();
        // Set current mode to the new mode.
        nMode = that.eMode.toNum(this.value);
        // Inform controller of the mode change.
        that.onModeChanged(nMode);
        if (nMode === that.eMode.offline) {
            ShowSaveOfflineButton(false);
            // For offline mode, request loading the geo paths drop list for current user
            that.onGetPaths(nMode, that.getOwnerId());
        } else if (nMode === that.eMode.online) {
            ShowSaveOfflineButton(true);
            // For online mode, request loading the geo paths drop list for current user
            that.onGetPaths(nMode, that.getOwnerId());
        }
    });

    $(buGeoLocate).bind('click', function (e) {
        that.ShowStatus("Getting Geo Location ...", false);
        var geoLocationOptions = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
        navigator.geolocation.getCurrentPosition(
        function (position) {
            // Successfully obtained location.
            //  position is a Position object:
            //      .coords is a coordinates object:
            //          .coords.latitude  is latitude in degrees
            //          .coords.longitude is longitude in degrees 
            //      position has other members too. See spec on web for navigator.geolocation.getCurrentPosition.
            var location = L.latLng(position.coords.latitude, position.coords.longitude);
            map.SetGeoLocationCircleAndArrow(location);
            that.ClearStatus();
        },
        function (positionError) {
            // Error occurred trying to get location.
            var sMsg = "Geolocation Failed! Check your browser options to enable Geolocation.\n" + positionError.message;
            that.ShowStatus(sMsg);
        },
        geoLocationOptions);
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

    // ** Private members for Open Source map
    var map = new wigo_ws_GeoPathMap(false); // false => do not show map ctrls (zoom, map-type).
    map.onMapClick = function (llAt) {
        that.ClearStatus();
        map.SetGeoLocationCircleAndArrow(llAt);
    };

    // Sets panel of controls for map at top of the map.
    function SetMapPanelTop() {
        var y = divPathInfo.offsetTop;
        y += divPathInfo.offsetHeight;
        panel.style.top = y + 'px';
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
    // Set current mode for processing geo paths based on selectEditMode ctrl.
    this.setModeUI(this.eMode.toNum(selectMode.value));
    $(window).load(map.InitializeMap)
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
        view.ShowStatus("Saving map offline is not available yet.")
        return;

        // The following worked, but complete code is not ready yet.
        // params to save will be different no that LeafLetjs is used for Open Street Map.
        model.setOfflineParams(params);
        var oParams = model.getOfflineParams(params.nId);
    };

    // Get list of geo paths from model to show in a list in the view.
    //  nMode: byte value of this.eMode enumeration.
    //  sPathOwnerId: string for path owner id for getting the paths from server.
    view.onGetPaths = function (nMode, sPathOwnerId) {
        GetGeoPaths(nMode, sPathOwnerId, true); // true => bIncludePublic true.
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
                                view.ShowStatus(sStatus);
                            }
                        });
                    } else
                        view.setPathList(arPath);
                } else {
                    view.ShowStatus(sStatus);
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
}

// Set global var for the controller and therefore the view and model.
window.app = {};
window.app.OnDocReady = function (e) {
    // Create the controller and therefore the view and model therein.
    window.app.ctlr = new wigo_ws_Controller();
};

// Handle DOMCententLoaded event to create the model, view and controller. 
$(document).ready(window.app.OnDocReady);