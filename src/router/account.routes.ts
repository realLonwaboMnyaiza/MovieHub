import express, { Request, Response } from 'express';
import _ from 'lodash';
import bcrypt from 'bcrypt';
import authenticate from '../middleware/authentication.middleware';
import { User, validate } from '../models/user.model';
import authenticationValidation from '../models/auth.model';

const router = express.Router();

const baseURL = '/api';
const baseUserURL = '/api/user/';
router.get(`${baseURL}/app/`, (req: Request, res: Response) => {
  res
    .status(200)
    .send('Welcome to MovieShack, we hope you enjoy our product offering.');
});

router.get(baseUserURL, authenticate, async (req: Request, res: Response) => {
  const userToken = req.token._id; 
  const user = await User.findById(userToken).select({
    password: 0, // do not include password in response.
  });
  let token = req.get('x-auth-token');
  if (!token) token = user?.generateAuthenticationToken();
  res.header('x-auth-token', token).status(200).send(user);
});

router.put(`${baseUserURL}/permissions`, async (req: Request, res: Response) => {
  const email = req.body.email;
  const isAdmin = req.body.isAdmin;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).send('User does not exist.');

  user.isAdmin = isAdmin;
  await user.save();

  return res.status(201).send('User rights have been elavated to ADMIN.');
});

router.post(`${baseURL}/register`, async (req: Request, res: Response) => {
  const { error } = validate(req.body);
  if (error) res.status(400).send(error?.details[0]?.message);

  const username = req.body.username;
  const name = req.body.name;
  const surname = req.body.surname;
  const email = req.body.email;
  // todo: enforce password complexity with joi-password-complexity package.
  const password = req.body.password;

  let user = await User.findOne({ email });
  if (user) return res.status(400).send('This accound already exist.');

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

router.post(`${baseURL}/login`, async (req: Request, res: Response) => {
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

// todo: add logout test.
router.post(`${baseURL}/logout`, async (req: Request, res: Response) => {
  res.setHeader('x-auth-token', '');
  return res.status(201).send('User has been logged out.');
});

export default router;
