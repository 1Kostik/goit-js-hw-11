'use strict';
import SearchFoto from './fetchSearch';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
Notify.init({
  position: 'right-top',
  cssAnimationStyle: 'fade',
  fontSize: '20px',
  width: '450px',
  closeButton: false,
});
const parentGallery = document.querySelector('.gallery');

let gallery = new SimpleLightbox('.gallery a');

const refs = {
  form: document.querySelector('.search-form'),
  input: document.querySelector('.search-form input'),
};
let allContentLoaded = false;
refs.form.addEventListener('submit', onFormSubmit);

const SearchImeg = new SearchFoto();

function onFormSubmit(event) {
  event.preventDefault();
  gallery.refresh();

  
  SearchImeg.resetLoadedHits();
  
  SearchImeg.resetPage();
  
  clearConteinerImeg();
  
  SearchImeg.query = refs.input.value.trim();
  if (!SearchImeg.query) {
    return;
  }
  SearchImeg.fetchSearch().then(({ hits, totalHits }) => {
    if (!hits.length) {
      notifyInfoError();
      return;
    }

    notifySuccess(totalHits);

    SearchImeg.incrementLoadedHits(hits);

    createGalleryMarkup(hits);

    addScroll();

    allContentLoaded = false;

    gallery.refresh();
  });
}
function updateData() {

  
  SearchImeg.fetchSearch().then(({ hits, totalHits }) => {

    
    SearchImeg.incrementLoadedHits(hits);
    
    createGalleryMarkup(hits);

    gallery.refresh();


    if (totalHits <= SearchImeg.loadedHits) {
      allContentLoaded = true;
      
      notifyInfo();  
      
      removeScroll();
      
      gallery.refresh();

      return;
    }
  });
}

function createGalleryMarkup(images) {
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
            <div class="photo-card">
            <a href="${largeImageURL}">
            <img
            class="photo-card__img"
            src="${webformatURL}" 
            alt="${tags}" 
            loading="lazy" 
            width="320"
            height="212"
            />
            </a>
            <div class="info">
            <p class="info-item">
            <b>Likes</b>
            <span>${likes}</span>
            </p>
            <p class="info-item">
            <b>Views</b>
            <span>${views}</span>
            </p>
            <p class="info-item">
            <b>Comments</b>
            <span>${comments}</span>
            </p>
            <p class="info-item">
            <b>Downloads</b>
           <span>${downloads}</span>
           </p>
           </div>
           </div>
           `;
      }
    )
    .join('');

  parentGallery.insertAdjacentHTML('beforeend', markup);
  gallery.refresh();
}

function clearConteinerImeg() {
  parentGallery.innerHTML = '';
}

function checkPosition() {
  // Нам потребуется знать высоту документа и высоту экрана:
  const height = document.body.offsetHeight;
  const screenHeight = window.innerHeight;

  // Они могут отличаться: если на странице много контента,
  // высота документа будет больше высоты экрана (отсюда и скролл).

  // Записываем, сколько пикселей пользователь уже проскроллил:
  const scrolled = window.scrollY;

  // Обозначим порог, по приближении к которому
  // будем вызывать какое-то действие.
  // В нашем случае — четверть экрана до конца страницы:
  const threshold = height - screenHeight / 4;

  // Отслеживаем, где находится низ экрана относительно страницы:
  const position = scrolled + screenHeight;

  if (!allContentLoaded && position >= threshold) {
    // Если мы пересекли полосу-порог, вызываем нужное действие.
    updateData();
  }
}

function throttle(callee, timeout) {
  let timer = null;

  return function perform(...args) {
    if (timer) return;

    timer = setTimeout(() => {
      callee(...args);

      clearTimeout(timer);
      timer = null;
    }, timeout);
  };
}

function addScroll() {
  window.addEventListener('scroll', throttle(checkPosition, 250));
  window.addEventListener('resize', throttle(checkPosition, 250));
}
function removeScroll() {
  window.removeEventListener('scroll', checkPosition);
  window.removeEventListener('resize', checkPosition);
}
function notifySuccess(totalHits) {
  Notify.success(`Hooray! We found ${totalHits} images.`);
}
function notifyInfo() {
  Notify.info("We're sorry, but you've reached the end of search results.");
}

function notifyInfoError() {
  Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}
