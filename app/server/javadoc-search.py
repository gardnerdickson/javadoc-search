import urllib.parse as urlparse

from flask import Flask
from flask import request
from flask import jsonify
from flask import render_template

from scraper import JavadocScraper

class CustomFlask(Flask):
    jinja_options = Flask.jinja_options.copy()
    jinja_options.update({
        'variable_start_string': '{[{',
        'variable_end_string': '}]}'
    })

app = CustomFlask(__name__, template_folder='../templates', static_folder='../static')


_javadoc_scraper = None

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/classes', methods=['GET'])
def get_classes():
    encoded_url = request.args['url']
    url = urlparse.unquote(encoded_url)
    _javadoc_scraper = JavadocScraper(url)
    classes = _javadoc_scraper.retrieve_classes()
    return jsonify(classes)


@app.route('/relatives', methods=['GET'])
def get_hierarchy_classes():
    encoded_url = request.args['url']
    url = urlparse.unquote(encoded_url)

    classes = _javadoc_scraper.retrieve_hierarchy_classes(url)
    return jsonify(classes)


if __name__ == '__main__':
    app.run(debug=True)
