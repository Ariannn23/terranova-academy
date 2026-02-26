import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { PDFFooter } from "./Footer";
import { format } from "date-fns";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica" },
  header: { marginBottom: 20, textAlign: "center" },
  schoolName: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  title: { fontSize: 16, marginBottom: 15 },
  infoBox: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 10,
    marginBottom: 20,
    borderRadius: 4,
  },
  row: { flexDirection: "row", marginBottom: 5 },
  label: { fontSize: 10, fontWeight: "bold", width: 80 },
  value: { fontSize: 10 },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: { margin: "auto", flexDirection: "row" },
  tableHeader: {
    margin: "auto",
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
  },
  tableColCourse: {
    width: "40%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#e2e8f0",
  },
  tableColGrade: {
    width: "15%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#e2e8f0",
  },
  tableCell: { margin: "auto", marginTop: 5, marginBottom: 5, fontSize: 10 },
  tableHeaderCell: {
    margin: "auto",
    marginTop: 5,
    marginBottom: 5,
    fontSize: 10,
    fontWeight: "bold",
  },
  summaryText: {
    fontSize: 12,
    marginTop: 15,
    textAlign: "right",
    fontWeight: "bold",
  },
});

export const GradeReportPDF = ({
  student,
  section,
  academicYear,
  grades,
}: {
  student: any;
  section: any;
  academicYear: any;
  grades: any[]; // Aggregated grades per course
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.schoolName}>TerraNova Academy</Text>
        <Text style={styles.title}>INFORME DE PROGRESO ACADÉMICO</Text>
      </View>

      <View style={styles.infoBox}>
        <View style={styles.row}>
          <Text style={styles.label}>Estudiante:</Text>
          <Text style={styles.value}>
            {student.lastName}, {student.firstName}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>DNI:</Text>
          <Text style={styles.value}>{student.dni}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Grado/Sección:</Text>
          <Text style={styles.value}>
            {section.gradeLevel.name} - {section.name} (
            {section.gradeLevel.level})
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Año Lectivo:</Text>
          <Text style={styles.value}>{academicYear.year}</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <View style={styles.tableColCourse}>
            <Text style={styles.tableHeaderCell}>Curso</Text>
          </View>
          <View style={styles.tableColGrade}>
            <Text style={styles.tableHeaderCell}>B1</Text>
          </View>
          <View style={styles.tableColGrade}>
            <Text style={styles.tableHeaderCell}>B2</Text>
          </View>
          <View style={styles.tableColGrade}>
            <Text style={styles.tableHeaderCell}>B3</Text>
          </View>
          <View style={styles.tableColGrade}>
            <Text style={styles.tableHeaderCell}>B4</Text>
          </View>
          <View style={styles.tableColGrade}>
            <Text style={styles.tableHeaderCell}>PF</Text>
          </View>
        </View>

        {grades.map((g, i) => (
          <View style={styles.tableRow} key={i}>
            <View style={styles.tableColCourse}>
              <Text style={styles.tableCell}>{g.courseName}</Text>
            </View>
            <View style={styles.tableColGrade}>
              <Text style={styles.tableCell}>{g.b1 || "-"}</Text>
            </View>
            <View style={styles.tableColGrade}>
              <Text style={styles.tableCell}>{g.b2 || "-"}</Text>
            </View>
            <View style={styles.tableColGrade}>
              <Text style={styles.tableCell}>{g.b3 || "-"}</Text>
            </View>
            <View style={styles.tableColGrade}>
              <Text style={styles.tableCell}>{g.b4 || "-"}</Text>
            </View>
            <View style={styles.tableColGrade}>
              <Text style={styles.tableCell}>{g.final || "-"}</Text>
            </View>
          </View>
        ))}
      </View>

      <PDFFooter />
    </Page>
  </Document>
);
