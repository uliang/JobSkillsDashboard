import enum

from . import ma, BaseResource, db
from marshmallow import fields

sector = db.metadata.tables['sector_table']


class COLLECTION_OPTS(enum.IntEnum):
    INITIAL_LIMIT = 5


class SectorSchema(ma.Schema):
    id = fields.Integer()
    sector = fields.String()


class SectorCollection(BaseResource):

    class ResourceSchema(ma.Schema):
        data = fields.Nested(SectorSchema, many=True)
        _links = ma.Hyperlinks([{
            'rel': 'collection',
            'href': ma.URLFor('sector_detail', sector_id='<sector_id>')
        },
            {'rel': 'root', 'href': ma.URLFor('sectors')},
            {'rel': 'model', 'href': ma.URLFor('clusters')}
        ])

        class Meta:
            additional = ('sector_id', )
            load_only = ('sector_id', )

    def get_objects(self, *args, **kws):
        return self.query(sector)

    def get_data(self, *args, **kws):
        query = self.get_objects(*args, **kws)
        return {
            'sector_id': query.first().id,
            'data': query.all()
        }


class SectorDetail(SectorCollection):

    def __init__(self, *args, **kwargs):
        self.chosen_sector = None

    class ResourceSchema(SectorSchema):
        _links = ma.Hyperlinks({
            'root': ma.URLFor('sectors'),
            'collections': [
                {'rel': 'top_skills',
                 'href': ma.URLFor('top_skills',
                                   sector_id='<id>', limit=COLLECTION_OPTS.INITIAL_LIMIT.value, year='All')},
                {'rel': 'skill_trends',
                 'href': ma.URLFor('skill_trends',
                                   sector_id='<id>', base_year='All')},
                {'rel': 'bgtocc_collection',
                 'href': ma.URLFor('bgtocc_collection', sector_id='<id>')},
                {'rel': 'top_bgtoccs',
                 'href': ma.URLFor('top_bgtoccs', sector_id='<id>',
                                   limit=COLLECTION_OPTS.INITIAL_LIMIT.value, year='All')},
                {'rel': 'bgtocc_trends',
                 'href': ma.URLFor('bgtocc_trends', sector_id='<id>')},
                {'rel': 'education',
                 'href': ma.URLFor('education', sector_id='<id>')},
                {'rel': 'employers',
                 'href': ma.URLFor('employers', sector_id='<id>', limit=COLLECTION_OPTS.INITIAL_LIMIT.value)},
                {'rel': 'centroid',
                 'href': ma.URLFor('sector_centroid', sector_id='<id>')}
            ]
        })

    def get_objects(self, *args, **kws):
        id = kws.get('sector_id')
        sector_query = super().get_objects(*args, **kws) \
            .filter_by(id=id)\
            .subquery()

        self.chosen_sector = self.query(sector_query) \
            .first() \
            .sector

        return sector_query

    def get_data(self, *args, **kws):
        query = self.get_objects(*args, **kws)

        return self.query(query).first()
