var routingData = {};

// Routing Machine's control & plan
var control;
var plan;

var map = L.Mapzen.map('map', {
  minZoom: 4,
  maxZoom: 10,
  scene: './default.yaml'
});


// Tangram Style objects;
var ants = {
  "base": "lines",
  "blend": "overlay",
  "texcoords": true,
  "animated": true,
  "shaders": {
    "blocks": {
      "color": "color.a = step(.5,fract(u_time-v_texcoord.y*.5));"
    }
  }
};

var routeStyle =  {
  // Change color for route line here
  "lines": {
    "color": "#f8b400",
    "order": 1000,
    "width": "7px"
  },
  "ants": {
    "color": '#B22C18',
    "order": 300000,
    "width": "6px"
  }
};


var data = horrorArr;//JSON.parse(request.responseText);
var waypoints = [];
var names = [];
var addrs = [];
// Set up first waypoints data from geojson
for (var i = 0; i< data.length; i++) {
  var place = data[i];
  waypoints.push(L.latLng(place.lat, place.lng));
  names.push(place.movie);
  addrs.push(place.address);
}




// Extra display for movie names and address

var displayList;
var placeList = L.Control.extend({
    options: { position: 'topright' },
    onAdd: function (map) {
      if(!displayList)
      {
        displayList = L.DomUtil.create('div');
        displayList.classList.add('place-names');
        displayList.appendChild(makePlaceUl(names));
      }

      return displayList;
    }
  });

map.addControl(new placeList());


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
            iconSize: [60, 70],
            iconAnchor: [30, 70],
            className: 'point-marker',
            html: '<div class="place-p">'+names[i]+'</div>'})
        });
      },
      addWaypoints: false
    }),
    // Draw SVG route while waiting for Tangram to be loaded
    lineOptions: {
      styles: [{ color: '#FFBE12', opacity: 0.7, weight: 7 }]
    },
    show: (map.getSize().x > 768)? true: false,
    waypoints: routingData.waypoints,
    router: L.Routing.mapzen('matrix-Yxnzyp9', {costing: routingData.costing}),
    formatter: new L.Routing.mapzenFormatter(),
    pointMarkerStyle:   {radius: 7,color: '#333',fillColor:'#B22C18',opacity: 1,fillOpacity: 0.9},
    summaryTemplate:'<div id="routing-summary" class="info {costing}">{distance}, {time}</div>'
  }).addTo(map);

  // L.Routing.errorControl(control).addTo(map);
}



map.on('tangramloaded', function (e) {
  var layer = e.tangramLayer;
  var scene = e.tangramLayer.scene;

  control.options.routeLine = function(route, options) {
    // Make SVG Line (almost) transparent
    // So that Tangram layer takes visual priority
    options.styles = {
      styles: [{ color: 'white', opacity: 0.01, weight: 9 }]
    };

    var coordinatesGeojson= {
      type: 'LineString',
      coordinates: flipped(route.coordinates)
    };

    var routeSource = {};
    routeSource.type = "FeatureCollection";
    routeSource.features = [];
    routeSource.features.push({
      type: "Feature",
      properties: {},
      geometry: coordinatesGeojson
    });

    var routeObj = {
      "routelayer": routeSource
    }

    var routeSourceName = 'routes';

    scene.config.styles.ants = ants;
    scene.config.layers.routelayer = { 'data': { 'source': routeSourceName }, 'draw': routeStyle };

    scene.setDataSource(routeSourceName, {
      type: 'GeoJSON',
      data: routeObj
    });

    return L.Routing.mapzenLine(route, options);
  }
  // Route one mroe time so we can see tangram route line
  control.route();
});


function makePlaceUl (namearr) {
  var ulNode = document.createElement('ul');
  for ( var i = 0; i < namearr.length; i++) {
    ulNode.appendChild(makePlaceLi(namearr[i], addrs[i]));
  }
  return ulNode;
}

function makePlaceLi (name, addr) {
  var lNode = document.createElement('li');
  lNode.classList.add('place')
  var addrNode = document.createElement('div');
  addrNode.classList.add('place-addr');
  addrNode.innerHTML = addr;
  lNode.innerHTML = name;
  lNode.appendChild(addrNode);
  return lNode;
}

function flipped(coords) {
  var flipped = [];
  for (var i = 0; i < coords.length; i++) {
    var coord = [];
    coord.push(coords[i].lng);
    coord.push(coords[i].lat);
    flipped.push(coord);
  }
  return flipped;
}