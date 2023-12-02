const express = require('express');
const passport = require('passport');
const router = express.Router();
const multer = require('multer');
const userController = require('../controllers/userController');

// Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

const upload = multer({ storage: storage });

const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    console.log(bearerHeader);
    if (typeof bearerHeader !== undefined) {
        const bearer = bearerHeader.split('.');
        const bearerToken = bearer[1];
        req.token = bearerHeader;
        next()
    } else {
        
    }
}

// Routes
router.get('/signup', userController.signup_get);

router.post('/signup', upload.single('avatar'), userController.signup_post);

router.get('/login', userController.login_get);

router.post('/login', userController.login_post);

router.get('/username/:username', userController.user_username_get);

router.post('/verify', verifyToken, userController.verify_user);

router.get('/:id', userController.user_profile_get);

router.get('/:id/contacts', userController.get_contacts);

router.post('/:user/add/:contact', userController.add_contact);

router.patch('/edit/avatar', upload.single('avatar'), userController.change_avatar);

router.patch('/edit/status', userController.change_status);

router.patch('/edit/avatar/delete', userController.delete_avatar);

module.exports = router;
