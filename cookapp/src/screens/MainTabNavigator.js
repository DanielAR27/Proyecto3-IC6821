import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './main/HomeScreen';
import OrdersScreen from './main/OrdersScreen';
import FavoritesScreen from './main/FavoritesScreen';
import AdminScreen from './main/AdminScreen';
import ProfileScreen from './main/ProfileScreen';
import CustomTabBar from '../components/CustomTabBar';

const Tab = createBottomTabNavigator();

const MainTabNavigator = ({ user, onLogout }) => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} user={user} />}
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Home"
    >
      <Tab.Screen name="Home">
        {() => <HomeScreen user={user} />}
      </Tab.Screen>
      
      <Tab.Screen name="Orders" component={OrdersScreen} />
      
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      
      {/* Tab de Admin solo para owners y admins */}
      {(user?.role === 'owner' || user?.role === 'admin') && (
        <Tab.Screen name="Admin">
          {() => <AdminScreen user={user} />}
        </Tab.Screen>
      )}
      
      <Tab.Screen name="Profile">
        {() => <ProfileScreen user={user} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default MainTabNavigator;