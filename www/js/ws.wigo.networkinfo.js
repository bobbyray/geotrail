'use strict';
/* 
Copyright (c) 2017 Robert R Schomburg
Licensed under terms of the MIT License, which is given at
https://github.com/bobbyray/MitLicense/releases/tag/v1.0
*/
// Wrapper object for cordova-plugin-network-information.
// Provides simplified access to the plugin. 
// Use the plugin directly if the wrapper is too simple
// for your needs. 
function wigo_ws_NetworkInformation() {
    // Returns true if internet is available via wifi or cell access.
    this.isOnline = function() {
        var bOnline = this.isCellOnline() || this.isWiFiOnline();
        return bOnline;
    };

    // Returns true if internet is available via cell tower access.
    this.isCellOnline = function() {
        var bOnline = GetTypeDescr().indexOf("Cell") !== -1;
        return bOnline;
    };

    // Returns true if internet is available via wifi access.
    this.isWiFiOnline = function() {
        var bOnline = GetTypeDescr().indexOf("WiFi") !== -1;
        return bOnline;
    }; 

    // Returns string that describes things to try to get the internet connected.
    // Note: string uses html.
    this.getBackOnlineInstr = function() {  
        var sInstr = "If the internet should be available, try the following in your phone settings.";
        sInstr += "<ul>";
        sInstr += "<li>Turn off WiFi and then turn WiFi on again, or</li>";
        sInstr += "<li>if this did not work, leave WiFi off and use your cell network instead.</li>";
        sInstr += "</ul>";
        return sInstr;
    };

    // Returns string describing current network state.
    // Note: Returns empty state is current network state is not defined.
    function GetTypeDescr() {
        InitStatesOnce();  
        var networkState = navigator.connection.type;
        var sNetworkType = states[networkState];
        if (typeof(sNetworkType) !== 'string') 
            sNetworkType = "";            
        return sNetworkType;
    }


    // Sets var states to list of network connection states.
    function InitStatesOnce() {
        if (!states && Connection) {
            states = {};
            states[Connection.UNKNOWN]  = 'Unknown connection';
            states[Connection.ETHERNET] = 'Ethernet connection';
            states[Connection.WIFI]     = 'WiFi connection';
            states[Connection.CELL_2G]  = 'Cell 2G connection';
            states[Connection.CELL_3G]  = 'Cell 3G connection';
            states[Connection.CELL_4G]  = 'Cell 4G connection';
            states[Connection.CELL]     = 'Cell generic connection';
            states[Connection.NONE]     = 'No network connection';
        }
    }
    var states = null; // Object for list of network connection states.  
    // Note: It may take awhile for the Connection plugin object to be created.
    // Therefore InitStatesOnce() is called to create states if need be. 
}

// Creates and returns a wigo_ws_NetworkInformation Object.
// Arg:
//  bIos: boolean. If true returns dummy replacement for wigo_ws_NetworkInformation object that always indicates online.
//                 If falses returns wigo_ws_NetworkInformation object.
// Note: // cordova-plugin-network-information is not working for ios. Hangs app at start up.
function wigo_ws_NewNetworkInformation(bIos) {
    if (typeof(bIos) !== 'boolean')
        bIos = false;
    var networkInfo;
    if (bIos) {
        networkInfo = {isOnline: function(){return this.isCellOnline() || this.isWiFiOnline();}, isCellOnline: function(){return true;}, 
        isWiFiOnline: function(){return true;}, getBackOnlineInstr: function(){return ""}};  
    } else { 
        networkInfo = new wigo_ws_NetworkInformation(); 
    }
    return networkInfo;
}
