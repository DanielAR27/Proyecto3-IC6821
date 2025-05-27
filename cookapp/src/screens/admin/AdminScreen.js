import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const AdminScreen = ({ user, navigation }) => {
  const { theme } = useTheme();

  const handleAddRestaurant = () => {
    navigation.navigate('AddRestaurant');
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Administración</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.welcomeSection}>
          <Ionicons 
            name="settings-outline" 
            size={60} 
            color={theme.primary} 
          />
          <Text style={styles.title}>Panel de Administración</Text>
          <Text style={styles.roleText}>
            Rol actual: {user?.role}
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {/* Opción: Agregar Restaurante - SOLO ADMINS */}
          {user?.role === 'admin' && (
            <TouchableOpacity style={styles.optionItem} onPress={handleAddRestaurant}>
              <View style={styles.optionLeft}>
                <Ionicons 
                  name="restaurant-outline" 
                  size={24} 
                  color={theme.text} 
                />
                <Text style={styles.optionText}>Agregar un Restaurante</Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={theme.textSecondary} 
              />
            </TouchableOpacity>
          )}

          {/* Gestionar Restaurantes - OWNERS y ADMINS */}
          <TouchableOpacity style={styles.optionItem} disabled>
            <View style={styles.optionLeft}>
              <Ionicons 
                name="list-outline" 
                size={24} 
                color={theme.textSecondary} 
              />
              <Text style={[styles.optionText, { color: theme.textSecondary }]}>
                {user?.role === 'admin' ? 'Gestionar Todos los Restaurantes' : 'Gestionar Mis Restaurantes'}
              </Text>
            </View>
            <Text style={styles.comingSoon}>Próximamente</Text>
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
      </View>
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
});

export default AdminScreen;