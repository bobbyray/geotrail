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
    // Returns true is internet is available via wifi or cell access.
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

    // Returns string describing current network state.
    // Note: Returns empty state is current network state is not defined.
    function GetTypeDescr() {
        var networkState = navigator.connection.type;
        var sNetworkType = states[networkState];
        if (typeof(sNetworkType) !== 'string') 
            sNetorkType = "";
        return sNetworkType;
    }


    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';

}
