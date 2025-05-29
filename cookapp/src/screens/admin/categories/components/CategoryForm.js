import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput
} from 'react-native';
import { useTheme } from '../../../../context/ThemeContext';

const CategoryForm = ({ 
  categoryName, 
  setCategoryName, 
  categoryDescription, 
  setCategoryDescription, 
  categoryOrder, 
  setCategoryOrder,
  disabled = false 
}) => {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {/* Nombre de la categoría */}
      <Text style={styles.label}>Nombre de la Categoría *</Text>
      <TextInput
        style={[styles.input, disabled && styles.inputDisabled]}
        placeholder="Ej: Hamburguesas, Bebidas, Postres"
        placeholderTextColor={theme.textSecondary}
        value={categoryName}
        onChangeText={setCategoryName}
        maxLength={50}
        editable={!disabled}
      />
      
      <Text style={[styles.characterCount, { color: theme.textSecondary }]}>
        {categoryName.length}/50 caracteres
      </Text>

      {/* Descripción */}
      <Text style={styles.label}>Descripción (Opcional)</Text>
      <TextInput
        style={[styles.input, styles.textArea, disabled && styles.inputDisabled]}
        placeholder="Describe esta categoría..."
        placeholderTextColor={theme.textSecondary}
        value={categoryDescription}
        onChangeText={setCategoryDescription}
        maxLength={200}
        multiline
        numberOfLines={3}
        editable={!disabled}
      />
      
      <Text style={[styles.characterCount, { color: theme.textSecondary }]}>
        {categoryDescription.length}/200 caracteres
      </Text>

      {/* Orden */}
      <Text style={styles.label}>Orden (Opcional)</Text>
      <TextInput
        style={[styles.input, disabled && styles.inputDisabled]}
        placeholder="Ej: 1, 2, 3... (deja vacío para automático)"
        placeholderTextColor={theme.textSecondary}
        value={categoryOrder}
        onChangeText={setCategoryOrder}
        keyboardType="numeric"
        editable={!disabled}
      />
      
      <Text style={[styles.helperText, { color: theme.textSecondary }]}>
        Si no especificas un orden, se asignará automáticamente al final
      </Text>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 10,
    marginTop: 20,
  },
  input: {
    backgroundColor: theme.cardBackground,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
    marginBottom: 5,
  },
  inputDisabled: {
    backgroundColor: theme.background,
    opacity: 0.6,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 10,
  },
  helperText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: -5,
    marginBottom: 20,
  },
});

export default CategoryForm;