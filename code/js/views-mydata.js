
/****************************************************
	My stored data
****************************************************/

var ecoReleveData = (function(app) {
	"use strict";

app.views.MyData = app.views.BaseView.extend({
	template: 'myData',
	initialize: function() {
		// remove background image
		$.supersized({
			slides: [{
				image: ''
			}]
		});
	},
	afterRender : function(){
		$('#myDataFilter').masonry({
		    // options
		    itemSelector : '.filterItem',
		    // set columnWidth a fraction of the container width
			  columnWidth: function( containerWidth ) {
			    return containerWidth / 5;
			  },
		     isFitWidth: true
  		});
  		$("input[name='beginDate']").datepicker();
  		$("input[name='endDate']").datepicker(); 
  		// display obs number
  		$("#mydataNbObs").text(app.collections.obsListForMyData.length);
  	
  		app.utils.initGrid(app.collections.obsListForMyData, app.collections.StationsProtocols);
  		// get protocols list and add it to datalist (input protocol selection)
  		var protocols = app.collections.protocolsList;
			protocols.each(function(mymodel) {
				var li = '<option value="' + mymodel.get('name') +'"></option>';
				$("#birdBreedingRingList").append(li);
				
			});

	}
});

	return app;
})(ecoReleveData);