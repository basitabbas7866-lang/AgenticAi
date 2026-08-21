import os

from langchain_community.document_loaders import (
    PyPDFLoader
)

from langchain_text_splitters import (
    RecursiveCharacterTextSplitter
)

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


def ingest_pdf(
    pdf_path,
    patient_id
):

    loader = PyPDFLoader(
        pdf_path
    )

    docs = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150
    )

    chunks = splitter.split_documents(
        docs
    )

    history_docs = []

    for chunk in chunks:

        history_docs.append(

            Document(
                page_content=
                chunk.page_content,

                metadata={
                    "patient_id":
                    patient_id,

                    "source":
                    "historical_pdf"
                }
            )

        )

    db = Chroma(
        collection_name=
        f"history_{patient_id}",

        persist_directory=
        CHROMA_PATH,

        embedding_function=
        article_embeddings
    )

    db.add_documents(
        history_docs
    )

    return {
        "status": "success",
        "patient_id": patient_id,
        "chunks": len(history_docs)
    }