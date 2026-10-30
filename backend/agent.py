
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

api_key = os.getenv("NEBIUS_API_KEY")
base_url = os.getenv("NEBIUS_BASE_URL")
model = os.getenv("NEBIUS_MODEL")

if not all([api_key, base_url, model]):
    raise RuntimeError("Missing Nebius configuration in .env")

client = OpenAI(
    api_key=api_key,
    base_url=base_url,
    timeout=60.0
)


def explain_alert(analysis: dict) -> str:
    response = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": (
                    "Eres Sentinel Agent, un asistente ambiental. "
                    "Responde exclusivamente en español. "
                    "Entrega un informe final breve, sin razonamientos. "
                    "Usa estas secciones: RIESGO, EVIDENCIA, "
                    "INCERTIDUMBRE, ACCIONES RECOMENDADAS y AVISO. "
                    "No inventes datos ni ubicaciones. "
                    "Aclara que los datos son simulados o proporcionados "
                    "por el usuario y que no es una alerta oficial."
                )
            },
            {
                "role": "user",
                "content": (
                    "Redacta el informe final para este análisis: "
                    + str(analysis)
                )
            }
        ],
        temperature=0.2,
        max_tokens=1200,
        extra_body={
            "chat_template_kwargs": {
                "enable_thinking": False
            }
        }
    )

    choice = response.choices[0]
    result = (choice.message.content or "").strip()

    print("\n===== SENTINEL AGENT =====")
    print("MODELO:", response.model)
    print("FINISH REASON:", choice.finish_reason)
    print("INFORME:", result)
    print("==========================\n")

    if not result:
        raise ValueError("Nemotron returned an empty report")

    forbidden = [
        "thinking process",
        "analyze user input",
        "analyze input data",
        "review the system prompt"
    ]

    if any(term in result.lower() for term in forbidden):
        raise ValueError("Nemotron returned internal reasoning")

    required = [
        "RIESGO",
        "EVIDENCIA",
        "INCERTIDUMBRE",
        "ACCIONES RECOMENDADAS",
        "AVISO"
    ]

    if not all(section in result.upper() for section in required):
        raise ValueError("Nemotron report is incomplete")

    return result
