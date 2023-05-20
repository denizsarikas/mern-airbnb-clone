const express = require('express');
const app = express();

app.get('/test', (req, res) => {
    res.json('backend running');
})

app.listen(4000);