﻿
function wigo_ws_GeoPathsRESTfulApi() {
    // ** Public methods.

    // Puts a Gpx object to the server.
    // Returns true immediately if async request is sent, false if request is in progress.
    // Args
    //  gpx: Gpx object to send to server.
    //  ah: string for access handler for verification of owner.
    //  onDone: callback handler called when put completes. Signature:
    //      bOk: boolean for success.
    //      sStatus: string for status message. Describes error bOk false.
    this.GpxPut = function (gpx, ah, onDone) {
        // Save async completion handler.
        if (typeof (onDone) === 'function')
            onGpxPut = onDone;
        else
            onGpxPut = function (bOk, sStatus) { };

        var bOk = base.Post(eState.GpxPut, sGpxPutUri(ah), gpx);
        return bOk;
    };

    // Deletes a Gpx data record at the server.
    // Returns true immediately if async request is sent, false if request is in progress.
    // Args
    //  gpxId: {sOwnerId: string, nId: integer}
    //      sOwnerId is owner id of record to delete.
    //      nId is unique record id of record to delete.
    //  ah: string for access handler for verification of owner.
    //  onDone: callback handler called when delete completes. Signature:
    //      bOk: boolean for success.
    //      sStatus: string for status message. Describes error bOk false.
    this.GpxDelete = function (gpxId, ah, onDone) { 
        // Save async completion handler.
        if (typeof (onDone) === 'function')
            onGpxDelete = onDone;
        else
            onGpxDelete = function (bOk, sStatus) { };

        var bOk = base.Post(eState.GpxDelete, sGpxDeleteUri(ah), gpxId);
        return bOk;
    };

    // Gets GpxGetList from server.
    // Args
    //  sOwnerId: string for owner id.
    //  nShare: byte from eShare enumeration for type of sharing.
    //  ah: string for access handler for verification of owner.
    //  OnDone: Asynchronous completion handler. Signature:
    //      bOk: successful or not.
    //      gpxList [out]: ref to GpxList of Gpx objects received.
    //      sStatus: status message.
    //  Synchronous returns: boolean for get from server ok.
    this.GpxGetList = function (sOwnerId, nShare, ah, onDone) {
        // Save async completion handler.
        if (typeof (onDone) === 'function')
            onGpxGetList = onDone;
        else
            onGpxGetList = function (bOk, gpxList, sStatus) { };
        var bOk = base.Get(eState.GpxGetList, sGpxGetListUri(sOwnerId, nShare, ah));
        return bOk;
    };

    // Authenticates user with the server.
    // Args 
    //  authData, json {accessToken, userID, userName}
    //      accessToken: string obtained from OAuth (Facebook) server for access token.
    //      userID: string for user ID obtained from OAuth server.
    //      userName: string for user name obtained from OAuth server.
    //  onDone, callback handler for authentication completed. 
    //  Handler Signature, json {status, accessHandle, msg}:
    //      status: integer for status define by this.EAuthStatus.
    //      accessHandle: string for access handle (user identifier) from GeoPaths server.
    //      msg: string describing the status.
    // Synchronous Return: boolean for successful post to server.
    // Note: OnDone handler called for asynchronous completion. 
    this.Authenticate = function (authData, onDone) {
        // Save async completion handler.
        if (typeof (onDone) === 'function')
            onAuthenticate = onDone;
        else
            onAuthenticate = function (status) { };
        // Post ajax to geopaths server.
        var bOk = base.Post(eState.Authenticate, sAuthenticateUri(), authData);
    };

    // Logs out user with the server (revokes authentication).
    // Args:
    //  userID: string for owner id.
    //  accessHandle: string accessHandle saved when user authenticated.
    //  onDone: callback handler for logout completed.
    //  Handler signature:
    //      boolean indicating success.
    this.Logout = function (logoutData, onDone) {
        // Save async completion handler.
        if (typeof (onDone) === 'function')
            onLogout = onDone;
        else
            onLogout = function (bOk) { };
        // Post ajax to geopaths server.
        var bOk = base.Post(eState.Logout, sLogoutUri(), logoutData, onDone);
    }

    // Returns enumeration object for sharing state of a record.
    // Returned obj: { public: 0, protected: 1, private: 2 }
    this.eShare = function () { return eShare; };

    // Returns enumeration object for user login status when authorization has completed.
    this.eAuthStatus = function () { return eAuthStatus; };

    // Returns ref to enumeration object for sName duplication of Gpx object.
    this.eDuplicate = function () { return eDuplicate; };

    // ** Private members
    // Enumeration of for duplication of sName of Gpx object:
    //   NotDup = 0: Not a duplicate. No record with gpx.sName in database. 
    //   Match = 1: Matched record in database by gpx.sName and gpx.nId. 
    //   Renamed = 2: Auto renamed to avoid duplication of name in database. 
    //   Dup = 3: Auto renamed failed. gpx.sName would be a duplicate. No update done. 
    //   Error = 4: Database access error. 
    var eDuplicate = { NotDup: 0, Match: 1, Renamed: 2, Dup: 3, Error: 4 };

    // Enumeration for api transfer state. 
    var eState = { Initial: 0, GpxPut: 1, GpxGetList: 2, Authenticate: 3, Logout: 4, GpxDelete: 5,};

    // Enumeration for login status return by OAuth server.
    // Note: same values as for FacebookAuthentication.eAuthResult (keep synced).
    var eAuthStatus = {
        Ok: 1,               // Authentication successfully verified.
        Failed: 0,           // Authentication failed.
        Canceled: -1,        // User canceled login (detected by client).
        Error: -2,           // Error occurred trying to authenticate.
        Expired: -3,         // Authorization expired.
        Logout: -4,          // User logged out (detected by client).
    }

    // Object for result from Authenticate() api.
    function AuthResult() {
        this.status = eAuthStatus.Error; // Status for result as given by eAuthStatus.
        this.accessHandle = ""; // Authentication access handle from server needed to access database.
        this.userID = ""; // User id of authenticated user.
        this.userName = ""; // User name of authenticated user.
        this.msg = ""; // Message describing result.
    }

    // Enumeration for sharing Gpx data.
    //  public: all people can access.
    //  protected: friends of owner access.
    //  private: friends of owner can access.
    //  any: don't care about share state when getting a record.
    //       Note: do not use any when putting a record.
    var eShare = {
        public: 0, protected: 1, private: 2, any: 3,
        toStr: function (nShare) { // Return nShare value as a string.
            var sShare;
            switch (nShare) {
                case eShare.public: sShare = "public"; break;
                case eShare.protected: sShare = "protected"; break;
                case eShare.private: sShare = "private"; break;
                case eShare.any: sShare = "any"; break;
                default: sShare = "private"; break;
            }
            return sShare;
        },
        toNum: function (sShare) { // Returns sShare string as a number.
            var nShare = this[sShare];
            if (nShare === undefined)
                nShare = this.private;
            return nShare;
        }
    };

    // Returns relative URI for the GpxPut api.
    // Arg ah is access handle.
    function sGpxPutUri(ah) {
        if (!ah)
            ah = "none";
        var s = "gpxput?ah={0}".format(ah);
        return s;
    }

    // Returns relative URI for the GpxDelete api.
    // Arg
    //  ah is string for access handle.
    function sGpxDeleteUri(ah) {   
        if (!ah)
            ah = "none";
        var s = "gpxdelete?ah={0}".format(ah);
        return s;
    }

    // Returns relative URI for GpxPutList api.
    // Args:
    //  sOwnerId: string for sOwnerId of Gpx object.
    //  nShare: byte for eShare of Gpx object.
    //  ah: string for access handle used for verification of owner.
    function sGpxGetListUri(sOwnerId, nShare, ah) {
        if (!ah)
            ah = "none";
        var s = "gpxgetlist/" + sOwnerId + "/" + eShare.toStr(nShare) + "?ah=" + ah;
        return s;
    }

    // Returns relative URI for Authenticate api.
    function sAuthenticateUri() {
        var s = "authenticate";
        return s;
    }

    // Returns relative URI for Logout api.
    function sLogoutUri() {
        var s = "logout";
        return s;
    }

    // ** Async completion event handlers
    // Note: Initialized to empty handlers.
    //       Caller of api method (GpxPut, GpxGetList, etc.) provides the 
    //       async completion handler.

    // GpxPut has completed.
    // Handler signature:
    //  bOk: successful or not.
    //  sStatus: string
    //      For bOk false:  status code and error message (do not parse with JSON.parse(..).
    //      For bOk true: string needs to be parsed with JSON.parse(..) to give object:
    //          {eDup: int, sName: string, sMsg: string}
    //              eDup values: See eDuplicate enuneration. 
    //              sName: resulting name. May be same name or renamed.
    //              sMsg: message describing eDup value.
    //  Returns nothing.
    var onGpxPut = function (bOk, sStatus) { };

    // GpxDelete has completed.
    // Handler signature:
    //  bOk: successful or not.
    //  sStatus: status message.
    //  Returns nothing.
    var onGpxDelete = function (bOk, status) { };  

    // GpxGetList has completed.
    // Handler signature:
    //  bOk: successful or not.
    //  gpxList [out]: ref to GpxList of Gpx objects received.
    //  sStatus: status message.
    //  Returns nothing.
    var onGpxGetList = function (bOk, gpxList, sStatus) { };

    // Authentication has completed.
    // Handler signature:
    //  status: ref to authentication status received.
    var onAuthenticate = function (status) { };

    // Logout has completed.
    // Handler signature:
    //  bOk: boolean indicated success.
    var onLogout = function (bOk) { };


    var that = this; // Ref to this for private members.

    // Set object for core Ajax funcitons (kind of like a protected base class).
    // Choose base service address for local debug or remote host.
    //var base = new wigo_ws_Ajax("Service.svc/"); // Local debug (works)
    //var base = new wigo_ws_Ajax("http://localhost:54545/Service.svc/"); // Local debug (works)
    //var base = new wigo_ws_Ajax("https://localhost:44301/Service.svc/"); // Local debug https not working!
    var base = new wigo_ws_Ajax("http://www.wigo.ws/geopaths/Service.svc/"); // Remote host (Would like to try https)
    //20150808!!!! I cannot get the ajax requests to work locally with the IIS Express Server.
    //             IIS Express does work locally to get a page (https://localhost:44301/gpxpaths.html), 
    //             but the ajaxs requests for this api fail if https is used for the apis.
    //             I think the problem is a configuration problem with IIS Express,
    //             and that https for the ajax requests may work properly 
    //             at the (GoDaddy) remote host. For now, not using https for these apis.

    // Handler in base class to handle completion of ajax request.
    base.onRequestServed = function (nState, bOk, req) {
        var sStatus = "";
        switch (nState) {
            case eState.GpxPut:
                if (bOk) {
                    sStatus = JSON.parse(req.responseText);
                    // Note: This JSON.parse() returns a string.
                    //       Parse the returned string to get object.
                } else {
                    sStatus = base.FormCompletionStatus(req);
                }
                onGpxPut(bOk, sStatus);
                break;
            case eState.GpxDelete:  
                if (bOk)
                    sStatus = "GpxDelete succeeded."
                else
                    sStatus = base.FormCompletionStatus(req);
                onGpxDelete(bOk, status);
                break;
            case eState.GpxGetList:
                var gpxList;
                if (bOk) {
                    if (req && req.readyState == 4 && req.status === 200) {
                        gpxList = JSON.parse(req.responseText);
                        sStatus = "GpxGetList succeeded.";
                    } else {
                        gpxList = new Array();
                        sStatus = "Invalid response received for GpxGetList."
                    }
                } else {
                    sStatus = base.FormCompletionStatus(req);
                    gpxList = new Array();
                    if (req && req.readyState == 4 && req.status === 403) { 
                        sStatus = "Authentication failed. Log out and Sign In again because authorization has probably expired.";
                    }
                }
                onGpxGetList(bOk, gpxList, sStatus);
                break;
            case eState.Authenticate:
                var authResult;
                if (bOk) {
                    if (req && req.readyState == 4 && req.status == 200) {
                        authResult = JSON.parse(req.responseText);
                    } else {
                        authResult = new AuthResult();
                        authResult.msg = "Invalid response received for Authenticate."
                    }
                } else {
                    authResult = new AuthResult();
                    authResult.msg = base.FormCompletionStatus(req);
                }
                onAuthenticate(authResult);
                break;
            case eState.Logout:
                var sLogoutMsg = base.FormCompletionStatus(req);
                onLogout(bOk, sLogoutMsg);
        }
    };
}

