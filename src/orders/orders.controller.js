const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

// Checks required request body
function bodyDataHas(propertyName) {
    return function (req, res, next) {
      const { data = {} } = req.body;
      if (data[propertyName] && data[propertyName] !== "") {
        return next();
      }
      next({ status: 400, message: `Order must include a ${propertyName}` });
    };
  }


// Checks if order exists
function orderExists(req, res, next){
    const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  } else {
    return next({
      status: 404,
      message: `Order does not exist: ${req.params.orderId}`,
    });
  }
}

// Validates deliverTo is not missing and not empty
function validateDeliverTo(req, res, next){
    const {data: {deliverTo} = {}} = req.body;
    if(!deliverTo || deliverTo === ""){
       return next({
            status: 400,
            message: "Order must include a deliverTo",
        });
    }
    next();
}

// Validates mobile number is not missing and not empty
function validateMobileNumber(req, res, next){
    const {data: {mobileNumber} = {}}= req.body;
    if(!mobileNumber|| mobileNumber ===""){
        return next({
            status: 400,
            message: "Order must include a mobileNumber"
        });
    }
    next();
}

// Validates the dishes exist and is an array
function validateDishes(req, res, next){
    const { data: { dishes } = {} } = req.body;
    if (dishes.length !== 0 && Array.isArray(dishes)) {
      return next();
    } else {
      return next({
        status: 400,
        message: `Order must include at least one dish`,
      });
    }
}

// Validates quatity is an integer greater than 0
function validateQuantity(req,res,next){
    const { data: { dishes } = {} } = req.body;
  dishes.forEach((dish, index) => {
    const quantity = dish.quantity;
    if (!quantity || quantity < 1 || Number(quantity) !== quantity) {
      next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  });
  next();
}

// Validates if order id matches with the route id
function validateOrderId(req, res, next){
    const orderId = req.params.orderId;
    const { data: { id } = {} } = req.body;
    if (id) {
      if (id === orderId) {
        return next();
      } else {
        return next({
          status: 400,
          message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
        });
      }
    } else {
      next();
    }
}

// Validates the order status
function validateStatus(req, res, next){
    const {data:{status} ={}} = req.body;
    if(!status || (status !== "pending" && status !== "preparing" && status !== "out-for-delivery") ){
        return next({
            status: 400,
            message: "Order must have a status of pending, preparing, out-for-delivery, delivered"

        });
    }
    else if(status === "delivered"){
        return next({
            status: 400,
            message: "A delivered order cannot be changed"
        });
    }
    next();
}

// Validates status for DELETE request
function deleteStatusPropertyIsValid(req, res, next) {
	if(res.locals.order.status !== "pending") {
		return next({
			status: 400,
			message: "An order cannot be deleted unless it is pending",
		});
	}
	next();
}

// GET all orders
function list(req, res){
    const {orderId} = req.params;
    res.json({
        data: orders.filter(orderId ? order => order.id === orderId:()=>true),
    });
}

// Handles GET for one order
function read(req, res){
    res.json({data: res.locals.order});
}

// POST a new order
function create(req, res){
    const {data: {deliverTo,  mobileNumber, status, dishes} ={}} = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes,
    };
    orders.push(newOrder);
    res.status(201).json({data: newOrder})
}

// Handles PUT request
function update(req, res) {
    const foundOrder = res.locals.order;
  
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  
    foundOrder.deliverTo = deliverTo;
    foundOrder.mobileNumber = mobileNumber;
    foundOrder.dishes = dishes;
  
    res.json({ data: foundOrder });
  }

// Handles DELETE request
function destroy(req, res, next){
    const {orderId} = req.params;
    const index = orders.findIndex((order) => order.id === orderId);
    const deletedOrders = orders.splice(index,1);
    res.sendStatus(204);
}

module.exports = {
    list,
    orderExists,
    read: [orderExists, read],
    create: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        validateDishes,
        validateQuantity,
        create,
    ],
    update: [
        orderExists,
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        bodyDataHas("status"),
        validateDishes,
        validateQuantity,
        validateStatus,
        validateOrderId,
        update
    ],
    delete: [orderExists, deleteStatusPropertyIsValid,destroy],
}