import sys
from pypdf import PdfReader

if len(sys.argv) < 3:
    print("Usage: python extract_pdf.py <input.pdf> <output.txt>")
    sys.exit(1)

reader = PdfReader(sys.argv[1])
with open(sys.argv[2], "w", encoding="utf-8") as f:
    for page in reader.pages:
        text = page.extract_text()
        if text:
            f.write(text + "\n")
print(f"Extracted {len(reader.pages)} pages to {sys.argv[2]}")
