FROM python:3
WORKDIR /usr/src/project

COPY requirements.txt ./
RUN pip install -r requirements.txt 
COPY . .

CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:create_app()", "-w", "4", "--chdir", "/usr/src/project"]
