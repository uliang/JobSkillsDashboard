from flask import jsonify, current_app, Response, request
from flask.views import MethodView
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow

db = SQLAlchemy()
db.init_app(current_app)
db.reflect()
ma = Marshmallow(current_app)


class BaseResource(MethodView):
    query = db.session.query

    class ResourceSchema(ma.Schema):
        pass

    def serialize(self, data):
        schema = self.ResourceSchema(many=isinstance(data, list))
        return schema.jsonify(data)

    def get_objects(self, *args, **kws):
        raise NotImplementedError

    def get_data(self, *args, **kws):
        raise NotImplementedError

    def get(self, *args, **kws):
        data = self.get_data(*args, **kws)
        return self.serialize(data)
