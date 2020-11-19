/*
Copyright (c) 2020 Robert R Schomburg
Licensed under terms of the MIT License, which is given at
https://github.com/bobbyray/MitLicense/releases/tag/v1.0
*/
/// <reference path="wigoauthapi.d.ts" />
// **** NOTE: Must use reference path above rather than import for module because wigoauthapi.js has no tyescript.
var wigo_ws_WigoAuthAccess;
(function (wigo_ws_WigoAuthAccess) {
    // Accesses Wigo Authentication at server.
    class WigoAuthAccess {
        // Args:
        //  divLoginHolder: parent div for the login UI that can be show
        //      for login or if access verification fails.
        //  sAppId: app id for which authentication pertains.
        //  sAppTitle: Title describing the app.
        //  sBaseUri: base uri for the wigo auth service. Empty string is same as "Service.svc/";
        //  sLocalStorageKey: key for saving user id and access token in localStorage.
        //      If empty, does not save to localStorage. 
        constructor(divLoginHolder, sAppId, sAppTitle, sBaseUri, sLocalStorageKey) {
            this.divLoginHolder = divLoginHolder;
            this.sAppId = sAppId;
            this.sAppTitle = sAppTitle;
            this.sBaseUri = sBaseUri;
            this.sLocalStorageKey = sLocalStorageKey;
            this.bLoginUICreated = false;
            // Note: login(onDone) assigns this.onLoginDone = onDone; 
            // UI Controls for login
            // Login email addr
            this.txbxEmailAddr = document.createElement("input");
            // Password
            this.txbxPswd = document.createElement("input");
            this.buShowPswd = document.createElement("input");
            // Submit 
            this.buSubmit = document.createElement("input");
            this.buCancel = document.createElement("input");
            // Data (parameters) for wigo auth access.
            this.accessData = { sUserId: "", sUserName: "", sAccessToken: "" };
            // Api for access the wigo auth service at server.
            this.api = new wigo_ws_WigoAuthApi(this.sBaseUri);
            // Returns bOk true if text is a non empty string that does not contain the < or > chars.
            // Returns sTextBad to indicate why text is invalid. Empty string if text is Ok.
            // Note: < and > chars could indicate html elements that might maliciously execute as javascript.
            this.isTextValid = function (text) {
                let sTextBad = "";
                let bOk = typeof text === 'string' ? text.length > 0 : false;
                if (bOk) {
                    let iFound = text.indexOf('<');
                    if (iFound < 0)
                        iFound = text.indexOf('>');
                    bOk = iFound < 0;
                    if (!bOk)
                        sTextBad = " (Text must not contain &lt; or &gt;.)";
                }
                else {
                    sTextBad = " (Text must not be empty.)";
                }
                return { bOk: bOk, sTextBad: sTextBad };
            };
            this.loadFromLocalStorage();
            this.createLoginUI();
            this.show(divLoginHolder, false); // Hide login UI initially.
        }
        // Presents login UI.
        //  OnDone: Async return with these args:
        //          bOk: true for successful verification with the server.
        //          sStatus: status message indicating the result. ok for success, otherwise an error msg.
        login(onDone) {
            this.show(this.divLoginHolder, true);
            this.onLoginDone = onDone;
        }
        // Clear user login and access token.
        logout() {
            // Stop any exchange with the server that may be in progress
            this.api.resetServerBusy();
            // Set auth accessData to empty and save.
            this.accessData.sAccessToken = "";
            this.accessData.sUserId = "";
            this.accessData.sUserName = "";
            this.saveToLocalStorage();
        }
        // Verifies with the server that current access token is valid.
        // Args:
        //  bLoginOnFailure: If true, presents login UI only if verify access with server fails.
        //                   If false, the login UI is never presented.
        //  OnDone: Async return with these args:
        //          bOk: true for successful verification with the server.
        //          sStatus: status message indicating the result. ok for success, otherwise an error msg.
        // Sync return: true for exchange with server started; false if server is busy.
        verifyAccess(bLoginOnFailure, onDone) {
            let bStarted = false;
            if (!this.accessData) {
                bStarted = false;
            }
            else {
                bStarted = this.api.verifyAccess(this.accessData.sUserId, this.accessData.sAccessToken, this.sAppId, true, (result) => {
                    // Save access token returned by server.
                    this.accessData.sAccessToken = result.sAccessToken;
                    this.saveToLocalStorage();
                    if (result.nResult == this.api.eResult.ok) {
                        // Verified access token at server successfully.
                        onDone(true, result.sStatus);
                    }
                    else {
                        if (bLoginOnFailure) {
                            // Present login UI because verify access failed. 
                            this.login((bOk, sStatus) => {
                                onDone(bOk, sStatus);
                            });
                        }
                        else {
                            // Return on verify access error without trying to login.
                            onDone(false, result.sStatus);
                        }
                    }
                });
            }
            return bStarted;
        }
        // Readonly property for user id.
        get userId() {
            return this.accessData.sUserId;
        }
        // Readonly property for access token.
        get accessToken() {
            return this.accessData.sAccessToken;
        }
        // Readonly property for full user name.
        get userName() {
            return this.accessData.sUserName;
        }
        // Loads data for wigo auto access from localStorage.
        loadFromLocalStorage() {
            if (localStorage && this.sLocalStorageKey) {
                const sLocalData = localStorage[this.sLocalStorageKey];
                if (sLocalData)
                    this.accessData = JSON.parse(sLocalData);
            }
        }
        // Creates the login UI only once.
        createLoginUI() {
            // Only create once.
            if (this.bLoginUICreated)
                return;
            this.bLoginUICreated = true;
            // title and instructions.
            const divInstr = document.createElement("div");
            divInstr.className = "WigoAuthAccessInstr";
            divInstr.innerHTML = `Login for ${this.sAppTitle}<br/>Enter your email and password.<br>`;
            this.divLoginHolder.appendChild(divInstr);
            const divEmailBar = document.createElement("div");
            divEmailBar.className = "WigoAuthAccessEmailBar";
            this.divLoginHolder.appendChild(divEmailBar);
            // textbox for email
            this.txbxEmailAddr.className = "WigoAuthAccessEmail";
            this.txbxEmailAddr.type = "email";
            this.txbxEmailAddr.placeholder = "email address";
            divEmailBar.appendChild(this.txbxEmailAddr);
            // password bar
            const divPswdBar = document.createElement("div");
            divPswdBar.className = "WigoAuthAccessPswdBar";
            this.divLoginHolder.appendChild(divPswdBar);
            // password textbox
            this.txbxPswd.className = "WigoAuthAccessPswd";
            this.txbxPswd.type = "password";
            this.txbxPswd.placeholder = "Enter password";
            divPswdBar.appendChild(this.txbxPswd);
            // Show password button
            this.buShowPswd.className = "WigoAuthAccessShowPswdBtn";
            this.buShowPswd.type = "button";
            this.buShowPswd.value = "Show";
            divPswdBar.appendChild(this.buShowPswd);
            this.buShowPswd.addEventListener('click', (ev) => {
                // Toggle showing the password.
                if (this.buShowPswd.value === 'Show') {
                    this.txbxPswd.type = "text";
                    this.buShowPswd.value = "Hide";
                }
                else {
                    this.txbxPswd.type = "password";
                    this.buShowPswd.value = "Show";
                }
            }, false);
            // submit bar.
            const divSubmitBar = document.createElement("div");
            divSubmitBar.className = "WigoAuthAccessSubmitBar";
            // submit button
            this.buSubmit.className = "WigoAuthAccessSubmitBtn";
            this.buSubmit.type = "button";
            this.buSubmit.value = "Submit";
            divSubmitBar.appendChild(this.buSubmit);
            // Click event handler for Submit button.
            this.buSubmit.addEventListener('click', (ev) => {
                const sPswd = this.txbxPswd.value.trim();
                const sEmailAddr = this.txbxEmailAddr.value.trim();
                const pswdOk = this.isTextValid(sPswd);
                const bEmailOk = this.isEmailAddrValid(sEmailAddr);
                if (pswdOk.bOk && bEmailOk) {
                    this.api.verifyPassword(sEmailAddr, sPswd, this.sAppId, (result) => {
                        let bOk = result.nResult === this.api.eResult.ok;
                        // Save user id and user name.
                        this.accessData.sUserId = result.sUserId;
                        this.accessData.sUserName = result.sUserName;
                        // Save access token returned by server.
                        this.accessData.sAccessToken = result.sAccessToken;
                        this.saveToLocalStorage();
                        // Hide login UI for successfully verifying pswd.
                        if (bOk)
                            this.show(this.divLoginHolder, false); // Hide login UI.
                        // Return indicating result of trying to login.
                        if (this.onLoginDone)
                            this.onLoginDone(bOk, result.sStatus);
                    });
                }
                else {
                    // Pswd and/or email is not properly formed.
                    let sStatus = "";
                    if (!pswdOk.bOk) {
                        sStatus += `Pswd: error: ${pswdOk.sTextBad}.<br/>`;
                    }
                    if (!bEmailOk) {
                        sStatus += "Email address is not properly formed.<br/>";
                    }
                    if (this.onLoginDone)
                        this.onLoginDone(false, sStatus);
                }
            }, false);
            // Cancel button.
            this.buCancel.className = "WigoAuthAccessCancelBtn";
            this.buCancel.type = "button";
            this.buCancel.value = "Cancel";
            divSubmitBar.appendChild(this.buCancel);
            // Click event handler for Cancel button.
            this.buCancel.addEventListener('click', (ev) => {
                this.show(this.divLoginHolder, false); // Hide login UI.
                if (this.onLoginDone)
                    this.onLoginDone(false, "User canceled login.");
            }, false);
            this.divLoginHolder.appendChild(divSubmitBar);
        }
        // Save data for wigo auth access to localStorage.
        saveToLocalStorage() {
            if (localStorage && this.sLocalStorageKey) {
                localStorage[this.sLocalStorageKey] = JSON.stringify(this.accessData);
            }
        }
        // Shows or hides an HTMLElement.
        // Params:
        //  el: the html element to display or not.
        //  bShow: true to display the element; false to not display, in which case the element 
        //         takes no space in the view.
        // Note: Also see visible(el, bVisible).
        show(el, bShow) {
            const sShow = bShow ? "block" : "none";
            el.style.display = sShow;
        }
        // Returns true is an email address is valid.
        isEmailAddrValid(emailAddr) {
            const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(emailAddr);
        }
        ;
    }
    wigo_ws_WigoAuthAccess.WigoAuthAccess = WigoAuthAccess;
    // App ids to use with WigoAuth
    wigo_ws_WigoAuthAccess.apps = {
        shoppingList: { id: "wigo.ws.shoppinglist", title: "Shopping List", localStorageKey: "WigoAuthAccessShoppingList" },
        walkingMap: { id: "wigo.ws.walkingmap", title: "Walking Map", localStorageKey: "WigoAuthAccessWalkingMap" },
        geoTrail: { id: "wigo.ws.geotrail", title: "Geo Trail", localStorageKey: "WigoAuthAccessGeoTrail" }
    };
})(wigo_ws_WigoAuthAccess || (wigo_ws_WigoAuthAccess = {}));
// //# sourceMappingURL=wigoauthaccess.js.map