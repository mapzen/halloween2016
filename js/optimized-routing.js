// get hash first
//var hashControl = new HashControl();
//var noHash = false;
var routingData = {};
var routingCount = 0;

// setup to compare old and new index
var oldPoints = [];
var newPoints = [];

var tangramLoaded = false;

// Routing Machine's control & plan
var control;
var plan;

var map = L.Mapzen.map('map', {
  minZoom: 4,
  maxZoom: 10,
  scene: './default.yaml'
}).setView([37.7627084265813,-100.43644714355469], 5)

L.Mapzen.hash({ map: map });


var data = horrorArr;//JSON.parse(request.responseText);
var waypoints = [];
var names = [];
var emojis = [];
// Set up first waypoints data from geojson
for (var i = 0; i< data.length; i++) {
  var place = data[i];
  waypoints.push(L.latLng(place.lat, place.lng));
  names.push(place.movie);
}


routingData.waypoints = waypoints;
routingData.initialName = names;
routingData.costing = 'auto';

setupRoutingControl();


function setupRoutingControl () {
  // These are emojis for markers
//  var emojis = ['👊', '😃', '🌽', '⭐', '🐟', '🐴', '🐷', '🐔', '😜', '🔥', '🐶', '😮', '👍', '😎', '🏄' ];
  control = L.Routing.control({
    plan: L.Routing.plan(routingData.waypoints, {
      draggableWaypoints: false,
      createMarker: function(i, wp, n) {
      // if (i === 0) {
        return L.marker(wp.latLng, {
          draggable: false,
          icon: new L.divIcon({
            iconSize: [50, 30],
            iconAnchor: [15, 15],
            className: 'point-marker',
            html: names[i]})
        });
      },
      addWaypoints: false
    }),
    // Draw SVG route while waiting for Tangram to be loaded
    lineOptions: {
      styles: [{ color: '#FFBE12', opacity: 0.9, weight: 7 }]
    },
    show: (map.getSize().x > 768)? true: false,
    waypoints: routingData.waypoints,
    router: L.Routing.mapzen('matrix-Yxnzyp9', {costing: routingData.costing}),
    formatter: new L.Routing.mapzenFormatter(),
    summaryTemplate:'<div id="routing-summary" class="info {costing}">{distance}, {time}</div>'
  }).addTo(map);

  L.Routing.errorControl(control).addTo(map);
}
