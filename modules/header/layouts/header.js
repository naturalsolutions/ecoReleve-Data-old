define([
    'marionette',
    'radio',
    'views/user',
    'nicescroll',
    'text!modules2/header/templates/header.html'
], function(Marionette, Radio, UserView, nicescroll, template) {

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
            $('#header-module-name').html(txt);
            $('#header-module-name').attr('href','#'+route_url.toLowerCase());
        }
    });
});
