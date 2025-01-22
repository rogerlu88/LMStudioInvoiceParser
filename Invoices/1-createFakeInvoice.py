from fpdf import FPDF
import random
import os

# Function to create a fake invoice PDF
def create_fake_invoice(filename, style):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    # Header: Company Information
    pdf.set_font("Arial", style='B', size=16)
    pdf.cell(0, 10, f"{style['company_name']}", ln=True, align='C')
    pdf.set_font("Arial", size=10)
    pdf.cell(0, 5, f"{style['company_address']}", ln=True, align='C')
    pdf.cell(0, 5, f"Contact: {style['company_phone']} | Email: {style['company_email']}", ln=True, align='C')
    pdf.ln(10)

    # Invoice Info
    pdf.set_font("Arial", size=12)
    pdf.cell(0, 10, f"Invoice Number: {random.randint(1000, 9999)}", ln=True)
    pdf.cell(0, 10, f"Date: {style['date']}", ln=True)
    pdf.ln(10)

    # Customer Info
    pdf.set_font("Arial", style='B', size=12)
    pdf.cell(0, 10, "Bill To:", ln=True)
    pdf.set_font("Arial", size=12)
    pdf.cell(0, 10, f"{style['customer_name']}", ln=True)
    pdf.cell(0, 10, f"{style['customer_address']}", ln=True)
    pdf.ln(10)

    # Itemized list
    pdf.set_font("Arial", style='B', size=12)
    pdf.cell(90, 10, "Description", border=1)
    pdf.cell(30, 10, "Quantity", border=1, align='C')
    pdf.cell(30, 10, "Unit Price", border=1, align='C')
    pdf.cell(30, 10, "Total", border=1, ln=True, align='C')
    pdf.set_font("Arial", size=12)
    
    total_amount = 0
    for item in style['items']:
        pdf.cell(90, 10, item['description'], border=1)
        pdf.cell(30, 10, str(item['quantity']), border=1, align='C')
        pdf.cell(30, 10, f"${item['unit_price']:.2f}", border=1, align='C')
        total = item['quantity'] * item['unit_price']
        total_amount += total
        pdf.cell(30, 10, f"${total:.2f}", border=1, ln=True, align='C')
    
    # Footer: Total Amount
    pdf.ln(5)
    pdf.set_font("Arial", style='B', size=12)
    pdf.cell(0, 10, f"Grand Total: ${total_amount:.2f}", ln=True, align='R')
    pdf.ln(10)

    # Payment Info
    pdf.set_font("Arial", size=10)
    pdf.multi_cell(0, 5, f"Payment due within 15 days.\nThank you for your business!")
    
    pdf.output(filename)


# Generating 6-7 sample invoices
output_dir = "/mnt/data/fake_invoices"
os.makedirs(output_dir, exist_ok=True)

sample_data = [
    {
        "company_name": "ABC Construction Supplies",
        "company_address": "123 Builder Lane, Construct City, CT 56789",
        "company_phone": "123-456-7890",
        "company_email": "contact@abcconstruct.com",
        "date": "2024-12-13",
        "customer_name": "XYZ Construction Co.",
        "customer_address": "456 Project Way, Development Town, DT 67890",
        "items": [
            {"description": "Cement Bags", "quantity": 50, "unit_price": 12.5},
            {"description": "Steel Rods", "quantity": 30, "unit_price": 45.0},
            {"description": "Bricks (1000 pcs)", "quantity": 10, "unit_price": 250.0},
        ],
    },
    # More data variations to follow...
]

# Generate all PDFs with varied styles
for i, style in enumerate(sample_data):
    filename = os.path.join(output_dir, f"fake_invoice_{i+1}.pdf")
    create_fake_invoice(filename, style)

output_dir

