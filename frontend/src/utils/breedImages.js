/**
 * Breed Thumbnail Utility
 * Maps breed names to standard thumbnail images stored in /images/breeds/
 */

const BREED_IMAGE_MAP = {
  'Golden Retriever': '/images/breeds/golden_retriever.png',
  'Labrador Retriever': '/images/breeds/labrador_retriever.png',
  'German Shepherd': '/images/breeds/german_shepherd.png',
  'French Bulldog': '/images/breeds/french_bulldog.png',
  'Poodle': '/images/breeds/poodle.png',
  'Beagle': '/images/breeds/beagle.png',
  'Bulldog': '/images/breeds/bulldog.png',
  'Shih Tzu': '/images/breeds/shih_tzu.png',
  'Siberian Husky': '/images/breeds/siberian_husky.png',
  'Pug': '/images/breeds/pug.png',
}

/**
 * Get the standard breed thumbnail path for a given breed name.
 * Falls back to a generic placeholder if the breed is unknown.
 */
export function getBreedThumbnail(breedName) {
  if (!breedName) return null
  // Exact match
  if (BREED_IMAGE_MAP[breedName]) return BREED_IMAGE_MAP[breedName]
  // Case-insensitive match
  const key = Object.keys(BREED_IMAGE_MAP).find(
    k => k.toLowerCase() === breedName.toLowerCase()
  )
  return key ? BREED_IMAGE_MAP[key] : null
}

/**
 * Get the best available image for a pet:
 * 1. Pet's own image_url (admin-uploaded main image)
 * 2. Standard breed thumbnail
 * 3. null (show placeholder)
 */
export function getPetImage(pet) {
  if (!pet) return null
  if (pet.image_url) return pet.image_url
  return getBreedThumbnail(pet.breed_name)
}
