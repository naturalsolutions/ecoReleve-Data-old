define([
    'underscore',
    'marionette',
    'radio',
    'views/user',
    'nicescroll',
    'text!modules2/header/templates/header.html',
    'text!modules2/header/templates/tpl-dropmenu-import.html',
    'text!modules2/header/templates/tpl-dropmenu-validate.html',
    
], function(_,Marionette, Radio, UserView, nicescroll, template, tpl_import, tpl_validate) {

    'use strict';

    return Marionette.LayoutView.extend( {
        template: template,
        regions: {
            breadcrumbsRegion: '#breadcrumbs',
            userRegion: '#user',
        },

        events: {
            'click #logout': 'logout'
        },

        onShow: function() {
            this.userRegion.show(new UserView());
            var radio = Radio.channel('route');
            radio.comply('route:header', this.updateHeader, this);

        },

        logout: function(evt) {
            evt.preventDefault();
            Radio.channel('route').trigger('logout');
        },

        onRender: function(){

        },
        updateHeader : function(obj){
            var templates = {'Validate':tpl_validate, 'Manual import':tpl_import };
            var route = obj.route;
            if (obj.route_url) {
                var route_url = obj.route_url;
            }
            else {
                var route_url = route;
            }
            var txt;
            if(route!='home'){
                txt = ' |&nbsp; ' + route;
            }else{
                txt ='';
            }
            $('#header-parent-module').empty();
            $('#header-child-module-name').empty();
            $('#header-module-name').html(txt);
            $('#header-module-name').attr('href','#'+route_url.toLowerCase());

            if (obj.child_route) {
                $('#header-child-module-name').html(' |&nbsp; ' + obj.child_route);
                $('#header-child-module-name').attr('href','#'+route_url.toLowerCase()+'/'+obj.child_route.toLowerCase());
               
            }
            if (templates[route]) {

                $('#header-parent-module').append(templates[route]);
            }
        }
    });
});
