FROM python:3.10-slim

WORKDIR /app

# Copy backend files
COPY supply-chain-sustainability-main/greenlane-ai/backend/ .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port
EXPOSE 8000

# Start the server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
