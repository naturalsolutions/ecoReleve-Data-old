define([
    'jquery',
    'underscore',
    'backbone',
    'views/base_view',
    'text!templates/current_user.html'
], function($, _, Backbone, BaseView, template){
    'use strict';
    return BaseView.extend({
        template: _.template(template),
        serialize: function() {
            console.log('serializing');
            return {firstname: "Olivier", lastname: 'Rovellotti'};
        },
        render: function(){
            this.$el.html(this.template(this.serialize()));
        },
    });
});
