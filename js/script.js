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
                    //console.log( element );
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

    this.findCompaniesInState = function( state ) {
    	var companies = [];

    	$.each( this.results, function (index_element, element) {
    		if( element.bundesland !== null && element.bundesland.trim() !== "" && element.bundesland === state ) {
    			companies.push( element );
    		}

    	});

    	return companies;
    }

    this.findCompaniesForSubstance = function( substance ) {
    	var companies = [];
    	var that = this;

    	$.each( this.results, function (index_element, element) {
    		if( that.hasCompanySubstance( element, substance) ) {
    				companies.push( element );
    		}

    	});

    	return companies;
    }

    this.findSubstancesForCompany = function( company ) {

    	var substances = [];

    	$.each( this.results, function (index_element, element) {
    		if( element.name !== null && element.name.trim() !== "" && element.name === company ) {
    			substances.push( element );
    		}

    	});

    	return substances;
    }

    this.hasCompanySubstance = function( company, substance ) {

		var b = false;

    	$.each(company.fracht, function( index, fracht ) {

			if( fracht.stoff_name == substance ) {
				b = true;
				return false;
			}


    	});

    	return b;
    }

    this.getSubstanceElementsFromCompany = function( company, substance ) {
		var substances = [];

    	$.each(company.fracht, function( index, fracht ) {
			if( fracht.stoff_name == substance ) {
				substances.push( fracht );
			}


    	});

    	return substances;
    }

}

var FILTER = {
	STATE : "Bundesland",
	SUBSTANCE : "Stoff",
	COMPANY : "Unternehmen"
}


