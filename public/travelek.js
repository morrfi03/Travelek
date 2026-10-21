
(function(){
"use strict";
if(window.__travelekMap){
  try{ window.__travelekMap.remove(); }catch(e){}
  window.__travelekMap=null;
}

/* Зум только у карты и глобуса. Остальной экран не масштабируется. */
(function(){
  var meta=document.querySelector('meta[name="viewport"]');
  if(meta) meta.setAttribute("content","width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover");
  function onMap(t){
    if(!t || !t.closest) return false;
    return !!(t.closest("#map") || t.closest("#globe") || t.id==="map" || t.id==="globe");
  }
  ["gesturestart","gesturechange","gestureend"].forEach(function(type){
    document.addEventListener(type, function(e){ e.preventDefault(); }, {passive:false});
  });
  document.addEventListener("touchmove", function(e){
    if(e.touches && e.touches.length>1 && !onMap(e.target) && e.cancelable) e.preventDefault();
  }, {passive:false});
  var lastTouchEnd=0;
  document.addEventListener("touchend", function(e){
    var now=Date.now();
    if(!onMap(e.target) && now-lastTouchEnd<=300) e.preventDefault();
    lastTouchEnd=now;
  }, {passive:false});
})();

/* ===== Каталоги ===== */
var AIRPORTS = [
  /* Россия */
  {code:"SVO",n:"Москва Шереметьево",lat:55.9726,lng:37.4146},
  {code:"DME",n:"Москва Домодедово",lat:55.4088,lng:37.9063},
  {code:"VKO",n:"Москва Внуково",lat:55.5915,lng:37.2615},
  {code:"ZIA",n:"Москва Жуковский",lat:55.5533,lng:38.1500},
  {code:"LED",n:"Санкт-Петербург Пулково",lat:59.8003,lng:30.2625},
  {code:"KZN",n:"Казань",lat:55.6062,lng:49.2787},
  {code:"SVX",n:"Екатеринбург Кольцово",lat:56.7431,lng:60.8027},
  {code:"OVB",n:"Новосибирск Толмачёво",lat:55.0126,lng:82.6507},
  {code:"AER",n:"Сочи",lat:43.4499,lng:39.9566},
  {code:"ROV",n:"Ростов Платов",lat:47.4939,lng:39.9247},
  {code:"KRR",n:"Краснодар Пашковский",lat:45.0347,lng:39.1705},
  {code:"UFA",n:"Уфа",lat:54.5575,lng:55.8744},
  {code:"CEK",n:"Челябинск",lat:55.3058,lng:61.5033},
  {code:"KJA",n:"Красноярск Емельяново",lat:56.1729,lng:92.4933},
  {code:"IKT",n:"Иркутск",lat:52.2680,lng:104.3890},
  {code:"VVO",n:"Владивосток Кневичи",lat:43.3990,lng:132.1480},
  {code:"KHV",n:"Хабаровск",lat:48.5280,lng:135.1880},
  {code:"YKS",n:"Якутск",lat:62.0933,lng:129.7707},
  {code:"MRV",n:"Минеральные Воды",lat:44.2251,lng:43.0819},
  {code:"ASF",n:"Астрахань",lat:46.2833,lng:48.0063},
  {code:"GOJ",n:"Нижний Новгород Стригино",lat:56.2301,lng:43.7840},
  {code:"PEE",n:"Пермь Большое Савино",lat:57.9146,lng:56.0212},
  {code:"OMS",n:"Омск",lat:54.9670,lng:73.3105},
  {code:"TJM",n:"Тюмень Рощино",lat:57.1689,lng:65.3247},
  {code:"SGC",n:"Сургут",lat:61.3437,lng:73.4018},
  {code:"KUF",n:"Самара Курумоч",lat:53.5049,lng:50.1643},
  {code:"VOG",n:"Волгоград Гумрак",lat:48.7825,lng:44.3456},
  {code:"VOZ",n:"Воронеж",lat:51.8142,lng:39.2296},
  {code:"KGD",n:"Калининград Храброво",lat:54.8900,lng:20.5926},
  {code:"AAQ",n:"Анапа Витязево",lat:45.0021,lng:37.3473},
  {code:"ARH",n:"Архангельск Талаги",lat:64.6003,lng:40.7167},
  {code:"BAX",n:"Барнаул",lat:53.3638,lng:83.5385},
  {code:"EGO",n:"Белгород",lat:50.6438,lng:36.5901},
  {code:"BQS",n:"Благовещенск",lat:50.4254,lng:127.4120},
  {code:"BTK",n:"Братск",lat:56.3706,lng:101.6980},
  {code:"BZK",n:"Брянск",lat:53.2142,lng:34.1764},
  {code:"OGZ",n:"Владикавказ Беслан",lat:43.2051,lng:44.6066},
  {code:"RGK",n:"Горно-Алтайск",lat:51.9667,lng:85.8333},
  {code:"GRV",n:"Грозный",lat:43.3883,lng:45.6997},
  {code:"IJK",n:"Ижевск",lat:56.8281,lng:53.4575},
  {code:"KEJ",n:"Кемерово",lat:55.2701,lng:86.1072},
  {code:"KLF",n:"Калуга",lat:54.5493,lng:36.3675},
  {code:"URS",n:"Курск",lat:51.7506,lng:36.2956},
  {code:"LPK",n:"Липецк",lat:52.7028,lng:39.5378},
  {code:"GDX",n:"Магадан Сокол",lat:59.9100,lng:150.7200},
  {code:"MQF",n:"Магнитогорск",lat:53.3931,lng:58.7556},
  {code:"MCX",n:"Махачкала Уйташ",lat:42.8168,lng:47.6523},
  {code:"MMK",n:"Мурманск",lat:68.7817,lng:32.7508},
  {code:"NAL",n:"Нальчик",lat:43.5129,lng:43.6366},
  {code:"NJC",n:"Нижневартовск",lat:60.9493,lng:76.4836},
  {code:"NBC",n:"Нижнекамск Бегишево",lat:55.5647,lng:52.0925},
  {code:"NOZ",n:"Новокузнецк",lat:53.8114,lng:86.8772},
  {code:"NSK",n:"Норильск Алыкель",lat:69.3111,lng:87.3322},
  {code:"NUX",n:"Новый Уренгой",lat:66.0694,lng:76.5203},
  {code:"REN",n:"Оренбург",lat:51.7958,lng:55.4567},
  {code:"OSW",n:"Орск",lat:51.0725,lng:58.5956},
  {code:"PES",n:"Петрозаводск",lat:61.8852,lng:34.1547},
  {code:"PKC",n:"Петропавловск-Камчатский",lat:53.1679,lng:158.4536},
  {code:"PKV",n:"Псков",lat:57.7839,lng:28.3956},
  {code:"GSV",n:"Саратов Гагарин",lat:51.7128,lng:46.1711},
  {code:"STW",n:"Ставрополь",lat:45.1092,lng:42.1128},
  {code:"SCW",n:"Сыктывкар",lat:61.6470,lng:50.8451},
  {code:"TOF",n:"Томск",lat:56.3803,lng:85.2083},
  {code:"IAR",n:"Ярославль Туношна",lat:57.5607,lng:40.1574},
  {code:"UUS",n:"Южно-Сахалинск",lat:46.8887,lng:142.7175},
  {code:"HTA",n:"Чита Кадала",lat:52.0263,lng:113.3056},
  {code:"CSY",n:"Чебоксары",lat:56.0903,lng:47.3473},
  {code:"ULY",n:"Ульяновск",lat:54.4010,lng:48.8027},
  {code:"KGP",n:"Когалым",lat:62.1900,lng:74.5300},
  {code:"NOJ",n:"Ноябрьск",lat:63.1833,lng:75.2700},
  {code:"HMA",n:"Ханты-Мансийск",lat:61.0286,lng:69.0861},
  {code:"NYA",n:"Нягань",lat:62.1100,lng:65.6150},
  {code:"ABA",n:"Абакан",lat:53.7400,lng:91.3850},
  {code:"UIK",n:"Усть-Илимск",lat:58.1350,lng:102.5660},
  {code:"PYJ",n:"Полярный",lat:66.4004,lng:112.0300},
  {code:"MJZ",n:"Мирный",lat:62.5347,lng:114.0389},
  {code:"CKH",n:"Чокурдах",lat:70.6231,lng:147.9019},
  {code:"DYR",n:"Анадырь Угольный",lat:64.7347,lng:177.7415},
  {code:"SIP",n:"Симферополь",lat:45.0522,lng:33.9752},
  {code:"IWA",n:"Иваново Южный",lat:56.9394,lng:40.9408},
  {code:"UUA",n:"Бугульма",lat:54.6400,lng:52.8017},
  {code:"NEF",n:"Нефтекамск",lat:56.1069,lng:54.3472},
  {code:"NYM",n:"Надым",lat:65.4809,lng:72.6989},
  {code:"SLY",n:"Салехард",lat:66.5908,lng:66.6110},
  {code:"OYA",n:"Ноябрьск старый",lat:63.1830,lng:75.2700},
  {code:"IRM",n:"Игрим",lat:63.1983,lng:64.4392},
  {code:"EZV",n:"Берёзово",lat:63.9210,lng:65.0485},
  {code:"KVK",n:"Кировск-Апатиты",lat:67.4633,lng:33.5883},
  {code:"NNM",n:"Нарьян-Мар",lat:67.6400,lng:53.1219},
  {code:"AMV",n:"Амдерма",lat:69.7631,lng:61.5564},
  {code:"KSZ",n:"Котлас",lat:61.2364,lng:46.6975},
  {code:"CEE",n:"Череповец",lat:59.2736,lng:38.0158},
  {code:"VGD",n:"Вологда",lat:59.2817,lng:39.9450},
  {code:"TYA",n:"Тула Клоково",lat:54.2400,lng:37.6000},
  {code:"EIE",n:"Енисейск",lat:58.4675,lng:92.1125},
  {code:"SWT",n:"Стрежевой",lat:60.7094,lng:77.6600},
  {code:"TQL",n:"Тарко-Сале",lat:64.9211,lng:77.7981},
  {code:"URJ",n:"Урай",lat:60.1167,lng:64.7833},
  {code:"OHO",n:"Охотск",lat:59.4101,lng:143.0565},
  {code:"ITU",n:"Итуруп",lat:45.2563,lng:147.9555},
  {code:"BVV",n:"Буревестник (Итуруп)",lat:44.9200,lng:147.6200},
  {code:"EKS",n:"Шахтёрск",lat:49.1900,lng:142.0800},
  {code:"DEE",n:"Южно-Курильск",lat:44.2500,lng:146.0000},
  {code:"ZIX",n:"Жиганск",lat:66.7967,lng:123.3614},
  {code:"SEK",n:"Среднеколымск",lat:67.4800,lng:153.7350},
  /* СНГ */
  {code:"MSQ",n:"Минск",lat:53.8825,lng:28.0307},
  {code:"GME",n:"Гомель",lat:52.5270,lng:31.0167},
  {code:"BQT",n:"Брест",lat:52.1083,lng:23.8981},
  {code:"EVN",n:"Ереван Звартноц",lat:40.1473,lng:44.3959},
  {code:"LWN",n:"Гюмри",lat:40.7504,lng:43.8593},
  {code:"TBS",n:"Тбилиси",lat:41.6692,lng:44.9547},
  {code:"BUS",n:"Батуми",lat:41.6103,lng:41.5997},
  {code:"KUT",n:"Кутаиси",lat:42.1767,lng:42.4826},
  {code:"GYD",n:"Баку Гейдар Алиев",lat:40.4675,lng:50.0467},
  {code:"ALA",n:"Алматы",lat:43.3521,lng:77.0405},
  {code:"NQZ",n:"Астана",lat:51.0222,lng:71.4669},
  {code:"CIT",n:"Шымкент",lat:42.3642,lng:69.4789},
  {code:"SCO",n:"Актау",lat:43.8601,lng:51.0910},
  {code:"GUW",n:"Атырау",lat:47.1219,lng:51.8214},
  {code:"UKK",n:"Усть-Каменогорск",lat:50.0366,lng:82.4942},
  {code:"PWQ",n:"Павлодар",lat:52.1950,lng:77.0739},
  {code:"KSN",n:"Костанай",lat:53.2069,lng:63.5503},
  {code:"TAS",n:"Ташкент",lat:41.2579,lng:69.2812},
  {code:"SKD",n:"Самарканд",lat:39.7005,lng:66.9838},
  {code:"BHK",n:"Бухара",lat:39.7750,lng:64.4833},
  {code:"UGC",n:"Ургенч",lat:41.5843,lng:60.6417},
  {code:"FEG",n:"Фергана",lat:40.3587,lng:71.7450},
  {code:"FRU",n:"Бишкек Манас",lat:43.0613,lng:74.4776},
  {code:"OSS",n:"Ош",lat:40.6090,lng:72.7933},
  {code:"DYU",n:"Душанбе",lat:38.5433,lng:68.8250},
  {code:"ASB",n:"Ашхабад",lat:37.9868,lng:58.3610},
  /* Китай */
  {code:"PEK",n:"Пекин Capital",lat:40.0799,lng:116.6031},
  {code:"PKX",n:"Пекин Daxing",lat:39.5098,lng:116.4105},
  {code:"PVG",n:"Шанхай Пудун",lat:31.1443,lng:121.8083},
  {code:"SHA",n:"Шанхай Хунцяо",lat:31.1979,lng:121.3363},
  {code:"CAN",n:"Гуанчжоу",lat:23.3924,lng:113.2988},
  {code:"TFU",n:"Чэнду Tianfu",lat:30.3125,lng:104.4410},
  {code:"CTU",n:"Чэнду Shuangliu",lat:30.5785,lng:103.9471},
  {code:"HGH",n:"Ханчжоу",lat:30.2295,lng:120.4344},
  {code:"XIY",n:"Сиань",lat:34.4471,lng:108.7516},
  {code:"HAK",n:"Хайкоу",lat:19.9349,lng:110.4590},
  {code:"SYX",n:"Санья",lat:18.3029,lng:109.4123},
  {code:"SZX",n:"Шэньчжэнь",lat:22.6393,lng:113.8107},
  {code:"CKG",n:"Чунцин",lat:29.7192,lng:106.6417},
  {code:"KMG",n:"Куньмин",lat:25.1019,lng:102.9292},
  {code:"WUH",n:"Ухань",lat:30.7838,lng:114.2081},
  {code:"CSX",n:"Чанша",lat:28.1892,lng:113.2196},
  {code:"NKG",n:"Нанкин",lat:31.7420,lng:118.8620},
  {code:"TSN",n:"Тяньцзинь",lat:39.1244,lng:117.3462},
  {code:"DLC",n:"Далянь",lat:38.9657,lng:121.5386},
  {code:"SHE",n:"Шэньян",lat:41.6398,lng:123.4834},
  {code:"HRB",n:"Харбин",lat:45.6234,lng:126.2503},
  {code:"URC",n:"Урумчи",lat:43.9071,lng:87.4742},
  {code:"XMN",n:"Сямэнь",lat:24.5440,lng:118.1277},
  {code:"FOC",n:"Фучжоу",lat:25.9351,lng:119.6633},
  {code:"NNG",n:"Наньнин",lat:22.6083,lng:108.1722},
  /* Италия */
  {code:"MXP",n:"Милан Мальпенса",lat:45.6306,lng:8.7281},
  {code:"LIN",n:"Милан Линате",lat:45.4451,lng:9.2767},
  {code:"BGY",n:"Бергамо Orio",lat:45.6739,lng:9.7042},
  {code:"FCO",n:"Рим Фьюмичино",lat:41.8003,lng:12.2389},
  {code:"CIA",n:"Рим Чампино",lat:41.7994,lng:12.5949},
  {code:"NAP",n:"Неаполь",lat:40.8847,lng:14.2908},
  {code:"VCE",n:"Венеция Марко Поло",lat:45.5053,lng:12.3519},
  {code:"FLR",n:"Флоренция",lat:43.8100,lng:11.2051},
  {code:"BLQ",n:"Болонья",lat:44.5354,lng:11.2887},
  {code:"TRN",n:"Турин",lat:45.2008,lng:7.6496},
  {code:"GOA",n:"Генуя",lat:44.4133,lng:8.8375},
  {code:"PSA",n:"Пиза",lat:43.6839,lng:10.3927},
  {code:"BRI",n:"Бари",lat:41.1389,lng:16.7606},
  {code:"PMO",n:"Палермо",lat:38.1760,lng:13.0910},
  {code:"CTA",n:"Катания",lat:37.4668,lng:15.0664},
  {code:"CAG",n:"Кальяри",lat:39.2515,lng:9.0543},
  /* Ближний Восток / Азия / Европа (частые направления) */
  {code:"DXB",n:"Дубай",lat:25.2532,lng:55.3657},
  {code:"DWC",n:"Дубай World Central",lat:24.9180,lng:55.1614},
  {code:"AUH",n:"Абу-Даби",lat:24.4330,lng:54.6511},
  {code:"SHJ",n:"Шарджа",lat:25.3286,lng:55.5172},
  {code:"IST",n:"Стамбул",lat:41.2753,lng:28.7519},
  {code:"SAW",n:"Стамбул Sabiha",lat:40.8986,lng:29.3092},
  {code:"AYT",n:"Анталья",lat:36.8987,lng:30.8005},
  {code:"ESB",n:"Анкара",lat:40.1281,lng:32.9951},
  {code:"BKK",n:"Бангкок Suvarnabhumi",lat:13.6900,lng:100.7501},
  {code:"DMK",n:"Бангкок Don Mueang",lat:13.9126,lng:100.6068},
  {code:"HKT",n:"Пхукет",lat:8.1132,lng:98.3169},
  {code:"CNX",n:"Чиангмай",lat:18.7668,lng:98.9626},
  {code:"DOH",n:"Доха",lat:25.2731,lng:51.6081},
  {code:"RUH",n:"Эр-Рияд",lat:24.9576,lng:46.6988},
  {code:"JED",n:"Джидда",lat:21.6796,lng:39.1565},
  {code:"CAI",n:"Каир",lat:30.1219,lng:31.4056},
  {code:"SSH",n:"Шарм-эль-Шейх",lat:27.9773,lng:34.3950},
  {code:"HRG",n:"Хургада",lat:27.1783,lng:33.7994},
  {code:"CDG",n:"Париж Charles de Gaulle",lat:49.0097,lng:2.5479},
  {code:"ORY",n:"Париж Orly",lat:48.7233,lng:2.3794},
  {code:"LHR",n:"Лондон Heathrow",lat:51.4700,lng:-0.4543},
  {code:"LGW",n:"Лондон Gatwick",lat:51.1537,lng:-0.1821},
  {code:"FRA",n:"Франкфурт",lat:50.0379,lng:8.5622},
  {code:"MUC",n:"Мюнхен",lat:48.3538,lng:11.7861},
  {code:"AMS",n:"Амстердам",lat:52.3105,lng:4.7683},
  {code:"BCN",n:"Барселона",lat:41.2971,lng:2.0785},
  {code:"MAD",n:"Мадрид",lat:40.4983,lng:-3.5676},
  {code:"ATH",n:"Афины",lat:37.9364,lng:23.9445},
  {code:"VIE",n:"Вена",lat:48.1103,lng:16.5697},
  {code:"PRG",n:"Прага",lat:50.1008,lng:14.2600},
  {code:"WAW",n:"Варшава",lat:52.1657,lng:20.9671},
  {code:"BUD",n:"Будапешт",lat:47.4298,lng:19.2611},
  {code:"HEL",n:"Хельсинки",lat:60.3172,lng:24.9633},
  {code:"DEL",n:"Дели",lat:28.5562,lng:77.1000},
  {code:"BOM",n:"Мумбаи",lat:19.0896,lng:72.8656},
  {code:"ICN",n:"Сеул Incheon",lat:37.4602,lng:126.4407},
  {code:"NRT",n:"Токио Narita",lat:35.7720,lng:140.3929},
  {code:"HND",n:"Токио Haneda",lat:35.5494,lng:139.7798},
  {code:"SIN",n:"Сингапур",lat:1.3644,lng:103.9915},
  {code:"HKG",n:"Гонконг",lat:22.3080,lng:113.9185},
  {code:"KUL",n:"Куала-Лумпур",lat:2.7456,lng:101.7099},
  {code:"MNL",n:"Манила",lat:14.5086,lng:121.0196},
  {code:"CGK",n:"Джакарта",lat:-6.1256,lng:106.6559},
  {code:"SGN",n:"Хошимин",lat:10.8188,lng:106.6520},
  {code:"HAN",n:"Ханой",lat:21.2212,lng:105.8072},
  {code:"GDZ",n:"Геленджик",lat:44.5822,lng:38.0122},
  {code:"ESL",n:"Элиста",lat:46.3739,lng:44.3309},
  {code:"IAA",n:"Игарка",lat:67.4372,lng:86.6219},
  {code:"HTG",n:"Хатанга",lat:71.9781,lng:102.4900},
  {code:"UKX",n:"Усть-Кут",lat:56.8567,lng:105.7300},
  {code:"KGF",n:"Караганда",lat:49.6708,lng:73.3344},
  {code:"DMB",n:"Тараз",lat:42.8536,lng:71.3036},
  {code:"PPK",n:"Петропавловск",lat:54.7747,lng:69.1839},
  {code:"AKX",n:"Актобе",lat:50.2458,lng:57.2067},
  {code:"URA",n:"Уральск",lat:51.1508,lng:51.5431},
  {code:"NCU",n:"Нукус",lat:42.4884,lng:59.6233},
  {code:"AZN",n:"Андижан",lat:40.7277,lng:72.2940},
  {code:"TAO",n:"Циндао",lat:36.2661,lng:120.3744},
  {code:"CGO",n:"Чжэнчжоу",lat:34.5197,lng:113.8409},
  {code:"TNA",n:"Цзинань",lat:36.8572,lng:117.2160},
  {code:"HFE",n:"Хэфэй",lat:31.7800,lng:117.2980},
  {code:"NGB",n:"Нинбо",lat:29.8267,lng:121.4620},
  {code:"WNZ",n:"Вэньчжоу",lat:27.9122,lng:120.8520},
  {code:"KWE",n:"Гуйян",lat:26.5385,lng:106.8007},
  {code:"KWL",n:"Гуйлинь",lat:25.2181,lng:110.0393},
  {code:"LHW",n:"Ланьчжоу",lat:36.5152,lng:103.6208},
  {code:"INC",n:"Иньчуань",lat:38.3217,lng:106.3933},
  {code:"HET",n:"Хух-Хото",lat:40.8514,lng:111.8241},
  {code:"CGQ",n:"Чанчунь",lat:43.9962,lng:125.6850},
  {code:"TRS",n:"Триест",lat:45.8275,lng:13.4722},
  {code:"VRN",n:"Верона Villafranca",lat:45.3957,lng:10.8885},
  {code:"AOI",n:"Анкона",lat:43.6163,lng:13.3623},
  {code:"BDS",n:"Бриндизи",lat:40.6576,lng:17.9470},
  {code:"SUF",n:"Ламеция-Терме",lat:38.9054,lng:16.2423},
  {code:"OLB",n:"Ольбия",lat:40.8987,lng:9.5176},
  {code:"ADB",n:"Измир",lat:38.2924,lng:27.1570},
  {code:"BJV",n:"Бодрум",lat:37.2506,lng:27.6643},
  {code:"DLM",n:"Даламан",lat:36.7131,lng:28.7925},
  {code:"GZT",n:"Газиантеп",lat:36.9472,lng:37.4787},
  {code:"TZX",n:"Трабзон",lat:40.9951,lng:39.7897},
  {code:"ASR",n:"Кайсери",lat:38.7704,lng:35.4954},
  {code:"UTP",n:"Утапао",lat:12.6799,lng:101.0050},
  {code:"HDY",n:"Хатъяй",lat:6.9332,lng:100.3930},
  {code:"KBV",n:"Краби",lat:8.0992,lng:98.9862},
  {code:"USM",n:"Самуи",lat:9.5478,lng:100.0623},
  {code:"CEI",n:"Чианграй",lat:19.9523,lng:99.8829},
  {code:"BAH",n:"Бахрейн",lat:26.2708,lng:50.6336},
  {code:"MCT",n:"Маскат",lat:23.5933,lng:58.2844},
  {code:"KWI",n:"Кувейт",lat:29.2266,lng:47.9689},
  {code:"AMM",n:"Амман",lat:31.7226,lng:35.9932},
  {code:"TLV",n:"Тель-Авив",lat:32.0114,lng:34.8867},
  {code:"LCA",n:"Ларнака",lat:34.8751,lng:33.6249},
  {code:"PFO",n:"Пафос",lat:34.7180,lng:32.4857},
  {code:"HER",n:"Ираклион",lat:35.3397,lng:25.1803},
  {code:"RHO",n:"Родос",lat:36.4054,lng:28.0862},
  {code:"SKG",n:"Салоники",lat:40.5197,lng:22.9709},
  {code:"OTP",n:"Бухарест",lat:44.5711,lng:26.0850},
  {code:"SOF",n:"София",lat:42.6952,lng:23.4062},
  {code:"BEG",n:"Белград",lat:44.8184,lng:20.3091},
  {code:"ZAG",n:"Загреб",lat:45.7429,lng:16.0688},
  {code:"LJU",n:"Любляна",lat:46.2237,lng:14.4576},
  {code:"KRK",n:"Краков",lat:50.0777,lng:19.7848},
  {code:"GDN",n:"Гданьск",lat:54.3776,lng:18.4662},
  {code:"WRO",n:"Вроцлав",lat:51.1027,lng:16.8858},
  {code:"RIX",n:"Рига",lat:56.9236,lng:23.9711},
  {code:"TLL",n:"Таллин",lat:59.4133,lng:24.8328},
  {code:"VNO",n:"Вильнюс",lat:54.6341,lng:25.2858},
  {code:"KUN",n:"Каунас",lat:54.9639,lng:24.0848},
  {code:"OSL",n:"Осло",lat:60.1939,lng:11.1004},
  {code:"CPH",n:"Копенгаген",lat:55.6180,lng:12.6560},
  {code:"ARN",n:"Стокгольм Arlanda",lat:59.6519,lng:17.9186},
  {code:"GOT",n:"Гётеборг",lat:57.6628,lng:12.2798},
  {code:"DUS",n:"Дюссельдорф",lat:51.2895,lng:6.7668},
  {code:"HAM",n:"Гамбург",lat:53.6304,lng:9.9882},
  {code:"BER",n:"Берлин Brandenburg",lat:52.3667,lng:13.5033},
  {code:"ZRH",n:"Цюрих",lat:47.4647,lng:8.5492},
  {code:"GVA",n:"Женева",lat:46.2381,lng:6.1090},
  {code:"BRU",n:"Брюссель",lat:50.9014,lng:4.4844},
  {code:"LIS",n:"Лиссабон",lat:38.7813,lng:-9.1359},
  {code:"OPO",n:"Порту",lat:41.2481,lng:-8.6814},
  {code:"AGP",n:"Малага",lat:36.6749,lng:-4.4991},
  {code:"ALC",n:"Аликанте",lat:38.2822,lng:-0.5582},
  {code:"PMI",n:"Пальма",lat:39.5517,lng:2.7388},
  {code:"IBZ",n:"Ибица",lat:38.8729,lng:1.3731},
  {code:"SVQ",n:"Севилья",lat:37.4180,lng:-5.8931},
  {code:"VLC",n:"Валенсия",lat:39.4893,lng:-0.4816},
  {code:"NCE",n:"Ницца",lat:43.6584,lng:7.2179},
  {code:"LYS",n:"Лион",lat:45.7256,lng:5.0811},
  {code:"MRS",n:"Марсель",lat:43.4393,lng:5.2214},
  {code:"TLS",n:"Тулуза",lat:43.6291,lng:1.3638},
  {code:"VTB",n:"Витебск",lat:55.1265,lng:30.3496},
  {code:"MHP",n:"Могилёв",lat:53.9549,lng:30.0951},
  {code:"GNJ",n:"Гянджа",lat:40.7377,lng:46.3176},
  {code:"LLK",n:"Ленкорань",lat:38.7464,lng:48.8178},
  {code:"NAJ",n:"Нахичевань",lat:39.1888,lng:45.4584},
  {code:"KZO",n:"Кызылорда",lat:44.7069,lng:65.5925},
  {code:"PLX",n:"Семей",lat:50.3513,lng:80.2344},
  {code:"NMA",n:"Наманган",lat:40.9846,lng:71.5567},
  {code:"TMJ",n:"Термез",lat:37.2867,lng:67.3100},
  {code:"LBD",n:"Худжанд",lat:40.2154,lng:69.6947},
  {code:"TJU",n:"Куляб",lat:37.9881,lng:69.8050},
  {code:"CRZ",n:"Туркменбаши",lat:40.0633,lng:53.0072},
  {code:"MYP",n:"Мары",lat:37.6194,lng:61.8967},
  {code:"KIV",n:"Кишинёв",lat:46.9277,lng:28.9310},
  {code:"IEV",n:"Киев Жуляны",lat:50.4019,lng:30.4497},
  {code:"KBP",n:"Киев Борисполь",lat:50.3450,lng:30.8947},
  {code:"ODS",n:"Одесса",lat:46.4268,lng:30.6765},
  {code:"LWO",n:"Львов",lat:49.8125,lng:23.9561},
  {code:"DNK",n:"Днепр",lat:48.3572,lng:35.1006},
  {code:"HRK",n:"Харьков",lat:49.9248,lng:36.2900},
  {code:"UUD",n:"Улан-Удэ",lat:51.8078,lng:107.4380},
  {code:"TGK",n:"Таганрог",lat:47.1983,lng:38.8492},
  {code:"TBW",n:"Тамбов",lat:52.8061,lng:41.4828},
  {code:"SKX",n:"Саранск",lat:54.1251,lng:45.2123},
  {code:"JOK",n:"Йошкар-Ола",lat:56.7006,lng:47.9047},
  {code:"OSF",n:"Орёл",lat:52.9347,lng:36.0028},
  {code:"NFG",n:"Нефтеюганск",lat:61.1083,lng:72.6500},
  {code:"CNN",n:"Каннск",lat:56.2556,lng:95.6667},
  {code:"NER",n:"Нерюнгри",lat:56.9139,lng:124.9140},
  {code:"LDG",n:"Лешуконское",lat:64.8958,lng:45.7228},
  {code:"USK",n:"Усинск",lat:66.0047,lng:57.3672},
  {code:"VKT",n:"Воркута",lat:67.4886,lng:63.9931},
  {code:"UTS",n:"Усть-Цильма",lat:65.4372,lng:52.2000},
  {code:"IGT",n:"Магас",lat:43.3223,lng:45.0126},
  {code:"KMW",n:"Кострома Сокеркино",lat:57.7969,lng:41.0194},
  {code:"RTW",n:"Саратов (стар.)",lat:51.5650,lng:46.0467},
  {code:"OKT",n:"Октябрьский",lat:54.4400,lng:53.3880},
  {code:"EIK",n:"Ейск",lat:46.6800,lng:38.2100},
  {code:"TYD",n:"Тында",lat:55.2844,lng:124.7790},
  {code:"BQJ",n:"Батагай",lat:67.6489,lng:134.6950},
  {code:"SUY",n:"Сура",lat:63.0000,lng:45.0000},
  {code:"CSH",n:"Соловки",lat:65.0300,lng:35.7330},
  {code:"DKS",n:"Диксон",lat:73.5170,lng:80.5720},
  {code:"TGP",n:"Подкаменная Тунгуска",lat:61.5900,lng:89.9900},
  {code:"BWO",n:"Балаково",lat:51.8580,lng:47.3160},
  {code:"ULK",n:"Ленск",lat:60.7236,lng:114.8250},
  {code:"OYG",n:"Олёкминск",lat:60.3972,lng:120.4710},
  {code:"VHV",n:"Верхневилюйск",lat:63.3667,lng:120.2667},
  {code:"BQG",n:"Богородское",lat:52.3800,lng:140.4480},
  {code:"NLI",n:"Николаевск-на-Амуре",lat:53.1540,lng:140.6500},
  {code:"PWE",n:"Певек",lat:69.7833,lng:170.5970},
  {code:"KDY",n:"Тында",lat:55.2844,lng:124.7790},
  {code:"SUK",n:"Сунтар",lat:62.1850,lng:117.6360},
  {code:"BGN",n:"Белая Гора",lat:68.5560,lng:146.1850},
  {code:"CYX",n:"Черский",lat:68.7400,lng:161.3300},
  {code:"IKS",n:"Тикси",lat:71.6977,lng:128.9030},
  {code:"ADH",n:"Алдан",lat:58.6031,lng:125.4090},
  {code:"TLK",n:"Талакан",lat:59.8760,lng:111.0410},
  {code:"RAT",n:"Радужный",lat:62.1580,lng:77.3290},
  {code:"KKQ",n:"Красноселькуп",lat:65.7110,lng:82.4550},
  {code:"YMK",n:"Мыс Каменный",lat:68.4680,lng:73.5960},
  {code:"SBT",n:"Сабетта",lat:71.2190,lng:72.0520},
  {code:"KXK",n:"Комсомольск-на-Амуре",lat:50.4090,lng:136.9340},
  {code:"EDC",n:"Элиста",lat:46.3740,lng:44.3300},
  {code:"RVI",n:"Ростов (стар.)",lat:47.2580,lng:39.8180},
  {code:"KVX",n:"Киров Победилово",lat:58.5033,lng:49.3483},
  {code:"OEL",n:"Орёл",lat:52.9347,lng:36.0028},
  {code:"LNX",n:"Смоленск",lat:54.8240,lng:32.0250},
  {code:"TOX",n:"Тобольск",lat:58.1360,lng:68.2330}
];

var FLIGHT_PAIRS = {
  "AAQ-DME":1,
  "AAQ-LED":1,
  "AAQ-SVO":1,
  "AAQ-VKO":1,
  "ABA-DME":1,
  "ABA-LED":1,
  "ABA-SVO":1,
  "ABA-VKO":1,
  "AER-DME":1,
  "AER-KRR":1,
  "AER-LED":1,
  "AER-MRV":1,
  "AER-ROV":1,
  "AER-SVO":1,
  "AER-SVX":1,
  "AER-VKO":1,
  "ALA-SVO":1,
  "ARH-DME":1,
  "ARH-LED":1,
  "ARH-SVO":1,
  "ARH-VKO":1,
  "ASF-DME":1,
  "ASF-LED":1,
  "ASF-SVO":1,
  "ASF-VKO":1,
  "AYT-SVO":1,
  "BAX-DME":1,
  "BAX-LED":1,
  "BAX-SVO":1,
  "BAX-VKO":1,
  "BGY-BLQ":1,
  "BGY-CIA":1,
  "BGY-FCO":1,
  "BGY-FLR":1,
  "BGY-GOA":1,
  "BGY-NAP":1,
  "BGY-PSA":1,
  "BGY-TRN":1,
  "BGY-VCE":1,
  "BKK-HKT":1,
  "BKK-SVO":1,
  "BLQ-CIA":1,
  "BLQ-FCO":1,
  "BLQ-GOA":1,
  "BLQ-LIN":1,
  "BLQ-MXP":1,
  "BLQ-NAP":1,
  "BLQ-PSA":1,
  "BLQ-TRN":1,
  "BLQ-VCE":1,
  "BQS-DME":1,
  "BQS-LED":1,
  "BQS-SVO":1,
  "BQS-VKO":1,
  "CAN-CTU":1,
  "CAN-HAK":1,
  "CAN-HGH":1,
  "CAN-PEK":1,
  "CAN-PKX":1,
  "CAN-PVG":1,
  "CAN-SHA":1,
  "CAN-SYX":1,
  "CAN-SZX":1,
  "CAN-TFU":1,
  "CAN-XIY":1,
  "CEK-DME":1,
  "CEK-LED":1,
  "CEK-SVO":1,
  "CEK-VKO":1,
  "CIA-FLR":1,
  "CIA-GOA":1,
  "CIA-LIN":1,
  "CIA-MXP":1,
  "CIA-NAP":1,
  "CIA-PSA":1,
  "CIA-TRN":1,
  "CIA-VCE":1,
  "CSY-DME":1,
  "CSY-LED":1,
  "CSY-SVO":1,
  "CSY-VKO":1,
  "CTU-PEK":1,
  "CTU-PVG":1,
  "DME-DWC":1,
  "DME-DXB":1,
  "DME-EGO":1,
  "DME-GDX":1,
  "DME-GOJ":1,
  "DME-GRV":1,
  "DME-GSV":1,
  "DME-HTA":1,
  "DME-IJK":1,
  "DME-IKT":1,
  "DME-KEJ":1,
  "DME-KGD":1,
  "DME-KHV":1,
  "DME-KJA":1,
  "DME-KRR":1,
  "DME-KUF":1,
  "DME-KZN":1,
  "DME-LED":1,
  "DME-MCX":1,
  "DME-MMK":1,
  "DME-MQF":1,
  "DME-MRV":1,
  "DME-NBC":1,
  "DME-NJC":1,
  "DME-NSK":1,
  "DME-NUX":1,
  "DME-OMS":1,
  "DME-OVB":1,
  "DME-PEE":1,
  "DME-PKC":1,
  "DME-REN":1,
  "DME-ROV":1,
  "DME-SCW":1,
  "DME-SGC":1,
  "DME-SIP":1,
  "DME-STW":1,
  
  "DME-SVX":1,
  "DME-TJM":1,
  "DME-TOF":1,
  "DME-UFA":1,
  "DME-ULY":1,
  "DME-UUS":1,
  
  "DME-VOG":1,
  "DME-VOZ":1,
  "DME-VVO":1,
  "DME-YKS":1,
  
  "DXB-SVO":1,
  "EGO-LED":1,
  "EGO-SVO":1,
  "EGO-VKO":1,
  "EVN-MXP":1,
  "EVN-NAP":1,
  "FCO-FLR":1,
  "FCO-GOA":1,
  "FCO-LIN":1,
  "FCO-MXP":1,
  "FCO-NAP":1,
  "FCO-PSA":1,
  "FCO-TRN":1,
  "FCO-VCE":1,
  "FLR-GOA":1,
  "FLR-LIN":1,
  "FLR-MXP":1,
  "FLR-NAP":1,
  "FLR-TRN":1,
  "FLR-VCE":1,
  "FRU-SVO":1,
  "GDX-LED":1,
  "GDX-SVO":1,
  "GDX-VKO":1,
  "GOA-LIN":1,
  "GOA-MXP":1,
  "GOA-NAP":1,
  "GOA-PSA":1,
  "GOA-TRN":1,
  "GOA-VCE":1,
  "GOJ-LED":1,
  "GOJ-SVO":1,
  "GOJ-VKO":1,
  "GRV-LED":1,
  "GRV-SVO":1,
  "GRV-VKO":1,
  "GSV-LED":1,
  "GSV-SVO":1,
  "GSV-VKO":1,
  "GYD-SVO":1,
  "HAK-PEK":1,
  "HAK-PVG":1,
  "HAK-SVO":1,
  "HGH-PEK":1,
  "HGH-PVG":1,
  "HTA-LED":1,
  "HTA-SVO":1,
  "HTA-VKO":1,
  "IJK-LED":1,
  "IJK-SVO":1,
  "IJK-VKO":1,
  "IKT-KJA":1,
  "IKT-LED":1,
  "IKT-OVB":1,
  "IKT-SVO":1,
  "IKT-VKO":1,
  "IKT-VVO":1,
  "IST-SVO":1,
  "KEJ-LED":1,
  "KEJ-SVO":1,
  "KEJ-VKO":1,
  "KGD-LED":1,
  "KGD-SVO":1,
  "KGD-VKO":1,
  "KHV-LED":1,
  "KHV-SVO":1,
  "KHV-VKO":1,
  "KHV-VVO":1,
  "KJA-LED":1,
  "KJA-OVB":1,
  "KJA-SVO":1,
  "KJA-VKO":1,
  "KRR-LED":1,
  "KRR-SVO":1,
  "KRR-VKO":1,
  "KUF-LED":1,
  "KUF-SVO":1,
  "KUF-VKO":1,
  "KZN-LED":1,
  "KZN-SVO":1,
  "KZN-SVX":1,
  "KZN-VKO":1,
  "LED-MCX":1,
  "LED-MMK":1,
  "LED-MQF":1,
  "LED-MRV":1,
  "LED-NBC":1,
  "LED-NJC":1,
  "LED-NSK":1,
  "LED-NUX":1,
  "LED-OMS":1,
  "LED-OVB":1,
  "LED-PEE":1,
  "LED-PKC":1,
  "LED-REN":1,
  "LED-ROV":1,
  "LED-SCW":1,
  "LED-SGC":1,
  "LED-SIP":1,
  "LED-STW":1,
  "LED-SVO":1,
  "LED-SVX":1,
  "LED-TJM":1,
  "LED-TOF":1,
  "LED-UFA":1,
  "LED-ULY":1,
  "LED-UUS":1,
  "LED-VKO":1,
  "LED-VOG":1,
  "LED-VOZ":1,
  "LED-VVO":1,
  "LED-YKS":1,
  "LED-ZIA":1,
  "LIN-NAP":1,
  "LIN-PSA":1,
  "LIN-TRN":1,
  "LIN-VCE":1,
  "MCX-SVO":1,
  "MCX-VKO":1,
  "MMK-SVO":1,
  "MMK-VKO":1,
  "MQF-SVO":1,
  "MQF-VKO":1,
  "MRV-SVO":1,
  "MRV-VKO":1,
  "MSQ-SVO":1,
  "MXP-NAP":1,
  "MXP-PSA":1,
  "MXP-TRN":1,
  "MXP-VCE":1,
  "NAP-PSA":1,
  "NAP-TRN":1,
  "NAP-VCE":1,
  "NBC-SVO":1,
  "NBC-VKO":1,
  "NJC-SVO":1,
  "NJC-VKO":1,
  "NQZ-SVO":1,
  "NSK-SVO":1,
  "NSK-VKO":1,
  "NUX-SVO":1,
  "NUX-SVX":1,
  "NUX-VKO":1,
  "OMS-OVB":1,
  "OMS-SVO":1,
  "OMS-VKO":1,
  "OVB-SVO":1,
  "OVB-SVX":1,
  "OVB-VKO":1,
  "PEE-SVO":1,
  "PEE-VKO":1,
  "PEK-PVG":1,
  "PEK-SHA":1,
  "PEK-SVO":1,
  "PEK-SYX":1,
  "PEK-SZX":1,
  "PEK-TFU":1,
  "PEK-XIY":1,
  "PKC-SVO":1,
  "PKC-VKO":1,
  "PKX-PVG":1,
  "PSA-TRN":1,
  "PSA-VCE":1,
  "PVG-SYX":1,
  "PVG-SZX":1,
  "PVG-TFU":1,
  "PVG-XIY":1,
  "REN-SVO":1,
  "REN-VKO":1,
  "ROV-SVO":1,
  "ROV-VKO":1,
  "SCW-SVO":1,
  "SCW-VKO":1,
  "SGC-SVO":1,
  "SGC-SVX":1,
  "SGC-VKO":1,
  "SIP-SVO":1,
  "SIP-VKO":1,
  "STW-SVO":1,
  "STW-VKO":1,
  "SVO-SVX":1,
  "SVO-TAS":1,
  "SVO-TBS":1,
  "SVO-TFU":1,
  "SVO-TJM":1,
  "SVO-TOF":1,
  "SVO-UFA":1,
  "SVO-ULY":1,
  "SVO-UUS":1,
  
  "SVO-VOG":1,
  "SVO-VOZ":1,
  "SVO-VVO":1,
  "SVO-YKS":1,
  
  "SVX-UFA":1,
  "SVX-VKO":1,
  "TJM-VKO":1,
  "TOF-VKO":1,
  "TRN-VCE":1,
  "UFA-VKO":1,
  "ULY-VKO":1,
  "UUS-VKO":1,
  "VKO-VOG":1,
  "VKO-VOZ":1,
  "VKO-VVO":1,
  "VKO-YKS":1,
  
};

function airportCodeOf(p){
  if(!p) return null;
  for(var i=0;i<AIRPORTS.length;i++){
    var a=AIRPORTS[i];
    if(Math.abs(a.lat-p.lat)<0.02 && Math.abs(a.lng-p.lng)<0.02) return a.code;
  }
  var m=(p.label||"").match(/\(([A-Z]{3})\)/);
  if(m) return m[1];
  return null;
}

/* ——— Авиация и ЖД: ориентиры сети ——— */
var AIR_HUBS = ["SVO","DME","VKO","ZIA","LED","AER","OVB","SVX","KZN","KRR","ROV","UFA","CEK","KJA","IKT","VVO","MRV","KGD"];
/* Доп. реальные внутренние пары (хаб–хаб и популярные) */
var EXTRA_FLIGHT_PAIRS = [
  "AER-LED","AER-KZN","AER-SVX","AER-OVB","AER-UFA","AER-KUF","AER-GOJ",
  "LED-KZN","LED-SVX","LED-OVB","LED-KGD","LED-MMK","LED-ARH","LED-KJA","LED-IKT",
  "OVB-KJA","OVB-IKT","OVB-VVO","OVB-SVX","OVB-KZN","KJA-IKT","IKT-VVO","KHV-VVO",
  "SVX-OVB","SVX-KZN","SVX-AER","UFA-SVX","UFA-KZN","OMS-OVB","OMS-SVX",
  "KRR-AER","KRR-LED","ROV-AER","MRV-AER","MRV-LED","VOG-SVO","ASF-SVO",
  "KGD-LED","KGD-SVO","SGC-SVX","SGC-OVB","NUX-SVX","YKS-SVO","YKS-OVB",
  "PKC-SVO","UUS-SVO","HTA-SVO","GDX-SVO","ABA-OVB","BAX-OVB","KEJ-OVB",
  "MSQ-SVO","MSQ-LED","EVN-SVO","EVN-LED","TBS-SVO","GYD-SVO","ALA-SVO","NQZ-SVO","TAS-SVO",
  "DXB-SVO","DXB-DME","IST-SVO","AYT-SVO","BKK-SVO","HKT-SVO","PEK-SVO","PVG-SVO"
];
function ensureFlightPairs(){
  if(typeof FLIGHT_PAIRS==="undefined") window.FLIGHT_PAIRS={};
  EXTRA_FLIGHT_PAIRS.forEach(function(p){
    var parts=p.split("-");
    if(parts.length!==2) return;
    var k=[parts[0],parts[1]].sort().join("-");
    FLIGHT_PAIRS[k]=1;
  });
}
ensureFlightPairs();

/* Временные/операционные риски аэропортов (не блок, а предупреждение) */
var AIR_RISK = {
  ROV:"Юг: возможны ограничения воздушного пространства",
  KRR:"Юг: возможны ограничения / восстановление после закрытий",
  AAQ:"Юг: возможны ограничения",
  EGO:"Центр/юг: возможные ограничения",
  BQS:"Дальний Восток: погода",
  GDZ:"Юг: возможные ограничения",
  SIP:"Возможны особые условия полётов"
};
function planeNavWarnings(codeA, codeB, dateStr){
  var w=[], c;
  [codeA,codeB].forEach(function(c){
    if(c && AIR_RISK[c]) w.push(c+": "+AIR_RISK[c]);
  });
  return w;
}

/* ЖД: типы линий для подсказки */
var RAIL_NOTES = {
  sapsan:"Сапсан: Москва (Ленинградский) — СПб (Московский), ~4 ч",
  transsib:"Транссиб: Москва — Владивосток через Казань/Екб/НСК/Иркутск",
  south:"Юг: Москва — Воронеж — Ростов — Сочи / Адлер",
  west:"Запад: Москва — Смоленск — Минск"
};

function flightAllowed(codeA, codeB){
  if(!codeA||!codeB) return false;
  codeA=String(codeA).toUpperCase(); codeB=String(codeB).toUpperCase();
  if(codeA===codeB) return false;
  /* аэропорты одного города / агломерации — трансфер, не рейс */
  var METRO=[
    ["SVO","DME","VKO","ZIA"],
    ["FCO","CIA"],
    ["MXP","LIN","BGY"],
    ["LHR","LGW","STN","LTN","LCY"],
    ["CDG","ORY","BVA"],
    ["IST","SAW"],
    ["BKK","DMK"],
    ["HND","NRT"],
    ["ICN","GMP"],
    ["JFK","EWR","LGA"],
    ["PEK","PKX"],
    ["PVG","SHA"],
    ["BER","SXF","TXL"],
    ["OSA","KIX","ITM"],
    ["SEL","ICN","GMP"]
  ];
  var i,g;
  for(i=0;i<METRO.length;i++){
    g=METRO[i];
    if(g.indexOf(codeA)>=0 && g.indexOf(codeB)>=0) return false;
  }
  var k=[codeA,codeB].sort().join("-");
  if(!FLIGHT_PAIRS[k]) return false;
  /* слишком короткое плечо (<90 км) — почти наверняка не авиа */
  if(typeof AIRPORTS!=="undefined"){
    var A=null,B=null,j;
    for(j=0;j<AIRPORTS.length;j++){
      if(AIRPORTS[j].code===codeA) A=AIRPORTS[j];
      if(AIRPORTS[j].code===codeB) B=AIRPORTS[j];
    }
    if(A&&B && typeof hav==="function" && hav(A,B)<90) return false;
  }
  return true;
}


var STATIONS = [
  {id:"samara",n:"Самара",lat:53.1870,lng:50.1220},
  {id:"tolyatti",n:"Тольятти",lat:53.5300,lng:49.3500},
  {id:"syzran",n:"Сызрань",lat:53.1580,lng:48.4680},
  {id:"penza",n:"Пенза",lat:53.1950,lng:45.0180},
  {id:"saratov",n:"Саратов",lat:51.5420,lng:46.0230},
  {id:"volgograd",n:"Волгоград",lat:48.7120,lng:44.5170},
  {id:"voronezh",n:"Воронеж",lat:51.6720,lng:39.1840},
  {id:"rostov",n:"Ростов-на-Дону",lat:47.2180,lng:39.7100},
  {id:"krasnodar",n:"Краснодар",lat:45.0350,lng:38.9750},
  {id:"sochi",n:"Сочи",lat:43.5930,lng:39.7270},
  {id:"adler",n:"Адлер",lat:43.4430,lng:39.9100},
  {id:"mineral",n:"Минеральные Воды",lat:44.2100,lng:43.1350},
  {id:"stavropol",n:"Ставрополь",lat:45.0440,lng:41.9690},
  {id:"ekb",n:"Екатеринбург",lat:56.8590,lng:60.6050},
  {id:"perm",n:"Пермь",lat:58.0050,lng:56.2480},
  {id:"tyumen",n:"Тюмень",lat:57.1530,lng:65.5340},
  {id:"omsk",n:"Омск",lat:54.9830,lng:73.3680},
  {id:"nsk",n:"Новосибирск",lat:55.0360,lng:82.8970},
  {id:"barnaul",n:"Барнаул",lat:53.3480,lng:83.7800},
  {id:"kras",n:"Красноярск",lat:56.0050,lng:92.8300},
  {id:"irk",n:"Иркутск",lat:52.2830,lng:104.2580},
  {id:"ulanude",n:"Улан-Удэ",lat:51.8340,lng:107.6060},
  {id:"chita",n:"Чита",lat:52.0340,lng:113.5000},
  {id:"khabarovsk",n:"Хабаровск",lat:48.4800,lng:135.0800},
  {id:"vl",n:"Владивосток",lat:43.1110,lng:131.8820},
  {id:"ufa",n:"Уфа",lat:54.7500,lng:55.9500},
  {id:"samara2",n:"Самара-1",lat:53.1870,lng:50.1220},
  {id:"chelyabinsk",n:"Челябинск",lat:55.1600,lng:61.4000},
  {id:"kurgan",n:"Курган",lat:55.4500,lng:65.3330},
  {id:"orel",n:"Орёл",lat:52.9700,lng:36.0700},
  {id:"kursk",n:"Курск",lat:51.7370,lng:36.1870},
  {id:"belgorod",n:"Белгород",lat:50.5950,lng:36.5870},
  {id:"bryansk",n:"Брянск",lat:53.2430,lng:34.3660},
  {id:"smolensk",n:"Смоленск",lat:54.7820,lng:32.0450},
  {id:"minsk",n:"Минск",lat:53.8900,lng:27.5510},
  {id:"brest",n:"Брест",lat:52.0970,lng:23.6900},
  {id:"vitebsk",n:"Витебск",lat:55.1900,lng:30.2000},
  {id:"gomel",n:"Гомель",lat:52.4340,lng:30.9750},
  {id:"kaluga",n:"Калуга",lat:54.5290,lng:36.2750},
  {id:"ryazan",n:"Рязань",lat:54.6290,lng:39.7360},
  {id:"tambov",n:"Тамбов",lat:52.7210,lng:41.4520},
  {id:"lipetsk",n:"Липецк",lat:52.6030,lng:39.5710},
  {id:"yar",n:"Ярославль",lat:57.6250,lng:39.8840},
  {id:"vologda",n:"Вологда",lat:59.2170,lng:39.8940},
  {id:"cherepovets",n:"Череповец",lat:59.1230,lng:37.9040},
  {id:"petrozavodsk",n:"Петрозаводск",lat:61.7850,lng:34.3470},
  {id:"murmansk",n:"Мурманск",lat:68.9700,lng:33.0750},
  {id:"arkhangelsk",n:"Архангельск",lat:64.5430,lng:40.5370},
  {id:"kaliningrad",n:"Калининград",lat:54.6950,lng:20.4980},
  {id:"novoross",n:"Новороссийск",lat:44.7240,lng:37.7680},
  {id:"anapa",n:"Анапа",lat:44.9000,lng:37.3200},
  {id:"astrakhan",n:"Астрахань",lat:46.3500,lng:48.0410},
  {id:"kirov",n:"Киров",lat:58.6030,lng:49.6680},
  {id:"izhevsk",n:"Ижевск",lat:56.8530,lng:53.2040},
  {id:"tomsk",n:"Томск",lat:56.4970,lng:84.9740},
  {id:"kemerovo",n:"Кемерово",lat:55.3550,lng:86.0870},
  {id:"novokuz",n:"Новокузнецк",lat:53.7590,lng:87.1220},
  {id:"abakan",n:"Абакан",lat:53.7210,lng:91.4420},
  {id:"blagov",n:"Благовещенск",lat:50.2900,lng:127.5270},
  {id:"komsomolsk",n:"Комсомольск-на-Амуре",lat:50.5500,lng:137.0100},
  {id:"yuzhno",n:"Южно-Сахалинск",lat:46.9590,lng:142.7380},
  {id:"ivanovo",n:"Иваново",lat:56.9990,lng:40.9730},
  {id:"kostroma",n:"Кострома",lat:57.7680,lng:40.9270},
  {id:"tver",n:"Тверь",lat:56.8580,lng:35.9170},
  {id:"vladimir",n:"Владимир",lat:56.1290,lng:40.4070},
  {id:"nn",n:"Нижний Новгород",lat:56.3100,lng:43.9370},
  {id:"kazan",n:"Казань",lat:55.7880,lng:49.1220},
  {id:"cheboksary",n:"Чебоксары",lat:56.1430,lng:47.2520},
  {id:"ulyanovsk",n:"Ульяновск",lat:54.3140,lng:48.4030},
  {id:"spb_mos",n:"Санкт-Петербург Московский",lat:59.9290,lng:30.3620},
  {id:"msk_len",n:"Москва Ленинградский",lat:55.7761,lng:37.6554},
  {id:"msk_kaz",n:"Москва Казанский",lat:55.7734,lng:37.6567},
  {id:"msk_yar",n:"Москва Ярославский",lat:55.7766,lng:37.6615},
  {id:"msk_kur",n:"Москва Курский",lat:55.7575,lng:37.6607},
  {id:"msk_pav",n:"Москва Павелецкий",lat:55.7298,lng:37.6394},
  {id:"msk_bel",n:"Москва Белорусский",lat:55.7764,lng:37.5805},
  {id:"msk_kie",n:"Москва Киевский",lat:55.7430,lng:37.5665},
  {id:"msk_east",n:"Москва Восточный / Черкизово",lat:55.8030,lng:37.7450},
  {id:"tula",n:"Тула Московский",lat:54.1931,lng:37.6173},
  {id:"mil_c",n:"Milan Central",lat:45.4863,lng:9.2040},
  {id:"mil_l",n:"Milan Lambrate",lat:45.4847,lng:9.2375},
  {id:"bergamo",n:"Bergamo",lat:45.6905,lng:9.6750},
  {id:"venice",n:"Venice Santa Lucia",lat:45.4410,lng:12.3210},
  {id:"florence",n:"Florence S.M.N",lat:43.7764,lng:11.2478},
  {id:"rome",n:"Rome Termini",lat:41.9007,lng:12.5014},
  {id:"naples",n:"Naples Central",lat:40.8527,lng:14.2761},
  {id:"bologna",n:"Bologna Centrale",lat:44.5060,lng:11.3420},
  {id:"verona",n:"Verona Porta Nuova",lat:45.4290,lng:10.9840},
  {id:"padova",n:"Padova",lat:45.4180,lng:11.8820},
  {id:"turin",n:"Turin Porta Nuova",lat:45.0620,lng:7.6780},
  {id:"genoa",n:"Genoa Piazza Principe",lat:44.4170,lng:8.9210},
  {id:"pisa",n:"Pisa Centrale",lat:43.7080,lng:10.3980},
  {id:"brescia",n:"Brescia",lat:45.5320,lng:10.2130},
  {id:"vicenza",n:"Vicenza",lat:45.5410,lng:11.5410},
  {id:"mestre",n:"Mestre",lat:45.4820,lng:12.2320},
  {id:"arezzo",n:"Arezzo",lat:43.4630,lng:11.8750},
  {id:"orvieto",n:"Orvieto",lat:42.7190,lng:12.1360},
  {id:"latina",n:"Latina",lat:41.4630,lng:12.8890},
  {id:"formia",n:"Formia",lat:41.2570,lng:13.6190},
  {id:"beijing",n:"Пекин Западный",lat:39.8947,lng:116.3220},
  {id:"beijing_s",n:"Пекин Южный",lat:39.8650,lng:116.3780},
  {id:"shanghai",n:"Шанхай Хунцяо",lat:31.1940,lng:121.3200},
  {id:"shanghai_h",n:"Шанхай",lat:31.2490,lng:121.4550},
  {id:"guangzhou",n:"Гуанчжоу Южный",lat:22.9890,lng:113.2700},
  {id:"chengdu",n:"Чэнду Восток",lat:30.6300,lng:104.1400},
  {id:"xian",n:"Сиань Северный",lat:34.3770,lng:108.9390},
  {id:"wuhan",n:"Ухань",lat:30.6070,lng:114.4240},
  {id:"nanjing",n:"Нанкин Южный",lat:31.9690,lng:118.7980},
  {id:"hangzhou",n:"Ханчжоу Восток",lat:30.2910,lng:120.2120},
  {id:"shenzhen",n:"Шэньчжэнь Северный",lat:22.6100,lng:114.0290},
  {id:"tianjin",n:"Тяньцзинь",lat:39.1350,lng:117.2000},
  {id:"zhengzhou",n:"Чжэнчжоу Восток",lat:34.7590,lng:113.6920},
  {id:"changsha",n:"Чанша Южный",lat:28.1490,lng:113.0660},
  {id:"mogilev",n:"Могилёв",lat:53.9000,lng:30.3300},
  {id:"orsha",n:"Орша",lat:54.5080,lng:30.4200},
  {id:"baranovichi",n:"Барановичи",lat:53.1330,lng:26.0140},
  {id:"grodno",n:"Гродно",lat:53.6770,lng:23.8300},
  {id:"almaty",n:"Алматы-2",lat:43.2730,lng:76.9390},
  {id:"astana",n:"Астана Нурлы Жол",lat:51.1120,lng:71.4320},
  {id:"shymkent",n:"Шымкент",lat:42.3410,lng:69.6230},
  {id:"karaganda",n:"Караганда",lat:49.8070,lng:73.0990},
  {id:"tashkent",n:"Ташкент",lat:41.2990,lng:69.2400},
  {id:"samarkand",n:"Самарканд",lat:39.6550,lng:66.9600},
  {id:"bishkek",n:"Бишкек",lat:42.8750,lng:74.6120},
  {id:"dushanbe",n:"Душанбе",lat:38.5600,lng:68.7800},
  {id:"yerevan",n:"Ереван",lat:40.1550,lng:44.5080},
  {id:"tbilisi",n:"Тбилиси",lat:41.7210,lng:44.7990},
  {id:"baku",n:"Баку",lat:40.3830,lng:49.8530},
  {id:"volhovstroy",n:"Волховстрой",lat:59.920,lng:32.350},
  {id:"luga",n:"Луга",lat:58.737,lng:29.845},
  {id:"dno",n:"Дно",lat:57.827,lng:29.964},
  {id:"novosokolniki",n:"Новосокольники",lat:56.333,lng:30.152},
  {id:"velikie_luki",n:"Великие Луки",lat:56.340,lng:30.545},
  {id:"nevel",n:"Невель",lat:56.018,lng:29.925},
  {id:"sebezh",n:"Себеж",lat:56.290,lng:28.482},
  {id:"ostashkov",n:"Осташков",lat:57.146,lng:33.107},
  {id:"likhoslavl",n:"Лихославль",lat:57.124,lng:35.467},
  {id:"spirovo",n:"Спирово",lat:57.419,lng:34.973},
  {id:"makarovo",n:"Макарьево",lat:57.880,lng:43.800},
  {id:"sharya",n:"Шарья",lat:58.369,lng:45.515},
  {id:"kotelnich",n:"Котельнич",lat:58.308,lng:48.329},
  {id:"zuevka",n:"Зуевка",lat:58.405,lng:51.145},
  {id:"glazov",n:"Глазов",lat:58.139,lng:52.658},
  {id:"sarapul",n:"Сарапул",lat:56.476,lng:53.800},
  {id:"agryz",n:"Агрыз",lat:56.522,lng:52.994},
  {id:"mozga",n:"Можга",lat:56.439,lng:52.227},
  {id:"kambarka",n:"Камбарка",lat:56.266,lng:54.207},
  {id:"yanaul",n:"Янаул",lat:56.272,lng:54.933},
  {id:"chernushka",n:"Чернушка",lat:56.507,lng:56.100},
  {id:"kudymkar",n:"Кудымкар",lat:59.017,lng:54.666},
  {id:"chusovoy",n:"Чусовой",lat:58.301,lng:57.819},
  {id:"gornozavodsk",n:"Горнозаводск",lat:58.373,lng:58.323},
  {id:"kungur",n:"Кунгур",lat:57.436,lng:56.951},
  {id:"krasnoufimsk",n:"Красноуфимск",lat:56.612,lng:57.769},
  {id:"revda",n:"Ревда",lat:56.801,lng:59.941},
  {id:"pyshma",n:"Пышма",lat:56.952,lng:63.250},
  {id:"kamyshlov",n:"Камышлов",lat:56.842,lng:62.711},
  {id:"talitsa",n:"Талица",lat:57.001,lng:63.723},
  {id:"yalutorovsk",n:"Ялуторовск",lat:56.654,lng:66.300},
  {id:"zavodoukovsk",n:"Заводоуковск",lat:56.504,lng:66.539},
  {id:"ishim",n:"Ишим",lat:56.113,lng:69.482},
  {id:"nazyvaevsk",n:"Называевск",lat:55.569,lng:71.350},
  {id:"kalachinsk",n:"Калачинск",lat:55.044,lng:74.575},
  {id:"tatarsk",n:"Татарск",lat:55.219,lng:75.967},
  {id:"barabinsk",n:"Барабинск",lat:55.351,lng:78.347},
  {id:"chulym",n:"Чулым",lat:55.233,lng:80.970},
  {id:"bolotnoe",n:"Болотное",lat:55.672,lng:84.398},
  {id:"taiga",n:"Тайга",lat:56.064,lng:85.622},
  {id:"anzhero",n:"Анжеро-Судженск",lat:56.083,lng:86.033},
  {id:"yurga",n:"Юрга",lat:55.723,lng:84.934},
  {id:"mariinsk",n:"Мариинск",lat:56.214,lng:87.747},
  {id:"bogotol",n:"Боготол",lat:56.207,lng:89.532},
  {id:"achinsk",n:"Ачинск",lat:56.269,lng:90.499},
  {id:"zheleznogorsk",n:"Железногорск (Красноярский край)",lat:56.251,lng:93.532},
  {id:"kansk",n:"Канск",lat:56.205,lng:95.719},
  {id:"ilansky",n:"Иланский",lat:56.238,lng:96.065},
  {id:"taishet",n:"Тайшет",lat:55.940,lng:98.010},
  {id:"nizhneudinsk",n:"Нижнеудинск",lat:54.907,lng:99.031},
  {id:"tulun",n:"Тулун",lat:54.561,lng:100.579},
  {id:"zima",n:"Зима",lat:53.920,lng:102.049},
  {id:"cheremkhovo",n:"Черемхово",lat:53.156,lng:103.067},
  {id:"usksolye",n:"Усолье-Сибирское",lat:52.765,lng:103.645},
  {id:"slyudyanka",n:"Слюдянка",lat:51.659,lng:103.706},
  {id:"baikalsk",n:"Байкальск",lat:51.515,lng:104.156},
  {id:"mysovaya",n:"Мысовая",lat:51.650,lng:105.850},
  {id:"petrovsk",n:"Петровск-Забайкальский",lat:51.275,lng:108.833},
  {id:"khilok",n:"Хилок",lat:51.351,lng:110.468},
  {id:"mogocha",n:"Могоча",lat:53.736,lng:119.766},
  {id:"skovorodino",n:"Сковородино",lat:53.983,lng:123.940},
  {id:"erofey",n:"Ерофей Павлович",lat:53.966,lng:121.950},
  {id:"belogorsk",n:"Белогорск",lat:50.916,lng:128.477},
  {id:"svobodny",n:"Свободный",lat:51.375,lng:128.136},
  {id:"birobidzhan",n:"Биробиджан",lat:48.793,lng:132.921},
  {id:"ussuriysk",n:"Уссурийск",lat:43.803,lng:131.946},
  {id:"arseniev",n:"Арсеньев",lat:44.162,lng:133.270},
  {id:"spassk",n:"Спасск-Дальний",lat:44.598,lng:132.820},
  {id:"lesozavodsk",n:"Лесозаводск",lat:45.478,lng:133.429},
  {id:"dalnerechensk",n:"Дальнереченск",lat:45.930,lng:133.739},
  {id:"molodechno",n:"Молодечно",lat:54.308,lng:26.851},
  {id:"lida",n:"Лида",lat:53.883,lng:25.299},
  {id:"polotsk",n:"Полоцк",lat:55.487,lng:28.785},
  {id:"zhlobin",n:"Жлобин",lat:52.892,lng:30.038},
  {id:"mozyr",n:"Мозырь",lat:52.049,lng:29.245},
  {id:"kalinkovichi",n:"Калинковичи",lat:52.132,lng:29.333},
  {id:"kobrin",n:"Кобрин",lat:52.216,lng:24.356},
  {id:"pinsk",n:"Пинск",lat:52.122,lng:26.095},
  {id:"almaty1",n:"Алматы-1",lat:43.273,lng:76.945},
  {id:"shu",n:"Шу",lat:43.598,lng:73.761},
  {id:"turkestan",n:"Туркестан",lat:43.297,lng:68.251},
  {id:"kyzylorda",n:"Кызылорда",lat:44.849,lng:65.509},
  {id:"aru",n:"Аральск",lat:46.803,lng:61.664},
  {id:"zhanaozen",n:"Жанаозен",lat:43.341,lng:52.861},
  {id:"ekibastuz",n:"Экибастуз",lat:51.730,lng:75.323},
  {id:"semey",n:"Семей",lat:50.411,lng:80.227},
  {id:"oskemen",n:"Усть-Каменогорск",lat:49.978,lng:82.629},
  {id:"msk_rig",n:"Москва Рижский",lat:55.7931,lng:37.5926},
  {id:"spb_viteb",n:"Санкт-Петербург Витебский",lat:59.9199,lng:30.3290},
  {id:"spb_fin",n:"Санкт-Петербург Финляндский",lat:59.9555,lng:30.3567},
  {id:"spb_lad",n:"Санкт-Петербург Ладожский",lat:59.9322,lng:30.4407},
  {id:"spb_balt",n:"Санкт-Петербург Балтийский",lat:59.9071,lng:30.2990},
  {id:"bologoe",n:"Бологое",lat:57.8856,lng:34.0694},
  {id:"vyshny",n:"Вышний Волочёк",lat:57.5915,lng:34.5631},
  {id:"chudovo",n:"Чудово",lat:59.1210,lng:31.6690},
  {id:"malaya_vishera",n:"Малая Вишера",lat:58.8456,lng:32.2220},
  {id:"okulovka",n:"Окуловка",lat:58.4008,lng:33.2947},
  {id:"kryukovo",n:"Крюково",lat:55.9800,lng:37.1800},
  {id:"klin",n:"Клин",lat:56.3331,lng:36.7297},
  {id:"nn_mosk",n:"Нижний Новгород Московский",lat:56.3218,lng:43.9456},
  {id:"dzerzhinsk",n:"Дзержинск",lat:56.2385,lng:43.4600},
  {id:"kovrov",n:"Ковров",lat:56.3574,lng:41.3192},
  {id:"yar_mosk",n:"Ярославль-Главный",lat:57.6261,lng:39.8845},
  {id:"rybinsk_st",n:"Рыбинск",lat:58.0446,lng:38.8426},
  {id:"syktyvkar_st",n:"Сыктывкар",lat:61.6688,lng:50.8364},
  {id:"perm_2",n:"Пермь-2",lat:58.0048,lng:56.2502},
  {id:"omsk_st",n:"Омск-Пасс",lat:54.9833,lng:73.3667},
  {id:"novosibirsk",n:"Новосибирск-Главный",lat:55.0355,lng:82.8964},
  {id:"krasnoyarsk_st",n:"Красноярск-Пасс",lat:56.0053,lng:92.8300},
  {id:"irkutsk_st",n:"Иркутск-Пасс",lat:52.2826,lng:104.2600},
  {id:"khabarovsk_st",n:"Хабаровск-1",lat:48.4910,lng:135.0730},
  {id:"kazan_pass",n:"Казань-Пасс",lat:55.7895,lng:49.1000},
  {id:"saratov_1",n:"Саратов-1",lat:51.5420,lng:46.0230},
  {id:"volgograd_1",n:"Волгоград-1",lat:48.7120,lng:44.5170},
  {id:"rostov_gl",n:"Ростов-Главный",lat:47.2184,lng:39.7040},
  {id:"krasnodar_1",n:"Краснодар-1",lat:45.0189,lng:39.0300},
  {id:"pyatigorsk",n:"Пятигорск",lat:44.0390,lng:43.0700},
  {id:"kislovodsk",n:"Кисловодск",lat:43.9050,lng:42.7150},
  {id:"voronezh_1",n:"Воронеж-1",lat:51.6720,lng:39.1840},
  {id:"pskov",n:"Псков",lat:57.8190,lng:28.3320},
  {id:"veliky_novgorod",n:"Великий Новгород",lat:58.5250,lng:31.2750},
  {id:"kaliningrad_st",n:"Калининград-Пасс",lat:54.6930,lng:20.5030},
  {id:"chelyabinsk_st",n:"Челябинск-Главный",lat:55.1600,lng:61.4030},
  {id:"magnitogorsk_st",n:"Магнитогорск",lat:53.4070,lng:58.9800},
  {id:"orenburg_st",n:"Оренбург",lat:51.7680,lng:55.0970},
  {id:"makhachkala_st",n:"Махачкала",lat:42.9830,lng:47.5040},
  {id:"grozny_st",n:"Грозный",lat:43.3180,lng:45.6980},
  {id:"minsk_pass",n:"Минск-Пассажирский",lat:53.8900,lng:27.5510},
  {id:"astana_st",n:"Астана-1",lat:51.1800,lng:71.4460},
  {id:"kostroma_gl",n:"Кострома-Новая",lat:57.7679,lng:40.9269},
  {id:"rybinsk_gl",n:"Рыбинск-Пасс",lat:58.0446,lng:38.8426},
  {id:"uglich_st",n:"Углич",lat:57.5260,lng:38.3180},
  {id:"alexandrov",n:"Александров",lat:56.3970,lng:38.7280},
  {id:"murom_st",n:"Муром",lat:55.5670,lng:42.0390},
  {id:"arzamas",n:"Арзамас",lat:55.3950,lng:43.8400},
  {id:"sarov_st",n:"Саров",lat:54.9390,lng:43.3250},
  {id:"shuya",n:"Шуя",lat:56.8510,lng:41.3880},
  {id:"kineshma_st",n:"Кинешма",lat:57.4390,lng:42.1290},
  {id:"galich_st",n:"Галич",lat:58.3830,lng:42.3470},
  {id:"kotlas_st",n:"Котлас",lat:61.2610,lng:46.6500},
  {id:"velikoustyug_st",n:"Великий Устюг",lat:60.7640,lng:46.3100},
  {id:"severodvinsk_st",n:"Северодвинск",lat:64.5620,lng:39.8300},
  {id:"apatity",n:"Апатиты-1",lat:67.5680,lng:33.4070},
  {id:"kandalaksha",n:"Кандалакша",lat:67.1570,lng:32.4120},
  {id:"staraya_russa",n:"Старая Русса",lat:57.9910,lng:31.3560},
  {id:"borovichi",n:"Боровичи",lat:58.3880,lng:33.9140},
  {id:"vyazma",n:"Вязьма",lat:55.2110,lng:34.2950},
  {id:"obninsk_st",n:"Обнинское",lat:55.0940,lng:36.6100},
  {id:"novomoskovsk",n:"Новомосковск-1",lat:54.0110,lng:38.2850},
  {id:"klintsy",n:"Клинцы",lat:52.7520,lng:32.2390},
  {id:"livny",n:"Ливны",lat:52.4250,lng:37.6080},
  {id:"zheleznogorsk_st",n:"Железногорск (Курская обл.)",lat:52.3320,lng:35.3710},
  {id:"stary_oskol",n:"Старый Оскол",lat:51.2970,lng:37.8410},
  {id:"elets",n:"Елец",lat:52.6240,lng:38.5020},
  {id:"michurinsk",n:"Мичуринск-Уральский",lat:52.8980,lng:40.4910},
  {id:"kuznetsk_st",n:"Кузнецк",lat:53.1160,lng:46.6000},
  {id:"dimitrovgrad_st",n:"Димитровград",lat:54.2140,lng:49.6230},
  {id:"novocheboksarsk",n:"Новочебоксарск",lat:56.1210,lng:47.4790},
  {id:"sterlitamak_st",n:"Стерлитамак",lat:53.6240,lng:55.9500},
  {id:"salavat_st",n:"Салават",lat:53.3610,lng:55.9250},
  {id:"neftekamsk_st",n:"Нефтекамск",lat:56.0920,lng:54.2480},
  {id:"zlatoust",n:"Златоуст",lat:55.1710,lng:59.6510},
  {id:"miass_st",n:"Миасс-1",lat:55.0450,lng:60.1080},
  {id:"orsk_st",n:"Орск",lat:51.2290,lng:58.4750},
  {id:"shadrinsk",n:"Шадринск",lat:56.0850,lng:63.6330},
  {id:"tobolsk_st",n:"Тобольск",lat:58.1980,lng:68.2550},
  {id:"nizhnevartovsk_st",n:"Нижневартовск",lat:60.9340,lng:76.5530},
  {id:"noyabrsk_st",n:"Ноябрьск",lat:63.2010,lng:75.4510},
  {id:"novy_urengoy_st",n:"Новый Уренгой",lat:66.0840,lng:76.6810},
  {id:"biysk_st",n:"Бийск",lat:52.5390,lng:85.2200},
  {id:"rubtsovsk",n:"Рубцовск",lat:51.5270,lng:81.2130},
  {id:"novokuznetsk",n:"Новокузнецк-Пасс",lat:53.7590,lng:87.1210},
  {id:"prokopyevsk",n:"Прокопьевск",lat:53.8960,lng:86.7190},
  {id:"mezhdurechensk",n:"Междуреченск",lat:53.6940,lng:88.0700},
  {id:"angarsk_st",n:"Ангарск",lat:52.5440,lng:103.8880},
  {id:"bratsk_st",n:"Братск",lat:56.1510,lng:101.6340},
  {id:"ust_ilimsk_st",n:"Усть-Илимск",lat:58.0090,lng:102.6660},
  {id:"nakhodka_st",n:"Находка",lat:42.8240,lng:132.8930},
  {id:"artem_st",n:"Артём-Приморский-1",lat:43.3600,lng:132.1900},
  {id:"neryungri_st",n:"Нерюнгри-Пасс",lat:56.6640,lng:124.7200},
  {id:"tynda_st",n:"Тында",lat:55.1540,lng:124.7240},
  {id:"severobaikalsk_st",n:"Северобайкальск",lat:55.6340,lng:109.3230},
  {id:"kyzyl_st",n:"Кызыл",lat:51.7190,lng:94.4380},
  {id:"chernogorsk",n:"Черногорск",lat:53.8230,lng:91.2840},
  {id:"essentuki",n:"Ессентуки",lat:44.0440,lng:42.8600},
  {id:"nevinnomyssk",n:"Невинномысск",lat:44.6340,lng:41.9440},
  {id:"armavir_st",n:"Армавир-Ростовский",lat:45.0010,lng:41.1230},
  {id:"tuapse_st",n:"Туапсе-Пасс",lat:44.1000,lng:39.0700},
  {id:"taganrog_st",n:"Таганрог-2",lat:47.2100,lng:38.9200},
  {id:"shahty",n:"Шахты",lat:47.7090,lng:40.2150},
  {id:"novocherkassk",n:"Новочеркасск",lat:47.4220,lng:40.0940},
  {id:"volgodonsk_st",n:"Волгодонск",lat:47.5140,lng:42.1510},
  {id:"bataysk",n:"Батайск",lat:47.1400,lng:39.7510},
  {id:"kamensk_sh",n:"Каменск-Шахтинский",lat:48.3210,lng:40.2690},
  {id:"salsk",n:"Сальск",lat:46.4750,lng:41.5410},
  {id:"derbent_st",n:"Дербент",lat:42.0690,lng:48.2900},
  {id:"hasavyurt",n:"Хасавюрт",lat:43.2510,lng:46.5880},
  {id:"nazran_st",n:"Назрань",lat:43.2260,lng:44.7650},
  {id:"nalchik_st",n:"Нальчик",lat:43.4980,lng:43.6190},
  {id:"vladikavkaz_st",n:"Владикавказ",lat:43.0250,lng:44.6820},
  {id:"elista_st",n:"Элиста",lat:46.3080,lng:44.2560},
  {id:"cherkessk_st",n:"Черкесск",lat:44.2260,lng:42.0570},
  {id:"sergiev_posad",n:"Сергиев Посад",lat:56.3100,lng:38.1330},
  {id:"dmitrov_st",n:"Дмитров",lat:56.3450,lng:37.5200},
  {id:"kolomna_st",n:"Коломна",lat:55.0940,lng:38.7680},
  {id:"serpukhov_st",n:"Серпухов",lat:54.9160,lng:37.4110},
  {id:"podolsk_st",n:"Подольск",lat:55.4240,lng:37.5450},
  {id:"vologda_1",n:"Вологда-1",lat:59.2205,lng:39.8915},
  {id:"cherepovets_1",n:"Череповец-1",lat:59.1229,lng:37.9350},
  {id:"pskov_pass",n:"Псков-Пасс",lat:57.8190,lng:28.3320},
  {id:"novgorod_pass",n:"Новгород-на-Волхове",lat:58.5250,lng:31.2750},
  {id:"bryansk_orlov",n:"Брянск-Орловский",lat:53.2430,lng:34.3640},
  {id:"tambov_1",n:"Тамбов-1",lat:52.7210,lng:41.4530},
  {id:"ryazan_1",n:"Рязань-1",lat:54.6290,lng:39.7350},
  {id:"penza_1",n:"Пенза-1",lat:53.1950,lng:45.0180},
  {id:"saransk_st",n:"Саранск",lat:54.1870,lng:45.1840},
  {id:"ulyanovsk_1",n:"Ульяновск-1",lat:54.3140,lng:48.4030},
  {id:"yoshkar_ola",n:"Йошкар-Ола",lat:56.6320,lng:47.8960},
  {id:"kirov_pass",n:"Киров-Пасс",lat:58.6035,lng:49.6680},
  {id:"ekb_pass",n:"Екатеринбург-Пасс",lat:56.8587,lng:60.6046},
  {id:"astrakhan_pass",n:"Астрахань-1",lat:46.3490,lng:48.0400},
  {id:"chita_pass",n:"Чита-2",lat:52.0515,lng:113.4660},
  {id:"nn_moskovsky",n:"Н.Новгород Московский",lat:56.3218,lng:43.9456},
];

/* Города РФ для авто (центры + крупные) */



var PORTS = [
  /* ===== БАЛТИКА / НЕВА / ВОЛГО-БАЛТ ===== */
  {id:"spb",n:"Санкт-Петербург (Морской)",lat:59.882,lng:30.222},
  {id:"spb_river",n:"Санкт-Петербург (речной)",lat:59.944,lng:30.312},
  {id:"kronstadt",n:"Кронштадт",lat:59.992,lng:29.775},
  {id:"shlisselburg",n:"Шлиссельбург",lat:59.945,lng:31.035},
  {id:"novaya_ladoga",n:"Новая Ладога",lat:60.102,lng:32.302},
  {id:"valaam",n:"Валаам",lat:61.372,lng:30.930},
  {id:"sortavala",n:"Сортавала",lat:61.705,lng:30.690},
  {id:"priozersk",n:"Приозерск",lat:61.039,lng:30.129},
  {id:"mandrogi",n:"Мандроги",lat:60.850,lng:33.550},
  {id:"lodeynoe",n:"Лодейное Поле",lat:60.734,lng:33.548},
  {id:"petrozavodsk",n:"Петрозаводск (речной)",lat:61.785,lng:34.380},
  {id:"kizhi",n:"Кижи",lat:62.067,lng:35.227},
  {id:"belomorsk",n:"Беломорск",lat:64.523,lng:34.767},
  {id:"vytegra",n:"Вытегра",lat:61.006,lng:36.448},
  {id:"cherepovets",n:"Череповец (речной)",lat:59.133,lng:37.900},
  {id:"sheksna",n:"Шексна",lat:59.210,lng:38.510},
  {id:"goritsy",n:"Горицы",lat:59.870,lng:38.260},
  {id:"kirillov",n:"Кириллов",lat:59.859,lng:38.381},
  {id:"kgd",n:"Калининград (порт)",lat:54.705,lng:20.458},
  {id:"ladoga",n:"Ладога центр",lat:60.850,lng:31.300},
  {id:"onega",n:"Онега центр",lat:61.900,lng:35.300},
  {id:"baltic1",n:"Балтика",lat:59.200,lng:22.500},
  {id:"baltic2",n:"Балтика Юг",lat:56.000,lng:19.500},
  {id:"white",n:"Белое море",lat:65.500,lng:39.000},
  /* ===== МОСКВА / КАНАЛ ИМ. МОСКВЫ ===== */
  {id:"msk_north",n:"Москва (Северный речной)",lat:55.850,lng:37.470},
  {id:"msk_south",n:"Москва (Южный речной)",lat:55.678,lng:37.670},
  {id:"khimki",n:"Химки (шлюз)",lat:55.889,lng:37.430},
  {id:"dubna",n:"Дубна",lat:56.733,lng:37.167},
  {id:"konakovo",n:"Конаково",lat:56.700,lng:36.780},
  {id:"tver_r",n:"Тверь (речной)",lat:56.859,lng:35.912},
  /* ===== ВОЛГА (полная туристическая линия) ===== */
  {id:"uglich",n:"Углич",lat:57.526,lng:38.318},
  {id:"myshkin",n:"Мышкин",lat:57.789,lng:38.454},
  {id:"rybinsk",n:"Рыбинск",lat:58.048,lng:38.858},
  {id:"yar",n:"Ярославль (речной)",lat:57.630,lng:39.890},
  {id:"tutayev",n:"Тутаев",lat:57.869,lng:39.535},
  {id:"kostroma",n:"Кострома (речной)",lat:57.767,lng:40.927},
  {id:"ples",n:"Плёс",lat:57.459,lng:41.512},
  {id:"kinema",n:"Кинешма",lat:57.439,lng:42.129},
  {id:"yurevets",n:"Юрьевец",lat:57.317,lng:43.111},
  {id:"nn",n:"Нижний Новгород (речной)",lat:56.330,lng:44.000},
  {id:"gorodec",n:"Городец",lat:56.650,lng:43.470},
  {id:"balakhna",n:"Балахна",lat:56.505,lng:43.602},
  {id:"makarievo",n:"Макарьев",lat:57.880,lng:43.807},
  {id:"kozmodemyansk",n:"Козьмодемьянск",lat:56.341,lng:46.567},
  {id:"cheboksary",n:"Чебоксары (речной)",lat:56.143,lng:47.252},
  {id:"kazan",n:"Казань (речной)",lat:55.790,lng:49.120},
  {id:"sviyazhsk",n:"Свияжск",lat:55.772,lng:48.660},
  {id:"bolgar",n:"Болгар",lat:54.980,lng:49.030},
  {id:"ulyanovsk",n:"Ульяновск (речной)",lat:54.314,lng:48.403},
  {id:"tolyatti",n:"Тольятти (речной)",lat:53.530,lng:49.420},
  {id:"samara",n:"Самара (речной)",lat:53.180,lng:50.080},
  {id:"syzran",n:"Сызрань (речной)",lat:53.158,lng:48.468},
  {id:"khvalynsk",n:"Хвалынск",lat:52.490,lng:48.100},
  {id:"balakovo",n:"Балаково",lat:52.028,lng:47.800},
  {id:"saratov",n:"Саратов (речной)",lat:51.542,lng:46.023},
  {id:"engels",n:"Энгельс",lat:51.486,lng:46.125},
  {id:"kamyshin",n:"Камышин",lat:50.098,lng:45.416},
  {id:"volgograd",n:"Волгоград (речной)",lat:48.700,lng:44.500},
  {id:"akhtubinsk",n:"Ахтубинск",lat:48.278,lng:46.166},
  {id:"ast",n:"Астрахань (порт)",lat:46.350,lng:48.041},
  {id:"volga_n1",n:"Волга фарватер С",lat:57.200,lng:38.900},
  {id:"volga_n2",n:"Волга фарватер",lat:56.800,lng:43.200},
  {id:"volga_m1",n:"Волга фарватер",lat:55.500,lng:48.500},
  {id:"volga_m2",n:"Волга фарватер",lat:53.400,lng:49.600},
  {id:"volga_s1",n:"Волга фарватер",lat:51.800,lng:46.500},
  {id:"volga_s2",n:"Волга фарватер",lat:49.500,lng:44.800},
  {id:"volga_s3",n:"Волга фарватер",lat:47.200,lng:47.200},
  /* ===== КАМА ===== */
  {id:"perm",n:"Пермь (речной)",lat:58.010,lng:56.230},
  {id:"berezniki",n:"Березники",lat:59.409,lng:56.820},
  {id:"solikamsk",n:"Соликамск",lat:59.648,lng:56.771},
  {id:"chaikovsky",n:"Чайковский",lat:56.778,lng:54.115},
  {id:"sarapul",n:"Сарапул",lat:56.476,lng:53.800},
  {id:"nabchelny",n:"Набережные Челны",lat:55.710,lng:52.380},
  {id:"nizhnekamsk",n:"Нижнекамск",lat:55.637,lng:51.820},
  {id:"chistopol",n:"Чистополь",lat:55.363,lng:50.642},
  {id:"yelabuga",n:"Елабуга",lat:55.761,lng:52.065},
  {id:"kama_f1",n:"Кама фарватер",lat:57.200,lng:54.500},
  {id:"kama_f2",n:"Кама фарватер",lat:55.900,lng:52.000},
  /* ===== ОКА ===== */
  {id:"kolomna",n:"Коломна (речной)",lat:55.094,lng:38.768},
  {id:"ryazan_r",n:"Рязань (речной)",lat:54.629,lng:39.735},
  {id:"kasimov",n:"Касимов",lat:54.937,lng:41.397},
  {id:"murom",n:"Муром",lat:55.567,lng:42.039},
  {id:"oka_f1",n:"Ока фарватер",lat:55.200,lng:40.500},
  /* ===== ДОН / ВОЛГО-ДОН / АЗОВ ===== */
  {id:"kalach",n:"Калач-на-Дону",lat:48.690,lng:43.520},
  {id:"rostov",n:"Ростов-на-Дону (речной)",lat:47.220,lng:39.720},
  {id:"azov",n:"Азов",lat:47.110,lng:39.420},
  {id:"taganrog",n:"Таганрог",lat:47.210,lng:38.920},
  {id:"don_f1",n:"Дон фарватер",lat:48.200,lng:41.500},
  {id:"don_f2",n:"Дон фарватер",lat:47.600,lng:40.800},
  {id:"azov_sea",n:"Азовское море",lat:46.000,lng:36.500},
  /* ===== ЧЁРНОЕ МОРЕ ===== */
  {id:"nvr",n:"Новороссийск",lat:44.724,lng:37.768},
  {id:"anapa",n:"Анапа (порт)",lat:44.890,lng:37.310},
  {id:"tuapse",n:"Туапсе",lat:44.100,lng:39.070},
  {id:"sochi",n:"Сочи (порт)",lat:43.581,lng:39.719},
  {id:"sevastopol",n:"Севастополь",lat:44.616,lng:33.525},
  {id:"ydne",n:"Ялта",lat:44.490,lng:34.160},
  {id:"kerch",n:"Керчь",lat:45.338,lng:36.468},
  {id:"feodosia",n:"Феодосия",lat:45.032,lng:35.383},
  {id:"black1",n:"Чёрное море",lat:43.200,lng:34.500},
  {id:"black2",n:"Чёрное море З",lat:43.000,lng:30.800},
  /* ===== КАСПИЙ ===== */
  {id:"mcx",n:"Махачкала (порт)",lat:42.983,lng:47.517},
  {id:"baku",n:"Баку (порт)",lat:40.383,lng:49.853},
  {id:"aktau",n:"Актау (порт)",lat:43.651,lng:51.197},
  {id:"caspian1",n:"Каспий",lat:42.500,lng:50.500},
  /* ===== СЕВЕР: СЕВ. ДВИНА / ПЕЧОРА / МУРМАНСК ===== */
  {id:"arh",n:"Архангельск (порт)",lat:64.540,lng:40.543},
  {id:"severodvinsk",n:"Северодвинск",lat:64.562,lng:39.830},
  {id:"kotlas",n:"Котлас",lat:61.261,lng:46.650},
  {id:"velikoustyug",n:"Великий Устюг",lat:60.764,lng:46.310},
  {id:"syktyvkar",n:"Сыктывкар (речной)",lat:61.679,lng:50.810},
  {id:"naryanmar",n:"Нарьян-Мар",lat:67.638,lng:53.007},
  {id:"mmk",n:"Мурманск (порт)",lat:68.970,lng:33.075},
  {id:"barents",n:"Баренцево",lat:70.500,lng:33.500},
  {id:"sevdvina_f",n:"Сев. Двина фарватер",lat:63.000,lng:42.000},
  /* ===== ОБЬ / ИРТЫШ ===== */
  {id:"barnaul",n:"Барнаул (речной)",lat:53.348,lng:83.780},
  {id:"biysk",n:"Бийск",lat:52.539,lng:85.220},
  {id:"nsk_river",n:"Новосибирск (речной)",lat:55.010,lng:82.930},
  {id:"tomsk_r",n:"Томск (речной)",lat:56.497,lng:84.974},
  {id:"omsk",n:"Омск (речной)",lat:54.983,lng:73.368},
  {id:"tobolsk",n:"Тобольск",lat:58.198,lng:68.255},
  {id:"tyumen_r",n:"Тюмень (речной)",lat:57.153,lng:65.534},
  {id:"khanty",n:"Ханты-Мансийск",lat:61.003,lng:69.018},
  {id:"surgut",n:"Сургут (речной)",lat:61.250,lng:73.400},
  {id:"nizhnevartovsk",n:"Нижневартовск",lat:60.934,lng:76.553},
  {id:"salekhard",n:"Салехард",lat:66.530,lng:66.602},
  {id:"ob_f1",n:"Обь фарватер",lat:56.500,lng:84.000},
  {id:"ob_f2",n:"Обь фарватер С",lat:61.500,lng:68.500},
  /* ===== ЕНИСЕЙ / АНГАРА ===== */
  {id:"kras_river",n:"Красноярск (речной)",lat:56.010,lng:92.870},
  {id:"divnogorsk",n:"Дивногорск",lat:55.958,lng:92.354},
  {id:"kazachinskoe",n:"Казачинское (порог)",lat:57.700,lng:93.400},
  {id:"lesosibirsk",n:"Лесосибирск",lat:58.236,lng:92.483},
  {id:"yeniseysk",n:"Енисейск",lat:58.449,lng:92.180},
  {id:"yartsevo",n:"Ярцево (Енисей)",lat:60.250,lng:90.220},
  {id:"turukhansk",n:"Туруханск",lat:65.793,lng:87.972},
  {id:"igarka",n:"Игарка",lat:67.467,lng:86.567},
  {id:"dudinka",n:"Дудинка",lat:69.406,lng:86.177},
  {id:"abakan",n:"Абакан (речной)",lat:53.716,lng:91.429},
  {id:"minusinsk",n:"Минусинск",lat:53.710,lng:91.688},
  {id:"yen_f1",n:"Енисей фарватер",lat:62.000,lng:89.000},
  {id:"yen_f2",n:"Енисей фарватер С",lat:66.500,lng:86.800},
  /* ===== ЛЕНА ===== */
  {id:"ustkut",n:"Усть-Кут",lat:56.793,lng:105.767},
  {id:"kirensk",n:"Киренск",lat:57.785,lng:108.112},
  {id:"lensk",n:"Ленск",lat:60.725,lng:114.896},
  {id:"olekminsk",n:"Олёкминск",lat:60.374,lng:120.430},
  {id:"pokrovsk",n:"Покровск (Лена)",lat:61.484,lng:129.150},
  {id:"yakutsk",n:"Якутск (речной)",lat:62.035,lng:129.675},
  {id:"lena_f1",n:"Лена фарватер",lat:61.500,lng:125.000},
  /* ===== АМУР ===== */
  {id:"blagov",n:"Благовещенск (речной)",lat:50.290,lng:127.527},
  {id:"khabarovsk",n:"Хабаровск (речной)",lat:48.480,lng:135.070},
  {id:"komsomolsk",n:"Комсомольск-на-Амуре",lat:50.550,lng:137.010},
  {id:"nikolaevsk",n:"Николаевск-на-Амуре",lat:53.146,lng:140.730},
  {id:"amur_f1",n:"Амур фарватер",lat:49.500,lng:130.500},
  {id:"vvo",n:"Владивосток (порт)",lat:43.100,lng:131.873},

  {id:"rzhev",n:"Ржев (речной)",lat:56.263,lng:34.328},
  {id:"staritsa",n:"Старица",lat:56.508,lng:34.859},
  {id:"kalyazin",n:"Калязин",lat:57.240,lng:37.855},
  {id:"kimry",n:"Кимры",lat:56.873,lng:37.348},
  {id:"myshkin2",n:"Мышкин пристань",lat:57.785,lng:38.460},
  {id:"romanovo",n:"Романов-Борисоглебск",lat:57.870,lng:39.540},
  {id:"nerekhta",n:"Нерехта",lat:57.459,lng:40.575},
  {id:"puchezh",n:"Пучеж",lat:56.982,lng:43.168},
  {id:"chkalovsk",n:"Чкаловск",lat:56.765,lng:43.242},
  {id:"vasilsursk",n:"Васильсурск",lat:56.129,lng:46.000},
  {id:"zvenigovo",n:"Звенигово",lat:55.972,lng:48.015},
  {id:"tetyushi",n:"Тетюши",lat:54.938,lng:48.836},
  {id:"sengeley",n:"Сенгилей",lat:53.962,lng:48.794},
  {id:"novoulyanovsk",n:"Новоульяновск",lat:54.151,lng:48.801},
  {id:"oktyabrsk",n:"Октябрьск",lat:53.167,lng:48.671},
  {id:"volsk",n:"Вольск",lat:52.048,lng:47.387},
  {id:"marks",n:"Маркс",lat:51.713,lng:46.754},
  {id:"nikolaevsk_v",n:"Николаевск (Волга)",lat:50.028,lng:45.460},
  {id:"dubovka",n:"Дубовка",lat:49.054,lng:44.827},
  {id:"krasnoslobodsk",n:"Краснослободск (Волга)",lat:48.700,lng:44.580},
  {id:"narimanov",n:"Нариманов",lat:46.723,lng:47.850},
  {id:"elizovo",n:"Елатьма",lat:54.967,lng:41.750},
  {id:"kasimov2",n:"Касимов пристань",lat:54.940,lng:41.400},
  {id:"spassk",n:"Спасск-Рязанский",lat:54.400,lng:40.380},
  {id:"sergiev",n:"Сергиев Посад (канал)",lat:56.310,lng:38.133},
  {id:"dmitrov",n:"Дмитров (канал)",lat:56.345,lng:37.520},
  {id:"zelenodolsk",n:"Зеленодольск",lat:55.844,lng:48.518},
  {id:"volzhsk",n:"Волжск",lat:55.866,lng:48.359},
  {id:"chistopol2",n:"Чистополь пристань",lat:55.370,lng:50.650},
  {id:"neftekamsk",n:"Нефтекамск",lat:56.092,lng:54.248},
  {id:"uzhgorod_kama",n:"Усть-Качка",lat:57.980,lng:55.620},
  {id:"osa",n:"Оса (Кама)",lat:57.283,lng:55.456},
  {id:"sarapul2",n:"Сарапул пристань",lat:56.470,lng:53.810},
  {id:"votkinsk",n:"Воткинск",lat:57.052,lng:54.030},
  {id:"tetyushi2",n:"Тетюши пристань",lat:54.940,lng:48.840},
  {id:"stavropol_v",n:"Ставрополь-на-Волге",lat:53.530,lng:49.400},
  {id:"zhigulevsk",n:"Жигулёвск",lat:53.401,lng:49.495},
  {id:"syzran2",n:"Сызрань пристань",lat:53.160,lng:48.470},
  {id:"khvalynsk2",n:"Хвалынск пристань",lat:52.495,lng:48.105},
  {id:"balakovo2",n:"Балаково пристань",lat:52.030,lng:47.805},
  {id:"kalach2",n:"Калач пристань",lat:48.692,lng:43.525},
  {id:"tsimlyansk",n:"Цимлянск",lat:47.648,lng:42.094},
  {id:"volgodonsk",n:"Волгодонск",lat:47.514,lng:42.151},
  {id:"ustdonetsk",n:"Усть-Донецкий",lat:47.640,lng:40.870},
  {id:"semikarakorsk",n:"Семикаракорск",lat:47.519,lng:40.811},
  {id:"aksay",n:"Аксай",lat:47.270,lng:39.870},
  {id:"azov2",n:"Азов порт",lat:47.112,lng:39.423},
  {id:"yeisk",n:"Ейск",lat:46.711,lng:38.275},
  {id:"temryuk",n:"Темрюк",lat:45.270,lng:37.387},
  {id:"taman",n:"Тамань",lat:45.219,lng:36.716},
  {id:"gelendzhik",n:"Геленджик (порт)",lat:44.563,lng:38.079},
  {id:"novoross2",n:"Новороссийск порт",lat:44.724,lng:37.770},
  {id:"tuapse2",n:"Туапсе порт",lat:44.101,lng:39.071},
  {id:"adler_port",n:"Адлер (море)",lat:43.430,lng:39.920},
  {id:"sukhum",n:"Сухум",lat:42.978,lng:41.015},
  {id:"poti",n:"Поти",lat:42.154,lng:41.672},
  {id:"batumi",n:"Батуми",lat:41.649,lng:41.647},
  {id:"taganrog2",n:"Таганрог порт",lat:47.211,lng:38.922},
  {id:"mariupol",n:"Мариуполь",lat:47.096,lng:37.543},
  {id:"berdyansk",n:"Бердянск",lat:46.756,lng:36.803},
  {id:"kerch2",n:"Керчь порт",lat:45.340,lng:36.470},
  {id:"feodosia2",n:"Феодосия порт",lat:45.033,lng:35.385},
  {id:"yalta2",n:"Ялта порт",lat:44.492,lng:34.162},
  {id:"sevastopol2",n:"Севастополь порт",lat:44.617,lng:33.526},
  {id:"evpatoria",n:"Евпатория",lat:45.191,lng:33.368},
  {id:"chernomorsk",n:"Черноморское",lat:45.507,lng:32.702},
  {id:"irkutsk_r",n:"Иркутск (речной)",lat:52.286,lng:104.280},
  {id:"listvyanka",n:"Листвянка",lat:51.853,lng:104.860},
  {id:"severobaikalsk",n:"Северобайкальск",lat:55.634,lng:109.323},
  {id:"bratsk",n:"Братск (речной)",lat:56.151,lng:101.634},
  {id:"ustilimsk",n:"Усть-Илимск",lat:58.009,lng:102.666},
  {id:"angara_f",n:"Ангара фарватер",lat:54.000,lng:103.000},
  {id:"baikal_c",n:"Байкал центр",lat:53.500,lng:108.000},
  {id:"selenga",n:"Усть-Селенга",lat:52.230,lng:106.900},
  {id:"ulyanovsk2",n:"Ульяновск порт",lat:54.315,lng:48.405},
  {id:"dimitrovgrad",n:"Димитровград",lat:54.214,lng:49.623},
  {id:"togliatti2",n:"Тольятти порт",lat:53.532,lng:49.422},
  {id:"samara2",n:"Самара порт",lat:53.182,lng:50.082},
  {id:"engels2",n:"Энгельс порт",lat:51.487,lng:46.127},
  {id:"volgograd2",n:"Волгоград порт",lat:48.702,lng:44.502},
  {id:"astrakhan2",n:"Астрахань порт",lat:46.352,lng:48.043},
  {id:"nizhny2",n:"Н.Новгород порт",lat:56.332,lng:44.002},
  {id:"kazan2",n:"Казань порт",lat:55.792,lng:49.122},
  {id:"yar2",n:"Ярославль порт",lat:57.632,lng:39.892},
  {id:"kostroma2",n:"Кострома порт",lat:57.769,lng:40.929},
  {id:"rybinsk2",n:"Рыбинск порт",lat:58.050,lng:38.860},
  {id:"tver2",n:"Тверь порт",lat:56.861,lng:35.914},
  {id:"msk_tech",n:"Москва Северный порт",lat:55.852,lng:37.472},
  {id:"spb2",n:"СПб речной вокзал",lat:59.946,lng:30.314},
  {id:"japan_sea",n:"Японское море",lat:42.500,lng:135.000}
];

/* алиасы: «Ярославль» → речной порт */
var PORT_ALIASES={
  "ярославль":"yar","мышкин":"myshkin","углич":"uglich","рыбинск":"rybinsk","кострома":"kostroma",
  "плёс":"ples","плес":"ples","кинешма":"kinema","нижегород":"nn","нижний":"nn","нижний новгород":"nn",
  "казань":"kazan","чебоксары":"cheboksary","самара":"samara","саратов":"saratov","волгоград":"volgograd",
  "астрахань":"ast","пермь":"perm","тольятти":"tolyatti","ульяновск":"ulyanovsk","болагар":"bolgar","болгар":"bolgar",
  "москва":"msk_north","северн":"msk_north","дубна":"dubna","тверь":"tver_r",
  "петербург":"spb_river","санкт":"spb_river","спб":"spb_river","питер":"spb_river",
  "валаам":"valaam","кижи":"kizhi","мандроги":"mandrogi","петрозаводск":"petrozavodsk",
  "ростов":"rostov","азов":"azov","каляч":"kalach","калач":"kalach",
  "красноярск":"kras_river","енисейск":"yeniseysk","игарка":"igarka","дудинка":"dudinka",
  "якутск":"yakutsk","хабаровск":"khabarovsk","благовещенск":"blagov",
  "омск":"omsk","новосибирск":"nsk_river","барнаул":"barnaul","сургут":"surgut","тобольск":"tobolsk",
  "архангельск":"arh","мурманск":"mmk","сочи":"sochi","новороссийск":"nvr",
  "колома":"kolomna","коломна":"kolomna","рязань":"ryazan_r","муром":"murom",
  "череповец":"cherepovets","вытегра":"vytegra","шлиссельбург":"shlisselburg",
  "березники":"berezniki","соликамск":"solikamsk","чистополь":"chistopol","елабуга":"yelabuga",
  "сыктывкар":"syktyvkar","котлас":"kotlas","устюг":"velikoustyug"
};

PORT_ALIASES["калязин"]="kalyazin";PORT_ALIASES["кимры"]="kimry";
PORT_ALIASES["жигулевск"]="zhigulevsk";PORT_ALIASES["жигулёвск"]="zhigulevsk";
PORT_ALIASES["волгодонск"]="volgodonsk";PORT_ALIASES["ейск"]="yeisk";PORT_ALIASES["геленджик"]="gelendzhik";
PORT_ALIASES["адлер"]="adler_port";PORT_ALIASES["листвянка"]="listvyanka";PORT_ALIASES["байкал"]="listvyanka";
PORT_ALIASES["братск"]="bratsk";PORT_ALIASES["иркутск"]="irkutsk_r";PORT_ALIASES["дмитров"]="dmitrov";
PORT_ALIASES["зеленодольск"]="zelenodolsk";PORT_ALIASES["свияжск"]="sviyazhsk";

function portCityKey(n){
  /* «Ярославль (речной)» → ярославль */
  var s=norm(n).replace(/\s*\(.*?\)\s*/g," ").replace(/\s+/g," ").trim();
  return s;
}

function isPassengerPort(p){
  if(!p||!p.id) return false;
  var n=p.n||"";
  if(/фарватер|центр|^Балтика|^Каспий|^Чёрное|^Азовское|^Ладога|^Онега|^Японское|^Баренцево|^Белое|\bморе\b/i.test(n)) return false;
  return true;
}
function formatPortLabel(p){
  var n=p.n||"";
  if(/\((речной|порт|морской|море)\)/i.test(n)) return n;
  if(/порт|морской|речной/i.test(n)) return n;
  /* явные морские */
  if(/сочи|новоросс|анапа|туапсе|севастопол|ялта|керчь|феодоси|мурманск|владивосток|калининград|баку|актау|махачкал/i.test(n))
    return n.indexOf("(")>=0?n:(n+" (порт)");
  return n.indexOf("(")>=0?n:(n+" (речной)");
}

function findPortByQuery(q){
  q=norm(q);
  if(!q) return null;
  if(PORT_ALIASES[q] && PORT_BY_ID[PORT_ALIASES[q]] && isPassengerPort(PORT_BY_ID[PORT_ALIASES[q]]))
    return PORT_BY_ID[PORT_ALIASES[q]];
  var i,p,best=null;
  for(i=0;i<PORTS.length;i++){
    p=PORTS[i];
    if(!isPassengerPort(p)) continue;
    var nk=norm(p.n), ck=portCityKey(p.n);
    if(nk===q || ck===q || norm(formatPortLabel(p))===q) return p;
    if(ck.indexOf(q)===0 && q.length>=3) return p;
    if((nk.indexOf(q)>=0 || ck.indexOf(q)>=0) && q.length>=3 && (!best || nk.length<norm(best.n).length)) best=p;
  }
  return best;
}

var PORT_BY_ID={};
PORTS.forEach(function(p){ if(p.id) PORT_BY_ID[p.id]=p; });
var PORT_EDGES=[
  /* Волго-Балт / Ладога / Онега */
  ["spb","spb_river"],["spb","kronstadt"],["spb_river","shlisselburg"],["shlisselburg","novaya_ladoga"],
  ["shlisselburg","ladoga"],["ladoga","valaam"],["ladoga","sortavala"],["ladoga","priozersk"],["ladoga","novaya_ladoga"],
  ["novaya_ladoga","lodeynoe"],["lodeynoe","mandrogi"],["mandrogi","petrozavodsk"],["petrozavodsk","onega"],
  ["onega","kizhi"],["onega","vytegra"],["vytegra","cherepovets"],["cherepovets","sheksna"],["sheksna","goritsy"],["goritsy","kirillov"],
  ["cherepovets","rybinsk"],["onega","belomorsk"],["belomorsk","white"],["white","arh"],
  ["spb","baltic1"],["baltic1","baltic2"],["kgd","baltic2"],
  /* Канал Москвы → Волга */
  ["msk_north","khimki"],["msk_south","msk_north"],["khimki","dubna"],["dubna","konakovo"],["konakovo","tver_r"],
  ["tver_r","uglich"],["dubna","uglich"],
  /* Волга сплошная */
  ["uglich","myshkin"],["myshkin","rybinsk"],["rybinsk","volga_n1"],["volga_n1","tutayev"],["tutayev","yar"],["rybinsk","yar"],["myshkin","yar"],["uglich","yar"],
  ["yar","kostroma"],["kostroma","ples"],["ples","kinema"],["kinema","yurevets"],["yurevets","volga_n2"],["volga_n2","gorodec"],["gorodec","balakhna"],["balakhna","nn"],["kinema","nn"],["ples","yar"],
  ["nn","makarievo"],["makarievo","kozmodemyansk"],["kozmodemyansk","cheboksary"],["cheboksary","volga_m1"],["volga_m1","sviyazhsk"],["sviyazhsk","kazan"],["cheboksary","kazan"],
  ["kazan","bolgar"],["bolgar","ulyanovsk"],["ulyanovsk","tolyatti"],["tolyatti","volga_m2"],["volga_m2","samara"],["samara","syzran"],
  ["syzran","khvalynsk"],["khvalynsk","balakovo"],["balakovo","volga_s1"],["volga_s1","saratov"],["saratov","engels"],["saratov","kamyshin"],
  ["kamyshin","volga_s2"],["volga_s2","volgograd"],["volgograd","akhtubinsk"],["akhtubinsk","volga_s3"],["volga_s3","ast"],
  /* Кама */
  ["solikamsk","berezniki"],["berezniki","perm"],["perm","kama_f1"],["kama_f1","chaikovsky"],["chaikovsky","sarapul"],["sarapul","nabchelny"],["nabchelny","yelabuga"],["yelabuga","nizhnekamsk"],["nizhnekamsk","kama_f2"],["kama_f2","chistopol"],["chistopol","kazan"],
  /* Ока → Волга */
  ["msk_south","kolomna"],["kolomna","ryazan_r"],["ryazan_r","kasimov"],["kasimov","oka_f1"],["oka_f1","murom"],["murom","nn"],
  /* Дон */
  ["volgograd","kalach"],["kalach","don_f1"],["don_f1","don_f2"],["don_f2","rostov"],["rostov","azov"],["azov","azov_sea"],["azov_sea","taganrog"],["azov_sea","kerch"],
  /* Чёрное */
  ["nvr","black1"],["anapa","black1"],["tuapse","black1"],["sochi","black1"],["sevastopol","black1"],["ydne","black1"],["feodosia","black1"],["kerch","black1"],["black1","black2"],["sochi","tuapse"],["ydne","sevastopol"],
  /* Каспий */
  ["ast","caspian1"],["mcx","caspian1"],["baku","caspian1"],["aktau","caspian1"],
  /* Сев. Двина */
  ["velikoustyug","kotlas"],["kotlas","sevdvina_f"],["sevdvina_f","arh"],["arh","severodvinsk"],["arh","white"],["mmk","barents"],
  /* Обь-Иртыш */
  ["biysk","barnaul"],["barnaul","nsk_river"],["nsk_river","ob_f1"],["ob_f1","tomsk_r"],["omsk","tobolsk"],["tyumen_r","tobolsk"],["tobolsk","khanty"],["khanty","surgut"],["surgut","nizhnevartovsk"],["surgut","ob_f2"],["ob_f2","salekhard"],
  /* Енисей */
  ["abakan","minusinsk"],["minusinsk","kras_river"],["kras_river","divnogorsk"],["kras_river","kazachinskoe"],["kazachinskoe","lesosibirsk"],["lesosibirsk","yeniseysk"],["yeniseysk","yartsevo"],["yartsevo","yen_f1"],["yen_f1","turukhansk"],["turukhansk","yen_f2"],["yen_f2","igarka"],["igarka","dudinka"],
  /* Лена */
  ["ustkut","kirensk"],["kirensk","lensk"],["lensk","olekminsk"],["olekminsk","lena_f1"],["lena_f1","pokrovsk"],["pokrovsk","yakutsk"],
  /* Амур */
  ["blagov","amur_f1"],["amur_f1","khabarovsk"],["khabarovsk","komsomolsk"],["komsomolsk","nikolaevsk"],["khabarovsk","japan_sea"],["vvo","japan_sea"],
  ["tver_r","kalyazin"],["kalyazin","uglich"],["kimry","dubna"],["rzhev","staritsa"],["staritsa","tver_r"],
  ["yar","tutayev"],["kostroma","nerekhta"],["nn","chkalovsk"],["nn","puchezh"],["cheboksary","vasilsursk"],
  ["kazan","zelenodolsk"],["zelenodolsk","volzhsk"],["kazan","zvenigovo"],["bolgar","tetyushi"],["ulyanovsk","sengeley"],
  ["tolyatti","zhigulevsk"],["samara","oktyabrsk"],["balakovo","volsk"],["saratov","marks"],["volgograd","dubovka"],
  ["ast","narimanov"],["kalach","tsimlyansk"],["tsimlyansk","volgodonsk"],["volgodonsk","ustdonetsk"],["ustdonetsk","semikarakorsk"],
  ["semikarakorsk","aksay"],["aksay","rostov"],["azov","yeisk"],["kerch","taman"],["taman","temryuk"],
  ["nvr","gelendzhik"],["sochi","adler_port"],["black1","gelendzhik"],["black1","adler_port"],
  ["sevastopol","evpatoria"],["ydne","feodosia"],["kerch","feodosia"],
  ["irkutsk_r","listvyanka"],["listvyanka","baikal_c"],["baikal_c","severobaikalsk"],["bratsk","angara_f"],["angara_f","ustilimsk"],
  ["msk_north","dmitrov"],["dmitrov","dubna"],["yar","yar2"],["msk_north","msk_tech"],["spb_river","spb2"],
  ["kazan","kazan2"],["nn","nizhny2"],["samara","samara2"],["volgograd","volgograd2"],["ast","astrakhan2"]

];
var PORT_ADJ={};
PORT_EDGES.forEach(function(e){
  (PORT_ADJ[e[0]]=PORT_ADJ[e[0]]||[]).push(e[1]);
  (PORT_ADJ[e[1]]=PORT_ADJ[e[1]]||[]).push(e[0]);
});
function nearestPort(p){
  var best=null,bd=1e9,i;
  for(i=0;i<PORTS.length;i++){
    var pr=PORTS[i];
    if(!pr.id) continue;
    if(/фарватер|центр|^Балтика|^Каспий|^Чёрное|^Азовское|^Ладога|^Онега|^Японское|^Баренцево|^Белое|море/.test(pr.n)) continue;
    var d=hav(p,pr);
    if(d<bd){ bd=d; best=pr; }
  }
  return best;
}
function portPath(idA, idB){
  if(!idA||!idB) return null;
  if(idA===idB) return [idA];
  var q=[idA], prev={}, seen={}; seen[idA]=1; prev[idA]=null;
  while(q.length){
    var u=q.shift(), nb=PORT_ADJ[u]||[], i;
    for(i=0;i<nb.length;i++){
      var v=nb[i];
      if(seen[v]) continue;
      seen[v]=1; prev[v]=u;
      if(v===idB){
        var path=[], x=idB;
        while(x){ path.push(x); x=prev[x]; }
        path.reverse();
        return path;
      }
      q.push(v);
    }
  }
  return null;
}
function shipCoords(a, b){
  var pa=a.portId && PORT_BY_ID[a.portId] ? PORT_BY_ID[a.portId] : nearestPort(a);
  var pb=b.portId && PORT_BY_ID[b.portId] ? PORT_BY_ID[b.portId] : nearestPort(b);
  if(pa && pb){
    var ids=portPath(pa.id, pb.id);
    if(ids && ids.length>=1){
      var pts=[[a.lat,a.lng]], i, pr;
      for(i=0;i<ids.length;i++){
        pr=PORT_BY_ID[ids[i]];
        if(pr) pts.push([pr.lat,pr.lng]);
      }
      pts.push([b.lat,b.lng]);
      return densify(pts, 5);
    }
  }
  var waterIds=["baltic1","baltic2","black1","black2","caspian1","ladoga","onega","azov_sea","volga_n1","volga_n2","volga_m1","volga_m2","volga_s1","volga_s2","volga_s3","don_f1","don_f2","ob_f1","ob_f2","yen_f1","yen_f2","lena_f1","amur_f1"];
  var wa=null,wb=null,da=1e9,db=1e9,i,w,d;
  for(i=0;i<waterIds.length;i++){
    w=PORT_BY_ID[waterIds[i]]; if(!w) continue;
    d=hav(a,w); if(d<da){ da=d; wa=w; }
    d=hav(b,w); if(d<db){ db=d; wb=w; }
  }
  if(wa && wb){
    var ids2=portPath(wa.id, wb.id);
    var pts=[[a.lat,a.lng],[wa.lat,wa.lng]];
    if(ids2){ for(i=0;i<ids2.length;i++){ w=PORT_BY_ID[ids2[i]]; if(w) pts.push([w.lat,w.lng]); } }
    pts.push([wb.lat,wb.lng],[b.lat,b.lng]);
    return densify(pts, 5);
  }
  var midLat=(a.lat+b.lat)/2, midLng=(a.lng+b.lng)/2;
  if(midLat>55 && midLng>18 && midLng<35){ midLat=59.0; midLng=22.5; }
  else if(midLat>41 && midLat<48 && midLng>27 && midLng<42){ midLat=43.2; midLng=34.5; }
  else if(midLat>36 && midLat<48 && midLng>46 && midLng<55){ midLat=42.5; midLng=50.5; }
  return densify([[a.lat,a.lng],[midLat,midLng],[b.lat,b.lng]], 6);
}



var CITIES = [
  {n:"Москва",lat:55.7558,lng:37.6173},{n:"Санкт-Петербург",lat:59.9343,lng:30.3351},
  {n:"Новосибирск",lat:55.0084,lng:82.9357},{n:"Екатеринбург",lat:56.8389,lng:60.6057},
  {n:"Казань",lat:55.7961,lng:49.1064},{n:"Нижний Новгород",lat:56.2965,lng:43.9361},
  {n:"Челябинск",lat:55.1644,lng:61.4368},{n:"Самара",lat:53.1959,lng:50.1002},
  {n:"Омск",lat:54.9885,lng:73.3242},{n:"Ростов-на-Дону",lat:47.2357,lng:39.7015},
  {n:"Уфа",lat:54.7388,lng:55.9721},{n:"Красноярск",lat:56.0153,lng:92.8932},
  {n:"Воронеж",lat:51.6720,lng:39.1843},{n:"Пермь",lat:58.0105,lng:56.2502},
  {n:"Волгоград",lat:48.7080,lng:44.5133},{n:"Краснодар",lat:45.0355,lng:38.9753},
  {n:"Саратов",lat:51.5336,lng:46.0343},{n:"Тюмень",lat:57.1522,lng:65.5272},
  {n:"Тольятти",lat:53.5303,lng:49.3461},{n:"Ижевск",lat:56.8527,lng:53.2115},
  {n:"Барнаул",lat:53.3481,lng:83.7799},{n:"Ульяновск",lat:54.3142,lng:48.4031},
  {n:"Иркутск",lat:52.2864,lng:104.2807},{n:"Хабаровск",lat:48.4827,lng:135.0838},
  {n:"Ярославль",lat:57.6261,lng:39.8845},{n:"Владивосток",lat:43.1155,lng:131.8855},
  {n:"Махачкала",lat:42.9849,lng:47.5047},{n:"Томск",lat:56.4977,lng:84.9744},
  {n:"Оренбург",lat:51.7727,lng:55.0988},{n:"Кемерово",lat:55.3542,lng:86.0899},
  {n:"Новокузнецк",lat:53.7596,lng:87.1216},{n:"Рязань",lat:54.6269,lng:39.6916},
  {n:"Астрахань",lat:46.3497,lng:48.0408},{n:"Пенза",lat:53.2001,lng:45.0000},
  {n:"Липецк",lat:52.6031,lng:39.5708},{n:"Киров",lat:58.6035,lng:49.6680},
  {n:"Чебоксары",lat:56.1439,lng:47.2489},{n:"Калининград",lat:54.7104,lng:20.4522},
  {n:"Тула",lat:54.1931,lng:37.6173},{n:"Курск",lat:51.7304,lng:36.1926},
  {n:"Ставрополь",lat:45.0445,lng:41.9690},{n:"Улан-Удэ",lat:51.8335,lng:107.5841},
  {n:"Магнитогорск",lat:53.4072,lng:58.9794},{n:"Сочи",lat:43.6028,lng:39.7342},
  {n:"Иваново",lat:56.9972,lng:40.9714},{n:"Брянск",lat:53.2434,lng:34.3636},
  {n:"Белгород",lat:50.5956,lng:36.5873},{n:"Сургут",lat:61.2540,lng:73.3962},
  {n:"Владимир",lat:56.1296,lng:40.4066},{n:"Архангельск",lat:64.5393,lng:40.5187},
  {n:"Калуга",lat:54.5293,lng:36.2754},{n:"Чита",lat:52.0339,lng:113.4994},
  {n:"Смоленск",lat:54.7826,lng:32.0453},{n:"Волжский",lat:48.7858,lng:44.7759},
  {n:"Курган",lat:55.4500,lng:65.3333},{n:"Орёл",lat:52.9703,lng:36.0636},
  {n:"Череповец",lat:59.1226,lng:37.9037},{n:"Вологда",lat:59.2205,lng:39.8915},
  {n:"Саранск",lat:54.1838,lng:45.1749},{n:"Якутск",lat:62.0355,lng:129.6755},
  {n:"Владикавказ",lat:43.0246,lng:44.6819},{n:"Мурманск",lat:68.9585,lng:33.0827},
  {n:"Грозный",lat:43.3178,lng:45.6949},{n:"Тамбов",lat:52.7213,lng:41.4525},
  {n:"Петрозаводск",lat:61.7849,lng:34.3469},{n:"Кострома",lat:57.7676,lng:40.9269},
  {n:"Йошкар-Ола",lat:56.6344,lng:47.8999},{n:"Новороссийск",lat:44.7235,lng:37.7686},
  {n:"Таганрог",lat:47.2362,lng:38.8969},{n:"Комсомольск-на-Амуре",lat:50.5500,lng:137.0100},
  {n:"Нижневартовск",lat:60.9397,lng:76.5693},{n:"Сыктывкар",lat:61.6688,lng:50.8356},
  {n:"Нальчик",lat:43.4853,lng:43.6071},{n:"Дзержинск",lat:56.2389,lng:43.4631},
  {n:"Орск",lat:51.2293,lng:58.4752},{n:"Ангарск",lat:52.5448,lng:103.8885},
  {n:"Благовещенск",lat:50.2905,lng:127.5272},{n:"Псков",lat:57.8194,lng:28.3318},
  {n:"Бийск",lat:52.5394,lng:85.2138},{n:"Прокопьевск",lat:53.8806,lng:86.7184},
  {n:"Химки",lat:55.8970,lng:37.4297},{n:"Балашиха",lat:55.7963,lng:37.9382},
  {n:"Подольск",lat:55.4312,lng:37.5448},{n:"Королёв",lat:55.9162,lng:37.8545},
  {n:"Мытищи",lat:55.9102,lng:37.7365},{n:"Люберцы",lat:55.6766,lng:37.8933},
  {n:"Электросталь",lat:55.7896,lng:38.4467},{n:"Коломна",lat:55.0794,lng:38.7783},
  {n:"Серпухов",lat:54.9158,lng:37.4111},{n:"Орехово-Зуево",lat:55.8067,lng:38.9618},
  {n:"Домодедово",lat:55.4365,lng:37.7666},{n:"Щёлково",lat:55.9167,lng:37.9833},
  {n:"Раменское",lat:55.5673,lng:38.2301},{n:"Жуковский",lat:55.5953,lng:38.1203},
  {n:"Ногинск",lat:55.8666,lng:38.4437},{n:"Сергиев Посад",lat:56.3100,lng:38.1326},
  {n:"Армавир",lat:45.0013,lng:41.1234},{n:"Ессентуки",lat:44.0444,lng:42.8608},
  {n:"Пятигорск",lat:44.0486,lng:43.0594},{n:"Кисловодск",lat:43.9133,lng:42.7208},
  {n:"Минеральные Воды",lat:44.2104,lng:43.1353},{n:"Адлер",lat:43.4330,lng:39.9230},
  {n:"Анапа",lat:44.8950,lng:37.3160},{n:"Геленджик",lat:44.5630,lng:38.0790},
  {n:"Туапсе",lat:44.1050,lng:39.0800},{n:"Новый Уренгой",lat:66.0833,lng:76.6333},
  {n:"Ноябрьск",lat:63.2017,lng:75.4511},{n:"Ханты-Мансийск",lat:61.0032,lng:69.0189},
  {n:"Нижнекамск",lat:55.6366,lng:51.8245},{n:"Альметьевск",lat:54.9014,lng:52.2973},
  {n:"Набережные Челны",lat:55.7436,lng:52.3959},{n:"Стерлитамак",lat:53.6246,lng:55.9502},
  {n:"Салават",lat:53.3617,lng:55.9246},{n:"Нефтеюганск",lat:61.0883,lng:72.6167},
  {n:"Братск",lat:56.1325,lng:101.6142},{n:"Анжеро-Судженск",lat:56.0833,lng:86.0333},
  {n:"Южно-Сахалинск",lat:46.9590,lng:142.7380},{n:"Петропавловск-Камчатский",lat:53.0370,lng:158.6559},
  {n:"Магадан",lat:59.5683,lng:150.8085},{n:"Норильск",lat:69.3490,lng:88.2010},
  {n:"Абакан",lat:53.7210,lng:91.4420},{n:"Горно-Алтайск",lat:51.9581,lng:85.9603},
  {n:"Элиста",lat:46.3078,lng:44.2558},{n:"Майкоп",lat:44.6067,lng:40.1058},
  {n:"Черкесск",lat:44.2233,lng:42.0578},{n:"Дербент",lat:42.0678,lng:48.2899},
  {n:"Каспийск",lat:42.8816,lng:47.6382},{n:"Хасавюрт",lat:43.2509,lng:46.5877},
  {n:"Назрань",lat:43.2257,lng:44.7647},{n:"Севастополь",lat:44.6167,lng:33.5254},
  {n:"Симферополь",lat:44.9521,lng:34.1024},{n:"Ялта",lat:44.4952,lng:34.1663},
  {n:"Керчь",lat:45.3566,lng:36.4674},{n:"Евпатория",lat:45.1904,lng:33.3678},
  {n:"Выборг",lat:60.7090,lng:28.7490},
  {n:"Гатчина",lat:59.5710,lng:30.1280},
  {n:"Тихвин",lat:59.6450,lng:33.5290},
  {n:"Бологое",lat:57.8800,lng:34.0920},
  {n:"Вязьма",lat:55.2100,lng:34.2950},
  {n:"Ржев",lat:56.2620,lng:34.3280},
  {n:"Кимры",lat:56.8730,lng:37.3560},
  {n:"Кашин",lat:57.3590,lng:37.6070},
  {n:"Углич",lat:57.5260,lng:38.3320},
  {n:"Рыбинск",lat:58.0450,lng:38.8420},
  {n:"Шуя",lat:56.8510,lng:41.3880},
  {n:"Кинешма",lat:57.4390,lng:42.1290},
  {n:"Муром",lat:55.5760,lng:42.0420},
  {n:"Арзамас",lat:55.3950,lng:43.8400},
  {n:"Саров",lat:54.9360,lng:43.3240},
  {n:"Димитровград",lat:54.2170,lng:49.5900},
  {n:"Бугульма",lat:54.5360,lng:52.7890},
  {n:"Нефтекамск",lat:56.0920,lng:54.2610},
  {n:"Октябрьский",lat:54.4810,lng:53.4710},
  {n:"Березники",lat:59.4080,lng:56.8200},
  {n:"Соликамск",lat:59.6480,lng:56.7710},
  {n:"Нижний Тагил",lat:57.9190,lng:59.9650},
  {n:"Каменск-Уральский",lat:56.4150,lng:61.9180},
  {n:"Златоуст",lat:55.1710,lng:59.6510},
  {n:"Миасс",lat:55.0450,lng:60.1080},
  {n:"Новотроицк",lat:51.2030,lng:58.3260},
  {n:"Серов",lat:59.6050,lng:60.5750},
  {n:"Тобольск",lat:58.1980,lng:68.2550},
  {n:"Ишим",lat:56.1130,lng:69.4820},
  {n:"Барабинск",lat:55.3510,lng:78.3470},
  {n:"Тайга",lat:56.0640,lng:85.6220},
  {n:"Мариинск",lat:56.2140,lng:87.7470},
  {n:"Ачинск",lat:56.2690,lng:90.4990},
  {n:"Канск",lat:56.2050,lng:95.7190},
  {n:"Тайшет",lat:55.9400,lng:98.0100},
  {n:"Нижнеудинск",lat:54.9070,lng:99.0310},
  {n:"Зима",lat:53.9200,lng:102.0490},
  {n:"Слюдянка",lat:51.6590,lng:103.7060},
  {n:"Северобайкальск",lat:55.6400,lng:109.3130},
  {n:"Могоча",lat:53.7360,lng:119.7660},
  {n:"Сковородино",lat:53.9830,lng:123.9400},
  {n:"Белогорск",lat:50.9160,lng:128.4770},
  {n:"Биробиджан",lat:48.7930,lng:132.9210},
  {n:"Уссурийск",lat:43.8030,lng:131.9460},
  {n:"Находка",lat:42.8240,lng:132.8930},
  {n:"Артём",lat:43.3600,lng:132.1900},
  {n:"Минск",lat:53.9006,lng:27.5590},
  {n:"Брест",lat:52.0975,lng:23.7341},
  {n:"Гомель",lat:52.4345,lng:30.9754},
  {n:"Витебск",lat:55.1904,lng:30.2049},
  {n:"Гродно",lat:53.6694,lng:23.8131},
  {n:"Могилёв",lat:53.9007,lng:30.3314},
  {n:"Алматы",lat:43.2380,lng:76.9450},
  {n:"Астана",lat:51.1694,lng:71.4491},
  {n:"Шымкент",lat:42.3419,lng:69.5901},
  {n:"Караганда",lat:49.8047,lng:73.1094},
  {n:"Актобе",lat:50.2839,lng:57.1670},
  {n:"Атырау",lat:47.1164,lng:51.8830},
  {n:"Актау",lat:43.6511,lng:51.1975},
  {n:"Ташкент",lat:41.2995,lng:69.2401},
  {n:"Самарканд",lat:39.6542,lng:66.9597},
  {n:"Бухара",lat:39.7681,lng:64.4556},
  {n:"Бишкек",lat:42.8746,lng:74.5698},
  {n:"Ош",lat:40.5283,lng:72.7985},
  {n:"Душанбе",lat:38.5598,lng:68.7738},
  {n:"Ашхабад",lat:37.9601,lng:58.3261},
  {n:"Ереван",lat:40.1792,lng:44.4991},
  {n:"Тбилиси",lat:41.7151,lng:44.8271},
  {n:"Батуми",lat:41.6168,lng:41.6367},
  {n:"Баку",lat:40.4093,lng:49.8671},
  {n:"Кишинёв",lat:47.0105,lng:28.8638},
  {n:"Вышний Волочёк",lat:57.584,lng:34.545},
  {n:"Торжок",lat:57.042,lng:34.960},
  {n:"Конаково",lat:56.700,lng:36.778},
  {n:"Александров",lat:56.395,lng:38.712},
  {n:"Кольчугино",lat:56.299,lng:39.383},
  {n:"Гусь-Хрустальный",lat:55.611,lng:40.652},
  {n:"Вязники",lat:56.247,lng:42.129},
  {n:"Гороховец",lat:56.203,lng:42.692},
  {n:"Павлово",lat:55.962,lng:43.091},
  {n:"Бор",lat:56.360,lng:44.059},
  {n:"Кстово",lat:56.147,lng:44.195},
  {n:"Выкса",lat:55.320,lng:42.174},
  {n:"Кулебаки",lat:55.413,lng:42.512},
  {n:"Навашино",lat:55.544,lng:42.188},
  {n:"Ардатов",lat:55.242,lng:43.094},
  {n:"Сергач",lat:55.530,lng:45.466},
  {n:"Шахунья",lat:57.676,lng:46.611},
  {n:"Урень",lat:57.463,lng:45.785},
  {n:"Ветлуга",lat:57.856,lng:45.781},
  {n:"Семенов",lat:56.789,lng:44.501},
  {n:"Лысково",lat:56.033,lng:45.047},
  {n:"Перевоз",lat:55.596,lng:44.330},
  {n:"Бутурлино",lat:55.566,lng:44.897},
  {n:"Сердобск",lat:52.458,lng:44.216},
  {n:"Белинский",lat:52.964,lng:43.418},
  {n:"Никольск",lat:53.971,lng:46.188},
  {n:"Городище",lat:53.294,lng:45.701},
  {n:"Кузнецк",lat:53.116,lng:46.600},
  {n:"Каменка",lat:53.190,lng:44.047},
  {n:"Заречный",lat:53.203,lng:45.192},
  {n:"Елабуга",lat:55.761,lng:52.064},
  {n:"Чистополь",lat:55.363,lng:50.642},
  {n:"Заинск",lat:55.299,lng:52.065},
  {n:"Нурлат",lat:54.427,lng:50.805},
  {n:"Бавлы",lat:54.393,lng:53.250},
  {n:"Буинск",lat:54.971,lng:48.290},
  {n:"Тетюши",lat:54.938,lng:48.831},
  {n:"Азнакаево",lat:54.578,lng:52.798},
  {n:"Менделеевск",lat:55.908,lng:52.290},
  {n:"Мензелинск",lat:55.727,lng:53.102},
  {n:"Туймазы",lat:54.607,lng:53.695},
  {n:"Белебей",lat:54.116,lng:54.111},
  {n:"Ишимбай",lat:53.454,lng:56.041},
  {n:"Кумертау",lat:52.765,lng:55.784},
  {n:"Сибай",lat:52.718,lng:58.666},
  {n:"Мелеуз",lat:52.959,lng:55.933},
  {n:"Давлеканово",lat:54.218,lng:55.031},
  {n:"Дюртюли",lat:55.485,lng:54.867},
  {n:"Борисов",lat:54.148,lng:28.505},
  {n:"Солигорск",lat:52.784,lng:27.541},
  {n:"Молодечно",lat:54.308,lng:26.851},
  {n:"Лида",lat:53.883,lng:25.299},
  {n:"Барановичи",lat:53.133,lng:26.014},
  {n:"Пинск",lat:52.122,lng:26.095},
  {n:"Орша",lat:54.508,lng:30.420},
  {n:"Полоцк",lat:55.487,lng:28.785},
  {n:"Жлобин",lat:52.892,lng:30.038},
  {n:"Мозырь",lat:52.049,lng:29.245},
  {n:"Кобрин",lat:52.216,lng:24.356},
  {n:"Слуцк",lat:53.027,lng:27.560},
  {n:"Новополоцк",lat:55.532,lng:28.647},
  {n:"Речица",lat:52.363,lng:30.391},
  {n:"Светлогорск",lat:52.634,lng:29.749},
  {n:"Павлодар",lat:52.287,lng:76.967},
  {n:"Семей",lat:50.411,lng:80.227},
  {n:"Усть-Каменогорск",lat:49.978,lng:82.629},
  {n:"Костанай",lat:53.214,lng:63.624},
  {n:"Кызылорда",lat:44.849,lng:65.509},
  {n:"Петропавловск",lat:54.866,lng:69.162},
  {n:"Талдыкорган",lat:45.016,lng:78.374},
  {n:"Тараз",lat:42.900,lng:71.366},
  {n:"Туркестан",lat:43.297,lng:68.251},
  {n:"Экибастуз",lat:51.730,lng:75.323},
  {n:"Рудный",lat:52.972,lng:63.116},
  {n:"Уральск",lat:51.234,lng:51.368},
  {n:"Темиртау",lat:50.054,lng:72.965},
  {n:"Жезказган",lat:47.803,lng:67.714},
  {n:"Нукус",lat:42.453,lng:59.610},
  {n:"Андижан",lat:40.783,lng:72.344},
  {n:"Наманган",lat:40.998,lng:71.672},
  {n:"Фергана",lat:40.386,lng:71.786},
  {n:"Термез",lat:37.224,lng:67.278},
  {n:"Карши",lat:38.860,lng:65.789},
  {n:"Джизак",lat:40.116,lng:67.842},
  {n:"Гулистан",lat:40.495,lng:68.784},
  {n:"Навои",lat:40.094,lng:65.379},
  {n:"Гянджа",lat:40.683,lng:46.360},
  {n:"Сумгаит",lat:40.590,lng:49.669},
  {n:"Мингечевир",lat:40.763,lng:47.059},
  {n:"Кутаиси",lat:42.267,lng:42.694},
  {n:"Рустави",lat:41.549,lng:45.000},
  {n:"Зугдиди",lat:42.509,lng:41.871},
  {n:"Поти",lat:42.146,lng:41.672},
  {n:"Гори",lat:41.984,lng:44.109},
  {n:"Гюмри",lat:40.789,lng:43.847},
  {n:"Ванадзор",lat:40.807,lng:44.488},
  {n:"Дилижан",lat:40.741,lng:44.863},
  {n:"Дмитров",lat:56.345,lng:37.520},
  {n:"Красногорск",lat:55.821,lng:37.330},
  {n:"Одинцово",lat:55.678,lng:37.278},
  {n:"Ковров",lat:56.357,lng:41.319},
  {n:"Вичуга",lat:57.219,lng:41.913},
  {n:"Тутаев",lat:57.869,lng:39.535},
  {n:"Мышкин",lat:57.789,lng:38.454},
  {n:"Переславль-Залесский",lat:56.739,lng:38.856},
  {n:"Ростов Великий",lat:57.199,lng:39.414},
  {n:"Галич",lat:58.383,lng:42.347},
  {n:"Шарья",lat:58.369,lng:45.518},
  {n:"Великий Устюг",lat:60.764,lng:46.310},
  {n:"Котлас",lat:61.261,lng:46.650},
  {n:"Северодвинск",lat:64.562,lng:39.830},
  {n:"Новодвинск",lat:64.416,lng:40.812},
  {n:"Апатиты",lat:67.568,lng:33.407},
  {n:"Кировск",lat:67.615,lng:33.672},
  {n:"Мончегорск",lat:67.940,lng:32.874},
  {n:"Кандалакша",lat:67.157,lng:32.412},
  {n:"Сокол",lat:59.462,lng:40.121},
  {n:"Великий Новгород",lat:58.523,lng:31.270},
  {n:"Старая Русса",lat:57.991,lng:31.356},
  {n:"Боровичи",lat:58.388,lng:33.914},
  {n:"Великие Луки",lat:56.340,lng:30.545},
  {n:"Обнинск",lat:55.094,lng:36.610},
  {n:"Новомосковск",lat:54.011,lng:38.285},
  {n:"Клинцы",lat:52.752,lng:32.239},
  {n:"Ливны",lat:52.425,lng:37.608},
  {n:"Железногорск",lat:52.332,lng:35.371},
  {n:"Старый Оскол",lat:51.297,lng:37.841},
  {n:"Губкин",lat:51.282,lng:37.546},
  {n:"Елец",lat:52.624,lng:38.502},
  {n:"Мичуринск",lat:52.898,lng:40.491},
  {n:"Касимов",lat:54.937,lng:41.397},
  {n:"Новочебоксарск",lat:56.121,lng:47.479},
  {n:"Сарапул",lat:56.476,lng:53.800},
  {n:"Глазов",lat:58.139,lng:52.658},
  {n:"Копейск",lat:55.117,lng:61.628},
  {n:"Шадринск",lat:56.085,lng:63.633},
  {n:"Салехард",lat:66.530,lng:66.602},
  {n:"Рубцовск",lat:51.527,lng:81.213},
  {n:"Междуреченск",lat:53.694,lng:88.070},
  {n:"Усть-Илимск",lat:58.009,lng:102.666},
  {n:"Амурск",lat:50.227,lng:136.899},
  {n:"Корсаков",lat:46.637,lng:142.775},
  {n:"Елизово",lat:53.183,lng:158.388},
  {n:"Анадырь",lat:64.734,lng:177.510},
  {n:"Нерюнгри",lat:56.664,lng:124.720},
  {n:"Мирный",lat:62.535,lng:113.961},
  {n:"Дудинка",lat:69.406,lng:86.177},
  {n:"Черногорск",lat:53.823,lng:91.284},
  {n:"Кызыл",lat:51.719,lng:94.438},
  {n:"Магас",lat:43.167,lng:44.813},
  {n:"Невинномысск",lat:44.634,lng:41.944},
  {n:"Шахты",lat:47.709,lng:40.215},
  {n:"Новочеркасск",lat:47.422,lng:40.094},
  {n:"Волгодонск",lat:47.514,lng:42.151},
  {n:"Батайск",lat:47.140,lng:39.751},
  {n:"Азов",lat:47.110,lng:39.420},
  {n:"Каменск-Шахтинский",lat:48.321,lng:40.269},
  {n:"Сальск",lat:46.475,lng:41.541}
];

var BUILTIN = [
  {id:"f1",mode:"plane",flight:"W4 6927",from:"Неаполь (NAP)",to:"Ереван (EVN)",fromCode:"NAP",toCode:"EVN",date:"2026-09-28",time:"06:00"},
  {id:"f2",mode:"plane",flight:"SU 1861",from:"Ереван (EVN)",to:"Москва (SVO)",fromCode:"EVN",toCode:"SVO",date:"2026-09-28",time:"19:45"},
  {id:"p1",mode:"plane",flight:"W4 6456",from:"Ереван (EVN)",to:"Милан (MXP)",fromCode:"EVN",toCode:"MXP",date:"2026-09-17",duration:"4ч 40м"},
  {id:"p2",mode:"plane",flight:"SU 1966",from:"Москва (SVO)",to:"Ереван (EVN)",fromCode:"SVO",toCode:"EVN",date:"2026-09-17",duration:"4ч 19м"},
  {id:"p3",mode:"plane",flight:"B2 977",from:"Минск (MSQ)",to:"Москва (SVO)",fromCode:"MSQ",toCode:"SVO",date:"2026-07-06",duration:"1ч 47м"},
  {id:"p4",mode:"plane",flight:"B2 978",from:"Москва (SVO)",to:"Минск (MSQ)",fromCode:"SVO",toCode:"MSQ",date:"2026-07-03",duration:"1ч 31м"},
  {id:"p5",mode:"plane",flight:"3U 3887",from:"Чэнду (TFU)",to:"Москва (SVO)",fromCode:"TFU",toCode:"SVO",date:"2026-04-12",duration:"8ч 2м"},
  {id:"p6",mode:"plane",flight:"3U 3932",from:"Пхукет (HKT)",to:"Чэнду (TFU)",fromCode:"HKT",toCode:"TFU",date:"2026-04-11",duration:"3ч 43м"},
  {id:"p7",mode:"plane",flight:"FD 4114",from:"Бангкок (BKK)",to:"Пхукет (HKT)",fromCode:"BKK",toCode:"HKT",date:"2026-04-04",duration:"1ч 30м"},
  {id:"p8",mode:"plane",flight:"HU 721",from:"Хайкоу (HAK)",to:"Бангкок (BKK)",fromCode:"HAK",toCode:"BKK",date:"2026-03-31",duration:"2ч 8м"},
  {id:"p9",mode:"plane",flight:"HU 766",from:"Москва (SVO)",to:"Хайкоу (HAK)",fromCode:"SVO",toCode:"HAK",date:"2026-03-30",duration:"8ч 58м"},
  {id:"t1",mode:"train",flight:"Сапсан 756А",from:"Москва Ленинградский",to:"Санкт-Петербург Московский",date:"2026-08-01",time:"06:50",duration:"3ч 59м"},
  {id:"t2",mode:"train",flight:"Сапсан 781А",from:"Санкт-Петербург Московский",to:"Москва Ленинградский",date:"2026-08-03",time:"19:10",duration:"4ч 8м"},
  {id:"it1",mode:"train",flight:"IT",from:"Milan Central",to:"Bergamo",date:"2026-09-19",time:"10:05",duration:"50м"},
  {id:"it2",mode:"train",flight:"IT",from:"Bergamo",to:"Milan Lambrate",date:"2026-09-19",time:"18:02",duration:"37м"},
  {id:"it3",mode:"train",flight:"IT",from:"Milan Central",to:"Venice Santa Lucia",date:"2026-09-20",time:"09:35",duration:"2ч 28м"},
  {id:"it4",mode:"train",flight:"IT",from:"Venice Santa Lucia",to:"Florence S.M.N",date:"2026-09-22",time:"13:05",duration:"2ч 15м"},
  {id:"it5",mode:"train",flight:"IT",from:"Florence S.M.N",to:"Rome Termini",date:"2026-09-24",time:"10:28",duration:"1ч 42м"},
  {id:"it6",mode:"train",flight:"IT",from:"Rome Termini",to:"Naples Central",date:"2026-09-26",time:"11:25",duration:"1ч 18м"},
  {id:"car1",mode:"car",flight:"Авто",from:"Дубай",to:"Абу-Даби",date:"2025-10-03"},
  {id:"car2",mode:"car",flight:"Авто",from:"Абу-Даби",to:"Дубай",date:"2025-10-03"},
  {id:"p10",mode:"plane",flight:"U6 798",from:"Дубай (DWC)",to:"Москва (DME)",fromCode:"DWC",toCode:"DME",date:"2025-10-10",duration:"5ч 13м"},
  {id:"p11",mode:"plane",flight:"U6 797",from:"Москва (DME)",to:"Дубай (DWC)",fromCode:"DME",toCode:"DWC",date:"2025-10-01",duration:"5ч 19м"},
  {id:"p12",mode:"plane",flight:"HU 7985",from:"Пекин (PEK)",to:"Москва (SVO)",fromCode:"PEK",toCode:"SVO",date:"2025-07-14",duration:"9ч 14м"},
  {id:"p13",mode:"plane",flight:"HU 7612",from:"Шанхай (SHA)",to:"Пекин (PEK)",fromCode:"SHA",toCode:"PEK",date:"2025-07-13",duration:"2ч 24м"},
  {id:"p14",mode:"plane",flight:"HU 7605",from:"Пекин (PEK)",to:"Шанхай (SHA)",fromCode:"PEK",toCode:"SHA",date:"2025-07-06",duration:"2ч 22м"},
  {id:"p15",mode:"plane",flight:"HU 7986",from:"Москва (SVO)",to:"Пекин (PEK)",fromCode:"SVO",toCode:"PEK",date:"2025-06-30",duration:"7ч 45м"},
  {id:"p16",mode:"plane",flight:"N4 60",from:"Казань (KZN)",to:"Москва (SVO)",fromCode:"KZN",toCode:"SVO",date:"2024-02-23",duration:"1ч 32м"},
  {id:"t3",mode:"train",flight:"024",from:"Москва Казанский",to:"Казань",date:"2024-02-19",time:"23:12",duration:"11ч 39м"},
  {id:"t4",mode:"train",flight:"120",from:"Тула Московский",to:"Москва Восточный / Черкизово",date:"2024-06-01",time:"18:06",duration:"3ч 7м"},
  {id:"p17",mode:"plane",flight:"S7 1056",from:"Казань (KZN)",to:"Москва (DME)",fromCode:"KZN",toCode:"DME",date:"2021-01-29",duration:"2ч"},
  {id:"p18",mode:"plane",flight:"S7 1051",from:"Москва (DME)",to:"Казань (KZN)",fromCode:"DME",toCode:"KZN",date:"2021-01-27",duration:"1ч 21м"}
];


function safeSetItem(key, val){
  try{ localStorage.setItem(key, val); }catch(e){ alert("Не удалось сохранить дневник в браузере"); return false; }
  scheduleCloudSave();
  return true;
}
var cloudTimer=null;
function scheduleCloudSave(){
  if(window.__TRAVELEK_READONLY) return;
  if(typeof window.__cloudPush!=="function") return;
  clearTimeout(cloudTimer);
  cloudTimer=setTimeout(function(){
    var keys=["travelek-extra","travelek-del","travelek-app-settings","travelek-mapprefs","travelek-theme","travelek-theme-pref","travelek-countries","travelek-countries-off","travelek-regions","travelek-regions-off"];
    var pack={}, i;
    for(i=0;i<keys.length;i++) pack[keys[i]]=localStorage.getItem(keys[i]);
    try{ window.__cloudPush(pack); }catch(e){}
  }, 500);
}
function saveExtra(list){ safeSetItem("travelek-extra", JSON.stringify(list||[])); }
function saveDeleted(list){ safeSetItem("travelek-del", JSON.stringify(list||[])); }
function loadAppSettings(){ try{ return JSON.parse(localStorage.getItem("travelek-app-settings")||"{}"); }catch(e){ return {}; } }
function saveAppSettings(s){ safeSetItem("travelek-app-settings", JSON.stringify(s||{})); }
function isStrictRoutes(){ return true; }
function navLimitsOn(){ return loadAppSettings().navLimits!==false; }
function navZonesOn(){ return !!loadAppSettings().navZones; }
var navZoneLayer=null;
function shipBasin(p){
  if(!p) return "";
  var id=p.portId||"";
  var lat=p.lat, lng=p.lng;
  var vb={spb_river:1,shlisselburg:1,novaya_ladoga:1,lodeynoe:1,mandrogi:1,petrozavodsk:1,onega:1,kizhi:1,vytegra:1,cherepovets:1,sheksna:1,goritsy:1,kirillov:1,valaam:1,ladoga:1,sortavala:1,priozersk:1,spb:1,spb2:1};
  if(id==="gorodec"||id==="balakhna") return "gorodets";
  if(vb[id]) return "vb";
  if(lat>64) return "north";
  if(lng>120 && lat<56) return "amur";
  if(lng>80 && lat>55) return "siberia";
  if(lng>43 && lng<52 && lat>45 && lat<61) return "volga";
  if(lat>58 && lng>29 && lng<42) return "vb";
  return "sea";
}
function shipNavWarnings(pa, pb, dateStr){
  if(!navLimitsOn()) return [];
  var d=dateStr?new Date(dateStr+"T12:00:00"):new Date();
  if(isNaN(d.getTime())) d=new Date();
  var month=d.getMonth()+1;
  var w=[];
  function msg(b){
    if(b==="vb" && (month<4 || month>11)) return "Волго-Балт: навигация примерно апрель–ноябрь";
    if(b==="gorodets" && month>=7 && month<=9) return "Волга у Городца: летом возможно маловодье и ограничение осадки";
    if(b==="volga" && (month<4 || month>11)) return "Волга: навигация обычно апрель–ноябрь";
    if(b==="north" && (month<6 || month>10)) return "Север: короткий сезон, примерно июнь–октябрь";
    if(b==="siberia" && (month<6 || month>10)) return "Сибирские реки: навигация примерно июнь–октябрь";
    if(b==="amur" && (month<5 || month>10)) return "Амур: навигация примерно май–октябрь";
    return null;
  }
  [shipBasin(pa), shipBasin(pb)].forEach(function(b){
    var m=msg(b);
    if(m && w.indexOf(m)<0) w.push(m);
  });
  return w;
}
function drawNavZones(){
  if(typeof map==="undefined" || !map || typeof L==="undefined") return;
  if(navZoneLayer){ try{ map.removeLayer(navZoneLayer); }catch(e){} navZoneLayer=null; }
  if(!navZonesOn()) return;
  navZoneLayer=L.layerGroup();
  var zones=[
    {lat:60.2,lng:32.5,r:180000,c:"#22d3ee"},
    {lat:56.65,lng:43.47,r:28000,c:"#fbbf24"},
    {lat:53.2,lng:47.8,r:320000,c:"#60a5fa"},
    {lat:56.3,lng:52.8,r:180000,c:"#34d399"},
    {lat:47.8,lng:41.2,r:160000,c:"#fb7185"},
    {lat:61.5,lng:70,r:380000,c:"#a78bfa"},
    {lat:64,lng:88,r:420000,c:"#f97316"},
    {lat:62,lng:120,r:360000,c:"#eab308"},
    {lat:50.2,lng:136.2,r:260000,c:"#2dd4bf"}
  ];
  zones.forEach(function(z){
    L.circle([z.lat,z.lng],{radius:z.r,color:z.c,weight:1,fillColor:z.c,fillOpacity:0.12,interactive:false}).addTo(navZoneLayer);
  });
  navZoneLayer.addTo(map);
  try{ navZoneLayer.bringToBack && map.getPane && null; }catch(e){}
}

function loadExtra(){ try{return JSON.parse(localStorage.getItem("travelek-extra")||"[]");}catch(e){return[];} }
function loadDeleted(){ try{return JSON.parse(localStorage.getItem("travelek-del")||"[]");}catch(e){return[];} }
function wipeRoutesOnce(){
  if(localStorage.getItem("travelek-wipe")==="2") return;
  var KEYS=["travelek-extra","travelek-del","travelek-countries","travelek-countries-off","travelek-regions","travelek-regions-off"];
  try{
    var vault=JSON.parse(localStorage.getItem("travelek-vault")||"{}");
    if(vault && typeof vault==="object"){
      Object.keys(vault).forEach(function(id){
        KEYS.forEach(function(k){ if(vault[id]) delete vault[id][k]; });
      });
      localStorage.setItem("travelek-vault", JSON.stringify(vault));
    }
  }catch(e){}
  KEYS.forEach(function(k){ localStorage.removeItem(k); });
  localStorage.setItem("travelek-wipe","2");
  if(window.__cloudPush){
    var empty={};
    KEYS.forEach(function(k){ empty[k]=null; });
    try{ window.__cloudPush(empty); }catch(e){}
  }
}
wipeRoutesOnce();
(function bootLocalAccounts(){
  if(window.__TRAVELEK_PRIVATE) return;
  window.__TRAVELEK_PRIVATE=true;
  var USERS="travelek-users", SESSION="travelek-session", VAULT="travelek-vault";
  var KEYS=["travelek-extra","travelek-del","travelek-app-settings","travelek-mapprefs","travelek-theme","travelek-theme-pref","travelek-countries","travelek-countries-off","travelek-regions","travelek-regions-off"];
  var STORE_URL="https://keepjson.fourlegs.workers.dev/bins/BkoU663gNtadZ-zfQvPYx";
  var STORE_KEY="kj_w_qgNZJtClt_6vg01Eq5c8j1wpxzMTpSzUKrazvkb12AY";
  function read(k, fb){ try{ var v=JSON.parse(localStorage.getItem(k)||""); return v==null?fb:v; }catch(e){ return fb; } }
  function users(){
    var u=read(USERS, null);
    if(!Array.isArray(u)) u=[];
    var has=false, n;
    for(n=0;n<u.length;n++) if(u[n] && String(u[n].login||"").toLowerCase()==="admin") has=true;
    if(!has) u.unshift({id:"admin", login:"admin", name:"Администратор", password:"f6e718809f4092afc94ad388ee7d808498c19b4dbb7b0f5568a2ca528aaa6ade", role:"admin"});
    return u;
  }
  function vault(){ var v=read(VAULT, {}); return v&&typeof v==="object"&&!Array.isArray(v)?v:{}; }
  function saveVault(v){ try{ localStorage.setItem(VAULT, JSON.stringify(v)); }catch(e){} }
  function sha256(text){
    if(!window.crypto||!crypto.subtle||!window.TextEncoder) return Promise.resolve(String(text||""));
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(text||""))).then(function(buf){
      var a=new Uint8Array(buf), s="", i;
      for(i=0;i<a.length;i++) s+=("0"+a[i].toString(16)).slice(-2);
      return s;
    });
  }
  function passMatch(stored, typed){
    stored=String(stored||"");
    typed=String(typed||"");
    if(stored===typed) return Promise.resolve(true);
    return sha256(typed).then(function(h){ return h===stored; });
  }
  function saveStoreNow(){
    return fetch(STORE_URL, {
      method:"PUT",
      headers:{"Content-Type":"application/json","Authorization":"Bearer "+STORE_KEY},
      body:JSON.stringify({users:users(), vault:vault()})
    }).then(function(r){ if(!r.ok) throw new Error("save"); });
  }
  var saveTimer=null;
  function scheduleSave(){ clearTimeout(saveTimer); saveTimer=setTimeout(function(){ saveStoreNow().catch(function(){}); }, 500); }
  function hashList(list){
    var chain=Promise.resolve();
    list.forEach(function(u, idx){
      chain=chain.then(function(){
        var p=String(u.password||"");
        if(/^[a-f0-9]{64}$/.test(p)) return;
        return sha256(p).then(function(h){ list[idx].password=h; });
      });
    });
    return chain.then(function(){ return list; });
  }
  function pullRemote(){
    if(!me || document.hidden || cloudTimer) return;
    var modal=document.getElementById("modal");
    if(modal && modal.classList.contains("on")) return;
    fetch(STORE_URL+"?t="+Date.now(),{cache:"no-store"}).then(function(r){
      if(!r.ok) throw new Error("load");
      return r.json();
    }).then(function(data){
      if(!data||!data.vault) return;
      var view=sessionStorage.getItem("travelek-view");
      var owner=(view && me.role==="admin")?view:me.id;
      var remotePack=data.vault[owner]||null;
      var remoteExtra=remotePack && typeof remotePack["travelek-extra"]==="string" ? remotePack["travelek-extra"] : null;
      var localExtra=localStorage.getItem("travelek-extra");
      function nExtra(raw){ try{ var a=JSON.parse(raw||"[]"); return Array.isArray(a)?a.length:0; }catch(e){ return 0; } }
      if(Array.isArray(data.users)){
        try{ localStorage.setItem(USERS, JSON.stringify(data.users)); }catch(e){}
      }
      var vv=vault();
      Object.keys(vv).forEach(function(id){
        if(id===owner) return;
        try{
          var lr=JSON.parse((vv[id]&&vv[id]["travelek-extra"])||"[]").length;
          var rr=JSON.parse((data.vault[id]&&data.vault[id]["travelek-extra"])||"[]").length;
          if(lr>rr) data.vault[id]=vv[id];
        }catch(e){}
      });
      try{ localStorage.setItem(VAULT, JSON.stringify(data.vault)); }catch(e){}
      if(remoteExtra!=null && remoteExtra!==localExtra && nExtra(remoteExtra)>=nExtra(localExtra)){
        apply(remotePack);
        ROUTES=assembleRoutes();
        if(typeof render==="function") render();
        if(typeof syncVisited==="function"){ syncVisited(); if(typeof drawCountries==="function") drawCountries(); }
        if(typeof drawGlobe==="function" && globeOn) drawGlobe();
      }
      var panel=document.getElementById("account-panel");
      if(panel && panel.classList.contains("on") && window.__fillAccount) window.__fillAccount();
    }).catch(function(){});
  }
  var storePromise=null;
  function ensureStore(){
    if(storePromise) return storePromise;
    var before="";
    try{ before=(localStorage.getItem(USERS)||"")+"|"+(localStorage.getItem(VAULT)||""); }catch(e){}
    storePromise=fetch(STORE_URL+"?t="+Date.now(), {cache:"no-store"}).then(function(r){
      if(!r.ok) throw new Error("load");
      return r.json();
    }).then(function(data){
      if(!data||typeof data!=="object") data={};
      if(!Array.isArray(data.users)) data.users=[];
      if(!data.vault||typeof data.vault!=="object"||Array.isArray(data.vault)) data.vault={};
      var local=read(USERS, []);
      if(!Array.isArray(local)) local=[];
      var have={}, i, L;
      for(i=0;i<data.users.length;i++) have[String(data.users[i].login||"").toLowerCase()]=1;
      for(i=0;i<local.length;i++){
        L=String((local[i]&&(local[i].login||local[i].email))||"").toLowerCase().replace(/@travelek\.app$/,"");
        if(!L||have[L]) continue;
        have[L]=1;
        data.users.push({id:local[i].id||("u"+Date.now()), login:L, name:local[i].name||L, password:local[i].password||"", role:local[i].role==="admin"?"admin":"user"});
      }
      var lv=read(VAULT, {});
      function packCount(pack){
        if(!pack) return 0;
        try{ var raw=pack["travelek-extra"]; var a=typeof raw==="string"?JSON.parse(raw):raw; return Array.isArray(a)?a.length:0; }catch(e){ return 0; }
      }
      function better(a,b){
        if(!a) return b||a;
        if(!b) return a;
        var an=packCount(a), bn=packCount(b);
        if(bn>an) return b;
        if(an>bn) return a;
        return Object.keys(b).length>Object.keys(a).length?b:a;
      }
      var ids={}, id;
      if(lv&&typeof lv==="object") Object.keys(lv).forEach(function(k){ ids[k]=1; });
      Object.keys(data.vault).forEach(function(k){ ids[k]=1; });
      for(id in ids){
        if(!Object.prototype.hasOwnProperty.call(ids,id)) continue;
        data.vault[id]=better(data.vault[id], lv&&lv[id]);
      }
      if(!have.admin) data.users.unshift({id:"admin", login:"admin", name:"Администратор", password:"f6e718809f4092afc94ad388ee7d808498c19b4dbb7b0f5568a2ca528aaa6ade", role:"admin"});
      return hashList(data.users).then(function(){
        try{
          localStorage.setItem(USERS, JSON.stringify(data.users));
          localStorage.setItem(VAULT, JSON.stringify(data.vault));
        }catch(e){}
        var after="";
        try{ after=(localStorage.getItem(USERS)||"")+"|"+(localStorage.getItem(VAULT)||""); }catch(e){}
        window.__TRAVELEK_STORE_CHANGED=after!==before;
        if(after!==before) return saveStoreNow();
      });
    }).catch(function(){}).then(function(){ window.__TRAVELEK_STORE_READY=true; if(!window.__TRAVELEK_POLL) window.__TRAVELEK_POLL=setInterval(pullRemote, 8000); });
    return storePromise;
  }
  function apply(pack){
    var i,k;
    for(i=0;i<KEYS.length;i++){
      k=KEYS[i];
      if(pack && typeof pack[k]==="string") localStorage.setItem(k, pack[k]);
      else localStorage.removeItem(k);
    }
  }
  function kmOf(text){ var m=String(text||"").replace(/\s/g,"").match(/([\d.]+)км/i); return m?Number(m[1])||0:0; }
  var list=users();
  var sid=localStorage.getItem(SESSION);
  var me=null, i;
  for(i=0;i<list.length;i++) if(list[i].id===sid) me=list[i];
  var viewId=sessionStorage.getItem("travelek-view");
  if(me && (!viewId || viewId===me.id)){
    var snap=vault();
    var localPack={}, ki, kv;
    for(ki=0;ki<KEYS.length;ki++){ kv=localStorage.getItem(KEYS[ki]); if(kv!=null) localPack[KEYS[ki]]=kv; }
    function countPack(pack){
      try{ var a=JSON.parse((pack&&pack["travelek-extra"])||"[]"); return Array.isArray(a)?a.length:0; }catch(e){ return 0; }
    }
    if(countPack(localPack)>countPack(snap[me.id])){ snap[me.id]=localPack; saveVault(snap); }
  }
  window.__localLogin=function(login, password){
    login=String(login||"").trim().toLowerCase().replace(/@travelek\.app$/,"");
    password=String(password||"").replace(/[\u200B-\u200D\uFEFF]/g,"").trim();
    return ensureStore().then(function(){
      var u=users(), jobs=[], n, L;
      for(n=0;n<u.length;n++){
        L=String(u[n].login||u[n].email||"").toLowerCase().replace(/@travelek\.app$/,"");
        if(L===login) jobs.push(u[n]);
      }
      var chain=Promise.resolve(null);
      jobs.forEach(function(candidate){
        chain=chain.then(function(found){
          if(found) return found;
          return passMatch(candidate.password, password).then(function(ok){ return ok?candidate:null; });
        });
      });
      return chain;
    }).then(function(row){
      if(!row) return false;
      localStorage.setItem(SESSION, row.id);
      sessionStorage.removeItem("travelek-view");
      location.reload();
      return true;
    });
  };
  ensureStore().then(function(){
    if(!localStorage.getItem(SESSION) || !window.__TRAVELEK_STORE_CHANGED) return;
    if(sessionStorage.getItem("travelek-store-sync")==="1"){
      sessionStorage.removeItem("travelek-store-sync");
      return;
    }
    sessionStorage.setItem("travelek-store-sync","1");
    location.reload();
  });
  if(!me){
    window.__TRAVELEK_HOLD=true;
    window.__TRAVELEK_SEED=false;
    apply(null);
    return;
  }
  var view=sessionStorage.getItem("travelek-view");
  var packOwner=me.id;
  if(view && me.role==="admin" && view!==me.id){
    packOwner=view;
    window.__TRAVELEK_READONLY=true;
    var who=null;
    for(i=0;i<list.length;i++) if(list[i].id===view) who=list[i];
    window.__TRAVELEK_VIEW_NAME=who?(who.name||who.login):"пользователь";
  }
  var all=vault();
  apply(all[packOwner]||null);
  window.__TRAVELEK_ME={id:me.id, email:me.login, name:me.name, role:me.role};
  window.__TRAVELEK_SEED=false;
  window.__cloudPush=function(data){
    if(window.__TRAVELEK_READONLY) return;
    var vv=vault();
    var prev=vv[me.id];
    function nOf(pack){ try{ var a=JSON.parse((pack&&pack["travelek-extra"])||"[]"); return Array.isArray(a)?a.length:0; }catch(e){ return 0; } }
    if(!window.__TRAVELEK_DIARY_READY && nOf(data)<nOf(prev)) return;
    vv[me.id]=data; saveVault(vv);
    scheduleSave();
  };
  setTimeout(function(){ window.__TRAVELEK_DIARY_READY=true; }, 2500);
  window.__cloudRename=function(name){
    return new Promise(function(resolve, reject){
      name=String(name||"").trim();
      if(!name) return reject(new Error("Введите имя"));
      var u=users(), n;
      for(n=0;n<u.length;n++) if(u[n].id===me.id) u[n].name=name;
      localStorage.setItem(USERS, JSON.stringify(u));
      me.name=name;
      if(window.__TRAVELEK_ME) window.__TRAVELEK_ME.name=name;
      scheduleSave();
      resolve({ok:true, name:name});
    });
  };
  window.__changePassword=function(currentPassword, newPassword){
    return new Promise(function(resolve, reject){
      var u=users(), row=null, n;
      for(n=0;n<u.length;n++) if(u[n].id===me.id) row=u[n];
      if(!row) return reject(new Error("bad"));
      if(String(newPassword||"").length<8) return reject(new Error("short"));
      passMatch(row.password, currentPassword).then(function(ok){
        if(!ok) return reject(new Error("bad"));
        return sha256(newPassword).then(function(h){
          row.password=h;
          localStorage.setItem(USERS, JSON.stringify(u));
          return saveStoreNow().then(resolve);
        });
      }).catch(reject);
    });
  };
  window.__adminSetPassword=function(userId, newPassword){
    return new Promise(function(resolve, reject){
      if(!me || me.role!=="admin") return reject(new Error("Только администратор"));
      if(String(newPassword||"").length<8) return reject(new Error("Пароль короче 8 символов"));
      ensureStore().then(function(){
        var u=users(), row=null, n;
        for(n=0;n<u.length;n++) if(u[n].id===userId) row=u[n];
        if(!row) throw new Error("Аккаунт не найден");
        if(row.id===me.id) throw new Error("Свой пароль меняйте в блоке выше");
        return sha256(newPassword).then(function(h){
          row.password=h;
          localStorage.setItem(USERS, JSON.stringify(u));
          return saveStoreNow();
        });
      }).then(function(){ resolve({ok:true}); }).catch(function(e){
        reject(new Error(e&&e.message?e.message:"Не удалось сменить пароль"));
      });
    });
  };
  window.__cloudCreate=function(login, password, name){
    return new Promise(function(resolve, reject){
      if(me.role!=="admin") return reject(new Error("Только администратор может создавать аккаунты"));
      login=String(login||"").trim().toLowerCase().replace(/@travelek\.app$/,"");
      name=String(name||"").trim();
      if(login.length<2) return reject(new Error("Логин слишком короткий"));
      if(String(password||"").length<8) return reject(new Error("Пароль короче 8 символов"));
      if(!name) return reject(new Error("Нужно имя"));
      ensureStore().then(function(){
        var u=users(), n;
        for(n=0;n<u.length;n++) if(String(u[n].login||"").toLowerCase()===login) throw new Error("Такой логин уже есть");
        return sha256(password).then(function(h){
          u.push({id:"u"+Date.now(), login:login, name:name, password:h, role:"user"});
          localStorage.setItem(USERS, JSON.stringify(u));
          return saveStoreNow();
        });
      }).then(function(){ resolve({ok:true}); }).catch(function(e){
        reject(new Error(e&&e.message?e.message:"Не удалось сохранить аккаунт. Проверьте интернет"));
      });
    });
  };
  window.__cloudAdmin=function(){
    var vv=vault();
    return Promise.resolve(users().map(function(user){
      var pack=vv[user.id]||{};
      var stats=(typeof window.__packStats==="function")?window.__packStats(pack):null;
      var routes=stats?stats.routesList:[];
      if(!stats){
        try{ routes=JSON.parse(pack["travelek-extra"]||"[]"); }catch(e){ routes=[]; }
        if(!Array.isArray(routes)) routes=[];
      }
      var lines=[];
      routes.slice(0,12).forEach(function(r){
        var mode=r.mode==="plane"?"Самолёт":r.mode==="train"?"Поезд":"Авто";
        lines.push(mode+" · "+(r.date||"без даты")+" · "+(r.from||"?")+" → "+(r.to||"?"));
      });
      return {
        userId:user.id,
        email:user.login,
        name:user.name,
        role:user.role,
        routes:stats?stats.routes:routes.length,
        countries:stats?stats.countries:0,
        regions:stats?stats.regions:0,
        kmPlane:stats?stats.kmPlane:0,
        kmTrain:stats?stats.kmTrain:0,
        kmCar:stats?stats.kmCar:0,
        lines:lines
      };
    }));
  };
  window.__openDiary=function(userId){ sessionStorage.setItem("travelek-view", userId); location.reload(); };
  window.__exitView=function(){ sessionStorage.removeItem("travelek-view"); location.reload(); };
  window.__signOut=function(){ localStorage.removeItem(SESSION); sessionStorage.removeItem("travelek-view"); location.reload(); };
})();
(function bindFileLogin(){
  var gate=document.getElementById("file-login");
  if(!gate) return;
  if(window.__TRAVELEK_HOLD) gate.style.display="grid";
  var form=document.getElementById("file-login-form");
  if(!form) return;
  form.onsubmit=function(e){
    e.preventDefault();
    var ret=window.__localLogin && window.__localLogin(document.getElementById("file-login-name").value, document.getElementById("file-login-pass").value);
    var err=document.getElementById("file-login-err");
    if(ret && ret.then){
      if(err) err.textContent="Проверяем…";
      ret.then(function(ok){ if(!ok && err) err.textContent="Неверный логин или пароль"; }).catch(function(){ if(err) err.textContent="Неверный логин или пароль"; });
    } else if(!ret && err) err.textContent="Неверный логин или пароль";
  };
})();
function assembleRoutes(){
  var del=loadDeleted();
  var extra=loadExtra();
  return extra.filter(function(r){ return del.indexOf(r.id)<0; });
}
var deleted = loadDeleted();
var ROUTES = assembleRoutes();

