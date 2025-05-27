import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const HomeScreen = ({ user }) => {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.welcomeContainer}>
        <Text style={styles.helloText}>¡Bienvenido {user?.name}!</Text>
        
        <View style={styles.emptyStateContainer}>
          <Ionicons 
            name="restaurant-outline" 
            size={80} 
            color={theme.textSecondary} 
          />
          <Text style={styles.emptyTitle}>No hay restaurantes disponibles</Text>
          <Text style={styles.emptySubtitle}>
            Pronto podrás explorar deliciosos restaurantes cerca de ti
          </Text>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 20,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  helloText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 30,
    textAlign: 'center',
  },
  emptyStateContainer: {
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    padding: 40,
    borderRadius: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default HomeScreen;