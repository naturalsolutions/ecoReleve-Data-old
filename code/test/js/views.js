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

app.views.HomeView = app.views.BaseView.extend({
	template: 'home',
	initialize: function() {
         this.serverUrl = localStorage.getItem( "serverUrl");
		app.views.BaseView.prototype.initialize.apply(this, arguments);
        this._dfds = {};
		window.addEventListener('online',  this.updateOnlineStatus);
		window.addEventListener('offline', this.updateOnlineStatus);
        this.loadStats();
	},
    /*afterRender: function () {
        this.resizeImage();
        var self = this;
        $(window).bind('resize', function () { 
            self.resizeImage();
        });
    },*/
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
		alert(condition);
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

                var myPie = new Chart(document.getElementById("graph").getContext("2d")).Bar(gData,null);
                $("#homeGraphLegend").text("stations number per month");
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
            }
        });
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
        'click #export-add-filter' : 'addFilter',
        'click #export-field-select-btn' :'selectField',
        'click .btnDelFilterField' : 'deleteFilterItem',
        'click #filter-query-btn' : 'filterQuery',
        'click #exportMap' : 'selectExtend',
        'click button.close' : 'exitExp'
        
    },
    exportview : function(){
        app.router.navigate("#export", {trigger: true});
    },
    addFilter : function(){
        $("#export-field-selection").removeClass("masqued");
        $("#filter-btn").addClass("masqued");
       // $('#export-view-fields').css({"display": "inline-block","height": "40px","width": "350px"});
    
    },
    selectField : function(){
        var fieldName = $("#export-view-fields option:selected").text();
         var fieldId = fieldName.replace("@", "-");
        // check if field is already selected
        var ln = this.selectedFields.length;
        var isSelected = false;
        if (ln > 0) {
            for (var i=0;i<ln;i++){
                if (this.selectedFields[i] ==fieldId){
                    isSelected = true;
                    break;
                }
            }
        }
        if (isSelected == false) {
            var fieldType = $("#export-view-fields option:selected").attr('type');
            var fieldId = fieldName.replace("@", "-");
            // generate operator
            var operatorDiv = this.generateOperator(fieldType);
            var inputDiv = this.generateInputField(fieldType);
            var fieldFilterElement = "<div class ='row-fluid filterElement' id='div-"  + fieldId +"'><div class='span4 name' >" + fieldName + "</div><div class='span2 operator'>"+ operatorDiv +"</div><div class='span5'>";
                fieldFilterElement += inputDiv + "</div><div class='span1'><a cible='div-"  + fieldId +"' class='btnDelFilterField'><img src='img/delete.png'/></a></div></div>";
            $("#export-filter-list").append(fieldFilterElement);
            $("#export-filter-list").removeClass("masqued");
            $('#filter-query').removeClass("masqued");
            this.selectedFields.push(fieldId);
        }
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
            
            var condition = $(this).find("input.fieldval").val(); 
            query += fieldName + operator + condition +",";
        });
        // delete last character "&"
        query = query.substring(0,query.length - 1);
        var selectedView = this.viewName ;
        $("#filterForView").val(query);
        app.utils.getFiltredResult(query,selectedView);
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
          operatorDiv = "<select class='filter-select-operator'><option>LIKE</option><option>=</option></select>";  //"LIKE";
          break;
        case "integer":
          operatorDiv = "<select class='filter-select-operator'><option>&gt;</option><option>&lt;</option><option>=</option><option>&lt;&gt;</option><option>&gt;=</option><option>&lt;=</option></select>";
          break;
        /*case "datetime":
        operatorDiv = "<select class='filter-select-operator'><option>&gt;</option><option>&lt;</option></select>";
          break;*/
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
        app.router.navigate('#', {trigger: true});
    }
});
app.views.ExportMapView = app.views.BaseView.extend({
     template: "export-map" ,
    initialize : function(options) {
        this.currentView =  options.view;
        //this.filterValue = options.filter;
        this.filterValue = app.views.filterValue;
        
        //$("input#updateSelection").trigger('change');
    },
    afterRender: function(options) {
       // $(".modal-content").css({"height":"700px"});
        $("#filterViewName").text(this.currentView);
        $('#map').css({"width":"800px","height":"500px"});
     //   $(".modal-body").css({"max-height":"600px"});
        var  point = new NS.UI.Point({ latitude : 31, longitude: 61, label:""});
        this.map_view = app.utils.initMap(point, 3);
        var style = new OpenLayers.Style({
              pointRadius:0.2,strokeWidth:0.2,fillColor:'#edb759',strokeColor:'white',cursor:'pointer'
        });
        this.map_view.addLayer({point : point , layerName : "", style : style});
        //masquer certains controles
         var controls = this.map_view.map.getControlsByClass("OpenLayers.Control.MousePosition");
        this.map_view.map.removeControl(controls[0]);
        controls = this.map_view.map.getControlsByClass("OpenLayers.Control.Panel");
        this.map_view.map.removeControl(controls[0]);
        // add zoom controls to map
        this.addControlsToMap();
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
        // check bbox coordinates stored in hidden input "#updateSelection"
        
        /*
        this.timer = setInterval(function(){
            var bboxVals = $("input#updateSelection").val();
            if ((typeof bboxVals) !== "undefined"){
                var tab = bboxVals.split(",");
                var minLon = tab[0] || "";
                var minLat = tab[1] || "";
                var maxLon = tab[2] || "";
                var maxLat = tab[3] || "";
                if (bboxVals!=""){  
                    minLon = parseFloat(minLon);
                    minLon = minLon.toFixed(2);
                    minLat = parseFloat(minLat);
                    minLat = minLat.toFixed(2);
                    maxLon = parseFloat(maxLon);
                    maxLon = maxLon.toFixed(2);
                    maxLat = parseFloat(maxLat);
                    maxLat = maxLat.toFixed(2);
                }
                $("#minLon").text(minLon);
                $("#minLat").text(minLat);
                $("#maxLon").text(maxLon);
                $("#maxLat").text(maxLat);
            }
        }, 2000);
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
        var query = "filters=" + filterVal +"&bbox="+ bboxVal;
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
        columnsModel.constructor.verboseName  = "Columns";          
        setTimeout(function(){
            var myView = new app.views.ExportColumnsListFormView({initialData:columnsModel});
            myView.render();
            $("#formcolumns").append(myView.el);
            $("#exportResult").on("click", $.proxy(myView.onSubmit, myView));
            $(".form-actions").addClass("masqued");
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
app.views.ExportResult = app.views.BaseView.extend({
    template: "export-result" ,
    initialize : function(options) {
        this.currentView =  options.view;
        this.filterValue = app.views.filterValue;
        this.bbox = app.views.bbox;
    },
    afterRender: function(options) {
      //  $(".modal-content").css({"height":"700px", "max-width": "900px"});
      //  $('#map').css({"width":"700px","height":"400px"});
      //  $(".modal-body").css({"max-height":"600px"});
      $("#filterViewName").text(this.currentView);
        var fieldsList = app.utils.exportSelectedFieldsList;
        var ln = fieldsList.length;
        //generate datatable structure
        for (var i=0; i< ln ; i++){
            var fieldName = fieldsList[i];
            var fieldHtml = "<th>" + fieldName + "</th>";
            $("#exportResultList-head").append(fieldHtml);
            
        }
        app.utils.getExportList(this.currentView, this.filterValue, this.bbox, this);
        $("#exportResultList-head").css({"color":"black"});
    },
    events : {
        'click #exportPrevBtn' : 'backToMap',
        //'click #export-getGpx' : 'getGpx',
        'click #export-first-step' : 'backToFistStep',
        'click #exportDataMap' : 'dataOnMap',
        'click #canvas' : "generateCanvas",
        'click button.close' : 'exitExp'
    },
    backToMap : function (){
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
    getGpx : function (){
        /*var url = this.url;
        app.utils.getGpxFile(url);  */
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
    generateCanvas : function (){
        var pdf = new jsPDF('p','in','letter')
        , source = $('#grid')
        , specialElementHandlers = {
            // element with id of "bypass" - jQuery style selector
            '#bypassme': function(element, renderer){
                // true = "handled elsewhere, bypass text extraction"
                return true
            }
        }

        // all coords and widths are in jsPDF instance's declared units
        // 'inches' in this case
        pdf.fromHTML(
            source // HTML string or DOM elem ref.
            , 0.5 // x coord
            , 0.5 // y coord
            , {
                'width':7.5 // max width of content on PDF
                , 'elementHandlers': specialElementHandlers
            }
        )

        pdf.save('Test.pdf');

       /* html2canvas(document.getElementById("grid"), {
            onrendered: function(canvas) {
                // canvas is the final rendered <canvas> element
                document.getElementById("grid-canvas").appendChild(canvas);
            }
        });*/
    },
    exitExp : function(e){
        if(app.xhr){ 
             app.xhr.abort();
         }
        app.router.navigate('#', {trigger: true});
    }
    
});
app.views.GridView = app.views.BaseView.extend({
       // template: 'type-list',

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
        /*,

        serialize: function() {
            return {
                verboseName: 'List of ' + this.collection.model.verboseName.toLowerCase()
            };
        }*/
    });
	
app.views.ExportResultOnMapView = app.views.BaseView.extend({
    template: "export-data-on-map",
    initialize : function(options) {
        var serverUrl = localStorage.getItem("serverUrl");
        this.view = options.view;
        this.displayedColumns = app.utils.exportSelectedFieldsList;
        this.url = serverUrl +  "/views/get/" + this.view + "?filters=" + app.views.filterValue + "&bbox=" + app.views.bbox + "&columns=" + this.displayedColumns ; 
    },
    afterRender: function(options) {
     //   $(".modal-content").css({"height":"700px"});
     $("#filterViewName").text(this.view);
        $('#map').css({"width":"900px","height":"550px"});
     //   $(".modal-body").css({"max-height":"600px"});
        var  point = new NS.UI.Point({ latitude : 31, longitude: 61, label:""});
        this.map_view = app.utils.initMap(point, 2);
        var url = this.url + "&format=geojson";
        var style  = new OpenLayers.Style({
            pointRadius:4,strokeWidth:1,fillColor:'#edb759',strokeColor:'black',cursor:'pointer'
            , label : "${Site_name}",  labelXOffset: "50", labelYOffset: "-15"
        });
        var protocol = new NS.UI.Protocol({ url : url, format: "GEOJSON", strategies:["FIXED"], popup : false, style: style});
        this.map_view.addLayer({protocol : protocol , layerName : "Observations", });
        this.addControlsToMap();
    // load map vector fields list
        var len = this.displayedColumns.length;
        for (var i=0;i< len; i++){
            var label = this.displayedColumns[i];
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
        'click #export-canvas' : 'generateCanvas'
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
    /*
    backToFilter : function (){
        var currentView = this.currentView;
        window.clearInterval(this.timer);
        app.views.main.setView(".layoutContent", new app.Views.ExportFilterView({viewName: currentView}));
        app.views.main.render();
    },
    */
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
app.views.AllDataView = app.views.BaseView.extend({
    template: "allData",
    afterRender: function(options){ 
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
        //app.utils.fillTaxaList();
    }    
    ,events : {
        'change #select_id_proto' : 'updateTable',
        'change input.cluster' : 'updateMap',
        'click #btnY-1' :'updateDate1an',
        'click #btnReset' : 'resetdate',
        'click #btnY-2' : 'updateDate2ans',
        'click #btnD-1' : 'updateDateHier',
        'keyup #datedep' : 'updateDateDep',
        'keyup #datearr' : 'updateDateArr',
        'click #searchBtn ' : 'search',
        'click tr' : 'selectTableElement',
        'click #allDataInfosPanelClose' : 'closeInfosPanel',
        //'change input#updateSelection' : 'updateTableForSelecedFeatures'
        'click #refreshTable' : 'updateTableForSelecedFeatures'
    },
    updateTable: function(){
        //this.updateControls();
        $("#id_proto").attr("value",($("#select_id_proto option:selected").attr('id')));
    },
    updateDate1an : function(){
        $(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
        $("#btnY-1").css({"background-color" : "rgb(150,150,150)"});
        $('#idate').text("1ans");   
    },
    updateDate2ans : function(){
        $(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
        $("#btnY-2").css({"background-color" : "rgb(150,150,150)"});
        $('#idate').text("2ans");   
    },
    resetdate : function(){
        $(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
        $("#btnReset").css({"background-color" : "rgb(150,150,150)"});
        $('#idate').text("");
    },
    updateDateHier : function(){
        $(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
        $("#btnD-1").css({"background-color" : "rgb(150,150,150)"});
        $('#idate').text("hier");
    },
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
        this.updateControls();
        var datedep=$("#datedep").attr('value');
        var datearr=$("#datearr").attr('value');
        $('#idate').text(datedep+";"+ datearr);
        app.utils.updateLayer(this.map_view);
        var params = 'id_proto='+$("#id_proto").attr("value")+"&place="+$("#place").attr("value")+"&region="+$("#region").attr("value")+"&idate="+$('#idate').text()+"&taxonsearch="+$("#iTaxon").attr("value");
        app.utils.filldatable(params);
        
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
    }



}); 


 return app;
})(ecoReleveData);
