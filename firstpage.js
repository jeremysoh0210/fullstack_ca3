let json;
$.getJSON('./data.json', function (data) {
    json = data;
});

let locationsData;
$.getJSON('./locations.json', function (data) {
    locationsData = data.locations;
});

let directionsRenderer = null

let placeType = null
let map = null
let infoWindow

window.onload = () => {

    new google.maps.places.Autocomplete(start)

    new google.maps.places.Autocomplete(end)
    new google.maps.places.Autocomplete(search)
    directionsRenderer = new google.maps.DirectionsRenderer()
    directionsRenderer.setMap(map)
    directionsRenderer.setPanel(document.getElementById("directions"))
    calculateRoute("DRIVING")

    // These constants must start at 0
    // These constants must match the data layout in the 'locations' array below
    const CONTENT = 0,
        LATITUDE = 1,
        LONGITUDE = 2;

    let locations = [];
    locationsData.map((location) => {
        locations.push([`<div id=container>
                            <img class=test src=${location.imgUrl}>
                            <div id=text>
                                <h3>${location.title}</h3>
                                <h5>${location.sportsPlayed}</h5>
                                <p>${location.description1}</p>
                                <p>${location.description2}</p>
                            </div>
                        </div>`, location.lat, location.long]);
    });

        let middlePoint = new google.maps.LatLng(json.latitude, json.longitude);

        map = new google.maps.Map(document.getElementById("map"), {
            zoom: 16,
            center: middlePoint,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControlOptions: {
                mapTypeIds: ["roadmap", "hide_poi"]
            }
        })

        for (let i = 0; i < json.type.length; ++i) {
            let request = {
                location: middlePoint,
                radius: json.radius,
                type: json.type[i]
            };

            let service = new google.maps.places.PlacesService(map);
            service.nearbySearch(request, (results, status) => {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    for (let i = 0; i < results.length; i++) {
                        let request2 = {
                            placeId: results[i].place_id
                        };

                        service.getDetails(request2, (results2, status) => {
                            if (status == google.maps.GeocoderStatus.OK && !results2.hasOwnProperty("permanently_closed")) {
                                // console.log(results2);

                                let latitude = results2.geometry.location.lat();
                                let longitude = results2.geometry.location.lng();

                                let marker = new google.maps.Marker({
                                    animation: google.maps.Animation.DROP,
                                    position: new google.maps.LatLng(latitude, longitude),
                                    icon: "http://maps.google.com/mapfiles/kml/pal2/icon32.png",
                                    map: map
                                });

                                google.maps.event.addListener(marker, "click", () => {
                                    infoWindow.setContent(results2.name + "<br><strong>" + (results2.opening_hours.isOpen() ? "Open Now" : "Closed") + "</strong>")
                                    infoWindow.open(map, marker)
                                });
                            }
                        });
                    }
                }
            });

            map.addListener("click", (mapsMouseEvent) => {
                latLng = mapsMouseEvent.latLng.toJSON()
                displayMap()
            })
        }

        hidePointsOfInterestAndBusStops(map);

        let infoWindow = new google.maps.InfoWindow();
        locations.map(location => {
            const svgMarker = {
                path: "M10.453 14.016l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM12 2.016q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
                fillColor: "blue",
                fillOpacity: 0.6,
                strokeWeight: 0,
                rotation: 0,
                scale: 2,
                anchor: new google.maps.Point(15, 30),
            };
            let marker = new google.maps.Marker({
                animation: google.maps.Animation.DROP,
                position: new google.maps.LatLng(location[LATITUDE], location[LONGITUDE]),
                icon: svgMarker,
                map: map
            });
            google.maps.event.addListener(marker, "click", () => {
                infoWindow.setContent(location[CONTENT])
                infoWindow.open(map, marker)
            });
        });

        document.getElementById("places-dropdown").addEventListener("click", (event) => {
            event.stopPropagation();
        });
    }

