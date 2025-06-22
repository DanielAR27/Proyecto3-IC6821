import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const RecurringOrderSetup = ({
  visible,
  onClose,
  onSave,
  theme,
  isEnabled,
  onToggle,
  initialConfig = null,
}) => {
  const [frequency, setFrequency] = useState("weekly");
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [customDays, setCustomDays] = useState(7);

  const styles = createStyles(theme);

  // Inicializar con configuración existente si está disponible
  useEffect(() => {
    if (initialConfig) {
      setFrequency(initialConfig.frequency);
      setSelectedDays(initialConfig.days || []);
      setSelectedHour(initialConfig.hour);
      setSelectedMinute(initialConfig.minute);
      setCustomDays(initialConfig.customDays || 7);
    } else {
      // Valores por defecto
      setFrequency("weekly");
      setSelectedDays([1]); // Lunes por defecto
      setSelectedHour(12);
      setSelectedMinute(0);
      setCustomDays(7);
    }
  }, [initialConfig, visible]);

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const frequencies = [
    { key: "daily", label: "Diario", description: "Todos los días" },
    {
      key: "weekly",
      label: "Semanal",
      description: "Días específicos de la semana",
    },
    { key: "monthly", label: "Mensual", description: "Mismo día cada mes" },
    { key: "custom", label: "Personalizado", description: "Cada X días" },
  ];

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  const toggleDay = (dayIndex) => {
    setSelectedDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  const handleSave = () => {
    // Validaciones
    if (frequency === "weekly" && selectedDays.length === 0) {
      Alert.alert("Error", "Selecciona al menos un día de la semana");
      return;
    }

    if (frequency === "custom" && customDays < 1) {
      Alert.alert("Error", "El intervalo debe ser al menos de 1 día");
      return;
    }

    const config = {
      frequency,
      hour: selectedHour,
      minute: selectedMinute,
      days: frequency === "weekly" ? selectedDays : [],
      customDays: frequency === "custom" ? customDays : null,
    };

    onSave(config);

    if (!isEnabled) {
      onToggle(true);
    }

    onClose();
  };

  const formatTime = (hour, minute) => {
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Configurar Repetición</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Guardar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Toggle principal */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Activar repetición automática
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Tu pedido se repetirá según la configuración
                </Text>
              </View>
              <Switch
                value={isEnabled}
                onValueChange={onToggle}
                trackColor={{ false: theme.border, true: theme.primary + "40" }}
                thumbColor={isEnabled ? theme.primary : theme.textSecondary}
              />
            </View>
          </View>

          {isEnabled && (
            <>
              {/* Frecuencia */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Frecuencia</Text>
                {frequencies.map((freq) => (
                  <TouchableOpacity
                    key={freq.key}
                    style={[
                      styles.frequencyOption,
                      frequency === freq.key && styles.selectedOption,
                    ]}
                    onPress={() => setFrequency(freq.key)}
                  >
                    <View style={styles.frequencyContent}>
                      <Text
                        style={[
                          styles.frequencyLabel,
                          frequency === freq.key && styles.selectedText,
                        ]}
                      >
                        {freq.label}
                      </Text>
                      <Text
                        style={[
                          styles.frequencyDescription,
                          frequency === freq.key && styles.selectedText,
                        ]}
                      >
                        {freq.description}
                      </Text>
                    </View>
                    <Ionicons
                      name={
                        frequency === freq.key
                          ? "radio-button-on"
                          : "radio-button-off"
                      }
                      size={24}
                      color={
                        frequency === freq.key
                          ? theme.primary
                          : theme.textSecondary
                      }
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Días de la semana (solo para semanal) */}
              {frequency === "weekly" && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Días de la semana</Text>
                  <View style={styles.daysContainer}>
                    {dayNames.map((day, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.dayButton,
                          selectedDays.includes(index) && styles.selectedDay,
                        ]}
                        onPress={() => toggleDay(index)}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            selectedDays.includes(index) &&
                              styles.selectedDayText,
                          ]}
                        >
                          {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Intervalo personalizado */}
              {frequency === "custom" && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Cada cuántos días</Text>
                  <View style={styles.customDaysContainer}>
                    {[1, 2, 3, 5, 7, 10, 14, 21, 30].map((days) => (
                      <TouchableOpacity
                        key={days}
                        style={[
                          styles.customDayButton,
                          customDays === days && styles.selectedCustomDay,
                        ]}
                        onPress={() => setCustomDays(days)}
                      >
                        <Text
                          style={[
                            styles.customDayText,
                            customDays === days && styles.selectedCustomDayText,
                          ]}
                        >
                          {days} {days === 1 ? "día" : "días"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Hora */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hora de entrega</Text>
                <Text style={styles.currentTime}>
                  Hora seleccionada: {formatTime(selectedHour, selectedMinute)}
                </Text>

                <Text style={styles.timeLabel}>Hora:</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.timeScroll}
                >
                  {hours.map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.timeButton,
                        selectedHour === hour && styles.selectedTime,
                      ]}
                      onPress={() => setSelectedHour(hour)}
                    >
                      <Text
                        style={[
                          styles.timeText,
                          selectedHour === hour && styles.selectedTimeText,
                        ]}
                      >
                        {hour.toString().padStart(2, "0")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.timeLabel}>Minutos:</Text>
                <View style={styles.minutesContainer}>
                  {minutes.map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      style={[
                        styles.minuteButton,
                        selectedMinute === minute && styles.selectedTime,
                      ]}
                      onPress={() => setSelectedMinute(minute)}
                    >
                      <Text
                        style={[
                          styles.timeText,
                          selectedMinute === minute && styles.selectedTimeText,
                        ]}
                      >
                        :{minute.toString().padStart(2, "0")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Resumen */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Resumen</Text>
                <View style={styles.summaryContainer}>
                  <Text style={styles.summaryText}>
                    Tu pedido se repetirá automáticamente:
                  </Text>
                  <Text style={styles.summaryDetail}>
                    {frequency === "daily" &&
                      `Todos los días a las ${formatTime(
                        selectedHour,
                        selectedMinute
                      )}`}
                    {frequency === "weekly" &&
                      `${selectedDays
                        .map((d) => dayNames[d])
                        .join(", ")} a las ${formatTime(
                        selectedHour,
                        selectedMinute
                      )}`}
                    {frequency === "monthly" &&
                      `Mensual a las ${formatTime(
                        selectedHour,
                        selectedMinute
                      )}`}
                    {frequency === "custom" &&
                      `Cada ${customDays} días a las ${formatTime(
                        selectedHour,
                        selectedMinute
                      )}`}
                  </Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 20,
      backgroundColor: theme.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
    },
    saveButton: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.primary,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 4,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    frequencyOption: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      marginTop: 12,
    },
    selectedOption: {
      borderColor: theme.primary,
      backgroundColor: theme.primary + "10",
    },
    frequencyContent: {
      flex: 1,
    },
    frequencyLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
    },
    frequencyDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 2,
    },
    selectedText: {
      color: theme.primary,
    },
    daysContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 12,
    },
    dayButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
    },
    selectedDay: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    dayText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.text,
    },
    selectedDayText: {
      color: "white",
    },
    customDaysContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 12,
    },
    customDayButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    selectedCustomDay: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    customDayText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.text,
    },
    selectedCustomDayText: {
      color: "white",
    },
    currentTime: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.primary,
      marginBottom: 16,
      textAlign: "center",
    },
    timeLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginTop: 16,
      marginBottom: 8,
    },
    timeScroll: {
      marginBottom: 16,
    },
    timeButton: {
      width: 50,
      height: 40,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },
    selectedTime: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    timeText: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.text,
    },
    selectedTimeText: {
      color: "white",
    },
    minutesContainer: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 16,
    },
    minuteButton: {
      flex: 1,
      height: 40,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
    },
    summaryContainer: {
      backgroundColor: theme.background,
      borderRadius: 8,
      padding: 16,
      marginTop: 12,
    },
    summaryText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 8,
    },
    summaryDetail: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.primary,
    },
  });

export default RecurringOrderSetup;
