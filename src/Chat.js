import React, { useState, useEffect } from 'react';
import { db, saveUser, generateInviteCode, generateProfileCode } from './firebase';
import { push, ref, onValue, set } from 'firebase/database';
import './Chat.css'; // Импорт стилей

const Chat = ({ nickname }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(''); // Используем input для обработки сообщений
  const [inviteCode, setInviteCode] = useState('');
  const [profileCode, setProfileCode] = useState('');

  useEffect(() => {
    const updateUserProfile = async () => {
      try {
        const { profileCode } = await saveUser(nickname); // вызываем saveUser, который обновит профиль и вернёт новый код
        setProfileCode(profileCode); // устанавливаем обновлённый код профиля
      } catch (error) {
        console.error('Ошибка обновления профиля:', error);
      }
    };
  
    updateUserProfile(); // обновляем профиль при монтировании компонента
  
    const messagesRef = ref(db, 'messages');
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      setMessages(data ? Object.values(data) : []);
    });
  
    return () => unsubscribe(); // отписка при размонтировании
  }, [nickname]);

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
      setInput(''); // Очищаем поле после отправки
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      alert('Не удалось отправить сообщение.');
    }
  };

  const generateCode = async () => {
    const code = generateInviteCode(); // Генерация нового кода
    setInviteCode(code); // Установка кода в локальный state
  
    try {
      // Сохраняем код приглашения в базе данных
      const inviteRef = ref(db, `inviteCode/${code}`);
      await set(inviteRef, {
        available: true, // Код доступен для использования
        createdAt: Date.now(), // Время создания
      });
  
      console.log('Код приглашения успешно сгенерирован и сохранён:', code);
    } catch (error) {
      console.error('Ошибка при сохранении кода приглашения:', error);
    }
  };

  

  const logout = () => {
    localStorage.removeItem('userId'); // Удаляем ID из LocalStorage
    window.location.reload(); // Перезагружаем страницу для выхода
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Чтобы Enter не добавлял новую строку
      sendMessage(); // Отправка сообщения
    }
  };

  return (
    <div className="chat-container">
      <h2>elif_ {nickname}!</h2>

      <div className="profile-info">
        <p><strong>Ваш код профиля:</strong> {profileCode}</p>
        <button className="chat-button" onClick={generateCode}>
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
          onKeyPress={handleKeyPress} // Добавляем обработчик Enter
        />
        <button className="chat-button" onClick={sendMessage}>
          Отправить
        </button>
      </div>
    </div>
  );
};

export default Chat;
