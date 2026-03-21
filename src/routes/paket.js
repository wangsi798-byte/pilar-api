const router = require('express').Router()
const ctrl   = require('../controllers/paketController')
const { protect } = require('../middleware/auth')

router.use(protect)

router.route('/').get(ctrl.getAll).post(ctrl.create)
router.route('/:id').get(ctrl.getOne).put(ctrl.update).delete(ctrl.remove)

module.exports = router
