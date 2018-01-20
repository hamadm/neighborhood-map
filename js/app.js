var myLocations = [
    {
        name: 'Kingdom Tower',
        address: {
            lat: 24.7114458 ,
            lng: 46.674386700000014,
        },
        content: '',
        marker: null,
    },
    {
        name: 'Al Faisaliyah Center',
        address: {
            lat: 24.6895357 ,
            lng: 46.68583269999999,
        },
        content: '',
        marker: null,
    },
    {
        name: 'King Saud University',
        address: {
            lat: 24.716241 ,
            lng: 46.61910779999994,
        },
        content: '',
        marker: null,
    },
    {
        name: 'Eataly',
        address: {
            lat: 24.7040945 ,
            lng: 46.702693400000044,
        },
        content: '',
        marker: null,
    },
    {
        name: 'Al Bujairi',
        address: {
            lat: 24.7361215 ,
            lng: 46.57496149999997,
        },
        content: '',
        marker: null,
    },
];
setContent();
// building the model
function AppViewModel() {
    this.filter = ko.observable('');
    this.locations = ko.computed(function() {
        var filter = this.filter();
        filter = filter.trim().toLowerCase();
        if(filter === ''){
            if(map)
                resetMarkers(myLocations);
            return myLocations;
        }   
        else {
            var array = myLocations.filter(function(location){
                return location.name.toLowerCase().indexOf(filter) != -1;
            });
            resetMarkers(array);
            return array;
        }
    }, this);
}

var map;
var infowindow;
ko.applyBindings(new AppViewModel());

function initMap() {
    // initalize the map
    var uluru = {lat: -25.363, lng: 131.044};
    map= new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lat: myLocations[0].address.lat, lng: myLocations[0].address.lng}
    });
    infowindow = new google.maps.InfoWindow();
    addMarkers();
}

// adding all markers to the map and assigning them to the object
function addMarkers()
{    
    // add the markers to mylocations
    for(var i=0; i<myLocations.length; i++){
        var marker = new google.maps.Marker({
            position: {lat: myLocations[i].address.lat, lng: myLocations[i].address.lng},
            map: map,
            animation: google.maps.Animation.DROP,
        });
        myLocations[i].marker = marker;
    }

}
// to rest the markers if they are removed from the filtering of the list
function resetMarkers(locations)
{
    for(var i=0; i<myLocations.length; i++){
        if(myLocations[i].marker)
            myLocations[i].marker.setMap(null);
    }
    for(i=0; i<locations.length; i++){
        if(locations[i].marker)
            locations[i].marker.setMap(map);
    }
}
function openInfo(marker)
{
    google.maps.event.trigger(marker, 'click');
}

// to set the content of the markers for each location from a 3rd pary service (Wikipedia)
function setContent()
{
    myLocations.forEach(function(location){
        $.ajax({
            type: "GET",
            url: "http://en.wikipedia.org/w/api.php?action=opensearch&search="+location.name+"&format=json&callback=?",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            success: function (data) {
                console.log(data);
                location.content = data[3][0];
                // add infowindow
                if(location.marker){
                    location.marker.addListener('click', function() {
                        if (location.marker.getAnimation() !== null) {
                            location.marker.setAnimation(null);
                        } else {
                            location.marker.setAnimation(google.maps.Animation.BOUNCE);
                            window.setTimeout(function() {
                                location.marker.setAnimation(null);
                            }, 1500);
                        }
                        // setting the content into info window
                        infowindow.setContent("<strong>"+location.name +"</strong><br><a href='"+location.content+"'>Click here for Wikipedia post</a>");
                        infowindow.open(map, location.marker);
                    });
                }
            },
            error: function (errorMessage) {
                if(location.marker){
                    location.marker.addListener('click', function() {
                        infowindow.setContent("Error Loading data");
                        infowindow.open(map, location.marker);
                    });
                }
                alert(errorMessage.statusText +" API couldn't be called due to internet issue");
            }
        });
    });
}

function error(){
    alert("Error Loading the map");
}