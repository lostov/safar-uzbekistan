/*if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/safar-uzbekistan/sw.js')
            .then(reg => console.log('SW ro\'yxatdan o\'tdi!', reg))
            .catch(err => console.log('SW xatosi:', err));
    });
}*/

if ('serviceWorker' in navigator) {
    let refreshing = false;
    
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            window.location.reload();
            refreshing = true;
        }
    });

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => {
                console.log('SW ro\'yxatdan o\'tdi');
                reg.onupdatefound = () => {
                    const installingWorker = reg.installing;
                    installingWorker.onstatechange = () => {
                        if (installingWorker.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                console.log('Yangi versiya tayyor, sahifa yangilanmoqda...');
                            }
                        }
                    };
                };
            })
            .catch(err => console.error('SW xatosi:', err));
    });
}

"use strict";

Object.defineProperty(String.prototype, 'ucfirst', {
  value: function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false
});

Object.defineProperty(String.prototype, 'formatTemplate', {
    value: function(data = {}) {
        return this.replace(/\\([{}])|{([^}]+)}/g, (match, escapedChar, key) => {
            if (escapedChar) {
                return escapedChar;
            }

            return (key in data) ? data[key] : "";
        });
    },
    enumerable: true,
    configurable: true,
    writable: true
});

const tabHome = 'home';
const tabWeather = 'weather';
const tabNamaz = 'namaz';
const tabMore = 'more';
const mainHome = document.querySelector('body > nav.nav-bottom > div.container > div.main-bottom-navbar > a:nth-child(1)');
const mainWeather = document.querySelector('body > nav.nav-bottom > div.container > div.main-bottom-navbar > a:nth-child(2)');
const mainNamaz = document.querySelector('body > nav.nav-bottom > div.container > div.main-bottom-navbar > a:nth-child(3)');
const mainMore = document.querySelector('body > nav.nav-bottom > div.container > div.main-bottom-navbar > a:nth-child(4)');
const embassyConfig = {
    baseUrl: "https://data.egov.uz/apiData/MainData/GetByFile?id=6107cb7d2a2e256d868e86ac&fileType=1&tableType=2",
    languages: {
        'oz': 1, // O'zbek lotin
        'uz': 2, // O'zbek kirill (API-da lang=2 bo'lishi mumkin)
        'ru': 3, // Rus tili
        'en': 4  // Ingliz tili
    },
    storagePrefix: "safar_embassy_"
};
const embassySyncKey = "safar_embassy_last_sync";

const obHavoKaliti = "679dc7ab6c8dc63f3c6d18df7b1adb6b";
const weatherCacheKey = "safar_weather_last_sync";

const namazCacheKey = "safar_namaz_last_sync";
const namazKaliti = "7856bb23137de0ad8b50d3808d40d2f0"

const translations = {
    "oz": { // O'zbek lotin
        "nav_home": "Bosh sahifa",
        "nav_weather": "Ob-havo",
        "nav_namaz": "Namoz",
        "nav_more": "Yana",

        "brand_title": "Xorijga chiqayotgan fuqarolar uchun <br> diniy-ma'rifiy tavsiyalar",
        "brand_quote": "Кim ogoh bo‘lsa, najot topadi. Kim g‘ofil bo‘lsa, halok bo‘ladi.",
        "brand_quote_author": "Abdulloh ibn <cite title=\"Muborak\">Muborak</cite>",

        "main_annotation": "Xorijda vaqtincha yashab mehnat qilayotgan fuqarolar hamda talabalarda uchraydigan diniy-ma’rifiy savollarga javob topish, turli radikal g‘oyalar ta’siriga tushib qolishning oldini olish, «Vaqf» xayriya jamoat fondiga ehson qilish, shuningdek xorijdagi diplomatik vakolatxonalar bilan bog‘lanish imkoniyatini beradi. Unda O‘zbekiston musulmonlar idorasi tasarrufidagi butunjahon Internet tarmog‘ida faoliyat olib boruvchi rasmiy veb-sayt va ijtimoiy tarmoqlar sahifalari hamda ularning elektron havolalari foydalanuvchilarga yengillik yaratish maqsadida ilova qilinmoqda.",
        "main_annotation_url": "https://lex.uz/docs/-5491534",

        "official_links_title": "Rasmiy veb-sayt va kanallar",
        "official_links_item1": "O‘zbekiston Respublikasi Din ishlari bo‘yicha qo‘mitasining ijtimoiy tarmoqlari",
        "official_links_item2": "O‘zbekiston musulmonlari idorasi rasmiy veb-portallari",
        "official_links_item2_label1": "Foydali va ishonchli ‌saytlar, ijtimoiy tarmoqlar",
        "official_links_item2_label2": "O‘zbekiston musulmonlari idorasi MUSLIM.UZ portali",
        "official_links_item3": "O‘zbekiston musulmonlari idorasi Fatvo markazi",
        "official_links_item4": "Ilmiy ta’lim muassasalari to‘g‘risida ma’lumotlar",
        "official_links_item4_label1": "O‘zbekiston xalqaro <strong>Islomshunoslik akademiyasi</strong> rasmiy kanali",
        "official_links_item4_label2": "<strong>Toshkent Islom instituti</strong> rasmiy kanali",
        "official_links_item4_label3": "O‘zbekiston musulmonlari idorasi tasarrufidagi <strong>Hadis</strong> ilmi maktabi (instituti) rasmiy kanali",
        "official_links_item4_label4": "<strong>Mir Arab</strong> oliy madrasasining rasmiy kanali",
        "official_links_item5": "Xalqaro ilmiy-tadqiqot markazlari",
        "official_links_item5_label1": "<strong>Imom Buxoriy</strong> xalqaro ilmiy-tadqiqot markazi rasmiy kanali",
        "official_links_item5_label2": "<strong>Imom Moturidiy</strong> xalqaro ilmiy-tadqiqot markazi rasmiy kanali",
        "official_links_item5_label3": "<strong>Imom Termiziy</strong> o‘rta maxsus islom ta’lim muassasasi rasmiy kanali",
        "official_links_item5_label4": "<strong>Islom sivilizatsiyasi</strong> markazi rasmiy kanali",
        
        "double_tap_link_note": "Havolani ikki marta bosing, u yangi oynada ochiladi",

        "not_allowed_title": "⚖️ O‘zbekiston Respublikasi Oliy sudi tomonidan internet jahon tarmog‘idagi diniy ekstremistik, terroristik va aqidaparastlik g‘oyalari bilan yo‘g‘rilgan deb topilgan hamda Respublika hududiga olib kirish, tayyorlash, saqlash, tarqatish va namoyish etilishi taqiqlangan manba va kontentlar (materiallar) ro‘yxati",
        "not_allowed_title_lastdate": "📆 <cite title=\"2026-yil 6-aprel\">2026-yil 6-aprel</cite> holatiga ko‘ra",
        "not_allowed_item1": "Internet manbalar ro‘yxati",
        "not_allowed_item1_label1": "<strong>PDF</strong> fayl",
        "not_allowed_item1_label2": "<strong>Telegram</strong> havola",
        "not_allowed_item2": "Huquqiy oqibatlari",
        "not_allowed_item2_label1": "<strong>244<sup>1</sup>-modda.</strong> Jamoat xavfsizligi va jamoat tartibiga tahdid soladigan materiallarni tayyorlash, saqlash, tarqatish yoki namoyish etish",

        "brand_embassy": "O‘zbekiston Respublikasining xorijdagi diplomatik vakolatxonalari <button data-bs-toggle=\"modal\" data-bs-target=\"#safarModalEmbassy\" class=\"btn text-white btn-link\">ro‘yxatni ko‘rish <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" fill=\"currentColor\" viewBox=\"0 0 16 16\"><path fill-rule=\"evenodd\" d=\"M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5\"/><path fill-rule=\"evenodd\" d=\"M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z\"/></svg></button>",
        "brand_embassy_picture": "images/embassy_oz.png",
        "brand_embassy_data_url": "https://data.egov.uz/apiData/MainData/GetByFile?id=6107cb7d2a2e256d868e86ac&fileType=1&tableType=2&lang=1",
        "brand_embassy_modal_title": "O‘zbekiston Respublikasining xorijdagi diplomatik vakolatxonalari",
        "brand_embassy_modal_close": "Ortga qaytish",

        "vaqf_charity_title": "“Vaqf” xayriya jamoat fondi",
        "vaqf_charity_text": "Ehsonning mukofoti faqat ehsondir",

        "weather_title": "Haftalik ob-havo",
        "weather_sun_rise_set": "<strong>Quyosh</strong>: chiqishi 🌄 <span class=\"icon-sunrise\">{sunrise}</span> | botishi 🌆 <span class=\"icon-sunset\">{sunset}</span>",
        "weather_morning": "Ertalab",   
        "weather_lunch": "Tushlik",
        "weather_evening": "Kechqurun",
        "weather_date": " {month}",
        "weather_permission_title": "Ob-havoni ko'rish uchun ruxsat bering:",
        "weather_permission_button": "Aniqlash va Yangilash",

        "monday": "Dushanba", "tuesday": "Seshanba", "wednesday": "Chorshanba", "thursday": "Payshanba", "friday": "Juma", "saturday": "Shanba", "sunday": "Yakshanba",
        "jan": "Yan", "feb": "Fev", "mar": "Mar", "apr": "Apr", "may": "May", "jun": "Iyun", "jul": "Iyul", "aug": "Avg", "sep": "Sen", "oct": "Okt", "nov": "Noy", "dec": "Dek", 

        "owner_title": "«Safar Uzbekistan» loyihasi haqida",
        "owner_content_title": "Raqamli dunyoda ma’naviy xavfsizlik: Nimalarga e’tibor berish kerak?",
        "owner_content_intro": "Internet — faqat axborot maydoni emas, balki katta mas’uliyat maydoni hamdir. Bugungi kunda «diniy niqob» ostidagi noqonuniy kontentlar milliy segmentimizga kirib kelib, yoshlar ongini zaharlashga urinmoqda.",
        "owner_content_pre_list": "Bilishingiz shart:",
        "owner_content_list": "<ul><li><strong>Manbaning rasmiyligi:</strong> Diniy ma’lumotlarni faqat O‘zbekiston musulmonlari idorasi tomonidan tasdiqlangan va davlat ro‘yxatidan o‘tgan rasmiy sayt hamda kanallardan oling.</li><li><strong>Shubhali chorlovlar:</strong> Sizni jamiyatdan ajralishga, nizo chiqarishga yoki noma’lum shaxslarga ergashishga chorlovchi audio va video materiallar noqonuniy kontent belgisidir.</li><li><strong>Ilmiy asos:</strong> Har qanday diniy fatvo yoki ko‘rsatma jonli ilm va rasmiy ijozatga ega bo‘lishi kerak. Virtual olamdagi «noma’lum ustozlar»dan ehtiyot bo‘ling!</li></ul>",
        "owner_content_about": "Ushbu platformadagi xavfsizlik bo‘yicha tavsiyalar bevosita quyidagi ilmiy ish doirasida ishlab chiqilgan va taqdim etilgan:",
        "owner_content_about_list": "<ul><li>Ilmiy ish mavzusi: <strong>«Internetning milliy segmentida noqonuniy kontentlarga qarshi kurash mexanizmlarini takomillashtirish»</strong></li><li>Ilmiy maslahatchi: <strong>Iqtisodiyot fanlari doktori (DSc), Professor Zoxidov Azamatjon A’zamovich</strong></li><li>Ilmiy tadqiqotchi: Mustaqil izlanuvchi <strong>(PhD) Otaqo‘ziyev Ma’murjon Munavvarjon</strong>.</li><li>Ilmiy rahbar: <strong>P.f.f.d (PhD), dotsent Tuxtamatov Xasan Rixsibayevich</strong>.</li></ul>",
        "owner_content_about_after": "Tadqiqotning maqsadi — milliy internet hududimizni yot va zararli g‘oyalardan himoya qilishning zamonaviy va texnologik usullarini joriy etish orqali jamiyat barqarorligini ta’minlashdir.",
        "more_resource_item_not_allow": "⚠️ <strong>Taqiqlangan resurslar ro‘yxati</strong> (Oliy sud qaroriga ko‘ra - <cite title=\"2026-yil 6-aprel\">2026-yil 6-aprel</cite>) <button class='badge bg-dark d-block mt-1'>🔗 havola</button>",
        "more_resource_item_embassy": "⚖️ <strong>Diplomatik vakolatxonalar</strong> (Ochiq ma’lumotlar portali) <button class='badge bg-dark d-block mt-1'>🔗 havola</button>",
        "more_resource_item_vaqf": "🕋 <strong>«Vaqf» xayriya jamoat fondiga</strong> ehson qilish <button class='badge bg-dark d-block mt-1'>🔗 havola</button>",
        "more_resource_item_weather": "⛅️ <strong>«Ob-havo»</strong> ma’lumotlari «OpenWeatherMap» xizmati tomonidan taqdim etilmoqda <button class='badge bg-dark d-block mt-1'>🔗 havola</button>",
        "more_resource_item_namaz": "🕔 <strong>Namozi vaqtlari</strong> «Al Adhan Service» tarmog‘i ma’lumotlari asosida tayyorlandi <button class='badge bg-dark d-block mt-1'>🔗 havola</button>",
        "more_notice": "O‘zbekiston Respublikasi Din ishlari bo‘yicha qo‘mitasining <br>2025-yil 18-dekabrdagi 03-07/8139 sonli xulosasi asosida tayyorlandi",
        "btn_install_pwa": "Ilovani o‘rnatish (PWA)",

        "btn_fatvo": "Fatvo markazi",
        "btn_vaqf": "Vaqf fondi",
        "footer_note": "O‘zbekiston Respublikasi Din ishlari bo‘yicha qo‘mitasining xulosasi asosida tayyorlandi.",
        "footer_date": "Ma’lumotlar 2026-yil 6-aprel holatiga ko‘ra yangilangan."
    },
    "uz": { // O'zbek kirill
        "nav_home": "Бош саҳифа",
        "nav_weather": "Об-ҳаво",
        "nav_namaz": "Намоз",
        "nav_more": "Яна",

        "brand_title": "Хорижга чиқаётган фуқаролар учун <br> диний-маърифий тавсиялар",
        "brand_quote": "Ким огоҳ бўлса, нажот топади. Ким ғофил бўлса, ҳалок бўлади.",
        "brand_quote_author": "Абдуллоҳ ибн <cite title=\"Муборак\">Муборак</cite>",

        "main_annotation": "Хорижда вақтинча яшаб меҳнат қилаётган фуқаролар ҳамда талабаларда учрайдиган диний-маърифий саволларга жавоб топиш, турли радикал ғоялар таъсирига тушиб қолишнинг олдини олиш, «Vaqf» хайрия жамоат фондига эҳсон қилиш, шунингдек хориждаги дипломатик ваколатхоналар билан боғланиш имкониятини беради. Унда Ўзбекистон мусулмонлар идораси тасарруфидаги бутунжаҳон Интернет тармоғида фаолият олиб борувчи расмий веб-сайт ва ижтимоий тармоқлар саҳифалари ҳамда уларнинг электрон ҳаволалари фойдаланувчиларга енгиллик яратиш мақсадида илова қилинмоқда.",
        "main_annotation_url": "https://lex.uz/docs/5491534",

        "official_links_title": "Расмий веб-сайт ва каналлар",
        "official_links_item1": "Ўзбекистон Республикаси Дин ишлари бўйича қўмитасининг ижтимоий тармоқлари",
        "official_links_item2": "Ўзбекистон мусулмонлари идораси расмий веб-порталлари",
        "official_links_item2_label1": "Фойдали ва ишончли ‌сайтлар, ижтимоий тармоқлар",
        "official_links_item2_label2": "Ўзбекистон мусулмонлари идораси MUSLIM.UZ портали",
        "official_links_item3": "Ўзбекистон мусулмонлари идораси Фатво маркази",
        "official_links_item4": "Илмий таълим муассасалари тўғрисида маълумотлар",
        "official_links_item4_label1": "O‘zbekiston халқаро <strong>Islomshunoslik akademiyasi</strong> rasmiy kanali",
        "official_links_item4_label2": "<strong>Toshkent Islom instituti</strong> rasmiy kanali",
        "official_links_item4_label3": "Ўзбекистон мусулмонлари идораси тасарруфидаги <стронг>Ҳадис</стронг> илми мактаби (институти) расмий канали",
        "official_links_item4_label4": "<strong>Mir Arab</strong> oliy madrasasining rasmiy kanali",
        "official_links_item5": "Халқаро илмий-тадқиқот марказлари",
        "official_links_item5_label1": "<strong>Имом Бухорий</strong> халқаро илмий-тадқиқот маркази расмий канали",
        "official_links_item5_label2": "<strong>Имом Мотуридий</strong> халқаро илмий-тадқиқот маркази расмий канали",
        "official_links_item5_label3": "<strong>Имом Термизий</strong> ўрта махсус ислом таълим муассасаси расмий канали",
        "official_links_item5_label4": "<strong>Ислом сивилизацияси</strong> маркази расмий канали",

        "double_tap_link_note": "Ҳаволани икки марта босинг, у янги ойнада очилади",

        "not_allowed_title": "⚖️ Ўзбекистон Республикаси Олий суди томонидан интернет жаҳон тармоғидаги диний экстремистик, террористик ва ақидапарастлик ғоялари билан йўғрилган деб топилган ҳамда Республика ҳудудига олиб кириш, тайёрлаш, сақлаш, тарқатиш ва намойиш этилиши тақиқланган манба ва контентлар (материаллар) рўйхати",
        "not_allowed_title_lastdate": "📆 <cite title=\"2026-yil 6-aprel\">2026-йил 6 апрель</cite> ҳолатига кўра",
        "not_allowed_item1": "Интернет манбалар рўйхати",
        "not_allowed_item1_label1": "<strong>PDF</strong> файл",
        "not_allowed_item1_label2": "<strong>Telegram</strong> ҳавола",
        "not_allowed_item2": "Ҳуқуқий оқибатлари",
        "not_allowed_item2_label1": "<strong>244<sup>1</sup>-модда.</strong> Жамоат хавфсизлиги ва жамоат тартибига таҳдид соладиган материалларни тайёрлаш, сақлаш, тарқатиш ёки намойиш этиш",

        "brand_embassy": "Ўзбекистон Республикасининг хориждаги дипломатик ваколатхоналари <button data-bs-toggle=\"modal\" data-bs-target=\"#safarModalEmbassy\" class=\"btn text-white btn-link\">рўйхатни кўриш <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" fill=\"currentColor\" viewBox=\"0 0 16 16\"><path fill-rule=\"evenodd\" d=\"M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5\"/><path fill-rule=\"evenodd\" d=\"M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z\"/></svg></button>",
        "brand_embassy_picture": "images/embassy_uz.png",
        "brand_embassy_data_url": "https://data.egov.uz/apiData/MainData/GetByFile?id=6107cb7d2a2e256d868e86ac&fileType=1&tableType=2&lang=2",
        "brand_embassy_modal_title": "Ўзбекистон Республикасининг хориждаги дипломатик ваколатхоналари",
        "brand_embassy_modal_close": "Ортга қайтиш",

        "vaqf_charity_title": "«Vaqf» хайрия жамоат фонди",
        "vaqf_charity_text": "Эҳсоннинг мукофоти фақат эҳсондир",

        "weather_title": "Ҳафталик об-ҳаво",
        "weather_sun_rise_set": "<strong>Қуёш</strong>: чиқиши 🌄 <span class=\"icon-sunrise\">{sunrise}</span> | ботиши 🌆 <span class=\"icon-sunset\">{sunset}</span>",
        "weather_morning": "Эрталаб",
        "weather_lunch": "Тушлик",
        "weather_evening": "Кечқурун",
        "weather_date": " {month}",
        "weather_permission_title": "Об-ҳавони кўриш учун рухсат беринг:",
        "weather_permission_button": "Аниқлаш ва Янгилаш",

        "monday": "Душанба", "tuesday": "Сешанба", "wednesday": "Чоршанба", "thursday": "Пайшанба", "friday": "Жума", "saturday": "Шанба", "sunday": "Якшанба",
        "jan": "Янв", "feb": "Фев", "mar": "Мар", "apr": "Апр", "may": "Май", "jun": "Июн", "jul": "Июл", "aug": "Авг", "sep": "Сент", "oct": "Окт", "nov": "Ноя", "dec": "Дек",

        "owner_title": "«Safar Uzbekistan» лойиҳаси ҳақида",
        "owner_content_title": "Рақамли дунёда маънавий хавфсизлик: Нималарга эътибор бериш керак?",
        "owner_content_intro": "Интернет — фақат ахборот майдони эмас, балки катта масъулият майдони ҳамдир. Бугунги кунда «диний ниқоб» остидаги ноқонуний контентлар миллий сегментимизга кириб келиб, ёшлар онгини заҳарлашга уринмоқда.",
        "owner_content_pre_list": "Билишингиз шарт:",
        "owner_content_list": "<ul><li><strong>Манбанинг расмийлиги:</strong> Диний маълумотларни фақат Ўзбекистон мусулмонлари идораси томонидан тасдиқланган ва давлат рўйхатидан ўтган расмий сайт ҳамда каналлардан олинг.</li><li><strong>Шубҳали чорловлар:</strong> Сизни жамиятдан ажралишга, низо чиқаришга ёки номаълум шахсларга эргашишга чорловчи аудио ва видео материаллар ноқонуний контент белгисидир.</li><li><strong>Илмий асос:</strong> Ҳар қандай диний фатво ёки кўрсатма жонли илм ва расмий ижозатга эга бўлиши керак. Виртуал оламдаги «номаълум устозлар»дан эҳтиёт бўлинг!</li></ul>",
        "owner_content_about": "Ушбу платформадаги хавфсизлик бўйича тавсиялар бевосита қуйидаги илмий иш доирасида ишлаб чиқилган ва тақдим этилган:",
        "owner_content_about_list": "<ul><li>Илмий иш мавзуси: <strong>«Интернетнинг миллий сегментида ноқонуний контентларга қарши кураш механизмларини такомиллаштириш»</strong></li><li>Илмий маслаҳатчи: <strong>Иқтисодиёт фанлари доктори (DSc), Профессор Зохидов Азаматжон Аъзамович</strong></li><li>Илмий тадқиқотчи: Мустақил изланувчи <strong>(PhD) Отақўзиев Маъмуржон Мунавваржон</strong>.</li><li>Илмий раҳбар: <strong>П.ф.ф.д (PhD), доцент Тухтаматов Хасан Рихсибаевич</strong>.</li></ul>",
        "owner_content_about_after": "Тадқиқотнинг мақсади — миллий интернет ҳудудимизни ёт ва зарарли ғоялардан ҳимоя қилишнинг замонавий ва технологик усулларини жорий этиш орқали жамият барқарорлигини таъминлашдир.",
        "more_resource_item_not_allow": "⚠️ <strong>Тақиқланган ресурслар рўйхати</strong> (Олий суд қарорига кўра - <cite title=\"2026-йил 6 апрель\">2026-йил 6 апрель</cite>) <button class='badge bg-dark d-block mt-1'>🔗 ҳавола</button>",
        "more_resource_item_embassy": "⚖️ <strong>Дипломатик ваколатхоналар</strong> (Очиқ маълумотлар портали) <button class='badge bg-dark d-block mt-1'>🔗 ҳавола</button>",
        "more_resource_item_vaqf": "🕋 <strong>«Вақф» хайрия жамоат фондига</strong> эҳсон қилиш <button class='badge bg-dark d-block mt-1'>🔗 ҳавола</button>",
        "more_resource_item_weather": "⛅️ <strong>«Об-ҳаво»</strong> маълумотлари «OpenWeatherMap» хизмати томонидан тақдим этилмоқда <button class='badge bg-dark d-block mt-1'>🔗 ҳавола</button>",
        "more_resource_item_namaz": "🕔 <strong>Намоз вақтлари</strong> «Al Adhan Service» тармоғи маълумотлари асосида тайёрланди <button class='badge bg-dark d-block mt-1'>🔗 ҳавола</button>",
        "more_notice": "Ўзбекистон Республикаси Дин ишлари бўйича қўмитасининг <br>2025 йил 18 декабрдаги 03-07/8139 сонли хулосаси асосида тайёрланди",
        "btn_install_pwa": "Иловани ўрнатиш (PWA)",

        "btn_fatvo": "Фатво маркази",
        "btn_vaqf": "Вақф фонди",
        "footer_note": "Ўзбекистон Республикаси Дин ишлари бўйича қўмитасининг хулосаси асосида тайёрланди.",
        "footer_date": "Маълумотлар 2026 йил 6 апрель ҳолатига кўра янгиланган."
    },
    "ru": { // Rus tili
        "nav_home": "Главная",
        "nav_weather": "Погода",
        "nav_namaz": "Намаз",
        "nav_more": "Ещё",

        "brand_title": "Религиозно-просветительские рекомендации <br> для граждан, выезжающих за рубеж",
        "brand_quote": "Кто бдителен, тот найдет спасение. Кто небрежен, тот погибнет.",
        "brand_quote_author": "Абдуллах ибн <cite title=\"Мубарак\">Мубарак</cite>",

        "main_annotation": "Это приложение предоставляет возможность гражданам и студентам, временно проживающим и работающим за рубежом, находить ответы на религиозно-просветительские вопросы, предотвращать влияние различных радикальных идей, вносить пожертвования в благотворительный общественный фонд «Vaqf», а также связываться с дипломатическими представительствами за рубежом. Для удобства пользователей в приложении представлены официальные веб-сайты и страницы в социальных сетях Управления мусульман Узбекистана, функционирующие во всемирной сети Интернет, а также их электронные ссылки.",
        "main_annotation_url": "https://lex.uz/docs/5491541",

        "official_links_title": "Официальные сайты и каналы",
        "official_links_item1": "Социальные сети Комитета по делам религий Республики Узбекистан",
        "official_links_item2": "Официальные веб-порталы Управления мусульман Узбекистана",
        "official_links_item2_label1": "Полезные и надежные сайты, социальные сети",
        "official_links_item2_label2": "Портал Мусульманского управления Узбекистана MUSLIM.UZ",
        "official_links_item3": "Центр фетв Управления мусульман Узбекистана",
        "official_links_item4": "Информация о научных образовательных учреждениях",
        "official_links_item4_label1": "Официальный канал Международной <strong>Академии исламоведения Узбекистана</strong>",
        "official_links_item4_label2": "Официальный канал <strong>Ташкентского Исламского Института</strong>",
        "official_links_item4_label3": "Официальный канал <strong>Школы хадисоведения</strong> (института) при Управлении мусульман Узбекистана",
        "official_links_item4_label4": "Официальный канал Высшего медресе <strong>Мир Араб</strong>",
        "official_links_item5": "Международные исследовательские центры",
        "official_links_item5_label1": "Официальный канал Международного научно-исследовательского центра <strong>Имам Бухари</strong>",
        "official_links_item5_label2": "Официальный канал Международного научно-исследовательского центра <strong>Имам Матуриди</strong>",
        "official_links_item5_label3": "Официальный канал среднего специального исламского учебного заведения <strong>Имам Термизи</strong>",
        "official_links_item5_label4": "Официальный канал <strong>Центра исламской цивилизации</strong> в Узбекистане",

        "double_tap_link_note": "Дважды нажмите на ссылку, она откроется в новом окне",

        "not_allowed_title": "⚖️ Перечень источников и контента (материалов) во всемирной сети Интернет, признанных Верховным судом Республики Узбекистан содержащими идеи религиозного экстремизма, терроризма и фундаментализма, запрещенных к ввозу, изготовлению, хранению, распространению и демонстрации на территории Республики",
        "not_allowed_title_lastdate": "По состоянию на <cite title=\"6 апреля 2026 года\">6 апреля 2026 года</cite>","not_allowed_item1": "Список интернет-ресурсов",
        "not_allowed_item1_label1": "Файл <strong>PDF</strong>",
        "not_allowed_item1_label2": "Ссылка в <strong>Telegram</strong>",
        "not_allowed_item2": "Юридические последствия",
        "not_allowed_item2_label1": "<strong>Статья 244<sup>1</sup>.</strong> Изготовление, хранение, распространение или демонстрация материалов, содержащих угрозу общественной безопасности и общественному порядку",

        "brand_embassy": "Дипломатические представительства Республики Узбекистан за рубежом <button data-bs-toggle=\"modal\" data-bs-target=\"#safarModalEmbassy\" class=\"btn text-white btn-link\">просмотр списка <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" fill=\"currentColor\" viewBox=\"0 0 16 16\"><path fill-rule=\"evenodd\" d=\"M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5\"/><path fill-rule=\"evenodd\" d=\"M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z\"/></svg></button>",
        "brand_embassy_picture": "images/embassy_ru.png",
        "brand_embassy_data_url": "https://data.egov.uz/apiData/MainData/GetByFile?id=6107cb7d2a2e256d868e86ac&fileType=1&tableType=2&lang=3",
        "brand_embassy_modal_title": "Диппредставительства Республики Узбекистан за рубежом",
        "brand_embassy_modal_close": "Назад",

        "vaqf_charity_title": "Общественный благотворительный фонд «Vaqf»",
        "vaqf_charity_text": "Воздаяние за добро — только добро",

        "weather_title": "Прогноз погоды на неделю",
        "weather_sun_rise_set": "<strong>Солнце</strong>: восход 🌄 <span class=\"icon-sunrise\">{sunrise}</span> | закат 🌆 <span class=\"icon-sunset\">{sunset}</span>",
        "weather_morning": "Утро",
        "weather_lunch": "Обед",
        "weather_evening": "Вечер",
        "weather_date": " {month}",
        "weather_permission_title": "Разрешите доступ, чтобы увидеть погоду:",
        "weather_permission_button": "Определить и Обновить",
        
        "monday": "Понедельник", "tuesday": "Вторник", "wednesday": "Среда", "thursday": "Четверг", "friday": "Пятница", "saturday": "Суббота", "sunday": "Воскресенье",
        "jan": "янв.", "feb": "февр.", "mar": "март", "apr": "апр.", "may": "май", "jun": "июнь", "jul": "июль", "aug": "авг.", "sep": "сент.", "oct": "окт.", "nov": "нояб.", "dec": "дек.", 
        
        "owner_title": "О проекте «Safar Uzbekistan»",
        "owner_content_title": "Духовная безопасность в цифровом мире: на что обратить внимание?",
        "owner_content_intro": "Интернет — это не только информационное пространство, но и сфера большой ответственности. Сегодня незаконный контент под «религиозной маской» проникает в наш национальный сегмент, пытаясь отравить сознание молодежи.",
        "owner_content_pre_list": "Вы должны знать:",
        "owner_content_list": "<ul><li><strong>Официальность источника:</strong> Получайте религиозную информацию только с официальных сайтов и каналов, утвержденных Управлением мусульман Узбекистана.</li><li><strong>Подозрительные призывы:</strong> Аудио- и видеоматериалы, призывающие к изоляции от общества, разжиганию конфликтов или следованию за неизвестными лицами, являются признаками незаконного контента.</li><li><strong>Научная основа:</strong> Любое религиозное наставление должно иметь официальное разрешение. Остерегайтесь «неизвестных учителей» в виртуальном мире!</li></ul>",
        "owner_content_about": "Рекомендации по безопасности на этой платформе разработаны в рамках следующей научной работы:",
        "owner_content_about_list": "<ul><li>Тема научной работы: <strong>«Совершенствование механизмов борьбы с незаконным контентом в национальном сегменте Интернета»</strong></li><li>Научный консультант: <strong>Доктор экономических наук (DSc), профессор Захидов Азаматжон Азамович</strong></li><li>Исследователь: Независимый соискатель <strong>(PhD) Отакузиев Маъмуржон Мунавваржон</strong>.</li><li>Научный руководитель: <strong>д.ф.п.н (PhD), доцент Тухтаматов Хасан Рихсибаевич</strong>.</li></ul>",
        "owner_content_about_after": "Цель исследования — обеспечение стабильности общества путем внедрения современных технологических методов защиты нашего национального интернет-пространства от чуждых и вредных идей.",
        "more_resource_item_not_allow": "⚠️ <strong>Список запрещенных ресурсов</strong> (По решению Верховного суда - <cite title=\"6 апреля 2026 года\">6 апреля 2026 года</cite>) <button class='badge bg-dark d-block mt-1'>🔗 ссылка</button>",
        "more_resource_item_embassy": "⚖️ <strong>Дипломатические миссии</strong> (Портал открытых данных) <button class='badge bg-dark d-block mt-1'>🔗 ссылка</button>",
        "more_resource_item_vaqf": "🕋 <strong>Благотворительный фонд «Vaqf»</strong> внести пожертвование <button class='badge bg-dark d-block mt-1'>🔗 ссылка</button>",
        "more_resource_item_weather": "⛅️ <strong>«Погода»</strong> предоставлено сервисом «OpenWeatherMap» <button class='badge bg-dark d-block mt-1'>🔗 ссылка</button>",
        "more_resource_item_namaz": "🕔 <strong>Время намаза</strong> подготовлено на основе данных «Al Adhan Service» <button class='badge bg-dark d-block mt-1'>🔗 ссылка</button>",
        "more_notice": "Подготовлено на основании заключения Комитета по делам религий Республики Узбекистан <br>№ 03-07/8139 от 18 декабря 2025 года",
        "btn_install_pwa": "Установить приложение (PWA)",

        "btn_fatvo": "Центр Фатвы",
        "btn_vaqf": "Фонд Вакф",
        "footer_note": "Подготовлено на основании заключения Комитета по делам религий РУз.",
        "footer_date": "Информация обновлена по состоянию на 6 апреля 2026 года."
    },
    "en": { // Ingliz tili
        "nav_home": "Home",
        "nav_weather": "Weather",
        "nav_namaz": "Namaz",
        "nav_more": "More",
        "brand_title": "Religious and educational recommendations <br> for citizens traveling abroad",
        "brand_quote": "Whoever is aware will find salvation. He who is heedless will perish.",
        "brand_quote_author": "Abdullah ibn <cite title=\"Mubarak\">Mubarak</cite>",
        "main_annotation": "The application enables citizens and students temporarily living and working abroad to find answers to religious and educational questions, prevents them from falling under the influence of various radical ideas, facilitates donations to the «Vaqf» Charity Public Fund, and provides a direct connection to diplomatic missions abroad. For user convenience, it also includes links to official websites and social media pages of the Muslim Board of Uzbekistan operating within the global internet network.",
        "main_annotation_url": "https://lex.uz/docs/6117508",
        "official_links_title": "Official websites and channels",
        "official_links_item1": "Social networks of the Committee for Religious Affairs of the Republic of Uzbekistan",
        "official_links_item2": "Official web portals of the Muslim Board of Uzbekistan",
        "official_links_item2_label1": "Useful and reliable websites, social networks",
        "official_links_item2_label2": "Uzbekistan Muslim Board MUSLIM.UZ portal",
        "official_links_item3": "Fatwa Center of the Muslim Board of Uzbekistan",
        "official_links_item4": "Information about scientific and educational institutions",
        "official_links_item4_label1": "Official channel of the International <strong>Academy of Islamic Studies of Uzbekistan</strong>",
        "official_links_item4_label2": "Official channel of the <strong>Tashkent Islamic Institute</strong>",
        "official_links_item4_label3": "Official channel of the <strong>Hadith Science School</strong> (Institute) under the Administration of Muslims of Uzbekistan",
        "official_links_item4_label4": "Official channel of <strong>Mir Arab</strong> Higher Madrasah",
        "official_links_item5": "International Research Centers",
        "official_links_item5_label1": "Official channel of the <strong>Imam Bukhari</strong> International Research Center",
        "official_links_item5_label2": "Official channel of the <strong>Imam Moturidi</strong> International Research Center",
        "official_links_item5_label3": "Official channel of the <strong>Imam Termizi</strong> secondary special Islamic educational institution",
        "official_links_item5_label4": "Official channel of the <strong>Center for Islamic Civilization</strong>",

        "double_tap_link_note": "Double-tap the link, it will open in the new window",

        "not_allowed_title": "⚖️ List of sources and contents (materials) on the World Wide Web, recognized by the Supreme Court of the Republic of Uzbekistan as contaminated with religious extremist, terrorist, and fanatical ideas, and prohibited for import, production, storage, distribution, and display on the territory of the Republic",
        "not_allowed_title_lastdate": "Accessed <cite title=\"April 6, 2026\">as of April 6, 2026</cite>",
        "not_allowed_item1": "List of Internet resources",
        "not_allowed_item1_label1": "<strong>PDF</strong> file",
        "not_allowed_item1_label2": "<strong>Telegram</strong> link",
        "not_allowed_item2": "Legal consequences",
        "not_allowed_item2_label1": "<strong>Article 244<supsup>1</sup>.</strong> Production, storage, distribution or display of materials that pose a threat to public safety and public order",

        "brand_embassy": "Diplomatic missions of the Republic of Uzbekistan abroad <button data-bs-toggle=\"modal\" data-bs-target=\"#safarModalEmbassy\" class=\"btn text-white btn-link\">view list <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" fill=\"currentColor\" viewBox=\"0 0 16 16\"><path fill-rule=\"evenodd\" d=\"M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5\"/><path fill-rule=\"evenodd\" d=\"M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z\"/></svg></button>",
        "brand_embassy_picture": "images/embassy_en.png",
        "brand_embassy_data_url": "https://data.egov.uz/apiData/MainData/GetByFile?id=6107cb7d2a2e256d868e86ac&fileType=1&tableType=2&lang=4",
        "brand_embassy_modal_title": "Diplomatic missions of the Republic of Uzbekistan abroad",
        "brand_embassy_modal_close": "Back",

        "vaqf_charity_title": "Public charity foundation “Vaqf”",
        "vaqf_charity_text": "The reward for goodness is nothing but goodness",

        "weather_title": "Weekly weather forecast",
        "weather_sun_rise_set": "<strong>Sun</strong>: sunrise 🌄 <span class=\"icon-sunrise\">{sunrise}</span> | sunset 🌆 <span class=\"icon-sunset\">{sunset}</span>",
        "weather_morning": "Morning",
        "weather_lunch": "Lunch",
        "weather_evening": "Evening",
        "weather_date": " {month}",
        "weather_permission_title": "Please allow access to view the weather:",
        "weather_permission_button": "Detect and Update",
        
        "monday": "Monday", "tuesday": "Tuesday", "wednesday": "Wednesday", "thursday": "Thursday", "friday": "Friday", "saturday": "Saturday", "sunday": "Sunday",
        "jan": "Jan", "feb": "Feb", "mar": "Mar", "apr": "Apr", "may": "May", "jun": "Jun", "jul": "Jul", "aug": "Aug", "sep": "Sep", "oct": "Oct", "nov": "Nov", "dec": "Dec",

        "owner_title": "About «Safar Uzbekistan» Project",
        "owner_content_title": "Spiritual Security in the Digital World: What to Watch Out For?",
        "owner_content_intro": "The Internet is not just an information space, but a sphere of great responsibility. Today, illegal content under a 'religious mask' is infiltrating our national segment, attempting to poison the minds of youth.",
        "owner_content_pre_list": "What you must know:",
        "owner_content_list": "<ul><li><strong>Source Authenticity:</strong> Obtain religious information only from official websites and channels approved by the Muslim Board of Uzbekistan.</li><li><strong>Suspicious Calls:</strong> Audio and video materials calling for social isolation, inciting conflict, or following unknown individuals are signs of illegal content.</li><li><strong>Scientific Basis:</strong> Any religious guidance must have official authorization. Beware of 'unknown teachers' in the virtual world!</li></ul>",
        "owner_content_about": "Security recommendations on this platform have been developed as part of the following research work:",
        "owner_content_about_list": "<ul><li>Research Topic: <strong>«Improving mechanisms for combating illegal content in the national segment of the Internet»</strong></li><li>Scientific Consultant: <strong>Doctor of Science (DSc) in Economics, Professor Azamatjon Azamovich Zoxidov</strong></li><li>Researcher: Independent Researcher <strong>(PhD) Mamurjon Munavvarjon Otakuziev</strong>.</li><li>Scientific Supervisor: <strong>PhD, Associate Professor Khasan Rikhsibaevich Tukhtamatov</strong>.</li></ul>",
        "owner_content_about_after": "The goal of the research is to ensure social stability by implementing modern technological methods to protect our national internet space from alien and harmful ideas.",
        "more_resource_item_not_allow": "⚠️ <strong>List of Prohibited Resources</strong> (By Supreme Court decision - <cite title=\"of April 6, 2026\">of April 6, 2026</cite>) <button class='badge bg-dark d-block mt-1'>🔗 link</button>",
        "more_resource_item_embassy": "⚖️ <strong>Diplomatic Missions</strong> (Open Data Portal) <button class='badge bg-dark d-block mt-1'>🔗 link</button>",
        "more_resource_item_vaqf": "🕋 <strong>«Vaqf» Charitable Foundation</strong> make a donation <button class='badge bg-dark d-block mt-1'>🔗 link</button>",
        "more_resource_item_weather": "⛅️ <strong>«Weather»</strong> data provided by «OpenWeatherMap» service <button class='badge bg-dark d-block mt-1'>🔗 link</button>",
        "more_resource_item_namaz": "🕔 <strong>Prayer Times</strong> based on «Al Adhan Service» data <button class='badge bg-dark d-block mt-1'>🔗 link</button>",
        "more_notice": "Prepared based on the conclusion of the Committee for Religious Affairs of the Republic of Uzbekistan <br>No. 03-07/8139 dated December 18, 2025",
        "btn_install_pwa": "Install App (PWA)",

        "btn_fatvo": "Fatwa Center",
        "btn_vaqf": "Vaqf Foundation",
        "footer_note": "Prepared based on the conclusion of the Committee for Religious Affairs.",
        "footer_date": "Information updated as of April 6, 2026."
    }
};

