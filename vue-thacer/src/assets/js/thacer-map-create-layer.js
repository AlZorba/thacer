import * as search from '@/assets/js/thacer-map-setup-search'
import L from 'leaflet'

export function setCeramLayer(ceramLayer) {
  ceramLayer.setOpacity(0.8)

  let popup = ''
  if (ceramLayer.feature.properties.Archimage) {
    popup =
      "<img src='https://archimage.efa.gr/action.php?kroute=image_preview_public&id=" +
      ceramLayer.feature.properties.Archimage +
      "&type=2&ext=.jpg' /><br>"
  }
  popup +=
    '<a class="text-decoration-none text-secondary" target="_blank" href=#/ceram?ID=' +
    ceramLayer.feature.properties.ID +
    '>'
  const fields = [
    'Forme',
    'Pi',
    'Inv_Fouille',
    'Référence tesson',
    'Numéro d’inventaire',
    'Type',
    'Catégorie',
    'Origine',
    'Description',
    'Référence',
    'Publication',
    'Bibliographie'
  ]

  fields.forEach((field) => {
    if (ceramLayer.feature.properties[field]) {
      popup += `${field === 'Pi' ? 'Inventaire musée ' : field} : ${
        ceramLayer.feature.properties[field]
      }<br>`
    }
  })

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
  const layer = L.geoJSON()

  fetch(import.meta.env.VITE_API_URL + 'geojson/secteurs.geojson')
    .then((response) => response.json())
    .then((data) => {
      layer.addData(data)

      // set up the popup and click events for each layer
      layer.eachLayer(function (e) {
        let stringGTh = ''
        let stringRef = ''
        if (e.feature.properties.GTh) {
          stringGTh = ' GTh' + e.feature.properties.GTh
        }
        if (e.feature.properties.Référenc) {
          stringRef = e.feature.properties.Référenc
        }
        e.bindPopup(e.feature.properties.Titre + stringGTh + '<br>' + stringRef, {
          maxWidth: 300,
          minWidth: 10,
          maxHeight: 250,
          autoPan: true,
          closeButton: false,
          autoPanPadding: [0, 0],
          offset: [0, -22]
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
  let featureLayerCeram = L.geoJSON()

  const cachedData = sessionStorage.getItem('ceramData')
  if (cachedData) {
    const data = JSON.parse(cachedData)

    featureLayerCeram = L.geoJSON(data, {
      onEachFeature: function (feature, layer) {
        setCeramLayer(layer)
        markerClusterGroupCeram.addLayer(layer)
      }
    })
    search.designMarkersCeram(markerClusterGroupCeram)
  } else {
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

export function createFeatureLayerVestiges() {
  let vestiges = L.featureGroup()

  fetch(import.meta.env.VITE_API_URL + 'geojson/vestiges.geojson')
    .then((res) => res.json())
    .then((data) => {
      let layer = L.geoJSON(data, {
        style: { color: 'grey' }
      })
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
