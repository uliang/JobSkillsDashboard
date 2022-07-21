import enum

from flask import request
from sqlalchemy import and_
from marshmallow import fields
import toolz

from . import ma
from .top_skills_resource import TopSkills, SKILL_RANK_OPTS


class SKILL_TREND_OPTS(enum.IntEnum):
    MAX_RANK = 5


class TraceSchema(ma.Schema):
    value = fields.Nested(ma.Schema, many=True,
                          only='value')
    year = fields.Nested(ma.Schema, many=True, only='year')
    value_field = fields.String()

    class Meta:
        additional = ('name', 'country')


class ArgsSchema(ma.Schema):
    base_year = fields.Nested(ma.Schema, many=True, only='year')


class SkillTrend(TopSkills):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.base_year = None

    class ResourceSchema(ma.Schema):
        data = fields.Nested(TraceSchema, many=True)
        _links = ma.Hyperlinks([
            {'rel': 'root', 'href': ma.URLFor('sectors')},
            {'ref': 'collections', 'href': ma.URLFor(
                'sector_detail', sector_id='<sector_id>')},
            {'rel': 'self', 'href': ma.URLFor(
                'skill_trends', base_year='<base_year>', sector_id='<sector_id>')}
        ])
        args = fields.Nested(ArgsSchema)

        class Meta:
            additional = ('sector_id', 'sector', 'base_year', 'value_field')

    def get_objects(self, *args, **kws):
        base_year = request.args.get('base_year')

        base_year = self.base_year = int(base_year) if base_year != 'All' else int(
            SKILL_RANK_OPTS.ALL)
        # print(self.base_year)

        rank_query = super().get_objects(*args, **kws)

        base_year_skills = self.query(rank_query.c.name, rank_query.c.country) \
            .filter(rank_query.c.rank <= int(SKILL_TREND_OPTS.MAX_RANK),
                    rank_query.c.year == base_year) \
            .distinct() \
            .subquery()

        trend = self.query(rank_query) \
            .filter(rank_query.c.year < int(SKILL_RANK_OPTS.ALL)) \
            .join(base_year_skills,
                  and_(base_year_skills.c.name == rank_query.c.name,
                       base_year_skills.c.country == rank_query.c.country)) \
            .subquery()

        if self.base_year == int(SKILL_RANK_OPTS.ALL):
            return self.query(trend.c.job_postings_skill.label('value'), trend.c.country,
                              trend.c.name, trend.c.year)

        return self.query(trend.c.rank.label('value'),
                          trend.c.name,
                          trend.c.year,
                          trend.c.country)

    def get_data(self, *args, **kws):
        query = self.get_objects(*args, **kws)

        traces = toolz.groupby(lambda o: (o.country, o.name), query.all()) \
            .items()

        payload = dict(**{
            'data': [
                {'country': country,
                 'name': name,
                 'year': trace,
                 'value': trace
                 } for
                (country, name), trace in traces
            ],
            'value_field': 'Rank' if self.base_year != int(SKILL_RANK_OPTS.ALL) else 'Job Postings',
            'sector': self.chosen_sector,
            'args': {'base_year': self.year_args},
            'base_year': self.base_year
        }, **kws)

        return payload
