import React, { useState, useEffect } from 'react';
import JoinChat from './JoinChat';
import Chat from './Chat';

function App() {
  const [nickname, setNickname] = useState('');
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId'); // Проверка сохранённого ID
    if (savedUserId) {
      setJoined(true); // Если ID есть, пропускаем ввод
    }
  }, []);

  const handleJoin = (nickname) => {
    setNickname(nickname);
    setJoined(true);
  };

  return (
    <div className="App">
      {joined ? (
        <Chat nickname={nickname} />
      ) : (
        <JoinChat onJoin={handleJoin} />
      )}
    </div>
  );
}

export default App;
