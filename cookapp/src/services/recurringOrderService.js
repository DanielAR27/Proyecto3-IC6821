import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

class RecurringOrderService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.checkInterval = 60000; // Verificar cada minuto (en producción sería mucho más largo)
  }

  // Iniciar el servicio de monitoreo
  start(recurringOrderContext, orderContext) {
    if (this.isRunning) return;

    this.isRunning = true;
    this.recurringOrderContext = recurringOrderContext;
    this.orderContext = orderContext;

    console.log("🔄 RecurringOrderService started");

    // Verificar inmediatamente
    this.checkPendingOrders();

    // Configurar verificación periódica
    this.intervalId = setInterval(() => {
      this.checkPendingOrders();
    }, this.checkInterval);
  }

  // Detener el servicio
  stop() {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log("⏹️ RecurringOrderService stopped");
  }

  // Verificar pedidos pendientes de ejecución
  async checkPendingOrders() {
    try {
      if (!this.recurringOrderContext || !this.orderContext) return;

      const { getPendingExecutions, executeRecurringOrder } =
        this.recurringOrderContext;
      const { addOrder } = this.orderContext;

      const pendingOrders = getPendingExecutions();

      if (pendingOrders.length > 0) {
        console.log(
          `🔄 Found ${pendingOrders.length} pending recurring orders`
        );

        for (const recurringOrder of pendingOrders) {
          await this.processRecurringOrder(
            recurringOrder,
            executeRecurringOrder,
            addOrder
          );
        }
      }
    } catch (error) {
      console.error("❌ Error checking pending orders:", error);
    }
  }

  // Procesar un pedido recurrente individual
  async processRecurringOrder(recurringOrder, executeRecurringOrder, addOrder) {
    try {
      console.log(`🔄 Processing recurring order: ${recurringOrder.id}`);

      // Verificar que el usuario tenga saldo o método de pago válido
      const isPaymentValid = await this.validatePaymentMethod(recurringOrder);

      if (!isPaymentValid) {
        console.log(
          `❌ Payment validation failed for recurring order: ${recurringOrder.id}`
        );
        this.handlePaymentFailure(recurringOrder);
        return;
      }

      // Ejecutar el pedido recurrente
      const newOrderId = executeRecurringOrder(recurringOrder.id, addOrder);

      if (newOrderId) {
        console.log(
          `✅ Successfully executed recurring order: ${recurringOrder.id} -> ${newOrderId}`
        );

        // Mostrar notificación al usuario
        this.showSuccessNotification(recurringOrder, newOrderId);

        // Guardar en historial de ejecuciones automáticas
        await this.saveExecutionLog(recurringOrder.id, newOrderId, "success");
      }
    } catch (error) {
      console.error(
        `❌ Error processing recurring order ${recurringOrder.id}:`,
        error
      );
      await this.saveExecutionLog(
        recurringOrder.id,
        null,
        "error",
        error.message
      );
    }
  }

  // Validar método de pago
  async validatePaymentMethod(recurringOrder) {
    try {
      const { paymentMethod } = recurringOrder;

      if (!paymentMethod) return false;

      // Si es billetera, verificar saldo
      if (paymentMethod.type === "wallet") {
        // En una app real, aquí consultarías el saldo actual del usuario
        // Por ahora, simulamos que siempre hay saldo suficiente
        return true;
      }

      // Si es tarjeta, verificar que esté activa
      if (paymentMethod.type === "card") {
        // En una app real, aquí verificarías con el procesador de pagos
        // Por ahora, simulamos que siempre es válida
        return true;
      }

      // Si es efectivo, siempre es válido
      if (paymentMethod.type === "cash") {
        return true;
      }

      return false;
    } catch (error) {
      console.error("❌ Error validating payment method:", error);
      return false;
    }
  }

  // Manejar fallo de pago
  handlePaymentFailure(recurringOrder) {
    // En una app real, aquí podrías:
    // 1. Pausar automáticamente el pedido recurrente
    // 2. Enviar notificación push al usuario
    // 3. Enviar email de aviso
    // 4. Intentar método de pago alternativo

    console.log(`⚠️ Payment failed for recurring order: ${recurringOrder.id}`);

    Alert.alert(
      "Problema con el pago",
      `No se pudo procesar el pago para tu pedido recurrente de ${recurringOrder.restaurant?.name}. Revisa tu método de pago.`,
      [
        {
          text: "Revisar",
          onPress: () => {
            // Aquí navegarías a la pantalla de métodos de pago
          },
        },
      ]
    );
  }

  // Mostrar notificación de éxito
  showSuccessNotification(recurringOrder, orderId) {
    // En una app real, aquí usarías notificaciones push
    Alert.alert(
      "¡Pedido automático creado!",
      `Tu pedido recurrente de ${
        recurringOrder.restaurant?.name
      } ha sido procesado exitosamente.\n\nNúmero de pedido: ${orderId
        .slice(-8)
        .toUpperCase()}`,
      [
        {
          text: "Ver Pedido",
          onPress: () => {
            // Aquí navegarías a la pantalla de pedidos
          },
        },
        {
          text: "OK",
          style: "cancel",
        },
      ]
    );
  }

  // Guardar log de ejecución
  async saveExecutionLog(
    recurringOrderId,
    orderId,
    status,
    errorMessage = null
  ) {
    try {
      const logEntry = {
        recurringOrderId,
        orderId,
        status,
        timestamp: new Date().toISOString(),
        errorMessage,
      };

      // Cargar logs existentes
      const existingLogs = await AsyncStorage.getItem(
        "@recurring_execution_logs"
      );
      const logs = existingLogs ? JSON.parse(existingLogs) : [];

      // Agregar nuevo log
      logs.unshift(logEntry);

      // Mantener solo los últimos 100 logs
      if (logs.length > 100) {
        logs.splice(100);
      }

      // Guardar logs actualizados
      await AsyncStorage.setItem(
        "@recurring_execution_logs",
        JSON.stringify(logs)
      );

      console.log(
        `📝 Execution log saved for recurring order: ${recurringOrderId}`
      );
    } catch (error) {
      console.error("❌ Error saving execution log:", error);
    }
  }

  // Obtener logs de ejecución
  async getExecutionLogs() {
    try {
      const logs = await AsyncStorage.getItem("@recurring_execution_logs");
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error("❌ Error getting execution logs:", error);
      return [];
    }
  }

  // Limpiar logs antiguos
  async clearOldLogs(daysToKeep = 30) {
    try {
      const logs = await this.getExecutionLogs();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const filteredLogs = logs.filter(
        (log) => new Date(log.timestamp) > cutoffDate
      );

      await AsyncStorage.setItem(
        "@recurring_execution_logs",
        JSON.stringify(filteredLogs)
      );

      console.log(
        `🧹 Cleared old execution logs, kept ${filteredLogs.length} recent logs`
      );
    } catch (error) {
      console.error("❌ Error clearing old logs:", error);
    }
  }

  // Simular ejecución manual de todos los pedidos pendientes
  async executeAllPending() {
    try {
      if (!this.recurringOrderContext || !this.orderContext) {
        throw new Error("Service not properly initialized");
      }

      const { getPendingExecutions, executeRecurringOrder } =
        this.recurringOrderContext;
      const { addOrder } = this.orderContext;

      const pendingOrders = getPendingExecutions();

      if (pendingOrders.length === 0) {
        Alert.alert(
          "Sin pedidos pendientes",
          "No hay pedidos recurrentes pendientes de ejecución."
        );
        return;
      }

      Alert.alert(
        "Ejecutar pedidos pendientes",
        `¿Quieres ejecutar ${pendingOrders.length} pedido${
          pendingOrders.length !== 1 ? "s" : ""
        } recurrente${pendingOrders.length !== 1 ? "s" : ""} pendiente${
          pendingOrders.length !== 1 ? "s" : ""
        }?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Ejecutar",
            onPress: async () => {
              for (const recurringOrder of pendingOrders) {
                await this.processRecurringOrder(
                  recurringOrder,
                  executeRecurringOrder,
                  addOrder
                );
              }
              Alert.alert(
                "¡Completado!",
                "Todos los pedidos pendientes han sido procesados."
              );
            },
          },
        ]
      );
    } catch (error) {
      console.error("❌ Error executing all pending orders:", error);
      Alert.alert("Error", "No se pudieron ejecutar los pedidos pendientes.");
    }
  }

  // Obtener estadísticas del servicio
  async getServiceStats() {
    try {
      const logs = await this.getExecutionLogs();

      const successfulExecutions = logs.filter(
        (log) => log.status === "success"
      ).length;
      const failedExecutions = logs.filter(
        (log) => log.status === "error"
      ).length;
      const totalExecutions = logs.length;

      const last24Hours = logs.filter((log) => {
        const logDate = new Date(log.timestamp);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return logDate > yesterday;
      }).length;

      return {
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        successRate:
          totalExecutions > 0
            ? ((successfulExecutions / totalExecutions) * 100).toFixed(1)
            : 0,
        executionsLast24h: last24Hours,
        isRunning: this.isRunning,
      };
    } catch (error) {
      console.error("❌ Error getting service stats:", error);
      return {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        successRate: 0,
        executionsLast24h: 0,
        isRunning: this.isRunning,
      };
    }
  }
}

// Crear instancia singleton
const recurringOrderService = new RecurringOrderService();

export default recurringOrderService;

// Funciones de utilidad para usar en los componentes
export const startRecurringOrderService = (
  recurringOrderContext,
  orderContext
) => {
  recurringOrderService.start(recurringOrderContext, orderContext);
};

export const stopRecurringOrderService = () => {
  recurringOrderService.stop();
};

export const executeAllPendingOrders = async () => {
  await recurringOrderService.executeAllPending();
};

export const getRecurringOrderStats = async () => {
  return await recurringOrderService.getServiceStats();
};

export const clearOldExecutionLogs = async (daysToKeep) => {
  await recurringOrderService.clearOldLogs(daysToKeep);
};
