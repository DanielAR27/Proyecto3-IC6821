import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput,
  TouchableOpacity
} from 'react-native';
import { useTheme } from '../../../../context/ThemeContext';

const ScheduleForm = ({ formData, onScheduleChange, onToggleDay }) => {
  const { theme } = useTheme();

  const days = [
    { key: 'monday', label: 'Lunes' },
    { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miércoles' },
    { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' },
  ];

  const renderScheduleDay = (day, label) => (
    <View key={day} style={styles.scheduleDay}>
      <View style={styles.scheduleDayHeader}>
        <Text style={[styles.scheduleDayLabel, { color: theme.text }]}>{label}</Text>
        <TouchableOpacity
          style={styles.scheduleToggle}
          onPress={() => onToggleDay(day)}
        >
          <Text style={[
            styles.scheduleToggleText,
            { color: formData[day].closed ? theme.danger : theme.success }
          ]}>
            {formData[day].closed ? 'Cerrado' : 'Abierto'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {!formData[day].closed && (
        <View style={styles.scheduleInputs}>
          <TextInput
            style={[styles.scheduleInput, { 
              backgroundColor: theme.background,
              borderColor: theme.border,
              color: theme.text 
            }]}
            placeholder="09:00"
            placeholderTextColor={theme.textSecondary}
            value={formData[day].open}
            onChangeText={(value) => onScheduleChange(day, 'open', value)}
          />
          <Text style={[styles.scheduleText, { color: theme.text }]}>a</Text>
          <TextInput
            style={[styles.scheduleInput, { 
              backgroundColor: theme.background,
              borderColor: theme.border,
              color: theme.text 
            }]}
            placeholder="18:00"
            placeholderTextColor={theme.textSecondary}
            value={formData[day].close}
            onChangeText={(value) => onScheduleChange(day, 'close', value)}
          />
        </View>
      )}
    </View>
  );

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Horarios de Atención</Text>
      <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
        Configura los horarios de cada día (formato 24 horas)
      </Text>
      
      {days.map(({ key, label }) => renderScheduleDay(key, label))}
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
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  scheduleDay: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  scheduleDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scheduleDayLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  scheduleToggle: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    backgroundColor: theme.background,
  },
  scheduleToggleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  scheduleInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scheduleInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: 'center',
  },
  scheduleText: {
    marginHorizontal: 15,
    fontSize: 16,
  },
});

export default ScheduleForm;