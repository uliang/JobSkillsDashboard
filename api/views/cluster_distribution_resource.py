import enum

from flask import request
from marshmallow import fields
from sqlalchemy import func
import toolz

from . import ma, BaseResource, db

cluster_distribution = db.metadata.tables['cluster_distribution_table']


class ClusterTypesSchema(ma.Schema):
    component_1 = fields.Float()
    component_2 = fields.Float()
    prevalence = fields.Float()


class ClusterDistributionSchema(ma.Schema):
    component_1 = fields.Nested(
        ClusterTypesSchema, many=True, only='component_1')
    component_2 = fields.Nested(
        ClusterTypesSchema, many=True, only='component_2')
    label = fields.Nested(ma.Schema, many=True, only='label')
    prevalence = fields.Nested(
        ClusterTypesSchema, many=True, only='prevalence')


class ClusterDistribution(BaseResource):

    class ResourceSchema(ma.Schema):
        _links = ma.Hyperlinks([
            {'rel': 'root', 'href': ma.URLFor('sectors')},
            {'rel': 'self', 'href': ma.URLFor('clusters')},
            {'rel': 'details', 'href': ma.URLFor(
                'cluster_description', topic=0, l_=0.6)}
        ])
        data = fields.Nested(ClusterDistributionSchema)

    def get_objects(self, *args, **kws):
        return self.query(cluster_distribution).all()

    def get_data(self, *args, **kws):
        objs = self.get_objects(*args, **kws)

        payload = {
            'data': {
                'component_1': objs,
                'component_2': objs,
                'label': objs,
                'prevalence': objs
            }
        }

        return payload
