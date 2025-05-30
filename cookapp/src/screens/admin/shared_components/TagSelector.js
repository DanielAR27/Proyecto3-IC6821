import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  FlatList,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { getTagsByRestaurant } from '../../../services/tagService';

const TagSelector = ({ 
  restaurantId,
  selectedTags = [], 
  onTagsChange,
  maxTags = 10,
  disabled = false 
}) => {
  const { theme } = useTheme();
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar tags disponibles cuando cambia el restaurante
  useEffect(() => {
    if (restaurantId) {
      loadTags();
    } else {
      setAvailableTags([]);
      setLoading(false);
    }
  }, [restaurantId]);

  const loadTags = async () => {
    try {
      setLoading(true);
      const tags = await getTagsByRestaurant(restaurantId);
      setAvailableTags(tags);
    } catch (error) {
      console.error('Error loading tags:', error);
      Alert.alert('Error', 'No se pudieron cargar los tags disponibles');
      setAvailableTags([]);
    } finally {
      setLoading(false);
    }
  };

  // Manejar selección/deselección de tag
  const handleTagToggle = (tag) => {
    if (disabled) return;

    const isSelected = selectedTags.some(selectedTag => selectedTag._id === tag._id);
    
    if (isSelected) {
      // Remover tag
      const newTags = selectedTags.filter(selectedTag => selectedTag._id !== tag._id);
      onTagsChange(newTags);
    } else {
      // Agregar tag (validar máximo)
      if (selectedTags.length >= maxTags) {
        Alert.alert(
          'Límite alcanzado', 
          `Solo puedes seleccionar máximo ${maxTags} tags`
        );
        return;
      }
      
      const newTags = [...selectedTags, tag];
      onTagsChange(newTags);
    }
  };

  // Renderizar item de tag
  const renderTagItem = ({ item }) => {
    const isSelected = selectedTags.some(selectedTag => selectedTag._id === item._id);
    
    return (
      <TouchableOpacity
        style={[
          styles.tagItem,
          {
            backgroundColor: isSelected ? theme.primary : theme.cardBackground,
            borderColor: isSelected ? theme.primary : theme.border,
            opacity: disabled ? 0.6 : 1
          }
        ]}
        onPress={() => handleTagToggle(item)}
        disabled={disabled}
      >
        <Text style={[
          styles.tagText,
          { color: isSelected ? '#ffffff' : theme.text }
        ]}>
          {item.name}
        </Text>
        
        {isSelected && (
          <Ionicons 
            name="checkmark-circle" 
            size={16} 
            color="#ffffff" 
            style={styles.checkIcon}
          />
        )}
      </TouchableOpacity>
    );
  };

  const styles = createStyles(theme);

  if (!restaurantId) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Tags del Producto</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Selecciona un restaurante primero para ver los tags disponibles
          </Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Tags del Producto</Text>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Cargando tags...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Tags del Producto</Text>
        <Text style={[styles.counter, { color: theme.textSecondary }]}>
          {selectedTags.length}/{maxTags}
        </Text>
      </View>
      
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Selecciona hasta {maxTags} tags que describan las características del producto
      </Text>
      
      {availableTags.length > 0 ? (
        <FlatList
          data={availableTags}
          keyExtractor={(item) => item._id}
          renderItem={renderTagItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false} // Desactivar scroll interno
          style={styles.tagsList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name="pricetag-outline" 
            size={40} 
            color={theme.textSecondary} 
          />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No hay tags disponibles para este restaurante
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Los tags se pueden crear desde el panel de administración
          </Text>
        </View>
      )}
      
      {selectedTags.length > 0 && (
        <View style={styles.selectedContainer}>
          <Text style={[styles.selectedTitle, { color: theme.text }]}>
            Tags seleccionados:
          </Text>
          <View style={styles.selectedTags}>
            {selectedTags.map((tag) => (
              <View 
                key={tag._id} 
                style={[styles.selectedTag, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.selectedTagText}>{tag.name}</Text>
                {!disabled && (
                  <TouchableOpacity 
                    onPress={() => handleTagToggle(tag)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close" size={14} color="#ffffff" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  counter: {
    fontSize: 14,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
  tagsList: {
    maxHeight: 200, // Limitar altura para no ocupar mucho espacio
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tagItem: {
    flex: 0.48,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 45,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
  checkIcon: {
    marginLeft: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  selectedContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: theme.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  selectedTagText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  removeButton: {
    marginLeft: 6,
    padding: 2,
  },
});

export default TagSelector;