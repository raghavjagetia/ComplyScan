import json
import os
import uuid
from datetime import datetime, timedelta

DATA_DIR = "data"
SCANS_FILE = os.path.join(DATA_DIR, "scans.json")
RULES_FILE = os.path.join(DATA_DIR, "rules.json")

DEFAULT_RULES = [
    {
        "id": "RULE_6_1_A",
        "clause": "Rule 6(1)(a)",
        "title": "Manufacturer / Packer / Importer Details",
        "category": "Declaration",
        "description": "Name and complete address of the manufacturer, packer, or importer must be clearly declared.",
        "severity": "CRITICAL",
        "enabled": True,
        "penalty": "Fine up to ₹25,000 under Section 36 of Legal Metrology Act, 2009"
    },
    {
        "id": "RULE_6_1_B",
        "clause": "Rule 6(1)(b)",
        "title": "Generic / Common Name of Commodity",
        "category": "Identification",
        "description": "The common or generic name of the packaged commodity must be prominently stated.",
        "severity": "CRITICAL",
        "enabled": True,
        "penalty": "Fine up to ₹25,000 / seizure of non-compliant batch"
    },
    {
        "id": "RULE_6_1_C",
        "clause": "Rule 6(1)(c)",
        "title": "Net Quantity in Standard Units",
        "category": "Measurement",
        "description": "Net quantity expressed in standard metric units (g, kg, ml, l, N) with mandatory space between number and unit symbol.",
        "severity": "CRITICAL",
        "enabled": True,
        "penalty": "Fine up to ₹50,000 for misdeclaration of net quantity"
    },
    {
        "id": "RULE_6_1_D",
        "clause": "Rule 6(1)(d)",
        "title": "Month & Year of Manufacture / Packing / Import",
        "category": "Dates",
        "description": "Month and year in which the commodity is manufactured, packed, or imported must be specified.",
        "severity": "MAJOR",
        "enabled": True,
        "penalty": "Fine up to ₹25,000"
    },
    {
        "id": "RULE_6_1_E",
        "clause": "Rule 6(1)(e)",
        "title": "Maximum Retail Price (MRP) Declaration",
        "category": "Pricing",
        "description": "MRP declared in Indian Rupees as 'MRP Rs XX.XX (incl. of all taxes)'. No extra charges allowed.",
        "severity": "CRITICAL",
        "enabled": True,
        "penalty": "Fine up to ₹1,00,000 / imprisonment up to 1 year for repeat offense"
    },
    {
        "id": "RULE_6_1_F",
        "clause": "Rule 6(1)(f)",
        "title": "Country of Origin (Imported Commodities)",
        "category": "Import",
        "description": "Country of origin must be declared on packages containing imported commodities.",
        "severity": "MAJOR",
        "enabled": True,
        "penalty": "Fine up to ₹25,000"
    },
    {
        "id": "RULE_6_2",
        "clause": "Rule 6(2)",
        "title": "Consumer Care Contact Details",
        "category": "Consumer Protection",
        "description": "Name, address, telephone number, and email ID of the person/office to be contacted in case of consumer complaints.",
        "severity": "MAJOR",
        "enabled": True,
        "penalty": "Fine up to ₹25,000"
    },
    {
        "id": "RULE_7",
        "clause": "Rule 7",
        "title": "Minimum Font Height & Area Ratio",
        "category": "Legibility",
        "description": "Declarations must satisfy minimum height requirements proportional to the Principal Display Panel (PDP) size.",
        "severity": "MINOR",
        "enabled": True,
        "penalty": "Notice for label rectification"
    }
]

