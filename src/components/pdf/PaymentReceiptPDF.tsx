import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PDFFooter } from "./Footer";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", paddingBottom: 60 },
  header: {
    marginBottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  schoolName: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  title: { fontSize: 16, color: "#64748b" },
  receiptNo: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#dc2626",
    textAlign: "right",
  },
  dateText: {
    fontSize: 10,
    color: "#94a3b8",
    textAlign: "right",
    marginTop: 4,
  },
  box: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    marginBottom: 20,
    backgroundColor: "#f8fafc",
  },
  row: { flexDirection: "row", marginBottom: 8 },
  label: { fontSize: 10, fontWeight: "bold", width: 100 },
  value: { fontSize: 10 },
  table: {
    display: "flex",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 20,
  },
  tableRow: { flexDirection: "row" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
  },
  tableColDesc: {
    width: "70%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#e2e8f0",
    padding: 8,
  },
  tableColAmount: {
    width: "30%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#e2e8f0",
    padding: 8,
  },
  tableText: { fontSize: 10 },
  tableTextHeader: { fontSize: 10, fontWeight: "bold" },
  tableAmount: { fontSize: 10, textAlign: "right", fontWeight: "bold" },
  totalRow: {
    flexDirection: "row",
    borderTopWidth: 2,
    borderTopColor: "#cbd5e1",
    paddingTop: 8,
    marginTop: 10,
    justifyContent: "flex-end",
  },
  totalLabel: { fontSize: 14, fontWeight: "bold", marginRight: 20 },
  totalValue: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
    width: 100,
  },
  footerNote: {
    fontSize: 10,
    marginTop: 40,
    textAlign: "center",
    fontStyle: "italic",
    color: "#64748b",
  },
});

export const PaymentReceiptPDF = ({ payment }: { payment: any }) => (
  <Document>
    <Page size="A5" orientation="landscape" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.schoolName}>TerraNova Academy</Text>
          <Text style={styles.title}>RECIBO DE PAGO</Text>
        </View>
        <View>
          <Text style={styles.receiptNo}>N° {payment.reference}</Text>
          <Text style={styles.dateText}>
            Fecha:{" "}
            {payment.paidAt
              ? format(new Date(payment.paidAt), "dd/MM/yyyy")
              : "N/A"}
          </Text>
        </View>
      </View>

      <View style={styles.box}>
        <View style={styles.row}>
          <Text style={styles.label}>Estudiante:</Text>
          <Text style={styles.value}>
            {payment.enrollment.student.firstName}{" "}
            {payment.enrollment.student.lastName}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>DNI / Código:</Text>
          <Text style={styles.value}>{payment.enrollment.student.dni}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Grado/Sección:</Text>
          <Text style={styles.value}>
            {payment.enrollment.section.gradeLevel.name} -{" "}
            {payment.enrollment.section.name}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Método de Pago:</Text>
          <Text style={styles.value}>
            {payment.method || "No especificado"}
          </Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <View style={styles.tableColDesc}>
            <Text style={styles.tableTextHeader}>Descripción del Concepto</Text>
          </View>
          <View style={styles.tableColAmount}>
            <Text style={[styles.tableTextHeader, { textAlign: "right" }]}>
              Importe (S/.)
            </Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableColDesc}>
            <Text style={styles.tableText}>{payment.concept.name}</Text>
          </View>
          <View style={styles.tableColAmount}>
            <Text style={styles.tableAmount}>{payment.amount.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>TOTAL CANCELADO:</Text>
        <Text style={styles.totalValue}>S/. {payment.amount.toFixed(2)}</Text>
      </View>

      <Text style={styles.footerNote}>
        ¡Gracias por confiar en la educación de su menor hijo(a)!
      </Text>

      <PDFFooter />
    </Page>
  </Document>
);
