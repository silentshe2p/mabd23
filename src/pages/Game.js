import React, { useState, useMemo, useRef } from 'react';
import { Container } from 'semantic-ui-react';
import { NavBarSpWrapper } from '../components/NavBar';
import { IntroPlayerSpWrapper } from '../components/IntroPlayer';
import { GamePlayerSpWrapper } from '../components/GamePlayer';
import { fetchAvatar, fetchIntro, fetchPuzzle } from '../lib/api';
import { fetchLocal } from '../lib/utils';
import './Game.css';

export const GAME_INTRO = Symbol('INTRO');
export const GAME_PUZZLE = Symbol('PUZZLE');

export const Game = () => {
  const [part, setPart] = useState(GAME_INTRO);
  const cache = useRef({
    puzzleResource: fetchLocal(), // puzzle resource won't be needed until after intro
  });
  const avatarResource = useMemo(fetchAvatar, []);
  const introResource = useMemo(fetchIntro, []);

  return (
    <Container fluid>
      <NavBarSpWrapper avatarResource={avatarResource} currentPart={part} />
      {part === GAME_INTRO && (
        <IntroPlayerSpWrapper
          introResource={introResource}
          setNextPart={() => setPart(GAME_PUZZLE)}
          fetchNextPart={() => (cache.current.puzzleResource = fetchPuzzle())}
        />
      )}
      {part === GAME_PUZZLE && (
        <GamePlayerSpWrapper puzzleResource={cache.current.puzzleResource} />
      )}
    </Container>
  );
};
