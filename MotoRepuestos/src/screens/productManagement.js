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
    const navigation = useNavigation();
  
    useEffect(() => {
      const obtenerProductos = async () => {
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
          setLoading(false);
        } catch (error) {
          console.log("Error al obtener los datos:", error);
          setLoading(false);
        }
      };
  
      obtenerProductos();
    }, []);
  
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
        const productoRef = doc(db, "repuestosMoto", productoEditado.id);
        await updateDoc(productoRef, productoEditado);
  
        setProductos((prevProductos) =>
          prevProductos.map((producto) =>
            producto.id === productoEditado.id ? productoEditado : producto
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
      setProductoEditado((prev) => ({ ...prev, [field]: value }));
    };
  
    return (
      <ScrollView style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <View>
            {productos.map((item) => (
              <View style={styles.contenedorCard} key={item.id}>
                <Card>
                  <Card.Title style={styles.TextTituloCard}>
                    {item.nombreRepuesto}
                  </Card.Title>
                  <Card.Divider />
                  <Card.Image
                    style={styles.image}
                    source={{
                      uri: item.imageUrl,
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
                value={productoEditado.precio}
                onChangeText={(text) => handleInputChange("precio", text)}
                placeholder="Precio"
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                value={productoEditado.cantidadStock}
                onChangeText={(text) => handleInputChange("cantidadStock", text)}
                placeholder="Stock"
                keyboardType="numeric"
              />
  
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleUpdateProduct}
                >
                  <Text style={styles.buttonText}>Guardar cambios</Text>
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
    image: {
      width: 200,
      height: 200,
      alignSelf: "center",
    },
    TextTituloCard: {
      fontSize: 20,
      color: "#3364ff",
    },
    contenedorCard: {
      marginBottom: 15,
    },
    botonStyle: {
      borderRadius: 0,
      marginLeft: 0,
      marginRight: 0,
      marginBottom: 10,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    textoLista: {
      marginBottom: 10,
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
      borderRadius: 10,
      width: "80%",
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 15,
    },
    input: {
      borderBottomWidth: 1,
      borderBottomColor: "#ccc",
      marginBottom: 10,
      padding: 10,
      fontSize: 16,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    button: {
      backgroundColor: "#3364ff",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      marginTop: 10,
    },
    buttonText: {
      color: "white",
      fontSize: 16,
    },
  });
  