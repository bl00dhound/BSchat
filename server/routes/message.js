const router = require('express').Router()
const messageService = require('../services/message')


router.get('/', (req, res) => {
  messageService.getAll()
    .then( messages => res.status(200).send(messages))
    .catch( err => res.sendStatus(400))
})

router.get('/new/:date', (req, res) => {
  messageService.getLasts(req.params.date)
    .then( messages => {
      console.log(messages)
      return res.status(200).send(messages)
    } )
    .catch( err => res.sendStatus(400))
})

router.post('/', (req, res) => {
  messageService.addMessage(req.body)
    .then( message => res.status(201).send(message))
    .catch( err => res.sendStatus(400))
})

module.exports = router