import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import request from 'supertest';
import { User } from '../../src/models/user.model';
import { Genre, type GenrePayload } from '../../src/models/genre.model';
import server from '../../src/index';

const enum MovieGenres {
  ACTION = 'action',
  COMEDY = 'comedy'
};

describe('/api/genres/', () => {
  beforeAll(async() => {
    await Genre.deleteMany({});
  });
  
  afterEach(async () => {
    await Genre.deleteMany({});
  });

  describe('GET /', () => {
    it('should return all genres.', async () => {
      // arrange.
      await Genre.collection.insertMany([
        { name: MovieGenres.ACTION },
        { name: MovieGenres.COMEDY },
      ]);

      // act.
      const res = await request(server).get('/api/genres/');

      // assert.
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((g: GenrePayload) => g.name === MovieGenres.ACTION)).toBeTruthy();
    });
  });
  describe('GET /:id', () => {
    it('should return a genre when ID is provided.', async () => {
      // arrange.
      const genre = new Genre({ name: MovieGenres.ACTION });
      await genre.save();

      // act.
      const res = await request(server).get('/api/genres/' + genre._id);

      // assert.
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', genre.name);
    });
    it('should return 404 when invalid ID is provided.', async () => {
      // arrange.
      // act.
      const res = await request(server).get('/api/genres/1');

      // assert.
      expect(res.status).toBe(404);
    });
  });
  describe('POST /', () => {
    it('should return 401 when user is not logged in.', async () => {
      // arrange.
      const genre = {
        name: MovieGenres.ACTION,
      };

      // act.
      const res = await request(server).post('/api/genres/').send(genre);

      // assert.
      expect(res.status).toBe(401);
    });
    it('should return 403 when user does not have suffient permissions.', async () => {
      // arrange.
      const user = new User();
      const genre = new Genre();
      genre.name = '1234';
      const token = user.generateAuthenticationToken();

      // act.
      const res = await request(server)
        .post('/api/genres/')
        .set('x-auth-token', token)
        .send(genre);

      // assert.
      expect(res.status).toBe(403);
    });
    it('should return 400 when genre name is less than 5 characters.', async () => {
      // arrange.
      const user = new User();
      user.isAdmin = true;
      const genre = new Genre();
      genre.name = '1234';
      const token = user.generateAuthenticationToken();

      // act.
      const res = await request(server)
        .post('/api/genres/')
        .set('x-auth-token', token)
        .send(genre);

      // assert.
      expect(res.status).toBe(400);
    });
    it('should return 400 when genre name is more than 50 characters.', async () => {
      // arrange.
      const user = new User();
      user.isAdmin = true;
      const genre = new Genre();
      genre.name = new Array(52).join('a');
      const token = user.generateAuthenticationToken();

      // act.
      const res = await request(server)
        .post('/api/genres/')
        .set('x-auth-token', token)
        .send(genre);

      // assert.
      expect(res.status).toBe(400);
    });
    it('should save the genre when when it is valid.', async () => {
      // arrange.
      const user = new User();
      user.isAdmin = true;
      const genre = new Genre();
      genre.name = MovieGenres.ACTION;
      const token = user.generateAuthenticationToken();

      // act.
      const res = await request(server)
        .post('/api/genres/')
        .set('x-auth-token', token)
        .send({ name: genre.name });

      // debug: had to filter by name... weird genre._id returns next value from guid driver :)
      const sut = await Genre.find({ name: genre.name });

      // assert.
      expect(res.status).toBe(201);
      expect(sut).not.toBeNull();
    });
    it('should return the genre when it is saved.', async () => {
      // arrange.
      const user = new User();
      user.name = 'John Smith';
      user.isAdmin = true;
      const genre = new Genre();
      genre.name = MovieGenres.ACTION;
      const token = user.generateAuthenticationToken();

      // act.
      const res = await request(server)
        .post('/api/genres/')
        .set('x-auth-token', token)
        .send({ name: genre.name });

      // assert.
      expect(res.status).toBe(201);
      expect(res.text).toContain(`${genre.name}`);
    });
  });
});
