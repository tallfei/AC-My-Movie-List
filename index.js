const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'


const movies = []
let filteredMovies = [] //搜尋清單


const MOVIE_PER_PAGE = 12
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

function renderMovieList(data) {
  let rawHTML = '' 

  data.forEach((item) => {
    //title, img, id 隨著每個 item 改變
    rawHTML += `<div class="col-sm-3">
            <div class="mb-2">
              <div class="card">
                <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
                <div class="card-body">
                  <h5 class="card-title">${item.title}</h5>
                </div>
                <div class="card-footer">
                  <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                  <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
                </div>
              </div>
            </div>
          </div>
    `
  })

  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  
  // Math.ceil() 無條件進位
  const numberOfPages = Math.ceil(amount / MOVIE_PER_PAGE) 
  let rawHTML = ''

  // 迴圈：產生總頁數幾頁，產生幾個li
  for(let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
}


function getMoviesByPage(page) {
  // movies？"movies 80" : "filteredMovies"
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIE_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIE_PER_PAGE)
  
}


function showMovieModal(id) { 
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then(response => {
    // response.data.results
    const data = response.data.results

    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)

  if (list.some(movie => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }

  list.push(movie)
  
  localStorage.setItem('favoriteMovies', JSON.stringify(list))

}

// listen to data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))

  }
})



//listen to search form
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault() //不要刷新頁面
  
  const keyword = searchInput.value.trim().toLowerCase()
 
  filteredMovies = movies.filter((movie) => 
    movie.title.toLowerCase().includes(keyword)
  )

  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }

  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))

})

// listen to paginator
paginator.addEventListener('click', function onPaginatorClicked(event) {
  // A = <a></a>
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})

axios
  .get(INDEX_URL)
  .then((respose) => {
    movies.push(...respose.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))

localStorage.setItem('default_language', 'english')
