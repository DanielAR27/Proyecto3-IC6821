const API_BASE_URL = 'https://cocina-express-api.onrender.com/api';

// Verificar si usuario existe por Google ID
export const checkUserExists = async (googleId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/google/${googleId}`);
    
    if (response.status === 404) {
      return { exists: false, user: null };
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { exists: true, user: data.data };
  } catch (error) {
    console.error('Error checking user:', error);
    throw error;
  }
};

// Crear nuevo usuario
export const createUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error creating user');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Obtener información del usuario de Google
export const getGoogleUserInfo = async (accessToken) => {
  try {
    const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting Google user info:', error);
    throw error;
  }
};