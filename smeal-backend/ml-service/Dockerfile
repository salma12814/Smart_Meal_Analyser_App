FROM python:3.11-slim
WORKDIR /app
ENV PIP_NO_CACHE_DIR=1 PYTHONUNBUFFERED=1 OMP_NUM_THREADS=2
COPY smeal-backend/ml-service/requirements.txt /app/requirements.txt
RUN pip install --upgrade pip \
 && pip install torch==2.13.0 torchvision==0.28.0 --index-url https://download.pytorch.org/whl/cpu \
 && pip install -r /app/requirements.txt
COPY models /app/models
COPY yolov8n.pt /app/yolov8n.pt
COPY src/config.json /app/src/config.json
COPY smeal-backend/ml-service/main.py /app/main.py
EXPOSE 5000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
