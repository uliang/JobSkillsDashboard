import enum

from flask import request
from marshmallow import fields
from sqlalchemy import func
import toolz

from . import ma, BaseResource, db
from .sector_resource import SectorDetail

skill_composition = db.metadata.tables['skill_composition_table']


class SKILL_COMPOSITION_OPTS(enum.IntEnum):
    MAX_LIMIT = 25
    MIN_LIMIT = 5
    STEP_LIMIT = 5
    MIN_COUNTRIES = 2
    MIN_YEARS = 3


class BgtoccBaseSchema(ma.Schema):
    country = fields.String()
    year = fields.Integer()
    bgtocc = fields.String()
    bgtocc_name_hash = fields.String()
    skill_type = fields.String()
    skill_name = fields.String()
    job_postings_skill = fields.Integer()
    rank = fields.Integer()


class ArgsSchema(ma.Schema):
    limit = fields.List(fields.Integer)
    skill_types = fields.Nested(BgtoccBaseSchema, many=True, only='skill_type')


class BgtoccTraceSchema(BgtoccBaseSchema):
    job_postings_skill = fields.Nested(
        BgtoccBaseSchema, many=True, only='job_postings_skill')
    skill_name = fields.Nested(BgtoccBaseSchema, many=True, only='skill_name')


class BGTOCCCollection(SectorDetail):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.chosen_bgtocc_hash = None
        self.limit = list(range(SKILL_COMPOSITION_OPTS.MIN_LIMIT.value,
                                SKILL_COMPOSITION_OPTS.MAX_LIMIT.value,
                                SKILL_COMPOSITION_OPTS.STEP_LIMIT.value))
        self.skill_types = None
        self.bgtoccs = None

    class ResourceSchema(ma.Schema):
        args = fields.Nested(ArgsSchema)
        _links = ma.Hyperlinks([
            {'rel': 'root', 'href': ma.URLFor('sectors')},
            {'rel': 'collections', 'href': ma.URLFor(
             'sector_detail', sector_id='<sector_id>')},
            {'rel': 'details', 'href': ma.URLFor(
             'bgtocc_details', sector_id='<sector_id>',  bgtocc_name_hash='<bgtocc_name_hash>', limit=5, skill_type='Baseline')}
        ])
        data = fields.Nested(BgtoccBaseSchema, many=True, only=[
            'bgtocc_name_hash', 'bgtocc'])

        class Meta:
            additional = ('bgtocc_name_hash', 'sector_id', 'sector')
            load_only = ('bgtocc_name_hash', )

    def get_objects(self, *args, **kws):
        sector = super().get_objects(*args, **kws)

        bgtocc_query = self.query(skill_composition) \
            .join(sector) \
            .filter(skill_composition.c.num_years <= SKILL_COMPOSITION_OPTS.MIN_YEARS.value,
                    skill_composition.c.num_countries == SKILL_COMPOSITION_OPTS.MIN_COUNTRIES.value) \
            .subquery()

        self.chosen_bgtocc_hash = self.query(
            bgtocc_query).first().bgtocc_name_hash

        self.skill_types = self.query(
            bgtocc_query.c.skill_type).distinct().all()

        self.bgtoccs = self.query(bgtocc_query.c.bgtocc, bgtocc_query.c.bgtocc_name_hash) \
            .distinct().all()

        return bgtocc_query

    def get_data(self, *args, **kws):
        self.get_objects(*args, **kws)
        payload = {
            'sector_id': kws.get('sector_id'),
            'bgtocc_name_hash': self.chosen_bgtocc_hash,
            'sector': self.chosen_sector,
            'args': {
                'limit': self.limit,
                'skill_types': self.skill_types
            },
            'data': self.bgtoccs
        }

        return payload


class BGTOCCDetail(BGTOCCCollection):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.chosen_bgtocc_skills = None
        self.chosen_bgtocc_name = None
        self.chosen_skill_type = None
        self.category_array = None

    class ResourceSchema(BgtoccBaseSchema):
        # args = fields.Nested(ArgsSchema)
        _links = ma.Hyperlinks([
            {'rel': 'root', 'href': ma.URLFor('sectors')},
            {'ref': 'collections',
             'href': ma.URLFor(
                 'sector_detail', sector_id='<sector_id>')},
            {'ref': 'collections',
             'href': ma.URLFor(
                 'bgtocc_collection', sector_id='<sector_id>')},
            {'rel': 'self',
             'href': ma.URLFor(
                 'bgtocc_details', sector_id='<sector_id>',  bgtocc_name_hash='<bgtocc_name_hash>',
                 limit='<limit>', skill_type='<skill_type>')}
        ])
        data = fields.Nested(BgtoccTraceSchema, many=True)
        category_array = fields.Nested(BgtoccBaseSchema, many=True, only=[
                                       'country', 'rank', 'skill_name'])

        class Meta:
            additional = ('sector_id', 'limit', 'sector',
                          'skill_type', 'bgtocc_name_hash')

    def get_objects(self, *args, **kws):
        bgtocc_query = super().get_objects(*args, **kws)
        self.chosen_bgtocc_hash = kws.get('bgtocc_name_hash')
        limit = request.args.get(
            'limit', SKILL_COMPOSITION_OPTS.MIN_LIMIT.value)
        skill_type = request.args.get('skill_type', 'Baseline')

        chosen_bgtocc_query = self.query(bgtocc_query) \
            .filter(bgtocc_query.c.bgtocc_name_hash == self.chosen_bgtocc_hash,
                    bgtocc_query.c.rank <= limit,
                    bgtocc_query.c.skill_type == skill_type) \
            .subquery()

        self.chosen_bgtocc_name = self.query(bgtocc_query.c.bgtocc) \
            .filter(bgtocc_query.c.bgtocc_name_hash == self.chosen_bgtocc_hash) \
            .first() \
            .bgtocc

        self.chosen_bgtocc_skills = self.query(chosen_bgtocc_query.c.country,
                                               chosen_bgtocc_query.c.year,
                                               chosen_bgtocc_query.c.skill_name,
                                               chosen_bgtocc_query.c.job_postings_skill)\
            .order_by(chosen_bgtocc_query.c.country,
                      chosen_bgtocc_query.c.year,
                      chosen_bgtocc_query.c.rank) \
            .all()

        self.category_array = self.query(chosen_bgtocc_query.c.country,
                                         chosen_bgtocc_query.c.skill_name,
                                         chosen_bgtocc_query.c.rank) \
            .distinct() \
            .order_by(chosen_bgtocc_query.c.country,
                      chosen_bgtocc_query.c.rank) \
            .all()

    def get_data(self, *args, **kws):
        self.get_objects(*args, **kws)
        traces = toolz.groupby(lambda o: (o.country, o.year), self.chosen_bgtocc_skills)\
            .items()

        payload = dict(**{
            'sector_id': kws.get('sector_id'),
            'sector': self.chosen_sector,
            'bgtocc': self.chosen_bgtocc_name,
            'bgtocc_name_hash':   self.chosen_bgtocc_hash,
            # kws.get('bgtocc_name_hash'),
            'data': [{
                'country': country,
                'year': year,
                'skill_name': trace,
                'job_postings_skill': trace
            } for (country, year), trace in traces],
            'category_array': self.category_array
        }, **request.args)
        return payload
