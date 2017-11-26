const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cookieParser());
app.use(session({secret: "CSC309"}));

var times = {}
app.get('/', function(req, res){
   if(times[req.session.id]){
      times[req.session.id] += 1;
      res.json({"times":times[req.session.id]});
   } else {
     times[req.session.id] = 1;
      res.json({"times":times[req.session.id]});
   }
});

app.listen(PORT, function(){
  console.log('listening on', PORT);
});