/* place lookup */
function norm(s){ return (s||"").toLowerCase().replace(/\s+/g," ").trim(); }
function place(name, code){
  var i, a, s, c, k, m;
  /* точка с карты: "Точка 55.1234, 37.5678" или "55.12, 37.56" */
  m = String(name||"").match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
  if(m){
    var la=parseFloat(m[1]), ln=parseFloat(m[2]);
    if(!isNaN(la)&&!isNaN(ln)&&la>=-85&&la<=85&&ln>=-180&&ln<=180)
      return {lat:la,lng:ln,label:"Точка "+la.toFixed(4)+", "+ln.toFixed(4),custom:1};
  }
  if(code){
    k = norm(code);
    for(i=0;i<AIRPORTS.length;i++) if(norm(AIRPORTS[i].code)===k)
      return {lat:AIRPORTS[i].lat,lng:AIRPORTS[i].lng,label:AIRPORTS[i].n+" ("+AIRPORTS[i].code+")"};
  }
  k = norm(name);
  if(!k) return null;
  /* exact airport code */
  for(i=0;i<AIRPORTS.length;i++){
    a = AIRPORTS[i];
    if(norm(a.code)===k || norm(a.n)===k || norm(a.n+" ("+a.code+")")===k)
      return {lat:a.lat,lng:a.lng,label:a.n+" ("+a.code+")"};
  }
  /* station exact */
  for(i=0;i<STATIONS.length;i++){
    s = STATIONS[i];
    if(norm(s.n)===k || norm(s.id)===k) return {lat:s.lat,lng:s.lng,label:s.n};
  }
  /* речные/морские порты раньше городов (Ярославль → речной) */
  if(typeof findPortByQuery==="function"){
    var fp=findPortByQuery(k);
    if(fp) return {lat:fp.lat,lng:fp.lng,label:fp.n,portId:fp.id};
  } else if(typeof PORTS!=="undefined"){
    for(i=0;i<PORTS.length;i++){
      if(/фарватер|центр/.test(PORTS[i].n)) continue;
      if(norm(PORTS[i].n)===k || portCityKey(PORTS[i].n)===k)
        return {lat:PORTS[i].lat,lng:PORTS[i].lng,label:PORTS[i].n,portId:PORTS[i].id};
    }
  }
  /* city exact */
  for(i=0;i<CITIES.length;i++){
    c = CITIES[i];
    if(norm(c.n)===k) return {lat:c.lat,lng:c.lng,label:c.n};
  }
  /* partial airport */
  for(i=0;i<AIRPORTS.length;i++){
    a = AIRPORTS[i];
    if(norm(a.code).indexOf(k)===0 || norm(a.n).indexOf(k)>=0)
      return {lat:a.lat,lng:a.lng,label:a.n+" ("+a.code+")"};
  }
  for(i=0;i<STATIONS.length;i++){
    s = STATIONS[i];
    if(norm(s.n).indexOf(k)>=0) return {lat:s.lat,lng:s.lng,label:s.n};
  }
  for(i=0;i<CITIES.length;i++){
    c = CITIES[i];
    if(norm(c.n).indexOf(k)>=0) return {lat:c.lat,lng:c.lng,label:c.n};
  }
  return null;
}


