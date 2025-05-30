import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

const NutritionalInfoForm = ({ 
  nutritionalInfo, 
  onNutritionalInfoChange,
  disabled = false 
}) => {
  const { theme } = useTheme();

  const handleInputChange = (field, value) => {
    // Validar que sea un número válido o vacío
    if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
      onNutritionalInfoChange({
        ...nutritionalInfo,
        [field]: value === '' ? null : parseFloat(value)
      });
    }
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Información Nutricional (Opcional)</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Información por porción del producto
      </Text>
      
      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Calorías</Text>
          <TextInput
            style={[styles.input, disabled && styles.inputDisabled]}
            placeholder="520"
            placeholderTextColor={theme.textSecondary}
            value={nutritionalInfo.calories?.toString() || ''}
            onChangeText={(value) => handleInputChange('calories', value)}
            keyboardType="numeric"
            editable={!disabled}
          />
        </View>
        
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Proteínas (g)</Text>
          <TextInput
            style={[styles.input, disabled && styles.inputDisabled]}
            placeholder="25"
            placeholderTextColor={theme.textSecondary}
            value={nutritionalInfo.protein?.toString() || ''}
            onChangeText={(value) => handleInputChange('protein', value)}
            keyboardType="numeric"
            editable={!disabled}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Carbohidratos (g)</Text>
          <TextInput
            style={[styles.input, disabled && styles.inputDisabled]}
            placeholder="35"
            placeholderTextColor={theme.textSecondary}
            value={nutritionalInfo.carbs?.toString() || ''}
            onChangeText={(value) => handleInputChange('carbs', value)}
            keyboardType="numeric"
            editable={!disabled}
          />
        </View>
        
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Grasas (g)</Text>
          <TextInput
            style={[styles.input, disabled && styles.inputDisabled]}
            placeholder="18"
            placeholderTextColor={theme.textSecondary}
            value={nutritionalInfo.fat?.toString() || ''}
            onChangeText={(value) => handleInputChange('fat', value)}
            keyboardType="numeric"
            editable={!disabled}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Fibra (g)</Text>
          <TextInput
            style={[styles.input, disabled && styles.inputDisabled]}
            placeholder="3"
            placeholderTextColor={theme.textSecondary}
            value={nutritionalInfo.fiber?.toString() || ''}
            onChangeText={(value) => handleInputChange('fiber', value)}
            keyboardType="numeric"
            editable={!disabled}
          />
        </View>
        
        <View style={styles.spacer} />
      </View>
      
      <Text style={[styles.helperText, { color: theme.textSecondary }]}>
        Todos los campos son opcionales. Solo completa los que conoces.
      </Text>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  halfWidth: {
    flex: 1,
    marginRight: 10,
  },
  spacer: {
    flex: 1,
    marginLeft: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 8,
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
  },
  inputDisabled: {
    backgroundColor: theme.background,
    opacity: 0.6,
  },
  helperText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 10,
    lineHeight: 18,
  },
});

export default NutritionalInfoForm;