import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PDFFooter } from "./Footer";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const styles = StyleSheet.create({
  page: { padding: 50, fontFamily: "Helvetica", color: "#334155" },
  header: {
    marginBottom: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 3,
    borderBottomColor: "#059669",
    paddingBottom: 20,
  },
  schoolName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0f172a",
    letterSpacing: 0.5,
  },
  documentType: {
    fontSize: 10,
    color: "#059669",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 6,
    fontWeight: "bold",
  },
  dateContainer: {
    textAlign: "right",
  },
  dateLabel: {
    fontSize: 9,
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 11,
    color: "#0f172a",
    fontWeight: "bold",
  },
  contentContainer: {
    marginTop: 20,
  },
  communicationTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 25,
    lineHeight: 1.2,
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  metaLabel: {
    fontSize: 9,
    color: "#64748b",
    width: 80,
    textTransform: "uppercase",
  },
  metaValue: {
    fontSize: 10,
    color: "#0f172a",
    fontWeight: "bold",
  },
  body: {
    fontSize: 12,
    lineHeight: 1.7,
    color: "#1e293b",
    textAlign: "justify",
    marginBottom: 60,
  },
  signatureContainer: {
    marginTop: "auto",
    alignItems: "center",
  },
  signatureLine: {
    width: 200,
    borderTopWidth: 1,
    borderTopColor: "#94a3b8",
    marginBottom: 10,
  },
  signatureText: {
    fontSize: 10,
    color: "#475569",
    fontWeight: "bold",
  },
  signatureSubtext: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 4,
  },
});

interface CommunicationPDFProps {
  announcement: {
    title: string;
    body: string;
    targetLevel: string | null;
    createdAt: Date | string;
  };
}

export const CommunicationPDF = ({ announcement }: CommunicationPDFProps) => {
  const formattedDate = format(
    new Date(announcement.createdAt),
    "d 'de' MMMM, yyyy",
    {
      locale: es,
    },
  );

  const getTargetLevelLabel = (level: string | null) => {
    switch (level) {
      case "INICIAL":
        return "Nivel Inicial";
      case "PRIMARIA":
        return "Nivel Primaria";
      case "SECUNDARIA":
        return "Nivel Secundaria";
      default:
        return "General (Todos los niveles)";
    }
  };

  return (
    <Document title={`Comunicado - ${announcement.title}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.schoolName}>TerraNova Academy</Text>
            <Text style={styles.documentType}>Comunicado Oficial</Text>
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Fecha de Emisión</Text>
            <Text style={styles.dateValue}>{formattedDate}</Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.communicationTitle}>{announcement.title}</Text>

          <View style={{ marginBottom: 25 }}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Dirigido a:</Text>
              <Text style={styles.metaValue}>
                {getTargetLevelLabel(announcement.targetLevel)}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Referencia:</Text>
              <Text style={styles.metaValue}>
                COM-{new Date(announcement.createdAt).getFullYear()}-
                {Math.floor(Math.random() * 1000)
                  .toString()
                  .padStart(3, "0")}
              </Text>
            </View>
          </View>

          <Text style={styles.body}>{announcement.body}</Text>
        </View>

        <View style={styles.signatureContainer}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureText}>Dirección Académica</Text>
          <Text style={styles.signatureSubtext}>
            TerraNova Academy - Formando Líderes
          </Text>
        </View>

        <PDFFooter />
      </Page>
    </Document>
  );
};