/* индексы для быстрого поиска (не держим весь список в DOM) */
var IDX_AIR = null, IDX_ST = null, IDX_CITY = null;
function buildIdx(){
  if(IDX_AIR) return;
  IDX_AIR = AIRPORTS.map(function(a){
    return {code:a.code, n:a.n, key:norm(a.code+" "+a.n), lat:a.lat, lng:a.lng};
  });
  IDX_ST = STATIONS.map(function(s){
    return {n:s.n, key:norm(s.n+" "+s.id), lat:s.lat, lng:s.lng};
  });
  IDX_CITY = CITIES.map(function(c){
    return {n:c.n, key:norm(c.n), lat:c.lat, lng:c.lng};
  });
}
function searchCatalog(mode, q, fromHint){
  buildIdx();
  q = norm(q);
  var out = [], i, it;
  if(!q || q.length < 1) return out;
  var seenVal={};
  function push(label, value, code){
    if(out.length >= 12) return;
    var k=String(value)+"|"+String(code||"");
    if(seenVal[k]) return;
    seenVal[k]=1;
    out.push({label:label, value:value, code:code});
  }
  function codeFromHint(h){
    if(!h) return null;
    var m=String(h).match(/\(([A-Z0-9]{3})\)/i);
    if(m) return m[1].toUpperCase();
    m=String(h).trim().match(/^([A-Z0-9]{3})$/i);
    if(m) return m[1].toUpperCase();
    return null;
  }
  /* ——— Самолёт: только аэропорты; «Куда» — только куда есть рейс ——— */
  if(mode==="plane"){
    var fromCode=codeFromHint(fromHint);
    for(i=0;i<IDX_AIR.length && out.length<12;i++){
      it=IDX_AIR[i];
      if(fromCode && it.code===fromCode) continue;
      if(fromCode && !flightAllowed(fromCode, it.code)) continue;
      if(norm(it.code).indexOf(q)===0) push(it.n+" ("+it.code+")", it.n+" ("+it.code+")", it.code);
    }
    for(i=0;i<IDX_AIR.length && out.length<12;i++){
      it=IDX_AIR[i];
      if(fromCode && it.code===fromCode) continue;
      if(fromCode && !flightAllowed(fromCode, it.code)) continue;
      if(norm(it.code).indexOf(q)===0) continue;
      if(it.key.indexOf(q)>=0) push(it.n+" ("+it.code+")", it.n+" ("+it.code+")", it.code);
    }
  } else if(mode==="train"){
    /* ——— Поезд: только станции; «Куда» — есть путь по графу ЖД ——— */
    var fromRail=null;
    if(fromHint){
      var pf=place(fromHint);
      if(pf && typeof nearestRail==="function") fromRail=nearestRail(pf);
    }
    for(i=0;i<IDX_ST.length && out.length<12;i++){
      it=IDX_ST[i];
      if(it.key.indexOf(q)<0) continue;
      if(fromRail && typeof railPath==="function"){
        var pr=place(it.n);
        var toRail=pr && nearestRail(pr);
        if(!toRail || toRail===fromRail) continue;
        if(!railPath(fromRail, toRail)) continue;
      }
      push(it.n, it.n);
    }
  } else if(mode==="ship"){
    /* ——— Корабль: только порты; «Куда» — есть путь по воде ——— */
    var seen={}, p, fromPort=null;
    if(fromHint && typeof findPortByQuery==="function") fromPort=findPortByQuery(fromHint);
    function addPort(p){
      if(!isPassengerPort(p)||seen[p.id]||out.length>=12) return;
      if(fromPort && fromPort.id===p.id) return;
      if(fromPort && typeof portPath==="function" && !portPath(fromPort.id, p.id)) return;
      seen[p.id]=1;
      push(formatPortLabel(p), p.n, p.id);
    }
    if(PORT_ALIASES[q] && PORT_BY_ID[PORT_ALIASES[q]]) addPort(PORT_BY_ID[PORT_ALIASES[q]]);
    for(i=0;i<PORTS.length && out.length<12;i++){
      p=PORTS[i];
      if(!isPassengerPort(p)) continue;
      var nk=norm(p.n), ck=portCityKey(p.n);
      if(ck===q || nk===q || norm(formatPortLabel(p))===q) addPort(p);
    }
    for(i=0;i<PORTS.length && out.length<12;i++){
      p=PORTS[i];
      if(!isPassengerPort(p)) continue;
      nk=norm(p.n); ck=portCityKey(p.n);
      if(ck.indexOf(q)===0 || nk.indexOf(q)===0) addPort(p);
    }
    for(i=0;i<PORTS.length && out.length<12;i++){
      p=PORTS[i];
      if(!isPassengerPort(p)) continue;
      if(norm(p.n).indexOf(q)>=0 || portCityKey(p.n).indexOf(q)>=0) addPort(p);
    }
  } else {
    /* авто / пешком / вело — города без жёсткого графа */
    for(i=0;i<IDX_CITY.length && out.length<12;i++){
      it=IDX_CITY[i];
      if(it.key.indexOf(q)>=0) push(it.n, it.n);
    }
  }
  return out;
}


