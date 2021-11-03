const movieAutoCompleteConfing = {
  async fetchData(searchTerm) {
    try {
      const response = await axios.get("http://www.omdbapi.com/", {
        params: {
          apikey: "50a2cd9",
          s: searchTerm,
        },
      });
      if (response.data.Error) {
        return [];
      }
      return response.data.Search;
    } catch (err) {
      console.log(err);
    }
  },
  renderOption(movie) {
    const imageSrc = movie.Poster === "N/A" ? "" : movie.Poster;
    return `
      <img src="${imageSrc}"/> ${movie.Title} (${movie.Year})
    `;
  },
  inputValue(movie) {
    return `${movie.Title} (${movie.Year})`;
  },
};

makeAutocomplete({
  ...movieAutoCompleteConfing,
  root: document.querySelector("#right-autocomplete"),

  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    console.log(this);
    onMovieSelect(movie, document.querySelector("#right-summary"), "right");
  },
});

makeAutocomplete({
  ...movieAutoCompleteConfing,
  root: document.querySelector("#left-autocomplete"),

  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    console.log(this);
    onMovieSelect(movie, document.querySelector("#left-summary"), "left");
  },
});

// we can comparsion between with movie details without dataset
// like this => leftMovie = response.data and rightMovie = response.data then runComparion(letMovie, rightMovie)
let leftMovie;
let rightMovie;
const onMovieSelect = async (movie, leftSummaryEl, side) => {
  try {
    const response = await axios.get("http://www.omdbapi.com/", {
      params: {
        apikey: "50a2cd9",
        i: movie.imdbID,
      },
    });
    leftSummaryEl.innerHTML = movieTemplate(response.data);
    if (side === "left") leftMovie = response.data;
    if (side === "right") rightMovie = response.data;
    if (leftMovie && rightMovie) runComparsion();
  } catch (err) {
    console.log(err);
  }
};

const runComparsion = () => {
  const leftSideElements = document.querySelectorAll(
    "#left-summary .notification"
  );
  const rightSideElements = document.querySelectorAll(
    "#right-summary .notification"
  );
  console.log(leftSideElements, rightSideElements);
  leftSideElements.forEach((leftEl, index) => {
    const rightEl = rightSideElements[index];

    const leftStatValue = leftEl.dataset.value;
    const rightStatValue = rightEl.dataset.value;

    if (leftStatValue > rightStatValue) {
      rightEl.classList.remove("is-primary");
      rightEl.classList.add("is-warning");
    } else {
      leftEl.classList.remove("is-primary");
      leftEl.classList.add("is-warning");
    }
  });
};

const movieTemplate = (movieDetail) => {
  const awards = movieDetail.Awards.split(" ").reduce((prev, item) => {
    const value = parseInt(item);
    if (isNaN(value)) return prev;
    else return prev + value;
  }, 0);
  const dollars = parseInt(
    movieDetail.BoxOffice.replace(/\$/g, "").replace(/,/g, "")
  );
  const metascore = parseInt(movieDetail.Metascore);
  const imdbRating = parseFloat(movieDetail.imdbRating);
  const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ""));

  return `
    <article class="media">
      <figure class="media-left">
          <p class="image">
              <img src="${movieDetail.Poster}" />
          </p>
      </figure>
      <div class="media-content">
          <div class="content">
              <h1>${movieDetail.Title}</h1>
              <h4>${movieDetail.Genre}</h4>
              <p>${movieDetail.Plot}</p>
          </div>
      </div>
    </article>
    <article data-value=${awards} class="notification is-primary">
      <p class="title">${movieDetail.Awards}</p>
      <p class="subtitle">Awards</p>
    </article>
    <article data-value=${dollars} class="notification is-primary">
      <p class="title">${movieDetail.BoxOffice}</p>
      <p class="subtitle">Box Office</p>
    </article>
    <article data-value=${metascore} class="notification is-primary">
      <p class="title">${movieDetail.Metascore}</p>
      <p class="subtitle">Metascore</p>
    </article>
    <article  data-value=${imdbRating} class="notification is-primary">
      <p class="title">${movieDetail.imdbRating}</p>
      <p class="subtitle">IMDB Rating</p>
    </article>
    <article  data-value=${imdbVotes} class="notification is-primary">
      <p class="title">${movieDetail.imdbVotes}</p>
      <p class="subtitle">IMDB Votes</p>
    </article>
  `;
};
