/* 
Copyright (c) 2015, 2016, 2018 Robert R Schomburg
Licensed under terms of the MIT License, which is given at
https://github.com/bobbyray/MitLicense/releases/tag/v1.0
*/
// Object for web api to access GeoPaths.
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

        EncodeGpxEl(gpx); // Encode special chars for passthru to server. 
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
    //      gpxList [out]: ref to array of wigo_ws_Gpx objects received.
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

    // Gets GpxGetList from server for paths within a geo rectangle.
    // Args
    //  sOwnerId: string for owner id.
    //  nShare: byte from eShare enumeration for type of sharing.
    //  gptSW: wigo_ws_GeoPt object for SouthWest corner of rectangle.
    //  gptNE: wigo_ws_GeoPt object for NorthEast corner of rectangle.
    //  ah: string for access handler for verification of owner.
    //  OnDone: Asynchronous completion handler. Signature:
    //      bOk: successful or not.
    //      gpxList [out]: ref to array of wigo_ws_Gpx objects received.
    //      sStatus: status message.
    //  Synchronous returns: boolean for get from server ok.
    this.GpxGetListByLatLon = function (sOwnerId, nShare, gptSW, gptNE, ah, onDone) {
        // Save async completion handler.
        if (typeof (onDone) === 'function')
            onGpxGetListByLatLon = onDone;
        else
            onGpxGetListByLatLon = function (bOk, gpxList, sStatus) { };
        var bOk = base.Get(eState.GpxGetListByLatLon, sGpxGetListByLatLonUri(sOwnerId, nShare, gptSW, gptNE, ah));
        return bOk;
    };

    //20180225 Add members for Record Stats.
    // Downloads list of record stats items from server.
    // Args
    //  sOwnerId: string for owner id.
    //  ah: string for access handler for verification of owner.
    //  OnDone: Asynchronous completion handler. Signature:
    //      bOk: successful or not.
    //      arStats [out]: ref to array of wigo_ws_GeoTrailRecordStats objects received.
    //      sStatus: status message
    //      Return: void
    //  Synchronous return: boolean. true indicates download successfully started.
    this.DownloadRecordStatsList = function (sOwnerId, ah, onDone) {
        // Save async completion handler.
        if (typeof (onDone) === 'function')
            onDownloadRecordStatsList = onDone;
        else
            onDownloadRecordStatsList = function (bOk, arStats, sStatus) { };
        var bOk = base.Get(eState.DownloadRecordStatsList, sDownloadRecordStatsListUri(sOwnerId, ah));
        return bOk;
    };

    // Uploads to web server a list of record stats items.
    // An item is replaced if it already exists at server, or is 
    // created if it does not exist.
    // Arg:
    //  sOwnerId: string for owner id.
    //  ah: string for access handler for verification of owner.
    //  arStats: ref to array of wigo_ws_GeoTrailRecordStats objs. the list to upload.
    //  onDone: Asynchronous completion handler. Signature:
    //      bOk: boolean: true for sucessful upload.
    //      sStatus: string: description for the upload result.
    //      Returns: void
    //  Synchronous return: boolean. true indicates download successfully started.
    // Remarks: If a database record already exists and is exactly the same as the arStats element,
    // the database is not written, only read.
    // If the arStats element does not exist in the database, it is inserted.
    this.UploadRecordStatsList = function (sOwnerId, ah, arStats, onDone) {  
        // Save async completion handler.
        if (typeof (onDone) === 'function')
            onUploadRecordStatsList = onDone;
        else
            onUploadRecordStatsList = function (bOk, sStatus) { };
        var bOk = base.Post(eState.UploadRecordStatsList, sUploadRecordStatsListUri(sOwnerId, ah), arStats);
        return bOk;
    };

    // Deletes at web server a list of record stats items.
    // Arg:
    //  sOwnerId: string for owner id.
    //  ah: string for access handler for verification of owner.
    //  arTimeStamp: ref to array of wigo_ws_GeoTrailTimeStamp objs. the list of timestamps identifying the record stats to delete.
    //  onDone: Asynchronous completion handler. Signature:
    //      bOk: boolean: true for sucessful deletion.
    //      sStatus: string: description for the deletion result.
    //      Returns: void
    //  Synchronous return: boolean. true indicates delete successfully started.
    // Remarks: It is not an error if a database record does not exist for an arStats element.
    this.DeleteRecordStatsList = function (sOwnerId, ah, arTimeStamp, onDone) { 
        // Save async completion handler.
        if (typeof (onDone) === 'function')
            onDeleteRecordStatsList = onDone;
        else
            onDeleteRecordStatsList = function (bOk, sStatus) { };
        var bOk = base.Post(eState.DeleteRecordStatsList, sDeleteRecordStatsListUri(sOwnerId, ah), arTimeStamp);
        return bOk;
    }

    // Authenticates user with the server.
    // Args 
    //  authData, json {accessToken, userID, userName}
    //      accessToken: string obtained from OAuth (Facebook) server for access token.
    //      userID: string for user ID obtained from OAuth server.
    //      userName: string for user name obtained from OAuth server.
    //  onDone, callback handler for authentication completed. Signature:
    //      result: AuthResult object: {status, accessHandle, userID, userName, msg}.
    //      See function AuthResult() below for details..
    //  bNetOnline: boolean, optional. true indicates internet access is available.
    //              Defaults to true if not given.     
    //              If false, calls onDone(errorResult):
    //                  errorResult.error = this.eAuthStatus.Error.
    //                  errorResult.msg set in indicate internet access is not available.
    //                  other errorResult fields are defautlts (empty strings).
    //                  Note: true is returned synchronously indicating that onDone() is called.     
    // Synchronous Return: boolean for successful post to server.
    // Note: OnDone handler called for asynchronous completion. 
    this.Authenticate = function (authData, onDone, bNetOnline) {
        // bNetOnline defaults to true if not given.
        if (typeof(bNetOnline) !== 'boolean') {
            bNetOnline = true; // Defaults to true.
        }
        if (!bNetOnline) { 
            // Call onDone(..) to indicate internet access is not availble.
            if (typeof(onDone) === 'function' ) {
                // errorResult = {userName: _userName, userID: _userID, accessToken: _accessToken, status: nStatus} 
                var errorResult = new AuthResult();
                errorResult.status = this.eAuthStatus().Error;
                errorResult.msg = "Internet access is not available.";
                onDone(errorResult);
            }
            return true; // Note: return true to indicate onDone(..) was called.
        }

        // Save async completion handler.
        if (typeof (onDone) === 'function')
            onAuthenticate = onDone;
        else
            onAuthenticate = function (status) { };
        // Post ajax to geopaths server.
        var bOk = base.Post(eState.Authenticate, sAuthenticateUri(), authData);
        return bOk;  ////20180329 added
    };

    // Logs out user with the server (revokes authentication).
    // Args:
    //  userID: string for owner id.
    //  accessHandle: string accessHandle saved when user authenticated.
    //  onDone: callback handler for logout completed.
    //  Handler signature:
    //      boolean indicating success.
    // Synchronous Return: boolean for successful post to server.
    // Note: OnDone handler called for asynchronous completion. 
    this.Logout = function (logoutData, onDone) {
        // Save async completion handler.
        if (typeof (onDone) === 'function')
            onLogout = onDone;
        else
            onLogout = function (bOk) { };
        // Post ajax to geopaths server.
        var bOk = base.Post(eState.Logout, sLogoutUri(), logoutData, onDone);
        return bOk; ////20180329 added
    };

    // Resets flag that indicates http request (get or post) is still in progress.
    // Note: May be needed if trying to issue subsequent requests fails due to 
    //       a previous request not completed. 
    this.ResetRequest = function() {  
        base.ResetRequest();
    };

    // Returns ref to enumeration object for sharing state of a record.
    // Returned obj: { public: 0, protected: 1, private: 2 }
    this.eShare = function () { return eShare; };

    // Returns ref to enumeration object for user login status when authorization has completed.
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
    var eState = { Initial: 0, GpxPut: 1, GpxGetList: 2, Authenticate: 3, Logout: 4, GpxDelete: 5, GpxGetListByLatLon: 6, 
                   DownloadRecordStatsList: 7, UploadRecordStatsList: 8, DeleteRecordStatsList: 9}; 

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
    //  sOwnerId: string for sOwnerId of wigo_ws_Gpx object.
    //  nShare: byte for eShare of Gpx object.
    //  ah: string for access handle used for verification of owner.
    function sGpxGetListUri(sOwnerId, nShare, ah) {
        if (!ah)
            ah = "none";
        var s = "gpxgetlist/" + sOwnerId + "/" + eShare.toStr(nShare) + "?ah=" + ah;
        return s;
    }

    // Returns relative URI for GpxPutListByLatLon api.
    // Args:
    //  sOwnerId: string for sOwnerId of Gpx object.
    //  nShare: byte for eShare of wigo_ws_Gpx object.
    //  gptSW: wigo_ws_GeoPt object for SouthWest corner.
    //  gptNE: wigo_ws_GeoPt object for NorthEast corner.
    //  ah: string for access handle used for verification of owner.
    function sGpxGetListByLatLonUri(sOwnerId, nShare, gptSW, gptNE, ah) {
        if (!ah)
            ah = "none";
        // var s = "gpxgetlist/" + sOwnerId + "/" + eShare.toStr(nShare) + "?ah=" + ah;
        var s = "gpxgetlistbylatlon/{0}/{1}?latSW={2}&lonSW={3}&latNE={4}&lonNE={5}&ah={6}".format(
                 sOwnerId, eShare.toStr(nShare),
                 gptSW.lat.toString(), gptSW.lon.toString(),
                 gptNE.lat.toString(), gptNE.lon.toString(),
                 ah);
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

    //20180227 addition for record stats
    // Returns relative URI for UploadRecordStatsList api.
    // Args:
    //  sOwnerId: string. owner id for stats.
    //  ah: string: access handle for server authentication verification.
    function sUploadRecordStatsListUri(sOwnerId, ah) {
        var s = "uploadrecordstatslist/{0}?ah={1}".format(sOwnerId, ah);
        return s;
    }

    // Returns relative URI for DeleteRecordStatsList api.
    // Args:
    //  sOwnerId: string. owner id for stats.
    //  ah: string: access handle for server authentication verification.
    function sDeleteRecordStatsListUri(sOwnerId, ah) {  
        var s = "deleterecordstatslist/{0}?ah={1}".format(sOwnerId, ah);
        return s;
    }

    // Returns relative URI for DownloadRecordStatsList api.
    // Args:
    //  sOwnerId: string. owner id for stats.
    //  ah: string: access handle for server authentication verification.
    function sDownloadRecordStatsListUri(sOwnerId, ah) {
        var s = "downloadrecordstatslist/{0}?ah={1}".format(sOwnerId, ah);
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

    // GpxGetListByLatLon has completed.
    // Handler signature:
    //  bOk: successful or not.
    //  gpxList [out]: ref to GpxList of Gpx objects received.
    //  sStatus: status message.
    //  Returns nothing.
    var onGpxGetListByLatLon = function (bOk, gpxList, sStatus) { };

    // DownloadRecordStatsList has completed asynchronously.
    // Handler Signature:
    //      bOk: successful or not.
    //      arStats [out]: ref to array of wigo_ws_GeoTrailRecordStats objects received.
    //      sStatus: status message.
    //      Return: void
    var onDownloadRecordStatsList = function (bOk, arStats, sStatus) { }; 

    // UploadRecordStatsList has completed asynchronously.
    // Handler Signature:
    //      bOk: boolean: true for sucessful upload.
    //      sStatus: string: description for the upload result.
    //      Returns: void
    var onUploadRecordStatsList = function (bOk, sStatus) { };

    // DeleteRecordStatsList has completed asynchronously.
    // Handler Signature:
    //      bOk: boolean: true for sucessful delete at server.
    //      sStatus: string: description for the delete result.
    //      Returns: void
    var onDeleteRecordStatsList = function (bOk, sStatus) { };

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
    // var base = new wigo_ws_Ajax("http://localhost:63651/Service.svc/"); // Local debug (works)
    //var base = new wigo_ws_Ajax("https://localhost:44301/Service.svc/"); // Local debug https not working!
    //20150808!!!! I cannot get the ajax requests to work locally with the IIS Express Server.
    //         IIS Express does work locally to get a page (https://localhost:44301/gpxpaths.html), 
    //         but the ajaxs requests for this api fail if https is used for the apis.
    //         I think the problem is a configuration problem with IIS Express,
    //         and that https for the ajax requests may work properly 
    //         at the (GoDaddy) remote host. For now, not using https for these apis.
    var base = new wigo_ws_Ajax("https://www.wigo.ws/geopathsx/Service.svc/"); // Remote host (Would like to try https)
    var bDebugging = typeof (bLocalDebug) === 'boolean' && bLocalDebug;   
    console.log("js/GeoPathsApi2.js bDebugging = " + bDebugging); 
    if (bDebugging) // If local debugging, use local IIS Express server. 
        base = new wigo_ws_Ajax("http://localhost:51765/Service.svc/");  
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
                        DecodeGpxList(gpxList);  
                        sStatus = "GpxGetList succeeded.";
                    } else {
                        gpxList = new Array();
                        sStatus = "Invalid response received for GpxGetList."
                    }
                } else {
                    sStatus = base.FormCompletionStatus(req);
                    gpxList = new Array();
                    if (req && req.readyState == 4 && req.status === 403) { 
                        sStatus = "Authentication failed. Sign In again because authorization has probably expired.";
                    }
                }
                onGpxGetList(bOk, gpxList, sStatus);
                break;
            case eState.GpxGetListByLatLon:
                var gpxList;
                if (bOk) {
                    if (req && req.readyState == 4 && req.status === 200) {
                        gpxList = JSON.parse(req.responseText);
                        DecodeGpxList(gpxList);  
                        sStatus = "GpxGetListByLatLon succeeded.";
                    } else {
                        gpxList = new Array();
                        sStatus = "Invalid response received for GpxGetListByLatLon."
                    }
                } else {
                    sStatus = base.FormCompletionStatus(req);
                    gpxList = new Array();
                    if (req && req.readyState == 4 && req.status === 403) {
                        sStatus = "Authentication failed. Sign In again because authorization has probably expired.";
                    }
                }
                onGpxGetListByLatLon(bOk, gpxList, sStatus);
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
                break;  ////20180329 added missing break
            case eState.UploadRecordStatsList:  
                if (bOk)
                    sStatus = "UploadRecordStatsList succeeded."
                else
                    sStatus = base.FormCompletionStatus(req);
                onUploadRecordStatsList(bOk, sStatus);
                break;
            case eState.DeleteRecordStatsList:  
                if (bOk)
                    sStatus = "DeleteRecordStatsList succeeded";
                else
                    sStatus = base.FormCompletionStatus(req);
                onDeleteRecordStatsList(bOk, sStatus);
                break;
            case eState.DownloadRecordStatsList: 
                var arStats;
                if (bOk) {
                    if (req && req.readyState == 4 && req.status === 200) {
                        arStats = JSON.parse(req.responseText);
                        sStatus = "DownloadRecordStatsList succeeded.";
                    } else {
                        arStats = [];
                        sStatus = "Invalid response received for DownloadRecordStatsList."
                    }
                } else {
                    sStatus = base.FormCompletionStatus(req);
                    arStats = [];
                    if (req && req.readyState == 4 && req.status === 403) {
                        sStatus = "Authentication failed. Sign In again because authorization has probably expired.";
                    }
                }
                onDownloadRecordStatsList(bOk, arStats, sStatus)
                break;
        }
    };

    // Object to encode / decode chars that need to passthru transfer with web server.
    // Attribution: Stackover question: http://stackoverflow.com/questions/1219860/html-encoding-lost-when-attribute-read-from-input-field
    // Note: For this api, only single quote char and double quote char need to be translated to passthru.
    function PassThru() { 
        // Returns text with special chars replaced with corresponding html entity sequence.
        // Arg:
        //  str: string. plain text that may contain special characters the need to be encoded
        //               in order to pass through to web server.
        this.encode = function(str) {
            return str
                    // .replace(/&/g, '&amp;')  // Not needed.
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;')
                    // .replace(/</g, '&lt;')  // Not needed
                    // .replace(/>/g, '&gt;'); // Not needed.
                    };

        this.decode = function(str) {
            return str
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    // .replace(/&lt;/g, '<')  // Not needed
                    // .replace(/&gt;/g, '>')  // Not needed
                    //.replace(/&amp;/g, '&')  // Not needed
                    ;            
        };
    }
    var passThru = new PassThru(); 

    // Helper to encode gpx element for passthru.
    // Arg:
    //  gpxEl: wigo_ws_Gpx obj. ref to element to encode.
    function EncodeGpxEl(gpxEl) {  
        gpxEl.sName = passThru.encode(gpxEl.sName); 
    }

    // Helper to decode gpx element for passthru.
    // Arg:
    //  gpxEl: wigo_ws_Gpx obj. ref to element to decode.
    function DecodeGpxEl(gpxEl) {
        gpxEl.sName = passThru.decode(gpxEl.sName);
    }

    // Helper to decode gpx elements for passthru.
    // Arg:
    //  gpxList: array of wigo_ws_Gpx objs. ref to elements to decode.
    function DecodeGpxList(gpxList) {  
        for (var i=0; i < gpxList.length; i++) {
            DecodeGpxEl(gpxList[i]);
        }
    }
}