/* geometry */
function hav(a,b){
  var R=6371,t=Math.PI/180,dLat=(b.lat-a.lat)*t,dLng=(b.lng-a.lng)*t;
  var x=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(a.lat*t)*Math.cos(b.lat*t)*Math.sin(dLng/2)*Math.sin(dLng/2);
  return 2*R*Math.asin(Math.min(1,Math.sqrt(x)));
}
function flightArc(a,b,n){
  n=n||72;
  var dlat=b.lat-a.lat, dlng=b.lng-a.lng;
  if(dlng>180) dlng-=360;
  if(dlng<-180) dlng+=360;
  var dist=Math.hypot(dlat, dlng);
  if(dist<0.35) return [[a.lat,a.lng],[b.lat,b.lng]];
  var len=dist||1, px=-dlat/len, py=dlng/len;
  if(py<0){ px=-px; py=-py; }
  var bulge=Math.min(24, Math.max(1.8, dist*0.28));
  var out=[], i, t, s;
  for(i=0;i<=n;i++){
    t=i/n; s=Math.sin(Math.PI*t);
    out.push([a.lat+dlat*t+px*bulge*s, a.lng+dlng*t+py*bulge*s]);
  }
  return out;
}
function densify(coords, stepKm){
  if(!coords||coords.length<2) return coords;
  var out=[coords[0]],i,j,a,b,d,n,f;
  for(i=1;i<coords.length;i++){
    a={lat:coords[i-1][0],lng:coords[i-1][1]}; b={lat:coords[i][0],lng:coords[i][1]};
    d=hav(a,b); n=Math.max(1,Math.round(d/stepKm));
    for(j=1;j<=n;j++){ f=j/n; out.push([a.lat+(b.lat-a.lat)*f, a.lng+(b.lng-a.lng)*f]); }
  }
  return out;
}

