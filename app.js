const express = require('express')
const {
  validateMovieSchema,
  validatePartialMovieSchema
} = require('./movie.schema.js')
const crypto = require('node:crypto')
const cors = require('cors')
const movies = require('./movies.json')

const app = express()

app.disable('x-powered-by')
app.use(
  cors({
    origin: (origin, callback) => {
      const ALLOWED_ORIGINS = ['http://localhost:5500', 'http://localhost:3001']
      if (ALLOWED_ORIGINS.includes(origin) || !origin) {
        return callback(null, true)
      }

      return callback(new Error('Not allowed by CORS'))
    }
  })
)

app.use(express.json())

app.get('/movies', (req, res) => {
  const { genre } = req.query
  if (genre) {
    const filteredMoviesByGenre = movies.filter(movie =>
      movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )

    if (genre) return res.json(filteredMoviesByGenre)
  }
  res.json(movies)
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)
  if (!movie) return res.status(404).json({ message: 'Movie not found' })
  res.json(movie)
})

app.post('/movies', (req, res) => {
  const validationResults = validateMovieSchema(req.body)

  const movieAlreadyExists = movies.some(
    movie =>
      movie.title === validationResults.data.title &&
      movie.year === validationResults.data.year &&
      movie.director === validationResults.data.director &&
      JSON.stringify(movie.genre) ===
        JSON.stringify(validationResults.data.genre) &&
      movie.poster === validationResults.data.poster &&
      movie.duration === validationResults.data.duration &&
      movie.rate === validationResults.data.rate
  )

  if (movieAlreadyExists) {
    return res.status(409).json({ message: 'Movie already exists' })
  }

  if (validationResults.error) {
    return res
      .status(422)
      .json({ error: JSON.parse(validationResults.error.message) })
  }

  const newMovie = {
    id: crypto.randomUUID(),
    ...validationResults.data
  }

  // The following code breaks the concept of immutability of the REST architecture
  movies.push(newMovie)

  res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const validationResults = validatePartialMovieSchema(req.body)

  if (!validationResults.success) {
    return res
      .status(400)
      .json({ error: JSON.parse(validationResults.error.message) })
  }

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  const updatedMovie = {
    ...movies[movieIndex],
    ...validationResults.data
  }

  movies[movieIndex] = updatedMovie

  return res.json(updatedMovie)
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)

  return res.status(200).json({ message: 'Movie deleted' })
})

const PORT = process.env.PORT ?? 3001

app.listen(PORT, () =>
  console.log(`Server listening on port http://localhost:${PORT}`)
)