# Rich pre-populated sample scan data for immediate testing out of the box
now = datetime.now()
DEFAULT_SCANS = [
    {
        "id": "CS-9F81A2C4",
        "timestamp": (now - timedelta(minutes=15)).isoformat(),
        "commodity_name": "Potato Chips (Crispy Salted)",
        "category": "Packaged Commodities",
        "image_url": "/static/samples/sample_1_chips_compliant.png",
        "filename": "sample_1_chips_compliant.png",
        "is_imported": False,
        "raw_text": "KRAKENS CRUNCH - CHIPS\nGeneric Name: Potato Chips (Crispy Salted)\nNet Quantity: 100 g\nMRP: Rs 30.00 (incl. of all taxes)\nDate of Mfg: 08/2026\nMfg & Pkd By: Krakens Foods Ltd, 12 Park St, Mumbai 400001\nCountry of Origin: India\nConsumer Care: Ph: 1800-123-4567, Email: care@krakens.com",
        "extracted_fields": {
            "generic_name": {"value": "Potato Chips (Crispy Salted)", "confidence": 0.98, "bbox": [240, 166, 480, 26]},
            "net_quantity": {"value": "100 g", "confidence": 0.96, "bbox": [240, 220, 180, 26]},
            "mrp": {"value": "Rs 30.00 (incl. of all taxes)", "confidence": 0.99, "bbox": [240, 274, 450, 26]},
            "mfg_date": {"value": "08/2026", "confidence": 0.95, "bbox": [240, 328, 200, 26]},
            "manufacturer_details": {"value": "Krakens Foods Ltd, 12 Park St, Mumbai 400001", "confidence": 0.94, "bbox": [240, 382, 500, 26]},
            "country_of_origin": {"value": "India", "confidence": 0.99, "bbox": [240, 436, 180, 26]},
            "customer_care": {"value": "Ph: 1800-123-4567, Email: care@krakens.com", "confidence": 0.97, "bbox": [240, 490, 480, 26]}
        },
        "compliant": True,
        "compliance_score": 100,
        "passed_rules_count": 8,
        "total_rules_count": 8,
        "violations": [],
        "rule_evaluations": [
            {"rule_id": "RULE_6_1_A", "passed": True, "details": "Manufacturer details properly declared."},
            {"rule_id": "RULE_6_1_B", "passed": True, "details": "Generic commodity name declared."},
            {"rule_id": "RULE_6_1_C", "passed": True, "details": "Net quantity in standard metric units with correct spacing."},
            {"rule_id": "RULE_6_1_D", "passed": True, "details": "Month and year of manufacture/packing declared."},
            {"rule_id": "RULE_6_1_E", "passed": True, "details": "MRP correctly declared inclusive of all taxes."},
            {"rule_id": "RULE_6_1_F", "passed": True, "details": "Domestic product - Country of origin verified."},
            {"rule_id": "RULE_6_2", "passed": True, "details": "Consumer care phone, email, and contact address verified."},
            {"rule_id": "RULE_7", "passed": True, "details": "Principal Display Panel font size meets statutory height specifications."}
        ]
    },
    {
        "id": "CS-3F7F76AA",
        "timestamp": (now - timedelta(hours=2)).isoformat(),
        "commodity_name": "Packaged Drinking Water",
        "category": "Beverages",
        "image_url": "/static/samples/sample_2_water_violation.png",
        "filename": "sample_2_water_violation.png",
        "is_imported": False,
        "raw_text": "AQUA PURE - MINERAL WATER\nGeneric Name: Packaged Drinking Water\nNet Quantity: 1000ml\nMRP: Rs 20.00\nDate of Pkg: 07/2026\nPacked By: Aqua Bottlers, Sector 5, NOIDA\nCountry of Origin: India\nConsumer Care: Call 9876543210",
        "extracted_fields": {
            "generic_name": {"value": "Packaged Drinking Water", "confidence": 0.97, "bbox": [240, 166, 480, 26]},
            "net_quantity": {"value": "1000ml", "confidence": 0.92, "bbox": [240, 220, 180, 26]},
            "mrp": {"value": "Rs 20.00", "confidence": 0.95, "bbox": [240, 274, 250, 26]},
            "mfg_date": {"value": "07/2026", "confidence": 0.94, "bbox": [240, 328, 200, 26]},
            "manufacturer_details": {"value": "Aqua Bottlers, Sector 5, NOIDA", "confidence": 0.91, "bbox": [240, 382, 450, 26]},
            "country_of_origin": {"value": "India", "confidence": 0.95, "bbox": [240, 436, 180, 26]},
            "customer_care": {"value": "Call 9876543210", "confidence": 0.70, "bbox": [240, 490, 300, 26]}
        },
        "compliant": False,
        "compliance_score": 62,
        "passed_rules_count": 5,
        "total_rules_count": 8,
        "violations": [
            {
                "rule_id": "RULE_6_1_C",
                "clause": "Rule 6(1)(c)",
                "title": "Net Quantity in Standard Units",
                "category": "Measurement",
                "severity": "CRITICAL",
                "statutory_description": "Net quantity expressed in standard metric units with mandatory space between numeral and unit symbol.",
                "violation_details": "Net Quantity '1000ml' violates formatting rules: mandatory single space required between numeral and unit (e.g. '1000 ml', not '1000ml').",
                "penalty_clause": "Fine up to ₹50,000 for misdeclaration of net quantity"
            },
            {
                "rule_id": "RULE_6_1_E",
                "clause": "Rule 6(1)(e)",
                "title": "Maximum Retail Price (MRP) Declaration",
                "category": "Pricing",
                "severity": "CRITICAL",
                "statutory_description": "MRP declared in Indian Rupees as 'MRP Rs XX.XX (incl. of all taxes)'.",
                "violation_details": "MRP 'Rs 20.00' is missing mandatory tax statement: '(incl. of all taxes)'.",
                "penalty_clause": "Fine up to ₹1,00,000 under Section 36 of Legal Metrology Act, 2009"
            },
            {
                "rule_id": "RULE_6_2",
                "clause": "Rule 6(2)",
                "title": "Consumer Care Contact Details",
                "category": "Consumer Protection",
                "severity": "MAJOR",
                "statutory_description": "Name, address, telephone number, and email ID of consumer care office.",
                "violation_details": "Customer care details 'Call 9876543210' incomplete: must contain designated person/office name, phone AND email/address.",
                "penalty_clause": "Fine up to ₹25,000"
            }
        ],
        "rule_evaluations": [
            {"rule_id": "RULE_6_1_A", "passed": True, "details": "Manufacturer details properly declared."},
            {"rule_id": "RULE_6_1_B", "passed": True, "details": "Generic commodity name declared."},
            {"rule_id": "RULE_6_1_C", "passed": False, "violation": {"rule_id": "RULE_6_1_C", "clause": "Rule 6(1)(c)", "title": "Net Quantity in Standard Units", "category": "Measurement", "severity": "CRITICAL", "statutory_description": "Net quantity expressed in standard metric units.", "violation_details": "Net Quantity '1000ml' violates formatting rules: mandatory single space required between numeral and unit.", "penalty_clause": "Fine up to ₹50,000"}},
            {"rule_id": "RULE_6_1_D", "passed": True, "details": "Month and year of manufacture/packing declared."},
            {"rule_id": "RULE_6_1_E", "passed": False, "violation": {"rule_id": "RULE_6_1_E", "clause": "Rule 6(1)(e)", "title": "Maximum Retail Price (MRP)", "category": "Pricing", "severity": "CRITICAL", "statutory_description": "MRP declared in Indian Rupees.", "violation_details": "MRP 'Rs 20.00' is missing mandatory tax statement: '(incl. of all taxes)'.", "penalty_clause": "Fine up to ₹1,00,000"}},
            {"rule_id": "RULE_6_1_F", "passed": True, "details": "Domestic product - Country of origin verified."},
            {"rule_id": "RULE_6_2", "passed": False, "violation": {"rule_id": "RULE_6_2", "clause": "Rule 6(2)", "title": "Consumer Care Contact Details", "category": "Consumer Protection", "severity": "MAJOR", "statutory_description": "Consumer care contact details.", "violation_details": "Customer care details incomplete: must contain designated person, telephone AND email/address.", "penalty_clause": "Fine up to ₹25,000"}},
            {"rule_id": "RULE_7", "passed": True, "details": "Principal Display Panel font size meets statutory height specifications."}
        ]
    },
    {
        "id": "CS-5B19B3B8",
        "timestamp": (now - timedelta(hours=5)).isoformat(),
        "commodity_name": "Nourishing Face Cream",
        "category": "Cosmetics",
        "image_url": "/static/samples/sample_3_cream_compliant.png",
        "filename": "sample_3_cream_compliant.png",
        "is_imported": False,
        "raw_text": "GLOW NATURALS - SKIN CREAM\nGeneric Name: Nourishing Face Cream\nNet Volume: 50 ml\nMRP: Rs 499.00 (incl. of all taxes)\nMfg Date: 06/2026\nManufactured By: Glow Labs Ltd, Plot 88, Baddi, HP 173205\nCountry of Origin: India\nCustomer Care: Tel: 011-23456789, Email: care@glow.in",
        "extracted_fields": {
            "generic_name": {"value": "Nourishing Face Cream", "confidence": 0.98, "bbox": [240, 166, 480, 26]},
            "net_quantity": {"value": "50 ml", "confidence": 0.97, "bbox": [240, 220, 180, 26]},
            "mrp": {"value": "Rs 499.00 (incl. of all taxes)", "confidence": 0.99, "bbox": [240, 274, 450, 26]},
            "mfg_date": {"value": "06/2026", "confidence": 0.96, "bbox": [240, 328, 200, 26]},
            "manufacturer_details": {"value": "Glow Labs Ltd, Plot 88, Baddi, HP 173205", "confidence": 0.95, "bbox": [240, 382, 500, 26]},
            "country_of_origin": {"value": "India", "confidence": 0.99, "bbox": [240, 436, 180, 26]},
            "customer_care": {"value": "Tel: 011-23456789, Email: care@glow.in", "confidence": 0.98, "bbox": [240, 490, 480, 26]}
        },
        "compliant": True,
        "compliance_score": 100,
        "passed_rules_count": 8,
        "total_rules_count": 8,
        "violations": [],
        "rule_evaluations": [
            {"rule_id": "RULE_6_1_A", "passed": True, "details": "Manufacturer details properly declared."},
            {"rule_id": "RULE_6_1_B", "passed": True, "details": "Generic commodity name declared."},
            {"rule_id": "RULE_6_1_C", "passed": True, "details": "Net quantity in standard metric units."},
            {"rule_id": "RULE_6_1_D", "passed": True, "details": "Month and year of manufacture declared."},
            {"rule_id": "RULE_6_1_E", "passed": True, "details": "MRP correctly declared inclusive of all taxes."},
            {"rule_id": "RULE_6_1_F", "passed": True, "details": "Domestic product - Country of origin verified."},
            {"rule_id": "RULE_6_2", "passed": True, "details": "Consumer care phone, email, and contact address verified."},
            {"rule_id": "RULE_7", "passed": True, "details": "PDP font size meets statutory height specifications."}
        ]
    }
]

