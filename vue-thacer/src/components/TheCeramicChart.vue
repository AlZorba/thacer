<template>
  <h4>Graphique</h4>
  <div class="card">
    <!-- Display x y selectors -->
    <div class="row">
      <div class="table-responsive">
        <table id="SearchTable" class="table table-striped">
          <tbody>
            <tr id="tr0" class="condline">
              <td class="">Thasos analyses XRF</td>
              <td class="">X :</td>
              <td id="td_selx" class="">
                <select
                  id="selx"
                  v-model="x"
                  class="form-control"
                  name="selx"
                  @change="updateData()"
                >
                  <option value="Na2O">Na2O (%)</option>
                  <option value="MgO">MgO (%)</option>
                  <option value="Al2O3">Al2O3 (%)</option>
                  <option value="SiO2">SiO2 (%)</option>
                  <option value="P">P (PPM)</option>
                  <option value="K2O">K2O (%)</option>
                  <option value="CaO">CaO (%)</option>
                  <option value="TiO2">TiO2 (%)</option>
                  <option value="V">V (PPM)</option>
                  <option value="Cr" selected="selected">Cr (PPM)</option>
                  <option value="Mn">Mn (PPM)</option>
                  <option value="Fe2O3">Fe2O3 (%)</option>
                  <option value="Co">Co (PPM)</option>
                  <option value="Ni">Ni (PPM)</option>
                  <option value="Cu">Cu (PPM)</option>
                  <option value="Zn">Zn (PPM)</option>
                  <option value="Rb">Rb (PPM)</option>
                  <option value="Sr">Sr (PPM)</option>
                  <option value="Y">Y (PPM)</option>
                  <option value="Zr">Zr (PPM)</option>
                  <option value="Ba">Ba (PPM)</option>
                  <option value="La">La (PPM)</option>
                  <option value="Ce">Ce (PPM)</option>
                  <option value="Nd">Nd (PPM)</option>
                  <option value="Pb">Pb (PPM)</option>
                  <option value="Th">Th (PPM)</option>
                </select>
              </td>
              <td class="">Y :</td>
              <td id="td_sely" class="condcellval">
                <select
                  id="sely"
                  v-model="y"
                  class="form-control"
                  name="sely"
                  @change="updateData()"
                >
                  <option value="Na2O">Na2O (%)</option>
                  <option value="MgO">MgO (%)</option>
                  <option value="Al2O3">Al2O3 (%)</option>
                  <option value="SiO2">SiO2 (%)</option>
                  <option value="P">P (PPM)</option>
                  <option value="K2O">K2O (%)</option>
                  <option value="CaO">CaO (%)</option>
                  <option value="TiO2">TiO2 (%)</option>
                  <option value="V">V (PPM)</option>
                  <option value="Cr">Cr (PPM)</option>
                  <option value="Mn">Mn (PPM)</option>
                  <option value="Fe2O3">Fe2O3 (%)</option>
                  <option value="Co">Co (PPM)</option>
                  <option value="Ni" selected="selected">Ni (PPM)</option>
                  <option value="Cu">Cu (PPM)</option>
                  <option value="Zn">Zn (PPM)</option>
                  <option value="Rb">Rb (PPM)</option>
                  <option value="Sr">Sr (PPM)</option>
                  <option value="Y">Y (PPM)</option>
                  <option value="Zr">Zr (PPM)</option>
                  <option value="Ba">Ba (PPM)</option>
                  <option value="La">La (PPM)</option>
                  <option value="Ce">Ce (PPM)</option>
                  <option value="Nd">Nd (PPM)</option>
                  <option value="Pb">Pb (PPM)</option>
                  <option value="Th">Th (PPM)</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Display the charts -->
    <div class="row">
      <canvas id="myChart" width="400" height="400"></canvas>
    </div>
  </div>
</template>

<script>
import { xrfResultsThasos } from '@/assets/js/xrf-results-thasos'