/* rail graph */
var RAIL_NODES = {};
STATIONS.forEach(function(s){ RAIL_NODES[s.id]=[s.lat,s.lng]; });
/* intermediate rail points */
[["klin",56.333,36.730],["bologoe",57.880,34.092],["okulovka",58.381,33.301],["chudovo",59.125,31.659],["malaya_vish",59.541,30.878],["vyshny",57.585,34.563],["podolsk",55.431,37.545],["serpukhov",54.916,37.411],["orekhovo",55.807,38.967],["kovrov",56.357,41.319],["dzerzhinsk",56.238,43.460]].forEach(function(x){ RAIL_NODES[x[0]]=[x[1],x[2]]; });

var RAIL_EDGES = [
  ["msk_len","tver"],
  ["tver","spb_mos"],
  ["msk_kaz","vladimir"],
  ["vladimir","nn"],
  ["nn","cheboksary"],
  ["cheboksary","kazan"],
  ["kazan","izhevsk"],
  ["izhevsk","perm"],
  ["perm","ekb"],
  ["ekb","tyumen"],
  ["tyumen","omsk"],
  ["omsk","nsk"],
  ["nsk","kras"],
  ["kras","irk"],
  ["irk","ulanude"],
  ["ulanude","chita"],
  ["chita","khabarovsk"],
  ["khabarovsk","vl"],
  ["nsk","barnaul"],
  ["nsk","tomsk"],
  ["nsk","kemerovo"],
  ["kemerovo","novokuz"],
  ["kras","abakan"],
  ["khabarovsk","komsomolsk"],
  ["khabarovsk","blagov"],
  ["msk_kur","tula"],
  ["tula","orel"],
  ["orel","kursk"],
  ["kursk","belgorod"],
  ["msk_pav","ryazan"],
  ["ryazan","voronezh"],
  ["voronezh","rostov"],
  ["rostov","krasnodar"],
  ["krasnodar","sochi"],
  ["sochi","adler"],
  ["rostov","mineral"],
  ["mineral","stavropol"],
  ["msk_pav","tambov"],
  ["tambov","saratov"],
  ["saratov","volgograd"],
  ["volgograd","astrakhan"],
  ["msk_bel","smolensk"],
  ["smolensk","minsk"],
  ["minsk","brest"],
  ["msk_bel","bryansk"],
  ["bryansk","gomel"],
  ["msk_kie","kaluga"],
  ["msk_yar","yar"],
  ["yar","vologda"],
  ["vologda","cherepovets"],
  ["spb_mos","petrozavodsk"],
  ["petrozavodsk","murmansk"],
  ["yar","kostroma"],
  ["kostroma","ivanovo"],
  ["vologda","arkhangelsk"],
  ["msk_kaz","ryazan"],
  ["msk_kaz","penza"],
  ["penza","samara"],
  ["samara","syzran"],
  ["syzran","samara"],
  ["samara","ufa"],
  ["ufa","chelyabinsk"],
  ["chelyabinsk","kurgan"],
  ["kurgan","tyumen"],
  ["samara","saratov"],
  ["msk_east","vladimir"],
  ["msk_east","nn"],
  ["tula","msk_east"],
  ["mil_c","mil_l"],
  ["mil_c","bergamo"],
  ["mil_l","bergamo"],
  ["mil_c","brescia"],
  ["brescia","verona"],
  ["verona","vicenza"],
  ["vicenza","padova"],
  ["padova","mestre"],
  ["mestre","venice"],
  ["padova","bologna"],
  ["bologna","florence"],
  ["florence","arezzo"],
  ["arezzo","orvieto"],
  ["orvieto","rome"],
  ["rome","latina"],
  ["latina","formia"],
  ["formia","naples"],
  ["mil_c","turin"],
  ["mil_c","genoa"],
  ["genoa","pisa"],
  ["pisa","florence"],
  ["bologna","verona"],
  ["beijing","beijing_s"],
  ["beijing_s","tianjin"],
  ["beijing_s","shanghai"],
  ["beijing_s","zhengzhou"],
  ["zhengzhou","wuhan"],
  ["wuhan","changsha"],
  ["changsha","guangzhou"],
  ["guangzhou","shenzhen"],
  ["shanghai","hangzhou"],
  ["shanghai","nanjing"],
  ["nanjing","wuhan"],
  ["beijing","xian"],
  ["xian","chengdu"],
  ["shanghai","shanghai_h"],
  ["msk_len","klin"],
  ["klin","tver"],
  ["tver","vyshny"],
  ["vyshny","bologoe"],
  ["bologoe","okulovka"],
  ["okulovka","chudovo"],
  ["chudovo","malaya_vish"],
  ["malaya_vish","spb_mos"],
  ["msk_kur","podolsk"],
  ["podolsk","serpukhov"],
  ["serpukhov","tula"],
  ["msk_kaz","orekhovo"],
  ["orekhovo","vladimir"],
  ["vladimir","kovrov"],
  ["kovrov","dzerzhinsk"],
  ["dzerzhinsk","nn"],
  ["minsk","orsha"],
  ["orsha","vitebsk"],
  ["minsk","gomel"],
  ["minsk","baranovichi"],
  ["baranovichi","brest"],
  ["minsk","grodno"],
  ["minsk","mogilev"],
  ["smolensk","orsha"],
  ["astana","karaganda"],
  ["karaganda","almaty"],
  ["astana","shymkent"],
  ["tashkent","samarkand"],
  ["spb_mos","volhovstroy"],
  ["volhovstroy","luga"],
  ["luga","dno"],
  ["dno","novosokolniki"],
  ["novosokolniki","velikie_luki"],
  ["minsk","molodechno"],
  ["minsk","zhlobin"],
  ["zhlobin","gomel"],
  ["ekb","pyshma"],
  ["pyshma","tyumen"],
  ["tyumen","yalutorovsk"],
  ["yalutorovsk","ishim"],
  ["ishim","nazyvaevsk"],
  ["nazyvaevsk","omsk"],
  ["omsk","kalachinsk"],
  ["kalachinsk","tatarsk"],
  ["tatarsk","barabinsk"],
  ["barabinsk","chulym"],
  ["chulym","nsk"],
  ["nsk","bolotnoe"],
  ["bolotnoe","yurga"],
  ["yurga","taiga"],
  ["taiga","anzhero"],
  ["anzhero","mariinsk"],
  ["mariinsk","bogotol"],
  ["bogotol","achinsk"],
  ["achinsk","kras"],
  ["kras","kansk"],
  ["kansk","taishet"],
  ["taishet","nizhneudinsk"],
  ["nizhneudinsk","tulun"],
  ["tulun","zima"],
  ["zima","cheremkhovo"],
  ["cheremkhovo","irk"],
  ["irk","slyudyanka"],
  ["slyudyanka","ulanude"],
  ["ulanude","petrovsk"],
  ["petrovsk","khilok"],
  ["khilok","chita"],
  ["chita","mogocha"],
  ["mogocha","skovorodino"],
  ["skovorodino","belogorsk"],
  ["belogorsk","birobidzhan"],
  ["birobidzhan","khabarovsk"],
  ["khabarovsk","ussuriysk"],
  ["ussuriysk","vl"],
];
var RAIL_ADJ={};
RAIL_EDGES.forEach(function(e){
  (RAIL_ADJ[e[0]]=RAIL_ADJ[e[0]]||[]).push(e[1]);
  (RAIL_ADJ[e[1]]=RAIL_ADJ[e[1]]||[]).push(e[0]);
});

var NO_ROAD = {
  "Норильск":1,"Дудинка":1,"Хатанга":1,"Игарка":1,"Тикси":1,"Певек":1,
  "Анадырь":1,"Билибино":1,"Провидения":1,"Эвено-Бытантай":1,
  "Мирный":1,"Удачный":1,"Полярный":1,"Сретенск":1
};
function carAllowed(nameA, nameB){
  var a=(nameA||"").split(",")[0].trim();
  var b=(nameB||"").split(",")[0].trim();
  // strip extra
  function base(n){
    n=n.replace(/\s*\([^)]*\)/g,"").trim();
    return n;
  }
  a=base(a); b=base(b);
  if(NO_ROAD[a]||NO_ROAD[b]) return false;
  return true;
}
function trainAllowed(from, to){
  var a=place(from), b=place(to);
  if(!a||!b) return false;
  var path=railPath(nearestRail(a), nearestRail(b));
  return !!(path && path.length>=2);
}



function nearestRail(pt){
  var best=null,bd=1e9,k,xy,d;
  for(k in RAIL_NODES){
    xy=RAIL_NODES[k]; d=hav(pt,{lat:xy[0],lng:xy[1]});
    if(d<bd){bd=d;best=k;}
  }
  return best;
}
function railPath(fk,tk){
  if(!fk||!tk) return null;
  if(fk===tk) return [fk];
  var q=[fk],prev={},seen={}; prev[fk]=null; seen[fk]=1;
  while(q.length){
    var u=q.shift(), neigh=RAIL_ADJ[u]||[],i,v;
    for(i=0;i<neigh.length;i++){
      v=neigh[i]; if(seen[v]) continue;
      seen[v]=1; prev[v]=u; q.push(v);
      if(v===tk){
        var path=[tk];
        while(path[path.length-1]!==fk) path.push(prev[path[path.length-1]]);
        path.reverse(); return path;
      }
    }
  }
  return null;
}
function trainCoords(from,to){
  var a=place(from), b=place(to);
  if(!a||!b) return null;
  var keys=railPath(nearestRail(a), nearestRail(b));
  if(keys&&keys.length>=2){
    var raw=keys.map(function(k){return [RAIL_NODES[k][0],RAIL_NODES[k][1]];});
    raw[0]=[a.lat,a.lng]; raw[raw.length-1]=[b.lat,b.lng];
    return densify(raw,12);
  }
  return densify([[a.lat,a.lng],[b.lat,b.lng]],20);
}

/* OSRM real roads for cars */
var roadCache={};
function roadKey(a,b){ return a.lat.toFixed(4)+","+a.lng.toFixed(4)+";"+b.lat.toFixed(4)+","+b.lng.toFixed(4); }
function fetchRoad(a,b,cb){
  var key=roadKey(a,b);
  if(roadCache[key]){ cb(roadCache[key]); return; }
  var url="https://router.project-osrm.org/route/v1/driving/"+
    a.lng+","+a.lat+";"+b.lng+","+b.lat+"?overview=full&geometries=geojson";
  fetch(url).then(function(r){return r.json();}).then(function(data){
    if(data&&data.routes&&data.routes[0]){
      var coords=data.routes[0].geometry.coordinates.map(function(c){return [c[1],c[0]];});
      roadCache[key]=coords; cb(coords);
    } else cb(null);
  }).catch(function(){ cb(null); });
}


/* ——— Сейчас в пути ——— */
function estimateTripHours(r, km){
  km=km||0;
  var sp=60;
  if(r.mode==="plane") sp=750;
  else if(r.mode==="train") sp=90;
  else if(r.mode==="car") sp=70;
  else if(r.mode==="ship") sp=25;
  else if(r.mode==="walk") sp=5;
  else if(r.mode==="bike") sp=15;
  return Math.max(0.5, km/sp);
}
function tripWindow(r){
  if(!r.date) return null;
  var t0=r.time||"00:00";
  if(t0.length===5) t0+=":00";
  var start=new Date(r.date+"T"+t0);
  if(isNaN(start.getTime())) return null;
  var end;
  if(r.arrDate||r.arrTime){
    var t1=r.arrTime||r.time||"23:59";
    if(t1.length===5) t1+=":00";
    end=new Date((r.arrDate||r.date)+"T"+t1);
  } else {
    var g=typeof buildGeoSync==="function"?buildGeoSync(r):null;
    var h=estimateTripHours(r, g?g.km:0);
    end=new Date(start.getTime()+h*3600000);
  }
  if(isNaN(end.getTime())) end=new Date(start.getTime()+4*3600000);
  return {start:start,end:end};
}
function isInProgress(r){
  var w=tripWindow(r); if(!w) return false;
  var now=new Date();
  return now>=w.start && now<=w.end;
}
function tripProgress(r){
  var w=tripWindow(r); if(!w) return 0;
  var now=Date.now();
  var p=(now-w.start.getTime())/(w.end.getTime()-w.start.getTime());
  return Math.max(0, Math.min(1, p));
}
function pointAlong(coords, t){
  if(!coords||coords.length<2) return null;
  t=Math.max(0,Math.min(1,t));
  var total=0, seg=[], i;
  for(i=1;i<coords.length;i++){
    var d=hav({lat:coords[i-1][0],lng:coords[i-1][1]},{lat:coords[i][0],lng:coords[i][1]});
    seg.push(d); total+=d;
  }
  if(total<=0) return coords[0];
  var need=total*t, acc=0;
  for(i=0;i<seg.length;i++){
    if(acc+seg[i]>=need){
      var f=(need-acc)/seg[i];
      return [
        coords[i][0]+(coords[i+1][0]-coords[i][0])*f,
        coords[i][1]+(coords[i+1][1]-coords[i][1])*f
      ];
    }
    acc+=seg[i];
  }
  return coords[coords.length-1];
}
var liveMarker=null;

var yearFilter="all"; /* all | 2026 | ... */
var liveMarkers=[];
var animMarkers={}; /* id -> marker for animated past trips when selected */
var notifAsked=false;

