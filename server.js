const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');
//ERRROR OUTSIDE EXPRESS
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('unhandledRejection, shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXECPTION, shutting down...');
  server.close(() => {
    process.exit(1);
  });
});

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    //deprecated after version 5
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    // console.log(con.connections);
    console.log('DB connection established');
  });

const server = app.listen(process.env.PORT, () => {
  console.log(`Listening port ${process.env.PORT}....`);
});
