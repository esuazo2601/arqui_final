const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Conexión a MongoDB
/* mongoose.connect('mongodb://mongo:27017/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));
 */
app.get('/', (req, res) => {
    res.send('Hello from dido!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
