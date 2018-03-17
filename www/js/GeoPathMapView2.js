'use strict';
/* 
Copyright (c) 2015 - 2017 Robert R Schomburg
Licensed under terms of the MIT License, which is given at
https://github.com/bobbyray/MitLicense/releases/tag/v1.0
*/
/* Prototype for L.LatLng object in LeafLetJs provided by 
Gregor the Map Guy Blog
--------------------------------------------------------------
*/
// Returns bearing to other destination from this object.
// Arg:
//  other: L.LatLng object for the other destination.
// Returns:
//  bearing: floating point number in degrees for bearing wrt to North.
//           value constrainted to 0 to 360 degrees.
L.LatLng.prototype.bearingTo = function(other) {
    var d2r  = L.LatLng.DEG_TO_RAD;
    var r2d  = L.LatLng.RAD_TO_DEG;
    var lat1 = this.lat * d2r;
    var lat2 = other.lat * d2r;
    var dLon = (other.lng-this.lng) * d2r;
    var y    = Math.sin(dLon) * Math.cos(lat2);
    var x    = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
    var brng = Math.atan2(y, x);
    //brng = parseInt( brng * r2d ); // Use floating point for the bearing angle.
    brng = brng * r2d;
    brng = (brng + 360) % 360;
    return brng;
};

// Returns word abbreviation for bearing to other destination.
// Arg:
//  other: L.LatLng destination object.
// Returns:
//  word: string for abbreviation of compass bearing.
L.LatLng.prototype.bearingWordTo = function(other) {
    var bearing = this.bearingTo(other);
    var bearingword = '';
    if      (bearing >=  22 && bearing <=  67) bearingword = 'NE';
    else if (bearing >=  67 && bearing <= 112) bearingword =  'E';
    else if (bearing >= 112 && bearing <= 157) bearingword = 'SE';
    else if (bearing >= 157 && bearing <= 202) bearingword =  'S';
    else if (bearing >= 202 && bearing <= 247) bearingword = 'SW';
    else if (bearing >= 247 && bearing <= 292) bearingword =  'W';
    else if (bearing >= 292 && bearing <= 337) bearingword = 'NW';
    else if (bearing >= 337 || bearing <=  22) bearingword =  'N';
    return bearingword;
};

// Returns L.LatLng obj offset from this object.
// Args:
//  mX: number. Offset in x direction (along latitude) in meters.
//  my: number. Offset in y direction (along longitude) in meters.
//  Note: For x, East is +, West is -.
//        For y, North is +, South is -.
L.LatLng.prototype.offsetXY = function(mX, mY) {
    // note: ll.toBounds(mToCorner) is documented, but does not exist.
    var yDelta = L.latLng(this.lat + 1.0, this.lng); // y latlng one degree away.
    var mYperDeg = this.distanceTo(yDelta);   // y distance in one degree.
    var xDelta = L.latLng(this.lat, this.lng + 1.0); // x latng one degree away.
    var mXperDeg = this.distanceTo(xDelta);   // x distance in one degree.
    var degYDelta = mY / mYperDeg;
    var degXDelta = mX / mXperDeg;
    var llOffset = L.latLng(this.lat + degYDelta, this.lng + degXDelta);
    return llOffset;
};

/* -------------------------------------------------------------------*/

