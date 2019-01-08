### NPM Commands
+ Develop: npm run dev
+ Compile CSS: npm run build:css
+ Build JS: npm run build:webpack
+ Build production: npm run build

### Build process
+ It will create a build folder with all the necessary files
+ Copy the content of build folder to the public folder on the server

### File structure
+ /app/js/server.js - Creating the local server when running npm run dev
+ /app/js/client.js - Index.js file, sets up the routes and requires the necessary files
+ /app/js/common/actions - Redux actions
+ /app/js/common/components - Custom made, reusuable modules
+ /app/js/common/containers - Each route has a subfolder within its action files (Add, Edit, List, View)
+ /app/js/common/reducers - Saves each api group type to the global store
+ /app/js/common/store - Creates the global store
+ /app/js/common/utils - Global, reusuable functions for api calls, validation, socket, etc.
