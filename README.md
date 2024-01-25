# grubdash
This project implements the api's for the grubdash app.
Routes:
- GET /dishes
    - This route will respond with a list of all existing dish data
- POST /dishes
    - This route will save the dish and respond with the newly created dish
- GET /dishes/:dishId
    - This route will respond with the dish where id === :dishId or return 404 if no matching dish is found.
- PUT /dishes/:dishId
    - This route will update the dish where id === :dishId or return 404 if no matching dish is found.
- GET /orders
    - This route will respond with a list of all existing order data.
- POST /orders
    - This route will save the order and respond with the newly created order.
- GET /orders/:orderId
    - This route will respond with the order where id === :orderId or return 404 if no matching order is found.
- PUT /orders/:orderId
    - This route will update the order where id === :orderId, or return 404 if no matching order is found.
- DELETE /orders/:orderId
    - This route will delete the order and return a 204 where id === :orderId, or return 404 if no matching order is found.

# Project setup
Follow the instructions below to get this project up and running on your own machine:
- After cloning the repository please run below command
     `npm install`

# Running tests
To run the tests, you can run the following command:
 `npm test`