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
            'change input[name="allSt-monitoredSiteType"]' :'updateSiteName',
            //'change input[name="allSt-fieldWorker"]' :'getFieldWorkerId'
        },
        ui: {
            beginDate: 'input[name="allSt-beginDate"]',
            endDate : 'input[name="allSt-endDate"]',
            stationField :'#st-station',
            indivId : 'input[name="allSt-indivId"]',
            fieldworker :'input[name="allSt-fieldWorker"]'
        
        },
        initialize: function(options) {
            this.radio = Radio.channel('input');

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
            var self = this;
            $(this.ui.indivId).change( function() {  
                self.getIndivId();
            });
        },

        onDestroy: function(evt) {
            $('#left-panel').css('padding-right', '15');
            $('#left-panel').css('padding-top', '20');
        },

        onRender: function() {
   
        },
        update: function(e) {
            var input = $(e.target);
            var name = $(input).attr('name').split('-')[1];
            if(name !='fieldWorker'){   // for this field we need to get worker id from datalist
                var value = e.target.value;
                if (!value){ value =null;}
                this.filter[name].Value = value;
            }
            this.getFieldWorkerId(e);
            //this.updateGrid();
        },
        getFieldWorkerId : function(e){
            var fieldWorkerName = $(e.target).val();
            var fieldWorkerId = $('#userId_list > option[value="'+ fieldWorkerName + '"]').text();
            this.filter.fieldWorker.Value = parseInt(fieldWorkerId);
            console.log(fieldWorkerId);

            this.updateGrid();
        },
        getIndivId : function(){
            var indivId = this.ui.indivId.val();
            if (!indivId){ indivId =null;}
            this.filter.indivId.Value = indivId;
            this.updateGrid();
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
            this.updateGrid();
        },
        updateStationType : function(e){
            var stationType = $('input[name="all-stationType"]:checked').val();
            // update input name
            this.ui.stationField.attr('name','allSt-' + stationType);
            var stName = this.ui.stationField.val();
            if (stationType =='Name'){
                this.filter.siteName = null;
                this.filter.Name = stName;
                // remove link to monitored sites names datalist
                this.ui.stationField.removeAttr('list');  
            } else {
                this.filter.Name = null;
                this.filter.siteName =stName;
                this.ui.stationField.attr('list','sitesNames_list'); 
            }
            // this.updateGrid();
        },
        updateSiteName : function(e){
            var siteType = $(e.target).val();
            if(siteType){
                this.getSitesNames(siteType);
                $('input[name="all-stationType"]').prop("checked", true); 
                this.ui.stationField.val();
            }
        },
        getSitesNames: function(type){
             var url = config.coreUrl + 'monitoredSite/name';
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
            if(this.ui.beginDate.val()){
                this.updateGrid();
            }
        },
        updateEndDateOp : function(){
            var operator = $('#allSt-endDate-op option:selected').text();
            this.filter.endDate.Operator = operator;
            var bdeginDateValue = $('input[name="allSt-beginDate"]');
            if(this.ui.endDate.val()){
                this.updateGrid();
            }
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
        }
    });
});
