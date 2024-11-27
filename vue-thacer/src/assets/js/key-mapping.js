// This variable will allow to map, for each key present in the geojson,
// a list of the corresponding keys that the user may use when searching.
// (The "user key" arrays (-> the property values) must be in lower cases)
export const keyMapping = {
  ID: ['id'],
  Pi: ['pi'],
  Inv_Fouille: ['inventaire', 'inventory', 'invfouille', 'inv-fouille', 'inv_fouille'],
  Archimage: ['archimage'],
  Num_Analyse: ['num_analyse', 'num-analyse', 'numanalyse'],
  secteur_ID: ['secteur_id', 'secteur-id', 'secteurid'],
  annee: ['annee', 'année', 'year'],
  Materiel: ['materiel', 'material'],
  Famille: ['famille', 'family'],
  Catégorie: ['catégorie', 'categorie', 'category'],
  Type: ['type'],
  Forme: ['identification', 'forme', 'shape'],
  Description: ['description, texte'],
  Biblio: [
    'biblio',
    'bibliography',
    'bibliographie',
    'références',
    'référence',
    'publications',
    'publication'
  ],
  Période: ['période', 'periode', 'period'],
  x: ['x'],
  y: ['y']
}

// Since the keyMapping variable is human friendly but not developer friendly, we inverse it here.
// The function return this kind of result :
// { inventaire: 'Inv_Fouille', inventory: 'Inv_Fouille', invfouille: 'Inv_Fouille',
//  'inv-fouille': 'Inv_Fouille', inv_fouille: 'Inv_Fouille', archimage: 'Archimage',
//   ... }
export const getInverseKeyMapping = () => {
  let inverseKeyMapping = {}
  for (const realDataKey in keyMapping) {
    const acceptedKeysArray = keyMapping[realDataKey]
    for (const acceptedKey of acceptedKeysArray) {
      inverseKeyMapping[acceptedKey] = realDataKey
    }
  }

  return inverseKeyMapping
}

// From a key that the user asked to search in, we return the corresponding
// "real" key used in the geojson. If not found, it will return undefined.
// (searchItemKey is expected to be lower case)
export function mapToRealKeyName(searchItemKey) {
  return getInverseKeyMapping()[searchItemKey]
}
