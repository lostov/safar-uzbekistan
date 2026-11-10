# -*- coding: utf-8 -*-
"""Bir martalik generator: public/data/i18n.json faylini yaratadi.
Lotin matnlarda ASCII ' yoziladi: o' g' → oʻ gʻ (U+02BB), qolgani → ʼ (U+02BC, tutuq belgisi).
'uz-yangi' (Özbekça, 2027-yildan kuchga kiradigan alifbo) 'uz-latn'dan avtomatik olinadi.
Keyingi tahrirlar to‘g‘ridan-to‘g‘ri i18n.json’da qilinadi; tekshiruv: npm run i18n
"""
import json, re, sys

def lat(s):
    s = re.sub(r"([oOgG])'", lambda m: m.group(1) + 'ʻ', s)
    return s.replace("'", 'ʼ')

def yangi(s):
    out, i = [], 0
    for part in re.split(r'(\{[^}]*\}|https?://\S+)', s):
        if part.startswith('{') or part.startswith('http'):
            out.append(part); continue
        p = part
        for a, b in [('Oʻ', 'Ö'), ('oʻ', 'ö'), ('Gʻ', 'Ğ'), ('gʻ', 'ğ'),
                     ('SH', 'Ş'), ('Sh', 'Ş'), ('sh', 'ş'), ('CH', 'Ç'), ('Ch', 'Ç'), ('ch', 'ç')]:
            p = p.replace(a, b)
        out.append(p)
    return ''.join(out)

L = {}   # uz-latn (ASCII apostrof bilan)
C = {}   # uz-cyrl
R = {}   # ru
E = {}   # en

def t(key, uz, cy, ru, en):
    L[key], C[key], R[key], E[key] = uz, cy, ru, en

# ---------- umumiy ----------
t('app.name', "Safar Uzbekistan", "Safar Uzbekistan", "Safar Uzbekistan", "Safar Uzbekistan")
t('app.tagline', "Xorijga chiqayotgan fuqarolar uchun diniy-ma'rifiy tavsiyalar", "Хорижга чиқаётган фуқаролар учун диний-маърифий тавсиялар",
  "Религиозно-просветительские рекомендации для граждан, выезжающих за рубеж", "Religious and educational guidance for citizens travelling abroad")
t('nav.home', "Bosh sahifa", "Бош саҳифа", "Главная", "Home")
t('nav.weather', "Ob-havo", "Об-ҳаво", "Погода", "Weather")
t('nav.prayer', "Namoz", "Намоз", "Намаз", "Prayer")
t('nav.prayerFull', "Namoz vaqtlari", "Намоз вақтлари", "Время намаза", "Prayer times")
t('nav.more', "Yana", "Яна", "Ещё", "More")
t('nav.sos', "SOS", "SOS", "SOS", "SOS")
t('nav.sources', "Rasmiy manbalar", "Расмий манбалар", "Официальные источники", "Official sources")
t('nav.banned', "Taqiqlangan manbalar", "Тақиқланган манбалар", "Запрещённые источники", "Banned sources")
t('nav.embassies', "Vakolatxonalar", "Ваколатхоналар", "Представительства", "Diplomatic missions")
t('nav.vaqf', "«Vaqf» fondi", "«Вақф» фонди", "Фонд «Вакф»", "Vaqf Foundation")
t('nav.menu', "Bo'limlar", "Бўлимлар", "Разделы", "Sections")
t('status.online', "Onlayn", "Онлайн", "Онлайн", "Online")
t('status.offline', "Oflayn", "Офлайн", "Офлайн", "Offline")
t('status.cacheReady', "Oflayn kesh tayyor", "Офлайн кеш тайёр", "Офлайн-кэш готов", "Offline cache ready")
t('common.back', "Orqaga", "Орқага", "Назад", "Back")
t('common.copy', "Nusxa olish", "Нусха олиш", "Копировать", "Copy")
t('common.copied', "Nusxa olindi!", "Нусха олинди!", "Скопировано!", "Copied!")
t('common.qr', "QR-kod", "QR-код", "QR-код", "QR code")
t('common.open', "Ochish", "Очиш", "Открыть", "Open")
t('common.share', "Ulashish", "Улашиш", "Поделиться", "Share")
t('common.close', "Yopish", "Ёпиш", "Закрыть", "Close")
t('common.call', "Qo'ng'iroq", "Қўнғироқ", "Позвонить", "Call")
t('common.details', "Batafsil", "Батафсил", "Подробнее", "Details")
t('common.refresh', "Yangilash", "Янгилаш", "Обновить", "Refresh")
t('common.retry', "Qayta urinish", "Қайта уриниш", "Повторить", "Try again")
t('common.loading', "Yuklanmoqda…", "Юкланмоқда…", "Загрузка…", "Loading…")
t('common.doubleTap', "Havola ikki marta bosilganda yangi oynada ochiladi", "Ҳавола икки марта босилганда янги ойнада очилади",
  "Ссылка открывается в новом окне двойным нажатием", "Links open in a new window on double tap")
t('common.tapAgain', "Ochish uchun yana bir marta bosing", "Очиш учун яна бир марта босинг", "Нажмите ещё раз, чтобы открыть", "Tap again to open")
t('common.qrHint', "Boshqa telefon kamerasi bilan skanerlang", "Бошқа телефон камераси билан сканерланг", "Отсканируйте камерой другого телефона", "Scan with another phone's camera")
t('common.error', "Ma'lumotni yuklab bo'lmadi", "Маълумотни юклаб бўлмади", "Не удалось загрузить данные", "Could not load data")
t('common.locationDenied', "Joylashuvga ruxsat berilmadi. Brauzer sozlamalaridan ruxsat bering.", "Жойлашувга рухсат берилмади. Браузер созламаларидан рухсат беринг.",
  "Доступ к геолокации запрещён. Разрешите его в настройках браузера.", "Location access was denied. Allow it in your browser settings.")
t('common.locationButton', "Joylashuvni aniqlash", "Жойлашувни аниқлаш", "Определить местоположение", "Detect location")

# ---------- o'rnatish ----------
t('install.title', "Ilovani o'rnating", "Иловани ўрнатинг", "Установите приложение", "Install the app")
t('install.text', "Uy ekraniga qo'shing — internetsiz ham ochiladi", "Уй экранига қўшинг — интернетсиз ҳам очилади",
  "Добавьте на главный экран — работает и без интернета", "Add it to your home screen — works offline too")
