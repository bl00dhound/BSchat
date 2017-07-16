(() => {
  // HTTP chat

  $('#modal').modal('show')

  let currentUser = {}
  let usersList = []
  let messages = []

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

  // custom sort by date
  const sortMessages = R.curry(R.sort(R.comparator((a, b) => moment(a.date).isBefore(b.date))))

  const loadMessages = () => {
    HttpService.getMessages()
      .then( data => {
        if (data.length > 100) data = data.splice(-100)
        return messages = sortMessages(data)
      })
      .then(drawAllMessages)
      .catch(console.error)

  }

  // get active users by status and draw them in active users window
  const addActiveUsers = () => {
    let activeUsers = R.reject(R.propEq('nickname', currentUser.nickname))(R.filter( user => user.status === 'online' || user.status === 'just appeared')(usersList))
    $('#active_users').append($(`<h2 class="badge badge-success d-block"></h2>`).text(`${currentUser.username} (@ ${currentUser.nickname})`))
    R.forEach(user => {
      $('#active_users').append($(`<h2 class="badge badge-info d-block"></h2>`).text(`${user.username} (@ ${user.nickname})`))
    })(activeUsers)
    loadMessages()
  }

  // add new user and enter to the chat
  const goToRegister = () => {
    let nickname = $('#newLogin')[0].value
    let username = $('#username')[0].value
    if (!nickname || !username) $('#fg-new').addClass('has-danger')
    HttpService.getUsers()
      .then( users => {
        usersList = users
        let user = R.find(R.propEq('nickname', nickname))(users)
        if (user) throw Error()
        return HttpService.addUser({
          nickname: nickname,
          username: username
        })
      })
      .then( user => {
        currentUser = user
        $('#modal').modal('hide')
        $('#greetings').text(`Hello, ${user.username}`)
        addActiveUsers()
      })
      .catch( () => { $('#fg-new').addClass('has-danger')})
  }

  // sign in and enter to the chat
  const goToChat = () => {
    let nickname = $('#login')[0].value
    if (!nickname) $('#fg-signin').addClass('has-danger')
    HttpService.getUsers()
      .then( users => {
        usersList = users
        let user = R.find(R.propEq('nickname', nickname))(users)
        if (!user) throw Error()
        return HttpService.updateStatus('just appeared', user._id)
      })
      .then( user => {
        currentUser = user
        $('#modal').modal('hide')
        $('#greetings').text(`Hello, @ ${user.username}`)
        addActiveUsers()
      })
      .catch( () => { $('#fg-signin').addClass('has-danger')})

  }

  // events for btns
  const go_btn = $('#go_btn').on('click', goToChat)
  const reg_btn = $('#reg_btn').on('click', goToRegister)

  // remove first and add last messages
  const addOneMessage = (msg) => {
    if (msg) {
      messages.shift()
      $('#chat_window .alert:first').remove()
      messages.push(msg)
      drawMessage(msg)
    }
  }

  const sendMessage = () =>
    HttpService.addMessage({
      senderId: currentUser._id,
      text: $('#message')[0].value,
    })
      .then( message => {
        $('#message')[0].value = ''
        addOneMessage(message)
      })
      .catch(console.error)

  // request for new messages
  const getNewMessages = () => {
    if (messages[messages.length-1]) {
      HttpService.getNewMessages(moment(messages[messages.length-1].date).valueOf())
        .then(R.map(addOneMessage))
        .catch(console.error)
    }
  }

  // exit, reload page and send status to "offline"
  const exit = () => {
    HttpService.updateStatus('offline', currentUser._id)
      .then( () => {location.reload()})
      .catch(console.error)

  }

  $('#login').on('focus', () => {$('#fg-signin').removeClass('has-danger')})
  $('#username').on('focus', () => {$('#fg-new').removeClass('has-danger')})
  $('#newLogin').on('focus', () => {$('#fg-new').removeClass('has-danger')})
  $('#send_btn').on('click', sendMessage)
  $('#exit_btn').on('click', exit)
  // press "enter"
  $('#message').on('keyup', (event) => {
    if (event.keyCode === 13) sendMessage()
  })

  // interval for requesting new messages
  setInterval(getNewMessages, 1000)



})()