/***************************************************************/
/*                     GLOBAL CONSTANTS                        */
/***************************************************************/
// API key
const API_KEY = '7d9e5a83fc27579c5a91aebb';

const SELECTED_SEATS = 'selectedSeats';
const SELECTED_MOVIE_INDEX = 'selectedMovieIndex';
const SELECTED_MOVIE_PRICE = 'selectedMoviePrice';
const SELECTED_CURRENCY = 'selectedCurrency';
const CURRENCY_EXCHANGE_ARRAY = 'currencyExchangeArray';

// get all elements that represents the theater 
const CONTAINER = document.querySelector('.container');

// Get nodeList with all the seats that are not occupied
const SEATS = document.querySelectorAll('.row .seat:not(.occupied)');

// Get the counters (Selected seats and total price)
const COUNT = document.getElementById('count');
const TOTAL = document.getElementById('total');
const CURRENCY_TOTAL = document.getElementById('currencyTotal');

// Get movie dropdown menu
const MOVIE_SELECT = document.getElementById('movie');

// Get currency selector
const CURRENCY_SELECT = document.getElementById('currency');

const ELEMENT_NODE = 1;


/***************************************************************/
/*                      GLOBAL VARIABLES                       */
/***************************************************************/

// Get the ticket price as a number
let ticketPrice = parseInt(MOVIE_SELECT.value);

let currencyExchangeArray = null;

//console.log(ticketPrice);
//console.log(typeof ticketPrice);



/***************************************************************/
/*                       INITIAL ACTIONS                       */
/***************************************************************/
// Restore all data from Local Storage
populateUI();

getAllCurrenciesExchange();

