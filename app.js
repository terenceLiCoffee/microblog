// set up ===============================================================
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var mongoose = require('mongoose');
var http = require('http');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var fs = require('fs');
var formidable = require('formidable');

// view engine setup =====================================================
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


// MongoDB configuration ==================================================

mongoose.connect('mongodb://localhost:27017/blog');
var blogEntry = require('./models/blogPostModel');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('connected', function callback (){
    console.log("MongoDB connection is Live");
    console.log("Host: " + blogEntry.db.host);
    console.log("Port: " + blogEntry.db.port);
    console.log("Database: " + blogEntry.db.name);
});

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({limit: '50mb',extended: true }));
app.use(bodyParser.json({limit: '50mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Routes ===================================================================

app.post('/upload', multipartMiddleware, function(req,res){

    console.log(req.files);
    var file = req.files.file;
    console.log("SIZE " + file.size);
    console.log(file.type);
    fs.readFile(file.path, function(err,data){
        if(err) res.send(err);

        var base64data = new Buffer(data).toString('base64');
        var imageData = {
            data : base64data,
            contentType : file.type
        };
        console.log("base64data is " + base64data);
        res.send(imageData);
    });

});


app.post('/:author' , function(req,res){
    blogEntry.create(
        {   title: req.body.title,
            author: req.params.author,
            body:req.body.body,
            image: req.body.image }, function(err, postEntry) {
                if(err) res.send(err);

                blogEntry.find({author: req.params.author},null, {sort: {date:-1 }}, function(err,postsEntry){
                    if(err) res.send(err);
                    res.json(postsEntry);
                });
        });
});

app.delete('/:author/:post_id', function(req,res){
    blogEntry.remove({ _id : req.params.post_id}, function(err,postsEntry){
        if(err) res.send(err);

        blogEntry.find({author: req.params.author},null, {sort: {date:-1 }},function(err,postEntry){
            if(err) res.send(err);

            res.json(postEntry);
        });
    });
});

app.get('/home/:author', function(req,res){
    blogEntry.find({author: req.params.author}, null, {sort: {date:-1 }}, function(err, postEntry){
        if(err){
            res.send(err);
        }
        res.json(postEntry);
        console.log(postEntry);
    });

});

app.get('*', function(req,res){
    //res.render('index', {title:'blog'});
    //res.sendFile(__dirname+ "/views/index.html");
    res.sendFile(__dirname + "/views/index.html");
});




// Starting Server ==========================================================
var debug = require('debug')('blog:server');
var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

var server = http.createServer(app);

server.listen(port);
server.on('listening', onListening);


function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}
