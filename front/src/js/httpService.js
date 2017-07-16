const backendUrl = `http://127.0.0.1:9009/api`

class HttpService {

  static getUsers() {
    return $.get(backendUrl + '/user', data => {
      return data
    })
  }

  static getMessages() {
    return $.get(backendUrl + '/message', data => {
      return data
    })
  }

  // get messages after that date
  static getNewMessages(date) {
    return $.get(backendUrl + '/message/new/' + date, data => {
      return data
    })
  }

  static addUser(user) {
    return $.post(backendUrl + '/user', {
      "nickname": user.nickname,
      "username": user.username,
      "status": "online"
    })
  }

  static addMessage(message) {
    return $.post(backendUrl + '/message', {
      "senderId": message.senderId,
      "text": message.text,
    })
  }

  static updateStatus(status, id) {
    return $.ajax({
      url: backendUrl + '/user/' + id,
      type: 'PUT',
      data: {
        "status": status
      },
      success: user => user
    })
  }

}