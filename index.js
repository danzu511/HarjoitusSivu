const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const Note = require('./models/note')

console.log(process.argv.length)
console.log(process.argv[2])

app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))
app.use(express.static('build'))

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}
app.use(requestLogger)


  
  app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
  })
  
  app.get('/api/notes', (req, res) => {
    console.log(Note)
    console.log('sdadas')
    Note.find({}).then(notes => {
      res.json(notes)
    })
  })

  app.get('/api/notes/:id', (request, response, next) => {
    Note.findById(request.params.id)
    .then(note => {
      if(note) {
        response.json(note)
      }
      else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
  })

  app.post('/api/notes', (request, response, next) => {
    const body = request.body

    if(body.content === undefined) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const note = new Note({
        content: body.content,
        important: body.important || false,
    })
    console.log(note)
    note.save()
      .then(savedNote => {
        response.json(savedNote)
      })
      .catch(error => next(error))
  })
  app.delete('/api/notes/:id', (request, response, next) => {
    Note.findByIdAndRemove(request.params.id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
  })

  app.put('/api/notes/:id', (request, response, next) => {
    const body = request.body
  
    const note = {
      content: body.content,
      important: body.important,
    }
  
    Note.findByIdAndUpdate(request.params.id, note, 
      { new: true, runValidators: true, context: 'query' })
      .then(updatedNote => {
        response.json(updatedNote)
      })
      .catch(error => next(error))
  })

  const unknownEndpoint = (req, res) => {
    res.status(404).send ({error: 'unknown error'})
  }
  app.use(unknownEndpoint)

  const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    }
    else if (error.name === 'ValidationError') {
      return response.statuts(400).json({ error: error.message })
    }
  
    next(error)
  }
  // tämä tulee kaikkien muiden middlewarejen rekisteröinnin jälkeen!
  app.use(errorHandler)

  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })