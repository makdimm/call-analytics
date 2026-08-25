# Audira 🎯

Транскрибация и анализ звонков менеджеров через Whisper + GPT-4o.

## Стек

- **Backend:** Python FastAPI + PostgreSQL + Redis
- **Frontend:** React + TypeScript + Vite + MUI + Recharts
- **AI:** Whisper (локально) + OpenAI GPT-4o-mini
- **Инфра:** Docker Compose

## Быстрый старт

```bash
# 1. Клонировать
git clone https://github.com/makdimm/audira.git && cd audira

# 2. Настроить .env
cp backend/.env.example backend/.env
# Отредактировать: OPENAI_API_KEY, JWT_SECRET

# 3. Запустить
docker compose up -d

# 4. Админка
open http://localhost
```

## Регистрация первого пользователя

После запуска зарегистрируйся через API (или через админку):

```bash
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"rop","email":"rop@example.com","password":"123456","role":"admin"}'
```

## API Endpoints

| Метод | Путь | Описание |
|-------|------|----------|
| POST | /api/auth/login | Вход |
| POST | /api/auth/register | Регистрация |
| GET | /api/users/me | Текущий пользователь |
| GET | /api/users | Список пользователей (admin) |
| POST | /api/calls/upload | Загрузить звонок |
| GET | /api/calls | Список звонков |
| GET | /api/calls/:id | Детали звонка |
| DELETE | /api/calls/:id | Удалить звонок (admin) |
| GET | /api/analytics/dashboard | Дашборд |
| GET | /api/analytics/managers/:id | Детали менеджера |

## Доступ

- **Admin (РОП):** видит всех менеджеров, дашборд, загружает звонки
- **Manager:** видит только свои звонки и свою статистику
