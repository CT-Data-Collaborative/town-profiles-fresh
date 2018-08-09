$(document).ready(function() {

  $('#fullpage').fullpage({
    licenseKey: 'OPEN-SOURCE-GPLV3-LICENSE',
    navigation: true,
    touchSensitivity: 200,
  });

  var TOWNS = [];

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

  $(window).resize(function() {
    centerMap();
    populateTowns();
  });

  function style(feature) {
    return {
      fillColor: 'rgba(255,255,255,0.2)',
      weight: 1,
      opacity: 0.8,
      color: 'white',
      fillOpacity: 0.8
    };
  }

  // This highlights the polygon on hover, also for mobile
  function highlightFeature(e) {
    resetHighlight(e);
    var layer = e.target;
    layer.setStyle( {fillColor: 'rgba(255,255,255,0.9)'} );
    layer.bindTooltip(layer.feature.properties.Town, {direction: 'top'}).openTooltip();
  }

  // This resets the highlight after hover moves away
  function resetHighlight(e) {
    geoJsonLayer.setStyle(style);
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

    TOWNS.push(layer.feature.properties.Town);
  }

  function populateTowns() {
    $('.my-map-column').html('');

    /*
    var colHeight = $('#map').height() - 300;
    var colNumber = Math.ceil(169 * 14 / colHeight);
    var townsPerColumn = Math.ceil(169 / colNumber);

    if (colNumber > 8) {
      townsPerColumn = 22;
    } */

    var townsPerColumn = 43;

    for (var i = 0; i < TOWNS.length; i++) {
      $('#column' + (parseInt(i / townsPerColumn) + 1) ).append('<span class="clickable">' + TOWNS[i] + '</span><br>');
    }

    $('.clickable').click(function() {
      openPDF( $(this)[0].innerText );
    });
  }

  function openPDF(town) {
    var year = $('select[name="year"]').val();
    var townSlug = town.toLowerCase().replace(' ', '-');
    window.open('https://s3-us-west-2.amazonaws.com/cerc-pdfs/' + year + '/' + townSlug + '-' + year + '.pdf');
  }

  $.getJSON('ct.geojson', function(geojson) {
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


});
