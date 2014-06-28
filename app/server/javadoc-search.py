from flask import Flask
from flask import jsonify
from scraper import JavadocScraper

app = Flask(__name__)


@app.route('/')
def hello_world():
    return 'Hello World!'


@app.route('/classes', methods=['GET'])
def get_classes():
    javadoc_scraper = JavadocScraper("http://docs.oracle.com/javase/7/docs/api")
    classes = javadoc_scraper.retrieve_classes()
    return jsonify(classes)

if __name__ == '__main__':
    app.run()
