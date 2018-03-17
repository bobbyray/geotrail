/* 
Copyright (c) 2018 Robert R Schomburg
Licensed under terms of the MIT License, which is given at
https://github.com/bobbyray/MitLicense/releases/tag/v1.0
*/

// Object for customization details about a device.
// Ideally an app will not needed any device customization,
// but it may be necesssary if some features are not available
// in a device.
function Wigo_Ws_CordovaDeviceDetails() {

    // Returns object that enumerations the devices.
    this.DeviceEnum = function() {
        return {android: 0, iPhone: 1, unknown: -1};
    };

    // Sets type of device.
    // eDevice: enumeration value from a DeviceEnum object.
    this.setDevice = function(eDevice) {
        switch(eDevice) {
            case deviceEnum.android: device = eDevice; break;
            case deviceEnum.iPhone: device = eDevice; break;
            default:
                device = deviceEnum.unknown; break;
        }
    }

    // Returns true if device is android.
    this.isAndroid = function() {
        var bAndroid = device === deviceEnum.android;
        return bAndroid;
    };

    // Returns true if device is iPhone.
    this.isiPhone = function() {
        var biPhone = device === deviceEnum.iPhone; 
        return biPhone;
    }
    
    // Enumeration obj for identifying devices.
    var deviceEnum = this.DeviceEnum();

    // Kind of device: integer from deviceEnum obj.
    var device = deviceEnum.unknown;
}


