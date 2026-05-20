export interface CertificateStyle {
  top: number;
  left: number;
  fontSize: number;
  color: string;
}

export interface CertificateFields {
  eventTitle: string | boolean;
  name: string | boolean;
  domicile: string | boolean;
}

export interface CertificateDesign {
  layout: string;
  fields: CertificateFields;
  styles: {
    eventTitle: CertificateStyle;
    name: CertificateStyle;
    domicile: CertificateStyle;
  };
}

export interface CertificateConfig {
  design: CertificateDesign;
}

export interface CertificatePreviewData {
  PK: string;
  SK: string;
  Subject: string;
  Certificate_Picture: string;
  Certificate_Configuration: CertificateConfig;
}