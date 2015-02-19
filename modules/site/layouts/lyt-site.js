define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'config',
    'radio',
    'bbForms',
    'modules2/site/views/rfid-grid',
    'modules2/site/views/rfid-map',
    'text!modules2/site/templates/tpl-site.html',
    'text!modules2/site/tools/tpl-filters.html',
    'filter/model-filter',

], function($, _, Backbone, Marionette, config, Radio,
    BbForms, 
    ViewGrid, ViewMap,
    tpl, tplFilters, NSFilter) {

    return Marionette.LayoutView.extend({
        className: 'full-height monitored-sites',
        template: tpl,

        events: {
            'click button#update' : 'update',
            'click button#display-grid' : 'displayGrid',
            'click button#display-map' : 'displayMap',
            'click button#reset' : 'reset',
            'click button#add' : 'add',
            'click button#deploy' : 'deploy',
            'click tbody > tr': 'detail',
        },

        initialize: function(){
            this.radio = Radio.channel('route');
            this.datas={};
            this.form;
            this.datas;

            this.filtersList={
                type: "Select",
                name: "Select",
                LAT: "DECIMAL(9, 5)",
                LON: "DECIMAL(9, 5)",
                Status: "Select",
            };
        },
        onShow: function(){
            //this.initFilters();
            $('#main-region').addClass('full-height');
            this.mapView= new ViewMap();
            this.gridView= new ViewGrid();
            this.filters = new NSFilter({
                filters: this.filtersList,
                channel: 'modules',
                url: config.coreUrl + 'monitoredSite/',
            });

            this.filters.feed('type');
            this.filters.feed('name');
            this.filters.feedOpt('Status', ['Active', 'Inactive']);
        },

        displayGrid: function(){
            $('.pannel-map').removeClass('active');
            $('.pannel-grid').addClass('active');
        },

        displayMap: function(){
            $('.pannel-grid').removeClass('active');
            $('.pannel-map').addClass('active');
        },

        onDestroy: function() {
            //$('body').removeClass('');
        },

        onRender: function(){

        },

        infos: function(){
            this.offset = this.gridView.getGrid().getPaginatorOffSet();
            this.limit = this.gridView.getGrid().getPageSize();
        },

        update: function(){
            this.filters.update();
        },

        // today: function(){
        //     var filters=[];
        //     var today = new Date();
        //     today.setHours(00);
        //     today.setMinutes(00);
        //     today.setSeconds(01);
        //     filters.push({"Column":"begin_date","Operator":">","Value": today});
        //     today.setHours(23);
        //     today.setMinutes(59);
        //     today.setSeconds(59);
        //     filters.push({"Column":"end_date","Operator":"<","Value": today});

        //     console.log(filters);

        //     this.grid.update(filters);
        //     this.mapView.update(filters);

        // },

        reset: function(){
            this.filters.reset();
        },


        add: function(){
            console.log('add');
            this.radio.command('site:add');
        },
        deploy: function(){
            console.log('deploy');

            this.radio.command('site:deploy');
        },

        detail: function(evt) {
            var row = $(evt.currentTarget);
            var id = $(row).find(':first-child').text()

            Radio.channel('route').command('site:detail', id);
        }

    });
});


