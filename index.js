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
      primaryKey: true,
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
    message: 'Key Missing'
    })
});
// ROUTE HANDLER

  function getFilmRecommendations(req, res) {
    // request(`http://credentials-api.generalassemb.ly/4576f55f-c427-4cfc-a11c-5bfe914ca6c1?films=${req.params.id}`, function (error, response, body) {
    //   console.log('body:', body[0]);
    //   console.log('body:', body[1]);
    //   console.log('body:', body[2]);
    //   console.log('body:', body[3]);
    //   console.log('body:', body[4]);
    //   console.log('body:', body[5]);
    //   console.log(response)
    //   res.send(res);
    let dateArr;
    let plus15;
    let minus15;
    sequelize.query(`SELECT * FROM films WHERE id == ${req.params.id}`, { type: sequelize.QueryTypes.SELECT})
      .then(chosenFilm => {
        dateArr = chosenFilm[0].release_date.split('-');
        console.log(dateArr)
        dateArr[0] = (parseInt(dateArr[0])+15).toString();
        plus15 = dateArr.slice()
        dateArr[0] = (parseInt(dateArr[0])-30).toString();
        minus15 = dateArr.slice()
        console.log(plus15.join('-'))
        console.log(minus15.join('-'))
            sequelize.query(`SELECT * FROM films WHERE genre_id == ${chosenFilm[0].genre_id} AND release_date >= '${minus15.join('-')}' AND release_date <= '${plus15.join('-')}'`, { type: sequelize.QueryTypes.SELECT})
              .then(films => {
              sequelize.query(`SELECT name FROM genres WHERE genres.id == ${films[0].genre_id}`, { type: sequelize.QueryTypes.SELECT})
              // console.log("data", films);
              // We don't need spread here, since only the results will be returned for select queries
              .then(genre => {
                // console.log("id", films.id);
                res.send({
                  recommendations: [
                    {
                      id: films[0].id,
                      title: films[0].title,
                      release_date: films[0].release_date,
                      genre: genre[0].name,
                      averageRating: null,
                      reviews: null
                    }
                  ]
                })
              })
            })
            .catch(err => {
              res.status(404).json({
                message: 'Key Missing'
              })
            })
        })
        .catch(err => {
          res.status(404).json({
            message: 'Key Missing'
          })
        })
  }
module.exports = app;
