# Forum App

### Introduction

Goal of the project is to create a general-purpose discussion forum, for learning purposes. The forum allows users to discuss any topics with other users, by browsing threads and creating their own, leaving comments on any existing threads. Users can vote on others' threads or comments and express their opinion about that content.

Deployed app: [forum--app.herokuapp.com](https://forum--app.herokuapp.com/)  
API documentation: [getpostman.com/view/2542393/TVRg6V1E](https://documenter.getpostman.com/view/2542393/TVRg6V1E)

### Functional requirements
- All users (including guests) can see all content in the forum: threads, comments on them, their vote score, detailed info about any user.
- Guest users can create an account on the system and log in.
- Logged in users can create content: write new threads and comments, vote on other content.
- Admins have the possibility to manage other users (change their role or delete account), as well as other user's created content (edit or delete their threads and comments).

### Project highlights
- App is completely Single Page Application
- Upvotes/downvotes system
- Roles and permissions system
- JWT authentication, with automatic token refresh
- Full CRUD of 3 entities: threads, comments, users
- All inputs are validated, both on frontend and backend
- Real-time forms validation and feedback
- Responsive design

### Technologies

Backend: 
- PHP 7
- Symfony 5
- MariaDB

Frontend:
- React
- Redux
- Bootstrap

### Requirements
Required software to run backend server:
- Apache/Nginx
- PHP 7.4
- MariaDB
- Composer

For building frontend code:
- Node.js
- npm
- Yarn


### Installation
Below are instructions for installing app on **dev** environment.  

```
git clone git@github.com:mindaugasw/forum-app.git
cd forum-app
composer install
```

Set DB connection URL (`DATABASE_URL` in [.env](/.env)).

```
symfony console doctrine:database:create
symfony console doctrine:migrations:migrate
symfony console doctrine:fixtures:load
```

Ensure HTTPS connection (needed for JWT authentication). Can be done using `symfony server:ca:install`.  
`yarn install`  
`yarn build` (or `yarn dev-server-https` for hot-reloading).  
`symfony server:start` and access app at [https://localhost:8000](https://localhost:8000/).
