
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
let ticketPrice = 0;

let currencyExchangeArray = null;



/***************************************************************/
/*                       INITIAL ACTIONS                       */
/***************************************************************/
// Get all currency exchange from API or LocalStorage
getAllCurrenciesExchange();

// Restore all data from Local Storage
populateUI();



/***************************************************************/
/*                         FUNCTIONS                           */
/***************************************************************/
// API acces to get currency exchange
function getAllCurrenciesExchange() {
    
    //Get currency exchange array from Local Storage
    currencyExchangeArray =  JSON.parse(localStorage.getItem(CURRENCY_EXCHANGE_ARRAY));

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

// Get all data from LocalStorage and populate UI
function populateUI () {
    
    updateSelectedSeats();

    generateMovies();

    updateSelectedCurrency();

}

function updateSelectedSeats() {
    
    // get Selected Seats from local storage
    const selectedSeats = JSON.parse(localStorage.getItem(SELECTED_SEATS));

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
                        movieOption.innerHTML = `${movie.name} 
                                                (<span id="price">
                                                    ${(parseInt(movie.priceEur) * currencyExchangeArray[CURRENCY_SELECT.value]).toFixed(2)}
                                                </span> 
                                                <span id="currency">
                                                    ${CURRENCY_SELECT.value}
                                                </span>)`;
                        
                        MOVIE_SELECT.appendChild(movieOption);
                        
                    });

                    updateMovieAndPrice();

                }
            );
        }
    );
}

function updateSelectedCurrency() {
    
    // Set selected Currency from Local Storage
    const selectedCurrency = localStorage.getItem(SELECTED_CURRENCY);

    if (selectedCurrency !== null) {
        CURRENCY_SELECT.selectedIndex = selectedCurrency;
    }

    updateTotalCurrency();
}

function updateTotalCurrency() {
    CURRENCY_TOTAL.innerText = CURRENCY_SELECT.value;
}

// Select or deselect a seat
function selectSeat (event) {
    // Check if a free seat was clicked
    if (event.target.classList.contains('seat') &&
    !event.target.classList.contains('occupied')) {
        
        // Remove if exists a class or add it if it doesnt exists
        event.target.classList.toggle('selected');

        // Update total seats selected and its price
        updatedSelectedCount();

        updateMovieAndPrice();
    }
}

// Update total and count
function updatedSelectedCount () {
    // Get all selected seats (nodeList)
    const selectedSeats = document.querySelectorAll('.row .seat.selected');
    const selectedSeatsCount = selectedSeats.length;

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
    
    localStorage.setItem(CURRENCY_EXCHANGE_ARRAY, JSON.stringify(currencyExchangeArray));

}

function updateMovieAndPrice() {
    
    setMovie();

    setPrice();

}

// set Movie from Local Storage
function setMovie() {
    
    // Set selected Movie from Local Storage
    const selectedMovieIndex = localStorage.getItem(SELECTED_MOVIE_INDEX);

    if (selectedMovieIndex !== null) {
        MOVIE_SELECT.selectedIndex = selectedMovieIndex;
    }

}

// set TicketPrice from LocalStorage or selected Movie
function setPrice() {
    
    // Get movie price
    const selectedMoviePrice = localStorage.getItem(SELECTED_MOVIE_PRICE);

    if (selectedMoviePrice !== null) {
        ticketPrice = (parseInt(selectedMoviePrice) * currencyExchangeArray[CURRENCY_SELECT.value]).toFixed(2);
    } else {
        ticketPrice = (parseInt(MOVIE_SELECT.value) * currencyExchangeArray[CURRENCY_SELECT.value]).toFixed(2);
    }

    // Recalculate total price and selected seats
    updatedSelectedCount();

}

// Set Currency and price for all movies
function updateMovieOptions() {
    
    var options = MOVIE_SELECT.childNodes;
    
    options.forEach(option => {
        if (option.nodeType === ELEMENT_NODE) {
            var optionSpans = option.childNodes;

            optionSpans.forEach((span) => {
                // Check if node is an HTML Element
                if (span.nodeType === ELEMENT_NODE) {
                    switch (span.id) {
                        case "price":
                            span.innerText = (parseInt(option.value) * currencyExchangeArray[CURRENCY_SELECT.value]).toFixed(2);
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
    
}



/***************************************************************/
/*                      EVENT LISTENERS                        */
/***************************************************************/
/* 
    Add an onClick listener to container div, then we
    have to check if a seat was clicked
*/
CONTAINER.addEventListener ('click', (event) => {
    // Select or deselect a seat
    selectSeat(event);

});

// Movie select event
MOVIE_SELECT.addEventListener ('change', (event) => {
    // Update ticket price with selected movie price
    ticketPrice = (parseInt(event.target.value) * currencyExchangeArray[CURRENCY_SELECT.value]).toFixed(2);

    // Save selected movie at Local Storage
    saveMovieData(event.target.selectedIndex, event.target.value);

    // Update totals
    updatedSelectedCount();
} );


CURRENCY_SELECT.addEventListener('change', (event) => {
    
    updateMovieOptions();

    updateTotalCurrency();

    updateMovieAndPrice()

    saveCurrency(event.target.selectedIndex);

});