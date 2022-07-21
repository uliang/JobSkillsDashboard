conda activate dashboard
export SQLALCHEMY_DATABASE_URI='mysql+pymysql://temp:tEmp12345@localhost/burning_glass_ops'
gunicorn -b localhost:8080 "app:create_app()" --reload -w 4
