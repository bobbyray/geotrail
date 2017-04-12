'use strict';
/* 
Copyright (c) 2015, 2016 Robert R Schomburg
Licensed under terms of the MIT License, which is given at
https://github.com/bobbyray/MitLicense/releases/tag/v1.0
*/

// Initialize a Wigo_Ws_CordovaDeviceDetails object for type of device.
// Arg:
//  deviceDetails: Wigo_Ws_CordovaDeviceDetails object to initialize.
// Remarks
// Set this file for Android or iPhone. The same file name is used
// to build for android or ios, but the file content is different.
function Wigo_Ws_InitDeviceDetails(deviceDetails) {
    // Set type of device, android or iPhone.
    deviceDetails.setDevice(deviceDetails.DeviceEnum().android);
}