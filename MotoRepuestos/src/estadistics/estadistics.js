import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  Dimensions,
} from "react-native";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import EstadisticsPDF from "../estadistics/estadisticsPDF";

export default function Estadistics() {
  const [dataProductos, setDataProductos] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [refreshing, setRefreshing] = useState(false);

  const recibirDatosProductos = async () => {
    try {
      const q = query(collection(db, "repuestosMoto"));
      const querySnapshot = await getDocs(q);
      const nombresRepuestos = [];
      const cantidadesStock = [];

      querySnapshot.forEach((doc) => {
        const datosBD = doc.data();
        const { nombreRepuesto, cantidadStock } = datosBD;
        nombresRepuestos.push(nombreRepuesto);
        cantidadesStock.push(cantidadStock);
      });

      setDataProductos({
        labels: nombresRepuestos,
        datasets: [{ data: cantidadesStock }],
      });
    } catch (error) {
      console.error("Error al obtener documentos: ", error);
    }
  };

  useEffect(() => {
    recibirDatosProductos();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await recibirDatosProductos();
    setRefreshing(false);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <EstadisticsPDF dataProducts={dataProductos} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
  },
});