t('install.button', "O'rnatish", "Ўрнатиш", "Установить", "Install")
t('install.iosTitle', "iPhone'da o'rnatish", "iPhone'да ўрнатиш", "Установка на iPhone", "Install on iPhone")
t('install.iosStep1', "Safari pastidagi «Ulashish» tugmasini bosing", "Safari пастидаги «Улашиш» тугмасини босинг",
  "Нажмите кнопку «Поделиться» внизу Safari", "Tap the Share button at the bottom of Safari")
t('install.iosStep2', "«Uy ekraniga qo'shish» bandini tanlang", "«Уй экранига қўшиш» бандини танланг",
  "Выберите «На экран «Домой»»", "Choose “Add to Home Screen”")
t('install.installed', "Ilova o'rnatilgan", "Илова ўрнатилган", "Приложение установлено", "App installed")

# ---------- bosh sahifa ----------
t('home.subtitle', "Xorijda yashab, ishlayotgan va o'qiyotgan yurtdoshlar uchun ishonchli qo'llanma",
  "Хорижда яшаб, ишлаётган ва ўқиётган юртдошлар учун ишончли қўлланма",
  "Надёжный справочник для соотечественников, живущих, работающих и обучающихся за рубежом",
  "A trusted guide for compatriots living, working and studying abroad")
t('home.quote', "Kim ogoh bo'lsa, najot topadi.\nKim g'ofil bo'lsa, halok bo'ladi.", "Ким огоҳ бўлса, нажот топади.\nКим ғофил бўлса, ҳалок бўлади.",
  "Кто бдителен, тот найдёт спасение.\nКто небрежен, тот погибнет.", "Whoever is aware will find salvation.\nWhoever is heedless will perish.")
t('home.quoteAuthor', "Abdulloh ibn Muborak", "Абдуллоҳ ибн Муборак", "Абдуллах ибн Мубарак", "Abdullah ibn al-Mubarak")
t('home.sosTitle', "SOS — favqulodda yordam", "SOS — фавқулодда ёрдам", "SOS — экстренная помощь", "SOS — emergency help")
t('home.sosText', "112, eng yaqin vakolatxona, joylashuvni yuborish", "112, энг яқин ваколатхона, жойлашувни юбориш",
  "112, ближайшее представительство, отправка местоположения", "112, nearest mission, send your location")
t('home.sourcesTitle', "Rasmiy veb-sayt va kanallar", "Расмий веб-сайт ва каналлар", "Официальные сайты и каналы", "Official websites and channels")
t('home.sourcesText', "5 bo'lim · faqat tasdiqlangan manbalar", "5 бўлим · фақат тасдиқланган манбалар", "5 разделов · только проверенные источники", "5 sections · verified sources only")
t('home.bannedTitle', "Taqiqlangan internet manbalar", "Тақиқланган интернет манбалар", "Запрещённые интернет-источники", "Banned online sources")
t('home.bannedText', "Oliy sud ro'yxati va huquqiy oqibatlar", "Олий суд рўйхати ва ҳуқуқий оқибатлар", "Список Верховного суда и правовые последствия", "Supreme Court list and legal consequences")
t('home.embassiesTitle', "Diplomatik vakolatxonalar", "Дипломатик ваколатхоналар", "Дипломатические представительства", "Diplomatic missions")
t('home.embassiesText', "Elchixona va konsulxonalar · oflayn", "Элчихона ва консулхоналар · офлайн", "Посольства и консульства · офлайн", "Embassies and consulates · offline")
t('home.vaqfTitle', "«Vaqf» xayriya jamoat fondi", "«Вақф» хайрия жамоат фонди", "Благотворительный общественный фонд «Вакф»", "Vaqf charitable public foundation")
t('home.vaqfText', "QR-kod orqali ehson qilish", "QR-код орқали эҳсон қилиш", "Пожертвование через QR-код", "Donate via QR code")
t('home.nextPrayer', "Keyingi namoz", "Кейинги намоз", "Следующий намаз", "Next prayer")
t('home.warning', "Ehtiyot bo'ling: diniy ma'lumotni faqat rasmiy manbalardan oling. Taqiqlangan materiallarni saqlash va tarqatish jinoiy javobgarlikka sabab bo'ladi.",
  "Эҳтиёт бўлинг: диний маълумотни фақат расмий манбалардан олинг. Тақиқланган материалларни сақлаш ва тарқатиш жиноий жавобгарликка сабаб бўлади.",
  "Будьте бдительны: получайте религиозную информацию только из официальных источников. Хранение и распространение запрещённых материалов влечёт уголовную ответственность.",
  "Be careful: get religious information only from official sources. Storing or sharing banned materials is a criminal offence.")
t('home.viewList', "Ro'yxatni ko'rish", "Рўйхатни кўриш", "Смотреть список", "View the list")

# ---------- rasmiy manbalar ----------
t('sources.title', "Rasmiy veb-sayt va kanallar", "Расмий веб-сайт ва каналлар", "Официальные сайты и каналы", "Official websites and channels")
t('sources.subtitle', "Diniy ma'lumotni faqat tasdiqlangan manbalardan oling", "Диний маълумотни фақат тасдиқланган манбалардан олинг",
  "Получайте религиозную информацию только из проверенных источников", "Get religious information only from verified sources")
t('sources.cached', "Ro'yxat ilova bilan birga saqlanadi — internetsiz ham ko'rinadi", "Рўйхат илова билан бирга сақланади — интернетсиз ҳам кўринади",
  "Список хранится вместе с приложением — доступен без интернета", "The list is stored with the app — available offline")
t('src.g1', "O'zbekiston Respublikasi Din ishlari bo'yicha qo'mitasining ijtimoiy tarmoqlari", "Ўзбекистон Республикаси Дин ишлари бўйича қўмитасининг ижтимоий тармоқлари",
  "Социальные сети Комитета по делам религий Республики Узбекистан", "Social media of the Committee on Religious Affairs of the Republic of Uzbekistan")
t('src.g2', "O'zbekiston musulmonlari idorasi rasmiy veb-portallari", "Ўзбекистон мусулмонлари идораси расмий веб-порталлари",
  "Официальные веб-порталы Управления мусульман Узбекистана", "Official web portals of the Muslim Board of Uzbekistan")
