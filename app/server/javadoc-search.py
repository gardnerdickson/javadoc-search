import urllib.parse as urlparse

from flask import Flask
from flask import request
from flask import jsonify
from flask import render_template

from scraper import JavadocScraper


app = Flask(__name__, template_folder='../templates', static_folder='../static')

_javadoc_scraper = JavadocScraper("http://docs.oracle.com/javase/7/docs/api")

@app.route('/')
def index():
    return render_template('index.html', message="Hello world!")


@app.route('/classes', methods=['GET'])
def get_classes():
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
