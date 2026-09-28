import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 9, fontFamily: "Helvetica", color: "#1a2e22" },
  title: { fontSize: 16, marginBottom: 4, fontFamily: "Helvetica-Bold" },
  meta: { fontSize: 10, marginBottom: 16, color: "#4a5c52" },
  rule: { height: 2, backgroundColor: "#008d36", marginBottom: 12 },
  row: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#d0d8d3", paddingVertical: 4 },
  head: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#008d36", paddingBottom: 4, marginBottom: 2 },
  cell: { flex: 1, paddingRight: 4 },
  cellSm: { width: 36, paddingRight: 4 },
  cellMd: { width: 52, paddingRight: 4 },
  bold: { fontFamily: "Helvetica-Bold" },
});

type Row = {
  slNo: number;
  chestNo: string;
  codeLetter: string;
  j1Mark: number | null;
  j2Mark: number | null;
  total: number | null;
  j1Grade: string | null;
  j2Grade: string | null;
  remark: string;
  placement: number | null;
};

export function ResultsPdfDocument(props: {
  itemName: string;
  itemCode: string;
  judge1Name: string;
  judge2Name: string;
  rows: Row[];
}) {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", orientation: "landscape", style: styles.page },
      React.createElement(Text, { style: styles.title }, "SKJMCC Musabaqa — Results"),
      React.createElement(
        Text,
        { style: styles.meta },
        `${props.itemName} (${props.itemCode}) · ${props.judge1Name} / ${props.judge2Name}`,
      ),
      React.createElement(View, { style: styles.rule }),
      React.createElement(
        View,
        { style: styles.head },
        ["SL", "Chest", "Code", "J1", "J2", "Total", "G1", "G2", "Place", "Remark"].map(
          (h, i) =>
            React.createElement(
              Text,
              {
                key: h,
                style: [styles.bold, i < 9 ? styles.cellMd : styles.cell],
              },
              h,
            ),
        ),
      ),
      ...props.rows.map((r) =>
        React.createElement(
          View,
          { key: r.slNo, style: styles.row, wrap: false },
          React.createElement(Text, { style: styles.cellMd }, String(r.slNo)),
          React.createElement(Text, { style: styles.cellMd }, r.chestNo),
          React.createElement(Text, { style: styles.cellMd }, r.codeLetter),
          React.createElement(Text, { style: styles.cellMd }, r.j1Mark ?? "—"),
          React.createElement(Text, { style: styles.cellMd }, r.j2Mark ?? "—"),
          React.createElement(Text, { style: styles.cellMd }, r.total ?? "—"),
          React.createElement(Text, { style: styles.cellMd }, r.j1Grade ?? "—"),
          React.createElement(Text, { style: styles.cellMd }, r.j2Grade ?? "—"),
          React.createElement(Text, { style: styles.cellMd }, r.placement ?? "—"),
          React.createElement(Text, { style: styles.cell }, r.remark || "—"),
        ),
      ),
    ),
  );
}
