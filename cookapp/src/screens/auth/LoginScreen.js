import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useTheme } from "../../context/ThemeContext";
import { checkUserExists, getGoogleUserInfo } from "../../services/authService";
import Constants from "expo-constants";

// Configuración básica de WebBrowser
WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ onLogin, onNeedsProfile }) => {
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  // Configuración Google Auth simplificada
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      Constants.expoConfig.extra.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,

    scopes: ["profile", "email"],
  });

  // Manejar respuesta de Google
  useEffect(() => {
    if (response?.type === "success") {
      handleGoogleSuccess(response.authentication.accessToken);
    } else if (response?.type === "error") {
      console.error("Google Auth Error:", response.error);
      Alert.alert("Error", "Error en la autenticación con Google");
    }
  }, [response]);

  const handleGoogleSuccess = async (accessToken) => {
    try {
      setLoading(true);

      // 1. Obtener info del usuario de Google
      const googleUser = await getGoogleUserInfo(accessToken);
      console.log("Google user:", googleUser.name);

      // 2. Verificar si existe en nuestra BD
      const { exists, user } = await checkUserExists(googleUser.id);

      if (exists) {
        // Usuario existe → ir directo a Home
        console.log("Usuario existe, redirigiendo a Home");
        onLogin(user);
      } else {
        // Usuario no existe → necesita completar perfil
        console.log("Usuario nuevo, necesita completar perfil");
        onNeedsProfile({
          google_id: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          profile_image: googleUser.picture,
        });
      }
    } catch (error) {
      console.error("Error en login:", error);
      Alert.alert("Error", "No se pudo completar el login. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!request) {
      console.log("Request no está listo");
      return;
    }

    console.log("Iniciando Google Auth...");
    setLoading(true);

    try {
      const result = await promptAsync();
      console.log("Resultado completo:", JSON.stringify(result, null, 2));
    } catch (error) {
      console.error("Error completo en promptAsync:", error);
      Alert.alert("Error", `Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>¡Bienvenido a Cocina Express!</Text>
        <Text style={styles.subtitle}>
          Descubre los mejores platillos preparados a tu gusto
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            (loading || !request) && styles.buttonDisabled,
          ]}
          onPress={handleLogin}
          disabled={loading || !request}
        >
          <Image
            source={require("../../../assets/g-logo.png")}
            style={styles.googleIcon}
            resizeMode="contain"
          />
          <Text style={styles.buttonText}>
            {loading ? "Iniciando sesión..." : "Continuar con Google"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Al continuar, aceptas nuestros términos de servicio
        </Text>

        {/* Debug info */}
      </View>
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      justifyContent: "center",
      padding: 20,
    },
    contentContainer: {
      backgroundColor: theme.cardBackground,
      padding: 30,
      borderRadius: 20,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 10,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      marginBottom: 30,
      textAlign: "center",
      lineHeight: 22,
    },
    button: {
      backgroundColor: "#2b7abc",
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 25,
      marginBottom: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    buttonDisabled: {
      backgroundColor: "#cccccc",
    },
    googleIcon: {
      width: 20,
      height: 20,
      marginRight: 10,
    },
    buttonText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "600",
      textAlign: "center",
    },
    footerText: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: "center",
    },
    debugText: {
      fontSize: 10,
      color: theme.textSecondary,
      textAlign: "center",
      marginTop: 10,
    },
  });

export default LoginScreen;
