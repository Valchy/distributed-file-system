# distributed-file-system

Run the app using `docker-compose up --build`  
The navigate to `http://localhost:9000`

There you will see the simple client I have built.  
You can add files, delete files and view files.

As well as that there is an API with the following endpoints:

-   POST /store
-   GET /read/:filename
-   GET /delete/:filename
-   GET /getsize/:filename
-   GET /files
