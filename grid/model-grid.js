define([
    'jquery',
    'underscore',
    'backbone',
    'config',
    'radio',
    'backgrid',
    'backbone.paginator',
    'backgrid.paginator',
    'grid/model-col-generator',

], function($, _, Backbone, config, Radio, Backgrid, PageColl, Paginator, colGene){
    'use strict';
    return Backbone.Model.extend({


        /*===================================
        =            Grid module            =
        ===================================*/
        
        /*
        dataTmp: {
            Date : "2012-07-05 16:41:00",
            StaID: 455513, 
            StaName: "4199-4710" 
        },*/
 

        pagingServerSide: true,        

        initialize: function(options){
            this.channel= options.channel;
            this.radio= Radio.channel(this.channel);

            this.radio.comply(this.channel+':grid:update', this.update, this);

        	this.url=options.url;
        	this.pageSize=options.pageSize;
            //this.columns = options.columns,
            this.pagingServerSide=options.pagingServerSide;
            console.log(options.columns);
            if (options.columns) {
                this.columns=options.columns;        
            }else {
                 this.colGene = new colGene({url : this.url + 'getFields', paginable:this.pagingServerSide, checkedColl: options.checkedColl });
                this.columns = this.colGene.columns ;
            }

            if (options.collection){
                this.collection=options.collection;
            }
            else{

                if(this.pagingServerSide){
                    this.initCollectionPaginable();
                }else if(this.pageSize) {
                        this.initCollectionPaginableClient();
                }
                else{
                    this.initCollectionNotPaginable();
                }
            }

        	this.initGrid();
            this.eventHandler();
        },

        initCollectionPaginable:function(){
            var PageCollection = PageColl.extend({
                sortCriteria: {},
                url: this.url+'search',
                mode: 'server',
                state:{
                    pageSize: this.pageSize
                },
                queryParams: {
                    
                    offset: function() {return (this.state.currentPage - 1) * this.state.pageSize;},
                    criteria: function() {
                        
                        return JSON.stringify(this.searchCriteria);},
                    order_by: function() {
                        var criteria = [];
                        for(var crit in this.sortCriteria){
                            criteria.push(crit + ':' + this.sortCriteria[crit]);
                        }
                        return JSON.stringify(criteria);},
                    
                },
            });

            this.collection = new PageCollection();
        },

        
        initCollectionPaginableClient:function(){
            console.log('');
            var PageCollection = PageColl.extend({
                url: this.url+'search',
                mode: 'client',
                state:{
                    pageSize: this.pageSize
                },
                queryParams: {
                    order: function(){
                    },
                    criteria: function() {
                        return JSON.stringify(this.searchCriteria);
                    },
                },
            });

            this.collection = new PageCollection();
        },

        
        initCollectionNotPaginable:function(){
            this.collection = new Backbone.Collection();
            this.collection.url=this.url+'search';

            
        },
        
        
        initGrid: function(){
            var tmp=JSON.stringify({criteria : null});
            
        	this.grid = new Backgrid.Grid({
        	    columns: this.columns,
        	    collection: this.collection
        	});

            this.collection.searchCriteria = {};
            this.collection.fetch({reset: true});


        },

        update: function(args){

            console.log(args.filters);
            if(this.pageSize){
                this.grid.collection.state.currentPage = 1;
                this.grid.collection.searchCriteria = args.filters;
                this.grid.collection.fetch({reset: true});

            }
            else{

                var datas= JSON.stringify(args.filters);
                this.grid.collection.fetch({reset: true, data : { 'criteria' : datas}});
            }

        },

        displayGrid: function(){
        	return this.grid.render().el;
        },


        displayPaginator: function(){
            this.paginator = new Backgrid.Extension.Paginator({
                collection: this.collection
            });
            return this.paginator.render().el
        },

        eventHandler: function () {
            var self=this;
            this.grid.collection.on('backgrid:edited',function(model){
                console.log(model.changed);
                model.save({patch:model.changed});

            })
        },


    });
});
