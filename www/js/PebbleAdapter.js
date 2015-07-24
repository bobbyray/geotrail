'use strict';
// Object to access a Pebble watch from Javascript through
// the cordova-phonegap plugin for Pebble (see 
// https://github.com/konsumer/phonegap-pebble).
// Credit goes to the demo/phone/www/index.html example in the cordova-phonegap plugin 
// download from github, which made implementation of this object possible.
// Remarks:
// This object could be prototype for a derived adapter. The SendText(..) is
// specialized for this object and could be over-ridden in the derived
// object. Also other functions to send different types of data could be provided.
// Note: Currently (07/12/2015) I do not know how to define other type of Json elements 
//       for the dictionary sent. Only the type of 'string' is shown in the 
//       demo code.
function wigo_ws_PebbleAdapter(uuid) {

    // ** Properties

    // string for id of Pebble app that this adapter object accesses.
    // Construct sets this property to its uuid argument.
    // This property can also be set after construction.
    if (typeof (uuid) === 'string')
        this.uuid = uuid;
    else 
        this.uuid = '1ccd506b-4ea6-4db0-a1b4-9dabf488c0ef'; // Default app id.
    var that = this;

    // boolean that indicates accessing Pebble is enabled.
    // When not enabled, methods to access Pebble are no-ops.
    this.bEnabled = true;

    // boolean that indicates if sending data is in progress.
    this.IsSendBusy = function() {
        return bSendBusy;
    };

    // Resets busy so that this.SendData(..) will try to send data.
    // Remarks:
    //  Should not need to call this function because busy is reset
    //  when an acknowledgement, either ACK or NACK, is received from
    //  Pebble. This function is provided just in case busy gets
    //  stuck as being valid.
    this.ResetBusy = function(){
        bSendBusy = false;
    };

    // ** Pebble properties set when Pebble connects.
    //    Properities are cleared when Pebble disconnects.

    // string for Pebble version.
    this.Version = function() {
        return that.pebbleVersion;
    };

    // boolean that indicates if Pebble is connected.
    this.IsConnected = function() {
        return pebbleConnected;
    };

    // boolean that indicates if Pebble supports data logging.
    this.IsDataLoggingSupport = function() {
        return pebbleDataLoggingSupported;
    };

    // boolean that indicates if Pebble supports AppMessage.
    // Note: Current Pebbles (v2 or later) always support AppMessage, which 
    //       is nessecary for this adapter to function. Only early 
    //       Pebble version may not support AppMessage. 
    this.IsAppMessageSupported = function(){
        return pebbleAppMessageSupport;
    };

    // ** Methods to access Pebble.

    // Starts Pebble app. Ok to call if Pebble app is already running.
    // Arg:
    //  cbResult: asynchronous callback function for the result.
    //            Signature of callback:
    //              bOk: boolean that indicates app successfully started or 
    //                   was already running.
    this.StartApp = function (cbResult) {
        bSendBusy = false; // Clear busy flag just in case.
        Pebble.startApp(this.uuid,
            // success
            function () {
                console.log('Pebble.startApp', 'OK');
                if (typeof(cbResult) === 'function')
                    cbResult(true);
            },
            // error
            function () {
                console.log('Pebble.startApp', 'FAILED!');
                if (typeof(cbResult) === 'function')
                    cbResult(false);
            }
        );
    };

    // Closes Pebble app. Ok to call if Pebble app is already closed.
    // Arg:
    //  cbResult: asynchronous callback function for the result.
    //            Signature of callback:
    //              bOk: boolean that indicates app successfully closed or 
    //                   was not running.
    this.CloseApp = function(cbResult) {
        Pebble.closeApp(this.uuid,
            // success
            function () {
                console.log('Pebble.closeApp', 'OK');
                if (typeof(cbResult) === 'function')
                    cbResult(true);
            },
            // error
            function () {
                console.log('Pebble.closeApp', 'FAILED!');
                if (typeof(cbResult) === 'function')
                    cbResult(false);
            }
        );
    }


    // Sends text string and vibration count to Pebble.
    // Args:
    //  text: string for the text message.
    //  nVibes: integer, 0 .. 20, that indicated the number of vibrations.
    //      If nVibes is not a valid arg, the number of vibes is 1.
    //      Specify 0 for no vibration.
    //  cbResult: Optional. asynchronous callback function called upon receiving 
    //            a ACK or NACK from the Pebble app. Signature of callback:
    //              bAck: true for ACK received, false for NACK received.
    // Returns boolean synchronously: 
    //  true indicates sending has successfully been initiated.
    //  false indicates sending is in progress or this adapter is not enabled.
    // Remarks: 
    //  Only one text message can be sent at a time.  
    //  If sending is already in progess, a call to SendText() is ignored
    //  and false is returned.
    // Remarks for Pebble C app receiving this message:
    //  Two dictionary data elements are sent in the data.
    //  Element for key 0 is the text, type string for the value.
    //  Element for key 1 is the vibe count, type string for the value. 
    //      value is a string of 1 or 2 digits for an integer 
    //      limited to  0, 1, ... 20. (value needs to parsed to an unsigned integer).
    this.SendText = function(text, nVibes, cbResult) {
        var bSent = false;
        if (this.bEnabled && !bSendBusy) {
            bSendBusy = true;
            if (typeof(cbResult) === 'function') 
                onAckOrNack = cbResult;
            else 
                onAckOrNack = null;
            var nLength = text.length;
            console.log('sent ' + text);
            // Key: 0 => text, 1 => beep.
            var vibes = "1";
            if (typeof(nVibes) === 'number')
                if (nVibes >= 0 && nVibes <= 20)
                    vibes = nVibes.toFixed(0);

            Pebble.sendData(this.uuid, [{ type: 'string', key: 0, value: text, length: nLength },
                                        { type: 'string', key: 1, value: vibes, length: vibes.length }]);
            bSent = true;
        } 
        return bSent;
    };

    // ** Events fired by PebbleAdapter.
    //    Owner of this object assigned to these functions to handle events.

    // Enumeration of Pebble Button Ids.
    this.eButtonId = { Back: 0, Up: 1, Select: 2, Down: 3,
                             IsValid: function (n) {
                                var bOk = n >= this.Back && n <= this.Down;
                                return bOk;
                             }
                           };

    // Enumeration of type of Pebble button clicks.
    this.eClickType =   { Single: 1, Double: 2, Long: 3,
                          IsValid: function (n) {
                             var bOk = n >= this.Single && n <= this.Long;
                             return bOk;
                          }
                        };
    

    // Fired when a message is received from Pebble watch for a button click on the watch.
    // Arg: 
    //  nButtonId: integer. id for the button clicked as defined by this.eButtonId.
    //  nClickType: integer. Type of button click as defined by this.eClickType.
    this.onClickReceived = function (nButtonId, nClickType) { };

    // Fired when text is received.
    // Arg:
    //  sText: string. The texted received.
    this.onTextReceived = function (sText) { };


    // ** Private members
    var bSendBusy = false;

    // string for Pebble version.
    var pebbleVersion = "";
    
    // boolean that indicates if Pebble is connected.
    var pebbleConnected = false;
    
    // boolean that indicates if Pebble supports data logging.
    var pebbleDataLoggingSupported = false;
    
    // boolean that indicates if Pebble supports AppMessage. 
    var pebbleAppMessageSupport = false;

    // listeners for Pebble connect, update info
    document.addEventListener("Pebble.connect", function (e) {
        console.log('Pebble.connect', 'connected');
        bSendBusy = false;
        Pebble.firmware(function (info) {
            pebbleVersion = info.tag;

        });
        Pebble.isDataLoggingSupported(function (supported) {
            pebbleDataLoggingSupported = (supported) ? 'yes' : 'no';
        });
        Pebble.areAppMessagesSupported(function (supported) {
            pebbleAppMessageSupport = (supported) ? 'yes' : 'no';
        });
        pebbleConnected = true;
    });

    // listeners for Pebble disconnect
    document.addEventListener("Pebble.disconnect", function (e) {
        console.log('Pebble.disconnect', 'disconnected');
        bSendBusy = false;
        pebbleConnected = false;
        pebbleDataLoggingSupported = false;
        pebbleAppMessageSupport = false;
    });

    // listen for NACK messages from Pebble
    var onAckOrNack = null;
    document.addEventListener("Pebble.nack", function (e) {
        bSendBusy = false;
        console.log('NACK', e.detail);
        if (onAckOrNack)
            onAckOrNack(false); // false => NACK.
    });

    // listen for ACK messages from Pebble
    document.addEventListener("Pebble.ack", function (e) {
        bSendBusy = false;
        console.log('ACK', e.detail);
        if (onAckOrNack)
            onAckOrNack(true); // true => ACK.
    });

    // listen for data from Pebble
    document.addEventListener("Pebble.data", function (e) {
        var data = JSON.parse(e.detail.data);
        console.log('DATA', e.detail);

        // Element 0 is cmd: 'text' or 'click' 
        var cmd = data[0] && data[0].value ? data[0].value : null;
        if (cmd === 'text') {
            var sText = data[1] ? data[1].value : null;
            if (sText)
                that.onTextReceived(sText);
            console.log("Text from Pebble: ", sText);
        } else if (cmd === 'click') {
            // Element 1 is button id, element 2 is click type.
            var sLogMsg = "Pebble button click, ";
            var nClickType = null;
            var nButtonId = data[1] ? data[1].value : null;
            if (nButtonId)
                nClickType = data[2] ? data[2].value : null;
            if (nButtonId && nClickType) {
                if (that.eButtonId.IsValid(nButtonId) && that.eClickType.IsValid(nClickType)) {
                    that.onClickReceived(nButtonId, nClickType);
                } else {
                    sLogMsg = 'Invalid ' + sLogMsg;
                }
            }
            var sId_Type = ' id: {0}, type: {1}'.format(nButtonId, nClickType);
            console.log(sLogMsg, sId_Type);
        } else {
            console.log("Unknown cmd received from Pebble: ", cmd);
        }

        // Ack Pebble message. If Ack is not given, pebble detects timeout error,
        // which could be ignored. A comment by plugin author indicated sending
        // Ack here to Pebble might cause a problem, but sending Ack works fine for me.
        // In the Pebble code, the timeout error is detected as an indication that 
        // this phone app is not running.
        Pebble.sendAck(e.detail.transaction);
    });

    // tell java to listen for these
    Pebble.registerConnect();
    Pebble.registerDisconnect();
    Pebble.registerAck(this.uuid);
    Pebble.registerNack(this.uuid);
    Pebble.registerData(this.uuid);

    // Do not know what this TODO means?
    // TODO: unregister on pause, register on resume to prevent memory leaks

    // dispatch initial state of connection
    Pebble.isConnected(function (connected) {
        document.dispatchEvent(new CustomEvent('Pebble.' + (connected ? 'connect' : 'disconnect')));
    });
}
