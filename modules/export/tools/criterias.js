define([
    'jquery',
    'backbone',
    'config'
], function($, Backbone, config){
    'use strict';
    return Backbone.Model.extend({
    	defaults: {
    		step1 : null,
    		step2 : null,
    		step3 : null,
    		step4 : null,
    	},

    	/**
    	*
    	* Check if the next btn should be enable or not;
    	*
    	**/
	    check: function(step){
	    	var check=false;
	    	var obj= this.attributes;
	    	var i=1;

	    	console.log('step : '+step);

	    	//reset 4 the moment
	    	var i = 1;
	    	for (var x in obj) {
	    		//i = parseInt(x);

    			if( i > step ){
    				this.enableNav();
    			}

    			if(i <= step && obj[x] != null){
    				if($.isArray(obj[x])){
    					var tab=obj[x];
    					for (var i = 0; i < tab.length; i++) {
    						if(tab[i] == null){
    							//should return the name of the filter nedded
    							return this.returnErrors();
    						}
    					}
    				}
    			}
    			else{
    				return this.returnErrors();
    			}
    		    i++;
		    }
		    i=1;
	    	return check;
	    },

	    enableNav: function(){
	    	$('.btn-next').removeAttr('disabled');
	    },

	    returnErrors: function(){
			return false;   	
	    },





    });
});

