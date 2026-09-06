# Job Portal Backend

## User Roles

There are three types of users:

### Job Seeker

-   Register and login
-   View available jobs
-   View and update profile
-   Apply for jobs
-   View own applications

### Employer

-   Register and login
-   Create job posts
-   View own jobs
-   Update and delete own jobs
-   View applications received for jobs
-   Update application status

### Admin

-   View users
-   View individual user details
-   Activate or deactivate users
-   Delete users
-   View jobs
-   View individual job details
-   Delete jobs



## Installation

First open the project folder in the terminal.

Install the required packages separately if they are not already
installed:

``` bash
npm install express
npm install mongoose
npm install dotenv
npm install cookie-parser
npm install bcryptjs
npm install jsonwebtoken
```

For development, Nodemon can be installed with:
npm install -g nodemon


## Environment Variables

Create a `.env` file in the main project folder.




## Running the Project

Make sure MongoDB is running first.


nodemon server.js

If everything is working correctly, the terminal should show:
 text:
DB Connected
server listening on 4000..


The base URL is:

http://localhost:4000


