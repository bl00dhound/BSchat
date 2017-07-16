(() => {
  // Websocket chat

  const socket = io.connect(`http://127.0.0.1:9009`)
  const $modal = $('#modal')
  const $active_users = $('#active_users')
  const $gone = $('#gone')
  const $fg_sign = $('#fg-signin')
  const $fg_new = $('#fg-new')
  const $message = $('#message')[0]

  $modal.modal('show')

  let currentUser = {}
  let usersList = []
  let messages = []

  //request for users and messages
  socket.emit('user:getAll')
  socket.emit('message:getAll')

  // blueprint of DOM-element for viewing message in chat-window
  // R.memoize - for cashing result that function return
  const messageDOMDraft = R.memoize(() => {
    let alert = document.createElement('div')
    alert.classList.add('alert')
    alert.classList.add('fz-small')
    let span = document.createElement('span')
    span.classList.add('badge')
    span.classList.add('badge-danger')
    span.classList.add('mb-2')
    let h4 = document.createElement('h4')
    h4.classList.add('alert-heading')
    h4.classList.add('fz-small')
    h4.classList.add('pull-right')
    let p = document.createElement('p')
    alert.appendChild(span)
    alert.appendChild(h4)
    alert.appendChild(p)
    return alert
  })

// draw messages in chat window
  const drawMessage = (msg) => {
    let chat_window = document.querySelector('#chat_window')
    let alert = messageDOMDraft().cloneNode(true)
    let span = alert.querySelector('span')
    let h4 = alert.querySelector('.alert-heading')
    let p = alert.querySelector('p')
    h4.innerText = moment(msg.date).format('lll')
    p.innerText = msg.text
    let sender = R.find(R.propEq('_id', msg.senderId))(usersList)
    let senderNick = sender ? sender.nickname : ''
    let senderName = sender ? sender.username : ''
    span.innerText = `${senderName} (@${senderNick})`
    if (msg.senderId === currentUser._id) {
      alert.classList.add('alert-success')
      alert.classList.add('ml-5')
    } else if (R.test(new RegExp(`@${currentUser.nickname}`), msg.text)) {
      alert.classList.add('alert-warning')
      alert.classList.add('mr-5')
    } else {
      alert.classList.add('alert-info')
      alert.classList.add('mr-5')
    }
    chat_window.appendChild(alert)
    chat_window.scrollTop = chat_window.scrollHeight
  }

  const drawAllMessages = (messages) => {
    R.forEach(drawMessage)(messages)
  }

  // exit from chat
  const exit = () => {
    socket.emit('user:exit', currentUser)
    location.reload()
  }

  // custom sort by date
  const sortMessages = R.curry(R.sort(R.comparator((a, b) => moment(a.date).isBefore(b.date))))

  // delay 1 min after login. Then change status
  const delayForStatus = () => {
    setTimeout(() => {
      let forSending = R.clone(currentUser)
      forSending.status = 'online'
      socket.emit('user:changeStatus', forSending)
    },1000*60)
  }

  // add new user
  const goToRegister = () => {
    let nickname = $('#newLogin')[0].value
    let username = $('#username')[0].value
    if (!nickname || !username) {
      $fg_new.addClass('has-danger')
      return
    }
    let user = R.find(R.propEq('nickname', nickname))(usersList)
    if (user) {
      $fg_new.addClass('has-danger')
      return
    }
    let userForSending = {
      nickname: nickname,
      username: username,
      status: 'just appeared'
    }
    socket.emit('user:add', userForSending)
    $modal.modal('hide')
    $('#greetings').text(`Hello, ${username}`)
    delayForStatus()
  }

  // login
  const goToChat = () => {
    let nickname = $('#login')[0].value
    if (!nickname) $fg_sign.addClass('has-danger')
    let user = R.find(elem => elem.nickname === nickname && elem.status === 'offline')(usersList)
    if (!user) {
      $fg_sign.addClass('has-danger')
      return
    }
    user.status = 'just appeared'
    currentUser = user
    socket.emit('user:changeStatus', user)
    delayForStatus()
    $modal.modal('hide')
    $('#greetings').text(`Hello, ${currentUser.username}`)
    socket.emit('message:getAll')

  }

  // refresh DOM elements in active users list
  const refreshUsers = (users) => {
    let badge = `<h2 class="badge d-block"></h2>`
    let onlineUsers = R.reject(user => user.status === 'offline' || user._id === currentUser._id)(users)
    $active_users.find('h2').remove()
    if (!R.isEmpty(currentUser)) {
      $active_users.append($(badge).addClass('badge-default').text(`${currentUser.username} (@ ${currentUser.nickname})`))
    }
    R.forEach(user => {
      let statusBadge = user.status === 'online' ? 'badge-info' : 'badge-success'
      $active_users.append($(badge).addClass(statusBadge).text(`${user.username} (@ ${user.nickname})`))
    })(onlineUsers)

  }

  // add message and delete first
  const addOneMessage = (msg) => {
    if (msg) {
      messages.shift()
      $('#chat_window .alert:first').remove()
      messages.push(msg)
      drawMessage(msg)
    }
  }

  const showTyping = (nickname) => {
    $('#typing').text(`@${nickname} is typing...`)
  }

  const hideTyping = () => {
    $('#typing').text('')
  }

  const sendMessage = () => {
    let message = {
      senderId: currentUser._id,
      text: $message.value
    }
    socket.emit('message:add', message)
  }

  // emit event when message field on focus
  const startTyping = () => {
    socket.emit('user:typing:start', currentUser.nickname)
  }

  // emit event when focus is lost
  const stopTyping = () => {
    socket.emit('user:typing:stop', currentUser.nickname)
  }

  // get all users
  socket.on('user:getAll', users => {
    usersList = users
  })

  // event when users change
  socket.on('user:change', users => {
    usersList = users
    refreshUsers(usersList)
  })

  // event when user add
  socket.on('user:add', user => {
    currentUser = user
  })

  // someone start typing
  socket.on('user:typing:start', nickname => {
    showTyping(nickname)
  })

  // someone stop typing
  socket.on('user:typing:stop', () => {
    console.log('stop')
    hideTyping()
  })

  // get all message, trim to 100pcs and sorting them by date
  socket.on('message:getAll', msgs => {
    if (msgs.length > 100) msgs = msgs.splice(-100)
    messages = sortMessages(msgs)
    drawAllMessages(messages)
  })

  socket.on('message:add', message => {
    $message.value = ''
    addOneMessage(message)
  })

  // user exit
  socket.on('user:gone', user => {
    $gone.text(`User ${user.username} is gone!`)
    setTimeout(() => {$gone.text('')}, 2000)
  })


  // DOM events
  $('#message').focus(startTyping)
  $('#message').focusout(stopTyping)
  $('#login').on('focus', () => {$fg_sign.removeClass('has-danger')})
  $('#username').on('focus', () => {$fg_new.removeClass('has-danger')})
  $('#newLogin').on('focus', () => {$fg_new.removeClass('has-danger')})
  $('#exit_btn').on('click', exit)
  $('#go_btn').on('click', goToChat)
  $('#reg_btn').on('click', goToRegister)
  $('#send_btn').on('click', sendMessage)
  $('#message').on('keyup', (event) => {
    if (event.keyCode === 13) sendMessage()
  })

})()