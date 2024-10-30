import React, { useState, useEffect, useRef } from 'react';
import { db, saveUser, generateInviteCode } from './firebase';
import { push, ref, onValue, set } from 'firebase/database';
import './Chat.css';

const Chat = ({ nickname }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [profileCode, setProfileCode] = useState('');
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Применяем стили при смене темы
    document.body.className = isDarkTheme ? 'dark-theme' : 'light-theme';
    if (isDarkTheme) {
      document.body.style.backgroundColor = '#121212'; // темный фон
      document.body.style.color = '#ffffff'; // светлый текст
    } else {
      document.body.style.backgroundColor = '#ffffff'; // светлый фон
      document.body.style.color = '#000000'; // темный текст
    }
  }, [isDarkTheme]);

  const toggleTheme = () => setIsDarkTheme((prev) => !prev);

  useEffect(() => {
    const updateUserProfile = async () => {
      try {
        const { profileCode } = await saveUser(nickname);
        setProfileCode(profileCode);
      } catch (error) {
        console.error('Ошибка обновления профиля:', error);
      }
    };

    updateUserProfile();

    const messagesRef = ref(db, 'messages');
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      setMessages(data ? Object.values(data) : []);
    });

    return () => unsubscribe(); 
  }, [nickname]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
  if (!input.trim()) {
    alert('Введите сообщение!');
    return;
  }

  try {
    const messagesRef = ref(db, 'messages');
    await push(messagesRef, {
      text: input,
      sender: nickname,
      timestamp: Date.now(),
    });
    setInput('');
    document.querySelector('.chat-input').focus(); // Устанавливаем фокус на поле ввода после отправки
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error);
    alert('Не удалось отправить сообщение.');
  }
};


  const generateCode = async () => {
    const code = generateInviteCode();
    setInviteCode(code);

    try {
      const inviteRef = ref(db, `inviteCode/${code}`);
      await set(inviteRef, {
        available: true,
        createdAt: Date.now(),
      });

      console.log('Код приглашения успешно сгенерирован и сохранён:', code);
    } catch (error) {
      console.error('Ошибка при сохранении кода приглашения:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('userId');
    window.location.reload();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <button className="theme-switch" onClick={toggleTheme}>
        {isDarkTheme ? 'Светлая тема' : 'Темная тема'}
      </button>
      <h2>elif_ {nickname}!</h2>

      <div className="profile-info">
        <p><strong>Ваш код профиля:</strong> {profileCode}</p>
        <button className="chat-button" onClick={generateCode}>Сгенерировать код приглашения</button>
        {inviteCode && <p>Код приглашения: {inviteCode}</p>}
        <button className="logout-button" onClick={logout}>Выйти из аккаунта</button>
      </div>

      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.sender}</strong>: {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <input
          className="chat-input"
          type="text"
          placeholder="Введите сообщение"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="chat-button" onClick={sendMessage}>Отправить</button>
      </div>
    </div>
  );
};

export default Chat;