t('src.g3', "O'zbekiston musulmonlari idorasi Fatvo markazi", "Ўзбекистон мусулмонлари идораси Фатво маркази",
  "Центр фетв Управления мусульман Узбекистана", "Fatwa Centre of the Muslim Board of Uzbekistan")
t('src.g4', "Ilmiy ta'lim muassasalari", "Илмий таълим муассасалари", "Научно-образовательные учреждения", "Academic and educational institutions")
t('src.g5', "Xalqaro ilmiy-tadqiqot markazlari", "Халқаро илмий-тадқиқот марказлари", "Международные научно-исследовательские центры", "International research centres")
t('src.l1', "Rasmiy ijtimoiy tarmoqlar", "Расмий ижтимоий тармоқлар", "Официальные социальные сети", "Official social media")
t('src.l2', "Foydali va ishonchli saytlar, ijtimoiy tarmoqlar", "Фойдали ва ишончли сайтлар, ижтимоий тармоқлар", "Полезные и надёжные сайты и соцсети", "Useful and reliable websites and social media")
t('src.l3', "MUSLIM.UZ portali", "MUSLIM.UZ портали", "Портал MUSLIM.UZ", "MUSLIM.UZ portal")
t('src.l4', "Diniy savollarga rasmiy javoblar", "Диний саволларга расмий жавоблар", "Официальные ответы на религиозные вопросы", "Official answers to religious questions")
t('src.l5', "O'zbekiston xalqaro islomshunoslik akademiyasi", "Ўзбекистон халқаро исломшунослик академияси", "Международная исламская академия Узбекистана", "International Islamic Academy of Uzbekistan")
t('src.l6', "Toshkent islom instituti", "Тошкент ислом институти", "Ташкентский исламский институт", "Tashkent Islamic Institute")
t('src.l7', "Mir Arab oliy madrasasi", "Мир Араб олий мадрасаси", "Высшее медресе Мири Араб", "Mir-i Arab Higher Madrasa")
t('src.l8', "Imom Buxoriy xalqaro ilmiy-tadqiqot markazi", "Имом Бухорий халқаро илмий-тадқиқот маркази", "Международный научно-исследовательский центр имама Бухари", "Imam Bukhari International Research Centre")
t('src.l9', "Imom Moturidiy xalqaro ilmiy-tadqiqot markazi", "Имом Мотуридий халқаро илмий-тадқиқот маркази", "Международный научно-исследовательский центр имама Матуриди", "Imam Maturidi International Research Centre")
t('src.l10', "Imom Termiziy o'rta maxsus islom ta'lim muassasasi", "Имом Термизий ўрта махсус ислом таълим муассасаси", "Среднее специальное исламское учебное заведение имама Термизи", "Imam Termizi Islamic secondary school")
t('src.l11', "Islom sivilizatsiyasi markazi", "Ислом цивилизацияси маркази", "Центр исламской цивилизации", "Centre for Islamic Civilization")

# ---------- taqiqlangan ----------
t('banned.title', "Taqiqlangan internet manbalar", "Тақиқланган интернет манбалар", "Запрещённые интернет-источники", "Banned online sources")
t('banned.subtitle', "va ularni tarqatishning huquqiy oqibatlari", "ва уларни тарқатишнинг ҳуқуқий оқибатлари", "и правовые последствия их распространения", "and the legal consequences of sharing them")
t('banned.court', "Oliy sud qarori", "Олий суд қарори", "Решение Верховного суда", "Supreme Court ruling")
t('banned.description', "O'zbekiston Respublikasi Oliy sudi tomonidan internet jahon tarmog'idagi diniy ekstremistik, terroristik va aqidaparastlik g'oyalari bilan yo'g'rilgan deb topilgan hamda O'zbekiston Respublikasi hududiga olib kirish, tayyorlash, saqlash, tarqatish va namoyish etilishi taqiqlangan manba va kontentlar (materiallar) ro'yxati",
  "Ўзбекистон Республикаси Олий суди томонидан интернет жаҳон тармоғидаги диний экстремистик, террористик ва ақидапарастлик ғоялари билан йўғрилган деб топилган ҳамда Ўзбекистон Республикаси ҳудудига олиб кириш, тайёрлаш, сақлаш, тарқатиш ва намойиш этилиши тақиқланган манба ва контентлар (материаллар) рўйхати",
  "Список источников и материалов в сети Интернет, признанных Верховным судом Республики Узбекистан проникнутыми идеями религиозного экстремизма, терроризма и фанатизма, ввоз, изготовление, хранение, распространение и демонстрация которых на территории Республики Узбекистан запрещены",
  "List of online sources and materials found by the Supreme Court of the Republic of Uzbekistan to promote religious extremism, terrorism and fanaticism, which are prohibited from being brought into, produced, stored, distributed or displayed in the Republic of Uzbekistan")
t('banned.asOf', "{date} holatiga", "{date} ҳолатига", "по состоянию на {date}", "as of {date}")
t('banned.list', "Internet manbalar ro'yxati", "Интернет манбалар рўйхати", "Список интернет-источников", "List of online sources")
t('banned.pdf', "PDF fayl", "PDF файл", "PDF-файл", "PDF file")
t('banned.telegram', "Telegram havola", "Telegram ҳавола", "Ссылка в Telegram", "Telegram link")
t('banned.law', "Huquqiy oqibatlari", "Ҳуқуқий оқибатлари", "Правовые последствия", "Legal consequences")
t('banned.article', "244¹-modda.", "244¹-модда.", "Статья 244¹.", "Article 244¹.")
t('banned.articleText', "Jamoat xavfsizligi va jamoat tartibiga tahdid soladigan materiallarni tayyorlash, saqlash, tarqatish yoki namoyish etish",
  "Жамоат хавфсизлиги ва жамоат тартибига таҳдид соладиган материалларни тайёрлаш, сақлаш, тарқатиш ёки намойиш этиш",
  "Изготовление, хранение, распространение или демонстрация материалов, содержащих угрозу общественной безопасности и общественному порядку",
  "Producing, storing, distributing or displaying materials that threaten public safety and public order")
