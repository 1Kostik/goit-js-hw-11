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
const callback = entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      updateData();
    }
  });
};
const options = {
  rootMargin: '100px',
};
const observer = new IntersectionObserver(callback, options);
const wraper = document.querySelector('.wraper');

const parentGallery = document.querySelector('.gallery');

let gallery = new SimpleLightbox('.gallery a');

const refs = {
  form: document.querySelector('.search-form'),
  input: document.querySelector('.search-form input'),
  buttonLoadMore: document.querySelector('.load-more'),
};

refs.form.addEventListener('submit', onFormSubmit);

const SearchImeg = new SearchFoto();

function onFormSubmit(event) {
  event.preventDefault();

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

    observer.observe(wraper);

    gallery.refresh();
  });
}

function updateData() {
  SearchImeg.fetchSearch().then(({ hits, totalHits }) => {
    SearchImeg.incrementLoadedHits(hits);

    createGalleryMarkup(hits);

    gallery.refresh();

    if (totalHits <= SearchImeg.loadedHits) {
      console.log(SearchImeg.loadedHits);
      notifyInfo();
      refs.form.reset();
      SearchImeg.query = '';
      observer.unobserve(wraper);

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
