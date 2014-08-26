define([
    "jquery",
    "underscore",
    "event_manager",
    'marionette',
    'views/graph',
    'views/info',
    'chart',
    'config',
    'text!templates/argos.html'
], function($, _, eventManager, Marionette, GraphView, InfoView, Chart, config, argosTemplate) {
    "use strict";
    return Marionette.LayoutView.extend ({
        template: argosTemplate,

        initialize: function(options) {

        },

        afterRender: function(options) {

    // remove background image
    $.supersized({
        slides: [{
            image: ''
        }]
    });
    //this.loadStats();
    var body_width = $(window).width();
    this.windowHeigth = $(window).height();
    $('#argosDataFilter').masonry({
        // options
        itemSelector : '.filterItem',
        // set columnWidth a fraction of the container width
          columnWidth: function( containerWidth ) {
            return containerWidth / 5;
          },
         isFitWidth: true
      });
      /*$("input[name='beginDate']").datepicker();
      $("input[name='endDate']").datepicker(); */
      // get data
      //var url = 'http://192.168.1.199:6543/ecoReleve-Sensor/argos/unchecked/list';
      // list of individuals
      this.indivIdList = [];
      if (!app.utils.transmittersCollection){
          this.getTransmittersCollection();
    } else {
        var nbRows = app.utils.transmittersCollection.length;
        this.filtredTransmittersCollection = app.utils.transmittersCollection.clone();
        $("#argosDataNb").text(nbRows);
        var grid = app.utils.initGrid(this.filtredTransmittersCollection, null,{pageSize : nbRows});
        this.insertView(grid);
        $("#grid").css({"height":this.windowHeigth *4/5});
        $("#grid").mCustomScrollbar({
                    theme:"dark"
        });
        this.setStatusColor();
        // datalists for filter autocomplete
        this.getListsForFilter();
        // set filter div height
        $("#argosFilter").css("height",this.windowHeigth-50);
        //
    }
    // update #argosHideShowFilter position
    this.updateBtnPosition();
    $(window).bind('resize', $.proxy(function(e) {
        this.updateBtnPosition();
    }, this));
    // color data items by 'status' value
},
events : {
    "click #argosHideShowFilter" : "moveFilter",
    "click #argosFilterSubmit" : "getMyDataList",
    "click #argosFilterClear" : "clearFields",
    "click tr": "selectTableElement",
    "click #argosImportPttList" : "importChecked"
},
getTransmittersCollection : function(){
    var url = app.config.sensorUrl + '/argos/unchecked/list';
      //var _this = this;
    $.ajax({
        url: url,
        dataType: "json",
        context : this,
        beforeSend: function(){
              $("#waitCtr").css('display', 'block');
        },
        success: function(data){
            // créeer collection d'objets argos
            app.utils.transmittersCollection = new app.collections.ArgosTransmitters();
            this.filtredTransmittersCollection = new app.collections.ArgosTransmitters();
            var transmitterIdList = [], individusId;
            var _this = this;
            $.each( data, function( key, value ) {
                var transmitter = new app.models.ArgosTransmitter();
                transmitter.set('reference', value.ptt);
                individusId = value.ind_id;
                transmitter.set('individusId', individusId);
                transmitter.set('nbPositions', value.count);
                var status = 'please verify';
                if(!individusId){
                    status = 'error';
                } else{
                    // add individual id to id list for input data filter (autocomplete) 'individual'
                    _this.indivIdList.push(individusId);
                }
                transmitter.set('status', status);
                // transmitterIdList to provide autocomplete to field 'PTT'
                transmitterIdList.push(key);
                app.utils.transmittersCollection.add(transmitter);
                _this.filtredTransmittersCollection.add(transmitter);
             // console.log( key + ": " + value[0].ind_id  +  "  " + value[0].count  );
            });
            var nbRows = app.utils.transmittersCollection.length;
            $("#argosDataNb").text(nbRows);
            var grid = app.utils.initGrid(this.filtredTransmittersCollection, null,{pageSize : nbRows});
            this.insertView(grid);
            this.gridView = grid;
            $("#grid").css({"height":this.windowHeigth *4/5});
            $("#grid").mCustomScrollbar({
                theme:"dark"
            });
            transmitterIdList.sort();
            this.indivIdList.sort();
            app.utils.argosIndivList = this.indivIdList;
            // datalist for PTT and Individual input fields
            app.utils.fillDataListFromArray(transmitterIdList, "#argosTransmittersdList");
            app.utils.fillDataListFromArray(this.indivIdList, "#argosIndividualList");
            this.setStatusColor();
        },
        complete: function(){
             $("#waitCtr").css('display', 'none');
        },
        error : function(){
            //alert("error");
        }
    });
},
moveFilter : function() {
    var self = this;
    $("#argosFilter").toggle("slide", function() {
        var displayed = $("#argosFilter").css('display');
        if (displayed ==="none"){
            $("#argosHideShowFilter").addClass("selected");
            $("#argosFilter").removeAttr("class");
            $("#argosFilter").addClass("span0");
            $("#argosFilterGrid").removeAttr("class");
            $("#argosFilterGrid").addClass("span11");
            $("#argosHideShowFilter").css("left", "0px");
        } else {
            $("#argosHideShowFilter").removeClass("selected");
            $("#argosFilter").removeAttr("class");
            $("#argosFilterGrid").removeAttr("class");
            $("#argosFilter").addClass("span3");
            $("#argosFilterGrid").addClass("span9");
            self.updateBtnPosition();
        }
    });
},
getMyDataList : function(){
    var pttId = $('input[name="pttId"]').val().trim();
    var indivId = $('input[name="indivId"]').val().trim();
    var status = $('input[name="status"]').val().trim();
    /*var beginDate = $('input[name="beginDate"]').val().trim();
    var endDate = $('input[name="endDate"]').val().trim();*/

    var filtredCollection;

    if (pttId || indivId || status ) {
        filtredCollection = app.utils.transmittersCollection.getFiltredItems(pttId, indivId, status );
        //app.utils.filtredTransmittersCollection.reset();
        this.filtredTransmittersCollection.reset(filtredCollection);
        //this.gridView.render();

    } else {
        filtredCollection = app.utils.transmittersCollection.getFiltredItems("", "","");
        //app.utils.filtredTransmittersCollection.reset();
        this.filtredTransmittersCollection.reset(filtredCollection);

    }
    //this.gridView.render();
    //var tm = app.utils.filtredTransmittersCollection;
    // display number of returned models
    /*var nb = filtredCollection.length;
    $("#argosDataNb").text(nb);
    this.gridView.options.collection = filtredCollection;
    this.gridView.render();*/
    /*var grid = app.utils.initGrid(filtredCollection, null,{pageSize : nb});
    this.insertView(grid);
    $("#grid").css({"height":this.windowHeigth *4/5});
    $("#grid").mCustomScrollbar({
                    theme:"dark"
    });
    */
    this.setStatusColor();

},
clearFields : function() {
    $("input").val("");
},
selectTableElement: function(e) {
    var ele = e.target.parentNode.nodeName;
    if (ele == "TR") {
        var selectedModel = app.models.selectedModel;
        var refPTT = selectedModel.get("reference");
        var indivId = selectedModel.get("individusId");
        //var route = '#argos/' + refPTT + '/indiv/'+ indivId;
        var route = '#argos/ptt='  + refPTT + '&indivId='+ indivId;
        //app.utils.argosIndivList = this.indivIdList;
        //this.indivIdList = null;
        app.router.navigate(route, {trigger: true});
    }
},
setStatusColor : function(){
    $("td.status").each(function(){
        var status = $(this).text();
        switch(status) {
            case 'error':
                $(this).toggleClass("redColor");
                break;
            case 'imported':
                $(this).toggleClass("yellowColor");
                break;
            case 'checked':
                $(this).toggleClass("greenColor");
                break;
                default:
                break;
        }
    });
},
importChecked : function(){
    //var _this = this;
    var importList = [];
    app.utils.transmittersCollection.each(function(model) {
        var status = model.get('status');
        if (status ==="checked"){
            var importObj = {};
            importObj.ptt =  model.get('reference');
            importObj.ind_id  = model.get('individusId');
            importObj.locations  = model.get('locations');
            importList.push(importObj);
        }
    });

    if(importList.length>0){
        var url = app.config.sensorUrl + '/argos/insert';
        var data = JSON.stringify(importList) ;
          $.ajax({
            url: url,
            type:"POST",
            //dataType: "json",
            data : data,
            context : this,
            success: function(data){
                alert("data imported for checked locations !");
                // clear array
                importList.splice(0, importList.length);
                // clear transmitter collection
                app.utils.transmittersCollection.reset();
                this.getTransmittersCollection();


            },
            error : function(data){
                alert("error importing data !");
            }
        });
      } else {
          alert ('no locations to import !');
      }
},
getListsForFilter : function(){
    var transmitterIdList = [];
    this.indivIdList= [];
    var _this= this;
    app.utils.transmittersCollection.each(function(model) {
        var indivId = model.get("individusId");
        var transmitterId = model.get("reference");
        if(indivId){
            // add individual id to id list for input data filter (autocomplete) 'individual'
            _this.indivIdList.push(indivId);
        }
        transmitterIdList.push(transmitterId);
    });
    transmitterIdList.sort();
    this.indivIdList.sort();
    app.utils.argosIndivList = this.indivIdList;
    // datalist for PTT and Individual input fields
    app.utils.fillDataListFromArray(transmitterIdList, "#argosTransmittersdList");
    app.utils.fillDataListFromArray(this.indivIdList, "#argosIndividualList");
},
updateBtnPosition : function(){
    var filterPanelWidth = $("#argosFilter").width();
    $("#argosHideShowFilter").css("left", (filterPanelWidth - 45) + "px");
},
remove: function(options) {
    $(window).unbind("resize");
    if(this.filtredTransmittersCollection){
        this.filtredTransmittersCollection.reset();
        this.filtredTransmittersCollection = null;
    }

    console.log("remove argos");
}
});
});
