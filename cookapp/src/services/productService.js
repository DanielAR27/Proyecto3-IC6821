const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Obtener productos de un restaurante (público)
export const getProductsByRestaurant = async (restaurantId, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Agregar filtros si existen
    if (filters.category_id) queryParams.append('category_id', filters.category_id);
    if (filters.is_available !== undefined) queryParams.append('is_available', filters.is_available);
    if (filters.is_featured !== undefined) queryParams.append('is_featured', filters.is_featured);
    if (filters.min_price) queryParams.append('min_price', filters.min_price);
    if (filters.max_price) queryParams.append('max_price', filters.max_price);
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/products/restaurant/${restaurantId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting products by restaurant:', error);
    throw error;
  }
};

// Obtener producto por ID (público)
export const getProductById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting product:', error);
    throw error;
  }
};

// Buscar productos (público)
export const searchProducts = async (query, restaurantId = null) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    if (restaurantId) queryParams.append('restaurant_id', restaurantId);
    
    const response = await fetch(`${API_BASE_URL}/products/search?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

// Obtener todos los productos (admin/owner)
export const getAllProducts = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error getting products');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting all products:', error);
    throw error;
  }
};

// Crear nuevo producto (admin/owner)
export const createProduct = async (productData, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...productData,
        user_id: userId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error creating product');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Actualizar producto (admin/owner)
export const updateProduct = async (id, productData, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...productData,
        user_id: userId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error updating product');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Eliminar producto (admin/owner)
export const deleteProduct = async (id, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}?user_id=${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error deleting product');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};