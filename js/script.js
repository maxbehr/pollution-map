$(document).ready(function() {
    drawmap();
    getJsonData();

	function getJsonData() {
	    var request = $.ajax({
			url: "http://www.maxbehr.de/opendata/dataset.php?callback=?",
			dataType: "jsonp",
			success: function( data ) {


				//console.log(data);

				/*
				 *	Filter by: Stoffname
				 *
				 */

				var stoffname = "Amoniak (NH3)";
				var results = [];

				$.each(data, function(index_element, element) {

					addMarker( element.wgs84_x, element.wgs84_y );
					var elem = createResult( element.name, element.bundesland );
					$('#results').append(elem);

					$.each( element.fracht, function( index_stoff, stoff ) {

						if(stoff.stoff_name == stoffname) {

							console.log("jep");
							//results.push(element);

						}

					});

				});

			}
		});
	}

	function createResult( name, bundesland ) {

		var elem = '<li><h1>'+ name +'</h1><table><tr> <td class="key">Bundesland</td> <td>'+ bundesland +'</td> </tr> </table> </li>';
		return elem;

	}
});


