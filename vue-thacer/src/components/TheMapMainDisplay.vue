<template>
  <div id="map"></div>
</template>

<script>
import { thacerMap } from '@/assets/js/thacer-map'

export default {
  name: 'TheMapMainDisplay',
  mounted() {
    thacerMap()
  }
}
</script>

<style scoped></style>

<style>
g path:hover {
  fill-opacity: 0.2;
}

g path {
  stroke-width: 1;
}

/* modify .leaflet* classes of popup to be more compact */
.leaflet-popup-content {
  padding: 2px;
  line-height: 1.2;
  margin: 5px;
}
.leaflet-popup-content::first-letter {
  text-transform: uppercase;
}

.leaflet-popup-content a:hover {
  opacity: 0.6;
  cursor: pointer;
}

.leaflet-popup-tip-container {
  height: 40px;
}

.leaflet-popup-content img {
  margin: 1%;
  width: 98%;
}
.leaflet-popup-content-wrapper {
  width: auto;

  white-space: normal; /* Assure que le texte fait un retour à la ligne si nécessaire */
}

.leaflet-container {
  border: 2px solid rgba(0, 0, 0, 0.2);
  background-clip: padding-box;
}

/* smaller font for map attribution due to lenghty credits*/
.leaflet-control-attribution {
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 100vw;
  white-space: nowrap;
  font-size: 11px;
}

/* Seems to change only the ceram cluster color */
.marker-cluster-medium,
.marker-cluster-small,
.marker-cluster-large,
.marker-cluster-medium div,
.marker-cluster-small div,
.marker-cluster-large div {
  background-color: rgba(245, 75, 54, 0.7) !important;
}

.efa-cluster,
.efa-cluster div {
  background-color: rgba(0, 85, 153, 0.7);
  width: 30px;
  height: 30px;
  margin-left: 5px;
  margin-top: 5px;
  text-align: center;
  border-radius: 15px;
  font: 12px 'Helvetica Neue', Arial, Helvetica, sans-serif;
}

.efa-cluster {
  border-radius: 20px;
}

.efa-cluster div span {
  line-height: 30px;
}

.marker {
  top: -20px;
  left: -20px;
  border-radius: 100%;
  border-style: solid;
  width: 40px;
  height: 40px;
  text-align: center;
  line-height: 35px;
  color: white;
  font-size: 11px;
}

.ceram-marker {
  border-radius: 20%;
  border-style: solid;
  text-align: center;
  line-height: 11px;
  color: white;
  font-size: 11px;
  border-color: #f54b36;
  background: #f54b36;
}

.EFA-marker {
  border-color: #005599;
  background: #005599;
}

.echantillons-geol-marker {
  border-color: #7bb358;
  background: #7bb358;
}

/* Small dot next to the label: */
.ADelt-dot {
  border-radius: 100%;
  border-style: solid;
  width: 4px;
  height: 4px;
}
</style>
