const express = require('express')
const cors = require('cors')
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());


const port = 4000;

app.get('/', (req, res) => {
  res.send("hello from server")
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kpq4d.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentCollection = client.db("doctorsPortal").collection("appointments");
  console.log('im connected to db');

  app.post('/addAppointment', (req, res) => {
    const appointment = req.body;
    appointmentCollection.insertOne(appointment)
      .then(res => {
        res.send(res.insertedCount > 0)
    })
  })

  app.post('/appointments-list', (req, res) => {
    const listByDate = req.body;
    appointmentCollection.find({ date: listByDate.date })
    .toArray((err, documents) => {
      res.send(documents)
    })
  
   
  })
  app.get('/appointments', (req, res) => {
    appointmentCollection.find({})
      .toArray((err, documents) => {
      res.send(documents)
    })
  })


});


app.listen(process.env.PORT || port)
