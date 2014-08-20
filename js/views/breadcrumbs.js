define([
    'jquery',
    'underscore',
    'backbone',
    'views/base_view',
    'text!templates/breadcrumbs.html'
], function($, _, Backbone, BaseView, template){
    'use strict';
    return BaseView.extend({
        template: _.template(template),

        initialize: function () {
            this.context = '';
            var body_width = $(window).width();
            // stats displayed only for screens with width > 640
            if (body_width > 640 ){
                this.appName = "ecoReleve-data";
            } else {
                this.appName = "home";
            }
            //this.listenTo(this.model, 'route', this.update);
            BaseView.prototype.initialize.apply(this, arguments);
        },

        serialize: function () {
            return {
                context: this.context,
                appName: this.appName
            };
        },

        render: function(){
            var compiledTemplate = this.template(this.serialize());
            this.$el.html(compiledTemplate);
        },

        update: function (name, args) {
            switch (name) {
                case 'home':
                    this.context = '';  // home
                    break;
                case 'entryStation':
                    this.context = 'station';
                    break;
                case 'export':
                    this.context = 'export';
                    break;
        case 'import':
            this.context = 'import';
            break;
        case 'allData':
            this.context = 'all data';
            break;
        case 'objects':
            this.context = 'objects';
            break;
        case 'argos':
            this.context = 'argos';
            break;
        case 'birds':
            this.context = 'individuals';
            break;
        case 'importLoad':
            this.context = '<a class="headerLink" href="#import">import</a> > load data';
            break;
        case 'importMap':
            this.context = '<a class="headerLink" href="#import">import</a> > map';
            break;
        case 'importMetadata':
            this.context = '<a class="headerLink" href="#import">import</a> > finish';
            break;
        case '':
         this.context = 'home';
            break;
        case 'stationType':
        this.context = '<a class="headerLink" href="#stationType">input</a> > station';
            break;
        case 'newStation':
        this.context = '<a class="headerLink" href="#stationType">input</a> > <span class="maskForSmall">new</span> station';
            break;
        case 'protoChoice':
        this.context = '<a class="headerLink" href="#stationType">input</a> > protocol <span class="maskForSmall">list</span>';
            break;
        case 'importedStation' :
        this.context = '<a class="headerLink" href="#stationType">input</a> ><span class="maskForSmall">imported</span> station';
            break;
        case 'dataEntry':
        this.context = '<a class="headerLink" href="#stationType">input</a> ><a class="headerLink" href="#proto-choice">protocol</a><span class="maskForSmall"> > data entry</span>';
            break;
        case 'exportFilter':
            this.context = '<a class="headerLink" href="#export">export</a> > <span id="filterViewName">select data view<span>';
            break;
        case 'exportMap':
            this.context = '<a class="headerLink" href="#export">export</a> > select a geographic extent';
            break;
        case 'exportFields':
            this.context = '<a class="headerLink" href="#export">export</a> > select columns to display (<span id="filterViewName"></span>)';
            break;
        case 'exportResult' :
            this.context = '<a class="headerLink" href="#export">export</a> > result';
            break;
        case 'myData':
            this.context = 'my data';
            break;


        /*default:
        this.context = 'home';
            break;*/
            }
            this.render();
        }
    });
});
