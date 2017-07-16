const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const app = express()
const morgan  = require('morgan')
const http = require('http').Server(app)
const io = require('socket.io')(http)



app.set('public', path.join(__dirname, 'public'))
app.set('view engine', 'jade')

app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Credentials", true)
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
  next();
})

require('./sockets/index').up(io)



app.use('/api', require('./routes/index'))


// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Route not Found');
  err.status = 404;
  next(err);
})

// error handler
app.use((err, req, res) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
})

http.listen(9009, () => {
  console.log('Server is started on localhost:9009');
})

module.exports = app