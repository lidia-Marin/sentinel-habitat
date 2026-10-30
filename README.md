
# Sentinel Habitat 🌿

**AI-powered environmental risk intelligence and early warning platform.**

Sentinel Habitat is a modular prototype designed to analyze environmental indicators, identify potential risk conditions, and communicate evidence-based insights through an AI assistant powered by NVIDIA Nemotron on Nebius Token Factory.

## Vision

Build a unified environmental intelligence platform with specialized modules:

- **Sentinel Fire:** Preliminary wildfire risk analysis.
- **Sentinel Water:** Preliminary water-related risk analysis.
- **Sentinel Biodiversity:** Planned ecosystem monitoring.
- **Sentinel Seismic:** Planned seismic signal analysis.
- **Sentinel Agent:** AI-generated explanations of analyzed conditions.

## Current Features

- Interactive environmental monitoring dashboard.
- Fire risk analysis using temperature, humidity, wind speed, and rainfall.
- Water risk analysis using water level, rainfall, and turbidity.
- Evidence-based risk summaries.
- AI-generated explanations using NVIDIA Nemotron.
- FastAPI backend and responsive web interface.

## Technology Stack

- Python
- FastAPI
- HTML, CSS, JavaScript
- NVIDIA Nemotron 3 Nano 30B A3B
- Nebius Token Factory API

## Architecture

The frontend communicates with a FastAPI backend. The backend evaluates environmental indicators and sends analysis results to NVIDIA Nemotron through Nebius Token Factory to generate explanatory reports.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/lidia-Marin/sentinel-habitat.git
cd sentinel-habitat
```

### 2. Set up the backend

```bash
cd backend
python -m venv .venv
```

Activate the environment:

Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file inside `backend/`:

```env
NEBIUS_API_KEY=your_api_key
NEBIUS_BASE_URL=https://api.tokenfactory.nebius.com/v1/
NEBIUS_MODEL=nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B
```

Never publish your API key.

### 4. Run the application

From the `backend` directory:

```bash
uvicorn main:app --reload
```

Open:

- Application: http://127.0.0.1:8000
- API documentation: http://127.0.0.1:8000/docs

## Responsible Use and Limitations

Sentinel Habitat is an experimental prototype.

Current risk calculations use preliminary rules and simulated or user-provided indicators. They are not validated forecasting models and must not be used as official emergency warnings.

Biodiversity and seismic modules are planned and are not currently connected to operational analysis models.

Always consult official authorities and trusted environmental monitoring sources when making safety decisions.

## Project Status

Prototype under active development.

## License

This project is licensed under the MIT License.
