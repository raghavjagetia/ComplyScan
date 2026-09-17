import os
from PIL import Image, ImageDraw

def generate_sample_images():
    output_dir = "backend/static/samples"
    os.makedirs(output_dir, exist_ok=True)

    samples = [
        {
            "filename": "sample_1_chips_compliant.png",
            "title": "KRAKENS CRUNCH - CHIPS",
            "bg_color": "#1E1E2E",
            "banner_color": "#FF5722",
            "text_color": "#FFFFFF",
            "declarations": [
                ("Generic Name:", "Potato Chips (Crispy Salted)"),
                ("Net Quantity:", "100 g"),
                ("MRP:", "Rs 30.00 (incl. of all taxes)"),
                ("Date of Mfg:", "08/2026"),
                ("Mfg & Pkd By:", "Krakens Foods Ltd, 12 Park St, Mumbai 400001"),
                ("Country of Origin:", "India"),
                ("Consumer Care:", "Ph: 1800-123-4567, Email: care@krakens.com")
            ],
            "compliant": True
        },
        {
            "filename": "sample_2_water_violation.png",
            "title": "AQUA PURE - MINERAL WATER",
            "bg_color": "#0F172A",
            "banner_color": "#0284C7",
            "text_color": "#F8FAFC",
            "declarations": [
                ("Generic Name:", "Packaged Drinking Water"),
                ("Net Quantity:", "1000ml"),  # VIOLATION: no unit spacing
                ("MRP:", "Rs 20.00"),  # VIOLATION: missing '(incl. of all taxes)'
                ("Date of Pkg:", "07/2026"),
                ("Packed By:", "Aqua Bottlers, Sector 5, NOIDA"),
                ("Country of Origin:", "India"),
                ("Consumer Care:", "Call 9876543210")  # VIOLATION: missing email & address
            ],
            "compliant": False
        },
        {
            "filename": "sample_3_cream_compliant.png",
            "title": "GLOW NATURALS - SKIN CREAM",
            "bg_color": "#FDF4FF",
            "banner_color": "#DB2777",
            "text_color": "#1F2937",
            "declarations": [
                ("Generic Name:", "Nourishing Face Cream"),
                ("Net Volume:", "50 ml"),
                ("MRP:", "Rs 499.00 (incl. of all taxes)"),
                ("Mfg Date:", "06/2026"),
                ("Manufactured By:", "Glow Labs Ltd, Plot 88, Baddi, HP 173205"),
                ("Country of Origin:", "India"),
                ("Customer Care:", "Tel: 011-23456789, Email: care@glow.in")
            ],
            "compliant": True
        },
        {
            "filename": "sample_4_chocolate_imported_violation.png",
            "title": "CHOC-DELIGHT IMPORTED BAR",
            "bg_color": "#2D1500",
            "banner_color": "#D97706",
            "text_color": "#FFFBEB",
            "declarations": [
                ("Generic Name:", "Milk Chocolate Bar"),
                ("Net Weight:", "150 g"),
                ("MRP:", "Rs 250 (incl. of all taxes)"),
                ("Month & Year of Import:", "05/2026"),
                ("Imported By:", "Global Traders, Fort, Mumbai"),
                ("Country of Origin:", "[NOT DECLARED]"),  # VIOLATION: missing origin
                ("Customer Care:", "Email: info@globaltraders.com")  # VIOLATION: missing phone
            ],
            "compliant": False
        },
        {
            "filename": "sample_5_rice_compliant.png",
            "title": "ROYAL HERITAGE BASMATI RICE",
            "bg_color": "#FEFCE8",
            "banner_color": "#CA8A04",
            "text_color": "#1C1917",
            "declarations": [
                ("Generic Name:", "Basmati Rice (Extra Long Grain)"),
                ("Net Weight:", "5 kg"),
                ("MRP:", "Rs 750.00 (incl. of all taxes)"),
                ("Packed Month & Year:", "09/2026"),
                ("Packed By:", "Royal Agro Mills, G.T. Road, Karnal 132001"),
                ("Country of Origin:", "India"),
                ("Consumer Helpline:", "Ph: 1800-888-9999, Email: care@royalagro.com")
            ],
            "compliant": True
        },
        {
            "filename": "sample_6_honey_violation.png",
            "title": "ORGANIC WILD HONEY",
            "bg_color": "#FFF7ED",
            "banner_color": "#EA580C",
            "text_color": "#431407",
            "declarations": [
                ("Generic Name:", "[NOT DECLARED]"),  # VIOLATION: generic name missing
                ("Net Quantity:", "500 g"),
                ("MRP:", "Rs 350.00 (incl. of all taxes)"),
                ("Date of Pkg:", "[NOT DECLARED]"),  # VIOLATION: date missing
                ("Packed By:", "Wild Farms Co, Coorg, Karnataka"),
                ("Country of Origin:", "India"),
                ("Customer Care:", "Ph: 9900112233, Email: help@wildfarms.org")
            ],
            "compliant": False
        }
    ]

    for item in samples:
        img = Image.new("RGB", (800, 600), color=item["bg_color"])
        draw = ImageDraw.Draw(img)

        # Header Banner
        draw.rectangle([0, 0, 800, 90], fill=item["banner_color"])
        draw.text((40, 25), item["title"], fill="#FFFFFF", font_size=28)

        # Decorative Label Frame (x=30 to x=770)
        draw.rectangle([30, 110, 770, 570], outline=item["banner_color"], width=3)
        draw.text((50, 125), "LEGAL METROLOGY DECLARATIONS (LMPC RULES 2011)", fill=item["banner_color"], font_size=16)
        draw.line([50, 150, 750, 150], fill=item["banner_color"], width=2)

        y = 170
        for label, val in item["declarations"]:
            draw.text((50, y), label, fill=item["banner_color"], font_size=17)
            draw.text((245, y), val, fill=item["text_color"], font_size=17)
            y += 54

        img_path = os.path.join(output_dir, item["filename"])
        img.save(img_path)
        print(f"Generated sample label: {img_path}")

if __name__ == "__main__":
    generate_sample_images()
