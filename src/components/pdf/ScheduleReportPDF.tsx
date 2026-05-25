import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { PDFFooter } from "./Footer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#10b981",
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
  },
  headerSubtitle: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 4,
  },
  studentInfoBox: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  infoLabel: {
    width: 80,
    fontSize: 10,
    fontWeight: "bold",
    color: "#475569",
  },
  infoValue: {
    flex: 1,
    fontSize: 10,
    color: "#0f172a",
  },
  gridContainer: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    marginTop: 10,
    flexDirection: "column",
  },
  gridHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
  },
  gridHeaderCell: {
    padding: 8,
    fontSize: 9,
    fontWeight: "bold",
    color: "#334155",
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
  },
  timeHeaderCell: {
    width: "15%",
    borderRightWidth: 1,
    borderRightColor: "#cbd5e1",
    padding: 8,
    fontSize: 9,
    fontWeight: "bold",
    color: "#334155",
    textAlign: "center",
  },
  dayHeaderCell: {
    width: "17%",
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
    padding: 8,
    fontSize: 9,
    fontWeight: "bold",
    color: "#334155",
    textAlign: "center",
  },
  gridRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    minHeight: 50,
  },
  timeCell: {
    width: "15%",
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  timeText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#64748b",
  },
  dayCell: {
    width: "17%",
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  courseText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 4,
  },
  teacherText: {
    fontSize: 6,
    color: "#64748b",
    textAlign: "center",
  },
  emptyCell: {
    width: "17%",
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  }
});

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

export const ScheduleReportPDF = ({ enrollment, schedules }: { enrollment: any; schedules: any[] }) => {
  // Extract unique time slots
  const timeSlotsSet = new Set<string>();
  schedules.forEach((s) => {
    timeSlotsSet.add(`${s.startTime}-${s.endTime}`);
  });

  // Sort time slots chronologically
  const timeSlots = Array.from(timeSlotsSet).sort((a, b) => {
    return a.localeCompare(b);
  });

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Horario de Clases Semanal</Text>
            <Text style={styles.headerSubtitle}>
              Año Académico {enrollment.section.academicYear.year}
            </Text>
          </View>
          <View>
             <Text style={{ fontSize: 18, color: "#10b981", fontWeight: "bold" }}>TerraNova</Text>
          </View>
        </View>

        {/* Student Box */}
        <View style={styles.studentInfoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estudiante:</Text>
            <Text style={styles.infoValue}>
              {enrollment.student.lastName}, {enrollment.student.firstName} (DNI: {enrollment.student.dni})
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Grado y Sección:</Text>
            <Text style={styles.infoValue}>
              {enrollment.section.gradeLevel.name} - Sección "{enrollment.section.name}" ({enrollment.section.gradeLevel.level})
            </Text>
          </View>
        </View>

        {/* Schedule Grid */}
        <View style={styles.gridContainer}>
          {/* Grid Header */}
          <View style={styles.gridHeaderRow}>
            <Text style={styles.timeHeaderCell}>H O R A</Text>
            {DAYS.map((day, idx) => (
              <Text key={idx} style={[styles.dayHeaderCell, idx === 4 ? { borderRightWidth: 0 } : {}]}>
                {day.toUpperCase()}
              </Text>
            ))}
          </View>

          {/* Grid Rows */}
          {timeSlots.map((slot, rowIndex) => {
            const [start, end] = slot.split("-");
            return (
              <View key={rowIndex} style={[styles.gridRow, rowIndex === timeSlots.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                {/* Time Cell */}
                <View style={styles.timeCell}>
                  <Text style={styles.timeText}>{start}</Text>
                  <Text style={styles.timeText}>-</Text>
                  <Text style={styles.timeText}>{end}</Text>
                </View>

                {/* Day Cells (1 to 5) */}
                {[1, 2, 3, 4, 5].map((dayNum, cellIndex) => {
                  const currentClass = schedules.find(
                    (s) => s.startTime === start && s.endTime === end && s.dayOfWeek === dayNum
                  );

                  if (currentClass) {
                    return (
                      <View key={cellIndex} style={[styles.dayCell, cellIndex === 4 ? { borderRightWidth: 0 } : {}]}>
                        <Text style={styles.courseText}>{currentClass.course.name}</Text>
                        <Text style={styles.teacherText}>{currentClass.teacher.firstName} {currentClass.teacher.lastName}</Text>
                      </View>
                    );
                  } else {
                    return (
                      <View key={cellIndex} style={[styles.emptyCell, cellIndex === 4 ? { borderRightWidth: 0 } : {}]} />
                    );
                  }
                })}
              </View>
            );
          })}
        </View>

        {timeSlots.length === 0 && (
          <View style={{ marginTop: 20, alignItems: "center" }}>
             <Text style={{ fontSize: 12, color: "#64748b" }}>No hay un horario registrado para esta sección.</Text>
          </View>
        )}

        <PDFFooter />
      </Page>
    </Document>
  );
};
