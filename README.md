# phalconTool

This tool allows to manage project with Phalcon MVC Framework access on MYSQL.
#### Features :
- Create skeleton project application with default User controller using google connect and websocket client / server example
- User base database with social relation 
- Manage multi application/environment
- Generate models from Mysql database with column map and full relations
- Internal library Management
- Full Rest Api
- Websocket Client / Server
- SCRUD on the fly with models relations and validations
- Generate controller/action
- Generate js/less template

#### In progress
- Bdd migrations 
- Bower + Javascript libraries
- Cli support inline
- Documentation

## Installation

#### Requirement
- [Phalcon 3.0.x](https://phalconphp.com/fr/download)
- php >=5.4 (support php7)

using composer
```
{
    "require": {
        "v-cult/phalcon": "dev-master",
        "google/apiclient": "1.1.7"
    }
}
```

Create a phalcon symlink to application.php in your root project folder  
```
cd /var/www/project/
ln -s vendor/v-cult/phalcon/application.php ./phalcon
```
or in /usr/bin to be used globally
```
sudo ln -s /var/www/project/vendor/v-cult/phalcon/application.php /usr/bin/phalcon
```

## Quick start

For all commands, you can specify the environment and application with options --env= and --app=   
The default values are dev/frontend

### Create project
```
phalcon generate:project
```
It will create apps and public dir in the root project folder initialized with frontend application.  
The Document root of the server must be the public dir.  
By default api et scrud libraries are enbaled and the project is secured by google user connect so you need to create an google application, authorize google+ api and generate devKey, client_id and client_secret to set them inside the configuration file.  
The default action user/login redirect to the google user authentification to log in the application and redirect to the SCRUD index (in progress).

### Generate models
Before generate models, don't forget to modify the config.php in your app folder.
On generation, if the databse is empty, it will import the ones used for the User management.
```
phalcon generate:models
```
Models will be created from the database with column map and all relations.
By default scrud is no activated, you need to add in config.php inside librairies field api and scrud and add them to the private or public ressources.
You're now able to access to SCRUD action for all model, example for User :
```
http//localhost/scrud/User/read?id=1
http//localhost/scrud/User/create
http//localhost/scrud/User/search
```
You can merge all model which has one relation for example if you add UserProfil table like this :
```
http//localhost/scrud/User UserProfil/read?id=1
http//localhost/scrud/User UserProfil/create
http//localhost/scrud/User UserProfil/search
```
So you can set as model as hasOne relations exists.

### Generate controllers and actions
You can specify one or more action associated with the controller, by default the views associated with the actions are created but the option --no_view=true block this.
```
phalcon generate:controller home index,test
```
It will create the home controller with the index et test actions with their views.

### Generate tasks
As the same way as the controllers, you can create task with all action in the same time
```
phalcon generate:task video convert,purge
```
Then this task will be accessible like others
```
phalcon video:purge
```

### Generate Less/Css and Js
The asset manager set default collection css and js, a main css file that should be generated by less and 3 js files, jquery, a class on the module/ation and main that initiate it.
These collection are include inside the default layout.
For each module action, you can generate css/less and js file on the same way as the controller :
```
phalcon generate:css home index,test
phalcon generate:js home index,test
```
It will copy the type template in public/[type]/[moduleName]/[actionName] or in the [moduleName] root folder for the index action.
For the css minifier, I use sublime with Less2Css that compile and minify less file on save but there a command to do that using lessc node mdole (sudo npm install lessc -g)
```
phalcon generate:less home
phalcon generate:less home index,test
```
The first command will get all main.less inside the home module and compile/minify them.
The second command will only do the job for the actions listed

### Generate Js build
You can generate a javascript build in one file for each controller/action.
```
phalcon generate:build home index,test // for action index and test of the home controller
phalcon generate:build home // for each action of home controller
phalcon generate:build // for each controller and action
```
Don't forget to specify the environnement and application with --app= --env= in dev and preprod environnement the build files aren't uglified.  
So it generate a build.js file in the action directory, it will be automaticaly used in the production environnement.

### Websocket
There's a websocket server with room and users management which could be start on command line :
```
phalcon server:start
```
A websocket Javascript library is available to work with, accessible in the bower_components, it just recreate user events management and can be used like this :
```
WebsocketHelper.getInstance(loadedWebsocket);

function loadedWebsocket(instance){
    var socket = instance;
    socket.connect("ws://"+document.domain+":9000/myRoom", {"id":"123456"}, connected);
    function connected(){
        that.socket.addEvents({
            "test": test,
            "userConnected": userConnected,
            "userDisconnected": userDisconnected,
            "connected": ready
        });
        that.socket.send("test", {yo:"yo"});
        

        function test(data){
            console.log("receive test event", data);
        }

        function userConnected(data){
            console.log("new user connected", data);
        }

        function userDisconnected(data){
            console.log("user leave room", data);
        }

        function ready(data){
            console.log("connected to room", data);
        }
    }
}
```

### Translation
Inside each view you can use $t->_ or $t->__ to get translation from key inside array from folder messages. The language used corresponding to the browser language using en by default.
$t->_ is used to acces direct key value from the array and $t->__ is more specific for the same key but inside the controller / action context.  
Functions are from the controller so inside the action use $this->__ and $this->_ to access to the translations.
```
view inside controller user action login
$t->_('hi') // $messages['hi']
$t->__('hi') // $mesages['user_login_hi']
```
### Migration
The migration system is based on annotations in the models and report the difference from the database.
```
phalcon generate:migration
```
Once is done, you can run the migration 
```
phalcon migration:run
```
On run, it will execute all the migration from the current version (env_version) to the last.
Then you can rollback one by one
```
phalcon migration:rollback
```
or rollback until a specific version
```
phalcon migration:rollback 1
```
Actually the system can't handle foreign keys, indexes, primary, unique, and options, i'm working on it.

### Make a release and send to env server
There's a task made for, you just need to specify the environnement and tag number.  
The task will use the master branch to create the tag and copy all the content of the root folder to the ssh server set in the config.
```
phalcon mep prod 0.0.1
```