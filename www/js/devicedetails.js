'use strict';
/* 
Copyright (c) 2015, 2016 Robert R Schomburg
Licensed under terms of the MIT License, which is given at
https://github.com/bobbyray/MitLicense/releases/tag/v1.0
*/
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
    var nDevice = app.deviceDetails.DeviceEnum().android;
    ////20161023 Undo iphone
    // var nDevice = app.deviceDetails.DeviceEnum().iPhone;
    return nDevice;
}