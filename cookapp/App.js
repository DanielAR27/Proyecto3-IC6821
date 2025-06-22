import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";

// Importar pantallas y contextos
import LoginScreen from "./src/screens/auth/LoginScreen";
import CompleteProfileScreen from "./src/screens/auth/CompleteProfileScreen";
import MainTabNavigator from "./src/screens/MainTabNavigator";
import { ThemeProvider } from "./src/context/ThemeContext";
import { FavoritesProvider } from "./src/context/FavoritesContext";
import { CartProvider } from "./src/context/CartContext";
import { OrderProvider } from "./src/context/OrderContext";
// 🆕 Importar el contexto de pedidos recurrentes
import { RecurringOrderProvider } from "./src/context/RecurringOrderContext";

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [user, setUser] = useState(null);
  const [googleUserData, setGoogleUserData] = useState(null);
  const [currentScreen, setCurrentScreen] = useState("loading"); // 'loading', 'login', 'complete_profile', 'main'

  // Verificar si hay usuario guardado al iniciar
  useEffect(() => {
    checkStoredUser();
  }, []);

  const checkStoredUser = async () => {
    try {
      const userData = await AsyncStorage.getItem("@user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setCurrentScreen("main");
      } else {
        setCurrentScreen("login");
      }
    } catch (error) {
      console.error("Error loading user:", error);
      setCurrentScreen("login");
    }
  };

  // Manejar login exitoso (usuario existe)
  const handleLogin = async (userData) => {
    try {
      await AsyncStorage.setItem("@user", JSON.stringify(userData));
      setUser(userData);
      setCurrentScreen("main");
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  // Manejar cuando usuario necesita completar perfil
  const handleNeedsProfile = (googleData) => {
    setGoogleUserData(googleData);
    setCurrentScreen("complete_profile");
  };

  // Manejar perfil completado
  const handleProfileComplete = async (userData) => {
    try {
      await AsyncStorage.setItem("@user", JSON.stringify(userData));
      setUser(userData);
      setGoogleUserData(null);
      setCurrentScreen("main");
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  // Manejar logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("@user");
      setUser(null);
      setGoogleUserData(null);
      setCurrentScreen("login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <ThemeProvider>
      <FavoritesProvider>
        <CartProvider>
          <OrderProvider>
            {/* 🆕 Envolver con RecurringOrderProvider */}
            <RecurringOrderProvider>
              <NavigationContainer>
                {currentScreen === "loading" && (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Cargando...</Text>
                  </View>
                )}

                {currentScreen === "login" && (
                  <LoginScreen
                    onLogin={handleLogin}
                    onNeedsProfile={handleNeedsProfile}
                  />
                )}

                {currentScreen === "complete_profile" && (
                  <CompleteProfileScreen
                    googleUserData={googleUserData}
                    onComplete={handleProfileComplete}
                  />
                )}

                {currentScreen === "main" && (
                  <MainTabNavigator user={user} onLogout={handleLogout} />
                )}
              </NavigationContainer>
            </RecurringOrderProvider>
            {/* 🆕 Cerrar RecurringOrderProvider */}
          </OrderProvider>
        </CartProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
  },
});
