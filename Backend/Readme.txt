## For prettier configuration we can refer to prettier site
## npm init is used for initializing package.json
## nodemon is used to monitor the node js changes without the need to save changes all time
## express is a famous library to install a web server
## To access environmnet varaibles install dotenv
## When the front-end send json data to backend we need a middleware to make the backend parse the data it receives
## express.json is used to make the data understandable
## Earlier we used to use body parser which was deprecated but now we use express.json
## Morgan is a module that can be used to log API requests
## We need to create a new db in mongo db atlas
## ip address needs to be white listed
## For pushing data to DB we first need to create a model using Mongoose 
## For that we need to refer to Mongoose Schema
## First we define a schema using mongoose.schema
## we use mongoose.model to create models for the Data base collection
## for storing the model to a variable the naming convention of the variable should have first letter
## product.save() returns a promise with inserted document as an object and stores the product to Database
## to make a field mandatory we can use an object assigned in Product Schema for that field.with required property added as true
## We can use the find method to return the complete list . 
## find() returns a promise and instead of using then , catch. we can use async await for the functionality to complete
## exports.module is used to export a module
## when we have to export an object we use exports.User and import it as an object const {Product}=require('../Backend')
## Object destruction
## There is a CORs library we use to tackle CORS
## we will use findByIdAndRemove to remove category
## we use req.params.id to access the params variable
## findByIdAndUpdate should be passed new as true to get back the updated object or else we will get back the old data record
## we can use select to return selected fields.
## if we don't want to include _id we can use -_id.
## to get the associated category details use populate()
## to check if the object id is of valid type use mongoose.isValidObjectId
## for filtering the collection based on some condition we can pass the condition inside the find method
## to limit the number of products returned we can use limit function.
## limit takes input as a number
## to filter based on multiple categories we can use an array to pass the category id's
## if we pass like this to find method like {category:categories} if no category are passed we will get no data returned
## to replace _id with id we have to use virtual in the model 
## 