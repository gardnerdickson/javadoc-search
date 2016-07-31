import urllib.request
import urllib.parse
import json

from flask import Flask
from flask import request
from flask import Response
from flask import render_template

from scraper import JavadocScraper


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
    scraper = JavadocScraper()
    classes = scraper.retrieve_all_classes(base_url)

    return json.dumps(classes)


@app.route('/relatives', methods=['GET'])
def get_hierarchy_classes():
    encoded_class_url = request.args['classUrl']
    class_url = urllib.parse.unquote(encoded_class_url)

    app.logger.debug("Getting class relatives: %s", class_url)
    scraper = JavadocScraper()
    classes = scraper.retrieve_hierarchy_classes(class_url)

    return json.dumps(classes)


@app.route('/packages', methods=['GET'])
def get_packages():
    encoded_base_url = request.args['baseUrl']
    base_url = urllib.parse.unquote(encoded_base_url)

    app.logger.debug("Getting packages: %s", base_url)
    scraper = JavadocScraper()
    packages = scraper.retrieve_packages(base_url)

    return json.dumps(packages)


@app.route('/miscMetadata', methods=['GET'])
def get_misc_metadata():
    encoded_base_url = request.args['baseUrl']
    base_url = urllib.parse.unquote(encoded_base_url)

    app.logger.debug("Getting miscellaneous metadata: %s", base_url)
    scraper = JavadocScraper()
    version = scraper.get_misc_metadata(base_url)

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


def _retrieve_arbitrary_javadoc_resource(resource_url):
    app.logger.debug("Getting arbitrary javadoc resource: %s", resource_url)
    resource_response = urllib.request.urlopen(resource_url)
    return resource_response


init_logging()
if __name__ == '__main__':
    app.secret_key = 'gardnerdickson'  # TODO: change this
    app.run(debug=True)
