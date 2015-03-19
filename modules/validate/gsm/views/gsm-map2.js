define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'config',
    'radio',
    'text!modules2/validate/gsm/templates/tpl-map.html',
    'ns_modules_map/ns_map',


], function($, _, Backbone , Marionette, config, Radio, tpl, NsMap, Com
    ) {

    'use strict';

    return Marionette.ItemView.extend({
        template: tpl,
        className: 'full-height col-xs-12',

        events: {

        },
        initialize: function(options) {
            this.type = options.type;
            this.init=true;
            this.gsmID=options.gsmID;
            this.id_ind=options.id_ind;
           
            
            switch(this.type){
                case 'gsm':
                    
                    this.type_url = config.coreUrl+'dataGsm/';
                    break;
                case 'argos':
                   
                    this.type_url = config.sensorUrl+'argos/';

                    break;
                case 'gps':
                
                    this.type_url = config.sensorUrl+'gps/';
                    break;
                default:
                    console.warn('type error');
                    break;
            };
             this.initGeoJson();
             this.com = options.com;
            /*
            Radio.channel('gsm-detail').comply('selectOneByHour', this.selectOneByHour, this);
            Radio.channel('gsm-detail').comply('clearAllMap', this.clearAll, this);
            Radio.channel('gsm-detail').comply('focus', this.focus, this);
            Radio.channel('gsm-detail').comply('updateMap', this.updateMap, this);*/
        },

        initGeoJson: function(){
            if(this.type == 'gsm'){
              var url = this.type_url +this.gsmID+ '/unchecked/'+this.id_ind+'?format=geojson';
            }else{
              var url = this.type_url +this.gsmID+ '/unchecked/'+this.id_ind+'/geo';              
            };
            
            $.ajax({
                url: url,
                contentType:'application/json',
                type:'GET',
                context: this,
                data: {
                    page: 1,
                    per_page: 20,
                    criteria: null,
                    offset: 0,
                    order_by: '[]',
                },
            }).done(function(datas){
                this.geoJson= datas;
                this.initMap(datas);
            }).fail(function(msg){
                console.warn(msg);
            });
        },

        initMap: function(datas){
            this.map = new NsMap({
                cluster: true,
                popup: false,
                geoJson: datas,
                legend : true,
                bbox: true,
                selection : true,
                element: 'map',
                com: this.com,             
            });
            //this.rg_map.show(this.map);
            this.map.init();
        },

        setIconMarker: function(marker){    
          if(marker.checked){
            marker.setIcon(this.selectedIcon);
          }else{
            marker.setIcon(this.icon);
          }

        },

        updateGrid: function(marker){
          if(marker.checked){
            marker.checked=false;
          }else{
            marker.checked=true;  
          }

          marker.checked = !marker.checked;

          this.setIconMarker(marker);

          Radio.channel('gsm-detail').command('updateGrid', marker);
        },

        updateMap: function(id){
          var marker = this.dict[id];

          if(marker.checked){
            marker.checked=false;
          }else{
            marker.checked=true;  
          }

          this.setIconMarker(marker);
        },

        selectOneByHour: function(models){
          var id, marker;
          for (var i = 0; i < models.length; i++) {
            id = models[i].get('id');
            marker = this.dict[id];
            marker.checked=true;
            this.setIconMarker(marker);
          };
        },




        focus: function(id){
          var marker = this.dict[id];

          if(this.lastFocused && this.lastFocused != marker){
            this.setIconMarker(this.lastFocused);
          }
          this.lastFocused = marker;
          marker.setIcon(this.focusedIcon);

          /*=====================================
          =            Center On Map            =
          =====================================*/
                    
          var center = marker.getLatLng();
          this.map.panTo(center);
          //quick fix for refresh bug
          this.map.setZoom(2);
          this.map.setZoom(18);
        },


        clearAll: function(models){
          var id, marker;
          for (var i = 0; i < models.length; i++) {
            id = models[i].get('id');
            marker = this.dict[id];
            marker.checked=false;
            this.setIconMarker(marker);
          };
        },





 
    });
});
