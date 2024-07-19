import { useQuery } from "react-query";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
   getMovies,
   getPopularTvShows,
   IGetMoviesResult,
   IGetTvShowsResult,
} from "../api";
import { makeImagePath } from "../utils";
import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState } from "react";
import { useRouteMatch, useHistory } from "react-router-dom";

const LIST_TYPE = ["moviesList", "tvShowList"];
const OFFSET = 6; // 한번에 보여줄 영화 개수

const Wrapper = styled.div`
  background: #000;
  overflow-x: hidden;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Banner = styled.div<{ bgphoto: string }>`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
    url(${(props) => props.bgphoto});
  background-size: cover;
`;

const Title = styled.h2`
  font-size: 68px;
  font-weight: 900;
  margin-bottom: 10px;
`;

const Overview = styled.p`
  width: 34%;
  font-size: 18px;
  font-weight: 700;
`;

const Slider = styled.div`
  position: relative;
  &:nth-child(2) {
    top: -100px;
  }
  &:nth-child(3) {
    top: 300px;
  }
`;

const SliderTitle = styled.div`
  position: absolute;
  top: -50px;
  font-size: 24px;
  padding-left: 20px;
  font-weight: 700;
`;

const ArrowBtn = styled(motion.div)`
  width: 30px;
  height: 200px;
  position: absolute;
  top: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  opacity: 1;
`;

const LeftArrowBtn = styled(ArrowBtn)`
  left: 0;
`;

const RightArrowBtn = styled(ArrowBtn)`
  right: 0;
`;

const Row = styled(motion.div)`
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(6, 1fr);
  margin-bottom: 5px;
  position: absolute;
  top: 0;
  width: 100%;
