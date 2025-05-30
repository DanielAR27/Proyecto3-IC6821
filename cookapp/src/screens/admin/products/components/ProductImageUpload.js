import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useTheme } from '../../../../context/ThemeContext';

const ProductImageUpload = ({ productImage, onImageSelected }) => {
  const { theme } = useTheme();

  // Convertir imagen a Base64
  const convertToBase64 = async (imageUri) => {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting to base64:', error);
      throw error;
    }
  };

  const selectImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permisos requeridos', 'Necesitamos acceso a tu galería para subir la imagen');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 2], // Ratio 3:2 para productos
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Validar tamaño del archivo (máximo 2MB para Base64)
        try {
          const fileInfo = await fetch(imageUri);
          const fileSize = parseInt(fileInfo.headers.get('content-length') || '0');
          
          if (fileSize > 2 * 1024 * 1024) { // 2MB
            Alert.alert('Imagen muy grande', 'La imagen debe ser menor a 2MB');
            return;
          }
        } catch (error) {
          console.log('Could not get file size, continuing...');
        }

        // Redimensionar imagen para optimizar Base64
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ resize: { width: 600 } }], // Max 600px width (3:2 ratio)
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        // Convertir a Base64
        const base64Image = await convertToBase64(manipulatedImage.uri);
        
        // Pasar el Base64 al componente padre
        onImageSelected(base64Image);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'No se pudo procesar la imagen');
    }
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Imagen del Producto</Text>
      {productImage ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: productImage }} style={styles.imagePreview} />
          <TouchableOpacity
            style={styles.changeImageButton}
            onPress={selectImage}
          >
            <Ionicons name="camera" size={16} color="#fff" />
            <Text style={styles.changeImageText}>Cambiar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.uploadImage} onPress={selectImage}>
          <Ionicons name="camera-outline" size={40} color={theme.textSecondary} />
          <Text style={[styles.uploadImageText, { color: theme.textSecondary }]}>
            Subir imagen del producto
          </Text>
          <Text style={[styles.uploadImageSubtext, { color: theme.textSecondary }]}>
            Recomendado: 600x400px, máximo 2MB
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 15,
  },
  uploadImage: {
    backgroundColor: theme.cardBackground,
    borderWidth: 2,
    borderColor: theme.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    aspectRatio: 3/2, // Mantener ratio 3:2
  },
  uploadImageText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 10,
  },
  uploadImageSubtext: {
    fontSize: 12,
    marginTop: 5,
  },
  imageContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    aspectRatio: 3/2,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  changeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  changeImageText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
});

export default ProductImageUpload;