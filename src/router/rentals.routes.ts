import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import authenticate from '../middleware/authentication.middleware';
import { Rental, validate } from '../models/rental.model';
import { Customer } from '../models/customer.model';
import { Movie } from '../models/movie.model';
import authorize from '../middleware/authorization.middleware';

const router = express.Router();
const baseURL = '/api/rentals';

router.get(baseURL, async (req: Request, res: Response) => {
  const rentals = await Rental.find().sort({ checkoutDate: -1 });
  return res.status(200).send(rentals);
});

router.post(
  `${baseURL}/checkout`,
  [authenticate, authorize],
  async (req: Request, res: Response) => {
    const { error } = validate(req.body);
    if (error) res.status(400).send(error?.details[0]?.message);

    const customerId = req.body.customerId;
    const movieId = req.body.movieId;

    const customer = await Customer.findById(customerId);
    const movie = await Movie.findById(movieId);

    if (!movie)
      res.status(404).send('Movie with the specified ID does not exist');

    if (!customer) res.status(400).send('Valid customer is required.');

    if (movie!.numberInStock < 1)
      res.status(400).send('Movie is out of stock.');

    const rental = new Rental({
      customer,
      movie,
    });

    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      if (movie?.numberInStock) {
        movie.numberInStock = movie.numberInStock - 1;
        await movie?.save();
        await rental.save();
      } else {
        return res.status(400).send('Rental could not be processed.');
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      return res
        .status(500)
        .send(`Transaction failed with the following errors: ${error}`);
    } finally {
      session.endSession();
    }

    // todo: loadash pick...
    const checkoutMovie = {
      title: movie?.title,
      genre: movie?.genre,
      rate: movie?.dailyRentalRate,
      numberInStock: movie?.numberInStock,
    };
    return res
      .status(201)
      .send(`Movie has been checked out. ${JSON.stringify(checkoutMovie)}`);
  },
);

router.post(
  `${baseURL}/return`,
  authenticate,
  (req: Request, res: Response) => {
    // todo: build out feature using TDD...
    return res.status(400).send('Bad Request');
  },
);

export default router;