// 2. Ilova holati (State)
let state = {
    lang: localStorage.getItem('selectedLang') || 'oz'
};

// 3. State-ni yangilash funksiyasi
const setState = (newState) => {
    state = { ...state, ...newState };
    render();
};

function render() {
    const t = translations[state.lang];
    if (!t) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const attr = el.getAttribute('data-i18n-attr');
        const templateData = el.getAttribute('data-i18n-data');
        const templateAdditation = el.getAttribute('data-i18n-additation');

        if (t[key]) {
            let translation = t[key];

            // 1. Agar data-i18n-data bo'lsa, formatTemplate dan foydalanamiz
            if (templateData) {
                try {
                    const data = JSON.parse(templateData);
                    if (typeof data === 'string') {
                        data = JSON.parse(`${data}`);
                    }
                    if (typeof data === 'object' && data !== null) {
                        if (templateAdditation) {
                            translation = translation.formatTemplate(data);
                            // for (word in data) {
                            //     console.log(word, data[word]);
                            // }
                        } else {
                            translation = translation.formatTemplate(data);
                        }
                    } else {
                        console.warn(`Data for ${key} is not a valid object:`, data);
                    }
                } catch (e) {
                    console.error(`Error parsing i18n data for key: ${key}`, e);
                }
            }

            // 2. Tarjimani joylashtirish (Attribute yoki Content)
            if (attr) {
                el.setAttribute(attr, translation);
            } else {
                // HTML teglar borligini tekshirish
                if (translation.includes('<') || translation.includes('&')) {
                    el.innerHTML = translation;
                } else {
                    el.textContent = translation;
                }
            }
        }
    });

    document.documentElement.lang = state.lang === 'oz' ? 'uz' : state.lang;
}

