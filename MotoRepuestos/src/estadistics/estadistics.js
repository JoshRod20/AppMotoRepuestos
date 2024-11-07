import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { collection, getDocs, query } from 'firebase/firestore';


// Importación de conexión a Firebase
import { db } from '../services/firebaseConfig';

// Componente para mostrar las estadísticas (gráfico)
const EstadisticasGraph = ({ dataProductos }) => {
  return (
    <View style={styles.graphContainer}>
      <LineChart
        data={dataProductos}
        width={300} // Cambia estos valores según tu necesidad
        height={220}
        chartConfig={{
          backgroundColor: "#000",
          backgroundGradientFrom: "#1E2923",
          backgroundGradientTo: "#08130D",
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
          style: {
            borderRadius: 16
          }
        }}
      />
    </View>
  );
};

export default function Estadisticas() {
  const [dataProductos, setDataProductos] = useState({
    labels: [],
    datasets: [{ data: [] }] // Inicializa datasets como un array con un objeto
  });

  // Carga de datos desde Firebase
  useEffect(() => {
    const recibirDatosProductos = async () => {
      try {
        const q = query(collection(db, "repuestosMoto"));
        const querySnapshot = await getDocs(q);
        const nombresRepuestos = [];
        const cantidadesStocks = [];

        querySnapshot.forEach((doc) => {
          const datosBD = doc.data();
          const { nombreRepuesto, cantidadStock } = datosBD;
          nombresRepuestos.push(nombreRepuesto); // Agrega nombre a la lista
          cantidadesStocks.push(cantidadStock); // Agrega cantidad a la lista
        });

        // Actualiza el estado con el formato requerido para el gráfico
        setDataProductos({
          labels: nombresRepuestos,
          datasets: [{ data: cantidadesStocks }]
        });

        console.log({ labels: nombresRepuestos, datasets: [{ data: cantidadesStocks }] });
      } catch (error) {
        console.error("Error al obtener documentos: ", error);
      }
    };

    recibirDatosProductos(); // Ejecuta la función para obtener los datos
  }, []); // Solo se ejecuta una vez cuando el componente se monta

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estadísticas de Repuestos</Text>
      <EstadisticasGraph dataProductos={dataProductos} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  graphContainer: {
    marginTop: 10,
    padding: 10,
  },
});
