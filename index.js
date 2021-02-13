const express = require('express')
const cors = require('cors')
require('dotenv').config();
const fileUpload = require('express-fileupload')
const fs = require('fs-extra');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('doctors'))
app.use(fileUpload())


const port = 4000;

app.get('/', (req, res) => {
  res.send("hello from server")
});
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kpq4d.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true  });
client.connect(err => {
  const appointmentCollection = client.db("doctorsPortal").collection("appointments");
  const doctorsCollection = client.db("doctorsPortal").collection("doctors");
  console.log('im connected to db')

  app.post("/addAppointment",(req,res) => {
    const appointment = req.body;
    appointmentCollection.insertOne(appointment)
      .then(result=> {
      res.send(result)
    })
     
  })

  app.post('/appointments-list', (req, res) => {
    const byDate = req.body;
    const email = req.body.email;
    doctorsCollection.find({ email: email })
      .toArray((err, doctors) => {
        const filter = { date: byDate.date };
        if (doctors.length ===0) {
          filter.email = email;
        }
        appointmentCollection.find(filter)
          .toArray((err, documents) => {
            res.send(documents)
          })
      })
  });
  app.post('/is-doctor', (req, res) => {
    const email = req.body.email;
    doctorsCollection.find({ email: email })
      .toArray((err, doctors) => {
        res.send(doctors.length > 0);
      })
  });


  app.get('/all-patietns', (req, res) => {
    appointmentCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  });

  app.post('/add-doctor', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;    
    const filePath = `${__dirname}/doctors/${file.name}`;
    
    file.mv(filePath, err => {
      if (err) {
        console.log(err)
        res.status(500).send({mgs: 'Failded to upload image'})
      }
      const newImg = fs.readFileSync(filePath);
      const encImg = newImg.toString('base64');
      let image = {
        contentType: req.files.file.mimetype,
        size: req.files.file.size,
        img: Buffer(encImg, 'base64')
      };
      doctorsCollection.insertOne({ name, email,phone, image })
        .then(result => {
          fs.remove(filePath, error => {
            if (error) {
              console.log(error)
              res.status(500).send({ mgs: 'Failded to upload image' })
            }
            res.send(result.insertedCount>0)
          })
      })
      // return res.send({name: file.name,path:`/${file.name}`})
    })
  })
  app.get('/doctors', (req, res) => {
    doctorsCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })


});


app.listen(process.env.PORT || port)
