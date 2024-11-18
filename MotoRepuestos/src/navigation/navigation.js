import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";

import productList from "../screens/productList";
import products from "../screens/products";
import productManagement from "../screens/productManagement";
import estadistics from "../estadistics/estadistics";

import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Foundation from "@expo/vector-icons/Foundation";

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "blue", // Color de la etiqueta cuando está seleccionada
        tabBarInactiveTintColor: "gray", // Color de la etiqueta cuando no está seleccionada
        tabBarHideOnKeyboard: true, // Oculta el tab bar al abrir el teclado
      }}
    >
      <Tab.Screen
        name="Lista de Productos"
        component={productList}
        options={{
          tabBarLabel: "Productos",
          tabBarIcon: ({ focused }) => (
            <Entypo name="list" size={26} color={focused ? "blue" : "gray"} />
          ),
        }}
      />
      <Tab.Screen
        name="Registrar Productos"
        component={products}
        options={{
          tabBarLabel: "Registrar Productos",
          tabBarIcon: ({ focused }) => (
            <FontAwesome
              name="edit"
              size={26}
              color={focused ? "blue" : "gray"}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Gestión de Productos"
        component={productManagement}
        options={{
          tabBarLabel: "Gestionar productos",
          tabBarIcon: ({ focused }) => (
            <Foundation
              name="page-delete"
              size={26}
              color={focused ? "blue" : "gray"}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Estadísticas"
        component={estadistics}
        options={{
          tabBarLabel: "Estadísticas",
          tabBarIcon: ({ focused }) => (
            <Foundation
              name="graph-bar"
              size={26}
              color={focused ? "blue" : "gray"}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <MyTabs />
    </NavigationContainer>
  );
}
