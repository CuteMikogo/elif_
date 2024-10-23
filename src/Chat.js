import React, { useState, useEffect } from 'react';
import { db, saveUser, generateInviteCode } from './firebase';
import { push, ref, onValue } from 'firebase/database';
import './Chat.css'; // Импорт стилей

const Chat = ({ nickname }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [profileCode, setProfileCode] = useState('');
  const [message, setMessage] = useState(''); // Ваша переменная 'message'

  useEffect(() => {
    // Получение сообщений из базы данных
    const messagesRef = ref(db, 'messages');
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      setMessages(data ? Object.values(data) : []);
    });

    // Загрузка личного кода профиля
    const code = generateInviteCode();
    setProfileCode(code);

    return () => unsubscribe(); // Отписка при размонтировании
  }, []);

  const sendMessage = async () => {
    if (!input) {
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
      setInput(''); // Очищаем поле после отправки
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      alert('Не удалось отправить сообщение.');
    }
  };

  const generateCode = () => {
    const code = generateInviteCode();
    setInviteCode(code);
  };

  const logout = () => {
    localStorage.removeItem('userId'); // Удаляем ID из LocalStorage
    window.location.reload(); // Перезагружаем страницу для выхода
  };

  const handleSendMessage = () => {
    if (message.trim() === '') return; // Проверка на пустое сообщение

    sendMessage(nickname, message); // Отправка сообщения
    setMessage(''); // Очистка поля ввода после отправки
  };

  // Функция для обработки нажатия клавиши
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Чтобы Enter не добавлял новую строку
      handleSendMessage();
    }
  };

  return (
    <div className="chat-container">
      <h2>elif_ {nickname}!</h2>

      <div className="profile-info">
        <p><strong>Ваш код профиля:</strong> {profileCode}</p>
        <button className="chat-button" onClick={generateInviteCode}>
          Сгенерировать код приглашения
        </button>
        {inviteCode && <p>Код приглашения: {inviteCode}</p>}
        <button className="chat-button" onClick={logout}>
          Выйти из аккаунта
        </button>
      </div>

      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.sender}</strong>: {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-input-container">
        <input
          className="chat-input"
          type="text"
          placeholder="Введите сообщение"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="chat-button" onClick={sendMessage}>
          Отправить
        </button>
      </div>
    </div>
  );
};

export default Chat;
