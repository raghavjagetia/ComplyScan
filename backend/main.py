import os
import uuid
import shutil
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from backend.database import db
from backend.ocr_engine import ocr_engine
from backend.rules_engine import rules_engine
from backend.pdf_generator import pdf_generator

app = FastAPI(
    title="ComplyScan API",
    description="Legal Metrology (Packaged Commodities) Rules 2011 Compliance Verification API",
    version="1.0.0"
)

# Enable CORS for localhost development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directories
UPLOADS_DIR = "backend/static/uploads"
REPORTS_DIR = "backend/static/reports"
SAMPLES_DIR = "backend/static/samples"

for d in [UPLOADS_DIR, REPORTS_DIR, SAMPLES_DIR]:
    os.makedirs(d, exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="backend/static"), name="static")

@app.get("/api/health")
def health_check():
    return {"status": "online", "app": "ComplyScan", "version": "1.0.0"}

@app.get("/api/samples")
def get_sample_labels():
    samples = [
        {
            "id": "sample-chips",
            "title": "Potato Chips Snack Bag",
            "category": "Snacks & Foods",
            "expected_verdict": "PASS",
            "description": "Compliant packaging with all mandatory LMPC declarations.",
            "image_url": "/static/samples/sample_1_chips_compliant.png",
            "filename": "sample_1_chips_compliant.png"
        },
        {
            "id": "sample-water",
            "title": "Packaged Mineral Water",
            "category": "Beverages",
            "expected_verdict": "FAIL",
            "description": "Violations: Missing tax clause in MRP, no unit spacing, incomplete customer care.",
            "image_url": "/static/samples/sample_2_water_violation.png",
            "filename": "sample_2_water_violation.png"
        },
        {
            "id": "sample-cream",
            "title": "Nourishing Face Cream",
            "category": "Cosmetics",
            "expected_verdict": "PASS",
            "description": "Compliant cosmetic product label with full manufacturer & PDP declarations.",
            "image_url": "/static/samples/sample_3_cream_compliant.png",
            "filename": "sample_3_cream_compliant.png"
        },
        {
            "id": "sample-chocolate",
            "title": "Imported Chocolate Bar",
            "category": "Confectionery",
            "expected_verdict": "FAIL",
            "description": "Violations: Missing Country of Origin declaration & incomplete helpline.",
            "image_url": "/static/samples/sample_4_chocolate_imported_violation.png",
            "filename": "sample_4_chocolate_imported_violation.png"
        },
        {
            "id": "sample-rice",
            "title": "Basmati Rice 5kg Bag",
            "category": "Food Grains",
            "expected_verdict": "PASS",
            "description": "Compliant bulk food grain packaging.",
            "image_url": "/static/samples/sample_5_rice_compliant.png",
            "filename": "sample_5_rice_compliant.png"
        },
        {
            "id": "sample-honey",
            "title": "Organic Wild Honey",
            "category": "Natural Foods",
            "expected_verdict": "FAIL",
            "description": "Violations: Generic commodity name missing & packing date omitted.",
            "image_url": "/static/samples/sample_6_honey_violation.png",
            "filename": "sample_6_honey_violation.png"
        }
    ]
    return samples

