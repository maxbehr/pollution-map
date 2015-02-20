#Pollution Map
##Introduction

This project was carried out as part of the Open Data course at the University of Applied Sciences Berlin. We were supposed to build an application based on open technologies and open data within the semester, accompanying weekly lectures. 

We initially started out with research on possible topics for this project and relatively quickly settled on pollution data provided by thru.de, a service managed by the German Federal Environmental Agency. Since the data was not accessible through any API or any other simple manner, our first task was to download the database they provide in order to be able to take a rough look at the data so that we could decide on how to - and if we even wanted to - proceed with it.

This process resulted in us filtering and selecting certain parts of the data that we deemed interesting enough to be useful for our project. Ultimately, we ended up with a list of companies, including general pieces of information such as the company name and address, coordinates for pinpointing their location on a map, and all their associated pollution data. We then created a PHP script which exported the data into a filtered and structured JSON file, which we would then later access in our web application. 

##Data quality

During our initial analysis of the data, we quickly noticed that there were some issues in terms of how the data was stored, e.g. companies being present multiple times and coordinates being rounded to the first decimal point, which resulted in rough inaccuracies with the map markers.

We were able to get rid of some of these redundancies through our PHP export script, but we kept the coordinates as they were initially. However, we were thinking about implementing a reverse geo-location lookup script where we would use the company addresses to fix the coordinates, but we ended up scratching the idea since it would have been unnecessarily complex and time-consuming while offering only a very small return value. Nevertheless, this would be an idea for future improvements. 

Another issue was that we were not sure how to interpret and treat the data. We do not really know if the emissions occurred evenly throughout the reported year or merely represent single incidents where high emissions occurred (though accidents were marked as such). We also do not know how these emissions spread following their release, so all we can provide is a single point on a map which does not really give any detailed hints on what kind of effects the emissions had on the surrounding areas and what directions these emissions left off to. Something interesting that we could have implemented if if we had had dates associated to the emission results would have been some sort of usage of historic weather data to analyze the wind at the time of the release, for instance.

##Project Realization

We started out by thinking about a design that we wanted to use for our project and went for a minimalistic approach where additional details would become visible when accessing certain UI elements. The project is based all around a full-page OpenStreetMap implementation and two simple navigation areas where data can be filtered and where additional graphs and tables are displayed.

###Languages & Frameworks
####HTML, CSS und JavaScript
####OpenStreetMap

####PHP
We mainly used PHP to aggregate the data from the database from thru.de and filter it. After filtering the data we also used PHP to create the JSON file which contains every company and their emissions.

####External libraries 
#####Chart.js
Handles rendering of the graphs in emission detail view
#####Leaflet
Used to place different markers on the OSM map.
#####jQuery
General JavaScript library.
    

##Future improvements

While our solution works fine generally speaking, we noticed that the performance is not always that great, especially on lower-end devices. This is one of the areas that definitely need improvement and that - for instance - we could handle through some sort of pagination system. 

Another idea was some sort of automated narrative that would give users an introduction to the topic and lead them through a pre-defined story path and point out some especially interesting data sets. Currently, users are pretty much left on their own and have to find their way through the page without any clear goals or hints, which may be a bit confusing initially. This idea would basically make the page more accessible and probably also more interesting and add more of a story to it.

Currently the drop downs which contain the companies and substances are pretty overwhelming because they contain many data entries. Therefore another improvement would be to implement a search field that allows users to filter for certain companies or substances just in the drop downs by performing a text search. This would speed up finding certain entries quite noticeably and generally result in a better user experience.
