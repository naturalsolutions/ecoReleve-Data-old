define([
    "jquery",
    "underscore",
    "backbone",
    "event_manager",
    'marionette',
    'config',
    "models/rfid",
    'text!templates/individual/individual-filter.html'
], function($, _, Backbone, eventManager, Marionette, config, Rfid, template) {

    "use strict";

    return Marionette.ItemView.extend({
        template: template,
        afterRender: function() {
            $("section#main").addClass("blackBackground");
            //$('.objectsIndivGrid').lionbars();
            var windowWidth = $(window).width();
            var windowHeigth = $(window).height();
            $("#objectsIndivFilter").css("height",windowHeigth-50);
            $.supersized({
                slides: [{
                    image: ''
                }]
            });
            // load data
            var serverUrl = app.config.serverUrl;
            var coreUrl = app.config.coreUrl;
            var indivUrl =  coreUrl + '/individuals/search';
            this.indivUrl = indivUrl;
            // load data for indiv grid
            this.getBirdsList();
            // autocomplete for field species
            var autocompleteUrl = coreUrl + '/individuals/search/values?limit=100&field_name=';
            var fieldSpecies = autocompleteUrl +'specie';
            app.utils.getSimpledataListForBirdFilter ("#speciesList", fieldSpecies);
            // autocomplete for release area
            var fieldArea = autocompleteUrl + 'releaseArea';
            app.utils.getSimpledataListForBirdFilter ("#releaseAreaList", fieldArea);
            // autocomplete for release year
            var fieldYear = autocompleteUrl + 'releaseYear';
            app.utils.getSimpledataListForBirdFilter ("#releaseYearList", fieldYear);
            var fieldSexUrl = autocompleteUrl + 'sex';
            app.utils.getSimpledataListForBirdFilter ("#birdSexList", fieldSexUrl);
            var fieldSurveyUrl = autocompleteUrl + 'surveyType';
            app.utils.getSimpledataListForBirdFilter ("#birdSurveyList", fieldSurveyUrl);
            var fieldPttUrl = autocompleteUrl + 'ptt';
            app.utils.getSimpledataListForBirdFilter ("#birdPttList", fieldPttUrl);
            var fieldFrequencyUrl = autocompleteUrl + 'frequency';
            app.utils.getSimpledataListForBirdFilter ("#birdFrequencyList", fieldFrequencyUrl);
            var fieldMonitoryUrl = autocompleteUrl + 'monitoringStatus';
            app.utils.getSimpledataListForBirdFilter("#birdMonitoryList", fieldMonitoryUrl);
            var fieldChipCodeUrl = autocompleteUrl + 'chipCode';
            app.utils.getSimpledataListForBirdFilter ("#birdChipCodeList", fieldChipCodeUrl);
            var fieldReleaseRingColorUrl = autocompleteUrl + 'releaseRingColor';
            app.utils.getSimpledataListForBirdFilter("#birdReleaseRingColorList", fieldReleaseRingColorUrl);
            var fieldColorUrl = autocompleteUrl + 'markColor1' ;
            app.utils.getSimpledataListForBirdFilter ("#birdMarkColorList", fieldColorUrl);
            var fieldAgeUrl = autocompleteUrl  + 'age' ;
            app.utils.getSimpledataListForBirdFilter ("#birdAgeList", fieldAgeUrl);
            var fieldOriginUrl = autocompleteUrl  + 'origin';
            app.utils.getSimpledataListForBirdFilter ("#birdOriginList", fieldOriginUrl);
            var fieldReleaseRingUrl = autocompleteUrl + 'releaseRingCode' ;
            app.utils.getSimpledataListForBirdFilter ("#birdReleaseRingList", fieldReleaseRingUrl);
            var fieldBreedingRingUrl = autocompleteUrl + 'breedingRingCode' ;
            app.utils.getSimpledataListForBirdFilter("#birdBreedingRingList", fieldBreedingRingUrl);
            // get array to store serach criterias
            var storedCriterias = localStorage.getItem('indivFilterStoredCriterias') || "";
            if (!storedCriterias){
                this.criterias =  [];
            } else {
                this.criterias = JSON.parse(storedCriterias);
            }
        },
        events :{
            'click #indivFilterSubmit' :'getBirdsList', // 'getBirdsList',
            'click tr': 'selectTableElement',
            'click #indivFilterClear' : 'clearFields',
            'click #hideShowFilter' : 'moveFilter',
            'click #indivFilterSave' : 'saveCriterias',
            'click li#serachHeaderElem1' : 'selectSearchMode',
            'click li#serachHeaderElem2' : 'selectSearchMode',
            'click #indivSavedFiltersList li span.spnSavedFilterVal' : 'selectSavedFilter',
            'click #indivSavedFiltersList li img' : 'deleteSavedFilter'
        },
        getBirdsList : function(){
            var url = this.indivUrl;
            var criteria  = this.getParams();
            var params = {
                criteria:criteria,
                limit:50
            };
            var type = 'POST';
            params =JSON.stringify(params);
            app.utils.getDataForGridAdvanced(url,type, params, function(collection, rowsNumber) {
                app.utils.initGridServer(collection, rowsNumber, url, {
                    pageSize: 50,
                    //columns: [2, 6, 7, 8],
                    container: "#gridContainer"
                });
                if (!$('#grid').hasClass('mCustomScrollbar')) {
                    $("#grid").mCustomScrollbar({
                        theme:"dark",
                        horizontalScroll:true
                    });
                }
            });
        },
        getParams : function(){
            var inputs = $("#indivCurrentSearch input");
            var criteria  = {};
            inputs.each(function(){
                var name  = $(this).attr('name');
                var value = $(this).val();
                if (value){
                    if ((name ==="id") || (name==="frequency")||(name==="ptt") ||(name==="releaseYear")){
                        value = parseInt(value,10);
                    }
                    criteria[name] = value;
                }
            });
            return criteria;
        },
        saveCriterias : function() {
            var params = this.getParams();
            if (!jQuery.isEmptyObject(params)){
                this.addModalWindow(params);
            } else {
                alert("please input criterias to save.");
            }
        },
        selectTableElement: function(e) {
            var ele = e.target.parentNode.nodeName;
            if (ele == "TR") {
                var selectedModel = app.models.selectedModel;
                var id = selectedModel.get("id");
                var route = '#bird/' + id;
                app.router.navigate(route, {trigger: true});
            }
        },
        clearFields : function() {
            $("input").val("");
        },
        moveFilter : function() {
            //$("#objectsIndivFilter").toggle( "slide" );
            //var windowWidth = $(window).width();
            $("#objectsIndivFilter").toggle("slide", function() {
                var displayed = $( "#objectsIndivFilter" ).css('display');
                if (displayed ==="none"){
                    $("#hideShowFilter").addClass("selected");
                    $("#objectsIndivFilter").removeAttr("class");
                    $("#objectsIndivFilter").addClass("span0");
                    $("#objectsIndGrid").removeAttr("class");
                    $("#objectsIndGrid").addClass("span12");
                    $("#hideShowFilter").css("left", "0px");

                } else {
                    $("#objectsIndGrid").removeAttr("class");
                    $("#hideShowFilter").removeClass("selected");
                    $("#objectsIndivFilter").removeAttr("class");
                    $("#objectsIndivFilter").addClass("span3");
                    $("#objectsIndGrid").addClass("span9");

                    $("#hideShowFilter").css("left", "405px");
                }
            });

        },
        addModalWindow : function(params){
             var serachName = prompt("please input serach name", "");
              alert("search criterias saved.");
              var ln = this.criterias.length;
              var searchItem = {};
              searchItem.name = serachName;
              // id searchItem = ln + 1
              searchItem.id = ln + 1 ;
              searchItem.query = JSON.stringify(params);
              this.criterias.push(searchItem);
              localStorage.setItem('indivFilterStoredCriterias',JSON.stringify(this.criterias));
        },
        selectSearchMode : function(e) {
            var selectedElement = e.target;
            var nodeName = selectedElement.nodeName;
            var liElement;
            if (nodeName == "LI") {
                liElement = selectedElement;
            } else {
                liElement = selectedElement.parentNode;
            }
            var idElement = $(liElement).attr("id");
            $(".serachHeaderElem").removeClass("selected");
            $(liElement).addClass("selected");
            if (idElement ==="serachHeaderElem2"){
                $("#indivCurrentSearch").addClass("masqued");
                $("#indivSavedSearch").removeClass("masqued");
                this.displaySavedCriterias();
            } else {
                $("#indivCurrentSearch").removeClass("masqued");
                $("#indivSavedSearch").addClass("masqued");
            }
        },
        selectSavedFilter : function(e) {
            var selectedElement = e.target;
            var liElement = selectedElement.parentNode;
            var filterId = $(liElement).attr('id');
            // get params for selected filter
            var params;
            var ln = this.criterias.length;
            for (var i = 0; i < ln; i++) {
                // get item
                var savedItemId= this.criterias[i].id;
                if(savedItemId ==filterId){
                    params = this.criterias[i].query;
                    break;
                }
            }
            var param = {
                criteria:JSON.parse(params),
                limit:50
            };
            // send query with saved criterias
            var url = this.indivUrl ;
            param =JSON.stringify(param);
            app.utils.getDataForGridAdvanced(url,'POST', param, function(collection, rowsNumber) {
                app.utils.initGridServer(collection, rowsNumber, url, {
                    pageSize: 50,
                    //columns: [2, 6, 7, 8],
                    container: "#gridContainer"
                });
                if (!$('#grid').hasClass('mCustomScrollbar')) {
                    $("#grid").mCustomScrollbar({
                        theme:"dark",
                        horizontalScroll:true
                    });
                }
            });
        },
        deleteSavedFilter : function(e) {
            var selectedElement = e.target;
            var liElement = selectedElement.parentNode.parentNode;
            // get li id  => id of filter object
            var filterId = $(liElement).attr('id');
            // delete object from criterias list and update displayed list
            var ln = this.criterias.length;
            for (var i = 0; i < ln; i++) {
                // get item
                var savedItemId= this.criterias[i].id;
                if(savedItemId ==filterId){
                    //alert ("savedItemId :" + savedItemId);
                    var elem = this.criterias.splice(i,1);
                    //update displayed list
                    this.displaySavedCriterias();
                    break;
                }
            }
        },
        displaySavedCriterias: function() {
            $("#indivSavedFiltersList").empty();
            var ln = this.criterias.length;
            if (ln ===0 ){
                $("#indivSavedFiltersList").append("<p> no saved criterias</p>");
            } else {
                for (var i = 0; i < ln; i++) {
                    // get item
                    var savedItem= this.criterias[i];
                    var element = "<li id='" + savedItem.id + "'><span class='spnSavedFilterVal'>" + savedItem.name + "</span><span><img src='images/delete_grey.png' class='birdCritDel'></span></li>";
                    $("#indivSavedFiltersList").append(element);
                }
            }
        },
        remove: function(options) {
            app.views.BaseView.prototype.remove.apply(this, arguments);
            $("section#main").removeClass("blackBackground");
        }
    });
});
