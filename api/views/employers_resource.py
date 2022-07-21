import enum


from flask import request
from marshmallow import fields
from sqlalchemy import func
import toolz

from . import BaseResource, ma, db
from .sector_resource import SectorDetail

employer = db.metadata.tables['employer_ranked_table']


class EMPLOYER_OPTS(enum.Enum):
    DEFAULT_LIMIT = 5
    DEFAULT_COUNTRY = 'Singapore'
    LIMIT_MIN = 5
    LIMIT_MAX = 20
    LIMIT_STEP = 5


class EmployerTraceSchema(ma.Schema):
    Employer = fields.Nested(ma.Schema, only='Employer', many=True)
    job_postings = fields.Nested(ma.Schema, only='job_postings', many=True)

    class Meta:
        additional = ('year', )


class Employer(SectorDetail):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.limit = None
        self.employer_query = None
        self.limit_args = list(range(EMPLOYER_OPTS.LIMIT_MIN.value,
                                     EMPLOYER_OPTS.LIMIT_MAX.value, EMPLOYER_OPTS.LIMIT_STEP.value))
        self.category_array = None

    def get_objects(self, *args, **kws):
        sector = super().get_objects(*args, **kws)
        self.limit = limit = request.args.get(
            'limit', EMPLOYER_OPTS.DEFAULT_LIMIT.value)

        self.employer_query = self.query(employer) \
            .join(sector) \
            .filter(employer.c.rank <= limit,
                    employer.c.country == EMPLOYER_OPTS.DEFAULT_COUNTRY.value) \
            .order_by(employer.c.year) \
            .subquery()

        self.category_array = self.query(self.employer_query.c.Employer, self.employer_query.c.rank) \
            .distinct() \
            .order_by(self.employer_query.c.rank) \
            .all()

    def get_data(self, *args, **kws):
        self.get_objects(*args, **kws)
        objects = self.query(self.employer_query).all()
        traces = toolz.groupby(lambda o: (o.country, o.year), objects) \
            .items()

        payload = {
            'data': [{
                'country': country,
                'year': year,
                'Employer': trace,
                'job_postings': trace
            } for (country, year), trace in traces],
            'args': {'limit': self.limit_args},
            'sector_id': kws.get('sector_id'),
            'sector': self.chosen_sector,
            'limit': self.limit,
            'country': EMPLOYER_OPTS.DEFAULT_COUNTRY.value,
            'category_array': self.category_array
        }

        return payload

    class ResourceSchema(ma.Schema):
        data = fields.Nested(EmployerTraceSchema, many=True)
        _links = ma.Hyperlinks([
            {'rel': 'root', 'href': ma.URLFor('sectors')},
            {'rel': 'collections', 'href': ma.URLFor(
                'sector_detail', sector_id='<sector_id>')},
            {'rel': 'self',
             'href': ma.URLFor('employers', sector_id='<sector_id>',
                               country='<country>', limit='<limit>')}
        ])
        args = fields.Nested(type('ArgsSchema', (ma.Schema,), {
                             'limit': fields.List(fields.Int)}))
        category_array = fields.Nested(ma.Schema, many=True, only='Employer')

        class Meta:
            additional = ('sector_id', 'sector', 'limit', 'country', )
