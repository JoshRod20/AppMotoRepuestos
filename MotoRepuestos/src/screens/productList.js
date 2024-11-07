import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TextInput,
    ActivityIndicator,
  } from "react-native";
  import { Card, Button, Icon } from "@rneui/themed";
  import React, { useEffect, useState } from "react";
  import { collection, getDocs, getFirestore } from "firebase/firestore";
  import { appFirebase } from "../services/firebaseConfig";
  
  export default function ProductList() {
    const db = getFirestore(appFirebase);
    const [lista, setLista] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const getLista = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "repuestosMoto"));
          const docs = [];
          querySnapshot.forEach((doc) => {
            const { nombreRepuesto, descripcion, marca, modelo, precio, imageUrl, cantidadStock } = doc.data();
            docs.push({
              id: doc.id,
              nombreRepuesto,
              descripcion,
              marca,
              modelo,
              precio: precio ? precio.toString() : "", // Asegurar que precio es un string
              imageUrl,
              cantidadStock: cantidadStock ? cantidadStock.toString() : "0", // Asegurar que cantidadStock es un string
            });
          });
          setLista(docs);
          setFilteredData(docs);
          setLoading(false);
        } catch (error) {
          console.log("Error al obtener los datos:", error);
          setLoading(false);
        }
      };
  
      getLista();
    }, []);
  
    const searchFilterFunction = (text) => {
      if (text) {
        const newData = lista.filter((item) => {
          const itemNombre = item.nombreRepuesto ? item.nombreRepuesto.toUpperCase() : "".toUpperCase();
          const itemDescripcion = item.descripcion ? item.descripcion.toUpperCase() : "".toUpperCase();
          const itemPrecio = item.precio ? item.precio.toUpperCase() : "".toUpperCase();
  
          const textData = text.toUpperCase();
          
          // Filtrar por nombre, descripción o precio
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
  
    return (
      <ScrollView style={styles.container}>
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
                <Card>
                  <Card.Title style={styles.TextTituloCard}>{item.nombreRepuesto}</Card.Title>
                  <Card.Divider />
                  <Card.Image
                    style={styles.image}
                    source={{
                      uri: item.imageUrl,
                    }}
                  />
                  <Text style={styles.textoLista}>Nombre: {item.nombreRepuesto}</Text>
                  <Text style={styles.textoLista}>Descripción: {item.descripcion}</Text>
                  <Text style={styles.textoLista}>Marca: {item.marca}</Text>
                  <Text style={styles.textoLista}>Modelo: {item.modelo}</Text>
                  <Text style={styles.textoLista}>Precio: ${item.precio}</Text>
                  <Text style={styles.textoLista}>Stock: {item.cantidadStock}</Text>
                  <Button
                    style={styles.botonStyle}
                    icon={<Icon name="message" />}
                    title="Preguntar al vendedor"
                  />
                </Card>
              </View>
            ))}
          </View>
        )}
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
      marginBottom: 0,
    },
    textoLista: {
      marginBottom: 10,
    },
    searchBar: {
      height: 40,
      borderColor: "gray",
      borderRadius: 10,
      backgroundColor: "white",
      borderWidth: 1,
      paddingHorizontal: 10,
    },
  });
  