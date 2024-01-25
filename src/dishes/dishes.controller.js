const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");
const { validateHeaderName } = require("http");


// TODO: Implement the /dishes handlers needed to make the tests pass

// Check the required body strings
function bodyDataHas(propertyName){
    return function(req,res,next){
        const {data ={} } = req.body;
        if(data[propertyName] && data[propertyName]!=''){
            return next();
        }
        next({
            status: 400,
            message: `Must include a ${propertyName}`,
        });
    };
}

// Validates and checks dish exists
function dishExists(req, res, next){
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if(foundDish){
        res.locals.dish = foundDish;
        return next();
    }
    next({
        status: 404,
        message: `Dish id not found: ${dishId}`,
    });
}

// Validates dish includes name
function validateDishName(req,res, next){
    const {data:{name} ={}}= req.body;
    if(!name || name === ""){
        return next({
            status: 400,
            message: "Dish must include a name",
        });
    }
    next();

}

// Validates dish includes description
function validateDishDescription(req, res, next) {
    const {data: {description} ={}}= req.body;
    if(description.length ===0 || description === ""){
        return next({
            status: 400,
            message: "Dish must include a description",
        });
    }
    next();
}

// Validates dish price is an integer greater than 0
function validateDishPrice(req, res, next){
    const { data : { price }= {} } = req.body;
    if(price <=0 || !Number.isInteger(price)){
        return next({
            status: 400,
            message: "Dish must have a price that is an integer greater than 0"
        });
    }
    next();
}

// Validates dish includes a image
function validateDishImageUrl(req, res, next){
    const {data: {image_url}={}} =req.body;
    if(image_url === ""){
        return next({
            status: 400,
            message: "Dish must include a image_url"
        })
    }
    next();
}

// Validates dish id matches the route id
function validateDishId(req, res, next){
    const { dishId } = req.params;
    const { data: {id} = {}} = req.body;
    if(id){
      if(id !== dishId){
        next({
          status: 400,
          message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
        })
      }
      next();
    }else{
      next();
    }
}


// GET all dishes
function list(req,res){
    res.json({data: dishes});
}

// Handles GET one dish
function read(req,res,next) {
    res.json({data: res.locals.dish});
}

// Handles POST a new dish
function create(req, res){
    const {data :{ name, description, price, image_url} = {}} = req.body;
    const newDish = {
        id : nextId(),
        name,
        description,
        price,
        image_url,
    };
    dishes.push(newDish);
    res.status(201).json({data: newDish});
}

// Handles PUT request
function update(req, res, next){
    const dish = res.locals.dish;
    const {
      data: { name, description, price, image_url },
    } = req.body;
  
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;
  
    res.json({ data: dish });
}


module.exports = {
    list,
    bodyDataHas,
    read: [dishExists, read],
    create: [
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        validateDishName,
        validateDishDescription,
        validateDishPrice,
        validateDishImageUrl,
        create
    ],
    update: [
        dishExists,
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"), 
        validateDishName, 
        validateDishPrice,
        validateDishId,
        update
    ],

}
