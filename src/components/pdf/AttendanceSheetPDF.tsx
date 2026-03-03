import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PDFFooter } from "./Footer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    paddingBottom: 60,
    color: "#334155",
  },
  header: {
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 2,
    borderBottomColor: "#059669",
    paddingBottom: 10,
  },
  schoolName: { fontSize: 20, fontWeight: "bold", color: "#0f172a" },
  title: {
    fontSize: 10,
    color: "#059669",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginTop: 4,
  },
  infoBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 4,
  },
  label: {
    fontSize: 9,
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  value: { fontSize: 10, color: "#0f172a", fontWeight: "bold" },
  table: { width: "100%" },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 6,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  tableColName: { width: "40%", paddingVertical: 4 },
  tableColDay: { width: "2%", textAlign: "center", paddingVertical: 4 },
  tableHeaderCellName: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#475569",
    textTransform: "uppercase",
  },
  tableHeaderCellDay: { fontSize: 8, fontWeight: "bold", color: "#475569" },
  tableCellName: { fontSize: 8, color: "#1e293b" },
  tableCellDay: { fontSize: 7, textAlign: "center" },
  // Colores por estado
  statusA: { color: "#059669" }, // Asistió - verde
  statusF: { color: "#dc2626" }, // Falta - rojo
  statusT: { color: "#d97706" }, // Tardanza - amarillo
});

// ── Helper: devuelve "A", "F", "T" o "" para un día dado ─────────────────────
const getAttendanceStatus = (
  attendances: any[],
  day: number,
  year: number,
  month: number,
): string => {
  const record = attendances.find((a) => {
    const d = new Date(a.date);
    return (
      d.getUTCDate() === day &&
      d.getUTCMonth() + 1 === month &&
      d.getUTCFullYear() === year
    );
  });

  if (!record) return "";

  switch (record.status) {
    case "PRESENT":
      return "A";
    case "ABSENT":
      return "F";
    case "LATE":
      return "T";
    default:
      // Fallback: toma la primera letra del status si existe
      return record.status?.[0] ?? "";
  }
};

// ── Helper: devuelve el estilo de color según el status ──────────────────────
const getStatusStyle = (status: string) => {
  if (status === "A") return styles.statusA;
  if (status === "F") return styles.statusF;
  if (status === "T") return styles.statusT;
  return {};
};

export const AttendanceSheetPDF = ({
  section,
  monthName,
  year,
  month,
  students,
}: {
  section: {
    name: string;
    gradeLevel: {
      level: string;
      name: string;
    };
    [key: string]: any;
  };
  monthName: string;
  year: number;
  month: number;
  students: any[];
}) => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.schoolName}>TerraNova Academy</Text>
            <Text style={styles.title}>Planilla de Asistencia Mensual</Text>
          </View>
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
          {/* Encabezado */}
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

          {/* Filas de estudiantes */}
          {students.map((st, i) => (
            <View style={styles.tableRow} key={i}>
              <View style={styles.tableColName}>
                <Text style={styles.tableCellName}>
                  {st.lastName}, {st.firstName}
                </Text>
              </View>
              {days.map((d) => {
                const status = getAttendanceStatus(
                  st.attendances ?? [],
                  d,
                  year,
                  month,
                );
                return (
                  <View style={styles.tableColDay} key={d}>
                    <Text style={[styles.tableCellDay, getStatusStyle(status)]}>
                      {status}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        <PDFFooter />
      </Page>
    </Document>
  );
};