function displayMap(type) {
            // markers.map((marker) => {
            //     marker.setMap(null);
            // });
            // markers = [];

            console.log(markers);

            if (type != null) {
                placeType = type;

                let qwe = new google.maps.LatLng(52.4796992, -1.9026911)
                let service = new google.maps.places.PlacesService(map)

                service.nearbySearch({
                    location: qwe.toJSON(),
                    radius: 1000,
                    type: placeType
                }, getNearbyServicesMarkers)


                map.setZoom(15)
                map.panTo(qwe)
            }
        }

let markers = []
async function getNearbyServicesMarkers(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                await results.map(result => {
                    createMarker(result);
                })

                markers.map(marker => {
                    console.log(marker);
                    marker.setVisible(true)
                });
            }
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

//draggable origin point and destination point
function calculateRoute(travelMode = "DRIVING") {
            let start = document.getElementById("start").value
            // let midpoint = document.getElementById("midpoint").value

            let end = document.getElementById("end").value

            if (start === "" || end === "") {
                return
            }

            let request = {
                origin: start,
                destination: end,
                travelMode: travelMode
            }

            let waypoints = [];
            let midPointCount = document.getElementById("midpointcount").value
            for (let i = 0; i < midPointCount; i++) {
                let midpoint = document.getElementById(`midpoint${i + 1}`).value


                if (midpoint != "") {

                    waypoints.push({
                        location: midpoint,
                        stopover: true,
                    });
                }
            }
            request.waypoints = waypoints;
            request.optimizeWaypoints = true;

            const directionsService = new google.maps.DirectionsService();
            const directionsRenderer = new google.maps.DirectionsRenderer({
                draggable: true,
                map,
                panel: document.getElementById("directions"),
            });

            directionsRenderer.addListener("directions_changed", () => {
                const directions = directionsRenderer.getDirections();

                if (directions) {
                    computeTotalDistance(directions);
                }
            });

            directionsService.route(request, (route, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                    directionsRenderer.setDirections(route)
                }
            })
        }

function generateMidPointFields() {
            let midPointCount = document.getElementById("midpointcount").value
            document.getElementById("forloop").innerHTML = "";
            for (let i = 0; i < midPointCount; i++) {
                document.getElementById("forloop").innerHTML += `<div class='form-label text-start'>Midpoint ${i + 1}:</div><input class='form-control' id='midpoint${i + 1}' type='text'>`
                setTimeout(() => {
                    new google.maps.places.Autocomplete(document.getElementById(`midpoint${i + 1}`))
                }, 50);
            }
        }

function displayRoute(origin, destination, service, display) {
            service
                .route({
                    origin: origin,
                    destination: destination,
                    waypoints: [
                        { location: "Adelaide, SA" },
                        { location: "Broken Hill, NSW" },
                    ],
                    travelMode: google.maps.TravelMode.DRIVING,
                    avoidTolls: true,
                })
                .then((result) => {
                    display.setDirections(result);
                })
                .catch((e) => {
                    alert("Could not display directions due to: " + e);
                });
        }

function computeTotalDistance(result) {
            let total = 0;
            const myroute = result.routes[0];

            if (!myroute) {
                return;
            }

            for (let i = 0; i < myroute.legs.length; i++) {
                total += myroute.legs[i].distance.value;
            }

            total = total / 1000;
            document.getElementById("total").innerHTML = total + " km";
        }

window.initMap = initMap;

    //click and show nearby icon

    function createMarker(place) {
        infoWindow = new google.maps.InfoWindow()
        let icon = {
            url: place.icon, // url
            scaledSize: new google.maps.Size(30, 30)
        }

        let marker = new google.maps.Marker({
            map: map,
            icon: icon,
            position: place.geometry.location
        })

        google.maps.event.addListener(marker, "click", () => {
            infoWindow.setContent(place.name)
            infoWindow.open(map, marker)
        });

        markers.push(marker);

        // markers.map(marker => marker.setVisible(true))
    }

    function testSearch(searchString) {
        let service = new google.maps.places.PlacesService(map);
        service.findPlaceFromQuery({ query: searchString, fields: ["name", "type", "icon", "geometry"] }, getNearbyServicesMarkers)
    }