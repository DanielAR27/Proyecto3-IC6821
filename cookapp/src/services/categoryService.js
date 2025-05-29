const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Obtener categorías de un restaurante (público)
export const getCategoriesByRestaurant = async (restaurantId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/restaurant/${restaurantId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting categories by restaurant:', error);
    throw error;
  }
};

// Obtener categoria por ID
export const getCategoryById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting category:', error);
    throw error;
  }
};

// Obtener todas las categorías (filtradas por rol del usuario)
export const getAllCategories = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error getting categories');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting all categories:', error);
    throw error;
  }
};

// Crear nueva categoría
export const createCategory = async (categoryData, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...categoryData,
        user_id: userId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error creating category');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

// Actualizar categoría
export const updateCategory = async (id, categoryData, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...categoryData,
        user_id: userId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error updating category');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

// Desactivar categoría
export const deleteCategory = async (id, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}?user_id=${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error deleting category');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Reordenar categorías de un restaurante
export const reorderCategories = async (restaurantId, categoryOrders, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/restaurant/${restaurantId}/reorder`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category_orders: categoryOrders, // Array de { id, order }
        user_id: userId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error reordering categories');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error reordering categories:', error);
    throw error;
  }
};