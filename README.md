# d3-tutorial
Tutorial for getting started with D3.js for data visualization by implementing a dashboard using the Yelp public dataset.

![alt-text](https://github.com/aravind-sundaresan/d3-tutorial/blob/master/media/demo.gif)

### Project Organization
```nohighlight
├── css                <- CSS files for styling the contents of the webpage
├── data               <- Files containing data for populating the dashboard
├── js                 <- JavaScript files containing vanilla JS and D3.js code.
├── media         
├── README.md          <- The top-level README for developers using this project.
├── index.html         <- HTML file that serves as the homepage of the website
```

### Setup

From GitHub:
```
git clone https://github.com/aravind-sundaresan/d3-tutorial.git
cd d3-tutorial
```

The instructions to run the application from the project folder are listed below.

### Instructions to launch the application

- Open the command prompt (Windows)/ terminal (macOS/ Linux)

- Inorder to launch the application, the user must run a simple local HTTP server from the project folder. We can use Python 
to run the server. 

  If the Python version installed in the system is 3.X, the server can be launched with the following command:
  ```
  python -m http.server 8000
  ```
  While the default port used for the server is 8000, the user can change the port number if needed.

  If the Python version is 2.X, the command to launch the server is:
  ```
  python -m SimpleHTTPServer
  ```

- Once the server is launched, open a web browser of your choice to access this URL: http://localhost:8000/ and the dashboard should be up and running. The port number would vary depending on the value passed while launching the server.
