import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PDFFooter } from "./Footer";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica" },
  header: { marginBottom: 30, textAlign: "center" },
  schoolName: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  title: { fontSize: 18, textDecoration: "underline" },
  content: {
    fontSize: 12,
    lineHeight: 1.8,
    marginBottom: 40,
    textAlign: "justify",
  },
  signatureBox: {
    marginTop: 80,
    width: 200,
    borderTopWidth: 1,
    borderTopColor: "#000",
    alignItems: "center",
    alignSelf: "center",
    paddingTop: 5,
  },
  signatureText: { fontSize: 10 },
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
        <Text style={styles.title}>CONSTANCIA DE MATRÍCULA</Text>
      </View>

      <Text style={styles.content}>
        El/la Director(a) de la Institución Educativa Privada "TerraNova
        Academy" hace constar que el/la estudiante{" "}
        <Text style={{ fontWeight: "bold" }}>
          {enrollment.student.firstName} {enrollment.student.lastName}
        </Text>
        , identificado(a) con DNI N° {enrollment.student.dni}, se encuentra
        debidamente matriculado(a) para el Año Lectivo{" "}
        {enrollment.academicYear.year} en el nivel{" "}
        {enrollment.section.gradeLevel.level}, grado{" "}
        {enrollment.section.gradeLevel.name}, sección "{enrollment.section.name}
        ".
      </Text>

      <Text style={styles.content}>
        Se expide la presente constancia a solicitud del interesado para los
        fines que estime convenientes, a los{" "}
        {format(new Date(), "dd 'días del mes de' MMMM 'de' yyyy", {
          locale: es,
        })}
        .
      </Text>

      <View style={styles.signatureBox}>
        <Text style={styles.signatureText}>Dirección Académica</Text>
        <Text style={styles.signatureText}>TerraNova Academy</Text>
      </View>

      <PDFFooter />
    </Page>
  </Document>
);
