// Your code here
document.addEventListener('DOMContentLoaded', ()=>{
    const baseURL = 'http://localhost:3000/';
    const filmList = document.getElementById('films');
    const movieDetails = document.getElementById('movie-details');

// Function to fetch all films and populate the films menu
const fetchFilms = () => {
    fetch(`${baseURL}/films`)
    .then(response => response.json())
    .then(films =>{
        films.forEach(film => {
            const filmItem = document.createElement('li');
            filmItem.classList.add('film', 'item');
            filmItem.textContent = film.title;
            filmItem.dataset.filmId = film.id;
            filmList.appendChild(filmItem);
            filmItem.addEventListener('click', () => displayMovieDetails(film));
            
        });
    })
    .catch(error => console.error('Error fetching films:', error));
}
// function to display movie details
const displayMovieDetails = (film)=> {
    const availableTickets = film.capacity - film.tickets_sold;
    movieDetails.innerHTML = `
    <h2>${film.title}</h2>
    <img src= "${film.poster}" alt="${film.title} poster">
    <p>Runtime: ${film.runtime} minutes</p>
            <p>Showtime: ${film.showtime}</p>
            <p>Description: ${film.description}</p>
            <p>Available Tickets: ${availableTickets}</p>
            <button id="buy-ticket" data-film-id="${film.id}" ${availableTickets === 0 ? 'disabled' : ''}>Buy Ticket</button>
            <button id="delete-movie" data-film-id="${film.id}">Delete Movie</button>
        `;

        const buyTicketButton = document.getElementById('buy-ticket');
        buyTicketButton.addEventListener('click', buyTicket);

        const deleteMovieButton = document.getElementById('delete-movie');
        deleteMovieButton.addEventListener('click', deleteMovie);
    };

    // Function to handle buying tickets
    const buyTicket = () => {
        const filmId = event.target.dataset.filmId;
        fetch(`${baseURL}/films/${filmId}`)
            .then(response => response.json())
            .then(film => {
                const availableTickets = film.capacity - film.tickets_sold;
                if (availableTickets > 0) {
                    const newTicketsSold = film.tickets_sold + 1;
                    fetch(`${baseURL}/films/${filmId}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ tickets_sold: newTicketsSold })
                    })
                    .then(() => {
                        // Update frontend display
                        displayMovieDetails({ ...film, tickets_sold: newTicketsSold });
                        // Persist ticket sale
                        persistTicketSale(filmId);
                        // Check if movie is sold out
                        if (newTicketsSold === film.capacity) {
                            markMovieAsSoldOut(filmId);
                        }
                    })
                    .catch(error => console.error('Error buying ticket:', error));
                } else {
                    alert('Sorry, no more tickets available for this movie.');
                }
            })
            .catch(error => console.error('Error fetching film details:', error));
    };

    // Function to persist ticket sale
    const persistTicketSale = (filmId) => {
        fetch(`${baseURL}/tickets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ film_id: filmId, number_of_tickets: 1 })
        })
        .then(response => response.json())
        .then(ticket => console.log('Ticket purchased:', ticket))
        .catch(error => console.error('Error persisting ticket sale:', error));
    };

    // Function to delete movie
    const deleteMovie = () => {
        const filmId = event.target.dataset.filmId;
        fetch(`${baseURL}/films/${filmId}`, {
            method: 'DELETE'
        })
        .then(() => {
            const filmItemToDelete = document.querySelector(`[data-film-id="${filmId}"]`);
            filmItemToDelete.remove();
            console.log('Movie deleted successfully.');
        })
        .catch(error => console.error('Error deleting movie:', error));
    };
     // Function to mark movie as sold out
     const markMovieAsSoldOut = (filmId) => {
        const filmItem = document.querySelector(`[data-film-id="${filmId}"]`);
        filmItem.classList.add('sold-out');
        const buyTicketButton = filmItem.querySelector('#buy-ticket');
        buyTicketButton.textContent = 'Sold Out';
        buyTicketButton.disabled = true;
    };

    // Initial setup
    fetchFilms();
});
