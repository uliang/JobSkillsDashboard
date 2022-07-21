import enum

from flask import request
from marshmallow import fields
from sqlalchemy import func, and_
import toolz

from . import ma, BaseResource, db
from .top_bgtocc_resource import TopBgtocc


class BGTOCC_TREND_OPTS(enum.IntEnum):
    MIN_COUNTRIES = 2
    MIN_YEARS = 5
    ALL = 9999
    START_YEAR = 2014


# class BgtoccTrendBaseSchema(ma.Schema):
#     percentage = fields.Float()


class BgtoccTrendSchema(ma.Schema):
    percentage = fields.Nested(type('BgtoccTrendBaseSchema', (ma.Schema, ), {
                               'percentage': fields.Float()
                               }),
                               many=True, only='percentage')
    year = fields.Nested(ma.Schema, many=True, only='year')
    country = fields.String()


class BgtoccTrendCollection(TopBgtocc):
    class ResourceSchema(ma.Schema):
        data = fields.Nested(ma.Schema, many=True, only=[
                             'bgtocc_hash', 'bgtocc'])

        _links = ma.Hyperlinks([
            {'rel': 'root', 'href': ma.URLFor('sectors')},
            {'rel': 'collections', 'href': ma.URLFor(
             'sector_detail', sector_id='<sector_id>')},
            {'rel': 'details',
             'href': ma.URLFor('bgtocc_trend_details', sector_id='<sector_id>',
                               bgtocc_hash='<bgtocc_hash>')}
        ])

        class Meta:
            additional = ('sector', 'sector_id', 'bgtocc_hash')
            load_only = ('bgtocc_hash', )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.filtered_bgtocc_query = None
        self.first_bgtocc_choice = None

    def get_objects(self, *args, **kws):
        super().get_objects(*args, **kws)

        query = self.chosen_topbgtocc_query
        self.filtered_bgtocc_query = self.query(query) \
            .filter(query.c.num_countries == BGTOCC_TREND_OPTS.MIN_COUNTRIES.value,
                    query.c.num_years >= BGTOCC_TREND_OPTS.MIN_YEARS.value) \
            .subquery()

        self.first_bgtocc_choice = self.query(self.filtered_bgtocc_query) \
            .first().bgtocc_hash

    def get_data(self, *args, **kws):
        self.get_objects(*args, **kws)
        objects = self.query(self.filtered_bgtocc_query.c.bgtocc_hash,
                             self.filtered_bgtocc_query.c.bgtocc) \
            .distinct() \
            .all()

        payload = {
            'sector': self.chosen_sector,
            'sector_id': kws.get('sector_id'),
            'data': objects,
            'bgtocc_hash': self.first_bgtocc_choice,

        }
        return payload


class BgtoccTrendDetails(BgtoccTrendCollection):
    class ResourceSchema(ma.Schema):
        data = fields.Nested(BgtoccTrendSchema, many=True)
        _links = ma.Hyperlinks([
            {'rel': 'root', 'href': ma.URLFor('sectors')},
            {'rel': 'collections',
             'href': ma.URLFor(
                 'sector_detail', sector_id='<sector_id>')},
            {'rel': 'collections',
             'href': ma.URLFor('bgtocc_trends', sector_id='<sector_id>')},
            {'rel': 'self',
             'href': ma.URLFor('bgtocc_trend_details', sector_id='<sector_id>',
                               bgtocc_hash='<bgtocc_hash>')}
        ])

        class Meta:
            additional = ('sector', 'sector_id', 'bgtocc_hash', 'bgtocc')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.chosen_bgtocc_hash = None
        self.chosen_bgtocc_trend = None
        self.chosen_bgtocc = None

    def get_objects(self, *args, **kws):
        super().get_objects(*args, **kws)
        self.chosen_bgtocc_hash = bgtocc_hash = kws.get('bgtocc_hash')

        query = self.filtered_bgtocc_query

        self.chosen_bgtocc_trend = self.query(query.c.year,
                                              query.c.percentage,
                                              query.c.country,
                                              query.c.bgtocc) \
            .filter(query.c.bgtocc_hash == bgtocc_hash,
                    query.c.year < BGTOCC_TREND_OPTS.ALL.value,
                    query.c.year >= BGTOCC_TREND_OPTS.START_YEAR.value) \
            .order_by(query.c.country,
                      query.c.year) \
            .subquery()

        self.chosen_bgtocc = self.query(
            self.chosen_bgtocc_trend).first().bgtocc

    def get_data(self, *args, **kws):
        self.get_objects(*args, **kws)
        objects = self.query(self.chosen_bgtocc_trend).all()
        traces = toolz.groupby(lambda o: o.country, objects) \
            .items()

        payload = {
            'data': [{
                'country': country,
                'year': trace,
                'percentage': trace
            } for country, trace in traces],
            'sector_id': kws.get('sector_id'),
            'sector': self.chosen_sector,
            'bgtocc': self.chosen_bgtocc,
            'bgtocc_hash': self.chosen_bgtocc_hash
        }

        return payload
