$(document).ready(function() {
    drawmap();

function getJsonData() {
    $.ajax({
        url:"http://www.maxbehr.de/opendata/dataset.php",
        dataType: 'jsonp',
        success:function(json){
            alert("Success");
        },
        error:function(){
            alert("Error");
        }
    });
}


