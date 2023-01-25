import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Header } from 'semantic-ui-react';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container style={{ margin: '40%', display: 'grid', placeItems: 'center' }}>
      <Header as="h1">404</Header>
      <Header as="h4">迷子になったようですね</Header>
      <Header as="h5">お探しのページは存在しません</Header>
      <Button primary onClick={() => navigate('/')}>
        ホームに戻る
      </Button>
    </Container>
  );
};
