import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PDFFooter } from "./Footer";

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: "Helvetica", paddingBottom: 60 },
  header: { marginBottom: 15, textAlign: "center" },
  schoolName: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  title: { fontSize: 14, marginBottom: 5 },
  infoBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  label: { fontSize: 10, fontWeight: "bold" },
  value: { fontSize: 10 },
  table: {
    display: "flex",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: { flexDirection: "row" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
  },
  tableColName: {
    width: "40%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#e2e8f0",
  },
  tableColDay: {
    width: "2%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#e2e8f0",
  },
  tableCellName: { padding: 4, fontSize: 8 },
  tableCellDay: { padding: 4, fontSize: 8, textAlign: "center" },
  tableHeaderCellName: { padding: 4, fontSize: 8, fontWeight: "bold" },
  tableHeaderCellDay: {
    padding: 4,
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
});

// Sheet expectations: A landscape or tightly packed portrait.
// We will assume 31 columns for days and output it in A4 landscape.
export const AttendanceSheetPDF = ({
  section,
  monthName,
  year,
  students,
}: {
  section: any;
  monthName: string;
  year: number;
  students: any[];
}) => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.schoolName}>TerraNova Academy</Text>
          <Text style={styles.title}>PLANILLA DE ASISTENCIA MENSUAL</Text>
        </View>

        <View style={styles.infoBox}>
          <View>
            <Text style={styles.label}>Nivel/Grado/Sección:</Text>
            <Text style={styles.value}>
              {section.gradeLevel.level} - {section.gradeLevel.name} "
              {section.name}"
            </Text>
          </View>
          <View>
            <Text style={styles.label}>Mes/Año:</Text>
            <Text style={styles.value}>
              {monthName.toUpperCase()} {year}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.tableColName}>
              <Text style={styles.tableHeaderCellName}>Estudiante</Text>
            </View>
            {days.map((d) => (
              <View style={styles.tableColDay} key={d}>
                <Text style={styles.tableHeaderCellDay}>{d}</Text>
              </View>
            ))}
          </View>

          {students.map((st, i) => (
            <View style={styles.tableRow} key={i}>
              <View style={styles.tableColName}>
                <Text style={styles.tableCellName}>
                  {st.lastName}, {st.firstName}
                </Text>
              </View>
              {days.map((d) => (
                <View style={styles.tableColDay} key={d}>
                  <Text style={styles.tableCellDay}></Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <PDFFooter />
      </Page>
    </Document>
  );
};
