define([
    'marionette',
    'radio',
    'config',
    'models/individual',
    'modules2/individual/views/detail',
    'modules2/individual/views/map',
    'text!modules2/individual/templates/detail-layout.html',
     'sweetAlert',
], function(Marionette, Radio, config, Individual, DetailView,
    MapView, template,Swal) {

    'use strict';

    return Marionette.LayoutView.extend({
        className: 'container-fluid no-padding indiv-bg full-height',
        template: template,

        regions: {
            detail: '#detail-panel',
            main: '#main-panel'
        },
        events : {
            'click .arrow-right-indiv' :'changeIndiv',
            'click .arrow-left-indiv' :'changeIndiv',
        },
        initialize: function(options) {
            this.radio = Radio.channel('individual');
            this.indiv = options.indiv;
            this.filter = options.filter;
        },

        hideDetail: function() {
            
            this.detail.$el.animate({
                marginLeft: '-60%',
                }, 500, function() {
                    
            });
            this.updateSize('hide');
            //this.detail.$el.toggle(callback);
        },

        showDetail: function() {
                this.detail.$el.animate({
                    marginLeft: '0',

                    }, 500, function() {
                });
            this.updateSize('show');
            //this.detail.$el.toggle(callback);
        },

        updateSize: function(type) {
            $(window).trigger('resize');
            this.main.currentView.map.resize();

            if(type === 'hide'){
                $("#showIndivDetails").removeClass('masqued');
                this.main.$el.removeClass('col-lg-7');
                this.main.$el.addClass('col-lg-12');
                this.main.$el.removeClass('col-md-6');
                this.main.$el.addClass('col-md-12');
                this.main.$el.removeClass('col-sm-6');
                this.main.$el.addClass('col-sm-12');
                this.main.$el.addClass('col-xs-12');
            } else {
                $("#showIndivDetails").addClass('masqued');
                this.main.$el.removeClass('col-lg-12');
                this.main.$el.addClass('col-lg-7');
                this.main.$el.removeClass('col-md-12');
                this.main.$el.addClass('col-md-6');
                this.main.$el.removeClass('col-sm-12');
                this.main.$el.addClass('col-sm-6');
                this.main.$el.addClass('hidden-xs');

            }
            $(window).trigger('resize');
        },

        onBeforeDestroy: function() {
            this.radio.reset();
        },

        onShow: function() {
            var filter = this.filter || null;
            this.listenTo(this.radio, 'hide-detail', this.hideDetail);
            this.listenTo(this.radio, 'show-detail', this.showDetail);
            this.detail.show(new DetailView( {
                model: new Individual({id: this.indiv}),
                filter : filter 
            }));
            this.map = new MapView({
                indivId: this.indiv
            });
            this.main.show(this.map);


            $("#showIndivDetails").html('<span class="glyphicon glyphicon-chevron-right big"></span><span class="ID rotate">ID : '+this.indiv+'</span>');
            //replace Pastis by header size
        },
        onRender: function(){
/*            $(document).ready(
                function() {                      
                    $('html').niceScroll();
                }
            );*/
            $('#detail-panel, #main-panel').css({ height: $(window).innerHeight()-$('header').height() });
            $(window).resize(function(){
                $('#detail-panel, #main-panel').css({ height: $(window).innerHeight()-$('header').height() });
            });
        },
        changeIndiv : function(e){
            var elem =$(e.target);
            var navigation = $(elem).attr('nav');
            var currentId = parseInt(this.indiv);
            var url =config.coreUrl+'/individual/'+ currentId+ '/' + navigation;
            var self = this;
            $.ajax({
                url:url,
                context:this,
                type:'GET',
                dataType:'json',
                success: function(resp){
                    var id = resp.id;
                    self.indiv = id;
                    self.detail.show(new DetailView( {
                        model: new Individual({id: id})
                    }));
                    self.map.update(id);
                    $("#showIndivDetails").html('<span class="glyphicon glyphicon-chevron-right big"></span><span class="ID rotate">ID : '+id+'</span>');
                    Backbone.history.navigate('individual/' + id);  //{trigger: true}*/
                },
                error: function(data){
                    Swal({
                        title: "Change individual",
                        text: 'Error to navigate to another individual.',
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonColor: 'rgb(147, 14, 14)',
                        confirmButtonText: "OK",
                        closeOnConfirm: true
                    });
                }
            });
        }
    });
});
