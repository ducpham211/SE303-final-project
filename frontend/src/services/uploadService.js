import api from './api'

/**
 * Service to handle file uploads
 */
const uploadService = {
  /**
   * Upload an image file to the backend
   * @param {File} imageFile The file to upload
   * @returns {Promise<string>} The uploaded image URL
   */
  uploadImage: async (imageFile) => {
    const formData = new FormData()
    formData.append('file', imageFile)
    
    const { data } = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return data.imageUrl
  },
}

export default uploadService
