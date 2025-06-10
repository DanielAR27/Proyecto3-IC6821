import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './home/HomeScreen';
import RestaurantScreen from './shared/RestaurantScreen';
import OrdersScreen from './orders/OrdersScreen';
import FavoritesScreen from './favorites/FavoritesScreen';
import AdminScreen from './admin/AdminScreen';
import AddRestaurantScreen from './admin/restaurants/AddRestaurantScreen';
import ManageRestaurantsScreen from './admin/restaurants/ManageRestaurantsScreen';
import UpdateRestaurantScreen from './admin/restaurants/UpdateRestaurantScreen';
import ManageRestaurantTagsScreen from './admin/restaurant-tags/ManageRestaurantTagsScreen';
import AddRestaurantTagScreen from './admin/restaurant-tags/AddRestaurantTagScreen';
import ManageProductsScreen from './admin/products/ManageProductsScreen';
import AddProductScreen from './admin/products/AddProductScreen';
import UpdateProductScreen from './admin/products/UpdateProductScreen';
import ManageToppingsScreen from './admin/toppings/ManageToppingsScreen';
import AddToppingScreen from './admin/toppings/AddToppingScreen';
import UpdateToppingScreen from './admin/toppings/UpdateToppingScreen';
import ManageCategoriesScreen from './admin/categories/ManageCategoriesScreen';
import AddCategoryScreen from './admin/categories/AddCategoryScreen';
import ManageTagsScreen from './admin/tags/ManageTagsScreen';
import AddTagScreen from './admin/tags/AddTagScreen';
import ProfileScreen from './profile/ProfileScreen';
import EditProfileScreen from './profile/EditProfileScreen';
import AddressManagementScreen from './profile/AddressManagementScreen';
import PaymentMethodsScreen from './profile/PaymentMethodsScreen';
import CustomTabBar from '../components/CustomTabBar';

const Tab = createBottomTabNavigator();
const AdminStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const HomeStack = createStackNavigator();

// Stack Navigator para Home (incluye RestaurantScreen)
const HomeStackNavigator = ({ user }) => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain">
        {(props) => <HomeScreen {...props} user={user} />}
      </HomeStack.Screen>
      <HomeStack.Screen 
        name="Restaurant" 
        component={RestaurantScreen} 
      />
    </HomeStack.Navigator>
  );
};

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
      <AdminStack.Screen name="ManageProducts">
        {(props) => <ManageProductsScreen {...props} user={user} />}
      </AdminStack.Screen>
      <AdminStack.Screen name="AddProduct">
        {(props) => <AddProductScreen {...props} route={{...props.route, params: {user}}} />}
      </AdminStack.Screen>
      <AdminStack.Screen name="UpdateProduct">
        {(props) => <UpdateProductScreen {...props} />}
      </AdminStack.Screen>
      <AdminStack.Screen name="ManageToppings">
        {(props) => <ManageToppingsScreen {...props} user={user} />}
      </AdminStack.Screen>
      <AdminStack.Screen name="AddTopping">
        {(props) => <AddToppingScreen {...props} route={{...props.route, params: {user}}} />}
      </AdminStack.Screen>
      <AdminStack.Screen name="UpdateTopping">
        {(props) => <UpdateToppingScreen {...props} />}
      </AdminStack.Screen>
      <AdminStack.Screen name="ManageCategories">
        {(props) => <ManageCategoriesScreen {...props} user={user} />}
      </AdminStack.Screen>
      <AdminStack.Screen name="AddCategory">
        {(props) => <AddCategoryScreen {...props} />}
      </AdminStack.Screen>
      <AdminStack.Screen name="ManageTags">
        {(props) => <ManageTagsScreen {...props} user={user} />}
      </AdminStack.Screen>
      <AdminStack.Screen name="AddTag">
        {(props) => <AddTagScreen {...props} />}
      </AdminStack.Screen>
    </AdminStack.Navigator>
  );
};
const ProfileStackNavigator = ({ user, onLogout }) => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain">
        {(props) => <ProfileScreen {...props} user={user} onLogout={onLogout} />}
      </ProfileStack.Screen>
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="AddressManagement">
        {(props) => <AddressManagementScreen {...props} route={{...props.route, params: { user }}} />}
      </ProfileStack.Screen>
      <ProfileStack.Screen name="PaymentMethods">
        {(props) => <PaymentMethodsScreen {...props} route={{...props.route, params: { user }}} />}
      </ProfileStack.Screen>
    </ProfileStack.Navigator>
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
        {(props) => <HomeStackNavigator {...props} user={user} />}
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
        {() => <ProfileStackNavigator user={user} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default MainTabNavigator;