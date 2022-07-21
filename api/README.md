## Setting up deployment environment for the dashboard

Start **Anaconda** terminal by keying the Windows button and search for Anaconda terminal. Cd to the project root. The rest of the instructions assumes that the MySQL v8.0 database server (be it on localhost:3306) or a running docker image has already been set up.

1. Create a conda virtual environment by running this command
   `conda create -n <name of environment> python=3.7`

1. Install required dependencies.
   `pip install -r requirements.txt`

1. You need to set certain environment variables before you proceed. On windows,
   `set FLASK_APP=app`
   `set FLASK_ENV=development`
   `set SQLALCHEMY_DATABASE_URI=<mysql connection string>`

1. Start the development server
   `flask run`
