import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PDFFooter } from "./Footer";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { PdfDisabilityEnrollment } from "@/types/pdf";

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
    width: 160,
    textTransform: "uppercase",
  },

  value: { fontSize: 10, color: "#0f172a", fontWeight: "bold", flex: 1 },

  recordBox: {
    marginBottom: 14,
    padding: 14,
    backgroundColor: "#fee2e2",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#fecaca",
  },

  descBox: {
    marginTop: 6,
    padding: 10,
    backgroundColor: "#fef2f2",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
});

export const StudentDisabilitiesPDF = ({
  enrollment,
}: {
  enrollment: PdfDisabilityEnrollment;
}) => {
  const { student, section, disabilities } = enrollment;

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.schoolName}>TerraNova Academy</Text>
            <Text style={styles.title}>Registro anual de inhabilitaciones</Text>
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
          <Text style={styles.value}>
            {section.academicYear?.year || "No registrado"}
          </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total de registros:</Text>
            <Text style={styles.value}>{disabilities.length}</Text>
          </View>
        </View>

        {/* REGISTROS */}
        <Text style={styles.sectionTitle}>Registro cronológico</Text>

        {disabilities.map((d, idx: number) => (
          <View key={idx} style={styles.recordBox} wrap={false}>
            <View style={styles.row}>
              <Text style={styles.label}>Motivo:</Text>
              <Text style={styles.value}>{d.reason}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Fecha inicio:</Text>
              <Text style={styles.value}>
                {format(new Date(d.startDate), "dd 'de' MMMM 'de' yyyy", {
                  locale: es,
                })}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Estado:</Text>
              <Text style={styles.value}>{d.status}</Text>
            </View>

            {d.resolution && (
              <>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "bold",
                    marginTop: 8,
                    color: "#7f1d1d",
                  }}
                >
                  Resolución:
                </Text>
                <View style={styles.descBox}>
                  <Text style={{ fontSize: 10, lineHeight: 1.5 }}>
                    {d.resolution}
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
