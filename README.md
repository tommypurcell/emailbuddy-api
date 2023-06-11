# Airbnb API

This is the documentation for the Airbnb API, which provides backend functionality for the Airbnb application.

## Getting Started

To use the Airbnb API, follow the steps below:

1. Add your configuration variables to the `db.js` file.
2. Install the required packages by running the command `npm install`.
3. Start the application in development mode using the command `npm run dev`.
4. Start the application in production mode using the command `npm start`.

## Dependencies

The Airbnb API relies on the following packages:

- express: Fast, unopinionated, minimalist web framework for Node.js.
- body-parser: Node.js body parsing middleware.
- cookie-parser: Parse HTTP request cookies.
- morgan: HTTP request logger middleware for Node.js.
- mongoose: MongoDB object modeling tool designed to work in an asynchronous environment.
- cors: Cross-origin resource sharing middleware.
- http-errors: Create HTTP errors for Express.js applications.

Make sure to install these packages by running `npm install` before starting the application.

## Configuration

Before running the Airbnb API, make sure to set up the necessary configuration variables in the `db.js` file. These variables should include the required information to connect to your MongoDB database.

## Usage

The Airbnb API provides the following routes and endpoints:

### GET /

- Description: Retrieves a list of all users.
- Example: `http://localhost:3000/`
- Response: "Hello from the Airbnb API"

### GET /houses

- Description: Retrieves a list of houses based on search parameters.
- Example: `http://localhost:3000/houses?price=100&search=example&location=city&rooms=2&sort=1`
- Response: Array of house objects

### GET /houses/:id

- Description: Retrieves a specific house by ID.
- Example: `http://localhost:3000/houses/12345`
- Response: House object

### POST /houses

- Description: Creates a new house.
- Example: `http://localhost:3000/houses`
- Request Body: House object
- Response: Created house object

### PATCH /houses/:id

- Description: Updates a specific house by ID.
- Example: `http://localhost:3000/houses/12345`
- Request Body: Updated house object
- Response: Success message

### DELETE /houses/:id

- Description: Deletes a specific house by ID.
- Example: `http://localhost:3000/houses/12345`
- Response: Success message

### GET /bookings

- Description: Retrieves a list of bookings for a specific house.
- Example: `http://localhost:3000/bookings?house=12345`
- Response: Array of booking objects

### POST /bookings

- Description: Creates a new booking.
- Example: `http://localhost:3000/bookings`
- Request Body: Booking object
- Response: Created booking object

### GET /reviews

- Description: Retrieves a list of reviews for a specific house.
- Example: `http://localhost:3000/reviews?house=12345`
- Response: Array of review objects

### POST /reviews

- Description: Creates a new review.
- Example: `http://localhost:3000/reviews`
- Request Body: Review object
- Response: Created review object

### GET /profile

- Description: Retrieves the profile information of the currently logged-in user.
- Example: `http://localhost:3000/profile`
- Response: User object

### PATCH /profile

- Description: Updates the profile information of the currently logged-in user.
- Example: `http://localhost:3000/profile`
- Response: Updated user object
