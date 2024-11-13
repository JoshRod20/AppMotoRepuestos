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
    <Tab.Navigator>
      <Tab.Screen
        name="Lista de Productos"
        component={productList}
        options={{
          tabBarLabel: "Productos",
          tabBarIcon: ({ focused, size }) => (
            <Entypo name="list" size={26} color={focused ? "blue" : "gray"} />
          ),
          tabBarActiveTintColor: "blue", // Color de la etiqueta cuando está seleccionada
          tabBarInactiveTintColor: "gray", // Color de la etiqueta cuando no está seleccionada
        }}
      />

      <Tab.Screen
        name="Registrar Productos"
        component={products}
        options={{
          tabBarLabel: "Registrar Productos",
          tabBarIcon: ({ focused, size }) => (
            <FontAwesome
              name="edit"
              size={26}
              color={focused ? "blue" : "gray"}
            />
          ),
          tabBarActiveTintColor: "blue", // Color de la etiqueta cuando está seleccionada
          tabBarInactiveTintColor: "gray", // Color de la etiqueta cuando no está seleccionada
        }}
      />
      <Tab.Screen
        name="Gestión de Productos"
        component={productManagement}
        options={{
          tabBarLabel: "Gestionar productos",
          tabBarIcon: ({ focused, size }) => (
            <Foundation
              name="page-delete"
              size={26}
              color={focused ? "blue" : "gray"}
            />
          ),
          tabBarActiveTintColor: "blue", // Color de la etiqueta cuando está seleccionada
          tabBarInactiveTintColor: "gray", // Color de la etiqueta cuando no está seleccionada
        }}
      />
      <Tab.Screen
        name="Estadísticas"
        component={estadistics}
        options={{
          tabBarLabel: "Estadísticas",
          tabBarIcon: ({ focused, size }) => (
            <Foundation
              name="graph-bar"
              size={26}
              color={focused ? "blue" : "gray"}
            />
          ),
          tabBarActiveTintColor: "blue", // Color de la etiqueta cuando está seleccionada
          tabBarInactiveTintColor: "gray", // Color de la etiqueta cuando no está seleccionada
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
