from flask import Flask
from flask import request
from flask import jsonify
import urllib.parse as urlparse

from scraper import JavadocScraper

app = Flask(__name__)

_javadoc_scraper = JavadocScraper("http://docs.oracle.com/javase/7/docs/api")

@app.route('/')
def hello_world():
    return 'Hello World!'


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
