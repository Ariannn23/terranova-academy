import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PDFFooter } from "./Footer";
import { format } from "date-fns";
import type { PdfPaymentReceipt } from "@/types/pdf";

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
  receiptNo: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "right",
  },
  dateText: { fontSize: 9, color: "#64748b", textAlign: "right", marginTop: 4 },
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
    width: 100,
    textTransform: "uppercase",
  },
  value: { fontSize: 10, color: "#0f172a", fontWeight: "bold" },
  table: { width: "100%", marginTop: 10 },
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
  tableColDesc: { width: "70%" },
  tableColAmount: { width: "30%", textAlign: "right" },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#475569",
    textTransform: "uppercase",
  },
  tableCell: { fontSize: 10, color: "#1e293b" },
  totalRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#0f172a",
    paddingTop: 12,
    marginTop: 12,
    justifyContent: "flex-end",
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0f172a",
    marginRight: 20,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#059669",
    textAlign: "right",
    width: 100,
  },
  footerNote: {
    fontSize: 10,
    marginTop: 40,
    textAlign: "center",
    color: "#64748b",
  },
});

export const PaymentReceiptPDF = ({
  payment,
}: {
  payment: PdfPaymentReceipt;
}) => (
  <Document>
    <Page size="A5" orientation="landscape" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.schoolName}>TerraNova Academy</Text>
          <Text style={styles.title}>Recibo Electrónico</Text>
        </View>
        <View>
          <Text style={styles.receiptNo}>
            N° {payment.reference || payment.id.slice(-6).toUpperCase()}
          </Text>
          <Text style={styles.dateText}>
            Fecha:{" "}
            {payment.paidAt
              ? format(new Date(payment.paidAt), "dd/MM/yyyy HH:mm")
              : "N/A"}
          </Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <View style={styles.row}>
          <Text style={styles.label}>Estudiante:</Text>
          <Text style={styles.value}>
            {payment.enrollment?.student?.firstName}{" "}
            {payment.enrollment?.student?.lastName}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>DNI:</Text>
          <Text style={styles.value}>{payment.enrollment?.student?.dni}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Grado/Sección:</Text>
          <Text style={styles.value}>
            {payment.enrollment?.section?.gradeLevel?.name} -{" "}
            {payment.enrollment?.section?.name}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Método Pago:</Text>
          <Text style={styles.value}>
            {payment.method || "No especificado"}
          </Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <View style={styles.tableColDesc}>
            <Text style={styles.tableHeaderCell}>Descripción</Text>
          </View>
          <View style={styles.tableColAmount}>
            <Text style={styles.tableHeaderCell}>Importe (S/)</Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableColDesc}>
            <Text style={styles.tableCell}>{payment.concept?.name}</Text>
          </View>
          <View style={styles.tableColAmount}>
            <Text style={styles.tableCell}>{payment.amount?.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>TOTAL CANCELADO</Text>
        <Text style={styles.totalValue}>S/ {payment.amount?.toFixed(2)}</Text>
      </View>

      <Text style={styles.footerNote}>
        Este documento es un comprobante de pago válido para nuestro control
        interno.
      </Text>

      <PDFFooter />
    </Page>
  </Document>
);
