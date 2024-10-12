var express = require('express');
var router = express.Router();
const fs = require('fs');

const routes = fs.readdirSync(__dirname)

routes.forEach(route => {
  if (route.includes(".js") && route != "index.js") {                                                                                                      //` localhost:3000/api/auditlogs
    router.use(`/${route.slice(0, route.indexOf("."))}`, require(`./${route}`))     //` bu api (index) route-nyn icinden dinamik route goymak ucin ulanylya => localhost:3000/api/users
  }                                                                                                                                                        //` localhost:3000/api/categories
})

module.exports = router;
