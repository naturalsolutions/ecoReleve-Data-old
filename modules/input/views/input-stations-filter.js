define([
    "jquery",
    "underscore",
    "backbone",
    'marionette',
    'radio',
    'utils/datalist',
    'utils/forms',
    'config',
    'text!modules2/input/templates/stations-filter.html'
], function($, _, Backbone, Marionette, Radio, datalist, forms, config, template) {

    "use strict";

    return Marionette.ItemView.extend({
        template: template,

        events: {
            'click #clear-btn': 'clear',
            'change input[type=text]': 'update',
            'focus input[type=text]': 'fill',
            'submit': 'catch',
            'change input[name="all-stationType"]' : 'updateStationType',
            'change input.coords' : 'checkVal',
            'change coord-min' : 'checkMinVal',
            'change coord-max' : 'checkMaxVal',
            'change input[name="allSt-beginDate"]' : 'update',
            'change  div.dateTimePicker' : 'updateDate',
            'change #allSt-beginDate-op' : 'updateBeginDateOp',
            'change #allSt-endDate-op' : 'updateEndDateOp',
            'change input[name="allSt-monitoredSiteType"]' :'updateSiteName'
        },

        initialize: function(options) {
            this.radio = Radio.channel('input');
            // Current filter
            /*this.filter =  {
                stationName : null,
                siteName :null,
                beginDate: null,
                beginDateOp : null,
                endDate:null,
                enDateOp: null,
                fieldWorker : null,
                fieldActivity: null,
                monitoredSiteType : null,
                region: null,
                minLat : null,
                maxLat: null,
                minLon: null,
                maxLon: null,
                indivId: null
            };*/
            this.filter =  {
                Name : {Operator: '=' , Value: null },    
                siteName : {Operator: '=' ,Value: null  },    
                beginDate: {Operator: '>=' ,Value: null  },    
                endDate: {Operator: '<=' ,Value: null  },    
                fieldWorker : {Operator: '=' ,Value: null  },    
                fieldActivity: {Operator: '=' ,Value: null  },  
                monitoredSiteType : {Operator: '=' ,Value: null  },    
                region: {Operator: '=' ,Value: null  },    
                minLat : {Operator: '>=' ,Value: null  },    
                maxLat: {Operator: '<=' ,Value: null  },    
                minLon: {Operator: '>=' ,Value: null  },    
                maxLon: {Operator: '<=' ,Value: null },    
                indivId: {Operator: '=' ,Value: null  }  
            };

        },
        catch: function(evt) {
            evt.preventDefault();
        },
        clear: function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            this.clearForm();
            this.filter = {};
            this.updateGrid();
        },
        clearForm: function() {
            this.$el.find('form').trigger('reset');
            this.$el.find('input').prop('disabled', false);
        },
        onShow: function(evt) {
            this.$el.parent().addClass('no-padding');
            var height=$(window).height();
            height -= $('#header-region').height();
            this.$el.height(height);
            $('#left-panel').css('padding-top', '0');
            this.$el.addClass('filter-bg-image');

            this.$el.find('.panel').css({'background-color' : 'rgba(0,0,0,0)', 'border':'none'});
            this.$el.find('.panel-heading').css({'border-radius':'0px'});

            this.$el.find('.panel-body').css({'background-color' : 'white'});
            $('.dateTimePicker').datetimepicker({
            }); 
        },

        onDestroy: function(evt) {
            $('#left-panel').css('padding-right', '15');
            $('#left-panel').css('padding-top', '20');
        },

        onRender: function() {
   
        },
        update: function(evt) {
            var input = $(evt.target);
            var name = $(input).attr('name').split('-')[1];
            var value = evt.target.value;
            this.filter[name].Value = value;
            // this.updateGrid();
        },
        updateDate: function(e){
            var input = $(e.target).find('input');
            var name = $(input).attr('name').split('-')[1];
            var value = $(input).val();
            this.filter[name].Value = value;
            if(name =='beginDate'){
                var operator = $('#allSt-beginDate-op option:selected').text();
                this.filter.beginDate.Operator = operator;
            }
            if(name =='endDate'){
                var operator = $('#allSt-endDate-op option:selected').text();
                this.filter.endDate.Operator = operator;
            }
           var tm = this.filter;
            //console.log(tm);
            this.updateGrid();
        },
        updateStationType : function(e){
            var stationType = $('input[name="all-stationType"]:checked').val();
            // update input name
            $('#st-station').attr('name','allSt-' + stationType);
            var stName = $('#st-station').val();
            if (stationType =='Name'){
                this.filter.siteName = null;
                this.filter.Name = stName;
                // remove link to monitored sites names datalist
                $('#st-station').removeAttr('list');  
            } else {
                this.filter.Name = null;
                this.filter.siteName =stName;
                $('#st-station').attr('list','sitesNames_list'); 
            }
            // this.updateGrid();
        },
        updateSiteName : function(e){
            var siteType = $(e.target).val();
            if(siteType){
                this.getSitesNames(siteType);
                $('input[name="all-stationType"]').prop("checked", true); 
                $('#st-station').val();
            }
        },
        getSitesNames: function(type){
             var url = config.coreUrl + 'monitoredSite/name';
            //this.listenTo(this.collection, 'reset', this.render);
            $.ajax({
                context: this,
                url: url,
                type:'POST',
                data : {type: type},
                dataType: 'json'
            }).done( function(data) {
                $('#sitesNames_list').remove();
                $('#stMonitoredSiteName').val('');
                this.generateDatalist(data,'sitesNames_list', '#st-station' );
            });
        },
        generateDatalist : function(data, listId, targetId){
            var dataList = $('<datalist id="' + listId +'"></datalist>');
            data.forEach(function(element) {
                $(dataList).append('<option>' + element + '</option>');
            });
            $('#input-datalists').append(dataList);
            // associate datalist to user input
            $(targetId).attr("list",listId);
        },
        updateBeginDateOp : function(){
            var operator = $('#allSt-beginDate-op option:selected').text();
            this.filter.beginDate.Operator = operator;
            this.updateGrid();
        },
        updateEndDateOp : function(){
            var operator = $('#allSt-endDate-op option:selected').text();
            this.filter.endDate.Operator = operator;
            this.updateGrid();
        },
        checkVal : function(e){
            var value = parseFloat($(e.target).val());
            if((isNaN(value)) || ((value > 90.0) || (value < -90.0))){
                alert('please input a valid value.');
                $(e.target).val('');
            }
        },
        checkMaxVal : function(e){
            var value = parseFloat($(e.target).val());
            if((isNaN(value)) || ((value > 90.0) || (value < -90.0))){
                alert('please input a valid value.');
                $(e.target).val('');
            }
        },
        updateGrid: function(){
            this.radio.command('updateStationsGrid', {filter:this.filter});
            /*$.ajax({
                url: config.coreUrl+'station/search',
                context : this,
                data:  JSON.stringify({criteria:this.filter}),
                type:'POST',
                contentType:'application/json',
                success: function(data){
                    console.log(data);
                }
            });*/
        }
    });
});
