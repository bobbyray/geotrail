# geotrail
#####Mobile phone app for geo location around a defined trail.
The [Apache / Cordova Platform](https://cordova.apache.org/) is used to build this app. The app has been built and tested only for an Android phone, v4.2.2. This app is in early stage of development and is only expected to be used by contributors. I installed Cordova, v5.0.0, on a Windows7 pc. A pc running Linux should work too.
#####To try this app
Note: [Apache / Cordova Platform](https://cordova.apache.org/) must be installed first.
#####
1. Clone or download this code to your personal computer (pc).
   * clone
     * cd to a directory to hold this project.
     * git clone https://github.com/bobbyray/geotrail.git
     * Note: the subdirectory geotrail has the clone.
   * download
     * Download the zip file and unzip to a download directory.
2. Attach an Android phone to your pc by a USB cable.
3. Start a command line session on your pc.
4. Make geotrail the current directory in your clone or download folder to build and load the app on your phone:
 * cordova run android
 * Note: The first time on your phone you must accept loading the app.

#####
This app and its plugins and modules are open source code. Refer to License file for more details.

#####Pebble App (Optional)
The [PebbleMsg app project](https://github.com/bobbyray/PebbleMsg) contains the code for the C program that runs in a Pebble watch. Import this project to the Cloud Pebble IDE to build and install on a Pebble watch.

#####Debugging the app
Chrome must be installed on the phone device and on your pc.

From Chrome on your pc:
* chrome://inspect/#devices
 * Port forwarding needs to be enabled in Chrome on your pc. Cick on the _Port Forwarding_ button to do so and for help. 
* Click on WebView ws.wigo.geotrail to debug the app.
 * The familiar Chrome Debugger showing the HTML, CSS, and javacript for the app appears in a separate Chrome window. 