@app.post("/api/scan")
async def scan_label(
    file: Optional[UploadFile] = File(None),
    sample_filename: Optional[str] = Form(None),
    is_imported: bool = Form(False),
    category: str = Form("Packaged Commodities")
):
    image_path = ""
    image_url = ""
    orig_filename = ""

    if sample_filename:
        image_path = os.path.join(SAMPLES_DIR, sample_filename)
        if not os.path.exists(image_path):
            raise HTTPException(status_code=400, detail="Sample image not found")
        image_url = f"/static/samples/{sample_filename}"
        orig_filename = sample_filename
    elif file:
        file_ext = os.path.splitext(file.filename)[1] or ".png"
        unique_name = f"{uuid.uuid4().hex[:10]}{file_ext}"
        image_path = os.path.join(UPLOADS_DIR, unique_name)
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        image_url = f"/static/uploads/{unique_name}"
        orig_filename = file.filename
    else:
        raise HTTPException(status_code=400, detail="Either file or sample_filename is required")

    # 1. OCR Extraction
    ocr_result = ocr_engine.extract_from_image(image_path, orig_filename)

    # 2. Rules Engine Evaluation
    verdict_result = rules_engine.evaluate(ocr_result["extracted_fields"], is_imported=is_imported)

    # Commodity Name extraction
    commodity_name = ocr_result["extracted_fields"].get("generic_name", {}).get("value") or orig_filename.replace(".png", "").replace(".jpg", "").replace("_", " ").title()

    scan_payload = {
        "commodity_name": commodity_name,
        "category": category,
        "image_url": image_url,
        "filename": orig_filename,
        "is_imported": is_imported,
        "raw_text": ocr_result["raw_text"],
        "extracted_fields": ocr_result["extracted_fields"],
        "compliant": verdict_result["compliant"],
        "compliance_score": verdict_result["compliance_score"],
        "passed_rules_count": verdict_result["passed_rules_count"],
        "total_rules_count": verdict_result["total_rules_count"],
        "violations": verdict_result["violations"],
        "rule_evaluations": verdict_result["rule_evaluations"]
    }

    # Store in Database
    scan_record = db.add_scan(scan_payload)
    return scan_record

class ManualOverridePayload(BaseModel):
    scan_id: str
    updated_fields: Dict[str, Any]
    is_imported: bool = False

@app.post("/api/manual-override")
def manual_override(payload: ManualOverridePayload):
    scan_record = db.get_scan_by_id(payload.scan_id)
    if not scan_record:
        raise HTTPException(status_code=404, detail="Scan record not found")

    # Merge updated fields
    extracted = scan_record["extracted_fields"]
    for k, v in payload.updated_fields.items():
        if k in extracted:
            extracted[k]["value"] = v
            extracted[k]["confidence"] = 1.0 # 100% manually verified
        else:
            extracted[k] = {"value": v, "confidence": 1.0, "bbox": [100, 100, 200, 30]}

    # Re-evaluate Rules Engine
    verdict_result = rules_engine.evaluate(extracted, is_imported=payload.is_imported)

    # Update record
    scan_record["extracted_fields"] = extracted
    scan_record["compliant"] = verdict_result["compliant"]
    scan_record["compliance_score"] = verdict_result["compliance_score"]
    scan_record["passed_rules_count"] = verdict_result["passed_rules_count"]
    scan_record["violations"] = verdict_result["violations"]
    scan_record["rule_evaluations"] = verdict_result["rule_evaluations"]
    scan_record["manually_reviewed"] = True

    # Save to disk
    db._save_json("data/scans.json", db.get_scans())
    return scan_record

@app.get("/api/rules")
def get_rules():
    return db.get_rules()

class RuleUpdatePayload(BaseModel):
    enabled: Optional[bool] = None
    penalty: Optional[str] = None
    severity: Optional[str] = None

@app.put("/api/rules/{rule_id}")
def update_rule(rule_id: str, payload: RuleUpdatePayload):
    updated = db.update_rule(rule_id, payload.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Rule not found")
    return updated

@app.get("/api/scans")
def get_scans():
    return db.get_scans()

@app.get("/api/scans/{scan_id}")
def get_scan(scan_id: str):
    record = db.get_scan_by_id(scan_id)
    if not record:
        raise HTTPException(status_code=404, detail="Scan not found")
    return record

@app.get("/api/scans/{scan_id}/pdf")
def generate_pdf_report(scan_id: str):
    record = db.get_scan_by_id(scan_id)
    if not record:
        raise HTTPException(status_code=404, detail="Scan not found")

    pdf_filename = f"Inspection_Report_{scan_id}.pdf"
    pdf_path = os.path.join(REPORTS_DIR, pdf_filename)
    
    pdf_generator.generate_report(record, pdf_path)
    return FileResponse(pdf_path, media_type="application/pdf", filename=pdf_filename)

@app.get("/api/analytics")
def get_analytics():
    return db.get_analytics()

# Serve React Frontend Build if present
FRONTEND_DIST = "frontend/dist"
if os.path.exists(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")
