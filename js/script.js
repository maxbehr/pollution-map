function Model() {


	this.results = [];

	this.getJsonData = function( callback ) {
		var that = this;

        var request = $.ajax({
            url: "http://www.maxbehr.de/opendata/dataset.php?callback=?",
            dataType: "jsonp",
            data: {
                limit: 100
            },
            success: function (data) {
                $.each(data, function (index_element, element) {
                    that.results.push(element);
                    console.log( element );
                });

                setTimeout(function() { callback( that.getResults() ); }, 500);

            }
        });
    }

    this.getResults = function() {
    	return this.results;
    }

    this.getSubstances = function() {

    	var substances = [];

    	var i = 0;
    	$.each( this.results, function (index_element, element) {
    		$.each(element.fracht, function (index_element, element) {
    			if( element.stoff_name !== null && element.stoff_name.trim() !== "" && substances.indexOf( element.stoff_name ) === -1) {
    				substances.push( element.stoff_name );
    			}
    			i++;
    		});

    	});

		substances.sort();
    	return substances;

    };

    this.getCompanies = function() {

    	var companies = [];

    	$.each( this.results, function (index_element, element) {
    		if( element.name !== null && element.name.trim() !== "" && companies.indexOf( element.name ) === -1) {
    			companies.push( element.name );
    		}

    	});

    	companies.sort();
    	return companies;

    };


    this.getStates = function() {

    	var states = [];

    	$.each( this.results, function (index_element, element) {
    		if( element.bundesland !== null && element.bundesland.trim() !== "" && states.indexOf( element.bundesland ) === -1) {
    			states.push( element.bundesland );
    		}

    	});

    	states.sort();
    	return states;

    };

}



$(document).ready(function () {
    drawmap();

    var model = new Model();
    model.getJsonData( init );

    $('#search').on('click', function() {
    	console.log("Search");
    });

	/**
	 *	Initializes the entire page.
	 */
    function init() {
    	updateSubstancesDropDown();
    	updateCompaniesDropDown();
    	updateElements( model.getResults() );
    }

	/**
	 *	Updates the substances drop down with all fetched substance names.
	 */
    function updateSubstancesDropDown() {

    	var substances = model.getSubstances();
		var select = $('#substance-selector');
		$.each(substances, function(val, text) {

			select.append(
		    	$('<option></option>').val(val).html(text)
			);
		});
    }

	/**
	 *	Updates the company drop down with all fetched company names.
	 */
    function updateCompaniesDropDown() {

    	var companies = model.getCompanies();
		var select = $('#company-selector');
		$.each(companies, function(val, text) {

			select.append(
		    	$('<option></option>').val(val).html(text)
			);
		});
    }

    function updateElements( results ){
        var resultBlock =  $('#results');
        markers = [];

        resultBlock.fadeOut("slow", function() {
            resultBlock.empty();
            $.each(results, function (index_element, element) {
                var currentMarker = L.marker([element.wgs84_y, element.wgs84_x]);
                currentMarker.addTo(map);
                markers[element.id] = currentMarker;

                var elem = createResult(element);
                resultBlock.append(elem);
            });
            $('#results').fadeIn("slow");


            $("#results li").on( "mouseenter", function(event) {
                    hoverId = $(this).attr('id');
                    if (!clickedMarker) {
                        markers[hoverId].bindPopup("<b>Hello world!</b><br>I am a popup."); //TODO: Remove this part here, popup content needs to be assigned somewhere else, probably when the marker is set.
                        markers[hoverId].openPopup();
                        $("#results #" + hoverId).addClass('active');
                    }
            });

            $("#results li").on( "mouseleave", function(event) {
                if (!clickedMarker) {
                    markers[hoverId].closePopup();
                    $("#results #" + hoverId).removeClass('active');
                    hoverId = null;
                }
            });

            $("#results li a").on( "click", function(event) {
                event.stopPropagation();
                var parentId = $(this).parent().attr('id')
                if (parentId == clickedMarker) {
                    clickedMarker = null;
                } else {
                    if (clickedMarker) {
                        //markers[clickedMarker].closePopup();
                        $("#results #" + clickedMarker).removeClass('active');
                    }
                    markers[hoverId].bindPopup("<b>Hello world!</b><br>I am a popup."); //TODO: Remove this part here, popup content needs to be assigned somewhere else, probably when the marker is set.
                    markers[parentId].openPopup();
                    $("#results #" + parentId).addClass('active');
                    clickedMarker = parentId;
                }
            });

            map.on('popupclose', function(e) {
                clickedMarker = null;
                $("#results li").removeClass('active');
            });

        });
    }

    function createResult(element) {
        return '<li id="' + element.id + '"><a href="#"><h1>' + element.name + '</h1></a><table><tr> <td class="key">Bundesland:</td> <td>' + element.bundesland + '</td> </tr> </table> </li>';
    }
});


