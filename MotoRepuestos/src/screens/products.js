import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { collection, getFirestore, addDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { appFirebase } from "../services/firebaseConfig";

export default function Products() {
  const db = getFirestore(appFirebase);

  const [producto, setProductos] = useState({
    nombreRepuesto: "",
    descripcion: "",
    marca: "",
    modelo: "", // Se añadió el modelo
    precio: 0,
    imageUri: null,
    cantidadStock: 0, // Nuevo campo para cantidad en stock
    categoria: "",
  });

  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const categorias = [
    "Motor y transmisión",
    "Sistema eléctrico",
    "Frenos",
    "Suspensión y chasis",
    "Sistema de escape",
    "Neumáticos y llantas",
    "Sistema de combustible",
    "Accesorios y estética",
    "Iluminación y señalización",
    "Herramientas y mantenimiento",
    "Equipamiento de protección",
  ];

  const setStatus = (nombre, valor) => {
    setProductos({ ...producto, [nombre]: valor });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [3, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProductos({ ...producto, imageUri: uri });
    }
  };

  const uploadData = async () => {
    if (
      !producto.descripcion ||
      !producto.marca ||
      !producto.modelo ||
      !producto.precio ||
      !producto.imageUri ||
      producto.cantidadStock <= 0
    ) {
      Alert.alert(
        "Alerta",
        "Faltan datos por rellenar o la cantidad de stock es inválida"
      );
    } else {
      setUploading(true);
      try {
        await guardarProducto(producto);
        setProductos({
          nombreRepuesto: "",
          descripcion: "",
          marca: "",
          modelo: "",
          precio: 0,
          imageUri: null,
          cantidadStock: 0,
          categoria: "",
        });
        Alert.alert("Éxito", "Datos guardados correctamente");
      } catch (e) {
        console.error("Error al guardar los datos: ", e);
      }
      setUploading(false);
    }
  };

  const guardarProducto = async (producto) => {
    try {
      await addDoc(collection(db, "repuestosMoto"), {
        nombreRepuesto: producto.nombreRepuesto,
        descripcion: producto.descripcion,
        marca: producto.marca,
        modelo: producto.modelo,
        precio: producto.precio,
        imageUri: producto.imageUri, // Guardar solo la URI de la imagen
        cantidadStock: producto.cantidadStock,
        categoria: producto.categoria,
      });
    } catch (e) {
      console.error("Error al agregar el documento: ", e);
    }
  };

  const handleImagePress = () => {
    Alert.alert(
      "Eliminar imagen",
      "¿Estás seguro de que quieres eliminar esta imagen?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => setProductos({ ...producto, imageUri: null }),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text>Nombre:</Text>
      <TextInput
        style={styles.TextInput}
        placeholder="Ingrese el nombre del producto"
        value={producto.nombreRepuesto}
        onChangeText={(value) => setStatus("nombreRepuesto", value)}
      />

      <Text>Descripción:</Text>
      <TextInput
        style={styles.TextInput}
        placeholder="Ingrese la descripción"
        value={producto.descripcion}
        onChangeText={(value) => setStatus("descripcion", value)}
      />

      <Text>Marca:</Text>
      <TextInput
        style={styles.TextInput}
        placeholder="Ingrese la marca"
        value={producto.marca}
        onChangeText={(value) => setStatus("marca", value)}
      />

      <Text>Modelo:</Text>
      <TextInput
        style={styles.TextInput}
        placeholder="Ingrese el modelo"
        value={producto.modelo}
        onChangeText={(value) => setStatus("modelo", value)}
      />

      <Text>Precio:</Text>
      <TextInput
        style={styles.TextInput}
        placeholder="Ingrese el precio"
        value={producto.precio}
        onChangeText={(value) => setStatus("precio", value)}
        keyboardType="numeric"
      />

      <Text>Cantidad en Stock:</Text>
      <TextInput
        style={styles.TextInput}
        placeholder="Ingrese la cantidad en stock"
        value={producto.cantidadStock.toString()}
        onChangeText={(value) => {
          setStatus("cantidadStock", value === "" ? 0 : parseInt(value, 10));
        }}
        keyboardType="numeric"
      />

      <Text>Categoría:</Text>
      <TouchableOpacity
        style={styles.categoriaText}
        onPress={() => setModalVisible(true)}
      >
        <Text>{producto.categoria || "Seleccionar Categoría"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Seleccionar Imagen</Text>
      </TouchableOpacity>

      {producto.imageUri && (
        <TouchableOpacity onPress={handleImagePress}>
          <Image source={{ uri: producto.imageUri }} style={styles.image} />
        </TouchableOpacity>
      )}

      <View style={styles.buttonContainer}>
        {!uploading ? (
          <TouchableOpacity style={styles.button} onPress={uploadData}>
            <Text style={styles.buttonText}>Enviar</Text>
          </TouchableOpacity>
        ) : (
          <ActivityIndicator size={"small"} color="black" />
        )}
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona una Categoría</Text>
            {categorias.map((categoria) => (
              <TouchableOpacity
                key={categoria}
                onPress={() => {
                  setStatus("categoria", categoria);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalItem}>{categoria}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.button}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  image: {
    width: 200,
    height: 200,
    margin: 5,
  },
  TextInput: {
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 14,
    width: "100%",
    padding: 10,
    marginBottom: 15,
  },
  titulo: {
    fontSize: 18,
    marginBottom: 10,
    alignSelf: "center",
  },
  categoriaText: {
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 14,
    width: "100%",
    height: 50,
    padding: 15,
    marginBottom: 15,
    textAlign: "center",
  },
  buttonContainer: {
    marginBottom: 15,
    paddingVertical: 7,
  },
  button: {
    backgroundColor: "blue",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalItem: {
    padding: 10,
    fontSize: 16,
  },
});
