# Option 22

Option 22 is the API for the [MyProfile](https://github.com/gotnoskillz412/myProfile) web application. Option 22 contains endpoints for authentication, profile settings, and goal tracking.

## Setup 

`git clone https://github.com/gotnoskillz412/option22.git`

or with ssh

`git clone git@github.com:gotnoskillz412/option22.git`

Once you've cloned the repo, navigate to it and run an `npm install`.

Now build the project with `gulp build`.

This API uses the Mongoose package to communicate with a mongo db instance.  You will need to install [MongoDb](https://www.mongodb.com/download-center#atlas) and set it up before Option 22 can run.

Once the project is built, you'll need to do once more thing in order for the api to work.  Option 22 requires several environment variables to be set.  

### Environment Variable (MAC OS)
`export PORT={{YourPortHere}}` // THe port you wish Option 22 to run on

`export MONGODB_URI={{YourMongoDbUriHere` // The address of your MongoDB instance

`export MY_SECRET={{YourSecret}}` // This is the secret that will be used when generating your JWT tokens for authentication

`export BASE_WEB={{LocationOfSiteAccessingThisApi}}` // Option 22 uses CORS to prevent other sites from accessing your API

`export SERVICE_EMAIL={{YourEmailHere}}` // Your GMAIL address for being contacted

`export EMAIL_PASSWORD={{YourEmailPasswordHere}}` // The password for the gmail account you've provided.

### Serving the app
After installing the packages, building the app with gulp, and adding the necessary environment variables, simply

`gulp serve`

## Testing
To test the application, run the command

`npm test`

Make sure your mongo instance is up and running, since this command will run both unit tests and end to end tests.  If you want to see the coverage report, check it our under option22/coverage/lcov-report/index.html.

## App Details

Below are some explanations of what Option 22 can do.

### Authentication

The authentication for Option 22 uses a basic Json Web Token approach for authentication.  When registering a new account or when logging in, the token is generated using the npm package [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) and the secret you provided as an environment variable.  The token is valid for 1 hour.  Each time a secure endpoint is accessed, the security middleware will verify the token, **looking for a Bearer token in the authorization header**, as well as its expiration.  If an invalid or expired token is provided, a 401 response will be sent back.

If the logout function is accessed before the token expires, that token will be held in a blacklist until that token's expiration.

Passwords are never stored using this app.  Instead, they are salted and hashed before being stored.  Right now there is no system for recovering a lost password, but there is an endpoint to update passwords.

### Email
The email route connects to whatever gmail address is provided in the environment variables.  **NOTE - In order to receive emails from this app, you will need to set up your gmail account to accept connections from unsafe apps [here](https://myaccount.google.com/lesssecureapps?pli=1)**  In the email sections, you can choose how you want the email to arrive.

### Goals
Option 22 was built as the API for the MyProfile goal tracking application.  These endpoints all pertain to updating and creating new goals.  

### Index 
This endpoint can be used as a heartbeat endpoint to verify the app is up and running.

### Profile
This route contains the endpoints for updating profile information, such as name, description, and likes.

## Finally
This app is open source, and you may feel free to fork the repo and try it for yourself.  Feel free to make any changes you like.  The idea is that this app gives you an idea on how to set up the backend portion of a MEAN stack.  Checkout the MyProfile app in my github to find the Angular portion.

