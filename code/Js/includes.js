if (navigator.userAgent.match(/Android/i)){
	loadCss("Css/jquery.mobile-1.0.min.css");
	jqueryUrl = "Js/libs/jquery-1.7.1.min.js";
	jqmUrl = "Js/libs/jquery.mobile-1.0.min.js";
}
else{
	//(navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)){ 
	loadCss("Css/jquery.mobile-1.2.0.min.css");
	jqueryUrl = "Js/libs/jquery-1.8.2.min.js";
	jqmUrl = "Js/libs/jquery.mobile-1.2.min.js";
}

head.js(
jqueryUrl,
jqmUrl,
'Js/libs/openlayers.min.js',
'Js/libs/cordova-2.1.0.js',
'Js/libs/app-bar.js',
'Js/libs/jqm.autoComplete-1.4.3-perso-min.js',
'Js/code-app-min.js'
);
function loadCss(url) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    document.getElementsByTagName("head")[0].appendChild(link);
}