export default {
  name: 'TheCeramicChart',
  props: {
    ceramData: {
      type: [Object, null],
      default: null
    }
  },
  data() {
    return {
      loadingStatus: 'loading',
      ANA: null,
      x: 'Cr',
      y: 'Ni',
      scatterChart: null
    }
  },
  mounted() {
    this.ANA = this.ceramData.Num_Analyse
    this.buildChart()
  },
  methods: {
    updateData() {
      const chart2 = this.x
      const chart = this.y
      // indique X et Y pour le scatterchart
      let output2 = xrfResultsThasos.map((s) => {
        // eslint-disable-next-line no-prototype-builtins
        if (s.hasOwnProperty(chart2)) {
          s.x = s[chart2]
        }
        // eslint-disable-next-line no-prototype-builtins
        if (s.hasOwnProperty(chart)) {
          s.y = s[chart]
        }
        return s
      })

      function getSampleByNum(Sample) {
        return output2.filter(function (output2) {
          return output2.Sample === Sample
        })
      }

      let sampleone = getSampleByNum(this.ANA)
      let sampleonecr = sampleone[0]?.x
      let sampleoneni = sampleone[0]?.y

      function getSampleByGroupe(Sample) {
        return output2.filter(function (output2) {
          return output2.GROUPE === Sample || output2.GROUPE === 7
        })
      }

      let thasiansample = getSampleByGroupe(13)

      let scatterChartDs = {
        datasets: [
          {
            label: 'Current sample',
            pointBackgroundColor: 'rgba(1, 1, 0, 0.1)',
            borderColor: 'red',
            data: [
              {
                x: sampleonecr,
                y: sampleoneni
              }
            ]
          },
          {
            label: 'all samples',
            data: output2
          },
          {
            label: 'échantillons thasiens',
            borderColor: 'green',
            data: thasiansample
          }
        ]
      }

      this.scatterChart.data = scatterChartDs
      this.scatterChart.options.scales.xAxes[0].scaleLabel.labelString = chart2
      this.scatterChart.options.scales.yAxes[0].scaleLabel.labelString = chart
      this.scatterChart.update()
    },
    buildChart() {
      // indique X et Y pour le scatterchart
      let output2 = xrfResultsThasos.map((s) => {
        // eslint-disable-next-line no-prototype-builtins
        if (s.hasOwnProperty('Cr')) {
          s.x = s.Cr
        }
        // eslint-disable-next-line no-prototype-builtins
        if (s.hasOwnProperty('Ni')) {
          s.y = s.Ni
        }
        return s
      })

      // select specific sample
      function getSampleByNum(Sample) {
        return output2.filter(function (output2) {
          return output2.Sample === Sample
        })
      }

      let sampleone = getSampleByNum(this.ANA)
      let sampleonecr = sampleone[0]?.x
      let sampleoneni = sampleone[0]?.y

      // select thasian samples (groupe 7 13)
      function getSampleByGroupe(Sample) {
        return output2.filter(function (output2) {
          return output2.GROUPE === Sample || output2.GROUPE === 7
        })
      }

      let thasiansample = getSampleByGroupe(13)

      // build chart ------------------------------------------------
      let scatterChartData = {
        datasets: [
          {
            label: 'Current sample',
            pointBackgroundColor: 'rgba(1, 1, 0, 0.1)',
            borderColor: 'red',
            data: [
              {
                x: sampleonecr,
                y: sampleoneni
              }
            ]
          },
          {
            label: 'all samples',
            data: output2
          },
          {
            label: 'échantillons thasiens',
            borderColor: 'green',
            data: thasiansample
          }
        ]
      }

      let ctx = document.getElementById('myChart').getContext('2d')
      // eslint-disable-next-line no-undef
      this.scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: scatterChartData,
        options: {
          maintainAspectRatio: false,
          responsive: true,
          hoverMode: 'nearest',
          intersect: true,
          title: {
            display: false,
            text: 'Thasos XRF analysis scatter Chart'
          },
          scales: {
            xAxes: [
              {
                scaleLabel: {
                  display: true,
                  labelString: 'Cr (PPM)'
                },
                position: 'bottom',
                gridLines: {
                  zeroLineColor: 'rgba(0,0,0,1)'
                }
              }
            ],
            yAxes: [
              {
                type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                display: true,
                position: 'left',
                scaleLabel: {
                  display: true,
                  labelString: 'Ni (PPM)'
                }
              }
            ]
          }
        }
      })
    }
  }
}
</script>

<style scoped></style>
