import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { PDFFooter } from "./Footer";
import { format } from "date-fns";
import type { PdfAcademicYear, PdfSection, PdfStudent } from "@/types/pdf";

type GradeReportRow = {
  courseName: string;
  p1?: number | null;
  p2?: number | null;
  p3?: number | null;
  p4?: number | null;
  final?: number | null;
};

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
  infoBox: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
  },
  row: { flexDirection: "row", marginBottom: 8 },
  label: {
    fontSize: 9,
    color: "#64748b",
    width: 90,
    textTransform: "uppercase",
  },
  value: { fontSize: 10, color: "#0f172a", fontWeight: "bold" },
  table: { width: "100%" },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  tableColCourse: { width: "40%" },
  tableColGrade: { width: "12%", textAlign: "center" },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#475569",
    textTransform: "uppercase",
  },
  tableCell: { fontSize: 10, color: "#1e293b" },
});

export const GradeReportPDF = ({
  student,
  section,
  academicYear,
  grades,
}: {
  student: PdfStudent;
  section: PdfSection;
  academicYear: PdfAcademicYear;
  grades: GradeReportRow[];
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.schoolName}>TerraNova Academy</Text>
          <Text style={styles.title}>Informe de Progreso</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 9, color: "#64748b" }}>
            Emitido: {format(new Date(), "dd/MM/yyyy")}
          </Text>
        </View>
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
            <Text style={styles.tableHeaderCell}>P1</Text>
          </View>
          <View style={styles.tableColGrade}>
            <Text style={styles.tableHeaderCell}>P2</Text>
          </View>
          <View style={styles.tableColGrade}>
            <Text style={styles.tableHeaderCell}>P3</Text>
          </View>
          <View style={styles.tableColGrade}>
            <Text style={styles.tableHeaderCell}>P4</Text>
          </View>
          <View style={styles.tableColGrade}>
            <Text style={styles.tableHeaderCell}>S. Final</Text>
          </View>
        </View>

        {grades.map((g, i) => {
          const finalScore = Number(g.final);
          const isFailing = finalScore > 0 && finalScore < 11;

          return (
            <View style={styles.tableRow} key={i}>
              <View style={styles.tableColCourse}>
                <Text style={styles.tableCell}>{g.courseName}</Text>
              </View>
              <View style={styles.tableColGrade}>
                <Text style={styles.tableCell}>{g.p1 || "-"}</Text>
              </View>
              <View style={styles.tableColGrade}>
                <Text style={styles.tableCell}>{g.p2 || "-"}</Text>
              </View>
              <View style={styles.tableColGrade}>
                <Text style={styles.tableCell}>{g.p3 || "-"}</Text>
              </View>
              <View style={styles.tableColGrade}>
                <Text style={styles.tableCell}>{g.p4 || "-"}</Text>
              </View>
              <View style={styles.tableColGrade}>
                <Text
                  style={[
                    styles.tableCell,
                    {
                      fontWeight: "bold",
                      color: isFailing
                        ? "#dc2626"
                        : finalScore >= 11
                          ? "#059669"
                          : "#1e293b",
                    },
                  ]}
                >
                  {g.final || "-"}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <PDFFooter />
    </Page>
  </Document>
);
