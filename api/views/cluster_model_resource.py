from enum import Enum

from flask import request
from marshmallow import fields
from sqlalchemy import func
import toolz

from . import ma, BaseResource, db

model = db.metadata.tables['clustering_model_table']
skill_descriptions = db.metadata.tables['skill_description_table']

class ClusterModelOpts(Enum): 
    LIMIT= 10 

class ClusterModelType(ma.Schema):
    pseudocount = fields.Float()
    term_frequency = fields.Float()


class ClusterModelSchema(ma.Schema):
    pseudocount = fields.Nested(
        ClusterModelType, only='pseudocount', many=True)
    term_frequency = fields.Nested(
        ClusterModelType, only='term_frequency', many=True)
    name = fields.Nested(ma.Schema, only='name', many=True)


class ClusterModel(BaseResource):
    def get_objects(self, *args, **kws):
        topic = kws.get('topic')
        l_ = toolz.pipe(request.args.get('l_'), float)

        q = self.query(model).filter_by(topic_label=topic).subquery()

        q = self.query(q.c.skill_name_hash,
                       ((1-l_)*q.c.log_prob_wk + l_ *
                        q.c.log_prob_wk_by_prob_w).label('relevance'),
                       q.c.pseudocount, q.c.term_frequency)\
            .subquery()

        q = self.query(q.c.pseudocount, q.c.term_frequency, q.c.skill_name_hash) \
            .order_by(q.c.relevance.desc()) \
            .limit(ClusterModelOpts.LIMIT.value)\
            .subquery()

        objs = self.query(q, skill_descriptions.c.skill_name.label('name'))\
            .join(skill_descriptions, skill_descriptions.c.skill_name_hash == q.c.skill_name_hash) \
            .all()
        return objs

    def get_data(self, *args, **kws):
        objs = self.get_objects(*args, **kws)

        payload = dict(**{
            'data': {
                'pseudocount': objs,
                'term_frequency': objs,
                'name': objs
            }
        }, **kws, **request.args)

        return payload

    class ResourceSchema(ma.Schema):
        _links = ma.Hyperlinks([
            {'rel': 'root', 'href': ma.URLFor('sectors')},
            {'rel': 'clusters', 'href': ma.URLFor('clusters')},
            {'rel': 'self', 'href': ma.URLFor(
                'cluster_description', topic='<topic>', l_='<l_>')},
        ])
        data = fields.Nested(ClusterModelSchema)

        class Meta:
            additional = ('topic', 'l_')
