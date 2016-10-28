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
  minZoom: 3,
  maxZoom: 15,
  scene: './default.yaml'
}).setView([37.7627084265813,-122.43644714355469], 13)


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
      // createMarker: function(i, wp, n) {
      // // if (i === 0) {
      //   return L.marker(wp.latLng, {
      //     draggable: true,
      //     icon: new L.divIcon({
      //       iconSize: [30, 30],
      //       iconAnchor: [15, 15],
      //       className: 'icon-marker waypoint'+i,
      //       html: 'LA'})
      //   });
      // },
      addWaypoints: false,
      // You can get your own Mapzen turn-by-turn & search API key from the Mapzen developer portal (https://mapzen.com/developers/)
      geocoder: L.Control.Geocoder.mapzen('search-WV8RJru')
    }),
    // Draw SVG route while waiting for Tangram to be loaded
    lineOptions: {
      styles: [{ color: '#fcc', opacity: 0.9, weight: 7 }]
    },
    show: (map.getSize().x > 768)? true: false,
    draggableWaypoints: false,
    waypoints: routingData.waypoints,
    router: L.Routing.mapzen('matrix-Yxnzyp9', {costing: routingData.costing}),
    formatter: new L.Routing.mapzenFormatter(),
    summaryTemplate:'<div id="routing-summary" class="info {costing}">{distance}, {time}</div>'
  }).addTo(map);

  L.Routing.errorControl(control).addTo(map);
}
