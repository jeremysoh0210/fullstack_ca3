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
                  <img class=test src=https://resources.cwg-qbr.pulselive.com/photo-resources/2022/02/08/e59b4d62-0ce8-407f-9bd6-2671b88753df/Alexander-Stadium-Mockup.jpg?width=966>
                  <div id=text>
                      <h3>Alexander Stadium</h3>
                      <p>Located in Perry Barr, just outside of the city centre, the stadium will host Athletics and the Games opening and closing ceremonies.</p>
                      <p>The stadium is currently being redeveloped for the Games. The works will see improved pedestrian routes, installation of a changing places toilet and improved accessible seating options.</p>
                  </div>
              </div>`, 52.5272241, -1.9074096],
        [`<div id=container>
                  <img class=test src=https://resources.cwg-qbr.pulselive.com/photo-resources/2022/02/08/3fe090bd-7a90-455c-8690-41cbb9d0de32/Arena-Birmingham.jpg?width=966>
                  <div id=text>
                      <h3>Arena Birmingham</h3>
                      <p>The venue has step free access and existing facilities such as a changing places toilet.</p>
                      <p>Arena Birmingham will host artistic and rhythmic gymnastics. The venue is in the middle of the city centre with excellent public transport links and close to other attractions.</p>
                  </div>
              </div>`, 52.479717449999995, -1.915034421788946],

        [`<div id=container>
                  <img class=test src=https://resources.cwg-qbr.pulselive.com/photo-resources/2022/02/08/b4f53377-3cfa-476b-ae1e-e806616388fc/image001.jpg?width=966>
                  <div id=text>
                      <h3>Cannock Chase Forest</h3>
                      <p>Cannock Chase is a large forest which is part of Forestry England.</p>
                      <p>At this venue there are some hard-standing pathways which lead to the outdoor ticketed spectator area which is a predominately grassed area. The trails on the Chase outside of this area may become muddy and wet in bad weather so may not be suitable for those with mobility scooters or those with limited mobility.</p>
                  </div>
              </div>`, 52.7521955, -1.973821430582701],
        [`<div id=container>
                  <img class=test src=https://resources.cwg-qbr.pulselive.com/photo-resources/2022/04/07/f76f4ec9-d58a-496c-8f1b-351d3a6b4378/Ricoh_RT-13-July.jpg?width=966>
                  <div id=text>
                      <h3>Coventry Stadium & Arena</h3>
                      <p>Judo and Wrestling will take place in the arena, which is an indoor venue. Rugby 7s will take place in the stadium, which is outdoor with some cover.</p>
                      <p>Externally there are some changes in level with ramped access round the building. Internally the venue has step free access and will have a range of existing accessible facilities and temporary facilities such as a changing places toilet.</p>
                  </div>
              </div>`, 52.44816495, -1.4971183945757918],
        [`<div id=container>
                  <img class=test src=https://resources.cwg-qbr.pulselive.com/photo-resources/2022/02/08/8ca38cef-bfed-444f-8758-ea88d62f8729/Edgbaston-2-.jpg?width=966>
                  <div id=text>
                      <h3>Edgbaston Stadium</h3>
                      <p>Close to Birmingham city centre, Edgbaston Cricket Ground is a regular host of both domestic and international cricket.</p>
                      <p>The ground is outdoor with some cover, with accessible routes around the ground. There will be a range of existing and temporary accessible facilities at this venue such as a changing places toilet.</p>
                  </div>
              </div>`, 52.45596485, -1.9038627142168278],

        [`<div id=container>
                  <img class=test src=https://resources.cwg-qbr.pulselive.com/photo-resources/2022/02/08/b4f53377-3cfa-476b-ae1e-e806616388fc/image001.jpg?width=966>
                  <div id=text>
                      <h3>Lee Valley Velopark</h3>
                      <p>The indoor cycling center was one of the venues used for the London 2012 Olympic and Paralympic Games.</p>
                      <p>Located on Queen Elizabeth Olympic Park, the venue has step free access, good public transport links and existing facilities such as a changing places toilet.</p>
                  </div>
              </div>`, 51.550376799999995, -0.015239363509253154]
    ]

    let middlePoint = new google.maps.LatLng(json.latitude, json.longitude);

    let map = new google.maps.Map(document.getElementById("map"), {
        zoom: 16,
        center: middlePoint,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControlOptions: {
            mapTypeIds: ["roadmap", "hide_poi"]
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
                // console.log(results[i].geometry.location.lat());
                console.log(results[i]);

                let request2 = {
                    placeId: results[i].place_id
                };
                service.getDetails(request2, (results2, status) => {
                    
                    let marker = new google.maps.Marker({
                        animation: google.maps.Animation.DROP,
                        position: new google.maps.LatLng(results2.geometry.location.lat(), results2.geometry.location.lng()),
                        icon: "http://maps.google.com/mapfiles/kml/pal2/icon32.png",
                        map: map
                    });
                    google.maps.event.addListener(marker, "click", () => {
                        infoWindow.setContent(results2.name)
                        infoWindow.open(map, marker)
                    });
                });
            }
        }
    });

    hidePointsOfInterestAndBusStops(map);

    let infoWindow = new google.maps.InfoWindow();
    locations.map(location => {
        let marker = new google.maps.Marker({
            animation: google.maps.Animation.DROP,
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