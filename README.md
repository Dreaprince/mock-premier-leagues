<p align="center">
  <a href="http://nodejs.org/" target="blank"><img src="https://nodejs.org/static/images/logos/nodejs-new-pantone-black.svg" width="120" alt="Node.js Logo" /></a>
</p>

<p align="center">Mock Premier League API for managing teams, fixtures, and user accounts. Built with Node.js, TypeScript, MongoDB, Redis, and Docker for authentication, caching, and rate-limiting functionalities.</p>
<p align="center">
<a href="https://www.npmjs.com/~npm" target="_blank"><img src="https://img.shields.io/npm/v/express.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~npm" target="_blank"><img src="https://img.shields.io/npm/l/express.svg" alt="Package License" /></a>
<a href="https://circleci.com/gh/your-repo/mock-premier-league" target="_blank"><img src="https://img.shields.io/circleci/build/github/your-repo/mock-premier-league/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/your-repo/mock-premier-league?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/your-repo/mock-premier-league/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://twitter.com/your-twitter-handle" target="_blank"><img src="https://img.shields.io/twitter/follow/your-twitter-handle.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>

## Description

**Mock Premier League API Documentation**

The Mock Premier League API provides functionality for managing teams, fixtures, and user accounts in a fictional football league system. It includes user authentication, role-based access control, fixture management, Redis-based caching, and rate-limiting to manage user requests. The API is designed for both Admin and User roles, with varying permissions depending on the role.

## Technologies Used

- **Node.js** with **TypeScript**
- **Express.js** for API routing
- **MongoDB** with **Mongoose**
- **Redis** for caching and session management
- **JWT** for user authentication
- **Docker** for containerization
- **Jest** for unit and integration testing
- **Postman** for API documentation and testing
- **Rate-limiting** middleware to prevent abuse
- **Web caching** with Redis to store frequently accessed data

---

## User Types

### Admin:
- Can manage teams and fixtures.
- Can add, remove, edit, and view fixtures.
- Can generate unique links for fixtures.
- Can update fixture scores.
- Can view all users in the system.

### Users:
- Can view teams, completed, pending, and ongoing fixtures.
- Can search for fixtures and teams.

### Public:
- Can search for fixtures and teams.

---

## Authentication & Authorization

The API uses JWT for authentication and Bearer tokens for secure access. Different roles (admin and user) determine what actions a user can perform.

### Authentication Endpoints

#### Signup - `POST /auth/signup`
Creates a new admin or user account.

```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "fullname": "John Doe",
  "role": "admin" // or "user"
}




Response:

```json
{
      "statusCode": "00",
      "message": "Signup successful",
      "data": {
        "user": {
          "_id": "userId",
          "email": "user@example.com",
          "fullname": "John Doe",
          "role": "user"
        },
        "accessToken": "JWT_TOKEN"
      }
}

#### Login - `POST /auth/login`
Logs in a user and returns an access token.

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}

Response:

```json
{
  "statusCode": "00",
  "message": "Login successful",
  "data": {
      "user": {
        "_id": "userId",
        "email": "user@example.com",
        "fullname": "John Doe",
        "role": "user"
      },
      "accessToken": "JWT_TOKEN"
    }
}

#### Get All Users (Admin Only) - GET /auth/users
This endpoint allows admins to retrieve all users in the system.

  Response:

```json
{
  "statusCode": "00",
  "message": "Users retrieved successfully",
  "data": [
    {
      "_id": "userId1",
      "email": "user1@example.com",
      "fullname": "John Doe",
      "role": "user"
    },
    {
      "_id": "userId2",
      "email": "user2@example.com",
      "fullname": "Jane Smith",
      "role": "admin"
    }
  ]
}


### Team Management Endpoints (Admin Only)
Add Team - POST /teams

Create a new team.

    Request Body:

```json
{
  "name": "Liverpool"
}

Response:

```json
    {
      "message": "Team created successfully",
      "data": {
        "_id": "teamId",
        "name": "Liverpool"
      }
    }

#### Get All Teams - GET /teams
Returns a list of all teams.

Response:

```json
[
  {
    "_id": "teamId",
    "name": "Liverpool"
  }
]

#### Get Team by ID - GET /teams/:id
Get details of a specific team by ID.

Response:

```json
{
  "_id": "teamId",
  "name": "Liverpool"
}

#### Edit Team - `PUT /teams/:id`
Update team details.

    Request Body:


```json
{
  "name": "Updated Liverpool"
}

Response:

```json
{
  "_id": "teamId",
  "name": "Updated Liverpool"
}

#### Remove Team - `DELETE /teams/:id`
Delete a team.

Response:

