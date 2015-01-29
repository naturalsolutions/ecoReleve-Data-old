define([
    'underscore',
    'jquery',
    'backbone',
    'marionette',
    'moment',
    'radio',
    'config',
    'collections/monitoredsites',
    'modules2/rfid/views/rfid-map',
    'models/monitoredsite',
    'utils/datalist',
    'utils/datetime',
    'text!modules2/rfid/templates/rfid-deploy.html',
    'dateTimePicker'
], function(_, $, Backbone, Marionette, moment, Radio, config, MonitoredSites, Map, MonitoredSite, datalist, datetime, template) {

    'use strict';

    return Marionette.LayoutView.extend({
        template: template,
        
        className:'container full-height',
        events: {
            'click #btn-action': 'pose',
            'focus input': 'clearErrors',
            'input #input-mod': 'updateForm',
            'input #input-type': 'updateName',
            'input #input-name': 'updateMap',
            'change #input-begin': 'updateType',
            'change #dateTimePicker1': 'updateType'
            
        },

        regions: {
            mapRegion: "#map-container"
        },

        ui: {
            mod: '#input-mod',
            type: '#input-type',
            typeList: '#type-list',
            name: '#input-name',
            nameList: '#name-list',
            begin: '#input-begin',
            end: '#input-end',
            btn: '#btn-action'
        },

        initialize: function() {
            this.sites = new MonitoredSites();
            this.action = '';
            var that=this;
            this.listenTo(this.sites, 'reset', this.updateName);           

            // Get the RFID modules.
            datalist.fill( {
                url: config.coreUrl + 'rfid/identifier'
            }, '#mod-list');
            // Get the site distinct types.
            /*datalist.fill({
                url: config.coreUrl + 'monitoredSite/type'
            }, '#type-list');*/
            // Get the monitored sites.
            //this.sites.fetch();
           this.map = new Map();
        },

        onShow: function() {
            this.$el.find('#input-begin').attr('placeholder', config.dateLabel);
            this.$el.find('#input-end').attr('placeholder', config.dateLabel);
            $('body').addClass('home-page');
            $('#main-region').addClass('obscur full-height');
            this.mapRegion.show(new Map());

        },

        onDestroy: function() {
            delete this.modules;
            delete this.sites;
            $('#main-region').removeClass('obscur');
        },

        updateType: function(e) {
            var that=this;
            $.ajax({
                context: this,
                url: config.coreUrl + 'rfid/byDate',
                data: {'date' :this.ui.begin.val()} ,
            }).done( function(data) {
                
                that.sites.reset(data['siteName_type']);
                that.sites.typeList=data['siteType'];
                var html=''; 
                that.sites.typeList.forEach( function(type) {
                    html += '<option class="option_list">' + type + '</option>';
                });
                that.ui.typeList.html(html);
            });
            
        },

        updateMap: function(e) {
            var type = this.ui.type.val();
            var name = this.ui.name.val();
            if(type && name) {
                var monitoredSite = this.sites.findWhere({
                    type: type,
                    name: name
                });
                var position = monitoredSite.get('positions');
                console.log(position);
                var lat = position.lat;
                var lon = position.lon;
                console.log('lat  '+lat+'  long '+lon);
                Radio.channel('rfid').command('moveCenter', [lon, lat]);
                Radio.channel('rfid').command('addOverlay', [lon, lat]);
            }
        },

        updateName: function(e) {
            var html = '';
            var type = this.ui.type.val();
            if(type !== '') {
                console.log('in uoName');
                _.each(this.sites.where({type:type}), function(site) {
                    html += '<option>' + site.get('name') + '</option>';
                });
            }
            else {
                this.sites.forEach( function(site) {
                    html += '<option>' + site.get('name') + '</option>';
                });
            }
            this.ui.nameList.html(html);
        },

        clearErrors: function() {
            $('.form-group').removeClass('has-error');
            $('.help-block').text('');
        },

        setError: function(elt, message) {
            message = typeof message !== 'undefined' ? message : 'Required';
            $(elt).addClass('has-error');
            $(elt+' .help-block').text(message);
        },

        disableAll: function() {
            this.ui.type.prop('disabled', true);
            this.ui.type.prop('value', null);
            this.ui.name.prop('disabled', true);
            this.ui.name.prop('value', null);
            this.ui.begin.prop('disabled', true);
            this.ui.begin.prop('value', null);
            this.ui.end.prop('disabled', true);
            this.ui.end.prop('value', null);
            this.ui.btn.prop('disabled', true);
            this.ui.btn.text('Choose a module');
            this.action = '';
        },

        enableAll: function() {
            this.ui.type.prop('disabled', false);
            this.ui.type.prop('value', null);
            this.ui.name.prop('disabled', false);
            this.ui.name.prop('value', null);
            this.ui.begin.prop('disabled', false);
            this.ui.begin.prop('value', null);
            this.ui.end.prop('disabled', false);
            this.ui.end.prop('value', null);
            this.ui.btn.prop('disabled', false);
            this.ui.btn.text('Pose');
            this.action = 'pose';
            $('.dateTimePicker').datetimepicker({

                use24hours: true

            });
            // Get the sites, show their names.
            /*
            $.ajax({
                url: config.coreUrl + 'monitoredSite',
                contentType: 'application/json',
                context: this,
                data: JSON.stringify({
                    'cols':['name', 'name_Type'],
                    'order':['name']
                }),
                type: 'POST',
            }).done( function(data) {
                this.sites.reset(data);
            });
            */
        },

        updateForm: function(evt) {
            var name = evt.target.value;
            $.ajax({
                context: this,
                url: config.coreUrl + 'rfid/byName/' + name,
            }).done( function(data) {
                var equip = data.equip;
                var site = data.site;
                if (equip === null) {
                    this.enableAll();
                }
                else {
                    if(equip.end_date === null) {
                        this.ui.type.prop('disabled', true);
                        this.ui.type.prop('value', site.type);
                        this.ui.name.prop('disabled', true);
                        this.ui.name.prop('value', site.name);
                        this.ui.begin.prop('disabled', true);
                        this.ui.begin.prop('value', datetime.loadAndFormat(equip.begin_date));
                        this.ui.end.prop('disabled', false);
                        this.ui.end.prop('value', null);
                        this.ui.btn.prop('disabled', false);
                        this.ui.btn.text('Remove');
                        this.action = 'remove';
                        this.updateMap();
                    }
                    else {
                        this.enableAll();
                    }
                }
            }).fail( function(data) {
                this.disableAll();
                $('#group-mod').addClass('has-error');
                $('#help-mod').text('Invalid value');
            });
        },

        pose: function(evt) {
            evt.preventDefault();
            if ( this.isValid() ) {
                evt.stopPropagation();
                $.ajax({
                    url: config.coreUrl + 'monitoredSiteEquipment/pose',
                    context: this,
                    type: 'POST',
                    data: {
                        identifier: this.ui.mod.val(),
                        type: this.ui.type.val(),
                        name: this.ui.name.val(),
                        begin: this.ui.begin.val(),
                        end: this.ui.end.val(),
                        action: this.action
                    }
                }).done( function(data) {
                    alert('Success : ' + data);
                    $('form').trigger('reset');
                    this.disableAll();
                }).fail( function(data) {
                    alert('Error : ' + data.responseText);
                    $('form').trigger('reset');
                    this.disableAll();
                });
            }
        },

        isValid: function() {
            var valid = true;

            if(this.ui.type.val() === '') {
                console.log(this.ui.type.val());
                this.setError('#group-type');
                valid = false;
            }
            if(this.ui.name.val() === '') {
                console.log(this.ui.name.val());
                this.setError('#group-name');
                valid = false;
            }
            if( !datetime.isValid(this.ui.begin.val()) ) {
                console.log(this.ui.begin.val());

                this.setError('#group-begin', 'Invalid format');
                valid = false;
            }
            if( !datetime.isValid(this.ui.end.val())
                && ( this.action !== 'pose' || this.ui.end.val() !== '') ) {
                this.setError('#group-end', 'Invalid format');
                valid = false;
            }
            return valid;
        }, 

    });
});
