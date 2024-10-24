import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, push, child } from "firebase/database";
import { v4 as uuidv4 } from 'uuid'; // для генерации уникальных ID

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAzQHpHyiFy_RIfNXUP98Qt2payYs3Rzm4",
  authDomain: "elif-713a9.firebaseapp.com",
  databaseURL: "https://elif-713a9-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "elif-713a9",
  storageBucket: "elif-713a9.appspot.com",
  messagingSenderId: "649059306193",
  appId: "1:649059306193:web:909ae078cd2863f4efd3f0",
  measurementId: "G-JQEV35M7C8"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Генерация кода приглашения
export const generateInviteCode = () => Math.random().toString(36).substring(2, 8);

// Генерация личного кода профиля
export const generateProfileCode = () => Math.random().toString(36).substring(2, 8);

// Сохранение пользователя в базе данных
export const saveUser = async (nickname) => {
  try {
    let userId = localStorage.getItem('userId'); // Проверяем, есть ли сохранённый ID

    if (!userId) {
      userId = uuidv4(); // Если его нет, создаём новый
      localStorage.setItem('userId', userId); // Сохраняем в localStorage
    }

    const profileCode = generateProfileCode(); // Генерируем новый код профиля
    const userRef = ref(db, `users/${userId}`);

    // Проверяем, не существует ли уже запись с этим userId
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const userData = snapshot.val();
      
      // Обновляем код профиля при каждом входе
      await set(userRef, { ...userData, profileCode });
      console.log("Профиль обновлен с новым кодом профиля:", profileCode);

      return { userId, profileCode }; // Возвращаем обновлённые данные
    }

    // Если запись отсутствует, создаём новую
    await set(userRef, { 
      userId, 
      nickname, 
      profileCode 
    });

    console.log("Пользователь успешно сохранён:", { userId, nickname, profileCode });
    return { userId, profileCode };
  } catch (error) {
    console.error("Ошибка при сохранении пользователя:", error);
    throw error;
  }
};

// Проверка личного кода профиля
export const verifyProfileCode = async (code) => {
  const snapshot = await get(ref(db, 'users'));
  if (!snapshot.exists()) return null;

  const users = snapshot.val();
  for (let userId in users) {
    if (users[userId].profileCode === code) {
      return users[userId];
    }
  }
  return null;
};

// Проверка кода приглашения
export const verifyInviteCode = async (code) => {
  const inviteRef = ref(db, `inviteCode/${code}`);
  const snapshot = await get(inviteRef); // ищем в inviteCodes по коду
  if (!snapshot.exists()) return false;

  const inviteData = snapshot.val();
  if (inviteData.available === true) {
    // Помечаем код как использованный
    await set(inviteRef, { ...inviteData, available: false });
    return true;
  }
  return false;
};


// Проверка уникальности ника
export const isNicknameUnique = async (nickname) => {
  const snapshot = await get(ref(db, 'users'));
  const users = snapshot.val() || {};
  return !Object.values(users).some((user) => user.nickname === nickname);
};

export const deleteInviteCode = async (code) => {
  try {
    const inviteRef = ref(db, `inviteCode/${code}`);
    await set(inviteRef, null); // Удаляем код из базы данных
    console.log(`Код приглашения ${code} был удалён из базы данных.`);
  } catch (error) {
    console.error("Ошибка при удалении кода приглашения:", error);
    throw error;
  }
};
export { db };
