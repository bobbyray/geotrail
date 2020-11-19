'use strict';
/* 
Copyright (c) 2020 Robert R Schomburg
Licensed under terms of the MIT License, which is given at
https://github.com/bobbyray/MitLicense/releases/tag/v1.0
*/

// Object for Wigo Authentication that replaces FaceBook authenication (wigo_ws_FaceBookAuthentication).
// Arg
//  app: {id: string, title: string, localStorageKey: string}, params for the wigo app to authenticate.
//           See wigo_ws_WigoAuthAccess.apps file wigoauthaccess.js for the apps.
//  sBaseUri: string. Use wigo_ws_auth_api_sBaseUri in file config.js for api base Uri.
// Remarks: Must provide a div in the html body for sign-in: 
//          <div id="divLoginHolder" style="display: none"></div> <!-- container div for login UI -->
function wigo_ws_WigoAuthentication(divLoginHolder, app, sBaseUri) { 
    var that = this; // Ref to this FaceBookAuthentication obj for use by private functions.

    // Callback function that is called after authentication has completed.
    // Argument result: json
    //  userName: string for user name.
    //  userID: WigoAuth user id or empty string when authentication fails.
    //  accessToken: access token string acquired from WigoAuth, or empty string
    //      when athentication fails or is cancelled.
    //  status: integer result of authentication, value of which is given 
    //      by this.EAuthResult.
    //  sError: error string when status indicates an error, otherwise empty string.
    this.callbackAuthenticated = function (result) { };

    // Enumeration of result for authentication:
    //  Error is internal error not expected to happen.
    //  Canceled means authentication was canceled rather than trying wigo authentication.
    //  Failed means wigo authentication was attempted but failed.
    //  bOk means authentication was successful.
    //  Expired means authentication expired (used by database server).
    //  Logout means user logged out and is not longer authenticated.
    // Note: same values as for GeoPathsRESTfulApi.eAuthStatus (keep synced).
    this.EAuthResult = { Logout: -4, Expired: -3, Error: -2, Canceled: -1, Failed: 0, Ok: 1 };

    // Does authentication with wigoAuth.
    // this.callbackAuthenticated() is called when authentication is completed.
    // Argument: sLoginMsg used to be message shown if login for authentication is needed.
    //           However, sLoginMsg is no longer used.
    // Remarks:
    // If user is already logged into WigoAuth, authentication completes silently
    // and acquires an access token string. If user is not logged in, a div
    // UI is presented to log in so that authentication
    // can be completed.
    this.Authenticate = function (sLoginMsg) {
        wigoAuth.verifyAccess(true, (bOk, sStatus) => {
            if (bOk) {
                fnAuthenticated(this.EAuthResult.Ok, sStatus)
            } else {
                fnAuthenticated(this.EAuthResult.Failed, sStatus)
            }
        });

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
        // Note: wigoAuth.logout() is synchronous and does not contact web server.
        wigoAuth.logout(); 
        fnAuthenticated(this.EAuthResult.Logout);
    };
    

    // *** private members
    // Object for wigo authentication.
    let wigoAuth = new wigo_ws_WigoAuthAccess.WigoAuthAccess(divLoginHolder, app.id, app.title, sBaseUri, app.localStorageKey);


    
    // Forms result for authenticated callback and does he callback.
    // Args:
    //  nStatus: EAuthResult value.
    //  error: string for error msg.
    function fnAuthenticated(nStatus, error) {
        var result = { userName: wigoAuth.userName, userID: wigoAuth.userId, accessToken: wigoAuth.accessToken, status: nStatus, sError: error };
        that.callbackAuthenticated(result);
    }

}