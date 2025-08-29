# Weather API

A simple Express.js application that provides current weather data for a specified location. It includes caching with Redis and basic rate limiting. https://roadmap.sh/projects/weather-api-wrapper-service

## Features

-   Fetches weather data from an external API.
-   Caches results in Redis for 1 hour to reduce redundant API calls.
-   Rate limiting to 100 requests per minute per IP.

## Prerequisites

-   [Node.js](https://nodejs.org/)
-   A running [Redis](https://redis.io/) instance.
-   An API key from a weather data provider.

## Setup

1.  **Clone the repository and navigate to the directory:**
    ```bash
    git clone <repository_url>
    cd api-weather
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root of the `api-weather` directory with the following variables:

    ```env
    # The base URL of the weather API provider
    BASE_API_URL=https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/

    # Your API key from the weather provider
    API_KEY=YOUR_API_KEY_HERE

    # Your Redis connection URL
    REDIS_URL=redis://localhost:6379
    ```

## Running the Application

Start the server with the following command:

```bash
node app.js
```

The API will be running at `http://localhost:3000`.

## API Usage

### Get Weather Data

-   **Endpoint:** `/weather`
-   **Method:** `GET`
-   **Query Parameters:**
    -   `location` (string): The desired location (e.g., "London", "Tokyo"). Defaults to "New York" if not provided.

**Example Request:**

```bash
curl "http://localhost:3000/weather?location=Lisbon"
```

**Example Success Response:**

```json
{
    "location": "Lisbon, Lisboa, Portugal",
    "temperature": 22.0,
    "description": "Partly cloudy"
}
```
