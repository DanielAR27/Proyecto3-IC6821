import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput
} from 'react-native';
import { useTheme } from '../../../../context/ThemeContext';

const TagForm = ({ 
  tagName, 
  setTagName,
  disabled = false 
}) => {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {/* Nombre del tag */}
      <Text style={styles.label}>Nombre del Tag *</Text>
      <TextInput
        style={[styles.input, disabled && styles.inputDisabled]}
        placeholder="Ej: Saludable, Sin gluten, Picante, Vegano"
        placeholderTextColor={theme.textSecondary}
        value={tagName}
        onChangeText={setTagName}
        maxLength={30}
        editable={!disabled}
      />
      
      <Text style={[styles.characterCount, { color: theme.textSecondary }]}>
        {tagName.length}/30 caracteres
      </Text>

      <Text style={[styles.helperText, { color: theme.textSecondary }]}>
        Los tags ayudan a los clientes a identificar características especiales de los productos
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
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 10,
  },
  helperText: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 20,
  },
});

export default TagForm;