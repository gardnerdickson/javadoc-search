# Javadoc Search

Javadoc Search adds search functionality to any live Javadoc site.

Note: As of Java 9. Standard Javadoc sites are now generated with search functionality, rendering this project somewhat irrelevant. However, instructions are provided below to set up and run the service locally.

https://user-images.githubusercontent.com/7308112/220993635-d7e96145-1c6f-4f8b-956e-47f2faf9d73d.mp4

## Development

Backend
- Requires Python 3.4+
- Install Python dependencies: `pip install -r requirements.txt`

Frontend
- Requires [Bower](http://bower.io)
- Install the frontend dependencies: `bower install`

## Run Locally

- Run the flask app: `flask --app app.server.javadocsearch run`
- In a web browser, navigate to `localhost:5000`
- Enter a URL to an older Javadoc site (generated with Java 8 or older). Ex: https://docs.oracle.com/javase/8/docs/api/
- Type in the search box to start filtering classes
  - Expand a search result by clicking the arrow to reveal superclasses, subclasses, constructors and methods of that class
- Click on the class, superclass, subclass, constructor or method to navigate to that entity in the documentation
