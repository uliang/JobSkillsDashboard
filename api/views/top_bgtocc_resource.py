import enum

from flask import request
from marshmallow import fields
from sqlalchemy import func, and_
import toolz

from . import BaseResource, ma, db
from .sector_resource import SectorDetail

top_bgtocc = db.metadata.tables['top_bgtoccs_rank_and_perc']
bgtocc_descriptions = db.metadata.tables['bgtocc_description_table']


class TOP_BGTOCC_OPTS(enum.IntEnum):
    ALL = 9999
    MIN_LIMIT = 5
    MAX_LIMIT = 20


class TopBgtoccBaseSchema(ma.Schema):
    class Meta:
        fields = ('rank', 'country', 'name', 'description')


class ArgsSchema(ma.Schema):
    year = fields.Nested(ma.Schema, many=True, only='year')
    limit = fields.List(fields.Int)


class TopBgtocc(SectorDetail):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.chosen_year = None
        self.limit = None
        self.chosen_topbgtocc_query = None
        self.years = None

    class ResourceSchema(ma.Schema):
        _links = ma.Hyperlinks([
            {'rel': 'root', 'href': ma.URLFor('sectors')},
            {'rel': 'collections', 'href': ma.URLFor(
                'sector_detail', sector_id='<sector_id>')},
            {'rel': 'self', 'href': ma.URLFor(
                'top_bgtoccs', year='<year>', limit='<limit>', sector_id='<sector_id>')}
        ])
        data = fields.Nested(TopBgtoccBaseSchema, many=True)
        args = fields.Nested(ArgsSchema)

        class Meta:
            additional = ('year', 'limit', 'sector_id', 'sector')

    def get_objects(self, *args, **kws):
        self.limit = request.args.get('limit')
        year = request.args.get('year')
        year = year if year != 'All' else TOP_BGTOCC_OPTS.ALL.value
        self.chosen_year = year

        sector = super().get_objects(*args, **kws)

        self.chosen_topbgtocc_query = self.query(top_bgtocc, bgtocc_descriptions.c.description) \
            .join(sector) \
            .join(bgtocc_descriptions) \
            .subquery()

        self.years = self.query(self.chosen_topbgtocc_query.c.year) \
            .distinct() \
            .order_by(self.chosen_topbgtocc_query.c.year.desc())\
            .limit(4)\
            .all()

    def get_data(self, *args, **kws):
        self.get_objects(*args,  **kws)
        query = self.chosen_topbgtocc_query

        objects = self.query(query.c.description, query.c.bgtocc.label('name'),
                             query.c.rank, query.c.country) \
            .filter(query.c.year == self.chosen_year,
                    query.c.rank <= self.limit) \
            .order_by(query.c.country, query.c.rank) \
            .all()

        payload = dict(**{
            'limit': self.limit,
            'year': self.chosen_year,
            'sector': self.chosen_sector,
            'data': objects,
            'args': {
                'year': self.years,
                'limit': [TOP_BGTOCC_OPTS.MIN_LIMIT.value, TOP_BGTOCC_OPTS.MAX_LIMIT.value]
            }
        }, **kws)
        return payload
