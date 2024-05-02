$(document).ready(function() {

  $('#fullpage').fullpage({
    licenseKey: 'OPEN-SOURCE-GPLV3-LICENSE',
    navigation: true,
    touchSensitivity: 200,
    normalScrollElements: '.scrollable'
  });

  var TOWNS = [];
  var LAYERS = {};

  var map = L.map('my-map', {
    zoomControl: false,
    scrollWheelZoom: false,
    attributionControl: false,
    backgroundColor: null,
  });

  map.keyboard.disable();
  map.dragging.disable();
  map.boxZoom.disable();
  map.touchZoom.disable();
  map.doubleClickZoom.disable();

  var geoJsonLayer;

  function centerMap() {
    map.fitBounds(geoJsonLayer.getBounds());
  }

  function style(feature) {
    return {
      fillColor: 'rgba(255,255,255,0.1)',
      weight: 1,
      opacity: 0.8,
      color: 'white',
      fillOpacity: 1,
    };
  }

  // This highlights the polygon on hover, also for mobile
  function highlightFeature(e) {
    resetHighlight(e);
    var layer = e.target;
    var town = layer.feature.properties.Town;
    layer.setStyle( {fillColor: 'rgba(255,255,255,0.9)'} );
    layer.bindTooltip(town, {direction: 'top'}).openTooltip();

    $('#my-map-list li:contains(' + town + ')').addClass('highlighted');
  }

  // This resets the highlight after hover moves away
  function resetHighlight(e) {
    geoJsonLayer.setStyle(style);
    $('#my-map-list li.highlighted').removeClass('highlighted');
  }

  function clickFeature(e) {
    openPDF( e.target.feature.properties.Town )
  }

  // This instructs highlight and reset functions on hover movement
  function onEachFeature(feature, layer) {

    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: clickFeature,
    });

    var town = layer.feature.properties.Town;

    TOWNS.push(town);
    LAYERS[town] = layer;
  }

  function populateTowns() {
    for (var i = 0; i < TOWNS.length; i++) {
      $('#my-map-list').append('<li>' + TOWNS[i] + '</li>');
    }

    $('#my-map-list li').click(function() {
      openPDF( $(this)[0].innerText );
    });

    $('#my-map-list li').mouseover(function() {
      var town = $(this)[0].innerText;
      var layer = LAYERS[town];
      layer.fireEvent('mouseover');
    }).mouseleave(function() {
      var town = $(this)[0].innerText;
      var layer = LAYERS[town];
      layer.fireEvent('mouseout');
    });
  }

  function openPDF(town) {
    var year = $('select[name="year"]').val();
    var townSlug = town.toLowerCase().replace(' ', '-');

    if (year === '2023' || year === '2021' || year === '2024') {
      window.open('https://s3-us-west-2.amazonaws.com/cerc-pdfs/' + year + '/' + town.replace(' ', '-') + '.pdf');
    }
    else {
      window.open('https://s3-us-west-2.amazonaws.com/cerc-pdfs/' + year + '/' + townSlug + '-' + year + '.pdf');
    }
  }

  $.getJSON('static/ct.geojson', function(geojson) {
    geoJsonLayer = L.geoJson(geojson, {
      style: style,
      onEachFeature: onEachFeature
    }).addTo(map);

    TOWNS = TOWNS.sort();
    populateTowns();
    centerMap();
  });

  $('#home').click(function() {
    $('#fp-nav a')[1].click();
  });

  $(window).resize(function() {
    centerMap();
  });



});
