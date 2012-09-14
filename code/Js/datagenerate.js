$(document).ready(function() {


    $.ajax({
    
       type: 'GET',
       url: 'exportIndiv_extrait.csv',
       data: null,
       success: function(text) {
       
           var fields = text.split(/\n/);
          // fields.pop(fields.length-1);
           
     
         /*  var cols = fields.slice(0,1);
           var colsss = cols[0].split(';');
               for(var k = 0; k < colsss.length; k += 1) {
			     alert(colsss[k]);
			    } */
           
           
           
           
           //alert(data);
           var data = fields.slice(1,fields.length);
           for(var j = 0; j < data.length; j += 1) {
              var dataFields = data[j].split(';');
            var  values = ""
            for(var k = 0; k < dataFields.length-1; k += 1) {
			values = values +"'"+dataFields[k+1]+"',";
			}
			var n=values.lastIndexOf(",");
			var val = values.substr(0,n);
			var req = "INSERT INTO Ttaxon (Thes_Status_Precision, TCarac_Transmitter_Frequency, TCarac_Release_Ring_Code, TCarac_Breeding_Ring_Code, TCarac_Chip_Code) VALUES ("+val+")";
			
				insertRow(req);
		
			
				
           }
           
           
           
           
           
           
           
       
       
       
       }
    
    
    
    });



});
  