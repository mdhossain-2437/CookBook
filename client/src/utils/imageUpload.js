import axios from 'axios';

/**
 * Uploads an image file to ImgBB.
 * @param {File} imageFile The image file to upload.
 * @returns {Promise<string|null>} The URL of the uploaded image or null if upload fails.
 */
export const uploadImageToImgBB = async (imageFile) => {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
  if (!apiKey) {
    console.error('ImgBB API key is not configured.');
    // You might want to throw an error or return a specific error object
    return null;
  }

  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data && response.data.data && response.data.data.url) {
      return response.data.data.url;
    } else {
      console.error('ImgBB upload failed: Invalid response structure', response.data);
      return null;
    }
  } catch (error) {
    console.error('Error uploading image to ImgBB:', error.response ? error.response.data : error.message);
    return null;
  }
};
