const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cookieParser());
app.use(session({secret: "CSC309"}));

app.get('/', function(req, res){
   if(req.session.page_views){
      req.session.page_views++;
	  req.session.save();
      res.json({"times":req.session.page_views});
   } else {
      req.session.page_views = 1;
	  
	  req.session.save();
      res.json({"times":req.session.page_views});
   }
});

app.listen(PORT, function(){
  console.log('listening on', PORT);
});