FROM python:alpine

COPY ./requirements.txt ./requirements.txt
RUN ["pip","install","-r","requirements.txt"]

COPY ./app ./app

WORKDIR /app

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]