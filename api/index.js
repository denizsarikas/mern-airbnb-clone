const express = require('express');
const cors = require('cors');
const { mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Place = require('./models/Place');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');


require('dotenv').config();



const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'dskajlfşsljfasşj';

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

// app.use(cors());
app.use(cors({
    credentials: true,
    origin: 'http://127.0.0.1:5173',
}));


mongoose.connect(process.env.MONGO_URL);


app.get('/test', (req, res) => {
    res.json('backend running');
})

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    // res.json({name, email, password});
    try {
        const userDoc = await User.create({
            name,
            email,
            password: bcrypt.hashSync(password, bcryptSalt),
        });
        res.json(userDoc);
    } catch (e) {
        res.status(422).json(e);
    }
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userDoc = await User.findOne({ email })
        if (userDoc) {
            // res.json('found')
            const passOk = bcrypt.compareSync(password, userDoc.password)
            if (passOk) {
                jwt.sign({
                    email: userDoc.email,
                    id: userDoc._id,
                    // name: userDoc.name
                }, jwtSecret, {}, (err, token) => {
                    if (err) throw err;
                    // res.cookie('token', token).json('password ok')
                    res.cookie('token', token).json(userDoc)
                });
            } else {
                res.status(401).json('password wrong')
            }
        } else {
            res.json('not found')
        }
    } catch (e) {

    }
})

app.get('/profile', (req, res) => {
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;
            // const userDoc = await User.findById(userData.id);
            const { name, email, _id } = await User.findById(userData.id);
            res.json({ name, email, _id });
        })
    } else {
        res.json(null);
    }
})

app.post('/logout', (req, res) => {
    res.cookie('token', '').json(true);
})

// console.log(__dirname)
app.post('/upload-by-link', async (req, res) => {
    const { link } = req.body;
    const newName = `photo` + Date.now() + `.jpg`;
    await imageDownloader.image({
        url: link,
        dest: __dirname + `/uploads/` + newName,
    });
    res.json(newName)
})

const photosMiddleware = multer({ dest: 'uploads/' });
app.post('/upload', photosMiddleware.array('photos', 100), (req, res) => {
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
        const { path, originalname } = req.files[i];
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        const newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
        // console.log('ilk-> ' + newPath)
        // uploadedFiles.push(newPath.replace('uploads/', ''));
        uploadedFiles.push(newPath.replace('uploads', ''));
        // console.log('son-> ' + uploadedFiles)
    }
    // console.log(req.files)
    // res.json(req.files);
    res.json(uploadedFiles);
});


// app.post('/places', function (req, res){
//     //
// })
app.post('/places', (req, res) => {
    const { token } = req.cookies;
    const {
        title,
        address,
        addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const placeDoc = await Place.create({
            owner: userData.id,
            title,
            address,
            photos: addedPhotos,
            description,
            perks,
            extraInfo,
            checkIn,
            checkOut,
            maxGuests,
        })
        res.json(placeDoc);
    });
});


app.get('/places', (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        const { id } = userData;
        res.json(await Place.find({ owner: id }));
    });
});


// app.listen(4000);
app.listen(4000, () => {
    console.log("backend running")
});