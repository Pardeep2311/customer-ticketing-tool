
# API Endpoints

## Authentication

- **POST /api/auth/register**
  - **Description:** Registers a new user.
  - **Request Body:**
    ```json
    {
      "username": "testuser",
      "password": "password123",
      "email": "testuser@example.com"
    }
    ```
  - **Response:**
    ```json
    {
      "message": "User registered successfully"
    }
    ```

- **POST /api/auth/login**
  - **Description:** Logs in a user and returns a JWT token.
  - **Request Body:**
    ```json
    {
      "email": "testuser@example.com",
      "password": "password123"
    }
    ```
  - **Response:**
    ```json
    {
      "token": "your-jwt-token"
    }
    ```

## Tickets

- **POST /api/tickets**
  - **Description:** Creates a new ticket.
  - **Request Body:**
    ```json
    {
      "subject": "My computer is not working",
      "description": "I am having trouble with my computer. It is not turning on.",
      "categoryId": 1,
      "serviceId": 1
    }
    ```
  - **Response:**
    ```json
    {
      "message": "Ticket created successfully",
      "ticketId": 123
    }
    ```

- **GET /api/tickets**
  - **Description:** Returns a list of all tickets.
  - **Response:**
    ```json
    [
      {
        "id": 1,
        "subject": "My computer is not working",
        "description": "I am having trouble with my computer. It is not turning on.",
        "status": "open",
        "createdAt": "2025-12-01T12:00:00.000Z"
      }
    ]
    ```

- **GET /api/tickets/:id**
  - **Description:** Returns the details of a specific ticket.
  - **Response:**
    ```json
    {
      "id": 1,
      "subject": "My computer is not working",
      "description": "I am having trouble with my computer. It is not turning on.",
      "status": "open",
      "createdAt": "2025-12-01T12:00:00.000Z",
      "comments": [
        {
          "id": 1,
          "text": "Have you tried turning it off and on again?",
          "createdAt": "2025-12-01T12:30:00.000Z"
        }
      ]
    }
    ```

- **PUT /api/tickets/:id**
  - **Description:** Updates the status of a specific ticket.
  - **Request Body:**
    ```json
    {
      "status": "closed"
    }
    ```
  - **Response:**
    ```json
    {
      "message": "Ticket updated successfully"
    }
    ```

## Comments

- **POST /api/tickets/:id/comments**
  - **Description:** Adds a comment to a specific ticket.
  - **Request Body:**
    ```json
    {
      "text": "I have tried that, but it is still not working."
    }
    ```
  - **Response:**
    ```json
    {
      "message": "Comment added successfully"
    }
    ```

## Services

- **GET /api/services**
  - **Description:** Returns a list of all services.
  - **Response:**
    ```json
    [
      {
        "id": 1,
        "name": "Hardware Support"
      },
      {
        "id": 2,
        "name": "Software Support"
      }
    ]
    ```

## Categories

- **GET /api/categories**
  - **Description:** Returns a list of all categories.
  - **Response:**
    ```json
    [
      {
        "id": 1,
        "name": "Desktop"
      },
      {
        "id": 2,
        "name": "Laptop"
      }
    ]
    ```
