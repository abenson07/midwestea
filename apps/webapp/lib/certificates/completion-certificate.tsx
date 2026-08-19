import React from "react";
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import {
  DEFAULT_CERTIFICATE_STATICS,
  formatCertificateDate,
  type CompletionCertificateProps,
} from "./types";

const GOLD = "#8F6D29";
const BODY = "#4A4A4A";
const PAGE_WIDTH = 792;
const PAGE_HEIGHT = 612;

const styles = StyleSheet.create({
  page: {
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    position: "relative",
    backgroundColor: "#ffffff",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
  },
  content: {
    position: "absolute",
    top: 0,
    left: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    paddingTop: 72,
    paddingBottom: 56,
    paddingHorizontal: 72,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    fontFamily: "Times-Roman",
    fontSize: 22,
    color: GOLD,
    letterSpacing: 3.2,
    textAlign: "center",
  },
  certifies: {
    fontFamily: "Helvetica",
    fontSize: 11,
    color: BODY,
    letterSpacing: 1.4,
    textAlign: "center",
  },
  middle: {
    flexGrow: 1,
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 36,
  },
  studentBlock: {
    alignItems: "center",
    width: "100%",
  },
  studentName: {
    fontFamily: "Times-Bold",
    fontSize: 32,
    color: GOLD,
    letterSpacing: 2.4,
    textAlign: "center",
  },
  body: {
    marginTop: 10,
    fontFamily: "Helvetica",
    fontSize: 12,
    color: BODY,
    textAlign: "center",
    lineHeight: 1.45,
    maxWidth: 520,
  },
  metaBlock: {
    alignItems: "center",
  },
  date: {
    fontFamily: "Helvetica",
    fontSize: 12,
    color: BODY,
    letterSpacing: 1.2,
    textAlign: "center",
  },
  bems: {
    marginTop: 6,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: BODY,
    letterSpacing: 1.1,
    textAlign: "center",
  },
  footer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  signatureBlock: {
    width: 190,
    alignItems: "center",
  },
  signatureMark: {
    width: 148,
    height: 44,
    marginBottom: -4,
  },
  signatureMarkWide: {
    width: 168,
    height: 38,
    marginBottom: -4,
  },
  signatureLine: {
    width: 168,
    borderBottomWidth: 0.75,
    borderBottomColor: BODY,
    marginBottom: 8,
  },
  signatureName: {
    fontFamily: "Helvetica",
    fontSize: 11,
    color: BODY,
    textAlign: "center",
    marginBottom: 3,
  },
  signatureTitle: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: BODY,
    textAlign: "center",
  },
  sealColumn: {
    width: 244,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 18,
  },
  seal: {
    width: 146,
    height: 48,
  },
});

function assetUrl(baseUrl: string | undefined, path: string): string {
  const origin = (baseUrl ?? "").replace(/\/$/, "");
  return `${origin}${path}`;
}

export function CompletionCertificateDocument({
  studentName,
  courseName,
  completionDate,
  bemsNumber = DEFAULT_CERTIFICATE_STATICS.bemsNumber,
  programDirectorName = DEFAULT_CERTIFICATE_STATICS.programDirectorName,
  presidentName = DEFAULT_CERTIFICATE_STATICS.presidentName,
  assetBaseUrl,
}: CompletionCertificateProps) {
  const wreathSrc = assetUrl(assetBaseUrl, "/images/certificates/wreath.png");
  const logoSrc = assetUrl(assetBaseUrl, "/images/certificates/logo.png");
  const kyleSigSrc = assetUrl(assetBaseUrl, "/images/certificates/signature-kyle.png");
  const gabeSigSrc = assetUrl(assetBaseUrl, "/images/certificates/signature-gabe.png");

  return (
    <Document title={`Certificate — ${studentName}`} author="Midwest Emergency Academy">
      <Page size="LETTER" orientation="landscape" style={styles.page}>
        <Image src={wreathSrc} style={styles.background} />
        <View style={styles.content}>
          <Text style={styles.title}>CERTIFICATION OF COMPLETION</Text>
          <View style={styles.middle}>
            <Text style={styles.certifies}>THIS CERTIFIES THAT</Text>
            <View style={styles.studentBlock}>
              <Text style={styles.studentName}>{studentName.trim().toUpperCase()}</Text>
              <Text style={styles.body}>
                has successfully completed the course of study required to{"\n"}
                graduate from Midwest Emergency Academy {courseName.trim()} course
              </Text>
            </View>
            <View style={styles.metaBlock}>
              <Text style={styles.date}>{formatCertificateDate(completionDate)}</Text>
              <Text style={styles.bems}>BEMS # {bemsNumber.trim()}</Text>
            </View>
          </View>
          <View style={styles.footer}>
            <View style={styles.signatureBlock}>
              <Image src={kyleSigSrc} style={styles.signatureMark} />
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>{programDirectorName}</Text>
              <Text style={styles.signatureTitle}>Program Director</Text>
            </View>
            <View style={styles.sealColumn}>
              <Image src={logoSrc} style={styles.seal} />
            </View>
            <View style={styles.signatureBlock}>
              <Image src={gabeSigSrc} style={styles.signatureMarkWide} />
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>{presidentName}</Text>
              <Text style={styles.signatureTitle}>President</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
