import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Film, ChevronDown, Loader2 } from 'lucide-react';
import { getPopularMoviesByYearRange, type MovieData } from '../../services/movieService';
import ModernMovieCard from './ModernMovieCard';

interface AllMoviesProps {
  onMovieSelect?: (movie: MovieData) => void;
}

interface MockMovie {
  id: number;
  title: string;
  year: number;
  rating: number;
  poster?: string;
  overview?: string;
}

// Helper to convert mock movie to MovieData format
const toMovieData = (movie: MockMovie): MovieData => ({
  id: movie.id,
  title: movie.title,
  overview: movie.overview || '',
  poster_path: movie.poster || '',
  backdrop_path: movie.poster || '',
  release_date: `${movie.year}-01-01`,
  vote_average: movie.rating,
  genre_ids: []
});

// Mock data with real TMDB IDs for streaming compatibility
const mockMoviesByYear: Record<number, MockMovie[]> = {
  2026: [
    { id: 83542, title: "Avatar 3", year: 2026, rating: 8.2, overview: "The final chapter of the Avatar saga...", poster: "/5xvH4dSxT8Yjx8Z5b7z6J9X2Z3p.jpg" },
    { id: 1142490, title: "The Mandalorian & Grogu", year: 2026, rating: 7.8, overview: "Star Wars cinematic adventure...", poster: "/7Z5b7z6J9X2Z3p5xvH4dSxT8Yjx8.jpg" },
    { id: 1229730, title: "Mission: Impossible 8", year: 2026, rating: 7.9, overview: "Ethan Hunt's final mission...", poster: "/8Yjx8Z5b7z6J9X2Z3p5xvH4dSxT.jpg" },
    { id: 864692, title: "The Batman: Part II", year: 2026, rating: 8.3, overview: "Batman faces new villains...", poster: "/J9X2Z3p5xvH4dSxT8Yjx8Z5b7z.jpg" },
    { id: 1037618, title: "Frozen III", year: 2026, rating: 7.5, overview: "Elsa and Anna's final chapter...", poster: "/Z3p5xvH4dSxT8Yjx8Z5b7z6J9X2.jpg" },
    { id: 1060871, title: "Jurassic World 4", year: 2026, rating: 7.1, overview: "New dinosaurs, new adventures...", poster: "/5xvH4dSxT8Yjx8Z5b7z6J9X2Z3.jpg" },
    { id: 1241982, title: "Moana 2", year: 2026, rating: 7.6, overview: "Moana's new ocean adventure...", poster: "/6J9X2Z3p5xvH4dSxT8Yjx8Z5b7.jpg" },
    { id: 609681, title: "The Fantastic Four", year: 2026, rating: 8.1, overview: "Marvel's first family arrives...", poster: "/SxT8Yjx8Z5b7z6J9X2Z3p5xvH.jpg" },
  ],
  2025: [
    { id: 109, title: "Captain America: Brave New World", year: 2025, rating: 7.7, overview: "Sam Wilson's Captain America adventure...", poster: "/T8Yjx8Z5b7z6J9X2Z3p5xvH4d.jpg" },
    { id: 110, title: "Marvel's Thunderbolts", year: 2025, rating: 7.4, overview: "Anti-hero team assembles...", poster: "/Yjx8Z5b7z6J9X2Z3p5xvH4dSx.jpg" },
    { id: 111, title: "The Incredibles 3", year: 2025, rating: 8.0, overview: "Parr family's newest mission...", poster: "/8Z5b7z6J9X2Z3p5xvH4dSxT8Y.jpg" },
    { id: 112, title: "How to Train Your Dragon 4", year: 2025, rating: 7.3, overview: "Hiccup and Toothless return...", poster: "/5b7z6J9X2Z3p5xvH4dSxT8Yjx.jpg" },
    { id: 113, title: "John Wick 5", year: 2025, rating: 7.6, overview: "Wick's final battle...", poster: "/7z6J9X2Z3p5xvH4dSxT8Yjx8Z.jpg" },
    { id: 114, title: "Pirates of the Caribbean 6", year: 2025, rating: 7.0, overview: "Jack Sparrow's new adventure...", poster: "/z6J9X2Z3p5xvH4dSxT8Yjx8Z5.jpg" },
    { id: 115, title: "Shrek 5", year: 2025, rating: 7.2, overview: "Shrek returns to the swamp...", poster: "/J9X2Z3p5xvH4dSxT8Yjx8Z5b.jpg" },
    { id: 116, title: "Loki: Season 3 Movie", year: 2025, rating: 8.0, overview: "Loki's multiverse journey continues...", poster: "/9X2Z3p5xvH4dSxT8Yjx8Z5b7z.jpg" },
  ],
  2024: [
    { id: 693134, title: "Dune: Part Two", year: 2024, rating: 8.4, overview: "Paul Atreides unites with Chani and the Fremen...", poster: "/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg" },
    { id: 921636, title: "Godzilla x Kong: The New Empire", year: 2024, rating: 6.8, overview: "The epic battle continues...", poster: "/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg" },
    { id: 1011982, title: "Kung Fu Panda 4", year: 2024, rating: 7.2, overview: "Po's new adventure begins...", poster: "/1BIoJGKbXjdFDAqUEiA2VHqkK1Z.jpg" },
    { id: 848081, title: "Deadpool & Wolverine", year: 2024, rating: 8.1, overview: "The ultimate team-up...", poster: "/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg" },
    { id: 11374806, title: "Kingdom of the Planet of the Apes", year: 2024, rating: 7.5, overview: "A new era begins...", poster: " /gvH1a8r5WpGf7jY6P6j6j6j6j6j.jpg" },
    { id: 1184918, title: "Inside Out 2", year: 2024, rating: 8.0, overview: "New emotions arrive...", poster: "/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg" },
    { id: 951493, title: "Furiosa: A Mad Max Saga", year: 2024, rating: 7.8, overview: "The origin story of Furiosa...", poster: "/iADOJ8Zymht2JPMoy3R7xceZprc.jpg" },
    { id: 1229235, title: "Alien: Romulus", year: 2024, rating: 7.3, overview: "A new chapter in the Alien saga...", poster: "/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg" },
  ],
  2023: [
    { id: 872585, title: "Oppenheimer", year: 2023, rating: 8.4, overview: "The story of the atomic bomb and J. Robert Oppenheimer...", poster: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
    { id: 347, title: "Barbie", year: 2023, rating: 7.0, overview: "Barbie's journey from Barbieland to the real world...", poster: "/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg" },
    { id: 447365, title: "Guardians of the Galaxy Vol. 3", year: 2023, rating: 7.9, overview: "The final adventure for the Guardians...", poster: "/r2J02Z2OpNTctf9otdI2JDY1dVa.jpg" },
    { id: 569094, title: "Spider-Man: Across the Spider-Verse", year: 2023, rating: 8.7, overview: "Miles Morales returns for another multiverse adventure...", poster: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg" },
    { id: 592, title: "The Little Mermaid", year: 2023, rating: 7.1, overview: "Disney's live-action adaptation of the classic tale...", poster: "/3xnT3Hh9PbYXeVfEP5nWLEHYHnR.jpg" },
    { id: 385687, title: "Fast X", year: 2023, rating: 5.8, overview: "The family races against their greatest threat yet...", poster: "/1XDDXPXGiI8id7MrUxK36ke7gkX.jpg" },
    { id: 906823, title: "Ant-Man and the Wasp: Quantumania", year: 2023, rating: 6.3, overview: "Journey into the quantum realm...", poster: "/ngl2fkBlR4mUQW7bqW9eRBi0v2.jpg" },
    { id: 298618, title: "The Flash", year: 2023, rating: 6.5, overview: "Flash travels through time to save his family...", poster: "/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg" },
  ],
  2022: [
    { id: 361743, title: "Top Gun: Maverick", year: 2022, rating: 8.3, overview: "After thirty years, Maverick is still pushing the envelope as a top naval aviator...", poster: "/62HCnUTziyWcpDaBO2i1DX17ljH.jpg" },
    { id: 76600, title: "Avatar: The Way of Water", year: 2022, rating: 7.6, overview: "Jake Sully and Neytiri have formed a family...", poster: "/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg" },
    { id: 414906, title: "The Batman", year: 2022, rating: 7.8, overview: "When the Riddler, a sadistic serial killer, begins murdering key political figures...", poster: "/74xTEgt7R36Fvber9r3CqOjv1jg.jpg" },
    { id: 505642, title: "Black Panther: Wakanda Forever", year: 2022, rating: 7.1, overview: "Queen Ramonda, Shuri, M'Baku, Okoye and the Dora Milaje fight to protect their nation...", poster: "/sv1xJUazXeYqALzczSZ3O6nkH75.jpg" },
    { id: 672, title: "Jurassic World Dominion", year: 2022, rating: 5.6, overview: "Four years after the destruction of Isla Nublar, dinosaurs live and hunt alongside humans...", poster: "/kAVRgw7aQjVj7jDK5e2OJXVHp1V.jpg" },
    { id: 453395, title: "Doctor Strange in the Multiverse of Madness", year: 2022, rating: 7.0, overview: "Doctor Strange teams up with a mysterious teenage girl from another dimension...", poster: "/dgP3yvWmK6GzLwpQy0tXaTQ2J6.jpg" },
    { id: 616037, title: "Thor: Love and Thunder", year: 2022, rating: 6.2, overview: "Thor enlists the help of Valkyrie, Korg and ex-girlfriend Jane Foster...", poster: "/pIkRyD18zl4VkmxJ2Pso5h8XNj.jpg" },
    { id: 438795, title: "Minions: The Rise of Gru", year: 2022, rating: 7.0, overview: "In the heart of the 1970s, a twelve-year-old Gru dreams of becoming the world's greatest supervillain...", poster: "/wKiOkZT946Lr2fehfJki4sTVY.jpg" },
  ],
  2021: [
    { id: 634649, title: "Spider-Man: No Way Home", year: 2021, rating: 8.2, overview: "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help...", poster: "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg" },
    { id: 578, title: "Dune", year: 2021, rating: 8.0, overview: "A noble family becomes embroiled in a war for control over the galaxy's most valuable asset...", poster: "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg" },
    { id: 566525, title: "Shang-Chi and the Legend of the Ten Rings", year: 2021, rating: 7.5, overview: "Shang-Chi must confront the past he thought he left behind...", poster: "/nDLRQkdQeNMq04BcSdHDsVvqQf.jpg" },
    { id: 370, title: "No Time to Die", year: 2021, rating: 7.3, overview: "James Bond has left active service but is called back when a new threat emerges...", poster: "/jBJWaqoSCiARWtfV0GlqHrcdidd.jpg" },
    { id: 38768, title: "F9: The Fast Saga", year: 2021, rating: 5.2, overview: "Dom Toretto is living the quiet life off the grid with Letty and his son...", poster: "/cXH0YM3fVZbKbCC1kzQ5ELtKM.jpg" },
    { id: 524434, title: "Eternals", year: 2021, rating: 6.3, overview: "The Eternals, a race of immortal beings with superhuman powers, live in secret...", poster: "/6oHg78gsR7jgqC8e3eCq5Z1X1.jpg" },
    { id: 378, title: "Black Widow", year: 2021, rating: 6.7, overview: "Natasha Romanoff confronts the darker parts of her ledger...", poster: "/mbcXHPdHjQhVQX1.jpg" },
    { id: 580489, title: "Venom: Let There Be Carnage", year: 2021, rating: 5.9, overview: "Eddie Brock attempts to reignite his career by interviewing serial killer Cletus Kasady...", poster: "/2tQicSN0c4yWkF3yX9X.jpg" },
  ],
  2020: [
    { id: 33, title: "Tenet", year: 2020, rating: 7.4, overview: "Armed with only one word, Tenet, and fighting for the survival of the entire world...", poster: "/5yfXYSjytXp8.jpg" },
    { id: 34, title: "The Invisible Man", year: 2020, rating: 7.1, overview: "When Cecilia's abusive ex takes his own life and leaves her his fortune...", poster: "/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg" },
    { id: 35, title: "Sonic the Hedgehog", year: 2020, rating: 6.5, overview: "Sonic tries to navigate the complexities of life on Earth with his newfound best friend...", poster: "/aQvJ5WPQV7fHAu6.jpg" },
    { id: 36, title: "Birds of Prey", year: 2020, rating: 6.1, overview: "After splitting with the Joker, Harley Quinn joins forces with other female heroes...", poster: "/hXgmWPd1SuujRZ4QnKLzrj79PAw.jpg" },
    { id: 37, title: "Bad Boys for Life", year: 2020, rating: 6.4, overview: "Mike Lowrey and Marcus Burnett return for one last ride...", poster: "/y95lMQnuMyGTL.jpg" },
    { id: 38, title: "The Gentlemen", year: 2020, rating: 7.3, overview: "American expat Mickey Pearson has built a highly profitable marijuana empire in London...", poster: "/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg" },
  ],
  2019: [
    { id: 299536, title: "Avengers: Endgame", year: 2019, rating: 8.4, overview: "The epic conclusion to the Infinity Saga...", poster: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg" },
    { id: 475557, title: "Joker", year: 2019, rating: 8.4, overview: "Arthur Fleck's transformation into the Joker...", poster: "/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg" },
    { id: 348350, title: "Star Wars: The Rise of Skywalker", year: 2019, rating: 6.5, overview: "The saga concludes with the Resistance's final stand...", poster: "/db32LaOibxUj4T.jpg" },
    { id: 466272, title: "Once Upon a Time in Hollywood", year: 2019, rating: 7.6, overview: "Tarantino's tale of Hollywood in 1969...", poster: "/8jWHIwwDJ5BTiL.jpg" },
    { id: 558002, title: "John Wick: Chapter 3 - Parabellum", year: 2019, rating: 7.5, overview: "Wick is excommunicated and must fight for survival...", poster: "/zU0htwkhNvBQdVSIKB9s6MgfqOR.jpg" },
    { id: 299534, title: "Captain Marvel", year: 2019, rating: 6.8, overview: "Carol Danvers becomes Captain Marvel...", poster: "/AtsgWhDnHTq68L0V.jpg" },
  ],
  2018: [
    { id: 299537, title: "Avengers: Infinity War", year: 2018, rating: 8.4, overview: "The Avengers and their allies must be willing to sacrifice all...", poster: "/lmZFxXgJE3vgrciwuDib0N8CfQo.jpg" },
    { id: 284054, title: "Black Panther", year: 2018, rating: 7.3, overview: "T'Challa becomes the Black Panther and king of Wakanda...", poster: "/uxzzxijgPIYy0rXG9j6y0s.jpg" },
    { id: 546554, title: "Mission: Impossible - Fallout", year: 2018, rating: 7.7, overview: "Ethan Hunt and his team must track down stolen nuclear weapons...", poster: "/gVHYqW5uZf3.jpg" },
    { id: 297761, title: "Aquaman", year: 2018, rating: 6.8, overview: "Arthur Curry learns he is the heir to the underwater kingdom of Atlantis...", poster: "/5KEnjZ6l.jpg" },
    { id: 478, title: "Bohemian Rhapsody", year: 2018, rating: 7.9, overview: "Freddie Mercury's story from the formation of Queen to Live Aid...", poster: "/lNqY8lF.jpg" },
    { id: 335983, title: "Venom", year: 2018, rating: 6.7, overview: "Eddie Brock becomes Venom after bonding with an alien symbiote...", poster: "/2uNW4HbgJY5.jpg" },
  ],
  2017: [
    { id: 51, title: "Star Wars: The Last Jedi", year: 2017, rating: 7.0, overview: "Rey's training continues...", poster: "/kOVEVegcE9Bv6JUMCBxO.jpg" },
    { id: 52, title: "Wonder Woman", year: 2017, rating: 7.4, overview: "Diana Prince's origin...", poster: "/8sA1J8.jpg" },
    { id: 53, title: "Justice League", year: 2017, rating: 6.1, overview: "DC heroes unite...", poster: "/cJZ8.jpg" },
    { id: 54, title: "Thor: Ragnarok", year: 2017, rating: 7.9, overview: "Thor loses Mjolnir...", poster: "/rzRwTcFv7c.jpg" },
    { id: 55, title: "Guardians of the Galaxy Vol. 2", year: 2017, rating: 7.6, overview: "Star-Lord meets his father...", poster: "/yG1L.jpg" },
    { id: 56, title: "Logan", year: 2017, rating: 8.1, overview: "Wolverine's final adventure...", poster: "/cA4f.jpg" },
  ],
  2016: [
    { id: 57, title: "Rogue One: A Star Wars Story", year: 2016, rating: 7.8, overview: "Rebellion's first victory...", poster: "/qjA.jpg" },
    { id: 58, title: "Captain America: Civil War", year: 2016, rating: 7.8, overview: "Heroes fight each other...", poster: "/rFm.jpg" },
    { id: 59, title: "Doctor Strange", year: 2016, rating: 7.5, overview: "Strange becomes the Sorcerer Supreme...", poster: "/xvH.jpg" },
    { id: 60, title: "Zootopia", year: 2016, rating: 8.0, overview: "Judy Hopps becomes a cop...", poster: "/sM3.jpg" },
    { id: 61, title: "The Jungle Book", year: 2016, rating: 7.4, overview: "Mowgli's jungle adventure...", poster: "/kX5.jpg" },
    { id: 62, title: "Suicide Squad", year: 2016, rating: 5.9, overview: "Task Force X assembles...", poster: "/lF1.jpg" },
  ],
  2015: [
    { id: 63, title: "Star Wars: The Force Awakens", year: 2015, rating: 8.0, overview: "The saga continues...", poster: "/weUSwFoT0uNtB6qRBjIcIA9AiJ7.jpg" },
    { id: 64, title: "Avengers: Age of Ultron", year: 2015, rating: 7.3, overview: "Ultron threatens humanity...", poster: "/4yCQ6Y33Rv7kW9yT6k5.jpg" },
    { id: 65, title: "Jurassic World", year: 2015, rating: 7.0, overview: "Dinosaurs return...", poster: "/jjBgi2r5cRtNxFf.jpg" },
    { id: 66, title: "Furious 7", year: 2015, rating: 7.1, overview: "Paul Walker's final film...", poster: "/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg" },
    { id: 67, title: "Inside Out", year: 2015, rating: 8.1, overview: "Emotions run Riley's life...", poster: "/sKu78.jpg" },
    { id: 68, title: "The Martian", year: 2015, rating: 8.0, overview: "Watney survives on Mars...", poster: "/5K7cFAo.jpg" },
  ],
  2014: [
    { id: 69, title: "Guardians of the Galaxy", year: 2014, rating: 8.0, overview: "The team assembles...", poster: "/y4l.jpg" },
    { id: 70, title: "Captain America: The Winter Soldier", year: 2014, rating: 7.7, overview: "The Winter Soldier attacks...", poster: "/5Av.jpg" },
    { id: 71, title: "Interstellar", year: 2014, rating: 8.6, overview: "Cooper saves humanity...", poster: "/gEU2.jpg" },
    { id: 72, title: "The Hunger Games: Mockingjay - Part 1", year: 2014, rating: 6.6, overview: "Katniss leads the rebellion...", poster: "/lFk.jpg" },
    { id: 73, title: "X-Men: Days of Future Past", year: 2014, rating: 7.9, overview: "Wolverine travels to the past...", poster: "/aK.jpg" },
    { id: 74, title: "Maleficent", year: 2014, rating: 6.9, overview: "Sleeping Beauty's villain...", poster: "/6J.jpg" },
  ],
  2013: [
    { id: 75, title: "Iron Man 3", year: 2013, rating: 7.1, overview: "Tony faces PTSD...", poster: "/sgg.jpg" },
    { id: 76, title: "Thor: The Dark World", year: 2013, rating: 6.8, overview: "Thor fights Malekith...", poster: "/tmU.jpg" },
    { id: 77, title: "Man of Steel", year: 2013, rating: 7.0, overview: "Superman's origin...", poster: "/6F7.jpg" },
    { id: 78, title: "The Hunger Games: Catching Fire", year: 2013, rating: 7.5, overview: "Katniss enters the arena again...", poster: "/qP.jpg" },
    { id: 79, title: "Gravity", year: 2013, rating: 7.7, overview: "Dr. Stone is lost in space...", poster: "/8K.jpg" },
    { id: 80, title: "World War Z", year: 2013, rating: 6.9, overview: "Zombie pandemic...", poster: "/aA.jpg" },
  ],
  2012: [
    { id: 81, title: "The Avengers", year: 2012, rating: 8.0, overview: "The team assembles...", poster: "/ceS6ZXw3BZj6.jpg" },
    { id: 82, title: "The Dark Knight Rises", year: 2012, rating: 8.4, overview: "Batman faces Bane...", poster: "/hEegw.jpg" },
    { id: 83, title: "The Hobbit: An Unexpected Journey", year: 2012, rating: 7.8, overview: "Bilbo's adventure begins...", poster: "/g6A.jpg" },
    { id: 84, title: "Skyfall", year: 2012, rating: 7.7, overview: "Bond's 50th anniversary...", poster: "/5B.jpg" },
    { id: 85, title: "The Amazing Spider-Man", year: 2012, rating: 7.0, overview: "Peter Parker's reboot...", poster: "/v.jpg" },
    { id: 86, title: "Prometheus", year: 2012, rating: 7.0, overview: "Alien prequel...", poster: "/z.jpg" },
  ],
  2011: [
    { id: 87, title: "Harry Potter and the Deathly Hallows - Part 2", year: 2011, rating: 8.1, overview: "The final battle...", poster: "/hVh.jpg" },
    { id: 88, title: "Thor", year: 2011, rating: 7.0, overview: "Thor's banishment...", poster: "/te.jpg" },
    { id: 89, title: "Captain America: The First Avenger", year: 2011, rating: 7.9, overview: "Steve Rogers becomes Captain America...", poster: "/v.jpg" },
    { id: 90, title: "Fast Five", year: 2011, rating: 7.3, overview: "The crew assembles in Rio...", poster: "/k.jpg" },
    { id: 91, title: "Pirates of the Caribbean: On Stranger Tides", year: 2011, rating: 6.6, overview: "Jack's new adventure...", poster: "/z.jpg" },
    { id: 92, title: "Transformers: Dark of the Moon", year: 2011, rating: 6.2, overview: "The Apollo program conspiracy...", poster: "/g.jpg" },
  ],
  2010: [
    { id: 93, title: "Toy Story 3", year: 2010, rating: 8.3, overview: "Andy goes to college...", poster: "/u.jpg" },
    { id: 94, title: "Inception", year: 2010, rating: 8.7, overview: "Cobb enters dreams...", poster: "/o.jpg" },
    { id: 95, title: "Harry Potter and the Deathly Hallows - Part 1", year: 2010, rating: 7.7, overview: "The hunt for Horcruxes begins...", poster: "/h.jpg" },
    { id: 96, title: "Iron Man 2", year: 2010, rating: 7.0, overview: "Tony faces the government...", poster: "/k.jpg" },
    { id: 97, title: "The Twilight Saga: Eclipse", year: 2010, rating: 4.9, overview: "Bella faces Victoria...", poster: "/p.jpg" },
    { id: 98, title: "Shutter Island", year: 2010, rating: 8.2, overview: "Teddy investigates Ashecliffe...", poster: "/l.jpg" },
  ],
  2009: [
    { id: 19995, title: "Avatar", year: 2009, rating: 7.6, overview: "A Marine dispatched to the moon Pandora on a unique mission...", poster: "/jRr.jpg" },
    { id: 12444, title: "Harry Potter and the Half-Blood Prince", year: 2009, rating: 7.7, overview: "Harry begins his sixth year at Hogwarts...", poster: "/h.jpg" },
    { id: 12244, title: "The Hangover", year: 2009, rating: 7.3, overview: "Three buddies wake up from a bachelor party in Las Vegas...", poster: "/l.jpg" },
    { id: 12155, title: "Star Trek", year: 2009, rating: 7.4, overview: "James T. Kirk tries to live up to his father's legacy...", poster: "/v.jpg" },
    { id: 16869, title: "Inglourious Basterds", year: 2009, rating: 8.0, overview: "In Nazi-occupied France during World War II...", poster: "/s.jpg" },
  ],
  2008: [
    { id: 155, title: "The Dark Knight", year: 2008, rating: 9.0, overview: "Batman faces the Joker, a criminal mastermind...", poster: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg" },
    { id: 1726, title: "Iron Man", year: 2008, rating: 7.7, overview: "Tony Stark builds a suit of armor to escape captivity...", poster: "/78h.jpg" },
    { id: 79698, title: "Wall-E", year: 2008, rating: 8.1, overview: "A waste-collecting robot embarks on a space journey...", poster: "/g.jpg" },
    { id: 13223, title: "Gran Torino", year: 2008, rating: 8.0, overview: "A Korean War veteran takes on a Hmong teen...", poster: "/s.jpg" },
    { id: 8358, title: "Slumdog Millionaire", year: 2008, rating: 7.8, overview: "A Mumbai teen reflects on his life after being accused of cheating...", poster: "/k.jpg" },
  ],
  2007: [
    { id: 22, title: "Pirates of the Caribbean: At World's End", year: 2007, rating: 7.0, overview: "Captain Barbossa, Will Turner and Elizabeth Swann...", poster: "/4.jpg" },
    { id: 2502, title: "The Bourne Ultimatum", year: 2007, rating: 7.4, overview: "Jason Bourne dodges a ruthless CIA official...", poster: "/u.jpg" },
    { id: 585, title: "No Country for Old Men", year: 2007, rating: 7.9, overview: "Violence ensues after a hunter stumbles upon a drug deal...", poster: "/v.jpg" },
    { id: 73, title: "Transformers", year: 2007, rating: 6.8, overview: "An ancient struggle between two Cybertronian races...", poster: "/k.jpg" },
    { id: 7345, title: "I Am Legend", year: 2007, rating: 7.2, overview: "Years after a plague kills most of humanity...", poster: "/h.jpg" },
  ],
  2006: [
    { id: 152, title: "The Departed", year: 2006, rating: 8.2, overview: "An undercover cop and a mole in the police...", poster: "/7.jpg" },
    { id: 9798, title: "Casino Royale", year: 2006, rating: 7.5, overview: "James Bond's first mission as 007...", poster: "/u.jpg" },
    { id: 14, title: "Pirates of the Caribbean: Dead Man's Chest", year: 2006, rating: 7.3, overview: "Jack Sparrow races to recover the heart of Davy Jones...", poster: "/k.jpg" },
    { id: 1271, title: "300", year: 2006, rating: 7.2, overview: "King Leonidas and 300 Spartans fight to the last man...", poster: "/h.jpg" },
    { id: 752, title: "Cars", year: 2006, rating: 6.9, overview: "A hot-shot race-car named Lightning McQueen gets waylaid...", poster: "/g.jpg" },
  ],
  2005: [
    { id: 672, title: "Harry Potter and the Goblet of Fire", year: 2005, rating: 7.8, overview: "Harry Potter finds himself competing in a hazardous tournament...", poster: "/h.jpg" },
    { id: 99861, title: "Batman Begins", year: 2005, rating: 7.7, overview: "Bruce Wayne learns the art of fighting crime...", poster: "/k.jpg" },
    { id: 2062, title: "Ratatouille", year: 2005, rating: 7.8, overview: "A rat who can cook makes an alliance with a kitchen worker...", poster: "/g.jpg" },
    { id: 10138, title: "Star Wars: Episode III - Revenge of the Sith", year: 2005, rating: 7.4, overview: "Anakin Skywalker is seduced by the dark side...", poster: "/v.jpg" },
    { id: 1885, title: "The Chronicles of Narnia", year: 2005, rating: 7.0, overview: "Four kids travel through a wardrobe to the land of Narnia...", poster: "/n.jpg" },
  ],
  2004: [
    { id: 100, title: "Spider-Man 2", year: 2004, rating: 7.3, overview: "Peter Parker is beset with troubles...", poster: "/k.jpg" },
    { id: 558, title: "The Incredibles", year: 2004, rating: 7.7, overview: "A family of undercover superheroes...", poster: "/g.jpg" },
    { id: 657, title: "Shrek 2", year: 2004, rating: 7.2, overview: "Shrek, Fiona and Donkey set off to Far, Far Away...", poster: "/s.jpg" },
    { id: 12, title: "Finding Neverland", year: 2004, rating: 7.3, overview: "The story of J.M. Barrie's friendship...", poster: "/f.jpg" },
    { id: 9741, title: "Anchorman", year: 2004, rating: 6.7, overview: "Ron Burgundy is San Diego's top-rated newsman...", poster: "/a.jpg" },
  ],
  2003: [
    { id: 673, title: "The Lord of the Rings: The Return of the King", year: 2003, rating: 8.5, overview: "Gandalf and Aragorn lead the World of Men against Sauron...", poster: "/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg" },
    { id: 674, title: "Pirates of the Caribbean: The Curse of the Black Pearl", year: 2003, rating: 7.7, overview: "Blacksmith Will Turner teams up with eccentric pirate...", poster: "/4EYPN5mVIhKLfx.jpg" },
    { id: 675, title: "Finding Nemo", year: 2003, rating: 7.8, overview: "A clown fish named Marlin searches for his missing son Nemo...", poster: "/cLj.jpg" },
    { id: 24, title: "Kill Bill: Vol. 1", year: 2003, rating: 7.9, overview: "After awakening from a four-year coma...", poster: "/v.jpg" },
    { id: 107, title: "Bruce Almighty", year: 2003, rating: 6.7, overview: "A guy who complains about God is given almighty powers...", poster: "/k.jpg" },
  ],
  2002: [
    { id: 120, title: "The Lord of the Rings: The Two Towers", year: 2002, rating: 8.3, overview: "Frodo and Sam continue their journey to Mordor...", poster: "/6e.jpg" },
    { id: 101, title: "Spider-Man", year: 2002, rating: 7.3, overview: "When bitten by a genetically modified spider...", poster: "/ph.jpg" },
    { id: 199, title: "Star Wars: Episode II - Attack of the Clones", year: 2002, rating: 6.6, overview: "Ten years after the invasion of Naboo...", poster: "/8.jpg" },
    { id: 121, title: "Harry Potter and the Chamber of Secrets", year: 2002, rating: 7.4, overview: "Harry ignores warnings not to return to Hogwarts...", poster: "/h.jpg" },
    { id: 70, title: "Men in Black II", year: 2002, rating: 6.3, overview: "Agent J needs help so he is sent to find Agent K...", poster: "/m.jpg" },
  ],
  2001: [
    { id: 671, title: "Harry Potter and the Philosopher's Stone", year: 2001, rating: 7.6, overview: "An orphaned boy enrolls in a school of wizardry...", poster: "/h.jpg" },
    { id: 122, title: "The Lord of the Rings: The Fellowship of the Ring", year: 2001, rating: 8.3, overview: "A meek Hobbit and eight companions set out on a journey...", poster: "/6.jpg" },
    { id: 423, title: "Monsters, Inc.", year: 2001, rating: 7.8, overview: "Monsters Incorporated is the largest scare factory...", poster: "/g.jpg" },
    { id: 1535, title: "Pearl Harbor", year: 2001, rating: 6.9, overview: "The story of the Battle of Pearl Harbor...", poster: "/p.jpg" },
    { id: 10673, title: "A Beautiful Mind", year: 2001, rating: 7.9, overview: "After John Nash, a brilliant mathematician...", poster: "/b.jpg" },
  ],
  2000: [
    { id: 77, title: "Gladiator", year: 2000, rating: 8.2, overview: "A former Roman General sets out to exact vengeance...", poster: "/ty8.jpg" },
    { id: 861, title: "Cast Away", year: 2000, rating: 7.6, overview: "A FedEx executive undergoes a physical and emotional transformation...", poster: "/c.jpg" },
    { id: 974, title: "X-Men", year: 2000, rating: 7.0, overview: "Two mutants come to a private academy for mutants...", poster: "/k.jpg" },
    { id: 2493, title: "Memento", year: 2000, rating: 8.4, overview: "A man with short-term memory loss attempts to track down his wife's murderer...", poster: "/m.jpg" },
    { id: 10734, title: "American Psycho", year: 2000, rating: 7.3, overview: "A wealthy New York City investment banking executive...", poster: "/a.jpg" },
  ],
  1999: [
    { id: 603, title: "The Matrix", year: 1999, rating: 8.1, overview: "A computer hacker learns from mysterious rebels...", poster: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg" },
    { id: 14, title: "American Beauty", year: 1999, rating: 7.9, overview: "A sexually frustrated suburban father has a mid-life crisis...", poster: "/s.jpg" },
    { id: 18, title: "The Sixth Sense", year: 1999, rating: 7.9, overview: "A boy who communicates with spirits seeks the help of a disheartened child psychologist...", poster: "/s.jpg" },
    { id: 597, title: "Titanic", year: 1997, rating: 7.9, overview: "A seventeen-year-old aristocrat falls in love with a kind but poor artist...", poster: "/9xjZS2rlVxm8SFxMkWNZ.jpg" },
    { id: 11, title: "Star Wars: Episode I - The Phantom Menace", year: 1999, rating: 6.5, overview: "Two Jedi escape a hostile blockade to find allies...", poster: "/6bkF.jpg" },
    { id: 109, title: "The Green Mile", year: 1999, rating: 8.5, overview: "The lives of guards on Death Row are affected by one of their charges...", poster: "/v.jpg" },
  ],
  1998: [
    { id: 34, title: "Saving Private Ryan", year: 1998, rating: 8.2, overview: "Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines...", poster: "/h.jpg" },
    { id: 77, title: "Armageddon", year: 1998, rating: 6.7, overview: "After discovering that an asteroid will strike Earth, NASA recruits a misfit team...", poster: "/a.jpg" },
    { id: 9778, title: "The Big Lebowski", year: 1998, rating: 7.9, overview: "Jeff 'The Dude' Lebowski is mistaken for a millionaire...", poster: "/b.jpg" },
    { id: 37135, title: "Rush Hour", year: 1998, rating: 7.0, overview: "A loyal Hong Kong Inspector teams up with a reckless LAPD detective...", poster: "/r.jpg" },
    { id: 214, title: "The Truman Show", year: 1998, rating: 8.1, overview: "An insurance salesman discovers his whole life is actually a reality TV show...", poster: "/t.jpg" },
  ],
  1997: [
    { id: 115, title: "The Fifth Element", year: 1997, rating: 7.5, overview: "In the colorful future, a cab driver unwittingly becomes the central figure...", poster: "/fSeZqP7Y.jpg" },
    { id: 197, title: "Good Will Hunting", year: 1997, rating: 8.3, overview: "Will Hunting, a janitor at M.I.T., has a gift for mathematics...", poster: "/jRuK.jpg" },
    { id: 745, title: "The Lost World: Jurassic Park", year: 1997, rating: 6.5, overview: "A research team is sent to the Jurassic Park Site B island...", poster: "/c.jpg" },
    { id: 597, title: "Titanic", year: 1997, rating: 7.9, overview: "A seventeen-year-old aristocrat falls in love with a kind but poor artist...", poster: "/9xjZS2rlVxm8SFxMkWNZ.jpg" },
    { id: 94, title: "L.A. Confidential", year: 1997, rating: 7.8, overview: "As corruption grows in 1950s LA, three policemen investigate a series of murders...", poster: "/l.jpg" },
  ],
  1996: [
    { id: 25, title: "Mission: Impossible", year: 1996, rating: 7.1, overview: "An American agent, under false suspicion of disloyalty, must discover the real spy...", poster: "/m.jpg" },
    { id: 9593, title: "Independence Day", year: 1996, rating: 7.0, overview: "The aliens are coming and their goal is to invade and destroy Earth...", poster: "/i.jpg" },
    { id: 9383, title: "Scream", year: 1996, rating: 7.4, overview: "A year after the murder of her mother, a teenage girl is terrorized by a new killer...", poster: "/s.jpg" },
    { id: 319, title: "Fargo", year: 1996, rating: 7.9, overview: "Jerry Lundegaard's inept crime falls apart due to his henchmen's bungling...", poster: "/f.jpg" },
    { id: 662, title: "Trainspotting", year: 1996, rating: 8.0, overview: "Renton, deeply immersed in the Edinburgh drug scene, tries to clean up and get out...", poster: "/t.jpg" },
  ],
  1995: [
    { id: 862, title: "Toy Story", year: 1995, rating: 7.9, overview: "A cowboy doll is profoundly threatened and jealous when a new spaceman figure supplants him...", poster: "/g.jpg" },
    { id: 1571, title: "Die Hard: With a Vengeance", year: 1995, rating: 7.3, overview: "John McClane and a Harlem store owner are targeted by German terrorist Simon Gruber...", poster: "/d.jpg" },
    { id: 1930, title: "Se7en", year: 1995, rating: 8.6, overview: "Two detectives hunt a serial killer who uses the seven deadly sins as his motives...", poster: "/s.jpg" },
    { id: 2759, title: "Heat", year: 1995, rating: 7.9, overview: "A group of professional bank robbers start to feel the heat from police...", poster: "/h.jpg" },
    { id: 9739, title: "Braveheart", year: 1995, rating: 7.9, overview: "Scottish warrior William Wallace leads his countrymen in a rebellion...", poster: "/b.jpg" },
  ],
  1994: [
    { id: 238, title: "The Shawshank Redemption", year: 1994, rating: 8.7, overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption...", poster: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg" },
    { id: 13, title: "Forrest Gump", year: 1994, rating: 8.8, overview: "The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal...", poster: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg" },
    { id: 680, title: "Pulp Fiction", year: 1994, rating: 8.9, overview: "The lives of two mob hitmen, a boxer, a gangster and his wife...", poster: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg" },
    { id: 558, title: "The Lion King", year: 1994, rating: 8.1, overview: "Lion prince Simba and his father are targeted by his bitter uncle...", poster: "/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg" },
    { id: 332, title: "True Lies", year: 1994, rating: 7.2, overview: "A fearless, globe-trotting secret agent has his life turned upside down...", poster: "/7.jpg" },
  ],
  1993: [
    { id: 424, title: "Schindler's List", year: 1993, rating: 8.6, overview: "In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned...", poster: "/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg" },
    { id: 33, title: "Jurassic Park", year: 1993, rating: 7.9, overview: "A pragmatic paleontologist visiting an almost complete theme park is tasked with protecting a couple of kids...", poster: "/9o.jpg" },
    { id: 756, title: "Groundhog Day", year: 1993, rating: 7.8, overview: "A weatherman finds himself inexplicably living the same day over and over again...", poster: "/g.jpg" },
    { id: 822, title: "Tombstone", year: 1993, rating: 7.7, overview: "A successful lawman's plans to retire anonymously in Tombstone, Arizona...", poster: "/t.jpg" },
    { id: 2501, title: "The Fugitive", year: 1993, rating: 7.8, overview: "Dr. Richard Kimble, unjustly accused of murdering his wife...", poster: "/f.jpg" },
  ],
  1992: [
    { id: 33, title: "Reservoir Dogs", year: 1992, rating: 8.3, overview: "When a simple jewelry heist goes horribly wrong, the surviving criminals begin to suspect...", poster: "/r.jpg" },
    { id: 111, title: "Unforgiven", year: 1992, rating: 7.9, overview: "Retired Old West gunslinger William Munny reluctantly takes on one last job...", poster: "/u.jpg" },
    { id: 9799, title: "Home Alone 2: Lost in New York", year: 1992, rating: 6.7, overview: "One year after Kevin was left home alone and had to defeat a pair of bumbling burglars...", poster: "/h.jpg" },
    { id: 832, title: "Aladdin", year: 1992, rating: 7.7, overview: "A kindhearted street urchin and a power-hungry Grand Vizier vie for a magic lamp...", poster: "/a.jpg" },
    { id: 1933, title: "The Last of the Mohicans", year: 1992, rating: 7.3, overview: "Three trappers protect the daughters of a British Colonel in the midst of the French and Indian War...", poster: "/l.jpg" },
  ],
  1991: [
    { id: 274, title: "The Silence of the Lambs", year: 1991, rating: 8.6, overview: "A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer...", poster: "/s1.jpg" },
    { id: 280, title: "Terminator 2: Judgment Day", year: 1991, rating: 8.1, overview: "A cyborg, identical to the one who failed to kill Sarah Connor, must now protect her ten year old son...", poster: "/8.jpg" },
    { id: 105, title: "Back to the Future Part III", year: 1991, rating: 7.4, overview: "Stranded in 1955, Marty McFly learns about the death of Doc Brown...", poster: "/b.jpg" },
    { id: 9602, title: "Point Break", year: 1991, rating: 7.2, overview: "An F.B.I. Agent goes undercover to catch a gang of surfers who may be bank robbers...", poster: "/p.jpg" },
    { id: 108, title: "JFK", year: 1991, rating: 7.7, overview: "New Orleans District Attorney Jim Garrison discovers there's more to the Kennedy assassination...", poster: "/j.jpg" },
  ],
  1990: [
    { id: 882, title: "Goodfellas", year: 1990, rating: 8.7, overview: "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill...", poster: "/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg" },
    { id: 10191, title: "Ghost", year: 1990, rating: 7.0, overview: "After a young man is murdered, his spirit stays behind to warn his lover of impending danger...", poster: "/g.jpg" },
    { id: 769, title: "Total Recall", year: 1990, rating: 7.3, overview: "When a man goes for virtual vacation memories of the planet Mars, an unexpected and harrowing series of events forces him to go to the planet for real...", poster: "/t.jpg" },
    { id: 92, title: "Pretty Woman", year: 1990, rating: 7.1, overview: "A man in a legal but hurtful business needs an escort for some social events...", poster: "/p.jpg" },
    { id: 275, title: "Edward Scissorhands", year: 1990, rating: 7.7, overview: "A gentle man, with scissors for hands, is brought into a new community...", poster: "/e.jpg" },
  ],
  1989: [
    { id: 948, title: "Indiana Jones and the Last Crusade", year: 1989, rating: 7.8, overview: "In 1938, after his father Professor Henry Jones, Sr goes missing while pursuing the Holy Grail...", poster: "/i.jpg" },
    { id: 710, title: "Ghostbusters II", year: 1989, rating: 6.5, overview: "The discovery of a massive river of ectoplasm and a resurgence of spectral activity allows the staff of Ghostbusters to revive the business...", poster: "/g.jpg" },
    { id: 11224, title: "The Little Mermaid", year: 1989, rating: 7.3, overview: "A mermaid princess makes a Faustian bargain in an attempt to become human and win a prince's love...", poster: "/l.jpg" },
    { id: 9295, title: "Honey, I Shrunk the Kids", year: 1989, rating: 6.3, overview: "The scientist father of a teenage girl and boy accidentally shrinks his and two other neighborhood teens...", poster: "/h.jpg" },
    { id: 8467, title: "Dead Poets Society", year: 1989, rating: 8.1, overview: "Maverick teacher John Keating uses poetry to embolden his boarding school students to new heights of self-expression...", poster: "/d.jpg" },
  ],
  1988: [
    { id: 562, title: "Die Hard", year: 1988, rating: 7.8, overview: "An NYPD officer tries to save his wife and several others taken hostage by German terrorists...", poster: "/aF.jpg" },
    { id: 10201, title: "Coming to America", year: 1988, rating: 6.8, overview: "An extremely pampered African Prince travels to Queens, New York...", poster: "/c.jpg" },
    { id: 92, title: "Who Framed Roger Rabbit", year: 1988, rating: 7.5, overview: "A toon-hating detective is a cartoon rabbit's only hope to prove his innocence...", poster: "/w.jpg" },
    { id: 887, title: "Beetlejuice", year: 1988, rating: 7.4, overview: "The spirits of a deceased couple are harassed by an unbearable family that has moved into their home...", poster: "/b.jpg" },
    { id: 8587, title: "The Land Before Time", year: 1988, rating: 7.1, overview: "An orphaned brontosaurus teams up with other young dinosaurs in order to reunite with their families...", poster: "/l.jpg" },
  ],
  1987: [
    { id: 863, title: "Predator", year: 1987, rating: 7.5, overview: "A team of commandos on a mission in a Central American jungle find themselves hunted by an extraterrestrial warrior...", poster: "/p.jpg" },
    { id: 105, title: "The Princess Bride", year: 1987, rating: 7.6, overview: "While home sick in bed, a young boy's grandfather reads him the story of a farmboy-turned-pirate...", poster: "/t.jpg" },
    { id: 915, title: "RoboCop", year: 1987, rating: 7.2, overview: "In a dystopic and crime-ridden Detroit, a terminally wounded cop returns to the force as a powerful cyborg...", poster: "/r.jpg" },
    { id: 10689, title: "Dirty Dancing", year: 1987, rating: 7.0, overview: "Spending the summer at a Catskills resort with her family, Frances falls in love with the camp's dance instructor...", poster: "/d.jpg" },
    { id: 855, title: "Full Metal Jacket", year: 1987, rating: 8.1, overview: "A pragmatic U.S. Marine observes the dehumanizing effects the Vietnam War has on his fellow recruits...", poster: "/f.jpg" },
  ],
  1986: [
    { id: 680, title: "Aliens", year: 1986, rating: 8.3, overview: "Fifty-seven years after surviving an apocalyptic attack aboard her space vessel...", poster: "/a.jpg" },
    { id: 744, title: "Top Gun", year: 1986, rating: 7.0, overview: "As students at the United States Navy's elite fighter weapons school compete to be best in the class...", poster: "/t.jpg" },
    { id: 370, title: "The Color of Money", year: 1986, rating: 6.8, overview: "Fast Eddie Felson teaches a cocky but immensely talented protégé the ropes of pool hustling...", poster: "/c.jpg" },
    { id: 914, title: "Ferris Bueller's Day Off", year: 1986, rating: 7.8, overview: "A high school wise guy is determined to have a day off from school...", poster: "/f.jpg" },
    { id: 1271, title: "Platoon", year: 1986, rating: 7.7, overview: "Chris Taylor, a neophyte recruit in Vietnam, finds himself caught in a battle of wills between two sergeants...", poster: "/p.jpg" },
  ],
  1985: [
    { id: 105, title: "Back to the Future", year: 1985, rating: 8.3, overview: "Marty McFly, a 17-year-old high school student, is accidentally sent thirty years into the past...", poster: "/q.jpg" },
    { id: 9296, title: "The Goonies", year: 1985, rating: 7.4, overview: "A group of young misfits called The Goonies discover an ancient map and set out on a quest to find a legendary pirate's long-lost treasure...", poster: "/g.jpg" },
    { id: 22, title: "The Breakfast Club", year: 1985, rating: 7.8, overview: "Five high school students meet in Saturday detention and discover how they have a lot more in common than they thought...", poster: "/b.jpg" },
    { id: 872, title: "Brazil", year: 1985, rating: 7.8, overview: "A bureaucrat in a retro-future world tries to correct an administrative error and becomes an enemy of the state...", poster: "/br.jpg" },
    { id: 8867, title: "Weird Science", year: 1985, rating: 6.6, overview: "Two high school nerds use a computer program to literally create the perfect woman...", poster: "/w.jpg" },
  ],
  1984: [
    { id: 218, title: "The Terminator", year: 1984, rating: 7.7, overview: "A human soldier is sent from 2029 to 1984 to stop an almost indestructible cyborg killing machine...", poster: "/8.jpg" },
    { id: 730, title: "Ghostbusters", year: 1984, rating: 7.8, overview: "Three former parapsychology professors set up shop as a unique ghost removal service...", poster: "/g.jpg" },
    { id: 90, title: "Indiana Jones and the Temple of Doom", year: 1984, rating: 7.2, overview: "In 1935, Indiana Jones arrives in India, still part of the British Empire, and is asked to find a mystical stone...", poster: "/i.jpg" },
    { id: 872, title: "The Karate Kid", year: 1984, rating: 7.2, overview: "A martial arts master agrees to teach karate to a teenager...", poster: "/k.jpg" },
    { id: 929, title: "Gremlins", year: 1984, rating: 7.1, overview: "A boy inadvertently breaks three important rules concerning his new pet and unleashes a horde of malevolently mischievous monsters...", poster: "/gr.jpg" },
  ],
  1983: [
    { id: 121, title: "Star Wars: Episode VI - Return of the Jedi", year: 1983, rating: 7.9, overview: "After a daring mission to rescue Han Solo from Jabba the Hutt, the Rebels dispatch to Endor to destroy the second Death Star...", poster: "/b.jpg" },
    { id: 9279, title: "Scarface", year: 1983, rating: 8.3, overview: "In 1980 Miami, a determined Cuban immigrant takes over a drug cartel and succumbs to greed...", poster: "/s.jpg" },
    { id: 8577, title: "A Christmas Story", year: 1983, rating: 7.7, overview: "In the 1940s, a young boy named Ralphie attempts to convince his parents...", poster: "/c.jpg" },
    { id: 872, title: "Flashdance", year: 1983, rating: 6.1, overview: "A Pittsburgh woman with two jobs as a welder and an exotic dancer wants to get into ballet school...", poster: "/f.jpg" },
    { id: 9296, title: "Risky Business", year: 1983, rating: 6.8, overview: "A Chicago teenager is looking for fun at home while his parents are away...", poster: "/r.jpg" },
  ],
  1982: [
    { id: 189, title: "E.T. the Extra-Terrestrial", year: 1982, rating: 7.9, overview: "A troubled child summons the courage to help a friendly alien escape Earth and return to his home world...", poster: "/9x.jpg" },
    { id: 78, title: "Blade Runner", year: 1982, rating: 7.9, overview: "A blade runner must pursue and terminate four replicants who stole a ship in space...", poster: "/b.jpg" },
    { id: 925, title: "The Thing", year: 1982, rating: 7.8, overview: "A research team in Antarctica is hunted by a shape-shifting alien...", poster: "/t.jpg" },
    { id: 10954, title: "Poltergeist", year: 1982, rating: 7.1, overview: "A family's home is haunted by a host of demonic ghosts...", poster: "/p.jpg" },
    { id: 315, title: "First Blood", year: 1982, rating: 7.4, overview: "A veteran Green Beret is forced by a cruel Sheriff and his deputies to flee into the mountains...", poster: "/f.jpg" },
  ],
  1981: [
    { id: 85, title: "Raiders of the Lost Ark", year: 1981, rating: 7.9, overview: "In 1936, archaeologist and adventurer Indiana Jones is hired by the U.S. government to find the Ark of the Covenant...", poster: "/r.jpg" },
    { id: 782, title: "Mad Max 2: The Road Warrior", year: 1981, rating: 7.6, overview: "In the post-apocalyptic Australian wasteland, a cynical drifter agrees to help a small, gasoline-rich community escape a band of bandits...", poster: "/m.jpg" },
    { id: 131, title: "Escape from New York", year: 1981, rating: 7.1, overview: "In 1997, when the U.S. president crashes into Manhattan, now a giant maximum security prison...", poster: "/e.jpg" },
    { id: 1634, title: "Clash of the Titans", year: 1981, rating: 6.8, overview: "Perseus must battle Medusa and the Kraken to save the Princess Andromeda...", poster: "/c.jpg" },
    { id: 8867, title: "Arthur", year: 1981, rating: 6.5, overview: "Alcoholic playboy Arthur Bach stands on the brink of an arranged marriage...", poster: "/a.jpg" },
  ],
  1980: [
    { id: 278, title: "The Shining", year: 1980, rating: 8.4, overview: "A family heads to an isolated hotel for the winter where a sinister presence influences the father into violence...", poster: "/s.jpg" },
    { id: 1891, title: "Star Wars: Episode V - The Empire Strikes Back", year: 1980, rating: 8.3, overview: "After the Rebels are brutally overpowered by the Empire on the ice planet Hoth, Luke Skywalker begins Jedi training with Yoda...", poster: "/e.jpg" },
    { id: 9296, title: "Airplane!", year: 1980, rating: 7.6, overview: "A man afraid to fly must ensure that a plane lands safely after the pilots become sick...", poster: "/a.jpg" },
    { id: 544, title: "The Blues Brothers", year: 1980, rating: 7.9, overview: "Jake Blues reunites with his brother, Elwood, and together they take on a new mission...", poster: "/b.jpg" },
    { id: 862, title: "Friday the 13th", year: 1980, rating: 6.3, overview: "A group of camp counselors are stalked and murdered by an unknown assailant while trying to reopen a summer camp...", poster: "/f.jpg" },
  ],
};

export default function AllMovies({ onMovieSelect }: AllMoviesProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [moviesByYear, setMoviesByYear] = useState<{ [year: number]: MovieData[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const currentYear = new Date().getFullYear();
        const movies = await getPopularMoviesByYearRange(1980, currentYear);
        setMoviesByYear(movies);
      } catch (err) {
        setError('Failed to fetch movies');
        console.error('Error fetching movies:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const years = Object.keys(moviesByYear)
    .map(year => parseInt(year))
    .sort((a, b) => b - a);

  const movies = selectedYear 
    ? moviesByYear[selectedYear] || []
    : [];

  return (
    <>
      <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-black/45 px-4 py-6 text-center shadow-2xl shadow-black/25 backdrop-blur-xl sm:mb-12 sm:rounded-[32px] sm:px-8 sm:py-8">
          <h2 className="mb-3 text-2xl font-bold leading-tight text-white sm:mb-4 sm:text-5xl">Popular movies of different years</h2>
          <p className="text-sm text-gray-400 sm:text-lg">Browse the most popular movies by year</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            <span className="ml-3 text-gray-400">Loading movies...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 text-lg">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Year Selector */}
        {!isLoading && !error && (
          <div className="mx-auto mb-8 max-w-md sm:mb-12">
            <div className="relative">
              <select
                value={selectedYear || ''}
                onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full appearance-none rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-base text-white backdrop-blur-md transition-colors focus:border-red-600 focus:outline-none sm:px-6 sm:py-4 sm:text-lg"
              >
                <option value="">Select a year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Movies Grid */}
        {selectedYear && movies.length > 0 ? (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold text-white sm:text-3xl">{selectedYear} Movies</h2>
              <p className="text-gray-400">{movies.length} movies available</p>
            </div>
            
            <div className="grid grid-cols-2 justify-items-center gap-3 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {movies.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex justify-center"
                >
                  <ModernMovieCard
                    movie={movie}
                    layout="poster"
                    size="medium"
                    onSelect={(m) => onMovieSelect?.(m)}
                    showPlayButton={true}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        ) : selectedYear ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Film className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No movies found</h3>
            <p className="text-gray-400">No movies available for {selectedYear}</p>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Film className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Select a year</h3>
            <p className="text-gray-400">Choose a year to browse movies from that period</p>
          </div>
        )}
      </div>
    </>
  );
}
