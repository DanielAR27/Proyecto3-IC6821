import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const FavoritesScreen = () => {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Ionicons 
          name="heart-outline" 
          size={80} 
          color={theme.textSecondary} 
        />
        <Text style={styles.title}>Nothing yet</Text>
        <Text style={styles.subtitle}>
          Tus restaurantes y platillos favoritos aparecerán aquí
        </Text>
      </View>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentContainer: {
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    padding: 40,
    borderRadius: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
    maxWidth: 300,
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
  },
});

export default FavoritesScreen;