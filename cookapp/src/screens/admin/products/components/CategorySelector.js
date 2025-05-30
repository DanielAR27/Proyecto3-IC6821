import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Modal,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../context/ThemeContext';

const CategorySelector = ({ 
  categories, 
  selectedCategory, 
  onSelectCategory, 
  restaurantId,
  disabled = false,
  loading = false 
}) => {
  const { theme } = useTheme();
  const [showModal, setShowModal] = useState(false);

  const handleCategorySelect = (category) => {
    onSelectCategory(category);
    setShowModal(false);
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory?._id === item._id && styles.categoryItemSelected
      ]}
      onPress={() => handleCategorySelect(item)}
    >
      <View style={styles.categoryInfo}>
        <Text style={[styles.categoryName, { color: theme.text }]}>
          {item.name}
        </Text>
        {item.description && (
          <Text style={[styles.categoryDescription, { color: theme.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
      {selectedCategory?._id === item._id && (
        <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
      )}
    </TouchableOpacity>
  );

  const styles = createStyles(theme);

  if (!restaurantId) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Categoría *</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Selecciona un restaurante para ver las categorías disponibles
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Categoría *</Text>
        <View style={styles.loadingSelector}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Cargando categorías...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Categoría *</Text>
      
      <TouchableOpacity
        style={[
          styles.selector,
          disabled && styles.selectorDisabled
        ]}
        onPress={() => !disabled && setShowModal(true)}
        disabled={disabled}
      >
        {selectedCategory ? (
          <View style={styles.selectedCategoryContainer}>
            <Text style={[styles.selectedCategoryName, { color: theme.text }]}>
              {selectedCategory.name}
            </Text>
            {selectedCategory.description && (
              <Text style={[styles.selectedCategoryDescription, { color: theme.textSecondary }]}>
                {selectedCategory.description}
              </Text>
            )}
          </View>
        ) : (
          <Text style={[styles.selectorPlaceholder, { color: theme.textSecondary }]}>
            Seleccionar categoría
          </Text>
        )}
        
        {!disabled && (
          <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
        )}
      </TouchableOpacity>

      {disabled && (
        <Text style={[styles.disabledText, { color: theme.textSecondary }]}>
          No se puede cambiar la categoría al editar
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
                Seleccionar Categoría
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowModal(false)}
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={categories}
              keyExtractor={(item) => item._id}
              renderItem={renderCategoryItem}
              style={styles.categoriesList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="albums-outline" size={50} color={theme.textSecondary} />
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                    No hay categorías disponibles
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
  selectedCategoryContainer: {
    flex: 1,
  },
  selectedCategoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedCategoryDescription: {
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
  categoriesList: {
    padding: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: theme.background,
  },
  categoryItemSelected: {
    borderWidth: 2,
    borderColor: theme.primary,
  },
  categoryInfo: {
    flex: 1,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 3,
  },
  categoryDescription: {
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
  subtitle: {
    fontSize: 14,
    marginTop: 40,
    marginBottom: 15,
    lineHeight: 20,
    textAlign: 'center',
  }
});

export default CategorySelector;