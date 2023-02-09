import { number } from "prop-types";
import { useState, useEffect } from "react";
import YouTube from "react-youtube";
import axios from "../../axios";
import "./Row.scss";
import style from "./Youtube.module.scss";
const base_url = "https://image.tmdb.org/3/";
const YOUTUBE_baseURL = "https://www.googleapis.com/youtube/v3";

type Filter = {
	origin_country?: "JP" | "US";
};

type Props = {
	title: string;
	fetchUrl: string;
	isLargeRow?: boolean;
	isTrend?: boolean;
};

type Movie = {
	id: string;
	name: string;
	title: string;
	original_name: string;
	poster_path: string;
	backdrop_path: string;
};

//trailer option
type Options = {
	height: string;
	width: string;
	playerVars: {
		autoplay: 0 | 1 | undefined;
		controls: 0 | 1 | undefined;
		fs: 0 | 1 | undefined;
		iv_load_policy: number | undefined;
		modestbranding: number | undefined;
		playsinline: number | undefined;
		loop: number | undefined;
	};
};

export const Row = ({ title, fetchUrl, isLargeRow, isTrend }: Props) => {
	const [movies, setMovies] = useState<Movie[]>([]);

	const [trailerUrl, setTrailerUrl] = useState<string | null>("");

	const filter: Filter = {
		origin_country: "JP",
	};
	// When DOM render And fetchUrl updated
	useEffect(() => {
		// function fetchDateを定義
		async function fetchData() {
			const request = await axios.get(fetchUrl);
			setMovies(request.data.results);
			return request;
		}
		fetchData();
	}, [fetchUrl]);

	const opts: Options = {
		height: "390",
		width: "640",
		playerVars: {
			autoplay: 1,
			controls: 0,
			fs: 0,
			iv_load_policy: 3,
			modestbranding: 1,
			playsinline: 1,
			loop: 1,
		},
	};

	const handleClick = async (movie: Movie) => {
		trailerUrl && setTrailerUrl("");
		try {
			isTrend
				? await axios
						.get(
							`https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=` +
								import.meta.env.VITE_MVDB_API_KEY
						)
						.then((res) => {
							!("success" in res.data.results) &&
								setTrailerUrl(res.data.results[0].key);
							return true;
						})
				: await axios
						.get(
							`${YOUTUBE_baseURL}/search?key=${
								import.meta.env.VITE_YOUTUBE_API_KEY
							}&q=${movie.name + " op"}`
						)
						.then((res) => {
							setTrailerUrl(res.data.items[0].id.videoId);
						});

			console.log(trailerUrl);
		} catch (e) {
			console.log(e + "axios-err");
		}
	};

	return (
		<div className="Row">
			<h2>{title}</h2>
			<div className="Row-posters">
				{movies.map((movie, i) => (
					<img
						key={movie.id}
						className={`Row-poster ${isLargeRow && "Row-poster-large"}`}
						src={`${base_url}${
							isLargeRow
								? `t/p/w185/${movie.poster_path}`
								: `t/p/w154/${movie.backdrop_path}`
						}`}
						alt={movie.name}
						onClick={() => isLargeRow && handleClick(movie)}
					/>
				))}
			</div>
			{trailerUrl && (
				<div className={style.container}>
					<div className={style.filter}></div>
					<YouTube
						videoId={trailerUrl}
						opts={opts}
						className={style.iframe}
						iframeClassName={style.youtube}
						onEnd={() => setTrailerUrl("")}
					/>
				</div>
			)}
		</div>
	);
};
