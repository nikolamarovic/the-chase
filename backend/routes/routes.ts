const { Router } = require('express');

const router = Router();

// *** CONTROLLERS ***
const authController = require('../controllers/authController');
const userController = require('../controllers/userController')
const questionController = require('../controllers/questionController');


// *** AUTH ROUTES ***
router.route('/prijava').get(authController.prijava_get);
router.route('/prijava').post(authController.prijava_post);
router.route('/registracija').get(authController.registracija_get);
router.route('/registracija').post(authController.registracija_post);


// *** CHECKING PROTECTED ROUTES ***
router.route('/provera').post(authController.provera);


// *** LOGOUT ***
router.route('/odjava').post(authController.odjava);


// *** USER ***
router.route('/dohvatiKorisnikaPoIdu').post(userController.dohvKorisnikaPoIdu);
router.route('/dohvatiKorisnikaPoKorImenu').post(userController.dohvKorisnikaPoKorImenu);


// *** QUESTIONS ***
router.route('/dohvatiPitanjaPoTezini').post(questionController.dohvatiPitanjaPoTezini);
router.route('/dohvatiPitanjaPoKategoriji').post(questionController.dohvatiPitanjaPoKategoriji);

// *** GAMES ***
router.route('/dohvatiIgre').get(questionController.dohvatiIgre);

module.exports = router;