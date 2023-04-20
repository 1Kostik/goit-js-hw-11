import axios from 'axios';

const APIKEY = '35491048-668e63f7ba8686a686ff97f20';

const BASE_URL = 'https://pixabay.com/api/';

export default class SearchFoto {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
    this.loadedHits = 0;
  }

  async fetchSearch() {
    const parametrs = new URLSearchParams({

      key: APIKEY,

      image_type: 'photo',

      q: this.searchQuery,

      safesearch: true,

      orientation: 'horizontal',

      per_page: 40,

      page: this.page,
      
    });

    const url = `${BASE_URL}?${parametrs}`;

    try {
      const response = await axios.get(url);

      this.incrementPage();

      return response.data;
    } catch (error) {
      console.warn(`${error}`);
    }
  }

  incrementLoadedHits(hits) {
    this.loadedHits += hits.length;
  }

  resetLoadedHits() {
    this.loadedHits = 0;
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}
