from datetime import (
    datetime
)

import os

from langchain_core.documents import (
    Document
)

from langchain_chroma import (
    Chroma
)

from langchain_huggingface import (
    HuggingFaceEmbeddings
)


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


def store_report(
    patient_id,
    report
):

    db = Chroma(
        collection_name=
        f"session_{patient_id}",

        persist_directory=
        CHROMA_PATH,

        embedding_function=
        article_embeddings
    )

    doc = Document(

        page_content=report,

        metadata={

            "patient_id":
            patient_id,

            "source":
            "generated_session",

            "created_at":
            str(
                datetime.utcnow()
            )
        }
    )

    db.add_documents(
        [doc]
    )

    print(
        f"Stored Session Report For {patient_id}"
    )