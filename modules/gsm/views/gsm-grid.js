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
    'backgridSelect_all'
], function($, _, Backbone, PageableCollection, Backgrid, Paginator, Marionette, moment, Radio, datalist, config, template, backgridSelect_all) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,
        className:'detailsGsmPanel',

        events: {
            'click .backgrid-container tbody tr': 'updateMap',
            'click td input[type=checkbox]':'colorizeOnMap',
            'click th input[type=checkbox]':'colorizeOnMap'
        },

        initialize: function(options) {
            this.radio = Radio.channel('gsm-detail');
            this.radio.comply('updateGrid', this.updateGrid, this);
            this.radio.comply('import', this.importChecked, this);
            this.radio.comply('1perhour', this.perhour, this);

            this.gsmID = options.gsmID;

            var Locations = PageableCollection.extend({
                url: config.coreUrl + 'dataGsm/' + this.gsmID + '/unchecked?format=json',
                mode: 'client',
                state:{
                    pageSize: 25
                },
                    
            });

            this.locations = new Locations();
        },

        updateGrid: function(obj) {
            var self=this;
            var checked=obj['checked'];
            var model_id=obj['id'];
            console.log('detail :' + model_id+' :'+checked);
            console.log(this.grid.collection.fullCollection.length);
            var models=[];
            this.grid.collection.fullCollection.each(function(model){
                
                if (model.id==model_id) {
                    model.trigger("backgrid:select", model, checked);
                    console.log(model);
                 }               
                 if (!self.grid.collection.get(model.id)) {
                        if (model.id == model_id)
                        model.trigger("backgrid:selected", model, checked);                   
                }
            });
            this.colorizeOnMap();
        },

        updateMap: function(evt) {
            if($(evt.target).is('td')) {
                var tr = $(evt.target).parent();
                var id = tr.find('td').first().text();
                var currentModel = this.locations.findWhere({id: Number(id)});
                Radio.channel('gsm-detail').command('updateMap', currentModel);
            }
        },

        perhour: function() {
            var self=this;
            if (this.checkHour && this.checkHour==true){
                var checked=false;
                this.checkHour=checked;
            }
            else {
                var checked=true;
                this.checkHour=checked;
            }
            console.log(this.checkHour);
            this.grid.collection.fullCollection.sortBy('date');
            var col0=this.grid.collection.fullCollection.at(0);
            var date=new Date(col0.get('date'));

            this.grid.collection.fullCollection.each(function (model,i) {
                var currentDate=new Date(model.get('date'));
                var diff=(date-currentDate)/(1000*60*60);
                if (i==0) diff=2;        
                if (!self.grid.collection.get(model.cid)) {
                    if(diff>1) {
                        model.trigger("backgrid:selected", model, self.checkHour);
                        date=currentDate;
                    }                    
                }
                else {
                    if(diff>1) {
                        model.trigger("backgrid:select", model, self.checkHour);
                        date=currentDate;
                    }                    
                }
            
            });
            this.colorizeOnMap();
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
                cell: Backgrid.DatetimeCell
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

            this.$el.append(this.paginator.render().el);
            var height = $(window).height() -
                $('#header-region').height() - this.paginator.$el.height() -
                $('#info-container').outerHeight();
            this.$el.height(height);
            this.locations.fetch({reset: true});

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
            $.ajax({
                url:config.coreUrl+'dataGsm/' + this.gsmID + '/unchecked/import',
                data: JSON.stringify({data: importList, id_ind: ind_id})
            });
   
        },

        colorizeOnMap: function(){
            var models=this.grid.getSelectedModels();
            this.radio.command('colorizeSelectedRows',models);dict
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