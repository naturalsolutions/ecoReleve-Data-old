define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'text!modules2/import/templates/import.html',
    'config',
    'fuelux',
    'modules2/import/views/import-map',
    'modules2/import/views/import-grid',
    'radio',
    'collections/waypoints',
    'utils/xmlParser'
], function($, _, Backbone, Marionette, template,config,fuelux,Map,Grid, Radio, Waypoints, xmlParser) {

    'use strict';

    return Marionette.LayoutView.extend ({

        className: 'import-container container',

        template: template,
        regions: {
            gridRegion: '#gridContainer',
            mapRegin : '#mapContainer'
        },
        onShow: function() {
           // this.main.show();
           $('#importWizard').wizard();
        },
        events: {
            /*'click #importNext' : 'loadFile',
            'click #importBack' : 'backToFileType',*/
            'click button.btn-next' : 'nextStep',
            'click #btnPrev' : 'prevStep',
            'click #btnFileSelection': 'typeFileSelection',
            'click #importEnd' : 'returnToHome',
            'change #importWorker1' : 'activateNextStep',
            //'click #rfid' : 'rfid',
        },

        initialize: function() {
            this.waypointList = new Waypoints();
            this.radio = Radio.channel('import-gpx');
            this.selectedUser1 = '';
            this.selectedUser2 = '';
            this.selectedUser3 = '';
            this.selectedUser4 = '';
            this.selectedUser5 = '';
            //$('#mapContainer').css('height', '400px');
        },
        rfid: function() {
            Radio.channel('route').command('import:rfid');
        },

        gsm: function() {
            Radio.channel('route').command('import:gsm');
        },


        clear: function(elt) {
            elt.preventDefault();
            this.collection.reset(this.data.models);
        },
        nextStep : function(e) {
            var step = $('#importWizard').wizard('selectedItem').step;
            $('#btnNext').removeClass('complete-tmp');
            if($('#rfid input').is(':checked')){
                this.rfid();
            }

            if($('#gsm input').is(':checked')){
                this.gsm();
            }
            // display map & grid
            console.log(step);
            if(step ==2){

                this.getUsers();
                $('.btn-next').attr('disabled', 'disabled');
            }
            if(step ==3){
                var map = new Map();
                this.mapRegin.show(map);
                map.addCollection(this.waypointList);
                //Radio.channel('import').command('initGrid');
                var mygrid = new Grid({collections : this.waypointList});
                this.gridRegion.show(mygrid);
                $('.btn-next').removeAttr('disabled');
            }
            if(step ==4){
                console.log('saisie observateur');
                // by default 'next' button disabled, to change if a fieldworker is selected
                $('.btn-next').attr('disabled','disabled');
            }
            if(step ==5){
               //console.log('fin, sauvegarde data');
               // get date from form
                var fieldWorkersNumber = $('#import-fwnb option:selected').text();
                var user1 = $('#importWorker1').val();
                this.waypointList.each(function(model) {
                    //model.set('fieldActivity', self.selectedActivity);
                    model.set('fieldWorker1', user1);
                    model.set('fieldWorker2', $('#importWorker2').val());
                    model.set('fieldWorker3', $('#importWorker2').val());
                    model.set('fieldWorker4', $('#importWorker3').val());
                    model.set('fieldWorker5', $('#importWorker4').val());
                    model.set('fieldWorkersNumber', fieldWorkersNumber);
                });

                // create a new collection for models to import
                var filteredCollection  = new Waypoints(this.waypointList.where({import: true}));
                console.log(filteredCollection);
                // now, it will save on localStorage.myCollectionStorage
                //filteredCollection.save();
                var btnLbel  = $(e.target).attr('data-last');

                console.log('quick fix');

                $('#btnNext').html('Complete').css('padding', '10px');
                $('#btnNext').addClass('complete-tmp');
                var ctx=this;
                $('.complete-tmp').on( "click", function() {
                    ctx.returnToHome();
                });

               if(btnLbel =='Complete'){
                     $(e.target).attr('disabled','disabled');
                     $('#btnPrev').attr('disabled','disabled');
                     $('ul.steps li').removeClass('active');
                     $('ul.steps li').removeClass('complete');
                     


               }

               // send filtred collection to the server
               var url=config.coreUrl + 'station/addMultStation/insert';
                $.ajax({
                    url:url,
                    context:this,
                    type:'POST',
                    data: JSON.stringify(filteredCollection.models),
                    dataType:'json',
                    success: function(resp){
                        var storedCollection = new Waypoints();
                        storedCollection.fetch();
                        storedCollection.reset(resp.data);
                        storedCollection.save();
                        console.log(storedCollection);
                    },
                    error: function(data){
                        alert('error sending gpx collection');
                    }
                });

            }
        },
        activateNextStep : function() {
            $('.btn-next').removeAttr('disabled');
        },
        returnToHome : function() {
            Radio.channel('route').trigger('home');
        },
         prevStep : function() {
            var step = $('#importWizard').wizard('selectedItem').step;
            console.log(step);
            if(step ==1){
                $('.btn-next').removeAttr('disabled');
            }
        },
        backToFileType : function() {
            /*$('#import-load').addClass('masqued');
            $('#import-type').removeClass('masqued');*/
        },
        loadFile : function() {
            /*$('#import-type').addClass('masqued');
            $('#import-load').removeClass('masqued');*/
        },
        onBeforeDestroy: function() {
            if(this.radio){
                this.radio.reset();
            }
           // this.waypointList.destroy();
        },
        typeFileSelection : function(){
            var self = this;
            var selected_file = document.querySelector('#file');
            //var selected_file = $('#file').get(0).files[0];
            selected_file.onchange = function() {
                try {
                    var reader = new FileReader();
                    var xml;
                    var file = this.files[0];
                    var fileName = file.name;
                    var tab = fileName.split('.');
                    var fileType = tab[1];
                    fileType = fileType.toUpperCase();
                    if (fileType != 'GPX') {
                        alert('File type is not supported. Please select a "gpx" file');
                    } else {
                        $('.btn-next').removeAttr('disabled');
                        var lastUpdate = this.files[0].lastModifiedDate;
                        reader.onload = function(e, fileName) {
                            xml = e.target.result;
                            // get waypoints collection
                            self.waypointList =  xmlParser.gpxParser(xml);
                            // display parsing message
                            var nbWaypoints = self.waypointList.length;
                            if (nbWaypoints > 0){
                                $('#importGpxMsg').text('Gpx file is successfully loaded. You have ' + nbWaypoints + ' waypoints.');
                                $('.btn-next').removeAttr('disabled');

                            } else {
                                $('#importGpxMsg').text('Please check gpx file structure. There is not stored waypoints !');
                                $('.btn-next').attr('disabled', 'disabled');
                            }
                        };
                    }
                    reader.readAsText(selected_file.files[0]);
                } catch (e) {
                    alert('File API is not supported by this version of browser. Please update your browser and check again, or use another browser');
                     $('.btn-next').attr('disabled', 'disabled');
                }
            };
        },
        getSelectedUser1: function() {
            var val = $('#importWorker1').val();
            var selectedValue = $('#import-worker1 option').filter(function() {
                return this.value == val;
            });
            if (selectedValue[0]) {
                this.selectedUser1 = selectedValue[0].value;
            } else {
                this.selectedUser1 = '';
                alert('please select a valid worker name');
                $('#importWorker1').val('');
            }
        },

        onRender: function(){
            console.log('remove');
            
            $('ul.steps').css('marginLeft', '0px');
/*            $('#importWizard').wizard('removeSteps', 1);
*/        },
        getUsers : function(){
            var url = config.coreUrl + 'user';
            $.ajax({
                context: this,
                url: url,
                dataType: 'json'
            }).done( function(data) {
                this.generateDatalist(data);
            });
        },
        generateDatalist : function(data){
            var UsersList = '';
            data.forEach(function(user) {
                UsersList += '<option>' + user.fullname + '</option>';
            });
            $('#import-worker1').append(UsersList);
        }

    });
});
