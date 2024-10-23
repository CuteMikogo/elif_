import React, { useState } from 'react';
import { verifyInviteCode, verifyProfileCode, isNicknameUnique, saveUser, db } from './firebase';
import { 
  ref, 
  get, 
  query, 
  orderByChild, 
  equalTo 
} from 'firebase/database'; // Импортируем необходимые методы Firebase Database
import './JoinChat.css';

const JoinChat = ({ onJoin }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [profileCode, setProfileCode] = useState('');
  const [error, setError] = useState('');

  const handleLoginWithProfileCode = async (e) => {
    e.preventDefault();
    const user = await verifyProfileCode(profileCode);

    if (user) {
      localStorage.setItem('userId', user.userId);
      onJoin(user.nickname);
    } else {
      setError('Неверный код профиля.');
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
  
    try {
      const userId = await saveUser(nickname); // Сохраняем или получаем userId
      console.log("userId сохранён:", userId); // Проверка
  
      onJoin(nickname); // Переход в чат
    } catch (error) {
      setError('Ошибка при сохранении пользователя. Попробуйте снова.');
      console.error('Ошибка при входе:', error);
    }
  
  
    if (profileCode) {
      // Поиск пользователя по userId
      const userRef = ref(db, `users/${profileCode}`);
      const snapshot = await get(userRef);
  
      if (snapshot.exists()) {
        const userData = snapshot.val();
        onJoin(userData.nickname); // Авторизация успешна
        return;
      } else {
        setError('Неверный код профиля.');
        return;
      }
    }
  
    const isValid = await verifyInviteCode(inviteCode);
    if (!isValid) {
      setError('Неверный код приглашения.');
      return;
    }
  
    const uniqueNickname = await isNicknameUnique(nickname);
    if (!uniqueNickname) {
      setError('Этот ник уже используется. Пожалуйста, выберите другой.');
      return;
    }
  
    const userId = await saveUser(nickname);
    localStorage.setItem('userId', userId); // Сохраняем userId в localStorage
  
    onJoin(nickname);
  };

  return (
    <div className="join-container">
      <h1>Подключение к чату</h1>

      <form onSubmit={handleLoginWithProfileCode}>
        <input
          type="text"
          className="input-field"
          placeholder="Код профиля"
          value={profileCode}
          onChange={(e) => setProfileCode(e.target.value)}
        />
        <button type="submit" className="join-button">Войти по коду профиля</button>
      </form>

      <h3>Или создайте новый аккаунт:</h3>
      <form onSubmit={handleJoin}>
        <input
          type="text"
          className="input-field"
          placeholder="Введите никнейм"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
        <input
          type="text"
          className="input-field"
          placeholder="Код приглашения (необязательно)"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
        />
        <button type="submit" className="join-button">Создать аккаунт</button>
      </form>

      {error && <p className="error-text">{error}</p>}
    </div>
  );
};

export default JoinChat;
