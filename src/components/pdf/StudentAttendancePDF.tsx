import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PDFFooter } from "./Footer";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
} from "date-fns";
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
    width: 90,
    textTransform: "uppercase",
  },
  value: { fontSize: 10, color: "#0f172a", fontWeight: "bold" },

  monthSection: { marginBottom: 25 },
  monthTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 4,
    textTransform: "capitalize",
  },

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: "#e2e8f0",
  },
  dayHeader: {
    width: "14.28%",
    height: 20,
    backgroundColor: "#f1f5f9",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  dayHeaderText: { fontSize: 8, fontWeight: "bold", color: "#475569" },

  dayCell: {
    width: "14.28%",
    height: 35,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e2e8f0",
    padding: 2,
    position: "relative",
  },
  dayNumber: { fontSize: 8, color: "#94a3b8" },
  statusIndicator: {
    position: "absolute",
    top: 12,
    left: 4,
    right: 4,
    bottom: 4,
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    fontSize: 6,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },

  legend: {
    flexDirection: "row",
    gap: 15,
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
    flexWrap: "wrap",
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendBox: { width: 10, height: 10, borderRadius: 2 },
  legendText: { fontSize: 8, color: "#64748b" },
});

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  PRESENTE: { color: "#059669", label: "P" },
  TARDANZA: { color: "#d97706", label: "T" },
  FALTA_JUSTIFICADA: { color: "#2563eb", label: "FJ" },
  FALTA_INJUSTIFICADA: { color: "#dc2626", label: "FI" },
};

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export const StudentAttendancePDF = ({
  student,
  enrollment,
  attendances,
}: {
  student: any;
  enrollment: any;
  attendances: any[];
}) => {
  // Group attendances by month
  const monthsData: Record<string, any[]> = {};
  attendances.forEach((a) => {
    const monthKey = format(new Date(a.date), "yyyy-MM");
    if (!monthsData[monthKey]) monthsData[monthKey] = [];
    monthsData[monthKey].push(a);
  });

  const sortedMonths = Object.keys(monthsData).sort().reverse();

  const renderCalendar = (monthKey: string) => {
    const [year, month] = monthKey.split("-").map(Number);
    const firstDay = startOfMonth(new Date(year, month - 1));
    const lastDay = endOfMonth(firstDay);
    const days = eachDayOfInterval({ start: firstDay, end: lastDay });

    // getDay returns 0 for Sunday. We want 0 for Monday (adjustment: (getDay + 6) % 7)
    const emptyCells = (getDay(firstDay) + 6) % 7;

    return (
      <View style={styles.monthSection} key={monthKey} wrap={false}>
        <Text style={styles.monthTitle}>
          {format(firstDay, "MMMM yyyy", { locale: es })}
        </Text>
        <View style={styles.calendarGrid}>
          {WEEKDAYS.map((day) => (
            <View style={styles.dayHeader} key={day}>
              <Text style={styles.dayHeaderText}>{day}</Text>
            </View>
          ))}

          {Array.from({ length: emptyCells }).map((_, i) => (
            <View style={styles.dayCell} key={`empty-${i}`} />
          ))}

          {days.map((date) => {
            const attendance = attendances.find((a) =>
              isSameDay(new Date(a.date), date),
            );
            const statusStyle = attendance
              ? STATUS_MAP[attendance.status]
              : null;

            return (
              <View style={styles.dayCell} key={date.toISOString()}>
                <Text style={styles.dayNumber}>{format(date, "d")}</Text>
                {statusStyle && (
                  <View
                    style={[
                      styles.statusIndicator,
                      { backgroundColor: statusStyle.color },
                    ]}
                  >
                    <Text style={styles.statusText}>{statusStyle.label}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.schoolName}>TerraNova Academy</Text>
            <Text style={styles.title}>Historial de Asistencia Individual</Text>
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
            <Text style={styles.label}>Grado/Sección:</Text>
            <Text style={styles.value}>
              {enrollment.section.gradeLevel.name} - {enrollment.section.name}
            </Text>
          </View>
        </View>

        {sortedMonths.map(renderCalendar)}

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: "#059669" }]} />
            <Text style={styles.legendText}>Presente (P)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: "#d97706" }]} />
            <Text style={styles.legendText}>Tardanza (T)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: "#2563eb" }]} />
            <Text style={styles.legendText}>Falta Justificada (FJ)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: "#dc2626" }]} />
            <Text style={styles.legendText}>Falta Injustificada (FI)</Text>
          </View>
        </View>

        <PDFFooter />
      </Page>
    </Document>
  );
};
