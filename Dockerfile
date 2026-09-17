FROM python:3.11-slim

# Install system dependencies & Tesseract OCR
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libtesseract-dev \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Build frontend asset bundle
WORKDIR /app/frontend
RUN npm install && npm run build

WORKDIR /app

# Generate sample images
RUN python create_samples.py

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
