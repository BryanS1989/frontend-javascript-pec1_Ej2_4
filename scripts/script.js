/***************************************************************/
/*                     GLOBAL CONSTANTS                        */
/***************************************************************/
const SELECTED_SEATS = 'selectedSeats';
const SELECTED_MOVIE_INDEX = 'selectedMovieIndex';
const SELECTED_MOVIE_PRICE = 'selectedMoviePrice';

// get all elements that represents the theater 
const CONTAINER = document.querySelector('.container');

// Get nodeList with all the seats that are not occupied
const SEATS = document.querySelectorAll('.row .seat:not(.occupied)');

// Get the counters (Selected seats and total price)
const COUNT = document.getElementById('count');
const TOTAL = document.getElementById('total');

// Get movie dropdown menu
const MOVIE_SELECT = document.getElementById('movie');



/***************************************************************/
/*                      GLOBAL VARIABLES                       */
/***************************************************************/

// Get the ticket price as a number
let ticketPrice = parseInt(MOVIE_SELECT.value);

//console.log(ticketPrice);
//console.log(typeof ticketPrice);



/***************************************************************/
/*                       INITIAL ACTIONS                       */
/***************************************************************/
// Restore all data from Local Storage
populateUI();

// Recalculate total price and selected seats
updatedSelectedCount();



/***************************************************************/
/*                         FUNCTIONS                           */
/***************************************************************/
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

// Get all data from LocalStorage and populate UI
function populateUI () {
    
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

    // Set selected Movie from Local Storage
    const selectedMovieIndex = localStorage.getItem(SELECTED_MOVIE_INDEX);

    if (selectedMovieIndex !== null) {
        MOVIE_SELECT.selectedIndex = selectedMovieIndex;
    }

    // Get movie price
    const selectedMoviePrice = localStorage.getItem(SELECTED_MOVIE_PRICE) ? 
                                    parseInt(localStorage.getItem(SELECTED_MOVIE_PRICE)) 
                                    : parseInt(MOVIE_SELECT.value);

    if (selectedMoviePrice !== null) {
        ticketPrice = selectedMoviePrice;
    }

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
