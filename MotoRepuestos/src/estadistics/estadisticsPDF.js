import React, { useRef } from "react";
import {
  View,
  Alert,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
} from "react-native";
import { jsPDF } from "jspdf";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import { BarChart } from "react-native-chart-kit";

const EstadisticsPDF = ({ dataProducts }) => {
  const chartRef = useRef();
  const screenWidth = Dimensions.get("window").width;

  const generarPDF = async () => {
    try {
      const uri = await captureRef(chartRef, {
        format: "png",
        quality: 1,
        width: screenWidth * 3,
        height: 900,
      });

      const doc = new jsPDF();
      doc.text("Reporte de Repuestos de Moto", 10, 10);

      const chartImage = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      doc.addImage(
        `data:image/png;base64,${chartImage}`,
        "PNG",
        10,
        20,
        190,
        150,
        undefined,
        "FAST"
      );

      dataProducts.labels?.forEach((label, index) => {
        const cantidad = dataProducts.datasets[0]?.data[index];
        if (label && cantidad != null) {
          doc.text(`${label}: ${cantidad} unidades`, 10, 180 + index * 10);
        }
      });

      const pdfBase64 = doc.output("datauristring").split(",")[1];
      const fileUri = `${FileSystem.documentDirectory}reporte_repuestos_moto.pdf`;

      await FileSystem.writeAsStringAsync(fileUri, pdfBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error("Error al generar o compartir el PDF: ", error);
      Alert.alert("Error", "No se pudo generar o compartir el PDF.");
    }
  };

  return (
    <View style={styles.container}>
      <View ref={chartRef} collapsable={false} style={styles.chartContainer}>
        {dataProducts.labels && dataProducts.datasets[0].data.length > 0 ? (
          <BarChart
            data={dataProducts}
            width={screenWidth - screenWidth * 0.1}
            height={420}
            chartConfig={{
              backgroundGradientFrom: "#00FFFF",
              backgroundGradientFromOpacity: 0.1,
              backgroundGradientTo: "#FFFFFF",
              backgroundGradientToOpacity: 1,
              color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
              strokeWidth: 1,
              barPercentage: 0.5,
            }}
            style={{
              borderRadius: 10,
            }}
            verticalLabelRotation={45}
            withHorizontalLabels={true}
            showValuesOnTopOfBars={true}
          />
        ) : (
          <Text style={styles.errorText}>Cargando datos.</Text>
        )}
      </View>

      <View style={styles.button}>
        <TouchableOpacity style={styles.buttonStyle} onPress={generarPDF}>
          <Text style={styles.buttonText}>Generar y Compartir PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    margin: 10,
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  button: {
    marginTop: 10,
  },
  buttonStyle: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.39,
    shadowRadius: 8.3,
    elevation: 13,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "blue",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});

export default EstadisticsPDF;
