import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, HRFlowable

class PDFGenerator:
    def __init__(self):
        pass

    def generate_report(self, scan_data, output_path):
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        elements = []

        # Colors
        navy = colors.HexColor("#0F172A")
        primary_blue = colors.HexColor("#0284C7")
        pass_green = colors.HexColor("#16A34A")
        fail_red = colors.HexColor("#DC2626")
        text_dark = colors.HexColor("#1E293B")

        # Custom Styles
        title_style = ParagraphStyle('DocTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=18, textColor=navy, alignment=1, spaceAfter=4)
        subtitle_style = ParagraphStyle('DocSubtitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=12, textColor=primary_blue, alignment=1, spaceAfter=15)
        section_style = ParagraphStyle('SectionHeader', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=13, textColor=navy, spaceBefore=10, spaceAfter=6)
        normal_style = ParagraphStyle('DocNormal', parent=styles['Normal'], fontName='Helvetica', fontSize=9, textColor=text_dark, leading=12)
        normal_bold = ParagraphStyle('DocNormalBold', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9, textColor=text_dark, leading=12)

        # Header Title
        elements.append(Paragraph("GOVERNMENT LEGAL METROLOGY ENFORCEMENT PORTAL", title_style))
        elements.append(Paragraph("INSPECTION & EVIDENCE CERTIFICATE — LMPC RULES 2011", subtitle_style))
        elements.append(HRFlowable(width="100%", thickness=2, color=primary_blue, spaceAfter=15))

        # Verdict Header Banner
        is_compliant = scan_data.get("compliant", False)
        verdict_text = "COMPLIANT — PASS" if is_compliant else "NON-COMPLIANT — VIOLATIONS DETECTED"
        banner_bg = pass_green if is_compliant else fail_red

        banner_data = [
            [Paragraph(f"<font color='white'><b>INSPECTION VERDICT: {verdict_text}</b> (Compliance Score: {scan_data.get('compliance_score', 0)}%)</font>", ParagraphStyle('Banner', parent=title_style, fontSize=12, alignment=1))]
        ]
        banner_table = Table(banner_data, colWidths=[540])
        banner_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), banner_bg),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ]))
        elements.append(banner_table)
        elements.append(Spacer(1, 15))

        # Metadata Block
        meta_data = [
            [Paragraph("<b>Inspection ID:</b>", normal_style), Paragraph(scan_data.get("id", "N/A"), normal_style),
             Paragraph("<b>Scan Date:</b>", normal_style), Paragraph(scan_data.get("timestamp", "N/A"), normal_style)],
            [Paragraph("<b>Commodity Name:</b>", normal_style), Paragraph(scan_data.get("commodity_name", "Packaged Commodity"), normal_style),
             Paragraph("<b>Officer ID:</b>", normal_style), Paragraph(scan_data.get("officer_id", "INSPECTOR-8821"), normal_style)],
            [Paragraph("<b>Location/Region:</b>", normal_style), Paragraph(scan_data.get("region", "North Zone, New Delhi"), normal_style),
             Paragraph("<b>Legal Act:</b>", normal_style), Paragraph("LMPC Rules, 2011 / LM Act 2009", normal_style)]
        ]
        meta_table = Table(meta_data, colWidths=[100, 170, 100, 170])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 15))

        # Extracted Declarations Section
        elements.append(Paragraph("EVIDENCE DETAILS — EXTRACTED MANDATORY DECLARATIONS", section_style))
        fields = scan_data.get("extracted_fields", {})
        
        decl_data = [
            [Paragraph("<b>Mandatory Declaration Field</b>", normal_bold), Paragraph("<b>Extracted Value</b>", normal_bold), Paragraph("<b>OCR Confidence</b>", normal_bold)]
        ]

        field_labels = {
            "generic_name": "Generic Name of Commodity",
            "net_quantity": "Net Quantity / Volume",
            "mrp": "Maximum Retail Price (MRP)",
            "mfg_date": "Date of Mfg / Packing",
            "manufacturer_details": "Manufacturer / Packer Address",
            "country_of_origin": "Country of Origin",
            "customer_care": "Consumer Care Details"
        }

        for k, label in field_labels.items():
            f_info = fields.get(k, {})
            val = f_info.get("value") or "[NOT DETECTED / MISSING]"
            conf = f"{int(f_info.get('confidence', 0) * 100)}%"
            val_style = normal_style if f_info.get("value") else ParagraphStyle('Missing', parent=normal_style, textColor=fail_red, fontName='Helvetica-Bold')
            decl_data.append([
                Paragraph(label, normal_style),
                Paragraph(val, val_style),
                Paragraph(conf, normal_style)
            ])

        decl_table = Table(decl_data, colWidths=[180, 280, 80])
        decl_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E0F2FE")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#93C5FD")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ]))
        elements.append(decl_table)
        elements.append(Spacer(1, 15))

        # Violations Section
        violations = scan_data.get("violations", [])
        if violations:
            elements.append(Paragraph("STATUTORY RULE VIOLATIONS & CLAUSE CITATIONS", section_style))
            viol_data = [
                [Paragraph("<b>Clause Reference</b>", normal_bold), Paragraph("<b>Violation Findings</b>", normal_bold), Paragraph("<b>Statutory Penalty Reference</b>", normal_bold)]
            ]
            for v in violations:
                viol_data.append([
                    Paragraph(f"<b>{v.get('clause')}</b><br/><font color='red'>[{v.get('severity')}]</font>", normal_style),
                    Paragraph(v.get("violation_details", ""), normal_style),
                    Paragraph(v.get("penalty_clause", ""), normal_style)
                ])

            viol_table = Table(viol_data, colWidths=[120, 240, 180])
            viol_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#FEE2E2")),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#FCA5A5")),
                ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
                ('TOPPADDING', (0,0), (-1,-1), 5),
                ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ]))
            elements.append(viol_table)
        else:
            elements.append(Paragraph("STATUTORY COMPLIANCE AUDIT RESULTS", section_style))
            elements.append(Paragraph("<b>No legal metrology violations detected.</b> Packaging complies with all mandatory statutory declarations specified in LMPC Rules, 2011.", normal_style))

        elements.append(Spacer(1, 25))

        # Verification Signature Footer
        sig_data = [
            [Paragraph("<b>ComplyScan AI System Digital Seal</b><br/>Verified by Computer Vision Engine", normal_style),
             Paragraph("<b>Inspecting Officer Signature</b><br/>___________________________<br/>Legal Metrology Inspector", normal_style)]
        ]
        sig_table = Table(sig_data, colWidths=[270, 270])
        sig_table.setStyle(TableStyle([
            ('TOPPADDING', (0,0), (-1,-1), 10),
            ('ALIGN', (0,0), (-1,-1), 'CENTER')
        ]))
        elements.append(sig_table)

        doc.build(elements)
        print(f"Generated PDF report: {output_path}")

pdf_generator = PDFGenerator()
