let json;
$.getJSON('./data.json', function (data) {
    json = data;
});

window.onload = () => {
    // These constants must start at 0
    // These constants must match the data layout in the 'locations' array below
    const CONTENT = 0,
        LATITUDE = 1,
        LONGITUDE = 2

    let locations = [
        [`<div id=container>
                  <img class=test src=https://ichef.bbci.co.uk/news/976/cpsprodpb/C470/production/_117488205_48103727416_9f28f00454_k.jpg>
                  <div id=text>
                      <p>Birmingham, UK</p>
                  </div>
              </div>`, 52.4796992, -1.9026911],
        [`<div id=container>
                  <img class=test src=https://eu-assets.simpleview-europe.com/birmingham-visit/imageresizer/?image=%2Fdmsimgs%2FSnowHill_website_2073026433.jpg&action=ProductDetailProFullWidth>
                  <div id=text>
                      <p>Birmingham, Snow Hill</p>
                  </div>
              </div>`, 52.48241432442932, -1.8996047973632815],

        [`<div id=container>
                  <img class=test src=https://cdn.prgloo.com/media/c26eef6ad03940f9803666b2b11d77d0.jpg?width=1135&height=960>
                  <div id=text>
                      <p>Birmingham, New Street</p>
                  </div>
              </div>`, 52.477631239561276, -1.8988752365112307]
    ]

    let middlePoint = new google.maps.LatLng(json.latitude, json.longitude);

    let map = new google.maps.Map(document.getElementById("map"), {
        zoom: 16,
        center: middlePoint,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControlOptions: {
            mapTypeIds: ["roadmap", "hybrid", "hide_poi"]
        }
    })

    let request = {
        location: middlePoint,
        radius: json.radius,
        type: json.type
    };

    let service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, (results, status) => {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                console.log(results[i].geometry.location.lat());

                let request2 = {
                    placeId: results[i].place_id
                };
                
                service.getDetails(request2, (results2, status) => {
                    let marker = new google.maps.Marker({
                        position: new google.maps.LatLng(results2.geometry.location.lat(), results2.geometry.location.lng()),
                        icon: "http://maps.google.com/mapfiles/kml/pal2/icon32.png",
                        map: map
                    });
                    google.maps.event.addListener(marker);
                });
            }
        }
    });

    hidePointsOfInterestAndBusStops(map);

    let infoWindow = new google.maps.InfoWindow();

    locations.map(location => {
        let marker = new google.maps.Marker({
            position: new google.maps.LatLng(location[LATITUDE], location[LONGITUDE]),
            icon: "https://maps.google.com/mapfiles/kml/shapes/parking_lot_maps.png",
            map: map
        });
        google.maps.event.addListener(marker, "click", () => {
            infoWindow.setContent(location[CONTENT])
            infoWindow.open(map, marker)
        });
    });
}


function hidePointsOfInterestAndBusStops(map) {
    let styles = [
        {
            "featureType": "poi",
            "stylers": [{ "visibility": "off" }]
        },
        {
            featureType: "transit",
            stylers: [{ visibility: "off" }],
        }
    ]

    let styledMapType = new google.maps.StyledMapType(styles, { name: "POI Hidden", alt: "Hide Points of Interest" })
    map.mapTypes.set("hide_poi", styledMapType)

    map.setMapTypeId("hide_poi")
}            