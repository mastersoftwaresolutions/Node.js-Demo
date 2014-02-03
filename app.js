var express = require('express')
  , http = require('http')
  , mysql = require('mysql')
  , path = require('path');
var app = express();

app.set('port', process.env.PORT || 3002);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: 'dasdsdasdd56as5d56as6d4as564das' }));
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function( req, res) {
	res.render('users');
});

app.get('/users', function (req, res) {
    res.render('users');
});

// DataBase connection details
var connection = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : '',
	database : 'nodejs'
});
connection.connect();

app.get("/users/new", function (req, res) {
	res.render("new");
});

// Logout user
app.get("/logout", function (req, res) {
  if (req.session) {
    req.session.is_logged_in = false;
    req.session.destroy(function() {});
  }
  res.redirect('/users');
});

// Get user details and show on home page
app.get("/home/:username", function (req, res) {
	if (req.session.is_logged_in === true) {
		uname = req.params.username;
		connection.query("SELECT * FROM users WHERE username = '"+ uname +"'", function(err, rows) {
		 	if (err) throw err;
         res.render('home', {user: rows[0]});

		 });
    }
    else  {
       res.redirect('/users');
    }
});

// Register new user and check if username already exist.
app.post("/users", function (req, res) {
	var username=req.body.username,
		password=req.body.password,
	    email=req.body.email,
	    phone=req.body.phone,
	    location=req.body.location;
		connection.query("SELECT * FROM users WHERE username = '"+ username +"'", function(err, results) {
		if (err) throw err;
		if (results[0]) {
	              res.render("users",{ error_sign:'Username name already Exist!' });
	            }
	            else {
	               connection.query('INSERT INTO users (id,username, password, email, phone, location) VALUES (? , ? , ? , ? , ? , ? );', ['',username, password, email, phone, location], function(err, docs) {
				if (err) res.json(err);
			       res.redirect('users');
				 });
	         }
		});
});

// Update user details
app.post("/update", function (req, res) {
	var username=req.body.username,
		password=req.body.password,
	    email=req.body.email,
	    phone=req.body.phone,
	    location=req.body.location;
	    console.log(username);
	    connection.query('UPDATE users SET password = "'+password+'", email = "'+email+'", phone = "'+phone+'", location = "'+location+'" WHERE username= "'+username+'" ', function(err, docs) {
		if (err) res.json(err);
	       res.redirect('/home/'+username);
		 });

});

// Login to user
app.post("/login", function (req, res) {
	var username=req.body.username,
		password=req.body.password;
	connection.query("SELECT * FROM users WHERE username = '"+ username +"' and password = '"+ password +"' limit 1", function(err, results) {
	if (err) throw err;
	if (results[0]) {
		        req.session.userInfo = results[0];
		        var username = req.session.userInfo.username;
                req.session.is_logged_in = true;
                res.redirect('/home/'+username);
            }
            else {
            	res.render("users",{ error:'Please enter valid details!' });
            }
	});
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
