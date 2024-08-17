import express, { Application, Request, Response } from 'express';
import 'reflect-metadata';
import morgan from 'morgan';
import helmet from 'helmet';
import config from './config';
import routes from './routes/index';
import errorMiddleware from './api/middleware/error.middleware';

const PORT = config.port || 8080;



const app: Application = express();



// connect to database
config.connect();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// logger middleware
app.use(morgan('dev'));
// security
app.use(helmet());

//add routea
app.get('/', (_req: Request, res: Response) => {
  res.json('Hello Server! 🚀');
});

app.use('/api', routes);

app.use(errorMiddleware);

app.use((_req: Request, res: Response) => {
  res.status(404).json('Whoops!! You are lost go back to documentation to find your way back to Home again 😂');
});

//start express server
app.listen(PORT, () => {
  console.log(`Server is starting at port:${PORT}`);
});

export default app;
