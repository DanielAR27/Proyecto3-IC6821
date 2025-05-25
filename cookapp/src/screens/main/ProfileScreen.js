import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const ProfileScreen = ({ user, onLogout }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();

  const handleUpdateProfile = () => {
    Alert.alert('Próximamente', 'La función de actualizar datos estará disponible pronto');
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', onPress: onLogout, style: 'destructive' }
      ]
    );
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cuenta</Text>
      </View>

      <View style={styles.profileContainer}>
        {user?.profile_image && (
          <Image 
            source={{ uri: user.profile_image }} 
            style={styles.profilePic} 
          />
        )}
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {/* Cambiar Tema */}
        <TouchableOpacity style={styles.optionItem} onPress={toggleTheme}>
          <View style={styles.optionLeft}>
            <Ionicons 
              name={isDarkMode ? 'sunny' : 'moon'} 
              size={24} 
              color={theme.text} 
            />
            <Text style={styles.optionText}>
              Cambiar a modo {isDarkMode ? 'claro' : 'oscuro'}
            </Text>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={theme.textSecondary} 
          />
        </TouchableOpacity>

        {/* Actualizar Datos */}
        <TouchableOpacity style={styles.optionItem} onPress={handleUpdateProfile}>
          <View style={styles.optionLeft}>
            <Ionicons 
              name="person-outline" 
              size={24} 
              color={theme.text} 
            />
            <Text style={styles.optionText}>Actualizar Datos Personales</Text>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={theme.textSecondary} 
          />
        </TouchableOpacity>

        {/* Cerrar Sesión */}
        <TouchableOpacity style={[styles.optionItem, styles.lastOptionItem]} onPress={handleLogout}>
          <View style={styles.optionLeft}>
            <Ionicons 
              name="log-out-outline" 
              size={24} 
              color={theme.danger} 
            />
            <Text style={[styles.optionText, { color: theme.danger }]}>
              Cerrar Sesión
            </Text>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={theme.textSecondary} 
          />
        </TouchableOpacity>
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
  profileContainer: {
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    padding: 30,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: theme.primary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  optionsContainer: {
    backgroundColor: theme.cardBackground,
    marginHorizontal: 20,
    marginTop: 20,
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
  lastOptionItem: {
    borderBottomWidth: 0, // Sin línea en el último elemento
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
});

export default ProfileScreen;