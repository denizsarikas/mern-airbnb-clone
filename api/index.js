const express = require('express');
const cors = require('cors');
const { mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Place = require('./models/Place');
const Booking = require('./models/Booking');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const fs = require('fs');
const mime = require('mime-types');


require('dotenv').config();



const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'dskajlfşsljfasşj';
const bucket = 'deniz-booking-app';

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

// app.use(cors());
app.use(cors({
    credentials: true,
    origin: 'http://127.0.0.1:5173',
}));


// mongoose.connect(process.env.MONGO_URL);

// try {
//     const data = await client.send(new PutObjectCommand({
//         Bucket: bucket,
//         Body: fs.readFileSync(path),
//         Key: newFilename,
//         ContentType: mimetype,
//         ACL: 'public-read',
//     }));
//     console.log({ data })
// } catch (err) {
//     throw err;

// }

async function uploadToS3(path, originalFilename, mimetype) {
    const client = new S3Client({
        region: 'eu-north-1',
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
        },
    });
    const parts = originalFilename.split('.');
    const ext = parts[parts.length - 1];
    const newFilename = Date.now() + '.' + ext;
    // const data = await client.send(new PutObjectCommand({
    await client.send(new PutObjectCommand({
        Bucket: bucket,
        Body: fs.readFileSync(path),
        Key: newFilename,
        ContentType: mimetype,
        ACL: 'public-read',
    }));
    // console.log(path, originalFilename, mimetype); //obje olarak loglamak daha iyi
    // console.log({path, originalFilename, mimetype, ext});
    // console.log({data})
    return `https://${bucket}.s3.amazonaws.com/${newFilename}`;
}

function getUserDataFromReq(req) {
    return new Promise((resolve, reject) => {
        jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;
            resolve(userData)
        });
    })
}


app.get('/test', (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
    res.json('backend running');
})

app.post('/register', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
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
    mongoose.connect(process.env.MONGO_URL);
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
    mongoose.connect(process.env.MONGO_URL);

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
        // dest: __dirname + `/uploads/` + newName,
         dest: `/tmp/` + newName,
    });
    const url = await uploadToS3(`/tmp/` + newName, newName, mime.lookup(`/tmp/` + newName) );
    res.json(url);
})

//  const photosMiddleware = multer({ dest: 'uploads/' });
const photosMiddleware = multer({ dest: '/tmp' });
// app.post('/upload', photosMiddleware.array('photos', 100), (req, res) => {
app.post('/upload', photosMiddleware.array('photos', 100), async (req, res) => {
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
        const { path, originalname, mimetype } = req.files[i];
        const url = await uploadToS3(path, originalname, mimetype)
        uploadedFiles.push(url)
        // const parts = originalname.split('.');
        // const ext = parts[parts.length - 1];
        // const newPath = path + '.' + ext;
        // fs.renameSync(path, newPath);
        // // console.log('ilk-> ' + newPath) //her turlu comment out
        // // uploadedFiles.push(newPath.replace('uploads/', '')); //her turlu comment out
        // uploadedFiles.push(newPath.replace('uploads', ''));
        // // console.log('son-> ' + uploadedFiles) //her turlu commentout
    }
    // console.log(req.files)
    // res.json(req.files);
    res.json(uploadedFiles);
});


// app.post('/places', function (req, res){
//     //
// })
app.post('/places', (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
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
        maxGuests,
        price
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
            price
        })
        res.json(placeDoc);
    });
});


app.get('/user-places', (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
    const { token } = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        const { id } = userData;
        res.json(await Place.find({ owner: id }));
    });
});

app.get('/places/:id', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
    // res.json(req.params);
    const { id } = req.params;
    res.json(await Place.findById(id));
})

app.put('/places', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
    const { token } = req.cookies;
    const {
        id,
        title,
        address,
        addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests,
        price
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const placeDoc = await Place.findById(id);
        // console.log(userData.id);
        // console.log(placeDoc.owner.toString());
        if (userData.id === placeDoc.owner.toString()) {
            placeDoc.set({
                title,
                address,
                photos: addedPhotos,
                description,
                perks,
                extraInfo,
                checkIn,
                checkOut,
                maxGuests,
                price
            });
            await placeDoc.save();
            res.json('ok');
        }
    });
});

app.get('/places', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
    res.json(await Place.find())
})


app.post('/bookings', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
    const userData = await getUserDataFromReq(req);
    const {
        place, checkIn, checkOut, numberOfGuests, name, phone, price,
    } = req.body;
    Booking.create({
        place, checkIn, checkOut, numberOfGuests, name, phone, price,
        user: userData.id
    }).then((doc) => {
        res.json(doc);
    }).catch((err) => {
        throw err;
    });
});



app.get('/bookings', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
    const userData = await getUserDataFromReq(req);
    res.json(await Booking.find({ user: userData.id }).populate('place'));
})


// app.listen(4000);
app.listen(4000, () => {
    console.log("backend running")
});