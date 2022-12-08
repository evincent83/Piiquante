const express = require('express');
const auth =  require('../middleware/auth');
const multer = require('../middleware/multer-config');
const sauceCtrl = require('../controllers/sauces');
const router = express.Router();

router.get('/', auth, sauceCtrl.getAllSauces); // Get Array of sauces
router.get('/:id', auth, sauceCtrl.getOneSauce); // Get single sauce with ID
router.post('/', auth, multer, sauceCtrl.createSauce); // Créer une sauce
router.put('/:id', auth, multer, sauceCtrl.modifySauce); // Modify a sauce
router.delete('/:id', auth, sauceCtrl.deleteSauce); // Delete sauce with ID
router.post('/:id/like', auth, sauceCtrl.likeDislike) // Sauce like / dislike

module.exports = router;