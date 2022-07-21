from flask import Flask, send_from_directory
import os


def create_app(test_config=None):
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
        'SQLALCHEMY_DATABASE_URI')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    if test_config:
        app.config.from_mapping(test_config)

    with app.app_context():
        from views.sector_resource import SectorCollection, SectorDetail
        from views.top_skills_resource import TopSkills
        from views.skill_trend_resource import SkillTrend
        from views.education_resource import Education
        from views.top_bgtocc_resource import TopBgtocc
        from views.skill_composition_resource import BGTOCCCollection,  BGTOCCDetail
        from views.bgtocc_trend_resource import BgtoccTrendCollection, BgtoccTrendDetails
        from views.employers_resource import Employer
        from views.cluster_distribution_resource import ClusterDistribution
        from views.sector_centroid_resource import SectorCentroidResource
        from views.cluster_model_resource import ClusterModel

        routes = [
            ('/api/v2/sector', 'sectors', SectorCollection),
            ('/api/v2/sector/<int:sector_id>', 'sector_detail', SectorDetail),
            ('/api/v2/sector/<int:sector_id>/skills/top', 'top_skills', TopSkills),
            ('/api/v2/sector/<int:sector_id>/skills/trend',
             'skill_trends', SkillTrend),
            ('/api/v2/sector/<int:sector_id>/bgtocc/<bgtocc_name_hash>',
             'bgtocc_details', BGTOCCDetail),
            ('/api/v2/sector/<int:sector_id>/bgtocc',
             'bgtocc_collection', BGTOCCCollection),
            ('/api/v2/sector/<int:sector_id>/bgtocc/top', 'top_bgtoccs', TopBgtocc),
            ('/api/v2/sector/<int:sector_id>/bgtocc/trend',
             'bgtocc_trends', BgtoccTrendCollection),
            ('/api/v2/sector/<int:sector_id>/bgtocc/trend/<bgtocc_hash>',
             'bgtocc_trend_details', BgtoccTrendDetails),
            ('/api/v2/sector/<int:sector_id>/education',
             'education', Education),
            ('/api/v2/sector/<int:sector_id>/employers',
             'employers', Employer),
            ('/api/v2/cluster', 'clusters', ClusterDistribution), 
            ('/api/v2/sector/<int:sector_id>/centroid', 'sector_centroid', SectorCentroidResource), 
            ('/api/v2/cluster/<int:topic>', 'cluster_description',  ClusterModel)
        ]
        for url, endpoint, resource in routes:
            app.add_url_rule(url, view_func=resource.as_view(endpoint))

    return app
