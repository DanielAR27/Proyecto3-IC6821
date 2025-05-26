# Cocina Express 🍳📱

**Proyecto Final - Diseño de Software**  
Instituto Tecnológico de Costa Rica - Campus San Carlos  
I Semestre 2025

## 📋 Descripción del Proyecto

Cocina Express es una aplicación de delivery innovadora donde los clientes pueden personalizar completamente la preparación de sus comidas. Las empresas proveedoras ofrecen bases o ingredientes que se adaptan al gusto específico de cada cliente, incluyendo servicios de dieta especial, alimentación por condiciones de salud, control de peso, o simplemente preferencias personales.

### 🎯 Características Principales

- **Personalización Total**: Los clientes especifican exactamente cómo quieren su comida preparada
- **Servicios Flexibles**: Pedidos únicos o servicios continuados de dieta
- **Dietas Especializadas**: Soporte para condiciones especiales de alimentación
- **Experiencia Multiplataforma**: Aplicación móvil para clientes y panel web para administración

## 🏗️ Arquitectura del Proyecto

### Estructura de Directorios

```
COOKAPP/
├── assets/                 # Recursos estáticos
│   └── g-logo.png         # Logo de la aplicación
├── src/
│   ├── screens/           # Pantallas principales
│   │   ├── auth/          # Autenticación
│   │   │   ├── LoginScreen.js
│   │   │   └── CompleteProfileScreen.js
│   │   ├── main/          # Pantallas principales
│   │   │   ├── AdminScreen.js
│   │   │   ├── FavoritesScreen.js
│   │   │   ├── HomeScreen.js
│   │   │   ├── OrdersScreen.js
│   │   │   └── ProfileScreen.js
│   │   └── MainTabNavigator.js
│   ├── components/        # Componentes reutilizables
│   │   ├── CustomTabBar.js
│   │   └── ThemeToggle.js
│   ├── services/          # Servicios y API calls
│   │   └── authService.js
│   ├── context/           # Context providers
│   │   ├── AuthContext.js
│   │   └── ThemeContext.js
│   └── styles/            # Estilos globales
│       └── colors.js
└── App.js                 # Punto de entrada
```

## 🛠️ Stack Tecnológico

### Frontend Móvil
- **React Native**: Framework principal para desarrollo móvil multiplataforma
- **Expo**: Plataforma de desarrollo que facilita el build y deployment
- **React Navigation**: Sistema de navegación con tab navigator personalizado
- **Context API**: Manejo de estado global para autenticación y temas
- **AsyncStorage**: Persistencia local de datos del usuario
- **Expo Auth Session**: Integración con autenticación de Google
- **Expo Vector Icons**: Librería de iconos (Ionicons)

### Autenticación
- **Google OAuth 2.0**: Autenticación mediante Google usando Expo Auth Session
- **JWT Tokens**: Para manejo de sesiones (implementación futura)
- **Flujo de autenticación**: Login → Verificación → Completar perfil → Aplicación principal

### Backend API
- **URL Base**: https://cocina-express-api.onrender.com/api
- **Endpoints principales**:
  - `GET /users/google/{googleId}` - Verificar existencia de usuario
  - `POST /users` - Crear nuevo usuario
- **ORM**: Para abstracción de base de datos y protección contra SQL injection
- **Hosting**: Render (para deployment en la nube)

### Base de Datos
- **Base de datos en línea** (SQL o NoSQL)
- **Mínimo 100 registros** en entidades principales para demostración
- **Estructura de datos**:
  - Usuarios con Google ID, perfil completo, roles
  - Restaurantes y menús personalizables
  - Pedidos con especificaciones detalladas
  - Sistema de favoritos

### Recursos Multimedia
- Soporte para imágenes, videos, audios y texto
- Integración de contenido multimedia en la experiencia del usuario
- Carga y visualización de imágenes de perfil de Google

## 🎨 Diseño UX/UI

### Metáfora de Diseño
El diseño se basa en la metáfora de una **"cocina personalizada"** donde cada cliente es el chef de su propia experiencia culinaria, seleccionando ingredientes y métodos de preparación como si estuviera en su propia cocina.

### Temas
- **Modo Claro/Oscuro**: Implementado a través de ThemeContext
- **Navegación por Pestañas**: Experiencia intuitiva con CustomTabBar

## 👥 Equipo de Desarrollo

- **Tamaño del equipo**: 2-3 personas máximo
- **Metodología**: SCRUM con sprints semanales
- **Herramientas de gestión**: Jira para tracking y documentación

## 📅 Cronograma de Desarrollo

### Sprint #1 (20-26 Mayo 2025)
- [x] Verificación de herramientas de trabajo
- [x] Selección de stack tecnológico
- [x] Configuración del proyecto
- [x] Definición de requerimientos
- [x] Setup inicial de Jira
- [x] Creación de carpeta compartida en Google Drive

### Sprint #2 (27 Mayo - 2 Junio 2025)
- [ ] Implementación de autenticación
- [ ] Desarrollo de pantallas principales
- [ ] Configuración del API básico

### Sprint #3 (3-9 Junio 2025)
- [ ] Funcionalidades de personalización de pedidos
- [ ] Integración con base de datos
- [ ] Implementación de favoritos

### Sprint #4 (10-16 Junio 2025)
- [ ] Sistema de pedidos completo
- [ ] Panel de administración
- [ ] Funcionalidades avanzadas

### Sprint #5 (17-24 Junio 2025)
- [ ] Deployment en plataforma de nube
- [ ] Pruebas finales
- [ ] Optimización y pulido

## 🚀 Instalación y Configuración

