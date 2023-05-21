const express = require('express');
const cors = require('cors');
const { mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const cookieParser = require('cookie-parser')
require('dotenv').config();



const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'dskajlfşsljfasşj';

app.use(express.json());
app.use(cookieParser());

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

// app.listen(4000);
app.listen(4000, () => {
    console.log("backend running")
});