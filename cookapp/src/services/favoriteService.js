const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Obtener favoritos del usuario
export const getUserFavorites = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/user/${userId}?user_id=${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting user favorites:', error);
    throw error;
  }
};

// Agregar restaurante a favoritos
export const addRestaurantToFavorites = async (userId, restaurantId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        restaurant_id: restaurantId
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error adding restaurant to favorites:', error);
    throw error;
  }
};

// Remover restaurante de favoritos
export const removeRestaurantFromFavorites = async (userId, restaurantId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/restaurants/${restaurantId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error removing restaurant from favorites:', error);
    throw error;
  }
};

// Agregar producto a favoritos
export const addProductToFavorites = async (userId, restaurantId, productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        restaurant_id: restaurantId,
        product_id: productId
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error adding product to favorites:', error);
    throw error;
  }
};

// Remover producto de favoritos
export const removeProductFromFavorites = async (userId, productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error removing product from favorites:', error);
    throw error;
  }
};