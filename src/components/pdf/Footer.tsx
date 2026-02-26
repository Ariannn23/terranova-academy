import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: "#64748b",
  },
});

export const PDFFooter = () => (
  <View style={styles.footer} fixed>
    <Text style={styles.footerText}>
      Documento generado por TerraNova Academy
    </Text>
    <Text style={styles.footerText}>
      {format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}
    </Text>
  </View>
);
