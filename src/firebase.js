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
    const userId = uuidv4(); // Генерация уникального ID
    const inviteCode = Math.random().toString(36).substring(2, 8); // Генерация кода

    const userRef = ref(db, `users/${userId}`); // Путь в Firebase

    // Записываем данные пользователя
    await set(userRef, { 
      userId, 
      nickname, 
      inviteCode 
    });

    console.log("Пользователь успешно сохранён:", { userId, nickname, inviteCode });
    return userId;
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
  const snapshot = await get(ref(db, `inviteCode/${code}`)); // ищем в inviteCode по коду
  if (!snapshot.exists()) return false;

  const inviteData = snapshot.val();
  return inviteData.available === true;
};


// Проверка уникальности ника
export const isNicknameUnique = async (nickname) => {
  const snapshot = await get(ref(db, 'users'));
  const users = snapshot.val() || {};
  return !Object.values(users).some((user) => user.nickname === nickname);
};

export { db };
