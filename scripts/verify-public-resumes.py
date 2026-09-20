"""Run with Python + pypdf to guard the public resumes against phone disclosure."""
import re
from pathlib import Path

from pypdf import PdfReader

phone = re.compile(r"(?<!\d)(?:\+?91[\s-]?)?[6-9](?:[\s-]?\d){9}(?!\d)|\+91-[0-9X]{10}")
for path in [Path("amankeshridotcom.pdf"), *Path("public").glob("*.pdf")]:
    reader = PdfReader(path)
    assert len(reader.pages) == 1, path
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    assert not phone.search(text), f"Phone in text: {path}"
    assert not phone.search(str(reader.metadata)), f"Phone in metadata: {path}"
    assert "Aman Kumar" in text and "amankeshri7479@gmail.com" in text, path
    for page in reader.pages:
        for annotation in page.get("/Annots", []):
            uri = str(annotation.get_object().get("/A", {}).get("/URI", ""))
            assert not uri.startswith("tel:") and not phone.search(uri), path
    print(f"{path}: no phone in text, metadata or links; contact email retained")
