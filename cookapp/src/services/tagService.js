const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Obtener tags de un restaurante (público)
export const getTagsByRestaurant = async (restaurantId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tags/restaurant/${restaurantId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting tags by restaurant:', error);
    throw error;
  }
};

// Obtener tag por ID
export const getTagById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tags/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting tag:', error);
    throw error;
  }
};

// Obtener todos los tags (filtrados por rol del usuario)
export const getAllTags = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tags?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error getting tags');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting all tags:', error);
    throw error;
  }
};

// Crear nuevo tag
export const createTag = async (tagData, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...tagData,
        user_id: userId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error creating tag');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating tag:', error);
    throw error;
  }
};

// Actualizar tag
export const updateTag = async (id, tagData, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...tagData,
        user_id: userId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error updating tag');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating tag:', error);
    throw error;
  }
};

// Desactivar tag
export const deleteTag = async (id, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tags/${id}?user_id=${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error deleting tag');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting tag:', error);
    throw error;
  }
};
