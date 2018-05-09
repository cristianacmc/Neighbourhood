      // Model
      var geoLoc =  [

      {
        title: 'Albufeira',
        geoPosition: {lat: 37.089072, lng: -8.24788},
        wikID: 'Albufeira',
        show: true,
        selected: false
      },
      {
        title: 'Aveiro',
        geoPosition: {lat: 37.087199, lng: -8.423702},
        wikID: 'Aveiro,_Portugal',
        link: 'https://en.wikipedia.org/wiki/Lagoa,_Algarve',
        show: true,
        selected: false
      },
      {
        title: 'Lagos',
        geoPosition: {lat: 37.102788, lng: -8.673027},
        wikID: 'Lagos,_Portugal',
        show: true,
        selected: false
      },
      {
        title: 'Vilamoura',
        geoPosition: {lat: 37.088068, lng: -8.118806},
        wikID: 'Vilamoura',
        show: true,
        selected: false
      },
      {
        title: 'Zoomarine',
        geoPosition: {lat: 37.126969, lng: -8.314199},
        wikID: 'Zoomarine',
        show: true,
        selected: false
      },
      {
        title: 'Faro',
        geoPosition: {lat: 37.018116, lng: -7.934693 },
        wikID: 'Faro,_Portugal',
        show: true,
        selected: false
      }
    ];

var map;

function initMap() {  // Create an instance of map and load the map
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.089072, lng: -8.24788},
    zoom: 9,
    mapTypeControl: false,  // Disable  the user to change the map type
  });
  ko.applyBindings(ViewModel);
}

function ViewModel() {
  var self = this;
  self.markers = [];
  var infowindow = new google.maps.InfoWindow();
  self.sortedLocations = ko.observableArray(geoLoc);  // Copy the values of the model and stores in an observable Array
  self.query = ko.observable(''); // Stores user input
  var bounds = new google.maps.LatLngBounds();    // Limits the bounds of the map

  self.sortedLocations().forEach(function(mlocation) {  // Create a marker for each location
    marker = new google.maps.Marker({
      position: mlocation.geoPosition,
      map: map,
      title: mlocation.title,
      link: mlocation.link,
      animation: google.maps.Animation.DROP,
      show: ko.observable(mlocation.show),
      selected: ko.observable(mlocation.selected),
      wikID: mlocation.wikID,
    });
    this.markers.push(marker);  // Pushes each marker into the markers array
  });

  self.search = function() {  // Filter the location
    var searchMarker = self.query();
    infowindow.close();

    if (searchMarker.length === 0) {    // When there is no query
      self.showAllMarkers(true);
    }
    else {
        for (marker in self.markers) {    // Check for what is being queried
            if ( self.markers[marker].title.toLowerCase().indexOf( searchMarker.toLowerCase()) >= 0 )
            {
                self.markers[marker].show(true);
                self.markers[marker].setVisible(true);
            }
            else
            {
                self.markers[marker].show(false);
                self.markers[marker].setVisible(false);
            }
        }
    }
    infowindow.close();
  };

  self.showAllMarkers = function(showVar) {   // All markers will be shown on the map
    for (marker in self.markers) {
      self.markers[marker].show(showVar);
      self.markers[marker].setVisible(showVar);
    }
  };

  self.resetMarkers = function() {    // Reset List
    for (marker in self.markers) {
      self.markers[marker].selected(false);
    }
  };

  self.selectMarker = function(plocation) {
    self.resetMarkers();
    plocation.selected(true);
    self.curentLocation = plocation;

    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&exchars=150&titles=' + plocation.wikID + '&format=json&callback=wikiCallback';
    console.log(wikiUrl);
    const wikiRequestTimeout = setTimeout(function(){
        alert("failed to get wikipedia resources");
    }, 8000);

    $.ajax({  // Add wikipedia api to each marker
        url: wikiUrl,
        dataType: "jsonp",
        crossDomain: true,
        jsonp: "callback",
        }).done(function(data) {
            var excerpt = data.query.pages[Object.keys(data.query.pages)[0]].extract;
            var endPoint = 'https://en.wikipedia.org/wiki/' + plocation.wikID;
            console.log(endPoint)
            var content = '<div>' + '<a href="' + endPoint + ' ">' + '<h5>' + plocation.title + '</h5>' + '</a>' + '</div>'
              + '<p>' + excerpt + '</p>'
              + '<a href="' + endPoint + ' ">' + '<p>' + 'more' + '</p>' + '</a>';
            infowindow.setContent(content);
            //map.setZoom(8);    // Zoom map view
            //map.panTo(plocation.position); // Pan to correct marker when list view item is clicked
            plocation.setAnimation(google.maps.Animation.BOUNCE);   // Bounce marker when list item is clicked
            infowindow.open(map, plocation);    // Open an infowindow and set the animation
            setTimeout(function() {   // Stops the animation on the marker after 2 seconds
              plocation.setAnimation(null);
            }, 2000);
      }).fail(clearTimeout(wikiRequestTimeout));
  }

  for (marker in self.markers) {
    (function(clocation){
      clocation.addListener('click', function(){
        self.selectMarker(clocation);
      });
    }) (self.markers[marker]);
  }

}


function googleError() {    // Show alert when Google Maps request fails
    alert("Failed to load Google Maps");
}