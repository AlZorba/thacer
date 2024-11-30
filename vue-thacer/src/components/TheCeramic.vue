<template>
  <main>
    <section class="px-4 py-2 bg-body-secondary">
      <div v-if="loadingStatusTextAndArchimageData === 'loading'" class="text-center">
        <div class="spinner-border text-secondary" role="status">
          <span class="visually-hidden">Loading data...</span>
        </div>
      </div>
      <div v-else-if="loadingStatusTextAndArchimageData === 'error'">
        <div class="alert alert-danger" role="alert">Erreur de chargement</div>
      </div>
      <div v-else-if="loadingStatusTextAndArchimageData === 'not_found'">
        <div class="alert alert-warning" role="alert">Cet élément n'a pas été trouvé</div>
      </div>
      <div v-else>
        <TheCeramicText :ceramData="ceramData"></TheCeramicText>
      </div>
    </section>

    <section class="p-5 bg-light">
      <div v-if="loadingStatusImagesUrls === 'loading'" class="text-center">
        <div class="spinner-border text-secondary" role="status">
          <span class="visually-hidden">Loading images...</span>
        </div>
      </div>
      <div v-else-if="loadingStatusImagesUrls === 'error'">
        <div class="alert alert-danger" role="alert">Erreur de chargement des images</div>
      </div>
      <div v-else>
        <TheCeramicImages :imageUrlArrayList="imageUrlArrayList"></TheCeramicImages>
      </div>
    </section>

    <section v-if="ceramArchimageData?.archimageImageUrl" class="pb-5 px-5 bg-light">
      <div v-if="loadingStatusTextAndArchimageData === 'loading'" class="text-center">
        <div class="spinner-border text-secondary" role="status">
          <span class="visually-hidden">Loading data...</span>
        </div>
      </div>
      <div v-else-if="loadingStatusTextAndArchimageData === 'error'">
        <div class="alert alert-danger" role="alert">Erreur de chargement</div>
      </div>
      <div v-else-if="loadingStatusTextAndArchimageData === 'not_found'">
        <div class="alert alert-warning" role="alert">Cet élément n'a pas été trouvé</div>
      </div>
      <div v-else>
        <TheCeramicArchimage :ceramArchimageData="ceramArchimageData"></TheCeramicArchimage>
      </div>
    </section>

    <section v-if="ceramData?.Num_Analyse" class="pb-5 px-5 bg-light">
      <TheCeramicChart :ceramData="ceramData"></TheCeramicChart>
    </section>
  </main>
</template>

<script>
import TheCeramicText from '@/components/TheCeramicText.vue'
import TheCeramicChart from '@/components/TheCeramicChart.vue'
import TheCeramicImages from '@/components/TheCeramicImages.vue'
import { isObject, notifyProgrammaticError } from '@/assets/js/utils.js'
import TheCeramicArchimage from '@/components/TheCeramicArchimage.vue'

export default {
  name: 'TheCeramic',
  components: {
    TheCeramicArchimage,
    TheCeramicChart,
    TheCeramicImages,
    TheCeramicText
  },
  data() {
    return {
      loadingStatusImagesUrls: 'loading',
      loadingStatusTextAndArchimageData: 'loading',
      imageUrlArrayList: null,
      ceramData: null,
      ceramTextData: null,
      ceramArchimageData: null
    }
  },
  mounted() {
    // Récupérer l'ID de la route
    const id = this.$route.query.ID

    // Vérifier si les données céramiques sont déjà dans le cache
    const cachedData = sessionStorage.getItem('ceramData')
    if (cachedData) {
      // Si les données sont dans le cache, les utiliser
      const ceramGeojson = JSON.parse(cachedData)
      const ceramProperties = this.findCeramObjectProperties(id, ceramGeojson)

      if (ceramProperties) {
        this.ceramData = ceramProperties
        this.setCeramArchimageValues(ceramProperties)

        const INV = this.ceramData.ID
        const ANA = this.ceramData.Num_Analyse ? this.ceramData.Num_Analyse : ''

        // Fetch des images
        fetch(`${import.meta.env.VITE_API_URL}index.php?INV=${INV}&ANA=${ANA}`)
          .then((response) => response.json())
          .then((imageUrlArrayList) => {
            if (isObject(imageUrlArrayList)) {
              this.imageUrlArrayList = imageUrlArrayList
              this.loadingStatusImagesUrls = 'loaded'
            } else {
              notifyProgrammaticError(
                `Error, imageUrlArrayList is not an object : ${imageUrlArrayList}`
              )
              this.loadingStatusImagesUrls = 'error'
            }
          })
          .catch((error) => {
            console.error(error)
            this.loadingStatusImagesUrls = 'error'
          })

        this.loadingStatusTextAndArchimageData = 'loaded'
      } else {
        this.loadingStatusTextAndArchimageData = 'not_found'
      }
    } else {
      // Si le cache n'existe pas, faire le fetch
      fetch(import.meta.env.VITE_API_URL + '/index.php?CERAM')
        .then((response) => response.json())
        .then((ceramGeojson) => {
          // Stocker les données dans le cache
          sessionStorage.setItem('ceramData', JSON.stringify(ceramGeojson))

          const ceramProperties = this.findCeramObjectProperties(id, ceramGeojson)

          if (ceramProperties) {
            this.ceramData = ceramProperties
            this.setCeramArchimageValues(ceramProperties)

            const INV = this.ceramData.ID
            const ANA = this.ceramData.Num_Analyse ? this.ceramData.Num_Analyse : ''

            // Fetch des images
            fetch(`${import.meta.env.VITE_API_URL}index.php?INV=${INV}&ANA=${ANA}`)
              .then((response) => response.json())
              .then((imageUrlArrayList) => {
                if (isObject(imageUrlArrayList)) {
                  this.imageUrlArrayList = imageUrlArrayList
                  this.loadingStatusImagesUrls = 'loaded'
                } else {
                  notifyProgrammaticError(
                    `Error, imageUrlArrayList is not an object : ${imageUrlArrayList}`
                  )
                  this.loadingStatusImagesUrls = 'error'
                }
              })
              .catch((error) => {
                console.error(error)
                this.loadingStatusImagesUrls = 'error'
              })

            this.loadingStatusTextAndArchimageData = 'loaded'
          } else {
            this.loadingStatusTextAndArchimageData = 'not_found'
          }
        })
        .catch((error) => {
          console.error(error)
          this.loadingStatusTextAndArchimageData = 'error'
        })
    }
  },

  methods: {
    findCeramObjectProperties(id, ceramGeojson) {
      const features = ceramGeojson['features']

      //See if it could be better like this
      // ceramGeojson['features'].filter((feature) => feature.properties.ID === id)[0].properties

      for (let i = 0; i < features.length; i++) {
        if (features[i].properties.ID === id) {
          return features[i].properties
        }
      }
      return null
    },

    // Archimage
    setCeramArchimageValues(ceramProperties) {
      if (!ceramProperties) {
        return
      }

      this.ceramArchimageData = {}

      if (ceramProperties.Archimage) {
        this.ceramArchimageData.archimageImageUrl =
          'https://archimage.efa.gr/action.php?kroute=image_preview_public&id=' +
          ceramProperties.Archimage +
          '&type=2&ext=.jpg'
        this.ceramArchimageData.archimageLink =
          'https://archimage.efa.gr/?kroute=fiche_publique&id=' + ceramProperties.Archimage
        if (ceramProperties.Pi) {
          this.ceramArchimageData.archimageText = 'Π' + ceramProperties.Pi
        }
      }
    }
  }
}
</script>

<style scoped></style>
