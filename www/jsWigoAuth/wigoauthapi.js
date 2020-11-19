'use strict';
/* 
Copyright (c) 2019, 2020 Robert R Schomburg
Licensed under terms of the MIT License, which is given at
https://github.com/bobbyray/MitLicense/releases/tag/v1.0
*/

// Object for AJAX (xmlhttprequest) api providing authentication for apps under the wigo.ws domain.
// Constructor Arg:
//  sBaseUri: base uri string for the ajax endpoint. Defaults to "Service.svc/" if not given.
function wigo_ws_WigoAuthApi(sBaseUri) {
    var that = this; // ref for private members to this object.
    // Enumeration for result of aync completion with the server.
    this.eResult = { // Same as enum for EAuthResult in service.cs.
        ok: 1, notFound: 0, duplicate: -1, expired: -2, xfrError: -3, dbError: -4,
        emailError: -5, incorrect: -6, weak_pswd: -7};

    // Registers a new user with wigo authentication.
    // Sends an email to the user to complete registration.
    // The email contains a unique, temporary, random code to complete registration.
    // Args:
    //  sEmail: string. email address of the new user.
    //  sUserName: string. full name of user.
    //  onDone: callback function for async completion.
    //      Arg: JSON for server obj AuthResult:
    //              nResult: property value of this.eResult. this.eResult.ok indicates success.
    //              sStatus: string. text desribing the result.
    //      Note: The registration process is completed after the user responds to the email.
    //            this.doPswdReset(...) must be called to set a user pswd completing registration.
    // SyncReturn: boolean.
    //  true if posted to server. false if exchange with server is already in progress.
    this.requestRegistration = function (sEmail, sUserName, onDone) {
        // Save async completion handler.
        if (typeof (onDone) === 'function')
            onrequestRegistration = onDone;
        else
            onrequestRegistration = function (oResult) { };

        const authEmailName = new AuthEmailName(sEmail, sUserName);
        
        const bOk = base.Post(eState.requestRegistration, sRequestRegistrationUri(), authEmailName);
        return bOk;

    };

    // Imports a user into wigo authentication from a different authentication provider.
    // Sends an email to the user to complete importing.
    // The email contains a unique, temporary, random code to complete importing.
    // Args:
    //  sEmail: string. email address of the new user.
    //  sUserName: string. full name of user.
    //  sUserId: string. user id to be imported.
    //  onDone: callback function for async completion.
    //      Arg: JSON for server obj AuthResult:
    //              nResult: property value of this.eResult. this.eResult.ok indicates success.
    //              sStatus: string. text desribing the result.
    //      Note: The registration process is completed after the user responds to the email.
    //            this.doPswdReset(...) must be called to set a user pswd completing registration.
    // SyncReturn: boolean.
    //  true if posted to server. false if exchange with server is already in progress.
    this.requestImportUser = function (sEmail, sUserName, sUserId, onDone) {  
        // Save async completion handler.
        if (typeof (onDone) === 'function')
            onrequestImportUser = onDone;
        else
            onrequestImportUser = function (oResult) { };

        const authEmailNameId = new AuthEmailNameId(sEmail, sUserName, sUserId);
        const bOk = base.Post(eState.requestImportUser, sRequestImportUserUri(), authEmailNameId);
        return bOk;
    };

    // Requests that a user's password can be reset. An email with a reset code is sent.
    // Args:
    //  sAppid. string. id for wigo app.
    //  sEmail. string. email address to which a reset code is sent.
    //  onDone: callback fuction for async completion.
    //      Arg: JSON for server obj AuthResult:
    //              nResult: number. property value of this.eResult. this.eResult.ok indicates success.
    //              sStatus: string. text desribing the result.
    //      Note: After the user responds to the email,
    //            this.doPswdRest(...) must be called with a reset code, and it asynchronoulsy
    //            returns the user information and access token.
    this.requestPswdReset = function (sEmail, onDone) { 
        // Save async completion handler.
        if (typeof onDone === 'function')
            onrequestPswdReset = onDone;
        else
            onrequestPswdReset = function (oResult) { };

        const payload = new WigoAuthString();
        payload.s = sEmail;
        const bOk = base.Post(eState.requestPswdReset, sRequestPswdResetUri(), payload);
        return bOk;
    };
    
    // Reset the password at the server provided reset code is valid.
    // Args:
    //  sResetCode: string. reset code receive in an email for the reset.
    //  sPswd: string. the new password set at the server. 
    //  onDone: callback fuction for async completion.
    //      Arg: JSON for server obj AuthResult: 
    //          nResult: property value of this.eResult. this.eResult.ok indicates success.
    //          sStatus: string. text desribing the result.
    this.doPswdReset = function (sResetCode, sPswd, onDone) {
        // Save async completion handler.
        if (typeof (onDone) === 'function')
            ondoPswdReset = onDone;
        else
            ondoPswdReset = function (oResult) { };

        const authPswdReset = new AuthPswdReset(sResetCode, sPswd);

        const bOk = base.Post(eState.doPswdReset, sDoPswdResetUri(), authPswdReset);
        return bOk;

    };

    // Finds user information from the server for a reset code.
    // Args:
    //  sResetCode string. reset code obtained from request to register or reset pswd.
    //  onDone: callback for async completion:
    //      Arg: JSON for server obj QueryResetCodeResult:
    //          nResult: property value of this.eResult. this.eResult.ok indicates success.
    //          sStatus: string. text desribing the result.
    //          sUserId: string. user id.
    //          sUserName: string. user name.
    //          sEmail: string. email addr of user.
    this.queryResetCode = function (sResetCode, onDone) {  
        if (typeof (onDone) === 'function')
            onqueryResetCode = onDone;
        else
            onqueryResetCode = function (oResult) { };

        const payload = new WigoAuthString(sResetCode);
        
        const bOk = base.Post(eState.queryResetCode, sQueryResetCodeUri(), payload);
        return bOk;
    }; 

    // Verifies that a password for a user is valid.
    // Args:
    //  sEmail: string. email address of user.
    //  sPswd: string. user's password.
    //  sAppId: string. app id for which an access token is returned if pswd is valid.  
    //  onDone: callback for async completion:
    //      Arg: JSON for server object VerifyPasswordResult.
    //          nResult: property value of this.eResult. this.eResult.ok indicates success.
    //          sStatus: string. text desribing the result.
    //          sUserId: string. unique user id at wigo.ws domain. empty string for failure.
    //          sUserName: string. full name of user. empty string for failure.
    //          sAccessToken: string. access token for the user. empty string if for failure.
    //          sAppIdEncrypted: string. sAppId arg encrypted.
    // SyncReturn: boolean.
    //  true if posted to server. false if exchange with server is already in progress.
    // Note: sAppId arg is needed because an access token is set for the app if the pswd is valid.
    //       An access token is different for a user of each app, but the password is the same for the user over all apps. 
    //       sAppIdEncrpted is returned in case the server-side code for the app wants to access the
    //       the appauth table in the database to verify that an access token is valid.
    this.verifyPassword = function (sEmail, sPswd, sAppId, onDone) {
        if (typeof (onDone) === 'function')
            onverifyPassword = onDone;
        else
            onverifyPassword = function (oResult) { };

        const payload = new AuthVerifyPassword();
        payload.sEmail = sEmail;
        payload.sPswd = sPswd;
        payload.sAppId = sAppId;

        const bOk = base.Post(eState.verifyPassword, sVerifyPasswordUri(), payload);
        return bOk;
    };

    // Verifies that an access token for a user is valid.
    // Args:
    //  sUserId: string. user id returned when a user successfully logs in, 
    //      ie verifyPassword(..) is successful.
    //  sAccessToken: string. access token return by verifyPassword(..) or by this api.
    //  sAppId: string. the app to which the access pertains.
    //  bGenNewToken: boolean. true for this api to return a new access token if sAccessToken is valid. 
    //  onDone: callback for async completion:
    //      Arg: JSON for server object VerifyAccessResult.
    //          nResult: poperty value of this.eResult. this.eResult.ok indicates success.
    //          sStatus: string. text describing the result.
    //          sAccessToken: string. access token for verification valid.
    //                    note: it is same or updated based on bGenNewToken.
    //          sAppIdEncrypted: string. encrypted app id.
    // SyncReturn: boolean.
    //  true if posted to server. false if exchange with server is already in progress.
    this.verifyAccess = function (sUserId, sAccessToken, sAppId, bGenNewToken, onDone) {
        if (typeof onDone === 'function')
            onverifyAccess = onDone;
        else
            onverifyAccess = function (oResult) { };

        const payload = new AuthVerifyAccess();
        payload.sUserId = sUserId;
        payload.sAccessToken = sAccessToken;
        payload.sAppId = sAppId;
        payload.bGenNewToken = bGenNewToken;

        const bOk = base.Post(eState.verifyAccess, sVerifyAccessUri(), payload);
        return bOk;
    }

    // Requests that the user email be changed. The user must already be registered.
    // An email is sent to the new email address with a reset code.
    // Args:
    //  sEmail: string. current email address for user.  
    //  sPswd: string. password of user.
    //  sNewEmail: string. email address to which the reset code is sent. the new email address for the user.
    //  onDone: callback function for async completion.
    //      Arg: {nResult: number, sStatus: string}
    //              nResult: property value of this.eResult. this.eResult.ok indicates valid.
    //              sStatus: text desribing the result.
    //      Note: this.doChangeEmail(..) must be called with the reset code to complete changing the email address.
    // SyncReturn: boolean.
    //  true if posted to server. false if exchange with server is already in progress.
    this.requestChangeEmail = function (sEmail, sPswd, sNewEmail, onDone) {
        // Save async completion handler.
        if (typeof onDone === 'function')
            onrequestChangeEmail = onDone;
        else
            onrequestChangeEmail = function (oResult) { };

        const payload = new AuthChangeEmail();
        payload.sEmail = sEmail;
        payload.sPswd = sPswd;
        payload.sNewEmail = sNewEmail;
        const bOk = base.Post(eState.requestChangeEmail, sRequestChangeEmailUri(), payload);
        return bOk;
    };

    // Changes the user's email address at the server provided the reset code is valid.
    // Args:
    //  sResetCode: string. reset code received in the email for changing the email address.
    //  sPswd: string. user password to confirm the change.
    //  onDone: callback fuction for async completion.
    //      Arg: {nResult: number, sStatus: string}
    //              nResult: property value of this.eResult. this.eResult.ok indicates success.
    //              sStatus: string. text desribing the result.
    // SyncReturn: boolean.
    //  true if posted to server. false if exchange with server is already in progress.
    this.doChangeEmail = function (sResetCode, onDone) {  
        // Save async completion handler.
        if (typeof onDone === 'function')
            ondoChangeEmail = onDone;
        else
            ondoChangeEmail = function (oResult) { };

        const payload = new WigoAuthString(sResetCode);  
        const bOk = base.Post(eState.doChangeEmail, sDoChangeEmailUri(), payload);
        return bOk;
    };


    // Changes a user's password at the server.
    // Args:
    //  sEmail: string. email address of user.
    //  sPswd: string. current user password.
    //  sNewPswd: string. new user password.
    //  onDone: callback fuction for async completion.
    //      Arg: {nResult: number, sStatus: string}
    //              nResult: property value of this.eResult. this.eResult.ok indicates success.
    //              sStatus: string. text desribing the result.
    // SyncReturn: boolean.
    //  true if posted to server. false if exchange with server is already in progress.
    this.changePassword = function (sEmail, sPswd, sNewPswd, onDone) {
        // Save async completion handler.
        if (typeof onDone === 'function')
            onchangePassword = onDone;
        else
            onchangePassword = function (oResult) { };

        const payload = new AuthChangePswd();
        payload.sEmail = sEmail;
        payload.sPswd = sPswd;
        payload.sNewPswd = sNewPswd;
        const bOk = base.Post(eState.changePassword, sChangePasswordUri(), payload);
        return bOk;
    }

    // Changes the user name at the server provide the email addr and pswd can be confirmed.
    // Args:
    //  sEmail: string. email address to identify the user.
    //  sPswd: string. user password to confirm the change.
    //  sNewUserName: string. the new user name.
    //  onDone: callback function for async completion.
    //      Arg: {nResult: number, sStatus: string}
    //              nResult: property value of this.eResult. this.eResult.ok indicates success.
    //              sStatus: string. text desribing the result.
    this.changeName = function (sEmail, sPswd, sNewUserName, onDone) {
        // Save async completion handler.
        if (typeof onDone === 'function')
            onchangeName = onDone;
        else
            onchangeName = function (oResult) { };

        const payload = new AuthChangeName();
        payload.sEmail = sEmail;
        payload.sName = sNewUserName;
        payload.sPswd = sPswd;
        const bOk = base.Post(eState.changeName, sChangeNameUri(), payload);
        return bOk;
    };

    // Resets the busy flag that indicates a HttpXmlRequest is in progress with the server.
    this.resetServerBusy = function () {
        base.ResetRequest();
    }

    // Private members
    if (!sBaseUri)
        sBaseUri = "Service.svc/";
    var base = new wigo_ws_Ajax(sBaseUri); // host server.  

    // ** Relative uris for the apis wrt Service.svc at the website.

    // Returns relative URI for request registion api.
    function sRequestRegistrationUri() {
        return "requestregistration";
    }

    // Returns relative URI for import user api.
    function sRequestImportUserUri() {   
        return "requestimportuser";
    }

    // Returns relative URI for request pswd reset api.
    function sRequestPswdResetUri() {
        return "requestpswdreset";
    }

    function sRequestChangeEmailUri() {
        return "requestchangeemail";
    }

    function sDoChangeEmailUri() {
        return "dochangeemail";
    }

    function sChangePasswordUri() {
        return "changepassword";
    }

    function sChangeNameUri() {
        return "changename";
    }

    // Returns relative URI for query reset code api.
    function sQueryResetCodeUri() {
        return "queryresetcode";
    }

    // Returns relative URI for verify password api.
    function sVerifyPasswordUri() {
        return "verifypassword";
    }

    // Returns relative URI for verify access api.
    function sVerifyAccessUri() {
        return "verifyaccess";
    }

    // Returns relative URI for do pswd reset action.
    function sDoPswdResetUri() {
        return "dopswdreset";
    }

    // ** Handler in base class to handle completion of ajax request.
    // Enumeration for api transfer state. 
    var eState = {
        Initial: 0, requestRegistration: 1, doPswdReset: 2, queryResetCode: 3,
        verifyPassword: 4, verifyAccess: 5, requestPswdReset: 6, requestChangeEmail: 7,
        doChangeEmail: 8, changePassword: 9, changeName: 10, 
        requestImportUser: 11, 
    };

    base.onRequestServed = function (nState, bOk, req) {
        let sStatus;
        let oResult;
        switch (nState) {
            case eState.requestRegistration:
                if (bOk) {
                    oResult = JSON.parse(req.responseText);
                } else {
                    sStatus = base.FormCompletionStatus(req);
                    oResult = { nResult: that.eResult.xfrError, sStatus: sStatus };
                }
                onrequestRegistration(oResult);
                break;
            case eState.requestImportUser: 
                if (bOk) {
                    oResult = JSON.parse(req.responseText);
                } else {
                    sStatus = base.FormCompletionStatus(req);
                    oResult = { nResult: that.eResult.xfrError, sStatus: sStatus };
                }
                onrequestImportUser(oResult);

                break;
            case eState.requestPswdReset: 
                if (bOk) {
                    oResult = JSON.parse(req.responseText);
                } else {
                    sStatus = base.FormCompletionStatus(req);
                    oResult = { nResult: that.eResult.xfrError, sStatus: sStatus };
                }
                onrequestPswdReset(oResult); 
                break;
            case eState.doPswdReset:
                if (bOk) {
                    oResult = JSON.parse(req.responseText);
                } else {
                    sStatus = base.FormCompletionStatus(req);
                    oResult = { nResult: that.eResult.xfrError, status: sStatus };
                }
                ondoPswdReset(oResult);
                break;
            case eState.queryResetCode:
                if (bOk) {
                    oResult = JSON.parse(req.responseText);
                } else {
                    oResult = new QueryResetCodeResult();  // Construct oResult for transport error.
                    oResult.sStatus = base.FormCompletionStatus(req);
                }
                onqueryResetCode(oResult);
                break;
            case eState.verifyPassword:
                if (bOk) {
                    oResult = JSON.parse(req.responseText);
                } else {
                    oResult = new VerifyPasswordResult();  // Construct oResult for transport error.
                    oResult.sStatus = base.FormCompletionStatus(req);
                }
                onverifyPassword(oResult);
                break;
            case eState.verifyAccess:
                if (bOk) {
                    oResult = JSON.parse(req.responseText);
                } else {
                    oResult = new VerifyAccessResult();
                    oResult.sStatus = base.FormCompletionStatus(req);
                }
                onverifyAccess(oResult);
                break;
            case eState.requestChangeEmail:
                if (bOk) {
                    oResult = JSON.parse(req.responseText);
                } else {
                    sStatus = base.FormCompletionStatus(req);
                    oResult = { nResult: that.eResult.xfrError, status: sStatus };
                }
                onrequestChangeEmail(oResult);
                break;
            case eState.doChangeEmail: 
                if (bOk)
                    oResult = JSON.parse(req.responseText);
                else {
                    sStatus = base.FormCompletionStatus(req);
                    oResult = { nResult: that.eResult.xfrError, status: sStatus };
                }
                ondoChangeEmail(oResult);
                break;
            case eState.changePassword:  
                if (bOk)
                    oResult = JSON.parse(req.responseText);
                else {
                    sStatus = base.FormCompletionStatus(req);
                    oResult = { nResult: that.eResult.xfrError, status: sStatus };
                }
                onchangePassword(oResult);
                break;
            case eState.changeName:
                if (bOk)
                    oResult = JSON.parse(req.responseText);
                else {
                    sStatus = base.FormCompletionStatus(req);
                    oResult = { nResult: that.eResult.xfrError, status: sStatus };
                }
                onchangeName(oResult);
                break;
        }
    }
    // Saved async completion callbacks for api completion set when api is called.
    // Arg: oResult is object defined by the api. 
    let onrequestRegistration = function (oResult) { };
    let onrequestImportUser = function (oResult) { };           
    let onrequestPswdReset = function (oResult) { };
    let onrequestChangeEmail = function (oResult) { };
    let ondoChangeEmail = function (oResult) { };
    let onchangePassword = function (oResult) { };
    let onchangeName = function (oResult) { };
    let ondoPswdReset = function (oResult) { };
    let onqueryResetCode = function (oResult) { };
    let onverifyPassword = function (oResult) { };
    let onverifyAccess = function (oResult) { };

    // ** Objects for exchange with Server.
    // Input arg for requestRegistration or requestPswdReset.
    function AuthEmailName(sEmail, sName) {
        this.sEmail = typeof sEmail === "string" ? sEmail : ""; // User email address.
        this.sName =  typeof sName === "string" ? sName : "";   // User full name for display at client.
    }

    // Input arg for requestImportUser.
    function AuthEmailNameId(sEmail, sName, sUserId) {
        this.sEmail = typeof sEmail === "string" ? sEmail : ""; // User email address.
        this.sName = typeof sName === "string" ? sName : "";    // User full name for display at client.
        this.sUserId = typeof sUserId === "string" ? sUserId : ""; // User id.  
    }

    // Input arg for doPswdReset(..), which is used used to respond to an email received to register or reset pswd.
    function AuthPswdReset(sResetCode, sPswd) {
        this.sResetCode = typeof sResetCode === "string" ? sResetCode : "";  // Reset code to verify resetting pswd.
        this.sPswd = typeof sPswd === "string" ? sPswd : "";                 // New user password.
    }

    // Input arg for a single string in a payload.
    function WigoAuthString(sArg) {
        this.s = typeof sArg === "string" ? sArg : ""; // a string.
    }

    // Input arg for verifyPassword(..). Equivalent class AuthVerifyPassword in service.cs.
    function AuthVerifyPassword() {
        this.sEmail = "";  // email address of user.
        this.sPswd = "";   // user password.
        this.sAppId = "";  // App id. (The form is domain.site)
    }

    // Input arg for verifyAccess(..). Equivalent class AuthVerifyAccess in service.cs
    function AuthVerifyAccess() {
        this.sUserId = "";          // user id.
        this.sAccessToken = "";     // access token for the user.
        this.sAppId = "";           // app to which access token belongs.
        this.bGenNewToken = true;   // flag to output a new token when access is verified.
    }

    // Input arg for requestChangeEmail(..) service
    function AuthChangeEmail() {
        this.sEmail = "";        // current email address for user.
        this.sPswd = "";         // password for user.
        this.sNewEmail = "";     // new email address for user.
    }

    function AuthDoChangeEmail() {
        this.sResetCode = "";  // Reset code to complete changing the email address.
        this.sPswd = "";       // User password to confirm changing the email address is ok.
    }

    // Input arg for changePassword(..) service.
    function AuthChangePswd() {
        this.sEmail = "";      // Email address to identify user.
        this.sPswd = "";       // Current password for user.
        this.sNewPswd = "";    // New password for user.
    }

    // Input arg for changePassowrd(..) service 
    function AuthChangeName()
    {
        this.sEmail = "";    // Email address to identify user.
        this.sName = "";     // New user name.
        this.sPswd = "";     // User password to confirm the change.
    }

    // Result for queryResetCodeResult(..) api.
    // Constructs to internet transport error.
    // Note: For successful result, JSON server object is received,
    // which is equilent to this object. So this object is only constructed a transport error.
    function QueryResetCodeResult() {
        this.nResult = that.eResult.xfrError;
        this.sStatus = "Error exchanging data with server for query of reset code.";
        this.sUserId = "";
        this.sUserName = "";
        this.sEmail = ""
        this.sNewEmail = "";
    }

    // Result for verifyPassword(..) api.
    function VerifyPasswordResult() {
        this.nResult = that.eResult.xfrError;
        this.sStatus = "Error exchanging data with server for verify password.";
        this.sUserId = "";
        this.sUserName = "";
        this.sAccessToken = "";
        this.sAppIdEncrypted = ""; 
    }

    // Result for verifyAccess(..) api.
    function VerifyAccessResult() {
        this.nResult = that.eResult.xfrError;
        this.sStatus = "ok";
        this.sAccessToken = "";
        this.sAppIdEncrypted = "";
    }

}
