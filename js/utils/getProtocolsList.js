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
                 type:'GET',
                async: false,
            })
            .done( function(data) {
                var len = data.length;
               for (var i = 0; i < len; i++) {
                    var label = data[i].proto_name;
                    content += '<option>'+ label +'</option>';
                }
            })
            .fail( function() {
                alert("error loading protocols, please check webservice connexion");
            });

            return content;
        }
    };
});

	




