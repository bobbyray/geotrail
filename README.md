# geotrail
##### Mobile phone app for geo location around a defined trail.
The [Apache / Cordova Platform](https://cordova.apache.org/) is used to build this app. The app has been built and tested for Android phones, v4.2.2 and v7.1.2. The project also uses Android Studio so that java code for plugins can be written and debugged. A pc running Linux should work too.

There is also a version for the iPhone in the [geotrail-pgb repository](https://github.com/bobbyray/geotrail-pgb).
#### To try this app
Note: [Apache / Cordova Platform](https://cordova.apache.org/) must be installed first.
1. Clone or download this code to your personal computer (pc).
   * clone
     * Open a command line session.
     * cd to a directory to hold this project.
     * git clone https://github.com/bobbyray/geotrail.git
     * Note: the subdirectory geotrail has the clone.
   * download
     * Download the zip file and unzip to a directory.
   * Note: For Windows long paths can be a problem. Therefore the target directory needs a very short path, for example c:\a. In this example, c:\a\geotrail is the cordova project directory.
2. Attach an Android phone to your pc by a USB cable.
3. Start a command line session on your pc if need be.
4. Make geotrail the current directory to build and load the app on your phone:
 * cordova run android
 * Note: The first time on your phone you must accept loading the app.
5. Optionally install Android Studio. See [Android Studio for Developers](https://developer.android.com/studio).
 * Java Development Kit must be installed first before the Android Studio is installed. I used [Java SE 8 Development Kit for Windows](http://www.oracle.com/technetwork/java/javase/downloads/index-jsp-138363.html).
 * Import geotrail/platforms/android into Android Studio.  (Open Android Studio and close any project that may be open first.)
6. You can build and run from the cordova command line or from Android Studio.
 * Be sure to make changes to source files in geotrail/www.
 * Execute "cordova run android" to build and run the changes from the command line.
 * Do NOT make changes to files in geotrail/platforms/android/assets/www because "cordova run android" always replaces that folder with files from geotrail/www.
 * The advantage of using Android Studio is that you can write and debug java code for plugins.
 * The Chrome remote debugger as described below is still used to debug the HTML and javascript; you cannot debug that code from Android Studio.

#####
This app and its plugins and modules are open source code. Refer to License file for more details.

##### Pebble App (Optional)
The [PebbleMsg app project](https://github.com/bobbyray/PebbleMsg) contains the code for the C program that runs in a Pebble watch. Import this project to the Cloud Pebble IDE to build and install on a Pebble watch.

##### Debugging the app
Chrome must be installed on the phone device and on your pc.

From Chrome on your pc:
* chrome://inspect/#devices
 * Port forwarding needs to be enabled in Chrome on your pc. Cick on the _Port Forwarding_ button to do so and for help. 
* Click on WebView ws.wigo.geotrail to debug the app.
 * The familiar Chrome Debugger showing the HTML, CSS, and javacript for the app appears in a separate Chrome window. 

#### Server Side Code
The [GeoPathsx project](https://github.com/bobbyray/GeoPathsx) is the repository for the server side code required by the GeoTrail app.
