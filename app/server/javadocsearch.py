import urlparse
import urllib2
import json

from flask import Flask
from flask import request
from flask import Response
from flask import render_template
from flask import session

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
    import yaml

    logging.config.dictConfig(yaml.load(open('../../logging.conf')))


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
    if len(path) != 0:
        javadoc_resource = _retrieve_arbitrary_javadoc_resource(path)
        if javadoc_resource is not None:
            return Response(javadoc_resource.read(), mimetype=javadoc_resource.info().getheader('Content-Type'))
        return '', 404

    return render_template('index.html')


@app.route('/baseUrl', methods=['POST'])
def post_base_url():
    encoded_url = request.form['baseUrl']
    base_url = urllib2.unquote(encoded_url)
    session['base_url'] = base_url

    app.logger.info("Setting baseUrl to %s", base_url)

    return '', 200


@app.route('/classes', methods=['GET'])
def get_classes():
    app.logger.info("Getting classes")
    scraper = JavadocScraper(session['base_url'])
    classes = scraper.retrieve_all_classes()

    return json.dumps(classes)


@app.route('/relatives', methods=['GET'])
def get_hierarchy_classes():
    app.logger.info("Getting relatives")
    encoded_class_relative_url = request.args['classRelativeUrl']
    class_relative_url = urllib2.unquote(encoded_class_relative_url)

    scraper = JavadocScraper(session['base_url'])
    classes = scraper.retrieve_hierarchy_classes(class_relative_url)

    return json.dumps(classes)


@app.route('/packages', methods=['GET'])
def get_packages():
    app.logger.info("Getting packages")
    scraper = JavadocScraper(session['base_url'])
    packages = scraper.retrieve_packages()

    return json.dumps(packages)


@app.route('/javadocVersion', methods=['GET'])
def get_javadoc_version():
    scraper = JavadocScraper(session['base_url'])
    version = scraper.get_javadoc_version()

    return json.dumps(version)


@app.route('/packagePageProxy', methods=['GET'])
def proxy_package_page():
    encoded_package_relative_url = request.args['packageRelativeUrl']
    package_relative_url = urllib2.unquote(encoded_package_relative_url)
    package_url = urlparse.urljoin(session['base_url'], package_relative_url)

    package_page_response = urllib2.urlopen(package_url)
    return package_page_response.read()


def _retrieve_arbitrary_javadoc_resource(relative_url):
    if 'base_url' in session:
        resource_url = urlparse.urljoin(session['base_url'], relative_url)
        resource_response = urllib2.urlopen(resource_url)
        return resource_response
    return None


init_logging()
if __name__ == '__main__':
    app.secret_key = 'gardnerdickson'  # TODO: change this
    app.run(debug=True)