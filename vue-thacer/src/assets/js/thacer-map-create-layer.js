import * as search from '@/assets/js/thacer-map-setup-search'
import L from 'leaflet'

export function setCeramLayer(ceramLayer) {
  let popup = ''

  ceramLayer.setOpacity(0.8)
  if (ceramLayer.feature.properties.Archimage) {
    popup =
      "<img src='https://archimage.efa.gr/action.php?kroute=image_preview_public&id=" +
      ceramLayer.feature.properties.Archimage +
      "&type=2&ext=.jpg' /><br>"
  }
  popup =
    popup +
    '<a class="text-decoration-none text-secondary" target="_blank" href=#/ceram?ID=' +
    ceramLayer.feature.properties.ID +
    '>'
  if (ceramLayer.feature.properties.Forme) {
    popup = popup + ceramLayer.feature.properties.Forme + '<br>'
  }
  if (ceramLayer.feature.properties.Pi) {
    popup = popup + 'Π' + ceramLayer.feature.properties.Pi + '<br>'
  }
  if (ceramLayer.feature.properties.Inv_Fouille) {
    popup = popup + 'inv : ' + ceramLayer.feature.properties.Inv_Fouille + '<br>'
  }

  if (ceramLayer.feature.properties.Type) {
    popup = popup + 'Type : ' + ceramLayer.feature.properties.Type + '<br>'
  }
  if (ceramLayer.feature.properties.Description) {
    popup = popup + ceramLayer.feature.properties.Description + '<br>'
  }
  if (ceramLayer.feature.properties.Biblio) {
    popup = popup + ceramLayer.feature.properties.Biblio + '<br>'
  }
  if (ceramLayer.feature.properties.Publication) {
    popup = popup + ceramLayer.feature.properties.Publication + '<br>'
  }
  ceramLayer.bindPopup(popup + '</a>', {
    maxWidth: 350,
    minWidth: 350,
    maxHeight: 550,
    autoPan: true,
    closeButton: false,
    autoPanPadding: [5, 5]
  })
}

export function createFeatureLayerSecteurs(ceram, markerClusterGroupCeram, map) {
  // create a new leaflet GeoJSON layer
  const layer = L.geoJSON()

  // fetch the data from the API URL using the fetch method
  fetch(import.meta.env.VITE_API_URL + 'geojson/secteurs.geojson')
    .then((response) => response.json()) // parse the response as JSON
    .then((data) => {
      // add the GeoJSON data to the leaflet layer
      layer.addData(data)

      // set up the popup and click events for each layer
      layer.eachLayer(function (e) {
        let string = ''
        let biblio = ''
        if (
          !(
            // GTh means "Guide de Thasos"
            (
              (e.feature.properties.GTh == '') |
              (e.feature.properties.GTh == 'null') |
              (e.feature.properties.GTh == undefined)
            )
          )
        ) {
          string = ' GTh' + e.feature.properties.GTh
        }
        if (
          !(
            (e.feature.properties.Référenc == '') |
            (e.feature.properties.Référenc == 'null') |
            (e.feature.properties.Référenc == undefined)
          )
        ) {
          biblio = e.feature.properties.Référenc
        }
        e.bindPopup(e.feature.properties.Titre + string + '<br>' + biblio, {
          maxWidth: 300,
          minWidth: 10,
          maxHeight: 250,
          autoPan: true,
          closeButton: false,
          autoPanPadding: [0, 0]
        })
        // search ceram on click
        e.on('click', function () {
          search.searchCeramByClick(ceram, markerClusterGroupCeram, map, e)
        })
      })
    })

  // return the leaflet layer
  return layer
}