$(document).ready(function () {

    drawmap();

    var model = new Model();
    model.getJsonData( init );

    $('#filter-one').on('change', function() {
    	updateFilterTwo();
    	updateSidebar();
    });

    $('#filter-two').on('change', function() {
		updateSidebar();
    });


    function updateSidebar() {
		console.log("Update result in sidebar")
    	var selectedFilter = getFilterOneText();
		var selectedFilter2 = getFilterTwoText();

		var arr = [];

		switch( selectedFilter ) {
		    case FILTER.STATE:

		    	var elements = model.findCompaniesInState( selectedFilter2 );
				updateSidebarWithStateFilter( elements );
				updateElements( elements );
		        break;

		    case FILTER.SUBSTANCE:

				var elements = model.findCompaniesForSubstance( selectedFilter2 );
		        updateSidebarWithSubstanceFilter( elements );
		        updateElements( elements );
		        break;

		    case FILTER.COMPANY:

				var elements = model.findSubstancesForCompany( selectedFilter2 );
				updateSidebarWithCompanyFilter( elements );
				updateElements( elements );
		    	break;

		    default:
		        console.log("Nichts selektiert...")

		}

		$('#sidebar').fadeIn(500);
    }

	/**
	 *	Initializes the entire page.
	 */
    function init() {
    	updateFilterOne();
    	updateFilterTwo();
    	updateSidebar();
    	// updateElements( model.getResults() );
    }

	/**
	 *	Updates the substances drop down with all fetched substance names.
	 */
    function updateFilterOne() {

		var select = $('#filter-one');
		$.each(FILTER, function(val, text) {

			select.append(
		    	$('<option></option>').val(val).html(text)
			);
		});

    }

	/**
	 *	Updates the company drop down with all fetched company names.
	 */
    function updateFilterTwo() {

		var selectedFilter = getFilterOneText();

		var arr = [];

		switch( selectedFilter ) {
		    case FILTER.STATE:
		        arr = model.getStates();
		        break;
		    case FILTER.SUBSTANCE:
		        arr = model.getSubstances();
		        break;
		    case FILTER.COMPANY:
		    	arr = model.getCompanies();
		    	break;
		    default:
		        console.log("Nichts selektiert...")
		}

		updateResultHeader( selectedFilter );

		var select = $('#filter-two');
		$(select).empty();
		$.each(arr, function(val, text) {
			select.append(
		    	$('<option></option>').val(val).html(text)
			);
		});

    }

    /**
		Updates the sidebar when the state filter is set.
     */
    function updateSidebarWithStateFilter( elements ) {
    	console.log("updateSidebarWithStateFilter: " + elements.length + " elements");
    	var f2 = getFilterTwoText();

    	updateResultDescription( 'In <strong>'+ f2 +'</strong> haben folgende Unternehmen ihren Sitz:' );

    	var t = $('<ul></ul>');
    	//	Loop through elements
    	$.each( elements, function( index, element ) {
    		var li = createListItem();
    		$(li).find('.head').html( '<i class="fa fa-building-o"></i> ' + element.name );
    		$(li).find('.detail').html( '<p>'+ element.fracht.length +' ausgestoßene Stoffe</p><p>'+ element.anschrift +', '+ element.bundesland +'</p>' );

    		$(t).append(li);
    	});

    	updateResultText( t );

    }

    /**
		Updates the sidebar when the substance filter is set.
     */
    function updateSidebarWithSubstanceFilter( elements ) {
    	console.log("updateSidebarWithSubstanceFilter: " + elements.length + " elements");
		var f2 = getFilterTwoText();

    	updateResultDescription( '<strong>'+ f2 +'</strong> wurde von folgenden Unternehmen ausgestoßen:' );

    	var t = $('<ul></ul>');
    	//	Loop through elements
    	$.each( elements, function( index, element ) {
    		var substances = model.getSubstanceElementsFromCompany( element, f2 );

    		var li = createListItem();

    		$(li).find('.head').html( '<i class="fa fa-building-o"></i> ' + element.name );

    		var table = $('<table><tr><th>Jahr</th><th>Kompartiment</th><th>Jahresfracht</th><th>versehentlich</th></tr></table>')

    		$(li).find('.detail').html( '<p>Insgesamt gab es <strong>' + substances.length + ' Frachtaustöße</strong> von <strong>'+ f2 +'</strong></p>');
			$(li).find('.detail').append( table );


			var jahresfrachtGesamt = 0;
    		$.each(substances, function( index_substance, substance ) {
    			jahresfrachtGesamt += (substance.jahresfracht !== null) ? parseInt( substance.jahresfracht ) : 0;

    			var row = $('<tr><td>'+ substance.jahr +'</td><td>'+ substance.kompartiment +'</td><td>'+ substance.jahresfracht +'</td><td>'+ substance.jahresfracht_versehentlich +'</td></tr>');
    			$(table).append(row);
    		});

    		$(li).find('.detail').append( '<p><strong>Ausstoß insgesamt:</strong> ' + jahresfrachtGesamt + ' kg/a</p>');

			$(t).append(li);

    	});

    	updateResultText( t );

    }

    /**
		Updates the sidebar when the company filter is set.
     */
    function updateSidebarWithCompanyFilter( elements ) {
    	var f2 = getFilterTwoText();

    	updateResultDescription( 'Das Unternehmen <strong>'+ f2 +'</strong> hat folgende Schadstoffe ausgestoßen:' );

    	var t = $('<ul></ul>');
    	//	Loop through elements
    	$.each( elements, function( index, element ) {
    		$.each( element.fracht, function( index2, fracht ) {
	    		var li = createListItem();
	    		$(li).find('.head').html( '<i class="fa fa-chain-broken"></i> ' + fracht.stoff_name );
	    		$(li).find('.detail').html( '<p><strong>'+ fracht.jahr +'</strong> wurden <strong>'+ fracht.jahresfracht +'</strong> kg/a ausgestoßen. Davon waren <strong>'+ fracht.jahresfracht_versehentlich +'</strong> kg/a versehentlich.</p>' );

	    		$(t).append(li);
    		});
    	});

    	updateResultText( t );
    }

    function createListItem() {
    	var li = $('<li></li>').html('<div class="head"></div><div class="detail"></div>');
    	$(li).click( function() {
    		$(li).find('.detail').slideToggle(300);
    	});

    	return li;
    }

    /**
		Returns the value set in filter one.
     */
    function getFilterOneText() {
    	return $('#filter-one').find(":selected").text();
    }

    /**
		Returns the value set in filter two.
     */
    function getFilterTwoText() {
    	return $('#filter-two').find(":selected").text();
    }


    function updateResultHeader( text ) {
    	$('#sidebar h1#resultHeader').html( text );
    }

	function updateResultDescription( text ) {
    	$('#sidebar p#resultDesc').html( text );
    }

	function updateResultText( text ) {
    	$('#sidebar p#resultText').html( text );
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


