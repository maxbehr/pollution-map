var filter1 = "";
var filter2 = "";


function Model() {

    this.results = [];

    this.getJsonData = function (callback) {
        var that = this;

        var request = $.ajax({
            url: "data/dataset.json",
            dataType: "json",
            data: {
                limit: 10000
            },
            success: function (data) {
                $.each(data, function (index_element, element) {
                    that.results.push(element);
                    //console.log( element );
                });

                setTimeout(function () {
                    callback(that.getResults());
                    $('#filterOne ul li:first a').trigger('click');
                }, 500);
            }
        });
    }

    this.getResults = function () {
        return this.results;
    }

    this.getSubstances = function () {

        var substances = [];

        var i = 0;
        $.each(this.results, function (index_element, element) {
            $.each(element.fracht, function (index_element, element) {
                if (element.stoff_name !== null && element.stoff_name.trim() !== "" && substances.indexOf(element.stoff_name) === -1) {
                    substances.push(element.stoff_name);
                }
                i++;
            });

        });

        substances.sort();
        return substances;

    };

    this.getCompanies = function () {

        var companies = [];

        $.each(this.results, function (index_element, element) {
            if (element.name !== null && element.name.trim() !== "" && companies.indexOf(element.name) === -1) {
                companies.push(element.name);
            }

        });

        companies.sort();
        return companies;

    };


    this.getStates = function () {

        var states = [];

        $.each(this.results, function (index_element, element) {
            if (element.bundesland !== null && element.bundesland.trim() !== "" && states.indexOf(element.bundesland) === -1) {
                states.push(element.bundesland);
            }

        });

        states.sort();
        return states;

    };

    this.findCompaniesInState = function (state) {
        var companies = [];

        $.each(this.results, function (index_element, element) {
            if (element.bundesland !== null && element.bundesland.trim() !== "" && element.bundesland === state) {
                companies.push(element);
            }

        });

        return companies;
    }

    this.findCompaniesForSubstance = function (substance) {
        var companies = [];
        var that = this;

        $.each(this.results, function (index_element, element) {
            if (that.hasCompanySubstance(element, substance)) {
                companies.push(element);
            }

        });

        return companies;
    }

    this.findSubstancesForCompany = function (company) {

        var substances = [];

        var id = 0;
        $.each(this.results, function (index_element, element) {
            if (element.name !== null && element.name.trim() !== "" && element.name === company) {
                /*
                 $.each( element.fracht, function (index_fracht, fracht) {
                 fracht.id = id;
                 id++;
                 substances.push( fracht );
                 });
                 */

                substances.push(element);
            }

        });

        return substances;
    }

    this.hasCompanySubstance = function (company, substance) {

        var b = false;

        $.each(company.fracht, function (index, fracht) {

            if (fracht.stoff_name == substance) {
                b = true;
                return false;
            }


        });

        return b;
    }

    this.getSubstanceElementsFromCompany = function (company, substance) {
        var substances = [];

        $.each(company.fracht, function (index, fracht) {
            if (fracht.stoff_name == substance) {
                substances.push(fracht);
            }


        });

        return substances;
    }

    this.getUniqueSubstanceArray = function (element) {
        var substance_arr = {};
        var color_index = 0;
        $.each(element.fracht, function (index, value) {
            substance_arr[value.stoff_name] = {};
            substance_arr[value.stoff_name]['stoff_name'] = value.stoff_name;

            substance_arr[value.stoff_name]['color'] = CHART_COLORS[color_index];
            substance_arr[value.stoff_name]['highlight_color'] = CHART_COLORS[color_index];

            substance_arr[value.stoff_name]['fracht'] = 0;
            substance_arr[value.stoff_name]['fracht'] += parseInt(value.jahresfracht);

            color_index++;
            if (color_index > CHART_COLORS.length) {
                color_index = 0;
            }
        });

        return substance_arr;
    }

}

