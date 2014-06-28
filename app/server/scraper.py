__author__ = 'Gardner'

import urllib.request as request
import html5lib


class JavadocScraper:

    def __init__(self, url):
        self._url_base = url
        self._classes_url = self._url_base + '/allclasses-frame.html'
        self._packages_url = self._url_base + '/overview-frame.html'

    def retrieve_classes(self):
        html_classes_response = request.urlopen(self._classes_url)
        html_classes_doc = html5lib.parse(html_classes_response, encoding=html_classes_response.info().get_content_charset(), namespaceHTMLElements=False)

        classes = {}
        class_links = html_classes_doc.findall('.//li/a')
        for class_link in class_links:
            class_type_and_package = class_link.attrib['title'].split(' in ')
            class_type = class_type_and_package[0]
            package = class_type_and_package[1]
            url = class_link.attrib['href']

            if class_type == 'interface':
                class_name = class_link.find('./').text
            else:
                class_name = class_link.text

            full_class_name = package + '.' + class_name

            classes[full_class_name] = {
                'package': package,
                'className': class_name,
                'classType': class_type,
                'url': url
            }

        return classes
