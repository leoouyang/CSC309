const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');

var app = express();

app.use(cookieParser());
app.use(session({secret: "CSC309"}));

app.get('/', function(req, res){
   if(req.session.page_views){
      req.session.page_views++;
      res.json({"times":req.session.page_views});
   } else {
      req.session.page_views = 1;
      res.json({"times":req.session.page_views});
   }
});

app.listen(process.env.PORT || 3000, function(){
  console.log('listening on', app.address().port);
});