export function createFeatureLayerCeram(markerClusterGroupCeram, map) {
  // Créer une nouvelle couche GeoJSON Leaflet
  let featureLayerCeram = L.geoJSON()

  // Vérifier si les données sont déjà dans le sessionStorage
  const cachedData = sessionStorage.getItem('ceramData')

  if (cachedData) {
    // Si les données sont dans le sessionStorage, les utiliser
    const data = JSON.parse(cachedData)

    featureLayerCeram = L.geoJSON(data, {
      onEachFeature: function (feature, layer) {
        setCeramLayer(layer)
        markerClusterGroupCeram.addLayer(layer)
      }
    })
    search.designMarkersCeram(markerClusterGroupCeram)
  } else {
    // Sinon, récupérer les données via fetch
    fetch(import.meta.env.VITE_API_URL + 'index.php?CERAM')
      .then((response) => response.json())
      .then((data) => {
        // Stocker les données dans le sessionStorage
        sessionStorage.setItem('ceramData', JSON.stringify(data))

        // Créer la couche GeoJSON avec les données récupérées
        featureLayerCeram = L.geoJSON(data, {
          onEachFeature: function (feature, layer) {
            setCeramLayer(layer)
            markerClusterGroupCeram.addLayer(layer)
          }
        })
        // Appliquer le design des marqueurs après ajout
        search.designMarkersCeram(markerClusterGroupCeram)
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des données CERAM:', error)
      })
  }

  // Configurer la recherche
  search.setupSearchCeramByText(markerClusterGroupCeram, map)

  // Retourner la couche Leaflet
  return featureLayerCeram
}

export function createMarkerClusterGroupCeram() {
  return new L.MarkerClusterGroup({
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    spiderfyDistanceMultiplier: 1.5,
    spiderLegPolylineOptions: { weight: 1, color: '#fff', opacity: 0.1 }
  })
}

// function designMarkersCeram(layer) {
//   layer.eachLayer(function (marker) {
//     let identifier
//     const feature = marker.feature

//     if (feature.properties.Pi) {
//       identifier = 'Π' + feature.properties.Pi
//     } else {
//       identifier = feature.properties.ID
//     }

//     marker.setIcon(
//       L.divIcon({
//         html: identifier,
//         className: 'ceram-marker',
//         iconSize: 'auto'
//       })
//     )
//   })
// }

export function createFeatureLayerVestiges() {
  let vestiges = L.featureGroup()

  // Load GeoJSON data from URL
  fetch(import.meta.env.VITE_API_URL + 'geojson/vestiges.geojson')
    .then((res) => res.json())
    .then((data) => {
      // Create a Leaflet GeoJSON layer from the data
      let layer = L.geoJSON(data, {
        style: { color: 'grey' }
      })

      // Add the layer to the feature group
      vestiges.addLayer(layer)
    })

  vestiges.getAttribution = function () {
    return 'Plan des vestiges antique : MWK TK EfA'
  }

  return vestiges
}

export function createImageOverlayKahil(map) {
  let KahilimageBounds = [
    [40.768370395, 24.699482062],
    [40.781060633, 24.716708757]
  ] // SWNE

  map.on('overlayadd', function (eo) {
    if (eo.name === 'Plan Kahil 1954') {
      map.fitBounds(KahilimageBounds)
    }
  })

  return L.imageOverlay('Plan_Kahil_1954.png', KahilimageBounds)
}

export function createFeatureLayerChronique(markersChronique) {
  fetch(import.meta.env.VITE_API_URL + 'geojson/chronique.geojson')
    .then((response) => response.json())
    .then((data) => {
      L.geoJSON(data, {
        onEachFeature: function (feature, layer) {
          layer.on('click', function () {
            window.open(
              'https://chronique.efa.gr/?kroute=report&id=' + feature.properties.ID,
              '_blank'
            )
          })
          markersChronique.addLayer(layer)
        },
        pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {
            icon: L.divIcon({ html: 'EfA', className: 'marker EFA-marker', iconSize: [40, 40] })
          })
        }
      })
    })
}