`;

const Box = styled(motion.div) <{ bgphoto: string }>`
  background-color: #fff;
  height: 200px;
  background-image: url(${(props) => props.bgphoto});
  background-size: cover;
  background-position: center;
  font-size: 40px;
  cursor: pointer;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`;

const Info = styled(motion.div)`
  padding: 10px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: relative;
  top: 158px;
  width: 100%;
  h4 {
    text-align: center;
    font-size: 18px;
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
`;

const BigMovie = styled(motion.div)`
  position: fixed;
  width: 40vw;
  height: 80vh;
  top: 100px;
  left: 0;
  right: 0;
  margin: 0 auto;
  border-radius: 15px;
  overflow: hidden;
  background-color: ${(props) => props.theme.black.lighter};
`;

const BigCover = styled.div`
  width: 100%;
  background-size: cover;
  background-position: center center;
  height: 400px;
`;

const BigTitle = styled.h3`
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
  font-size: 46px;
  position: relative;
  top: -80px;
`;

const BigOverView = styled.p`
  padding: 20px;
  position: relative;
  top: -80px;
  color: ${(props) => props.theme.white.lighter};
`;

const rowVariants = {
   hidden: (back: number) => {
      return {
         x: window.innerWidth * back + 5 * back,
      };
   },
   visible: {
      x: 0,
   },
   exit: (back: number) => {
      return {
         x: window.innerWidth * -1 * back - 5 * back,
      };
   },
};

const boxVariants = {
   normal: {
      scale: 1,
   },
   hover: {
      scale: 1.3,
      y: -50,
      transition: {
         type: "tween",
         delay: 0.5,
         duration: 0.3,
      },
   },
};

const infoVariants = {
   hover: {
      opacity: 1,
      transition: {
         type: "tween",
         delay: 0.5,
         duration: 0.3,
      },
   },
};

function Home() {
   const history = useHistory();
   const bigMovieMatch = useRouteMatch<{ movieId: string }>("/movies/:movieId");
   // get Movies
   const { data: moviesList, isLoading: movieLoading } =
      useQuery<IGetMoviesResult>([LIST_TYPE[0], "nowPlaying"], getMovies);

   // get Tv Show
   const { data: tvShowList, isLoading: tvShowLoading } =
      useQuery<IGetTvShowsResult>(
         [LIST_TYPE[1], "popularTvShows"],
         getPopularTvShows
      );

   const [movieIsBack, setMovieIsBack] = useState(1); // left: -1, right: 1
   const [movieIndex, setMovieIndex] = useState(0);

   const [tvShowIndex, setTvShowIndex] = useState(0);
   const [tvShowIsBack, setTvShowIsBack] = useState(1); // left: -1, right: 1

   const changeIndex = (slideType: string, slideDirect: boolean) => {
      if (leaving) return;

      if (slideType === LIST_TYPE[0] && moviesList) {
         if (slideDirect) setMovieIsBack(1);
         else setMovieIsBack(-1);

         const totalMovies = moviesList.results.length;
         //20개 리스트에서 18개만 보여주기 위해 floor처리
         const maxMovieIndex = Math.floor(totalMovies / OFFSET);

         if (movieIsBack === 1)
            setMovieIndex((prev) => (prev === maxMovieIndex ? 0 : prev + 1));
         else setMovieIndex((prev) => (prev === 0 ? maxMovieIndex : prev - 1));
      } else if (slideType === LIST_TYPE[1] && moviesList) {
         if (slideDirect) setTvShowIsBack(1);
         else setTvShowIsBack(-1);

         const totalTvShow = tvShowList ? tvShowList.results.length : 0;
         const maxTvShowsIndex = Math.floor(totalTvShow / OFFSET);
         if (tvShowIsBack === 1)
            setTvShowIndex((prev) => (prev === maxTvShowsIndex ? 0 : prev + 1));
         else setTvShowIndex((prev) => (prev === 0 ? maxTvShowsIndex : prev - 1));
      }
      toggleLeaving(); // true 처리용 > 강제 흘러감 방지
   };
   const leftSlider = (slideType: string) => {
      changeIndex(slideType, false);
   };
   const rightSlider = (slideType: string) => {
      changeIndex(slideType, true);
   };
   const [leaving, setLeaving] = useState(false);
   const toggleLeaving = () => setLeaving((prev) => !prev);
   const onBoxClicked = (types: string, movieId: number) => {
      history.push(`/${types}/${movieId}`);
   };

   const onOverlayClicked = () => {
      history.push("/");
   };

   const clickedMovie =
      bigMovieMatch?.params.movieId &&
      moviesList?.results.find((movie: { id: number; }) => movie.id === +bigMovieMatch.params.movieId);
   return (
      <Wrapper>
         {movieLoading || tvShowLoading ? (
            <Loader>Loading...</Loader>
         ) : (
            <>
               <Banner
                  bgphoto={makeImagePath(moviesList?.results[0].backdrop_path || "")}
               >
                  <Title>{moviesList?.results[0].title}</Title>
                  <Overview>{moviesList?.results[0].overview}</Overview>
               </Banner>
               <Slider>
                  <SliderTitle>NOW PLAYING</SliderTitle>
                  <LeftArrowBtn onClick={() => leftSlider(LIST_TYPE[0])}>
                     <span>&#60;</span>
                  </LeftArrowBtn>
                  <AnimatePresence
                     initial={false}
                     onExitComplete={toggleLeaving}
                     custom={movieIsBack}
                  >
                     <Row
                        custom={movieIsBack}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ type: "tween", duration: 1 }}
                        key={movieIndex}
                     >
                        {moviesList?.results
                           .slice(OFFSET * movieIndex, OFFSET * movieIndex + OFFSET)
                           .map((movie: { id: number; backdrop_path: any; title: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; }) => (
                              <Box
                                 key={movie.id}
                                 variants={boxVariants}
                                 initial="normal"
                                 whileHover="hover"
                                 transition={{ type: "tween" }}
                                 layoutId={movie.id + ""}
                                 bgphoto={makeImagePath(movie.backdrop_path || "", "w500")}
                                 onClick={() => onBoxClicked("movies", movie.id)}
                              >
                                 <Info variants={infoVariants}>
                                    <h4>{movie.title}</h4>
                                 </Info>
                              </Box>
                           ))}
                     </Row>
                  </AnimatePresence>
                  <RightArrowBtn onClick={() => rightSlider(LIST_TYPE[0])}>
                     <span>&#62;</span>
                  </RightArrowBtn>
               </Slider>
               <Slider>
                  <SliderTitle>POPULAR TV SHOWS</SliderTitle>
                  <LeftArrowBtn onClick={() => leftSlider(LIST_TYPE[1])}>
                     <span>&#60;</span>
                  </LeftArrowBtn>
                  <AnimatePresence
                     initial={false}
                     onExitComplete={toggleLeaving}
                     custom={tvShowIsBack}
                  >
                     <Row
                        custom={tvShowIsBack}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ type: "tween", duration: 1 }}
                        key={tvShowIndex}
                     >
                        {tvShowList?.results
                           .slice(OFFSET * tvShowIndex, OFFSET * tvShowIndex + OFFSET)
                           .map((tvShow: { id: number; backdrop_path: any; name: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; }) => (
                              <Box
                                 key={tvShow.id}
                                 variants={boxVariants}
                                 initial="normal"
                                 whileHover="hover"
                                 transition={{ type: "tween" }}
                                 layoutId={tvShow.id + ""}
                                 bgphoto={makeImagePath(
                                    tvShow.backdrop_path || "",
                                    "w500"
                                 )}
                                 onClick={() => onBoxClicked("tv", tvShow.id)}
                              >
                                 <Info variants={infoVariants}>
                                    <h4>{tvShow.name}</h4>
                                 </Info>
                              </Box>
                           ))}
                     </Row>
                  </AnimatePresence>
                  <RightArrowBtn onClick={() => rightSlider(LIST_TYPE[1])}>
                     <span>&#62;</span>
                  </RightArrowBtn>
               </Slider>
               <AnimatePresence>
                  {bigMovieMatch ? (
                     <>
                        <Overlay
                           onClick={onOverlayClicked}
                           exit={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                        />
                        <BigMovie layoutId={bigMovieMatch.params.movieId}>
                           {clickedMovie && (
                              <>
                                 <BigCover
                                    style={{
                                       backgroundImage: `linear-gradient(to top, black, transparent),url(${makeImagePath(
                                          clickedMovie.backdrop_path,
                                          "w500"
                                       )})`,
                                    }}
                                 />
                                 <BigTitle>{clickedMovie.title}</BigTitle>
                                 <BigOverView>{clickedMovie.overview}</BigOverView>
                              </>
                           )}
                        </BigMovie>
                     </>
                  ) : null}
               </AnimatePresence>
            </>
         )}
      </Wrapper>
   );
}

export default Home;