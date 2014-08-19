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
            return {name: "Olivier Rovellotti"};
        },
        render: function(){
            this.$el.html(this.template(this.serialize()));
        },
    });
});
