import React from 'react';
import { Container, Header, Label, Icon } from 'semantic-ui-react';
import { useAuth } from '../lib/contexts';

export const GameStatus = ({
  retries = 0,
  totalQuestionNum = 0,
  currQuestionNum = 0,
}) => {
  const { user } = useAuth();

  return (
    <Container textAlign="center" style={{ margin: '1%' }}>
      <Header as="h4">
        <Label>
          <Icon name="id card outline" />
          プレイヤー
          <Label.Detail>{user}</Label.Detail>
        </Label>
        <Label>
          <Icon name="redo" />
          リトライ
          <Label.Detail>{retries < 0 ? 'ネガ' : retries}</Label.Detail>
        </Label>
        <Label>
          <Icon name="compass outline" />
          進展
          <Label.Detail>
            {currQuestionNum > totalQuestionNum
              ? 'ゴール'
              : `${currQuestionNum} / ${totalQuestionNum}`}
          </Label.Detail>
        </Label>
      </Header>
    </Container>
  );
};
