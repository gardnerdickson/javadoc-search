import urllib.request
import urllib.parse
import json
from urllib.error import URLError

from flask import Flask
from flask import request
from flask import Response
from flask import render_template

from scraper import JavadocScraper
from siteadapter import SiteAdapter


class JavadocSearchFlaskApplication(Flask):
    # Need to use something other than '{{' and '}}' for templating to avoid conflicts with angular templating.
    jinja_options = Flask.jinja_options.copy()
    jinja_options.update({
        'variable_start_string': '{[{',
        'variable_end_string': '}]}'
    })

app = JavadocSearchFlaskApplication(__name__, template_folder='../templates', static_folder='../static')


def init_logging():
    import logging
    import logging.config
    import os

    logging_config = str(os.path.dirname(os.path.realpath(__file__)) + '/../../logging.json')
    logging.config.dictConfig(json.load(open(logging_config)))


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
    if len(path) != 0:
        return '', 404
    return render_template('index.html')


@app.route('/classes', methods=['GET'])
def get_classes():
    encoded_base_url = request.args['baseUrl']
    base_url = urllib.parse.unquote(encoded_base_url)

    app.logger.debug("Getting classes: %s", base_url)

    site_adapter = SiteAdapter(base_url)
    try:
        all_classes_doc = site_adapter.retrieve_allclasses_frame()
    except URLError:
        return Response("Javadoc page not found", 404)

    scraper = JavadocScraper()
    classes = scraper.retrieve_all_classes(all_classes_doc)

    return json.dumps(classes)


@app.route('/relatives', methods=['GET'])
def get_hierarchy_classes():
    encoded_base_url = request.args['baseUrl']
    encoded_class_url = request.args['classUrl']
    base_url = urllib.parse.unquote(encoded_base_url)
    class_url = urllib.parse.unquote(encoded_class_url)

    app.logger.debug("Getting class relatives: %s", class_url)

    site_adapter = SiteAdapter(base_url)
    try:
        class_doc = site_adapter.retrieve_class_page(class_url)
    except URLError:
        return Response("Javadoc page not found", 404)

    scraper = JavadocScraper()
    classes = scraper.retrieve_hierarchy_classes(class_doc)

    return json.dumps(classes)


@app.route('/packages', methods=['GET'])
def get_packages():
    encoded_base_url = request.args['baseUrl']
    base_url = urllib.parse.unquote(encoded_base_url)

    app.logger.debug("Getting packages: %s", base_url)

    site_adapter = SiteAdapter(base_url)
    try:
        package_doc = site_adapter.retrieve_package_frame()
    except URLError:
        return Response("Javadoc page not found", 404)

    scraper = JavadocScraper()
    packages = scraper.retrieve_packages(package_doc)

    return json.dumps(packages)


@app.route('/miscMetadata', methods=['GET'])
def get_misc_metadata():
    encoded_base_url = request.args['baseUrl']
    base_url = urllib.parse.unquote(encoded_base_url)

    app.logger.debug("Getting miscellaneous metadata: %s", base_url)

    site_adapter = SiteAdapter(base_url)
    try:
        allclasses_doc = site_adapter.retrieve_allclasses_frame()
        overview_doc = site_adapter.retrieve_overview_frame()
    except URLError:
        return Response("Javadoc page not found", 404)

    scraper = JavadocScraper()
    version = scraper.get_misc_metadata(allclasses_doc, overview_doc)

    return json.dumps(version)


@app.route('/packagePageProxy', methods=['GET'])
def proxy_package_page():
    encoded_base_url = request.args['baseUrl']
    base_url = urllib.parse.unquote(encoded_base_url)

    encoded_package_relative_url = request.args['packageUrl']
    package_relative_url = urllib.parse.unquote(encoded_package_relative_url)

    package_url = urllib.parse.urljoin(base_url, package_relative_url)

    app.logger.debug("Proxying package page: %s", package_url)
    package_page_response = urllib.request.urlopen(package_url)

    return package_page_response.read()


init_logging()
if __name__ == '__main__':
    app.secret_key = 'gardnerdickson'  # TODO: change this
    app.run(debug=True)
