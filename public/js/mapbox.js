/*eslint-disable*/

//We disable it because eslint is configured according to NODE.js and not JS.

//This is a JavaScript file that will run on the client Side. We are making a mapbox in this file for the project.

// const mapBox = document.getElementById('map');
const locations = JSON.parse(document.getElementById('map').dataset.locations);
//UNCOMMENT the below code to see the map.
// mapboxgl.accessToken =
//   'pk.eyJ1IjoidGhlbmlraGlsc2V0aDEiLCJhIjoiY2xqOTE3aXlsMHJvdzNpcG03c2pqMWZnNiJ9.HzKkecfhX1ZITOwoJFfXjQ';
// var map = new mapboxgl.Map({
//   container: 'map', //It will set the map to the element with ID set to 'map'. That element is present in tour.pug
//   style: 'mapbox://styles/thenikhilseth1/clj92hrfm00ba01ny66sw3oh2'
// });

const bounds = new mapboxgl.LngLatBounds();

// if (mapBox) {
//   const locations = JSON.parse(
//     document.getElementById('map').dataset.locations
//   );
//   console.log(locations);
// }

locations.forEach(loc => {
  // console.log(loc);
  //Create a marker
  const el = document.createElement('div');
  el.className = 'marker';
  //Add Marker////////////////////(Green colour ke markers (OPTIONAL))
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom'
  })
    .setLngLat(loc.coordinates)
    .addTo(map);
  // Add popup//////////////////(Markers ke upr description dene keliye (OPTIONAL))
  new mapboxgl.Popup({
    offset: 30
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  // Extend map bounds to include current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100
  }
});
