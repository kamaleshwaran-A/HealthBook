const express = require("express");
const { Pool } = require("pg"); // Change to pg
const bodyParser = require("body-parser");
const path = require('path');
const user = require('./routes/user');
const multer = require('multer');
const { render } = require("ejs");
const app = express();
const port = process.env.PORT || 4044;

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const pool = new Pool({
    host: "localhost",
    user: "postgres",
    password: "root",
    database: "hospital",
    port: 5432
});

pool.connect(err => {
    if (err) {
        console.error("Error connecting to PostgreSQL:", err);
        return;
    }
    console.log("Connected to PostgreSQL");
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

global.db = pool;
app.get("/", user.home);
app.get('/login', user.login); // loginPage
app.get('/signup', user.signup); // signupPage
app.post('/signup', user.signupS); // store login user
app.post('/login', user.loginTo); // check user
app.get("/insert", user.insertA); // appointment
app.post("/insert", user.insertdata); // insert data
app.post("/logout", user.logout); // logout
app.post("/delete", user.delete); // delete appointment
app.get("/report", user.report); // show appointments
app.post("/home", user.exit);





app.get('/in', user.renderIndex);
app.post('/in', upload.single('photo'), (req, res) => user.insertDoctor(req, res, pool));
app.get('/re', (req, res) => user.getDoctors(req, res, pool));
app.get('/del', (req, res) => user.renderDelete(req, res, pool));
app.post('/delete/:id', (req, res) => user.deleteDoctor(req, res, pool));
app.get('/up', (req, res) => user.renderUpdate(req, res, pool));
app.post('/update/:id', upload.single('photo'), (req, res) => user.updateDoctor(req, res, pool));



app.listen(port, () => {
});