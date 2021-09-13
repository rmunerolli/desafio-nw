const express = require('express');
const router = express.Router();
const config = require('config');
const multer = require('multer');
const app = require('../controllers/app');

/**
 * ## Configurção do Multer ##
 * Responsavel por armazenar o arquivo para futura leitura
 */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/")
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname)
    }
});

const upload = multer({ storage })
/**
 *  Get para página que carrega aqrquivo
 */
router.get('/', function (req, res, next) {
    res.redirect('/./index.html');
});

/**
 *  Post da rota que recebe oarquivo
 */
router.post('/upload', upload.single("file"), async function (req, res, next) {
    await app.arquivo(req.file.filename);
    res.send("Arquivo recebido!");
});


module.exports = router;