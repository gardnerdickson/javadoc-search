import urllib.parse
import urllib.request
import urllib.error

from flask import Flask
from flask import request
from flask import Response
from flask import jsonify
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


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
    if len(path) != 0:
        javadoc_resource = _retrieve_arbitrary_javadoc_resource(path)
        if javadoc_resource is not None:
            return Response(javadoc_resource.read(), mimetype=javadoc_resource.getheader('Content-Type'))
        return '', 404

    return render_template('index.html')


@app.route('/baseUrl', methods=['POST'])
def post_base_url():
    encoded_url = request.form['baseUrl']
    session['base_url'] = urllib.parse.unquote(encoded_url)

    return '', 200


@app.route('/classes', methods=['GET'])
def get_classes():
    scraper = JavadocScraper(session['base_url'])
    classes = scraper.retrieve_classes()

    return jsonify(classes)


@app.route('/relatives', methods=['GET'])
def get_hierarchy_classes():
    encoded_class_relative_url = request.args['classRelativeUrl']
    class_relative_url = urllib.parse.unquote(encoded_class_relative_url)

    scraper = JavadocScraper(session['base_url'])
    classes = scraper.retrieve_hierarchy_classes(class_relative_url)

    return jsonify(classes)


@app.route('/packages', methods=['GET'])
def get_packages():
    scraper = JavadocScraper(session['base_url'])
    packages = scraper.retrieve_packages()

    return jsonify(packages)


@app.route('/packagePageProxy', methods=['GET'])
def proxy_package_page():
    encoded_package_relative_url = request.args['packageRelativeUrl']
    package_relative_url = urllib.parse.unquote(encoded_package_relative_url)
    package_url = urllib.parse.urljoin(session['base_url'], package_relative_url)

    package_page_response = urllib.request.urlopen(package_url)
    return package_page_response.read()


def _retrieve_arbitrary_javadoc_resource(relative_url):
    try:
        resource_url = urllib.parse.urljoin(session['base_url'], relative_url)
        resource_response = urllib.request.urlopen(resource_url)
        return resource_response
    except urllib.error.URLError:
        return None


if __name__ == '__main__':
    app.secret_key = 'gardnerdickson' #TODO: change this
    app.run(debug=True)
