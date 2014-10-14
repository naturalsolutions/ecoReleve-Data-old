define([
    'marionette',
    'radio',
    'config',
    //'modules2/input/views/ns-forms',
    'bbForms',
    'models/station',
    'collections/waypoints',
    'modules2/input/views/input-grid',
    'modules2/input/views/input-map',
    'modules2/input/views/input-forms',
    'text!modules2/input/templates/input-station.html',
    'text!modules2/input/templates/new-station.html'
], function(Marionette, Radio, config, BbForms, Station,Waypoints,Grid, 
    Map, Forms, template, stationTemplate) {

    'use strict';

    return Marionette.LayoutView.extend({
        className: 'input-container',
        template: template,

        regions: {
           // form: '#station-form',
           gridRegion : '#gridImportedWaypoints',
           mapRegin : '#mapImportedWaypoints',
           formsRegion : '#stationDetails',
           stationMap : '#station-map'
        },
        events : {
            'click #inputGetStData' : 'commitForm',
            'change input.stationtype' : 'stationType',
            'click #btnNext' : 'nextStep',
            'click #btnPrev' : 'prevStep'
        },

        initialize:function(options) {
            // init stationtype 
            this.stType ='new';
            this.radio = Radio.channel('input');
            Radio.channel('input').comply('generateStation', this.generateStation, this);
           /* this.radio = Radio.channel('gsm-detail');
            this.gsmID = options.gsmID;*/
        },

        onBeforeDestroy: function() {
            //this.radio.reset();
        },
        stationType : function() {
            var stType = $('input[name=stationtype]:radio:checked').val();
            // update station type value
            this.stType = stType;
        },
        nextStep : function() {
             var step = $('#inputWizard').wizard('selectedItem').step;
               console.log("step to : " + step);
               if (step==2){
                // new station
                var tm = $(stationTemplate).html();
                    if(this.stType =='new'){
                        var station = new Station();
                        this.form = new BbForms({
                                model: station,
                                template: _.template(tm)
                        }).render();
                         $('#station-form').empty().append(this.form.el);
                         $('#btnNext').addClass('disabled');
                         // clear other regions if they are filled
                         this.mapRegin.reset();
                         this.gridRegion.reset();
                         // display map
                        var map = new Map();
                        this.stationMap.show(map);
                         $('#inputGetStData').removeClass('masqued');
                    }
                    else if (this.stType =='imported'){
                        // need to select a point -> desactivate next
                        $('#btnNext').addClass('disabled');
                        var lastImportedStations = new Waypoints();
                        lastImportedStations.fetch();
                        var ln = lastImportedStations.length;
                        if (ln > 0){
                            // delete map used in new station if exisits
                            this.stationMap.reset();
                            $('#station-form').empty().append('<h4>Please, select a station on the grid </h4>');
                            var mygrid = new Grid({collections : lastImportedStations});
                            this.gridRegion.show(mygrid);
                            // display map
                            var mp = new Map();
                            this.mapRegin.show(mp);
                            mp.addCollection(lastImportedStations);

                        } else {
                             $('#station-form').empty().append('<h4> there is not stored imported waypoints, please use import module to do that. </h4>');
                        }
                        
                         $('#inputGetStData').addClass('masqued');
                       
                    } else {

                        $('#station-form').empty().append('<p> old stations </p>');
                        $('#inputGetStData').addClass('masqued');
                    }
               }
        },
        prevStep :  function() {
             var step = $('#inputWizard').wizard('selectedItem').step;
               console.log("step to : " + step);
             $('#btnNext').removeClass('disabled');
        },
        onShow: function() {

            $('#inputWizard').on('changed.fu.wizard', function () {
                var step = $('#inputWizard').wizard('selectedItem').step;
                console.log("change step to : " + step);
                if(step == 1){
                    $('#btnNext').removeClass('disabled');
                }
              // do something
              
            });

            /*var bbform =  new Forms();         
            this.form.show(bbform);*/
           /* var tm = NsForm;
           this.form.show(new NsForm());*/
           /* this.info.show(new Info());
            this.grid.show(new Grid({gsmID:this.gsmID}));
            this.map.show(new Map());*/
        },
        commitForm : function() {
            //this.form.commit();
            var errors = this.form.commit({ validate: true });
            console.log(errors);
            var currentStation = this.form.model;
            //console.log(currentStation);
            if(!errors){
                // add details station region to next step container
                var formsView = new Forms({ model : currentStation});
                this.formsRegion.show(formsView);

                $('#inputWizard').wizard('next');
                $('#btnNext').removeClass('disabled');
            } else {
                console.log(errors);
                $.each(errors, function( index, value ) {
                console.log( index + ": " + value.message );
                    $('#error-' + index ).text(value.message);
                });
                $('#btnNext').addClass('disabled');
            }
        },
        generateStation : function(model) {
            // generate a station using the selected waypoint
            var newStation = new Station();
            newStation.set('id_', model.get('id'));
            newStation.set('Name', model.get('name'));
            newStation.set('LAT',model.get('latitude'));
            newStation.set('LON',model.get('longitude'));
            newStation.set('FieldActivity_Name',model.get('fieldActivity'));
            newStation.set('Date_',model.get('waypointTime'));
            newStation.set('time_',model.get('time'));
            newStation.set('FieldWorker1',model.get('fieldWorker1'));
            newStation.set('FieldWorker2',model.get('fieldWorker2'));
            newStation.set('FieldWorker3',model.get('fieldWorker3'));
            newStation.set('FieldWorker4',model.get('fieldWorker4'));
            newStation.set('FieldWorker5',model.get('fieldWorker5'));
            newStation.set('FieldWorkersNumber',model.get('fieldWorkersNumber'));
            this.currentUsedStation = newStation;   
            // add details station region to next step container
            var formsView = new Forms({ model : newStation});
            this.formsRegion.show(formsView);

        }
    });
});
