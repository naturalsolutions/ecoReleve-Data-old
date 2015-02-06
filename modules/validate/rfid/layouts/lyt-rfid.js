define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'radio',
    'config',
    'text!modules2/validate/rfid/templates/tpl-rfid.html',
    'filter/model-filter',
    'grid/model-grid',
    'sweetAlert'


], function($, _, Backbone, Marionette, Radio,
    config, tpl, NSFilter, NSGrid, Swal) {

    'use strict';


    return Marionette.LayoutView.extend({
        template: tpl,

        className: 'container no-padding',


        events: {
            'click #import-validate' : 'validate',
            // 'click tr': 'redirect',
        },

        onDestroy: function(){
            $('#main-region').removeClass('grey-back').removeClass('no-scroll');
            $('body').removeClass('no-scroll');
        },

        initialize: function(){
            console.log("init rfid val")
            this.type='rfid';

            var MyRow = Backgrid.Row.extend({
                render: function () {
                    MyRow.__super__.render.apply(this, arguments);
                    console.log(this.model)
                    if (this.model.get('site_type') == null ) {
                      this.el.classList.add('red-row');
                    }
                return this;
                }
            });

            this.row = MyRow;

            this.cols= [{
                editable: false,
                name: 'identifier',
                label: 'identifier',
                cell: 'string',
                renderable: true,   
            }, {
                editable: false,
                name: 'nb_chip_code',
                label: 'different scaned chip code',
                cell: 'integer'
            }, {
                editable: false,
                name: 'total_scan',
                label: 'total scan',
                cell: Backgrid.IntegerCell.extend({
                    orderSeparator: ' '})
            },
            {
                editable: false,
                name: 'first_scan',
                label: 'first scan',
                cell: 'string'
            },
            {
                editable: false,
                name: 'last_scan',
                label: 'last scan',
                cell: 'string'
            },
            {
                editable: false,
                name: 'site_name',
                label: 'site name',
                cell: 'string',
                formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                    fromRaw: function (rawValue, model) {
                            if (rawValue==null) {
                                rawValue = '/!\\ Warning /!\\';
                                console.log(this.el)
                            };
                         return rawValue;
                    }
                })
            },{
                editable: false,
                name: 'site_type',
                label: 'site type',
                cell: 'string'
            },
            {
                editable: false,
                name: 'creation_date',
                label: 'creation date',
                cell: 'string'
            },
            ];

            this.trueValues = [0.25,0.5,0.75,1,2,3];
            this.frequency = 1;
        },
        onShow: function(){
            $('body').addClass('full-height').addClass('no-scroll').addClass('home-page');
            $('#main-region').addClass('full-height').addClass('grey-back').addClass('no-scroll');
        },

        onRender: function(){
            
            /*this.filters = new NSFilter({
                channel: 'modules',
                url: config.coreUrl + 'rfid/validate/',
                template: 'filter/tpl-filters.html',
            });*/

            this.grid= new NSGrid({  
                columns: this.cols, 
                row: this.row,  
                channel: 'modules',
                url: config.coreUrl + 'rfid/validate/',
                pageSize : 25,
                pagingServerSide : false,
                });
            
            this.$el.find('#grid').html(this.grid.displayGrid());
            this.$el.find('#paginator').html(this.grid.displayPaginator());
            
            var ctx=this;
            this.$el.find('#slider').slider({
                value:3,
                min: 0,
                max: 5,
                step:1,
                slide: function( event, ui ) {
                    
                    ctx.frequency = ctx.trueValues[ui.value];

                    if (ctx.frequency < 1 ) {
                        $( "#Freq" ).html( ctx.trueValues[ui.value]*60 );
                        $( "#unit" ).html( ' minutes');

                    } else {
                        $( "#Freq" ).html( ctx.trueValues[ui.value] );
                        $( "#unit" ).html( ' hour(s)');
                    }
                    ctx.changeFreq();
                }
            });
        },
        validate: function() {
            console.log(this.frequency)
            var self = this;
            $.ajax({
                url: config.coreUrl + 'rfid/validate',
                data : {frequency_hour: self.frequency , checked:0},
                success : function (data) {
                    Swal({

                              title: 'Well done !',
                              text: data.responseText,
                              type: 'success',
                              showCancelButton: true,
                              confirmButtonColor: 'green',
                              confirmButtonText: 'Go to import',
                              cancelButtonColor: 'blue',
                              cancelButtonText: 'Finish',
                                
                              closeOnConfirm: true,
                             
                            },
                            function(isConfirm){
                               
                               
                                if (isConfirm){
                                    Radio.channel('route').trigger('import');
                                } else {
                                    Radio.channel('route').command('home');

                                }
                    });
                },
                error : function () {
                     Swal('Error!',
                        'An error occured during the process, please contact an administrator.',
                     'error');
                }
            });
        },
        changeFreq: function(){
           
            if (!this.changingFreqVal) {
                Swal('Warning : The data frequency has been changed !',
                    ' It results that the validation process keep one data per '+$( "#Freq" ).html()+' '+$( "#unit" ).html()+' per chip code.',
                     'warning');
                this.changingFreqVal = true;
            }
            
        },
    
    });
});
