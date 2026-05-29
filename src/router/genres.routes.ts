import express, { Request, Response } from 'express';
import authenticate from '../middleware/authentication.middleware';
import authorize from '../middleware/authorization.middleware';
import errorWrapper from '../utils/http-error-wrapper';
import validateGuid from '../middleware/guid-validation.middleware';
import { Genre, validate } from '../models/genre.model';

const router = express.Router();
const baseURL = '/api/genres';

// todo: get lib to handle errors, used to be express-async-errors...
router.get(
  baseURL,
  errorWrapper(async (req: Request, res: Response) => {
    const genres = await Genre.find().sort({ name: 1 });
    res.send(genres);
  }),
);

router.get(
  `${baseURL}/:id`,
  validateGuid,
  errorWrapper(async (req: Request, res: Response) => {
    const genreId = req.guid;
    const genre = await Genre.findById(genreId);

    if (!genre) res.status(404).send('The genre does not exist');
    if (!validate(req.body)) {
      res
        .status(400)
        .send(
          `Name property does not meet the minimum length requirements.`,
        );
    }

    res.status(200).send(genre);
  }),
);

router.post(
  baseURL,
  [authenticate, authorize],
  errorWrapper(async (req: Request, res: Response) => {
    const { error } = validate(req.body);
    const genreName = req.body.name;

    if (error) {
      res.status(400).send(error?.details[0]?.message);
    }

    const genre = new Genre({ name: genreName });
    await genre.save();

    res.status(201).send(`Created the following genre: ${genre.name}`);
  }),
);

router.put(
  `${baseURL}/:id`,
  [authenticate, authorize, validateGuid],
  errorWrapper(async (req:Request, res:Response) => {
    const { error } = validate(req.body);
    if (error) {
      res.status(400).send(error?.details[0]?.message);
    }

    const genreId = req.guid;
    const genreName = req.body.name;
    let genre = await Genre.findById(genreId);
    if (!genre) res.status(404).send('The genre id does not exist');

    if (genre) {
      genre.name = genreName;
      await genre.save();
    }

    res.status(201).send(`Genre updated to: ${genreName}`);
  }),
);

router.delete(
  `${baseURL}/:id`,
  [authenticate, authorize, validateGuid],
  errorWrapper(async (req: Request, res: Response) => {
    const genreId = req.guid;
    const genre = await Genre.findById(genreId);
    if (!genre) res.status(404).send('The genre id does not exist');

    await Genre.deleteOne({_id: genreId});

    res.status(201).send(`Genre deleted: ${genre?.name}`);
  }),
);

export default router;
