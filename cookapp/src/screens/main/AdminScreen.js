import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const AdminScreen = ({ user }) => {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Administración</Text>
      </View>

      <View style={styles.contentContainer}>
        <Ionicons 
          name="settings-outline" 
          size={80} 
          color={theme.textSecondary} 
        />
        <Text style={styles.title}>Panel de Administración</Text>
        <Text style={styles.subtitle}>
          {user?.role === 'admin' 
            ? 'Funciones de administrador próximamente'
            : 'Gestión de restaurante próximamente'
          }
        </Text>
        <Text style={styles.roleText}>
          Rol actual: {user?.role}
        </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  roleText: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AdminScreen;