t('banned.code', "Jinoyat kodeksi", "Жиноят кодекси", "Уголовный кодекс", "Criminal Code")
t('banned.practice', "Sud amaliyoti", "Суд амалиёти", "Судебная практика", "Court practice")
t('banned.video', "Tushuntirish videosi", "Тушунтириш видеоси", "Разъясняющее видео", "Explainer video")
t('banned.appealTitle', "Hurmatli fuqarolar, qadrli ota-onalar va yoshlar!", "Ҳурматли фуқаролар, қадрли ота-оналар ва ёшлар!",
  "Уважаемые граждане, дорогие родители и молодёжь!", "Dear citizens, parents and young people!")
t('banned.appealText', "Diniy aqidaparastlik, ekstremizm va terrorizm tuzog'iga tushib qolishdan doimo saqlaning. Ular hayotingiz va orzularingizni barbod qilishiga aslo yo'l qo'ymang.",
  "Диний ақидапарастлик, экстремизм ва терроризм тузоғига тушиб қолишдан доимо сақланинг. Улар ҳаётингиз ва орзуларингизни барбод қилишига асло йўл қўйманг.",
  "Всегда остерегайтесь ловушек религиозного фанатизма, экстремизма и терроризма. Никогда не позволяйте им разрушить вашу жизнь и мечты.",
  "Always guard yourself against the traps of religious fanaticism, extremism and terrorism. Never let them ruin your life and your dreams.")

# ---------- vakolatxonalar ----------
t('emb.title', "Diplomatik vakolatxonalar", "Дипломатик ваколатхоналар", "Дипломатические представительства", "Diplomatic missions")
t('emb.subtitle', "O'zbekiston Respublikasining xorijdagi elchixona va konsulxonalari", "Ўзбекистон Республикасининг хориждаги элчихона ва консулхоналари",
  "Посольства и консульства Республики Узбекистан за рубежом", "Embassies and consulates of the Republic of Uzbekistan abroad")
t('emb.search', "Davlat yoki shahar", "Давлат ёки шаҳар", "Страна или город", "Country or city")
t('emb.all', "Barchasi", "Барчаси", "Все", "All")
t('emb.embassies', "Elchixonalar", "Элчихоналар", "Посольства", "Embassies")
t('emb.consulates', "Konsulxonalar", "Консулхоналар", "Консульства", "Consulates")
t('emb.embassy', "Elchixona", "Элчихона", "Посольство", "Embassy")
t('emb.consulate', "Konsulxona", "Консулхона", "Консульство", "Consulate")
t('emb.offlineSaved', "Internet yo'q · ro'yxat {date} saqlangan", "Интернет йўқ · рўйхат {date} сақланган", "Нет интернета · список сохранён {date}", "No internet · list saved on {date}")
t('emb.empty', "Hech narsa topilmadi", "Ҳеч нарса топилмади", "Ничего не найдено", "Nothing found")
t('emb.noData', "Ro'yxat hali yuklanmagan. Internetga ulanib, qayta urinib ko'ring.", "Рўйхат ҳали юкланмаган. Интернетга уланиб, қайта уриниб кўринг.",
  "Список ещё не загружен. Подключитесь к интернету и повторите попытку.", "The list has not been downloaded yet. Connect to the internet and try again.")
t('emb.head', "Rahbar", "Раҳбар", "Руководитель", "Head of mission")
t('emb.address', "Manzil", "Манзил", "Адрес", "Address")
t('emb.phone', "Telefon", "Телефон", "Телефон", "Phone")
t('emb.fax', "Faks", "Факс", "Факс", "Fax")
t('emb.map', "Google Maps'da ochish", "Google Maps'да очиш", "Открыть в Google Maps", "Open in Google Maps")
t('emb.source', "Manba: data.egov.uz — Ochiq ma'lumotlar portali · har hafta yangilanadi", "Манба: data.egov.uz — Очиқ маълумотлар портали · ҳар ҳафта янгиланади",
  "Источник: data.egov.uz — Портал открытых данных · обновляется еженедельно", "Source: data.egov.uz — Open Data Portal · updated weekly")
t('emb.distance', "{km} km", "{km} км", "{km} км", "{km} km")

# ---------- vaqf ----------
t('vaqf.title', "«Vaqf» xayriya jamoat fondi", "«Вақф» хайрия жамоат фонди", "Благотворительный общественный фонд «Вакф»", "Vaqf charitable public foundation")
t('vaqf.subtitle', "Ehson qilish — fondning rasmiy to'lov sahifasi orqali", "Эҳсон қилиш — фонднинг расмий тўлов саҳифаси орқали",
  "Пожертвование — через официальную страницу оплаты фонда", "Donate through the foundation's official payment page")
t('vaqf.slogan', "Ehsonning mukofoti faqat ehsondir", "Эҳсоннинг мукофоти фақат эҳсондир", "Наградой за добро может быть только добро", "The reward for goodness is nothing but goodness")
t('vaqf.qrTitle', "QR orqali ehson", "QR орқали эҳсон", "Пожертвование по QR-коду", "Donate by QR code")
t('vaqf.qrText', "Bank ilovangiz kamerasi bilan skanerlang yoki to'lov sahifasini oching", "Банк иловангиз камераси билан сканерланг ёки тўлов саҳифасини очинг",
  "Отсканируйте камерой банковского приложения или откройте страницу оплаты", "Scan with your banking app or open the payment page")
t('vaqf.open', "To'lov sahifasini ochish", "Тўлов саҳифасини очиш", "Открыть страницу оплаты", "Open the payment page")
t('vaqf.safeTitle', "Xavfsiz to'lov", "Хавфсиз тўлов", "Безопасная оплата", "Safe payment")
t('vaqf.safeText', "Ilova pul qabul qilmaydi va karta ma'lumotlarini saqlamaydi — to'lov faqat fondning rasmiy sahifasida.",
  "Илова пул қабул қилмайди ва карта маълумотларини сақламайди — тўлов фақат фонднинг расмий саҳифасида.",
  "Приложение не принимает деньги и не хранит данные карт — оплата только на официальной странице фонда.",
  "The app does not accept money or store card details — payment happens only on the foundation's official page.")

# ---------- ob-havo ----------
t('weather.title', "Ob-havo", "Об-ҳаво", "Погода", "Weather")
t('weather.subtitle', "Joylashuvingiz bo'yicha 5 kunlik prognoz", "Жойлашувингиз бўйича 5 кунлик прогноз", "Прогноз на 5 дней по вашему местоположению", "5-day forecast for your location")
t('weather.permission', "Ob-havoni ko'rish uchun joylashuvga ruxsat bering", "Об-ҳавони кўриш учун жойлашувга рухсат беринг",
  "Разрешите доступ к местоположению, чтобы увидеть погоду", "Allow location access to see the weather")
