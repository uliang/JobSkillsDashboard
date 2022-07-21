import enum

from flask import request
from marshmallow import fields
from sqlalchemy import func, and_
import toolz

from . import ma, BaseResource, db
from .sector_resource import SectorDetail

skill_descriptions = db.metadata.tables['skill_description_table']
skill_ranks = db.metadata.tables['skill_rank_table']


class SKILL_RANK_OPTS(enum.IntEnum):
    ALL = 9999
    MIN_LIMIT = 5
    MAX_LIMIT = 20


class ArgsSchema(ma.Schema):
    year = fields.Nested(ma.Schema, many=True, only='year')
    limit = fields.List(fields.Int)


class TopSkills(SectorDetail):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.year_args = None
        self.limit_args = [int(SKILL_RANK_OPTS.MIN_LIMIT),
                           int(SKILL_RANK_OPTS.MAX_LIMIT)]

    class ResourceSchema(ma.Schema):
        data = fields.Nested(ma.Schema, many=True,
                             only=['country', 'rank', 'name', 'description'])
        _links = ma.Hyperlinks([
            {'rel': 'root', 'href': ma.URLFor('sectors')},
            {'rel': 'collections', 'href': ma.URLFor(
                'sector_detail', sector_id='<sector_id>')},
            {'rel': 'self', 'href': ma.URLFor(
                'top_skills', year='<year>', limit='<limit>', sector_id='<sector_id>')}
        ])
        # year = fields.String()
        # limit = fields.Integer()
        args = fields.Nested(ArgsSchema)
        limit = fields.Integer()

        class Meta:
            additional = ('year', 'sector', 'sector_id')

    def get_objects(self, *args, **kws):
        sector = super().get_objects(*args, **kws)

        rank_query = self.query(skill_ranks, skill_descriptions.c.skill_name.label('name'),
                                skill_descriptions.c.Description.label('description')) \
            .join(skill_descriptions) \
            .join(sector) \
            .subquery()

        self.year_args = self.query(rank_query.c.year) \
            .distinct() \
            .order_by(rank_query.c.year.desc())\
            .all()

        return rank_query

    def get_data(self, *args, **kws):
        year = request.args.get('year')
        limit = request.args.get('limit')
        year = int(year) if year != 'All' else int(SKILL_RANK_OPTS.ALL)

        query = self.get_objects(*args, **kws)

        objects = self.query(query).filter(query.c.year == year,
                                           query.c.rank <= limit) \
            .order_by(query.c.country, query.c.rank) \
            .all()

        payload = dict(**{
            'sector': self.chosen_sector,
            'data': objects,
            'args': {'year': self.year_args, 'limit': self.limit_args}, 
            'year': year, 
            'limit': limit
        }, **kws)

        return payload
