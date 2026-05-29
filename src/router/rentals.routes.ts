import express, { Request, Response } from 'express';
import Fawn from 'fawn';
import authenticate from '../middleware/authentication.middleware';
import { Rental, validate } from '../models/rental.model';
import { Customer } from '../models/customer.model';
import { Movie } from '../models/movie.model';

const router = express.Router();

const database = process.env.DATABASE;
Fawn.init(database);

const baseURL = '/api/rentals';

router.get(baseURL, async (req: Request, res: Response) => {
  const rentals = await Rental.find().sort({ checkoutDate: -1 });
  res.status(200).send(rentals);
});

router.post(`${baseURL}/checkout`, authenticate, async (req: Request, res: Response) => {
  const { error } = validate(req.body);
  if (error) res.status(400).send(error?.details[0]?.message);

  const customerId = req.body.customerId;
  const movieId = req.body.movieId;
  const customer = await Customer.findById(customerId);
  const movie = await Movie.findById(movieId);
  if (!movie) res.status(404).send('Movie with the specified ID does not exist');
  const movieDto = {
    title: movie?.title,
    dailyRentalRate: movie?.dailyRentalRate,
  };

  if (!customer )
    res.status(400).send('Valid customer is required.');

  if (movie!.numberInStock < 1) res.status(400).send('Movie is out of stock.');

  const rental = new Rental({
    customer,
    movieDto,
  });

  try {
    await new Fawn.Task()
      .save('rentals', rental)
      .update(
        'movies',
        { _id: movie?._id },
        {
          $inc: { numberInStock: -1 },
        },
      )
      .run();
  } catch (error) {
    res.status(500).send('Transaction failed.');
  }

  // todo: loadash pick...
  const checkoutMovie = {
    title: movie?.title,
    genre: movie?.genre,
    rate: movie?.dailyRentalRate,
  };
  res.status(201).send(`Movie has been checked out. ${checkoutMovie}`);
});

router.post(`${baseURL}/return`, authenticate, (req: Request, res: Response) => {
  // todo: build out feature using TDD...
  res.status(400).send('Bad Request');
});

export default router;