t('weather.sunrise', "Quyosh chiqishi", "Қуёш чиқиши", "Восход", "Sunrise")
t('weather.sunset', "Quyosh botishi", "Қуёш ботиши", "Закат", "Sunset")
t('weather.morning', "Ertalab", "Эрталаб", "Утро", "Morning")
t('weather.noon', "Tushlik", "Тушлик", "День", "Afternoon")
t('weather.evening', "Kechqurun", "Кечқурун", "Вечер", "Evening")
t('weather.today', "Bugun", "Бугун", "Сегодня", "Today")
t('weather.updated', "Yangilangan: {time} · OpenWeatherMap", "Янгиланган: {time} · OpenWeatherMap", "Обновлено: {time} · OpenWeatherMap", "Updated: {time} · OpenWeatherMap")
t('weather.c.clear', "Ochiq osmon", "Очиқ осмон", "Ясно", "Clear")
t('weather.c.partly', "Biroz bulutli", "Бироз булутли", "Малооблачно", "Partly cloudy")
t('weather.c.cloudy', "Bulutli", "Булутли", "Облачно", "Cloudy")
t('weather.c.rain', "Yomg'ir", "Ёмғир", "Дождь", "Rain")
t('weather.c.thunder', "Momaqaldiroq", "Момақалдироқ", "Гроза", "Thunderstorm")
t('weather.c.snow', "Qor", "Қор", "Снег", "Snow")
t('weather.c.mist', "Tuman", "Туман", "Туман", "Mist")
t('weather.noKey', "Ob-havo xizmati sozlanmagan (VITE_OWM_KEY)", "Об-ҳаво хизмати созланмаган (VITE_OWM_KEY)", "Сервис погоды не настроен (VITE_OWM_KEY)", "Weather service is not configured (VITE_OWM_KEY)")

# ---------- namoz ----------
t('prayer.title', "Namoz vaqtlari", "Намоз вақтлари", "Время намаза", "Prayer times")
t('prayer.method', "Aladhan, 13-usul", "Aladhan, 13-усул", "Aladhan, метод 13", "Aladhan, method 13")
t('prayer.next', "Keyingi vaqt", "Кейинги вақт", "Следующий", "Next")
t('prayer.inHM', "{h} soat {m} daqiqadan so'ng", "{h} соат {m} дақиқадан сўнг", "через {h} ч {m} мин", "in {h} h {m} min")
t('prayer.inM', "{m} daqiqadan so'ng", "{m} дақиқадан сўнг", "через {m} мин", "in {m} min")
t('prayer.yesterday', "Kecha", "Кеча", "Вчера", "Yesterday")
t('prayer.today', "Bugun", "Бугун", "Сегодня", "Today")
t('prayer.qibla', "Qiblani aniqlash", "Қиблани аниқлаш", "Определить киблу", "Find the Qibla")
t('prayer.cached', "{month} oyi jadvali saqlangan — internetsiz ishlaydi", "{month} ойи жадвали сақланган — интернетсиз ишлайди",
  "Расписание на {month} сохранено — работает без интернета", "The {month} timetable is saved — works offline")
t('prayer.permission', "Namoz vaqtlarini hisoblash uchun joylashuvga ruxsat bering", "Намоз вақтларини ҳисоблаш учун жойлашувга рухсат беринг",
  "Разрешите доступ к местоположению для расчёта времени намаза", "Allow location access to calculate prayer times")
t('prayer.day', "Kun", "Кун", "День", "Day")
t('prayer.fajr', "Bomdod", "Бомдод", "Фаджр", "Fajr")
t('prayer.sunrise', "Quyosh", "Қуёш", "Восход", "Sunrise")
t('prayer.dhuhr', "Peshin", "Пешин", "Зухр", "Dhuhr")
t('prayer.asr', "Asr", "Аср", "Аср", "Asr")
t('prayer.maghrib', "Shom", "Шом", "Магриб", "Maghrib")
t('prayer.isha', "Xufton", "Хуфтон", "Иша", "Isha")

# ---------- SOS ----------
t('sos.title', "SOS — favqulodda yordam", "SOS — фавқулодда ёрдам", "SOS — экстренная помощь", "SOS — emergency help")
t('sos.subtitle', "Internetsiz ham ishlaydi: raqamlar va vakolatxonalar qurilmada saqlangan", "Интернетсиз ҳам ишлайди: рақамлар ва ваколатхоналар қурилмада сақланган",
  "Работает без интернета: номера и представительства сохранены на устройстве", "Works offline: numbers and missions are stored on your device")
t('sos.emergency', "{country} favqulodda xizmati", "{country} фавқулодда хизмати", "Экстренная служба: {country}", "Emergency service: {country}")
t('sos.emergencyDefault', "Yagona favqulodda raqam (ko'p davlatlarda)", "Ягона фавқулодда рақам (кўп давлатларда)", "Единый экстренный номер (во многих странах)", "Single emergency number (in many countries)")
t('sos.alsoNumbers', "Boshqa raqamlar: {list}", "Бошқа рақамлар: {list}", "Другие номера: {list}", "Other numbers: {list}")
t('sos.nearest', "Eng yaqin vakolatxona", "Энг яқин ваколатхона", "Ближайшее представительство", "Nearest mission")
t('sos.nearestAuto', "Joylashuvingiz bo'yicha avtomatik tanlandi · {km} km", "Жойлашувингиз бўйича автоматик танланди · {km} км",
  "Выбрано автоматически по местоположению · {km} км", "Chosen automatically by your location · {km} km")
t('sos.nearestUnknown', "Joylashuv aniqlanmadi — ro'yxatdan tanlang", "Жойлашув аниқланмади — рўйхатдан танланг",
  "Местоположение не определено — выберите из списка", "Location unknown — choose from the list")
