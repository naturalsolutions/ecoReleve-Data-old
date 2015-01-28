define([
    'jquery',
    'underscore',
    'backbone',
    'backbone.paginator',
    'backgrid',
    'backgrid.paginator',
    'marionette',
    'moment',
    'radio',
    'utils/datalist',
    'config',
    'text!modules2/validate/gsm/templates/gsm-grid.html',
    'backgridSelect_all',
], function($, _, Backbone, PageableCollection, Backgrid, Paginator, Marionette, moment, Radio, datalist, config, template, backgridSelect_all) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,
        className:'full-height',

        events: {
            'click .backgrid-container tbody tr': 'focusOnMap',
            'click td input[type=checkbox]':'updateMap',
        },



        initialize: function(options) {
            this.radio = Radio.channel('gsm-detail');
            this.radio.comply('updateGrid', this.updateGrid, this);
            this.radio.comply('import', this.importChecked, this);
            this.radio.comply('1perhour', this.perhour, this);
            this.radio.comply('clearAll', this.clearAll, this);

            this.gsmID = options.gsmID;
            this.pageSize = 25;

            var Locations = PageableCollection.extend({
                url: config.coreUrl + 'dataGsm/' + this.gsmID + '/unchecked/'+options.id_ind+'?format=json',
                mode: 'client',
                state:{
                    pageSize: 25
                },
                    
            });

            this.locations = new Locations();
        },
        onShow: function() {
            var myCell = Backgrid.NumberCell.extend({
                decimals: 3,
                orderSeparator: ' ',
            });

            var columns = [{
                name: 'id',
                label: 'ID',
                editable: false,
                renderable: false,
                cell: 'string',
                

            }, {
                name: 'date',
                label: 'DATE',
                editable: false,
                cell: 'string'
            }, {
                editable: false,
                name: 'lat',
                label: 'LAT',
                cell: myCell,
                

            }, {
                editable: false,
                name: 'lon',
                label: 'LON',
                cell: myCell,
               

            }, {
                editable: false,
                name: 'ele',
                label: 'ELE (m)',
                cell: Backgrid.IntegerCell.extend({
                    orderSeparator: ''
                }),
                

            }, {
                editable: false,
                name: 'dist',
                label: 'DIST (km)',
                cell: myCell,
                

            }, {
                editable: false,
                name: 'speed',
                label: 'SPEED (km/h)',
                cell: myCell,
              

            }, {
                editable: true,
                name: 'import',
                label: 'IMPORT',
                cell: 'select-row',
                headerCell: 'select-all'

            }];

            // Initialize a new Grid instance
            this.grid = new Backgrid.Grid({
                columns: columns,
                collection: this.locations
            });

            this.$el.find('#locations').append(this.grid.render().el);

            // Initialize a new Paginator instance
            this.paginator = new Backgrid.Extension.Paginator({
                collection: this.locations
            });

            this.$el.find('#paginator').append(this.paginator.render().el);
           /* var height = $(window).height() -
                $('#header-region').height() - this.paginator.$el.height() -
                $('#info-container').outerHeight();
            this.$el.height(height);*/
            this.locations.fetch({reset: true});
            this.$el.find('.select-all-header-cell>input').css('display','none');
        },

        clearAll: function(){
            var models=this.grid.getSelectedModels();
            for (var i = 0; i < models.length; i++) {
                models[i].trigger("backgrid:selected", models[i], false);
                models[i].trigger("backgrid:select", models[i], false);
            };
            this.radio.command('clearAllMap', models);
        },

        perhour: function() {
            var self=this;

            this.grid.collection.fullCollection.sortBy('date');
            var col0=this.grid.collection.fullCollection.at(0);

            var date=new moment(col0.get('date'));

            this.grid.collection.fullCollection.each(function (model,i) {
                var currentDate=new moment(model.get('date'));
                var diff=(date-currentDate)/(1000*60*60);
                if (i==0) diff=2;        
                if (!self.grid.collection.get(model.cid)) {
                    if(diff>1) {
                        model.trigger("backgrid:selected", model, true);
                        date=currentDate;
                    }                    
                }
                else {
                    if(diff>1) {
                        model.trigger("backgrid:select", model, true);
                        date=currentDate;
                    }                    
                }
            });


            var models=this.grid.getSelectedModels();

            this.radio.command('selectOneByHour', models);
        },


        updateGrid: function(marker) {
            var self=this;
            var checked=marker['checked'];

            var feature = marker.feature;
            var model_id=feature['id'];
            var models=[];
            var i=0, position=1;
            this.grid.collection.fullCollection.each(function(model){
                i++;
                if (model.id==model_id) {
                    model.trigger("backgrid:select", model, checked);
                    position=i;
                 }               
                 if (!self.grid.collection.get(model.id)) {
                        if (model.id == model_id)
                        model.trigger("backgrid:selected", model, checked);                   
                }
            });
            var page=Math.ceil(position/25);
            self.locations.getPage(page);
        },
        updateMap: function(e){
                var tr = $(e.target).parent().parent();
                var id = tr.find('td').first().text();
                Radio.channel('gsm-detail').command('updateMap', id);
        },


        focusOnMap: function(e) {
            if($(e.target).is('td')) {
                var tr = $(e.target).parent();
                var id = tr.find('td').first().text();
                Radio.channel('gsm-detail').command('focus', id);
            }
        },

        importChecked : function(ind_id) {
            var importList = [];
            var checkedLocations=this.grid.getSelectedModels();
            var i;
            for (i in checkedLocations){
                var model=checkedLocations[i];
                var location= model.get('id');
                importList.push(location);
            }
            console.log(importList);
            console.log(ind_id);
            $.ajax({
                url:config.coreUrl+'dataGsm/' + this.gsmID + '/unchecked/import',
                contentType: 'application/json',
                type: 'POST',
                data:JSON.stringify({data: importList, id_ind: ind_id})
            });
   
        },


        
        onDestroy: function() {
           /* $('body').css('background-color', 'white');*/
           /* this.radio.stopComplying('loaded');*/
            this.grid.remove();
            this.grid.stopListening();
            this.grid.collection.reset();
            this.grid.columns.reset();
            delete this.grid.collection;
            delete this.grid.columns;
            delete this.grid;
        },
        
    });
});
