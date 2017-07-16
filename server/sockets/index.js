const userService = require('../services/user')
const messageService = require('../services/message')

let clientUser = {}

module.exports.up = function(io) {
  io.on('connection', socket => {
    console.log('socket connected')

    socket.on('user:getAll', () => {
      userService.getAll()
        .then( users => {
          socket.emit('user:getAll', users)
        })
    })

    socket.on('user:changeStatus', user => {
      clientUser = user
      userService.updateUser(user._id, user)
        .then(userService.getAll)
        .then( users => {
          io.emit('user:change', users)
        })
    })

    socket.on('user:add', user => {
      userService.addUser(user)
        .then( user => {
          clientUser = user
          socket.emit('user:add', user)
        })
        .then(userService.getAll)
        .then( users => {
          io.emit('user:change', users)
        })
    })

    socket.on('user:typing:start', nickname => {
      io.emit('user:typing:start', nickname)
    })

    socket.on('user:typing:stop', nickname => {
      io.emit('user:typing:stop', nickname)
    })

    socket.on('message:getAll', () => {
      messageService.getAll()
        .then( messages => {
          socket.emit('message:getAll', messages)
        })
    })

    socket.on('message:add', message => {
      messageService.addMessage(message)
        .then( message => {
          io.emit('message:add', message)
        })
    })

    socket.on('user:exit', user => {
      user.status = 'offline'
      userService.updateUser(user._id, user)
    })

    socket.on('disconnect', socket => {
      clientUser.status = 'offline'
      console.log(socket, clientUser)
      userService.updateUser(clientUser._id, clientUser)
        .then(userService.getAll)
        .then( users => {
          io.emit('user:change', users)
          io.emit('user:gone', clientUser)
        })
    })

  })

}