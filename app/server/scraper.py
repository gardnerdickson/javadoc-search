
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
            class_links_xpath = './/table/tbody/tr/td/font/a'

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


    def retrieve_packages(self, package_page_doc):
        packages = []
        javadoc_version = self._get_javadoc_version_from_packages_page(package_page_doc)
        if javadoc_version is JavadocVersion.New:
            package_links = package_page_doc.findall('.//li/a')
        else:
            package_links = package_page_doc.findall('.//table/tbody/tr/td/p/font/a')

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
                ancestors.append(JavadocScraper._parse_relative_link(descendant_link))

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
            'qualifiedClassName': class_type_and_package[0] + '.' + class_type_and_package[1],
            'url': url
        }


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
