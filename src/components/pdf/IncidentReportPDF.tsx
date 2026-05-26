import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PDFFooter } from "./Footer";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", color: "#334155" },

  header: {
    marginBottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 2,
    borderBottomColor: "#059669",
    paddingBottom: 15,
  },

  schoolName: { fontSize: 24, fontWeight: "bold", color: "#0f172a" },
  title: {
    fontSize: 10,
    color: "#059669",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#059669",
    marginBottom: 10,
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#059669",
    paddingBottom: 4,
  },

  infoBox: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
  },

  row: { flexDirection: "row", marginBottom: 8 },

  label: {
    fontSize: 9,
    color: "#64748b",
    width: 130,
    textTransform: "uppercase",
  },

  value: { fontSize: 10, color: "#0f172a", fontWeight: "bold", flex: 1 },

  descriptionBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#fff7ed",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#fed7aa",
  },

  actionBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#eff6ff",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
});

export const IncidentReportPDF = ({ incident }: { incident: any }) => {
  const { enrollment, severity, date, description, action, createdAt } =
    incident;
  const { student, section } = enrollment;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.schoolName}>TerraNova Academy</Text>
            <Text style={styles.title}>Reporte Oficial de Incidencia</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 9, color: "#64748b" }}>
              Emitido: {format(new Date(), "dd/MM/yyyy")}
            </Text>
          </View>
        </View>

        {/* DATOS DEL ESTUDIANTE */}
        <Text style={styles.sectionTitle}>Datos del Estudiante</Text>
        <View style={styles.infoBox}>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>
              {student.firstName} {student.lastName}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>DNI:</Text>
            <Text style={styles.value}>{student.dni}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Estado:</Text>
            <Text style={styles.value}>{student.status}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Grado / Sección:</Text>
            <Text style={styles.value}>
              {section.gradeLevel.name} - {section.name}
            </Text>
          </View>
        </View>

        {/* DATOS DE LA INCIDENCIA */}
        <Text style={styles.sectionTitle}>Datos de la Incidencia</Text>
        <View style={styles.infoBox}>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha del suceso:</Text>
            <Text style={styles.value}>
              {format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: es })}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Registrado el:</Text>
            <Text style={styles.value}>
              {format(new Date(createdAt), "dd/MM/yyyy")}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Severidad:</Text>
            <Text style={styles.value}>{severity}</Text>
          </View>
        </View>

        {/* DESCRIPCIÓN */}
        <Text style={styles.sectionTitle}>Descripción de los Hechos</Text>
        <View style={styles.descriptionBox}>
          <Text style={{ fontSize: 10, color: "#7c2d12", lineHeight: 1.5 }}>
            {description}
          </Text>
        </View>

        {/* ACCIÓN */}
        {action && (
          <>
            <Text style={styles.sectionTitle}>
              Medidas Tomadas / Resolución
            </Text>
            <View style={styles.actionBox}>
              <Text
                style={{ fontSize: 10, color: "#1e3a8a", fontStyle: "italic" }}
              >
                &quot;{action}&quot;
              </Text>
            </View>
          </>
        )}

        <PDFFooter />
      </Page>
    </Document>
  );
};
