/* eslint-disable*/
export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZmVkZXJpY29tcGMiLCJhIjoiY2t1NGdoc3o0NHFoeDJvcDNzbXNmOGZiMyJ9.Js-qZOl3uDa7LWimioejbA';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/federicompc/cku4ibl4l0xg219qjv8xc7qpl',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: { top: 200, bottom: 150, left: 200, right: 200 },
  });
};
