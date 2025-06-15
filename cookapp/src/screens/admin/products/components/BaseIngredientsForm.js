import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../context/ThemeContext';

const BaseIngredientsForm = ({ 
  baseIngredients = [], 
  onIngredientsChange,
  disabled = false 
}) => {
  const { theme } = useTheme();
  const [newIngredient, setNewIngredient] = useState('');

  // Agregar nuevo ingrediente
  const handleAddIngredient = () => {
    if (!newIngredient.trim()) {
      Alert.alert('Error', 'El ingrediente no puede estar vacío');
      return;
    }

    if (newIngredient.trim().length < 2) {
      Alert.alert('Error', 'El ingrediente debe tener al menos 2 caracteres');
      return;
    }

    // Verificar si ya existe
    const exists = baseIngredients.some(
      ingredient => ingredient.toLowerCase() === newIngredient.trim().toLowerCase()
    );

    if (exists) {
      Alert.alert('Error', 'Este ingrediente ya está en la lista');
      return;
    }

    // Agregar a la lista
    const updatedIngredients = [...baseIngredients, newIngredient.trim()];
    onIngredientsChange(updatedIngredients);
    setNewIngredient('');
  };

  // Remover ingrediente
  const handleRemoveIngredient = (index) => {
    const updatedIngredients = baseIngredients.filter((_, i) => i !== index);
    onIngredientsChange(updatedIngredients);
  };

  // Renderizar cada ingrediente
  const renderIngredientItem = ({ item, index }) => (
    <View style={[styles.ingredientItem, { backgroundColor: theme.surface }]}>
      <View style={styles.ingredientContent}>
        <Ionicons name="nutrition-outline" size={20} color={theme.primary} />
        <Text style={[styles.ingredientText, { color: theme.text }]}>
          {item}
        </Text>
      </View>
      {!disabled && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveIngredient(index)}
        >
          <Ionicons name="close-circle" size={20} color={theme.danger} />
        </TouchableOpacity>
      )}
    </View>
  );

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ingredientes Base</Text>
      <Text style={styles.subtitle}>
        Define los ingredientes que vienen por defecto con este producto
      </Text>

      {/* Input para agregar nuevo ingrediente */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, disabled && styles.inputDisabled]}
          placeholder="Ej: Carne de res, Lechuga, Tomate..."
          placeholderTextColor={theme.textSecondary}
          value={newIngredient}
          onChangeText={setNewIngredient}
          maxLength={50}
          editable={!disabled}
          onSubmitEditing={handleAddIngredient}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[
            styles.addButton,
            disabled && styles.addButtonDisabled,
            { backgroundColor: theme.primary }
          ]}
          onPress={handleAddIngredient}
          disabled={disabled || !newIngredient.trim()}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={[styles.characterCount, { color: theme.textSecondary }]}>
        {newIngredient.length}/50 caracteres
      </Text>

      {/* Lista de ingredientes */}
      {baseIngredients.length > 0 ? (
        <View style={styles.ingredientsList}>
          <Text style={[styles.listTitle, { color: theme.text }]}>
            Ingredientes agregados ({baseIngredients.length})
          </Text>
          <FlatList
            data={baseIngredients}
            renderItem={renderIngredientItem}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="restaurant-outline" size={40} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No hay ingredientes agregados
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Los clientes podrán personalizar este producto quitando o agregando ingredientes
          </Text>
        </View>
      )}

      {/* Contador de ingredientes */}
      <View style={styles.counter}>
        <Text style={[styles.counterText, { color: theme.textSecondary }]}>
          {baseIngredients.length} de 20 ingredientes máximo
        </Text>
      </View>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
    backgroundColor: theme.background,
    marginRight: 8,
  },
  inputDisabled: {
    backgroundColor: theme.disabled,
    color: theme.textSecondary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: theme.disabled,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 16,
  },
  ingredientsList: {
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  ingredientContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ingredientText: {
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  counter: {
    alignItems: 'center',
  },
  counterText: {
    fontSize: 12,
  },
});

export default BaseIngredientsForm;