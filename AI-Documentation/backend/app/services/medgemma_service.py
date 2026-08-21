import ollama


def generate_response(prompt):

    response = ollama.chat(
    model="medgemma:4b",
    options={
        "temperature": 0.2
    },
    messages=[
        {
            "role": "user",
            "content": prompt
        }
    ]
    )

    return response["message"]["content"]