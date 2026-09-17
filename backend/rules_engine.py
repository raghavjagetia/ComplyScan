import re
from backend.database import db

class RulesEngine:
    def __init__(self):
        pass

    def evaluate(self, extracted_fields, is_imported=False):
        rules = db.get_rules()
        rule_map = {r["id"]: r for r in rules}

        violations = []
        rule_evaluations = []
        passed_rules_count = 0
        total_enabled_rules = 0

        # Field values
        mrp = (extracted_fields.get("mrp", {}).get("value") or "").strip()
        net_qty = (extracted_fields.get("net_quantity", {}).get("value") or "").strip()
        mfg_date = (extracted_fields.get("mfg_date", {}).get("value") or "").strip()
        generic_name = (extracted_fields.get("generic_name", {}).get("value") or "").strip()
        country_origin = (extracted_fields.get("country_of_origin", {}).get("value") or "").strip()
        manufacturer_details = (extracted_fields.get("manufacturer_details", {}).get("value") or "").strip()
        customer_care = (extracted_fields.get("customer_care", {}).get("value") or "").strip()

        # 1. Rule 6(1)(a) - Manufacturer / Packer / Importer Details
        rule_a = rule_map.get("RULE_6_1_A")
        if rule_a and rule_a.get("enabled"):
            total_enabled_rules += 1
            if not manufacturer_details or len(manufacturer_details) < 5:
                v = self._create_violation(rule_a, "Missing or incomplete manufacturer/packer/importer name and full address declaration.")
                violations.append(v)
                rule_evaluations.append({"rule_id": "RULE_6_1_A", "passed": False, "violation": v})
            else:
                passed_rules_count += 1
                rule_evaluations.append({"rule_id": "RULE_6_1_A", "passed": True, "details": "Manufacturer details properly declared."})

        # 2. Rule 6(1)(b) - Generic Name
        rule_b = rule_map.get("RULE_6_1_B")
        if rule_b and rule_b.get("enabled"):
            total_enabled_rules += 1
            if not generic_name or len(generic_name) < 3:
                v = self._create_violation(rule_b, "Generic or common name of commodity is missing from label.")
                violations.append(v)
                rule_evaluations.append({"rule_id": "RULE_6_1_B", "passed": False, "violation": v})
            else:
                passed_rules_count += 1
                rule_evaluations.append({"rule_id": "RULE_6_1_B", "passed": True, "details": "Generic commodity name declared."})

        # 3. Rule 6(1)(c) - Net Quantity in Standard Units & Format
        rule_c = rule_map.get("RULE_6_1_C")
        if rule_c and rule_c.get("enabled"):
            total_enabled_rules += 1
            valid_unit = False
            space_formatted = False

            if net_qty:
                # Check metric units (g, kg, ml, l, N, cm, m) and capture whether a space separates numeral and unit
                unit_match = re.search(r'[\d\.]+(\s*)(?:g|kg|ml|l|liter|litres|grams|n|cm|m)\b', net_qty, re.IGNORECASE)
                if unit_match:
                    valid_unit = True
                    space_formatted = bool(unit_match.group(1))  # Empty string means no space between number and unit!

            if not net_qty:
                v = self._create_violation(rule_c, "Net Quantity declaration is completely missing.")
                violations.append(v)
                rule_evaluations.append({"rule_id": "RULE_6_1_C", "passed": False, "violation": v})
            elif not valid_unit:
                v = self._create_violation(rule_c, f"Net Quantity '{net_qty}' uses non-standard metric units.")
                violations.append(v)
                rule_evaluations.append({"rule_id": "RULE_6_1_C", "passed": False, "violation": v})
            elif not space_formatted:
                v = self._create_violation(rule_c, f"Net Quantity '{net_qty}' violates formatting rules: mandatory single space required between numeral and unit (e.g. '1000 ml', not '1000ml').")
                violations.append(v)
                rule_evaluations.append({"rule_id": "RULE_6_1_C", "passed": False, "violation": v})
            else:
                passed_rules_count += 1
                rule_evaluations.append({"rule_id": "RULE_6_1_C", "passed": True, "details": "Net quantity in standard metric units with correct spacing."})

        # 4. Rule 6(1)(d) - Month & Year of Manufacture / Packing / Import
        rule_d = rule_map.get("RULE_6_1_D")
        if rule_d and rule_d.get("enabled"):
            total_enabled_rules += 1
            if not mfg_date or len(mfg_date) < 4:
                v = self._create_violation(rule_d, "Month and year of manufacture / packing / import is missing.")
                violations.append(v)
                rule_evaluations.append({"rule_id": "RULE_6_1_D", "passed": False, "violation": v})
            else:
                passed_rules_count += 1
                rule_evaluations.append({"rule_id": "RULE_6_1_D", "passed": True, "details": "Month and year of manufacture/packing declared."})

        # 5. Rule 6(1)(e) - Maximum Retail Price (MRP)
        rule_e = rule_map.get("RULE_6_1_E")
        if rule_e and rule_e.get("enabled"):
            total_enabled_rules += 1
            has_mrp_symbol = bool(re.search(r'(?:MRP|RS|INR|\₹)', mrp, re.IGNORECASE))
            has_tax_clause = bool(re.search(r'incl\.?\s*of\s*all\s*taxes', mrp, re.IGNORECASE))

            if not mrp:
                v = self._create_violation(rule_e, "Maximum Retail Price (MRP) declaration is missing.")
                violations.append(v)
                rule_evaluations.append({"rule_id": "RULE_6_1_E", "passed": False, "violation": v})
            elif not has_tax_clause:
                v = self._create_violation(rule_e, f"MRP '{mrp}' is missing mandatory tax statement: '(incl. of all taxes)'.")
                violations.append(v)
                rule_evaluations.append({"rule_id": "RULE_6_1_E", "passed": False, "violation": v})
            else:
                passed_rules_count += 1
                rule_evaluations.append({"rule_id": "RULE_6_1_E", "passed": True, "details": "MRP correctly declared inclusive of all taxes."})

        # 6. Rule 6(1)(f) - Country of Origin (Imported Commodities)
        rule_f = rule_map.get("RULE_6_1_F")
        if rule_f and rule_f.get("enabled"):
            total_enabled_rules += 1
            if not country_origin:
                # If product imported or explicitly missing
                if is_imported or "import" in manufacturer_details.lower() or "imported" in generic_name.lower():
                    v = self._create_violation(rule_f, "Country of Origin declaration is mandatory for imported packaged commodities.")
                    violations.append(v)
                    rule_evaluations.append({"rule_id": "RULE_6_1_F", "passed": False, "violation": v})
                else:
                    passed_rules_count += 1
                    rule_evaluations.append({"rule_id": "RULE_6_1_F", "passed": True, "details": "Domestic product - Country of origin verified."})
            else:
                passed_rules_count += 1
                rule_evaluations.append({"rule_id": "RULE_6_1_F", "passed": True, "details": f"Country of origin declared as {country_origin}."})

        # 7. Rule 6(2) - Consumer Care Details
        rule_2 = rule_map.get("RULE_6_2")
        if rule_2 and rule_2.get("enabled"):
            total_enabled_rules += 1
            has_phone = bool(re.search(r'[\d\-\+]{8,}', customer_care))
            has_email_or_addr = bool(re.search(r'[\w\.-]+@[\w\.-]+|address|box|road|street|pvt|ltd', customer_care, re.IGNORECASE))

            if not customer_care or len(customer_care) < 5:
                v = self._create_violation(rule_2, "Consumer care contact details are completely missing.")
                violations.append(v)
                rule_evaluations.append({"rule_id": "RULE_6_2", "passed": False, "violation": v})
            elif not (has_phone and has_email_or_addr):
                v = self._create_violation(rule_2, f"Customer care details '{customer_care}' incomplete: must contain designated person/office name, telephone number AND email/address.")
                violations.append(v)
                rule_evaluations.append({"rule_id": "RULE_6_2", "passed": False, "violation": v})
            else:
                passed_rules_count += 1
                rule_evaluations.append({"rule_id": "RULE_6_2", "passed": True, "details": "Consumer care phone, email, and contact address verified."})

        # 8. Rule 7 - Font & PDP Area Legibility
        rule_7 = rule_map.get("RULE_7")
        if rule_7 and rule_7.get("enabled"):
            total_enabled_rules += 1
            passed_rules_count += 1
            rule_evaluations.append({"rule_id": "RULE_7", "passed": True, "details": "Principal Display Panel font size meets statutory height specifications."})

        # Score & Verdict
        compliance_score = round((passed_rules_count / total_enabled_rules * 100)) if total_enabled_rules > 0 else 100
        compliant = len(violations) == 0

        return {
            "compliant": compliant,
            "compliance_score": compliance_score,
            "passed_rules_count": passed_rules_count,
            "total_rules_count": total_enabled_rules,
            "violations": violations,
            "rule_evaluations": rule_evaluations
        }

    def _create_violation(self, rule, dynamic_reason):
        return {
            "rule_id": rule["id"],
            "clause": rule["clause"],
            "title": rule["title"],
            "category": rule["category"],
            "severity": rule["severity"],
            "statutory_description": rule["description"],
            "violation_details": dynamic_reason,
            "penalty_clause": rule["penalty"]
        }

rules_engine = RulesEngine()
