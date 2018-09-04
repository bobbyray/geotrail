/**
 * Attribution: 08/21/2018 Stack Overflow Solution to problem  https://stackoverflow.com/questions/51086462/cordova-8-android-7-1-0-cant-install-any-plugins
 * This hook overrides a function check at runtime. Currently, cordova-android 7+ incorrectly detects that we are using
 * an eclipse style project. This causes a lot of plugins to fail at install time due to paths actually being setup
 * for an Android Studio project. Some plugins choose to install things into 'platforms/android/libs' which makes
 * this original function assume it is an ecplise project.
 */
module.exports = function(context) {
    if (context.opts.cordova.platforms.indexOf('android') < 0) {
      return;
    }
  
    const path = context.requireCordovaModule('path');
    ////20180821 const androidStudioPath = path.join(context.opts.projectRoot, 'platforms/android/cordova/lib/AndroidStudio');
    const androidStudioPath = path.join(context.opts.projectRoot, 'platforms/android/cordovaLib/AndroidStudio');
    const androidStudio = context.requireCordovaModule(androidStudioPath);
    androidStudio.isAndroidStudioProject = function() {  return true; };
  };