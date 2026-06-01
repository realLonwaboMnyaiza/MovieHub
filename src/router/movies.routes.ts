import express, { Request, Response } from 'express';
import { Movie, validate } from '../models/movie.model';
import { Genre } from '../models/genre.model';
import authenticate from '../middleware/authentication.middleware';
import authorize from '../middleware/authorization.middleware';
import validateGuid from '../middleware/guid-validation.middleware';

const router = express.Router();

const baseURL = '/api/movies';

router.get(baseURL, async (req: Request, res: Response) => {
  const movies = await Movie.find();
  if (!movies) res.status(404).send('No movies exist in the database.');

  res.status(200).send(movies);
});

router.get(
  `${baseURL}/:id`,
  [validateGuid],
  async (req: Request, res: Response) => {
    const movieId = req.guid;
    const movie = await Movie.findById(movieId);

    if (!movie) res.status(404).send('Movie does not exist.');

    res.status(200).send(movie);
  },
);

router.post(
  baseURL,
  [authenticate, authorize],
  async (req: Request, res: Response) => {
    const title = req.body.title;
    const genreId = req.body.genreId;
    const numberInStock = req.body.numberInStock;
    const dailyRentalRate = req.body.dailyRentalRate;

    const { error } = validate(req.body);
    if (error) {
      res.status(400).send(error?.details[0]?.message);
    }

    if (!genreId) res.status(400).send('Genre id invalid');
    const genre = await Genre.findById(genreId);

    const movie = await new Movie({
      title,
      genre,
      numberInStock,
      dailyRentalRate,
    });

    await movie.save();
    res.status(201).send(`Movie has been saved: ${movie}`);
  },
);

router.put(
  `${baseURL}/:id`,
  [authenticate, authorize, validateGuid],
  async (req: Request, res: Response) => {
    const movieId = req.guid;
    const movie = await Movie.findById(movieId);

    const { error } = validate(req.body);
    if (error) {
      res.status(400).send('Request no valid.');
    }

    const genreId = req.body.genreId;
    if (!genreId) res.status(400).send('Genre id invalid');

    const title = req.body.title;
    const numberOfStock = req.body.numberInStock;
    const dailyRentalRate = req.body.dailyRentalRate;

    const genre = await Genre.findById(genreId);

    if (!movie || !genre) res.status(404).send('An error occured.');
    movie!.title = title;
    if (genre) movie!.genre = genre;
    movie!.numberInStock = numberOfStock;
    movie!.dailyRentalRate = dailyRentalRate;
    await movie!.save();

    res.status(201).send(`Movie has been updated: ${movie}.`);
  },
);

router.delete(
  `${baseURL}/:id`,
  [authenticate, authorize, validateGuid],
  async (req: Request, res: Response) => {
    const movieId = req.guid;
    const movie = await Movie.findById(movieId);

    if (!movie) res.status(404).send('Movie does not exist.');

    await Movie.deleteOne({ _id: movieId });

    res
      .status(201)
      .send(`The following movie has been deleted: ${movie?.title}`);
  },
);

export default router;
