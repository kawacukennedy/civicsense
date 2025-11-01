from fastapi import FastAPI

app = FastAPI(title="CivicSense ML Service", version="0.1.0")

@app.post("/internal/ml/image_infer")
def image_infer(image_url: str):
    # Mock ML inference
    return {
        "labels": [{"label": "flood", "confidence": 0.85}],
        "veracity_score": 0.85
    }

@app.post("/internal/ml/text_infer")
def text_infer(text: str):
    # Mock text classification
    return {
        "labels": [{"label": "pothole", "confidence": 0.72}],
        "veracity_score": 0.72
    }

@app.get("/health")
def health():
    return {"status": "ok"}