```json
{
  "message": "Team deleted successfully"
}


Fixture Management Endpoints (Admin Only)

Fixtures are automatically managed based on the date of the match. The status is dynamically calculated.
Fixture Status Calculation

Fixture status is dynamically calculated:

    Pending: If the match date is in the future (date > Date.now()), the status is pending.
    Ongoing: If the match date is in the past but started within the last 110 minutes, the status is ongoing.
    Completed: If the match started more than 110 minutes ago, the status is completed.

#### Add Fixture - `POST /fixtures/`
Admins can create a new fixture. Past dates are not allowed.

    Request Body:

```json
{
  "homeTeamId": "homeTeamObjectId",
  "awayTeamId": "awayTeamObjectId",
  "date": "2024-10-25T15:30:00"
}

Response:

```json
{
      "message": "Fixture created successfully",
      "data": {
        "homeTeam": "homeTeamObjectId",
        "awayTeam": "awayTeamObjectId",
        "date": "2024-10-25T15:30:00",
        "status": "pending",
        "link": "fixture-unique-link"
      }
}

#### Remove Fixture - `DELETE /fixtures/:id`
Admins can delete a fixture.

    Response:

```json
{
      "message": "Fixture deleted successfully"
}

#### Edit Fixture - `PUT /fixtures/:id`
Update fixture details. Past dates cannot be set.

    Request Body:

```json
{
  "homeTeamId": "updatedHomeTeamObjectId",
  "awayTeamId": "updatedAwayTeamObjectId",
  "date": "2024-11-05T17:30:00"
}

Response:

```json
{
      "message": "Fixture updated successfully",
      "data": {
        "_id": "fixtureObjectId",
        "homeTeam": "updatedHomeTeamObjectId",
        "awayTeam": "updatedAwayTeamObjectId",
        "date": "2024-11-05T17:30:00",
        "status": "pending",
        "link": "fixture-unique-link"
      }
}

#### View a Single Fixture by ID - `GET /fixtures/one/:id`
View the details of a fixture by its ID.

    Response:

```json
{
      "_id": "fixtureObjectId",
      "homeTeam": {
        "_id": "homeTeamObjectId",
        "name": "Home Team Name"
      },
      "awayTeam": {
        "_id": "awayTeamObjectId",
        "name": "Away Team Name"
      },
      "date": "2024-10-20T15:30:00",
      "status": "pending",
      "link": "fixture-unique-link"
}


#### View Fixtures by Status - `GET /fixtures/status?status=pending|ongoing|completed`
View fixtures based on their status.

    Response:

```json
{
      "message": "Fixtures with status pending retrieved successfully",
      "data": [
        {
          "_id": "fixtureObjectId",
          "homeTeam": {
            "_id": "homeTeamObjectId",
            "name": "Home Team"
          },
          "awayTeam": {
            "_id": "awayTeamObjectId",
            "name": "Away Team"
          },
          "date": "2024-10-20T15:30:00",
          "status": "pending"
        }
      ]
}

#### Fetch All Fixtures - `GET /fixtures/all`
Retrieve all fixtures.

    Response:

```json
{
      "message": "Fixtures retrieved successfully",
      "data": [
        {
          "_id": "fixtureObjectId",
          "homeTeam": {
            "_id": "homeTeamObjectId",
            "name": "Home Team"
          },
          "awayTeam": {
            "_id": "awayTeamObjectId",
            "name": "Away Team"
          },
          "date": "2024-10-20T15:30:00",
          "status": "pending",
          "link": "fixture-unique-link"
        }
      ]
}

#### Update Fixture Score - `PUT /fixtures/score/:id`
Admins can update the score of a fixture.

    Request Body:

```json
{
  "score": "2-1"
}

Response:

```json
{
      "message": "Fixture score updated successfully",
      "data": {
        "_id": "fixtureObjectId",
        "homeTeam": "homeTeamObjectId",
        "awayTeam": "awayTeamObjectId",
        "date": "2024-10-20T15:30:00",
        "score": "2-1",
        "status": "completed"
      }
}

#### Search Endpoints (Public Access)
#### Search Fixtures/Teams - `GET /fixtures/search`

Search for fixtures or teams.

    Query Params:

    makefile

search=Liverpool

Response:

```json
[
      {
        "_id": "fixtureId",
        "homeTeam": "teamId1",
        "awayTeam": "teamId2",
        "date": "2024-10-22T14:00:00.000Z",
        "status": "pending"
      }
]

#### Rate Limiting
Each IP is limited to 100 requests per 15 minutes. After the limit is reached, further requests will be blocked.

    Error Response:

```json
{
      "message": "Too many requests from this IP, please try again after 15 minutes"
}

#### Web Caching (Redis)

To improve performance, Redis is used to cache frequently accessed data (such as fixtures). Cache is invalidated when a fixture is updated or deleted.
Docker Integration

The application is containerized using Docker for easy deployment.
Testing

Run unit and integration tests with Jest using:

bash

npm test