// Objects for wigo_ws_GeoPaths

// Geolocation point.
function wigo_ws_GeoPt() {
    this.lat = 0.0;
    this.lon = 0.0;
}

// Object for finding corners of bounding
// rectangle for array of wigo_ws_GeoPt elements.
wigo_ws_GeoPt.Corners = function () {  
    // Southwest corner of bounding rectangle.
    this.gptSW = new wigo_ws_GeoPt();
    this.gptSW.lat = 91.0;   // Set to min lat below. -90 <= lat <= 90 degrees.
    this.gptSW.lon = 181.0;   // Set to min lon below. 180 <= lon <= 180 degrees.

    // Northeast corner of bounding rectangle.
    this.gptNE = new wigo_ws_GeoPt();
    this.gptNE.lat = -91.0;   // Set to max lat below.
    this.gptNE.lon = -181.0;  // Set to max lon below.

    // Updates corners based on a GeoPt obj.
    // Arg:
    //  geoPt: wigo_ws_GeoPt object for updating the corners.
    this.Update = function (geoPt) {
        // Update SW and NE corner of rectangle enclosing the path.
        if (geoPt.lat < this.gptSW.lat)
            this.gptSW.lat = geoPt.lat;
        if (geoPt.lat > this.gptNE.lat)
            this.gptNE.lat = geoPt.lat;
        if (geoPt.lon < this.gptSW.lon)
            this.gptSW.lon = geoPt.lon;
        if (geoPt.lon > this.gptNE.lon)
            this.gptNE.lon = geoPt.lon;
    };
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

// Static function to fill a wigo_ws_Gpx object from an array of wigo_ws_GeoPt elements.
// Sets the xmlData, gptBegin, gptEnd, gptSW, and gptNE properties of wigo_ws_Gpx object.
// Args:
//  gpx: ref to wigo_ws_Gpx object to fill. (It must already exist.)
//  arGeoPt: array of GeoPt elements defining the path. These geo points are converted
//           to a string of xml assigned to xmlData.
wigo_ws_Gpx.FillGeoPts = function (gpx, arGeoPt) { 
    // Generates an xml document object for an array of GeoPts.
    // Returns {xml: xml DOM, gpt

    // Helper function for forming xml doc from arGeoPt.
    // Returns a new node for the xml structure.
    // Args:
    //  name: string for node name.
    //  arAttr: Optional, Array of array[2]. May be null or undefined.
    //    Array element: 
    //      [0]: string for attribute name.
    //      [1]: string for value of attribute.
    //  child: Optional. Node for a child node or string for a child text node.
    function NewNode(name, arAttr, child) {
        var node = doc.createElement(name);
        if (arAttr) {
            var attrName, attrValue, attrEl;
            for (var i = 0; i < arAttr.length; i++) {
                attrEl = arAttr[i];
                attrName = arAttr[i][0];
                attrValue = arAttr[i][1];
                node.setAttribute(attrName, attrValue);
            }
        }

        if (child) {
            if (typeof child == 'string') {
                child = doc.createTextNode(child);
            }
            node.appendChild(child);
        }

        return node;
    };

    // Helper function for forming xml doc from arGeoPt.
    // Appends a new rtept node (route pt node) to a parent rte node.
    // Args:
    //  rteNode: ref to parent rte node.
    //  name: name of rtept node.
    //  lat: number for latitude of route point.
    //  lon: number longitude of route point.
    function AppendRtePtNode(rteNode, ix, lat, lon) {
        var attrLat = ['lat', lat.toString()];
        var attrLon = ['lon', lon.toString()];
        var arAttr = [attrLat, attrLon];
        var nameNode = NewNode("name", null, ix.toString());
        var node = NewNode("rtept", arAttr, nameNode);
        rteNode.appendChild(node);
    }

    // Create empty xml DOM object whose root element is named xml.
    //OkForChrome var doc = document.implementation.createDocument(null, "xml", null);
    // For IE need to specify name space URI, which is ok for Chrome too.
    var doc = document.implementation.createDocument("http://www.w3.org/1999/xhtml", "xml", null);
    var xml = doc.documentElement; // Root element.
    // Note: For IE if name space URI is not given, the xml.outerHTML is undefined
    // although for Chrome xml.outerHTML is defined. xml.outerHTML is used to get
    // the serialized string of xml.
    xml.setAttribute("version", "1.0");

    // Append gpx node to xml root.
    var gpxNode = NewNode("gpx");
    gpxNode.setAttribute("version", "1.0");
    xml.appendChild(gpxNode);

    // Append rte (route) node to gpx node.
    var rteNameNode = NewNode("name", null, "hillmap"); // Child name node for rte node.
    var rteNode = NewNode("rte", null, rteNameNode);
    gpxNode.appendChild(rteNode);

    // Set begin and end GeoPt in gpx.
    if (arGeoPt.length > 0) {
        gpx.gptBegin.lat = arGeoPt[0].lat;
        gpx.gptBegin.lon = arGeoPt[0].lon;
        var iEnd = arGeoPt.length - 1;
        gpx.gptEnd.lat = arGeoPt[iEnd].lat;
        gpx.gptEnd.lon = arGeoPt[iEnd].lon;
    }

    // Append rtept (route point) nodes to rte node, one for element of arGeoPt.
    var corners = new wigo_ws_GeoPt.Corners();
    for (var i = 0; i < arGeoPt.length; i++) {
        gpt = arGeoPt[i];
        corners.Update(gpt); // Update bounding rectangle for route.
        AppendRtePtNode(rteNode, i, gpt.lat, gpt.lon);
    }
    // Set string for the xmlData in the gpx object.
    gpx.xmlData = xml.outerHTML;

    // Set corners of bounding rectangle of path in gpx object.
    gpx.gptSW.lat = corners.gptSW.lat;
    gpx.gptSW.lon = corners.gptSW.lon;
    gpx.gptNE.lat = corners.gptNE.lat;
    gpx.gptNE.lon = corners.gptNE.lon;

    console.log(xml);
}


// Object for Gpx Path defined by array of wigo_ws_GeoPt elements.
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

// wigo_ws_GeoTrailRecordStats in Model.js is object exchanged with 
// for stats for a recorded trail. 
// JavaScript Object                    Server Object
// wigo_ws_GeoTrailRecordStats          GeoTrailRecordStats
// [] of wigo_ws_GeoTrailRecordStats    GeoTrailRecordStatsList

// Object for exchanging with server statistics for a trail that has been recorded. 
// Note: Also used by Model2.js to save to localStorage.
function wigo_ws_GeoTrailRecordStats() {
    this.nTimeStamp = 0; // integer. Time value of javascript Date object as an integer. Creation timesamp.
    this.msRunTime = 0;  // number. Run time for the recorded path in milliseconds.
    this.mDistance = 0;  // number. Distance of path in meters.
    this.caloriesKinetic = 0;      // number. Kinetic engery in calories to move body mass along the path.
    this.caloriesBurnedCalc = 0;   // number. Calories burned calculated by the GeoTrail app.
    //20180215 this.caloriesBurnedActual = 0; // Removed. 
}

// Static function that copies one wigo_ws_GeoTrailRecordStats obj to another.
// Args:
//  to:   wigo_ws_GeoTrailRecordStats obj assigned to (the target).
//  from: wigo_ws_GeoTrailRecordStats obj assigned from (the source).
wigo_ws_GeoTrailRecordStats.Copy = function(to, from) {  ////20180327 added
    if (to instanceof wigo_ws_GeoTrailRecordStats && from instanceof wigo_ws_GeoTrailRecordStats) {
        to.nTimeStamp = from.nTimeStamp; // integer. Time value of javascript Date object as an integer. Creation timesamp.
        to.msRunTime = from.msRunTime;  // number. Run time for the recorded path in milliseconds.
        to.mDistance = from.mDistance;  // number. Distance of path in meters.
        to.caloriesKinetic = from.caloriesKinetic;      // number. Kinetic engery in calories to move body mass along the path.
        to.caloriesBurnedCalc = from.caloriesBurnedCalc;   // number. Calories burned calculated by the GeoTrail app.
    }
}

// Object for exchanging with server a timestamp.
function wigo_ws_GeoTrailTimeStamp(nTimeStamp) {
    this.nTimeStamp = 0; // integer for Date value in milliseconds.
    if (typeof nTimeStamp === 'number')
        this.nTimeStamp = nTimeStamp;
}


