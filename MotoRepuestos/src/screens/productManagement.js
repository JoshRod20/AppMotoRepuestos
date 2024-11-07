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
import { Card, Button, Icon } from "@rneui/themed";
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

export default function ProductManagement() {
  const db = getFirestore(appFirebase);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [productoEditado, setProductoEditado] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Estado para la búsqueda
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
          imageUrl,
          cantidadStock,
        } = doc.data();
        docs.push({
          id: doc.id,
          nombreRepuesto,
          descripcion,
          marca,
          modelo,
          precio,
          imageUrl,
          cantidadStock,
        });
      });
      setProductos(docs);
    } catch (error) {
      console.log("Error al obtener los datos:", error);
    } finally {
      setLoading(false);
      setRefreshing(false); // Cuando termina el refresco, lo desactivamos
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

      // Verifica si la URL de la imagen fue actualizada
      if (productoEditado.imageUrl !== productoEditado.imageUrl) {
        fieldsToUpdate.imageUrl = productoEditado.imageUrl;
      }

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

  // Filtrar productos según la búsqueda
  const filteredProductos = productos.filter((producto) =>
    producto.nombreRepuesto.toLowerCase().includes(searchQuery.toLowerCase()) ||
    producto.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
    producto.marca.toLowerCase().includes(searchQuery.toLowerCase()) ||
    producto.modelo.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          {/* Campo de búsqueda */}
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar producto..."
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />

          {filteredProductos.map((item) => (
            <View style={styles.contenedorCard} key={item.id}>
              <Card>
                <Card.Title style={styles.TextTituloCard}>
                  {item.nombreRepuesto}
                </Card.Title>
                <Card.Divider />
                <Card.Image
                  style={styles.image}
                  source={{
                    uri: item.imageUrl, // Aquí cargará la URL actualizada de la base de datos
                  }}
                />
                <Text style={styles.textoLista}>
                  Descripción: {item.descripcion}
                </Text>
                <Text style={styles.textoLista}>Marca: {item.marca}</Text>
                <Text style={styles.textoLista}>Modelo: {item.modelo}</Text>
                <Text style={styles.textoLista}>Precio: ${item.precio}</Text>
                <Text style={styles.textoLista}>
                  Stock: {item.cantidadStock}
                </Text>
                <View style={styles.buttonContainer}>
                  <Button
                    style={styles.botonStyle}
                    icon={<Icon name="edit" />}
                    title="Editar"
                    onPress={() => editarProducto(item)}
                  />
                  <Button
                    style={styles.botonStyle}
                    icon={<Icon name="delete" />}
                    title="Eliminar"
                    onPress={() => eliminarProducto(item.id)}
                    buttonStyle={{ backgroundColor: "red" }}
                  />
                </View>
              </Card>
            </View>
          ))}
        </View>
      )}

      {/* Modal para editar producto */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
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
              value={productoEditado.precio ? productoEditado.precio.toString() : ""}
              onChangeText={(text) => handleInputChange("precio", text)}
              placeholder="Precio"
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              value={productoEditado.cantidadStock ? productoEditado.cantidadStock.toString() : ""}
              onChangeText={(text) => handleInputChange("cantidadStock", text)}
              placeholder="Stock"
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              value={productoEditado.imageUrl}
              onChangeText={(text) => handleInputChange("imageUrl", text)}
              placeholder="URL de la imagen"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleUpdateProduct}
              >
                <Text style={styles.buttonText}>Actualizar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
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
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
  },
  contenedorCard: {
    marginBottom: 20,
  },
  TextTituloCard: {
    fontSize: 20,
    fontWeight: "bold",
  },
  image: {
    width: "100%",
    height: 200,
  },
  textoLista: {
    marginVertical: 5,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  botonStyle: {
    width: "48%",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    width: "80%",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: "48%",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
});