// Objects for wigo_ws_GeoPaths

// Geolocation point.
function wigo_ws_GeoPt() {
    this.lat = 0.0;
    this.lon = 0.0;
}

// Object to exchange Gpx record with server.
function wigo_ws_Gpx() {
    this.nId = 0;
    this.sOwnerId = "";
    this.eShare = 0; // byte enumeration for sharing record.
    this.sName = ""; // path name.
    this.gptBegin = new wigo_ws_GeoPt();
    this.gptEnd = new wigo_ws_GeoPt();
    this.gptSW = new wigo_ws_GeoPt();
    this.gptNE = new wigo_ws_GeoPt();
    //NO this.tModified = new Date(0); Do NOT use Date object. stringify does not work for ASP.NET.
    this.tModified = "/Date(0-0000)/"; // Time 0 string value for DateTime object at ASP.NET server.
    this.xmlData = "";
}

// Object for Gpx Path.
function wigo_ws_GpxPath() {
    this.ok = false; // Parse() successfully filled this object.
    // Beginning GeoPt of path.
    this.gptBegin = new wigo_ws_GeoPt();
    // Ending GeoPt of path.
    this.gptEnd = new wigo_ws_GeoPt();
    // SW GeoPt corner of enclosing rectangle for the path.
    this.gptSW = new wigo_ws_GeoPt();
    // NE GeoPt corner of enclosing rectangle for the path.
    this.gptNE = new wigo_ws_GeoPt();
    // Array of GeoPt objs for the path. arGeoPt[0] is beginning point.
    this.arGeoPt = new Array();

    // Parse a string of xml for Gpx data filling this object.
    // Returns true for success.
    // Arg:
    //  xmlData: string of xml from a gpx file.
    this.Parse = function (xmlData) {
        // Helper function to parse an xml element with lat, lon attributes
        // and to fill the arGeoPt array.
        function ParseLatLon(el) {
            // Note: el is the xml element, $(el) is the jquery object for the element.
            // Fill the array of track point from the xml document.
            var geoPt = new wigo_ws_GeoPt();
            geoPt.lat = parseFloat($(el).attr('lat'));
            geoPt.lon = parseFloat($(el).attr('lon'));
            if (geoPt.lat === NaN || geoPt.lon === NaN)
                return false; // Break loop on error.
            // Find SW and NE corner of rectangle enclosing the path.
            if (geoPt.lat < gptSW.lat)
                gptSW.lat = geoPt.lat;
            if (geoPt.lat > gptNE.lat)
                gptNE.lat = geoPt.lat;
            if (geoPt.lon < gptSW.lon)
                gptSW.lon = geoPt.lon;
            if (geoPt.lon > gptNE.lon)
                gptNE.lon = geoPt.lon;
            // The geo pt to the array.                
            arGeoPt.push(geoPt);
        }

        this.ok = true;
        var xmlDoc;
        try {
            xmlDoc = $.parseXML(xmlData); // a DOM element for the xml string.
        } catch (e) {
            this.ok = false;
        }
        if (!this.ok)
            return false;

        // Note: jp prefix indicates a jquery object selected from xmlGpx.
        var jqDoc = $(xmlDoc); // Get the jquery object for the xml document.
        var jqGpx = jqDoc.find('gpx');

        var gptSW = new wigo_ws_GeoPt();
        gptSW.lat = 91.0;   // Set to min lat below. -90 <= lat <= 90 degrees.
        gptSW.lon = 181.0;   // Set to min lon below. 180 <= lon <= 180 degrees.
        var gptNE = new wigo_ws_GeoPt();
        gptNE.lat = -91.0;   // Set to max lat below.
        gptNE.lon = -181.0;  // Set to max lon below.
        var arGeoPt = new Array(); // Array of wigo_ws_GeoPt elements.

        var jqRte = jqGpx.find('rte:first');
        
        var jqTrk = jqGpx.find('trk:first');
        var jqTrkSeg = jqTrk.find('trkseg:first');
        if (jqTrkSeg.length > 0) {
            // Parse Track from xml data.
            jqTrkSeg.find('trkpt').each(function (i) {
                // this is xml element for trkpt.
                ParseLatLon(this);
            });
        } else if (jqRte.length > 0) {
            // Parse Route from xml data.
            jqRte.find('rtept').each(function (i) {
                // this is xml element for rtept.
                ParseLatLon(this);
            });
        }

        this.arGeoPt = arGeoPt;
        this.gptSW = gptSW;
        this.gptNE = gptNE;
        this.ok = arGeoPt.length > 0;
        if (this.ok) {
            this.gptBegin = arGeoPt[0];
            this.gptEnd = arGeoPt[arGeoPt.length - 1];
        }
        return this.ok;
    };

    // Returns GeoPt for center of the enclosing rectangle.
    this.gptCenter = function () {
        var gpt = new wigo_ws_GeoPt();
        gpt.lat = (this.gptSW.lat + this.gptNE.lat) / 2.0;
        gpt.lon = (this.gptSW.lon + this.gptNE.lon) / 2.0;
        return gpt;
    }
}

// Static function to attach functions to wigo_ws_GpxPath object
// that does not have functions defined because the object has been
// restored from localStorage through the JSON.stringify()/Parse()
// transformation. 
// Arg:
//  me: wigo_ws_GpxPath object to which functions are attached.
wigo_ws_GpxPath.AttachFcns = function (me) {
    // Returns GeoPt for center of the enclosing rectangle.
    me.gptCenter = function () {
        var gpt = new wigo_ws_GeoPt();
        gpt.lat = (this.gptSW.lat + this.gptNE.lat) / 2.0;
        gpt.lon = (this.gptSW.lon + this.gptNE.lon) / 2.0;
        return gpt;
    };
    // May want to attach Parse(xmlData) also, but not needed now.
};


