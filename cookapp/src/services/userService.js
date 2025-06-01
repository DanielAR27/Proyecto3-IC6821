const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Actualizar perfil de usuario
export const updateProfile = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userData._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar el perfil');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    throw error;
  }
};
