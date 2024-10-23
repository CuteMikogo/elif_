import { ref, set, get } from "firebase/database";
import { db } from "./firebase"; // Проверьте правильность импорта
import { v4 as uuidv4 } from 'uuid'; 

// Функция для сохранения пользователя с уникальным userId
export const saveUser = async (nickname) => {
  try {
    let userId = localStorage.getItem('userId'); // Проверяем, есть ли сохранённый ID

    if (!userId) {
      userId = uuidv4(); // Если его нет, создаём новый
      localStorage.setItem('userId', userId); // Сохраняем в localStorage
    }

    const userRef = ref(db, `users/${userId}`); // Путь к пользователю в Firebase

    // Проверяем, не существует ли уже запись с этим userId
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      console.log("Пользователь уже существует:", snapshot.val());
      return userId; // Возвращаем существующий ID
    }

    // Записываем данные в Firebase
    await set(userRef, { 
      userId, 
      nickname 
    });

    console.log("Пользователь успешно сохранён:", { userId, nickname });
    return userId;
  } catch (error) {
    console.error("Ошибка при сохранении пользователя:", error);
    throw error;
  }
};