var CHART_COLORS = ['#F8A09D', '#EA67A9', '#84EDBD', '#2D96A2', '#8288A7', '#C2002B', '#3C7A33', '#6B6BC7', '#DDEE85', '#786AD7', '#89EDA9', '#5051B6', '#B9ACE2', '#322666', '#6CE392', '#ACDCEC', '#818278', '#925716', '#316251', '#D6B5A3', '#057F27', '#010B2E'];

var FILTER = {
    ALL: "Alle Ergebnisse",
    STATE: "Bundesland",
    SUBSTANCE: "Stoff",
    COMPANY: "Unternehmen"
};


$(document).ready(function () {
    drawmap();

    var model = new Model();
    model.getJsonData(init);

    $('#filterTwo').hide();
    $('.fa-arrow-right').hide();

    $("#filterOne").on('click', 'li a', function () {
        filter1 = $(this).text();

        $("#filterOne .btn:first-child").text($(this).text());
        $("#filterOne .btn:first-child").val($(this).text());
        filter2 = "";

        showFilterTwo(filter1 != FILTER.ALL);

        $("#filterTwo .btn:first-child").text('Filter wählen...');
        $("#filterTwo .btn:first-child").val('');

        updateFilterTwo();
        updateSidebar();
    });

    $("#filterTwo").on('click', 'li a', function () {
        filter2 = $(this).text();

        $("#filterTwo .btn:first-child").text($(this).text());
        $("#filterTwo .btn:first-child").val($(this).text());

        updateSidebar();
    });

    function updateSidebar() {
        var selectedFilter = getFilterOneText();
        var selectedFilter2 = getFilterTwoText();

        var arr = [];

        switch (selectedFilter) {
            case FILTER.ALL:
                updateSidebarWithStateFilter(model.getResults());
                updateElements(model.getResults());
                break;

            case FILTER.STATE:

                var elements = model.findCompaniesInState(selectedFilter2);
                updateSidebarWithStateFilter(elements);
                updateElements(elements);
                break;

            case FILTER.SUBSTANCE:

                var elements = model.findCompaniesForSubstance(selectedFilter2);
                updateSidebarWithSubstanceFilter(elements);
                updateElements(elements);
                break;

            case FILTER.COMPANY:

                var elements = model.findSubstancesForCompany(selectedFilter2);
                updateSidebarWithCompanyFilter(elements);
                updateElements(elements);
                break;

            default:
                console.log("Nichts selektiert...");
                break;

        }

        $('#sidebar').fadeIn(500);
        $('#descBox').fadeIn(500);
    }

    /**
     *    Initializes the entire page.
     */
    function init(results) {
        updateFilterTwo();
        updateSidebar();
        // updateElements( model.getResults() );
    }


    /**
     *    Updates the company drop down with all fetched company names.
     */
    function updateFilterTwo() {

        var selectedFilter = getFilterOneText();

        var arr = [];

        switch (selectedFilter) {
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

        updateResultHeader(selectedFilter);

        var select = $('#filterTwo').find('ul');
        $(select).empty();
        $.each(arr, function (val, text) {

            var e = $('<a href="#"></a>').val(val).html(text);

            $(select).append(
                $('<li></li>').append(e)
            );
        });

    }

    /**
     Toggle visibility of Filter 2.
     */
    function showFilterTwo(show) {
        if (show) {
            $('.fa-arrow-right').fadeIn(500);
            $('#filterTwo').fadeIn(500).css('display', 'inline-block');
        } else {
            $('.fa-arrow-right').fadeOut(500);
            $('#filterTwo').fadeOut(500);
        }
    }

    /**
     Updates the sidebar when the state filter is set.
     */
    function updateSidebarWithStateFilter(elements) {
        console.log("updateSidebarWithStateFilter: " + elements.length + " elements");
        var f2 = getFilterTwoText();

        if (filter1 == FILTER.ALL) {
            updateResultDescription('Sie können die Ergebnisse auf der linken Bildschirmseite weiter einschränken.');
        } else if (f2 != "") {
            updateResultDescription('In <strong>' + f2 + '</strong> haben folgende Unternehmen ihren Sitz:');
        } else {
            updateResultDescription('Bitte zweite Filterstufe auswählen.');
        }

        var t = $('<ul id="results"></ul>');
        //	Loop through elements
        $.each(elements, function (index, element) {
            var li = createListItem(element.id);
            $(li).find('.head').html('<i class="fa fa-building-o"></i> ' + element.name);

            $(li).find('.detail').prepend('<p>' + element.anschrift + ', ' + element.bundesland + '</p>');

            $(li).find('.detail').append('<p><strong>Freisetzungen in den Jahren 2007 bis 2012:</strong></p>');

            var table = createTableWithEmissions( element );
            $(li).find('.detail').append( table );

            $(t).append(li);
        });

        updateResultText(t);

    }

    function createTableWithEmissions( element ) {
        var frachten = model.getUniqueSubstanceArray(element);

        var table = $('<table class="table table-bordered table-striped"><tr><th>Stoff</th><th>Ausstoß insgesamt</th></tr></table>')

        $.each(frachten, function (key, val) {
            var fracht = val['fracht'] / 1000;
            var row = $('<tr><td>' + val['stoff_name'] + '</td><td>' + fracht + ' t/a</td></tr>');

            $(table).append(row);
        });

        return table;
    }


    /**
     Updates the sidebar when the substance filter is set.
     */
    function updateSidebarWithSubstanceFilter(elements) {
        console.log("updateSidebarWithSubstanceFilter: " + elements.length + " elements");
        var f2 = getFilterTwoText();

        if (f2 != "") {
            updateResultDescription('<strong>' + f2 + '</strong> wurde von folgenden Unternehmen ausgestoßen:');
        } else {
            updateResultDescription('Bitte zweite Filterstufe auswählen.');
        }

        var t = $('<ul id="results"></ul>');
        //	Loop through elements
        $.each(elements, function (index, element) {
            var substances = model.getSubstanceElementsFromCompany(element, f2);

            var li = createListItem(element.id);

            $(li).find('.head').html('<i class="fa fa-building-o"></i> ' + element.name);

            var table = $('<table class="table table-bordered table-striped"><tr><th>Jahr</th><th>Kompartiment</th><th>Jahresfracht</th><th>versehentlich</th></tr></table>')

            var ausstoss = ( substances.length > 1 ) ? 'Frachtaustöße' : 'Frachtaustoß';
            $(li).find('.detail').html('<p>Insgesamt gab es <strong>' + substances.length + ' ' + ausstoss + '</strong> von <strong>' + f2 + '</strong></p>');
            $(li).find('.detail').append(table);


            var jahresfrachtGesamt = 0;
            $.each(substances, function (index_substance, substance) {
                jahresfrachtGesamt += (substance.jahresfracht !== null) ? parseInt(substance.jahresfracht) : 0;

                var row = $('<tr><td>' + substance.jahr + '</td><td>' + substance.kompartiment + '</td><td>' + substance.jahresfracht + '</td><td>' + substance.jahresfracht_versehentlich + '</td></tr>');
                $(table).append(row);
            });

            $(li).find('.detail').append('<p><strong>Ausstoß insgesamt:</strong> ' + jahresfrachtGesamt + ' kg/a</p>');

            /*
             Diagram
             */
            //	Is at least one substance emission >1
            var unicorn = false;
            $.each( substances, function( index, val ) {
                console.log(val);
                if( val.jahresfracht != null && parseInt(val.jahresfracht) >= 1 )
                    unicorn = true;
            });

            if( unicorn && substances.length > 1 ) {
                var canvas = createChartForSubstance(substances);
                $(li).append(canvas);
            }

            $(t).append(li);

        });

        updateResultText(t);

    }

    /**
     Updates the sidebar when the company filter is set.
     */
    function updateSidebarWithCompanyFilter(elements) {
        var f2 = getFilterTwoText();

        if (f2 != "") {
            updateResultDescription('<strong>' + f2 + '</strong> hat folgende Schadstoffe ausgestoßen:');
        } else {
            updateResultDescription('Bitte zweite Filterstufe auswählen.');
        }

        var t = $('<ul id="results"></ul>');
        //	Loop through elements
        $.each(elements, function (index, element) {
            var li = createListItem(element.id);

            var table = createTableWithEmissions( element );
            $(li).html(table);

            $(t).append(li);
        });

        updateResultText(t);
    }

    function createChartForSubstance(frachten) {

        var labels = [];
        var valueData = [];

        var kompartiment = "";

        $.each(frachten, function (key, val) {
            kompartiment = val['stoff_name'];
            labels.push( val['jahr'] );

            var fracht = (val['jahresfracht'] != null && !isNaN(val['jahresfracht'])) ? parseInt(val['jahresfracht']) : null;
            valueData.push( fracht );
        });

        var data = {
            labels: labels,
            datasets: [
                {
                    label: kompartiment,
                    fillColor: "rgba(220,0,0,0.7)",
                    strokeColor: "rgba(220,220,220,0.8)",
                    highlightFill: "rgba(220,0,0,0.9)",
                    highlightStroke: "rgba(220,220,220,1)",
                    data: valueData
                }
            ]
        };

        var canvas = $('<canvas id="myChart" width="390" height="200"></canvas>');
        var ctx = $(canvas)[0].getContext('2d');
        var myNewChart = new Chart(ctx).Bar(data, {animation : false});

        return canvas;
    }

    function createListItem(id) {
        var li = $('<li id="' + id + '"></li>').html('<div class="head"></div><div class="detail"></div>');
        return li;
    }

    /**
     Returns the value set in filter one.
     */
    function getFilterOneText() {
        return filter1;
    }

    /**
     Returns the value set in filter two.
     */
    function getFilterTwoText() {
        return filter2;
    }


    function updateResultHeader(text) {
        $('#resultHeader').html(text);
    }

    function updateResultDescription(text) {
        $('#resultDesc').html(text);
    }

    function updateResultText(text) {
        $('#sidebar p#resultText').html(text);
    }

    var sidebar = $('#sidebar');

    function markerEnter() {
        hoverId = this.id;
        if (!clickedMarker) {
            markers[hoverId].openPopup();
            $("#results #" + hoverId + ' .detail').addClass('active');
            $("#results #" + hoverId).addClass('hovering');
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                var hoverElem = $('#' + hoverId);
                sidebar.animate({scrollTop: (sidebar.scrollTop() + hoverElem.offset().top - (hoverElem.height() + 80))}, 300);
            }, 500);
        }
    }

    function markerLeave() {
        if (!clickedMarker) {
            markers[hoverId].closePopup();
            $("#results #" + hoverId + ' .detail').removeClass('active');
            $("#results #" + hoverId).removeClass('hovering');
            clearTimeout(timeout);
            hoverId = null;
        }
    }

    function markerClick() {
        var currentId = this.id;
        if (currentId == clickedMarker) {
            $("#results #" + clickedMarker).removeClass('clicked');
            $("#results #" + clickedMarker).addClass('hovering');
            clickedMarker = null;
        } else {
            if (clickedMarker) {
                $("#results #" + clickedMarker + ' .detail').removeClass('active');
                $("#results #" + clickedMarker).removeClass('clicked hovering');
            }
            markers[currentId].openPopup();
            $("#results #" + currentId + ' .detail').addClass('active');
            $("#results #" + currentId).addClass('clicked');
            clickedMarker = currentId;
            timeout = setTimeout(function () {
                var clickedElem = $("#" + clickedMarker);
                sidebar.animate({scrollTop: (sidebar.scrollTop() + clickedElem.offset().top - (clickedElem.height() + 80))}, 300);
            }, 600);
        }
    }

    function updateElements(results) {
        clearResults();
        $.each(results, function (index_element, element) {
            var currentMarker = L.marker([element.wgs84_y, element.wgs84_x], {icon: getIcon(element.bundesland)});
            currentMarker.addTo(map);
            currentMarker.bindPopup("<b>"+element.name+"</b><br>"+element.anschrift, {
                offset: new L.Point(0, -20),
                closeButton: false
            });
            currentMarker.on('mouseover', markerEnter);
            currentMarker.on('mouseout', markerLeave);
            currentMarker.on('click', markerClick);
            currentMarker.id = element.id;
            markers[element.id] = currentMarker;
        });

        $("#sidebar li").on("mouseenter", function (event) {
            hoverId = $(this).attr('id');
            if (!clickedMarker) {
                markers[hoverId].openPopup();
                $("#results #" + hoverId + ' .detail').addClass('active');
                $("#results #" + hoverId).addClass('hovering');
            }
        });

        $("#sidebar li").on("mouseleave", function (event) {
            if (!clickedMarker) {
                markers[hoverId].closePopup();
                $("#results #" + hoverId + ' .detail').removeClass('active');
                $("#results #" + hoverId).removeClass('hovering');
                hoverId = null;
            }
        });

        $("#sidebar li").on("click", function (event) {
            event.stopPropagation();
            var currentId = $(this).attr('id');
            if (currentId == clickedMarker) {
                $("#results #" + clickedMarker).removeClass('clicked');
                $("#results #" + clickedMarker).addClass('hovering');
                clickedMarker = null;
            } else {
                if (clickedMarker) {
                    $("#results #" + clickedMarker + ' .detail').removeClass('active');
                    $("#results #" + clickedMarker).removeClass('clicked hovering');
                }
                markers[currentId].openPopup();
                $("#results #" + currentId + ' .detail').addClass('active');
                $("#results #" + currentId).addClass('clicked hovering');
                clickedMarker = currentId;
            }
        });
    }

    function getIcon(bundesland) {
        var icon = null;
        switch (bundesland) {
            case 'Bayern':
                icon = L.icon({
                    iconUrl: 'js/images/bayern.png',
                    shadowUrl: 'js/images/marker-shadow.png',
                    iconSize: [30, 39],
                    shadowSize: [41, 41],
                    iconAnchor: [15, 0],
                    shadowAnchor: [4, 1]
                });
                break;
            case 'Berlin':
                icon = L.icon({
                    iconUrl: 'js/images/berlin.png',
                    shadowUrl: 'js/images/marker-shadow.png',
                    iconSize: [30, 49],
                    shadowSize: [41, 41],
                    iconAnchor: [15, 0],
                    shadowAnchor: [4, 1]
                });
                break;
            case 'Brandenburg':
                icon = L.icon({
                    iconUrl: 'js/images/brandenburg.png',
                    shadowUrl: 'js/images/marker-shadow.png',
                    iconSize: [35, 41],
                    shadowSize: [41, 41],
                    iconAnchor: [17, 0],
                    shadowAnchor: [2, 1]
                });
                break;
            case 'Bremen':
                icon = L.icon({
                    iconUrl: 'js/images/bremen.png',
                    shadowUrl: 'js/images/marker-shadow.png',
                    iconSize: [35, 47],
                    shadowSize: [41, 41],
                    iconAnchor: [17, 0],
                    shadowAnchor: [2, 0]
                });
                break;
            case 'Baden-Württemberg':
                icon = L.icon({
                    iconUrl: 'js/images/bw.png',
                    shadowUrl: 'js/images/marker-shadow.png',
                    iconSize: [30, 41],
                    shadowSize: [41, 41],
                    iconAnchor: [15, 0],
                    shadowAnchor: [4, 1]
                });
                break;
            case 'Hamburg':
                icon = L.icon({
                    iconUrl: 'js/images/hamburg.png',
                    shadowUrl: 'js/images/marker-shadow.png',
                    iconSize: [31, 43],
                    shadowSize: [41, 41],
                    iconAnchor: [15, 0],
                    shadowAnchor: [4, 1]
                });
                break;
            case 'Hessen':
                icon = L.icon({
                    iconUrl: 'js/images/hessen.png',
                    shadowUrl: 'js/images/marker-shadow.png',
                    iconSize: [35, 42],
                    shadowSize: [41, 41],
                    iconAnchor: [15, 0],
                    shadowAnchor: [4, 1]
                });
                break;
            case 'Mecklenburg-Vorpommern':
                icon = L.icon({
                    iconUrl: 'js/images/mv.png',
                    shadowUrl: 'js/images/marker-shadow.png',
                    iconSize: [40, 43],
                    shadowSize: [41, 41],
                    iconAnchor: [15, 0],
                    shadowAnchor: [0, 0]
                });
                break;
            case 'Niedersachsen':
                icon = L.icon({
                    iconUrl: 'js/images/niedersachsen.png',
                    shadowUrl: 'js/images/marker-shadow.png',
                    iconSize: [36, 41],
                    shadowSize: [41, 41],
                    iconAnchor: [15, 0],
                    shadowAnchor: [1, 1]
                });
                break;
            case 'Nordrhein-Westfalen':
                icon = L.icon({
                    iconUrl: 'js/images/nrw.png',
                    shadowUrl: 'js/images/marker-shadow.png',
                    iconSize: [36, 41],
                    shadowSize: [41, 41],
                    iconAnchor: [15, 0],
                    shadowAnchor: [4, 1]
                });
                break;
            case 'Rheinland-Pfalz':
                icon = L.icon({
                    iconUrl: 'js/images/rp.png',
                    shadowUrl: 'js/images/marker-shadow.png',
                    iconSize: [34, 42],
                    shadowSize: [41, 41],
                    iconAnchor: [15, 0],
                    shadowAnchor: [4, 1]
                });
                break;
            case 'Saarland':
                icon = L.icon({
                    iconUrl: 'js/images/saarland.png',
                    shadowUrl: 'js/images/marker-shadow.png',
                    iconSize: [35, 43],
                    shadowSize: [41, 41],
                    iconAnchor: [15, 0],
                    shadowAnchor: [4, 1]
                });
                break;
            case 'Sachsen':
                icon = L.icon({
                    iconUrl: 'js/images/sachsen.png',
                    shadowUrl: 'js/images/marker-shadow.png',
                    iconSize: [36, 40],
                    shadowSize: [41, 41],
                    iconAnchor: [15, 0],
                    shadowAnchor: [1, 1]
                });
                break;
            case 'Sachsen-Anhalt':
                icon = L.icon({
                    iconUrl: 'js/images/sachsenanhalt.png',
                    shadowUrl: 'js/images/marker-shadow.png',
                    iconSize: [35, 42],
                    shadowSize: [41, 41],
                    iconAnchor: [15, 0],
                    shadowAnchor: [4, 1]
                });
                break;
            case 'Schleswig-Holstein':
                icon = L.icon({
                    iconUrl: 'js/images/sh.png',
                    shadowUrl: 'js/images/marker-shadow.png',
                    iconSize: [35, 41],
                    shadowSize: [41, 41],
                    iconAnchor: [15, 0],
                    shadowAnchor: [4, 1]
                });
                break;
            case 'Thüringen':
                icon = L.icon({
                    iconUrl: 'js/images/th.png',
                    shadowUrl: 'js/images/marker-shadow.png',
                    iconSize: [35, 41],
                    shadowSize: [41, 41],
                    iconAnchor: [15, 0],
                    shadowAnchor: [4, 1]
                });
                break;
            default:
                icon = L.icon({
                    iconUrl: 'js/images/marker-icon.png',
                    shadowUrl: 'js/images/marker-shadow.png',
                    iconSize: [25, 41],
                    shadowSize: [41, 41],
                    iconAnchor: [12, 0],
                    shadowAnchor: [12, 0]
                });
                break;
        }
        return icon;
    }

    function clearResults() {
        if (markers.length > 0) {
            $.each(markers, function (index, marker) {
                if (marker != undefined) {
                    map.removeLayer(marker);
                }
            });
            markers = [];
        }

    }
});


