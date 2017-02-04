import urllib.parse
from enum import Enum


class JavadocVersion(Enum):
    Old = 1
    New = 2


class JavadocScraper:

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
        "Enclosing interface:",
        "Functional Interface:"
    )


    def retrieve_all_classes(self, allclasses_doc):
        javadoc_version = self._get_javadoc_version_from_allclasses_page(allclasses_doc)

        if javadoc_version is JavadocVersion.New:
            class_links_xpath = './/li/a'
        else:
            class_links_xpath = './/table/tr/td/font/a'

        classes = []
        class_links = allclasses_doc.findall(class_links_xpath)
        for class_link in class_links:
            class_type_and_package = class_link.attrib['title'].split(' in ')
            class_type = class_type_and_package[0]
            package = class_type_and_package[1]
            url = class_link.attrib['href']

            if class_type == 'interface':
                class_name = class_link.find('./').text
            else:
                class_name = class_link.text

            classes.append({
                'package': package,
                'className': class_name,
                'classType': class_type,
                'qualifiedClassName': package + '.' + class_name,
                'url': url
            })

        return classes


    def retrieve_hierarchy_classes(self, class_page_doc):
        javadoc_version = self._get_javadoc_version_from_class_page(class_page_doc)
        if javadoc_version is JavadocVersion.New:
            return self._find_class_links_new(class_page_doc)
        else:
            return self._find_class_links_old(class_page_doc)


    def retrieve_class_constructors(self, class_page_doc):

        path = ".//a[@name='{0}']"

        constructor_summary = class_page_doc.find(path.format('constructor_summary'))
        if constructor_summary is None:
            constructor_summary = class_page_doc.find(path.format('constructor.summary'))

        if constructor_summary is None:
            return dict()

        constructor_rows = None
        element_path = None
        version = JavadocScraper._get_javadoc_version_from_class_page(class_page_doc)
        if version is JavadocVersion.Old:
            constructor_table = constructor_summary.getnext() or constructor_summary.getparent().getnext()
            constructor_rows = constructor_table.findall(".//tr")
            element_path = "td/code//a"
        elif version is JavadocVersion.New:
            constructor_rows = constructor_summary.getparent().findall(".//tr")
            element_path = "td[@class='colOne']//a"

        constructors = []
        for row in constructor_rows:
            element = row.find(element_path)
            if element is not None:
                constructor_url = element.get('href')
                constructor_signature = urllib.parse.unquote(constructor_url.split("#")[1])
                if version is JavadocVersion.New:
                    constructor_signature = JavadocScraper._fix_method_signature(constructor_signature)

                constructors.append({
                    'signature': constructor_signature,
                    'url': constructor_url
                })
        return constructors


    def retrieve_class_methods(self, class_page_doc):

        path = ".//a[@name='{0}']"

        method_summary = class_page_doc.find(path.format('method_summary'))
        if method_summary is None:
            method_summary = class_page_doc.find(path.format('method.summary'))

        if method_summary is None:
            return dict()

        method_rows = None
        return_type_path = None
        signature_path = None
        version = JavadocScraper._get_javadoc_version_from_class_page(class_page_doc)
        if version is JavadocVersion.Old:
            method_rows = method_summary.getnext().findall('.//tr')
            return_type_path = "td[1]//code"
            signature_path = "td[2]//code//a"
        elif version is JavadocVersion.New:
            method_rows = method_summary.getparent().findall('.//tr')
            return_type_path = "td[@class='colFirst']/code"
            signature_path = "td[@class='colLast']//a"

        methods = []
        for row in method_rows:
            return_type_element = row.find(return_type_path)
            if return_type_element is not None:
                type_link = return_type_element.find('a')
                if type_link is not None:
                    return_type = type_link.text
                else:
                    return_type = return_type_element.text

                method_signature_element = row.find(signature_path)
                if method_signature_element is None:
                    continue
                method_url = method_signature_element.get('href')
                method_signature = urllib.parse.unquote(method_url.split("#")[1])
                if version is JavadocVersion.New:
                    method_signature = JavadocScraper._fix_method_signature(method_signature)
                
                methods.append({
                    'signature': method_signature.strip(),
                    'returnType': return_type.strip(),
                    'url': method_url
                })

        return methods


    def retrieve_packages(self, package_page_doc):
        packages = []
        javadoc_version = self._get_javadoc_version_from_packages_page(package_page_doc)
        if javadoc_version is JavadocVersion.New:
            package_links = package_page_doc.findall('.//li/a')
        else:
            package_links = package_page_doc.findall('.//table/tr/td/p/font/a')

        for package_link in package_links:
            package_name = package_link.text
            url = package_link.attrib['href']

            packages.append({
                'packageName': package_name,
                'url': url
            })

        return packages


    def get_misc_metadata(self, allclasses_doc, overview_doc):
        javadoc_version = self._get_javadoc_version_from_allclasses_page(allclasses_doc)
        javadoc_title = self._get_javadoc_title(overview_doc)
        return {
            'title': javadoc_title,
            'version': javadoc_version.name
        }


    @staticmethod
    def _find_class_links_new(class_page_doc):
        ancestors = []
        descendants = []

        description_root = class_page_doc.find(".//div[@class='description']/ul[@class='blockList']/li[@class='blockList']")
        for index, label in enumerate(description_root.findall('./dl/dt')):
            if label.text in JavadocScraper._SUPER_CLASS_LABELS:
                ancestor_links = description_root.findall('./dl[' + str(index + 1) + ']/dd/a')
                for ancestor_link in ancestor_links:
                    ancestors.append(JavadocScraper._parse_relative_link(ancestor_link))

            elif label.text in JavadocScraper._SUB_CLASS_LABELS:
                descendant_links = description_root.findall('./dl[' + str(index + 1) + ']/dd/a')
                for descendant_link in descendant_links:
                    descendants.append(JavadocScraper._parse_relative_link(descendant_link))

            elif label.text is not None and label.text not in JavadocScraper._IGNORED_LABELS:
                raise Exception("Unknown super or sub class label: ", label.text)

        return {
            'ancestors': ancestors,
            'descendants': descendants
        }


    @staticmethod
    def _find_class_links_old(class_page_doc):
        ancestors = []
        descendants = []

        element = class_page_doc.findall('.//dl')
        super_class_label = element[0].find('.//b').text
        sub_class_label = element[1].find('.//b').text

        if super_class_label in JavadocScraper._SUPER_CLASS_LABELS:
            ancestor_links = element[0].findall('.//dd/a')
            for ancestor_link in ancestor_links:
                ancestors.append(JavadocScraper._parse_relative_link(ancestor_link))

        if sub_class_label in JavadocScraper._SUB_CLASS_LABELS:
            descendant_links = element[1].findall('.//dd/a')
            for descendant_link in descendant_links:
                descendants.append(JavadocScraper._parse_relative_link(descendant_link))

        return {
            'ancestors': ancestors,
            'descendants': descendants
        }

    @staticmethod
    def _parse_relative_link(relative_link):
        class_type_and_package = relative_link.attrib['title'].split(' in ')
        class_name = relative_link.text
        url = relative_link.attrib['href']
        return{
            'className': class_name,
            'classType': class_type_and_package[0],
            'package': class_type_and_package[1],
            'qualifiedClassName': class_type_and_package[1] + '.' + class_name,
            'url': url
        }


    @staticmethod
    def _get_javadoc_title(summary_doc):
        title = summary_doc.find(".//title").text.strip()
        return title


    @staticmethod
    def _get_javadoc_version_from_allclasses_page(allclasses_doc):
        index_container_div = allclasses_doc.find(".//div[@class='indexContainer']")
        if index_container_div is not None:
            return JavadocVersion.New
        else:
            return JavadocVersion.Old


    @staticmethod
    def _get_javadoc_version_from_class_page(class_doc):
        content_container_div = class_doc.find(".//div[@class='contentContainer']")
        if content_container_div is not None:
            return JavadocVersion.New
        else:
            return JavadocVersion.Old


    @staticmethod
    def _get_javadoc_version_from_packages_page(package_doc):
        index_container_div = package_doc.find(".//div[@class='indexContainer']")
        if index_container_div is not None:
            return JavadocVersion.New
        else:
            return JavadocVersion.Old


    @staticmethod
    def _fix_method_signature(signature):
        if '-' not in signature:
            return signature

        sig_list = list(signature)
        set_open_bracket = False

        index = 0
        while index < len(sig_list):
            char = sig_list[index]
            if char is '-':
                if not set_open_bracket:
                    sig_list[index] = '('
                    set_open_bracket = True
                elif index == len(sig_list) - 1:
                    sig_list[index] = ')'
                else:
                    sig_list[index] = ','
                    index += 1
                    sig_list.insert(index, ' ')

            if index < len(sig_list) - 1:
                if "".join(sig_list[index:index + 2]) == ':A':
                    sig_list[index] = '['
                    sig_list[index + 1] = ']'

            index += 1

        return "".join(sig_list)

