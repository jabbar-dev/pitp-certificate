from flask import Flask, request, jsonify, send_file
import os
import json
import qrcode
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.units import inch, mm
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from io import BytesIO
import zipfile
from datetime import datetime

app = Flask(__name__)

# Configuration
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'output')
os.makedirs(OUTPUT_DIR, exist_ok=True)

def generate_qr_code(data):
    """Generate QR code image from data"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=2,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    return img

def draw_ruled_lines(c, start_y, end_y, line_spacing=7*mm):
    """Draw horizontal ruled lines on the page"""
    c.setStrokeColor(colors.lightgrey)
    c.setLineWidth(0.5)
    
    y = start_y
    while y > end_y:
        c.line(25*mm, y, 185*mm, y)
        y -= line_spacing

def create_answer_sheet_pdf(booklet_data, output_path):
    """Generate answer sheet PDF for a single student"""
    student = booklet_data['student']
    exam = booklet_data['exam']
    pages = booklet_data['pages']
    num_answer_pages = booklet_data['numAnswerPages']
    
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4
    
    # Page 1: Front Cover Page
    # Header
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(width/2, height - 40*mm, "EXAMINATION ANSWER BOOKLET")
    
    c.setFont("Helvetica", 10)
    c.drawCentredString(width/2, height - 50*mm, f"{exam['title']}")
    
    # Exam details box
    y_pos = height - 70*mm
    c.setFont("Helvetica-Bold", 10)
    c.drawString(30*mm, y_pos, "Subject:")
    c.setFont("Helvetica", 10)
    c.drawString(70*mm, y_pos, f"{exam['subject']} ({exam['subjectCode']})")
    
    y_pos -= 8*mm
    c.setFont("Helvetica-Bold", 10)
    c.drawString(30*mm, y_pos, "Exam Code:")
    c.setFont("Helvetica", 10)
    c.drawString(70*mm, y_pos, exam['code'])
    
    if exam.get('teacher'):
        y_pos -= 8*mm
        c.setFont("Helvetica-Bold", 10)
        c.drawString(30*mm, y_pos, "Examiner:")
        c.setFont("Helvetica", 10)
        c.drawString(70*mm, y_pos, exam['teacher'])
    
    if exam.get('duration'):
        y_pos -= 8*mm
        c.setFont("Helvetica-Bold", 10)
        c.drawString(30*mm, y_pos, "Duration:")
        c.setFont("Helvetica", 10)
        c.drawString(70*mm, y_pos, f"{exam['duration']} minutes")
    
    # Student details box
    y_pos -= 15*mm
    c.setFont("Helvetica-Bold", 11)
    c.drawString(30*mm, y_pos, "STUDENT INFORMATION")
    
    y_pos -= 10*mm
    c.setFont("Helvetica-Bold", 10)
    c.drawString(30*mm, y_pos, "Student ID:")
    c.setFont("Helvetica", 11)
    c.drawString(70*mm, y_pos, student['studentId'])
    
    y_pos -= 8*mm
    c.setFont("Helvetica-Bold", 10)
    c.drawString(30*mm, y_pos, "Student Name:")
    c.setFont("Helvetica", 11)
    c.drawString(70*mm, y_pos, student['fullName'])
    
    # QR Code for front page
    if len(pages) > 0:
        qr_data = pages[0]['qrCodeData']
        qr_img = generate_qr_code(qr_data)
        qr_buffer = BytesIO()
        qr_img.save(qr_buffer, format='PNG')
        qr_buffer.seek(0)
        
        # Save QR to temp file and draw
        qr_temp_path = os.path.join(OUTPUT_DIR, f'qr_temp_{student["studentId"]}_p1.png')
        with open(qr_temp_path, 'wb') as f:
            f.write(qr_buffer.getvalue())
        
        c.drawImage(qr_temp_path, width - 50*mm, height - 50*mm, 40*mm, 40*mm)
        os.remove(qr_temp_path)
    
    # Instructions
    y_pos -= 15*mm
    c.setFont("Helvetica-Bold", 10)
    c.drawString(30*mm, y_pos, "INSTRUCTIONS:")
    c.setFont("Helvetica", 9)
    y_pos -= 6*mm
    instructions = [
        "• Write your answers clearly and legibly",
        "• Do not remove the staples from this booklet",
        "• Use only black or blue ink",
        "• Cross out any work you do not want to be marked"
    ]
    for instr in instructions:
        c.drawString(32*mm, y_pos, instr)
        y_pos -= 5*mm
    
    # Signature boxes
    y_pos = 40*mm
    c.rect(30*mm, y_pos, 70*mm, 20*mm)
    c.setFont("Helvetica", 9)
    c.drawString(32*mm, y_pos + 16*mm, "Candidate Signature:")
    
    c.rect(110*mm, y_pos, 70*mm, 20*mm)
    c.drawString(112*mm, y_pos + 16*mm, "Invigilator Signature:")
    
    # Footer
    c.setFont("Helvetica", 8)
    c.drawCentredString(width/2, 20*mm, f"Page 1 of {num_answer_pages + 1} | Booklet No: {booklet_data['paperNumber']}")
    c.drawCentredString(width/2, 15*mm, "DO NOT WRITE IN THE QR CODE AREA")
    
    c.showPage()
    
    # Subsequent pages: Ruled answer pages
    for page_num in range(2, num_answer_pages + 2):
        # Header
        c.setFont("Helvetica", 9)
        c.drawString(25*mm, height - 15*mm, f"Student ID: {student['studentId']}")
        c.drawString(25*mm, height - 20*mm, f"Exam: {exam['code']}")
        
        # Page number
        c.setFont("Helvetica-Bold", 10)
        c.drawRightString(width - 25*mm, height - 15*mm, f"Page {page_num} of {num_answer_pages + 1}")
        
        # QR Code for this page
        if page_num - 1 < len(pages):
            qr_data = pages[page_num - 1]['qrCodeData']
            qr_img = generate_qr_code(qr_data)
            qr_buffer = BytesIO()
            qr_img.save(qr_buffer, format='PNG')
            qr_buffer.seek(0)
            
            qr_temp_path = os.path.join(OUTPUT_DIR, f'qr_temp_{student["studentId"]}_p{page_num}.png')
            with open(qr_temp_path, 'wb') as f:
                f.write(qr_buffer.getvalue())
            
            c.drawImage(qr_temp_path, width - 40*mm, height - 50*mm, 30*mm, 30*mm)
            os.remove(qr_temp_path)
        
        # Draw ruled lines
        draw_ruled_lines(c, height - 60*mm, 30*mm)
        
        # Footer
        c.setFont("Helvetica", 8)
        c.drawCentredString(width/2, 20*mm, f"Page {page_num} of {num_answer_pages + 1}")
        c.drawCentredString(width/2, 15*mm, "DO NOT REMOVE STAPLES")
        
        c.showPage()
    
    c.save()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'service': 'Python PDF Generation Service',
        'version': '1.0.0'
    })

@app.route('/generate-answer-sheets', methods=['POST'])
def generate_answer_sheets():
    """Generate answer sheet PDFs for multiple students"""
    try:
        data = request.get_json()
        booklets = data.get('booklets', [])
        
        if not booklets:
            return jsonify({'error': 'No booklets data provided'}), 400
        
        generated_files = []
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Generate individual PDFs
        for booklet in booklets:
            student_id = booklet['student']['studentId']
            paper_number = booklet['paperNumber']
            filename = f"{paper_number}.pdf"
            output_path = os.path.join(OUTPUT_DIR, filename)
            
            create_answer_sheet_pdf(booklet, output_path)
            generated_files.append({
                'filename': filename,
                'path': output_path,
                'studentId': student_id
            })
        
        # Create ZIP file
        zip_filename = f'answer_sheets_{timestamp}.zip'
        zip_path = os.path.join(OUTPUT_DIR, zip_filename)
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file_info in generated_files:
                zipf.write(file_info['path'], file_info['filename'])
        
        return jsonify({
            'success': True,
            'message': f'Generated {len(generated_files)} answer sheets',
            'count': len(generated_files),
            'zipUrl': f'/download/{zip_filename}',
            'files': [{'filename': f['filename'], 'studentId': f['studentId']} for f in generated_files]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    """Download generated files"""
    file_path = os.path.join(OUTPUT_DIR, filename)
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
    return jsonify({'error': 'File not found'}), 404

if __name__ == '__main__':
    print("🐍 Starting Python PDF Generation Service...")
    print(f"📁 Output directory: {OUTPUT_DIR}")
    app.run(host='0.0.0.0', port=5001, debug=True)
