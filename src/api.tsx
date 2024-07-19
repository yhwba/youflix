const API_KEY = "77f366fae0231aa269da16824fe2c4c8";
const BASE_PATH = "https://api.themoviedb.org/3";

interface IMovie {
   id: number;
   backdrop_path: string;
   poster_path: string;
   title: string;
   overview: string;
}

export interface IGetMoviesResult {
   dates: {
      maximum: string;
      minimum: string;
   };
   page: number;
   results: IMovie[];
   total_pages: number;
   total_results: number;
}

// Tv Show 데이터
interface ITvShow {
   id: number; // 정보의 id
   backdrop_path: string; // 대형 이미지
   poster_path: string; // 포스터 이미지
   name: string; // 제목
   overview: string; // 영화 요약
}

// themoviedb.org "tv/popular" api interface
export interface IGetTvShowsResult {
   page: number;
   results: ITvShow[]; // 영화 데이터 interface의 []
   total_pages: number;
   total_results: number;
}


export function getMovies() {
   return fetch(`${BASE_PATH}/movie/now_playing?api_key=${API_KEY}`).then(
      (response) => response.json()
   );
}

export function getPopularTvShows() {
   return fetch(
      `${BASE_PATH}/tv/popular?api_key=${API_KEY}`
   ).then((response) => response.json());
}