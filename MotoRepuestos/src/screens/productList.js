import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Card, Icon } from "@rneui/themed";
import React, { useEffect, useState } from "react";
import { collection, getDocs, getFirestore, doc, updateDoc } from "firebase/firestore";
import { appFirebase } from "../services/firebaseConfig";

export default function ProductList() {
  const db = getFirestore(appFirebase);
  const [lista, setLista] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // Control del modal
  const [alertMessage, setAlertMessage] = useState(""); // Mensaje del modal
  const [productToBuy, setProductToBuy] = useState(null); // Producto que se va a comprar
  const [purchaseConfirmed, setPurchaseConfirmed] = useState(false); // Estado para saber si la compra fue confirmada

  const getLista = async () => {
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
          precio: precio ? precio.toString() : "",
          imageUri, 
          cantidadStock: cantidadStock ? cantidadStock.toString() : "0",
        });
      });
      setLista(docs);
      setFilteredData(docs);
    } catch (error) {
      console.log("Error al obtener los datos:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getLista();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    getLista();
  };

  const searchFilterFunction = (text) => {
    if (text) {
      const newData = lista.filter((item) => {
        const itemNombre = item.nombreRepuesto ? item.nombreRepuesto.toUpperCase() : "".toUpperCase();
        const itemDescripcion = item.descripcion ? item.descripcion.toUpperCase() : "".toUpperCase();
        const itemPrecio = item.precio ? item.precio.toUpperCase() : "".toUpperCase();
        const textData = text.toUpperCase();
        
        return (
          itemNombre.indexOf(textData) > -1 ||
          itemDescripcion.indexOf(textData) > -1 ||
          itemPrecio.indexOf(textData) > -1
        );
      });
      setFilteredData(newData);
    } else {
      setFilteredData(lista);
    }
  };

  const handleBuyProduct = (productId, currentStock, productName) => {
    if (currentStock === 0) {
      setAlertMessage(`El producto ${productName} no está disponible actualmente.`);
      setModalVisible(true);
      return;
    }

    setProductToBuy({ productId, currentStock, productName });
    setAlertMessage(`¿Estás seguro de que deseas comprar el producto ${productName}?`);
    setModalVisible(true);
    setPurchaseConfirmed(false); // Reset estado de compra confirmada al abrir el modal
  };

  const confirmPurchase = async () => {
    const { productId, currentStock, productName } = productToBuy;
    try {
      const productRef = doc(db, "repuestosMoto", productId);
      await updateDoc(productRef, {
        cantidadStock: currentStock - 1,
      });

      const updatedData = lista.map((item) =>
        item.id === productId
          ? { ...item, cantidadStock: (parseInt(item.cantidadStock) - 1).toString() }
          : item
      );
      setLista(updatedData);
      setFilteredData(updatedData);

      setAlertMessage(`Has comprado el producto ${productName} con éxito.`);
      setPurchaseConfirmed(true); // Indicar que la compra fue confirmada
    } catch (error) {
      console.error("Error al comprar producto: ", error);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Buscar por nombre, descripción o precio..."
          onChangeText={(text) => searchFilterFunction(text)}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View>
          {filteredData.map((item) => (
            <View style={styles.contenedorCard} key={item.id}>
              <Card containerStyle={styles.cardContainer}>
                <Card.Title style={styles.TextTituloCard}>{item.nombreRepuesto}</Card.Title>
                <Card.Divider />
                <Card.Image style={styles.image} source={{ uri: item.imageUri }} />
                <Text style={styles.textoLista}>Nombre: {item.nombreRepuesto}</Text>
                <Text style={styles.textoLista}>Descripción: {item.descripcion}</Text>
                <Text style={styles.textoLista}>Marca: {item.marca}</Text>
                <Text style={styles.textoLista}>Modelo: {item.modelo}</Text>
                <Text style={styles.textoLista}>Precio: C$ {item.precio}</Text>
                <Text style={styles.textoLista}>Stock: {item.cantidadStock}</Text>
                
                <TouchableOpacity
                  style={[
                    styles.botonStyle,
                    item.cantidadStock === "0" ? styles.botonNoDisponible : styles.botonComprar,
                  ]}
                  onPress={() => handleBuyProduct(item.id, parseInt(item.cantidadStock), item.nombreRepuesto)}
                  disabled={item.cantidadStock === "0"}
                >
                  <Icon name="shopping-cart" size={20} color="white" />
                  <Text style={styles.botonText}>
                    {item.cantidadStock === "0" ? "Agotado" : "Comprar producto"}
                  </Text>
                </TouchableOpacity>
              </Card>
            </View>
          ))}
        </View>
      )}

      {/* Modal personalizado para la alerta */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalMessage}>{alertMessage}</Text>
            <View style={styles.modalButtons}>
              {purchaseConfirmed ? (
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Aceptar</Text>
                </TouchableOpacity>
              ) : (
                <>
                  {productToBuy && (
                    <TouchableOpacity onPress={confirmPurchase} style={styles.modalButton}>
                      <Text style={styles.modalButtonText}>Confirmar</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                    <Text style={styles.modalButtonText}>Cerrar</Text>
                  </TouchableOpacity>
                </>
              )}
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
  searchContainer: {
    marginBottom: 20,
  },
  searchBar: {
    height: 40,
    borderColor: "gray",
    borderRadius: 10,
    backgroundColor: "white",
    borderWidth: 1,
    paddingHorizontal: 10,
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
  contenedorCard: {
    width: '100%',
    marginBottom: 20,
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
  textoLista: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  botonStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginTop: 10,
    borderRadius: 14,
    width: "100%",
  },
  botonComprar: {
    backgroundColor: "#3364ff",
  },
  botonNoDisponible: {
    backgroundColor: "#d32f2f", // Rojo para agotado
  },
  botonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  modalMessage: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  modalButton: {
    padding: 10,
    backgroundColor: "#3364ff",
    borderRadius: 5,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
  },
});
