var ecoReleveData = (function(app) {
   // "use strict";
/*****************************************************
HomeView
******************************************************/	
    /*
* Base view: customize Backbone.Layout for remote template loading
*/
app.views.BaseView = Backbone.View.extend({
    initialize: function () {
        this._views = {};
        this._dfd = $.Deferred();
        this._dfd.resolve(this);
    },  
    // Template management
    prefix: app.config.root + '/tpl/',
    template: '',
    getTemplate: function () {
        var path = this.prefix + this.template + '.html',
            dfd = $.Deferred();
        app.templates = app.templates || {};

        if (app.templates[path]) {
            dfd.resolve(app.templates[path]);
        } else {
            $.get(path, function (data) {
                app.templates[path] = _.template(data);
                dfd.resolve(app.templates[path]);
            }, "text");
        }
        return dfd.promise();
    },  
    //Sub-view management
    getViews: function (selector) {
        if (selector in this._views) {
            return this._views[selector];
        }
        return [];
    },
    insertView: function (selector, view) {
        if (!view) {
            view = selector;
            selector = '';
        }
        // Keep a reference to this selector/view pair
        if (!(selector in this._views)) {
            this._views[selector] = [];
        }
        this._views[selector].push(view);
        // Forget this subview when it gets removed
        view.once('remove', function (view) {
            var i, found = false;
            for (i = 0; i < this.length; i++) {
                if (this[i].cid === view.cid) {
                    found = true;
                    break;
                }
            }
            if (found) {
                this.splice(i, 1);
            }
        }, this._views[selector]);
    },
    removeViews: function (selector) {
        if (selector in this._views) {
            while (this._views[selector].length) {
                this._views[selector][0].remove();
            }
        }
    },

    // Take care of sub-views before removing
    remove: function () {
        _.each(this._views, function (viewList, selector) {
            _.each(viewList, function (view) {
                view.remove();
            });
        });
        this.trigger('remove', this);
        Backbone.View.prototype.remove.apply(this, arguments);
    },
    //Rendering process
    serialize: function () {
		if (this.model){
			return this.model.toJSON();
		}
    },
    // Can be overridden by child classes
    beforeRender: function () {},
    afterRender: function () {},
    render: function () {
        // Reset promise
        this._dfd = $.Deferred();

        // Give a chance to child classes to do something before render
        this.beforeRender();

        this.getTemplate().done(_.bind(function (tpl) {

            var data = this.serialize(),
                rawHtml = tpl(data),
                rendered;

            // Re-use nice "noel" trick from LayoutManager
            rendered = this.$el.html(rawHtml).children();
            this.$el.replaceWith(rendered);
            this.setElement(rendered);

            // Add sub-views
            _.each(this._views, function (viewList, selector) {
                var base = selector ? this.$el.find(selector) : this.$el;
                _.each(viewList, function (view) {
                    view.render().$el.appendTo(this);
                }, base);
            }, this);

            // Give a chance to child classes to do something after render
            try {
                this.afterRender();
                this._dfd.resolve(this);
            } catch (e) {
                if (console && console.error) {
                    console.error(e);
                }
                this._dfd.reject(this);
            }

        }, this));

        return this;
    },
    promise: function () {
        return this._dfd.promise();
    }
 });
//$home
app.views.HomeView = app.views.BaseView.extend({
	template: 'home',
	initialize: function() {
         
		app.views.BaseView.prototype.initialize.apply(this, arguments);
        this._dfds = {};
		window.addEventListener('online',  this.updateOnlineStatus);
		window.addEventListener('offline', this.updateOnlineStatus);
       
       /* var body_width = $(window).width(); 
        if (body_width < 1300 ){
            $("canvas").attr("width", "350px");
        }*/
	},
    afterRender: function () {
       /* this.resizeImage();
        var self = this;
        $(window).bind('resize', function () { 
            self.resizeImage();
        });*/
        this.serverUrl = localStorage.getItem( "serverUrl");
         this.loadStats();
        var d = (new Date()+'').split(' ');
        // ["Mon", "Feb", "1", "2014"....
        d[1] = this.convertMonth(d[1]);
         var date =  [d[1], d[2],d[3]].join(' ');
        // Feb 1  2014 ...
        $("#date").html(date);
        var body_width = $(window).width(); 
        if (body_width < 1300 ){
            $("canvas").attr("width", "350px");
        }
        $( "div.modal-backdrop" ).removeClass("modal-backdrop");
        
        $(window).on('hashchange', function(e){
            // abroad ajax calls
            if(window.mapAjaxCall.xhr){ 
                 window.mapAjaxCall.xhr.abort();
             }
        });
    },
	events : {
		'click #alldata' : 'alldata'
	},
	
	alldata: function(e){
		if (navigator.onLine == true){
			//var serverUrl = localStorage.getItem( "serverUrl");
			if ((this.serverUrl === undefined) || (this.serverUrl ==null)){
					alert ("Please configurate the server url ");
			}
			else {
				app.router.navigate('#allData', {trigger: true});
			}
		} else {
			alert("you are not connected ! Please check your connexion ");
		}
	},
	updateOnlineStatus : function(event){
		var condition = navigator.onLine ? "online" : "offline";
		//alert(condition);
		if (condition == "offline"){
			$(".connected").each(function(){ 
			  $(this).addClass("tile-grey");
			});
		} else {
			$(".connected").each(function(){ 
			  $(this).removeClass("tile-grey");
			});
		}
	},
    resizeImage : function(){ 
        var $image = $('img.superbg');
        var image_width = $image.width(); 
        var image_height = $image.height();     
         
        var over = image_width / image_height; 
        var under = image_height / image_width; 
         
        var body_width = $(window).width(); 
        var body_height = $(window).height(); 
         
        if (body_width / body_height >= over) { 
          $image.css({ 
            'width': body_width + 'px', 
            'height': Math.ceil(under * body_width) + 'px', 
            'left': '0px', 
            'top': Math.abs((under * body_width) - body_height) / -2 + 'px' 
          }); 
        }  
         
        else { 
          $image.css({ 
            'width': Math.ceil(over * body_height) + 'px', 
            'height': body_height + 'px', 
            'top': '0px', 
            'left': Math.abs((over * body_height) - body_width) / -2 + 'px' 
          }); 
        } 
    },
    loadStats : function(){
        var dataGraph = localStorage.getItem("ecoreleveChart"); 
        // get current month and compare it with stored month
        var d = (new Date()+'').split(' ');
        // ["Mon", "Feb", "1", "2014"....
        var month  =  d[1];
        var storedMonth = localStorage.getItem("ecoreleveChartMonth");
        if(dataGraph && (month == storedMonth )){
            var gData = JSON.parse(dataGraph);
            //var myPie = new Chart(document.getElementById("graph").getContext("2d")).Bar(gData,null);
            var myChart = new Chart(document.getElementById("graph").getContext("2d")).Line(gData,null);
            $("#homeGraphLegend").html("<h3>number of observations</h3>"); 
        } else {
            var url = this.serverUrl + "/station/count/month";
            $.ajax({
                url: url,
                dataType: "json",
                success: function(data) {
                    var stat =data[0][0];
                    var pieData =[];
                    var labels =[];
                    var barData=[];
                    var colors =["#F38630","#E0E4CC","#69D2E7","#3F9F3F","#A4A81E","#F0F70C","#0CF7C4","#92D6C7","#2385b8","#E0C8DD","#F38630","#E0E4CC"] ;
                    var legend="<div id='graphLegend' style='text-align: left;'><b>stations number per month</b><br/>";
                    var i=0;
                    for (key in stat){
                        var dataObj = {};
                        var month = key;
                        var value = stat[key] || 0 ;
                       /* dataObj.value = parseInt(value);
                        dataObj.label = month;
                        dataObj.color = colors[i];
                        legend += "<p><a style='background:" + dataObj.color  + "; width:20px;height:20px;'>&nbsp;&nbsp;&nbsp;</a>&nbsp;" + month + "</p>";
                        pieData.push(dataObj);
                        i +=1;*/
                        // bar graph
                        labels.push(month);
                        barData.push(parseInt(value));
                    }
                    labels =labels.reverse();
                    barData = barData.reverse();
                    var gData = {
                        labels : labels ,
                        datasets : [
                            {
                                fillColor : "rgba(220,220,220,0.5)",
                                strokeColor : "rgba(220,220,220,1)",
                                data : barData
                            }
                        ]
                    }
                    var strData = JSON.stringify(gData);
                    // store data in localstorage
                    localStorage.setItem("ecoreleveChart",strData);
                    // store month in localstrorage to update data every month
                    var d = (new Date()+'').split(' ');
                    // ["Mon", "Feb", "1", "2014"....
                    var month  =  d[1];
                    localStorage.setItem("ecoreleveChartMonth",month);
                    //var myPie = new Chart(document.getElementById("graph").getContext("2d")).Bar(gData,null);
                    var myChart = new Chart(document.getElementById("graph").getContext("2d")).Line(gData,null);
                    $("#homeGraphLegend").html("<h3>stations number per month</h3>");
                    /*
                    var len = data.length;
                    for (var i=0; i<len; i++){
                        var dataObj = {};
                        var value = data[i].value;
                        var family = data[i].FAMILY;
                        if (family ==""){ family = "non renseign&eacute;"};
                        dataObj.value = parseInt(value);
                        dataObj.label = family;
                        dataObj.color = colors[i];

                        legend += "<p><a style='background:" + dataObj.color  + "; width:20px;height:20px;'>&nbsp;&nbsp;&nbsp;</a>&nbsp;" + family + "</p>";
                        pieData.push(dataObj);*/
                    

                   /*
                   legend += "</div>";
                   $("#legend").append(legend);
                   var myPie = new Chart(document.getElementById("graph").getContext("2d")).Doughnut(pieData,null);*/
                },
                error: function(data) {
                    $("#homeGraphLegend").html("error in loading data ");
                }
            });
        }
        // update individuals number
        var indivUrl = this.serverUrl + "/TViewIndividual/list/count";
        $.ajax({
                url: indivUrl,
                dataType: "json",
                success: function(data) {
                    var stat =data[0].count;
                    $("#infos span").text(stat);
                 }
        });   

    },
    convertMonth : function(month){
        var monthUpper = month.toUpperCase();
        switch (monthUpper){
            case "JAN":
                return "January";
            case "FEB":
                return "February";
            case "MAR":
                return "March";
            case "APR":
                return "April";
            case "MAY":
                return "May"; 
            case "JUN":
                return "June";  
            case "JUL":
                return "July";  
            case "AUG":
                return "August"; 
            case "SEP":
                return "September";  
            case "OCT":
                return "October";  
            case "NOV":
                return "November";  
            case "DEC":
                return "December";     
        }
    }

});
app.views.StationTypeView = app.views.BaseView.extend({
	template: 'sation-type',
	initialize : function() {
	}
});
app.views.CurrentUser = app.views.BaseView.extend({
        template: 'current-user',

        serialize: function() {
            return {
                //name: app.instances.currentUser.fullName()
				name: "Olivier Rovellotti"
            };
        }
});
/*****************************************************
StationPositionView --> route "entryStation"
******************************************************/	
app.views.StationPositionView = app.views.BaseView.extend({
    template: 'sation-position',
	initialize : function(options) {
		app.views.BaseView.prototype.initialize.apply(this, arguments);
        this._dfds = {};
    },
	beforeRender : function(){
		//this.insertView("#map",new app.views.test());
		
	},
	afterRender : function(){
		var map_view = app.utils.initMap();
		var myposition = new NS.UI.Point({ latitude : 0, longitude: 0, label:"my position"});
		map_view.addLayer({point : myposition , layerName : "my position"});
	}
});
app.views.test = app.views.BaseView.extend({
    template: 'test',
	initialize : function(options) {
    }
});
/*********************************************************
            Export
**********************************************************/
app.views.ExportView = app.views.BaseView.extend({
    template: 'export',
    /*initialize : function() {
        this.template = _.template($('#export-template').html());
    },*/
    afterRender: function() {
        //$(".modal-content").css({"width": "600px","max-width": "800px", "min-height": "500px","margin": "5%"});
       /* $(".modal-header").css({"background": "red"});
        $(".modal-body").css({"background": "white","color":"black"});*/
        app.utils.getThemesList();
    },
    events :{
        'change #export-themes' : 'updateViewsList',
        'click .exportViewsList': 'selectCurrentView',
        'click button.close' : 'exitExp'
    },
    updateViewsList : function(e){
        var viewID = $("#export-themes option:selected").attr('value');
        app.utils.getViewsList(viewID);
    },
    selectCurrentView : function(e){
        var viewName =$(e.target).get(0).attributes["value"].nodeValue;
       // this.setView(new app.views.ExportFilterView({viewName: viewName}));
        var route = "#export/" + viewName;
         app.router.navigate(route , {trigger: true});
    },
    exitExp : function(e){
        app.router.navigate('#', {trigger: true});
    }
});
app.views.ExportFilterView= app.views.BaseView.extend({
    template: 'export-filter',
    initialize : function (options){
        this.viewName = options.viewName;
        this.selectedFields = new Array();
        Array.prototype.remove = function(x) { 
            for(i in this){
                if(this[i].toString() == x.toString()){
                    this.splice(i,1)
                }
            }
        }
    },
    afterRender: function(){
        
        $("#filterViewName").text(this.viewName);
      //  $(".modal-content").css({"min-width": "600px","max-width": "1000px", "min-height": "500px","margin": "5%"});
        app.utils.generateFilter(this.viewName);
    },
    events :{
        'click #exportPrevBtn' : 'exportview',
        //'click #export-add-filter' : 'addFilter',
        'click #export-field-select-btn' :'selectField',
        'click .btnDelFilterField' : 'deleteFilterItem',
        'click #filter-query-btn' : 'filterQuery',
        'click #exportMap' : 'selectExtend',
        'click button.close' : 'exitExp',
        'change #export-view-fields' : 'selectField',
        'change .filter-select-operator': 'updateInputInfo',
        'click #msdnLink' : 'msdnDetails'
        
    },
    exportview : function(){
        app.router.navigate("#export", {trigger: true});
    },
    /*addFilter : function(){
        $("#export-field-selection").removeClass("masqued");
        $("#filter-btn").addClass("masqued");
       // $('#export-view-fields').css({"display": "inline-block","height": "40px","width": "350px"});
    },*/
    selectField : function(){
        var fieldName = $("#export-view-fields option:selected").text();
         var fieldId = fieldName.replace("@", "-");
        // check if field is already selected
        var ln = this.selectedFields.length;
        var isSelected = false;
        if (fieldName==""){
           isSelected = true; 
        }
        else {
            if (ln > 0) {
                for (var i=0;i<ln;i++){
                    if (this.selectedFields[i] ==fieldId){
                        isSelected = true;
                        break;
                    }
                }
            }
        }

        if (isSelected == false) {
            var fieldType = $("#export-view-fields option:selected").attr('type');
            var fieldId = fieldName.replace("@", "-");
            // generate operator
            var operatorDiv = this.generateOperator(fieldType);
            var inputDiv = this.generateInputField(fieldType);
            var fieldFilterElement = "<div class ='row-fluid filterElement' id='div-"  + fieldId +"'><div class='span4 name' >" + fieldName + "</div><div class='span1 operator'>"+ operatorDiv +"</div><div class='span3'>";
                fieldFilterElement += inputDiv + "</div><div class='span3'><span id='filterInfoInput'></span></div><div class='span1'><a cible='div-"  + fieldId +"' class='btnDelFilterField'><img src='img/Cancel.png'/></a></div></div>";
            $("#export-filter-list").append(fieldFilterElement);
            $("#export-filter-list").removeClass("masqued");
            $('#filter-query').removeClass("masqued");
            this.selectedFields.push(fieldId);
        }
    },
    updateInputInfo : function(){
        $(".filterElement").each(function() {
             var operator = $(this).find("select.filter-select-operator option:selected").text();
            if (operator =="LIKE"){
            $("#filterInfoInput").html("sql wildcard is allowed: <a id='msdnLink'>more details</a>");
            }
            else if (operator =="IN"){
                $("#filterInfoInput").text(" for multi-seletion, separator is ';' ");
            }
            else{$("#filterInfoInput").text("");
            }
        });
    },
    deleteFilterItem: function(e){
        var elementId = $(e.target).parent().get(0).attributes["cible"].nodeValue;
        var fieldName = elementId.substring(4,elementId.length);
        elementId ="#" + elementId;
        $(elementId).remove();
        this.selectedFields.remove(fieldName);
    },
    filterQuery: function(){
        var query="";
        var self = this;
        $(".filterElement").each(function() {
            
            var fieldName =$(this).find("div.name").text();
            /*var operator = $(this).find("div.operator").text();
            if (operator !="LIKE"){*/
                var operator = $(this).find("select.filter-select-operator option:selected").text();
            /*} else {
                operator = " LIKE ";
            }   */
            
            if (operator =="LIKE"){operator=" LIKE ";}
            if (operator =="IN"){operator=" IN ";}
            
            var condition = $(this).find("input.fieldval").val(); 
            query += fieldName + operator + condition +",";
        });
        // delete last character "&"
        query = query.substring(0,query.length - 1);
        var selectedView = this.viewName ;
        $("#filterForView").val(query);
        app.utils.getFiltredResult("filter-query-result", query,selectedView);
        this.query = query;
    },
    selectExtend : function(){
        var selectedView = this.viewName;
        var filterValue = $("#filterForView").val();
        if ((this.selectedFields.length > 0) && (!this.query)){
            var getFilter = this.filterQuery();
            $.when(getFilter).then(function(){
                app.views.filterValue = $("#filterForView").val();
               var route ="#export/" + selectedView + "/filter"
               /* var filterValue = $("#filterForView").val();
                var route = "#export/" + selectedView + "/" + filterValue;*/
                app.router.navigate( route, {trigger: true});
            })
        }
        else if (this.selectedFields.length ==0){
            app.views.filterValue = "";
            var route = "#export/" + selectedView + "/" ;
            app.router.navigate( route, {trigger: true});
        }
        else {
            app.views.filterValue = filterValue;
            var route = "#export/" + selectedView + "/filter";
            app.router.navigate( route, {trigger: true});
        }
        /*
             window.print();
        */
    },
    generateOperator: function(type){
        var operatorDiv;
        switch(type)
        {
        case "string":
          operatorDiv = "<select class='filter-select-operator'><option>=</option><option>LIKE</option><option>IN</option></select>";  //"LIKE";
          break;
        case "integer":
          operatorDiv = "<select class='filter-select-operator'><option>&gt;</option><option>&lt;</option><option>=</option><option>&lt;&gt;</option><option>&gt;=</option><option>&lt;=</option></select>";
          break;
        /*case "datetime":
        operatorDiv = "<select class='filter-select-operator'><option>&gt;</option><option>&lt;</option></select>";
          break;*/
         case "text":
          operatorDiv = "<select class='filter-select-operator'><option>=</option><option>LIKE</option><option>IN</option></select>";  //"LIKE";
          break;
        default:
         operatorDiv = "<select class='filter-select-operator'><option>&gt;</option><option>&lt;</option><option>=</option><option>&lt;&gt;</option><option>&gt;=</option><option>&lt;=</option></select>";
        }
        return operatorDiv;
    },
    generateInputField: function(type){
        var inputDiv ="";
        switch(type)
        {
        case "datetime":
        inputDiv = "<input type='date' placeholder='YYYY-MM-DD' class='fieldval'/>";
          break;
        default:
         inputDiv = "<input type='text' class='fieldval'/>";
        }
        return inputDiv;
    },
    exitExp : function(e){
        if(app.xhr){ 
            app.xhr.abort();
        }
        app.router.navigate('#', {trigger: true});
    },
    msdnDetails : function(){
        window.open('http://technet.microsoft.com/en-us/library/ms179859.aspx','_blank');
    }

});
app.views.ExportMapView = app.views.BaseView.extend({
     template: "export-map",
    initialize : function(options) {
        this.currentView =  options.view;
        //this.filterValue = options.filter;
        this.filterValue = app.views.filterValue; 
        //$("input#updateSelection").trigger('change');
    },
    afterRender: function(options) {
        $("#filterViewName").text(this.currentView);
        $('#map').css({"width":"800px","height":"400px"});
     //   $(".modal-body").css({"max-height":"600px"});
        var  point = new NS.UI.Point({ latitude : 31, longitude: 61, label:""});
        this.map_view = app.utils.initMap(point, 3);
        /*var style = new OpenLayers.Style({
              pointRadius:0.2,strokeWidth:0.2,fillColor:'#edb759',strokeColor:'white',cursor:'pointer'
        });
        this.map_view.addLayer({point : point , layerName : "", style : style, zoom : 3});*/
        //masquer certains controles
         /*
         var controls = this.map_view.map.getControlsByClass("OpenLayers.Control.MousePosition");
        this.map_view.map.removeControl(controls[0]);
        controls = this.map_view.map.getControlsByClass("OpenLayers.Control.Panel");
        this.map_view.map.removeControl(controls[0]);
        // add zoom controls to map
        this.addControlsToMap(); */
        //add bbox content
        NS.UI.bbox = new NS.UI.BBOXModel();
        // init bbox model
        NS.UI.bbox.set("minLatWGS", "");
        NS.UI.bbox.set("minLonWGS","");
        NS.UI.bbox.set("maxLatWGS", "");
        NS.UI.bbox.set("maxLonWGS", "");
        var bboxView = new app.views.BboxMapView({model:NS.UI.bbox});
        bboxView.$el.appendTo("#bbox");
        bboxView.render();

        // add geodata to base layer
        this.displayWaitControl();
        var serverUrl = localStorage.getItem("serverUrl");
        var url = serverUrl + "/views/get/"+ this.currentView + "?filter=" + this.filterValue + "&format=geojson&limit=0";
        
        /*
        var protocol = new NS.UI.Protocol({ url : url, format: "GEOJSON" , strategies:["BBOX"], cluster:true, params:{round:"0"}});
        this.map_view.addLayer({protocol : protocol , layerName : "Observations", noSelect : false});
        */

        var ajaxCall = { url : url, format: "GEOJSON", params:{round:"0"}, cluster:true, serverCluster:true};
        this.map_view.addLayer({ajaxCall : ajaxCall , layerName : "Observations", noSelect : false,zoom:4 , zoomToExtent : true}); 



        /*var controls = this.map_view.map.getControlsByClass("OpenLayers.Control.MousePosition");
        this.map_view.map.removeControl(controls[0]);
        controls = this.map_view.map.getControlsByClass("OpenLayers.Control.Panel");
        this.map_view.map.removeControl(controls[0]);*/
        // add zoom controls to map
       // this.addControlsToMap(); 

        //this.addControlsToMap();



       /*
       // calculate initial count
        var filterVal = this.filterValue;
        //var query = "filter=" + filterVal;
        app.utils.getFiltredResult("countViewRows", filterVal,this.currentView);
        */
    },
    events : {
    'click #export-back-filter' : 'backToFilter',
    'click #geo-query' : 'getqueryresult',
    'click #export-result' : 'getResult',
    'click #export-first-step' : 'backToFistStep',
    'click button.close' : 'exitExp'
    },
    backToFilter : function (){
         window.clearInterval(this.timer);
        var route = "#export/" + this.currentView;
         app.router.navigate(route, {trigger: true});

       /* var currentView = this.currentView;
        window.clearInterval(this.timer);
        app.views.main.setView(".layoutContent", new app.Views.ExportFilterView({viewName: currentView}));
        app.views.main.render();*/
    },
    addControlsToMap : function(){
        var panel = new OpenLayers.Control.Panel({displayClass: 'panel', allowDepress: false});
        var zoomBox = new OpenLayers.Control.ZoomBox();
        var navigation = new OpenLayers.Control.Navigation();
        var zoomBoxBtn = new OpenLayers.Control.Button({displayClass: 'olControlZoomBox', type: OpenLayers.Control.TYPE_TOOL,
            eventListeners: {
               'activate': function(){zoomBox.activate(); navigation.deactivate(); }, 
               'deactivate': function(){zoomBox.deactivate()}
            }
        });
        var navigationBtn = new OpenLayers.Control.Button({displayClass: 'olControlNavigation', type: OpenLayers.Control.TYPE_TOOL,
            eventListeners: {
               'activate': function(){navigation.activate(); zoomBox.deactivate();}, 
               'deactivate': function(){navigation.deactivate()}
            }
        });     
        panel.addControls([zoomBoxBtn, navigationBtn]);
        this.map_view.map.addControls([panel,zoomBox,navigation]);
    },
    getqueryresult: function (){
        var selectedview = this.currentView;
        var bboxVal  = $("input#updateSelection").val();
        var filterVal = this.filterValue;
        var query = "filter=" + filterVal +"&bbox="+ bboxVal;
        app.utils.getResultForGeoFilter(query,selectedview); 
    },
    getResult : function (){
        //window.clearInterval(this.timer);
        app.views.selectedview = this.currentView;
        app.views.bbox  = $("input#updateSelection").val() || "";
        app.views.filterVal = this.filterValue;
        var route = "#export/" + this.currentView + "/fields"
        app.router.navigate(route, {trigger: true});
        /*this.remove();
        var myview = new app.views.ExportColumnsSelection ({view: selectedview ,filter:filterVal, bbox: bboxVal});
        myview.render();
        myview.$el.appendTo("#main");*/
       /* app.views.main.setView(".layoutContent", new app.Views.ExportColumnsSelection({view: selectedview ,filter:filterVal, bbox: bboxVal}));
        app.views.main.render();*/


    },
    backToFistStep : function (){
         //window.clearInterval(this.timer);
        app.router.navigate("#export", {trigger: true});
    },     
    exitExp : function(e){
        app.router.navigate('#', {trigger: true});
    },
    displayWaitControl : function (){
        var mapDiv = this.map_view.el;
        var width =  ((screen.width)/2 -200);
        var height = ((screen.height)/2 - 200);
        var ele = "<div id ='waitControl' style='position: fixed; top:" + height + "px; left:" + width + "px;z-index: 1000;'><IMG SRC='images/PleaseWait.gif' /></div>"  
        var st = $("#waitControl").html();
        if ($("#waitControl").length == 0) {
            $(mapDiv).append(ele);
        }
    }
});		
			
app.views.BboxMapView = app.views.BaseView.extend({
    template: "map-bbox",
    initialize: function (options) {
        /*this.listenTo(this.model, 'change', this.update);
        app.views.BaseView.prototype.initialize.apply(this, arguments);*/
        this.model.on('change',this.render,this);
    }
});
app.views.ExportColumnsSelection = app.views.BaseView.extend({
    template: "export-columns",
    initialize : function(options) {
        this.currentView =  options.view;
       // this.filterValue = app.views.filterValue;
        //this.bbox = app.views.bbox;
    },
    afterRender: function(options) {
       // $(".modal-content").css({"height":"700px", "max-width": "900px"});
      //  $('#map').css({"width":"700px","height":"400px"});
       // $(".modal-body").css({"max-height":"600px"});
       $("#filterViewName").text(this.currentView);
        var fieldsList = app.utils.exportFieldsList;
        var fieldsListforFom = [];
        // parcourir la liste de champs, afficher celles qui ne correspondent pas aux champs a afficher par défaut (lat, lon, date, station ou site_name)
        var ln = fieldsList.length;
        // columns to display on grid
        //this.displayWaitControl();
        app.utils.exportSelectedFieldsList = [];
        for (var i=0; i< ln;i++){
            var field = fieldsList[i];
            var fieldUpper = field.toUpperCase(); 
            var stationAdded = false;
            if (fieldUpper == "STATION"){
                app.utils.exportSelectedFieldsList.push(field);
                stationAdded = true;
            } else if ((fieldUpper == "LAT") || (fieldUpper == "LON")||(fieldUpper == "DATE") ){
                app.utils.exportSelectedFieldsList.push(field);
            } else if (fieldUpper == "SITE_NAME"){
                // si champ station exite, il ne faut pas rajouter ce champ à la liste de champs a afficher
                if (stationAdded == false){app.utils.exportSelectedFieldsList.push(field);}
                else {fieldsListforFom.push(field);}
            } else if (fieldUpper == "PTT"){
                app.utils.exportSelectedFieldsList.push(field);
            } else {
                fieldsListforFom.push(field);
            }
        }
        
        
        /*var ln = fieldsList.length;
        //generate datatable structure
        for (var i=0; i< ln ; i++){
            var fieldName = fieldsList[i];
            var fieldHtml = "<th>" + fieldName + "</th>";
            $("#exportResultList-head").append(fieldHtml);
            
        }*/
        var columnsModel = new app.models.ProtoModel();
        var schema = {
            Columns:{ type: 'CheckBox', title:'', options : fieldsListforFom /*, inline : 'true'*/}  //,validators: ['required']
        };
        columnsModel.schema = schema ;
        columnsModel.constructor.schema = columnsModel.schema;
        columnsModel.constructor.verboseName  = "dataset";          
        setTimeout(function(){
            var myView = new app.views.ExportColumnsListFormView({initialData:columnsModel});
            myView.render();
            $("#formcolumns").append(myView.el);
            $("#exportResult").on("click", $.proxy(myView.onSubmit, myView));
            $(".form-actions").addClass("masqued");
           // $("#waitControl").remove();
        },2000);
        
        
        // this.$el.append(myView.render().el);
        
        
    },
    events : {
     'click #exportPrevMapBtn' : 'backToMap',
     'click #exportResult' : 'getResult',
     'click #export-first-step' : 'backToFistStep',
     'click button.close' : 'exitExp'
    },
    backToMap : function (){
        //app.views.main.removeView("#formcolumns");
        var currentView = this.currentView;
       // var filterValue = this.filterValue;
        var route ="#export/" + currentView+ "/filter" 
        app.router.navigate(route, {trigger: true});
        /*app.views.main.setView(".layoutContent", new app.Views.ExportMapView({view : currentView, filter: filterValue}));
        app.views.main.render();*/
    },
    getResult : function (){
        var displayedColumns = app.utils.exportSelectedFieldsList || [] ;
        if (displayedColumns.length > 0){
            var selectedview = this.currentView;
            var router ="#export/" + selectedview + "/result";
            app.router.navigate(router, {trigger: true});
            /*app.views.main.setView(".layoutContent", new app.Views.ExportResult({view: selectedview ,filter:filterVal, bbox: bboxVal}));
            app.views.main.render();*/
        } else {
            alert("please select columns to display");
        }
        
    },
    backToFistStep : function (){
        app.router.navigate("#export", {trigger: true});
    },
    exitExp : function(e){
        app.router.navigate('#', {trigger: true});
    },
    displayWaitControl : function (){
        var mapDiv = this.map_view.el;
        var width =  ((screen.width)/2 -200);
        var height = ((screen.height)/2 - 200);
        var ele = "<div id ='waitControl' style='position: fixed; top:" + height + "px; left:" + width + "px;z-index: 1000;'><IMG SRC='images/PleaseWait.gif' /></div>"  
        var st = $("#waitControl").html();
        if ($("#waitControl").length == 0) {
            $("div.modal-body").append(ele);
        }
    }
});
app.views.ExportColumnsListFormView = NS.UI.Form.extend({
    initialize: function(options) {
        //this.protocolsList = options.protocols ; 
        NS.UI.Form.prototype.initialize.apply(this, arguments);
        this.on('submit:valid', function(instance) {
            var ln; 
            var attr = instance.attributes.Columns;
            if (typeof attr !== "undefined") {
                ln = attr.length;
            } else {
                ln = 0;
            }
            if (ln > 5){
                alert(" please select max 5 columns ");
            } else {
                // add all selected fields to displayed fields list
                for (var i= 0;i< ln ; i++){
                    app.utils.exportSelectedFieldsList.push(attr[i]);
                }
            }
        });
    }
});
//$exportresult
app.views.ExportResult = app.views.BaseView.extend({
    template: "export-result" ,
    initialize : function(options) {
        this.currentView =  options.view;
        this.filterValue = app.views.filterValue;
        this.bbox = app.views.bbox;
    },
    afterRender: function(options) {
      var serverUrl = localStorage.getItem("serverUrl");
      var gpxFileUrl = serverUrl + "/gps/data.gpx";
      var pdfFileUrl = serverUrl + "/pdf/data.pdf";
      var csvFileUrl = serverUrl + "/csv/data.csv";
      $('#export-getGpx').attr("href", gpxFileUrl);
      $('#export-getPdf').attr("link", pdfFileUrl);
      $('#export-getCsv').attr("href", csvFileUrl);

      $("#filterViewName").text(this.currentView);
        var fieldsList = app.utils.exportSelectedFieldsList;
        if (app.utils.exportSelectedFieldsList[0]=="Id") {app.utils.exportSelectedFieldsList.shift();}
        var ln = fieldsList.length;
        //generate datatable structure
        for (var i=0; i< ln ; i++){
            var fieldName = fieldsList[i];
            var fieldHtml = "<th>" + fieldName + "</th>";
            $("#exportResultList-head").append(fieldHtml);
            
        }
        app.utils.getExportList(this.currentView, this.filterValue, this.bbox, this);
        $("#exportResultList-head").css({"color":"black"});
        // map view
        this.displayedCols = app.utils.exportSelectedFieldsList;
        this.url = serverUrl +  "/views/get/" + this.currentView + "?filter=" + this.filterValue + "&bbox=" + this.bbox + "&columns=" + this.displayedCols ; 
        //add id field to field list to display on the map
        this.displayedCols.unshift("Id");
        $('#map').css({"width":"900px","height":"550px"});
        var  point = new NS.UI.Point({ latitude : 31, longitude: 61, label:""});
        this.map_view = app.utils.initMap(point, 2);
        var url = this.url + "&format=geojson";
        var style  = new OpenLayers.Style({
            pointRadius:4,strokeWidth:1,fillColor:'#edb759',strokeColor:'black',cursor:'pointer'
            , label : "${getLabel}",  labelXOffset: "50", labelYOffset: "-15"}
            , {context: {
                    getLabel: function(feature) {
                        if(feature.layer.map.getZoom() > 5) {
                            //return feature.attributes.label;
                            // return list of arributes (labels to display on the map)
                                var labelsList = [];
                                for (k in feature.attributes) {

                                if ((k!="Id") && (k!="count")) {
                                    labelsList.push(feature.attributes[k]);
                                }
                                labelsList.unshift(feature.attributes["Id"]);
                                return labelsList;
                            }
                        } else {return "";}
                    }
                }}


            );
        /*
        var protocol = new NS.UI.Protocol({ url : url, format: "GEOJSON", strategies:["FIXED"], popup : false, style: style});
        this.map_view.addLayer({protocol : protocol , layerName : "Observations", });
        */
        var ajaxCall = { url : url, format: "GEOJSON", cluster:false, style: style};
        this.map_view.addLayer({ajaxCall : ajaxCall , layerName : "Observations",  zoom:3 , zoomToExtent : true}); 

        //this.addControlsToMap();
    // load map vector fields list
        var len = this.displayedCols.length;
        for (var i=0;i< len; i++){
            var label = this.displayedCols[i];
            $("#map-field-selection").append("<option>" + label +"</option>");
        }


    },
    events : {
        'click #exportPrevBtn' : 'backToMap',
        //'click #export-getGpx' : 'getGpx',
        'click #export-first-step' : 'backToFistStep',
        'click #exportDataMap' : 'dataOnMap',
        'click #export-getPdf':"getPdfFile",
        'click #export-getCsv' : 'getCsvFile',
        'click button.close' : 'exitExp',
        'change #map-field-selection': 'updateMap',
        'click #map-label-hposition-off' : "moveHlabelOff",
        'click #map-label-hposition-in' : "moveHlabelIn",
        'click #map-label-vposition-off' : "moveVlabelOff",
        'click #map-label-vposition-in' : "moveVlabelIn",
        'click #export-map-print' : 'printMap'
    },
    backToMap : function(){
        if(app.xhr){ 
             app.xhr.abort();
        }
        var currentView = this.currentView;
      //  var filterValue = this.filterValue;
      //  var bboxVal = this.bbox;
      var route = "#export/" + currentView + "/filter";
       app.router.navigate(route, {trigger: true});
       //app.views.main.setView(".layoutContent", new app.Views.ExportColumnsSelection({view: currentView ,filter:filterValue, bbox: bboxVal}));
       // app.views.main.render();
    },
    getPdfFile : function (){
        var url = $('#export-getPdf').attr("link");
        window.open(url, 'list export in pdf');
    },
    getCsvFile : function (){

    },
    backToFistStep : function (){
        if(app.xhr){ 
             app.xhr.abort();
         }
         app.router.navigate("#export", {trigger: true});
    },
    dataOnMap : function (){
        var route ="#export/" + this.currentView + "/ResultOnMapView";
         app.router.navigate(route, {trigger: true});
    },
    exitExp : function(e){
        if(app.xhr){ 
             app.xhr.abort();
         }
        app.router.navigate('#', {trigger: true});
    },
    addControlsToMap : function(){
        var panel = new OpenLayers.Control.Panel({displayClass: 'panel', allowDepress: false});
        var zoomBox = new OpenLayers.Control.ZoomBox();
        var navigation = new OpenLayers.Control.Navigation();
        var zoomBoxBtn = new OpenLayers.Control.Button({displayClass: 'olControlZoomBox', type: OpenLayers.Control.TYPE_TOOL,
            eventListeners: {
               'activate': function(){zoomBox.activate(); navigation.deactivate(); }, 
               'deactivate': function(){zoomBox.deactivate()}
            }
        });
        var navigationBtn = new OpenLayers.Control.Button({displayClass: 'olControlNavigation', type: OpenLayers.Control.TYPE_TOOL,
            eventListeners: {
               'activate': function(){navigation.activate(); zoomBox.deactivate();}, 
               'deactivate': function(){navigation.deactivate()}
            }
        });     
        panel.addControls([zoomBoxBtn, navigationBtn]);
        this.map_view.map.addControls([panel,zoomBox,navigation]);
    },
    printMap : function (){
         window.print();
    },
    updateMap : function(){
        var selectedValue = $('#map-field-selection :selected').text();
        this.map_view.editLabel("Observations", selectedValue);
    },
    moveHlabelOff : function(){
        this.map_view.moveLabel("Observations", "h", "-2");
    },
    moveHlabelIn : function(){
        this.map_view.moveLabel("Observations", "h", "+2");
    },
    moveVlabelOff : function(){
        this.map_view.moveLabel("Observations", "v", "-2");
    },
    moveVlabelIn : function(){
        this.map_view.moveLabel("Observations", "v", "+2");
    }
    
});
app.views.GridView = app.views.BaseView.extend({
    initialize: function(options) {
        app.utilities.BaseView.prototype.initialize.apply(this, arguments);
        this.grid = new NS.UI.Grid(options);
        this.insertView(this.grid);
        // Relay grid events
        this.grid.on('selected', function(model) {this.trigger('selected', model);}, this);
        this.grid.on('sort', function(field, order) {this.trigger('sort', field, order);}, this);
        this.grid.on('unsort', function() {this.trigger('unsort');}, this);
        this.grid.on('filter', function(fieldId, value) {this.trigger('filter', fieldId, value);}, this);
        this.grid.on('unfilter', function(fieldId) {this.trigger('unfilter', fieldId);}, this);
        this.grid.on('page', function(target) {this.trigger('page', target);}, this);
        this.grid.on('pagesize', function(size) {this.trigger('pagesize', size);}, this);
        // Custom date picker
        this.grid.addDatePicker = function(element) {
            var $el = $(element),
                val = $el.val();
            $el.attr('type', 'text');
            $el.datepicker({format: app.config.dateFormat}) //  dd/mm/yyyy                
                .on('changeDate', $el, function(e) {
                    if (e.viewMode == 'days') {
                        e.data.trigger('input');
                    }
                });
            $el.on('input', function(e) {$(this).datepicker('hide');});
            $el.on('keydown', function(e) {if (e.keyCode == 27 || e.keyCode == 9) $(this).datepicker('hide');});
            if (val) $el.datepicker('setValue', val);
        }
    }
});
/*	
app.views.ExportResultOnMapView = app.views.BaseView.extend({
    template: "export-data-on-map",
    initialize : function(options) {
        var serverUrl = localStorage.getItem("serverUrl");
        this.view = options.view;
        this.displayedCols = app.utils.exportSelectedFieldsList;
        this.url = serverUrl +  "/views/get/" + this.view + "?filter=" + app.views.filterValue + "&bbox=" + app.views.bbox + "&columns=" + this.displayedCols ; 
        //add id field to field list to display on the map
        this.displayedCols.unshift("Id");
    },
    afterRender: function(options) {
     $("#filterViewName").text(this.view);
        $('#map').css({"width":"900px","height":"550px"});
     //   $(".modal-body").css({"max-height":"600px"});
        var  point = new NS.UI.Point({ latitude : 31, longitude: 61, label:""});
        this.map_view = app.utils.initMap(point, 2);
        var url = this.url + "&format=geojson";
        var style  = new OpenLayers.Style({
            pointRadius:4,strokeWidth:1,fillColor:'#edb759',strokeColor:'black',cursor:'pointer'
            , label : "${getLabel}",  labelXOffset: "50", labelYOffset: "-15"}
            , {context: {
                    getLabel: function(feature) {
                        if(feature.layer.map.getZoom() > 5) {
                            //return feature.attributes.label;
                            // return list of arributes (labels to display on the map)
                                var labelsList = [];
                                for (k in feature.attributes) {

                                if ((k!="Id") && (k!="count")) {
                                    labelsList.push(feature.attributes[k]);
                                }
                                labelsList.unshift(feature.attributes["Id"]);
                                return labelsList;
                            }
                        } else {return "";}
                    }
                }}


            );
        var protocol = new NS.UI.Protocol({ url : url, format: "GEOJSON", strategies:["FIXED"], popup : false, style: style});
        this.map_view.addLayer({protocol : protocol , layerName : "Observations", });
        this.addControlsToMap();
    // load map vector fields list
        var len = this.displayedCols.length;
        for (var i=0;i< len; i++){
            var label = this.displayedCols[i];
            $("#map-field-selection").append("<option>" + label +"</option>");
        }
    },
    events : {
        'click #export-first-step' : 'backToFistStep',
        'click #export-result' : 'getResult',
        'click button.close' : 'exitExp',
        'change #map-field-selection': 'updateMap',
        'click #map-label-hposition-off' : "moveHlabelOff",
        'click #map-label-hposition-in' : "moveHlabelIn",
        'click #map-label-vposition-off' : "moveVlabelOff",
        'click #map-label-vposition-in' : "moveVlabelIn",
        'click #export-map-print' : 'printMap'
    },
    addControlsToMap : function(){
        var panel = new OpenLayers.Control.Panel({displayClass: 'panel', allowDepress: false});
        var zoomBox = new OpenLayers.Control.ZoomBox();
        var navigation = new OpenLayers.Control.Navigation();
        var zoomBoxBtn = new OpenLayers.Control.Button({displayClass: 'olControlZoomBox', type: OpenLayers.Control.TYPE_TOOL,
            eventListeners: {
               'activate': function(){zoomBox.activate(); navigation.deactivate(); }, 
               'deactivate': function(){zoomBox.deactivate()}
            }
        });
        var navigationBtn = new OpenLayers.Control.Button({displayClass: 'olControlNavigation', type: OpenLayers.Control.TYPE_TOOL,
            eventListeners: {
               'activate': function(){navigation.activate(); zoomBox.deactivate();}, 
               'deactivate': function(){navigation.deactivate()}
            }
        });     
        panel.addControls([zoomBoxBtn, navigationBtn]);
        this.map_view.map.addControls([panel,zoomBox,navigation]);
    },

    backToFistStep : function (){
         app.router.navigate("#export", {trigger: true});
    },
    generateCanvas : function (){
        html2canvas(document.getElementById("map"), {
            onrendered: function(canvas) {
                // canvas is the final rendered <canvas> element
              //  document.body.appendChild(canvas);
                var img = canvas.toDataURL("image/png")
                window.open(img);
            }
        });
        
    },
    printMap : function (){
         window.print();
    },
    getResult  : function (){
        var router = "#export/" + this.view + "/result";
        app.router.navigate(router, {trigger: true});
    },
    updateMap : function(){
        var selectedValue = $('#map-field-selection :selected').text();
        this.map_view.editLabel("Observations", selectedValue);
    },
    moveHlabelOff : function(){
        this.map_view.moveLabel("Observations", "h", "-2");
    },
    moveHlabelIn : function(){
        this.map_view.moveLabel("Observations", "h", "+2");
    },
    moveVlabelOff : function(){
        this.map_view.moveLabel("Observations", "v", "-2");
    },
    moveVlabelIn : function(){
        this.map_view.moveLabel("Observations", "v", "+2");
    },
    exitExp : function(e){
        app.router.navigate('#', {trigger: true});
    }
});	
*/	
// $alldata
app.views.AllDataView = app.views.BaseView.extend({
    template: "allData",
    afterRender: function(options){ 
       // try{
            // masqued fields
            $('#id_proto').hide();
            $('#idate').hide();
            $('#allDataCluster').hide();
            var serverUrl = localStorage.getItem("serverUrl");
            //procole list for input select
            $.ajax({
                url: serverUrl + "/proto/proto_list",
                dataType: "text",
                success: function(xmlresp) {
                    var xmlDoc=$.parseXML(xmlresp),
                    $xml=$(xmlDoc),
                    $protocoles=$xml.find("protocole");
                    // init select control with empty val
                    $('<option id= 0 ></option>').appendTo('#select_id_proto');
                    $protocoles.each(function(){
                        $('<option id=\"'+$(this).attr('id')+'\" value=\"'+$(this).text()+'\">'+$(this).text()+'</option>').appendTo('#select_id_proto');
                    });
                    $("#select_id_proto option[id='0']").attr('selected','selected');
                }
            });
            var dataContainer = $("#main")[0];   //var myDataTable = $("#myDataTable")[0];
            var widthDataContainer = dataContainer.clientWidth;
            var widthallDataContent = widthDataContainer - 260 ; 
            
            $('#allDataMap').css('width', (widthallDataContent * 0.98) +'px'); //$('#map').css('width', '700px');
            $('#map').css('width', (widthallDataContent * 0.97) +'px'); //$('#map').css('width', '700px');

            $(window).bind('resize', function () { 
                dataContainer = $("#main")[0];
                widthDataContainer = dataContainer.clientWidth;
                widthallDataContent = widthDataContainer - 260 ; 
                $('#allDataContent').css('width', widthallDataContent + 'px');
                
                // check if datatable is not hided and resize map if window is resized
                var displayed = $("#allDataList").is(":visible");
                if (displayed){         
                    $('#map').css('width', (widthallDataContent * 0.63) +'px'); //$('#map').css('width', '700px');
                    //console.log ("widthallDataContent : " + widthallDataContent );
                    $('#allDataMap').css('width', (widthallDataContent * 0.65) +'px'); //$('#map').css('width', '700px');
                    $('#allDataList').css('width', (widthallDataContent * 0.3) +'px'); //$('#map').css('width', '700px');
                } 

            });
            $("#allDataList").hide();
            var  point = new NS.UI.Point({ latitude : 34, longitude: 44, label:""});
            this.map_view = app.utils.initMap(point, 3);
            $( "label, input,button, select " ).css( "font-size", "15px" );
            //datalist of taxons
            app.utils.fillTaxaList();
       /* } catch (e) {
            app.router.navigate('#', {trigger: true});
        }*/
    }    
    ,events : {
        'change #select_id_proto' : 'updateTable',
        //'change input.cluster' : 'updateMap',
        'click #btnReset' : 'resetdate',
        'click #btnW' : 'updateDateWeek',
        'click #btnM' : 'updateDateMonth',
        'click #btnY' : 'updateDateYear',
        'keyup #datedep' : 'updateDateDep',
        'keyup #datearr' : 'updateDateArr',
        'click #searchBtn ' : 'search',
        'click tr' : 'selectTableElement',
        'click #allDataInfosPanelClose' : 'closeInfosPanel',
        //'change input#updateSelection' : 'updateTableForSelecedFeatures'
        // 'selectedFeatures:change' : 'updateTableForSelecedFeatures',
        'click #refreshTable' : 'updateTableForSelecedFeatures',
        'click #featureOnTheMap' : 'zoomMapToSelectedFeature',
        'click div.olControlSelectFeatureItemActive.olButton' : "deletePositionLayer",
        'click #alldataAlertYes' : 'continueGeoQuery',
        'click #alldataAlertNo' : 'resetGeoQuery'
    },
    updateTable: function(){
        //this.updateControls();
        $("#id_proto").attr("value",($("#select_id_proto option:selected").attr('id')));
         app.utils.fillTaxaList();
    },
    updateDateWeek : function(){
        $(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
        $("#btnW").css({"background-color" : "rgb(150,150,150)"});
        $('#idate').text("week");   
        $("#datedep").attr('value',"");
        $("#datearr").attr('value',"");
    },
    updateDateMonth : function(){
        $(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
        $("#btnM").css({"background-color" : "rgb(150,150,150)"});
        $('#idate').text("month");   
        $("#datedep").attr('value',"");
        $("#datearr").attr('value',"");
    },
    updateDateYear : function(){
        $(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
        $("#btnY").css({"background-color" : "rgb(150,150,150)"});
        $('#idate').text("year");   
        $("#datedep").attr('value',"");
        $("#datearr").attr('value',"");
    },
   /* updateDate1an : function(){
        $(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
        $("#btnY-1").css({"background-color" : "rgb(150,150,150)"});
        $('#idate').text("1ans");   
        $("#datedep").attr('value',"");
        $("#datearr").attr('value',"");
    },
    updateDate2ans : function(){
        $(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
        $("#btnY-2").css({"background-color" : "rgb(150,150,150)"});
        $('#idate').text("2ans");
        $("#datedep").attr('value',"");
        $("#datearr").attr('value',"");   
    },*/
    resetdate : function(){
        $(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
        $("#btnReset").css({"background-color" : "rgb(150,150,150)"});
        $('#idate').text("");
        $("#datedep").attr('value',"");
        $("#datearr").attr('value',"");
    },
   /* updateDateHier : function(){
        $(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
        $("#btnD-1").css({"background-color" : "rgb(150,150,150)"});
        $('#idate').text("hier");
        $("#datedep").attr('value',"");
        $("#datearr").attr('value',"");
    },*/
    updateDateDep : function(){
        var regex = new RegExp("^[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$");
        var regex2 = new RegExp("^[0-9]{4}$");
        var regex3 = new RegExp("^[0-9]{4}-(0[1-9]|1[012])$");
        var datedep=$("#datedep").attr('value');
        var datearr=$("#datearr").attr('value');
        if(((regex.test(datedep) && regex.test(datearr)) || (regex2.test(datedep) && regex2.test(datearr)) || (regex3.test(datedep) && regex3.test(datearr)) ) && datedep<=datearr)
            $("#dateinter").removeAttr("disabled");
        else
            $("#dateinter").attr("disabled","disabled");
    },
    updateDateArr : function(){
        var regex = new RegExp("^[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$");
        var regex2 = new RegExp("^[0-9]{4}$");
        var regex3 = new RegExp("^[0-9]{4}-(0[1-9]|1[012])$");
        var datedep=$("#datedep").attr('value');
        var datearr=$("#datearr").attr('value');
        if(((regex.test(datedep) && regex.test(datearr)) || (regex2.test(datedep) && regex2.test(datearr)) || (regex3.test(datedep) && regex3.test(datearr)) ) && datedep<=datearr)
            $("#dateinter").removeAttr("disabled");
        else
            $("#dateinter").attr("disabled","disabled");
    },
    search : function(){
        this.displayWaitControl();
       // $("#map").css("height","795px");
       this.updateControls();
        var datedep=$("#datedep").attr('value');
        var datearr=$("#datearr").attr('value');
        if (datedep !="" || datearr !=""){
            $('#idate').text(datedep+";"+ datearr);
        }
        /*$('#idate').text(datedep+";"+ datearr);*/
        var params = 'id_proto='+$("#id_proto").attr("value")+"&place="+$("#place").attr("value")+"&region="+$("#region").attr("value")+"&idate="+$('#idate').text()+"&taxonsearch="+$("#iTaxon").attr("value");
        app.utils.filldatable(params);
        app.utils.updateLayer(this.map_view);
               /*     $("img#mapunselectfeatures").css("position" , "absolute");
                $("img#mapunselectfeatures").css("z-index","1008");
                $("img#mapunselectfeatures").css("right", "85px");
                $("img#mapunselectfeatures").css("top", "4px");*/
    },
    updateMap : function(){
        app.utils.updateLayer(this.map_view);
    },
    updateZoom : function(){ 
        app.utils.updateLayer(this.map_view);
    },
    updateData : function(e){ 
        var name = e.target.value;
        if(e.keyCode==13){
            app.utils.updateLayer(this.map_view);
            app.utils.filldatable();
        }
    },
    updateControls : function (){
        $("#allDataList").removeAttr('style');
        $('#allDataCluster').removeAttr('style');
        
        var dataContainer = $("#main")[0];   //var myDataTable = $("#myDataTable")[0];
        var widthDataContainer = dataContainer.clientWidth;     
        var widthallDataContent = widthDataContainer - 260 ; 
        if (widthallDataContent < 850 ){widthallDataContent = widthallDataContent - 20 ;} 
        $('#map').css('width', (widthallDataContent * 0.60) +'px'); //$('#map').css('width', '700px');
        //console.log ("widthallDataContent : " + widthallDataContent );
        $('#allDataMap').css('width', (widthallDataContent * 0.62) +'px'); //$('#map').css('width', '700px');
        $('#allDataList').css('width', (widthallDataContent * 0.3) +'px'); //$('#map').css('width', '700px');
        // redraw map
        this.map_view.map.baseLayer.redraw();
    },
    updateTableForSelecedFeatures : function(evt){
        // check if you need to use selected features id ( else : use BBOX)
        var params = 'id_proto='+$("#id_proto").attr("value")+"&place="+$("#place").attr("value")+"&region="+$("#region").attr("value")+"&idate="+$('#idate').text()+"&taxonsearch="+$("#iTaxon").attr("value");
        var paramsMap = "";
        var idSelected = $("#featuresId").val();
        if (idSelected ==""){
            paramsMap = "bbox=" + $("#updateSelection").val();
        }
        else if ((idSelected.split(",")[0]) =="") {
            // paramsMap = "id_stations=''";
             paramsMap = "bbox=" + $("#updateSelection").val();
        }
        else {
            // get all id station from string  (id1,id2 ...)
            paramsMap = "id_stations=" + idSelected;
        }
        app.utils.filldatable(params, paramsMap);
    },  
    selectTableElement : function(e){
        var ele  = e.target.parentNode.nodeName;
       // if (ele =="TD"){
        if (ele =="TR") {
            var selectedModel = app.models.selectedModel ;
            $("#allDataInfosPanel").css({"display":"block"});
            var content ="<h3>details</h3>";
            var latitude, longitude;
            for (k in selectedModel.attributes){
                var v = selectedModel.attributes[k];
                if (k.toUpperCase()=="DATE"){
                    var d = (new Date(v)+'').split(' ');
                    v =  [d[1], d[2],d[3]].join(' ');
                }
                if (k.toUpperCase()=="LAT"){
                    latitude = v;
                }
                if (k.toUpperCase()=="LON"){
                    longitude = v ;
                }
                content += "<p class='allDataInfosTitles'> "+ k + " <br/><span>" + v + "</span></p>";
           }
             content +="<p id='featureOnTheMap' longitude='" + longitude +"' latitude='" + latitude +"'><a><img src='images/Map-Location.png'/></a> <i>show it on the map</i></p>";
            $("#allDataInfosPanelContent").html(content);
        }
    },
    zoomMapToSelectedFeature : function(){
        var latitude = $("#featureOnTheMap").attr("latitude");
        var longitude = $("#featureOnTheMap").attr("longitude");
        var point = {};
        point.longitude = longitude;
        point.latitude = latitude;
        //this.map_view.setCenter(point);
        app.utils.updateLocation (this.map_view, point);
    },
    deletePositionLayer : function(){
        // delete selected feature layer if exists
        var mapView = this.map_view ;
        for(var i = 0; i < mapView.map.layers.length; i++ ){
            if((mapView.map.layers[i].name) == "Selected feature" ) {
                mapView.map.removeLayer(mapView.map.layers[i]);
            }
        }
    }, 
    closeInfosPanel : function(){
        var mapView = this.map_view ;
        $('#allDataInfosPanel').hide();
        for(var i = 0; i < mapView.map.layers.length; i++ ){
            if((mapView.map.layers[i].name) == "Selected feature" ) {
                mapView.map.removeLayer(mapView.map.layers[i]);
            }
        }
    },
    displayWaitControl : function (){
        var mapDiv = this.map_view.el;
        var width =  ((screen.width)/2 -200);
        var height = ((screen.height)/2 - 200);
        var ele = "<div id ='waitControl' style='position: fixed; top:" + height + "px; left:" + width + "px;z-index: 1000;'><IMG SRC='images/PleaseWait.gif' /></div>"  
        var st = $("#waitControl").html();
        if ($("#waitControl").length == 0) {
            $(mapDiv).append(ele);
        }
    },
    continueGeoQuery : function (){
        $("#allDataMapAlert").empty();    
        $("#allDataMapAlert").removeClass("dialogBoxAlert");
        $( "div.modal-backdrop" ).removeClass("modal-backdrop");
        //$("#alldataAlert").addClass("masqued");
        this.displayWaitControl();
        app.utils.continueUpdateLayer(this.map_view);
    },
    resetGeoQuery : function (){
        $("#allDataMapAlert").empty();
        $("#allDataMapAlert").removeClass("dialogBoxAlert");
        $( "div.modal-backdrop" ).removeClass("modal-backdrop");

        // $("#alldataAlert").addClass("masqued");
         $("#waitControl").remove(); 
    }
}); 
app.views.AlertMapBox = app.views.BaseView.extend({
    template: "alertMapBox" ,
    initialize : function(options) {
        this.featuresNumber = options.featuresNumber;
        this.cancelLoading = options.cancel;
    },
    afterRender : function() {
        // display features number 
        if (this.featuresNumber) {
            var self = this;
            setTimeout(function() {
                $("#alerMapBoxNbFeatures").text(self.featuresNumber);
            }, 200);
        }
        if (this.cancelLoading){
             setTimeout(function() {
                $("#alerMapBoxLoad").addClass("masqued");
                $("#alerMapBoxCancelLoad").removeClass("masqued");
            }, 200);
        }
    }
}); 
app.views.Import = app.views.BaseView.extend({
    template: "import" ,
    initialize : function(options) {
    }
}); 
app.views.ImportLoad = app.views.BaseView.extend({
    template: "import-load" ,
    initialize : function(options) {
    },
    events :{
        'click #btnFileSelection' : 'gpxFileSelection',
        'click #importLoadNext' : 'importMap'
    },
    gpxFileSelection  : function(){ 
        var selected_file = document.querySelector('#file');
        //var selected_file = $('#file').get(0).files[0];
        selected_file.onchange = function() {
            try{
                var reader = new FileReader();
                var xml;
                var fileName = this.files[0].name;
                var tab = fileName.split(".");
                var fileType = tab[1];
                fileType = fileType.toUpperCase();
                if (fileType != "GPX"){
                    alert ("File type is not supported. Please select a 'gpx' file" );
                }
                else {
                    var lastUpdate = this.files[0].lastModifiedDate ;
                    var gpxFileName = localStorage.getItem("gpxFileName"); 
                    var gpxLastModif = localStorage.getItem("gpxLastModif"); 

                   /* if ((gpxFileName != "null") && (gpxFileName == fileName) && (gpxLastModif == lastUpdate )){
                     alert ("this file correspond to last loaded version !");
                    }    */                   
                   // else if (gpxLastModif != lastUpdate ){                          
                        reader.onload = function(e, fileName) {
                            xml = e.target.result;
                            app.utils.loadWaypointsFromFile(xml);
                        };
                        localStorage.setItem("gpxFileName", fileName);
                        localStorage.setItem("gpxLastModif",lastUpdate);
                        }
                    //}
                reader.readAsText(selected_file.files[0]);
                
            } catch (e) {
                alert ("File API is not supported by this version of browser. Please update your browser and check again, or use another browser"); 
            }
        }
    },
    importMap : function() {
        var attrDisabled = $("#importLoadNext").attr("disabled");
        if(typeof attrDisabled === "undefined"){
         app.router.navigate('#import-map', {trigger: true});
        }
    }
});
app.views.ImportMap = app.views.BaseView.extend({
    template: "import-filter" ,
    afterRender : function(options) {
        //try{
            app.utils.initGrid (app.collections.waypointsList, app.collections.Waypoints);
            var map_view = app.utils.initMap();
            map_view.addLayer({layerName : "tracks"}); 
            map_view.addLayer({collection : app.collections.waypointsList , layerName : "waypoints", zoomToExtent : true});

            this.mapView = map_view;
            $("div.modal-body").css({"min-height":"650px;"});
       /* } catch (e) {
            app.router.navigate('#', {trigger: true});
        }*/
    },
    events : {
        "selectedFeatures:change" : "featuresChange",
        'click tr' : 'selectTableElement',
        'click #importLoadTrack a' : 'loadTrack'
    },
    featuresChange : function(e){
        var selectedFeatures = this.mapView.map.selectedFeatures;
        var ln = selectedFeatures.length;
        if (ln == 0){
            app.utils.initGrid (app.collections.waypointsList, app.collections.Waypoints);
        } else {
           var selectedFeaturesCollection = new app.collections.Waypoints();
            for(var i=0;i<ln;i++){
                var modelId = selectedFeatures[i];
                var selectedModel = app.collections.waypointsList.get(modelId);
                selectedFeaturesCollection.add(selectedModel);
            }
            app.utils.initGrid (selectedFeaturesCollection, app.collections.Waypoints);
        }
        e.preventDefault();
    },
    selectTableElement : function(e){
        var ele  = e.target.parentNode.nodeName;
       // if (ele =="TD"){
        if (ele =="TR") {
            var selectedModel = app.models.selectedModel ;
            var latitude, longitude;
            for (k in selectedModel.attributes){
                var v = selectedModel.attributes[k];
                if (k.toUpperCase()=="LATITUDE"){
                    latitude = v;
                }
                if (k.toUpperCase()=="LONGITUDE"){
                    longitude = v ;
                }
               // content += "<p class='allDataInfosTitles'> "+ k + " <br/><span>" + v + "</span></p>";
           }
           this.zoomMapToSelectedFeature(latitude,longitude);
            /* content +="<p id='featureOnTheMap' longitude='" + longitude +"' latitude='" + latitude +"'><a><img src='images/Map-Location.png'/></a> <i>show it on the map</i></p>";
            $("#allDataInfosPanelContent").html(content);*/
        }
    },
    zoomMapToSelectedFeature : function(latitude,longitude){
        var point = {};
        point.longitude = longitude;
        point.latitude = latitude;
        //this.map_view.setCenter(point);
        app.utils.updateLocation (this.mapView, point);
    },
    loadTrack  : function(){
        var action = $('#importLoadTrack a').text();
        if (action =="load tracks"){
            var ajaxCall = { url : "ressources/shp800.geojson", format: "GEOJSON"};
            //this.mapView.addLayer({ajaxCall : ajaxCall , layerName : "tracks"}); 
            var url = "ressources/shp800.geojson"; 
            this.mapView.updateLayer("tracks",url); 
            $('#importLoadTrack a').text('remove tracks');
        } else {
            this.mapView.removeLayer("tracks");
            $('#importLoadTrack a').text('load tracks');
        }
    }
});
app.views.importEndStep = app.views.BaseView.extend({
    template: "import-endStep",
    afterRender : function(options) {
    }
});

// $objects
app.views.objects = app.views.BaseView.extend({
    template: "objects" ,
    afterRender : function(options) {
        app.utils.fillObjectsTable();
        this.children = [];
    },
    removeAllChildren: function() {
    _.each(this.children, function(view) { 
        view.remove(); 
    });
    this.children = [];
    }
    ,
    events : {
       'click tr' : 'selectTableElement',
       'click #objectsInfosPanelClose' : 'closeInfosPanel',
       //'click #objectsMap' : 'displayMap',
       'click #objectsReturn' : 'maskBox',
       'click #objectMapClose' : 'maskBox',
       'click #objectsDetails' : 'objectDetails',
       'click a.objTab' : 'closeInfosPanel'
       //'click #objectsHistory' : 'displayHistoy'
    },
    selectTableElement : function(e){
        var ele  = e.target.parentNode.nodeName;
        if (ele =="TR") {
            var selectedModel = app.models.selectedModel ;
            var gridId = $(e.target).parents(".gridDiv").attr("id");
            var id = selectedModel.attributes["ID"];
            var serverUrl = localStorage.getItem("serverUrl");
            this.idSelectedIndiv = id;
            if (gridId =="objectsIndivGrid"){
                this.objectUrl = serverUrl + "/TViewIndividual/" + id;
                this.objectType = "individual";
            } else if (gridId =="objectsRadioGrid"){
                this.objectUrl = serverUrl + "/TViewTrx_Radio/" + id;
                this.objectType = "radio";
            } else if(gridId =="objectsSatGrid"){
                this.objectUrl = serverUrl + "/TViewTrx_Sat/" + id;
                this.objectType = "sat";
            }
            app.utils.getObjectDetails(this, this.objectType,this.objectUrl);
            $("#objectsInfosPanel").css({"display":"block"});
        }
    },
    closeInfosPanel : function(){
        $('#objectsInfosPanel').hide();
    },
    displayMap : function(){
        // add map view
        app.utils.displayObjectPositions(this, this.objectUrl,this.idSelectedIndiv);
    },
    maskBox : function(){
        this.removeAllChildren();
        $("#objectsMapContainer").empty();
        $("#objectsMapContainer").removeClass("dialogBoxAlert");
        $( "div.modal-backdrop" ).removeClass("modal-backdrop");
    },
    displayHistoy : function(){
        var url = this.objectUrl + "/carac";
        app.utils.displayObjectHistory(this,this.objectType, url,this.idSelectedIndiv);
    },
    objectDetails : function(){
        var url = this.objectUrl ; 
        app.utils.displayObjectDetails(this,this.objectType, url,this.idSelectedIndiv);
    }
});
app.views.ObjectMapBox = app.views.BaseView.extend({
    //template: "objectMapBox" ,
    template: "objectMap",
    initialize  : function(options) {
        this.parentView = options.view;
        this.url = options.url;
        this.idSelectedIndiv = options.id;
    },
    afterRender : function() {
        var self = this;
        setTimeout(function() {
            var url = self.url + "?format=geojson";
			var  point = new NS.UI.Point({ latitude : 34, longitude: 44, label:""});
            var mapView = app.utils.initMap(point,3);
            self.map_view = mapView;
            self.displayWaitControl();
            /*
            var protocol = new NS.UI.Protocol({ url : url, format: "GEOJSON", strategies:["FIXED", "ANIMATEDCLUSTER"], cluster:true, popup : false, zoomToExtent:true});
            mapView.addLayer({protocol : protocol , layerName : "positions", zoomToExtent: true, zoom:3});   //, center: center, zoom:3 
            */
            var ajaxCall = { url : url, format: "GEOJSON", cluster:true};
            mapView.addLayer({ajaxCall : ajaxCall , layerName : "positions",  zoom:3 ,zoomToExtent : true}); 

            self.parentView.children.push(mapView);
            // $("#objectOnMapId").text(self.idSelectedIndiv);
         }, 500);
    },
    displayWaitControl : function (){
        var mapDiv = this.map_view.el;
        var width =  ((screen.width)/2 -200);
        var height = ((screen.height)/2 - 200);
        var ele = "<div id ='waitControl' style='position: fixed; top:" + height + "px; left:" + width + "px;z-index: 1000;'><IMG SRC='images/PleaseWait.gif' /></div>"  
        var st = $("#waitControl").html();
        if ($("#waitControl").length == 0) {
            $(mapDiv).append(ele);
        }
    }
}); 
app.views.ObjectHistoryBox = app.views.BaseView.extend({
   // template: "objectHistoryBox" ,
    template: "objectHistory" ,
    initialize  : function(options) {
        this.parentView = options.view;
        this.url = options.url;
        this.idSelectedIndiv = options.id;
        this.objectType = options.objectType;
    },
    afterRender : function() {
        // load history
        var self = this;
        $.ajax({
                url: this.url,
                dataType: "json",
                success: function(data) {
                    // check kind of object
                    var  objectType = self.objectType;
                    var objectView ; 
                    if (objectType =="individual"){
                        objectView =  "TViewIndividual"; 
                        var characteristic = data[0].TViewIndividual;
                        var sex = characteristic.Sex  || "";
                        var origin  = characteristic.Origin  || "";
                        var species =  characteristic.Species || "";
                        var birthDate = characteristic.Birth_date  || "";
                        var deathDate = characteristic.Death_date || "";
                        var comments = characteristic.Comments  || "";

                        $("#ObjSex").text(sex);
                        $("#ObjOrigin").text(origin);
                        $("#ObjSpecies").text(species);
                        $("#ObjBirthDate").text(birthDate);
                        $("#ObjDeathDate").text(deathDate);
                        $("#ObjComment").text(comments);
                        $("#objectDescIndiv").removeClass("masqued");
                    }
                    else if (objectType =="radio"){
                        objectView =  "TViewTrxRadio";
                        var characteristic = data[0].TViewTrxRadio;
                        var id = characteristic.Id  || "";
                        var company  = characteristic.Company  || "";
                        var shape =  characteristic.Shape || "";
                        var weight = characteristic.Weight  || "";
                        $("#ObjRadioId").text(id);
                        $("#ObjCompanyId").text(company);
                        $("#ObjShape").text(shape);
                        $("#ObjWheight").text(weight);
                        $("#objectDescRadio").removeClass("masqued");
                    }
                    else if (objectType =="sat"){
                        objectView =  "TViewTrxSat";
                        var characteristic = data[0].TViewTrxSat;
                        var id = characteristic.Id  || "";
                        var company  = characteristic.Company  || "";
                        var model =  characteristic.Model || "";
                        var comments = characteristic.Comments  || "";
                        $("#ObjSatId").text(id);
                        $("#ObjSatCompanyId").text(company);
                        $("#ObjModel").text(model);
                        $("#ObjSatComments").text(comments);
                        $("#objectDescSat").removeClass("masqued");
                    }
                    var historyItems = new app.collections.HistoryItems();

                    for (k in data){
                        var item = data[k];
                        for (j in item){
                           if (j != objectView ) {

                                var elem = item[j];
                                var element = elem[0];
                                /*
                                var lineHtml = "<tr><td>" + j + "</td>";
                                lineHtml += "<td>" + ( element["value_precision"] || "" ) + "</td>";
                                lineHtml += "<td>" + ( element["begin_date"] || "" ) + "</td>";
                                lineHtml += "<td>" + ( element["end_date"] || "" ) + "</td>";
                                lineHtml += "</tr>";
                                $("#objectHistoryTable").append(lineHtml);
                                */    
                                //
                                var value = element["value_precision"] || "";
                                var begin_date = element["begin_date"] || "";
                                var end_date = element["end_date"] || "" ;
                                var historyItem = new app.models.HistoryItem();
                                historyItem.set('characteristic',j);
                                historyItem.set('value',value);
                                historyItem.set('begin_date',begin_date);
                                historyItem.set('end_date',end_date);
                                historyItems.add(historyItem);
                            }
                        }
                    }    
                   // sort collection by begin date 
                    historyItems.sort();
                    // init grid
                    app.utils.initGrid(historyItems, app.collections.HistoryItems)
                    $("#objModal").css("max-height","500px");
                }
        });
        var self = this;
        setTimeout(function() {
            $("#ObjId").text(self.idSelectedIndiv);
        }, 500);
    }
});
app.views.ObjectDetails = app.views.BaseView.extend({
    template: "objectDetails" ,
    initialize  : function(options) {
        this.parentView = options.view;
        this.url = options.url;
        this.idSelectedIndiv = options.id;
        this.objectType = options.objectType;
    },
    afterRender : function() {
        var self = this;
        setTimeout(function(){
            // add map view for individuals
            if (self.objectType =="individual") {
                app.utils.displayObjectPositions(self.parentView, self.url,self.idSelectedIndiv);
            } else {
                // mask map control tab and activate history
                $("#objBoxDetailsMap").addClass("masqued");
               // $("#objBoxDetailsHistory").addClass("active");
                $("#objBoxDetailsHistory").trigger("click");
            }
            // history
            var url = self.url + "/carac";
            app.utils.displayObjectHistory(self.parentView,self.objectType, url,self.idSelectedIndiv);
        }, 500);
    }
});   
app.views.Argos = app.views.BaseView.extend({
    template: "argos" ,
    afterRender : function(options) {
        this.loadStats();
    },
        loadStats : function(){
            var serverUrl = localStorage.getItem("serverUrl");
            var url = serverUrl + "/argos/stat?format=json";
            $.ajax({
                url: url,
                dataType: "json",
                success: function(data) {
                    var labels  = data["label"].reverse();
                    var nbArgos = data["nbArgos"].reverse();
                    var nbGps = data["nbGPS"].reverse();
                    var nbPtt = data["nbPTT"].reverse();
                    // Sum of values in each table
                    /*var sumArgos = 0;var sumGps = 0;var sumPtt = 0;
                    $.each(nbArgos,function(){sumArgos+=parseFloat(this) || 0;});
                    $.each(nbGps,function(){sumGps+=parseFloat(this) || 0;});
                    $.each(nbPtt,function(){sumPtt+=parseFloat(this) || 0;}); */
                    // convert values in Arrays to int
                    nbArgos = app.utils.convertToInt(nbArgos);
                    nbGps = app.utils.convertToInt(nbGps);
                    nbPtt = app.utils.convertToInt(nbPtt);
                    var graphData = {
                        labels : labels,
                        datasets : [
                            {
                                fillColor : "rgba(220,220,220,0.5)",
                                strokeColor : "rgba(220,220,220,1)",
                                data : nbArgos
                            },
                            {
                                fillColor : "rgba(33, 122, 21,0.5)",
                                strokeColor : "rgba(33, 122, 21,1)",
                                data : nbGps
                            }
                        ]
                    }
                    var maxValueArgos = app.utils.MaxArray(nbArgos);
                    var maxValueGps = app.utils.MaxArray(nbGps);
                    var maxValueInGraph = (maxValueArgos > maxValueGps) ? maxValueArgos: maxValueGps;
                    maxValueInGraph = app.utils.GraphJsMaxY(maxValueInGraph);
                    var steps = 5;
                    /*new Chart(ctx).Bar(plotData, {
                        scaleOverride: true,
                        scaleSteps: steps,
                        scaleStepWidth: Math.ceil(max / steps),
                        scaleStartValue: 0
                    });*/
                    var argosChart = new Chart(document.getElementById("argosGraph").getContext("2d")).Bar(graphData,{
                        scaleOverride: true,
                        scaleSteps: steps,
                        scaleStepWidth: Math.ceil(maxValueInGraph / steps),
                        scaleStartValue: 0
                    });
                    /*$("#argosValues").text(sumArgos + sumGps );
                    $("#argosPtt").text(sumPtt);*/
                    // get last date
                    var lastDate =  labels[labels.length - 1];
                    var lastArgosValue = nbArgos[nbArgos.length - 1];
                    var lastGpsValue = nbGps[nbGps.length - 1];
                    var lastPttValue = nbPtt[nbPtt.length - 1];
                    // data for last day
                    $("#argosDate").text(lastDate);
                    $("#argosValues").text(parseFloat(lastArgosValue) + parseFloat(lastGpsValue) );
                    $("#argosPtt").text(lastPttValue);
                },
                error: function(data) {
                   // $("#homeGraphLegend").html("error in loading data ");
                }
            });
    }
});

 return app;
})(ecoReleveData);
