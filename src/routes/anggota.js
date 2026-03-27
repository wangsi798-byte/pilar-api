const router = require('express').Router()
const ctrl   = require('../controllers/anggotaController')
const { protect } = require('../middleware/auth')

router.use(protect)                    // semua route butuh login

router.route('/')
  .get(ctrl.getAll)
  .post(ctrl.create)

router.route('/:id')
  .get(ctrl.getOne)
  .put(ctrl.update)
  .delete(ctrl.remove)

module.exports = router
