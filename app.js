const express = require('express')
const app = express()

app.use(express.json());
app.use(express.urlencoded({extended:true}));

//setup cors
app.use(require('cors')())

//bring in the routes
app.use('/user', require('./routes/user'));
app.use('/server', require('./routes/serverroom'));

//Setup Error Handler
const errorHandlers = require("./handlers/errorHandler");
app.use(errorHandlers.notFound);
app.use(errorHandlers.mongoseErrors);
if(process.env.env === "Development")
{
  app.use(errorHandlers.developmentErrors);

}else
{
  app.use(errorHandlers.productionErrors);

}


module.exports = app;