t('sos.shareTitle', "Joylashuvimni yuborish", "Жойлашувимни юбориш", "Отправить моё местоположение", "Send my location")
t('sos.shareText', "Koordinatalar SMS yoki messenjer orqali yaqinlaringizga yuboriladi — server ishtirokisiz",
  "Координаталар SMS ёки мессенжер орқали яқинларингизга юборилади — сервер иштирокисиз",
  "Координаты отправляются близким по SMS или в мессенджере — без участия сервера",
  "Your coordinates are sent to your loved ones by SMS or messenger — no server involved")
t('sos.shareMessage', "Men shu yerdaman: {url}", "Мен шу ердаман: {url}", "Я здесь: {url}", "I am here: {url}")
t('sos.guides', "Vaziyat bo'yicha qisqa yo'riqnoma", "Вазият бўйича қисқа йўриқнома", "Краткие инструкции по ситуациям", "Quick guides by situation")
t('sos.g.doc', "Hujjatim yo'qoldi", "Ҳужжатим йўқолди", "Я потерял документы", "I lost my documents")
t('sos.g.docText', "Mahalliy politsiyaga ariza bering va ma'lumotnoma oling, so'ng yaqin vakolatxonaga murojaat qiling — qaytish guvohnomasi rasmiylashtiriladi.",
  "Маҳаллий полицияга ариза беринг ва маълумотнома олинг, сўнг яқин ваколатхонага мурожаат қилинг — қайтиш гувоҳномаси расмийлаштирилади.",
  "Подайте заявление в местную полицию и получите справку, затем обратитесь в ближайшее представительство — вам оформят свидетельство на возвращение.",
  "Report it to the local police and get a certificate, then contact the nearest mission — they will issue a return certificate.")
t('sos.g.salary', "Ish haqi to'lanmadi", "Иш ҳақи тўланмади", "Мне не платят зарплату", "My wages are unpaid")
t('sos.g.salaryText', "Shartnoma, xabarlar va to'lov dalillarini saqlang. Mahalliy mehnat inspeksiyasiga va vakolatxonaga murojaat qiling.",
  "Шартнома, хабарлар ва тўлов далилларини сақланг. Маҳаллий меҳнат инспекциясига ва ваколатхонага мурожаат қилинг.",
  "Сохраните договор, переписку и подтверждения оплаты. Обратитесь в местную трудовую инспекцию и в представительство.",
  "Keep your contract, messages and proof of payment. Contact the local labour inspectorate and the mission.")
t('sos.g.detained', "Meni ushlab qolishdi", "Мени ушлаб қолишди", "Меня задержали", "I have been detained")
t('sos.g.detainedText', "Vakolatxonaga xabar berilishini va tarjimon so'rashga haqlisiz. Tushunmagan hujjatingizga imzo qo'ymang.",
  "Ваколатхонага хабар берилишини ва таржимон сўрашга ҳақлисиз. Тушунмаган ҳужжатингизга имзо қўйманг.",
  "Вы вправе потребовать уведомить представительство и предоставить переводчика. Не подписывайте документы, которые не понимаете.",
  "You have the right to ask that your mission be informed and to request an interpreter. Do not sign documents you do not understand.")
t('sos.g.medical', "Tibbiy yordam kerak", "Тиббий ёрдам керак", "Нужна медицинская помощь", "I need medical help")
t('sos.g.medicalText', "Favqulodda raqamga qo'ng'iroq qiling. Sug'urta polisingiz va pasportingizni yoningizda saqlang.",
  "Фавқулодда рақамга қўнғироқ қилинг. Суғурта полисингиз ва паспортингизни ёнингизда сақланг.",
  "Позвоните по экстренному номеру. Держите при себе страховой полис и паспорт.",
  "Call the emergency number. Keep your insurance policy and passport with you.")

# ---------- yana ----------
t('more.title', "Yana", "Яна", "Ещё", "More")
t('more.subtitle', "Sozlamalar, loyiha haqida va kelgusi loyihalar", "Созламалар, лойиҳа ҳақида ва келгуси лойиҳалар", "Настройки, о проекте и будущие проекты", "Settings, about and upcoming projects")
t('more.language', "Til", "Тил", "Язык", "Language")
t('more.languageNote', "3 til: o'zbek (lotin — amaldagi va yangi alifbo, kirill), rus, ingliz", "3 тил: ўзбек (лотин — амалдаги ва янги алифбо, кирилл), рус, инглиз",
  "3 языка: узбекский (латиница — действующий и новый алфавит, кириллица), русский, английский", "3 languages: Uzbek (Latin — current and new alphabet, Cyrillic), Russian, English")
t('more.offline', "Oflayn ma'lumotlar", "Офлайн маълумотлар", "Офлайн-данные", "Offline data")
t('more.offPages', "Sahifalar va manbalar", "Саҳифалар ва манбалар", "Страницы и источники", "Pages and sources")
t('more.offPagesNote', "ilova versiyasi bilan", "илова версияси билан", "вместе с версией приложения", "with the app version")
t('more.offEmb', "Vakolatxonalar", "Ваколатхоналар", "Представительства", "Missions")
t('more.offWeather', "Ob-havo", "Об-ҳаво", "Погода", "Weather")
t('more.offPrayer', "Namoz vaqtlari", "Намоз вақтлари", "Время намаза", "Prayer times")
t('more.every7', "har 7 kunda", "ҳар 7 кунда", "каждые 7 дней", "every 7 days")
t('more.every3h', "har 3 soatda", "ҳар 3 соатда", "каждые 3 часа", "every 3 hours")
t('more.monthly', "oylik jadval", "ойлик жадвал", "месячное расписание", "monthly timetable")
t('more.saved', "Saqlangan", "Сақланган", "Сохранено", "Saved")
t('more.notYet', "Hali yo'q", "Ҳали йўқ", "Ещё нет", "Not yet")
t('more.install', "Ilovani o'rnatish", "Иловани ўрнатиш", "Установить приложение", "Install the app")
t('more.installText', "PWA · ro'yxatdan o'tishsiz", "PWA · рўйхатдан ўтишсиз", "PWA · без регистрации", "PWA · no sign-up")
t('more.about', "Loyiha haqida", "Лойиҳа ҳақида", "О проекте", "About the project")
t('more.aboutTitle', "Raqamli dunyoda ma'naviy xavfsizlik: nimalarga e'tibor berish kerak?", "Рақамли дунёда маънавий хавфсизлик: нималарга эътибор бериш керак?",
  "Духовная безопасность в цифровом мире: на что обратить внимание?", "Spiritual safety in the digital world: what to watch for")
