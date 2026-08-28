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


def retrieve_history(query, patient_id):
    db = Chroma(
        collection_name=f"history_{patient_id}",
        persist_directory=CHROMA_PATH,
        embedding_function=query_embeddings
    )
    docs = db.similarity_search(query, k=2)
    print(f"\nHistory Docs Retrieved: {len(docs)}")
    context = ""
    for doc in docs:
        context += "\n[Historical Report]\n"
        context += doc.page_content
        context += "\n"
    return context


def retrieve_history_details(query, patient_id):
    try:
        db = Chroma(
            collection_name=f"history_{patient_id}",
            persist_directory=CHROMA_PATH,
            embedding_function=query_embeddings
        )
        docs = db.similarity_search(query, k=3)
        formatted_docs = []
        context = ""
        for i, doc in enumerate(docs):
            formatted_docs.append({
                "id": f"hist_{i+1}",
                "source": doc.metadata.get("source", f"Historical Report {i+1}"),
                "content": doc.page_content,
                "metadata": doc.metadata
            })
            context += f"\n[Historical Report {i+1}]\n{doc.page_content}\n"
        return context, formatted_docs
    except Exception as e:
        print(f"Error retrieving history details: {e}")
        return "", []


def retrieve_session_history(query, patient_id):
    db = Chroma(
        collection_name=f"session_{patient_id}",
        persist_directory=CHROMA_PATH,
        embedding_function=query_embeddings
    )
    docs = db.similarity_search(query, k=2)
    print(f"\nSession Docs Retrieved: {len(docs)}")
    context = ""
    for doc in docs:
        context += "\n[Previous Session]\n"
        context += doc.page_content
        context += "\n"
    return context


def retrieve_session_history_details(query, patient_id):
    try:
        db = Chroma(
            collection_name=f"session_{patient_id}",
            persist_directory=CHROMA_PATH,
            embedding_function=query_embeddings
        )
        docs = db.similarity_search(query, k=2)
        formatted_docs = []
        context = ""
        for i, doc in enumerate(docs):
            formatted_docs.append({
                "id": f"sess_{i+1}",
                "source": doc.metadata.get("source", f"Encounter Session {i+1}"),
                "created_at": doc.metadata.get("created_at", "Previous Session"),
                "content": doc.page_content,
                "metadata": doc.metadata
            })
            context += f"\n[Previous Session {i+1}]\n{doc.page_content}\n"
        return context, formatted_docs
    except Exception as e:
        print(f"Error retrieving session details: {e}")
        return "", []