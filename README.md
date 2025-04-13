# Microservices Ride-Hailing Application

## Overview
This repository contains a microservices architecture for a ride-hailing application. It is composed of four main services:
- **User Service**: Manages user registration, authentication, and profile management.
- **Ride Service**: Handles ride creation and ride status updates.
- **Captain Service**: Manages ride captain registration, login, availability, and receiving ride requests.
- **Gateway Service**: Acts as a proxy routing requests to the appropriate service.

Communication between services is achieved via RabbitMQ.

## Directory Structure
- **captain/**
  - `controllers/` – Contains captain business logic.
  - `db/` – Database connection settings.
  - `models/` – Mongoose models (captain, blacklist token).
  - `routes/` – HTTP route definitions.
  - `service/` – RabbitMQ integration to communicate ride events.
  - `middleware/` – Authentication middleware.
  - `server.js`, `app.js`, etc.
- **ride/**
  - `controllers/` – Ride creation and acceptance.
  - `db/` – Database connection settings.
  - `models/` – Ride data model.
  - `routes/` – HTTP route definitions.
  - `service/` – RabbitMQ integration for publishing and subscribing to ride events.
  - `middleware/` – Authentication middleware.
  - `server.js`, `app.js`, etc.
- **user/**
  - `controllers/` – User registration, login, profile and logout.
  - `db/` – Database connection.
  - `models/` – User and blacklist token models.
  - `routes/` – HTTP route definitions.
  - `service/` – RabbitMQ integration.
  - `middleware/` – Authentication middleware.
  - `server.js`, `app.js`, etc.
- **gateway/**
  - `app.js` – Routes incoming traffic to the appropriate service.
  - Acts as an API gateway using [`express-http-proxy`](https://www.npmjs.com/package/express-http-proxy).

## Services and Endpoints
### User Service

#### 1. Registration
- **Endpoint:** `POST /register`
- **Description:** Registers a new user.
- **Request Body:**
  ```json
  {
      "username": "john_doe",
      "email": "john@example.com",
      "password": "securePassword123"
  }
  ```
- **Successful Response (201 Created):**
  ```json
  {
      "message": "User registered successfully.",
      "user": {
          "id": "userId123",
          "username": "john_doe",
          "email": "john@example.com"
      }
  }
  ```
- **Error Response (400 Bad Request):**
  ```json
  {
      "error": "Validation error: Email already in use."
  }
  ```

#### 2. Login
- **Endpoint:** `POST /login`
- **Description:** Authenticates a user and returns a JWT token.
- **Request Body:**
  ```json
  {
      "email": "john@example.com",
      "password": "securePassword123"
  }
  ```
- **Successful Response (200 OK):**
  ```json
  {
      "message": "Login successful.",
      "token": "jwt_token_here",
      "user": {
          "id": "userId123",
          "username": "john_doe",
          "email": "john@example.com"
      }
  }
  ```
- **Error Response (401 Unauthorized):**
  ```json
  {
      "error": "Invalid email or password."
  }
  ```

#### 3. Get Profile
- **Endpoint:** `GET /profile`
- **Description:** Fetches the current user profile. (Protected Route: requires valid JWT token)
- **Headers:**
  ```http
  Authorization: Bearer jwt_token_here
  ```
- **Successful Response (200 OK):**
  ```json
  {
      "user": {
          "id": "userId123",
          "username": "john_doe",
          "email": "john@example.com",
          "registeredAt": "2025-04-13T12:34:56Z"
      }
  }
  ```
- **Error Response (401 Unauthorized):**
  ```json
  {
      "error": "Authentication failed."
  }
  ```

#### 4. Logout
- **Endpoint:** `GET /logout`
- **Description:** Logs out the user by blacklisting the JWT token.
- **Headers:**
  ```http
  Authorization: Bearer jwt_token_here
  ```
- **Successful Response (200 OK):**
  ```json
  {
      "message": "User logged out successfully."
  }
  ```
- **Error Response (400/401):**
  ```json
  {
      "error": "Invalid token or already logged out."
  }
  ```

#### 5. Accepted Ride (Long-Polling)
- **Endpoint:** `GET /accepted-ride`
- **Description:** Waits for a ride acceptance event.
- **Headers:**
  ```http
  Authorization: Bearer jwt_token_here
  ```
- **Successful Response (200 OK):**
  ```json
  {
      "rideId": "rideId456",
      "status": "accepted",
      "captain": {
          "id": "captainId789",
          "name": "Captain Marvel"
      }
  }
  ```
- **Timeout/No Data:**
  If no ride is accepted within the polling period, the response might be:
  ```json
  {
      "message": "No ride accepted in the last few moments. Please try again."
  }
  ```

---

### Ride Service

#### 1. Create Ride
- **Endpoint:** `POST /create-ride`
- **Description:** Creates a new ride request. (Protected: User should be authenticated)
- **Headers:**
  ```http
  Authorization: Bearer jwt_token_here
  ```
- **Request Body:**
  ```json
  {
      "pickupLocation": "123 Main St",
      "dropoffLocation": "456 Elm St",
      "scheduledTime": "2025-04-14T10:00:00Z"
  }
  ```
- **Successful Response (201 Created):**
  ```json
  {
      "message": "Ride request created successfully.",
      "ride": {
          "id": "rideId456",
          "pickupLocation": "123 Main St",
          "dropoffLocation": "456 Elm St",
          "status": "pending"
      }
  }
  ```
- **Event:** Publishes a `new_ride` event via RabbitMQ.

#### 2. Accept Ride
- **Endpoint:** `PUT /accept-ride`
- **Description:** A captain accepts a ride request. (Protected: Captain should be authenticated)
- **Headers:**
  ```http
  Authorization: Bearer captain_jwt_token_here
  ```
- **Request Body:**
  ```json
  {
      "rideId": "rideId456"
  }
  ```
- **Successful Response (200 OK):**
  ```json
  {
      "message": "Ride accepted successfully",
      "ride": {
          "id": "rideId456",
          "status": "accepted",
          "captain": {
              "id": "captainId789",
              "name": "Captain Marvel"
          }
      }
  }
  ```
- **Event:** Publishes a `ride_accepted` event via RabbitMQ.

---

### Captain Service

#### 1. Registration
- **Endpoint:** `POST /register`
- **Description:** Registers a new captain.
- **Request Body:**
  ```json
  {
      "name": "Captain Marvel",
      "email": "captain@example.com",
      "password": "strongPassword456",
      "phone": "1234567890"
  }
  ```
- **Successful Response (201 Created):**
  ```json
  {
      "message": "Captain registered successfully.",
      "captain": {
          "id": "captainId789",
          "name": "Captain Marvel",
          "email": "captain@example.com"
      }
  }
  ```
- **Error Response (400 Bad Request):**
  ```json
  {
      "error": "Email already registered."
  }
  ```

#### 2. Login
- **Endpoint:** `POST /login`
- **Description:** Authenticates a captain and returns a JWT token.
- **Request Body:**
  ```json
  {
      "email": "captain@example.com",
      "password": "strongPassword456"
  }
  ```
- **Successful Response (200 OK):**
  ```json
  {
      "message": "Login successful.",
      "token": "captain_jwt_token_here",
      "captain": {
          "id": "captainId789",
          "name": "Captain Marvel",
          "email": "captain@example.com"
      }
  }
  ```
- **Error Response (401 Unauthorized):**
  ```json
  {
      "error": "Invalid email or password."
  }
  ```

#### 3. Get Profile
- **Endpoint:** `GET /profile`
- **Description:** Retrieves the captain’s profile. (Protected Route)
- **Headers:**
  ```http
  Authorization: Bearer captain_jwt_token_here
  ```
- **Successful Response (200 OK):**
  ```json
  {
      "captain": {
          "id": "captainId789",
          "name": "Captain Marvel",
          "email": "captain@example.com",
          "phone": "1234567890",
          "available": true
      }
  }
  ```
- **Error Response (401 Unauthorized):**
  ```json
  {
      "error": "Authentication failed."
  }
  ```

#### 4. Logout
- **Endpoint:** `GET /logout`
- **Description:** Logs out the captain by blacklisting the token.
- **Headers:**
  ```http
  Authorization: Bearer captain_jwt_token_here
  ```
- **Successful Response (200 OK):**
  ```json
  {
      "message": "Captain logged out successfully."
  }
  ```

#### 5. Toggle Availability
- **Endpoint:** `PATCH /toggle-availability`
- **Description:** Toggle a captain's availability to accept new rides.
- **Headers:**
  ```http
  Authorization: Bearer captain_jwt_token_here
  ```
- **Successful Response (200 OK):**
  ```json
  {
      "message": "Availability updated successfully.",
      "available": false
  }
  ```

#### 6. New Ride (Long-Polling)
- **Endpoint:** `GET /new-ride`
- **Description:** Long polling endpoint for captains to get notified of new ride requests.
- **Headers:**
  ```http
  Authorization: Bearer captain_jwt_token_here
  ```
- **Successful Response (200 OK):**
  ```json
  {
      "ride": {
          "id": "rideId456",
          "pickupLocation": "123 Main St",
          "dropoffLocation": "456 Elm St",
          "status": "pending"
      }
  }
  ```
- **Timeout/No Data:**
  ```json
  {
      "message": "No new ride requests at the moment."
  }
  ```

---

### Gateway Service

#### Functionality
The Gateway Service acts as the single entry point for external API requests. It forwards the requests to the appropriate internal services:
- **User Requests:** Forwarded to the User Service (`/register`, `/login`, `/profile`, `/logout`, `/accepted-ride`).
- **Captain Requests:** Forwarded to the Captain Service (`/register`, `/login`, `/profile`, `/logout`, `/toggle-availability`, `/new-ride`).
- **Ride Requests:** Forwarded to the Ride Service (`/create-ride`, `/accept-ride`).

#### Response Behavior
The Gateway Service simply forwards the response from each service. Therefore, the expected results are the same as detailed in each corresponding service above.

## RabbitMQ Integration
- Each service employs a RabbitMQ client to:
  - Connect using a URL provided in the environment variables.
  - Publish and subscribe to queues (`new_ride`, `ride_accepted`).
- The event-driven communication facilitates real-time updates between services.

---

## Environment Variables
Each service uses its own `.env` file. Common environment variables include:
```
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_secret_key
RABBIT_URL=your_rabbitmq_connection_url
PORT_USER=5001
PORT_RIDE=5003
PORT_CAPTAIN=5002
BASE_URL=http://localhost:6060
```
Ensure these are set correctly in the respective directories.


## Setup and Running the Project

### Prerequisites
- [Node.js](https://nodejs.org/) installed.
- A running instance of [MongoDB](https://www.mongodb.com/).
- [RabbitMQ](https://www.rabbitmq.com/) running and accessible.

### Installation
1. Clone the repository.
2. For each service (`captain`, `ride`, `user`, `gateway`):
   - Open a terminal in the service directory.
   - Run:
     ```sh
     npm install
     ```
3. Create and configure the `.env` file for each service.

### Running the Services
On Windows, open separate terminal windows for each microservice and run:
```sh
node server.js
```
Service ports:
- **User Service:** `5001`
- **Captain Service:** `5002`
- **Ride Service:** `5003`
- **Gateway Service:** `6060`

### Notes
- The Gateway Service acts as the entry point for routing requests.
- Ensure RabbitMQ is up and running to enable inter-service communication.
- The long polling endpoints in User and Captain services allow for real-time updates based on events processed through RabbitMQ.

## Testing
- No formal test suite is included by default.
- It is recommended to implement unit and integration tests using frameworks like Mocha or Jest.

## Contribution
Contributions are welcome! Please submit issues or pull requests for improvements or bug fixes.

## License
This project is licensed under the ISC License.