t('more.rule1', "Manbaning rasmiyligi — diniy ma'lumotni faqat tasdiqlangan rasmiy sayt va kanallardan oling.", "Манбанинг расмийлиги — диний маълумотни фақат тасдиқланган расмий сайт ва каналлардан олинг.",
  "Официальность источника — получайте религиозную информацию только с проверенных официальных сайтов и каналов.", "Official sources — get religious information only from verified official websites and channels.")
t('more.rule2', "Shubhali chorlovlar — jamiyatdan ajralishga yoki nizoga undovchi materiallar noqonuniy kontent belgisidir.", "Шубҳали чорловлар — жамиятдан ажралишга ёки низога ундовчи материаллар ноқонуний контент белгисидир.",
  "Подозрительные призывы — материалы, побуждающие к отчуждению от общества или конфликту, — признак незаконного контента.", "Suspicious calls — materials urging you to cut yourself off from society or to conflict are a sign of illegal content.")
t('more.rule3', "Ilmiy asos — virtual olamdagi «noma'lum ustozlar»dan ehtiyot bo'ling.", "Илмий асос — виртуал оламдаги «номаълум устозлар»дан эҳтиёт бўлинг.",
  "Научная основа — остерегайтесь «неизвестных наставников» в виртуальном мире.", "Scholarly grounding — beware of “unknown teachers” online.")
t('more.sources', "Ma'lumot manbalari", "Маълумот манбалари", "Источники данных", "Data sources")
t('more.sourcesText', "Oliy sud, data.egov.uz, vaqf.uz, OpenWeatherMap, Aladhan", "Олий суд, data.egov.uz, vaqf.uz, OpenWeatherMap, Aladhan",
  "Верховный суд, data.egov.uz, vaqf.uz, OpenWeatherMap, Aladhan", "Supreme Court, data.egov.uz, vaqf.uz, OpenWeatherMap, Aladhan")
t('more.future', "Kelgusi loyihalar", "Келгуси лойиҳалар", "Будущие проекты", "Upcoming projects")
t('more.soon', "Tez kunda", "Тез кунда", "Скоро", "Coming soon")
t('more.f1', "Til va kasb kurslari", "Тил ва касб курслари", "Языковые и профессиональные курсы", "Language and vocational courses")
t('more.f1t', "Rasmiy kurs va test sahifalariga havolalar", "Расмий курс ва тест саҳифаларига ҳаволалар", "Ссылки на официальные курсы и тесты", "Links to official courses and tests")
t('more.f2', "«Mahalla – Ilova – Xorij»", "«Маҳалла – Илова – Хориж»", "«Махалля – Приложение – Зарубежье»", "“Mahalla – App – Abroad”")
t('more.f2t', "«Onlayn mahalla» bilan bog'lanish, bo'sh ish o'rinlari", "«Онлайн маҳалла» билан боғланиш, бўш иш ўринлари", "Связь с «Онлайн махалля», вакансии", "Link with “Online Mahalla”, job vacancies")
t('more.f3', "Agentliklar reytingi", "Агентликлар рейтинги", "Рейтинг агентств", "Agency ratings")
t('more.f3t', "Litsenziyali xususiy bandlik agentliklari", "Лицензияли хусусий бандлик агентликлари", "Лицензированные частные агентства занятости", "Licensed private employment agencies")
t('more.f4', "Huquqiy va ijtimoiy qo'llanma", "Ҳуқуқий ва ижтимоий қўлланма", "Правовой и социальный справочник", "Legal and social guide")
t('more.f4t', "Davlatlar kesimida: migratsiya, mehnat, sug'urta", "Давлатлар кесимида: миграция, меҳнат, суғурта", "По странам: миграция, труд, страхование", "By country: migration, labour, insurance")
t('more.f5', "Viza tartiblari", "Виза тартиблари", "Визовые правила", "Visa rules")
t('more.f5t', "Davlatlar kesimida rasmiy talablar", "Давлатлар кесимида расмий талаблар", "Официальные требования по странам", "Official requirements by country")
t('more.f6', "Psixologik va tibbiy yordam", "Психологик ва тиббий ёрдам", "Психологическая и медицинская помощь", "Psychological and medical help")
t('more.f6t', "Birinchi yordam, texnika xavfsizligi darslari", "Биринчи ёрдам, техника хавфсизлиги дарслари", "Первая помощь, уроки техники безопасности", "First aid and workplace safety lessons")
t('more.f7', "Qaytganlar markazi", "Қайтганлар маркази", "Центр для вернувшихся", "Returnee centre")
t('more.f7t', "Staj reestri, ish va imtiyozli kreditlar", "Стаж реестри, иш ва имтиёзли кредитлар", "Реестр стажа, работа и льготные кредиты", "Work-record registry, jobs and soft loans")
t('more.f8', "Yoshlar mobilligi", "Ёшлар мобиллиги", "Молодёжная мобильность", "Youth mobility")
t('more.f8t', "Grant va akademik dasturlar", "Грант ва академик дастурлар", "Гранты и академические программы", "Grants and academic programmes")
t('more.basis', "O'zbekiston Respublikasi Din ishlari bo'yicha qo'mitasining 2025-yil 18-dekabrdagi 03-07/8139-son xulosasi asosida tayyorlandi",
  "Ўзбекистон Республикаси Дин ишлари бўйича қўмитасининг 2025 йил 18 декабрдаги 03-07/8139-сон хулосаси асосида тайёрланди",
  "Подготовлено на основании заключения Комитета по делам религий Республики Узбекистан № 03-07/8139 от 18 декабря 2025 года",
  "Prepared on the basis of Conclusion No. 03-07/8139 of the Committee on Religious Affairs of the Republic of Uzbekistan dated 18 December 2025")
t('more.version', "Versiya {app} · ma'lumotlar {data}", "Версия {app} · маълумотлар {data}", "Версия {app} · данные {data}", "Version {app} · data {data}")
t('more.yangiNote', "Özbekça — 2027-yil 22-apreldan kuchga kiradigan yangi lotin alifbosi", "Özbekça — 2027 йил 22 апрелдан кучга кирадиган янги лотин алифбоси",
  "Özbekça — новый латинский алфавит, вступающий в силу 22 апреля 2027 года", "Özbekça — the new Latin alphabet taking effect on 22 April 2027")

