import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );
    await app.init();
  });

  it('/exchange-routing (GET)', () => {
    return request(app.getHttpServer())
      .get('/exchange-routing?amount=1')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('btcAmount');
        expect(res.body).toHaveProperty('usdAmount');
        expect(res.body).toHaveProperty('exchange');
      });
  });

  it('/exchange-routing (GET) No Param', () => {
    return request(app.getHttpServer()).get('/exchange-routing').expect(400);
  });

  it('/exchange-routing (GET) Invalid Param', () => {
    return request(app.getHttpServer())
      .get('/exchange-routing?amount=-1')
      .expect(400);
  });
});