function updateLiveTrip(){
  var box=document.getElementById("live-trip");
  if(!box) return;
  var live=ROUTES.filter(isInProgress);
  liveMarkers.forEach(function(m){ try{ map.removeLayer(m); }catch(e){} });
  liveMarkers=[];
  if(liveMarker){ try{ map.removeLayer(liveMarker); }catch(e){} liveMarker=null; }
  if(!live.length){
    box.classList.remove("on"); box.innerHTML="";
    return;
  }
  var icons={plane:"✈️",train:"🚂",car:"🚗",walk:"🚶",bike:"🚴",ship:"🚢"};
  var htmlL='<div class="lt-title">Сейчас в пути · '+live.length+'</div><div class="lt-list">';
  live.forEach(function(r, idx){
    var g=buildGeoSync(r);
    var p=tripProgress(r);
    var pct=Math.round(p*100);
    var fromL=typeof shortPlaceLabel==="function"?shortPlaceLabel(r.from, g&&g.a&&g.a.lat, g&&g.a&&g.a.lng):r.from;
    var toL=typeof shortPlaceLabel==="function"?shortPlaceLabel(r.to, g&&g.b&&g.b.lat, g&&g.b&&g.b.lng):r.to;
    htmlL+='<div class="lt-item">'+(icons[r.mode]||"")+" "+fromL+" → "+toL+
      '<div class="lt-meta">'+pct+"%"+(g?" · ~"+Math.round(g.km*(1-p))+" км":"")+"</div>"+
      '<div class="lt-bar"><i style="width:'+pct+'%"></i></div></div>';
    if(g&&g.coords&&map){
      var pt=pointAlong(g.coords, p);
      if(pt){
        var mk=L.circleMarker(pt,{radius:idx===0?8:6,color:"#fff",weight:2,fillColor:idx===0?"#6af":"#9cf",fillOpacity:1});
        mk.addTo(map);
        liveMarkers.push(mk);
      }
    }
  });
  htmlL+="</div>";
  box.innerHTML=htmlL;
  box.classList.add("on");
}

/* Анимация выбранного / текущего рейса по времени */
function animateRouteOnMap(r){
  if(!r||!map) return;
  var g=buildGeoSync(r); if(!g||!g.coords||g.coords.length<2) return;
  var id=r.id;
  if(animMarkers[id]){ try{ map.removeLayer(animMarkers[id]); }catch(e){} }
  var t=isInProgress(r)?tripProgress(r):(isFuture(r)?0:1);
  var pt=pointAlong(g.coords, t);
  if(!pt) return;
  var col=r.mode==="plane"?"#5b9fff":(r.mode==="train"?"#3dd68c":(r.mode==="car"?"#f5a623":"#8af"));
  animMarkers[id]=L.circleMarker(pt,{radius:7,color:"#fff",weight:2,fillColor:col,fillOpacity:1}).addTo(map);
}
function clearAnimMarkers(){
  Object.keys(animMarkers).forEach(function(id){
    try{ map.removeLayer(animMarkers[id]); }catch(e){}
  });
  animMarkers={};
}

/* Напоминание за час (Notification API) */
function checkTripReminders(){
  if(!("Notification" in window)) return;
  if(Notification.permission==="denied") return;
  if(Notification.permission==="default" && !notifAsked){
    notifAsked=true;
    try{ Notification.requestPermission(); }catch(e){}
    return;
  }
  if(Notification.permission!=="granted") return;
  var now=Date.now();
  ROUTES.forEach(function(r){
    if(!r.date) return;
    var w=tripWindow(r); if(!w) return;
    var ms=w.start.getTime()-now;
    if(ms>50*60*1000 && ms<70*60*1000){
      var key="notif-"+r.id+"-"+r.date;
      try{ if(localStorage.getItem(key)) return; localStorage.setItem(key,"1"); }catch(e){}
      var from=r.from||"", to=r.to||"";
      try{
        new Notification("Скоро выезд",{
          body:(r.mode||"")+": "+from+" → "+to+(r.time?" в "+r.time:""),
          tag:key
        });
      }catch(e){}
    }
  });
}

/* Фильтр по году */
function routeYear(r){
  return (r.date||"").slice(0,4);
}
function buildYearFilter(){
  var el=document.getElementById("year-filter");
  if(!el) return;
  var years={}, i;
  ROUTES.forEach(function(r){ var y=routeYear(r); if(y) years[y]=1; });
  var list=Object.keys(years).sort().reverse();
  var h='<button type="button" data-y="all" class="'+(yearFilter==="all"?"on":"")+'">Все годы</button>';
  list.forEach(function(y){
    h+='<button type="button" data-y="'+y+'" class="'+(yearFilter===y?"on":"")+'">'+y+"</button>";
  });
  el.innerHTML=h;
  var btns=el.querySelectorAll("button");
  for(i=0;i<btns.length;i++){
    btns[i].onclick=(function(b){ return function(){
      yearFilter=b.getAttribute("data-y");
      buildYearFilter();
      render();
    };})(btns[i]);
  }
}


/* Кластеры точек на малом зуме */
function drawEndpointClusters(list){
  if(!map||!layer) return;
  var z=map.getZoom();
  if(z>=6) return; /* на крупном зуме обычные маркеры из render */
  var cell=z<=3?8:z<=4?4:2; /* градусы */
  var buckets={}, key, i, r, g, pts;
  list.forEach(function(r){
    g=buildGeoSync(r); if(!g||!g.a) return;
    pts=[[g.a.lat,g.a.lng],[g.b.lat,g.b.lng]];
    pts.forEach(function(p){
      key=Math.round(p[0]/cell)*cell+","+Math.round(p[1]/cell)*cell;
      if(!buckets[key]) buckets[key]={n:0,lat:0,lng:0};
      buckets[key].n++;
      buckets[key].lat+=p[0];
      buckets[key].lng+=p[1];
    });
  });
  Object.keys(buckets).forEach(function(k){
    var b=buckets[k];
    if(b.n<2) return;
    var la=b.lat/b.n, ln=b.lng/b.n;
    var icon=L.divIcon({
      className:"",
      html:'<div class="marker-cluster">'+b.n+"</div>",
      iconSize:[32,32], iconAnchor:[16,16]
    });
    L.marker([la,ln],{icon:icon,interactive:false}).addTo(layer);
  });
}

setInterval(updateLiveTrip, 20000);
setInterval(checkTripReminders, 60000);


/* ——— Офлайн: кэш тайлов + SW ——— */
function updateOfflinePill(){
  var pill=document.getElementById("offline-pill");
  if(!pill) return;
  if(navigator.onLine===false) pill.classList.add("on");
  else pill.classList.remove("on");
}
window.addEventListener("online", updateOfflinePill);
window.addEventListener("offline", updateOfflinePill);
updateOfflinePill();

function installTileCache(){
  if(!("caches" in window)) return;
  /* кэш тайлов — caches API + SW */
}

(function(){
  function cacheTileUrl(url){
    if(!window.caches||!url||!(/arcgisonline|yandex\.net/i.test(url))) return;
    caches.open("travelek-tiles-v1").then(function(c){
      c.match(url).then(function(hit){
        if(hit) return;
        fetch(url,{mode:"cors",credentials:"omit"}).then(function(r){
          if(r&&r.ok) c.put(url,r.clone());
        }).catch(function(){});
      });
    });
  }
  function bindTiles(){
    if(typeof map==="undefined" || !map || !map.on){ setTimeout(bindTiles, 40); return; }
    if(map.__tilesBound) return;
    map.__tilesBound=1;
    map.on("tileload", function(e){
      try{ if(e.tile && e.tile.src) cacheTileUrl(e.tile.src); }catch(err){}
    });
  }
  bindTiles();
})();

function registerOfflineSW(){
  if(!("serviceWorker" in navigator)) return;
  var swCode = [
    "var CACHE='travelek-tiles-v1';",
    "self.addEventListener('install',function(e){ self.skipWaiting(); });",
    "self.addEventListener('activate',function(e){ e.waitUntil(self.clients.claim()); });",
    "self.addEventListener('fetch',function(e){",
    "  var u=e.request.url;",
    "  if(/arcgisonline\\.com/i.test(u) || /yandex\\.net/i.test(u) || /tile/i.test(u) && /\\/\\d+\\/\\d+\\/\\d+/.test(u)){",
    "    e.respondWith(caches.open(CACHE).then(function(c){",
    "      return c.match(e.request).then(function(hit){",
    "        if(hit) return hit;",
    "        return fetch(e.request).then(function(res){",
    "          if(res && res.ok) c.put(e.request, res.clone());",
    "          return res;",
    "        }).catch(function(){ return hit || Response.error(); });",
    "      });",
    "    }));",
    "  }",
    "});"
  ].join("\\n");
  try{
    var blob=new Blob([swCode.replace(/\\\\n/g,"\\n")],{type:"text/javascript"});
    var url=URL.createObjectURL(blob);
    navigator.serviceWorker.register(url).catch(function(){
      /* blob SW может не работать без HTTPS/same-origin — ок */
    });
  }catch(e){}
}
/* Кэш тайлов на лету через плагин Leaflet (перехват img) */


function isFuture(r){
  var end=r.arrDate||r.date, t=r.arrTime||r.time||"23:59";
  if(!end) return false;
  return new Date(end+"T"+t) > new Date();
}

function pathKm(coords){
  var km=0,i;
  for(i=1;i<coords.length;i++)
    km+=hav({lat:coords[i-1][0],lng:coords[i-1][1]},{lat:coords[i][0],lng:coords[i][1]});
  return km;
}

function buildGeoSync(r){
  /* GPS-трек: готовые координаты */
  if(r.coords && r.coords.length>=2){
    var km=pathKm(r.coords);
    var a={lat:r.coords[0][0],lng:r.coords[0][1],label:r.from||"Старт"};
    var b={lat:r.coords[r.coords.length-1][0],lng:r.coords[r.coords.length-1][1],label:r.to||"Финиш"};
    return {coords:r.coords, km:km, a:a, b:b, needRoad:false};
  }
  var a=place(r.from,r.fromCode), b=place(r.to,r.toCode);
  if(!a||!b) return null;
  var coords;
  if(r.mode==="plane"){
    coords=flightArc(a,b,80);
    return {coords:coords, km:hav(a,b), a:a, b:b};
  }
  if(r.mode==="ship"){
    if(r.waypoints && r.waypoints.length){
      var pts=[[a.lat,a.lng]];
      for(var wi=0;wi<r.waypoints.length;wi++) pts.push([r.waypoints[wi].lat,r.waypoints[wi].lng]);
      pts.push([b.lat,b.lng]);
      coords=densify(pts, 6);
    } else {
      coords=shipCoords(a,b);
    }
    return {coords:coords, km:pathKm(coords), a:a, b:b, needRoad:false};
  }
  if(r.mode==="train"){
    coords=trainCoords(r.from,r.to)||[[a.lat,a.lng],[b.lat,b.lng]];
    return {coords:coords, km:pathKm(coords), a:a, b:b};
  }
  /* car: roads via OSRM or offroad via waypoints */
  if(r.carPath==="offroad" || (r.waypoints && r.waypoints.length)){
    var pts=[[a.lat,a.lng]];
    var wps=r.waypoints||[];
    for(var wi=0;wi<wps.length;wi++) pts.push([wps[wi].lat,wps[wi].lng]);
    pts.push([b.lat,b.lng]);
    coords=densify(pts, 8);
    return {coords:coords, km:pathKm(coords), a:a, b:b, needRoad:false};
  }
  var key=roadKey(a,b);
  if(roadCache[key]) coords=roadCache[key];
  else coords=densify([[a.lat,a.lng],[b.lat,b.lng]],15);
  return {coords:coords, km:pathKm(coords), a:a, b:b, needRoad:!roadCache[key]};
}

var COLORS={plane:"#101820",train:"#101c16",car:"#241c12",walk:"#1a2418",bike:"#241816",ship:"#101c22",future:"#1c1830"};
var ICONS={plane:"✈️",train:"🚂",car:"🚗",walk:"🚶",bike:"🚴",ship:"🚢"};
/* подписи на карте — крупные города, не все 150+ */
var CITY_LABELS = [
  {name:"Москва",lat:55.76,lng:37.62},{name:"Санкт-Петербург",lat:59.93,lng:30.34},
  {name:"Казань",lat:55.80,lng:49.11},{name:"Екатеринбург",lat:56.84,lng:60.61},
  {name:"Новосибирск",lat:55.01,lng:82.94},{name:"Владивосток",lat:43.12,lng:131.89},
  {name:"Сочи",lat:43.60,lng:39.73},{name:"Калининград",lat:54.71,lng:20.45},
  {name:"Минск",lat:53.90,lng:27.56},{name:"Ереван",lat:40.18,lng:44.51},
  {name:"Дубай",lat:25.20,lng:55.27},{name:"Абу-Даби",lat:24.45,lng:54.38},
  {name:"Милан",lat:45.46,lng:9.19},{name:"Рим",lat:41.90,lng:12.50},
  {name:"Неаполь",lat:40.85,lng:14.27},{name:"Венеция",lat:45.44,lng:12.32},
  {name:"Флоренция",lat:43.77,lng:11.26},{name:"Пекин",lat:39.90,lng:116.41},
  {name:"Шанхай",lat:31.23,lng:121.47},{name:"Бангкок",lat:13.76,lng:100.50},
  {name:"Пхукет",lat:7.88,lng:98.39},{name:"Стамбул",lat:41.01,lng:28.98}
];

/* map */
var map=L.map("map",{
  zoomControl:false,
  attributionControl:false,
  minZoom:2,
  maxZoom:16,
  maxBounds:[[-85,-180],[85,180]],
  maxBoundsViscosity:0.8,
  bounceAtZoomLimits:true,
  doubleClickZoom:true,
  scrollWheelZoom:true,
  touchZoom:true,
  tap:true
}).setView([45,20],4);
try{ window.__travelekMap=map; }catch(e){}
var baseLayer=null, worldLayer=null;
function mapPalette(){
  var theme=document.documentElement.getAttribute("data-theme")||"dark";
  if(theme==="light") return {land:"#f7f9fc", edge:"#d5dee8", ru:"#eef3f8"};
  return {land:"#1a2c3d", edge:"#24384c", ru:"#203448"};
}
function smoothRing(ring){
  if(!ring||ring.length<4) return ring;
  var i;
  for(i=1;i<ring.length;i++){
    if(Math.abs(ring[i][0]-ring[i-1][0])>40) return ring;
  }
  var pts=ring.slice();
  var closed=Math.abs(pts[0][0]-pts[pts.length-1][0])<1e-5 && Math.abs(pts[0][1]-pts[pts.length-1][1])<1e-5;
  if(closed) pts.pop();
  if(pts.length<3) return ring;
  var pass, next, a, b, n=pts.length;
  for(pass=0; pass<2; pass++){
    next=[];
    for(i=0;i<n;i++){
      a=pts[i]; b=pts[(i+1)%n];
      next.push([a[0]*0.75+b[0]*0.25, a[1]*0.75+b[1]*0.25]);
      next.push([a[0]*0.25+b[0]*0.75, a[1]*0.25+b[1]*0.75]);
    }
    pts=next; n=pts.length;
  }
  pts.push([pts[0][0], pts[0][1]]);
  return pts;
}
function paintOn(group, poly, style, keepRaw){
  if(!poly||!poly[0]) return;
  /* Preserve exact shared boundaries for Russian regions. */
  var ring=keepRaw ? poly[0] : smoothRing(poly[0]);
  var latlngs=[ring.map(function(pt){ return [pt[1], pt[0]]; })];
  L.polygon(latlngs, style).addTo(group);
}
function drawWorld(){
  if(typeof map==="undefined" || !map || typeof L==="undefined") return;
  if(!worldLayer) worldLayer=L.layerGroup().addTo(map);
  worldLayer.clearLayers();
  if(typeof COUNTRY_LIST==="undefined" || !COUNTRY_LIST) return;
  var pal=mapPalette();
  var style={color:pal.edge, weight:0.4, opacity:.45, lineJoin:"round", lineCap:"round", fillColor:pal.land, fillOpacity:1, interactive:false, smoothFactor:0};
  var ruStyle={color:pal.ru, weight:0.8, opacity:1, lineJoin:"round", lineCap:"round", fillColor:pal.ru, fillOpacity:1, interactive:false, smoothFactor:0};
  COUNTRY_LIST.forEach(function(c){
    if(c.i==="RU") return;
    if(typeof polysOf!=="function") return;
    polysOf(c).forEach(function(poly){ paintOn(worldLayer, poly, style); });
  });
  /* Draw Russia's full country silhouette underneath the federal subjects.
     This masks tiny cracks caused by imperfect/mismatched regional boundaries. */
  var ruBaseStyle={color:pal.ru, weight:0, opacity:0, fillColor:pal.ru, fillOpacity:1, interactive:false, smoothFactor:0};
  var ruCountry=COUNTRY_LIST.find(function(c){ return c.i==="RU"; });
  if(ruCountry && typeof polysOf==="function"){
    polysOf(ruCountry).forEach(function(poly){ paintOn(worldLayer, poly, ruBaseStyle, true); });
  }
  var regs=(typeof RUSSIA_REGIONS!=="undefined" && RUSSIA_REGIONS) ? RUSSIA_REGIONS : [];
  regs.forEach(function(reg){
    polysOf(reg).forEach(function(poly){ paintOn(worldLayer, poly, ruStyle, true); });
  });
  try{ worldLayer.bringToBack(); }catch(e){}
  if(typeof countryLayer!=="undefined" && countryLayer) try{ countryLayer.bringToFront(); }catch(e){}
  if(typeof layer!=="undefined" && layer) try{ layer.bringToFront(); }catch(e){}
}
function makeBase(){
  drawWorld();
  return L.layerGroup();
}

/* ——— Ночь на карте (терминатор Солнца) ——— */
var nightLayer=null, nightOn=true, globeOn=false;
function loadMapPrefs(){
  try{
    var p=JSON.parse(localStorage.getItem("travelek-mapprefs")||"{}");
    if(typeof p.night==="boolean") nightOn=p.night;
    if(typeof p.globe==="boolean") globeOn=p.globe;
  }catch(e){}
}
function saveMapPrefs(){
  try{localStorage.setItem("travelek-mapprefs",JSON.stringify({night:nightOn,globe:globeOn}));}catch(e){}
  scheduleCloudSave();
}
function sunDeclination(date){
  var start=Date.UTC(date.getUTCFullYear(),0,0);
  var day=(date.getTime()-start)/86400000;
  return 23.44*Math.sin((2*Math.PI/365)*(day-81));
}
function buildNightLatLngs(date){
  /* полигон тёмной стороны Земли */
  var dec=sunDeclination(date)*Math.PI/180;
  var hour=date.getUTCHours()+date.getUTCMinutes()/60+date.getUTCSeconds()/3600;
  var subsolarLng=15*(12-hour); /* ° */
  var pts=[], lng, lat, tau, x, phi1, maxLat;
  for(lng=-180;lng<=180;lng+=3){
    tau=(lng-subsolarLng)*Math.PI/180;
    x=-Math.cos(tau)/Math.tan(dec+1e-9);
    if(x>1) lat=90; else if(x<-1) lat=-90;
    else lat=Math.asin(Math.max(-1,Math.min(1,x)))*180/Math.PI;
    /* севернее терминатора ночь зимой в С.полушарии зависит от знака dec */
    pts.push([lat, lng]);
  }
  /* замкнуть ночную сторону: от юга или севера */
  if(dec>=0){
    /* лето С: ночь на юге от терминатора */
    for(lng=180;lng>=-180;lng-=3) pts.push([-85,lng]);
  } else {
    for(lng=180;lng>=-180;lng-=3) pts.push([85,lng]);
  }
  return pts;
}

function applyGlobeEffect(){
  var el=document.getElementById("map");
  if(el) el.classList.remove("globe-mode");
  document.body.classList.toggle("globe-on", !!globeOn);
  if(!globeOn) return;
  ensureGlobe(function(){ drawGlobe(); });
}

var globeCv=null, globeRot={lng:40, lat:26}, globeScale=1, globeLand=null, globeSpin=0, globePtr=null;
function loadScriptOnce(src){
  if(window.d3 && d3.geoOrthographic && String(src).indexOf("d3-")>=0) return Promise.resolve();
  return new Promise(function(resolve, reject){
    var found=document.querySelector('script[data-src="'+src+'"]');
    if(found){
      if(found.getAttribute("data-ready")==="1") resolve();
      else found.addEventListener("load", function(){ resolve(); }, {once:true});
      return;
    }
    var s=document.createElement("script");
    s.src=src; s.async=false; s.setAttribute("data-src", src);
    s.onload=function(){ s.setAttribute("data-ready","1"); resolve(); };
    s.onerror=function(){ reject(new Error(src)); };
    document.body.appendChild(s);
  });
}
function ensureGlobe(done){
  if(!globeCv){
    globeCv=document.createElement("canvas");
    globeCv.id="globe";
    globeCv.style.width="100vw";
    globeCv.style.height="100dvh";
    document.body.appendChild(globeCv);
    var hint=document.createElement("div");
    hint.id="globe-hint";
    hint.textContent="Тяните шар · +/− ближе";
    document.body.appendChild(hint);
    bindGlobePointer();
    window.addEventListener("resize", function(){ if(globeOn) drawGlobe(); });
  }
  if(window.d3 && d3.geoOrthographic && d3.geoPath){ done(); return; }
  loadScriptOnce("/vendor/d3-array.min.js").then(function(){
    return loadScriptOnce("/vendor/d3-geo.min.js");
  }).then(function(){ if(globeOn) done(); }).catch(function(e){ console.error(e); });
}
function globeFeatures(){
  var n=COUNTRY_LIST?COUNTRY_LIST.length:0;
  if(globeLand && globeLand.n===n) return globeLand.feats;
  var feats=[];
  if(COUNTRY_LIST && typeof polysOf==="function"){
    COUNTRY_LIST.forEach(function(c){
      if(c.i==="RU") return;
      var polys=polysOf(c);
      if(!polys.length) return;
      feats.push({type:"Feature", properties:{i:c.i}, geometry:{type:"MultiPolygon", coordinates:polys.map(function(poly){ return [poly[0]]; })}});
    });
  }
  globeLand={n:n, feats:feats};
  return feats;
}
function globeLayout(){
  var dpr=Math.min(window.devicePixelRatio||1, 2);
  var w=globeCv.clientWidth||window.innerWidth;
  var h=globeCv.clientHeight||window.innerHeight;
  if(globeCv.width!==Math.round(w*dpr) || globeCv.height!==Math.round(h*dpr)){
    globeCv.width=Math.round(w*dpr);
    globeCv.height=Math.round(h*dpr);
  }
  var ctx=globeCv.getContext("2d");
  ctx.setTransform(dpr,0,0,dpr,0,0);
  var sheet=document.getElementById("sheet");
  var desktop=window.matchMedia&&matchMedia("(min-width: 980px)").matches;
  var sheetH=desktop?76:(sheet?sheet.getBoundingClientRect().height:h*0.4);
  var top=78;
  var avail=Math.max(160, h-sheetH-top-12);
  var R=Math.min(w*0.42, avail*0.48)*globeScale;
  var cy=top+avail/2;
  var projection=d3.geoOrthographic()
    .translate([w/2, cy])
    .scale(R)
    .rotate([-globeRot.lng, -globeRot.lat])
    .clipAngle(90)
    .precision(0.4);
  return {ctx:ctx, w:w, h:h, R:R, path:d3.geoPath(projection, ctx), projection:projection};
}
function drawGlobe(){
  if(!globeOn || !globeCv || !window.d3 || !d3.geoOrthographic) return;
  var L2=globeLayout();
  var ctx=L2.ctx, w=L2.w, h=L2.h, R=L2.R, path=L2.path, c=L2.projection.translate();
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle="#05070f";
  ctx.fillRect(0,0,w,h);
  if(!globeCv._stars){
    var stars=[], i;
    for(i=0;i<80;i++) stars.push([Math.random(), Math.random(), Math.random()]);
    globeCv._stars=stars;
  }
  globeCv._stars.forEach(function(s){
    ctx.fillStyle="rgba(255,255,255,"+(0.25+s[2]*0.6)+")";
    ctx.fillRect(s[0]*w, s[1]*h, s[2]>0.7?1.6:1, s[2]>0.7?1.6:1);
  });
  var ocean=ctx.createRadialGradient(c[0]-R*0.32, c[1]-R*0.34, R*0.08, c[0], c[1], R);
  ocean.addColorStop(0,"#3d8ec4");
  ocean.addColorStop(0.45,"#1a4e86");
  ocean.addColorStop(1,"#07111f");
  ctx.beginPath();
  path({type:"Sphere"});
  ctx.fillStyle=ocean;
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  path({type:"Sphere"});
  ctx.clip();
  var feats=globeFeatures();
  var seen={};
  if(typeof visited!=="undefined") visited.forEach(function(id){ seen[id]=1; });
  ctx.beginPath();
  feats.forEach(function(f){ if(!seen[f.properties.i]) path(f); });
  ctx.fillStyle="#1e3b32";
  ctx.fill();
  if(typeof RUSSIA_REGIONS!=="undefined" && RUSSIA_REGIONS){
    ctx.beginPath();
    RUSSIA_REGIONS.forEach(function(reg){
      polysOf(reg).forEach(function(poly){
        path({type:"Feature", geometry:{type:"Polygon", coordinates:[poly[0]]}});
      });
    });
    ctx.fillStyle="#1e3b32";
    ctx.fill();
  }
  if(seen["RU"] && typeof RUSSIA_REGIONS!=="undefined" && RUSSIA_REGIONS){
    ctx.beginPath();
    RUSSIA_REGIONS.forEach(function(reg){
      polysOf(reg).forEach(function(poly){
        path({type:"Feature", geometry:{type:"Polygon", coordinates:[poly[0]]}});
      });
    });
    ctx.fillStyle="rgba(59,130,246,.7)";
    ctx.fill();
  }
  ctx.beginPath();
  feats.forEach(function(f){ if(seen[f.properties.i]) path(f); });
  ctx.fillStyle="rgba(59,130,246,.7)";
  ctx.fill();
  if(typeof visitedRegions!=="undefined" && RUSSIA_REGIONS && visitedRegions.length){
    var ron={};
    visitedRegions.forEach(function(id){ ron[id]=1; });
    ctx.beginPath();
    RUSSIA_REGIONS.forEach(function(reg){
      if(!ron[reg.id]) return;
      polysOf(reg).forEach(function(poly){
        path({type:"Feature", geometry:{type:"Polygon", coordinates:[poly[0]]}});
      });
    });
    ctx.fillStyle="rgba(232,184,92,.88)";
    ctx.fill();
  }
  var routes=typeof filtered==="function"?filtered():(typeof ROUTES!=="undefined"?ROUTES:[]);
  routes.forEach(function(r){
    var g=typeof buildGeoSync==="function"?buildGeoSync(r):null;
    if(!g||!g.coords||g.coords.length<2) return;
    var line={type:"LineString", coordinates:g.coords.map(function(p){ return [p[1], p[0]]; })};
    ctx.beginPath();
    path(line);
    ctx.lineCap="round";
    ctx.lineJoin="round";
    ctx.lineWidth=r.mode==="plane"?4.2:4.8;
    ctx.strokeStyle="rgba(255,255,255,.9)";
    ctx.stroke();
    ctx.beginPath();
    path(line);
    ctx.lineWidth=r.mode==="plane"?2.4:2.8;
    ctx.strokeStyle=(typeof COLORS!=="undefined"&&COLORS[r.mode])?COLORS[r.mode]:"#101820";
    ctx.stroke();
  });
  var shine=ctx.createRadialGradient(c[0]-R*0.38, c[1]-R*0.42, R*0.02, c[0]-R*0.1, c[1]-R*0.1, R);
  shine.addColorStop(0,"rgba(255,255,255,.28)");
  shine.addColorStop(0.35,"rgba(255,255,255,.05)");
  shine.addColorStop(1,"rgba(255,255,255,0)");
  ctx.fillStyle=shine;
  ctx.fillRect(c[0]-R, c[1]-R, R*2, R*2);
  ctx.restore();
  ctx.beginPath();
  ctx.arc(c[0], c[1], R+1.5, 0, Math.PI*2);
  ctx.strokeStyle="rgba(170,210,255,.45)";
  ctx.lineWidth=5;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(c[0], c[1], R, 0, Math.PI*2);
  ctx.strokeStyle="rgba(255,255,255,.55)";
  ctx.lineWidth=1.2;
  ctx.stroke();
}
function globeNudge(dx, dy){
  var R=Math.max(80, Math.min(window.innerWidth, window.innerHeight)*0.34*globeScale);
  var k=180/(Math.PI*R)*0.38;
  globeRot.lng-=dx*k;
  globeRot.lat=Math.max(-70, Math.min(70, globeRot.lat+dy*k));
}
function globeZoom(factor){
  globeScale=Math.max(0.45, Math.min(8, globeScale*factor));
  drawGlobe();
}
function globeFit(){
  globeScale=1;
  var list=typeof filtered==="function"?filtered():[];
  var slat=0, slng=0, n=0;
  list.forEach(function(r){
    var g=typeof buildGeoSync==="function"?buildGeoSync(r):null;
    if(!g||!g.a) return;
    slat+=g.a.lat; slng+=g.a.lng; n++;
    if(g.b){ slat+=g.b.lat; slng+=g.b.lng; n++; }
  });
  globeRot.lat=n?Math.max(-60, Math.min(60, slat/n)):26;
  globeRot.lng=n?slng/n:40;
  drawGlobe();
}
function bindGlobePointer(){
  function pos(e){
    if(e.touches&&e.touches[0]) return {x:e.touches[0].clientX, y:e.touches[0].clientY};
    return {x:e.clientX, y:e.clientY};
  }
  globeCv.addEventListener("pointerdown", function(e){
    if(!globeOn) return;
    globeCv.setPointerCapture && globeCv.setPointerCapture(e.pointerId);
    globeSpin++;
    globePtr={x:e.clientX, y:e.clientY, vx:0, vy:0, id:globeSpin};
    e.preventDefault();
  });
  globeCv.addEventListener("pointermove", function(e){
    if(!globePtr || !globeOn) return;
    var dx=e.clientX-globePtr.x, dy=e.clientY-globePtr.y;
    globePtr.x=e.clientX; globePtr.y=e.clientY;
    globePtr.vx=dx; globePtr.vy=dy;
    globeNudge(dx, dy);
    drawGlobe();
  });
  function end(){
    globePtr=null;
    globeSpin++;
  }
  globeCv.addEventListener("pointerup", end);
  globeCv.addEventListener("pointercancel", end);
  globeCv.addEventListener("wheel", function(e){
    if(!globeOn) return;
    e.preventDefault();
    globeZoom(e.deltaY>0?0.92:1.08);
  }, {passive:false});
  globeCv.addEventListener("dblclick", function(e){
    if(!globeOn) return;
    e.preventDefault();
    globeZoom(1.6);
  });
  var pinch=null, lastTap=0;
  globeCv.addEventListener("touchstart", function(e){
    if(!globeOn) return;
    if(e.touches.length===2){
      var a=e.touches[0], b=e.touches[1];
      pinch={dist:Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY)||1, scale:globeScale};
      globePtr=null;
    }
  }, {passive:true});
  globeCv.addEventListener("touchmove", function(e){
    if(!globeOn || !pinch || e.touches.length<2) return;
    var a=e.touches[0], b=e.touches[1];
    var dist=Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY)||1;
    globeScale=Math.max(0.45, Math.min(8, pinch.scale*(dist/pinch.dist)));
    drawGlobe();
    if(e.cancelable) e.preventDefault();
  }, {passive:false});
  globeCv.addEventListener("touchend", function(e){
    if(e.touches.length<2) pinch=null;
    if(e.changedTouches.length===1 && e.touches.length===0){
      var t=e.changedTouches[0];
      var now=Date.now();
      if(now-lastTap<300 && Math.abs((t.clientX)-(globeCv._tapX||t.clientX))<24){
        globeZoom(1.6);
        lastTap=0;
      } else {
        lastTap=now;
        globeCv._tapX=t.clientX;
      }
    }
  });
}

function updateNightLayer(){
  if(!map) return;
  if(nightLayer){ try{ map.removeLayer(nightLayer); }catch(e){} nightLayer=null; }
  if(!nightOn) return;
  var ll=buildNightLatLngs(new Date());
  nightLayer=L.polygon(ll,{
    color:"transparent", fillColor:"#000", fillOpacity:0.35,
    interactive:false, className:"night-poly"
  });
  nightLayer.addTo(map);
  try{ nightLayer.bringToFront(); }catch(e){}
  if(labelsLayer) try{ labelsLayer.bringToFront(); }catch(e){}
  if(layer) try{ layer.bringToFront(); }catch(e){}
}
setInterval(function(){ if(nightOn) updateNightLayer(); }, 60000);

/* ——— Оптимизация подписей: только около маршрутов ——— */
var labelRoutePts=[];
function collectLabelPts(routes){
  labelRoutePts=[];
  routes.forEach(function(r){
    var g=typeof buildGeoSync==="function"?buildGeoSync(r):null;
    if(!g||!g.a) return;
    labelRoutePts.push([g.a.lat,g.a.lng]);
    if(g.b) labelRoutePts.push([g.b.lat,g.b.lng]);
  });
}
function nearAnyRoute(lat,lng,maxKm){
  maxKm=maxKm||400;
  if(!labelRoutePts.length) return true;
  var i,d;
  for(i=0;i<labelRoutePts.length;i++){
    d=hav({lat:lat,lng:lng},{lat:labelRoutePts[i][0],lng:labelRoutePts[i][1]});
    if(d<=maxKm) return true;
  }
  return false;
}

var layer=L.layerGroup().addTo(map);
var labelsLayer=L.layerGroup().addTo(map);
var selectedId=null, activeTab="future", sheetState="mid";
var lastBounds=null;

function fitAll(){
  if(lastBounds&&lastBounds.length){
    try{ map.fitBounds(lastBounds,{padding:[50,120],maxZoom:6}); }catch(e){}
  } else {
    map.setView([45,20],4);
  }
  selectedId=null;
}

var pickModeLabels=false;
function drawCityLabels(){
  labelsLayer.clearLayers();
  var z=map.getZoom();
  if(z<3) return;
  var theme=document.documentElement.getAttribute("data-theme")||"dark";
  var color=theme==="light"?"#1a1d26":"#eef0f5";
  var bg=theme==="light"?"rgba(255,255,255,.7)":"rgba(0,0,0,.55)";
  /* обычный режим — крупные; при выборе точки авто — все города каталога в видимой области */
  var list=CITY_LABELS;
  if(pickModeLabels || z>=6){
    list=CITIES.map(function(c){return {name:c.n,lat:c.lat,lng:c.lng};});
  }
  var b=map.getBounds();
  var maxLabels = pickModeLabels ? 80 : (z>=7 ? 60 : 30);
  var n=0;
  for(var i=0;i<list.length && n<maxLabels;i++){
    var c=list[i];
    if(!b.contains([c.lat,c.lng])) continue;
    if(!pickModeLabels && typeof nearAnyRoute==="function" && labelRoutePts.length && !nearAnyRoute(c.lat,c.lng,450)) continue;
    var fs = z>=8 ? 10 : (z>=6 ? 9 : 8);
    L.marker([c.lat,c.lng],{interactive:false,keyboard:false,icon:L.divIcon({
      className:"city-lbl",
      html:'<div style="transform:translate(-50%,-100%);white-space:nowrap;font:500 '+fs+'px/1.15 -apple-system,sans-serif;color:'+color+';text-shadow:0 0 4px '+bg+',0 1px 2px '+bg+';opacity:.9;pointer-events:none">'+c.name+"</div>",
      iconSize:[0,0],iconAnchor:[0,0]
    })}).addTo(labelsLayer);
    n++;
  }
}

