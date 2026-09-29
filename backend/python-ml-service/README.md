# Python ML Service Integration

This directory is reserved for Python-based Machine Learning services.

## Purpose
- Soil analysis using OCR
- Crop recommendation algorithms
- Disease detection models
- Predictive analytics

## Setup (Future Implementation)

### Requirements
- Python 3.8+
- TensorFlow / PyTorch
- scikit-learn
- OpenCV (for image processing)
- Flask/FastAPI (for API)

### Directory Structure
```
python-ml-service/
├── models/          # Trained ML models
├── src/            # Source code
├── tests/          # Unit tests
├── requirements.txt
└── app.py          # Flask/FastAPI application
```

## Integration with Node.js Backend

The Node.js backend will call Python ML services via:
1. **HTTP REST API** - Python service runs on separate port
2. **Child Process** - Node.js spawns Python scripts
3. **Message Queue** - Redis/RabbitMQ for async tasks

## Example Integration

```python
# Flask endpoint for soil analysis
@app.route('/analyze-soil', methods=['POST'])
def analyze_soil():
    data = request.json
    prediction = model.predict(data)
    return jsonify({
        'success': True,
        'prediction': prediction
    })
```

```javascript
// Node.js calls Python service
const response = await axios.post('http://localhost:5001/analyze-soil', {
  nitrogen: 120,
  phosphorus: 45,
  potassium: 80,
  ph: 6.5
});
```

## Status
⏳ Reserved for future implementation