### Prerrequisitos
```bash
# Node.js (versión recomendada)
node --version

# React Native CLI
npm install -g react-native-cli

# Expo CLI (si se usa Expo)
npm install -g @expo/cli
```

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/DanielAR27/Proyecto3-IC6821

# Navegar al directorio
cd cookapp

# Instalar dependencias
npm install

# Instalar dependencias de Expo
npx expo install

# Ejecutar la aplicación
npx expo run:android --device
```

> Debe habilitar el modo desarollador en  su celular y activar la depuración por USB.

### Configuración del Entorno

#### Variables de Entorno
Crear archivo `.env` en la raíz del proyecto (en la carpeta cookapp):
```env
# Google OAuth Configuration
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=8348128087-pbq20qn3k627ed5dackc0e0ss4foeuk1.apps.googleusercontent.com

# API Configuration
EXPO_PUBLIC_API_BASE_URL=https://cocina-express-api.onrender.com/api
```

#### Configuración de Google OAuth
1. Crear proyecto en [Google Cloud Console](https://console.cloud.google.com/)
2. Habilitar Google+ API
3. Crear credenciales OAuth 2.0
4. Configurar bundle identifier para Android
5. Agregar certificado SHA-1 para Android

#### Dependencias Principales
```json
{
  "@react-navigation/bottom-tabs": "navegación por pestañas",
  "@react-navigation/native": "navegación principal",
  "@react-native-async-storage/async-storage": "almacenamiento local",
  "expo-auth-session": "autenticación OAuth",
  "expo-web-browser": "navegador web integrado",
  "@expo/vector-icons": "iconos",
  "expo": "plataforma de desarrollo"
}
```

## 📱 Funcionalidades Implementadas

### Sistema de Autenticación
- **Google OAuth Integration**: Login completo con Google usando Expo Auth Session
- **Verificación de Usuario**: Comprobación automática si el usuario ya existe en la base de datos
- **Registro Guiado**: Flujo de completar perfil para usuarios nuevos
- **Persistencia de Sesión**: Uso de AsyncStorage para mantener sesión activa
- **Roles de Usuario**: Sistema de roles (customer, admin, owner) con permisos diferenciados

### Navegación y UI/UX
- **Tab Navigation Personalizada**: CustomTabBar con iconos Ionicons
- **Tema Dinámico**: Modo claro/oscuro con ThemeContext
- **Navegación Condicional**: Tabs que aparecen según el rol del usuario
- **Estados de Carga**: Indicadores visuales durante procesos async
- **Diseño Responsivo**: Adaptación a diferentes tamaños de pantalla

### Pantallas Principales

#### LoginScreen
- Integración completa con Google OAuth
- Manejo de estados de carga y errores
- UI atractiva con logo de Google
- Validación de términos de servicio

#### CompleteProfileScreen
- Formulario completo de registro
- Validación de campos obligatorios
- Validación de formato de teléfono costarricense
- Campos de dirección completos
- Manejo de errores de API

#### HomeScreen
- Pantalla de bienvenida personalizada
- Estado vacío elegante para restaurantes
- Preparada para mostrar lista de restaurantes

#### ProfileScreen
- Visualización de datos del usuario
- Foto de perfil de Google
- Toggle de tema claro/oscuro
- Opción de cerrar sesión con confirmación
- Preparado para actualización de datos

#### OrdersScreen
- Estado vacío para pedidos
- Header con título personalizado
- Preparado para mostrar historial de pedidos

#### FavoritesScreen
- Estado vacío para favoritos
- Diseño consistente con el resto de la app
- Preparado para sistema de favoritos

#### AdminScreen
- Acceso restringido por roles
- Diferenciación entre admin y owner
- Preparado para funcionalidades administrativas

### Servicios y API
- **authService.js**: Comunicación completa con backend
- **Manejo de Errores**: Try-catch robusto en todas las llamadas
- **Endpoints Funcionales**: Verificación y creación de usuarios
- **Google API Integration**: Obtención de datos de usuario de Google

### Sistema de Temas
- **Colores Definidos**: Paleta completa para modo claro y oscuro
- **Consistencia Visual**: Mismo esquema de colores en toda la app
- **Accesibilidad**: Contraste adecuado entre temas
- **Elementos Específicos**: Colores para tabs, bordes, sombras, etc.

## 🔧 Desarrollo y Testing

### Estructura del Código
- **Separación de Responsabilidades**: Pantallas, componentes, servicios y contextos bien organizados
- **Reutilización de Componentes**: CustomTabBar y ThemeToggle como componentes reutilizables
- **Manejo de Estado**: Context API para estado global, hooks para estado local
- **Estilos Dinámicos**: Función `createStyles(theme)` para temas adaptativos

### Flujo de Autenticación
```
1. App.js verifica AsyncStorage
2. Si no hay usuario → LoginScreen
3. Google OAuth → Obtener access token
4. Verificar usuario en API → checkUserExists()
5. Si existe → MainTabNavigator
6. Si no existe → CompleteProfileScreen → createUser()
7. Guardar en AsyncStorage → MainTabNavigator
```

### Testing y Debugging
- **Console Logs**: Implementados en puntos críticos
- **Error Handling**: Try-catch en todas las operaciones async
- **Loading States**: Estados de carga para mejor UX
- **Alert Messages**: Confirmaciones y mensajes de error
- **Debug Info**: Información de debugging en pantalla de login (comentada)

### API Integration
```javascript
// Ejemplo de llamada a API
const checkUserExists = async (googleId) => {
  const response = await fetch(`${API_BASE_URL}/users/google/${googleId}`);
  if (response.status === 404) return { exists: false };
  const data = await response.json();
  return { exists: true, user: data.data };
};
```

