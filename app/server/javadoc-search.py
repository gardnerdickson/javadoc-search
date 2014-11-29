import urllib.parse as urlparse

from flask import Flask
from flask import request
from flask import jsonify
from flask import render_template
from flask import session

from scraper import JavadocScraper


class Flask_JavadocSearch(Flask):
    # Need to use something other than '{{' and '}}' for templating to avoid conflicts with angular templating.
    jinja_options = Flask.jinja_options.copy()
    jinja_options.update({
        'variable_start_string': '{[{',
        'variable_end_string': '}]}'
    })

app = Flask_JavadocSearch(__name__, template_folder='../templates', static_folder='../static')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/baseUrl', methods=['POST'])
def post_base_url():
    encoded_url = request.form['baseUrl']
    session['base_url'] = urlparse.unquote(encoded_url)

    return '', 200


@app.route('/classes', methods=['GET'])
def get_classes():
    scraper = JavadocScraper(session['base_url'])
    classes = scraper.retrieve_classes()

    return jsonify(classes)


@app.route('/relatives', methods=['GET'])
def get_hierarchy_classes():
    encoded_class_relative_url = request.args['classRelativeUrl']
    class_relative_url = urlparse.unquote(encoded_class_relative_url)

    scraper = JavadocScraper(session['base_url'])
    classes = scraper.retrieve_hierarchy_classes(class_relative_url)

    return jsonify(classes)


@app.route('/packages', methods=['GET'])
def get_packages():
    scraper = JavadocScraper(session['base_url'])
    packages = scraper.retrieve_packages()

    return jsonify(packages)


if __name__ == '__main__':
    app.secret_key = 'gardnerdickson' #TODO: change this
    app.run(debug=True)
