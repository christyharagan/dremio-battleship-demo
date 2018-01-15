// Windows Dremio ODBC driver:
// var DREMIO_ODBC_DRIVER = 'Dremio Connector'
// Linux Dremio ODBC driver:
var DREMIO_ODBC_DRIVER = 'Dremio ODBC Driver 64-bit'
var DREMIO_HOST = ''
var DREMIO_PORT = 31010
var DREMIO_USER = ''
var DREMIO_PASSWORD = ''
var AWS_ACCESS_KEY = ''
var AWS_SECRET_ACCESS_KEY = ''
var AWS_BUCKET = 'dremio-battleship'
var SERVER_PORT = 8080

var bodyParser = require('body-parser')
var path = require('path')
var AWS = require('aws-sdk')

var db = require('odbc')()
var cn = 'Driver=' + DREMIO_ODBC_DRIVER + ';ConnectionType=Direct;HOST=' + DREMIO_HOST + ';PORT=' + DREMIO_PORT + ';AuthenticationType=Plain;UID=' + DREMIO_USER + ';PWD=' + DREMIO_PASSWORD

var express = require('express')
var app = express()
var server = require('http').Server(app)
var io = require('socket.io')(server)
AWS.config.update({ accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_ACCESS_KEY })

db.open(cn, function (err) {
    if (err) return console.log(err)
})

process.on('SIGINT', function () {
    console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");

    db.close(function () {
        process.exit()
    })
})

app.use(bodyParser.json())

var shots = []
var shotsByXY = {}

app.get('/reset', function (req, res) {
    reset()
})

function reset(cb) {
    shots = []
    shotsByXY = {}
    writeShots()
}

reset()

function writeShots(cb) {
    var s3 = new AWS.S3()
    var base64data = Buffer.from(JSON.stringify({ shots: shots }), 'binary')

    s3.upload({
        Bucket: AWS_BUCKET,
        Key: 'shots.json',
        Body: base64data,
        ACL: 'public-read'
    }, function (err, data) {
        if (err) {
            console.log(err)
        } else if (cb) {
            cb()
        }
    })
}

app.get('/shots', function (req, res) {
    res.set('Content-Type', 'application/json')
    res.json(shots)
})

app.get('/premiums', function (req, res) {
    res.set('Content-Type', 'application/json')

    db.query('select * from "@' + DREMIO_USER + '".premiums', [42], function (err, data) {
        if (err) {
            console.log(err)
        } else {
            res.json(data)
        }
    })
})

app.use(express.static(__dirname))

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/index.html'))
})

server.listen(SERVER_PORT, function () {
    console.log('Listening on port: ' + SERVER_PORT)
})

var waitingOnShotWrite = false
var shotBuffer = []

function shoot(shot) {
    shots.push(shot)

    waitingOnShotWrite = true
    writeShots(function () {
        db.query('select sum(risk) as r, sum(cost) as c from "@' + DREMIO_USER + '".risk where shot_x=' + shot.x + ' and shot_y=' + shot.y, [42], function (err, data) {
            if (err) {
                console.log(err)
            } else {
                shot.risk = data[0].r
                shot.cost = data[0].c

                notifyShot(shot)

                if (shotBuffer.length > 0) {
                    var next = shotBuffer.splice(0, 1)[0]
                    shoot(next)
                } else {
                    waitingOnShotWrite = false
                }
            }
        })
    })
}

var sockets = []

function notifyShot(shot) {
    sockets.forEach(function (socket) {
        socket.emit('shot', shot)
    })
}

io.on('connection', function (socket) {
    sockets.push(socket)

    socket.on('shoot', function (shot) {
        var xy = '' + shot.x + shot.y
        if (!shotsByXY[xy]) {
            shotsByXY[xy] = true

            shot.shot_id = shots.length

            if (waitingOnShotWrite) {
                shotBuffer.push(shot)
            } else {
                shoot(shot)
            }
        }
    })
    socket.on('disconnect', function () {
        var i = sockets.indexOf(socket);
        sockets.splice(i, 1);
    })
})