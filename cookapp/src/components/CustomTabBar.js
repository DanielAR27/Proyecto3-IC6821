import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomTabBar = ({ state, descriptors, navigation, user }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const getTabIcon = (routeName, focused) => {
    let iconName;
    
    switch (routeName) {
      case 'Home':
        iconName = focused ? 'home' : 'home-outline';
        break;
      case 'Orders':
        iconName = focused ? 'receipt' : 'receipt-outline';
        break;
      case 'Favorites':
        iconName = focused ? 'heart' : 'heart-outline';
        break;
      case 'Admin':
        iconName = focused ? 'settings' : 'settings-outline';
        break;
      case 'Profile':
        iconName = focused ? 'person' : 'person-outline';
        break;
      default:
        iconName = 'home-outline';
    }
    
    return iconName;
  };

  const getTabLabel = (routeName) => {
    switch (routeName) {
      case 'Home':
        return 'Inicio';
      case 'Orders':
        return 'Pedidos';
      case 'Favorites':
        return 'Favoritos';
      case 'Admin':
        return 'Admin';
      case 'Profile':
        return 'Cuenta';
      default:
        return routeName;
    }
  };

  // Filtrar tabs según el rol del usuario
  const getVisibleTabs = () => {
    return state.routes.filter(route => {
      // Admin tab solo visible para owners y admins
      if (route.name === 'Admin') {
        return user?.role === 'owner' || user?.role === 'admin';
      }
      return true; // Todas las demás tabs son visibles
    });
  };

  const visibleTabs = getVisibleTabs();

  const styles = createStyles(theme, insets);

  return (
    <View style={styles.tabContainer}>
      {visibleTabs.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = getTabLabel(route.name);
        const isFocused = state.index === state.routes.findIndex(r => r.key === route.key);

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={[
              styles.tabButton,
              isFocused && styles.tabButtonActive
            ]}
          >
            <Ionicons
              name={getTabIcon(route.name, isFocused)}
              size={24}
              color={isFocused ? theme.tabActiveText : theme.tabInactiveText}
            />
            <Text style={[
              styles.tabLabel,
              { color: isFocused ? theme.tabActiveText : theme.tabInactiveText }
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const createStyles = (theme, insets) => StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.tabBarBackground,
    borderTopWidth: 1,
    borderTopColor: theme.tabBarBorder,
    paddingBottom: Platform.OS === 'android' ? 10 : (insets.bottom || 20), // Más espacio en Android
    paddingTop: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabButtonActive: {
    backgroundColor: theme.tabActiveBackground,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default CustomTabBar;