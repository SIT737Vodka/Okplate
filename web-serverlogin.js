var express = require("express");
var bodyParser = require('body-parser');
var app = express();
var fs = require('fs'); // require this to prepare files
app.set('view engine', 'ejs');  // require this to render ejs components

// we set the port pro-grammatically, in case we need to change it later
// or we can "set PORT=5000" on command line
const port = process.env.PORT || 3000;

// this is where we are going to fetch our html from 
var root = '/public'

// tell express to use the static middleware,
//app.use(express.static('C:/Richard/Deakin/SIT737/Week3/public'));
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({
    extended:true
}));
app.use(bodyParser.json());

//routes below
app.post("/login",function(request,response){
 var result ='';

 var user = request.body.username;
 var password = request.body.password;
 //console.log(user);
 //console.log(password);

 var mysql = require('mysql');

 var con = mysql.createConnection({
   host: "localhost",
   user: "root",
   // need to extract the user id and password into separate file 
   password: "richard1",
   database: "users"
 });

 var sql = 'select * from users where username = ' + mysql.escape(user) + ' and password = ' + mysql.escape(password);
 con.connect(function(err) {
   if (err) throw err;
   console.log("Connected!");
   con.query(sql, function (err, result) {
    if (err) throw err;
    if (result.length > 0) {
        if (result)
            console.log(result);
            response.redirect('/OKPlateCaptureValidate.html');
        }
            else
            {console.log("User: " + user + " not found");

    //req.session.valid = true;  ... could set a session here and use javascript in html to check session variable in html

    //  can use the following to redirect i.e. send html file to browser 
    //response.sendFile(__dirname + '/public/OKPlateLogin.html');  //yes this works
    
    //set the message for the ejs(html) component to display message
    response.render(__dirname + '/public/OKPlateLogin.ejs', {message: 'Incorrect Login! Please retry'});
     }
  });
 });
});

// the below route is there if browser refreshed on /login
app.get("/login",function(request,response){
    var data=request.body;
    console.log('Get requested, here is the data :'+data)
    response.sendFile(__dirname + '/public/OKPlateLogin.html'); 
})

//start the app and listen to the port
app.listen(port, () => console.log(`Listening on port ${port}...`));