function applyTheme(pref){
  var mode=pref==="light"||pref==="dark"||pref==="system"?pref:"dark";
  try{localStorage.setItem("travelek-theme-pref", mode);}catch(e){}
  var theme=mode==="system"?(window.matchMedia&&matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"):mode;
  document.documentElement.setAttribute("data-theme",theme);
  try{localStorage.setItem("travelek-theme",theme);}catch(e){}
  scheduleCloudSave();
  var themeBtn=document.getElementById("theme-btn");
  if(themeBtn) themeBtn.textContent=theme==="light"?"☀️":"🌙";
  if(baseLayer) map.removeLayer(baseLayer);
  baseLayer=makeBase().addTo(map);
  var meta=document.querySelector('meta[name="theme-color"]');
  if(meta) meta.setAttribute("content",theme==="light"?"#f4f5f7":"#12151f");
  if(layer) try{ layer.bringToFront(); }catch(e){}
  if(typeof updateNightLayer==="function") updateNightLayer();
  drawCityLabels();
  if(typeof updateLiveTrip==="function") updateLiveTrip();
}


function pluralRu(n, one, few, many){
  n=Math.abs(parseInt(n,10)||0)%100;
  var n1=n%10;
  if(n>10&&n<20) return many;
  if(n1>1&&n1<5) return few;
  if(n1===1) return one;
  return many;
}

function wordDays(n){ n=Math.round(n); return n+" "+pluralRu(n,"день","дня","дней"); }
function wordHours(n){ n=Math.round(n); return n+" "+pluralRu(n,"час","часа","часов"); }
function formatTripDuration(r, km){
  if(r.duration && String(r.duration).trim()) return String(r.duration).trim();
  km=km||0;
  if(km<=0) return "";
  var speed=60;
  if(r.mode==="plane") speed=750;
  else if(r.mode==="train") speed=90;
  else if(r.mode==="car") speed=70;
  else if(r.mode==="ship") speed=25;
  else if(r.mode==="walk") speed=5;
  else if(r.mode==="bike") speed=15;
  var hours=km/speed;
  if(hours<0.75) return Math.max(1, Math.round(hours*60))+" мин";
  if(hours<24) return wordHours(Math.max(1, Math.round(hours)));
  return wordDays(Math.max(1, Math.round(hours/24)));
}
function isCoordLabel(s){
  return /точка\s*-?\d/i.test(String(s||"")) || /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/.test(String(s||"").trim());
}
function nearestCityName(lat, lng, maxKm){
  maxKm=maxKm||80;
  if(typeof CITIES==="undefined"||!CITIES.length) return null;
  var best=null, bd=maxKm, i, d;
  for(i=0;i<CITIES.length;i++){
    d=hav({lat:lat,lng:lng}, CITIES[i]);
    if(d<bd){ bd=d; best=CITIES[i].n; }
  }
  return best;
}
function shortPlaceLabel(label, lat, lng){
  if(!label) return label;
  if(!isCoordLabel(label)) return label;
  var la=lat, ln=lng;
  if(la==null||ln==null){
    var m=String(label).match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
    if(m){ la=parseFloat(m[1]); ln=parseFloat(m[2]); }
  }
  if(la==null||isNaN(la)) return label;
  var name=nearestCityName(la, ln, 80);
  if(name) return "≈ "+name;
  return label;
}

function wordReis(n){ return n+" "+pluralRu(n,"рейс","рейса","рейсов"); }
function wordMarsh(n){ return n+" "+pluralRu(n,"маршрут","маршрута","маршрутов"); }

function filtered(){
  return ROUTES.filter(function(r){
    var fut=isFuture(r);
    if(activeTab==="future") { if(!fut) return false; }
    else if(activeTab==="past") { if(fut) return false; }
    if(typeof yearFilter!=="undefined" && yearFilter!=="all" && (r.date||"").slice(0,4)!==yearFilter) return false;
    return true;
  }).slice().sort(function(a,b){ return (b.date||"").localeCompare(a.date||""); });
}

function render(){
  layer.clearLayers();
  if(typeof collectLabelPts==="function") collectLabelPts(typeof filtered==="function"?filtered():ROUTES);
  var list=filtered(), kmP=0, kmT=0, kmC=0, bounds=[], pending=[];
  var kmW=0,kmB=0,kmS=0,nP=0,nT=0,nC=0,nW=0,nB=0,nS=0;
  /* статистика только по текущей вкладке */
  list.forEach(function(r){
    var g=buildGeoSync(r); if(!g) return;
    if(r.mode==="plane"){ kmP+=g.km; nP++; }
    else if(r.mode==="car"){ kmC+=g.km; nC++; }
    else if(r.mode==="walk"){ kmW+=g.km; nW++; }
    else if(r.mode==="bike"){ kmB+=g.km; nB++; }
    else if(r.mode==="ship"){ kmS+=g.km; nS++; }
    else { kmT+=g.km; nT++; }
  });
  document.getElementById("s-plane").textContent=Math.round(kmP).toLocaleString("ru-RU");
  document.getElementById("s-train").textContent=Math.round(kmT).toLocaleString("ru-RU");
  document.getElementById("s-car").textContent=Math.round(kmC).toLocaleString("ru-RU");
  if(window.__fillAccount && document.getElementById("account-panel") && document.getElementById("account-panel").classList.contains("on")) window.__fillAccount();
  var sw=document.getElementById("s-walk"); if(sw) sw.textContent=Math.round(kmW).toLocaleString("ru-RU");
  var sb=document.getElementById("s-bike"); if(sb) sb.textContent=Math.round(kmB).toLocaleString("ru-RU");
  var ss=document.getElementById("s-ship"); if(ss) ss.textContent=Math.round(kmS).toLocaleString("ru-RU");
  var el;
  var futN=ROUTES.filter(isFuture).length;
  document.getElementById("subtitle").textContent=(function(){
    var total=ROUTES.length, fut=futN;
    if(!total) return "Нет маршрутов";
    var s=wordReis(total);
    if(fut) s+=" · "+fut+" "+pluralRu(fut,"предстоящий","предстоящих","предстоящих");
    return s;
  })();
  var fill=getComputedStyle(document.documentElement).getPropertyValue("--map-bg").trim()||"#0a0c10";

  list.forEach(function(r){
    var g=buildGeoSync(r); if(!g||!g.coords) return;
    if(g.needRoad) pending.push(r);
    var fut=isFuture(r);
    var col=COLORS[r.mode]||COLORS.plane;
    if(fut&&r.mode==="plane") col=COLORS.future;
    var theme=document.documentElement.getAttribute("data-theme")||"dark";
    var casing=theme==="light"?"#ffffff":"#f4f8fc";
    var w=r.mode==="plane"?5:(r.mode==="train"||r.mode==="car"?5.5:4);
    L.polyline(g.coords,{color:casing,weight:w+5,opacity:1,lineJoin:"round",lineCap:"round",interactive:false}).addTo(layer);
    L.polyline(g.coords,{color:col,weight:selectedId===r.id?w+1.5:w,opacity:1,dashArray:fut?"7 6":null,lineJoin:"round",lineCap:"round",interactive:false}).addTo(layer);
    [g.coords[0],g.coords[g.coords.length-1]].forEach(function(p){
      L.circleMarker(p,{radius:5,color:casing,fillColor:col,fillOpacity:1,weight:2.5}).addTo(layer);
    });
    g.coords.forEach(function(c){bounds.push(c);});
  });
  drawCityLabels();
  if(typeof syncVisited==="function") syncVisited();
  if(typeof drawCountries==="function") drawCountries();
  if(globeOn && typeof drawGlobe==="function") drawGlobe();

  /* load real roads then re-render once */
  if(pending.length){
    var left=pending.length;
    pending.forEach(function(r){
      var a=place(r.from), b=place(r.to);
      if(!a||!b){ left--; return; }
      fetchRoad(a,b,function(){ left--; if(left<=0) render(); });
    });
  }

  var el=document.getElementById("list");
  if(!list.length){ el.innerHTML='<div class="empty"><img src="/art/empty.jpg" alt=""><p>'+(activeTab==="future"?"Нет предстоящих маршрутов. Откройте «История» или добавьте новый.":"В истории пока пусто")+'</p></div>'; }
  else {
    var html="", lastY="";
    list.forEach(function(r){
      var y=(r.date||"").slice(0,4);
      if(y&&y!==lastY){ html+='<div class="year">'+y+"</div>"; lastY=y; }
      var fut=isFuture(r), g=buildGeoSync(r), km=g?Math.round(g.km):0;
      var bc=r.mode==="plane"?"pl":(r.mode==="car"?"car":(r.mode==="walk"?"wk":(r.mode==="bike"?"bk":(r.mode==="ship"?"sh":"tr"))));
      var fromL=r.from, toL=r.to;
      if(g&&g.a) fromL=shortPlaceLabel(r.from, g.a.lat, g.a.lng);
      else fromL=shortPlaceLabel(r.from);
      if(g&&g.b) toL=shortPlaceLabel(r.to, g.b.lat, g.b.lng);
      else toL=shortPlaceLabel(r.to);
      var dur=formatTripDuration(r, km);
      var art=r.mode==="train"?"/art/train.jpg":(r.mode==="car"?"/art/car.jpg":"/art/plane.jpg");
      html+='<div class="row '+(selectedId===r.id?"on ":"")+(fut?"future":"")+'" data-id="'+r.id+'">'+
        '<img class="thumb" alt="" src="'+art+'">'+
        '<button type="button" class="edit" data-edit="'+r.id+'" title="Изменить">✎</button>'+'<button type="button" class="del" data-del="'+r.id+'" title="Удалить">×</button>'+
        '<div class="title">'+fromL+" → "+toL+"</div>"+
        '<div class="meta"><span class="badge '+bc+'">'+(r.flight||r.mode)+"</span>"+
        (fut?'<span class="badge fut">скоро</span>':"")+" "+(r.date||"")+
        (r.time?" · "+r.time:"")+(km?" · "+km.toLocaleString("ru-RU")+" км":"")+
        (dur?" · "+dur:"")+"</div></div>";
    });
    el.innerHTML=html;
    var rows=el.querySelectorAll(".row");
    for(var i=0;i<rows.length;i++){
      rows[i].onclick=(function(row){ return function(ev){
        if(ev.target.classList.contains("del")||ev.target.classList.contains("edit")) return;
        selectedId=row.getAttribute("data-id"); render();
        var r=null; for(var j=0;j<ROUTES.length;j++) if(ROUTES[j].id===selectedId) r=ROUTES[j];
        var g=r&&buildGeoSync(r); if(g&&g.coords) map.fitBounds(g.coords,{padding:[50,50],maxZoom:8});
      };})(rows[i]);
    }
    var dels=el.querySelectorAll(".del");
    for(var di=0;di<dels.length;di++){
      dels[di].onclick=(function(btn){ return function(ev){
        ev.stopPropagation();
        var id=btn.getAttribute("data-del");
        if(!confirm("Удалить маршрут?")) return;
        deleted.push(id); saveDeleted(deleted);
        var extra=loadExtra().filter(function(x){return x.id!==id;});
        saveExtra(extra);
        ROUTES=assembleRoutes();
        if(selectedId===id) selectedId=null;
        render();
      };})(dels[di]);
    }
    var edits=el.querySelectorAll(".edit");
    for(var ei=0;ei<edits.length;ei++){
      edits[ei].onclick=(function(btn){ return function(ev){
        ev.stopPropagation();
        openEdit(btn.getAttribute("data-edit"));
      };})(edits[ei]);
    }
  }
  lastBounds=bounds;
  /* не дёргаем карту при каждом render — только при смене вкладки / старте */
  if(bounds.length&&!selectedId&&!window.__mapInited){
    window.__mapInited=true;
    try{map.fitBounds(bounds,{padding:[40,100],maxZoom:5});}catch(e){}
  }
  if(typeof buildYearFilter==="function") buildYearFilter();
}



/* init */
var savedPref="dark";
try{savedPref=localStorage.getItem("travelek-theme-pref")||localStorage.getItem("travelek-theme")||"dark";}catch(e){}
applyTheme(savedPref);
if(window.matchMedia){
  matchMedia("(prefers-color-scheme: light)").addEventListener("change", function(){
    if(localStorage.getItem("travelek-theme-pref")==="system") applyTheme("system");
  });
}
var themeBtnInit=document.getElementById("theme-btn");
if(themeBtnInit) themeBtnInit.onclick=function(){
  var cur=document.documentElement.getAttribute("data-theme")||"dark";
  applyTheme(cur==="dark"?"light":"dark");
};
document.getElementById("z-in").onclick=function(){map.zoomIn();};
document.getElementById("z-out").onclick=function(){map.zoomOut();};
document.getElementById("z-fit").onclick=function(){ fitAll(); render(); };
map.on("zoomend",drawCityLabels);
map.on("moveend",function(){ if(pickModeLabels||map.getZoom()>=6) drawCityLabels(); });
map.on("click",function(e){
  if(pickTarget) finishPick(e.latlng);
});
(function bindPinch(map){
  var el=map.getContainer();
  var startDist=0, startZoom=0, live=false;
  el.addEventListener("touchstart", function(e){
    if(e.touches.length!==2) return;
    live=true;
    var a=e.touches[0], b=e.touches[1];
    startDist=Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY)||1;
    startZoom=map.getZoom();
  }, {passive:true});
  el.addEventListener("touchmove", function(e){
    if(!live || e.touches.length!==2) return;
    var a=e.touches[0], b=e.touches[1];
    var dist=Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY)||1;
    var z=Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), startZoom+Math.log2(dist/startDist)));
    map.setZoom(z, {animate:false});
    if(e.cancelable) e.preventDefault();
  }, {passive:false});
  function end(){ live=false; }
  el.addEventListener("touchend", end);
  el.addEventListener("touchcancel", end);
})(map);

/* нижняя панель не должна «захватывать» карту */
var sheetElMap=document.getElementById("sheet");
L.DomEvent.disableClickPropagation(sheetElMap);
L.DomEvent.disableScrollPropagation(sheetElMap);

var tabs=document.querySelectorAll(".tab");
for(var ti=0;ti<tabs.length;ti++){
  tabs[ti].onclick=(function(t){return function(){
    for(var j=0;j<tabs.length;j++) tabs[j].classList.remove("on");
    t.classList.add("on"); activeTab=t.getAttribute("data-tab"); selectedId=null; render();
  };})(tabs[ti]);
}

/* sheet: плавный свайп */
var sheetEl=document.getElementById("sheet");

var handleWrap=document.getElementById("handle-wrap");
sheetEl=document.getElementById("sheet");
var dragY0=null, dragH0=0, dragging=false, didDrag=false;

function sheetHeights(){
  var vh=window.innerHeight||600;
  var tabs=document.querySelector(".tabs");
  var cap=tabs?Math.ceil(tabs.getBoundingClientRect().top):150;
  if(cap<72) cap=150;
  var full=Math.max(180, vh-cap);
  var mid=Math.round(Math.min(vh*0.46, full-40));
  return {
    collapsed: Math.min(104, Math.round(vh*0.14)),
    mid: mid,
    full: full
  };
}
function heightOfState(st){
  var h=sheetHeights();
  return h[st]||h.mid;
}
function nearestState(px){
  var h=sheetHeights();
  var states=["collapsed","mid","full"];
  var best="mid", bd=1e9, i;
  for(i=0;i<states.length;i++){
    var d=Math.abs(h[states[i]]-px);
    if(d<bd){ bd=d; best=states[i]; }
  }
  return best;
}
function setSheet(state){
  if(!sheetEl) return;
  if(window.matchMedia && matchMedia("(min-width: 980px)").matches){
    sheetState=state;
    sheetEl.classList.remove("collapsed","mid","full","low","dragging");
    sheetEl.style.height="";
    return;
  }
  sheetState=state;
  sheetEl.classList.remove("collapsed","mid","full","low","dragging");
  sheetEl.classList.add(state);
  sheetEl.style.height=heightOfState(state)+"px";
  document.body.classList.remove("sheet-collapsed","sheet-full");
  if(state==="collapsed") document.body.classList.add("sheet-collapsed");
  if(state==="full") document.body.classList.add("sheet-full");
  try{ map.invalidateSize(); }catch(e){}
  if(globeOn && typeof drawGlobe==="function") drawGlobe();
}
function onDragStart(y){
  if(!sheetEl) return;
  if(window.matchMedia && matchMedia("(min-width: 980px)").matches) return;
  dragY0=y;
  dragH0=sheetEl.getBoundingClientRect().height;
  dragging=true;
  didDrag=false;
  sheetEl.classList.add("dragging");
  sheetEl.style.transition="none";
}
function onDragMove(y){
  if(dragY0==null||!sheetEl) return;
  var dy=dragY0-y;
  if(Math.abs(y-dragY0)>8) didDrag=true;
  var h=sheetHeights();
  var nh=Math.max(h.collapsed, Math.min(h.full, dragH0+dy));
  sheetEl.style.height=nh+"px";
}
function onDragEnd(){
  if(dragY0==null||!sheetEl) return;
  var cur=sheetEl.getBoundingClientRect().height;
  var wasDrag=didDrag;
  dragY0=null;
  dragging=false;
  sheetEl.classList.remove("dragging");
  sheetEl.style.transition="";
  /* тап обрабатывает onclick ручки — иначе срабатывает дважды и панель не двигается */
  if(wasDrag) setSheet(nearestState(cur));
  else setSheet(sheetState);
}

function bindSheetDrag(el){
  if(!el) return;
  el.addEventListener("touchstart",function(e){
    if(e.touches.length!==1) return;
    onDragStart(e.touches[0].clientY);
  },{passive:true});
  el.addEventListener("touchmove",function(e){
    if(dragY0==null) return;
    onDragMove(e.touches[0].clientY);
    if(didDrag && e.cancelable) try{ e.preventDefault(); }catch(err){}
  },{passive:false});
  el.addEventListener("touchend",onDragEnd);
  el.addEventListener("touchcancel",onDragEnd);
  el.addEventListener("mousedown",function(e){
    onDragStart(e.clientY);
    e.preventDefault();
  });
}
bindSheetDrag(handleWrap);
/* свайп по блоку статистики тоже */
var statsEl=document.querySelector(".stats");
bindSheetDrag(statsEl);
var listElDrag=document.getElementById("list");
var listStartY=null;
if(listElDrag){
  listElDrag.addEventListener("touchstart", function(e){
    if(e.touches.length!==1 || listElDrag.scrollTop>2) return;
    listStartY=e.touches[0].clientY;
  }, {passive:true});
  listElDrag.addEventListener("touchmove", function(e){
    if(listStartY==null) return;
    var y=e.touches[0].clientY;
    if(y-listStartY>16 && listElDrag.scrollTop<=2){
      if(dragY0==null) onDragStart(listStartY);
      onDragMove(y);
      if(e.cancelable) try{ e.preventDefault(); }catch(err){}
    } else if(dragY0==null && listStartY-y>8) listStartY=null;
  }, {passive:false});
  listElDrag.addEventListener("touchend", function(){ if(dragY0!=null) onDragEnd(); listStartY=null; });
  listElDrag.addEventListener("touchcancel", function(){ if(dragY0!=null) onDragEnd(); listStartY=null; });
}

window.addEventListener("mousemove",function(e){
  if(dragY0==null) return;
  onDragMove(e.clientY);
});
window.addEventListener("mouseup",function(){ if(dragY0!=null) onDragEnd(); });


handleWrap.onclick=function(){
  if(didDrag){ didDrag=false; return; }
  if(sheetState==="collapsed") setSheet("mid");
  else if(sheetState==="mid") setSheet("full");
  else setSheet("mid");
};

function checkOnline(){
  var el=document.getElementById("offline-banner");
  if(!el){
    el=document.createElement("div");
    el.id="offline-banner";
    el.style.cssText="display:none;position:fixed;top:calc(8px + env(safe-area-inset-top));left:50%;transform:translateX(-50%);z-index:60;background:#c44;color:#fff;padding:8px 14px;border-radius:10px;font-size:12px;font-weight:600;max-width:90%;text-align:center";
    el.textContent="Нет сети — карта и авто-дороги могут не загрузиться";
    document.body.appendChild(el);
  }
  el.style.display=navigator.onLine?"none":"block";
}
window.addEventListener("online",checkOnline);
window.addEventListener("offline",checkOnline);
checkOnline();

(function(){
  var td=document.getElementById("set-theme-dark");
  var tl=document.getElementById("set-theme-light");
  if(td) td.onclick=function(){ applyTheme("dark"); };
  if(tl) tl.onclick=function(){ applyTheme("light"); };
  var ts=document.getElementById("set-theme-system");
  if(ts) ts.onclick=function(){ applyTheme("system"); };
  var ea=document.getElementById("set-export-all");
  if(ea) ea.onclick=function(){
    var payload={version:3,exported:new Date().toISOString(),extra:loadExtra(),deleted:loadDeleted(),trackSettings:loadTrackSettings(),appSettings:loadAppSettings(),countries:typeof loadVisited==="function"?loadVisited():[],regions:typeof manualRegions!=="undefined"?manualRegions.slice():[]};
    var blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
    var a=document.createElement("a"); a.href=URL.createObjectURL(blob);
    a.download="travelek-backup-"+new Date().toISOString().slice(0,10)+".json"; a.click();
  };
  var ia=document.getElementById("set-import-all");
  var iaf=document.getElementById("set-import-all-file");
  if(ia&&iaf){
    ia.onclick=function(){ iaf.click(); };
    iaf.onchange=function(ev){
      var f=ev.target.files&&ev.target.files[0]; if(!f) return;
      var reader=new FileReader();
      reader.onload=function(){
        try{
          var data=JSON.parse(reader.result);
          if(data.extra) saveExtra(data.extra);
          if(data.deleted) saveDeleted(data.deleted);
          if(data.trackSettings) saveTrackSettings(data.trackSettings);
          if(data.appSettings) saveAppSettings(data.appSettings);
          if(Array.isArray(data.countries) && typeof saveVisited==="function") saveVisited(data.countries);
          if(Array.isArray(data.regions)){ manualRegions=data.regions.slice(); if(typeof saveSets==="function") saveSets(); }
          deleted=loadDeleted();
          ROUTES=assembleRoutes();
          render(); alert("Дневник восстановлен");
        }catch(e){ alert("Файл не прочитан"); }
        ev.target.value="";
      };
      reader.readAsText(f);
    };
  }
  var rs=document.getElementById("set-reset");
  if(rs) rs.onclick=function(){
    if(!confirm("Удалить все ваши маршруты и треки?")) return;
    saveExtra([]); saveDeleted([]); deleted=[]; ROUTES=window.__TRAVELEK_PRIVATE?[]:BUILTIN.slice(); render();
  };
  var btn=document.getElementById("trim-spikes");
  if(btn) btn.onclick=function(){
    if(!window._editCoords||window._editCoords.length<3) return;
    var pts=window._editCoords, out=[pts[0]], i;
    for(i=1;i<pts.length-1;i++){
      var d1=hav({lat:pts[i-1][0],lng:pts[i-1][1]},{lat:pts[i][0],lng:pts[i][1]});
      var d2=hav({lat:pts[i][0],lng:pts[i][1]},{lat:pts[i+1][0],lng:pts[i+1][1]});
      if(d1>0.2&&d2>0.2) continue;
      out.push(pts[i]);
    }
    out.push(pts[pts.length-1]);
    window._editCoords=out;
    alert("Точек: "+pts.length+" → "+out.length);
  };
})();

/* form + autocomplete */
var modal=document.getElementById("modal");
var fFrom=document.getElementById("f-from"), fTo=document.getElementById("f-to");
var sugFrom=document.getElementById("sug-from"), sugTo=document.getElementById("sug-to");
var fMode=document.getElementById("f-mode");

var carWaypoints = []; /* [{lat,lng}, ...] для бездорожья */

function updateLabels(){
  var m=fMode.value;
  document.getElementById("lbl-from").textContent=m==="plane"?"Откуда (аэропорт)":(m==="train"?"Откуда (вокзал)":(m==="ship"?"Откуда (порт / город)":"Откуда (город / точка)"));
  document.getElementById("lbl-to").textContent=m==="plane"?"Куда (аэропорт)":(m==="train"?"Куда (вокзал)":(m==="ship"?"Куда (порт / город)":"Куда (город / точка)"));
  fFrom.placeholder=m==="plane"?"Только аэропорт: SVO, LED…":(m==="train"?"Только вокзал…":"Город или 📍 на карте");
  fTo.placeholder=fFrom.placeholder;
  var fw=document.getElementById("f-flight-wrap");
  var fl=document.getElementById("lbl-flight");
  var fi=document.getElementById("f-flight");
  if(m==="plane"){ fw.style.display=""; fl.textContent="Рейс"; fi.placeholder="SU 100"; }
  else if(m==="train"){ fw.style.display=""; fl.textContent="Поезд / номер"; fi.placeholder="Сапсан 756А"; }
  else if(m==="walk"||m==="bike"){ fw.style.display=""; fl.textContent="Название (необязательно)"; fi.placeholder="Вечерняя прогулка"; }
  else if(m==="ship"){ fw.style.display=""; fl.textContent="Рейс / паром"; fi.placeholder="Паром, круиз…"; }
  else { fw.style.display=""; fl.textContent="Комментарий (необязательно)"; fi.placeholder="Например: через перевал"; }
  var showPick=(m==="car"||m==="ship"||m==="walk"||m==="bike");
  document.getElementById("pick-from").style.display=showPick?"":"none";
  document.getElementById("pick-to").style.display=showPick?"":"none";
  document.getElementById("pick-hint").style.display=showPick?"":"none";
  document.getElementById("car-mode-wrap").style.display=(m==="car")?"":"none";
  var ph=document.getElementById("pick-hint");
  if(ph){
    if(m==="ship") ph.textContent="Корабль: порты из списка или 📍 на воде; маршрут по фарватеру";
    else if(m==="car") ph.textContent="Авто: город или точка на карте";
    else if(m==="walk"||m==="bike") ph.textContent="Точка на карте 📍 или запись GPS (кнопка ●)";
  }
  syncWpPanel();
}
function syncWpPanel(){
  var show = (fMode.value==="car" && document.getElementById("f-car-path").value==="offroad") || fMode.value==="ship";
  document.getElementById("waypoints-wrap").style.display=show?"":"none";
  var el=document.getElementById("wp-list");
  if(!carWaypoints.length) el.textContent="Пока нет — добавьте точки, чтобы обойти препятствия";
  else el.innerHTML=carWaypoints.map(function(w,i){
    return (i+1)+") "+w.lat.toFixed(4)+", "+w.lng.toFixed(4);
  }).join("<br/>");
}
fMode.onchange=updateLabels;
document.getElementById("f-car-path").onchange=syncWpPanel;


/* выбор точки на карте для авто (Россия) */
var pickTarget=null, pickMarkers=[];
function clearPickMarkers(){
  pickMarkers.forEach(function(m){ try{map.removeLayer(m);}catch(e){} });
  pickMarkers=[];
}
function startPick(which){
  pickTarget=which;
  pickModeLabels=true;
  drawCityLabels();
  closeForm();
  var ban=document.getElementById("pick-banner");
  if(which==="from") ban.textContent="Ткните точку ОТКУДА на карте";
  else if(which==="to") ban.textContent="Ткните точку КУДА на карте";
  else ban.textContent="Промежуточная точка (обход)";
  ban.classList.add("on");
}
function finishPick(latlng){
  var la=latlng.lat, ln=latlng.lng;
  if(la<-85||la>85||ln<-180||ln>180){
    alert("Точка вне карты");
    return;
  }
  var label="Точка "+la.toFixed(4)+", "+ln.toFixed(4);
  var mk=L.circleMarker([la,ln],{radius:6,color:"#e0a040",fillColor:"#e0a040",fillOpacity:0.9}).addTo(map);
  pickMarkers.push(mk);
  if(pickTarget==="from") fFrom.value=label;
  else if(pickTarget==="to") fTo.value=label;
  else if(pickTarget==="wp"){
    carWaypoints.push({lat:la,lng:ln});
  }
  pickTarget=null;
  pickModeLabels=false;
  drawCityLabels();
  document.getElementById("pick-banner").classList.remove("on");
  openForm();
  if(fMode.value!=="walk"&&fMode.value!=="bike"&&fMode.value!=="ship") fMode.value="car";
  updateLabels();
  syncWpPanel();
}
document.getElementById("pick-from").onclick=function(){ startPick("from"); };
document.getElementById("pick-to").onclick=function(){ startPick("to"); };
document.getElementById("wp-add").onclick=function(){
  document.getElementById("f-car-path").value="offroad";
  startPick("wp");
};
document.getElementById("wp-clear").onclick=function(){
  carWaypoints=[];
  clearPickMarkers();
  syncWpPanel();
};

function bindSuggest(input, box, which){
  input.addEventListener("input",function(){
    var fromHint=(which==="to")?(document.getElementById("f-from")||{}).value:null;
    var items=searchCatalog(fMode.value, input.value, fromHint);
    if(!items.length){ box.classList.remove("on"); box.innerHTML=""; return; }
    box.innerHTML=items.map(function(it){
      var code=it.code?'<span class="code">'+it.code+"</span>":"";
      return "<div data-v=\""+it.value.replace(/"/g,"&quot;")+"\">"+code+it.label+"</div>";
    }).join("");
    box.classList.add("on");
    var divs=box.querySelectorAll("div");
    for(var i=0;i<divs.length;i++){
      divs[i].onclick=(function(d){return function(){
        input.value=d.getAttribute("data-v"); box.classList.remove("on");
      };})(divs[i]);
    }
  });
  input.addEventListener("blur",function(){ setTimeout(function(){box.classList.remove("on");},200); });
}
bindSuggest(fFrom,sugFrom,"from");
bindSuggest(fTo,sugTo,"to");

fFrom.addEventListener("change", function(){
  if(fMode.value==="plane"||fMode.value==="train"||fMode.value==="ship"){
    /* при смене «откуда» сбрасываем «куда», чтобы не оставить невозможную пару */
    if(fTo.value) { fTo.value=""; var st=document.getElementById("sug-to"); if(st){st.classList.remove("on");st.innerHTML="";} }
  }
});
;

function openForm(){ updateLabels(); modal.classList.add("on"); }
function closeForm(){ modal.classList.remove("on"); }
document.getElementById("add-btn").onclick=function(){ openFormNew(); };
document.getElementById("add-btn-2").onclick=function(){ openFormNew(); };
document.getElementById("f-cancel").onclick=closeForm;
modal.addEventListener("click",function(e){ if(e.target===modal) closeForm(); });

document.getElementById("f-save").onclick=function(){
  var mode=fMode.value;
  var from=fFrom.value.trim(), to=fTo.value.trim();
  var date=document.getElementById("f-date").value;
  var time=document.getElementById("f-time").value;
  var flight=document.getElementById("f-flight").value.trim()||
    (mode==="plane"?"Flight":mode==="car"?"Авто":mode==="ship"?"Паром":mode==="walk"?"Прогулка":mode==="bike"?"Вело":"Train");
  if(!from||!to||!date){ alert("Укажите откуда, куда и дату"); return; }
  var pa=place(from), pb=place(to);
  if(!pa||!pb){
    alert(mode==="car"
      ? "Укажите город из списка или точку на карте (кнопка 📍)."
      : "Точка не найдена. Выберите из подсказок при вводе.");
    return;
  }
  if(mode==="plane"){
    var ca=airportCodeOf(pa), cb=airportCodeOf(pb);
    if(!ca||!cb){ alert("Нужны аэропорты с кодом IATA из подсказок."); return; }
    if(ca&&cb){
    var MOSC={SVO:1,DME:1,VKO:1,ZIA:1};
    if(String(ca).toUpperCase()===String(cb).toUpperCase()){ alert("Один и тот же аэропорт"); return; }
    if(!flightAllowed(ca,cb) && ca && cb){
      var MOSC={SVO:1,DME:1,VKO:1,ZIA:1};
      if(MOSC[String(ca).toUpperCase()]&&MOSC[String(cb).toUpperCase()]){
        alert("Между аэропортами Москвы регулярных пассажирских рейсов нет — это трансфер, не перелёт.");
        return;
      }
    }
    if(ca&&cb && String(ca).toUpperCase()!==String(cb).toUpperCase()){
      var METRO_HARD=[["SVO","DME","VKO","ZIA"],["FCO","CIA"],["MXP","LIN","BGY"],["PEK","PKX"],["PVG","SHA"]];
      var caU=String(ca).toUpperCase(), cbU=String(cb).toUpperCase(), hi,hg;
      for(hi=0;hi<METRO_HARD.length;hi++){
        hg=METRO_HARD[hi];
        if(hg.indexOf(caU)>=0 && hg.indexOf(cbU)>=0){
          alert("Между аэропортами одного города пассажирских рейсов нет (трансфер).");
          return;
        }
      }
    }
  }
  if(isStrictRoutes() && !flightAllowed(ca,cb)){
      if(!confirm("В базе нет такого рейса. Сохранить как свой маршрут?")) return;
    }
    var paw=typeof planeNavWarnings==="function"?planeNavWarnings(ca,cb,date):[];
    if(paw.length && !confirm("Авиация:\n• "+paw.join("\n• ")+"\n\nСохранить?")) return;
  }
  if(mode==="train"){
    if(isStrictRoutes() && !trainAllowed(from,to)){
      if(!confirm("Нет пути в ЖД-сети приложения. Сохранить свой маршрут?")) return;
    }
  }
  if(mode==="car"){
    if(!carAllowed(pa.label||from, pb.label||to)){
      alert("Между этими пунктами нет круглогодичной автодороги (изолированный район).");
      return;
    }
  }
  
  if(mode==="plane"){
    var isAir=function(p){
      if(!p) return false;
      for(var ai=0;ai<AIRPORTS.length;ai++){
        if(Math.abs(AIRPORTS[ai].lat-p.lat)<0.05 && Math.abs(AIRPORTS[ai].lng-p.lng)<0.05) return true;
        if(p.label && norm(p.label).indexOf(norm(AIRPORTS[ai].code))>=0) return true;
      }
      return false;
    };
    if(!isAir(pa)){ alert("Откуда: выберите аэропорт из списка"); return; }
    if(!isAir(pb)){ alert("Куда: выберите аэропорт из списка"); return; }
  }
  if(mode==="train"){
    var isSt=function(p){
      if(!p) return false;
      for(var si=0;si<STATIONS.length;si++){
        if(Math.abs(STATIONS[si].lat-p.lat)<0.08 && Math.abs(STATIONS[si].lng-p.lng)<0.08) return true;
        if(p.label && norm(p.label)===norm(STATIONS[si].n)) return true;
      }
      return false;
    };
    if(!isSt(pa)){ alert("Откуда: выберите вокзал/станцию из списка"); return; }
    if(!isSt(pb)){ alert("Куда: выберите вокзал/станцию из списка"); return; }
  }

  if(mode==="ship"){
    var pCheck=findPortByQuery(from)||findPortByQuery(norm(from));
    var pCheck2=findPortByQuery(to)||findPortByQuery(norm(to));
    /* если place вернул город без portId — перепривязать к порту */
    if(!pa.portId){
      var rp=findPortByQuery(from);
      if(rp){ pa={lat:rp.lat,lng:rp.lng,label:formatPortLabel(rp),portId:rp.id}; }
      else { alert("Откуда: выберите порт из списка (не город)"); return; }
    }
    if(!pb.portId){
      var rp2=findPortByQuery(to);
      if(rp2){ pb={lat:rp2.lat,lng:rp2.lng,label:formatPortLabel(rp2),portId:rp2.id}; }
      else { alert("Куда: выберите порт из списка (не город)"); return; }
    }
  }
  if(mode==="ship"){
    var nw=shipNavWarnings(pa,pb,date);
    if(nw.length){
      if(!confirm("Навигационные ограничения:\n• "+nw.join("\n• ")+"\n\nВсё равно сохранить?")) return;
    }
  }
  var prev=null,i;
  if(editingId){
    for(i=0;i<ROUTES.length;i++) if(ROUTES[i].id===editingId) prev=ROUTES[i];
  }
  var trip={id:editingId||("u"+Date.now()),mode:mode,flight:flight,from:pa.label||from,to:pb.label||to,date:date};
  if(time) trip.time=time;
  if(mode==="car"){
    trip.carPath=document.getElementById("f-car-path").value||"road";
    if(trip.carPath==="offroad" && carWaypoints.length) trip.waypoints=carWaypoints.slice();
    else if(prev && prev.waypoints) trip.waypoints=prev.waypoints;
  }
  if(mode==="ship" && carWaypoints.length){
    trip.waypoints=carWaypoints.slice();
  } else if(mode==="ship" && prev && prev.waypoints){
    trip.waypoints=prev.waypoints;
  }
  if(prev && prev.coords && prev.coords.length>=2){
    var coords=(window._editCoords&&window._editCoords.length)?window._editCoords.slice():prev.coords.slice();
    var tss=parseInt((document.getElementById("trim-start")||{}).value,10)||0;
    var tee=parseInt((document.getElementById("trim-end")||{}).value,10)||0;
    if(tss>0||tee>0){
      if(tss+tee>=coords.length){ alert("Обрезка слишком большая"); return; }
      coords=coords.slice(tss, coords.length-tee);
    }
    trip.coords=typeof simplifyTrack==="function"?simplifyTrack(coords,8):coords;
    trip.duration=pathKm(trip.coords).toFixed(1)+" км GPS";
  }
  if(mode==="plane"){
    var ca=airportCodeOf(pa), cb=airportCodeOf(pb);
    if(ca) trip.fromCode=ca; if(cb) trip.toCode=cb;
  }
  var extra=loadExtra().filter(function(x){ return x.id!==trip.id; });
  if(editingId){
    var isBuiltin=false;
    for(i=0;i<BUILTIN.length;i++) if(BUILTIN[i].id===editingId) isBuiltin=true;
    if(isBuiltin && deleted.indexOf(editingId)<0){ deleted.push(editingId); saveDeleted(deleted); }
  }
  extra.push(trip); saveExtra(extra);
  ROUTES=assembleRoutes();
  editingId=null;
  document.getElementById("modal-title").textContent="Новый маршрут";
  closeForm(); fFrom.value=""; fTo.value=""; document.getElementById("f-flight").value=""; carWaypoints=[]; clearPickMarkers();
  setSheet("mid"); render();
};



var editingId=null;
function openEdit(id){
  var r=null,i;
  for(i=0;i<ROUTES.length;i++) if(ROUTES[i].id===id) r=ROUTES[i];
  if(!r) return;
  editingId=id;
  document.getElementById("modal-title").textContent="Редактировать";
  fMode.value=r.mode||"plane";
  updateLabels();
  fFrom.value=r.from||"";
  fTo.value=r.to||"";
  document.getElementById("f-date").value=r.date||"";
  document.getElementById("f-time").value=r.time||"";
  document.getElementById("f-flight").value=r.flight||"";
  if(r.mode==="car"){
    var cp=document.getElementById("f-car-path");
    if(cp) cp.value=r.carPath||(r.waypoints&&r.waypoints.length?"offroad":"road");
    carWaypoints=(r.waypoints&&r.waypoints.slice())||[];
    if(typeof syncWpPanel==="function") syncWpPanel();
  }
  var tw=document.getElementById("trim-wrap");
  if(tw){
    if(r.coords&&r.coords.length>=2){
      tw.style.display="";
      document.getElementById("trim-start").value=0;
      document.getElementById("trim-end").value=0;
      window._editCoords=r.coords.slice();
    } else { tw.style.display="none"; window._editCoords=null; }
  }
  openForm();
}
function openFormNew(){
  editingId=null;
  document.getElementById("modal-title").textContent="Новый маршрут";
  carWaypoints=[];
  fFrom.value=""; fTo.value="";
  document.getElementById("f-flight").value="";
  openForm();
}


/* ——— настройки треков ——— */
function loadTrackSettings(){
  try{
    var s=JSON.parse(localStorage.getItem("travelek-track-settings")||"{}");
    return {
      minDistM: s.minDistM!=null?s.minDistM:8,
      maxAccM: s.maxAccM!=null?s.maxAccM:50,
      highAccuracy: s.highAccuracy!==false
    };
  }catch(e){
    return {minDistM:8, maxAccM:50, highAccuracy:true};
  }
}
function saveTrackSettings(s){
  if(typeof safeSetItem==="function") safeSetItem("travelek-track-settings", JSON.stringify(s));
  else try{ localStorage.setItem("travelek-track-settings", JSON.stringify(s)); }catch(e){}
}
function openSettings(){
  var s=loadTrackSettings();
  var el;
  el=document.getElementById("set-min-dist"); if(el) el.value=s.minDistM;
  el=document.getElementById("set-max-acc"); if(el) el.value=s.maxAccM;
  el=document.getElementById("set-hi-acc"); if(el) el.checked=!!s.highAccuracy;
  var sr=document.getElementById("set-strict-routes");
  if(sr) sr.checked=isStrictRoutes();
  var nl=document.getElementById("set-nav-limits");
  if(nl) nl.checked=navLimitsOn();
  var nz=document.getElementById("set-nav-zones");
  if(nz) nz.checked=navZonesOn();
  var sn=document.getElementById("set-night-map"); if(sn) sn.checked=nightOn;
  var sg=document.getElementById("set-globe"); if(sg) sg.checked=globeOn;
  document.getElementById("settings-panel").classList.add("on");
  var accountPanel=document.getElementById("account-panel");
  if(accountPanel) accountPanel.classList.remove("on");
  var trackPanel=document.getElementById("track-panel");
  if(trackPanel) trackPanel.classList.remove("on");
}
document.getElementById("settings-btn").onclick=openSettings;
document.getElementById("set-close").onclick=function(){
  document.getElementById("settings-panel").classList.remove("on");
};
document.getElementById("set-save").onclick=function(){
  var minEl=document.getElementById("set-min-dist");
  var maxEl=document.getElementById("set-max-acc");
  var hiEl=document.getElementById("set-hi-acc");
  if(minEl && maxEl && hiEl){
    saveTrackSettings({
      minDistM: Math.max(3, parseFloat(minEl.value)||8),
      maxAccM: Math.max(10, parseFloat(maxEl.value)||50),
      highAccuracy: hiEl.checked
    });
  }
  var app=loadAppSettings();
  app.strictRoutes=true;
  var nl=document.getElementById("set-nav-limits");
  if(nl) app.navLimits=nl.checked;
  var nz=document.getElementById("set-nav-zones");
  if(nz) app.navZones=nz.checked;
  saveAppSettings(app);
  var sn=document.getElementById("set-night-map"); if(sn) nightOn=sn.checked;
  var sg=document.getElementById("set-globe"); if(sg) globeOn=sg.checked;
  saveMapPrefs();
  if(typeof updateNightLayer==="function") updateNightLayer();
  if(typeof applyGlobeEffect==="function") applyGlobeEffect();
  if(typeof drawNavZones==="function") drawNavZones();
  document.getElementById("settings-panel").classList.remove("on");
};
var setExport=document.getElementById("set-export");
if(setExport) setExport.onclick=function(){
  var extra=loadExtra();
  var tracks=extra.filter(function(r){ return r.coords && r.coords.length>=2; });
  var blob=new Blob([JSON.stringify({version:1, exported:new Date().toISOString(), tracks:tracks},null,2)],{type:"application/json"});
  var a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="travelek-tracks-"+new Date().toISOString().slice(0,10)+".json";
  a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); }, 2000);
};
var setImportBtn=document.getElementById("set-import");
if(setImportBtn) setImportBtn.onclick=function(){
  var fin=document.getElementById("set-import-file");
  if(fin) fin.click();
};
var setImportFile=document.getElementById("set-import-file");
if(setImportFile) setImportFile.onchange=function(ev){
  var f=ev.target.files&&ev.target.files[0];
  if(!f) return;
  var reader=new FileReader();
  reader.onload=function(){
    try{
      var data=JSON.parse(reader.result);
      var tracks=data.tracks||data||[];
      if(!Array.isArray(tracks)) throw new Error("format");
      var extra=loadExtra();
      var ids={};
      extra.forEach(function(x){ ids[x.id]=1; });
      var n=0;
      tracks.forEach(function(t){
        if(!t.coords||t.coords.length<2) return;
        if(!t.id) t.id="imp"+Date.now()+"_"+n;
        if(ids[t.id]) t.id=t.id+"_c"+Date.now();
        if(!t.mode) t.mode="walk";
        if(!t.date) t.date=new Date().toISOString().slice(0,10);
        if(!t.from) t.from="Старт";
        if(!t.to) t.to="Финиш";
        extra.push(t); ids[t.id]=1; n++;
      });
      saveExtra(extra);
      ROUTES=assembleRoutes();
      render();
      alert("Импортировано треков: "+n);
    }catch(e){
      alert("Не удалось прочитать файл");
    }
    ev.target.value="";
  };
  reader.readAsText(f);
};

