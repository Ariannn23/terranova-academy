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
    borderBottomColor: "#cbd5e1",
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
    width: 110,
    textTransform: "uppercase",
  },
  value: { fontSize: 10, color: "#0f172a", fontWeight: "bold", flex: 1 },
});

export const StudentInfoPDF = ({ student }: { student: any }) => {
  const currentEnrollment = student.enrollments?.[0];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.schoolName}>TerraNova Academy</Text>
            <Text style={styles.title}>Ficha Integral del Estudiante</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 9, color: "#64748b" }}>
              Emitido: {format(new Date(), "dd/MM/yyyy")}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Datos Personales</Text>
        <View style={styles.infoBox}>
          <View style={styles.row}>
            <Text style={styles.label}>Nombres y Apellidos:</Text>
            <Text style={styles.value}>
              {student.firstName} {student.lastName}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>DNI / Código:</Text>
            <Text style={styles.value}>
              {student.dni} {student.code ? `(${student.code})` : ""}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha Nacimiento:</Text>
            <Text style={styles.value}>
              {format(new Date(student.birthDate), "dd 'de' MMMM 'de' yyyy", {
                locale: es,
              })}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Género:</Text>
            <Text style={styles.value}>
              {student.gender === "M" ? "Masculino" : "Femenino"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Dirección:</Text>
            <Text style={styles.value}>
              {student.address || "No registrado"}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Estado Académico</Text>
        <View style={styles.infoBox}>
          {currentEnrollment ? (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Situación:</Text>
                <Text style={styles.value}>{student.status}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Año Lectivo:</Text>
                <Text style={styles.value}>
                  {currentEnrollment.academicYear.year}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Grado y Sección:</Text>
                <Text style={styles.value}>
                  {currentEnrollment.section.gradeLevel.name} -{" "}
                  {currentEnrollment.section.name}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Nivel:</Text>
                <Text style={styles.value}>
                  {currentEnrollment.section.gradeLevel.level}
                </Text>
              </View>
            </>
          ) : (
            <Text
              style={{ fontSize: 10, color: "#64748b", fontStyle: "italic" }}
            >
              No registra matrícula activa.
            </Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Datos de Apoderados</Text>
        {student.guardians && student.guardians.length > 0 ? (
          student.guardians.map((g: any, idx: number) => (
            <View key={idx} style={[styles.infoBox, { marginBottom: 10 }]}>
              <View style={styles.row}>
                <Text style={styles.label}>Nombre:</Text>
                <Text style={styles.value}>
                  {g.firstName} {g.lastName} {g.isPrimary ? "(Principal)" : ""}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Parentesco:</Text>
                <Text style={styles.value}>{g.relation}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>DNI:</Text>
                <Text style={styles.value}>{g.dni}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Teléfono:</Text>
                <Text style={styles.value}>{g.phone}</Text>
              </View>
              {g.email && (
                <View style={styles.row}>
                  <Text style={styles.label}>Email:</Text>
                  <Text style={styles.value}>{g.email}</Text>
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.infoBox}>
            <Text
              style={{ fontSize: 10, color: "#64748b", fontStyle: "italic" }}
            >
              No registra apoderados.
            </Text>
          </View>
        )}

        <PDFFooter />
      </Page>
    </Document>
  );
};
