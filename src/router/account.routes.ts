import express, { Request, Response } from 'express';
import _ from 'lodash';
import bcrypt from 'bcrypt';
import authenticate from '../middleware/authentication.middleware';
import {
  User,
  validateSchema,
  validatePasswordComplexity,
} from '../models/user.model';
import authenticationValidation from '../models/auth.model';
import authorize from '../middleware/authorization.middleware';

const router = express.Router();

const baseAppURL = '/api';
const baseUserURL = '/api/users';
router.get(`${baseAppURL}/app/`, (req: Request, res: Response) => {
  res
    .status(200)
    .send('Welcome to MovieShack, we hope you enjoy our product offering.');
});

router.get(
  `${baseUserURL}/profile`,
  authenticate,
  async (req: Request, res: Response) => {
    const userToken = req.token._id;
    const user = await User.findById(userToken).select({
      password: 0, // do not include password in response.
    });
    let token = req.get('x-auth-token');
    if (!token) token = user?.generateAuthenticationToken();
    res.header('x-auth-token', token).status(200).send(user);
  },
);

router.put(
  `${baseUserURL}/permissions`,
  [authenticate, authorize],
  async (req: Request, res: Response) => {
    const email = req.body.email;
    const isAdmin = req.body.isAdmin;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('User does not exist.');

    user.isAdmin = isAdmin;
    const token = user.generateAuthenticationToken();
    await user.save();

    return res
      .header('x-auth-token', token)
      .status(201)
      .send('User rights have been elavated to ADMIN.');
  },
);

router.post(`${baseUserURL}/register`, async (req: Request, res: Response) => {
  // todo: refactor...
  let { error } = validateSchema(req.body);
  if (error) res.status(400).send(error?.details[0]?.message);
  ({ error } = validatePasswordComplexity(req.body.password));
  if (error) res.status(400).send(error?.details[0]?.message);

  const username = req.body.username;
  const name = req.body.name;
  const surname = req.body.surname;
  const email = req.body.email;
  const password = req.body.password;

  let user = await User.findOne({ email });
  if (user) return res.status(400).send('User account already exist.');

  user = new User({
    username,
    name,
    surname,
    email,
  });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);

  await user.save();

  const token = user.generateAuthenticationToken();
  return res
    .header('x-auth-token', token)
    .status(201)
    .send('User has been registered.');
});

router.post(`${baseUserURL}/login`, async (req: Request, res: Response) => {
  const { error } = authenticationValidation(req.body);
  if (error) return res.status(400).send(error?.details[0]?.message);

  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(400).send('Email or password provided is invalid.');

  const hasAuthenticationCredentials = await bcrypt.compare(
    password,
    user.password,
  );
  if (!hasAuthenticationCredentials)
    return res.status(400).send('Email or password provided is invalid.');

  let token = user.generateAuthenticationToken();

  return res
    .header('x-auth-token', token)
    .status(201)
    .send('User successfully logged in.');
});

router.post(`${baseUserURL}/logout`, async (req: Request, res: Response) => {
  return res
    .setHeader('x-auth-token', '')
    .status(201)
    .send('User has been logged out.');
});

export default router;