// 5. Tablarni almashtirish
function showTab(tabId, element) {
    if (tabId === tabWeather) {
        initWeather();
    }

    if (tabId === tabNamaz) {
        initNamaz();
    }
    document.querySelectorAll('#home, #weather, #namaz, #more').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelectorAll('.nav-bottom .nav-link').forEach(link => link.classList.remove('active'));
    element.classList.add('active');
    window.scrollTo(0, 0);
}

// 6. Tilni almashtirish funksiyasi
function changeLang(newLang, imgPath) {
    localStorage.setItem('selectedLang', newLang);
    setState({ lang: newLang });

    const currentImg = document.getElementById('current-lang-img');
    console.log('Til o\'zgartirildi:', newLang, 'Rasm yo\'li:', imgPath);
    if (currentImg) currentImg.src = imgPath;
    renderEmbassyTable();
}

async function loadData(url, method = 'GET') {
    try {
        const response = await fetch(url, { method });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Xatolik yuz berdi:', error);
        return null;
    }
}

async function syncEmbassies() {
    const now = new Date().getTime();
    const lastSync = localStorage.getItem(embassySyncKey);
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000; // Millisekundlarda 1 hafta

    // Agar oxirgi yangilanishdan 1 hafta o'tmagan bo'lsa, funksiyani to'xtatamiz
    if (lastSync && (now - lastSync < ONE_WEEK)) {
        console.log("Elchixonalar ma'lumotlari keshda (1 haftadan kam bo'lgan). Yangilash shart emas.");
        renderEmbassyTable(); // Baribir jadvalni chizamiz (keshdan oladi)
        return;
    }

    // Internet yo'q bo'lsa yangilolmaymiz
    if (!navigator.onLine) {
        console.warn("Internet yo'q, oflayn rejimda ishlayapti.");
        renderEmbassyTable();
        return;
    }

    console.log("Kesh eskirgan yoki yo'q. Yangi ma'lumotlar yuklanmoqda...");

    const loaders = Object.entries(embassyConfig.languages).map(async ([langCode, langId]) => {
        try {
            const response = await fetch(`${embassyConfig.baseUrl}&lang=${langId}`);
            const data = await response.json();
            localStorage.setItem(`${embassyConfig.storagePrefix}${langCode}`, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error(`Xatolik (${langCode}):`, e);
            return false;
        }
    });

    const results = await Promise.all(loaders);
    
    // Agar kamida bitta til muvaffaqiyatli yuklangan bo'lsa, vaqtni belgilaymiz
    if (results.some(res => res === true)) {
        localStorage.setItem(embassySyncKey, now.toString());
        renderEmbassyTable();
    }
}

function forceRefreshEmbassies() {
    localStorage.removeItem(embassySyncKey);
    syncEmbassies();
    alert("Ma'lumotlar yangilanmoqda...");
}

function renderEmbassyTable() {

    function formatContactNumbers(code, numbers, type = 'tel') {
        if (!numbers || numbers.trim() === "" || numbers.toLowerCase() === "vaqant") return "";
        // 1. Raqamlarni ajratib olish (vergul yoki slashelarni inobatga olgan holda)
        // 6734-39-42/43 holatini 6734-39-42 va 6734-39-43 ga ajratadi
        let parts = numbers.split(/[,/]/);
        let baseNumber = parts[0].trim();
        let formattedHtml = `<div class="contact-group ${type}-group">`;

        parts.forEach((part, index) => {
            let cleanPart = part.trim();
            if (!cleanPart) return;

            let finalNumber = cleanPart;
            
            // Agar raqam faqat oxirgi qismi bo'lsa (masalan /43), asosiy raqamga ulaymiz
            if (index > 0 && cleanPart.length <= 3 && baseNumber.includes('-')) {
                formattedHtml = formattedHtml.replace('</a>', `</a><span class="input-group-text bg-danger text-white">/ ${cleanPart}</span>`);
                return;
            }

            // To'liq raqam (faqat raqamlardan iborat qilib tozalash)
            let fullDialNumber = `+${code}${finalNumber}`.replace(/\s+/g, '').replace(/-/g, '');
            
            // Ikonka tanlash
            let icon = type === 'tel' ? '📞' : '📠';
            let btnClass = type === 'tel' ? 'btn-contact-tel' : 'btn-contact-fax';

            formattedHtml += `
                <div class="input-group input-group-sm mb-1">
                    <span class="input-group-text fs-5 bg-warning text-dark fw-bold">${icon}</span>
                    <a href="${type === 'tel' ? 'tel:' : 'fax:'}${fullDialNumber}" class="form-control contact-item ${btnClass} text-decoration-none d-flex align-items-center bg-dark text-warning" title="${finalNumber}">
                        <span>${finalNumber}</span>
                    </a>                    
                </div>
                
            `;
        });

        formattedHtml += `</div>`;
        return formattedHtml;
    }
    const googleMapIconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg"><defs><style>.cls-1{fill:#1a73e8;}.cls-2{fill:#ea4335;}.cls-3{fill:#4285f4;}.cls-4{fill:#fbbc04;}.cls-5{fill:#34a853;}</style></defs><g transform="scale(1.03, 1.03), translate(3.5, 0)"><path class="cls-1" d="M14.45.78A8.09,8.09,0,0,0,5.8,3.29L9.63,6.51Z" transform="translate(-3.91 -0.4)"/><path class="cls-2" d="M5.8,3.29a8.07,8.07,0,0,0-1.89,5.2,9.06,9.06,0,0,0,.8,3.86L9.63,6.51Z" transform="translate(-3.91 -0.4)"/><path class="cls-3" d="M12,5.4a3.09,3.09,0,0,1,3.1,3.09,3.06,3.06,0,0,1-.74,2l4.82-5.73a8.12,8.12,0,0,0-4.73-4L9.63,6.51A3.07,3.07,0,0,1,12,5.4Z" transform="translate(-3.91 -0.4)"/><path class="cls-4" d="M12,11.59a3.1,3.1,0,0,1-3.1-3.1,3.07,3.07,0,0,1,.73-2L4.71,12.35A28.67,28.67,0,0,0,8.38,17.6l6-7.11A3.07,3.07,0,0,1,12,11.59Z" transform="translate(-3.91 -0.4)"/><path class="cls-5" d="M14.25,19.54c2.7-4.22,5.84-6.14,5.84-11a8.1,8.1,0,0,0-.91-3.73L8.38,17.6c.46.6.92,1.24,1.37,1.94C11.4,22.08,10.94,23.6,12,23.6S12.6,22.08,14.25,19.54Z" transform="translate(-3.91 -0.4)"/></g></svg>';
    const tableBody = document.getElementById('embassyTableBody');
    if (!tableBody) return;

    const currentLang = state.lang || 'oz';
    const cachedData = localStorage.getItem(`${embassyConfig.storagePrefix}${currentLang}`);

    if (!cachedData) {
        tableBody.innerHTML = '<tr><td colspan="3" class="text-center">Ma’lumot topilmadi...</td></tr>';
        return;
    }

    const data = JSON.parse(cachedData);
    let html = "";

    data.forEach((item, index) => {
        const name = item.Vakolatnomanomi || item.Vakolatxonanomi || "Noma'lum";
        const addr = item.Vakolatxonamanzili || "-";
        const code = item.Codi || "";
        const phonesFormatted = formatContactNumbers(item.Codi, item.Telefon);
        const faxesFormatted = formatContactNumbers(item.Codi, item.Faks, 'fax');
        const ambassador = (item.Rahbar || "-").toString().ucfirst();
        const position = (item.Lavozimi || "-").toString().ucfirst();
        const lat = item.latitude || null;
        const lng = item.longitude || null;
        const googleMapLink = (lat && lng) ? `https://www.google.com/maps?q=${lat},${lng}` : null;

        html += `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <div class="fw-bold pb-1">
                        ${name}
                    </div>
                    <div class="pb-2">
                        <small>${addr}</small>
                    </div>
                    <a class="btn text-white fs-5" target="_blank" href="${googleMapLink}" style="background-color: var(--bs-gray-dark)">
                        ${googleMapIconSvg} Google Map
                    </a>
                </td>
                <td>
                    <div class="fw-bold pb-1 text-primary">
                        ${ambassador}
                    </div>
                    <div class="pb-2">
                        <small>${position}</small>
                    </div>
                    <div class="pb-2">
                        <div class="phone-code"><span class="badge bg-info fs-6">+${code}</span></div>
                        ${phonesFormatted}
                        ${faxesFormatted}
                    </div>
                </td>
            </tr>`;
    });

    tableBody.innerHTML = html;
}

// Ob-havo integratsiyasi uchun 
async function initWeather() {
    const currentLang = localStorage.getItem('lang') || document.documentElement.lang || 'uz';
    const cachedRaw = localStorage.getItem(weatherCacheKey);
    const THREE_DASYS = 3 * 24 * 60 * 60 * 1000;
    const now = new Date().getTime();

    if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        
        // Shart: Vaqt o'tmagan bo'lishi VA joriy til keshda mavjud bo'lishi kerak
        if (now - cached.timestamp < THREE_DASYS && cached.payload[currentLang]) {
            console.log(`Ob-havo {lang} tilida keshtan yuklandi.`.formatTemplate({lang: currentLang}));
            renderAllWeatherData(cached.payload[currentLang]);
            return;
        }
    }

    // Agar kesh yo'q bo'lsa yoki joriy tilda ma'lumot bo'lmasa - API-dan olamiz
    navigator.geolocation.getCurrentPosition((pos) => {
        fetchWeatherData(pos.coords.latitude, pos.coords.longitude);
    });
}

