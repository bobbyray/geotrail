'use strict';

/* Facebook instructions for setting up the Facebook SDK for Javascript
Setup the Facebook SDK for JavaScript
The following snippet of code will give the basic version of the SDK where the options are set to their most common defaults. You should insert it directly after the opening <body> tag on each page you want to load it:
<script>
  window.fbAsyncInit = function() {
    FB.init({
      appId      : '694318660701967',
      xfbml      : true,
      version    : 'v2.4'
    });
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
</script>

*/


// Object for FaceBook authenication.
// Arg
//  yourAppId: string for id of your Facebook app. 
//  Note: Facebook says it is ok to use the app id in client javascript.
// Remarks: Must provide this statement in html page right after body tag:
//      <script type="text/javascript" language="javascript" src='http://connect.facebook.net/en_US/sdk.js'></script>
function wigo_ws_FaceBookAuthentication(yourAppId) { 
    var that = this; // Ref to this FaceBookAuthentication obj for use by private functions.

    // Callback function that is called after authentication has completed.
    // Argument result: json
    //  userName: string for user name.
    //  userID: Facebook user id or empty string when authentication fails.
    //  accessToken: access token string acquired from FaceBook, or empty string
    //      when athentication fails or is cancelled.
    //  status: integer result of authentication, value of which is given 
    //      by this.EAuthResult.
    //  sError: error string when status indicates an error, otherwise empty string.
    this.callbackAuthenticated = function (result) { };

    // Enumeration of result for authentication:
    //  Error is internal error not expected to happen.
    //  Canceled means authentication was canceled rather than trying Facebook authentication.
    //  Failed means Facebook authentication was attempted but failed.
    //  bOk means authentication was successful.
    //  Expired means authentication expired (used by database server).
    //  Logout means user logged out and is not longer authenticated.
    // Note: same values as for GeoPathsRESTfulApi.eAuthStatus (keep synced).
    this.EAuthResult = { Logout: -4, Expired: -3, Error: -2, Canceled: -1, Failed: 0, Ok: 1 };

    // Does authentication with FaceBook.
    // this.callbackAuthenticated() is called when authentication is completed.
    // Argument: sLoginMsg is message shown if login for authentication is needed.
    // Remarks:
    // If user is already logged into FaceBook, authentication completes silently
    // and acquires an access token string. If user is not logged in, a div
    // (dialog) is presented to log into Facebook so that authentication
    // can be completed.
    // Note: same values as for GeoPathApi.eAuthResult (keep synced).
    this.Authenticate = function (sLoginMsg) {
        if (sLoginMsg)
            _LoginMsg = sLoginMsg;
        _bAuthenticationPending = true;

        CheckFacebookLoginStatus();
    };

    // Log out of Facebook.
    // Remarks
    // Typically should not need to log out Facebook from within ShoppingList app.
    // One would think logging out of the Facebook site would end the authentication
    // obtained from Facebook, which it does with the desktop browser. However,
    // the chrome mobile browser on Android Galaxy S3 does not clear the authentication.
    // Perhaps this has to do with app cache. Usually want to keep authentication
    // whenever possible, but for debug this can be a problem. Also user may
    // actually want to clear the authentication.
    this.LogOut = function () {
        facebookConnectPlugin.logout(function (response) {
            // Success. 
        },
        function (response) {
            // Error, response is likely error string.
            fnAuthenticated(that.EAuthResult.Error, response);
        });
        ClearAuthParams();
        fnAuthenticated(this.EAuthResult.Logout);
    };

    // ** Private Members
    var _accessToken = "";
    var _userID = "";
    var _userName = "";
    var _LoginMsg = "Login to facebook to identify yourself.<br/>";
    var _bAuthenticationPending = false;

    // Checks Facebook login status.  Displays login button if
    // user is not logged in to Facebook, otherwise sets user
    // info obtained from Facebook into hidden variable for
    // server to access.
    function CheckFacebookLoginStatus() {
        // Clear user id and accessToken, which are set if connected.
        _accessToken = "";
        _userID = "";
        facebookConnectPlugin.getLoginStatus(function (response) {
            if (response.status != "connected") {
                // Not connected, so present div for facebook login.

                facebookConnectPlugin.login(["public_profile"], CheckFaceBookLoginStatusResponse,
                    function (response) {
                        // Failure. response is likely an error string. 
                        fnAuthenticated(that.EAuthResult.Error, response);
                    });

                var buFbLoginCancel = document.getElementById("buFbLoginCancel");
                if (buFbLoginCancel) {
                    buFbLoginCancel.addEventListener("click", OnFbLoginCancel);
                }

            } else {
                // Connected, so complete authentication.
                CheckFaceBookLoginStatusResponse(response);
            }
        },
        function (response) {
            // Error. response is likely an error string.
            fnAuthenticated(that.EAuthResult.Error, response);
        });

    }

    // Checks Facebook response for login status or AuthChanged event.
    // Displays login button if user is not logged in to Facebook,
    // otherwise sets user info obtained from Facebook into hidden variable
    // for server to access.
    function CheckFaceBookLoginStatusResponse(response) {

        // Note: Only want to call fnAuthenticated() once each time Authenticate() is called.
        if (_bAuthenticationPending && response.status) {
            _bAuthenticationPending = false;

            if (response.status == "connected") {
                // logged in and connected user, someone you know. Save access token.
                if (response.authResponse) {
                    _accessToken = response.authResponse.accessToken;
                    _userID = response.authResponse.userID;

                    facebookConnectPlugin.api('/me', ["public_profile"], function (responseMe) {
                        // Save User name.
                        var sError = "";
                        var bError = responseMe.error !== undefined;
                        if (bError) {
                            // Failed to get User Name from Facebook.
                            _accessToken = "";
                            _userID = "";
                            _userName = "";
                            sError = "Error trying to get user name.";
                        } else {
                            _userName = responseMe.name;
                        }
                        fnAuthenticated(bError ? that.EAuthResult.Error : that.EAuthResult.Ok, sError);
                    },
                    function (response) {
                        // Error. response is an error string.
                        fnAuthenticated(that.EAuthResult.Error, response);
                    });
                } else {
                    // response.authResponse is null. Should not happen.
                    ClearAuthParams();
                    fnAuthenticated(that.EAuthResult.Error, "null status response")
                }
            } else if (response.status === 'not_authorized') {
                // Note: Testing does not seem to hit this, but should be able to.
                // User logged in, but did not authorize using this app.
                ClearAuthParams();
                fnAuthenticated(that.EAuthResult.Failed);
            } else {
                // Do not know if user is logged into facebook. Treat as failed.
                ClearAuthParams();
                fnAuthenticated(that.EAuthResult.Failed);
            }
        }


    }

    // Helper to clear members when authorization is not allowed.
    function ClearAuthParams() {
        _accessToken = "";
        _userID = "";
        _userName = "";
    }

    // Helper that error string when response is an error string.
    // Returns empty string if response undefined or is not a string.
    function GetResponseError(response) {
        var sError = "";
        if (response !== undefined) {
            if (typeof (response) === 'string') {
                sError = response;
            }
        }
        return sError;
    }

    // Initialize for Facebook
    function Init() {
        // Might need to check if browser in web app. Not needed for cordova app.
        /* 
        if (window.cordova.platformId == "browser") {
            facebookConnectPlugin.browserInit(appId, version);
            // version is optional. It refers to the version of API you may want to use.
        }
        */
        // Note: The APP_ID is set when the phonegap-facebook-plugin is installed.
    }


    // Facebook event handlers
    function OnAuthLoginChanged(response) {
        CheckFaceBookLoginStatusResponse(response);
    }

    function OnStatusChanged(response) {
        // Note: response for statusChange does NOT have response.status field.
        //       Therefore get full response with status for checking.
        facebookConnectPlugin.getLoginStatus(function (response2) {
            CheckFaceBookLoginStatusResponse(response2);
        }, function (response2) {
            // Error. response2 is likely an error string. 
            SetResponeError();
            fnAuthenticated(that.EAuthResult.Error); 
        });
    }

    function OnAuthResponseChanged(response) {
        CheckFaceBookLoginStatusResponse(response);
    }

    function fnAuthenticated(nStatus, argError) {
        var error = GetResponseError(argError);
        var result = { userName: _userName, userID: _userID, accessToken: _accessToken, status: nStatus, sError: error };
        that.callbackAuthenticated(result);
    }

    // Event handler for login cancel button.
    function OnFbLoginCancel(e) {
        ClearAuthParams();
        fnAuthenticated(that.EAuthResult.Canceled);
    }

    // ** Constructor initialization
    Init();
}
