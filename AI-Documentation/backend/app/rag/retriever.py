import os

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


query_embeddings = HuggingFaceEmbeddings(
    model_name="ncbi/MedCPT-Query-Encoder",
    model_kwargs={
        "device": "cpu"
    }
)


def retrieve_history(
    query,
    patient_id
):

    db = Chroma(
        collection_name=
        f"history_{patient_id}",

        persist_directory=
        CHROMA_PATH,

        embedding_function=
        query_embeddings
    )

    docs = db.similarity_search(
        query,
        k=2
    )

    print(
        f"\nHistory Docs Retrieved: {len(docs)}"
    )

    context = ""

    for doc in docs:

        context += (
            "\n[Historical Report]\n"
        )

        context += (
            doc.page_content
        )

        context += "\n"

    return context


def retrieve_session_history(
    query,
    patient_id
):

    db = Chroma(
        collection_name=
        f"session_{patient_id}",

        persist_directory=
        CHROMA_PATH,

        embedding_function=
        query_embeddings
    )

    docs = db.similarity_search(
        query,
        k=2
    )

    print(
        f"\nSession Docs Retrieved: {len(docs)}"
    )

    context = ""

    for doc in docs:

        print(
            "Metadata:",
            doc.metadata
        )

        context += (
            "\n[Previous Session]\n"
        )

        context += (
            doc.page_content
        )

        context += "\n"

    return context