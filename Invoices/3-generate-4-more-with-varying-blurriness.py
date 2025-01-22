from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import Color

# Helper function to add text with optional blur simulation (lighter color)
def add_text_with_style(c, text, x, y, font="Helvetica", size=12, blur=False):
    c.setFont(font, size)
    if blur:
        c.setFillColor(Color(0.6, 0.6, 0.6))  # Light gray for "blurry" effect
    else:
        c.setFillColor(Color(0, 0, 0))  # Black for normal text
    c.drawString(x, y, text)

# Function to create invoice with ReportLab
def create_reportlab_invoice(filename, style, blur_fields=None):
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter

    # Company Info
    add_text_with_style(c, style['company_name'], 50, height - 50, size=16, blur="company_name" in blur_fields)
    add_text_with_style(c, style['company_address'], 50, height - 70, blur="company_address" in blur_fields)
    add_text_with_style(c, f"Contact: {style['company_phone']}", 50, height - 90, blur="company_phone" in blur_fields)
    add_text_with_style(c, f"Email: {style['company_email']}", 50, height - 110, blur="company_email" in blur_fields)

    # Invoice Header
    add_text_with_style(c, f"Invoice #: {random.randint(1000, 9999)}", 50, height - 150, size=12, blur="invoice_number" in blur_fields)
    add_text_with_style(c, f"Date: {style['date']}", 50, height - 170, size=12, blur="date" in blur_fields)

    # Customer Info
    add_text_with_style(c, "Bill To:", 50, height - 210, size=12)
    add_text_with_style(c, style['customer_name'], 50, height - 230, blur="customer_name" in blur_fields)
    add_text_with_style(c, style['customer_address'], 50, height - 250, blur="customer_address" in blur_fields)

    # Itemized list header
    y = height - 290
    headers = ["Description", "Quantity", "Unit Price", "Total"]
    positions = [50, 300, 400, 500]
    for i, header in enumerate(headers):
        add_text_with_style(c, header, positions[i], y, size=10, blur=False)
    
    # Itemized list content
    y -= 20
    total_amount = 0
    for item in style['items']:
        add_text_with_style(c, item['description'], 50, y, blur="items" in blur_fields)
        add_text_with_style(c, str(item['quantity']), 300, y, blur="items" in blur_fields)
        add_text_with_style(c, f"${item['unit_price']:.2f}", 400, y, blur="items" in blur_fields)
        total = item['quantity'] * item['unit_price']
        total_amount += total
        add_text_with_style(c, f"${total:.2f}", 500, y, blur="items" in blur_fields)
        y -= 20

    # Total Amount
    add_text_with_style(c, f"Grand Total: ${total_amount:.2f}", 400, y - 20, size=12, blur="total" in blur_fields)

    # Footer
    add_text_with_style(c, "Thank you for your business!", 50, 50, size=10, blur=False)
    
    c.save()


# Variations for different invoices
styles = [
    {
        "company_name": "QuickBuild Hardware Co.",
        "company_address": "789 Rapid Lane, Construction City, CC 12345",
        "company_phone": "321-654-0987",
        "company_email": "info@quickbuild.com",
        "date": "2024-12-13",
        "customer_name": "Mega Projects Ltd.",
        "customer_address": "101 Main St, Build Town, BT 54321",
        "items": [
            {"description": "Sand (50kg bags)", "quantity": 100, "unit_price": 8.0},
            {"description": "Concrete Mix", "quantity": 40, "unit_price": 25.5},
            {"description": "PVC Pipes", "quantity": 60, "unit_price": 15.0},
        ],
    },
    {
        "company_name": "ProConstruct Materials",
        "company_address": "222 Bridge Ave, Engineering City, EC 77777",
        "company_phone": "987-123-4567",
        "company_email": "sales@proconstruct.com",
        "date": "2024-12-12",
        "customer_name": "Urban Developers Co.",
        "customer_address": "56 Elm Street, Cityscape, SC 89012",
        "items": [
            {"description": "Rebar Steel", "quantity": 50, "unit_price": 85.0},
            {"description": "Wooden Planks", "quantity": 30, "unit_price": 12.0},
            {"description": "Floor Tiles", "quantity": 20, "unit_price": 45.0},
        ],
    },
    {
        "company_name": "Builders Warehouse",
        "company_address": "145 Industrial Road, Fabrication City, FC 55555",
        "company_phone": "555-555-5555",
        "company_email": "warehouse@builders.com",
        "date": "2024-12-10",
        "customer_name": "Greenfield Constructions",
        "customer_address": "89 Pine Drive, Suburbia, SB 23456",
        "items": [
            {"description": "Glass Panels", "quantity": 20, "unit_price": 110.0},
            {"description": "Aluminum Sheets", "quantity": 15, "unit_price": 95.5},
            {"description": "Nails (box)", "quantity": 100, "unit_price": 3.0},
        ],
    },
    {
        "company_name": "Allied Construction Goods",
        "company_address": "673 Builders Lane, Structural City, ST 98765",
        "company_phone": "444-444-4444",
        "company_email": "contact@alliedgoods.com",
        "date": "2024-12-11",
        "customer_name": "Skyline Construction Ltd.",
        "customer_address": "789 Horizon Road, Uptown, UT 67890",
        "items": [
            {"description": "Scaffolding Poles", "quantity": 50, "unit_price": 60.0},
            {"description": "Gravel (ton)", "quantity": 20, "unit_price": 30.0},
            {"description": "Paint Buckets", "quantity": 25, "unit_price": 22.0},
        ],
    }
]

# Output directory
output_dir = "/mnt/data/fake_invoices"

# Generating the invoices
for i, style in enumerate(styles):
    filename = os.path.join(output_dir, f"fake_invoice_blurry_{i+2}.pdf")
    blur_fields = random.choice([["company_name", "customer_name"], ["items", "total"], ["date"], []])  # Randomly blur some fields
    create_reportlab_invoice(filename, style, blur_fields)

os.listdir(output_dir)

