import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Modal,
  Image,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';

const RestaurantSelector = ({ 
  restaurants, 
  selectedRestaurant, 
  onSelectRestaurant, 
  disabled = false,
  loading = false 
}) => {
  const { theme } = useTheme();
  const [showModal, setShowModal] = useState(false);

  const handleRestaurantSelect = (restaurant) => {
    onSelectRestaurant(restaurant);
    setShowModal(false);
  };

  const renderRestaurantItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.restaurantItem,
        selectedRestaurant?._id === item._id && styles.restaurantItemSelected
      ]}
      onPress={() => handleRestaurantSelect(item)}
    >
      <Image 
        source={{ 
          uri: item.banner || `https://placehold.co/400x200?text=${encodeURIComponent(item.name)}`
        }} 
        style={styles.restaurantImage}
      />
      <View style={styles.restaurantInfo}>
        <Text style={[styles.restaurantName, { color: theme.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.restaurantAddress, { color: theme.textSecondary }]} numberOfLines={1}>
          {item?.address?.city || 'Sin dirección'}, {item?.address?.province || ''}
        </Text>
      </View>
      {selectedRestaurant?._id === item._id && (
        <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
      )}
    </TouchableOpacity>
  );

  const styles = createStyles(theme);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Restaurante *</Text>
        <View style={styles.loadingSelector}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Cargando restaurantes...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Restaurante *</Text>
      
      <TouchableOpacity
        style={[
          styles.selector,
          disabled && styles.selectorDisabled
        ]}
        onPress={() => !disabled && setShowModal(true)}
        disabled={disabled}
      >
        {selectedRestaurant ? (
          <View style={styles.selectedRestaurantContainer}>
            <Image 
              source={{ 
                uri: selectedRestaurant.banner || `https://placehold.co/400x200?text=${encodeURIComponent(selectedRestaurant.name)}`
              }} 
              style={styles.selectedRestaurantImage}
            />
            <View style={styles.selectedRestaurantInfo}>
              <Text style={[styles.selectedRestaurantName, { color: theme.text }]}>
                {selectedRestaurant.name}
              </Text>
              <Text style={[styles.selectedRestaurantAddress, { color: theme.textSecondary }]}>
                {selectedRestaurant?.address?.city || 'Sin dirección'}, {selectedRestaurant?.address?.province || ''}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={[styles.selectorPlaceholder, { color: theme.textSecondary }]}>
            Seleccionar restaurante
          </Text>
        )}
        
        {!disabled && (
          <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
        )}
      </TouchableOpacity>

      {disabled && (
        <Text style={[styles.disabledText, { color: theme.textSecondary }]}>
          No se puede cambiar el restaurante al editar
        </Text>
      )}

      {/* Modal de selección */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Seleccionar Restaurante
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowModal(false)}
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={restaurants}
              keyExtractor={(item) => item._id}
              renderItem={renderRestaurantItem}
              style={styles.restaurantsList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="restaurant-outline" size={50} color={theme.textSecondary} />
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                    No hay restaurantes disponibles
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 10,
  },
  loadingSelector: {
    backgroundColor: theme.cardBackground,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.cardBackground,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  selectorDisabled: {
    opacity: 0.6,
  },
  selectorPlaceholder: {
    fontSize: 16,
  },
  selectedRestaurantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedRestaurantImage: {
    width: 40,
    height: 30,
    borderRadius: 6,
    marginRight: 12,
    resizeMode: 'cover',
  },
  selectedRestaurantInfo: {
    flex: 1,
  },
  selectedRestaurantName: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedRestaurantAddress: {
    fontSize: 12,
    marginTop: 2,
  },
  disabledText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 5,
  },
  restaurantsList: {
    padding: 20,
  },
  restaurantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: theme.background,
  },
  restaurantItemSelected: {
    borderWidth: 2,
    borderColor: theme.primary,
  },
  restaurantImage: {
    width: 60,
    height: 45,
    borderRadius: 8,
    marginRight: 15,
    resizeMode: 'cover',
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 3,
  },
  restaurantAddress: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
  },
});

export default RestaurantSelector;