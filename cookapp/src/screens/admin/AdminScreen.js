import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const AdminScreen = ({ user, navigation }) => {
  const { theme } = useTheme();

  const handleAddRestaurant = () => {
    navigation.navigate('AddRestaurant');
  };

  const handleManageRestaurants = () => {
    navigation.navigate('ManageRestaurants');
  };

  const handleManageProducts = () => {
    navigation.navigate('ManageProducts');
  };

  const handleManageToppings = () => {
    navigation.navigate('ManageToppings');
  };

  const handleManageRestaurantTags = () => {
    navigation.navigate('ManageRestaurantTags');
  };

  const handleManageCategories = () => {
    navigation.navigate('ManageCategories');
  };

  const handleManageTags = () => {
    navigation.navigate('ManageTags');
  };
  

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Administración</Text>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          <View style={styles.welcomeSection}>
            <Ionicons 
              name="settings-outline" 
              size={60} 
              color={theme.primary} 
            />
            <Text style={styles.title}>Panel de Administración</Text>
            <Text style={styles.roleText}>
              Rol actual: {user?.role === 'admin' ? 'Administrador' : 'Propietario'}
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {/* Opción: Agregar Restaurante - SOLO ADMINS */}
            {user?.role === 'admin' && (
              <TouchableOpacity style={styles.optionItem} onPress={handleAddRestaurant}>
                <View style={styles.optionLeft}>
                  <Ionicons 
                    name="add-circle-outline" 
                    size={24} 
                    color={theme.text} 
                  />
                  <Text style={styles.optionText}>Agregar Restaurante</Text>
                </View>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={theme.textSecondary} 
                />
              </TouchableOpacity>
            )}

            {/* Gestionar Tags - SOLO ADMINS */}
            {user?.role === 'admin' && (
              <TouchableOpacity style={styles.optionItem} onPress={handleManageRestaurantTags}>
                <View style={styles.optionLeft}>
                  <Ionicons 
                    name="pricetag-outline" 
                    size={24} 
                    color={theme.text} 
                  />
                  <Text style={styles.optionText}>Gestionar Tags Globales</Text>
                </View>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={theme.textSecondary} 
                />
              </TouchableOpacity>
            )}

            {/* Gestionar Categorías - OWNERS y ADMINS */}
            <TouchableOpacity style={styles.optionItem} onPress={handleManageCategories}>
              <View style={styles.optionLeft}>
                <Ionicons 
                  name="albums-outline" 
                  size={24} 
                  color={theme.text} 
                />
                <Text style={styles.optionText}>
                  Gestionar Categorías
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={theme.textSecondary} 
              />
            </TouchableOpacity>

            {/* Gestionar Tags de Productos - OWNERS y ADMINS */}
            <TouchableOpacity style={styles.optionItem} onPress={handleManageTags}>
              <View style={styles.optionLeft}>
                <Ionicons 
                  name="pricetag-outline" 
                  size={24} 
                  color={theme.text} 
                />
                <Text style={styles.optionText}>
                  Gestionar Tags
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={theme.textSecondary} 
              />
            </TouchableOpacity>

            {/* Gestionar Restaurantes - OWNERS y ADMINS */}
            <TouchableOpacity style={styles.optionItem} onPress={handleManageRestaurants}>
              <View style={styles.optionLeft}>
                <Ionicons 
                  name="restaurant-outline" 
                  size={24} 
                  color={theme.text} 
                />
                <Text style={styles.optionText}>
                  Gestionar Restaurantes
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={theme.textSecondary} 
              />
            </TouchableOpacity>

            {/* Gestionar Productos - OWNERS y ADMINS */}
            <TouchableOpacity style={styles.optionItem} onPress={handleManageProducts}>
              <View style={styles.optionLeft}>
                <Ionicons 
                  name="fast-food-outline" 
                  size={24} 
                  color={theme.text} 
                />
                <Text style={styles.optionText}>
                  Gestionar Productos
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={theme.textSecondary} 
              />
            </TouchableOpacity>

            {/* Gestionar Toppings - OWNERS y ADMINS */}
            <TouchableOpacity style={styles.optionItem} onPress={handleManageToppings}>
              <View style={styles.optionLeft}>
                <MaterialIcons 
                  name="food-bank" 
                  size={24} 
                  color={theme.text} 
                />
                <Text style={styles.optionText}>
                  Gestionar Toppings
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={theme.textSecondary} 
              />
            </TouchableOpacity>

            {/* Reportes - SOLO ADMINS */}
            {user?.role === 'admin' && (
              <TouchableOpacity style={styles.optionItem} disabled>
                <View style={styles.optionLeft}>
                  <Ionicons 
                    name="analytics-outline" 
                    size={24} 
                    color={theme.textSecondary} 
                  />
                  <Text style={[styles.optionText, { color: theme.textSecondary }]}>
                    Reportes y Estadísticas
                  </Text>
                </View>
                <Text style={styles.comingSoon}>Próximamente</Text>
              </TouchableOpacity>
            )}

            {/* Gestionar Usuarios - SOLO ADMINS */}
            {user?.role === 'admin' && (
              <TouchableOpacity style={styles.optionItem} disabled>
                <View style={styles.optionLeft}>
                  <Ionicons 
                    name="people-outline" 
                    size={24} 
                    color={theme.textSecondary} 
                  />
                  <Text style={[styles.optionText, { color: theme.textSecondary }]}>
                    Gestionar Usuarios
                  </Text>
                </View>
                <Text style={styles.comingSoon}>Próximamente</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Información adicional */}
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              {user?.role === 'admin' 
                ? 'Como administrador, puedes gestionar todos los aspectos del sistema.'
                : 'Como propietario, puedes gestionar la información de tus restaurantes.'
              }
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: theme.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    padding: 30,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  roleText: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  optionsContainer: {
    backgroundColor: theme.cardBackground,
    borderRadius: 15,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: theme.text,
    marginLeft: 15,
  },
  comingSoon: {
    fontSize: 12,
    color: theme.textSecondary,
    fontStyle: 'italic',
  },
  infoSection: {
    backgroundColor: theme.cardBackground,
    padding: 20,
    borderRadius: 15,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  infoText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AdminScreen;