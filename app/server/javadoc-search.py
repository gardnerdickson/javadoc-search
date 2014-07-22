import urllib.parse as urlparse

from flask import Flask

from flask import request
from flask import jsonify
from flask import render_template

from scraper import JavadocScraper


class Flask_JavadocSearch(Flask):
    jinja_options = Flask.jinja_options.copy()
    jinja_options.update({
        'variable_start_string': '{[{',
        'variable_end_string': '}]}'
    })

app = Flask_JavadocSearch(__name__, template_folder='../templates', static_folder='../static')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/classes', methods=['GET'])
def get_classes():
    encoded_url = request.args['url']
    url = urlparse.unquote(encoded_url)

    classes = JavadocScraper.retrieve_classes(url)
    return jsonify(classes)


@app.route('/relatives', methods=['GET'])
def get_hierarchy_classes():
    encoded_url = request.args['url']
    url = urlparse.unquote(encoded_url)

    classes = JavadocScraper.retrieve_hierarchy_classes(url)
    return jsonify(classes)


@app.route('/packages', methods=['GET'])
def get_packages():
    encoded_url = request.args['url']
    url = urlparse.unquote(encoded_url)

    packages = JavadocScraper.retrieve_packages(url)
    return jsonify(packages)


if __name__ == '__main__':
    app.run(debug=True)
