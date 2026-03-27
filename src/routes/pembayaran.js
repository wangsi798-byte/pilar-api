const router = require('express').Router()
const ctrl   = require('../controllers/pembayaranController')
const { protect } = require('../middleware/auth')

router.use(protect)

router.get('/rekap', ctrl.rekap)        // HARUS sebelum /:id
router.route('/').get(ctrl.getAll).post(ctrl.create)
router.route('/:id').put(ctrl.update).delete(ctrl.remove)

module.exports = router
