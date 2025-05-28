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
  getAllRestaurantTagsAdmin, 
  deleteRestaurantTag, 
  reactivateRestaurantTag 
} from '../../../services/restaurantTagService';

const ManageRestaurantTagsScreen = ({ navigation, user }) => {
  const { theme } = useTheme();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar tags
  const loadTags = useCallback(async () => {
    try {
      setLoading(true);
      const tagsData = await getAllRestaurantTagsAdmin(user?._id);
      setTags(tagsData);
    } catch (error) {
      console.error('Error loading tags:', error);
      Alert.alert('Error', 'No se pudieron cargar los tags');
    } finally {
      setLoading(false);
    }
  }, [user]);

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
    navigation.navigate('AddRestaurantTag', { user });
  };

  // Navegar a editar tag
  const handleEditTag = (tag) => {
    navigation.navigate('AddRestaurantTag', { 
      user,
      tag,
      isEdit: true
    });
  };

  // Desactivar tag
  const handleDeleteTag = (tag) => {
    Alert.alert(
      'Desactivar Tag',
      `¿Está seguro de que desea desactivar "${tag.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desactivar',
          style: 'destructive',
          onPress: () => confirmDeleteTag(tag)
        }
      ]
    );
  };

  const confirmDeleteTag = async (tag) => {
    try {
      await deleteRestaurantTag(tag._id, user?._id);
      Alert.alert('¡Éxito!', 'Tag desactivado exitosamente');
      loadTags(); // Recargar lista
    } catch (error) {
      console.error('Error deleting tag:', error);
      Alert.alert('Error', error.message || 'No se pudo desactivar el tag');
    }
  };

  // Reactivar tag
  const handleReactivateTag = async (tag) => {
    try {
      await reactivateRestaurantTag(tag._id, user?._id);
      Alert.alert('¡Éxito!', 'Tag reactivado exitosamente');
      loadTags(); // Recargar lista
    } catch (error) {
      console.error('Error reactivating tag:', error);
      Alert.alert('Error', error.message || 'No se pudo reactivar el tag');
    }
  };

  // Renderizar item de tag
  const renderTagItem = ({ item }) => (
    <View style={[
      styles.tagCard,
      !item.is_active && styles.tagCardInactive
    ]}>
      <View style={styles.tagInfo}>
        <View style={styles.tagHeader}>
          <Text style={[
            styles.tagName, 
            { color: item.is_active ? theme.text : theme.textSecondary }
          ]}>
            {item.name}
          </Text>
          {!item.is_active && (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveBadgeText}>Inactivo</Text>
            </View>
          )}
        </View>
        
        <Text style={[styles.tagDate, { color: theme.textSecondary }]}>
          Creado: {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.tagActions}>
        {item.is_active ? (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              onPress={() => handleEditTag(item)}
            >
              <Ionicons name="pencil" size={16} color="#ffffff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.danger }]}
              onPress={() => handleDeleteTag(item)}
            >
              <Ionicons name="trash" size={16} color="#ffffff" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.success }]}
            onPress={() => handleReactivateTag(item)}
          >
            <Ionicons name="refresh" size={16} color="#ffffff" />
          </TouchableOpacity>
        )}
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
        Los tags ayudan a categorizar los restaurantes
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

      {/* Lista de tags */}
      <FlatList
        data={tags}
        keyExtractor={(item) => item._id}
        renderItem={renderTagItem}
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
  tagCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tagCardInactive: {
    opacity: 0.6,
  },
  tagInfo: {
    flex: 1,
  },
  tagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  tagName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  inactiveBadge: {
    backgroundColor: theme.textSecondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  inactiveBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '500',
  },
  tagDate: {
    fontSize: 12,
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

export default ManageRestaurantTagsScreen;