async function checkWeatherWithPermission() {
    // Brauzerda geolokatsiya imkoniyati borligini tekshiramiz
    if (!navigator.geolocation) {
        alert("Kechirasiz, brauzeringiz geolokatsiyani qo'llab-quvvatlamaydi.");
        return;
    }

    // Ruxsat holatini tekshirish (Permissions API)
    try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        
        if (result.state === 'granted') {
            // Allaqachon ruxsat berilgan bo'lsa
            getLocalWeather();
        } else if (result.state === 'prompt') {
            // Hali so'ralmagan bo'lsa - foydalanuvchiga tushuntirish yoki tugmani ko'rsatish
            console.log("Ruxsat so'ralmoqda...");
            getLocalWeather(); 
        } else {
            // Ruxsat rad etilgan bo'lsa (denied)
            alert("Ob-havoni ko'rish uchun joylashuvga ruxsat berishingiz kerak.");
        }
    } catch (error) {
        // Ba'zi brauzerlar Permissions API ni qo'llab-quvvatlamasligi mumkin
        getLocalWeather();
    }
}

async function fetchWeatherData(lat, lon) {
    const currentLang = localStorage.getItem('lang') || document.documentElement.lang || 'uz';
    const setLang = currentLang === 'oz' ? 'uz' : currentLang;
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${obHavoKaliti}&units=metric&lang=${setLang}`;

    try {
        const response = await fetch(url);
        const newData = await response.json();
        
        let cached = JSON.parse(localStorage.getItem(weatherCacheKey)) || { timestamp: 0, payload: {} };
        
        cached.timestamp = new Date().getTime();
        cached.payload[currentLang] = newData;
        
        localStorage.setItem(weatherCacheKey, JSON.stringify(cached));

        renderAllWeatherData(newData);
    } catch (error) {
        console.error("API xatosi:", error);
    }
}

function renderAllWeatherData(data) {
    const words = translations[state.lang];
    const currentLang = localStorage.getItem('lang') || document.documentElement.lang || 'uz';
    const container = document.getElementById('weekly-weather');
    if (!container) return;

    const formatTime = (unix) => new Date(unix * 1000).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    const sunrise = formatTime(data.city.sunrise);
    const sunset = formatTime(data.city.sunset);
    const sun = words.weather_sun_rise_set.formatTemplate({sunrise: sunrise, sunset: sunset});
    const sunData = JSON.stringify({sunrise: sunrise,sunset: sunset});

    let sunElement = document.createElement('small');
    sunElement.className = "opacity-75";
    sunElement.setAttribute('data-i18n', 'weather_sun_rise_set');
    sunElement.setAttribute('data-i18n-data', sunData);
    sunElement.innerHTML = sun;

    // Kunlar bo'yicha guruhlash
    const daysMap = {};
    data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!daysMap[date]) daysMap[date] = [];
        daysMap[date].push(item);
    });

    // Faqat 5 kunni olamiz
    const dates = Object.keys(daysMap).slice(0, 5);

    let html = `
        <div class="weather-header mb-3 p-3 rounded-4 bg-dark text-white shadow-sm d-flex justify-content-between align-items-center">
            <div>
                <h5 class="mb-0 text-warning">🏠 ${data.city.name}</h5>
                ${sunElement.outerHTML}
            </div>
        </div>
        <div class="weather-responsive-grid">
    `;

    dates.forEach(date => {
        const dayData = daysMap[date];
        const dateObj = new Date(dayData[0].dt * 1000);
        const dayName = dateObj.toLocaleDateString('uz-UZ', { weekday: 'long' }).ucfirst();
        const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
        const dateForFormatJson = JSON.stringify({month: months[dateObj.getMonth()]});

        const dateSpanMonth = document.createElement('span');
        dateSpanMonth.setAttribute('data-i18n', 'weather_date');
        dateSpanMonth.setAttribute('data-i18n-data', dateForFormatJson);
        dateSpanMonth.setAttribute('data-i18n-additation', true);
        dateSpanMonth.innerHTML = months[dateObj.getMonth()];

        const dateSpan = document.createElement('span');
        dateSpan.class = 'text-muted small';
        dateSpan.innerHTML = dateObj.getDate().toString() + ' ' + dateSpanMonth.outerHTML;
        
        const times = [
            { label:'weather_morning', hour: '09', translations: words.weather_morning, },
            { label:'weather_lunch', hour: '15', translations: words.weather_lunch, },
            { label:'weather_evening', hour: '21', translations: words.weather_evening, }
        ];

        html += `
            <div class="weather-day-card border rounded-4 bg-white shadow-sm mb-3">
                <div class="day-title p-3 border-bottom bg-light d-flex justify-content-between align-items-center rounded-top-4">
                    <span class="fw-bold">${dayName}</span>
                    ${dateSpan.outerHTML}
                </div>
                <div class="day-times-row d-flex justify-content-around p-3">
        `;

        times.forEach(t => {
            // Shu soatga eng yaqin ma'lumotni topish
            const forecast = dayData.find(d => d.dt_txt.includes(` ${t.hour}:`)) || dayData[0];
            const temp = Math.round(forecast.main.temp);
            const icon = forecast.weather[0].icon;

            html += `
                <div class="time-block text-center">
                    <div class="text-muted" style="font-size: 11px;" data-i18n="${t.label}">${t.translations}</div>
                    <img src="https://openweathermap.org/img/wn/${icon}.png" width="40" alt="icon">
                    <div class="fw-bold">${temp}°C</div>
                </div>
            `;
        });

        html += `</div></div>`;
    });

    html += `</div>`;
    container.innerHTML = html;
}

function renderWeeklyWeather(data) {
    const container = document.getElementById('weekly-weather');
    if (!container) return;

    // 1. Ma'lumotlarni kunlar bo'yicha guruhlaymiz (har bir kundan bitta vaqtni olamiz)
    const dailyForecast = data.list.filter(item => item.dt_txt.includes("12:00:00"));

    // Agar 12:00 dagi ma'lumotlar hali yo'q bo'lsa (bugun uchun), ro'yxatni to'ldiramiz
    const displayDays = dailyForecast.length > 0 ? dailyForecast : data.list.slice(0, 5);

    let html = `
        <div class="weather-scroll-container d-flex overflow-auto pb-3" style="gap: 15px; scrollbar-width: none;">
    `;

    displayDays.forEach(day => {
        const dateObj = new Date(day.dt * 1000);
        const dayName = dateObj.toLocaleDateString('uz-UZ', { weekday: 'long' }).ucfirst();
        const dateNum = dateObj.getDate();
        const monthName = dateObj.toLocaleDateString('uz-UZ', { month: 'long' });
        
        // Harorat (Kelvinda kelsa Selsiyga o'tkazamiz, agar units=metric bo'lsa o'zi tayyor keladi)
        const temp = Math.round(day.main.temp); 
        const icon = day.weather[0].icon;
        const desc = day.weather[0].description;

        html += `
            <div class="weather-card text-center p-3 shadow-sm rounded-4 bg-white border" style="min-width: 125px;">
                <div class="text-muted small mb-1">${dayName}</div>
                <div class="fw-bold mb-2" style="font-size: 14px;">${dateNum} ${monthName}</div>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" width="50" alt="${desc}">
                <div class="fw-bolder" style="font-size: 18px;">${temp}°C</div>
                <div class="text-capitalize mt-1" style="font-size: 10px; color: #6c757d;">${desc}</div>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

function getLocalWeather() {
    const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
        (position) => {
            // Muvaffaqiyatli bo'lsa
            const { latitude, longitude } = position.coords;
            fetchWeatherData(latitude, longitude);
        },
        (error) => {
            // Ruxsat berilmaganda yoki boshqa xatolar
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    console.error("Foydalanuvchi geolokatsiyaga ruxsat bermadi.");
                    // Bu yerda default shahar (masalan, Toshkent) ob-havosini ko'rsatish mumkin
                    break;
                case error.POSITION_UNAVAILABLE:
                    console.error("Joylashuv ma'lumotlari mavjud emas.");
                    break;
                case error.TIMEOUT:
                    console.error("So'rov vaqti tugadi.");
                    break;
            }
        },
        options
    );
}

