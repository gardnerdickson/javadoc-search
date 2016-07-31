
import urllib.request
import urllib.parse
import html5lib


class SiteAdapter:

    _CLASSES_PATH = 'allclasses-frame.html'
    _PACKAGES_PATH = 'overview-frame.html'
    _SUMMARY_PATH = 'overview-summary.html'

    _base_url = None

    def __init__(self, base_url):
        self._base_url = base_url

    def retrieve_overview_frame(self):
        overview_url = str(self._base_url + self._SUMMARY_PATH)
        return self._retrieve_page_as_doc(overview_url)

    def retrieve_allclasses_frame(self):
        classes_url = str(self._base_url + self._CLASSES_PATH)
        return self._retrieve_page_as_doc(classes_url)

    def retrieve_package_frame(self):
        package_url = str(self._base_url + self._PACKAGES_PATH)
        return self._retrieve_page_as_doc(package_url)

    def retrieve_class_page(self, class_url):
        class_url = str(self._base_url + class_url)
        return self._retrieve_page_as_doc(class_url)

    @staticmethod
    def _retrieve_page_as_doc(url):
        html_raw_response = urllib.request.urlopen(url)
        html_doc = html5lib.parse(html_raw_response, encoding=html_raw_response.info().get_content_charset(), namespaceHTMLElements=False)
        return html_doc

