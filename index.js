const app = require('express')()
const bodyParser = require('body-parser')
const cors = require('cors')
const cCPUs = require('os').cpus().length
const cluster = require('cluster')
const multer = require("multer")
const fs = require('fs')
const { diskStorage, convert } = require('./config')

if (cluster.isMaster) {
  for (let i = 0; i < cCPUs; i++) {
    cluster.fork();
  }
  cluster.on('online', function (worker) {
    console.log('Worker ' + worker.process.pid + ' is online.');
  });
  cluster.on('exit', function (worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died.');
  });
} else {
  app.use(cors())
  app.listen(4000)
  console.log('RESTful API server started on: ' + 4000)
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())
  app.route('/').get(function (req, res) {
    res.status(200).send(`Api image to text with express js`)
  })
  app.route('/').post(multer({ storage: diskStorage }).single('image'), async function (req, res) {
    const file = req.file.path
    if (!file) {
      res.status(400).send({
        status: false,
        data: "No File is selected.",
      })
    }
    const result = await convert(file)
    await fs.unlinkSync(file)
    res.status(result.code).send({
      status: result.status,
      data: result.data,
    })
  })
}