async function initNamaz() {
    const container = document.getElementById('namaz-list-container');
    if (!container) return;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const currentTime = now.getTime();
    
    const cached = localStorage.getItem(namazCacheKey);
    const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;

    if (cached) {
        const parsed = JSON.parse(cached);
        // Agar kesh joriy oyga tegishli bo'lsa va 3 soatdan o'tmagan bo'lsa
        if (parsed.month === currentMonth && parsed.year === currentYear && (currentTime - parsed.timestamp < THREE_DAYS)) {
            console.log("Namoz vaqtlari keshtan yuklandi.");
            renderWeeklyNamazTabs(parsed.data);
            return;
        }
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        await syncNamazData(lat, lon, currentYear, currentMonth);
    }, (error) => {
        console.error("Geolokatsiya xatosi:", error);
        if (cached) renderWeeklyNamazTabs(JSON.parse(cached).data);
    });
}

async function syncNamazData(lat, lon, year, month) {
    // Oylik kalendar API (Kecha va kelgusi kunlarni olish uchun eng yaxshi yo'l)
    const url = `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${lat}&longitude=${lon}&method=13`;

    try {
        const response = await fetch(url);
        const json = await response.json();

        if (json.code === 200) {
            const cacheObject = {
                timestamp: new Date().getTime(),
                month: month,
                year: year,
                data: json.data 
            };
            localStorage.setItem(namazCacheKey, JSON.stringify(cacheObject));
            renderWeeklyNamazTabs(json.data);
        }
    } catch (error) {
        console.error("Namoz API sinxronizatsiyasida xatolik:", error);
    }
}

