from datetime import datetime
import os

from langchain_core.documents import Document
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings


CHROMA_PATH = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "chroma_db"
    )
)

article_embeddings = HuggingFaceEmbeddings(
    model_name="ncbi/MedCPT-Article-Encoder",
    model_kwargs={
        "device": "cpu"
    }
)


def store_history(patient_id, diagnosis, prescription, notes):

    db = Chroma(
        collection_name=f"history_{patient_id}",
        persist_directory=CHROMA_PATH,
        embedding_function=article_embeddings
    )

    history_text = f"""
Known Diagnosis:

{diagnosis}

Previous Prescription:

{prescription}

Doctor Notes:

{notes}
"""

    doc = Document(
        page_content=history_text,
        metadata={
            "patient_id": patient_id,
            "diagnosis": diagnosis,
            "type": "doctor_validated",
            "created_at": str(datetime.utcnow())
        }
    )

    db.add_documents([doc])

    print(f"Stored Doctor History For {patient_id}")
