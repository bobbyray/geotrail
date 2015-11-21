
function wigo_ws_GeoPathsRESTfulApi() {
    // ** Public methods.

    // Puts a Gpx objecgt to the server.
    // Returns true immediately if async request is sent, false if request is in progress.
    // Args
    //  gpx: Gpx object to send to server.
    //  onDone: callback handler called when put completes. Signature:
    //      bOk: boolean for success.
    //      sStatus: string for status message. Describes error bOk false.
    this.GpxPut = function (gpx, onDone) {
        // Save async completion handler.
        if (typeof (onDone) === 'function')
            onGpxPut = onDone;
        else
            onGpxPut = function (bOk, sStatus) { };

        var bOk = base.Post(eState.GpxPut, sGpxPutUri(), gpx);
        return bOk;
    };

    
    this.GpxGetList = function (sOwnerId, nShare, onDone) {
        // Save async completion handler.
        if (typeof (onDone) === 'function')
            onGpxGetList = onDone;
        else
            onGpxGetList = function (bOk, gpxList, sStatus) { };
        var bOk = base.Get(eState.GpxGetList, sGpxGetListUri(sOwnerId, nShare));
    };

    // Returns enumeration object for sharing state of a record.
    // Returned obj: { public: 0, protected: 1, private: 2 }
    this.eShare = function () { return eShare; };

    // ** Private members
    // Enumeration for api transfer state.
    var eState = { Initial: 0, GpxPut: 1, GpxGetList: 2 };

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
    function sGpxPutUri() {
        var s = "gpxput";
        return s;
    }

    // Returns relative URI for GpxPutList api.
    // Args:
    //  sOwnerId: string for sOwnerId of Gpx object.
    //  nShare: byte for eShare of Gpx object.
    function sGpxGetListUri(sOwnerId, nShare) {
        var s = "gpxgetlist/" + sOwnerId + "/" + eShare.toStr(nShare);
        return s;
    }

    // ** Async completion event handlers
    // Note: Initialized to empty handlers.
    //       Caller of api method (GpxPut, GpxGetList, etc.) provides the 
    //       async completion handler.

    // GpxPut has completed.
    // Handler signature:
    //  bOk: successful or not.
    //  sStatus: status message.
    //  Returns nothing.
    var onGpxPut = function (bOk, sStatus) { };

    // GpxGetList has completed.
    // Handler signature:
    //  bOk: successful or not.
    //  gpxList [out]: ref to GpxList of Gpx objects received.
    //  sStatus: status message.
    //  Returns nothing.
    var onGpxGetList = function (bOk, gpxList, sStatus) { };


    var that = this; // Ref to this for private members.

    // Set object for core Ajax funcitons (kind of like a protected base class).
    var base = new wigo_ws_Ajax("Service.svc/");

    // Handler in base class to handle completion of ajax request.
    base.onRequestServed = function (nState, bOk, req) {
        var sStatus = "";
        switch (nState) {
            case eState.GpxPut:
                if (bOk)
                    sStatus = "GpxPut succeeded."
                else 
                    sStatus = base.FormCompletionStatus(req);
                onGpxPut(bOk, sStatus);
                break;
            case eState.GpxGetList:
                var gpxList;
                if (bOk) {
                    if (req && req.readyState == 4 && req.status == 200) {
                        gpxList = JSON.parse(req.responseText);
                        sStatus = "GpxGetList succeeded.";
                    } else {
                        gpxList = new Array();
                        sStatus = "Invalid response received for GpxGetList."
                    }
                } else {
                    sStatus = base.FormCompletionStatus(req);
                    gpxList = new Array();
                }
                onGpxGetList(bOk, gpxList, sStatus);
                break;
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

        var jqTrk = jqGpx.find('trk:first');
        var jqTrkSeg = jqTrk.find('trkseg:first');
        jqTrkSeg.find('trkpt').each(function (i) {
            // Note: this is the xml element, $(this) is the jquery object for the element.
            // Fill the array of track point from the xml document.
            var geoPt = new wigo_ws_GeoPt();
            geoPt.lat = parseFloat($(this).attr('lat'));
            geoPt.lon = parseFloat($(this).attr('lon'));
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
        });

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


