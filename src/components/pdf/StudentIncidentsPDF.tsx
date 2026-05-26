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
    backgroundColor: "#e9fef9",
    borderRadius: 4,
  },

  row: { flexDirection: "row", marginBottom: 6 },

  label: {
    fontSize: 9,
    color: "#64748b",
    width: 140,
    textTransform: "uppercase",
  },

  value: { fontSize: 10, color: "#0f172a", fontWeight: "bold", flex: 1 },

  incidentBox: {
    marginBottom: 14,
    padding: 14,
    backgroundColor: "#fef3c7",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#fed7aa",
  },

  descBox: {
    marginTop: 6,
    padding: 10,
    backgroundColor: "#fff7ed",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#fed7aa",
  },

  actionBox: {
    marginTop: 6,
    padding: 10,
    backgroundColor: "#eff6ff",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
});

export const StudentIncidentsPDF = ({ enrollment }: { enrollment: any }) => {
  const { student, section, incidents } = enrollment;

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.schoolName}>TerraNova Academy</Text>
            <Text style={styles.title}>Libro anual de incidencias</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 9, color: "#64748b" }}>
              Emitido: {format(new Date(), "dd/MM/yyyy")}
            </Text>
          </View>
        </View>

        {/* DATOS GENERALES */}
        <Text style={styles.sectionTitle}>Datos del Estudiante</Text>
        <View style={styles.infoBox}>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>
              {student.firstName} {student.lastName}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Grado / Sección:</Text>
            <Text style={styles.value}>
              {section.gradeLevel.name} - {section.name}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Año lectivo:</Text>
            <Text style={styles.value}>{section.academicYear.year}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total de incidencias:</Text>
            <Text style={styles.value}>{incidents.length}</Text>
          </View>
        </View>

        {/* INCIDENCIAS */}
        <Text style={styles.sectionTitle}>Registro cronológico</Text>

        {incidents.map((incident: any, idx: number) => (
          <View key={idx} style={styles.incidentBox} wrap={false}>
            <View style={styles.row}>
              <Text style={styles.label}>Fecha del suceso:</Text>
              <Text style={styles.value}>
                {format(new Date(incident.date), "dd 'de' MMMM 'de' yyyy", {
                  locale: es,
                })}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Registrado el:</Text>
              <Text style={styles.value}>
                {format(new Date(incident.createdAt), "dd/MM/yyyy")}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Severidad:</Text>
              <Text style={styles.value}>{incident.severity}</Text>
            </View>

            <Text
              style={{
                fontSize: 10,
                fontWeight: "bold",
                marginTop: 8,
                color: "#7c2d12",
              }}
            >
              Descripción de los hechos:
            </Text>
            <View style={styles.descBox}>
              <Text style={{ fontSize: 10, lineHeight: 1.5, color: "#7c2d12" }}>
                {incident.description}
              </Text>
            </View>

            {incident.actionTaken && (
              <>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "bold",
                    marginTop: 8,
                    color: "#1e3a8a",
                  }}
                >
                  Medidas adoptadas:
                </Text>
                <View style={styles.actionBox}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontStyle: "italic",
                      color: "#1e3a8a",
                      lineHeight: 1.4,
                    }}
                  >
                    &quot;{incident.actionTaken}&quot;
                  </Text>
                </View>
              </>
            )}
          </View>
        ))}

        {/* FIRMA */}
        <View style={{ marginTop: 30 }}>
          <Text>______________________________</Text>
          <Text style={{ fontSize: 10 }}>Dirección Institucional</Text>
        </View>

        <PDFFooter />
      </Page>
    </Document>
  );
};
