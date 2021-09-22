import { useState, useEffect } from "react"

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

import Card from "@heruka_urgyen/react-playing-cards"
/*
  <Card card={card} deckType={deckType} height="XXpx" back />

  where
  // card rank and suit, e.g 2c, Kh, Ad, etc
    card :: String
    card = rank + suit
      where
        rank = (2 | 3 ... 9 | T | J | Q | K | A)
        suit = (c | d | h | s)

  // various card styles
    deckType :: String
    deckType = (basic | four-color | big-face | big-face four-color)

  // card height in px
    height :: String

  // show front (true by default, can be omitted)
    front :: Boolean

  // show back
    back :: Boolean
*/

import options from '../utils/enums'
import {generateHand, generateRandomDraw, convertFaceToTen} from '../utils'
import { basicStrategyValues, basicStrategyPairs, basicStrategyAces } from '../utils/basicStrategy'

export default function App() {
  const [ feedback, setFeedback ] = useState(null)
  const [ blackjack, setBlackjack ] = useState(false)
  const [ gameOver, setGameOver ] = useState(false)
  const [ playerHand, setPlayerHand ] = useState(generateHand())
  const [ dealerHand, setDealerHand ] = useState(generateRandomDraw())

  useEffect(() => {
    if (playerHand.cardOne.value === 11) {
      if ([10,'J','Q','K'].includes(playerHand.cardTwo.value)) {
        setGameOver(true)
        setBlackjack(true)
      }
    } else if (playerHand.cardTwo.value === 11) {
      if ([10,'J','Q','K'].includes(playerHand.cardOne.value)) {
        setGameOver(true)
        setBlackjack(true)
      }
    }
  }, [playerHand, setBlackjack, setGameOver])

  const newGame = () => {
    setGameOver(false)
    setFeedback(null)
    setBlackjack(false)
    setPlayerHand(generateHand())
    setDealerHand(generateRandomDraw())
  }

  const calculateBasicStat = (hand, dealer, guess) => {
    setGameOver(true)
    let strat
    if (hand.cardOne.value === hand.cardTwo.value) {
      hand = convertFaceToTen(hand)
      if (typeof dealer.value === 'string')
        dealer.value = 10
      strat = basicStrategyPairs[hand.cardOne.value - 2][dealer.value - 2]
    }
    else if (hand.cardOne.value === 11 || hand.cardTwo.value === 11) {
      hand = convertFaceToTen(hand)
      if (typeof dealer.value === 'string')
        dealer.value = 10
      strat = basicStrategyAces[hand.cardTwo.value === 11 ? hand.cardOne.value - 2 : hand.cardTwo.value - 2][dealer.value - 2]
    }
    else {
      hand = convertFaceToTen(hand)
      if (typeof dealer.value === 'string')
        dealer.value = 10
      const handValue = hand.cardOne.value + hand.cardTwo.value
      strat = basicStrategyValues[handValue - 2][dealer.value - 2]
    }
    if (strat === guess) {
      setFeedback('Nice Play')
    } else {
      setFeedback(`The book says to ${strat.toUpperCase()}`)
    }
  }

  return (
    <Grid  
      container
      spacing={2}
      direction="column"
      alignItems="center"
      justify="center"
      style={{ minHeight: '100vh' }}
    >
      <Grid item xs={12} lg={8}>
        <Stack spacing={2} direction="row">
          <Card 
            height={window.screen.availHeight * .25} 
            back
          />
          <Card 
            card={dealerHand.card}
            height={window.screen.availHeight * .25}
          />
        </Stack>
      </Grid>
      <Grid item xs={12} lg={8}>
        <Stack spacing={2} direction="row">
          <Card 
            card={playerHand.cardOne.card}
            height={window.screen.availHeight * .3}
          />
          <Card 
            card={playerHand.cardTwo.card}
            height={window.screen.availHeight * .3}
          />
        </Stack>
      </Grid>
      <Grid item xs={12} lg={8}>
        <Stack spacing={2} direction="row">
          <Button 
            variant="outlined"
            onClick={() => calculateBasicStat(playerHand, dealerHand, options.HIT)}
            disabled={gameOver}
          >
            Hit
          </Button>
          <Button 
            variant="outlined"
            onClick={() => calculateBasicStat(playerHand, dealerHand, options.STAND)}
            disabled={gameOver}
          >
            Stand
          </Button>
          <Button 
            variant="outlined"
            onClick={() => calculateBasicStat(playerHand, dealerHand, options.DOUBLE)}
            disabled={gameOver}
          >
            Double
          </Button>
          <Button 
            variant="outlined"
            onClick={() => calculateBasicStat(playerHand, dealerHand, options.SPLIT)}
            disabled={playerHand.cardOne.value !== playerHand.cardTwo.value || gameOver}
          >
            Split
          </Button>
        </Stack>
      </Grid>
      {gameOver &&
      <Grid item xs={12} lg={8}>
        <Stack spacing={2} direction="row">
          {blackjack ? 
            <Alert severity="info">Blackjack</Alert>
            : feedback === 'Nice Play' ?
            <Alert severity="success">{feedback}</Alert>
            : 
            <Alert severity="warning">{feedback}</Alert>
          }
          <Button 
            variant="text"
            onClick={newGame}
          >
            Play Again
          </Button>
        </Stack>
      </Grid>
      }
    </Grid>
  );
}