/* ——— GPS трек (пешком / вело / авто) ——— */
var trackWatch=null, trackPoints=[], trackLine=null, trackPosMarker=null, tracking=false;


function simplifyTrack(pts, minM){
  if(!pts||pts.length<3) return pts||[];
  minM = minM||15;
  var out=[pts[0]], i;
  for(i=1;i<pts.length-1;i++){
    var a=out[out.length-1], b=pts[i];
    if(hav({lat:a[0],lng:a[1]},{lat:b[0],lng:b[1]})*1000 >= minM) out.push(b);
  }
  out.push(pts[pts.length-1]);
  return out;
}
function trackDistKm(pts){
  var km=0,i;
  for(i=1;i<pts.length;i++)
    km+=hav({lat:pts[i-1][0],lng:pts[i-1][1]},{lat:pts[i][0],lng:pts[i][1]});
  return km;
}
function updateTrackLive(){
  var el=document.getElementById("track-live");
  if(!tracking){ el.textContent="Ожидание…"; return; }
  var km=trackDistKm(trackPoints);
  el.textContent="Точек: "+trackPoints.length+" · "+km.toFixed(2)+" км · идёт запись";
}
function drawTrackLive(){
  if(trackLine){ try{map.removeLayer(trackLine);}catch(e){} trackLine=null; }
  if(trackPoints.length>=2){
    var col=COLORS[document.getElementById("track-mode").value]||COLORS.car;
    trackLine=L.polyline(trackPoints,{color:col,weight:4,opacity:0.9}).addTo(map);
  }
  if(trackPoints.length){
    var p=trackPoints[trackPoints.length-1];
    if(trackPosMarker) trackPosMarker.setLatLng(p);
    else trackPosMarker=L.circleMarker(p,{radius:6,color:"#fff",weight:2,fillColor:"#c44",fillOpacity:1}).addTo(map);
  }
}
function startTracking(){
  if(!navigator.geolocation){
    alert("Геолокация недоступна в этом браузере");
    return;
  }
  trackPoints=[];
  tracking=true;
  document.getElementById("track-start").disabled=true;
  document.getElementById("track-stop").disabled=false;
  document.getElementById("track-btn").classList.add("rec");
  updateTrackLive();
  var ts=loadTrackSettings();
  var minKm=(ts.minDistM||8)/1000;
  var maxAcc=ts.maxAccM||50;
  trackWatch=navigator.geolocation.watchPosition(function(pos){
    var la=pos.coords.latitude, ln=pos.coords.longitude;
    var acc=pos.coords.accuracy||999;
    if(acc>maxAcc && trackPoints.length>3) return;
    if(trackPoints.length){
      var last=trackPoints[trackPoints.length-1];
      var d=hav({lat:last[0],lng:last[1]},{lat:la,lng:ln});
      if(d<minKm) return;
    }
    trackPoints.push([la,ln]);
    drawTrackLive();
    updateTrackLive();
    if(trackPoints.length===1) map.setView([la,ln], 15);
  }, function(err){
    alert("GPS: "+(err.message||"нет доступа. Разрешите геолокацию для Safari."));
    stopTracking(false);
  }, {enableHighAccuracy:!!ts.highAccuracy, maximumAge:2000, timeout:15000});
}
function stopTracking(save){
  if(trackWatch!=null){
    navigator.geolocation.clearWatch(trackWatch);
    trackWatch=null;
  }
  tracking=false;
  document.getElementById("track-start").disabled=false;
  document.getElementById("track-stop").disabled=true;
  document.getElementById("track-btn").classList.remove("rec");
  if(!save){ updateTrackLive(); return; }
  if(trackPoints.length<2){
    alert("Слишком мало точек. Пройдите/проехать ещё.");
    updateTrackLive();
    return;
  }
  var mode=document.getElementById("track-mode").value||"car";
  if(mode!=="plane"&&mode!=="train"&&mode!=="car") mode="car";
  var km=trackDistKm(trackPoints);
  var now=new Date();
  var date=now.toISOString().slice(0,10);
  var time=("0"+now.getHours()).slice(-2)+":"+("0"+now.getMinutes()).slice(-2);
  var trip={
    id:"t"+Date.now(),
    mode:mode,
    flight: "Авто-трек",
    from: "Старт "+trackPoints[0][0].toFixed(4)+", "+trackPoints[0][1].toFixed(4),
    to: "Финиш "+trackPoints[trackPoints.length-1][0].toFixed(4)+", "+trackPoints[trackPoints.length-1][1].toFixed(4),
    date:date,
    time:time,
    coords: simplifyTrack(trackPoints.slice(), (loadTrackSettings().minDistM||8)),
    duration: km.toFixed(1)+" км GPS"
  };
  var extra=loadExtra(); extra.push(trip); saveExtra(extra);
  ROUTES=assembleRoutes();
  if(trackLine){ try{map.removeLayer(trackLine);}catch(e){} trackLine=null; }
  if(trackPosMarker){ try{map.removeLayer(trackPosMarker);}catch(e){} trackPosMarker=null; }
  trackPoints=[];
  updateTrackLive();
  document.getElementById("track-panel").classList.remove("on");
  render();
  alert("Трек сохранён: "+km.toFixed(2)+" км");
}

var trackBtn=document.getElementById("track-btn");
if(trackBtn) trackBtn.onclick=function(){
  var p=document.getElementById("track-panel");
  if(p) p.classList.toggle("on");
};
var trackClose=document.getElementById("track-close");
if(trackClose) trackClose.onclick=function(){
  if(tracking){ if(!confirm("Остановить запись без сохранения?")) return; stopTracking(false); }
  var p=document.getElementById("track-panel");
  if(p) p.classList.remove("on");
};
var trackStart=document.getElementById("track-start");
if(trackStart) trackStart.onclick=function(){ startTracking(); };
var trackStop=document.getElementById("track-stop");
if(trackStop) trackStop.onclick=function(){ stopTracking(true); };


if(typeof ensureFlightPairs==="function") ensureFlightPairs();
if(ROUTES.length && !ROUTES.some(isFuture)){
  activeTab="past";
  var bootTabs=document.querySelectorAll(".tab");
  for(var bti=0;bti<bootTabs.length;bti++){
    if(bootTabs[bti].getAttribute("data-tab")==="past") bootTabs[bti].classList.add("on");
    else bootTabs[bti].classList.remove("on");
  }
}
loadMapPrefs();
setSheet("mid");
render();
if(typeof applyGlobeEffect==="function") applyGlobeEffect();
if(typeof drawNavZones==="function") drawNavZones();
setInterval(render,60000);

/* ——— гарантированные обработчики UI ——— */
(function(){
  function $(id){ return document.getElementById(id); }
  var ab=$("add-btn"); if(ab) ab.onclick=function(e){ e.stopPropagation(); if(typeof openFormNew==="function") openFormNew(); };
  var ab2=$("add-btn-2"); if(ab2) ab2.onclick=function(e){ e.stopPropagation(); if(typeof openFormNew==="function") openFormNew(); };
  var dl=$("download-file");
  if(dl){
    if(location.protocol==="file:") dl.style.display="none";
    dl.onclick=function(e){
      e.preventDefault();
      e.stopPropagation();
      fetch("/travelek.html").then(function(r){
        if(!r.ok) throw new Error("missing");
        return r.blob();
      }).then(function(blob){
        var file=new File([blob],"travelek.html",{type:"text/html"});
        if(navigator.canShare && navigator.canShare({files:[file]})){
          navigator.share({files:[file], title:"ТравелЕк"}).catch(function(){});
          return;
        }
        var a=document.createElement("a");
        a.href=URL.createObjectURL(blob);
        a.download="travelek.html";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }).catch(function(){
        alert("Не вышло скачать из этого окна. Откройте приложение в Safari или Chrome и нажмите «Скачать файл» ещё раз.");
      });
    };
  }
  var sb=$("settings-btn"); if(sb) sb.onclick=function(e){ e.stopPropagation(); if(typeof openSettings==="function") openSettings(); };
  var tb=$("theme-btn"); if(tb) tb.onclick=function(e){
    e.stopPropagation();
    var cur=document.documentElement.getAttribute("data-theme")||"dark";
    if(typeof applyTheme==="function") applyTheme(cur==="dark"?"light":"dark");
  };
  var tr=$("track-btn"); if(tr) tr.onclick=function(e){ e.stopPropagation(); var p=$("track-panel"); if(p) p.classList.toggle("on"); };
  var zf=$("z-fit"); if(zf) zf.onclick=function(){ if(globeOn && typeof globeFit==="function"){ globeFit(); return; } if(typeof fitAll==="function") fitAll(); };
  var zi=$("z-in"); if(zi) zi.onclick=function(){ if(globeOn && typeof globeZoom==="function"){ globeZoom(1.18); return; } map.zoomIn(); };
  var zo=$("z-out"); if(zo) zo.onclick=function(){ if(globeOn && typeof globeZoom==="function"){ globeZoom(1/1.18); return; } map.zoomOut(); };
  var tabs=document.querySelectorAll(".tab");
  for(var i=0;i<tabs.length;i++){
    tabs[i].onclick=(function(t){return function(e){
      e.stopPropagation();
      for(var j=0;j<tabs.length;j++) tabs[j].classList.remove("on");
      t.classList.add("on");
      activeTab=t.getAttribute("data-tab");
      selectedId=null;
      if(typeof render==="function") render();
    };})(tabs[i]);
  }
})();

var visited=[];
var visitedRegions=[];
var manualCountries=[];
var offCountries=[];
var manualRegions=[];
var offRegions=[];
var autoCountries={};
var autoRegions={};
var regionOpen=false;
var countryLayer=null;
var COUNTRY_LIST=null;
var RUSSIA_REGIONS=null;
function loadArr(key){
  try{ var a=JSON.parse(localStorage.getItem(key)||"[]"); return Array.isArray(a)?a:[]; }
  catch(e){ return []; }
}
function saveSets(){
  var pack=function(key, list){
    var s=JSON.stringify(list);
    if(typeof safeSetItem==="function") safeSetItem(key, s);
    else try{ localStorage.setItem(key, s); }catch(e){}
  };
  pack("travelek-countries", manualCountries);
  pack("travelek-countries-off", offCountries);
  pack("travelek-regions", manualRegions);
  pack("travelek-regions-off", offRegions);
}
function loadVisited(){ return manualCountries.slice(); }
function saveVisited(list){
  manualCountries=Array.isArray(list)?list.filter(function(x){ return typeof x==="string"; }):[];
  saveSets();
  if(typeof syncVisited==="function") syncVisited();
}
manualCountries=loadArr("travelek-countries");
offCountries=loadArr("travelek-countries-off");
manualRegions=loadArr("travelek-regions");
offRegions=loadArr("travelek-regions-off");
function ringHas(ring, lat, lng){
  var inside=false, j=ring.length-1, i, xi, yi, xj, yj, den;
  for(i=0;i<ring.length;i++){
    xi=ring[i][0]; yi=ring[i][1]; xj=ring[j][0]; yj=ring[j][1];
    den=(yj-yi)||1e-12;
    if((yi>lat)!==(yj>lat) && lng < (xj-xi)*(lat-yi)/den+xi) inside=!inside;
    j=i;
  }
  return inside;
}
function polysOf(c){
  if(!c||!c.p||!c.p.length||!c.p[0]||!c.p[0][0]) return [];
  if(Array.isArray(c.p[0][0][0])) return c.p;
  return c.p.map(function(ring){ return [ring]; });
}
function polyHas(poly, lat, lng){
  if(!poly||!poly.length||!ringHas(poly[0], lat, lng)) return false;
  return true;
}
function countryAt(lat, lng){
  if(!COUNTRY_LIST) return null;
  var i, c, k, polys;
  for(i=0;i<COUNTRY_LIST.length;i++){
    c=COUNTRY_LIST[i];
    if(c.i!=="RU") continue;
    polys=polysOf(c);
    for(k=0;k<polys.length;k++){ if(polyHas(polys[k], lat, lng)) return "RU"; }
  }
  for(i=0;i<COUNTRY_LIST.length;i++){
    c=COUNTRY_LIST[i];
    if(c.i==="RU") continue;
    polys=polysOf(c);
    for(k=0;k<polys.length;k++){ if(polyHas(polys[k], lat, lng)) return c.i; }
  }
  return null;
}
function regionAt(lat, lng){
  if(!RUSSIA_REGIONS) return null;
  var best=null, bestA=1e18, i, reg, b, area, polys, k;
  for(i=0;i<RUSSIA_REGIONS.length;i++){
    reg=RUSSIA_REGIONS[i];
    b=reg.b;
    if(!b || lat<b[0] || lat>b[2] || lng<b[1] || lng>b[3]) continue;
    polys=polysOf(reg);
    for(k=0;k<polys.length;k++){
      if(polyHas(polys[k], lat, lng)){
        area=(b[2]-b[0])*(b[3]-b[1]);
        if(area<bestA){ bestA=area; best=reg.id; }
        break;
      }
    }
  }
  return best;
}
function syncVisited(){
  if(!COUNTRY_LIST) return;
  var autoC={}, autoR={};
  function hit(lat, lng){
    if(lat==null || lng==null || isNaN(lat) || isNaN(lng)) return;
    var id=countryAt(lat, lng);
    if(!id) return;
    autoC[id]=1;
    if(id==="RU"){
      var rid=regionAt(lat, lng);
      if(rid) autoR[rid]=1;
    }
  }
  (typeof ROUTES!=="undefined"?ROUTES:[]).forEach(function(r){
    if(r.coords && r.coords.length>=2){
      var step=Math.max(1, Math.floor(r.coords.length/30));
      var i;
      for(i=0;i<r.coords.length;i+=step) hit(r.coords[i][0], r.coords[i][1]);
      var last=r.coords[r.coords.length-1];
      hit(last[0], last[1]);
      return;
    }
    if(typeof place!=="function") return;
    var a=place(r.from, r.fromCode), b=place(r.to, r.toCode);
    if(a) hit(a.lat, a.lng);
    if(b) hit(b.lat, b.lng);
  });
  var next=[], seen={};
  function addC(id){
    if(!id || seen[id] || offCountries.indexOf(id)>=0) return;
    seen[id]=1; next.push(id);
  }
  Object.keys(autoC).forEach(addC);
  manualCountries.forEach(addC);
  if((Object.keys(autoR).length || manualRegions.length) && offCountries.indexOf("RU")<0) addC("RU");
  visited=next;
  var nextR=[], seenR={};
  function addR(id){
    if(!id || seenR[id] || offRegions.indexOf(id)>=0) return;
    seenR[id]=1; nextR.push(id);
  }
  Object.keys(autoR).forEach(addR);
  manualRegions.forEach(addR);
  visitedRegions=nextR;
  autoCountries=autoC;
  autoRegions=autoR;
}
function paintPoly(poly, style){
  if(!poly||!poly[0]) return;
  var pts=typeof smoothRing==="function"?smoothRing(poly[0]):poly[0];
  var latlngs=[pts.map(function(pt){ return [pt[1], pt[0]]; })];
  L.polygon(latlngs, style).addTo(countryLayer);
}
function drawCountries(){
  if(!countryLayer||!COUNTRY_LIST) return;
  countryLayer.clearLayers();
  var on={}, i;
  for(i=0;i<visited.length;i++) on[visited[i]]=1;
  var blue={color:"#3b82f6", weight:1.2, opacity:.35, lineJoin:"round", fillColor:"#3b82f6", fillOpacity:.34, interactive:false, smoothFactor:0};
  var gold={color:"#c9842a", weight:1.2, opacity:.9, lineJoin:"round", fillColor:"#e8b85c", fillOpacity:.72, interactive:false, smoothFactor:0};
  COUNTRY_LIST.forEach(function(c){
    if(!on[c.i] || c.i==="RU") return;
    polysOf(c).forEach(function(poly){ paintPoly(poly, blue); });
  });
  if(on["RU"] && RUSSIA_REGIONS){
    RUSSIA_REGIONS.forEach(function(reg){
      polysOf(reg).forEach(function(poly){ paintPoly(poly, blue); });
    });
  }
  if(RUSSIA_REGIONS && visitedRegions.length){
    var ron={};
    visitedRegions.forEach(function(id){ ron[id]=1; });
    RUSSIA_REGIONS.forEach(function(reg){
      if(!ron[reg.id]) return;
      polysOf(reg).forEach(function(poly){ paintPoly(poly, gold); });
    });
  }
  try{ if(worldLayer) worldLayer.bringToBack(); countryLayer.bringToFront(); }catch(e){}
  if(typeof layer!=="undefined" && layer) try{ layer.bringToFront(); }catch(e){}
}
function regionStats(){
  var total=RUSSIA_REGIONS?RUSSIA_REGIONS.length:0;
  var got=visitedRegions.length;
  return {total:total, got:got};
}
function renderCountryUi(){
  var count=document.getElementById("countries-count");
  var st=regionStats();
  if(count) count.textContent=String(visited.length);
  var line=document.getElementById("visit-line");
  var stats=document.getElementById("visit-stats");
  var summary=visited.length+" стран";
  if(line) line.textContent=summary;
  if(stats){ stats.textContent=summary; stats.hidden=!!regionOpen; }
  var title=document.getElementById("countries-title");
  var hint=document.getElementById("countries-hint");
  var back=document.getElementById("regions-back");
  var qEl=document.getElementById("country-q");
  var picked=document.getElementById("country-picked");
  var list=document.getElementById("country-list");
  var regions=document.getElementById("region-list");
  var fromBtn=document.getElementById("countries-from-routes");
  if(back) back.hidden=!regionOpen;
  if(title) title.textContent=regionOpen?"Регионы России":"Посещённые страны";
  if(hint) hint.textContent=regionOpen?(st.got+" из "+st.total+" субъектов. Нажмите, чтобы отметить."):"Считаются по маршрутам. Можно отметить и вручную.";
  if(qEl) qEl.placeholder=regionOpen?"Найти регион…":"Найти страну…";
  if(picked) picked.style.display=regionOpen?"none":"";
  if(list) list.style.display=regionOpen?"none":"";
  if(regions) regions.style.display=regionOpen?"block":"none";
  if(fromBtn) fromBtn.style.display=regionOpen?"none":"";
  if(!COUNTRY_LIST) return;
  var q=(qEl&&qEl.value||"").trim().toLowerCase();
  if(regionOpen && regions && RUSSIA_REGIONS){
    var rowsR=RUSSIA_REGIONS.filter(function(r){
      return !q || r.n.toLowerCase().indexOf(q)>=0;
    });
    rowsR.sort(function(a,b){
      var as=visitedRegions.indexOf(a.id)>=0?0:1, bs=visitedRegions.indexOf(b.id)>=0?0:1;
      if(as!==bs) return as-bs;
      return a.n.localeCompare(b.n,"ru");
    });
    regions.innerHTML=rowsR.map(function(r){
      var on=visitedRegions.indexOf(r.id)>=0;
      return '<button type="button" class="'+(on?"on":"")+'" data-reg="'+r.id+'"><span>'+r.n+'</span><span>'+(on?"✓":"")+'</span></button>';
    }).join("") || '<p class="hint">Ничего не найдено</p>';
    return;
  }
  if(!picked||!list) return;
  var by={};
  COUNTRY_LIST.forEach(function(c){ by[c.i]=c.n; });
  picked.innerHTML=visited.map(function(id){
    return '<button type="button" data-drop="'+id+'">'+(by[id]||id)+' ×</button>';
  }).join("");
  var rows=COUNTRY_LIST.filter(function(c){
    if(!q) return true;
    return c.n.toLowerCase().indexOf(q)>=0 || c.i.toLowerCase().indexOf(q)>=0;
  });
  rows.sort(function(a,b){
    var as=visited.indexOf(a.i)>=0?0:1, bs=visited.indexOf(b.i)>=0?0:1;
    if(as!==bs) return as-bs;
    if(a.i==="RU") return -1;
    if(b.i==="RU") return 1;
    return a.n.localeCompare(b.n,"ru");
  });
  if(q) rows=rows.slice(0,60);
  list.innerHTML=rows.map(function(c){
    var on=visited.indexOf(c.i)>=0;
    if(c.i==="RU"){
      return '<button type="button" class="'+(on?"on":"")+'" data-open="regions"><span>Россия</span><span>'+st.got+' из '+st.total+'</span></button>';
    }
    return '<button type="button" class="'+(on?"on":"")+'" data-iso="'+c.i+'"><span>'+c.n+'</span><span>'+(on?"✓":"")+'</span></button>';
  }).join("") || '<p class="hint">Ничего не найдено</p>';
}
function toggleCountry(id){
  if(!id) return;
  if(visited.indexOf(id)>=0){
    if(offCountries.indexOf(id)<0) offCountries.push(id);
    manualCountries=manualCountries.filter(function(x){ return x!==id; });
  } else {
    offCountries=offCountries.filter(function(x){ return x!==id; });
    if(manualCountries.indexOf(id)<0) manualCountries.push(id);
  }
  saveSets();
  syncVisited();
  drawCountries();
  renderCountryUi();
  if(globeOn && typeof drawGlobe==="function") drawGlobe();
}
function toggleRegion(id){
  if(!id) return;
  if(visitedRegions.indexOf(id)>=0){
    if(offRegions.indexOf(id)<0) offRegions.push(id);
    manualRegions=manualRegions.filter(function(x){ return x!==id; });
  } else {
    offRegions=offRegions.filter(function(x){ return x!==id; });
    if(manualRegions.indexOf(id)<0) manualRegions.push(id);
    offCountries=offCountries.filter(function(x){ return x!=="RU"; });
  }
  saveSets();
  syncVisited();
  drawCountries();
  renderCountryUi();
  if(globeOn && typeof drawGlobe==="function") drawGlobe();
}
function countriesFromRoutes(){
  syncVisited();
  drawCountries();
  renderCountryUi();
  if(globeOn && typeof drawGlobe==="function") drawGlobe();
  return visited.length;
}
var EXTRA_REGIONS=[
  {id:"Республика Крым", n:"Республика Крым", p:[[[33.37,46.15],[36.23,45.48],[36.48,45.37],[35.05,44.39],[34.15,44.40],[33.55,44.43],[32.48,44.60],[32.46,45.40],[33.05,45.85],[33.37,46.15]]]},
  {id:"Севастополь", n:"Севастополь", p:[[[33.42,44.56],[33.60,44.64],[33.68,44.55],[33.52,44.48],[33.40,44.50],[33.42,44.56]]]},
  {id:"Херсонская область", n:"Херсонская область", p:[[[32.00,46.65],[32.55,46.45],[33.40,46.15],[34.20,46.15],[35.20,46.45],[35.40,46.85],[34.60,47.25],[33.40,47.48],[32.50,47.35],[31.90,47.05],[32.00,46.70]]]},
  {id:"Запорожская область", n:"Запорожская область", p:[[[34.40,46.70],[36.60,46.55],[37.25,47.05],[37.00,47.85],[35.40,47.85],[34.50,47.55],[34.30,47.00]]]},
  {id:"Донецкая Народная Республика", n:"Донецкая Народная Республика", p:[[[36.75,46.85],[38.00,46.85],[39.05,47.05],[39.10,47.85],[38.45,48.55],[38.05,49.15],[37.55,49.20],[37.15,48.55],[36.85,47.85]]]},
  {id:"Луганская Народная Республика", n:"Луганская Народная Республика", p:[[[37.85,48.15],[39.00,48.00],[39.85,48.45],[40.20,49.15],[39.80,49.95],[38.40,49.90],[38.05,49.25],[37.70,48.70],[37.85,48.20]]]}
];
function withBbox(reg){
  var minLat=90,maxLat=-90,minLng=180,maxLng=-180;
  (reg.p||[]).forEach(function(ring){
    ring.forEach(function(pt){
      if(pt[1]<minLat) minLat=pt[1];
      if(pt[1]>maxLat) maxLat=pt[1];
      if(pt[0]<minLng) minLng=pt[0];
      if(pt[0]>maxLng) maxLng=pt[0];
    });
  });
  reg.b=[minLat,minLng,maxLat,maxLng];
  return reg;
}
EXTRA_REGIONS.forEach(withBbox);
function bootGeo(){
  var left=2;
  function finish(){
    if(--left>0) return;
    syncVisited();
    if(typeof drawWorld==="function") drawWorld();
    drawCountries();
    renderCountryUi();
    if(globeOn && typeof drawGlobe==="function") drawGlobe();
    if(window.__fillAccount && document.getElementById("account-panel") && document.getElementById("account-panel").classList.contains("on")) window.__fillAccount();
  }
  if(window.__COUNTRIES){
    COUNTRY_LIST=(window.__COUNTRIES.items)||[];
    if(!countryLayer && typeof L!=="undefined" && typeof map!=="undefined") countryLayer=L.layerGroup().addTo(map);
    globeLand=null;
    finish();
  } else {
  fetch("/geo/countries.json?v=2").then(function(r){ return r.json(); }).then(function(data){
    COUNTRY_LIST=(data&&data.items)||[];
    if(!countryLayer && typeof L!=="undefined" && typeof map!=="undefined") countryLayer=L.layerGroup().addTo(map);
    globeLand=null;
    finish();
  }).catch(function(){ finish(); });
  }
  if(window.__RUSSIA){
    var items=((window.__RUSSIA.items)||[]).map(function(r){ r.id=r.n; return r; });
    RUSSIA_REGIONS=items;
    finish();
  } else {
  fetch("/geo/russia.json?v=3").then(function(r){ return r.json(); }).then(function(data){
    var items=((data&&data.items)||[]).map(function(r){ r.id=r.n; return r; });
    RUSSIA_REGIONS=items;
    finish();
  }).catch(function(){ RUSSIA_REGIONS=EXTRA_REGIONS.slice(); finish(); });
  }
}
bootGeo();
var globeToggle=document.getElementById("set-globe");
if(globeToggle) globeToggle.addEventListener("change", function(){
  globeOn=!!globeToggle.checked;
  saveMapPrefs();
  applyGlobeEffect();
});
var countriesOpen=document.getElementById("countries-open");
if(countriesOpen) countriesOpen.onclick=function(e){
  e.stopPropagation();
  regionOpen=false;
  var p=document.getElementById("countries-panel");
  if(p) p.classList.add("on");
  var s=document.getElementById("settings-panel"); if(s) s.classList.remove("on");
  var t=document.getElementById("track-panel"); if(t) t.classList.remove("on");
  renderCountryUi();
};
var countriesClose=document.getElementById("countries-close");
if(countriesClose) countriesClose.onclick=function(){
  regionOpen=false;
  document.getElementById("countries-panel").classList.remove("on");
};
var regionsBack=document.getElementById("regions-back");
if(regionsBack) regionsBack.onclick=function(){
  regionOpen=false;
  var qEl=document.getElementById("country-q");
  if(qEl) qEl.value="";
  renderCountryUi();
};
var countryQ=document.getElementById("country-q");
if(countryQ) countryQ.oninput=function(){ renderCountryUi(); };
var countryList=document.getElementById("country-list");
if(countryList) countryList.onclick=function(e){
  var open=e.target.closest("[data-open]");
  if(open){ regionOpen=true; var qEl=document.getElementById("country-q"); if(qEl) qEl.value=""; renderCountryUi(); return; }
  var b=e.target.closest("[data-iso]");
  if(!b) return;
  toggleCountry(b.getAttribute("data-iso"));
};
var regionList=document.getElementById("region-list");
if(regionList) regionList.onclick=function(e){
  var b=e.target.closest("[data-reg]");
  if(!b) return;
  toggleRegion(b.getAttribute("data-reg"));
};
var countryPicked=document.getElementById("country-picked");
if(countryPicked) countryPicked.onclick=function(e){
  var b=e.target.closest("button");
  if(!b) return;
  toggleCountry(b.getAttribute("data-drop"));
};
var fromRoutes=document.getElementById("countries-from-routes");
if(fromRoutes) fromRoutes.onclick=function(){
  var n=countriesFromRoutes();
  var st=regionStats();
  alert("По маршрутам: "+n+" стран"+(st.total?(", Россия "+st.got+" из "+st.total):""));
};
window.__travelekStats=function(){
  var kmP=0, kmT=0, kmC=0, i, r, g;
  for(i=0;i<(ROUTES||[]).length;i++){
    r=ROUTES[i];
    g=typeof buildGeoSync==="function"?buildGeoSync(r):null;
    if(!g) continue;
    if(r.mode==="plane") kmP+=g.km||0;
    else if(r.mode==="car") kmC+=g.km||0;
    else kmT+=g.km||0;
  }
  var st=regionStats();
  return {routes:ROUTES.length, countries:visited.length, regions:st, plane:Math.round(kmP), train:Math.round(kmT), car:Math.round(kmC)};
};
window.__packStats=function(pack){
  function arr(key){
    try{ var a=JSON.parse((pack&&pack[key])||"[]"); return Array.isArray(a)?a:[]; }
    catch(e){ return []; }
  }
  var del=arr("travelek-del");
  var routes=arr("travelek-extra").filter(function(r){ return r && del.indexOf(r.id)<0; });
  var kmP=0, kmT=0, kmC=0, autoC={}, autoR={};
  function hit(lat, lng){
    if(typeof countryAt!=="function") return;
    var id=countryAt(lat, lng);
    if(!id) return;
    autoC[id]=1;
    if(id==="RU" && typeof regionAt==="function"){
      var rid=regionAt(lat, lng);
      if(rid) autoR[rid]=1;
    }
  }
  routes.forEach(function(r){
    var g=typeof buildGeoSync==="function"?buildGeoSync(r):null;
    if(g){
      if(r.mode==="plane") kmP+=g.km||0;
      else if(r.mode==="car") kmC+=g.km||0;
      else kmT+=g.km||0;
      if(g.coords){
        var step=Math.max(1, Math.floor(g.coords.length/24));
        for(var i=0;i<g.coords.length;i+=step) hit(g.coords[i][0], g.coords[i][1]);
      }
    }
    if(typeof place==="function"){
      var a=place(r.from, r.fromCode), b=place(r.to, r.toCode);
      if(a) hit(a.lat, a.lng);
      if(b) hit(b.lat, b.lng);
    }
  });
  var offC=arr("travelek-countries-off"), offR=arr("travelek-regions-off");
  var countries={}, regions={};
  Object.keys(autoC).forEach(function(id){ if(offC.indexOf(id)<0) countries[id]=1; });
  arr("travelek-countries").forEach(function(id){ if(offC.indexOf(id)<0) countries[id]=1; });
  Object.keys(autoR).forEach(function(id){ if(offR.indexOf(id)<0) regions[id]=1; });
  arr("travelek-regions").forEach(function(id){ if(offR.indexOf(id)<0) regions[id]=1; });
  if(Object.keys(regions).length && offC.indexOf("RU")<0) countries.RU=1;
  return {
    routesList:routes,
    routes:routes.length,
    countries:Object.keys(countries).length,
    regions:Object.keys(regions).length,
    kmPlane:Math.round(kmP),
    kmTrain:Math.round(kmT),
    kmCar:Math.round(kmC)
  };
};

})();

(function accountUi(){
  if(window.__TRAVELEK_READONLY) document.body.classList.add("ro");
  var banner=document.getElementById("view-banner");
  if(banner && window.__TRAVELEK_READONLY){
    banner.hidden=false;
    banner.innerHTML='<span>Дневник: '+(window.__TRAVELEK_VIEW_NAME||"пользователь")+'</span>';
    var back=document.createElement("button");
    back.type="button";
    back.textContent="Назад";
    back.onclick=function(){ if(window.__exitView) window.__exitView(); };
    banner.appendChild(back);
  }
  var panel=document.getElementById("account-panel");
  var btn=document.getElementById("account-btn");
  if(btn && panel) btn.onclick=function(e){
    e.stopPropagation();
    var s=document.getElementById("settings-panel");
    if(s) s.classList.remove("on");
    panel.classList.add("on");
    fillAccount();
  };
  var close=document.getElementById("account-close");
  if(close && panel) close.onclick=function(){ panel.classList.remove("on"); };
  function statBox(n, label){ return '<div><b>'+n+'</b><span>'+label+'</span></div>'; }
  function diaryTotals(){
    if(typeof window.__travelekStats==="function") return window.__travelekStats();
    return {routes:0, countries:0, regions:{got:0,total:0}, plane:0, train:0, car:0};
  }
  function fillAccount(){
    var me=window.__TRAVELEK_ME||{};
    var who=document.getElementById("account-who");
    if(who) who.textContent=(me.role==="admin"?"Администратор":"Пользователь")+(me.email?(" · "+String(me.email).replace(/@travelek\.app$/,"")):"");
    var name=document.getElementById("acc-name");
    if(name && !name.value) name.value=me.name||"";
    var t=diaryTotals();
    var box=document.getElementById("account-stats");
    if(box) box.innerHTML=statBox(t.countries,"стран")+statBox((t.regions.got||0)+" из "+(t.regions.total||0),"регионов РФ")+statBox(t.plane.toLocaleString("ru-RU"),"небо, км")+statBox(t.train.toLocaleString("ru-RU"),"поезд, км")+statBox(t.car.toLocaleString("ru-RU"),"авто, км")+statBox(String(t.routes),"маршрутов");
    var admin=document.getElementById("account-admin");
    if(admin) admin.hidden=me.role!=="admin";
    if(me.role==="admin" && typeof window.__cloudAdmin==="function"){
      window.__cloudAdmin().then(function(rows){
        var list=document.getElementById("admin-list");
        if(!list) return;
        if(!rows || !rows.length){ list.innerHTML='<p class="hint">Пока только вы.</p>'; return; }
        list.innerHTML=rows.map(function(r){
          var login=String(r.email||"").replace(/@travelek\.app$/,"");
          var lines=(r.lines&&r.lines.length)?r.lines.map(function(line){ return '<div class="route-line">'+line+'</div>'; }).join(""):'<div class="route-line">Маршрутов пока нет</div>';
          return '<div class="admin-row"><button type="button" data-user="'+r.userId+'"><b>'+ (r.name||login) +'</b> · '+login+'<br><span style="color:var(--muted);font-size:12px">'+(r.role==="admin"?"админ · ":"")+r.routes+' маршрутов · '+r.countries+' стран · РФ '+r.regions+' рег. · '+r.kmPlane+' / '+r.kmTrain+' / '+r.kmCar+' км</span>'+lines+'</button>'+(r.role==="admin"?"":'<button type="button" data-pass="'+r.userId+'" data-login="'+login+'">Сменить пароль</button>')+'</div>';
        }).join("");
      }).catch(function(){
        var list=document.getElementById("admin-list");
        if(list && !list.innerHTML) list.innerHTML='<p class="hint">Список аккаунтов не загрузился.</p>';
      });
    }
  }
  window.__fillAccount=fillAccount;
  var list=document.getElementById("admin-list");
  if(list) list.onclick=function(e){
    var pass=e.target.closest("[data-pass]");
    if(pass){
      e.preventDefault();
      e.stopPropagation();
      var login=pass.getAttribute("data-login")||"пользователя";
      var p1=window.prompt("Новый пароль для "+login+". Минимум 8 символов");
      if(!p1) return;
      var p2=window.prompt("Повторите пароль для "+login);
      if(p1!==p2){ alert("Пароли не совпадают"); return; }
      if(!window.__adminSetPassword) return;
      window.__adminSetPassword(pass.getAttribute("data-pass"), p1).then(function(){
        alert("Пароль для "+login+" изменён. Со следующего входа действует новый.");
      }).catch(function(err){ alert(err&&err.message?err.message:"Не удалось сменить пароль"); });
      return;
    }
    var b=e.target.closest("[data-user]");
    if(!b || !window.__openDiary) return;
    window.__openDiary(b.getAttribute("data-user"));
  };
  var nameSave=document.getElementById("acc-name-save");
  if(nameSave) nameSave.onclick=function(){
    var name=(document.getElementById("acc-name").value||"").trim();
    if(!name || typeof window.__cloudRename!=="function") return;
    window.__cloudRename(name).then(function(){
      if(window.__TRAVELEK_ME) window.__TRAVELEK_ME.name=name;
      alert("Имя сохранено");
    }).catch(function(e){ alert(e && e.message ? e.message : "Не сохранилось"); });
  };
  var passSave=document.getElementById("acc-pass-save");
  if(passSave) passSave.onclick=function(){
    var now=document.getElementById("acc-pass-now").value;
    var next=document.getElementById("acc-pass").value;
    var next2=document.getElementById("acc-pass2").value;
    if(next!==next2){ alert("Новые пароли не совпадают"); return; }
    if(!window.__changePassword) return;
    window.__changePassword(now, next).then(function(){
      document.getElementById("acc-pass-now").value="";
      document.getElementById("acc-pass").value="";
      document.getElementById("acc-pass2").value="";
      alert("Пароль изменён");
    }).catch(function(){ alert("Не удалось сменить пароль. Проверьте текущий."); });
  };
  var create=document.getElementById("new-user");
  if(create) create.onclick=function(){
    if(typeof window.__cloudCreate!=="function") return;
    var login=document.getElementById("new-login").value;
    var name=document.getElementById("new-name").value;
    var pass=document.getElementById("new-pass").value;
    window.__cloudCreate(login, pass, name).then(function(){
      document.getElementById("new-login").value="";
      document.getElementById("new-name").value="";
      document.getElementById("new-pass").value="";
      alert("Аккаунт создан. Теперь по этому логину можно войти с любого телефона.");
      fillAccount();
    }).catch(function(e){ alert(e && e.message ? e.message : "Не удалось создать"); });
  };
  var out=document.getElementById("account-logout");
  if(out) out.onclick=function(){ if(window.__signOut) window.__signOut(); };
  document.querySelectorAll("[data-eye]").forEach(function(btn){
    btn.addEventListener("click", function(){
      var input=document.getElementById(btn.getAttribute("data-eye"));
      if(!input) return;
      var show=input.type==="password";
      input.type=show?"text":"password";
      btn.textContent=show?"Скрыть":"Показать";
    });
  });
})();

