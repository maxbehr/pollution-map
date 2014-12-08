$(document).ready(function() {
    drawmap();

	var request = $.getJSON( "./data/dataset.json", function( data ) {
		console.log( "success" );
	})
	.done(function( data ) {
		console.log( "second success" );

		//var stoffname = "Kohlendioxid (CO2)";
		var results = [];

		$.each(data, function(index, element) {

			//if(element.stoff_name === stoffname) {
			//	results.push(element);
			//}

		});

		console.log(results.length);
	})
	.fail(function(jqXHR, textStatus ) {
		console.log( textStatus );
	})
	.always(function() {
		console.log( "complete" );
	});
});


