'use strict';

// Returns type of type for a build.
// Returns integer for type of device.
// Retmarks:
// The Wigo_Ws_CordovaDeviceDetails object in app.deviceDetails 
// has the enumeration for devices. Return the appropiate one 
// for the GeoTrail project being built.
// For the iPhone, the device type return needs to be iPhone.
// For Android phone, the device type return needs to be android.
// This devicedetails.js file has the same name for android and iPhone
// builds, but the content is different.   
function Wigo_Ws_getDeviceType() {
    //var nDevice = app.deviceDetails.DeviceEnum().android;
    var nDevice = app.deviceDetails.DeviceEnum().iPhone;
    return nDevice;
}