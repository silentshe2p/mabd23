import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Header } from 'semantic-ui-react';
import './Home.css';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <Container style={{ postition: 'relative' }}>
      <Header as="h1" style={{ padding: '5%' }}>
        こんにちわ！
      </Header>
      <button className="home-button" onClick={() => navigate('/login')}>
        入る
      </button>
      <footer style={{ position: 'absolute', bottom: '0', width: '100%' }}>
        <p>
          ㊙️外国人が作ったものなので、どこかに間違いがあっても驚かないでください
          :)
        </p>
      </footer>
    </Container>
  );
};
