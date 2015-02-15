#!/usr/bin/python
import sys
import logging
logging.basicConfig(stream=sys.stderr)
sys.path.insert(0,"/var/www/javadoc-search/app/server/")

from javadocsearch import app as application
print("Executing javadoc-search.wsgi")
application.secret_key = 'Add your secret key'
