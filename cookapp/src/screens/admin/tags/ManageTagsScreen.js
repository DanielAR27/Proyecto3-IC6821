import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  FlatList,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { 
  getAllTags, 
  deleteTag
} from '../../../services/tagService';
import { getRestaurantById } from '../../../services/restaurantService';

const ManageTagsScreen = ({ navigation, user }) => {
  const { theme } = useTheme();
  const [tags, setTags] = useState([]);
  const [groupedTags, setGroupedTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar tags
  const loadTags = useCallback(async () => {
    try {
      setLoading(true);
      const tagsData = await getAllTags(user?._id);
      setTags(tagsData);
      groupTagsByRestaurant(tagsData);
    } catch (error) {
      console.error('Error loading tags:', error);
      Alert.alert('Error', 'No se pudieron cargar los tags');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Agrupar tags por restaurante
  const groupTagsByRestaurant = (tagsData) => {
    const grouped = tagsData.reduce((acc, tag) => {
      const restaurantId = tag.restaurant_id._id;
      const restaurantName = tag.restaurant_id.name;
      
      if (!acc[restaurantId]) {
        acc[restaurantId] = {
          restaurant: {
            _id: restaurantId,
            name: restaurantName
          },
          tags: []
        };
      }
      
      acc[restaurantId].tags.push(tag);
      return acc;
    }, {});

    // Convertir a array y ordenar tags por nombre
    const groupedArray = Object.values(grouped).map(group => ({
      ...group,
      tags: group.tags.sort((a, b) => a.name.localeCompare(b.name))
    }));

    // Ordenar grupos por nombre de restaurante
    groupedArray.sort((a, b) => a.restaurant.name.localeCompare(b.restaurant.name));
    
    setGroupedTags(groupedArray);
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    loadTags();
  }, [loadTags]);

  // Escuchar cuando regrese de otras pantallas para recargar datos
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTags();
    });

    return unsubscribe;
  }, [navigation, loadTags]);

  // Refresh pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTags();
    setRefreshing(false);
  }, [loadTags]);

  // Navegar a agregar tag
  const handleAddTag = () => {
    navigation.navigate('AddTag', { user });
  };

  // Navegar a editar tag
  const handleEditTag = async (tag) => {
    try {
      // Cargar restaurante completo con address
      const fullRestaurant = await getRestaurantById(tag.restaurant_id._id);
      
      navigation.navigate('AddTag', { 
        user,
        tag: {
          ...tag,
          restaurant_id: fullRestaurant // Reemplazar con el restaurante completo
        },
        isEdit: true
      });
    } catch (error) {
      console.error('Error loading restaurant details:', error);
      // Fallback: navegar con datos incompletos
      navigation.navigate('AddTag', { 
        user,
        tag,
        isEdit: true
      });
    }
  };

  // Eliminar tag
  const handleDeleteTag = (tag) => {
    Alert.alert(
      'Eliminar Tag',
      `¿Está seguro de que desea eliminar "${tag.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => confirmDeleteTag(tag)
        }
      ]
    );
  };

  const confirmDeleteTag = async (tag) => {
    try {
      await deleteTag(tag._id, user?._id);
      Alert.alert('¡Éxito!', 'Tag eliminado exitosamente');
      loadTags(); // Recargar lista
    } catch (error) {
      console.error('Error deleting tag:', error);
      Alert.alert('Error', error.message || 'No se pudo eliminar el tag');
    }
  };

  // Renderizar item de tag
  const renderTagItem = (tag) => (
    <View 
      key={tag._id}
      style={[
        styles.tagItem,
        !tag.is_active && styles.tagItemInactive
      ]}
    >
      <View style={styles.tagInfo}>
        <Text style={[
          styles.tagName, 
          { color: tag.is_active ? theme.text : theme.textSecondary }
        ]}>
          {tag.name}
        </Text>
        {!tag.is_active && (
          <View style={styles.inactiveBadge}>
            <Text style={styles.inactiveBadgeText}>Inactivo</Text>
          </View>
        )}
      </View>
      
      <View style={styles.tagActions}>
        {tag.is_active && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              onPress={() => handleEditTag(tag)}
            >
              <Ionicons name="pencil" size={16} color="#ffffff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.danger }]}
              onPress={() => handleDeleteTag(tag)}
            >
              <Ionicons name="trash" size={16} color="#ffffff" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  // Renderizar grupo de restaurante
  const renderRestaurantGroup = ({ item }) => (
    <View style={styles.restaurantGroup}>
      <View style={styles.restaurantHeader}>
        <Ionicons name="restaurant" size={20} color={theme.primary} />
        <Text style={[styles.restaurantName, { color: theme.text }]}>
          {item.restaurant.name}
        </Text>
        <Text style={[styles.tagCount, { color: theme.textSecondary }]}>
          ({item.tags.length} {item.tags.length === 1 ? 'tag' : 'tags'})
        </Text>
      </View>
      
      <View style={styles.tagsList}>
        {item.tags.map(tag => renderTagItem(tag))}
      </View>
    </View>
  );

  // Componente de estado vacío
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="pricetag-outline" 
        size={60} 
        color={theme.textSecondary} 
      />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        No hay tags creados
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Los tags ayudan a identificar características especiales de los productos
      </Text>
    </View>
  );

  const styles = createStyles(theme);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gestionar Tags</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddTag}>
            <Ionicons name="add" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Cargando tags...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestionar Tags</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddTag}>
          <Ionicons name="add" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Lista de tags agrupados por restaurante */}
      <FlatList
        data={groupedTags}
        keyExtractor={(item) => item.restaurant._id}
        renderItem={renderRestaurantGroup}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={EmptyState}
      />
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: theme.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.background,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  listContainer: {
    padding: 20,
  },
  restaurantGroup: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  tagCount: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  tagsList: {
    padding: 10,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginVertical: 2,
    borderRadius: 8,
    backgroundColor: theme.background,
  },
  tagItemInactive: {
    opacity: 0.6,
  },
  tagInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tagName: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 10,
  },
  inactiveBadge: {
    backgroundColor: theme.textSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  inactiveBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '500',
  },
  tagActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});

export default ManageTagsScreen;