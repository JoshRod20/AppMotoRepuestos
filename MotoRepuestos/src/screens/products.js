import {
    View,
    Text,
    Button,
    StyleSheet,
    Image,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Alert,
  } from "react-native";
  import React, { useState } from "react";
  import { collection, getFirestore, addDoc } from "firebase/firestore";
  import * as ImagePicker from "expo-image-picker";
  import * as FileSystem from "expo-file-system";
  import { appFirebase } from "../services/firebaseConfig.js";
  
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
    });
  
    const setStatus = (nombre, valor) => {
      setProductos({ ...producto, [nombre]: valor });
    };
  
    const [uploading, setUploading] = useState(false);
  
    const pickImage = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [3, 3],
        quality: 1,
      });
  
      if (!result.canceled) {
        const uri = result.assets[0].uri;
  
        // Guardar la imagen en el almacenamiento local
        const newFileUri = FileSystem.documentDirectory + "product_image.jpg";
        await FileSystem.copyAsync({
          from: uri,
          to: newFileUri,
        });
  
        // Actualizar el estado con la ruta de la imagen
        setProductos({ ...producto, imageUri: newFileUri });
      }
    };
  
    const uploadData = async () => {
      if (
        !producto.descripcion ||
        !producto.marca ||
        !producto.modelo ||
        !producto.precio ||
        !producto.imageUri ||
        producto.cantidadStock <= 0 // Verificación de la cantidad en stock
      ) {
        Alert.alert(
          "Alerta",
          "Faltan datos por rellenar o la cantidad de stock es inválida"
        );
      } else {
        setUploading(true);
        try {
          // Guardar los datos del producto, incluyendo la ruta de la imagen y cantidadStock
          await guardarProducto(producto);
          setProductos({
            nombreRepuesto: "",
            descripcion: "",
            marca: "",
            modelo: "",
            precio: 0,
            imageUri: null,
            cantidadStock: 0, // Limpiar el campo cantidadStock después de subir
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
        // Guardar el producto en la colección 'repuestosMoto' incluyendo la cantidad de stock
        await addDoc(collection(db, "repuestosMoto"), {
          nombreRepuesto: producto.nombreRepuesto,
          descripcion: producto.descripcion,
          marca: producto.marca,
          modelo: producto.modelo,
          precio: producto.precio,
          imageUri: producto.imageUri,
          cantidadStock: producto.cantidadStock, // Guardar la cantidad de stock aquí
        });
      } catch (e) {
        console.error("Error al agregar el documento: ", e);
      }
    };
  
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.titulo}>Formulario de Producto</Text>
  
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
          value={producto.cantidadStock.toString()} // Convertir cantidadStock a string para mostrar
          onChangeText={(value) => {
            // Si el campo está vacío, asignar 0, si no, convertir a número
            setStatus("cantidadStock", value === "" ? 0 : parseInt(value, 10));
          }}
          keyboardType="numeric"
        />
  
        <Button title="Seleccionar Imagen" onPress={pickImage} />
        {producto.imageUri && (
          <Image source={{ uri: producto.imageUri }} style={styles.image} />
        )}
  
        <View style={{ marginBottom: 15, paddingVertical: 7 }}>
          {!uploading ? (
            <Button title="Enviar" onPress={uploadData} />
          ) : (
            <ActivityIndicator size={"small"} color="black" />
          )}
        </View>
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
      padding: 10,
      marginBottom: 15,
      textAlign: "center",
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
  