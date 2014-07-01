__author__ = 'Gardner'

import urllib.request as request
import html5lib


class JavadocScraper:

    _CLASSES_PATH = '/allclasses-frame.html'
    _PACKAGES_PATH = '/overview-frame.html'

    @staticmethod
    def retrieve_classes(base_url):
        classes_doc = JavadocScraper._retrieve_response_as_doc(base_url + JavadocScraper._CLASSES_PATH)

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

            full_class_name = package + '.' + class_name

            classes[full_class_name] = {
                'package': package,
                'className': class_name,
                'classType': class_type,
                'url': url
            }

        return classes


    @staticmethod
    def retrieve_hierarchy_classes(base_url):
        class_page_doc = JavadocScraper._retrieve_response_as_doc(base_url)

        super_classes = {}
        sub_classes = {}

        description_root = class_page_doc.find(".//div[@class='description']/ul[@class='blockList']/li[@class='blockList']")
        for index, label in enumerate(description_root.findall('./dl/dt')):
            if label.text == "All superinterfaces:":
                super_classes = JavadocScraper._find_class_links(description_root, index)

            elif label.text == "All Known Implementing Classes:":
                sub_classes = JavadocScraper._find_class_links(description_root, index)

        return {
            'superClasses': super_classes,
            'subClasses': sub_classes
        }


    @staticmethod
    def retrieve_packages(base_url):
        packages = {}
        package_page_doc = JavadocScraper._retrieve_response_as_doc(base_url + JavadocScraper._PACKAGES_PATH)
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