# ---------- sana ----------
months = {
 'L': "yanvar fevral mart aprel may iyun iyul avgust sentabr oktabr noyabr dekabr".split(),
 'C': "январь февраль март апрель май июнь июль август сентябрь октябрь ноябрь декабрь".split(),
 'R': "января февраля марта апреля мая июня июля августа сентября октября ноября декабря".split(),
 'E': "January February March April May June July August September October November December".split(),
}
monthsNom = {
 'L': months['L'], 'C': months['C'],
 'R': "январь февраль март апрель май июнь июль август сентябрь октябрь ноябрь декабрь".split(),
 'E': months['E'],
}
weekdays = {  # 0 = yakshanba
 'L': ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"],
 'C': ["Якшанба", "Душанба", "Сешанба", "Чоршанба", "Пайшанба", "Жума", "Шанба"],
 'R': ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
 'E': ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
}
hijri = {
 'L': ["Muharram", "Safar", "Rabiul avval", "Rabiul oxir", "Jumodul avval", "Jumodul oxir", "Rajab", "Sha'bon", "Ramazon", "Shavvol", "Zulqa'da", "Zulhijja"],
 'C': ["Муҳаррам", "Сафар", "Рабиул аввал", "Рабиул охир", "Жумодул аввал", "Жумодул охир", "Ражаб", "Шаъбон", "Рамазон", "Шаввол", "Зулқаъда", "Зулҳижжа"],
 'R': ["Мухаррам", "Сафар", "Раби аль-авваль", "Раби ас-сани", "Джумада аль-уля", "Джумада ас-сания", "Раджаб", "Шаабан", "Рамадан", "Шавваль", "Зуль-када", "Зуль-хиджа"],
 'E': ["Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani", "Jumada al-Ula", "Jumada al-Akhira", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qa'dah", "Dhu al-Hijjah"],
}
dateFmt = {'L': "{year}-yil {day}-{month}", 'C': "{year} йил {day} {month}", 'R': "{day} {month} {year} г.", 'E': "{day} {month} {year}"}
shortFmt = {'L': "{day}-{month}", 'C': "{day} {month}", 'R': "{day} {month}", 'E': "{day} {month}"}

# davlatlar (SOS favqulodda raqamlari uchun)
countries = {
 'RU': ("Rossiya", "Россия", "Россия", "Russia"), 'KZ': ("Qozog'iston", "Қозоғистон", "Казахстан", "Kazakhstan"),
 'TR': ("Turkiya", "Туркия", "Турция", "Türkiye"), 'KR': ("Janubiy Koreya", "Жанубий Корея", "Южная Корея", "South Korea"),
 'DE': ("Germaniya", "Германия", "Германия", "Germany"), 'GB': ("Buyuk Britaniya", "Буюк Британия", "Великобритания", "United Kingdom"),
 'PL': ("Polsha", "Польша", "Польша", "Poland"), 'AE': ("BAA", "БАА", "ОАЭ", "UAE"), 'US': ("AQSh", "АҚШ", "США", "USA"),
 'JP': ("Yaponiya", "Япония", "Япония", "Japan"), 'AT': ("Avstriya", "Австрия", "Австрия", "Austria"), 'AZ': ("Ozarbayjon", "Озарбайжон", "Азербайджан", "Azerbaijan"),
 'BY': ("Belarus", "Беларусь", "Беларусь", "Belarus"), 'CN': ("Xitoy", "Хитой", "Китай", "China"), 'IT': ("Italiya", "Италия", "Италия", "Italy"),
 'SK': ("Slovakiya", "Словакия", "Словакия", "Slovakia"), 'QA': ("Qatar", "Қатар", "Катар", "Qatar"),
}

def build():
    src = {'uz-latn': {}, 'uz-cyrl': {}, 'ru': {}, 'en': {}}
    for k in L:
        typo = lambda x: x.replace("'", '\u2019')
        src['uz-latn'][k] = lat(L[k]); src['uz-cyrl'][k] = typo(C[k]); src['ru'][k] = typo(R[k]); src['en'][k] = typo(E[k])
    for code, key in [('uz-latn', 'L'), ('uz-cyrl', 'C'), ('ru', 'R'), ('en', 'E')]:
        conv = lat if key == 'L' else (lambda x: x.replace("'", '\u2019'))
        src[code]['@months'] = [conv(x) for x in months[key]]
        src[code]['@monthsNom'] = [conv(x) for x in monthsNom[key]]
        src[code]['@weekdays'] = [conv(x) for x in weekdays[key]]
        src[code]['@hijri'] = [conv(x) for x in hijri[key]]
        src[code]['@date'] = dateFmt[key]
        src[code]['@dateShort'] = shortFmt[key]
        idx = {'L': 0, 'C': 1, 'R': 2, 'E': 3}[key]
        src[code]['@countries'] = {c: conv(v[idx]) for c, v in countries.items()}
    y = {}
    for k, v in src['uz-latn'].items():
        if isinstance(v, str): y[k] = yangi(v)
        elif isinstance(v, list): y[k] = [yangi(x) for x in v]
        elif isinstance(v, dict): y[k] = {a: yangi(b) for a, b in v.items()}
    y['@date'] = src['uz-latn']['@date']
    out = {
        'version': '2026.11.09',
        'default': 'uz-latn',
        'languages': {
            'uz-latn': {'label': 'Oʻzbekcha', 'short': 'UZ', 'htmlLang': 'uz-Latn'},
            'uz-cyrl': {'label': 'Ўзбекча', 'short': 'ЎЗ', 'htmlLang': 'uz-Cyrl'},
            'uz-yangi': {'label': 'Özbekça', 'short': 'ÖZ', 'htmlLang': 'uz-Latn', 'derivedFrom': 'uz-latn'},
            'ru': {'label': 'Русский', 'short': 'RU', 'htmlLang': 'ru'},
            'en': {'label': 'English', 'short': 'EN', 'htmlLang': 'en'},
        },
        'strings': {'uz-latn': src['uz-latn'], 'uz-cyrl': src['uz-cyrl'], 'uz-yangi': y, 'ru': src['ru'], 'en': src['en']},
    }
    return out

if __name__ == '__main__':
    data = build()
    path = sys.argv[1] if len(sys.argv) > 1 else 'public/data/i18n.json'
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print('keys:', len(data['strings']['uz-latn']), '->', path)
