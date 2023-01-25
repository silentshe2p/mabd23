import React from 'react';
import { Grid, Label } from 'semantic-ui-react';

const EmptyAnswer = () => (
  <>
    <Label circular size="huge" color="grey">
      {'*'}
    </Label>
    <Label circular size="big" color="grey">
      {'*'}
    </Label>
    <Label circular size="big" color="grey">
      {'*'}
    </Label>
    <Label circular size="huge" color="grey">
      {'*'}
    </Label>
  </>
);

const Highlight = ({ answer, position, highlightNum = 1 }) =>
  answer ? (
    <>
      {[...answer].map((char, idx) => (
        <Label
          circular
          key={char + idx}
          size={
            position === 1
              ? idx >= answer.length - highlightNum
                ? 'huge'
                : 'big'
              : idx < highlightNum || idx === answer.length - 1
              ? 'huge'
              : 'big'
          }
          color={
            position === 1
              ? idx >= answer.length - highlightNum
                ? 'blue'
                : 'olive'
              : idx < highlightNum
              ? 'blue'
              : idx === answer.length - 1
              ? 'green'
              : 'olive'
          }
        >
          {char}
        </Label>
      ))}
    </>
  ) : (
    <EmptyAnswer />
  );

export const AnswerHighlight = ({ answers, hasMsg = false }) => {
  const [firstAnswer, secondAnswer] = answers;

  return (
    <Grid columns="equal" centered>
      <Grid.Column>
        <Grid.Row>
          <Label basic pointing="below" color="red">
            前々答
          </Label>
        </Grid.Row>
        <Grid.Row>
          <Highlight
            answer={firstAnswer}
            position={1}
            highlightNum={hasMsg ? 3 : 1}
          />
        </Grid.Row>
      </Grid.Column>
      <Grid.Column>
        <Grid.Row>
          <Label basic pointing="below" color="orange">
            前答
          </Label>
        </Grid.Row>
        <Grid.Row>
          <Highlight
            answer={secondAnswer}
            position={2}
            highlightNum={hasMsg ? 3 : 1}
          />
        </Grid.Row>
      </Grid.Column>
    </Grid>
  );
};
