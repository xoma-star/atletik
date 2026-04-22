const CLUB_ID = 'deb54b89-90d2-11e9-812a-0050568b0e0b';
const API_KEY = '3d5bf735-dd0c-4d9f-834b-6a7b3fa1cf4c';

export async function fetchVisitorCount() {
  const body = new URLSearchParams({
    method: 'getFitCalendar',
    'params[salonId]': '',
    'params[calendarType]': '',
    'params[getAll]': 'Y',
    'params[window_width]': '1042',
    'params[getUser]': 'false',
    'params[token_master]': '',
    'params[token]': '',
    'params[utm][referrer]': '',
    'params[utm][source]': 'https://xn----7sbbspme9ccnl.xn--p1ai/',
    isLK: 'true',
    [`clubs[${CLUB_ID}][id]`]: CLUB_ID,
    [`clubs[${CLUB_ID}][title]`]: 'ООО "Спорт"',
    [`clubs[${CLUB_ID}][countries][]`]: 'RU',
    [`clubs[${CLUB_ID}][current]`]: 'true',
    [`clubs[${CLUB_ID}][free_registration]`]: 'false',
    [`clubs[${CLUB_ID}][time_zone]`]: 'Asia/Yekaterinburg',
    [`clubs[${CLUB_ID}][timestamp]`]: String(Math.floor(Date.now() / 1000)),
    api_key: API_KEY,
    lang: 'en',
    lang_cookie: '',
    host_type: ''
  });

  const response = await fetch('https://reservi.ru/api-fit1c/json/v2/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Accept: 'application/json, text/javascript, */*; q=0.01'
    },
    body: body.toString()
  });

  if (!response.ok) {
    throw new Error(`reservi.ru HTTP ${response.status}`);
  }

  const data = await response.json();
  const html = data?.SLIDER?.ALL_BLOCK ?? '';
  const match = html.match(/class="online-people_rz"[^>]*>.*?(\d+)\s*visitor/i);

  if (!match) {
    throw new Error('Visitor count not found in API response');
  }

  return parseInt(match[1], 10);
}