/***************************************************************/
/*                         FUNCTIONS                           */
/***************************************************************/
// API acces
function getAllCurrenciesExchange(params) {
    
    //Get currency exchange array from Local Storage
    getCurrencyExchange();

    if (currencyExchangeArray === null) {
        fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${CURRENCY_SELECT.value}`)
        .then((response) => {
            response.json()
                .then((data)=>{
                    currencyExchangeArray = data.conversion_rates;
                    
                    saveCurrencyExchange();
                });
        });
    }

}

function getCurrencyExchange() {
    currencyExchangeArray = localStorage.getItem(CURRENCY_EXCHANGE_ARRAY);
}

// Select or deselect a seat
function selectSeat (event) {
    // Check if a free seat was clicked
    if (event.target.classList.contains('seat') &&
    !event.target.classList.contains('occupied')) {
        //console.log(event.target);

        //event.target.classList.add    <-- to add a Clas
        //event.target.classList.remove <-- to remove a Class
        
        // Remove if exists a class or add it if it doesnt exists
        event.target.classList.toggle('selected');

        // Update total seats selected and its price
        updatedSelectedCount();
    }
}

// Update total and count
function updatedSelectedCount () {
    // Get all selected seats (nodeList)
    const selectedSeats = document.querySelectorAll('.row .seat.selected');
    const selectedSeatsCount = selectedSeats.length;
    
    //console.log(selectedSeats);
    //console.log(selectedSeatsCount);

    // Save selected seats
    saveSelectedSeatsAtLocalStorage(selectedSeats);

    // Update total and prices
    COUNT.innerText = selectedSeatsCount;
    TOTAL.innerText = selectedSeatsCount * ticketPrice;

}

// Save selected seats indexes at local Storage
function saveSelectedSeatsAtLocalStorage (selectedSeats) {
    /* Add local storage: 
        1 - Copy selected seats into arr
        2 - Map through array
        3 - return a new array indexes

        ... => Spread operator: transform an array to a params list
        
        Same operator for Rest Operator, but Rest operator is used 
        at a function declaration
    */
    const seatsIndex = [...selectedSeats].map((seat) => {
        // get the index of selectedSeats from free seats
        return [...SEATS].indexOf(seat);
    });
    
    //console.log(seatsIndex);    // will return i.e. [0], [0, 1, 2], [7, 15, 38] ...

    /*
        Save seatsindex into local storage.
        We can see it at DevTools >> Application >> Local Storage
    */
    localStorage.setItem(SELECTED_SEATS, JSON.stringify(seatsIndex));
}

// Save selected Movie
function saveMovieData (movieIndex, moviePrice) {
    
    localStorage.setItem(SELECTED_MOVIE_INDEX, movieIndex);
    localStorage.setItem(SELECTED_MOVIE_PRICE, moviePrice);

}

// Save selected currency
function saveCurrency (currencyIndex) {
    
    localStorage.setItem(SELECTED_CURRENCY, currencyIndex);

}

// Save currency exchange
function saveCurrencyExchange () {
    
    localStorage.setItem(CURRENCY_EXCHANGE_ARRAY, currencyExchangeArray);

}

// Get all data from LocalStorage and populate UI
function populateUI () {
    
    updateSelectedSeats();

    generateMovies();

    updateSelectedCurrency();

}

function updateSelectedSeats() {
    
    // get Selected Seats from local storage
    const selectedSeats = JSON.parse(localStorage.getItem(SELECTED_SEATS));

    //console.log(selectedSeats);

    // Populate selected seats
    if (selectedSeats !== null && selectedSeats.length > 0) {
        SEATS.forEach((seat, index) => {
            // Check if the index is in selected seats
            if (selectedSeats.indexOf(index) > -1) {
                seat.classList.add('selected');
            }
        });
    }

}

// Create movie selector
function generateMovies() {
    
    fetch('./files/movies.json')
        .then((response) => {
            response.json()
                .then((movies) => {
                    
                    movies.forEach((movie, index) => {

                        var movieOption = document.createElement("option");

                        movieOption.value = movie.priceEur;
                        movieOption.innerHTML = `${movie.name} (<span id="price">${movie.priceEur}</span> <span id="currency">${CURRENCY_SELECT.value}</span>)`;

                        MOVIE_SELECT.appendChild(movieOption);

                    });

                    updateMovieAndPrice();

                    //console.log(movies);
                });
        });

}

function updateMovieAndPrice() {
    
    setMovie();

    setPrice();

}

function setMovie() {
    
    // Set selected Movie from Local Storage
    const selectedMovieIndex = localStorage.getItem(SELECTED_MOVIE_INDEX);

    if (selectedMovieIndex !== null) {
        MOVIE_SELECT.selectedIndex = selectedMovieIndex;
        ticketPrice = parseInt(MOVIE_SELECT.value);
    }

}

function setPrice() {
    
    // Get movie price
    const selectedMoviePrice = localStorage.getItem(SELECTED_MOVIE_PRICE) ? 
                                    parseInt(localStorage.getItem(SELECTED_MOVIE_PRICE)) 
                                    : parseInt(MOVIE_SELECT.value);

    if (selectedMoviePrice !== null) {
        ticketPrice = selectedMoviePrice;
    }

    // Recalculate total price and selected seats
    updatedSelectedCount();

}

function updateSelectedCurrency() {
    
    // Set selected Currency from Local Storage
    const selectedCurrency = localStorage.getItem(SELECTED_CURRENCY);

    if (selectedCurrency !== null) {
        CURRENCY_SELECT.selectedIndex = selectedCurrency;
    }

    updateTotalCurrency();
}

// Set Currency and price for all movies
function updateMovieOptions() {
    
    var options = MOVIE_SELECT.childNodes;
    
    options.forEach(option => {
        if (option.nodeType === ELEMENT_NODE) {
            var optionSpans = option.childNodes;

            optionSpans.forEach((span) => {
                if (span.nodeType === ELEMENT_NODE) {
                    switch (span.id) {
                        case "price":
                            break;
                        case "currency":
                            span.innerText = CURRENCY_SELECT.value;
                            break;
                        default:
                            break;
                    }
                }
            });
        }
    });
    
    updateTotalCurrency();

}

function updateTotalCurrency() {
    CURRENCY_TOTAL.innerText = CURRENCY_SELECT.value;
}



/***************************************************************/
/*                      EVENT LISTENERS                        */
/***************************************************************/
/* 
    Add an onClick listener to container div, then we
    have to check if a seat was clicked
*/
CONTAINER.addEventListener ('click', (event) => {
    //console.log(event.target);
    
    // Select or deselect a seat
    selectSeat(event);

});

// Movie select event
MOVIE_SELECT.addEventListener ('change', (event) => {
    // Update ticket price with selected movie price
    ticketPrice = +event.target.value ;

    // Save selected movie at Local Storage
    // console.log(event.target.selectedIndex, event.target.value);
    saveMovieData(event.target.selectedIndex, event.target.value);

    // Update totals
    updatedSelectedCount();
} );


CURRENCY_SELECT.addEventListener('change', (event) => {
    
    updateMovieOptions();

    saveCurrency(event.target.selectedIndex);

});