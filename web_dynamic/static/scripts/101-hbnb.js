$(document).ready(init);

const HOST = '0.0.0.0';
const amenityObj = {};

const stateObj = {};
const cityObj = {};
let obj = {};

function init () {
  $('.amenities .popover input').change(function () { obj = amenityObj; checkedObjects.call(this, 1); });
  $('.state_input').change(function () { obj = stateObj; checkedObjects.call(this, 2); });
  $('.city_input').change(function () { obj = cityObj; checkedObjects.call(this, 3); });
  apiStatus();
  searchPlaces();
}

function checkedObjects (nObject) {
  if ($(this).is(':checked')) {
    obj[$(this).attr('data-name')] = $(this).attr('data-id');
  } else if ($(this).is(':not(:checked)')) {
    delete obj[$(this).attr('data-name')];
  }
  const names = Object.keys(obj);
  if (nObject === 1) {
    $('.amenities h4').text(names.sort().join(', '));
  } else if (nObject === 2) {
    $('.locations h4').text(names.sort().join(', '));
  }
}

function apiStatus () {
  const API_URL = `http://${HOST}:5001/api/v1/status/`;
  $.get(API_URL, (data, textStatus) => {
    if (textStatus === 'success' && data.status === 'OK') {
      $('#api_status').addClass('available');
    } else {
      $('#api_status').removeClass('available');
    }
  });
}

function searchPlaces () {
  const PLACES_URL = `http://${HOST}:5001/api/v1/places_search/`;
  $.ajax({
    url: PLACES_URL,
    type: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({
      amenities: Object.values(amenityObj),
      states: Object.values(stateObj),
      cities: Object.values(cityObj)
    }),
    success: function (response) {
      $('SECTION.places').empty();
      for (let r of response) {
        const article = ['<article>',
          '<div class="title_box">',
          `<h2>${r.name}</h2>`,
          `<div class="price_by_night">$${r.price_by_night}</div>`,
          '</div>',
          '<div class="information">',
          `<div class="max_guest">${r.max_guest} Guest(s)</div>`,
          `<div class="number_rooms">${r.number_rooms} Bedroom(s)</div>`,
          `<div class="number_bathrooms">${r.number_bathrooms} Bathroom(s)</div>`,
          '</div>',
          '<div class="description">',
          `${r.description}`,
          '</div>',
          '<div class="reviews">',
          '<h2 class=review_heading>Reviews</h2>',
          `<span class="review_toggle" data-id = "${r.id}">SHOW </span>`,
          `<ul id="${r.id}">`,
          '<li>',
          '<h3></h3>',
          '<p></p>',
          '</li>',
          '/ul>',
          '</div>',
          '</article>'];
        $('SECTION.places').append(article.join(''));
        getReviews.call();
      }
    },
    error: function (error) {
      console.log(error);
    }
  });
  $('.review_toggle').click(function () {
    let ulid = this.dataset.id;
    let url = 'http://0.0.0.0:5001/api/v1/places/' + ulId + '/reviews';
    $.get(url, function (data) {
      data.forEach(function (review) {
        $(`
        <li>
        <h3>${review.user.first_name} ${review.user.last_name}</h3>
        <p>${review.text}</p>
        </li> `).appendTo('#' + ulId);
      });
    });
  });
}
