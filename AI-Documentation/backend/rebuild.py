# rebuild.py

from app.rag.ingest import ingest_pdf

result = ingest_pdf(
    r"D:\claritynote\backend\Patient ID104.pdf",
    "P1003"
)

print(result)