function renderWeeklyNamazTabs(monthlyData) {
    const container = document.getElementById('namaz-list-container');
    const today = new Date();
    const currentDay = today.getDate();
    
    // -1 kun (kecha) va +6 kun (kelgusi) jami 8 kunlik ma'lumotni filtrlash
    const startIndex = Math.max(0, currentDay - 2); // API indeksi 0 dan boshlanadi
    const displayDays = monthlyData.slice(startIndex, startIndex + 8);

    let tabsHtml = `<ul class="nav nav-tabs nav-fill mb-3" id="namazDaysTab" role="tablist">`;
    let contentHtml = `<div class="tab-content" id="namazDaysTabContent">`;

    displayDays.forEach((dayData, index) => {
        const d = dayData.date.gregorian;
        const isToday = parseInt(d.day) === currentDay;
        const tabId = `day-tab-${index}`;
        const paneId = `day-pane-${index}`;
        
        // Tab sarlavhasi (Kecha, Bugun, yoki Sana)
        let dayLabel = `${d.day}/${d.month.number}`;
        if (isToday) dayLabel = "Bugun";
        else if (parseInt(d.day) === currentDay - 1) dayLabel = "Kecha";

        tabsHtml += `
            <li class="nav-item" role="presentation">
                <button class="nav-link ${isToday ? 'active fw-bold' : ''} small px-1" id="${tabId}" data-bs-toggle="tab" data-bs-target="#${paneId}" type="button" role="tab">${dayLabel}</button>
            </li>`;

        contentHtml += `
            <div class="tab-pane fade ${isToday ? 'show active' : ''}" id="${paneId}" role="tabpanel">
                <div class="namaz-header mb-2 text-center small text-muted">
                    ${d.day} ${d.month.en} ${d.year} / ${dayData.date.hijri.day} ${dayData.date.hijri.month.uz || dayData.date.hijri.month.en}
                </div>
                ${renderNamazList(dayData.timings)}
            </div>`;
    });

    tabsHtml += `</ul>`;
    contentHtml += `</div>`;
    
    container.innerHTML = tabsHtml + contentHtml;
}

