import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";

import productList from "../screens/productList";
import products from "../screens/products";
import productManagement from "../screens/productManagement";
import estadistics from "../estadistics/estadistics";


const Tab = createBottomTabNavigator();

function MyTabs(){
return(
  <Tab.Navigator>
    <Tab.Screen name='Lista de Productos' component={productList}/>
    <Tab.Screen name='Registrar Productos' component={products}/>
    <Tab.Screen name='Gestión de Productos' component={productManagement}/>
    <Tab.Screen name='Estadísticas' component={estadistics}/>
  </Tab.Navigator>
)
};

export default function Navigation() {
  return (
    <NavigationContainer>
      <MyTabs />
    </NavigationContainer>
  )
};