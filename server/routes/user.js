const router = require('express').Router()
const userService = require('../services/user')


router.get('/', (req, res) => {
  userService.getAll()
    .then( users =>  res.status(200).send(users))
    .catch( err => res.sendStatus(400))
})

router.post('/', (req, res) => {
  userService.addUser(req.body)
    .then( user => res.status(201).send(user))
    .catch( err => res.sendStatus(400))
})

router.put('/:id', (req, res) => {
  userService.updateUser(req.params.id, req.body)
    .then( user => res.status(200).send(user))
    .catch( err => res.sendStatus(400))
})


module.exports = router