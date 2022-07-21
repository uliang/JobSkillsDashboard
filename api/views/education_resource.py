import enum
import collections

from flask import request
from marshmallow import fields
from sqlalchemy import func
import toolz

from . import BaseResource, ma, db
from .sector_resource import SectorDetail

edu = db.metadata.tables['education_table']


class EDUCATION_OPTS(enum.Enum):
    SINGAPORE = 'Singapore'
    ALL = 'All'


class EducationTraceSchema(ma.Schema):
    Education = fields.Nested(
        ma.Schema, many=True, only='Education')
    Experience = fields.String()
    num_of_jobs = fields.Nested(type('NumJobsFieldSchema',
                                     (ma.Schema,),
                                     {'num_of_jobs': fields.Integer()}),
                                many=True, only='num_of_jobs')


class Education(SectorDetail):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.edu_query = None
        self.default_year = EDUCATION_OPTS.ALL.value
        self.year_args = None
        self.aggregated_objects = None
        self.chosen_year = None
        self.category_array = None
        # year_field_opts = collections.namedtuple('year_field_opts', ['year'])
        # self.addtional_year_opts = year_field_opts(
        #     year=EDUCATION_OPTS.ALL.value)

    def get_objects(self, *args, **kws):
        sector = super().get_objects(*args, **kws)

        self.edu_query = self.query(edu) \
            .join(sector) \
            .filter(edu.c.country == EDUCATION_OPTS.SINGAPORE.value) \
            .subquery()

        self.year_args = toolz.pipe(self.query(self.edu_query.c.year).distinct().all(),
                                    toolz.concat, list)
        self.year_args.append(EDUCATION_OPTS.ALL.value)

        self.category_array = self.query(edu.c.Education) \
            .order_by(edu.c.education_rank) \
            .distinct() \
            .all()

        self.aggregated_objects = self.query(self.edu_query.c.Experience,
                                             self.edu_query.c.Education,
                                             self.edu_query.c.experience_rank,
                                             func.sum(self.edu_query.c.num_of_jobs).label('num_of_jobs')) \
            .group_by(self.edu_query.c.Experience, self.edu_query.c.experience_rank, self.edu_query.c.Education) \
            .order_by(self.edu_query.c.experience_rank) \
            .all()

    def get_data(self, *args, **kws):
        self.get_objects(*args, **kws)
        self.chosen_year = year = request.args.get('year', self.default_year)

        if year != self.default_year:
            objects = self.query(self.edu_query) \
                .filter(self.edu_query.c.year == year) \
                .order_by(self.edu_query.c.experience_rank, self.edu_query.c.education_rank) \
                .all()
        else:
            objects = self.aggregated_objects

        traces = toolz.groupby(lambda o: o.Experience, objects) \
            .items()

        payload = {
            'data': [{
                'Experience': Experience,
                'Education': trace,
                'num_of_jobs': trace
            } for Experience, trace in traces],
            'sector_id': kws.get('sector_id'),
            'sector': self.chosen_sector,
            'country': EDUCATION_OPTS.SINGAPORE.value,
            'args': {
                'year': self.year_args
            },
            'year': self.chosen_year,
            'category_array': self.category_array
        }
        return payload

    class ResourceSchema(ma.Schema):
        _links = ma.Hyperlinks([
            {'rel': 'root', 'href': ma.URLFor('sectors')},
            {'rel': 'collections', 'href': ma.URLFor(
                'sector_detail', sector_id='<sector_id>')},
            {'rel': 'self',
             'href': ma.URLFor('education', sector_id='<sector_id>',
                               country='<country>', year='<year>')}
        ])
        data = fields.Nested(EducationTraceSchema, many=True)
        args = fields.Nested(type(
            'ArgsSchema',
            (ma.Schema, ),
            {'year': fields.List(fields.String())}
        ))
        category_array = fields.Nested(ma.Schema, many=True, only='Education')

        class Meta:
            additional = ('sector_id', 'sector', 'country', 'year')
            load_only = ('country', )
