# Romantic Date Invite

Готовый мобильный сайт-приглашение без Telegram.

## Запуск на компьютере
1. Установи Node.js LTS.
2. В этой папке выполни `npm install`.
3. Выполни `npm start`.
4. Открой `http://localhost:3000/admin`.

## Публикация
Проект рассчитан на Render или другой Node.js hosting. Start command: `npm start`.

Важно: сейчас ответы хранятся в `data/invitations.json`. На хостинге без постоянного диска данные могут сброситься при redeploy/restart. Для постоянного хранения позже можно подключить PostgreSQL/Supabase.

Telegram не нужен.
