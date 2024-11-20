import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Card } from "@rneui/themed";
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  getFirestore,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { appFirebase } from "../services/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';

export default function ProductManagement() {
  const db = getFirestore(appFirebase);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [productoEditado, setProductoEditado] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "repuestosMoto"));
      const docs = [];
      querySnapshot.forEach((doc) => {
        const {
          nombreRepuesto,
          descripcion,
          marca,
          modelo,
          precio,
          imageUri,  
          cantidadStock,
        } = doc.data();
        docs.push({
          id: doc.id,
          nombreRepuesto,
          descripcion,
          marca,
          modelo,
          precio,
          imageUri,  
          cantidadStock,
        });
      });
      setProductos(docs);
    } catch (error) {
      console.log("Error al obtener los datos:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    obtenerProductos();
  };

  const eliminarProducto = async (id) => {
    try {
      const productoRef = doc(db, "repuestosMoto", id);
      await deleteDoc(productoRef);
      setProductos(productos.filter((producto) => producto.id !== id));
      Alert.alert("Eliminado", "El producto ha sido eliminado exitosamente.");
    } catch (error) {
      console.log("Error al eliminar el producto:", error);
      Alert.alert("Error", "Hubo un problema al eliminar el producto.");
    }
  };

  const editarProducto = (producto) => {
    setProductoEditado(producto);
    setModalVisible(true);
  };

  const handleUpdateProduct = async () => {
    try {
      const fieldsToUpdate = Object.fromEntries(
        Object.entries(productoEditado).filter(
          ([_, value]) => value !== undefined
        )
      );

      const productoRef = doc(db, "repuestosMoto", productoEditado.id);
      await updateDoc(productoRef, fieldsToUpdate);

      setProductos((prevProductos) =>
        prevProductos.map((producto) =>
          producto.id === productoEditado.id
            ? { ...producto, ...fieldsToUpdate }
            : producto
        )
      );

      setModalVisible(false);
      Alert.alert("Éxito", "Producto actualizado correctamente");
    } catch (error) {
      console.log("Error al actualizar el producto:", error);
      Alert.alert("Error", "Hubo un problema al actualizar el producto.");
    }
  };

  const handleInputChange = (field, value) => {
    if (field === "precio") {
      const validValue = value ? parseFloat(value) : "";
      setProductoEditado((prev) => ({
        ...prev,
        [field]: validValue,
      }));
    } else if (field === "cantidadStock") {
      const validValue = value ? parseInt(value) : "";
      setProductoEditado((prev) => ({
        ...prev,
        [field]: validValue,
      }));
    } else {
      setProductoEditado((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const filteredProductos = productos.filter((producto) =>
    producto.nombreRepuesto.toLowerCase().includes(searchQuery.toLowerCase()) ||
    producto.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (producto.precio &&
      producto.precio.toString().toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Función para abrir la galería y seleccionar una imagen
const seleccionarImagen = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setProductoEditado((prev) => ({
        ...prev,
        imageUri: result.assets[0].uri,
      }));
    }
  } catch (error) {
    console.log("Error al seleccionar la imagen:", error);
    Alert.alert("Error", "No se pudo seleccionar la imagen.");
  }
};

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar producto..."
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />

          {filteredProductos.map((item) => (
            <View style={styles.contenedorCard} key={item.id}>
              <Card containerStyle={styles.cardContainer}>
                <Card.Title style={styles.TextTituloCard}>
                  {item.nombreRepuesto}
                </Card.Title>
                <Card.Divider />
                {/* Usamos imageUri directamente aquí */}
                <Card.Image
                  style={styles.image}
                  source={{
                    uri: item.imageUri,  // Usamos imageUri desde Firestore
                  }}
                />
                <Text style={styles.textoLista}>
                  Descripción: {item.descripcion}
                </Text>
                <Text style={styles.textoLista}>Marca: {item.marca}</Text>
                <Text style={styles.textoLista}>Modelo: {item.modelo}</Text>
                <Text style={styles.textoLista}>Precio: C$ {item.precio}</Text>
                <Text style={styles.textoLista}>Stock: {item.cantidadStock}</Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.botonStyle}
                    onPress={() => editarProducto(item)}
                  >
                    <Text style={styles.buttonText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.botonStyle, { backgroundColor: "#d32f2f" }]}
                    onPress={() => eliminarProducto(item.id)}
                  >
                    <Text style={styles.buttonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            </View>
          ))}
        </View>
      )}
      <Modal
  animationType="slide"
  transparent={true}
  visible={modalVisible}
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <ScrollView contentContainerStyle={styles.modalScrollContent}>
        <Text style={styles.modalTitle}>Editar Producto</Text>
        <TextInput
          style={styles.input}
          value={productoEditado.nombreRepuesto}
          onChangeText={(text) => handleInputChange("nombreRepuesto", text)}
          placeholder="Nombre del repuesto"
        />
        <TextInput
          style={styles.input}
          value={productoEditado.descripcion}
          onChangeText={(text) => handleInputChange("descripcion", text)}
          placeholder="Descripción"
        />
        <TextInput
          style={styles.input}
          value={productoEditado.marca}
          onChangeText={(text) => handleInputChange("marca", text)}
          placeholder="Marca"
        />
        <TextInput
          style={styles.input}
          value={productoEditado.modelo}
          onChangeText={(text) => handleInputChange("modelo", text)}
          placeholder="Modelo"
        />
        <TextInput
          style={styles.input}
          value={
            productoEditado.precio ? productoEditado.precio.toString() : ""
          }
          onChangeText={(text) => handleInputChange("precio", text)}
          placeholder="Precio"
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          value={
            productoEditado.cantidadStock
              ? productoEditado.cantidadStock.toString()
              : ""
          }
          onChangeText={(text) => handleInputChange("cantidadStock", text)}
          placeholder="Stock"
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={[styles.button, { marginBottom: 10 }]}
          onPress={seleccionarImagen}
        >
          <Text style={styles.buttonText}>Seleccionar Imagen</Text>
        </TouchableOpacity>
        {productoEditado.imageUri ? (
          <Card.Image
            style={styles.image}
            source={{ uri: productoEditado.imageUri }}
          />
        ) : (
          <Text style={{ textAlign: "center", marginBottom: 10 }}>
            No se ha seleccionado ninguna imagen.
          </Text>
        )}
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#3364ff" }]}
            onPress={handleUpdateProduct}
          >
            <Text style={styles.buttonText}>Actualizar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#d32f2f" }]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  </View>
</Modal>

    </ScrollView>
  );
}

  const styles = StyleSheet.create({
    container: {
      padding: 20,
    },
    searchInput: {
      height: 40,
      borderColor: "gray",
      borderRadius: 10,
      backgroundColor: "white",
      borderWidth: 1,
      paddingHorizontal: 10,
    },
    textoLista: {
      fontSize: 15,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    buttonText: {
      color: "#FFF",
      fontSize: 16,
      fontWeight: "bold",
      textAlign: "center",
    },
    botonStyle: {
      marginTop: 15,
      padding: 10,
      backgroundColor: "#3364ff",
      borderRadius: 14,
      marginHorizontal: 5,
    },
    button: {
      marginTop: 15,
      padding: 10,
      backgroundColor: "#3364ff",
      borderRadius: 14,
      marginHorizontal: 5,
    },
    cardContainer: {
      borderRadius: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 5,
      padding: 15,
      marginBottom: 15,
    },
    image: {
      width: "100%",
      height: 300,
      borderRadius: 10,
      marginBottom: 10,
    },
    TextTituloCard: {
      fontSize: 22,
      color: "#3364ff",
      fontWeight: "bold",
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
      width: "90%",
      height: "70%",
      padding: 40,
      backgroundColor: "#FFF",
      borderRadius: 10,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
    },
    input: {
      borderWidth: 1,
      borderColor: "#CCC",
      padding: 10,
      marginBottom: 10,
      borderRadius: 8,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
  });
  