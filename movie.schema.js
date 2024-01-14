const z = require('zod')
const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title is required'
  }),
  year: z.number().int().min(1800).max(2025),
  duration: z.number().int().positive(),
  director: z.string(),
  rate: z.number().min(0).max(10),
  poster: z.string().url({ message: 'Movie poster must be a valid URL' }),
  genre: z.array(
    z.enum(
      [
        'Action',
        'Adventure',
        'Comedy',
        'Drama',
        'Fantasy',
        'Horror',
        'Thriller',
        'Western',
        'Sci-Fi',
        'Romance',
        'Animation',
        'Musical',
        'Documentary',
        'War',
        'Crime',
        'Mystery',
        'Family',
        'History',
        'Biography',
        'Sport',
        'Music',
        'Short',
        'Film-Noir',
        'Talk-Show',
        'News',
        'Reality-TV',
        'Game-Show',
        'Adult',
        'Lifestyle',
        'Experimental',
        'Erotic',
        'Concert',
        'Opera'
      ],
      {
        required_error: 'Movie genre is required',
        invalid_type_error: 'Movie genre must be an array of enum Genre'
      }
    )
  )
})

function validateMovieSchema (shape) {
  return movieSchema.safeParse(shape)
}

function validatePartialMovieSchema (shape) {
  return movieSchema.partial().safeParse(shape)
}

module.exports = { validateMovieSchema, validatePartialMovieSchema }
