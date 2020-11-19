'use strict';
// Also need to use client side config.js that is configured for local debug or GoDaddy

// Use www.wigo.ws at GoDaddy with https
const wigo_ws_auth_api_sBaseUri = "https://www.wigo.ws/wigoauth/Service.svc/";
const wigo_ws_auth_page_uri = "https://www.wigo.ws/wigoauth/wigoauth.html";
const wigo_ws_geopaths_api_sBaseUri = "https://www.wigo.ws/WalkingMap/Service.svc/";

// Could use localhost for debugging on desktop, but did not work because Amdroid WebView now requires https.
// NOTE: wigouath1 is name site name for localhost and is exact same code as wigoauth at GoDaddy.
// const wigo_ws_auth_api_sBaseUri = "http://localhost/wigoauth1/Service.svc/";
// const wigo_ws_auth_page_uri = "http://localhost/wigoauth1/wigoauth.html";
// const wigo_ws_geopaths_api_sBaseUri = "http://localhost/WalkingMap/Service.svc/";

// Can use relative address with respect to domain. Only Works if debugging web page on desktop.
// const wigo_ws_auth_api_sBaseUri = "../wigoauth1/Service.svc/";
// const wigo_ws_auth_page_uri = "../wigoauth1/wigoauth.html";
// const wigo_ws_geopaths_api_sBaseUri = "../WalkingMap/Service.svc/";