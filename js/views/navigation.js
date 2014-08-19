define(['jquery', 'backbone', 'views/base_view'], function($, Backbone, BaseView){
    'use strict';
    return BaseView.extend({
        template: 'navigation',
        events: {
            'click a': 'clickFollowLink'
        },

        initialize: function () {
            this.listenTo(this.model, 'route', this.update);
            BaseView.prototype.initialize.apply(this, arguments);
        },

        serialize: function () {
            // Placeholder, will be refined later on
            /*
            return {
                isAdmin: app.instances.currentUser.get('isAdmin')
            };
            */
        },

        afterRender: function () {
            $('#nav-switch').on('click', this, function (e) {
                e.preventDefault();
                e.stopPropagation();
                e.data.show();
            });
        },

        hide: function () {
            this.$el.hide();
            this.$el.off('click', this.clickCancelNav);
            $('body').removeClass('modal-open');
            $(".allDataFilterPanel").css("z-index",5000);
            $("header.navbar.navbar-static-top").css("position","fixed");
        },

        show: function () {
            $('body').addClass('modal-open');
            this.$el.slideDown(800);
            this.$el.on('click', this, this.clickCancelNav);
            $("header.navbar.navbar-static-top").css("position","static");
            $(".allDataFilterPanel").css("z-index",0);
        },

        clickFollowLink: function (e) {
            e.stopPropagation();
            this.hide();
        },

        clickCancelNav: function (e) {
            e.stopPropagation();
            e.preventDefault();
            // /!\ event handler bound using jQuery's .on() method, "this" refers to the event target
            e.data.hide();
            $("header .navbar-static-top").css("position","fixed");
        },

        update: function (name, args) {
            // to update
            /*
            this.$el.find('.active').removeClass('active');
            switch (name) {
            case 'listSamples':
            case 'viewSample':
            case 'newSample':
            case 'editSample':
            case 'newSubject':
            case 'editSubject':
                this.$el.find('[data-model="sample"]').addClass('active');
                break;
            case 'listSampleTypes':
            case 'viewSampleType':
            case 'editSampleType':
                this.$el.find('[data-model="sampletype"]').addClass('active');
                break;
            case 'listSubjectTypes':
            case 'viewSubjectType':
            case 'editSubjectType':
                this.$el.find('[data-model="subjecttype"]').addClass('active');
                break;
            case 'listEventTypes':
            case 'viewEventType':
            case 'editEventType':
                this.$el.find('[data-model="eventtype"]').addClass('active');
                break;
            }
            */
        }
    });
});
