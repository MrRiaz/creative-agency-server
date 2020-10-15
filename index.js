const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x3yya.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());
app.use(express.static('doctors'));


const port = 5000;


app.get('/', (req, res) => {
  res.send("Hello from db it's working!")
});


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const orderCollection = client.db("creativeAgency").collection("serviceOrder");
  const reviewCollection = client.db("creativeAgency").collection("reviews");
  const adminCollection = client.db("creativeAgency").collection("admins");
  const servicesCollection = client.db("creativeAgency").collection("services");
  

  app.post('/addOrder', (req, res) => {
    const order = req.body;
    orderCollection.insertOne(order)
    .then(result => {
        res.send(result.insertedCount > 0)
    })
  });

  app.get('/checkProduct', (req, res) => {
    orderCollection.find({email: req.query.email})
    .toArray((err, products) => {
      res.send(products)
    })
  });


  app.get('/loadAllOrder', (req, res) => {
    orderCollection.find({})
    .toArray((err, allOrder) => {
      res.send(allOrder)
    })
  });

  app.post('/postReview', (req, res) => {
    const order = req.body;
    reviewCollection.insertOne(order)
    .then(result => {
        res.send(result.insertedCount > 0)
    })
  });

  app.get('/showreview', (req, res) => {
    reviewCollection.find({})
    .toArray((err, documents) => {
      res.send(documents)
    })
  });

  app.post('/addAdmin', (req, res) => {
    const admin = req.body;
    adminCollection.insertOne(admin)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  });

  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };

    servicesCollection.insertOne({ title, description, image })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  });

  app.get('/showService', (req, res) => {
    servicesCollection.find({})
    .toArray((err, services) => {
      res.send(services)
    })
  });

  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email })
      .toArray((err, admins) => {
        res.send(admins.length > 0)
      })
  });
  

});


app.listen(process.env.PORT || port);