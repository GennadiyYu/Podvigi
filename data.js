// Конфигурация проекта и демо-данные
window.PROJECT = {
  brand: "Ставка Заводчанина",
  partnerUrl: "https://click.lp-link.ru/16iEz6J6?landing=2&sub_id4=tg",
  channelUrl: "https://t.me/+your_channel_invite", // <-- вставь ссылку на канал
  owner: {
    name: "Павел",
    bio: "Не обещаю золотых гор и 100% выигрышей. Меня зовут Павел, я долго шел к тому, чтобы начать рассказывать о своих успехах в ставках. Продолжаю работать на обычной работе, параллельно изучаю ИИ, который помогает мне в прогнозах. Буду рад расти с тобой вместе."
  }
};

// Демонстрационные прогнозы (можно редактировать прямо в файле)
window.FORECASTS = [
  {
    id: "m1",
    date: "2025-10-26",
    league: "EPL",
    match: "Chelsea vs. Newcastle",
    pick: "П1 (победа хозяев)",
    odds: 1.92,
    confidence: 0.64,
    rationale: "Форма дома + XG последних 5 матчей в пользу Челси. Травмы у гостей в обороне.",
    status: "pending"
  },
  {
    id: "m2",
    date: "2025-10-26",
    league: "LaLiga",
    match: "Valencia vs. Betis",
    pick: "ТБ(2.0)",
    odds: 1.87,
    confidence: 0.58,
    rationale: "Обе команды создают >1.6 xG в среднем за игру.",
    status: "pending"
  },
  {
    id: "m3",
    date: "2025-10-25",
    league: "Serie A",
    match: "Atalanta vs. Torino",
    pick: "X2 (не проигрыш)",
    odds: 1.66,
    confidence: 0.55,
    rationale: "Гостям подходит прагматичный план, защита в форме.",
    status: "win"
  }
];

// История для аналитики (W/L и ROI по неделям)
window.ANALYTICS = {
  byWeek: [
    { week: "Нед 1", winrate: 62, roi: 6.4 },
    { week: "Нед 2", winrate: 57, roi: 4.1 },
    { week: "Нед 3", winrate: 64, roi: 8.9 },
    { week: "Нед 4", winrate: 59, roi: 3.5 }
  ]
};
