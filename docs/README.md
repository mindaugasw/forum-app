# Forum App

### Introduction

Goal of the project is to create an ordinary discussion forum, for learning purposes. The forum allows users to discuss any topics with other users, by browsing threads and creating their own, leaving comments on any existing threads. Users can vote on others' threads or comments and express their opinion about that content.

**Note: frontend app is still under development. Backend API, however, is already mostly finished and fully functional.**

Deployed app: [forum--app.herokuapp.com](https://forum--app.herokuapp.com/)  
API documentation: [getpostman.com/view/2542393/TVRg6V1E](https://documenter.getpostman.com/view/2542393/TVRg6V1E)


### Features
- All users (including guests) can see all content in the forum: threads, comments on them, their vote score, detailed info about any user.
- Guest users can create an account on the system and log in.
- Logged in users can create content: write new threads and comments, vote on other content.
- Admins have the possibility to manage users: see their list, change their role, or delete their account.

### Technologies
The project is a single-page application, consisting of backend API and frontend app. Technologies used in the project:

Backend: 
- PHP 7
- Symfony 5
- MariaDB

Frontend:
- React
- React router
- Redux
- Bootstrap

### Requirements
Required software to run the application.
- XAMPP stack
- PHP 7.4
- Composer
- Symfony CLI. Alternatively use `php bin/console ...` commands instead of `symfony console ...`

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

Ensure HTTPS connection (needed for JWT authentication). Can be done using ` symfony server:ca:install`.  
`yarn install`  
`yarn build` (or `yarn dev-server-https` for automatic frontend rebuilding).  
`symfony server:start` and access app at [https://localhost:8000](https://localhost:8000/).