function renderNamazList(t) {
    const prayerList = [
        { name: "Bomdod", time: t.Fajr },
        { name: "Quyosh", time: t.Sunrise },
        { name: "Peshin", time: t.Dhuhr },
        { name: "Asr", time: t.Asr },
        { name: "Shom", time: t.Maghrib },
        { name: "Xufton", time: t.Isha }
    ];

    let html = `<div class="list-group shadow-sm border-0">`;
    prayerList.forEach(prayer => {
        html += `
            <div class="list-group-item d-flex justify-content-between align-items-center py-2 border-0 border-bottom">
                <span style="font-size: 0.9rem;">${prayer.name}</span>
                <span class="badge bg-dark rounded-pill">${prayer.time.split(' ')[0]}</span>
            </div>`;
    });
    html += `</div>`;
    return html;
}

function updateNetworkUI() {
    console.log(navigator.onLine ? "Online" : "Offline");
    const notice = document.getElementById('offline-notice');
    if (!notice) return;
    notice.style.display = navigator.onLine ? 'none' : 'block';
}

window.addEventListener('online', () => { updateNetworkUI(); syncEmbassies(); });
window.addEventListener('offline', updateNetworkUI);


document.addEventListener('DOMContentLoaded', () => {
    updateNetworkUI();
    renderEmbassyTable();
    syncEmbassies()
    // Agar oldin til tanlangan bo'lsa, dropdown-dagi bayroqni ham to'g'rilash
    const savedLang = localStorage.getItem('selectedLang');
    if(savedLang) {
        const flagMap = {
            'oz': 'images/lang_oz.png',
            'uz': 'images/lang_uz.png',
            'ru': 'images/lang_ru.png',
            'en': 'images/lang_en.png'
        };
        const currentImg = document.getElementById('current-lang-img');
        if (currentImg) currentImg.src = flagMap[savedLang];
    }

    const t = translations[state.lang];
    var embassyDataUrl = t.brand_embassy_data_url;
    
    render();

});

// QR-kod generatori uchun global o'zgaruvchi (eski kodni o'chirish uchun)
let safarQrInstance = null;
let deferredPrompt;
const installContainer = document.getElementById('install-container');
const btnInstall = document.getElementById('btnInstall');

// Brauzer ilovani o'rnatishga tayyor bo'lganda ishga tushadi
window.addEventListener('beforeinstallprompt', (e) => {
    // Brauzerning standart oynasini to'xtatib turamiz
    e.preventDefault();
    // Hodisani keyinroq ishlatish uchun saqlab qo'yamiz
    deferredPrompt = e;
    // O'rnatish tugmasini foydalanuvchiga ko'rsatamiz
    installContainer.style.display = 'block';
});

btnInstall.addEventListener('click', async () => {
    if (deferredPrompt) {
        // O'rnatish oynasini ko'rsatamiz
        deferredPrompt.prompt();
        // Foydalanuvchi nima deb javob berganini tekshiramiz
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Foydalanuvchi javobi: ${outcome}`);
        // deferredPrompt'ni tozalaymiz (u faqat bir marta ishlatiladi)
        deferredPrompt = null;
        // Tugmani yana yashiramiz
        installContainer.style.display = 'none';
    }
});

window.addEventListener('appinstalled', () => {
    console.log('SafarUz ilovasi muvaffaqiyatli o\'rnatildi!');
    installContainer.style.display = 'none';
});

document.addEventListener('click', function (e) {

    const copyBtn = e.target.closest('[data-safar-action="copy"]');
    if (copyBtn) {
        // data-link ichidagi havolani olish
        const textToCopy = copyBtn.getAttribute('data-copy');
        
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = copyBtn.innerHTML;
                
                const successMsg = state.lang === 'ru' ? 'Скопировано!' : 
                                 state.lang === 'oz' ? 'Nusxa olindi!' : 
                                 state.lang === 'uz' ? 'Нусха олинди!' : 'Copied!';
                
                copyBtn.innerText = successMsg;
                copyBtn.classList.add('btn-success');

                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.classList.remove('btn-success');
                }, 2000);
            }).catch(err => {
                console.error('Xatolik yuz berdi: ', err);
            });
        }
    }
    
    const qrBtn = e.target.closest('[data-safar-action="qrcode"]');
    if (qrBtn) {
        console.log("QR-kod tugmasi bosildi!");
        // 2. Tugmadagi havolani olish (data-link atributidan)
        const url = qrBtn.getAttribute('data-link');
        
        if (!url) {
            console.error("QR-kod uchun havola (data-link) topilmadi!");
            return;
        }

        // 3. Modal ichidagi qrcode konteynerini topish
        const qrContainer = document.getElementById('qrcode');
        qrContainer.innerHTML = ""; // Avvalgi QR-kodni tozalash

        // 4. Modalni ochish (Bootstrap orqali)
        const qrModal = new bootstrap.Modal(document.getElementById('safarModal'));
        qrModal.show();

        // 5. QR-kodni yaratish
        // Modal ochilishi uchun biroz kutamiz (render xatolarini oldini olish uchun)
        setTimeout(() => {
            safarQrInstance = new QRCode(qrContainer, {
                text: url,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }, 300);
    }
});

document.addEventListener('dblclick', function (e) {
    const target = e.target.closest('[data-safar-action="double-tap"]');
    
    if (target) {
        console.log("Double-tap element bosildi!");
        const url = target.value || target.getAttribute('data-link');
        
        if (url && url.startsWith('http')) {
            window.open(url, '_blank');
        } else {
            console.warn("Noto'g'ri URL yoki havola topilmadi:", url);
        }
    }
});