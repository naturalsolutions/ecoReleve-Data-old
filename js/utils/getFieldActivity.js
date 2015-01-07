define([
	'jquery',
    'backbone',
    'config',
], function($,backbone, config) {
    'use strict';
    return {
        getElements: function(url) {
            var content ='';
            url = config.coreUrl + url;
            var query = $.ajax({
                context: this,
                url: url,
                dataType: "json",
                async: false,
            })
            .done( function(data) {
                var len = data.length;
                console.log(data)
                for (var i = 0; i < len; i++) {
                    var label = data[i].caption;
                    console.log(label);
                    content += '<option value="' + label +'">'+ label +'</option>';
                }
            })
            .fail( function() {
                alert("error loading items, please check connexion to webservice");
            });
            return content;
        }
    };
});

	




