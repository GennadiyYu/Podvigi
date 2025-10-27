(function(){
  const $ = (q, el=document)=>el.querySelector(q);
  const $$ = (q, el=document)=>Array.from(el.querySelectorAll(q));

  const partnerUrl = window.PROJECT.partnerUrl;
  const channelUrl = window.PROJECT.channelUrl;

  function setYear(){
    $('#year').textContent = new Date().getFullYear();
  }
  function initLinks(){
    const cta = $('#cta-parnter');
    cta.href = partnerUrl;
    $('#channelLink').href = channelUrl;
  }

  function setActive(tab){
    $$('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  }

  function fmtPercent(x){ return (x*100).toFixed(0) + '%' }
  function fmtConf(x){ return (x*100).toFixed(0) + '%' }

  function renderToday(){
    const today = new Date().toISOString().slice(0,10);
    const items = window.FORECASTS.filter(f => f.date >= today).sort((a,b)=>a.date.localeCompare(b.date));
    const past = window.FORECASTS.filter(f => f.date < today).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4);

    const card = (f) => `
      <div class="card">
        <div class="row">
          <div>
            <h3>${f.match}</h3>
            <div class="pill">${f.league} • ${f.date}</div>
          </div>
          <div class="kf">кф ${f.odds}</div>
        </div>
        <p class="note">Выбор: <b>${f.pick}</b> • Уверенность: ${fmtConf(f.confidence)}</p>
        <p>${f.rationale}</p>
        <div class="inline-actions">
          <a class="button primary" href="${partnerUrl}" target="_blank" rel="noopener">Поставить по прогнозу</a>
          <a class="button" href="${partnerUrl}" target="_blank" rel="noopener">Открыть линию</a>
        </div>
      </div>
    `;

    const historyItem = (f)=>`
      <li>
        ${f.match} — <b>${f.pick}</b> • кф ${f.odds}
        ${f.status === 'win' ? '<span class="win">WIN</span>' : f.status === 'loss' ? '<span class="loss">LOSS</span>' : ''}
      </li>`;

    $('#view').innerHTML = `
      <section>
        <div class="grid">
          <div>
            <h2>Прогнозы</h2>
            ${items.length ? items.map(card).join('') : '<p class="note">На сегодня прогнозов нет. Зайди позже.</p>'}
          </div>
          <div>
            <h2>Последние результаты</h2>
            <div class="card">
              <ul class="clean">
                ${past.length ? past.map(historyItem).join('') : '<li class="note">История пока пустая.</li>'}
              </ul>
              <hr class="sep">
              <a class="button" href="${channelUrl}" target="_blank" rel="noopener">Перейти в канал</a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderAnalytics(){
    $('#view').innerHTML = `
      <section>
        <div class="card">
          <h2>Показатели</h2>
          <p class="note">Данные демонстрационные. Подключим фактическую статистику позже.</p>
          <canvas id="chartWinrate" height="220"></canvas>
        </div>
        <div class="grid">
          <div class="card">
            <h3>Методика</h3>
            <p>Комбинация простых принципов и ИИ-помощника: формы команд, xG, травмы, мотивация, календарь. Ставки единичным флетом.</p>
            <ul class="clean">
              <li>Цель — <b>стабильный ROI</b>, без агрессивного риска.</li>
              <li>Никаких гарантий 100% — только дисциплина и дистанция.</li>
              <li>Прозрачная история и верификация.</li>
            </ul>
          </div>
          <div class="card">
            <h3>Мой подход</h3>
            <p>Изучаю ИИ и применяю его для фильтрации матчей. Подробности в канале.</p>
            <a class="button" href="${channelUrl}" target="_blank" rel="noopener">Открыть канал</a>
          </div>
        </div>
      </section>
    `;

    const ctx = document.getElementById('chartWinrate');
    const labels = window.ANALYTICS.byWeek.map(x=>x.week);
    const winrate = window.ANALYTICS.byWeek.map(x=>x.winrate);
    const roi = window.ANALYTICS.byWeek.map(x=>x.roi);

    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Winrate %', data: winrate, tension:.3 },
          { label: 'ROI %', data: roi, tension:.3 }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  function renderEducation(){
    $('#view').innerHTML = `
      <section class="grid">
        <div class="card">
          <h2>Как начать</h2>
          <ol>
            <li>Зарегистрируйся у букмекера (бонусы и фрибеты доступны):</li>
          </ol>
          <a class="button primary" href="${partnerUrl}" target="_blank" rel="noopener">Перейти по партнёрской ссылке</a>
          <hr class="sep" />
          <p>Заведи банк и ставь фиксированной суммой (флет). Не увеличивай ставку после проигрыша.</p>
        </div>
        <div class="card">
          <h2>FAQ</h2>
          <ul class="clean">
            <li><b>Какая проходимость?</b> Дистанционно 55–65% в зависимости от рынка.</li>
            <li><b>Сколько ставить?</b> 1–3% от банка на ставку.</li>
            <li><b>Гарантии?</b> Нет гарантий. Работаем на дистанцию.</li>
          </ul>
        </div>
      </section>
    `;
  }

  function renderBonuses(){
    $('#view').innerHTML = `
      <section>
        <div class="card">
          <h2>Бонусы и акции</h2>
          <p>Актуальные фрибеты и акции доступны по моей ссылке. Условия — на стороне букмекера.</p>
          <a class="button primary" href="${partnerUrl}" target="_blank" rel="noopener">Забрать бонус</a>
        </div>
      </section>
    `;
  }

  function renderAbout(){
    const bio = window.PROJECT.owner.bio;
    $('#view').innerHTML = `
      <section class="grid">
        <div class="card">
          <h2>О проекте</h2>
          <p>${bio}</p>
          <p>Подписывайся на канал и следи за обновлениями.</p>
          <a class="button" href="${channelUrl}" target="_blank" rel="noopener">Канал Telegram</a>
        </div>
        <div class="card">
          <h2>Правила и отказ от ответственности</h2>
          <ul class="clean">
            <li>Материалы — информационные, не являются индивидуальной рекомендацией.</li>
            <li>Ответственность за решения несёт игрок. Ставь ответственно.</li>
            <li>18+; внимательно читай правила букмекера.</li>
          </ul>
        </div>
      </section>
    `;
  }

  function route(tab){
    setActive(tab);
    if(tab==='today') return renderToday();
    if(tab==='analytics') return renderAnalytics();
    if(tab==='education') return renderEducation();
    if(tab==='bonuses') return renderBonuses();
    if(tab==='about') return renderAbout();
  }

  function initTabs(){
    $$('.tab').forEach(b=>{
      b.addEventListener('click', ()=> route(b.dataset.tab));
    });
  }

  function initTg(){
    if(window.Telegram && window.Telegram.WebApp){
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      // theme sync
      if (tg.themeParams && tg.themeParams.button_color) {
        document.documentElement.style.setProperty('--accent', tg.themeParams.button_color);
      }
    }
  }

  function boot(){
    setYear();
    initLinks();
    initTabs();
    initTg();
    route('today');
  }

  document.addEventListener('DOMContentLoaded', boot);
})();