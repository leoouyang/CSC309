var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var app = express();

app.use(cookieParser());
app.use(session({secret: "CSC309"}));

app.get('/', function(req, res){
   if(req.session.page_views){
      req.session.page_views++;
      res.json({"times":req.session.page_views});
   } else {
      req.session.page_views = 1;
      res.send({"times":req.session.page_views});
   }
});
app.listen(3000);