class Database:
    def __init__(self):
        os.makedirs(DATA_DIR, exist_ok=True)
        self.rules = self._load_json(RULES_FILE, DEFAULT_RULES)
        self.scans = self._load_json(SCANS_FILE, DEFAULT_SCANS)
        
        # Ensure rules and scans files exist with default content
        if not os.path.exists(RULES_FILE):
            self._save_json(RULES_FILE, self.rules)
        if not os.path.exists(SCANS_FILE):
            self._save_json(SCANS_FILE, self.scans)

    def _load_json(self, path, default_data):
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading {path}: {e}")
        return default_data

    def _save_json(self, path, data):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def get_rules(self):
        return self.rules

    def update_rule(self, rule_id, updated_data):
        for i, r in enumerate(self.rules):
            if r["id"] == rule_id:
                self.rules[i].update(updated_data)
                self._save_json(RULES_FILE, self.rules)
                return self.rules[i]
        return None

    def add_scan(self, scan_data):
        scan_record = {
            "id": f"CS-{uuid.uuid4().hex[:8].upper()}",
            "timestamp": datetime.now().isoformat(),
            **scan_data
        }
        self.scans.insert(0, scan_record)
        self._save_json(SCANS_FILE, self.scans)
        return scan_record

    def get_scans(self):
        return self.scans

    def get_scan_by_id(self, scan_id):
        for s in self.scans:
            if s["id"] == scan_id:
                return s
        return None

    def get_analytics(self):
        total_scans = len(self.scans)
        passed_scans = sum(1 for s in self.scans if s.get("compliant"))
        failed_scans = total_scans - passed_scans
        pass_rate = round((passed_scans / total_scans * 100), 1) if total_scans > 0 else 100.0

        clause_violations = {}
        category_stats = {}

        for s in self.scans:
            cat = s.get("category", "General Commodity")
            if cat not in category_stats:
                category_stats[cat] = {"total": 0, "violations": 0}
            category_stats[cat]["total"] += 1

            for v in s.get("violations", []):
                clause = v.get("clause", "Unknown")
                clause_violations[clause] = clause_violations.get(clause, 0) + 1
                category_stats[cat]["violations"] += 1

        top_violations = [{"clause": k, "count": v} for k, v in sorted(clause_violations.items(), key=lambda x: x[1], reverse=True)]

        return {
            "total_scans": total_scans,
            "passed_scans": passed_scans,
            "failed_scans": failed_scans,
            "pass_rate": pass_rate,
            "top_violations": top_violations,
            "category_stats": category_stats
        }

db = Database()
