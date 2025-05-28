const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Obtener todos los tags activos (público)
export const getAllRestaurantTags = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/restaurant-tags`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting restaurant tags:', error);
    throw error;
  }
};

// Obtener tag por ID
export const getRestaurantTagById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/restaurant-tags/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting restaurant tag:', error);
    throw error;
  }
};

// Obtener todos los tags incluyendo inactivos (solo admin)
export const getAllRestaurantTagsAdmin = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/restaurant-tags/all?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error getting restaurant tags');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting restaurant tags admin:', error);
    throw error;
  }
};

// Crear nuevo tag (solo admin)
export const createRestaurantTag = async (tagData, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/restaurant-tags`, {
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
      throw new Error(errorData.message || 'Error creating restaurant tag');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating restaurant tag:', error);
    throw error;
  }
};

// Actualizar tag (solo admin)
export const updateRestaurantTag = async (id, tagData, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/restaurant-tags/${id}`, {
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
      throw new Error(errorData.message || 'Error updating restaurant tag');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating restaurant tag:', error);
    throw error;
  }
};

// Desactivar tag (solo admin)
export const deleteRestaurantTag = async (id, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/restaurant-tags/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error deleting restaurant tag');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting restaurant tag:', error);
    throw error;
  }
};

// Reactivar tag (solo admin)
export const reactivateRestaurantTag = async (id, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/restaurant-tags/${id}/reactivate`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error reactivating restaurant tag');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error reactivating restaurant tag:', error);
    throw error;
  }
};