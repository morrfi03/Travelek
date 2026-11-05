/* Точка входа. Части дневника — модули и импортируют друг друга.
   Сборки Vite нет: Layero отдаёт репозиторий как статику. */
import "./gate.js?v=42";
import "./parts/04-app.js?v=42";
import "./accounts.js?v=42";