export function createMarkerClusterGroupChronique() {
  return new L.MarkerClusterGroup({
    iconCreateFunction: function (cluster) {
      let childCount = cluster.getChildCount()

      return new L.DivIcon({
        html: '<div class="efa-cluster"><span>' + childCount + '</span></div>',
        className: 'efa-cluster',
        iconSize: [40, 40]
      })
    },
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    spiderfyDistanceMultiplier: 2
  })
}

// -----------------------------------EfA Geoserver WMS ---------------------------------------------
export function createTileLayerSigThasos() {
  return L.tileLayer.wms('https://geoserver.efa.gr/geoserver/wms?', {
    layers: 'SIG_thasos:fd_thasos_4326',
    attribution: 'Plan SIG Agora : C. Guillaume, N. Trippé, L. Fadin, EfA',
    transparent: true,
    maxZoom: 20,
    opacity: 0.5
  })
}

export function createTileLayerOrthophotoAgora() {
  return L.tileLayer.wms('https://geoserver.efa.gr/geoserver/wms?', {
    layers: 'SIG_thasos:Orthophoto_Agora',
    attribution: 'Orthophoto Agora : L. Fadin, N. Trippé, EfA',
    transparent: true,
    maxZoom: 20,
    opacity: 0.5
  })
}

export function createFeatureLayerEchantillonsGeol() {
  let echantillons = L.featureGroup()
  fetch(import.meta.env.VITE_API_URL + 'geojson/echantillonsgeol.geojson')
    .then((response) => response.json())
    .then((data) => {
      let layer = L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {
            icon: L.divIcon({
              html: feature.properties.RecNum,
              className: 'marker echantillons-geol-marker',
              iconSize: [40, 40]
            })
          })
        }
      })
      echantillons.addLayer(layer)
    })
  return echantillons
}

export function createFeatureLayerADelt(map) {
  let ADelt = L.featureGroup()

  fetch(import.meta.env.VITE_API_URL + 'geojson/ADelt51.geojson')
    .then((response) => response.json())
    .then((data) => {
      L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {
            icon: L.divIcon({
              html: feature.properties.Nom_GR,
              className: 'ADelt-dot',
              iconSize: 0
            })
          })
        },
        onEachFeature: function (feature, layer) {
          layer.bindPopup('ADelt 51 : "' + feature.properties.Texte + '"<br>', {
            maxWidth: 350,
            maxHeight: 550,
            autoPan: true,
            closeButton: false,
            autoPanPadding: [5, 5]
          })
        },

        pane: 'markerPane',
        interactive: true
      }).addTo(ADelt)
    })

  ADelt.on('add', function () {
    map.on('zoomend', show_hide_labels)
    show_hide_labels()
  })

  function show_hide_labels() {
    let cur_zoom = map.getZoom()
    if (cur_zoom <= 13) {
      ADelt.eachLayer(function (layer) {
        map.removeLayer(layer)
      })
    } else if (cur_zoom > 13) {
      ADelt.eachLayer(function (layer) {
        map.addLayer(layer)
      })
    }
  }

  return ADelt
}

export function createFeatureLayerSites() {
  let sites = L.featureGroup()

  fetch(import.meta.env.VITE_API_URL + 'geojson/sites.geojson')
    .then((response) => response.json())
    .then((data) => {
      L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
          let iconUrl =
            feature.properties.type === 'Atelier'
              ? 'AmpTha.svg'
              : 'https://upload.wikimedia.org/wikipedia/commons/8/84/Maki-castle-15.svg'
          return L.marker(latlng, {
            icon: L.icon({
              iconUrl: iconUrl,
              iconSize: feature.properties.type === 'Atelier' ? [20, 50] : [15, 35]
            })
          })
        },
        onEachFeature: function (feature, layer) {
          layer.bindPopup(feature.properties.Nom + ': ' + feature.properties.desc, {
            maxWidth: 350,
            maxHeight: 550,
            autoPan: true,
            closeButton: false,
            autoPanPadding: [5, 5]
          })
        }
      }).addTo(sites)
    })
  return sites
}