// Object for showing geo path map.
// Object can be shared by view objects of pages, 
// for example GeoPaths.html and Trail.html.
// Constructor Args:
//  bShowMapCtrls: Optional, boolean. Indicates if zoom and map-type controls are shown
//                 on google map. Defaults to false;
//                 Note: Ignored for now because zoom control always remains on
//                       top causing problem for Settings diaglog.
//  bTileCaching: Optional, boolean to indicate tile caching is provided. Defaults to true.
//                Note: Set to true for Cordova phone app. Set to false for a web page.
function wigo_ws_GeoPathMap(bShowMapCtrls, bTileCaching) {
    var that = this;
    if (typeof (bShowMapCtrls) !== 'boolean')
        bShowMapCtrls = false;
    if (typeof(bTileCaching) !== 'boolean')
        bTileCaching = true;
    var map = null;     // Underlying map object.
    var mapPath = null; // Map overlay for current path.
    var tileLayer = null; // L.TileLayer.Cordova obj for caching map tiles offline. Open streets layer for map.
    var layerOpenTopologyMap = null; //  L.TileLayer.Cordova obj. Open topology layer for map.
    var layerNASAGIBS_ModisTerraSnowCover = null; //  L.TileLayer.Cordova obj. Snow cover layer for map.
    
    // ** Public members
    // Colors to use for drawing. 
    // Default values are set initially.
    // The values may be changed.
    // A color value is a string for a color. 
    // The rbg hex notation of '#rrggbb' can be used (rr for red, gg for green, bb for blue).
    this.color = {
        path: '#331a00',        // dark broun //was '#ff8c1a', //was '#663300', //was #b36b00'  //was brown to sandy  
        pathStart: '#00FF00',   // bright green
        pathEnd:    '#ff0000',  // bright red
        locCircle: '#00ff00',   // Current geo location, bright green.
        toPath: '#0000ff',      // Line back to path, bright blue.
        prevLocCircle: '#00ffff',  // Previous location circle, cyan
        refLine: '#000000',        // Ref line from current location to previous location, black.
        touchCircle: 'orange',     // Touch point when editing path.
        editCircle: 'yellow',      // Edit point on path.
        editSegment: 'magenta',    // Edit line segment for path.
        eraseSegment: 'white',     // Erase line segment when editing a point in the path.
        compassHeadingArrow: 'yellow', // Compass heading arrow from current location circle.
        recordPath: '#ff9900',     // Sandy 
        recordPathEnd: '#ff4000'   // Redish
    };

    // Initialize to use Open Streets Map once browser has initialized.
    // Arg:
    //  callback: callback function called upon completion of loading map. 
    //      callback may be null. Signature of callback:
    //          bOk: boolean indicating success.
    //          sMsg: string for message. For bOk false, an error message.
    // Remarks: Event handler for window loaded can be set to this function.
    this.InitializeMap = function (callback) {
        console.log("Initializing Map.");
        var latlngMtHood = new L.LatLng(45.3736111111111, -121.695833333333);
        // Note: {zoomControl: false} is used for map options because the zoomControl
        //       always stays on top, which a problem when Setting dialog is opened.
        map = L.map('map-canvas', { zoomControl: bShowMapCtrls }).setView(latlngMtHood, 13);

        NewTileLayer(function (layer, sError) {
            tileLayer = layer;
            if (tileLayer) {
                tileLayer.addTo(map);
            }

            if (map) { // For safety check that map has been created successfully. 
                // Add a listener for the click event.
                map.on('click', onMapClick);

                // Add a listener for the zoomend event 
                map.on('zoomend', onMapZoomEnd);  

                // Initialize PathListMarkers. 
                pathMarkers.initialize(map);   
            }
            // Callback to indicate the result.
            var bOk = tileLayer !== null;
            if (callback)
                callback(bOk, sError);
        });
    };
    var bOfflineDataEnabled = false;


    var bCompassHeadingVisible = true;
    // Set visibility state for compass arrow that is drawn from current location circle.
    // Arg:
    //  bVisible: boolean. true to make compass arrow visible on the map.
    // Remarks: The compass arrow indicates the direction the phone is pointing when
    // the current geo location is updated. Typically the top of phone is used 
    // as the ppinter for the compass direction.
    this.SetCompassHeadingVisibleState = function(bVisible) {
        bCompassHeadingVisible = bVisible;
    };

    // Sets flag to indicate if a snow cover layer is shown on the map.
    // Arg:
    //  bSnowCoverLayerArg: boolean. true to shown snow cover layer on the map.
    this.setSnowCoverLayerFlag = function(bSnowCoverLayerArg) { 
        bSnowCoverLayer = bSnowCoverLayerArg;
    };
    var bSnowCoverLayer = true; // boolean flag to indicate a snow cover layer is added to the map.

    // Sets flag to indicate if a topographical layer is shown on the map.
    // Arg:
    //  bTopoLayerFlagArg: boolean. true to shown topographical layer on the map.
    this.setTopologyLayerFlag = function(bTopoLayerArg) { 
        bTopologyLayer = bTopoLayerArg;
    };
    var bTopologyLayer = true; // boolean flag to indicate topographic layer is added to the map.

    // Adds or removes tile layers for to the map based on state of layer flags.
    this.updateMapLayers = function() { 
        // Remove any existing map layer first. This way map layers are 
        // always added in the same order for consistency of display.
        if (layerOpenTopologyMap) {
            map.removeLayer(layerOpenTopologyMap); 
            layerOpenTopologyMap = null; 
        }
        if (layerNASAGIBS_ModisTerraSnowCover) {
            map.removeLayer(layerNASAGIBS_ModisTerraSnowCover);
            layerNASAGIBS_ModisTerraSnowCover = null;
        }

        // First add topographical layer to map if enabled.
        if (bTopologyLayer) { 
            layerOpenTopologyMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                maxZoom: 17,
                opacity: 30,
                attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
            }); 
            map.addLayer(layerOpenTopologyMap);               
        }

        // Next add snow cover layer to map if enabled.
        if (bSnowCoverLayer) {
            layerNASAGIBS_ModisTerraSnowCover = L.tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-webmerc/MODIS_Terra_Snow_Cover/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}', {
                attribution: 'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
                bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
                minZoom: 1,
                maxZoom: 8, // Fails for maxZoom > 8 
                format: 'png',
                time: '', // '2017-10-16', // '', // '' is current date.
                tilematrixset: 'GoogleMapsCompatible_Level',
                opacity: 0.30 
            });
            map.addLayer(layerNASAGIBS_ModisTerraSnowCover);  
        } 
    }

    // Returns true if the device has enabled data storage.
    // Note: The device settings for an app may need to give permission to used data storage.
    this.isOfflineDataEnabled = function() {
        return bOfflineDataEnabled;
    };

    // Error message that methods may set on an error.
    this.sError = "";

    var curPathSegs = new PathSegs(); 

    var curPath = null; // Ref to current path drawn, a wigo_ws_GpxPath object.
    // Draws geo path on the map object.
    // Args:
    //  path: wigo_ws_GpxPath object for the path.
    //  zoom: number, optional. zoom factor.
    //  gptCenter: wigo_ws_GeoPt, optional. center point for displaying.
    // Notes:
    //  Specify zoom, gptCenter for drawing a path offline. In this case the
    //  zoom and center point were saved with the offline path data. (The current
    //  zoom for the offline map may not have tites for drawing the path.)
    //  Do not specify zoom and gptCenter for drawing a path online. In this
    //  case the display is set to the bounds of the path with zoom set accordingly.
    //  (Using current zoom does not work well because it is for the previous trail.)
    this.DrawPath = function (path, zoom, gptCenter) {
        if (!DrawPath0(path)) 
            return; 

        if (typeof(zoom) === 'number' && typeof(gptCenter) === 'object') {
            var llCenter = L.latLng(gptCenter.lat, gptCenter.lon);
            map.setZoomAround(llCenter, zoom); 
            map.panTo(llCenter); 
        } else {
            // Fit path bound to display.
            this.PanToPathCenter()
        }
    };

    // Draws geo path on the map object.
    // Useful for Edit and Draw view.
    // Args:
    //  path: wigo_ws_GpxPath object for the path.
    this.DrawEditPath = function(path) { 
        DrawPath0(path);
    };

    // Helper for this.DrawPath() and this.DrawEditPath().
    // Draws geo path on the map object.
    // Args:
    //  path: wigo_ws_GpxPath object for the path.
    // Returns: boolean. false for failure.
    function DrawPath0(path) { 
        if (!IsMapLoaded())
            return false; // Quit if map has not been loaded.
        //var polyline = L.polyline(latlngs, { color: 'red' }).addTo(map);
        // Clear any current path before drawing another path.
        that.ClearPath();

        // Quit if path is not defined.  
        if (!path) {
            curPath = null;
            return false;
        }

        curPathSegs.Init(path);
        var pathCoords = curPathSegs.getPathCoords();

        mapPath = L.polyline(pathCoords, { color: that.color.path, opacity: 0.5 });
        mapPath.addTo(map);

        // Draw start and end of path shape on the path.
        SetStartEndOfPathShape();  

        curPath = path; // Save current gpx path object.
        return true;
    }

    // Animates current path by showing an icon traveling along the path.
    this.AnimatePath = function() {  
        if (mapPath) {
            if (curPathSegs) {
                var mDistance = curPathSegs.getTotalDistance();
                var nPoints = curPathSegs.getCount();
                var seconds = mDistance < 1000 ? 10 : mDistance < 2000 ? 20 : 30;
                // Note: If animation is stuterring, may need to adjust assigning seconds above.
                pathAnimator.setAnimationRate(mDistance, nPoints, seconds); 
            }
            pathAnimator.start(mapPath);
        }
    };

    // Animates current path but only if animator has auto start for animation enabled.
    // Note: call this.AnimatePath() instead to always show the animation.
    this.AutoAnimatePath = function(){
        if (pathAnimator.bAutoStart) {
            this.AnimatePath();
        }
    };

    // Stops and clears trail animation in case it is running.
    this.ClearPathAnimation = function() { 
        pathAnimator.clear();
    };

    // Enable/disable automatic path animation when path is loaded.
    // Arg:
    //  bAuto: boolean. true to enable automatic path animation.
    this.EnableAutoPathAnimation = function(bAuto) {  
        pathAnimator.bAutoStart = bAuto;
    };

    // Creates and returns a PathSegs object.
    this.newPathSegs = function() { 
        var segs = new PathSegs();
        return segs;
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
        return pathMarkers.newPathMarkerEl();
    };

    // Fills the collection of path markers that can be shown on the map.
    // Arg:
    //  arPathMarkers: array of PathMarkerEl objs, optional. If not given 
    //                 empties and clears the path markers from the map.
    // Note: Does not show the path markers. 
    this.FillPathMarkers = function(arPathMarker) {
        pathMarkers.empty();
        if (!arPathMarker)
            return;
        var el, key;
        for (var i=0; i < arPathMarker.length; i++) {
            el = arPathMarker[i];
            key = el.dataIx.toFixed(0);
            pathMarkers.setPathMarkerEl(key, el);
        }
    };
    
    // Shows the path markers on the map.
    this.ShowPathMarkers = function() { 
        pathMarkers.show();
    };

    // Clears the path markers from the map.
    this.ClearPathMarkers = function() { 
        pathMarkers.clear();
    };

    // Not Used. Does not seem to be useful.
    // // Redraw the map.
    // this.Redraw = function() { 
    //     if (tileLayer) {
    //         tileLayer.redraw(); 
    //     }
    // };

    // Fits map to bounds of path.
    // Arg:
    //  path: wigo_ws_GpxPath object for the path.
    function FitToPathBounds(path) {
        // Set zoom so that trail fits if there is valid boundary.
        if (IsBoundaryValid(path)) { 
            var sw = L.latLng(path.gptSW.lat, path.gptSW.lon);
            var ne = L.latLng(path.gptNE.lat, path.gptNE.lon);
            var bounds = L.latLngBounds(sw, ne);
            map.fitBounds(bounds);
            /* I don't like this either. Live with a trail occasionally off screen. 
               User can touch Ctr Trail to get trail completely on screen.
            // Adjust bounds to account for map-canvas extending beyond bottom of screen.
            var pxBounds = map.getPixelBounds();
            var mapCanvas = that.getMapCanvas();
            if (mapCanvas) {
                var ptOffset = L.point(0, mapCanvas.offsetTop/2);
                map.panBy(ptOffset);
            }
            */
            /* // This does not work. I think needing to know zoom is the reason. 
            var sw = L.latLng(path.gptSW.lat, path.gptSW.lon);
            var ne = L.latLng(path.gptNE.lat, path.gptNE.lon);
            var pxBounds = map.getPixelBounds();
            var mapCanvas = that.getMapCanvas();
            if (mapCanvas) {
                var llBottomRight = L.latLng(sw.lat, ne.lng);
                var zoom = map.getZoom();
                var ptBottomRight =  map.project(llBottomRight, zoom);
                ptBottomRight.y -= mapCanvas.offsetTop;
                llBottomRight = map.unproject(ptBottomRight);
                sw.lat = llBottomRight.lat;
            }
            var bounds = L.latLngBounds(sw, ne);
            map.fitBounds(bounds);
            */
        } else {
            if (IsSinglePointArea(path)) { 
                // Note: A single point area does not have a valid path boundary,
                //       but it is used to define an area whose map tiles
                //       can be cached offline without a trail selected.
                // Calc corners for rect about the single point.
                var mToSideMin = 500; // Number of meters to side of rect.
                var llCenter = L.latLng(path.arGeoPt[0].lat, path.arGeoPt[0].lon);
                var llNE = L.latLng(0,0);
                var llSW = L.latLng(0,0);
                var llSide;
                // East (right) side.
                llSide = llCenter.offsetXY(mToSideMin, 0);
                llNE.lng = llSide.lng;
                // North (top) side.
                llSide = llCenter.offsetXY(0, mToSideMin);
                llNE.lat = llSide.lat;
                // West (left) side.
                llSide = llCenter.offsetXY(-mToSideMin, 0);
                llSW.lng = llSide.lng;
                // South (bottom) side.
                llSide = llCenter.offsetXY(0, -mToSideMin);
                llSW.lat = llSide.lat;
                // Fit map to the corners.
                var bounds = L.latLngBounds(llSW, llNE);
                map.fitBounds(bounds);
            } else { 
                // Set zoom around last point of path.
                var iLast = path.arGeoPt.length -1;
                if (iLast >= 0) {
                    var llEnd = L.latLng(path.arGeoPt[iLast].lat, path.arGeoPt[iLast].lon);
                    var zoom = map.getZoom();          
                    map.setZoomAround(llEnd, zoom);    
                }
            }
        }
    }


    // Sets geo location update figures on map for shortest distance to geo path, 
    // but only if current location is off the geo path by a specified amount.
    // Note: Likely replaces this.SetGeoLocationCircleAndArrow(location). Drawing
    //       is a bit different and previous geo point in addition to current geo point 
    //       are used to draw the figures.
    // Arg:
    //  location: Map LatLng object for current geolocation.
    //  dOffPath: float for distance from location off-path to on-path for which 
    //      valid result is returned.
    //  callbackCompassBearing: optional. Callback after compass bearing is obtained. 
    //      If callback is not defined, returns synchronously with object described for Returns below,
    //      and bCompass is false in returned object.
    //      Signature of callback when givenj:
    //          upd: same object described for Returns. In this case, upd.bCompass should be valid if 
    //               compass device is working.
    //       
    // Returns {bToPath: boolean, dToPath: float, bearingToPath: float, bRefLine: boolean, bearingRefLine: float,
    //          bCompass: bool, bearingCompass: float, compassError: CompassError or null}:
    //  bToPath indicates path from geo location off path to nearest location on the path is valid.
    //      For bToPath false, dToPath, and bearingToPath are invalid.
    //      Distance from location off-path to on-path must be > arg dOffPath for 
    //      bToPath to be true.
    //  dToPath: distance in meters from off-path location to on-path location.
    //  bearingToPath is bearing (y-North cw) in degrees (0.0 to 360.0) for location to 
    //      nearest point on the path.
    //  bRefLine indicates bearingRefLine is valid.
    //  bearingRefLine is bearing (y-North cw) in degrees (0.0 to 360.0) for reference 
    //  line from previous off-path location to current off-path location.
    //  loc: L.LatLng object for location.
    //  dFromStart: distance in meters from start to nearest point on the path.
    //  dToEnd: distance in meters from nearest point on the path to the end.
    //  bCompass: boolean, indicates that compass bearing is valid.
    //      Note: compass beearing is only requested when callbackCompassBearing is given.
    //            bCompass is false if callback is not given or if there is an error
    //            trying to get the compass bearing (heading). bCompass is true only if the
    //            the compass bearing is successfully obtained.
    //  bearingCompass: number, compass bearing from magnetic North in degress (0.0 to 360.0 cw).
    //  compassError: CompassError object if there is an error getting the compass bearing.
    //                null, it there was no error or if compass bearing was not requested.
    //                compassError.code can be one of these constant values:
    //                    CompassError.COMPASS_INTERNAL_ERR
    //                    CompassError.COMPASS_NOT_SUPPORTED
    // Remarks:
    //  The difference between bearingToPath and bearingRefLine may be useful for suggesting
    //  degrees of correction to navigate back to the path (trail).
    this.SetGeoLocationUpdate = function (location, dOffPath, callbackCompassBearing) {
        var result = {
            bToPath: false, bearingToPath: 0.0, dToPath: 0.0,
            bRefLine: false, bearingRefLine: 0.0, loc: location,
            dFromStart: 0.0,
            dToEnd: 0.0,
            bCompass: false, bearingCompass: 0.0, compassError: null
        };
        if (!IsMapLoaded())
            return result; // Quit if map has not been loaded.

        
        // Helper to get compass bearing asynchronously and do callback providing result obj 
        // once compass bearing  is obtained.
        // If arg callbackCompassBearing is not defined, returns without changing result obj.
        function DoCompassBearingIfRequested() {
            if (typeof(callbackCompassBearing) === 'function') {
                if (navigator && navigator.compass) {
                    // Get compass bearing (heading) asynchronously and do callback 
                    // with the result in the async handler.
                    navigator.compass.getCurrentHeading( function(heading) { // success
                        result.bCompass = true;
                        result.bearingCompass = heading.magneticHeading;
                        SetCompassHeadingArrow(heading.magneticHeading);
                        callbackCompassBearing(result);
                    }, 
                    function(error){ // Error
                        result.bCompass = false;
                        result.bearingCompass = 0.0;
                        result.compassError = error;
                        callbackCompassBearing(result);
                    });
                } else {
                    // navigator.compass is not defined, so cannot set compass heading.
                    // Do callback for the result without compass heanding info. 
                    callbackCompassBearing(result);
                }
            }
        }


        var rCircle = 10; // Radius of circle in pixels
        if (!this.IsPathDefined()) {
            // No path on the map. Just draw circle for location.
            SetGeoLocationCircle(location, rCircle);
            map.panTo(location);
            // Get compass bearing asynchrously and do callback with result,
            // but only if compass bearing is requested.
            DoCompassBearingIfRequested(); 
        } else {
            // Set flag for initial update, which is used to avoid miss leading off-path
            // message when there is no previous geo location point.
            var bInitialUpdate = prevGeoLoc === null || prevGeoLocCircle === null;

            // Check if current location is sufficiently beyond previous location to 
            // use reference line from previous location.
            // Ensure prevGeoLoc and prevGeoLocCircle are initialized.
            if (prevGeoLoc === null)
                prevGeoLoc = location;
            if (prevGeoLocCircle === null)
                prevGeoLocCircle = L.circle(location, 1);
            var bCurGeoLocBeyondPrevGeoLoc = (location.distanceTo(prevGeoLoc) > this.dPrevGeoLocThres);

            var atPath = FindNearestPointOnGeoPath(location, dOffPath);
            result.dFromStart = atPath.dFromStart;
            result.dToEnd = atPath.dToEnd;
            if (atPath.llAt && atPath.d > dOffPath) {
                // Draw geo location circle (green circle) on the map.
                var llPathGeoLoc = null;
                SetGeoLocationCircle(location, rCircle);
                if (geolocCircle) {
                    // Draw line from current geo location to nearest point on trail.
                    DrawGeoLocToPathArrow(location, atPath.llAt);
                    // Get bearing for navigating back to path.
                    result.bearingToPath = location.bearingTo(atPath.llAt);
                    result.dToPath = atPath.d; // Distance from point off path to the path.
                    result.bToPath = true;
                }
                // Draw previous geolocation circle and reference line to current location.
                if (!bCurGeoLocBeyondPrevGeoLoc) {
                    // Previous location is too close to current location.
                    result.bearingRefLine = SetPrevGeoLocRefLine(prevGeoLocCircle.getLatLng(), rCircle);
                    result.bRefLine = !bInitialUpdate;
                } else {
                    result.bearingRefLine = SetPrevGeoLocRefLine(prevGeoLoc, rCircle);
                    result.bRefLine = !bInitialUpdate;
                }

                // Pan map to current geo location.
                var center = geolocCircle.getLatLng();
                map.panTo(center);
            } else {
                // Clear previous off path drawings.
                this.ClearGeoLocationUpdate();
                // Draw the current geolocation circle only.
                SetGeoLocationCircle(location, rCircle);
                map.panTo(location);
            }

            // Save current location as previous location for next update, provided
            // location has changed suffiently from previous location.
            if (bCurGeoLocBeyondPrevGeoLoc)
                prevGeoLoc = location;
            
            // Get compass bearing asynchrously and do callback with result,
            // but only if compass bearing is requested.
            DoCompassBearingIfRequested(); 
        }
        return result;
    };

    // Clears geo location update figures from the map. The path remains.
    this.ClearGeoLocationUpdate = function () {
        if (!IsMapLoaded())
            return; // Quit if map has not been loaded.
        ClearGeoLocationCircle();
        ClearGeoLocationToPathArrow();
        ClearPrevGeoLocRefLine();
        ClearTouchCircle();  
        ClearCompassHeadingArrow(); 
    };

    // Draws a circle for touch point.
    // Arg:
    //  gpt: wigo_ws_GeoPt obj to draw.
    this.DrawTouchPt = function (gpt) {
        if (!gpt)
            return; 
        var ll = L.latLng(gpt.lat, gpt.lon);
        SetTouchCircle(ll, 10);
    }

    // Draws a circle on path to indicate a path point is being edited.
    // Arg:
    //  ixPath: integer for index in curPath.arGeoPt array for point being edited.
    //          For ixPath < 0, clears edit circle and touch circle.
    this.DrawEditPt = function (ixPath) {
        if (curPath && ixPath >= 0 && ixPath < curPath.arGeoPt.length) {
            var gpt = curPath.arGeoPt[ixPath];
            var ll = L.latLng(gpt.lat, gpt.lon);
            SetEditCircle(ll, 10);
        } else {
            ClearEditCircle();
            ClearTouchCircle();
        }
    };

    // Returns index in current path array of geo pts that is 
    // nearest to a lat, lon pt. 
    // Returns -1 if current path does not exist or is empty.
    // Arg:
    //  gpt: wigo_ws_GeoPt object for the lat, lon pt being checked.
    this.FindEditIx = function (gpt) {
        var llAt = L.latLng(gpt.lat, gpt.lon);
        var dToPathMin = 41000000; // Initialize to greater than circumference of earth in meters.
        var d = 0;
        var gptFound = null;
        var gptPath;
        var llPathPt = L.latLng(0,0);
        var iFound = -1;
        for (var i = 0; curPath && i < curPath.arGeoPt.length; i++) {
            gptPath = curPath.arGeoPt[i];
            llPathPt.lat = gptPath.lat;
            llPathPt.lng = gptPath.lon;
            d = llPathPt.distanceTo(llAt);
            if (d < dToPathMin) {
                dToPathMin = d;
                iFound = i;
            }
        }
        return iFound;
    };

    // Draws edit overlay segment for appending a point to end of current path.
    // Arg:
    //  gptTo: wigo_ws_GeoPt object for point being appended.
    this.DrawAppendSegment = function (gptTo) {
        SetAppendSegment(gptTo);
    };

    // Draws edit overlay segment for moving a point in the current path. 
    // Args:
    //  gptTo: wigo_ws_GeoPt object for location to which point is being moved.
    //  ix: index in current path for point being moved.
    this.DrawMoveSegment = function (gptTo, ix) {
        var bMove = true;
        SetEraseSegment(ix, bMove);
        SetEditSegment(gptTo, ix, bMove);
    };

    // Draws edit overlay segment for inserting a point in the current path.
    // Args:
    //  gptTo: wigo_ws_GeoPt object for location at which point is being inserted.
    //  ix: index in current path before which insertion is being done.
    this.DrawInsertSegment = function (gptTo, ix) {
        var bMove = false;
        SetEraseSegment(ix, bMove); 
        SetEditSegment(gptTo, ix, bMove);
    };

    // Draws edit overlay segment for deleting a point in the current path.
    //  Arg:
    //  ix: index in current path for the point being deleted.
    this.DrawDeleteSegment = function (ix) {
        // Erase is same as for moving a point in the path.
        var bMove = true;
        SetEraseSegment(ix, bMove);
        SetDeleteSegment(ix);
    };

    // Clears from the map the path segments for moving or inserting.
    this.ClearEditSegment = function () {
        ClearEditSegment();
        ClearEraseSegment();
    };

    // Returns lat/lon for a pixel coordinate on the map layer.
    // Returned object is wigo_ws_GeoPt object.
    // Arg:
    //  pt: L.Point object for pixel coordinates.
    this.PixelToLatLon = function (pt) {
        var ll = map.layerPointToLatLng(pt);
        var gpt = new wigo_ws_GeoPt();
        gpt.lat = ll.lat;
        gpt.lon = ll.lng;
        return gpt;
    };

    // Returns L.Point object (.x, .y) for a lat/lon geo point.
    // Args:
    //  gpt: wigo_ws_GeoPt object for lat/lon to be converted to 
    //       pixel x,y position on map layer.
    this.LatLonToPixel = function (gpt) {
        var ll = L.latLng(gpt.lat, gpt.lon);
        var pixel = map.latLngToLayerPoint(ll);
        return pixel;
    };

    // Pan to point on the map.
    // Arg:
    // gpt: wigo_ws_GeoPt obj to which to pan. 
    this.PanTo = function (gpt) {
        if (!IsMapLoaded())
            return; // Quit if map has not been loaded.
        var ll = L.latLng(gpt.lat, gpt.lon);
        // Note: {animate: false} option seems to fix problem of panning within same screen.
        map.panTo(ll, { animate: false });   
    };

    // Pan to center of path on the map.
    // Returns true for success, false if current path is null.
    this.PanToPathCenter = function () {
        var bOk = true;
        if (curPath) {
            // Note: Used to pan to center of path and zoom. This did not work well
            // because saved zoom factor could represent zoom of previous trail rather
            // than zoom of current trail. Seems that zoom does not change
            // immediately when a path is drawn.
            FitToPathBounds(curPath);
        } else
            bOk = false;
        return bOk;
    };

    // Clears current path and geo location circle, and compass arrow, path markers from the map.
    this.ClearPath = function () {
        if (!IsMapLoaded())
            return; // Quit if map has not been loaded.
        if (mapPath) {
            map.removeLayer(mapPath);
            mapPath = null;
        }
        curPath = null;
        curPathSegs.Clear(); 
        ClearStartOfPathShape(); 
        ClearEndOfPathShape();   
        ClearGeoLocationCircle();
        ClearGeoLocationToPathArrow();
        ClearPrevGeoLocRefLine();
        ClearTouchCircle(); 
        ClearEditCircle();
        ClearEditSegment();  
        ClearEraseSegment(); 
        ClearCompassHeadingArrow();
        pathMarkers.clear();  
        pathAnimator.clear(); 
    }

    // Returns true if a path has been defined (drawn) for the map.
    this.IsPathDefined = function () { 
        var bDefined = mapPath !== null;
        // Also check for a path that has only two pts that are the same.
        if (bDefined) {  
            var arPt = mapPath.getLatLngs();
            if (arPt.length === 2 ) {
                if (arPt[0].lat === arPt[1].lat && arPt[0].lng === arPt[1].lng) {
                    // Path has exactly two identical points. 
                    // NOT a path but is instead an area for an offline map which has center at the poitn.
                    // Note: the path will draw as a single point with same beginning and end.
                    bDefined = false;
                }
            }
        }
        return bDefined;
    }

    // Caches current map view to the offline cache.
    // Arg:
    //  onStatusUpdate: callback for status update. Maybe null. callback signature:
    //    arg object {sMsg: string, bDone: boolean, bError: boolean}: 
    //      sMsg: Status msg.
    //      bDone: Indicates done, no more callbacks.
    //      bError: Indicates an error.
    // Returns:
    //  boolean, true indicates success. Return is immediate but download of tiles is
    //  asynchronous. onStatusUpdate(arg) callback is done (repeatedly) to update status
    //  asyncrhonously.
    this.CacheMap = function (onStatusUpdate) {
        CacheLayer(onStatusUpdate);
    };

    // Gets information about the size of the size holding files for the map tiles.
    // Arg:
    //  onObtained: asynchronous callback with signature:
    //      nFiles: integer number of tile files.
    //      nBytes: integer number of bytes of storage for the files.
    this.CacheSize = function (onObtained) {
        if (tileLayer) {
            tileLayer.getDiskUsage(function (nFiles, nBytes) {
                if (onObtained)
                    onObtained(nFiles, nBytes);
            });
        } else {
            if (onObtained)
                onObtained(0, 0); // Not expected. no tileLay exists.
        }
    };
    
    // Clears (empties) the cache of map tiles. 
    // Arg:
    //  onCleared: aynchronous callback with signature:
    //    nFilesDeleted: integer number of files deleted.
    //    nFilesIfError: integer number of files deleted if there is an error. 0 for no error.
    // Returns: synchronously nothing.
    this.ClearCache = function (onCleared) {
        if (tileLayer) {
            tileLayer.emptyCache(function (nFilesDeleted, nFilesDeletedAtFailure) {
                if (onCleared) {
                    onCleared(nFilesDeleted, nFilesDeletedAtFailure);
                }
            });
        } else {
            if (onCleared)
                onCleared(0, 0); 
        }
    }

    // Sets map for offline or online use.
    // Arg:
    //  bOffline: boolean indicates using map online.
    // Return result object, {bOk: boolean, sMsg: string}:
    //  bOk indicates success.
    //  sMsg is an error message for bOk false, or an empty string for bOk true.
    this.GoOffline = function (bOffline) {
        var result = {bOk: true, sMsg: ""};
        if (tileLayer) {
            try {  
                if (bOffline)
                    tileLayer.goOffline();
                else
                    tileLayer.goOnline();
            } catch (ex) {
                result.bOk = false;
                var sOnOffline = bOffline ? "offline." : "online.";
                var exMsg = ex && ex.message ? "<br/>" + ex.message : "";
                result.sMsg = "Exception preparing for using map " + sOnOffline  + exMsg;
            }
        } else {
            result.bOk = false;
            var sOnOffline = bOffline ? "offline." : "online.";
            result.sMsg = "Failed to prepare for using map " + sOnOffline;
        }
        return result;
    };

    // Returns corners for bounding rectangle on screen.
    // Returns: {gptSW: wigo_ws_GeoPt obj for SouthWest corner, gptNE: wigo_ws_GeoPt obj for NorthEast corner}.
    this.GetBounds = function () {
        var bounds = map.getBounds();
        var sw = bounds.getSouthWest();
        var ne = bounds.getNorthEast();
        var corners = { gptSW: new wigo_ws_GeoPt(), gptNE: new wigo_ws_GeoPt() };
        corners.gptSW.lat = sw.lat;
        corners.gptSW.lon = sw.lng;
        corners.gptNE.lat = ne.lat;
        corners.gptNE.lon = ne.lng;
        return corners;
    }

    // Sets map to fit bounds.
    // Args:
    //  gptSW: wigo_ws_GeoPt object for SouthWest corner of boundary rectangle.
    //  gptNE: wigo_ws_GeoPt object for NorthEast corner of boundary rectangle.
    this.FitBounds = function (gptSW, gptNE) {
        var bValid;
        if (gptSW.lat === gptNE.lat || gptSW.lon === gptNE.lon)
            bValid = false;
        else
            bValid = true;
        if (bValid) {
            var sw = L.latLng(gptSW.lat, gptSW.lon);
            var ne = L.latLng(gptNE.lat, gptNE.lon);
            var bounds = L.latLngBounds(sw, ne);
            map.fitBounds(bounds);
        }
    };

    // Returns a reference to underlaying Leaflet map object.
    this.getMap = function () { return map; };

    // Returns word abbreviation for bearing to other destination.
    // Arg:
    //  bearing: float in degrees for compass bearing, 0 .. 360.
    // Returns:
    //  word: string for abbreviation of compass bearing.
    this.BearingWordTo = function (bearing) {
        var bearingword = '';
        if (bearing >= 22 && bearing <= 67) bearingword = 'NE';
        else if (bearing >= 67 && bearing <= 112) bearingword = 'E';
        else if (bearing >= 112 && bearing <= 157) bearingword = 'SE';
        else if (bearing >= 157 && bearing <= 202) bearingword = 'S';
        else if (bearing >= 202 && bearing <= 247) bearingword = 'SW';
        else if (bearing >= 247 && bearing <= 292) bearingword = 'W';
        else if (bearing >= 292 && bearing <= 337) bearingword = 'NW';
        else if (bearing >= 337 || bearing <= 22) bearingword = 'N';
        return bearingword;
    };

    // Distance in meters for changing previous geolocation wrt current geolocation.
    // Note: Parameter for updating prevGeoLocCircle when current location changes.
    this.dPrevGeoLocThres = 10.0;

    // Object for drawing and managing a path for recording separately and independently
    // of the main path on the map.
    // Note: See RecordPath function below for properties of this.recordPath object.
    this.recordPath = new RecordPathMgr(this);


    // Returns ref to div for the map-canvas element.
    // Note: The div element seems to change dynamically. 
    //       Therefore setting a var for document.getElementById('map-canvas') does not work.
    this.getMapCanvas = function() {  
        var mapCanvas = document.getElementById('map-canvas');
        return mapCanvas;
    }
    

    // For debug, a mouse click (touch) on the map can simulate a geolocation.
    // Boolean to indicate mouse clicks are ignored so that this.onMapClick(llAt) 
    // is not called.  this.onMapClick2(e) is always called regardless of state of
    // this.bIgnoreMapClick.
    this.bIgnoreMapClick = true;

    // ** Events fired by map for container (view) to handle.
    // Click on the leaflet map.
    // Only called if this.bIgnoreMapClick is false.
    // Signature of handler:
    //  llAt: Google LatLng object for the click.
    this.onMapClick = function (llAt) { };

    // Second version of leaflet map click handler.
    // This is called for every map click regardless of this.bIgnoreMapClick.
    // Signature of handler:
    //  e: event data for Leaflet onMapClick.
    //      e.latlng: Leaflet LatLng object.
    //      e.layerPoint: Leaflet Point object (x, y) for map layer pixel coordinate.
    //      e.containerPoint: Leaflet Point object (x, y) for map container pixel coordinate.
    //      e.originalEvent: DOMMouseEvent object for original mouse event.
    // Note: Addition of this.onMapClick2(e) is backward compatible with earlier code that only
    // had onMapClick(llAt) available.
    this.onMapClick2 = function (e) { };

    // Show a path on the map due to selection from a path marker.
    // Signature of handler:
    //  sDataIx: string. index of data element for the path to shown.
    this.onShowPath = function(sDataIx) {};  

    // Gets distance for a path.
    // Signature of handler:
    //  sDataIx: string. index of data element for the path to shown.
    //  Returns: {n: number, s: string}:
    //      n: number. total distance of path in meters.
    //      s: string. total distance of path with suffix for units.
    this.onGetPathDistance = function(sDataIx) { return {n: 0, s: "?"};};

    // Event handler for LeafLet click on map.
    function onMapClick(e) {
        // Note: Only fires event for debug. Normally ignores a click.
        if (that.onMapClick && !that.bIgnoreMapClick)
            that.onMapClick(e.latlng);

        // Always do callback for enhance map click. (Callback defaults to a no op.)
        that.onMapClick2(e);  
    }

    // Event handler for zoomend event on map.
    function onMapZoomEnd(e) { 
        if (degCompassHeading !== null) 
            SetCompassHeadingArrow(degCompassHeading);
    }

    // ** More private members

    // Object defining information about path segments.
    // Arg:
    //  path: ref to wigo_ws_GpxPath object.
    function PathSegs(path) {
        // Object for segment of a path.
        function Seg(llStart, llEnd, len) {
            this.len = len;           // length of segment in meters.
            this.dFromStart = 0;      // distance of start of segment from beginning of path.
            this.llStart = llStart; // ref to L.LatLng obj for start of segment.
            this.llEnd = llEnd;   // ref to L.LatLng obj for end of segment.
            this.i = 0; // Index in array of segments.
        }

        // Returns reference to array L.LatLng objs, the path coordinates.
        this.getPathCoords = function () {
            return pathCoords;
        };

        // Starts stepping thru segments of the path.
        // Returns first segment of path and steps to next segment. 
        // Returns null if path segments array is empty.
        this.FirstSeg = function () {
            // If iCurIx > 0, move index back to previous segment because neareast point
            // may still be on the last segment used in the previous search.
            // However, for iCurIx === 0, start search from index 0.
            if (iCurIx > 0)
                DecrementIx();
            iOrgIx = iCurIx;
            var seg = GetCurSeg();
            AdvanceIx();
            return seg;
        };

        // Returns current segment and steps to next segment 
        this.NextSeg = function () {
            var seg = GetCurSeg();
            AdvanceIx();
            return seg;
        };

        // Returns ref to ith path segment, a Seg object.
        // Returns null if i is out of range.
        this.GetSegRef = function (i) {
            var seg = null;
            if (i >= 0 && i < segs.length)
                seg = segs[i];
            return seg;
        };


        // Returns ref to L.LatLng object for ith point in the path.
        this.GetLatLngRef = function (i) {
            var ll = null;
            if (i >= 0 && i < pathCoords.length) {
                ll = pathCoords[i];
            }
            return ll;
        }


        // Returns number of points in path.
        // Note: Number of segments is one less than number of points in path.
        this.getCount = function () {
            return pathCoords.length;
        };

        // Returns numbers segnment in path.
        this.getSegCount = function() {   
            return pathCoords.length-1; 
        }

        // Returns true stepping thru all segments of array has been completed.
        this.IsCycleDone = function () {
            var bDone = iCurIx === iOrgIx;
            return bDone;
        };

        // Steps thru each segment in the array.
        // Arg:
        //  callback with this signature:
        //    seg: Seg object for the segment of a step.
        //    Returns: 
        //      boolean: false to continue to next step, true to break the loop.
        this.ForEachSeg = function (callback) {
            var bBreak = false;
            var seg = this.FirstSeg();
            if (seg && callback)
                bBreak = callback(seg);
            while (!bBreak && !this.IsCycleDone()) {
                seg = this.NextSeg();
                if (callback)
                    bBreak = callback(seg);
            }
        };

        // Initializes this object for path.
        // Arg:
        //  path: ref to wigo_ws_GpxPath object.
        this.Init = function (path) {
            Init(path);
        };

        // Clears this object for no path.
        this.Clear = function () {
            iOrgIx = 0;
            iCurIx = 0;
            dTotal = 0;
            segs.length = 0;
            pathCoords.length = 0;
        }

        // Returns total distance in meters of all segments.
        this.getTotalDistance = function () {
            return dTotal;
        };
        var iOrgIx = 0; // Starting index for starting a cycle stepping thru segs arrays. 
        var iCurIx = 0; // Current index for stepping thru segs array.
        var dTotal = 0; // Total distance of all segments.
        var pathCoords = new Array(); // Array of L.LatLng objs.
        var segs = new Array();  // Array of Seg objs.

        // Advances current index to segment array by 1 (increments).
        function AdvanceIx() {
            iCurIx++;
            if (iCurIx >= segs.length)
                iCurIx = 0;
        }

        // Decreases current index to segment array by 1 (decrements).
        function DecrementIx() {
            iCurIx--;
            if (iCurIx < 0)
                iCurIx = segs.length - 1;
        }

        // Returns ref to current segment. Returns null if segs array is empty.
        function GetCurSeg() {
            var seg;
            if (segs.length > 0)
                seg = segs[iCurIx];
            else
                seg = null;
            return seg;
        }


        // Initializes pathCoords array and segs array.
        // Arg: 
        //  path: ref to wigo_ws_GpxPath object.
        function Init(path) {
            if (!path)
                return; 
            // Fill array of map coords for showing path on a map.
            var gpt;
            var mapCoord;
            pathCoords.length = 0; // Ensure pathCoords is empty before filling.
            for (var i = 0; i < path.arGeoPt.length; i++) {
                gpt = path.arGeoPt[i];
                mapCoord = L.latLng(gpt.lat, gpt.lon);
                pathCoords.push(mapCoord);
            }
            // Fill array of segments for the path.
            var seg;
            iCurIx = 0;
            iOrgIx = 0;
            dTotal = 0;
            segs.length = 0; // Ensure segs array is empty.
            if (pathCoords.length === 1) {
                // Only one point for the path. Unlikely but could happen.
                seg = new Seg(pathCoords[0], pathCoords[0], 0);
                segs.push(seg);
            }
            var llSeg0, llSeg1, dSeg;
            for (var i = 0; i < pathCoords.length-1; i++) {
                llSeg0 = pathCoords[i];
                llSeg1 = pathCoords[i + 1];
                dSeg = llSeg0.distanceTo(llSeg1);
                seg = new Seg(llSeg0, llSeg1, dSeg);
                seg.dFromStart = dTotal;
                seg.i = i;
                segs.push(seg);
                dTotal += seg.len;
            }
        };


        Init(path);
    }

    // Returns true if map is loaded.
    // For false, sets this.sError to indicate map is not loaded.
    function IsMapLoaded() {
        var bYes = map != null;
        return bYes;
    }

    
    var startOfPathShape = null; // L.Polygon for shape for the start of a path. 
    // Clears from map the start of path shape.
    function ClearStartOfPathShape() {
        if (startOfPathShape)
            map.removeLayer(startOfPathShape);
    }

    var endOfPathShape = null;
    // Clears from map the end of path shape.
    function ClearEndOfPathShape() {
        if (endOfPathShape)
            map.removeLayer(endOfPathShape);
    }


    // Helper that calculates and returns array of LatLng objects for line that is a part of a segment.
    // Returns: array of LatLng obj, [llFrom, llTo] where llFrom is llStart, and llTo is end for the part of segment.
    // Args:
    //  llStart: LatLng obj for start of segment.
    //  llEnd: LatLng obj for end of segment.
    //  fraction: number, optional. portion of segment from llStart to llEnd. If undefined, 
    //            llStart to llEnd is returned.
    function CalcAlongSeg(llStart, llEnd, fraction) {
        var arSeg = [];
        if (typeof(fraction) === 'undefined') {
            arSeg.push(llStart);
            arSeg.push(llEnd);
        } else {
            var llDelta = L.latLng(llEnd.lat - llStart.lat, llEnd.lng - llStart.lng);
            llDelta.lat = fraction * llDelta.lat;
            llDelta.lng = fraction * llDelta.lng;
            var llEndPart = L.latLng(llStart.lat + llDelta.lat, llStart.lng + llDelta.lng);
            arSeg.push(llStart);
            arSeg.push(llEndPart);
        }
        return arSeg;
    }

    // Set (draws) shape for start of path beginning of first segment of the path
    // given by curPathSegs var.
    // Remarks:
    // At first tried to draw a triangle for start of trail and a square for end trail using
    // leaflet polygon, but this has problems with scaling because triangle could be way too
    // large for a trail with a small zoom factor. The solution is to draw a partial line segment 
    // overlaying the first and last segment (each a different color) of the trail.  
    function SetStartEndOfPathShape() {

        // Helper that calculates a portion of first line segment.
        // Returns: array of LatLng obj, [llFrom, llTo] where llFrom is llStart of first segment, and 
        //          llTo is end for the part of first segment.
        //  Arg:
        //  mMaxLen: number. maximum number of meters for part returns. if mMaxLen > len of first segment, 
        //           returns part as complete first segment.
        function CalcStartOfPathLine(mMaxLen) {
            var arPart;
            if (curPathSegs.getSegCount() > 0) {
                var seg = curPathSegs.GetSegRef(0);
                if (seg.len > mMaxLen)
                    arPart = CalcAlongSeg(seg.llStart, seg.llEnd, mMaxLen / seg.len);
                else
                    arPart = CalcAlongSeg(seg.llStart, seg.llEnd);
            } else {
                arPart = null;
            }
            return arPart
        }

        // Helper that calculates a portion of last line segment.
        // Returns: array of LatLng obj, [llFrom, llTo] where llFrom is llEnd of last segment, and 
        //          llTo is end for the part of last segment.
        //  Arg:
        //  mMaxLen: number. maximum number of meters for part returned. if mMaxLen > len of last segment, 
        //           returns part as complete last segment.
        function CalcEndOfPathLine(mMaxLen) {
            var arPart;
            var segCount = curPathSegs.getSegCount(); 
            if (segCount > 0) {
                var seg = curPathSegs.GetSegRef(segCount-1);
                if (seg.len > mMaxLen)
                    arPart = CalcAlongSeg(seg.llEnd, seg.llStart, mMaxLen / seg.len);
                else
                    arPart = CalcAlongSeg(seg.llEnd, seg.llStart);
            } else {
                arPart = null;
            }
            return arPart
        }

        // Draw start segment shape.
        var shapeOptions = {
            color: that.color.pathStart,  // stroke (perimeter) color
            weight: 6,    // stroke width in pels for line.
            opacity: 1.0
        };
        var arLatLng = CalcStartOfPathLine(30);  
        if (arLatLng) {
            startOfPathShape = L.polyline(arLatLng, shapeOptions); // first segment of line in different color.
            startOfPathShape.addTo(map);
        }
        // Draw end segment shape.
        shapeOptions.color = that.color.pathEnd;
        arLatLng = CalcEndOfPathLine(30);   
        if (arLatLng) {
            endOfPathShape = L.polyline(arLatLng, shapeOptions); // last segment of line in different color.
            endOfPathShape.addTo(map);
        }        
    }
    

    // Clears from map the geo location circle.
    function ClearGeoLocationCircle() {
        // Remove existing geolocation circle, if there is one, from the map.
        if (geolocCircle)
            map.removeLayer(geolocCircle);    
    }

    var geolocCircle = null;
    // Set (draws) circle on map centered at geo location.
    // Arguments:
    //  latlng is L.LatLng object for center of circle.
    //  r is radius in meters of circle.
    function SetGeoLocationCircle(latlng, r) {
        ClearGeoLocationCircle();
        var circleOptions = {
            color: that.color.locCircle, 
            opacity: 1.0,
            fill: true,
            fillOpacity: 1.0,
            weight: 5
        };
        geolocCircle = L.circle(latlng, r, circleOptions);
        geolocCircle.addTo(map);
    }

    var curLocToPathArrow = null; // Current arrow from location to path drawn on map.
    // Clears from map the current location to geo path arrow.
    function ClearGeoLocationToPathArrow() {
        // Remove existing geolocation to path arrow, if there is one, from the map.
        if (curLocToPathArrow)
            map.removeLayer(curLocToPathArrow);
    }

    // Draws arrow for a location off geo path to point on geo path (the trail).
    // Arg:
    //  location: Map L.LatLng object for location on map.
    //  llAt: L.LatLng obj for location on the geo path.
    // Remarks:
    // Actually draws facsimile of an arrow using a line with a rounded end.
    // The line is between any two points, but the purpose is likely to draw the 
    // line from a point off the geo path to a point on the geo path.
    function DrawGeoLocToPathArrow(location, llAt) {
        ClearGeoLocationToPathArrow();

        var mapCoords = [location, llAt];
        var options = {
            color: that.color.toPath, 
            lineCap: 'butt',  /* in place of an arrow */
            weight: 5,
            opacity: 1.0
        }
        var mapPath = L.polyline(mapCoords, options)
        mapPath.addTo(map);
        // Note: Leaflet has no easy way to put arrow on polylines.
        // Save ref to the current path.
        curLocToPathArrow = mapPath;
    }

    var prevGeoLoc = null;       // geolocation of previous geolocation update. 
    var prevGeoLocCircle = null; // L.Circle object for previous geolocation.
    var prevGeoLocRefLine = null;// L.Polyline object for reference line though geolocCircle and preGeoLocCircle.
    
    // Clears from map the previous geo location reference line.
    function ClearPrevGeoLocRefLine() {
        if (prevGeoLocCircle)
            map.removeLayer(prevGeoLocCircle);
        if (prevGeoLocRefLine)
            map.removeLayer(prevGeoLocRefLine);
    }

    // Sets (draws) reference line through prevGeoLocCircle and (current) geolocCircle.
    // Also draws the previous geolocation circle.
    // Arg:
    //  location: Map L.LatLng object for previous location on map.
    //  r: integer for radius of previous location circle in pixels.
    // Returns bearing (y-North cw in degrees) of reference line.
    function SetPrevGeoLocRefLine(prevLocation, r) {
        ClearPrevGeoLocRefLine();
        // Current geolocCircle must exist.
        if (!geolocCircle)
            return 0.0;
        // Draw circle for previous geolocation.
        var circleOptions = {
            color: that.color.prevLocCircle, 
            opacity: 1.0,
            fill: true,
            fillOpacity: 1.0,
            weight: 5
        };
        prevGeoLocCircle = L.circle(prevLocation, r, circleOptions);
        prevGeoLocCircle.addTo(map);

        // Draw thin reference line from previous geolocation thru current geolocation.
        var llTo = geolocCircle.getLatLng();
        var dest = ExtendLine(prevLocation, llTo, 30); // Extend end point of reference line by 30 meters.
        var mapCoords = [prevLocation, dest.at];
        var options = {
            color: that.color.refLine, 
            weight: 2,
            opacity: 1.0
        }
        prevGeoLocRefLine = L.polyline(mapCoords, options)
        prevGeoLocRefLine.addTo(map);
        return dest.bearing;
    }
    
    
    var compassHeadingArrow = null; // L.Polygon obj for compass heading arrow.
    
    // Clears from map the compass heading arrow.
    function ClearCompassHeadingArrow() {
        degCompassHeading = null;  
        if (compassHeadingArrow)
            map.removeLayer(compassHeadingArrow);
        
    }
    // Sets (draws) compass heading arrow for current location.
    // Arg:
    //  degHeading: float for heading angle in degrees, cw wrt North.
    // Remarks: If this.SetCompassArrowVisible(false) has been called,
    // then the compass arrow is only cleered but not drawn.
    // This function always clears the compass arrow from the map.
    function SetCompassHeadingArrow(degHeading) {
        ClearCompassHeadingArrow();
        if (!bCompassHeadingVisible)
            return;
        
        // Helper to calculate latlng for tip of arrow from current geo location.
        // Arg: 
        //  llArrowBase: LatLng obj for base of the arrow.
        //  degPhi: number for heading in degrees.
        //  pelsR: number, radius of tip measured from base in pixels.
        // Return LatLng obj for calculated tip. Returns null if the 
        // geolocCircle object does not exist.
        // Note: Length in pixels of base of arrow to its tip is given by the 
        //       constant pelsCompassHeadingArrowLength.
        function CalcArrowTip(llArrowBase, degPhi, pelsR) {
            // Get map screen point for base of arrow at current geo location circle.
            var ptArrowBase =  map.project(llArrowBase);
            
            // Calculate point in pixels on the map for tip from degPhi.
            // Note: angle for rt triangle for x, y is 90 degree - degPhi.
            //       So use sin() to calc x, and cos() to calc y. 
            // Note: degTheta = 90.0 - degPhi, angle for std trig unit circle.
            //       yMap = -YTrig, Y axis on map is negative yTrig axis. 
            var theta = (90.0 - degPhi) * L.LatLng.DEG_TO_RAD;
            var x = pelsR * Math.cos(theta);
            var y = - pelsR * Math.sin(theta);
            var ptTip = L.point(x, y);
            var ptArrowTip = ptTip.add(ptArrowBase);
            var llArrowTip = map.unproject(ptArrowTip);
            return llArrowTip;
        }
        
        
        // Calcuates and returns array of LatLng objs for points in a polygon for the arrow.
        function CalcArrowPolygon() {
            if (! geolocCircle) 
                return null;
            var pelsCompassHeadingArrowLength = 50; // Constant for length of compass heading arrow in pixels.
            var degTipOffset = 10.0; // Number of degrees to offset side of tip.
            var arLatLng = [];
            var llArrowBase = geolocCircle.getLatLng(); // Arrow base.
            arLatLng.push(llArrowBase);
            var pelsSideLen = 0.7 * pelsCompassHeadingArrowLength;
            var llTip  = CalcArrowTip(llArrowBase, degHeading - degTipOffset, pelsSideLen); // Left side of tip.
            arLatLng.push(llTip);
            llTip = CalcArrowTip(llArrowBase, degHeading, pelsCompassHeadingArrowLength); // Tip.
            arLatLng.push(llTip);
            llTip = CalcArrowTip(llArrowBase, degHeading + degTipOffset, pelsSideLen); // Right side of tip.
            arLatLng.push(llTip);
            return arLatLng;
        }
        
        degCompassHeading = degHeading; // Save compass heading. 
        var arrowOptions = {
            color: that.color.compassHeadingArrow,
            fill: true,
            fillOpacity: 1.0
        };
        var arLatLng = CalcArrowPolygon();
        if (arLatLng) {
            compassHeadingArrow = L.polygon(arLatLng, arrowOptions);
            compassHeadingArrow.addTo(map);
        }
    }
    var degCompassHeading = null; // Saved heading for compass arrow.
    

    // Determines heading of line and extends line by a given delta.
    // Args:
    //  llFrom: L.LatLng object for from geolocation.
    //  llTo: L.LatLng for to geolocation.
    //  delta: float for number of meters to extend line in direction of bearing
    //         beyond llTo.
    //         Currently delta is ignored. Works pretty good without extending line.
    // Returns object {at: L.LatLng, bearing: float}:
    //  at is lat/lng of end point of extended line.
    //  bearing (cc wrt North) is in degrees for the extended line.
    function ExtendLine(llFrom, llTo, delta) {
        var dest = { at: L.latLng(llTo.lat, llTo.lng), bearing: 0 };
        dest.bearing = llFrom.bearingTo(llTo);
        return dest;
        /* // Maybe change later. Extension is not correct. Works pretty good without extension.
        // Convert angle from degrees to radian and translate
        // from bearing of y-North cw to Y-North ccw to be
        // consistent with trig unit circle.
        var theta = (90.0 - dest.bearing) * L.LatLng.DEG_TO_RAD;
        var deltaLat = delta * Math.cos(theta);
        var deltaLng = delta * Math.sin(theta);
        //Oops deltaLat, deltaLng above are meters, need to convert to degrees. Haversine functions probably have this.
        //This following would work but have not tried yet:
        //      From s = r * theta for arc of circle.
        //      R is radius of earth.
        //      deltaLng = (deltaLng as s) / R.
        //      r at latitude = R*cos(Lng).
        //      deltaLat = (deltaLat as s) / (R*cos(Lng).
        dest.at.lat  += deltaLat;
        dest.at.lng += deltaLng;
        return dest;
        */
    }

    var touchCircle = null; // L.Circle obj for point touched on map.
    // Clears from map the touch point circle.
    function ClearTouchCircle() {
        // Remove existing geolocation circle, if there is one, from the map.
        if (touchCircle)
            map.removeLayer(touchCircle);
    }

    // Set (draws) circle on map centered at touch point.
    // Arguments:
    //  latlng is L.LatLng object for center of circle.
    //  r is radius in meters of circle.
    function SetTouchCircle(latlng, r) {
        ClearTouchCircle();
        var circleOptions = {
            color: that.color.touchCircle, 
            opacity: 1.0,
            fill: true,
            fillOpacity: 1.0,
            weight: 5
        };
        touchCircle = L.circle(latlng, r, circleOptions);
        touchCircle.addTo(map);
    }

    var editSegment = null; // L.PolyLine object for edit segment overlay.

    // Clears the edit line segment overlay.
    function ClearEditSegment() {
        if (editSegment) {
            map.removeLayer(editSegment);
            editSegment = null;
        }
    }

    // Sets the edit line segment to indicate where an edited point
    // would be in the path.
    // Args:
    //  gptTo: wigo_ws_GeoPt obj for new location of the edited point.
    //  ix: index in curPath of the point being edited.
    //  bMove: boolean. true indicates point is being moved. false indicates point is being inserted.
    function SetEditSegment(gptTo, ix, bMove) {
        ClearTouchCircle(); 
        ClearEditSegment();
        var ll0 = null; // ref to L.LatLng obj for point before gptTo, first point in the edit segment.
        var ll1 = L.latLng(gptTo.lat, gptTo.lon); // L.LatLng obj for middle point edit segment.
        var ll2 = null; // ref to L.LatLng obj for last point in the edit segment.
        
        if (ix < 0 || ix >= curPathSegs.getCount()) 
                return; // Not expected to happen. ix is out of range.
        if (!gptTo)
            return; // Not expected to happen. Edit point is invalid.

        // Get ref to ll0, first point in edit segment.
        ll0 = curPathSegs.GetLatLngRef(ix - 1);

        // Note: ll1, the midde point in the edit segment, is gptTo.
        // Get ref to ll2, last point in the edit segment.
        if (bMove) {
            ll2 = curPathSegs.GetLatLngRef(ix + 1);
        } else {
            // Inserting point.
            ll2 = curPathSegs.GetLatLngRef(ix);
        }

        var segCoords = [];
        if (ll2)
            segCoords.push(ll2);
        if (ll1)
            segCoords.push(ll1);

        if (ll0)
            segCoords.push(ll0);

        if (segCoords.length > 0) {
            editSegment = L.polyline(segCoords, { color: that.color.editSegment, opacity: 1.0 });
            editSegment.addTo(map);
            that.DrawTouchPt(gptTo);
        }
    }

    var eraseSegment = null; // L.PolyLine object for erase segment of editing overlay.

    // Clears the eraseSegment overlay.
    function ClearEraseSegment() {
        if (eraseSegment) {
            map.removeLayer(eraseSegment);
            eraseSegment = null;
        }
    }

    // Sets the edit line segment to indicate where a point is to be appended to the path.
    // Arg:
    //  gptTo: wigo_ws_GeoPt object of point to be appended.
    function SetAppendSegment(gptTo) {
        ClearTouchCircle();
        ClearEditSegment();
        var ll0 = null; // ref to L.LatLng obj for point before gptTo, first point in the edit segment.
        var ll1 = L.latLng(gptTo.lat, gptTo.lon); // L.LatLng obj for middle point edit segment.

        var ix = curPathSegs.getCount() - 1;

        if (ix < 0) {
            // Path is empty. Draw gptTo as the touch point.
            that.DrawTouchPt(gptTo);
        } else { 
            // Get ref to ll0, first point in edit segment.
            ll0 = curPathSegs.GetLatLngRef(ix); // Last point in the path.

            var segCoords = [];
            if (ll1)
                segCoords.push(ll1);

            if (ll0)
                segCoords.push(ll0);

            if (segCoords.length > 0) {
                editSegment = L.polyline(segCoords, { color: that.color.editSegment, opacity: 1.0 });
                editSegment.addTo(map);
                that.DrawTouchPt(gptTo);
            }

        }


    }

    // Sets the edit line segment to indicate where a point is to be deleted in the path.
    // Note: the edit line segment is draw between the previous point and the next point
    //       in the path wrt the point being deleted.
    // Args:
    //  ix: index in curPath of the point being deleted.
    function SetDeleteSegment(ix) {
        ClearTouchCircle();
        ClearEditSegment();

        if (ix < 0 || ix >= curPathSegs.getCount())
            return; // Not expected to happen. ix is out of range.

        var ll0 = curPathSegs.GetLatLngRef(ix - 1);
        var ll1 = curPathSegs.GetLatLngRef(ix + 1);

        var segCoords = [];
        if (ll1)
            segCoords.push(ll1);

        if (ll0)
            segCoords.push(ll0);

        if (segCoords.length > 1) {
            editSegment = L.polyline(segCoords, { color: that.color.editSegment, opacity: 1.0 });
            editSegment.addTo(map);
        }

        that.DrawEditPt(ix); 
    }

    // Sets the erase line segment to indicate where an edited point
    // is erased in the path.
    // Args:
    //  ix: index in curPath of the point being edited.
    //  bMove: boolean. true indicates point is being moved. false indicates point is being inserted.
    function SetEraseSegment(ix, bMove) {
        ClearEraseSegment();

        if (ix < 0 || ix >= curPathSegs.getCount())
            return; // Not expected to happen. ix is out of range.

        var ll0 = null; // ref to L.LatLng obj before edit pt in path, first point in the erase segment.
        var ll1 = curPathSegs.GetLatLngRef(ix); // L.LatLng obj for edit pt in path, middle point the erase segment.
        var ll2 = null; // ref to L.LatLng obj for last point in the erase segment.

        if (!ll1)
            return; // Not expected to happen. ix is invalid for the path.

        // Get ref to ll0, first point in edit segment.
        ll0 = curPathSegs.GetLatLngRef(ix - 1);

        // Note: ll1, the midde point in the edit segment, is gptTo.
        // Get ref to ll2, last point in the edit segment.
        if (bMove) {
            // Moving an existing point.
            ll2 = curPathSegs.GetLatLngRef(ix + 1);
        }

        var segCoords = [];
        if (ll2)
            segCoords.push(ll2);
        if (ll1)
            segCoords.push(ll1);

        if (ll0)
            segCoords.push(ll0);

        if (segCoords.length > 0) {
            eraseSegment = L.polyline(segCoords, { color: that.color.eraseSegment, opacity: 1.0 });
            eraseSegment.addTo(map);
        }
    }


    var editCircle = null; // L.Circle obj for point on path being edited.
    // Clears from map the touch point circle.
    function ClearEditCircle() {
        // Remove existing geolocation circle, if there is one, from the map.
        if (editCircle)
            map.removeLayer(editCircle);
    }

    // Set (draws) circle on map centered at edit point on the path.
    // Arguments:
    //  latlng is L.LatLng object for center of circle.
    //  r is radius in meters of circle.
    function SetEditCircle(latlng, r) {
        ClearTouchCircle();
        ClearEditCircle();
        var circleOptions = {
            color: that.color.editCircle,
            opacity: 1.0,
            fill: true,
            fillOpacity: 1.0,
            weight: 5
        };
        editCircle = L.circle(latlng, r, circleOptions);
        editCircle.addTo(map);
    }

    // Returns true if corners are set to define a boundary.
    // Arg:
    //  path: wigo_ws_GpxPath containing path to check for valid boundary.
    function IsBoundaryValid(path) {
        var bValid;
        if (path.gptSW.lat === path.gptNE.lat || path.gptSW.lon === path.gptNE.lon)
            bValid = false;
        else
            bValid = true;
        return bValid;
    };

    
    // Returns true if path is for areas of a single point.
    // Arg:
    //  path: wigo_ws_GpxPath containing path to check.
    // Note: true iff path.arGeoPt has length 2 and element 0 equals element 1..
    function IsSinglePointArea(path) {  
        var bYes = path.arGeoPt.length === 2;
        if (bYes) {
            var el0 = path.arGeoPt[0];
            var el1 = path.arGeoPt[1];
            bYes = el0.lat === el1.lat && el0.lon === el1.lon; 
        }
        return bYes;
    }
    

    // Note: See SVN tags/20150915 for simpler pervious version that did not
    //       try to account for overlapping segments in the path.

    // Searchs through all segments of curPath to find shortest distance
    // to the path from a location off the path.
    // Returns {llAt: L.LatLng, d: float, dFromStart: float, dToEnd: float}:
    //  llAt is lat/lng of nearest geo point found on the path. null if not found.
    //  d is distance in meters to nearest point on the path.
    //  dFromStart is array of distances in meters over the path from start to llAt.
    //  dToEnd is array of distance in meters over the path from llAt to the end. 
    //  Note: Typically dFromStart and dToEnd are arrays of length 1. However if
    //        overlapping segments of path have the same llAt (location) on the path,
    //        the arrays provide distances for each overlapping segment.
    // Arg: 
    //      llLoc: Map L.LatLng object for location for which search is done.
    function FindNearestPointOnGeoPath(llLoc, dOffPath) {
        var updater = new NearestLocUpdater(dOffPath);
        curPathSegs.ForEachSeg(function (seg) {
            var bUpdated = updater.Update(llLoc, seg);
            //BreakOnFirstOnPath var bBreak = bUpdated && updater.arOnPath.length > 0;
            var bBreak = false; 
            return bBreak;
        });
        updater.Sort();

        var arNearLoc = new Array();
        if (updater.arOnPath.length > 0) {
            arNearLoc = updater.arOnPath;
        } else if (updater.arOffPath.length > 0)
            arNearLoc = updater.arOffPath;
        var dTotal = curPathSegs.getTotalDistance();
        var arDtoAt = new Array();
        var arDtoEnd = new Array();
        var minD = 0;
        var llFound = null;
        if (arNearLoc.length > 0) {
            for (var i = 0; i < arNearLoc.length; i++) {
                arDtoAt.push(arNearLoc[i].dFromStart);
                arDtoEnd.push(dTotal - arNearLoc[i].dFromStart);
            }
            minD = arNearLoc[0].dToPath;
            llFound = arNearLoc[0].llAtPath;
        }
        var found = { llAt: llFound, d: minD, dFromStart: arDtoAt, dToEnd: arDtoEnd };
        return found;
    }

    // Helper object for finding nearest location to the path.
    // Constructor arg:
    //  dOffPath: float for threshold for distance from path for which
    //      a location is considered off the path.
    function NearestLocUpdater(dOffPath) {
        // Object for location info for keeping track of nearest location to path.
        function Loc(llAt, llAtPath) {
            // ref to L.LatLng obj of geo location.
            this.llAt = llAt;
            // Distance llAt is from path.
            this.dToPath = 0.0;
            // Ref to L.LatLng obj for geo location on the path.
            this.llAtPath = llAtPath;
            // Distance for llAtPath from start of path.
            this.dFromStart = 0.0;
            
            // Ref to segment of path. Added for debugging.
            this.seg = null;
            // Ref to result used to create current Loc object. Added for debugging.
            this.result = null; 
        }

        // Updates nearest location to a path.
        // Returns true if nearest location is updated; 
        //   false if not updated because not a nearer location.
        //   this.onPath or this.arOffPath is updated when true is returned.
        // Argument:
        //  llLoc: L.LatLng obj for location to check for nearest to path.
        //  seg: Seg object for element of a path for updating nearest location 
        this.Update = function (llLoc, seg) {
            // Helper function to calculate distance from start of path for a segment.
            // Returns distance in meters from start of the path.
            // Args
            //  result: Object for result from LocationToSegment(..).
            function DistanceFromStart(result) {
                var dToAt = seg.dFromStart;
                if (result.dOnSeg > 0 && result.dOnSeg <= result.dSeg) {
                    dToAt += result.dOnSeg; // llLoc projected onto segment.
                } else if (result.dOnSeg > result.dSeg)
                    dToAt += result.dSeg;   // llLoc projected beyond end of segment.
                return dToAt;
            }

            // Helper that returns a new Loc object for the location to the path.
            // Arg:
            //  result: Object for result from LocationToSegment(..).
            function NewLoc(result) {
                var curLoc = new Loc(llLoc, result.at);
                curLoc.dFromStart = DistanceFromStart(result);
                curLoc.dToPath = result.d;
                curLoc.seg = seg;         // For debug
                curLoc.result = result;   // For debug
                return curLoc;
            }

            // Helper to check that to L.LatLng objects have close to the same value.
            // Returns true if llA and llB are close to the same.
            // Args:
            //  llA, ll: L.LatLng objects to compare.
            function IsSameLatLng(llA, llB) {
                var dDif = llA.distanceTo(llB);
                var bSame = dDif > -thresD && dDif < thresD;
                return bSame;
            }

            // Helper to compares two distances to see if they are the same within a threshold, threshD.
            // Returns true if distances are close to the same.
            // Args: dA, dB: float for distances to compare.
            function IsSameDistance(dA, dB) {
                var dDif = dA - dB;
                var bSame = dDif > -thresD && dDif < thresD;
                return bSame;
            }

            // Helper to determine if result from LocationToSegment(..) should be append to path array.
            // Returns true for append.
            // Args:
            //   result: object from LocationToSegment(..).
            //   arPath: Array of Loc objects. Either this.arOnPath or this.arOffPath.
            // Note: If the segments overlap, the projected location onto the path should be
            //       the same. The important difference is the distance from the starting
            //       point of the path.
            //       If the segments do not overlap, but the distance to the path is the same 
            //       (unlikely, but possible), the projected location on the path 
            //       should differ greatly. Only one arrow back to the path should be drawn. 
            //       Therefore only append to arOn/OffPath if the projected location onto the path
            //       is the same, and the distances from the beginning of the path are different.
            //       Checking for both the same Lat/Lng on the path and not the same distance
            //       from beginning of the path gives best result. Either check by itself
            //       may not be sufficient.
            function IsAppend(result, arPath) {
                var bAppend = IsSameLatLng(result.at, arPath[0].llAtPath);
                if (bAppend) {
                    var dFromStart = DistanceFromStart(result);
                    bAppend = !IsSameDistance(dFromStart, arPath[0].dFromStart);
                }
                return bAppend;
            }

            var result = LocationToSegment(llLoc, seg.llStart, seg.llEnd);
            var bUpdated = false;
            if (result.d < dOffPath) {
                var bAppend = this.arOnPath.length === 0;
                if (!bAppend) {
                    // Append if llLoc projects to same point on overlapping segments.
                    bAppend = IsAppend(result, this.arOnPath);

                    if (!bAppend) {
                        // Replace current locatio if nearer.
                        if (result.d < this.arOnPath[0].dToPath) {
                            var curNearestLoc = NewLoc(result);
                            this.arOnPath[0] = curNearestLoc;
                            bUpdated = true;
                        }
                    }
                }
                if (bAppend) {
                    var curNearestLoc = NewLoc(result);
                    this.arOnPath.push(curNearestLoc);
                    bUpdated = true;
                }
                // Clear off path location list.
                this.arOffPath.length = 0;
            } else if (this.arOnPath.length === 0) {
                // There is no on-path location, so check for nearest location off path.
                if (minD === null || (result.d < minD - thresD)) {
                    // llLoc is a new min distance from path.
                    // Set current nearest location to path.
                    minD = result.d;
                    var curNearestLoc = NewLoc(result);
                    // Reset length of nearest off path location list because nearer location was found.
                    this.arOffPath.length = 0;
                    this.arOffPath.push(curNearestLoc);
                    bUpdated = true;
                } else if (result.d > minD + thresD) {
                    // llLoc is not a nearer distance from the path.
                    bUpdated = false;
                } else {
                    // llLoc is same distance to path as some other location.
                    // This happens when segments of the path overlap.
                    // Check if result.at on the path is same as projected, current on path location.
                    // Note: this.arOffPath.length should be > 0. However, check for safety.
                    var bAppend = this.arOffPath.length === 0;
                    if (!bAppend) {
                        // Append if llLoc projects to same point on overlapping segments.
                        bAppend = IsAppend(result, this.arOffPath);
                    }

                    if (bAppend) {
                        var curNearestLoc = NewLoc(result);
                        this.arOffPath.push(curNearestLoc);
                        bUpdated = true;
                    }
                }
            }
            return bUpdated;
        };

        // Sorts the resulting this.arOnPath and this.arOffPath lists by 
        // distance from the start of the path.
        // Note: Typically the lists only have 0, 1, or 2 elements. 
        this.Sort = function () {
            // Helper to sort array of Loc objects by distance from start.
            function sort(ar) {
                if (ar.length > 1)
                    ar.sort(function (a, b) {
                        var i;
                        if (a.dFromStart < b.dFromStart)
                            i = -1;
                        else if (a.dFromStart > b.dFromStart)
                            i = +1;
                        else
                            i = 0;
                        return i;
                    });
            }

            sort(this.arOnPath);
            sort(this.arOffPath);
        };

        // List of Loc objects that are on path.
        // this.Update(loc, seg) fills this list.
        // Typically only one element. However, if path segments
        // overlap, there could be more than one element.
        this.arOnPath = new Array();

        // List Loc objects that are nearest to the path.
        // this.Update(loc, seg) fills this list.
        // Typically there is only one element. However, if path segments 
        // overlap, there could be more than one element.
        this.arOffPath = new Array();

        var minD = null; // Keeps track of current min distance to trail.

        var thresD = 2; // Threshold in meters for comparison of two distances to 

    }

    // Calculates distance from a location point to a line segment.
    // Returns literal object:
    //  d: floating point number for distance to path in meters.
    //  at: L.LatLng object for point on the segment.
    //  dSeg: floating point number for distance (length) of the segment in meters.
    //  dOnSeg: floating point number for portion of path in meters that llAt
    //          is of dSeg. If less than 0, llLoc projected to before start of path.
    //          if greater than dSeg, llLoc projected beyond end of segment.
    // Args:
    //  llLoc: L.LatLng object for location.
    //  llSeg0: L.LatLng object for starting point of segment.
    //  llSeg1: L.LatLng object for ending point of segment.
    function LocationToSegment(llLoc, llSeg0, llSeg1) {
        var hdLoc = llSeg0.bearingTo(llLoc);
        var dLoc = llSeg0.distanceTo(llLoc);
        var hdSeg = llSeg0.bearingTo(llSeg1);
        var dSeg = llSeg0.distanceTo(llSeg1);

        // Calc angle phi between heading hdLoc and heading hdSeg.
        var phi = hdSeg - hdLoc;
        if (phi < 0)
            phi = -phi;
        phi = phi * L.LatLng.DEG_TO_RAD;  // Convert degrees to radians.

        // I think simple planar geometry approx for interpolation should be good enough.
        var llAt = L.latLng(0, 0);
        var dOnSeg = dLoc * Math.cos(phi);
        if (dOnSeg < 0.0) {
            // Vector location projects before starting point of segment, so
            // truncate to starting point of the segment.
            llAt = llSeg0;
        } else if (dOnSeg > dSeg) {
            // Vector to location point projects beyond segment, so truncate 
            // to segment end point.
            llAt = llSeg1;
        } else {
            // Vector to location point projects onto segment.
            var fraction = dOnSeg / dSeg;
            var delLng = fraction * (llSeg1.lng - llSeg0.lng);
            var delLat = fraction * (llSeg1.lat - llSeg0.lat);
            llAt.lng = llSeg0.lng + delLng;
            llAt.lat = llSeg0.lat + delLat;
        }

        // Calculate distance from location to path.
        var dToPath = llLoc.distanceTo(llAt);
        var result = { d: dToPath, at: llAt, dSeg: dSeg, dOnSeg: dOnSeg};
        return result;
    }

    // ** More Private members related to caching map tiles.
    var CACHE_ZOOM_MAX = 16;
    var TILES_TO_DOWNLOAD_MAX = 400; // Maxiumum number of tiles in a download list.

    // Creates a new L.TileLayer.Cordova object that can cache map tiles for trails.
    // The object is used for caching map tiles.
    // Arg:
    //  callback: callback called asynchronously to indicate result. 
    //      callback may be null or undefined. Signature of callback:
    //          layer: the L.TileLayer.Cordova object for caching map tiles.
    //              layer is null if it cannot be created.
    //          sMsg: string for a message. Is an error message when layer is null.
    // Note: This function retries and should return after successfully creating L.tileLayerCordova,
    //       which can cache (write) map sections to local storage.
    //       For some reason I cannot fathom, a retry is needed because first attempt to create
    //       L.tileLayerCordova also fails. The function should return after the first successful
    //       retry, but instead it only returns after the max retry count. 
    //       A max retry of 1 with a retry wait of 500ms seems to work. 
    //       One would think that a return of 3 would return successfully after the first retry,
    //       but not so. The return also occurs after the max retry count.
    function NewTileLayer(callback) {
        var layer = null;
        var sMsg = "";
        var bOk = false;
        var msRetryWait = 500; // Milliseconds to wait before retrying. 
        var nTries = 8; // Number of tries. 
        var iTry = 0;
        var timerId = null;

        // Local helper function to NewTileLayer(callback).
        function CreateTileLayer() {
            // Note: Do not use let for local version of layer. Not compatible with older android os like on Galaxy S3.
            layer = null;  
            try {
                console.log("Creating L.TileLayer");
                if (bTileCaching) {
                    // base URI template for tiles: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png' // use https ... openstreetmap instead of http ... osm
                    // May want to get mapbox account to get better map tiles.
                    // Can get elevation thru mapbox api which would be useful.
                    layer = L.tileLayerCordova('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
                        // these options are perfectly ordinary L.TileLayer options
                        maxZoom: 18,
                        attribution: 'Map data &copy; <a href="http://osm.org">OpenStreetMap</a> contributors, ' +
                                        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
                        // these are specific to L.TileLayer.Cordova and mostly specify where to store the tiles on disk
                        folder: 'WigoWsGeoTrail',
                        name: 'Trail',
                        debug: true
                    });

                    /* //20150822 Original URI template for mapbox tiles, which used to work but no longer.
                                  Requires mapbox access in order to get public access token.
                                  Developer license for 50K map views per month is free, which may be a good 
                                  option. Looks like there is api to get elevation, which might be useful.
                    layer = L.tileLayerCordova('https://{s}.tiles.mapbox.com/v3/examples.map-i875mjb7/{z}/{x}/{y}.png', {
                        // these options are perfectly ordinary L.TileLayer options
                        maxZoom: 18,
                        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                                        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                                        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
                        // these are specific to L.TileLayer.Cordova and mostly specify where to store the tiles on disk
                        folder: 'WigoWsGeoTrail',
                        name: 'Trail',
                        debug: true
                    });
                    */

                } else {
                    // Create regular OpenStreetMap tile layer without title caching.
                    layer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {   
                        opacity: 0.30, 
                        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    });
                }

                bOk = layer !== null && typeof layer !== 'undefined';
                if (bOk) {
                    sMsg = "TileLayer created on try {0}.".format(iTry+1);
                } else {
                    sMsg = "FAILED to create TileLayer on try {0}.".format(iTry+1);
                }
            } catch (e) {
                console.log(e ? e : "Exception creating L.TileLayer");                
                sMsg = "FAILED to create TileLayer on try {0}.".format(iTry+1);
                bOk = false;
                layer = null;
            }
        }

        // Local helper function to test writing to device storage.
        // Does callback(layer, sMsg) upon completion.
        // bOfflineDataEnabled is set to indicate if write test passed.
        function TestFileWrite() {
            var testFileEntry; // FileEntry obj save when creating wigo_test.txt.
            // Local helper to end after write test fails.
            function WriteTestFailed(error) {
                    // Note: Write test failed, but layer is ok.
                    if (error && error.code)
                        console.log("Storage Write Test Failed: " + error.code)
                    if (callback)
                        callback(layer, sMsg);
            }

            // Local helper to write the wigo_test.txt file.
            function GotFileWriter(writer) {
                // Set event handlers for writer object.
                writer.onwrite = function(evt) {
                    // Write test succeeded.
                    bOfflineDataEnabled = true;
                    if (testFileEntry) {
                        // Remove the test file for tidiness.
                        testFileEntry.remove(
                        function(entry) { // Callback called on success.
                            console.log("Successfully removed test tile.");
                        },
                        function(error){ // Callback called on error.
                            console.log("Error removing test tile: " + error.code);
                        });
                    }
                    // Note: Ignore if remove file fails. Do callback(layer, sMsg) immediately regardless.
                    if (callback)
                        callback(layer, sMsg);
                };
                writer.onerror = function(evt) {
                    WriteTestFailed(writer.error);
                };
                // Write text to the file.
                writer.write("temp file to delete.");
            }

            // Ensure initialed to test failed. Set to true later on success.
            bOfflineDataEnabled = false;

            // Start the write test by creating file to write.
            layer.dirhandle.getFile("wigo_test.txt", {create: true, exclusive: false},
            // Callback called on success for creating wigo_test.txt.
            function(fileEntry){
                // Create objec to write the file that has been successfully created.
                testFileEntry = fileEntry; // Save to use later to remove file.
                fileEntry.createWriter(GotFileWriter, WriteTestFailed);
            },
            // Callback called on error creating wigo_test.txt.
            WriteTestFailed);
        }

        // First try to create tile layer. Also wait until dirhandle is initialed for filesystem.
        // Will retry on failure.
        bOfflineDataEnabled = false; // Set to true later if filesystem allows data storage usage.
        CreateTileLayer(); 
        if (bOk && layer.dirhandle) {  
            // TestFileWrite(); // TestFileWrite() will do callback(layer, sMsg).
            // TestFileWrite() may fails initially even though writing to local storage is allowed.
            // Now that an error is detected for writing cached files by L.TileLayer, TestFileWrite() is not needed
            // and is causing confusion when it fails when it should not. 
            OfflineDataEnabled = true; 
            if (callback)
                callback(layer, sMsg); 
        } else { 
            // Note: Need to retry because either layer was not created or layer.dirhandle was not created yet.
            timerId = window.setInterval(function () {
                if (iTry < nTries) {
                    iTry++;
                    // Check if dirhandle has been creaated after waiting.
                    if (bOk && layer.dirhandle) {  
                        window.clearInterval(timerId); // Stop timer.
                        if (callback)
                            callback(layer, sMsg);
                        return;
                    }
                    // Try to create tile layer again.
                    CreateTileLayer();  
                } else {
                    // Failed after nTries, so quit trying.
                    window.clearInterval(timerId); // Stop timer.
                    var sPrefix;
                    if (bOk) {
                        sPrefix = "Created TileLayer";
                        if (!layer.dirhandle)
                            sPrefix += ", but failed to create dirhandle";
                    } else {
                        sPrefix = "FAILED to created TileLayer";
                    }
                    sMsg = "{0} after {1} (max) tries.".format(sPrefix, iTry); 
                    if (callback)
                        callback(layer, sMsg);
                }
            },
            msRetryWait);
        }
    }

    // Caches a layer of map tiles locally to the device.
    // Args
    //  layer: L.TileLayer.Cordova of the layer to cache.
    //  onStatusUpdate: callback for status update. Maybe null. callback signature:
    //    arg object {sMsg: string, bDone: boolean, bError: boolean}: 
    //      sMsg: Status msg.
    //      bDone: Indicates done, no more callbacks.
    //      bError: Indicates an error.
    //      bCancel: Indicates user canceled when asked to confirm download.
    // Returns:
    //  boolean, true indicates success. Return is immediate but download of tiles is
    //  asynchronous. onStatusUpdate(arg) is called (repeatedly) to update download progress 
    //  asynchronously.
    function CacheLayer(onStatusUpdate) {
        var status = { sMsg: "", bDone: false, bError: false, bCancel: false };
        if (!map || !tileLayer) {
            status.sMsg = "Map is not loaded yet.";
            status.bError = true;
            status.bDone = true;
            if (onStatusUpdate)
                onStatusUpdate(status);
            return false; // Quit if map does not exist yet.
        }

        var message;
        if (!tileLayer.dirhandle) {
            message = "Writing to device storage is not allowed.\n" +
                      "Enable permissions to use storage in device settings for you app.";
            alert(message);
            status.bDone = true;
            status.bError = true;
            status.sMsg = "Permissions to write to device storage is not enabled.";
            if (onStatusUpdate)
                onStatusUpdate(status);
            return false;
        }

        var padPercent = 20.0; // Percentage on each side of current map view to 
                               // extend boundaries for caching tiles.
        var lat = map.getCenter().lat;
        var lng = map.getCenter().lng;
        var zmin = map.getZoom();
        var zmax = CACHE_ZOOM_MAX;
        if (zmax < zmin)  
            zmax = zmin;  
        var bounds = map.getBounds();
        bounds.pad(padPercent);
        // Limit zoom if tile_list is too large
        var bTileListDone = false;
        var tile_list;
        do {
            if (zmax < zmin)  
                zmax = zmin;  
            tile_list = tileLayer.calculateXYZListFromBounds(bounds, zmin, zmax);
            bTileListDone = tile_list.length < TILES_TO_DOWNLOAD_MAX || zmax <= zmin;
            if (!bTileListDone) {
                // Reduce zmax for zoom to reduce length of tile_list.
                zmax--;
            } 
        } while (!bTileListDone)

        message = "Preparing to cache tiles.\n" + "Zoom level " + zmin + " through " + zmax + "\n" + tile_list.length + " tiles total." + "\nClick OK to proceed.";
        var bConfirm = true; 
        var sTitle = 'GeoTrail';
        var sAnswer = 'OK,Cancel';
        if (navigator.notification) {
            // Show confirmation dialog which has async completion.
            navigator.notification.confirm(message, function (iButton) {
                // Async completion for user's response.
                var bOk = iButton === 1;
                bConfirm = OnDone(bOk);
            },
            sTitle, sAnswer);
        } else {
            // Note: Should not happen because navigator.notification should be defined.
            bConfirm = window.confirm(message);
            OnDone(bConfirm);
        }
        return bConfirm; // Synchronous return. User confirms asynchronously if navigator.notitification.confirm() is called.

        // Local helper called after user confirms or cancels.
        function OnDone(ok) {
            if (!ok) {
                status.bDone = true;
                status.bCancel = true;
                status.sMsg = "User canceled.";
                if (onStatusUpdate)
                    onStatusUpdate(status);
                return false;
            }

            // Handle error that can occur if user denies permission to write to local storage.
            // Arg
            //  ex: error object. ex.message should be string with error message.
            function DownLoadErrorHandler(ex) {  
                window.removeEventListener("cordovacallbackerror",DownLoadErrorHandler, false);
                var exMsg = ex.message ? "<br/>" + ex.message : "<br/>";
                status.sMsg = "Failed to cache map.<br/>Check GeoTrail App permissions to see if you allow writing to storage.<br/>{0}".format(exMsg);
                status.bDone = true;
                status.bError = true;
                if (onStatusUpdate)
                    onStatusUpdate(status); 
            }

            try {  // Catch exception that can occur if user denies perssion to access storage.  
                window.addEventListener("cordovacallbackerror",DownLoadErrorHandler, false); // Error event may occur if user denies permission to write to local storage. 
                tileLayer.downloadXYZList(
                    // 1st param: a list of XYZ objects indicating tiles to download
                    tile_list,
                    // 2nd param: overwrite existing tiles on disk? if no then a tile already on disk will be kept, which can be a big time saver
                    false,
                    // 3rd param: progress callback
                    // receives the number of tiles downloaded and the number of tiles total; caller can calculate a percentage, update progress bar, etc.
                    function (done, total) {
                        var percent = Math.round(100 * done / total);
                        status.sMsg = "Saving map tiles: " + done + " of " + total + " = " + percent + "%" +" ...";
                        if (onStatusUpdate)
                            onStatusUpdate(status); 
                    },
                    // 4th param: complete callback
                    // no parameters are given, but we know we're done!
                    function () {
                        window.removeEventListener("cordovacallbackerror",DownLoadErrorHandler, false); 
                        // for this demo, on success we use another L.TileLayer.Cordova feature and show the disk usage
                        tileLayer.getDiskUsage(function (filecount, bytes) {
                            var kilobytes = Math.round(bytes / 1024);
                            status.sMsg = "Map caching completed, status" + "<br/>" + filecount + " files" + "<br/>" + kilobytes + " kB";
                            status.bDone = true;
                            if (onStatusUpdate)
                                onStatusUpdate(status); 
                        });
                    },
                    // 5th param: error callback
                    // parameter is the error message string
                    function (error) {
                        window.removeEventListener("cordovacallbackerror",DownLoadErrorHandler, false); 
                        status.sMsg = "Failed to cache map.<br/>Error code: " + error.code;
                        status.bDone = true;
                        status.bError = true;
                        if (onStatusUpdate)
                            onStatusUpdate(status); 
                    }
                );
            } catch (ex) {
                // Exception can occur if user denies permission to wrrite to local files.
                // Note: Download error event seems to be occur instead of exception. 
                DownLoadErrorHandler(ex);
            }

            status.sMsg = "Starting download of map tiles for caching.";
            if (onStatusUpdate)
                onStatusUpdate(status);
            return true;
        }
    }

    // Object for drawing and managing a path for recording. 
    // The path for the recording is separate and indepedent of the path drawn for the map.
    // Constructor arg:
    //  geoPathMap: wigo_ws_GeoPathMap obj. ref to parent object. 
    function RecordPathMgr(geoPathMap) {
        var that = this;
        var mapRecordPath = null; // Map overlay for current path.
        var mapRecordEndOfPathShape = null; // Map overlay for current path end of path shape. 

        var pathCoords = []; // Array of L.LatLng objs for path coordinates.
        var arRecordPt = []; // Array of RecordPt objs for the path. 

        // ** Events generated. Set event handlers for these functions.
        // Distance traveled alert. Handler Signature:
        //  stats: object returns by this.getStats();
        //  Returns: nothing.
        this.onDistanceAlert = function (stats) { return null}; 
        // **

        // Object for a point in the path.
        // Enumeration for kind of RecordPt obj.
        this.eRecordPt = {RECORD: 0, PAUSE: 1, RESUME: 2}; 
        // Constructor args:
        //  ll: L.LatLng obj. lattitude and longiture for the point.
        //  msTimeStamp: number for timestamp in milliseconds.
        //  previousRecordPt: RecordPt obj. ref to previous RecordPt or null for no previous RecordPt.
        //  Note: this.kind defaults to eRecordPt.RECORD. Need to set for other than default.
        function RecordPt(ll, msTimeStamp, previousRecordPt) {
            this.kind = that.eRecordPt.RECORD;   // Kind of point. 
            this.ll = ll;  // Lattitude and longitude for the point. null or don't care for this.kind == eRecordPt.PAUSE or RESUME.
            this.msTimeStamp = msTimeStamp; // timestamp for the point.
            this.previous = previousRecordPt; // Ref to previous RecordPt object in a list.
            this.bDeleted = false;  // true indicates this RecordPt is deleted. Used for filtering points. 
            
            // Returns distance in meters from previous RecordPt.
            // Returns 0 if this.previous is null.
            // Note: Skips over PAUSE or RESUME points, which were saved
            //       to record timestamps.
            this.d = function() {
                var d = 0;
                var curPt = this;
                var prevPt = null; 
                // Calc distance from previous point skipping over PAUSE and RESUME point,
                // where were saved to record timestamps.
                while (curPt) {
                    prevPt = curPt.previous;
                    if (prevPt && prevPt.kind === that.eRecordPt.RECORD) {
                        if (this.kind === that.eRecordPt.RECORD)    
                            d = prevPt.ll.distanceTo(this.ll);  
                        break;
                    } 
                    curPt = prevPt;
                }

                return d;
            };

            // Returns deltas for distance and time to previous point of kind eRecordPt.RECORD.
            // Returned obj:   {d: number, msDelta: number, msRecordDelta: number};
            //  d: distance delta in meters.
            //  msElapsedDelta: elpased time delta in millisconds, including pauses.
            //  msRecordDelta: time delta in millisconds, excluding pauses and previous deleted points.
            this.dt = function() {
                var d = 0;                    // distance in meters from this pt to prevPt.
                var prevPt = this.previous;   // previous RecordPt while looping thru all points.
                var msElapsedDelta = 0;       // Elapased time from this pt to prevPt, inlcuding PAUSE.
                var msRecordDelta = 0;        // Record time from this pt of kind RECORD to prevPt, excluding PAUSE.
                
                var bRecordDeltaValid = true;
                // Calc distance from previous point skipping over PAUSE and RESUME point,
                // which were saved to record timestamps.
                // Note: Return immediately if current point (this) is not a RECORD pt.
                while (prevPt && this.kind === that.eRecordPt.RECORD && !this.bDeleted) {   
                    // Skip a deleted previous point.
                    if (prevPt.bDeleted) {
                        // Ignore previously deleted pts.
                        prevPt = prevPt.previous;  
                        continue;
                    } 
                    msElapsedDelta = this.msTimeStamp - prevPt.msTimeStamp;
                    if (prevPt.kind === that.eRecordPt.RECORD) {
                        d = prevPt.ll.distanceTo(this.ll);
                        if (bRecordDeltaValid) {
                            msRecordDelta = msElapsedDelta;
                        }
                        // Quit when previous point of RECORD kind is found.
                        break;
                    } else if (prevPt.kind === that.eRecordPt.RESUME) {
                        // Delta is not for a RECORD pt.
                        bRecordDeltaValid = false;
                    } else if (prevPt.kind === that.eRecordPt.PAUSE) {
                        // Delta is not for a RECORD pt.
                        bRecordDeltaValid = false;
                    }
                    prevPt = prevPt.previous;
                }
                var result = {d: d, msElapsedDelta: msElapsedDelta, msRecordDelta: msRecordDelta};
                return result;
            }


            // Returns velocity in meters/sec from other RecordPt.
            // Returns -1 if other RecordPt is null or is not kind of eRecord.RECORD.
            // Arg:
            //  otherRecordPt: RecordPt. other RecordPt.
            // Note: Does NOT skip over PAUSE or RESUME points, which were saved
            //       to record timestamps. The time between this 
            //       RecordPt and otherRecordPt is total difference without
            //       any time for pausing substracted.
            //       The time difference is absolute value and velocity is always >= 0.
            this.v = function(otherRecordPt) {
                var v = -1;
                if (!otherRecordPt)
                    return -1;
                if (otherRecordPt.kind !== that.eRecordPt.RECORD)
                    return -1;

                var d = otherRecordPt.ll.distanceTo(this.ll); 
                var msT = this.msTimeStamp - otherRecordPt.msTimeStamp;
                if (msT < 0)        // Use absolute value for time difference.
                    msT = -msT; 

                if (msT < 0.0001)  // Ensure msT is not too small to avoid divide by zero.
                    msT = 0.0001;
                v = d / (msT/1000.0);

                return v;
            }

        }
        
        // Draws path for recording on the map object.
        // Note: pathCoords has points that are drawn.
        this.draw = function(){

            // Helper that calculates a portion of last line segment.
            // Returns: array of LatLng obj, [llFrom, llTo] where llFrom is llEnd of last segment, and 
            //          llTo is end for the part of last segment.
            //  Arg:
            //  mMaxLen: number. maximum number of meters for part returned. if mMaxLen > len of last segment, 
            //           returns part as complete last segment.
            function CalcEndOfPathLine(mMaxLen) {
                var arPart = null;
                var iLast = pathCoords.length - 1; 
                var llEnd = iLast >= 0 ? pathCoords[iLast] : null;
                var llStart = iLast > 0 ? pathCoords[iLast-1] : null;
                if (llEnd && llStart) {
                    var llEnd = pathCoords[iLast];
                    var llStart = pathCoords[iLast-1];
                    var len = llStart.distanceTo(llEnd);
                    if (len > mMaxLen)
                        arPart = CalcAlongSeg(llEnd, llStart, mMaxLen / len);
                    else
                        arPart = CalcAlongSeg(llEnd, llStart);
                } else if (llEnd) {
                    arPart = CalcAlongSeg(llEnd, llEnd);
                }
                return arPart
            }


            if (!IsMapLoaded())
                return; // Quit if map has not been loaded.
            
            // Clear any current record path before drawing another path.
            this.clear();

            // Draw the record path on the map.
            if (pathCoords.length > 1) { 
                mapRecordPath = L.polyline(pathCoords, { color: geoPathMap.color.recordPath, opacity: 0.5 });
                mapRecordPath.addTo(map);
            }

            // Draw end of path shape 
            var arLatLng = CalcEndOfPathLine(30);
            if (arLatLng) {
                // Draw start segment shape.
                var shapeOptions = {
                    color: geoPathMap.color.recordPathEnd,  // stroke (perimeter) color
                    weight: 6,    // stroke width in pels for line.
                    opacity: 1.0
                };
                mapRecordEndOfPathShape = L.polyline(arLatLng, shapeOptions);
                mapRecordEndOfPathShape.addTo(map);
            }

            // Zoom to last point of recordPath.
            var iLast = pathCoords.length - 1;
            if (iLast >= 0) {
                var llEnd = pathCoords[iLast];
                var pxBounds = map.getPixelBounds();
                // Decrease bottom y of pxBounds to account for area overflowing page due to div above.
                // Note: Height of map-canvas is 100% of body.
                var canvas = geoPathMap.getMapCanvas(); 
                if (canvas) {
                    pxBounds.max.y -= canvas.offsetTop; 
                }
                var szBounds = pxBounds.getSize();
                var xMargin = Math.ceil(szBounds.x * 0.10); // Integer number of extra pels for x offset.
                var yMargin = Math.ceil(szBounds.y * 0.10); // Integer number of extra pesl for y offset.
                // Shrink bounds by the margins.
                pxBounds.min.x += xMargin;
                pxBounds.min.y += yMargin;
                pxBounds.max.x -= xMargin;
                pxBounds.max.y -= yMargin;
                var zoom = map.getZoom();              
                var ptEnd = map.project(llEnd, zoom);  
                
                if (!pxBounds.contains(ptEnd)) {
                    var ptOffset = L.point(0,0);  
                    if (ptEnd.x < pxBounds.min.x)
                        ptOffset.x += ptEnd.x - pxBounds.min.x - xMargin;
                    if (ptEnd.y < pxBounds.min.y )
                        ptOffset.y += (ptEnd.y - pxBounds.min.y - yMargin); 
                    if (ptEnd.x > pxBounds.max.x) 
                        ptOffset.x += ptEnd.x - pxBounds.max.x + xMargin;
                    if (ptEnd.y > pxBounds.max.y)
                        ptOffset.y += (ptEnd.y - pxBounds.max.y + yMargin); 
                    map.panBy(ptOffset);
                }
            }
        };

        
        // Zoom map to first coordinate in the record path only once.
        // Arg:
        //  mToSide: number. Length in meters to side of a square boundary 
        //           around fist coordinate of record path.
        // Note: enableZoomToFirstCoordOnce() must be called to enable. 
        //       After zooming to first coord, zooming is disabled
        //       until enableZoomToFirstCoordOnce() is called again.
        this.zoomToFirstCoordOnce = function(mToSide) { 
            if (bZoomToFirstCoordOnce && pathCoords.length > 0) {
                bZoomToFirstCoordOnce = false;  
                var ll = pathCoords[0];

                // note: ll.toBounds(mToCorner) is documented, but does not exist.
                var ne = ll.offsetXY(mToSide, mToSide);
                var sw = ll.offsetXY(-mToSide, -mToSide);
                var bounds = L.latLngBounds(sw, ne);
                map.fitBounds(bounds);
            }
        };

        // Enables zooming to first coordinate once time.
        this.enableZoomToFirstCoordOnce = function() { 
            bZoomToFirstCoordOnce = true;
        };
        var bZoomToFirstCoordOnce = false;

        // Zooms to the recorded trail.
        // Arg:
        //  mToSideMin: number. minimum meters from center of trail to each side
        //              of the bounding rectangle. If distance from center to any side
        //              is less than mToSideMin, mToSide min is used for distance from
        //              the center to the side.
        // Returns: boolean. true when zoom is done. 
        //                   false when zoom is not done because there is no trail. 
        this.zoomToTrail = function(mToSideMin) { 
            // Helper that returns SW and NE corners for the recorded trail.
            // Returns: wigo_ws_GeoPt.Corners object.
            function GetCorners() {
                var corners = new wigo_ws_GeoPt.Corners();
                var geoPt = new wigo_ws_GeoPt();
                for (var i=0; i < pathCoords.length; i++) {
                    geoPt.lat = pathCoords[i].lat;
                    geoPt.lon = pathCoords[i].lng;
                    corners.Update(geoPt);
                }
                return corners; 
            }

            if (pathCoords.length === 0)
                return false;

            var gptCorners = GetCorners();
            // calc center of gptCorners.
            var gptCenter = new wigo_ws_GeoPt();
            gptCenter.lat = (gptCorners.gptSW.lat + gptCorners.gptNE.lat) / 2;
            gptCenter.lon = (gptCorners.gptSW.lon + gptCorners.gptNE.lon) / 2;
            var llCenter = L.latLng(gptCenter.lat, gptCenter.lon);
 
            // Update gptCorners for minimum side from center.
            // Test East (right) side for min.
            var llSideMin = llCenter.offsetXY(mToSideMin, 0);
            if (llSideMin.lng > gptCorners.gptNE.lon)
                gptCorners.gptNE.lon = llSideMin.lng;
            // Test North (top) side for min.
            llSideMin = llCenter.offsetXY(0, mToSideMin);
            if (llSideMin.lat > gptCorners.gptNE.lat)
                gptCorners.gptNE.lat = llSideMin.lat;
            // Test West (left) side for min.
            llSideMin = llCenter.offsetXY(-mToSideMin, 0);
            if (llSideMin.lng < gptCorners.gptSW.lon)
                gptCorners.gptSW.lon = llSideMin.lng;
            // Test South (bottom) side for min.
            llSideMin = llCenter.offsetXY(0, -mToSideMin);
            if (llSideMin.lat < gptCorners.gptSW.lat)
                gptCorners.gptSW.lat = llSideMin.lat;
            
            // Fit map to the corners.
            var llNE = L.latLng(gptCorners.gptNE.lat, gptCorners.gptNE.lon);
            var llSW = L.latLng(gptCorners.gptSW.lat, gptCorners.gptSW.lon)
            var bounds = L.latLngBounds(llSW, llNE);
            map.fitBounds(bounds);
            return true;
        };

        // Returns stats for the record path.
        // Returns literal Obj with these fields:
        //  bOk: boolean. true for success (stats are valid).
        //  dTotal: number. total distance of record path in meters.
        //  msRecordTime: number. number of milliseconds for the RECORD time of the record path (PAUSE excluded).
        //  msElapsedTime: number. number of milliseconds for total elapsed time for the record path (PAUSE included).
        //  tStart: Date obj. Date and time for start of the record path. 
        //          null if there is no valid RecordPt of kind eRecordPt.RECORD in the record path.
        //          bOk is false if tStart is null.
        //  kJoules: number. kinetic engery for body traveling for the recorded path. 
        //            Note: var kgMass is body mass.
        //  calories: number. food calories on a product label corresponding to kJoules. Calculated by summing
        //                    kinetic energy change for each point on the path.
        //  nExcessiveV: number. Number of points whose velocity exceeeded vLimit. 
        //  calories2: number. food calories on a product label. Calculated by using average velocity and body mass.
        //                     equals 1/2*m*v^2 where 
        //                         v is average velocity = dTotal / (msRecordTime/1000), in m/sec, 
        //                         m is body mass in kilograms.
        //                      Note: Does not seem to be useful. Value is way too low. Use calories instead.
        //  calories3: number. Estimated number of calories burned. Equals calories / calsBurnedEfficency.
        this.getStats = function() {
            var result = {bOk: false, dTotal: 0,  msRecordTime: 0, msElapsedTime: 0, tStart: null, kJoules: 0, calories: 0, nExcessiveV: 0, calories2: 0, calories3: 0}; 
            if (!IsMapLoaded())
                return result; // Quit if map has not been loaded.
            
            var d=0; // Distance to previous RECORD point.
            var dt;  // Distance and time to previous record point.
            var pt;  // Current point in arRecordPt while looping thru arRecordPt.
            var vCur = 0;  // Current velocity in m/sec;  
            var vv = 0; // Change in velocity squared from previous point to current point.
            var vvPrev = 0; // Previous velocity squared in m/sec. 
            var vvSum = 0; // sum of velocity squared for points over recorded path. 
            var epsilon = 0.0001; // Small value to avoid divide by 0.
            for (var i=0; i < arRecordPt.length; i++) { 
                pt = arRecordPt[i]; 
                if (pt.bDeleted) { // Ignore points marked as deleted. 
                    continue;
                }
                switch (pt.kind) {
                    case this.eRecordPt.RECORD:
                        // Get distance and time deltas to previous RECORD point.
                        dt = pt.dt();
                        if (dt.msRecordDelta > epsilon) {
                            result.dTotal += dt.d;
                            result.msRecordTime += dt.msRecordDelta;
                        }
                        result.msElapsedTime += dt.msElapsedDelta;
                        // Set date and time for start of the recording.
                        if (result.tStart === null) 
                            result.tStart = new Date(pt.msTimeStamp);
                        // Calc v*2 for kinetic energy.
                        if (dt.msRecordDelta > epsilon) {
                            vCur = dt.d / (dt.msRecordDelta/1000);
                            if (vCur >= vLimit) { // Ignore points with excessive velocity. 
                                result.nExcessiveV++;
                                continue;       
                            } 
                            vv = vCur*vCur - vvPrev;
                            if (vv < 0)
                                vv = -vv;
                            vvSum +=vv;
                            vvPrev = vv;
                        }
                        break;
                    case this.eRecordPt.PAUSE:
                        break;
                    case this.eRecordPt.RESUME:
                        break;
                }
            }
            // Note: PAUSE and RESUME points after last RECORD point are ignored.
            // Set result for total kinetic energy for body traveling the recorded path. 
            result.kJoules = (vvSum*kgMass/2.0)/1000.0;
            // Set result for food calories corresponding to result.kJoules.   
            result.calories = KJoulesToLabelCalories(result.kJoules);

            // Calculate calories based on average velocity. 
            if (result.msRecordTime > epsilon) {  
                var aveV = result.dTotal / (result.msRecordTime/1000);
                var kJoules = (aveV*aveV*kgMass/2.0) / 1000.0;
                result.calories2 = KJoulesToLabelCalories(kJoules); 

                result.calories3 = CaloriesBurned(result.calories);
            }

            result.bOk = result.tStart !== null ? true : false;
            return result;
        };

        // Filters arRecordPts marking spurious items as deleted and redraws the record trail.
        // Arg: 
        //  bAll: boolean, optional. true to repeat filtering until all spurious points are filtered out.
        //        defaults to true. 
        // Returns {bValid: boolean, bApplied: boolean}:
        //  bValid is true if there are points to filter,
        //  nDeleted  is number of points marked deleted., ie the filter was applied. 
        // Note: 
        // The velocity of each point is calculated wrt to its previous point.
        // If the velocity of point is too greater it is considered spurious.
        // Consecutive spurious points are marked as deleted provided the 
        // number of spurious consecutive points is less than the nMaxSpurious;
        // otherwise the consecutive points remain.
        this.filter = function (bAll) {   
            if (typeof bAll !== 'boolean')
                bAll = true;
            var result;
            if (bAll)
                result = filterFSM.doItAll();
            else
                result = filterFSM.doIt();

            var nTotalDeleted = result.nDeleted + result.nAlreadyDeleted;   
            if (result.bValid && nTotalDeleted > 0) {  
                SetPathCoords();
                this.draw(); 
                bUnfilterEnabled = true; 
            } else {
                bUnfilterEnabled = false;
            }
            bFilterEnabled = false;
            return result;
        };


        // Removes a filter that was applied by this.filter() and redraws the record trail.
        this.unfilter = function() {
            if (!this.isUnfilterEnabled())  
                return;                    
            var pt; // RecordPt obj.
            for (var i=0; i < arRecordPt.length; i++) {
                pt = arRecordPt[i];
                if (pt.kind === this.eRecordPt.RECORD) {
                    pt.bDeleted = false;
                }
            }
            // Set pathCoords to match RECORD points that are not deleted.
            SetPathCoords();
            this.draw();
            // Indicate record path can be filtered again.
            bFilterEnabled = true;  
            bUnfilterEnabled = false;
        };

        // Returns true if this.filter() can run.
        this.isFilterEnabled = function() {
            var bYes = IsFilterAllowed() && bFilterEnabled;
            return bYes;
        };

        // Returns true if this.unfilter() can run.
        this.isUnfilterEnabled = function() {
            var bYes = IsFilterAllowed() && bUnfilterEnabled;
            return bYes;
        }
        
        // Appends the location point to the path of points.
        // Returns RecordPt object that is appended to the path.
        // Arg:
        //  ll: L.LatLng object. The point to append to the path.
        //  msTimeStamp: number. timestamp for ll in milliseconds.
        //  kind: eRecordPt enumeration value, optional. defaults to eRecordPt.RECORD.
        //        eRecordPt.PAUSE and eRecordPt.RESUME are used to save timestamp.
        this.appendPt = function(ll, msTimeStamp, kind) { 
            var dThres = 2.0; // Threshold for a change in distance. (5.0 seems too large, 1.0 might be ok)
            var iLast = arRecordPt.length - 1;
            var prevPt = iLast < 0 ? null : arRecordPt[iLast];
            var pt = new RecordPt(ll, msTimeStamp, prevPt);
            if (typeof(kind) !== 'undefined') {
                pt.kind = kind;
            } 

            // Indicate filtering is enabled because a point has been appended.
            bFilterEnabled = true; 
            
            if (pathCoords.length === 0) {
                // Ensure first point if for RECORD and not PAUSE or RESTORE.
                if (pt.kind === this.eRecordPt.RECORD) {
                    arRecordPt.push(pt);
                    pathCoords.push(pt.ll); // Also save lat/lng for the path point in pathCoords.
                    distanceAlerter.resetDistance(); 
                }
            } else {
                if (pt.kind === this.eRecordPt.RECORD) {
                    // Save record point distance if greater than threshold.
                    var d = pt.d();
                    if (d > dThres) {
                        arRecordPt.push(pt);
                        pathCoords.push(pt.ll); // Also save lat/lng for the path point in pathCoords.
                        distanceAlerter.update(pt);  
                    }
                } else {
                    arRecordPt.push(pt);
                }
            }

            return pt;
        };

        // Clears the record path from the map.
        this.clear = function() {
            if (!IsMapLoaded())
                return; // Quit if map has not been loaded.
            if (mapRecordPath) {
                map.removeLayer(mapRecordPath);
                mapRecordPath = null;
            }
            if (mapRecordEndOfPathShape) {
                map.removeLayer(mapRecordEndOfPathShape);
                mapRecordEndOfPathShape = null;
            }
        };

        // Clears the record path from the map and
        // empties the list of record path points.
        this.reset = function() {
            this.clear();
            pathCoords.length = 0;
            arRecordPt.length = 0;
        };

        // Returns array of wigo_ws_GeoPt objs for pathCoords.
        // If pathCoords is empty (length 0), returned array has length of 0. 
        this.getGeoPtArray = function() {
            var arGeoPt = [];
            var geoPt;
            for (var i=0; i < pathCoords.length; i++) {
                geoPt = new wigo_ws_GeoPt();
                geoPt.lat = pathCoords[i].lat;
                geoPt.lon = pathCoords[i].lng;
                arGeoPt.push(geoPt);
            }
            return arGeoPt;
        }
        
        // Returns true if record trail is empty.
        this.isEmpty = function() {
            var bReset = pathCoords.length <= 0;
            return bReset;
        };

        // Returns number of coords in the record path.
        this.getLength = function() { 
            return pathCoords.length;
        };

        // Sets velocity limit for filtering spurious points.
        // Arg:
        //  limit: number. velocity limit in meters / sec.
        this.setVLimit = function(limit) { 
            vLimit = limit;
        };

        // Returns the velocity limit for filtering spurious points from recorded path.
        // Returns: number. the velocity limit in meters/sec.
        this.getVLimit = function() {
            return vLimit;
        };

        // Set distance alert interval in meters.  
        // Arg:
        //  kmDistance: float. distance interval in kilometers.
        this.setDistanceAlertInterval = function(kmDistance) {  
            distanceAlerter.setDistanceInterval(kmDistance * 1000);
        };

        // Returns number: distance traveled in meters while recording.
        // Arg:
        //  bFilter: boolean, optional. true to filter all spurious points first. defaults to true.
        this.getDistanceTraveled = function(bFilter) {  
            if (typeof bFilter !== 'boolean')
                bFilter = true;
            // Filler all spurious points.
            if (bFilter)
                filterFSM.doItAll();
            var stats = this.getStats();
            return stats.dTotal;
        }


        // Sets body mass in kilograms.
        // Arg: 
        //  mass: number. body mass in kilograms.
        this.setBodyMass = function(mass) {  
            kgMass = mass;
        };

        // Sets the calories burned efficiency factor.
        // Arg:
        //  efficiency: number. efficiency factor, the ratio of kinetic calories : calories burned.
        //              Note: this is decimal fraction, not a percentage.
        this.setCaloriesBurnedEfficiency = function (efficiency) { 
            calsBurnedEfficency = efficiency;
        };

        // Animates current path by showing an icon traveling along the path.
        this.animatePath = function() { 
            if (mapRecordPath) {
                if (pathCoords.length > 1) {
                    var mDistance = distanceAlerter.curDistance(); 
                    var nPoints = pathCoords.length;
                    var seconds = mDistance < 2000 ? 10 : 20;
                    animator.setAnimationRate(mDistance, nPoints, seconds);  
                }
                animator.start(mapRecordPath);
            }
        };

        // Stops and clears trail animation in case it is running.
        this.clearPathAnimation = function() { 
            animator.clear();
        };

        // Set pathCoords to match RECORD points that are not deleted in arRecordPt.
        function SetPathCoords() {
            // Set pathCoords to match RECORD points that are not deleted.
            var pt;
            var ll;
            pathCoords = [];
            for (var iPt = 0; iPt < arRecordPt.length; iPt++) {
                pt = arRecordPt[iPt];
                if (!pt.bDeleted && pt.kind === that.eRecordPt.RECORD) {
                    pathCoords.push(pt.ll);
                }
            }
        }

        // Returns true if filter() is allowed to run.
        function IsFilterAllowed() {
            return vLimit > 0;  
        }

        // Returns float for number of US food calories for engery in kiloJoules.
        // Arg:
        //  kJoules: float. number of kilojoules of engery.
        function KJoulesToLabelCalories(kJoules) {
            var cals = kJoules / 4.184; // 4.184 kiloJoules = 1 Food Calorie.
            return cals; 
        }

        // Returns calories burned.
        // Arg:
        //  cals: number. Calculated calories (or kilojoules).
        //        calories burned = cals / calsBurnedEfficiency.
        // Note: Efficiency is estimated to be 0.25. May want to make this a Settings item.
        function CaloriesBurned(cals) {
            var calsBurned = cals / calsBurnedEfficency; 
            return calsBurned;
        }

        // Object for filtering arRecordPt. 
        // Constructor arg: eRecordPt enumeration defined in RecordPathMgr object.
        //                  Enumeration for kind of RecordPt objects.
        function FilterFSM(eRecordPt) { 
            
            // Filters arRecordPt for invalid (spurious) points.
            // Returns {bValid: boolean, nDeleted: number, nAlreadyDeleted: number} 
            //  bValid: true indicated filtering was applied.
            //  nDeleted: number of RecordPt elements marked as deleted in arRecordPt.
            //            Indicates number deleted by filtering for this call.
            //            Does not count points deleted by previous call.
            //  nAlreadyDeleted: number of RecordPt elements already deleted before filtering again.
            this.doIt = function() {
                Init();
                var event = GenNextEvent();
                while (event != eEvent.done) {
                    curState.nextState(event);

                    event = GenNextEvent();
                } 

                var bOk = curPt !== null && prevPt !== null;
                var result = {bValid: bOk, nDeleted: nDeleted, nAlreadyDeleted: nAlreadyDeleted}; 
                return result;
            }; 

            // Same as this.doIt(), except repeats until there no more points to filter out.
            this.doItAll = function() {
                var result = this.doIt();
                // For safety check, try no more than 100 times.
                for (var i=0; i < 100; i++) {
                    if (result.bValid && result.nDeleted > 0) {
                        result = this.doIt();
                    } else {
                        // Quit when there no points to deleted.
                        break;
                    }
                }
                return result;
            }
            
            var eEvent = {validPt: 0, invalidPt: 1, done: 2}; // Events for filtering.

            // Object for run of valid points.
            function StateValidRun() {
                this.nextState = function(event){
                    switch (event) {
                        case eEvent.validPt:
                            break;
                        case eEvent.invalidPt:
                            if (prevPt) {
                                nDeleted++; // increment count of deleted points.
                                // Mark previous point as deleted.
                                prevPt.bDeleted = true;
                                // Save first deletion for start of invalid (spurious) run.
                                // prevDeletedPt is checked later to see if it can be undeleted.
                                prevDeletedPt = prevPt;
                            }
                            curState = stateInvalidRun;
                            break;
                    }

                };
            }
            var stateValidRun = new StateValidRun();

            // Object for run of invalid (spurious) points.
            function StateInvalidRun() {
                this.nextState = function(event) {
                    switch (event) {
                        case eEvent.validPt:
                            // Check if saved first deletion in invalid (spurious) run
                            // is not spurious wrt current point.
                            if (prevDeletedPt) {
                                var v = prevDeletedPt.v(prevPt)
                                if (v < vLimit) {
                                    // The first deletion within invalid (spurious) run is now valid.
                                    nDeleted--; // Decrement count of deleted points because deleted point has been restored.
                                    prevDeletedPt.bDeleted = false;
                                }
                            }
                            curState = stateValidRun;
                            break;
                        case eEvent.invalidPt:
                            // mark previous point as deleted.
                            if (prevPt) {
                                nDeleted++; // increment count of deleted points.
                                prevPt.bDeleted = true;
                            }
                            break;
                    }
                };

            }
            var stateInvalidRun = new StateInvalidRun();


            // Initialize previous point, current point, and current state. 
            //  eEvent.validPt for success.
            //  eEvent.done for no RecordPt of kind RECORD or a single such point in arRecordPt..
            function Init() {
                iCurPt = -1;
                prevDeletedPt = null;
                curPt = null;
                prevPt = null;
                nDeleted = 0; 
                nAlreadyDeleted = 0;
                curState = stateValidRun;
            }

            // Advances through arRecordPt by one point detecting if its 
            // velocity is valid wrt to previous point.
            // Advances prevPt and curPt for next point. 
            // Returns eEvent value: validPt, invalidPt, or done.
            function GenNextEvent() {
                iCurPt++;
                if (iCurPt >= arRecordPt.length) 
                    return eEvent.done;
                
                // Advance to next RecordPt in arRecordPt.
                prevPt = curPt;   // Note: Here curPt should always be of kind RECORD and !bDeleted, or null. 
                var bCheckNext = true;
                while (bCheckNext) {
                    curPt = arRecordPt[iCurPt];
                    if (curPt.bDeleted)  // Count points that are already deleted. 
                        nAlreadyDeleted++; 
                    if (curPt.bDeleted || curPt.kind !== eRecordPt.RECORD) { 
                        // Skip over points of that are deleted, or pts that are not of kind RECORD.
                        iCurPt++;
                        if (iCurPt >= arRecordPt.length) 
                            return eEvent.done;
                    } else {
                        bCheckNext = false;
                    }
                }

                var event;
                if (curPt && prevPt) {
                    // Normal case.
                    var v = curPt.v(prevPt);
                    if (v < vLimit) {
                        event = eEvent.validPt;
                    } else {
                        event = eEvent.invalidPt;
                    }
                } else if (curPt && !prevPt) {
                    // First point, no previous point so valid.
                    event = eEvent.validPt;
                } else {
                    // No current point. Should not happen, except if there is single point.
                    event = eEvent.done;
                }
                return event;
            }

            var nAlreadyDeleted = 0;  // Number of points already deleted before filter is applied.
            var nDeleted = 0;         // Number of points deleted by filtering.
            var iCurPt = 0;           // Index for stepping thru arRecordPt.
            var prevDeletedPt = null; // Saved deleted point when starting a run of deleted points.
            var curPt = null;         // ref to current RecordPt in arRecordPt.
            var prevPt = null;        // ref to previous RecordPt in arRecordPt.

            var curState = stateValidRun; // Current state.


        }
        var filterFSM = new FilterFSM(this.eRecordPt); 

        // Object for detecting distance traveled when recording. 
        function DistanceAlerter() {
            // Sets the distance interval for generating an alert.
            // Arg:
            //  mDistanceIntervalArg: number. distance interval in meters.
            //  0 indicates no alert is generated.
            this.setDistanceInterval = function(mDistanceIntervalArg) {
                mDistanceInterval = mDistanceIntervalArg;
                // Set distance limit wrt to current distance also. 
                // First filter the path and set distance traveled.
                that.filter(); 
                var stats = that.getStats(); 
                mDistance = stats.dTotal;
                // Set distance limit wrt to current distance.
                var nIntervals = Math.floor(mDistance / mDistanceInterval); 
                if (nIntervals < 0)
                    nIntervals = 0;
                mIntervalLimit = mDistanceInterval * (nIntervals + 1);
            };
            
            // Resets the distance traveled..
            this.resetDistance = function() {
                mDistance = 0; 
                mIntervalLimit = mDistanceInterval;
            };
            
            // Update after appending a RecordPt for  distance alert.
            // Generates a distance alert when distance travel exceeds the distance interval.
            // Arg:
            //  recordPt: RecordPt obj. Last record pt appended to path.
            // Event: 
            //  that.onDistanceAlert(stats). 
            this.update = function (recordPt) { 
                if (mDistanceInterval > 0.0001) {
                    mDistance += recordPt.d();
                    if (mDistance > mIntervalLimit) {
                        // May be time to generate an alert.
                        // Filter the path to be sure.
                        that.filter(); 
                        var stats = that.getStats(); 
                        mDistance = stats.dTotal;
                        if (mDistance > mIntervalLimit) {
                            mIntervalLimit += mDistanceInterval;
                            that.onDistanceAlert(stats);
                        }
                    }
                }
            };

            // Recturns current distance traveled.
            this.curDistance = function() {
                return mDistance;
            };

            // Interval distance in meters for generating an alert for distance traveled.
            // 0 indicates no alert is generated.
            var mDistanceInterval = 0; 
            var mDistance = 0; // Total distance traveled in meters.
            var mIntervalLimit = 0; // Ending point generating an alert based on total distance traveled.
        }
        var distanceAlerter = new DistanceAlerter(); 

        var vLimit = 100 * 1000 / (60 * 60);  // Limit for velocity of pt to be valid. // x km/hour to m/sec.
        var bFilterEnabled = false;   // Filter is enabled. this.filter() can run.      
        var bUnfilterEnabled = false; // Unfilter is enabled. this.unfilter() can run.  
        var kgMass = 77.0; // Body mass in kilograms.
        var calsBurnedEfficency = 0.10; // Efficiency of converted burned calories to kinetic calories rquired to move kgMass.
    
        var animator = new PathAnimator(); 
    }

    // Object for collection of PathMarkerEl objects.
    // Each path has a marker. Touch the marks show a popup which has the
    // path name and control buttons:
    //  view: clears the popup and show path for the marker selected by touch.
    //  Close: closes the popup.
    //  ZoomOUt: closes the popup and zooms out showing all the path markers.
    function PathMarkers() { 

        // Initializes this PathMarkers object.
        // Must be called once before other members can be used.
        // Arg:
        //  oMap; Leaflet L.Map object: the underlying map on which path markers are drawn.
        this.initialize = function(oMap) {
            map = oMap;
            // Use option of {keepSpiderfied: true} to keep spider for overlapping markers
            // open after closing a spideried marker so the spider remains for selecting.
            oms = new OverlappingMarkerSpiderfier(map, {keepSpiderfied: true});  
            oms.addListener('click', PathMarkerClicked);            
        };

        // Clears all the path markers and empties the list of path markers.
        this.empty = function() {
            this.clear();

            // Initialize the corners that covers all the path markers.
            corners = new wigo_ws_GeoPt.Corners();

            liPathMarker = {};
        };

        // Clears the path markers for the map, but does not empty the list of path markers.
        this.clear = function() {
            if (!map)
                return; // Quit, not initialized.
            oms.clearMarkers(); 
            map.closePopup(popup); 
            var el;
            var keys = Object.keys(liPathMarker);
            for (var i=0; i < keys.length; i++) {
                el = liPathMarker[keys[i]];
                if (el.layer) {
                    map.removeLayer(el.layer);
                    el.layer = null;
                }
            }
        };

        // Creates and returns a PathMarkerEl object.
        // See PathMarkerEl() object definition below.
        // Note: Caller sets fields of the returned object
        //       and passes the object as argment to this.setPathMarkerEl(..); 
        this.newPathMarkerEl = function() {
            // Path marker element object for a list of path marker elements.
            function PathMarkerEl() {
                this.pathName = ""; // string: path name.
                this.dataIx = -1;   // interger: index in a array of data corresponding to the PathMarkerEl.
                this.sDescr = "";   // string: description for the path. (For example could be total distance.)
                this.latLngMarker = L.latLng(0, 0); // Leaflet L.LatLng obj. location on map of the marker.
                // this.layer is a field added by this.show() as a marker layer is added to the map.
            }
            var el = new PathMarkerEl();
            return el;
        };

        // Sets path marker to list of path markers.
        // Arg:
        //  key: string. key for identifying a path marker in the list.
        //  pathMarkerEl: PathMarkerEl object. path marker to append to the list.
        this.setPathMarkerEl = function(key, pathMarkerEl) {
            pathMarkerEl.key = key; 
            liPathMarker[key] = pathMarkerEl;
            // Update the corners the covers all the path markers.
            var gptMarker = new wigo_ws_GeoPt();  // Convert Leaflet LatLng to geotrail wigo_ws_GeoPt.
            gptMarker.lat = pathMarkerEl.latLngMarker.lat;
            gptMarker.lon = pathMarkerEl.latLngMarker.lng;
            corners.Update(gptMarker); 
        };

        // Shows the list of path markers on the map.
        this.show = function() {
            if (!map)
                return; // Quit, not initialized.


            // Helper that creates and returns L.Layer object for marker to add to the map.
            // Arg:
            //  pathMarkerEl: PathMarkerEl obj. parameters for the layer to be added to the map.
            function PathMarkerLayer(pathMarkerEl) {
                var layer = L.marker(pathMarkerEl.latLngMarker);
                layer.key = pathMarkerEl.key; // Add key field to marker layer.
                return layer;
            }

            var el;
            var keys = Object.keys(liPathMarker);
            for (var i=0; i < keys.length; i++) {
                el = liPathMarker[keys[i]];
                if (!el.layer) {
                    el.layer = PathMarkerLayer(el);
                    oms.addMarker(el.layer); 
                    map.addLayer(el.layer);
                }
            }
            // Set map bounds to cover the coners.
            that.FitBounds(corners.gptSW, corners.gptNE);
        }; 

        // Event handler for Path Marker Clicked.
        // Arg:
        //  marker: L.Marker object; ref to marker clicked.
        //          Note: Addtional field of marker.key has been set.
        function PathMarkerClicked (marker) {  
            var pathMarkerEl = liPathMarker[marker.key];
            if (pathMarkerEl) {
                var distance = that.onGetPathDistance(marker.key);
                popupDescrDiv.innerHTML = "{0}<br/>Distance: {1}".format(pathMarkerEl.pathName, distance.s);
                popupViewBtn.setAttribute('data-key', marker.key);
                popup.setContent(popupDiv);
                popup.setLatLng(marker.getLatLng());
                map.openPopup(popup);
            }
        }

        // Event handler for PoupViewBtn clicked.
        function PopupViewBtnClicked(e) {  
            var sKey = this.getAttribute('data-key');
            that.onShowPath(sKey);
        }

        // Object for list of PathMarkerEl objs. 
        // Each property value is PathMarkerEl obj with a property name string that is its key.
        // Note: a property name is likely a data record sequence id.
        var liPathMarker = {}; 

        var corners = new wigo_ws_GeoPt.Corners(); // Corners that covers all the path markers.
        var map = null; // Leaflet L.Map object.
        var oms = null; // OverlappingMarkerSpiderfier object for map.
        var popup = new L.Popup();  // Popup for marker.
        // Create div for popup content.
        var popupDiv = document.createElement('div');
        popupDiv.className = "wigo_ws_MarkerPopup";
        var popupDescrDiv = document.createElement('div');
        popupDescrDiv.className = "wigo_ws_MarkerPopupDescr";
        popupDiv.appendChild(popupDescrDiv);
        var popupViewBtn = document.createElement('button');
        popupViewBtn.className = 'wigo_ws_MarkerPopupViewBtn';
        popupViewBtn.setAttribute('data-key', ""); 
        popupViewBtn.innerHTML = "View Trail";
        popupViewBtn.addEventListener('click', PopupViewBtnClicked, false);
        popupDiv.appendChild(popupViewBtn);
    }
    var pathMarkers = new PathMarkers();

    // Object for animating a path. 
    function PathAnimator() {
        
        // Start the animation from the beginning of the path. 
        // Arg:
        //  pathLayer: L.PolyLine object for the path.
        this.start = function(pathLayer) {
            this.stop(); // Ensure stopped and cleared.
            this.clear(); 
            // Create the animation marker and start it traveling traveling along the path.
            marker = L.animatedMarker(pathLayer.getLatLngs(), {
                        icon: travelIcon,
                        autoStart: true,
                        distance: pathDistance, 
                        interval: pathInterval, 
                        onEnd: function() {
                            // Use fade out at end of trail to better show end of trail.
                            $(this._shadow).fadeOut();
                            $(this._icon).fadeOut(3000, function(){
                                Clear();;
                            });
                            // Clear(); To not use fade out, remove fade code above and just Clear() here.
                        }
                    });
            map.addLayer(marker);
        };

        // Stop animation that is traveling along the path.
        this.stop = function() {
            if (marker) {
                marker.stop();
            }
        };

        // Removes animation icon for traveling along a path from the map.
        this.clear = function() {
            Clear();
        };

        // Boolean. flag that indicates if automation of path should start automatically
        // when a path is loaded (displayed). 
        // Note: Check this flag and call this.start(pathLayer) if flag is true.
        //       Instead you may definitely want to animate path, in wich case call this.start(pathLayer) regardless.
        this.bAutoStart = false;
    
        // Distance of path. Defaults to 300 in meters.
        var pathDistance = 300;  

        // Number of milliseconds to move from one point next along path..
        var pathInterval = 2000; 
        // Minimum number of milliseconds for pathInterval.
        var minPathInterval = 10; 

        // Set rate for icon traveling along the path.
        // Args:
        //  mDistance: number. total meters for path.
        //  nPoints; number of points in the path.
        //  nSecodns: number. total seconds for icon to travel the path.
        this.setAnimationRate = function(mDistance, nPoints, nSeconds) {
            nPoints--;
            if (nPoints < 1) 
                nPoints = 1;
            pathDistance = mDistance;
            pathInterval = nSeconds / nPoints * 1000;
            if (pathInterval < minPathInterval)
                pathInterval = minPathInterval;
        }

        // icon to show traveling along the path.
        var travelIcon = L.icon({
            iconUrl: 'img/marker-bike-green-shadowed.png',
            iconSize: [25, 39],
            iconAnchor: [12, 39],
            shadowUrl: null
        });    
        
        var marker = null; // L.animatedMarker object to show on map.

        // Clear animator icon from map.
        function Clear() {
            if (marker) {
                marker.stop();  
                map.removeLayer(marker);
                marker = null;
            }
        }
    }
    var pathAnimator = new PathAnimator();
}
