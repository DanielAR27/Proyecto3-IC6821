import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './home/HomeScreen';
import OrdersScreen from './orders/OrdersScreen';
import FavoritesScreen from './favorites/FavoritesScreen';
import AdminScreen from './admin/AdminScreen';
import AddRestaurantScreen from './admin/restaurants/AddRestaurantScreen';
import ManageRestaurantsScreen from './admin/restaurants/ManageRestaurantsScreen';
import UpdateRestaurantScreen from './admin/restaurants/UpdateRestaurantScreen';
import ManageRestaurantTagsScreen from './admin/restaurant-tags/ManageRestaurantTagsScreen';
import AddRestaurantTagScreen from './admin/restaurant-tags/AddRestaurantTagScreen';
import ProfileScreen from './profile/ProfileScreen';
import CustomTabBar from '../components/CustomTabBar';

const Tab = createBottomTabNavigator();
const AdminStack = createStackNavigator();

// Stack Navigator para Admin
const AdminStackNavigator = ({ user }) => {
  return (
    <AdminStack.Navigator
      screenOptions={{
        headerShown: false, // Sin header por defecto
      }}
    >
      <AdminStack.Screen name="AdminMain">
        {(props) => <AdminScreen {...props} user={user} />}
      </AdminStack.Screen>
      <AdminStack.Screen name="AddRestaurant">
        {(props) => <AddRestaurantScreen {...props} route={{...props.route, params: {user}}} />}
      </AdminStack.Screen>
      <AdminStack.Screen name="ManageRestaurants">
        {(props) => <ManageRestaurantsScreen {...props} user={user} />}
      </AdminStack.Screen>
      <AdminStack.Screen name="UpdateRestaurant">
        {(props) => <UpdateRestaurantScreen {...props} />}
      </AdminStack.Screen>
      <AdminStack.Screen name="ManageRestaurantTags">
        {(props) => <ManageRestaurantTagsScreen {...props} user={user} />}
      </AdminStack.Screen>
      <AdminStack.Screen name="AddRestaurantTag">
        {(props) => <AddRestaurantTagScreen {...props} />}
      </AdminStack.Screen>
    </AdminStack.Navigator>
  );
};

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
          {() => <AdminStackNavigator user={user} />}
        </Tab.Screen>
      )}
      
      <Tab.Screen name="Profile">
        {() => <ProfileScreen user={user} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default MainTabNavigator;