$(document).ready(function () {
    drawmap();
    getJsonData();

    function getJsonData() {
        var request = $.ajax({
            url: "http://www.maxbehr.de/opendata/dataset.php?callback=?",
            dataType: "jsonp",
            data: {
                limit: 100
            },
            success: function (data) {
                $.each(data, function (index_element, element) {
                    results.push(element);
                });
                setTimeout(function() {updateElements();}, 500);
            }
        });
    }

    function updateElements(){
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


