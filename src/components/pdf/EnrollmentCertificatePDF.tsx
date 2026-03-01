import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PDFFooter } from "./Footer";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const styles = StyleSheet.create({
  page: { padding: 50, fontFamily: "Helvetica", color: "#334155" },
  header: {
    marginBottom: 40,
    borderBottomWidth: 2,
    borderBottomColor: "#059669",
    paddingBottom: 20,
  },
  schoolName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "center",
  },
  title: {
    fontSize: 12,
    color: "#059669",
    textTransform: "uppercase",
    letterSpacing: 2,
    textAlign: "center",
    marginTop: 8,
  },
  content: {
    fontSize: 12,
    lineHeight: 1.8,
    marginBottom: 20,
    textAlign: "justify",
    color: "#1e293b",
  },
  boldText: { fontWeight: "bold", color: "#0f172a" },
  signatureBox: {
    marginTop: 80,
    width: 220,
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    alignItems: "center",
    alignSelf: "center",
    paddingTop: 10,
  },
  signatureTitle: { fontSize: 11, fontWeight: "bold", color: "#0f172a" },
  signatureText: { fontSize: 10, color: "#64748b", marginTop: 2 },
});

export const EnrollmentCertificatePDF = ({
  enrollment,
}: {
  enrollment: any;
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.schoolName}>TerraNova Academy</Text>
        <Text style={styles.title}>Constancia de Matrícula</Text>
      </View>

      <Text style={styles.content}>A quien corresponda:</Text>

      <Text style={styles.content}>
        La Dirección Académica de la Institución Educativa Privada "TerraNova
        Academy", hace constar por medio de la presente que el/la estudiante{" "}
        <Text style={styles.boldText}>
          {enrollment.student.firstName} {enrollment.student.lastName}
        </Text>
        , identificado(a) con DNI N°{" "}
        <Text style={styles.boldText}>{enrollment.student.dni}</Text>, se
        encuentra debidamente matriculado(a) y cursando estudios
        correspondientes al Año Lectivo{" "}
        <Text style={styles.boldText}>{enrollment.academicYear.year}</Text>.
      </Text>

      <Text style={styles.content}>
        Actualmente pertenece al nivel{" "}
        <Text style={styles.boldText}>
          {enrollment.section.gradeLevel.level}
        </Text>
        , grado{" "}
        <Text style={styles.boldText}>
          {enrollment.section.gradeLevel.name}
        </Text>
        , en la sección "
        <Text style={styles.boldText}>{enrollment.section.name}</Text>".
      </Text>

      <Text style={styles.content}>
        Se expide el presente documento a solicitud de la parte interesada, para
        los fines que estime convenientes.
      </Text>

      <Text style={[styles.content, { marginTop: 40 }]}>
        Emitido en Lima, a los{" "}
        {format(new Date(), "dd 'días del mes de' MMMM 'de' yyyy", {
          locale: es,
        })}
        .
      </Text>

      <View style={styles.signatureBox}>
        <Text style={styles.signatureTitle}>Dirección Académica</Text>
        <Text style={styles.signatureText}>TerraNova Academy</Text>
      </View>

      <PDFFooter />
    </Page>
  </Document>
);
