__author__ = 'Gardner'

import urllib.request as request
import urllib.parse as urlparse

import html5lib


class JavadocScraper:

    _CLASSES_PATH = '/allclasses-frame.html'
    _PACKAGES_PATH = '/overview-frame.html'

    _SUPER_CLASS_LABELS = (
        "All Superinterfaces:",
        "All Implemented Interfaces:",
        "Enclosing class:"
    )

    _SUB_CLASS_LABELS = (
        "All Known Implementing Classes:",
        "All Known Subinterfaces:",
        "Direct Known Subclasses:"
    )

    _IGNORED_LABELS = (
        "Enclosing class:",
        "Enclosing interface:"
    )

    def __init__(self, url):
        self._url = url

    def retrieve_classes(self):
        classes_doc = self._retrieve_response_as_doc(self._url + self._CLASSES_PATH)

        classes = {}
        class_links = classes_doc.findall('.//li/a')
        for class_link in class_links:
            class_type_and_package = class_link.attrib['title'].split(' in ')
            class_type = class_type_and_package[0]
            package = class_type_and_package[1]
            url = class_link.attrib['href']

            if class_type == 'interface':
                class_name = class_link.find('./').text
            else:
                class_name = class_link.text

            while class_name in classes:
                class_name += '#'

            classes[class_name] = {
                'package': package,
                'className': class_name,
                'classType': class_type,
                'url': url
            }

        return classes

    def retrieve_hierarchy_classes(self, class_relative_url):
        class_url = urlparse.urljoin(self._url, class_relative_url)
        class_page_doc = self._retrieve_response_as_doc(class_url)

        ancestors = {}
        descendants = {}

        description_root = class_page_doc.find(".//div[@class='description']/ul[@class='blockList']/li[@class='blockList']")
        for index, label in enumerate(description_root.findall('./dl/dt')):
            if label.text in self._SUPER_CLASS_LABELS:
                ancestors = self._find_class_links(description_root, index)

            elif label.text in self._SUB_CLASS_LABELS:
                descendants = self._find_class_links(description_root, index)

            elif label.text is not None and label.text not in self._IGNORED_LABELS:
                raise Exception("Unknown super or sub class label: ", label.text, ' at ', class_url)

        return {
            'ancestors': ancestors,
            'descendants': descendants
        }

    def retrieve_packages(self):
        packages = {}
        package_page_doc = self._retrieve_response_as_doc(self._url + self._PACKAGES_PATH)
        package_links = package_page_doc.findall('.//li/a')
        for package_link in package_links:
            package_name = package_link.text
            url = package_link.attrib['href']

            packages[package_name] = url

        return packages


    @staticmethod
    def _find_class_links(description_root, index):
        classes = {}
        class_links = description_root.findall('./dl[' + str(index + 1) + ']/dd/a')
        for class_link in class_links:
            class_name = class_link.text
            url = class_link.attrib['href']
            classes[class_name] = url

        return classes


    @staticmethod
    def _retrieve_response_as_doc(url):
        html_raw_response = request.urlopen(url)
        html_doc = html5lib.parse(html_raw_response, encoding=html_raw_response.info().get_content_charset(), namespaceHTMLElements=False)
        return html_doc
