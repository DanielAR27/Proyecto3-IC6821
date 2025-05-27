const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Obtener todos los restaurantes
export const getAllRestaurants = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/restaurants`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting restaurants:', error);
    throw error;
  }
};

// Obtener restaurante por ID
export const getRestaurantById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/restaurants/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting restaurant:', error);
    throw error;
  }
};

// Obtener restaurantes por owner
export const getRestaurantsByOwner = async (ownerId, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/restaurants/owner/${ownerId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting restaurants by owner:', error);
    throw error;
  }
};

// Crear nuevo restaurante
export const createRestaurant = async (restaurantData, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...restaurantData,
        user_id: userId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error creating restaurant');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating restaurant:', error);
    throw error;
  }
};

// Actualizar restaurante
export const updateRestaurant = async (id, restaurantData, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/restaurants/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...restaurantData,
        user_id: userId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error updating restaurant');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating restaurant:', error);
    throw error;
  }
};

// Desactivar restaurante
export const deleteRestaurant = async (id, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/restaurants/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error deleting restaurant');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    throw error;
  }
};