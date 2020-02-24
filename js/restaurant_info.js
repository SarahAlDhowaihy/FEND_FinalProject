let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
    initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
    fetchRestaurantFromURL((error, restaurant) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.newMap = L.map('map', {
                center: [restaurant.latlng.lat, restaurant.latlng.lng],
                zoom: 16,
                scrollWheelZoom: false
            });
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
                mapboxToken: 'pk.eyJ1Ijoic2FyYWhhbGRvd2loeSIsImEiOiJjazZza2hxMmQwZ2V1M25udm1kYzVjcDN5In0.5fP3O5pOPMG6TEXOExkklg',
                maxZoom: 18,
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                id: 'mapbox.streets'
            }).addTo(newMap);
            fillBreadcrumb();
            DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
        }
    });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
    if (self.restaurant) { // restaurant already fetched!
        callback(null, self.restaurant)
        return;
    }
    const id = getParameterByName('id');
    if (!id) { // no id found in URL
        error = 'No restaurant id in URL'
        callback(error, null);
    } else {
        DBHelper.fetchRestaurantById(id, (error, restaurant) => {
            self.restaurant = restaurant;
            if (!restaurant) {
                console.error(error);
                return;
            }
            fillRestaurantHTML();
            callback(null, restaurant)
        });
    }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
    // Add tab Index for accessibility
    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;
    name.tabIndex = 0;

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;
    address.tabIndex = 0;

    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img'
    image.src = DBHelper.imageUrlForRestaurant(restaurant);
    // Add alt for accessibility
    image.alt = "image for " + restaurant.name + " restaurant ";
    image.tabIndex = 0;

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;
    cuisine.tabIndex = 0;

    // fill operating hours
    if (restaurant.operating_hours) {
        fillRestaurantHoursHTML();
    }
    // fill reviews
    fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
    const hours = document.getElementById('restaurant-hours');
    // for accessibility
    hours.setAttribute("aria-label", "Table of restaurant operating hours");

    // add Caption for accessibility
    const caption = document.createElement('caption');
    caption.innerHTML = " Operating hours";
    hours.appendChild(caption);

    //work hours 

    for (let key in operatingHours) {
        const row = document.createElement('tr');
        // Add tab Index for accessibility
        row.tabIndex = 0;

        const day = document.createElement('td');
        day.innerHTML = key;
        row.appendChild(day);

        const time = document.createElement('td');
        time.innerHTML = operatingHours[key];
        row.appendChild(time);

        hours.appendChild(row);
    }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
    const container = document.getElementById('reviews-container');
    const title = document.createElement('h2');
    title.innerHTML = 'Reviews';
    // Add tab Index for accessibility
    title.tabIndex = 0;
    container.appendChild(title);

    if (!reviews) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        // Add tab Index for accessibility
        noReviews.tabIndex = 0;
        container.appendChild(noReviews);
        return;
    }
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
        ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
    // Add tab Index for accessibility
    const li = document.createElement('li');
    const name = document.createElement('h1');
    name.innerHTML = review.name;
    name.tabIndex = 0;
    li.appendChild(name);

    const rating = document.createElement('p');
    // Add Stars icon for review rating 
    let star = [];
    for (let i = 0; i < review.rating; i++) {
        star.push("\u2B50");
    }
    rating.classList = "rating";
    rating.innerHTML = star.join("");
    //Add aria_label and tab Index for accessibility
    rating.setAttribute('aria_label', "The number of stars is " + star.length);
    rating.tabIndex = 0;
    li.appendChild(rating);

    const date = document.createElement('p');
    date.classList = "date";
    date.innerHTML = review.date;
    date.tabIndex = 0;
    li.appendChild(date);

    const comments = document.createElement('p');
    comments.classList = "comments";
    comments.innerHTML = review.comments;
    comments.tabIndex = 0;
    li.appendChild(comments);

    return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    li.innerHTML = restaurant.name;
    // Add tab Index for accessibility
    breadcrumb.tabIndex = 0;
    breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
    if (!url)
        url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}