from flask import request
from marshmallow import fields
from sqlalchemy import func
import toolz

from . import ma, BaseResource, db
from .sector_resource import SectorDetail

centroids = db.metadata.tables['sector_centroid_table']


class CentroidTypeSchema(ma.Schema):
    cluster_label = fields.Integer()
    probability = fields.Float()


class SectorCentroidSchema(ma.Schema):
    cluster_label = fields.Nested(
        CentroidTypeSchema, only='cluster_label', many=True)
    probability = fields.Nested(
        CentroidTypeSchema, only='probability', many=True)


class SectorCentroidResource(SectorDetail):

    def get_objects(self, *args, **kws):
        sector = super().get_objects(*args, **kws)
        centroid = self.query(centroids).join(sector).all()
        return centroid

    def get_data(self, *args, **kws):
        objs = self.get_objects(*args, **kws)

        payload = {
            'data': {
                'cluster_label': objs,
                'probability': objs
            },
            'sector': self.chosen_sector,
            'sector_id': kws.get('sector_id')
        }

        return payload

    class ResourceSchema(ma.Schema):
        _links = ma.Hyperlinks([
            {'rel': 'root', 'href': ma.URLFor('sectors')},
            {'rel': 'collections', 'href': ma.URLFor(
                'sector_detail', sector_id='<sector_id>')},
            {'rel': 'self', 'href': ma.URLFor(
                'sector_centroid', sector_id='<sector_id>')}
        ])
        data = fields.Nested(SectorCentroidSchema)

        class Meta:
            additional = ('sector', 'sector_id')
