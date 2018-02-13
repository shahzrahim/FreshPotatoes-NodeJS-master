const sqlite = require('sqlite'),
      Sequelize = require('sequelize'),
      request = require('request'),
      express = require('express'),
      app = express();
const { PORT=3000, NODE_ENV='development', DB_PATH='./db/database.db' } = process.env;
// START SERVER
Promise.resolve()
  .then(() => app.listen(PORT, () => console.log(`App listening on port ${PORT}`)))
  .catch((err) => { if (NODE_ENV === 'development') console.error(err.stack); });
  const sequelize = new Sequelize('database', 'null', 'null', {
    host: 'localhost',
    dialect: 'sqlite',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    // SQLite only
    storage: './db/database.db'
  });
  const Films = sequelize.define('films', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING
    },
    release_date: {
      type: Sequelize.STRING
    },
    genre: {
      type: Sequelize.STRING
    },
    averageRating: {
      type: Sequelize.INTEGER
    },
    reviews: {
      type: Sequelize.INTEGER
    }
  });
// ROUTES
app.get('/films/:id/recommendations', getFilmRecommendations);
app.get("*", (req, res) => {
  res.status(404).json({
    message:'Key Missing'
  })
});
// ROUTE HANDLER
  function getFilmRecommendations(req, res) {
    let dateArr;
    let plus15;
    let minus15;
    sequelize.query(`SELECT * FROM films WHERE id == ${req.params.id}`, { type: sequelize.QueryTypes.SELECT})
      .then(chosenFilm => {
        dateArr = chosenFilm[0].release_date.split('-');
        dateArr[0] = (parseInt(dateArr[0])+15).toString();
        plus15 = dateArr.slice()
        dateArr[0] = (parseInt(dateArr[0])-30).toString();
        minus15 = dateArr.slice()
        sequelize.query(`SELECT * FROM films WHERE genre_id == ${chosenFilm[0].genre_id} AND release_date >= '${minus15.join('-')}' AND release_date <= '${plus15.join('-')}' LIMIT 3`, { type: sequelize.QueryTypes.SELECT})
          .then(films => {
          sequelize.query(`SELECT name FROM genres WHERE genres.id == ${films[0].genre_id}`, { type: sequelize.QueryTypes.SELECT})
          .then(genre => {
            res.json({
              recommendations: [
                {
                  id: films[0].id,
                  title: films[0].title,
                  release_date: films[0].release_date,
                  genre: genre[0].name,
                  averageRating: null,
                  reviews: null
                }
              ],
              meta: {
                limit: 10,
                offset: 1
              }
            })
          })
        })
        .catch(err => {
          res.status(422).json({
            message: 'Key Missing'
          })
        })
      })
      .catch(err => {
        res.status(422).json({
          message: 'Key Missing'
        })
      })
  }
module.exports = app;
