FROM python:3.11-slim
WORKDIR /app

# Install netcat for health checks
RUN apt-get update && apt-get install -y netcat-traditional && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# Make the startup script executable
RUN chmod +x start.sh

ENV PYTHONUNBUFFERED=1
CMD ["./start.sh"] 