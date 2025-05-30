const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Obtener toppings de un restaurante (público)
export const getToppingsByRestaurant = async (restaurantId, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Agregar filtros si existen
    if (filters.is_available !== undefined) queryParams.append('is_available', filters.is_available);
    if (filters.compatible_with_product) queryParams.append('compatible_with_product', filters.compatible_with_product);
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/toppings/restaurant/${restaurantId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting toppings by restaurant:', error);
    throw error;
  }
};

// Obtener topping por ID (público)
export const getToppingById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/toppings/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting topping:', error);
    throw error;
  }
};

// Obtener todos los toppings (admin/owner)
export const getAllToppings = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/toppings?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error getting toppings');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting all toppings:', error);
    throw error;
  }
};

// Crear nuevo topping (admin/owner)
export const createTopping = async (toppingData, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/toppings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...toppingData,
        user_id: userId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error creating topping');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating topping:', error);
    throw error;
  }
};

// Actualizar topping (admin/owner)
export const updateTopping = async (id, toppingData, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/toppings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...toppingData,
        user_id: userId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error updating topping');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating topping:', error);
    throw error;
  }
};

// Eliminar topping (admin/owner)
export const deleteTopping = async (id, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/toppings/${id}?user_id=${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error deleting topping');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting topping:', error);
    throw error;
  }
};