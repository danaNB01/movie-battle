import './App.css';
import {useEffect, useState} from "react";



function App() {

  const [firstMovie, setFirstMovie] = useState(null)
  const [secondMovie, setSecondMovie] = useState(null)
  const [winner, setWinner] = useState(null)

  function handleMovies(event) {
    // get info from form
    event.preventDefault();

    const formDate = new FormData(event.target);
    // filter inputs -> replace space with +
    const movie1 = formDate.get('first_movie').replace(" ", "+");
    const movie2 = formDate.get('second_movie').replace(" ", "+");


    // send data to api
    const fetchMovies = async () => {
      try{
        // fetch
        const response1 = await fetch(`https://www.omdbapi.com/?apikey=38b546c9&t=${movie1}`);
        const response2 = await fetch(`https://www.omdbapi.com/?apikey=38b546c9&t=${movie2}`)

        // convert the response
        const data1 = await response1.json()
        const data2 = await response2.json()

        if(data1.Response === "False" || data2.Response === "False"){
          setFirstMovie(null)
          setSecondMovie(null)
          setWinner(null)
          window.alert("One or both movies were not found.");
          return;
        }

        setFirstMovie(data1)
        setSecondMovie(data2)
        // reset winner
        setWinner(null)
      }catch(e){
        console.error(e);
        window.alert("Something went wrong while fetching movies.");
      }
    }
    fetchMovies();

  }

  // Calculate the winner after movie1 and 2 are fetched.
  useEffect(() => {
    if(!firstMovie || !secondMovie) return;

    // get rotten tomatoes rating
    const getRottenRating = (movie) =>{
      const rating = movie?.Ratings.find(r => r.Source === "Rotten Tomatoes")
      // filter the rating and covert it to int for safe comparison
      // return 0 if no rating for the movie is found.
      return rating ? parseInt(rating?.Value.replace("%", "")) : 0
    }

    // get box office
    const getBoxOffice = (movie) =>{
      // filter the revenue and covert it to int for safe comparison
      const revenue = movie?.BoxOffice
      return revenue ? parseInt(revenue.replace("$","")) : 0
    }

    // get rating and revenue for both movies
    const movie1Score = getRottenRating(firstMovie);
    const movie2Score = getRottenRating(secondMovie);

    const movie1Box = getBoxOffice(firstMovie);
    const movie2Box = getBoxOffice(secondMovie);

    // compare and determine winner
    let score1 = 0;
    let score2 = 0;

    if (movie1Score > movie2Score) score1++;
    else if (movie2Score > movie1Score) score2++;

    if (movie1Box > movie2Box) score1++;
    else if (movie2Box > movie1Box) score2++;

    if (score1 > score2) setWinner("first");
    else if (score2 > score1) setWinner("second");
    else setWinner("tie");

  },[firstMovie,secondMovie])


  return (
  <main className="app-container">

      <section className="form-container">
        <form onSubmit={handleMovies}>
          {/* TODO: a drop down menu for the user while typing. */}
            <input type="text" placeholder="a movie..." name="first_movie" required />
            <input type="text" placeholder="a movie..." name="second_movie" required />
          <button type="submit">COMPARE</button>
        </form>
      </section>


    {firstMovie && secondMovie ?
    <section className={`results ${winner === 'first' ? 'winner-first' : winner === 'second' ? 'winner-second' : ''}`}>
      {/* Movie 1 (First movie) */}
      <div className="bar left-bar">
        <div className="content">
          <img src={firstMovie?.Poster} alt={`${firstMovie?.Title} Poster`} />
          <div className="info">
            <p className="title">{firstMovie?.Title}</p>
            <p className="year">{firstMovie?.Year}</p>
            <p className="rating"><span>{firstMovie?.Ratings.find(r => r.Source === "Rotten Tomatoes")?.Value || "N/A"}</span> Rotten Tomatoes</p>
            <p className="office"><span>{firstMovie?.BoxOffice || "N/A"}</span> Box Office</p>
          </div>
        </div>
      </div>


      {/* Movie 2 (Second movie) */}
      <div className="bar right-bar">
        <div className="content">
          <img src={secondMovie?.Poster} alt={`${secondMovie?.Title} Poster`} />
          <div className="info">
            <p className="title">{secondMovie?.Title}</p>
            <p className="year">{secondMovie?.Year}</p>
            <p className="rating"><span>{secondMovie?.Ratings.find(r => r.Source === "Rotten Tomatoes")?.Value || "N/A"}</span> Rotten Tomatoes</p>
            <p className="office"><span>{secondMovie?.BoxOffice || "N/A"}</span> Box Office</p>
          </div>
        </div>
      </div>
    </section>
        : null
    }
  </main>
  );
}


export default App;
