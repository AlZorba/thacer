import { isObject, notifyProgrammaticError } from '@/assets/js/utils.js'
import { setCeramLayer } from '@/assets/js/thacer-map-create-layer'
import { mapToRealKeyName } from '@/assets/js/key-mapping'

export function setupSearchCeramByText(markerClusterGroupCeram, map, featureLayerCeram) {
  let filterInput = document.getElementById('filter-input')
  filterInput.addEventListener('keyup', function (e) {
    if (e.keyCode == 13) {
      let inputSearchString = e.target.value.trim().toLowerCase()
      document.getElementById('nonloc').innerHTML = []

      document.getElementById('loading-unlocalised').classList.remove('d-none')
      fetch(import.meta.env.VITE_API_URL + 'geojson/ceram.geojson')
        .then((r) => r.json())
        .then((json) => {
          Object.keys(json.features).forEach((k) => {
            let obj = json.features[k]

            // Adding current ceramObject only if unlocalised and passing input search string :
            if (
              obj.properties.x == 0 &&
              doesCeramObjectPassesInputSearchString(obj.properties, inputSearchString)
            ) {
              let label
              if (obj.properties.Pi != null) {
                label = 'Π' + obj.properties.Pi
              } else {
                label = obj.properties.Inv_Fouille
              }
              document.getElementById('nonloc').innerHTML += [
                '<a class="unlocalised-tag px-1 m-0 border border-white" href="ceram?ID=' +
                  obj.properties.ID +
                  '&ANA=8888880&INV=88880">' +
                  label +
                  '</a>'
              ]
            }
          })

          document.getElementById('loading-unlocalised').classList.add('d-none')
        })

      markerClusterGroupCeram.clearLayers()
      map.removeLayer(markerClusterGroupCeram)
      featureLayerCeram.loadURL(import.meta.env.VITE_API_URL + 'geojson/ceram.geojson') // je ne sais pourquoi j'avais mis ça là, déjà fait plus haut mais sinon map.addlayer ne marche pas

      document.getElementById('loading-localised').classList.remove('d-none')
      featureLayerCeram
        .setFilter((e) => {
          // Adding current ceramObject only if localised and passing input search string :
          return (
            e.properties.x != 0 &&
            doesCeramObjectPassesInputSearchString(e?.properties, inputSearchString)
          )
        })
        .on('ready', function (e) {
          e.target.eachLayer(function (layer) {
            setCeramLayer(layer)
            markerClusterGroupCeram.addLayer(layer)
          })
          document.getElementById('loading-localised').classList.add('d-none')
        })

      map.addLayer(markerClusterGroupCeram)
    }
  })
}

// This function will be launched for each ceramObject.
// It returns true if ceramObject correspond with the input search string
const doesCeramObjectPassesInputSearchString = (ceramObject, inputSearchString) => {
  // Programmatic errors :
  if (!isObject(ceramObject)) {
    notifyProgrammaticError(
      `Error in doesCeramObjectPassFilter, ceramObject is not an object : ${ceramObject}`
    )
    return false
  }
  if (typeof inputSearchString !== 'string') {
    notifyProgrammaticError(
      `Error in doesCeramObjectPassFilter, inputSearchString is not an string :  ${ceramObject}`
    )
    return false
  }

  // Trim and lower case :
  inputSearchString = inputSearchString.trim()
  inputSearchString = inputSearchString.toLowerCase()

  // If empty search query :
  if (inputSearchString === '') {
    return true
  }

  // All good until here, let's search :
  let searchItemArray = inputSearchString.split(' ')
  // For the user search input to "pass" for this ceramObject,
  // each (every) single search item would have to return true
  return searchItemArray.every((searchItemSingle) =>
    isSearchItemSingleFound(searchItemSingle, ceramObject)
  )
}

// this function is launched for each search item, to check if it passes with current ceramObject
// (searchItemSingle is expected to be lower case)
function isSearchItemSingleFound(searchItemSingle, ceramObject) {
  const searchItemSingleSplit = searchItemSingle.split(':')

  // Search without key will hit three fields: Identification, Pi, Description :
  if (searchItemSingleSplit.length === 1) {
    const searchItemValue = searchItemSingleSplit[0]

    const isValueContainedInIdentification =
      Boolean(ceramObject['Identification']) &&
      ceramObject['Identification'].toLowerCase().includes(searchItemValue)

    const isValueEqualsPi =
      Boolean(ceramObject['Pi']) && ceramObject['Pi'].toLowerCase() === searchItemValue

    const isValueContainedInDescription =
      Boolean(ceramObject['Description']) &&
      ceramObject['Description'].toLowerCase().includes(searchItemValue)

    return isValueContainedInIdentification || isValueEqualsPi || isValueContainedInDescription
  }
  // Search with key :
  // (More than 2 elements would mean that there was 2 or more colons in the searchItemSingle.
  // In this case we will just not consider everything after the second colon)
  else if (searchItemSingleSplit.length >= 2) {
    const searchItemValue = searchItemSingleSplit[1]
    let searchItemKey = searchItemSingleSplit[0]
    searchItemKey = mapToRealKeyName(searchItemKey)

    if (!ceramObject[searchItemKey]) {
      return false
    }

    return ceramObject[searchItemKey].toLowerCase().includes(searchItemValue)
  }

  return true
}

export function searchCeramByClick(featureLayerCeram, markerClusterGroupCeram, map, layer) {
  map.removeLayer(markerClusterGroupCeram)
  markerClusterGroupCeram.clearLayers()
  let value = layer.feature.properties.secteur_ID
  featureLayerCeram.loadURL(import.meta.env.VITE_API_URL + 'geojson/ceram.geojson')
  featureLayerCeram
    .setFilter(function (feature) {
      // Searching / Filtering for "click search" takes place here :
      return feature.properties['secteur_ID'] == value
    })
    .on('ready', function (e) {
      e.target.eachLayer(function (layer) {
        setCeramLayer(layer)
        markerClusterGroupCeram.addLayer(layer)
      })
    })

  map.addLayer(markerClusterGroupCeram)
}