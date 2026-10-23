
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
  {code:"TOX",n:"Тобольск",lat:58.1360,lng:68.2330},
  /* Worldwide scheduled-service airports from OurAirports (public-domain data). */
  {code:"UTK",n:"Utirik Island — Utirik Airport",lat:11.222219,lng:169.851429},
  {code:"NUP",n:"Nunapitchuk Airport",lat:60.905591,lng:-162.440454},
  {code:"BYW",n:"Blakely Island Airport",lat:48.579162,lng:-122.823844},
  {code:"ATT",n:"Atmautluak Airport",lat:60.866699,lng:-162.272996},
  {code:"PDB",n:"Pedro Bay Airport",lat:59.796925,lng:-154.129994},
  {code:"KOZ",n:"Ouzinkie Airport",lat:57.942094,lng:-152.464314},
  {code:"TNK",n:"Tununak Airport",lat:60.569638,lng:-165.246649},
  {code:"MNT",n:"Minto Al Wright Airport",lat:65.147991,lng:-149.368658},
  {code:"WKK",n:"Aleknagik / New Airport",lat:59.2826004028,lng:-158.617996216},
  {code:"CWS",n:"Center Island Airport",lat:48.490046,lng:-122.831612},
  {code:"TEK",n:"Tatitlek Airport",lat:60.871449,lng:-146.690297},
  {code:"SSW",n:"Friday Harbor — Stuart Island Airpark",lat:48.673379,lng:-123.175439},
  {code:"WDN",n:"Eastsound — Waldron Airstrip",lat:48.71141,lng:-123.018208},
  {code:"CHU",n:"Chuathbaluk Airport",lat:61.579102,lng:-159.216003},
  {code:"WTL",n:"Tuntutuliak Airport",lat:60.351243,lng:-162.654476},
  {code:"TWA",n:"Twin Hills Airport",lat:59.074713,lng:-160.274992},
  {code:"KCQ",n:"Chignik Lake Airport",lat:56.255001,lng:-158.774994},
  {code:"BBQ",n:"Codrington — Burton-Nibbs International Airport",lat:17.621194,lng:-61.798347},
  {code:"AKS",n:"Auki — Gwaunaru'u Airport",lat:-8.70257,lng:160.682007},
  {code:"BNY",n:"Bellona/Anua Airport",lat:-11.302222222200001,lng:159.798333333},
  {code:"CHY",n:"Choiseul Bay Airport",lat:-6.711944,lng:156.396111},
  {code:"BAS",n:"Ballalae Airport",lat:-6.990745,lng:155.886656},
  {code:"FRE",n:"Fera Island — Fera/Maringe Airport",lat:-8.1075,lng:159.576996},
  {code:"HIR",n:"Honiara International Airport",lat:-9.428,lng:160.054993},
  {code:"IRA",n:"Kirakira — Ngorangora Airport",lat:-10.449700355500001,lng:161.897994995},
  {code:"SCZ",n:"Santa Cruz/Graciosa Bay/Luova Airport",lat:-10.7203,lng:165.794998},
  {code:"MUA",n:"Munda Airport",lat:-8.32797,lng:157.263},
  {code:"GZO",n:"Gizo — Nusatupe Airport",lat:-8.09778022766,lng:156.863998413},
  {code:"MNY",n:"Stirling Island — Mono Airport",lat:-7.41694,lng:155.565002},
  {code:"RNL",n:"Rennell Island — Rennell/Tingoa Airport",lat:-11.55,lng:160.062778},
  {code:"NNB",n:"Santa Ana Island — Santa Ana Airport",lat:-10.847994,lng:162.454108},
  {code:"RUS",n:"Marau Airport",lat:-9.86167,lng:160.824997},
  {code:"VAO",n:"Suavanao Airport",lat:-7.58556,lng:158.731003},
  {code:"XYA",n:"Yandina Airport",lat:-9.092816,lng:159.21841},
  {code:"KGE",n:"Kagau Island — Kaghau Airport",lat:-7.3305,lng:157.585},
  {code:"MHM",n:"Manaoba Airport",lat:-8.325008,lng:160.80051},
  {code:"GTA",n:"Gatokae Aerodrome",lat:-8.738358,lng:158.202836},
  {code:"RBV",n:"Ramata Airport",lat:-8.168060302734375,lng:157.64300537109375},
  {code:"INU",n:"Yaren — Nauru International Airport",lat:-0.547893,lng:166.919525},
  {code:"GYZ",n:"Cosmo Newbery — Gruyere Airport",lat:-28.034548,lng:123.81506},
  {code:"AXF",n:"Alxa Left Banner Bayanhot Airport",lat:38.748317,lng:105.58416},
  {code:"VMU",n:"Baimuru Airport",lat:-7.496955,lng:144.821756},
  {code:"BUA",n:"Buka Island — Buka Airport",lat:-5.422299,lng:154.672698},
  {code:"OPU",n:"Balimo Airport",lat:-8.05000019073,lng:142.932998657},
  {code:"CMU",n:"Kundiawa — Chimbu Airport",lat:-6.024290084838867,lng:144.9709930419922},
  {code:"DAU",n:"Daru Airport",lat:-9.08676,lng:143.207993},
  {code:"BOT",n:"Bosset Airport",lat:-7.237257,lng:141.1063222},
  {code:"GKA",n:"Goronka — Goroka Airport",lat:-6.081689834590001,lng:145.391998291},
  {code:"GUR",n:"Gurney Airport",lat:-10.3114995956,lng:150.333999634},
  {code:"PNP",n:"Popondetta — Girua Airport",lat:-8.80453968048,lng:148.309005737},
  {code:"GMI",n:"Gasmata Island Airport",lat:-6.27111005783,lng:150.330993652},
  {code:"HKN",n:"Kimbe — Hoskins Airport",lat:-5.463846,lng:150.407327},
  {code:"KIE",n:"Kieta — Aropa Airport",lat:-6.305727,lng:155.728249},
  {code:"LSA",n:"Losuia Airport",lat:-8.505820274353027,lng:151.08099365234375},
  {code:"UNG",n:"Kiunga Airport",lat:-6.1257100105285645,lng:141.28199768066406},
  {code:"KRI",n:"Kikori Airport",lat:-7.42438,lng:144.250076},
  {code:"KMA",n:"Kerema Airport",lat:-7.96361017227,lng:145.770996094},
  {code:"KVG",n:"Kavieng Airport",lat:-2.57940006256,lng:150.807998657},
  {code:"LNV",n:"Londolovit Airport",lat:-3.04361009598,lng:152.628997803},
  {code:"MAG",n:"Madang Airport",lat:-5.20707988739,lng:145.789001465},
  {code:"HGU",n:"Mount Hagen Kagamuga Airport",lat:-5.828212,lng:144.299412},
  {code:"MDU",n:"Mendi Airport",lat:-6.14774,lng:143.656998},
  {code:"MAS",n:"Manus Island — Momote Airport",lat:-2.06189,lng:147.423996},
  {code:"MXH",n:"Moro Airport",lat:-6.36332988739,lng:143.238006592},
  {code:"MIS",n:"Misima Island Airport",lat:-10.689200401299999,lng:152.837997437},
  {code:"LAE",n:"Lae — Nadzab Tomodachi International Airport",lat:-6.567995,lng:146.726544},
  {code:"OBX",n:"Obo Airport",lat:-7.590622421369999,lng:141.324262619},
  {code:"POM",n:"Port Moresby Jacksons International Airport",lat:-9.443380355834961,lng:147.22000122070312},
  {code:"TDS",n:"Sasereme Airport",lat:-7.6217,lng:142.868},
  {code:"TIZ",n:"Tari Airport",lat:-5.845,lng:142.947998},
  {code:"TBG",n:"Tabubil Airport",lat:-5.280471,lng:141.227576},
  {code:"TPI",n:"Tapini Airport",lat:-8.35666666667,lng:146.989166667},
  {code:"RAB",n:"Kokopo — Tokua Airport",lat:-4.34046,lng:152.380005},
  {code:"TFI",n:"Tufi Airport",lat:-9.07595443726,lng:149.319839478},
  {code:"VAI",n:"Vanimo Airport",lat:-2.6926,lng:141.3028},
  {code:"WBM",n:"Wapenamanda Airport",lat:-5.635293,lng:143.892231},
  {code:"WWK",n:"Wewak International Airport",lat:-3.58383011818,lng:143.669006348},
  {code:"JEG",n:"Aasiaat Airport",lat:68.721802,lng:-52.784698},
  {code:"CNP",n:"Neerlerit Inaat Airport",lat:70.743103,lng:-22.650499},
  {code:"GOH",n:"Nuuk International Airport",lat:64.191066,lng:-51.67914},
  {code:"JAV",n:"Ilulissat Airport",lat:69.243202,lng:-51.057098},
  {code:"KUS",n:"Kulusuk Airport",lat:65.573601,lng:-37.1236},
  {code:"JSU",n:"Maniitsoq Airport",lat:65.412498,lng:-52.9394},
  {code:"JFR",n:"Paamiut Airport",lat:62.014736,lng:-49.670937},
  {code:"NAQ",n:"Qaanaaq Airport",lat:77.488602,lng:-69.388702},
  {code:"SFJ",n:"Kangerlussuaq International Airport",lat:67.010446,lng:-50.715294},
  {code:"JHS",n:"Sisimiut Airport",lat:66.951302,lng:-53.729301},
  {code:"JUV",n:"Upernavik Airport",lat:72.790199,lng:-56.1306},
  {code:"JQA",n:"Uummannaq — Qaarsut Airport",lat:70.7342,lng:-52.696201},
  {code:"AEY",n:"Akureyri International Airport",lat:65.656573,lng:-18.072018},
  {code:"EGS",n:"Egilsstaðir Airport",lat:65.2833023071289,lng:-14.401399612426758},
  {code:"GRY",n:"Grímsey/Sandvík — Grímsey Airport",lat:66.5458,lng:-18.0173},
  {code:"HFN",n:"Höfn — Hornafjörður Airport",lat:64.295601,lng:-15.2272},
  {code:"IFJ",n:"Ísafjörður Airport",lat:66.058098,lng:-23.1353},
  {code:"KEF",n:"Reykjavík — Keflavik International Airport",lat:63.985001,lng:-22.6056},
  {code:"RKV",n:"Reykjavík Domestic Airport",lat:64.128732,lng:-21.93759},
  {code:"THO",n:"Þórshöfn Airport",lat:66.218459,lng:-15.334739},
  {code:"VPN",n:"Vopnafjörður Airport",lat:65.720596,lng:-14.8506},
  {code:"PRN",n:"Prishtina — Priština Adem Jashari International Airport",lat:42.5728,lng:21.035801},
  {code:"CJZ",n:"Cajazeiras — Pedro Vieira Moreira Airport",lat:-6.8827,lng:-38.61583},
  {code:"VDC",n:"Vitória da Conquista — Glauber de Andrade Rocha Airport",lat:-14.907885,lng:-40.914804},
  {code:"BGK",n:"Big Creek Airport",lat:16.519369,lng:-88.407913},
  {code:"CUK",n:"Caye Caulker Airport",lat:17.735015,lng:-88.032862},
  {code:"CYC",n:"Caye Chapel Airport",lat:17.683792,lng:-88.044985},
  {code:"CZH",n:"Corozal Airport",lat:18.3822,lng:-88.411903},
  {code:"DGA",n:"Dangriga Airport",lat:16.98251,lng:-88.230988},
  {code:"INB",n:"Independence Airport",lat:16.53456,lng:-88.441615},
  {code:"ORZ",n:"Orange Walk — H.E Alfredo Martinez (Tower Hill) Airstrip",lat:18.046767,lng:-88.583858},
  {code:"PND",n:"Punta Gorda Airport",lat:16.1024,lng:-88.808296},
  {code:"SPR",n:"San Pedro — John Greif II Airport",lat:17.9139,lng:-87.9711},
  {code:"TZA",n:"Belize City — Sir Barry Bowen Municipal Airport",lat:17.517239,lng:-88.195775},
  {code:"YZZ",n:"Trail Regional Airport",lat:49.055599,lng:-117.609001},
  {code:"YAA",n:"Anahim Lake Airport",lat:52.451501,lng:-125.303776},
  {code:"XQU",n:"Qualicum Beach Airport",lat:49.337456,lng:-124.393086},
  {code:"YMP",n:"Port McNeill Airport",lat:50.57348,lng:-127.027702},
  {code:"ZEL",n:"Bella Bella (Campbell Island) Airport",lat:52.185001,lng:-128.156994},
  {code:"YWM",n:"Williams Harbour Airport",lat:52.567377,lng:-55.784883},
  {code:"YSO",n:"Postville Airport",lat:54.9105,lng:-59.78507},
  {code:"YBI",n:"Black Tickle Airport",lat:53.469836,lng:-55.787501},
  {code:"YHG",n:"Charlottetown Airport",lat:52.765774,lng:-56.11237},
  {code:"YFX",n:"St. Lewis (Fox Harbour) Airport",lat:52.372799,lng:-55.673901},
  {code:"YHA",n:"Port Hope Simpson Airport",lat:52.528099060058594,lng:-56.28609848022461},
  {code:"YRG",n:"Rigolet Airport",lat:54.1796989440918,lng:-58.45750045776367},
  {code:"YLE",n:"Whatì Airport",lat:63.131699,lng:-117.246002},
  {code:"SUR",n:"Summer Beaver Airport",lat:52.70859909057617,lng:-88.54190063476562},
  {code:"CKD",n:"Crooked Creek Airport",lat:61.870315,lng:-158.137636},
  {code:"YAX",n:"Angling Lake — Wapekeka Airport",lat:53.84920120239258,lng:-89.57939910888672},
  {code:"WNN",n:"Wunnumin Lake Airport",lat:52.893902,lng:-89.2892},
  {code:"YNO",n:"North Spirit Lake Airport",lat:52.4900016784668,lng:-92.97109985351562},
  {code:"CKX",n:"Chicken Airport",lat:64.066495,lng:-141.951342},
  {code:"BZX",n:"Bazhong Enyang Airport",lat:31.73842,lng:106.644872},
  {code:"HSC",n:"Shaoguan Danxia Airport",lat:24.9786,lng:113.420998},
  {code:"JGS",n:"Ji'an — Jinggangshan Airport",lat:26.856899,lng:114.737},
  {code:"JNH",n:"Xiuzhou, Hangzhou — Jiaxing Nanhu Airport",lat:30.698056,lng:120.663056},
  {code:"DDR",n:"Xigazê (Dingri) — Shigatse Tingri Airport",lat:28.604567,lng:86.798},
  {code:"HQL",n:"Tashikuergan Hongqilafu Airport",lat:37.661333,lng:75.288877},
  {code:"LSG",n:"Leshan (Wutongqiao) — Leshan Airport",lat:29.438627,lng:103.749218},
  {code:"ZFL",n:"Zhaosu Tianma Airport",lat:43.088477,lng:81.223013},
  {code:"HJB",n:"Hejing Bayinbuluke Airport",lat:42.976395,lng:83.995543},
  {code:"JBK",n:"Qitai Jiangbulake Airport",lat:44.166086,lng:89.55014},
  {code:"ZAT",n:"Zhaotong Zhaoyang Airport",lat:27.205843,lng:103.691511},
  {code:"BFY",n:"Bengbu Tenghu Airport",lat:33.166292,lng:117.058344},
  {code:"XBE",n:"Bearskin Lake Airport",lat:53.965599060058594,lng:-91.0271987915039},
  {code:"YNP",n:"Natuashish Airport",lat:55.913898,lng:-61.184399},
  {code:"KIF",n:"Kingfisher Lake Airport",lat:53.01250076293945,lng:-89.85530090332031},
  {code:"LCR",n:"Virgilio Barco Vargas (La Chorrera) Airport",lat:-1.456361,lng:-72.801086},
  {code:"KEW",n:"Keewaywin Airport",lat:52.9911,lng:-92.836403},
  {code:"YKU",n:"Chisasibi Airport",lat:53.805599212646484,lng:-78.91690063476562},
  {code:"ZTB",n:"Tête-à-la-Baleine Airport",lat:50.674400329589844,lng:-59.38359832763672},
  {code:"ZGS",n:"Le Golfe-du-Saint-Laurent — La Romaine Airport",lat:50.259553,lng:-60.674357},
  {code:"ZLT",n:"La Tabatière Airport",lat:50.8307991027832,lng:-58.97560119628906},
  {code:"YAB",n:"Arctic Bay Airport",lat:73.006101,lng:-85.04616},
  {code:"YAC",n:"Cat Lake Airport",lat:51.7272,lng:-91.824402},
  {code:"YAG",n:"Fort Frances Municipal Airport",lat:48.655749,lng:-93.44349},
  {code:"YAL",n:"Alert Bay Airport",lat:50.582199,lng:-126.916},
  {code:"YAM",n:"Sault Ste Marie Airport",lat:46.483216,lng:-84.508467},
  {code:"XKS",n:"Kasabonika Airport",lat:53.52470016479492,lng:-88.6427993774414},
  {code:"YKG",n:"Kangirsuk Airport",lat:60.027199,lng:-69.999199},
  {code:"YAT",n:"Attawapiskat Airport",lat:52.927502,lng:-82.4319},
  {code:"YAY",n:"St. Anthony Airport",lat:51.391909,lng:-56.08321},
  {code:"YAZ",n:"Tofino / Long Beach Airport",lat:49.079833,lng:-125.775583},
  {code:"YBB",n:"Kugaaruk Airport",lat:68.535711,lng:-89.805508},
  {code:"YBC",n:"Baie-Comeau Airport",lat:49.1325,lng:-68.204399},
  {code:"QBC",n:"Bella Coola Airport",lat:52.387501,lng:-126.596001},
  {code:"YBE",n:"Uranium City Airport",lat:59.561401,lng:-108.481003},
  {code:"YBY",n:"Bonnyville Airport",lat:54.304199,lng:-110.744003},
  {code:"YBG",n:"Saguenay-Bagotville Airport",lat:48.330123,lng:-70.992012},
  {code:"YBK",n:"Baker Lake Airport",lat:64.29889678960001,lng:-96.077796936},
  {code:"YBL",n:"Campbell River Airport",lat:49.950802,lng:-125.271004},
  {code:"XTL",n:"Tadoule Lake Airport",lat:58.706308,lng:-98.511057},
  {code:"YBR",n:"Brandon Municipal Airport",lat:49.91,lng:-99.951897},
  {code:"YBT",n:"Brochet Airport",lat:57.8894,lng:-101.679001},
  {code:"YBV",n:"Berens River Airport",lat:52.358898,lng:-97.018303},
  {code:"YBX",n:"Lourdes-de-Blanc-Sablon Airport",lat:51.4436,lng:-57.185299},
  {code:"YRF",n:"Cartwright Airport",lat:53.682501,lng:-57.042303},
  {code:"YCB",n:"Cambridge Bay Airport",lat:69.1081008911,lng:-105.138000488},
  {code:"YCD",n:"Nanaimo Airport",lat:49.05497,lng:-123.869863},
  {code:"YCG",n:"Castlegar/West Kootenay Regional Airport",lat:49.296398,lng:-117.632004},
  {code:"YCO",n:"Kugluktuk Airport",lat:67.816408,lng:-115.14307},
  {code:"YCR",n:"Cross Lake (Charlie Sinclair Memorial) Airport",lat:54.609758,lng:-97.762442},
  {code:"YCS",n:"Chesterfield Inlet Airport",lat:63.346901,lng:-90.731102},
  {code:"YCY",n:"Clyde River Airport",lat:70.486099,lng:-68.516701},
  {code:"YDA",n:"Dawson City Airport",lat:64.04309844970703,lng:-139.1280059814453},
  {code:"YDF",n:"Deer Lake Airport",lat:49.208159,lng:-57.396147},
  {code:"YDL",n:"Dease Lake Airport",lat:58.422199,lng:-130.031998},
  {code:"YDN",n:"Dauphin Barker Airport",lat:51.1008,lng:-100.052002},
  {code:"YDP",n:"Nain Airport",lat:56.550778,lng:-61.682224},
  {code:"YEG",n:"Edmonton International Airport",lat:53.3097,lng:-113.580002},
  {code:"YEK",n:"Arviat Airport",lat:61.0942,lng:-94.070801},
  {code:"YER",n:"Fort Severn Airport",lat:56.018902,lng:-87.676102},
  {code:"YEV",n:"Inuvik Mike Zubko Airport",lat:68.30419921880001,lng:-133.483001709},
  {code:"YFA",n:"Fort Albany Airport",lat:52.203451,lng:-81.695194},
  {code:"YFB",n:"Iqaluit Airport",lat:63.756402,lng:-68.555801},
  {code:"YFC",n:"Fredericton International Airport",lat:45.868697,lng:-66.529891},
  {code:"YFH",n:"Fort Hope Airport",lat:51.561901,lng:-87.907799},
  {code:"YFO",n:"Flin Flon Airport",lat:54.678101,lng:-101.681999},
  {code:"YFS",n:"Fort Simpson Airport",lat:61.76020050048828,lng:-121.23699951171875},
  {code:"YMN",n:"Makkovik Airport",lat:55.077335,lng:-59.187942},
  {code:"YGH",n:"Fort Good Hope Airport",lat:66.240658,lng:-128.647757},
  {code:"YGL",n:"La Grande Rivière Airport",lat:53.625301361083984,lng:-77.7042007446289},
  {code:"YGO",n:"Gods Lake Narrows Airport",lat:54.55768,lng:-94.490061},
  {code:"YGP",n:"Michel-Pouliot Gaspé Airport",lat:48.774915,lng:-64.481893},
  {code:"YGR",n:"Les Îles-de-la-Madeleine — Îles-de-la-Madeleine Airport",lat:47.425242,lng:-61.778612},
  {code:"YGT",n:"Igloolik Airport",lat:69.3647,lng:-81.816101},
  {code:"YGV",n:"Havre-Saint-Pierre Airport",lat:50.281898,lng:-63.611401},
  {code:"YGW",n:"Kuujjuarapik Airport",lat:55.281898498535156,lng:-77.76529693603516},
  {code:"YGX",n:"Gillam Airport",lat:56.35712,lng:-94.711504},
  {code:"YGZ",n:"Grise Fiord Airport",lat:76.425823,lng:-82.908583},
  {code:"YQC",n:"Quaqtaq Airport",lat:61.046398,lng:-69.617798},
  {code:"YNS",n:"Nemiscau Airport",lat:51.691101,lng:-76.135597},
  {code:"YHI",n:"Ulukhaktok Holman Airport",lat:70.762802,lng:-117.806},
  {code:"YHK",n:"Gjoa Haven Airport",lat:68.635597,lng:-95.849701},
  {code:"YHM",n:"John C. Munro Hamilton International Airport",lat:43.171308,lng:-79.929416},
  {code:"YHO",n:"Hopedale Airport",lat:55.448757,lng:-60.228124},
  {code:"YHP",n:"Poplar Hill Airport",lat:52.1133,lng:-94.2556},
  {code:"YHR",n:"Chevery Airport",lat:50.468322,lng:-59.637823},
  {code:"YHU",n:"Montréal / Saint-Hubert Metropolitan Airport",lat:45.517502,lng:-73.416901},
  {code:"YHY",n:"Hay River / Merlyn Carter Airport",lat:60.8396987915,lng:-115.782997131},
  {code:"YHZ",n:"Halifax / Stanfield International Airport",lat:44.8807983398,lng:-63.5085983276},
  {code:"YIF",n:"St-Augustin — St Augustin Airport",lat:51.2117,lng:-58.658298},
  {code:"YIK",n:"Ivujivik Airport",lat:62.417301,lng:-77.925301},
  {code:"YIO",n:"Pond Inlet Airport",lat:72.689494,lng:-77.968941},
  {code:"YIV",n:"Island Lake Airport",lat:53.857200622558594,lng:-94.65360260009766},
  {code:"YKA",n:"Kamloops John Moose Fulton Field Regional Airport",lat:50.703038,lng:-120.448641},
  {code:"LAK",n:"Aklavik/Freddie Carmichael Airport",lat:68.223297,lng:-135.00599},
  {code:"YKF",n:"Breslau — Region of Waterloo International Airport",lat:43.4608,lng:-80.378601},
  {code:"YWB",n:"Kangiqsujuaq (Wakeham Bay) Airport",lat:61.5886,lng:-71.929398},
  {code:"YKL",n:"Schefferville Airport",lat:54.805301666259766,lng:-66.8052978515625},
  {code:"AKV",n:"Akulivik Airport",lat:60.8186,lng:-78.148598},
  {code:"YOG",n:"Ogoki Post Airport",lat:51.6585998535,lng:-85.9017028809},
  {code:"YKQ",n:"Waskaganish Airport",lat:51.473301,lng:-78.758301},
  {code:"YPJ",n:"Aupaluk Airport",lat:59.2967,lng:-69.599701},
  {code:"YLC",n:"Kimmirut Airport",lat:62.848253,lng:-69.877853},
  {code:"YLH",n:"Lansdowne House Airport",lat:52.195599,lng:-87.934196},
  {code:"YSG",n:"Lutselk'e Airport",lat:62.417823,lng:-110.682793},
  {code:"YLL",n:"Lloydminster Airport",lat:53.3092,lng:-110.072998},
  {code:"YLK",n:"Barrie-Lake Simcoe Regional Airport",lat:44.485056,lng:-79.554663},
  {code:"XGR",n:"Kangiqsualujjuaq (Georges River) Airport",lat:58.711399,lng:-65.992798},
  {code:"YLW",n:"Kelowna International Airport",lat:49.9561,lng:-119.377998},
  {code:"YMH",n:"Mary's Harbour Airport",lat:52.302837,lng:-55.847433},
  {code:"YMM",n:"Fort McMurray International Airport",lat:56.653301,lng:-111.222},
  {code:"YMO",n:"Moosonee Airport",lat:51.291099548339844,lng:-80.60780334472656},
  {code:"YMT",n:"Chibougamau — Chapais Airport",lat:49.77190017700195,lng:-74.5280990600586},
  {code:"YUD",n:"Umiujaq Airport",lat:56.536098,lng:-76.518303},
  {code:"YMX",n:"Montréal — Montreal Mirabel International Airport",lat:45.679501,lng:-74.038696},
  {code:"YNA",n:"Natashquan Airport",lat:50.190114,lng:-61.78898},
  {code:"YNC",n:"Wemindji Airport",lat:53.010601,lng:-78.8311},
  {code:"YND",n:"Ottawa / Gatineau Airport",lat:45.521702,lng:-75.563599},
  {code:"YNE",n:"Norway House Airport",lat:53.958302,lng:-97.8442},
  {code:"YNL",n:"Points North Landing Airport",lat:58.27669906616211,lng:-104.08200073242188},
  {code:"YOC",n:"Old Crow Airport",lat:67.570602,lng:-139.839005},
  {code:"YOH",n:"Oxford House Airport",lat:54.9333,lng:-95.2789},
  {code:"YOJ",n:"High Level Airport",lat:58.62139892578125,lng:-117.16500091552734},
  {code:"YOW",n:"Ottawa Macdonald-Cartier International Airport",lat:45.322498,lng:-75.669197},
  {code:"YPA",n:"Prince Albert Glass Field",lat:53.214199066199996,lng:-105.672996521},
  {code:"YPC",n:"Paulatuk (Nora Aliqatchialuk Ruben) Airport",lat:69.360838,lng:-124.07547},
  {code:"YPE",n:"Peace River Airport",lat:56.226898,lng:-117.446999},
  {code:"YPH",n:"Inukjuak Airport",lat:58.471901,lng:-78.076897},
  {code:"YPL",n:"Pickle Lake Airport",lat:51.4463996887207,lng:-90.21420288085938},
  {code:"YPM",n:"Pikangikum Airport",lat:51.819698,lng:-93.973297},
  {code:"YPN",n:"Port-Menier Airport",lat:49.836399,lng:-64.288597},
  {code:"YPO",n:"Peawanuck Airport",lat:54.987932,lng:-85.442648},
  {code:"YPQ",n:"Peterborough Regional Airport",lat:44.232251,lng:-78.362053},
  {code:"YPR",n:"Prince Rupert Airport",lat:54.286098480199996,lng:-130.445007324},
  {code:"YPW",n:"Powell River Airport",lat:49.83420181274414,lng:-124.5},
  {code:"YPX",n:"Puvirnituq Airport",lat:60.050598,lng:-77.286903},
  {code:"YPY",n:"Fort Chipewyan Airport",lat:58.7672004699707,lng:-111.11699676513672},
  {code:"YPZ",n:"Burns Lake Airport",lat:54.3764,lng:-125.950996},
  {code:"YQA",n:"Gravenhurst — Muskoka Airport",lat:44.975376,lng:-79.306546},
  {code:"YQB",n:"Quebec Jean Lesage International Airport",lat:46.7911,lng:-71.393303},
  {code:"YQD",n:"The Pas Airport",lat:53.97140121459961,lng:-101.09100341796875},
  {code:"YQG",n:"Windsor International Airport",lat:42.2756,lng:-82.955597},
  {code:"YQH",n:"Watson Lake Airport",lat:60.116839,lng:-128.821993},
  {code:"YQK",n:"Kenora Airport",lat:49.788299560546875,lng:-94.36309814453125},
  {code:"YQL",n:"Lethbridge County Airport",lat:49.6302986145,lng:-112.800003052},
  {code:"YQM",n:"Greater Moncton Roméo LeBlanc International Airport",lat:46.113189,lng:-64.67719},
  {code:"YQN",n:"Nakina Airport",lat:50.18280029296875,lng:-86.69640350341797},
  {code:"YQQ",n:"Comox Valley International Airport / CFB Comox",lat:49.7108,lng:-124.887001},
  {code:"YQR",n:"Regina International Airport",lat:50.431938,lng:-104.660906},
  {code:"YQT",n:"Thunder Bay International Airport",lat:48.371899,lng:-89.323898},
  {code:"YQU",n:"Grande Prairie Airport",lat:55.1796989441,lng:-118.885002136},
  {code:"YQX",n:"Gander International Airport",lat:48.936258,lng:-54.567719},
  {code:"YQY",n:"Sydney / J.A. Douglas McCurdy Airport",lat:46.161072,lng:-60.049759},
  {code:"YQZ",n:"Quesnel Airport",lat:53.026100158691406,lng:-122.51000213623047},
  {code:"YRA",n:"Gamètì — Rae Lakes Airport",lat:64.116096,lng:-117.309998},
  {code:"YRB",n:"Resolute Bay Airport",lat:74.7169036865,lng:-94.9693984985},
  {code:"YRJ",n:"Roberval Airport",lat:48.519665,lng:-72.265735},
  {code:"YRL",n:"Red Lake Airport",lat:51.066898345947266,lng:-93.79309844970703},
  {code:"YRO",n:"Ottawa / Rockcliffe Airport",lat:45.460496,lng:-75.644001},
  {code:"YRS",n:"Red Sucker Lake Airport",lat:54.167198,lng:-93.557198},
  {code:"YRT",n:"Rankin Inlet Airport",lat:62.8114013672,lng:-92.1157989502},
  {code:"YSB",n:"Sudbury Airport",lat:46.625,lng:-80.79889678955078},
  {code:"YSF",n:"Stony Rapids Airport",lat:59.250301361083984,lng:-105.84100341796875},
  {code:"YSJ",n:"Saint John Airport",lat:45.31610107421875,lng:-65.89029693603516},
  {code:"YSK",n:"Sanikiluaq Airport",lat:56.536891,lng:-79.250221},
  {code:"YSM",n:"Fort Smith Airport",lat:60.020302,lng:-111.961998},
  {code:"YCM",n:"Niagara-on-the-Lake — Niagara District Airport",lat:43.191598,lng:-79.171686},
  {code:"YST",n:"St. Theresa Point Airport",lat:53.845261,lng:-94.851966},
  {code:"YSY",n:"Sachs Harbour (David Nasogaluak Jr. Saaryuaq) Airport",lat:71.993896,lng:-125.242996},
  {code:"YTE",n:"Kinngait — Cape Dorset Airport",lat:64.230003,lng:-76.526703},
  {code:"YTH",n:"Thompson Airport",lat:55.80110168457031,lng:-97.86419677734375},
  {code:"YTL",n:"Big Trout Lake Airport",lat:53.817799,lng:-89.896896},
  {code:"YTQ",n:"Tasiujaq Airport",lat:58.667801,lng:-69.955803},
  {code:"YTS",n:"Timmins/Victor M. Power",lat:48.569698333699996,lng:-81.376701355},
  {code:"YTZ",n:"Billy Bishop Toronto City Airport",lat:43.627852,lng:-79.39553},
  {code:"YUL",n:"Montréal — Montreal / Pierre Elliott Trudeau International Airport",lat:45.467837,lng:-73.742294},
  {code:"YUT",n:"Repulse Bay — Naujaat Airport",lat:66.521024,lng:-86.225166},
  {code:"YUX",n:"Sanirajak — Hall Beach Airport",lat:68.7761,lng:-81.2425},
  {code:"YUY",n:"Rouyn-Noranda — Rouyn Noranda Airport",lat:48.20610046386719,lng:-78.83560180664062},
  {code:"YVB",n:"Bonaventure Airport",lat:48.071098,lng:-65.460297},
  {code:"YVC",n:"La Ronge Airport",lat:55.151401519800004,lng:-105.262001038},
  {code:"YCK",n:"Colville Lake — Tommy Kochon Airport",lat:67.02015,lng:-126.128364},
  {code:"YVM",n:"Qikiqtarjuaq Airport",lat:67.54656,lng:-64.03141},
  {code:"YVO",n:"Val-d'Or Airport",lat:48.0532989502,lng:-77.7827987671},
  {code:"YVP",n:"Kuujjuaq Airport",lat:58.096099853515625,lng:-68.4269027709961},
  {code:"YVQ",n:"Norman Wells Airport",lat:65.28160095214844,lng:-126.7979965209961},
  {code:"YVR",n:"Vancouver International Airport",lat:49.193901,lng:-123.183998},
  {code:"YVV",n:"Wiarton Airport",lat:44.7458,lng:-81.107201},
  {code:"YVZ",n:"Deer Lake Airport",lat:52.655613,lng:-94.061208},
  {code:"YFJ",n:"Wekweètì Airport",lat:64.190804,lng:-114.077002},
  {code:"YWG",n:"Winnipeg / James Armstrong Richardson International Airport",lat:49.909999847399995,lng:-97.2398986816},
  {code:"YWJ",n:"Déline Airport",lat:65.211098,lng:-123.435997},
  {code:"YWK",n:"Wabush Airport",lat:52.92190170288086,lng:-66.8644027709961},
  {code:"YWL",n:"Williams Lake Airport",lat:52.1831016541,lng:-122.054000854},
  {code:"YWP",n:"Webequie Airport",lat:52.959393,lng:-87.374868},
  {code:"YXC",n:"Cranbrook/Canadian Rockies International Airport",lat:49.610802,lng:-115.781998},
  {code:"YXE",n:"Saskatoon John G. Diefenbaker International Airport",lat:52.170723,lng:-106.700793},
  {code:"YXH",n:"Medicine Hat Regional Airport",lat:50.018902,lng:-110.721001},
  {code:"YXJ",n:"Fort Saint John — Fort St John / North Peace Regional Airport",lat:56.238098,lng:-120.739998},
  {code:"YXL",n:"Sioux Lookout Airport",lat:50.11389923095703,lng:-91.9052963256836},
  {code:"YXN",n:"Whale Cove Airport",lat:62.240002,lng:-92.598099},
  {code:"YXP",n:"Pangnirtung Airport",lat:66.144878,lng:-65.713606},
  {code:"YXS",n:"Prince George (International) Airport",lat:53.884311,lng:-122.666554},
  {code:"YXT",n:"Northwest Regional Airport Terrace-Kitimat",lat:54.468498,lng:-128.576009},
  {code:"YXU",n:"London International Airport",lat:43.032845,lng:-81.149003},
  {code:"YXX",n:"Abbotsford International Airport",lat:49.025299,lng:-122.361},
  {code:"YXY",n:"Whitehorse / Erik Nielsen International Airport",lat:60.708533,lng:-135.065705},
  {code:"YYB",n:"North Bay Jack Garland Airport",lat:46.363602,lng:-79.422798},
  {code:"YYC",n:"Calgary International Airport",lat:51.118822,lng:-114.009933},
  {code:"YYD",n:"Smithers Airport",lat:54.82469940185547,lng:-127.18299865722656},
  {code:"YYE",n:"Fort Nelson Airport",lat:58.8363990784,lng:-122.597000122},
  {code:"YYF",n:"Penticton Airport",lat:49.46310043334961,lng:-119.60199737548828},
  {code:"YYG",n:"Charlottetown Airport",lat:46.288911,lng:-63.125174},
  {code:"YYH",n:"Taloyoak Airport",lat:69.5467,lng:-93.576698},
  {code:"YYJ",n:"Victoria International Airport",lat:48.647201,lng:-123.427792},
  {code:"YYL",n:"Lynn Lake Airport",lat:56.86389923095703,lng:-101.07599639892578},
  {code:"YYQ",n:"Churchill Airport",lat:58.739200592041016,lng:-94.06500244140625},
  {code:"YYR",n:"Goose Bay Airport",lat:53.3191986084,lng:-60.4258003235},
  {code:"YYT",n:"St. John's International Airport",lat:47.618599,lng:-52.7519},
  {code:"YYY",n:"Mont-Joli — Mont Joli Airport",lat:48.60860061645508,lng:-68.20809936523438},
  {code:"YYZ",n:"Toronto Pearson International Airport",lat:43.675935,lng:-79.629421},
  {code:"YZF",n:"Yellowknife International Airport",lat:62.462799,lng:-114.440002},
  {code:"YZG",n:"Salluit Airport",lat:62.179401,lng:-75.667198},
  {code:"YZP",n:"Sandspit Airport",lat:53.25429916379999,lng:-131.813995361},
  {code:"YZS",n:"Coral Harbour Airport",lat:64.1932983398,lng:-83.3593978882},
  {code:"YZT",n:"Port Hardy Airport",lat:50.680599212646484,lng:-127.36699676513672},
  {code:"YZU",n:"Whitecourt Airport",lat:54.143902,lng:-115.787003},
  {code:"YZV",n:"Sept-Îles Airport",lat:50.22330093383789,lng:-66.2656021118164},
  {code:"ILF",n:"Ilford Airport",lat:56.051622,lng:-95.61882},
  {code:"ZBF",n:"South Tetagouche — Bathurst Airport",lat:47.6297,lng:-65.738899},
  {code:"ZEM",n:"Eastmain River Airport",lat:52.226398,lng:-78.522499},
  {code:"ZFD",n:"Fond-du-Lac Airport",lat:59.3344,lng:-107.181999},
  {code:"XPK",n:"Pukatawagan Airport",lat:55.749199,lng:-101.265999},
  {code:"ZFM",n:"Fort Mcpherson Airport",lat:67.406993,lng:-134.860182},
  {code:"ZFN",n:"Tulita Airport",lat:64.909496,lng:-125.570297},
  {code:"ZGI",n:"Gods River Airport",lat:54.839699,lng:-94.078598},
  {code:"ZKE",n:"Kashechewan Airport",lat:52.282501,lng:-81.677803},
  {code:"MSA",n:"Muskrat Dam Airport",lat:53.441399,lng:-91.762802},
  {code:"ZMT",n:"Masset Airport",lat:54.0275,lng:-132.125},
  {code:"ZPB",n:"Sachigo Lake Airport",lat:53.890885,lng:-92.195935},
  {code:"ZRJ",n:"Round Lake (Weagamow Lake) Airport",lat:52.9436,lng:-91.312798},
  {code:"ZSJ",n:"Sandy Lake Airport",lat:53.06420135498047,lng:-93.34439849853516},
  {code:"XSI",n:"South Indian Lake Airport",lat:56.792801,lng:-98.907204},
  {code:"YDV",n:"Bloodvein River Airport",lat:51.784568,lng:-96.692305},
  {code:"ZTM",n:"Shamattawa Airport",lat:55.86356,lng:-92.081137},
  {code:"ZUM",n:"Churchill Falls Airport",lat:53.5619010925293,lng:-64.10639953613281},
  {code:"XLB",n:"Lac Brochet Airport",lat:58.614279,lng:-101.468954},
  {code:"ZWL",n:"Wollaston Lake Airport",lat:58.106899,lng:-103.171997},
  {code:"BJA",n:"Béjaïa — Soummam–Abane Ramdane Airport",lat:36.712547,lng:5.069909},
  {code:"ALG",n:"Algiers — Houari Boumediene Airport",lat:36.693886,lng:3.214531},
  {code:"DJG",n:"Tiska Djanet Airport",lat:24.285448,lng:9.463652},
  {code:"VVZ",n:"Illizi Takhamalt Airport",lat:26.723499,lng:8.62265},
  {code:"QSF",n:"Sétif — Ain Arnat Airport",lat:36.178488,lng:5.329909},
  {code:"TMR",n:"Tamanrasset — Aguenar – Hadj Bey Akhamok Airport",lat:22.810992,lng:5.450832},
  {code:"GJL",n:"Tahir — Jijel Ferhat Abbas Airport",lat:36.794125,lng:5.873652},
  {code:"MZW",n:"Mecheria Airport",lat:33.5359,lng:-0.242353},
  {code:"AAE",n:"Annaba Rabah Bitat Airport",lat:36.826781,lng:7.81334},
  {code:"CZL",n:"Constantine — Mohamed Boudiaf International Airport",lat:36.276001,lng:6.62039},
  {code:"TEE",n:"Cheikh Larbi Tébessi Airport",lat:35.4315986633,lng:8.12071990967},
  {code:"BLJ",n:"Batna Mostefa Ben Boulaid Airport",lat:35.752102,lng:6.30859},
  {code:"TIN",n:"Tindouf Airport",lat:27.7003993988,lng:-8.167099952700001},
  {code:"CFK",n:"Chlef Aboubakr Belkaid International Airport",lat:36.216614,lng:1.341114},
  {code:"TLM",n:"Zenata – Messali El Hadj Airport",lat:35.012732,lng:-1.457117},
  {code:"ORN",n:"Oran Es-Sénia (Ahmed Ben Bella) International Airport",lat:35.620648,lng:-0.622486},
  {code:"CBH",n:"Béchar Boudghene Ben Ali Lotfi Airport",lat:31.645700454711914,lng:-2.269860029220581},
  {code:"EBH",n:"El Bayadh Airport",lat:33.721667,lng:1.0925},
  {code:"BMW",n:"Bordj Badji Mokhtar Airport",lat:21.3778,lng:0.92698},
  {code:"AZR",n:"Adrar — Touat-Cheikh Sidi Mohamed Belkebir Airport",lat:27.837601,lng:-0.186414},
  {code:"BSK",n:"Biskra - Mohamed Khider Airport",lat:34.79318,lng:5.738899},
  {code:"ELG",n:"El Menia — El Golea Airport",lat:30.580732,lng:2.861595},
  {code:"GHA",n:"El Atteuf — Noumérat - Moufdi Zakaria Airport",lat:32.384102,lng:3.79411},
  {code:"HME",n:"Hassi Messaoud-Oued Irara Krim Belkacem Airport",lat:31.673,lng:6.14044},
  {code:"INZ",n:"In Salah Airport",lat:27.250999,lng:2.51202},
  {code:"TGR",n:"Touggourt Sidi Madhi Airport",lat:33.067799,lng:6.08867},
  {code:"LOO",n:"Laghouat - Molay Ahmed Medeghri Airport",lat:33.7644,lng:2.92834},
  {code:"ELU",n:"Guemar Airport - مطار قمار بالوادي",lat:33.511398,lng:6.77679},
  {code:"TMX",n:"Timimoun Airport",lat:29.237101,lng:0.276033},
  {code:"OGX",n:"Ouargla — Ain Beida Airport",lat:31.9172,lng:5.41278},
  {code:"IAM",n:"Zarzaitine - In Aménas Airport",lat:28.0515,lng:9.64291},
  {code:"COO",n:"Cotonou Cadjehoun International Airport",lat:6.35723,lng:2.38435},
  {code:"DEX",n:"Nop Goliat Dekai Airport",lat:-4.8557,lng:139.482006},
  {code:"OUA",n:"Ouagadougou Thomas Sankara International Airport",lat:12.3532,lng:-1.51242},
  {code:"BOY",n:"Bobo Dioulasso Airport",lat:11.1601,lng:-4.33097},
  {code:"ACC",n:"Accra — Kotoka International Airport",lat:5.605189800262451,lng:-0.16678600013256073},
  {code:"TML",n:"Tamale — Yakubu Tali International Airport",lat:9.553909,lng:-0.86606},
  {code:"KMS",n:"Kumasi — Prempeh I International Airport",lat:6.71456,lng:-1.59082},
  {code:"NYI",n:"Sunyani Airport",lat:7.36183,lng:-2.32876},
  {code:"TKD",n:"Sekondi-Takoradi — Takoradi Airport",lat:4.896059989929199,lng:-1.7747600078582764},
  {code:"ABJ",n:"Abidjan — Félix-Houphouët-Boigny International Airport",lat:5.26139,lng:-3.92629},
  {code:"BYK",n:"Bouaké Airport",lat:7.7388,lng:-5.07367},
  {code:"HGO",n:"Korhogo Airport",lat:9.38718,lng:-5.55666},
  {code:"SPY",n:"San Pedro Airport",lat:4.74672,lng:-6.66082},
  {code:"DLR",n:"Dalnerechensk Airport",lat:45.879857,lng:133.737629},
  {code:"DKA",n:"Katsina — Umaru Musa Yar'adua Airport",lat:13.0078,lng:7.66045},
  {code:"ABV",n:"Abuja — Nnamdi Azikiwe International Airport",lat:9.00679,lng:7.26317},
  {code:"QUO",n:"Uyo — Akwa Ibom International Airport",lat:4.8725,lng:8.093},
  {code:"AKR",n:"Akure Airport",lat:7.246739864349365,lng:5.3010101318359375},
  {code:"ABB",n:"Asaba International Airport",lat:6.204167,lng:6.665278},
  {code:"BCU",n:"Sir Abubakar Tafawa Balewa Bauchi State International Airport",lat:10.482833,lng:9.744},
  {code:"BNI",n:"Benin Airport",lat:6.316979885101318,lng:5.5995001792907715},
  {code:"CBQ",n:"Calabar — Margaret Ekpo International Airport",lat:4.976019859313965,lng:8.347200393676758},
  {code:"ENU",n:"Enegu — Akanu Ibiam International Airport",lat:6.473718,lng:7.560463},
  {code:"GMO",n:"Gombe Lawanti International Airport",lat:10.298889,lng:10.9},
  {code:"IBA",n:"Ibadan Airport",lat:7.362460136413574,lng:3.97832989692688},
  {code:"ILR",n:"Ilorin/Ogbomosho — General Tunde Idiagbon International Airport",lat:8.44021,lng:4.49392},
  {code:"QOW",n:"Owerri — Sam Mbakwe International Cargo Airport",lat:5.42706,lng:7.20603},
  {code:"JOS",n:"Jos — Yakubu Gowon Airport",lat:9.639829635620117,lng:8.869050025939941},
  {code:"KAD",n:"Kaduna International Airport",lat:10.696,lng:7.32011},
  {code:"KAN",n:"Mallam Aminu Kano International Airport",lat:12.045613,lng:8.523566},
  {code:"MIU",n:"Maiduguri International Airport",lat:11.854163,lng:13.080702},
  {code:"MDI",n:"Makurdi Airport",lat:7.70388,lng:8.61394},
  {code:"LOS",n:"Lagos — Murtala Muhammed International Airport",lat:6.57737,lng:3.32116},
  {code:"PHC",n:"Port Harcourt International Airport",lat:5.01549,lng:6.94959},
  {code:"SKO",n:"Sokoto — Sadiq Abubakar III International Airport",lat:12.915729,lng:5.207547},
  {code:"QRW",n:"Okpe — Warri Airport",lat:5.59821,lng:5.8187},
  {code:"YOL",n:"Yola Airport",lat:9.257550239562988,lng:12.430399894714355},
  {code:"DPT",n:"Deputatskiy Airport",lat:69.392503,lng:139.890012},
  {code:"NIM",n:"Niamey — Diori Hamani International Airport",lat:13.4815,lng:2.18361},
  {code:"ZND",n:"Zinder Airport",lat:13.779000282287598,lng:8.983759880065918},
  {code:"TBJ",n:"Tabarka-Aïn Draham International Airport",lat:36.98,lng:8.87694},
  {code:"MIR",n:"Monastir Habib Bourguiba International Airport",lat:35.75809860229492,lng:10.75469970703125},
  {code:"NBE",n:"Enfidha - Hammamet International Airport",lat:36.075833,lng:10.438611},
  {code:"TUN",n:"Tunis Carthage International Airport",lat:36.851002,lng:10.2272},
  {code:"DJE",n:"Mellita — Djerba Zarzis International Airport",lat:33.873719,lng:10.7773},
  {code:"SFA",n:"Sfax Thyna International Airport",lat:34.717999,lng:10.691},
  {code:"TOE",n:"Tozeur Nefta International Airport",lat:33.939701080322266,lng:8.110560417175293},
  {code:"LFW",n:"Lomé–Tokoin International Airport",lat:6.16561,lng:1.25451},
  {code:"ANR",n:"Antwerp International Airport (Deurne)",lat:51.190667,lng:4.463153},
  {code:"CRL",n:"Brussels South Charleroi Airport",lat:50.461963,lng:4.459562},
  {code:"LGG",n:"Grâce-Hollogne — Liège Airport",lat:50.638574,lng:5.443897},
  {code:"OST",n:"Oostende — Ostend-Bruges International Airport",lat:51.1998,lng:2.874673},
  {code:"HDF",n:"Zirchow — Heringsdorf Airport",lat:53.8787,lng:14.1523},
  {code:"DRS",n:"Dresden Airport",lat:51.134123,lng:13.767831},
  {code:"ERF",n:"Erfurt-Weimar Airport",lat:50.978281,lng:10.960713},
  {code:"FMO",n:"Greven — Münster Osnabrück Airport",lat:52.133816,lng:7.688482},
  {code:"CGN",n:"Köln (Cologne) — Cologne Bonn Airport",lat:50.865898,lng:7.14274},
  {code:"NUE",n:"Nuremberg Airport",lat:49.498699,lng:11.078056},
  {code:"LEJ",n:"Schkeuditz — Leipzig/Halle Airport",lat:51.420657,lng:12.232705},
  {code:"SCN",n:"Saarbrücken Airport",lat:49.214545,lng:7.109735},
  {code:"STR",n:"Stuttgart Airport",lat:48.689899,lng:9.22196},
  {code:"HAJ",n:"Hannover Airport",lat:52.461102,lng:9.68508},
  {code:"BRE",n:"Bremen Airport",lat:53.046786,lng:8.78932},
  {code:"HHN",n:"Frankfurt am Main (Lautzenhausen) — Frankfurt-Hahn Airport",lat:49.946353,lng:7.261734},
  {code:"MHG",n:"Mannheim-City Airport",lat:49.473057,lng:8.514167},
  {code:"LBC",n:"Lübeck Blankensee Airport",lat:53.805401,lng:10.7192},
  {code:"FMM",n:"Memmingen Allgau Airport",lat:47.988092,lng:10.238248},
  {code:"PAD",n:"Büren — Paderborn Lippstadt Airport",lat:51.612527,lng:8.617459},
  {code:"NRN",n:"Weeze (Niederrhein) Airport",lat:51.601362,lng:6.141228},
  {code:"DTM",n:"Dortmund Airport",lat:51.518299,lng:7.61224},
  {code:"FDH",n:"Bodensee Airport Friedrichshafen",lat:47.671299,lng:9.51149},
  {code:"FKB",n:"Rheinmünster — Karlsruhe Baden-Baden Airport",lat:48.7794,lng:8.0805},
  {code:"KSF",n:"Calden — Kassel Airport",lat:51.418395,lng:9.391638},
  {code:"EME",n:"Emden Airport",lat:53.391109,lng:7.2275},
  {code:"AGE",n:"Wangerooge Airport",lat:53.782544,lng:7.919584},
  {code:"JUI",n:"Juist Airport",lat:53.681421,lng:7.056398},
  {code:"BMK",n:"Borkum Airport",lat:53.59639,lng:6.709167},
  {code:"NOD",n:"Norden-Norddeich Airport",lat:53.633057,lng:7.190278},
  {code:"NRD",n:"Norderney Airport",lat:53.706944,lng:7.23},
  {code:"BMR",n:"Baltrum Airport",lat:53.72485,lng:7.373257},
  {code:"HEI",n:"Oesterdeichstrich — Heide-Büsum Airport",lat:54.153332,lng:8.901667},
  {code:"HGL",n:"Helgoland-Düne Airport",lat:54.18528,lng:7.915833},
  {code:"GWT",n:"Westerland Sylt Airport",lat:54.9132,lng:8.34047},
  {code:"KDL",n:"Kärdla Airport",lat:58.99079895019531,lng:22.830699920654297},
  {code:"URE",n:"Kuressaare Airport",lat:58.22990036010742,lng:22.50950050354004},
  {code:"EPU",n:"Pärnu Airport",lat:58.41899871826172,lng:24.47279930114746},
  {code:"TAY",n:"Tartu Airport",lat:58.307438,lng:26.686473},
  {code:"ENF",n:"Enontekio Airport",lat:68.362602233887,lng:23.424299240112},
  {code:"IVL",n:"Ivalo Airport",lat:68.6073,lng:27.4053},
  {code:"JOE",n:"Joensuu Airport",lat:62.658815,lng:29.619398},
  {code:"JYV",n:"Jyväskylän Maalaiskunta — Jyväskylä Airport",lat:62.399502,lng:25.678301},
  {code:"KEM",n:"Kemi / Tornio — Kemi-Tornio Airport",lat:65.778701782227,lng:24.582099914551},
  {code:"KAJ",n:"Kajaani Airport",lat:64.2855,lng:27.6924},
  {code:"KOK",n:"Kokkola / Kruunupyy — Kokkola-Pietarsaari Airport",lat:63.721199,lng:23.143101},
  {code:"KAO",n:"Kuusamo Airport",lat:65.987602,lng:29.239401},
  {code:"KTT",n:"Kittilä International Airport",lat:67.700996,lng:24.8468},
  {code:"KUO",n:"Kuopio / Siilinjärvi — Kuopio Airport",lat:63.007099,lng:27.7978},
  {code:"LPP",n:"Lappeenranta Airport",lat:61.044601,lng:28.144743},
  {code:"MHQ",n:"Mariehamn Airport",lat:60.1222,lng:19.898199},
  {code:"OUL",n:"Oulu / Oulunsalo — Oulu Airport",lat:64.930099,lng:25.354601},
  {code:"POR",n:"Pori Airport",lat:61.4617,lng:21.799999},
  {code:"RVN",n:"Rovaniemi Airport",lat:66.563327,lng:25.829751},
  {code:"SVL",n:"Savonlinna Airport",lat:61.9431,lng:28.945101},
  {code:"TMP",n:"Tampere / Pirkkala — Tampere-Pirkkala Airport",lat:61.414101,lng:23.604401},
  {code:"TKU",n:"Turku Airport",lat:60.514099,lng:22.2628},
  {code:"VAA",n:"Vaasa Airport",lat:63.05023,lng:21.762543},
  {code:"BFS",n:"Belfast International Airport",lat:54.6575012207,lng:-6.2158298492399995},
  {code:"BHD",n:"George Best Belfast City Airport",lat:54.618099,lng:-5.8725},
  {code:"LDY",n:"Derry, Derry and Strabane — City of Derry Airport",lat:55.042801,lng:-7.16111},
  {code:"BHX",n:"Birmingham, West Midlands — Birmingham Airport",lat:52.453899,lng:-1.74803},
  {code:"MAN",n:"Manchester, Greater Manchester — Manchester Airport",lat:53.349375,lng:-2.279521},
  {code:"CAL",n:"Campbeltown Airport",lat:55.437199,lng:-5.68639},
  {code:"EOI",n:"Eday Airport",lat:59.19060134887695,lng:-2.7722198963165283},
  {code:"FIE",n:"Fair Isle Airport",lat:59.534721,lng:-1.628509},
  {code:"COL",n:"Coll Island — Coll Airport",lat:56.601898,lng:-6.61778},
  {code:"NRL",n:"North Ronaldsay Airport",lat:59.3675003052,lng:-2.43443989754},
  {code:"OBN",n:"North Connel — Oban Airport",lat:56.463501,lng:-5.39967},
  {code:"PPW",n:"Papa Westray, Orkney Islands — Papa Westray Airport",lat:59.351012,lng:-2.900353},
  {code:"SOY",n:"Stronsay Airport",lat:59.1553,lng:-2.64139},
  {code:"NDY",n:"Sanday Airport",lat:59.250301,lng:-2.57667},
  {code:"LWK",n:"Lerwick, Shetland Islands — Lerwick / Tingwall Airport",lat:60.1922,lng:-1.24361},
  {code:"WRY",n:"Westray, Orkney Islands — Westray Airport",lat:59.350475,lng:-2.950062},
  {code:"CSA",n:"Colonsay Airstrip",lat:56.057499,lng:-6.24306},
  {code:"CWL",n:"Cardiff International Airport",lat:51.396702,lng:-3.34333},
  {code:"BRS",n:"Bristol Airport",lat:51.382326,lng:-2.716453},
  {code:"LPL",n:"Liverpool John Lennon Airport",lat:53.334863,lng:-2.849637},
  {code:"LTN",n:"Luton, Luton — London Luton Airport",lat:51.874699,lng:-0.368333},
  {code:"LEQ",n:"Land's End, Cornwall — Land's End Airport",lat:50.102798,lng:-5.67056},
  {code:"ISC",n:"St. Mary's, Isles of Scilly — St. Mary's Airport",lat:49.913375,lng:-6.291894},
  {code:"BOH",n:"Bournemouth Airport",lat:50.780483,lng:-1.839576},
  {code:"SOU",n:"Southampton Airport",lat:50.950298,lng:-1.3568},
  {code:"NQY",n:"Cornwall Airport Newquay",lat:50.440601,lng:-4.99541},
  {code:"ACI",n:"Saint Anne — Alderney Airport",lat:49.706104,lng:-2.21472},
  {code:"GCI",n:"Saint Peter Port — Guernsey Airport",lat:49.435001,lng:-2.60197},
  {code:"JER",n:"St. Peter — Jersey Airport",lat:49.207901,lng:-2.19551},
  {code:"LCY",n:"London City Airport",lat:51.505299,lng:0.055278},
  {code:"SEN",n:"Southend-on-Sea, Essex — London Southend Airport",lat:51.570562,lng:0.693627},
  {code:"HUY",n:"Grimsby, Lincolnshire — Humberside Airport",lat:53.576152,lng:-0.34954},
  {code:"LBA",n:"Leeds, West Yorkshire — Leeds Bradford Airport",lat:53.865898,lng:-1.66057},
  {code:"IOM",n:"Castletown, Rushen — Isle of Man Airport",lat:54.083081,lng:-4.623871},
  {code:"NCL",n:"Newcastle upon Tyne, Tyne and Wear — Newcastle International Airport",lat:55.037958,lng:-1.689577},
  {code:"MME",n:"Darlington, Durham — Teesside International Airport",lat:54.509201,lng:-1.42941},
  {code:"EMA",n:"Nottingham, Leicestershire — East Midlands Airport",lat:52.8311,lng:-1.32806},
  {code:"KOI",n:"Kirkwall, Orkney Islands — Kirkwall Airport",lat:58.957903,lng:-2.905077},
  {code:"LSI",n:"Lerwick, Shetland — Sumburgh Airport",lat:59.878899,lng:-1.29556},
  {code:"WIC",n:"Wick John O'Groats Airport",lat:58.4589,lng:-3.09306},
  {code:"ABZ",n:"Aberdeen International Airport",lat:57.2019,lng:-2.19778},
  {code:"INV",n:"Inverness, Highland — Inverness Airport",lat:57.5425,lng:-4.0475},
  {code:"GLA",n:"Glasgow Airport",lat:55.871899,lng:-4.43306},
  {code:"EDI",n:"Ingliston, Edinburgh — Edinburgh Airport",lat:55.950145,lng:-3.372288},
  {code:"ILY",n:"Isle of Islay, Argyll and Bute — Islay Airport",lat:55.682708,lng:-6.257525},
  {code:"PIK",n:"Prestwick, South Ayrshire — Glasgow Prestwick Airport",lat:55.501499,lng:-4.577182},
  {code:"BEB",n:"Balivanich — Benbecula Airport",lat:57.481098,lng:-7.36278},
  {code:"DND",n:"Dundee Airport",lat:56.452499,lng:-3.02583},
  {code:"SYY",n:"Stornoway, Western Isles — Stornoway Airport",lat:58.215599,lng:-6.33111},
  {code:"BRR",n:"Eoligarry — Barra Airport",lat:57.0228,lng:-7.44306},
  {code:"TRE",n:"Balemartine, Argyll and Bute — Tiree Airport",lat:56.499199,lng:-6.86917},
  {code:"NWI",n:"Norwich, Norfolk — Norwich Airport",lat:52.6758,lng:1.28278},
  {code:"STN",n:"London, Essex — London Stansted Airport",lat:51.884998,lng:0.235},
  {code:"EXT",n:"Exeter, Devon — Exeter International Airport",lat:50.734261,lng:-3.413984},
  {code:"MPN",n:"Mount Pleasant Airport / RAF Mount Pleasant",lat:-51.822642,lng:-58.445777},
  {code:"MST",n:"Maastricht Aachen Airport",lat:50.911087,lng:5.769401},
  {code:"EIN",n:"Eindhoven Airport",lat:51.4500999451,lng:5.37452983856},
  {code:"GRQ",n:"Groningen Airport Eelde",lat:53.119107,lng:6.577652},
  {code:"RTM",n:"Rotterdam The Hague Airport",lat:51.956902,lng:4.43722},
  {code:"NNR",n:"Inverin — Connemara Regional Airport",lat:53.23030090332031,lng:-9.467780113220215},
  {code:"ORK",n:"Cork International Airport",lat:51.841301,lng:-8.49111},
  {code:"CFN",n:"Donegal Airport",lat:55.0442008972168,lng:-8.340999603271484},
  {code:"DUB",n:"Dublin Airport",lat:53.428713,lng:-6.262121},
  {code:"IOR",n:"Inis Mór — Inishmore Aerodrome",lat:53.1067008972168,lng:-9.653610229492188},
  {code:"INQ",n:"Inis Oírr — Inisheer Aerodrome",lat:53.064701,lng:-9.5109},
  {code:"NOC",n:"Charlestown — Ireland West Airport Knock",lat:53.910439,lng:-8.817002},
  {code:"KIR",n:"Farranfore — Kerry Airport",lat:52.180901,lng:-9.52378},
  {code:"IIA",n:"Inis Meáin — Inishmaan Aerodrome",lat:53.092999,lng:-9.56806},
  {code:"SNN",n:"Shannon Airport",lat:52.702,lng:-8.92482},
  {code:"EJT",n:"Enejit Island — Enejit Airport",lat:6.0404,lng:171.9846},
  {code:"AAR",n:"Aarhus Airport",lat:56.303331,lng:10.618286},
  {code:"BLL",n:"Billund Airport",lat:55.740335,lng:9.157019},
  {code:"EBJ",n:"Esbjerg Airport",lat:55.525902,lng:8.5534},
  {code:"KRP",n:"Midtjyllands Airport / Air Base Karup",lat:56.297139,lng:9.104311},
  {code:"BYR",n:"Læsø Airport",lat:57.277199,lng:11.0001},
  {code:"ODE",n:"Odense Hans Christian Andersen Airport",lat:55.475307,lng:10.327206},
  {code:"RKE",n:"Copenhagen Roskilde Airport",lat:55.585602,lng:12.1314},
  {code:"RNN",n:"Rønne — Bornholm Airport",lat:55.063301,lng:14.7596},
  {code:"SGD",n:"Sønderborg Airport",lat:54.96440124511719,lng:9.791729927062988},
  {code:"FAE",n:"Vágar Airport",lat:62.063256,lng:-7.275782},
  {code:"AAL",n:"Aalborg Airport",lat:57.094763,lng:9.84993},
  {code:"LUX",n:"Luxembourg-Findel International Airport",lat:49.626845,lng:6.212134},
  {code:"AES",n:"Ålesund Airport",lat:62.560443,lng:6.110845},
  {code:"ANX",n:"Andøya Airport, Andenes",lat:69.295193,lng:16.139379},
  {code:"ALF",n:"Alta Airport",lat:69.976097,lng:23.3717},
  {code:"FDE",n:"Førde Airport, Bringeland",lat:61.391102,lng:5.75694},
  {code:"BNN",n:"Brønnøysund Airport, Brønnøy",lat:65.461098,lng:12.2175},
  {code:"BOO",n:"Bodø Airport",lat:67.269203,lng:14.3653},
  {code:"BGO",n:"Bergen Airport, Flesland",lat:60.2934,lng:5.21814},
  {code:"BJF",n:"Båtsfjord Airport",lat:70.60025,lng:29.692612},
  {code:"BVG",n:"Berlevåg Airport",lat:70.871517,lng:29.034097},
  {code:"KRS",n:"Kristiansand(Kjevik) — Kristiansand Airport",lat:58.204201,lng:8.08537},
  {code:"BDU",n:"Målselv — Bardufoss Airport",lat:69.055801,lng:18.5404},
  {code:"EVE",n:"Evenes — Harstad/Narvik Airport",lat:68.491302,lng:16.678101},
  {code:"FRO",n:"Florø Airport",lat:61.583599090576,lng:5.0247201919556},
  {code:"HAU",n:"Haugesund Airport, Karmøy",lat:59.345299,lng:5.20836},
  {code:"HFT",n:"Hammerfest Airport",lat:70.679703,lng:23.6686},
  {code:"HAA",n:"Hasvik Airport",lat:70.486702,lng:22.1397},
  {code:"HVG",n:"Honningsvåg Airport, Valan",lat:71.009697,lng:25.983601},
  {code:"KSU",n:"Kristiansund Airport, Kvernberget",lat:63.111801,lng:7.82452},
  {code:"KKN",n:"Kirkenes Airport, Høybuktmoen",lat:69.7258,lng:29.8913},
  {code:"LKN",n:"Leknes Airport",lat:68.152496337891,lng:13.609399795532},
  {code:"MEH",n:"Mehamn Airport",lat:71.029701,lng:27.8267},
  {code:"MOL",n:"Molde Airport, Årø",lat:62.744701,lng:7.2625},
  {code:"MJF",n:"Mosjøen Airport, Kjærstad",lat:65.783997,lng:13.2149},
  {code:"LKL",n:"Lakselv Airport, Banak",lat:70.068802,lng:24.973499},
  {code:"OSY",n:"Namsos Airport",lat:64.472198,lng:11.5786},
  {code:"OLA",n:"Ørland Airport",lat:63.69889831542969,lng:9.604000091552734},
  {code:"HOV",n:"Ørsta-Volda Airport, Hovden",lat:62.180000305176,lng:6.0741000175476},
  {code:"MQN",n:"Mo i Rana Airport, Røssvoll",lat:66.363899230957,lng:14.301400184631},
  {code:"RVK",n:"Rørvik Airport, Ryum",lat:64.838302612305,lng:11.14610004425},
  {code:"RRS",n:"Røros Airport",lat:62.578399658203,lng:11.342300415039},
  {code:"RET",n:"Røst Airport",lat:67.526482,lng:12.101575},
  {code:"LYR",n:"Longyearbyen — Svalbard Airport, Longyear",lat:78.246101,lng:15.4656},
  {code:"SDN",n:"Sandane Airport, Anda",lat:61.830002,lng:6.10583},
  {code:"SOG",n:"Sogndal Airport, Haukåsen",lat:61.156101,lng:7.13778},
  {code:"SVJ",n:"Svolvær Airport, Helle",lat:68.243301,lng:14.6692},
  {code:"SKN",n:"Hadsel — Stokmarknes Airport, Skagen",lat:68.578827,lng:15.033417},
  {code:"SRP",n:"Leirvik — Stord Airport, Sørstokken",lat:59.791901,lng:5.34085},
  {code:"SOJ",n:"Sørkjosen Airport",lat:69.786797,lng:20.9594},
  {code:"VAW",n:"Vardø Airport, Svartnes",lat:70.3554,lng:31.044901},
  {code:"SSJ",n:"Alstahaug — Sandnessjøen Airport, Stokka",lat:65.956802,lng:12.4689},
  {code:"TOS",n:"Tromsø Airport",lat:69.683296,lng:18.9189},
  {code:"TRF",n:"Sandefjord(Torp) — Sandefjord Airport, Torp",lat:59.186699,lng:10.2586},
  {code:"TRD",n:"Trondheim Airport, Værnes",lat:63.457802,lng:10.924},
  {code:"VDS",n:"Vadsø Airport",lat:70.0653,lng:29.8447},
  {code:"SVG",n:"Stavanger Airport, Sola",lat:58.876701,lng:5.63778},
  {code:"BZG",n:"Ignacy Jan Paderewski Bydgoszcz Airport",lat:53.096802,lng:17.977699},
  {code:"KTW",n:"Katowice Wojciech Korfanty International Airport",lat:50.476015,lng:19.080705},
  {code:"LUZ",n:"Lublin Airport",lat:51.240157,lng:22.713461},
  {code:"LCJ",n:"Łódź Władysław Reymont Airport",lat:51.721901,lng:19.3981},
  {code:"WMI",n:"Nowy Dwór Mazowiecki — Warsaw Modlin Airport",lat:52.451099,lng:20.6518},
  {code:"POZ",n:"Poznań-Ławica Airport",lat:52.421598,lng:16.823359},
  {code:"RDO",n:"Warsaw Radom Airport",lat:51.38937,lng:21.214742},
  {code:"RZE",n:"Rzeszów-Jasionka Airport",lat:50.109791,lng:22.024155},
  {code:"SZZ",n:"Szczecin(Glewice) — Solidarity Szczecin–Goleniów Airport",lat:53.584702,lng:14.9022},
  {code:"SZY",n:"Szymany — Olsztyn-Mazury Airport",lat:53.481899,lng:20.9377},
  {code:"IEG",n:"Nowe Kramsko — Zielona Góra-Babimost Airport",lat:52.1385,lng:15.7986},
  {code:"RNB",n:"Ronneby Airport",lat:56.266701,lng:15.265},
  {code:"JKG",n:"Jönköping Airport",lat:57.757598876953125,lng:14.068699836730957},
  {code:"THN",n:"Trollhättan-Vänersborg Airport",lat:58.31809997558594,lng:12.345000267028809},
  {code:"MXX",n:"Mora Airport",lat:60.957901,lng:14.5114},
  {code:"NYO",n:"Nyköping — Stockholm Skavsta Airport",lat:58.789656,lng:16.911479},
  {code:"SCR",n:"Malung-Sälen — Scandinavian Mountains Airport",lat:61.16508,lng:12.83352},
  {code:"KLR",n:"Kalmar Airport",lat:56.685501,lng:16.2876},
  {code:"MMX",n:"Malmö Sturup Airport",lat:55.535564,lng:13.376327},
  {code:"HAD",n:"Halmstad Airport",lat:56.69110107421875,lng:12.820199966430664},
  {code:"VXO",n:"Växjö Kronoberg Airport",lat:56.929100036621094,lng:14.727999687194824},
  {code:"EVG",n:"Sveg Airport",lat:62.047798,lng:14.4229},
  {code:"GEV",n:"Gällivare Airport",lat:67.13240051269531,lng:20.814599990844727},
  {code:"KRF",n:"Nyland — Kramfors-Sollefteå Höga Kusten Airport",lat:63.048599,lng:17.7689},
  {code:"LYC",n:"Lycksele Airport",lat:64.548302,lng:18.7162},
  {code:"SDL",n:"Sundsvall/ Härnösand — Sundsvall-Härnösand Airport",lat:62.528099060058594,lng:17.443899154663086},
  {code:"OER",n:"Örnsköldsvik Airport",lat:63.40829849243164,lng:18.989999771118164},
  {code:"KRN",n:"Kiruna Airport",lat:67.821999,lng:20.3368},
  {code:"SFT",n:"Skellefteå Airport",lat:64.62480163574219,lng:21.076900482177734},
  {code:"UME",n:"Umeå Airport",lat:63.791801,lng:20.282801},
  {code:"VHM",n:"Vilhelmina South Lapland Airport",lat:64.579102,lng:16.833599},
  {code:"AJR",n:"Arvidsjaur Airport",lat:65.59030151367188,lng:19.28190040588379},
  {code:"OSD",n:"Åre Östersund Airport",lat:63.193546,lng:14.504168},
  {code:"ORB",n:"Örebro Airport",lat:59.22370147705078,lng:15.038000106811523},
  {code:"HFS",n:"Råda — Hagfors Airport",lat:60.0201,lng:13.5789},
  {code:"KSD",n:"Karlstad Airport",lat:59.444698,lng:13.3374},
  {code:"VST",n:"Stockholm / Västerås — Stockholm Västerås Airport",lat:59.589401,lng:16.6336},
  {code:"LLA",n:"Luleå Airport",lat:65.5438,lng:22.122},
  {code:"BMA",n:"Stockholm-Bromma Airport",lat:59.354401,lng:17.9417},
  {code:"BLE",n:"Borlange — Dala Airport",lat:60.422001,lng:15.5152},
  {code:"LPI",n:"Linköping City Airport",lat:58.404909,lng:15.684499},
  {code:"NRK",n:"Norrköping Airport",lat:58.586299896240234,lng:16.250600814819336},
  {code:"TYF",n:"Torsby Airport",lat:60.1576,lng:12.9913},
  {code:"VBY",n:"Visby Airport",lat:57.6628,lng:18.346201},
  {code:"AGH",n:"Ängelholm-Helsingborg Airport",lat:56.29610061645508,lng:12.847100257873535},
  {code:"PJA",n:"Pajala Airport",lat:67.244569,lng:23.074894},
  {code:"HMV",n:"Hemavan Airport",lat:65.806099,lng:15.0828},
  {code:"SHC",n:"Shire Inda Selassie Airport",lat:14.075699,lng:38.273592},
  {code:"FCN",n:"Wurster Nordseeküste — Sea-Airport Cuxhaven/Nordholz / Nordholz Naval Airbase",lat:53.767689,lng:8.659201},
  {code:"RLG",n:"Rostock-Laage Airport",lat:53.918201,lng:12.2783},
  {code:"PLQ",n:"Palanga International Airport",lat:55.973202,lng:21.093901},
  {code:"BFN",n:"Bloemfontein — Bram Fischer International Airport",lat:-29.092699,lng:26.302401},
  {code:"CPT",n:"Cape Town International Airport",lat:-33.97403,lng:18.604333},
  {code:"ELS",n:"East London — King Phalo Airport",lat:-33.035599,lng:27.825899},
  {code:"GRJ",n:"George Airport",lat:-34.0056,lng:22.378902},
  {code:"HDS",n:"Eastgate Airport / Air Force Base Hoedspruit",lat:-24.361864,lng:31.052921},
  {code:"KIM",n:"Kimberley Airport",lat:-28.805401,lng:24.764872},
  {code:"MQP",n:"Mbombela — Kruger Mpumalanga International Airport",lat:-25.383327,lng:31.105325},
  {code:"HLA",n:"Johannesburg — Lanseria International Airport",lat:-25.938964,lng:27.926642},
  {code:"DUR",n:"Durban — King Shaka International Airport",lat:-29.6144444444,lng:31.1197222222},
  {code:"MGH",n:"Margate Airport",lat:-30.8574008942,lng:30.343000412},
  {code:"MBD",n:"Mafeking — Mmabatho International Airport",lat:-25.798400878900004,lng:25.548000335699996},
  {code:"MZQ",n:"Mkuze Airport",lat:-27.626101,lng:32.0443},
  {code:"JNB",n:"Johannesburg — O.R. Tambo International Airport",lat:-26.140081,lng:28.246801},
  {code:"PLZ",n:"Gqeberha (Port Elizabeth) — Chief Dawid Stuurman International Airport",lat:-33.989715,lng:25.617353},
  {code:"PHW",n:"Phalaborwa — Hendrik Van Eck Airport",lat:-23.937200546299998,lng:31.1553993225},
  {code:"PZB",n:"Pietermaritzburg Airport",lat:-29.649000167799997,lng:30.3987007141},
  {code:"PTG",n:"Polokwane International Airport",lat:-23.845269,lng:29.458615},
  {code:"RCB",n:"Richards Bay Airport",lat:-28.740999221800003,lng:32.0920982361},
  {code:"SIS",n:"Sishen Airport",lat:-27.6486,lng:22.9993},
  {code:"SZK",n:"Skukuza Airport",lat:-24.96085,lng:31.588587},
  {code:"UTN",n:"Upington Airport",lat:-28.400246,lng:21.263592},
  {code:"UTT",n:"Mthatha — K. D. Matanzima Airport",lat:-31.546363184900002,lng:28.6733551025},
  {code:"FRW",n:"Francistown — Phillip Gaonwe Matante International Airport",lat:-21.159183,lng:27.468826},
  {code:"BBK",n:"Kasane International Airport",lat:-17.831653,lng:25.166195},
  {code:"MUB",n:"Maun International Airport",lat:-19.970491,lng:23.431409},
  {code:"GBE",n:"Gaborone — Sir Seretse Khama International Airport",lat:-24.555201,lng:25.9182},
  {code:"SWX",n:"Shakawe Airport",lat:-18.373899459838867,lng:21.832599639892578},
  {code:"BZV",n:"Brazzaville — Maya-Maya International Airport",lat:-4.2517,lng:15.253},
  {code:"PNR",n:"Pointe Noire — Antonio Agostinho-Neto International Airport",lat:-4.81603,lng:11.8866},
  {code:"SHO",n:"Mpaka — King Mswati III International Airport",lat:-26.358611,lng:31.716944},
  {code:"BGF",n:"Bangui M'Poko International Airport",lat:4.39848,lng:18.518801},
  {code:"NBN",n:"San Antonio de Palé — Annobón Airport",lat:-1.408615,lng:5.624163},
  {code:"BSG",n:"Bata International Airport",lat:1.90547,lng:9.80568},
  {code:"GEM",n:"Mengomeyén — President Obiang Nguema International Airport",lat:1.676437,lng:11.024904},
  {code:"SSG",n:"Malabo International Airport",lat:3.75527,lng:8.70872},
  {code:"ASI",n:"Cat Hill — RAF Ascension Island",lat:-7.970179,lng:-14.392744},
  {code:"HLE",n:"Jamestown — Saint Helena International Airport",lat:-15.958898,lng:-5.646066},
  {code:"MRU",n:"Plaine Magnien — Sir Seewoosagur Ramgoolam International Airport",lat:-20.430201,lng:57.683601},
  {code:"RRG",n:"Port Mathurin — Sir Charles Gaetan Duval Airport",lat:-19.757668,lng:63.36103},
  {code:"DLA",n:"Douala International Airport",lat:4.00608,lng:9.71948},
  {code:"MVR",n:"Maroua — Salak Airport",lat:10.451399803161621,lng:14.257399559020996},
  {code:"NGE",n:"N'Gaoundéré Airport",lat:7.3570098876953125,lng:13.559200286865234},
  {code:"GOU",n:"Garoua International Airport",lat:9.334785,lng:13.372129},
  {code:"NSI",n:"Yaoundé Nsimalen International Airport",lat:3.72256,lng:11.5533},
  {code:"KAA",n:"Kasama Airport",lat:-10.210169,lng:31.123045},
  {code:"LVI",n:"Livingstone — Harry Mwanga Nkumbula International Airport",lat:-17.821524,lng:25.819642},
  {code:"LUN",n:"Lusaka — Kenneth Kaunda International Airport",lat:-15.330833,lng:28.452722},
  {code:"MFU",n:"Mfuwe International Airport",lat:-13.2589,lng:31.9366},
  {code:"NLA",n:"Ndola — Simon Mwansa Kapwepwe International Airport",lat:-12.96513,lng:28.515624},
  {code:"SLI",n:"Solwesi Airport",lat:-12.173700332641602,lng:26.365100860595703},
  {code:"HAH",n:"Moroni — Prince Said Ibrahim International Airport",lat:-11.5337,lng:43.2719},
  {code:"AJN",n:"Ouani Airport",lat:-12.131047,lng:44.430044},
  {code:"DZA",n:"Dzaoudzi Pamandzi International Airport",lat:-12.809319,lng:45.281815},
  {code:"RUN",n:"Sainte-Marie — Roland Garros Airport",lat:-20.890087,lng:55.518894},
  {code:"ZSE",n:"Saint-Pierre Pierrefonds Airport",lat:-21.319362,lng:55.422506},
  {code:"TNR",n:"Antananarivo — Ivato International Airport",lat:-18.7969,lng:47.478802},
  {code:"SMS",n:"Vohilava — Sainte Marie Airport",lat:-17.093901,lng:49.8158},
  {code:"TMM",n:"Toamasina Ambalamanasy Airport",lat:-18.113537,lng:49.392262},
  {code:"WTA",n:"Tambohorano Airport",lat:-17.476101,lng:43.972801},
  {code:"MOQ",n:"Morondava Airport",lat:-20.2847,lng:44.3176},
  {code:"DIE",n:"Antisiranana — Arrachart Airport",lat:-12.3494,lng:49.291698},
  {code:"MJN",n:"Mahajanga — Amborovy Airport",lat:-15.666842,lng:46.351233},
  {code:"NOS",n:"Nosy Be International Airport",lat:-13.3121,lng:48.3148},
  {code:"DWB",n:"Soalala Airport",lat:-16.10169,lng:45.358837},
  {code:"BPY",n:"Besalampy Airport",lat:-16.74453,lng:44.482484},
  {code:"WMN",n:"Maroantsetra Airport",lat:-15.437742,lng:49.689081},
  {code:"SVB",n:"Sambava Airport",lat:-14.2786,lng:50.174702},
  {code:"TTS",n:"Tsaratanana Airport",lat:-16.751064,lng:47.619016},
  {code:"FTU",n:"Tôlanaro Airport",lat:-25.038099,lng:46.9561},
  {code:"MNJ",n:"Mananjary Airport",lat:-21.201799,lng:48.358299},
  {code:"TLE",n:"Toliara Airport",lat:-23.3834,lng:43.7285},
  {code:"SSY",n:"Mbanza Congo Airport",lat:-6.269899845123291,lng:14.246999740600586},
  {code:"NBJ",n:"Luanda (Ícolo e Bengo) — Dr. Antonio Agostinho Neto International Airport",lat:-9.050734,lng:13.499078},
  {code:"CAB",n:"Cabinda Airport",lat:-5.59839,lng:12.188145},
  {code:"CBT",n:"Catumbela Airport",lat:-12.4792,lng:13.4869},
  {code:"FND",n:"Funadhoo Airport",lat:6.162443,lng:73.28752},
  {code:"DUE",n:"Chitato — Dundo Airport",lat:-7.400889873504639,lng:20.818500518798828},
  {code:"VPE",n:"Ngiva — Ngjiva Pereira Airport",lat:-17.0435009003,lng:15.683799743700002},
  {code:"NOV",n:"Huambo — Albano Machado Airport",lat:-12.8089,lng:15.7605},
  {code:"LAD",n:"Luanda — Quatro de Fevereiro International Airport",lat:-8.85837,lng:13.2312},
  {code:"MEG",n:"Malanje Airport",lat:-9.525090217590332,lng:16.312400817871094},
  {code:"SPP",n:"Menongue Airport",lat:-14.657600402832031,lng:17.71980094909668},
  {code:"MSZ",n:"Moçâmedes — Welwitschia Mirabilis International Airport",lat:-15.2612,lng:12.1468},
  {code:"GXG",n:"Negage Airport",lat:-7.754509925842285,lng:15.287699699401855},
  {code:"SZA",n:"Soyo Airport",lat:-6.141089916229248,lng:12.371800422668457},
  {code:"SDD",n:"Lubango Mukanka International Airport",lat:-14.924839,lng:13.576653},
  {code:"OYE",n:"Oyem Airport",lat:1.5431100130081177,lng:11.581399917602539},
  {code:"POG",n:"Port Gentil International Airport",lat:-0.711739,lng:8.75438},
  {code:"MKU",n:"Makokou Airport",lat:0.5792109966278076,lng:12.890899658203125},
  {code:"LBV",n:"Libreville Leon M'ba International Airport",lat:0.458951,lng:9.41214},
  {code:"MVB",n:"Franceville — M'Vengue El Hadj Omar Bongo Ondimba International Airport",lat:-1.65616,lng:13.438},
  {code:"PCP",n:"São Tomé & Príncipe — Principe Airport",lat:1.661155,lng:7.411081},
  {code:"TMS",n:"São Tomé International Airport",lat:0.378175,lng:6.71215},
  {code:"BEW",n:"Beira International Airport",lat:-19.7964,lng:34.9076},
  {code:"VPY",n:"Chimoio Airport",lat:-19.15130043029785,lng:33.42900085449219},
  {code:"INH",n:"Inhambane Airport",lat:-23.8764,lng:35.408501},
  {code:"VXC",n:"Lichinga Airport",lat:-13.274,lng:35.2663},
  {code:"MPM",n:"Maputo Airport",lat:-25.920799,lng:32.572601},
  {code:"MNC",n:"Nacala International Airport",lat:-14.4882,lng:40.7122},
  {code:"APL",n:"Nampula Airport",lat:-15.1056,lng:39.281799},
  {code:"POL",n:"Pemba Airport",lat:-12.993302,lng:40.524867},
  {code:"UEL",n:"Quelimane Airport",lat:-17.855499267578125,lng:36.86909866333008},
  {code:"TET",n:"Tete Airport",lat:-16.104799,lng:33.640202},
  {code:"VNX",n:"Vilanculo — Vilankulo Airport",lat:-22.018400192260742,lng:35.31330108642578},
  {code:"VJB",n:"Xai-Xai Chongoene Airport",lat:-24.892909,lng:33.753024},
  {code:"SEZ",n:"Victoria — Seychelles International Airport",lat:-4.67434,lng:55.521801},
  {code:"PRI",n:"Praslin Island Airport",lat:-4.319256,lng:55.691561},
  {code:"NDJ",n:"N'Djamena International Airport",lat:12.1337,lng:15.034},
  {code:"BUQ",n:"Bulawayo — Joshua Mqabuko Nkomo International Airport",lat:-20.016284,lng:28.622897},
  {code:"VFA",n:"Victoria Falls International Airport",lat:-18.097437,lng:25.836867},
  {code:"HRE",n:"Harare — Robert Gabriel Mugabe International Airport",lat:-17.931801,lng:31.0928},
  {code:"KAB",n:"Kariba Airport",lat:-16.5198,lng:28.885},
  {code:"BLZ",n:"Blantyre — Chileka International Airport",lat:-15.677189,lng:34.972319},
  {code:"LLW",n:"Lumbadzi — Kamuzu International Airport",lat:-13.7894,lng:33.780998},
  {code:"MSU",n:"Maseru(Mazenod) — Moshoeshoe I International Airport",lat:-29.456277,lng:27.554456},
  {code:"HAL",n:"Halali Airport",lat:-19.0285,lng:16.4585},
  {code:"MPA",n:"Mpacha — Katima Mulilo Airport",lat:-17.634258,lng:24.176688},
  {code:"LUD",n:"Luderitz Airport",lat:-26.687400817871094,lng:15.242899894714355},
  {code:"OND",n:"Ondangwa Airport",lat:-17.878201,lng:15.9526},
  {code:"OMD",n:"Oranjemund Airport",lat:-28.585318,lng:16.44638},
  {code:"NDU",n:"Rundu Airport",lat:-17.956499,lng:19.7194},
  {code:"WVB",n:"Walvis Bay(Rooikop) — Walvis Bay International Airport",lat:-22.979332,lng:14.647102},
  {code:"ERS",n:"Windhoek — Eros Airport",lat:-22.60492,lng:17.079002},
  {code:"WDH",n:"Windhoek — Hosea Kutako International Airport",lat:-22.4799,lng:17.4709},
  {code:"FIH",n:"Kinshasa — Ndjili International Airport",lat:-4.38575,lng:15.4446},
  {code:"INO",n:"Inongo Airport",lat:-1.94722,lng:18.285801},
  {code:"FDU",n:"Bandundu Airport",lat:-3.31132,lng:17.381701},
  {code:"KKW",n:"Kikwit Airport",lat:-5.03577,lng:18.785601},
  {code:"MDK",n:"Mbandaka Airport",lat:0.0226000007242,lng:18.2887001038},
  {code:"BDT",n:"Gbadolite Airport",lat:4.252745,lng:20.975271},
  {code:"GMA",n:"Gemena Airport",lat:3.23537,lng:19.771299},
  {code:"BNB",n:"Boende Airport",lat:-0.286652,lng:20.883551},
  {code:"FKI",n:"Kisangani — Bangoka International Airport",lat:0.481639,lng:25.337999},
  {code:"IRP",n:"Isiro — Matari Airport",lat:2.82761,lng:27.588301},
  {code:"BUX",n:"Bunia Airport",lat:1.565743,lng:30.220685},
  {code:"GOM",n:"Goma International Airport",lat:-1.666758,lng:29.238037},
  {code:"KND",n:"Kindu Airport",lat:-2.91917991638,lng:25.915399551399997},
  {code:"FBM",n:"Lubumbashi International Airport",lat:-11.591494,lng:27.530753},
  {code:"KWZ",n:"Kolwezi Airport",lat:-10.7659,lng:25.505699},
  {code:"FMI",n:"Kalemie Airport",lat:-5.87556,lng:29.25},
  {code:"KMN",n:"Kamina City Airport",lat:-8.728878,lng:24.991407},
  {code:"KGA",n:"Kananga Airport",lat:-5.90005,lng:22.4692},
  {code:"PFR",n:"Ilebo Airport",lat:-4.329919,lng:20.590124},
  {code:"MJM",n:"Mbuji Mayi Airport",lat:-6.121240139010001,lng:23.569000244099996},
  {code:"GAX",n:"Gamba Airport",lat:-2.785278,lng:10.047222},
  {code:"BKO",n:"Bamako — Modibo Keita International Airport",lat:12.5335,lng:-7.94994},
  {code:"GAQ",n:"Gao International Airport",lat:16.248466,lng:-0.005389},
  {code:"KYS",n:"Kayes Dag Dag Airport",lat:14.482521,lng:-11.399335},
  {code:"MZI",n:"Sévaré — Mopti Airport",lat:14.5128,lng:-4.07956},
  {code:"TOM",n:"Timbuktu — Tombouktou Airport",lat:16.730499,lng:-3.00758},
  {code:"FOA",n:"Foula Airfield",lat:60.121916,lng:-2.053439},
  {code:"BJL",n:"Banjul (Yundum) — Banjul International Airport",lat:13.338,lng:-16.652201},
  {code:"FUE",n:"El Matorral — Fuerteventura Airport",lat:28.4527,lng:-13.8638},
  {code:"GMZ",n:"Alajero, La Gomera Island — La Gomera Airport",lat:28.0296,lng:-17.2146},
  {code:"VDE",n:"El Hierro Island — El Hierro Airport",lat:27.8148,lng:-17.8871},
  {code:"SPC",n:"Sta Cruz de la Palma, La Palma Island — La Palma Airport",lat:28.626499,lng:-17.7556},
  {code:"LPA",n:"Gran Canaria Island — Gran Canaria Airport",lat:27.9319,lng:-15.3866},
  {code:"ACE",n:"San Bartolomé — César Manrique-Lanzarote Airport",lat:28.945499,lng:-13.6052},
  {code:"TFS",n:"Tenerife Sur Airport",lat:28.0445,lng:-16.5725},
  {code:"TFN",n:"Tenerife Norte-Ciudad de La Laguna Airport",lat:28.482752,lng:-16.341707},
  {code:"MLN",n:"Melilla Airport",lat:35.2798,lng:-2.95626},
  {code:"FNA",n:"Freetown (Lungi-Town) — Lungi International Airport",lat:8.61644,lng:-13.1955},
  {code:"OXB",n:"Bissau — Osvaldo Vieira International Airport",lat:11.894262,lng:-15.653596},
  {code:"JJU",n:"Qaqortoq Airport",lat:60.76383,lng:-46.065001},
  {code:"MLW",n:"Monrovia — Spriggs Payne Airport",lat:6.28906,lng:-10.7587},
  {code:"ROB",n:"Monrovia — Roberts International Airport",lat:6.23379,lng:-10.3623},
  {code:"AGA",n:"Agadir (Temsia) — Al Massira Airport",lat:30.322478,lng:-9.412003},
  {code:"TTA",n:"Tan Tan Airport",lat:28.447563,lng:-11.161749},
  {code:"OZG",n:"Zagora Airport",lat:30.265788,lng:-5.860808},
  {code:"UAR",n:"Bouarfa Airport",lat:32.514306,lng:-1.983056},
  {code:"FEZ",n:"Fes Saïss International Airport",lat:33.927299,lng:-4.97796},
  {code:"ERH",n:"Errachidia — Moulay Ali Cherif Airport",lat:31.9475002289,lng:-4.39833021164},
  {code:"OUD",n:"Ahl Angad — Oujda Angads Airport",lat:34.789558,lng:-1.926041},
  {code:"SMW",n:"Smara Airport",lat:26.731987,lng:-11.683655},
  {code:"BEM",n:"Oulad Yaich — Beni Mellal Airport",lat:32.401895,lng:-6.315905},
  {code:"RBA",n:"Rabat-Salé Airport",lat:34.051498,lng:-6.75152},
  {code:"VIL",n:"Dakhla Airport",lat:23.7183,lng:-15.932},
  {code:"ESU",n:"Essaouira-Mogador Airport",lat:31.397499,lng:-9.68167},
  {code:"EUN",n:"El Aaiún — Laayoune Hassan I International Airport",lat:27.142467,lng:-13.224947},
  {code:"CMN",n:"Casablanca — Mohammed V International Airport",lat:33.3675,lng:-7.58997},
  {code:"NDR",n:"Nador Al Aaroui International Airport",lat:34.9888,lng:-3.02821},
  {code:"RAK",n:"Marrakesh Menara Airport",lat:31.604807,lng:-8.035788},
  {code:"OZZ",n:"Ouarzazate International Airport",lat:30.9391,lng:-6.90943},
  {code:"AHU",n:"Al Hoceima — Cherif Al Idrissi Airport",lat:35.177101,lng:-3.83952},
  {code:"TTU",n:"Tétouan — Sania Ramel Airport",lat:35.594299,lng:-5.32002},
  {code:"TNG",n:"Tangier Ibn Battuta Airport",lat:35.731741,lng:-5.921459},
  {code:"GNU",n:"Goodnews Airport",lat:59.117561,lng:-161.575241},
  {code:"DSS",n:"Dakar — Blaise Diagne International Airport",lat:14.670878,lng:-17.072829},
  {code:"ZIG",n:"Ziguinchor Airport",lat:12.55559,lng:-16.283298},
  {code:"CSK",n:"Cap Skirring Airport",lat:12.39533,lng:-16.748},
  {code:"NKC",n:"Nouakchott–Oumtounsy International Airport",lat:18.31,lng:-15.969722},
  {code:"NDB",n:"Nouadhibou International Airport",lat:20.932404,lng:-17.030199},
  {code:"OUZ",n:"Zouérate — Tazadit Airport",lat:22.757345,lng:-12.482228},
  {code:"CKY",n:"Conakry — Ahmed Sékou Touré International Airport",lat:9.57689,lng:-13.612},
  {code:"SID",n:"Espargos — Amílcar Cabral International Airport",lat:16.7414,lng:-22.9494},
  {code:"BVC",n:"Rabil — Aristides Pereira International Airport",lat:16.136499,lng:-22.888901},
  {code:"MMO",n:"Vila do Maio — Maio Airport",lat:15.155900001525879,lng:-23.213699340820312},
  {code:"RAI",n:"Praia — Nelson Mandela International Airport",lat:14.941126,lng:-23.484728},
  {code:"SFL",n:"São Filipe Airport",lat:14.8850002289,lng:-24.4799995422},
  {code:"SNE",n:"Preguiça Airport",lat:16.588852,lng:-24.284132},
  {code:"VXE",n:"São Pedro — Cesaria Evora International Airport",lat:16.833363,lng:-25.055308},
  {code:"ADD",n:"Addis Ababa Bole International Airport",lat:8.97789,lng:38.799301},
  {code:"AMH",n:"Arba Minch Airport",lat:6.03939,lng:37.5905},
  {code:"AXU",n:"Axum Airport",lat:14.1468,lng:38.7728},
  {code:"BJR",n:"Bahir Dar Airport",lat:11.6081,lng:37.321602},
  {code:"DSE",n:"Dessie — Kombolcha Airport",lat:11.10975,lng:39.725911},
  {code:"DEM",n:"Dembidollo Airport",lat:8.554,lng:34.858002},
  {code:"DBM",n:"Debre Markos Airport",lat:10.321501,lng:37.741887},
  {code:"DIR",n:"Dire Dawa — Aba Tenna Dejazmach Yilma International Airport",lat:9.623549,lng:41.855027},
  {code:"GMB",n:"Gambela Airport",lat:8.12876,lng:34.563099},
  {code:"GDQ",n:"Azezo — Gondar Airport",lat:12.5199,lng:37.433998},
  {code:"GDE",n:"Gode Airport",lat:5.93513011932,lng:43.5786018372},
  {code:"HUE",n:"Akwi — Humera Airport",lat:13.83012,lng:36.88237},
  {code:"JIJ",n:"Jijiga — Gerad Wilwal International Airport",lat:9.331907,lng:42.911811},
  {code:"BCO",n:"Jinka Airport",lat:5.749655,lng:36.560165},
  {code:"JIM",n:"Jimma Airport",lat:7.66609001159668,lng:36.81660079956055},
  {code:"ABK",n:"Kebri Dahar Airport",lat:6.732577,lng:44.241339},
  {code:"AWA",n:"Hawassa International Airport",lat:7.100611,lng:38.396455},
  {code:"MQX",n:"Mekele Alula Aba Nega Airport",lat:13.4674,lng:39.533501},
  {code:"MTF",n:"Mizan Teferi Airport",lat:6.9571,lng:35.5547},
  {code:"HIL",n:"Shilavo Airport",lat:6.077545,lng:44.763736},
  {code:"SZE",n:"Semera Airport",lat:11.7875,lng:40.9915},
  {code:"ASO",n:"Asosa Airport",lat:10.018500328063965,lng:34.586299896240234},
  {code:"TIE",n:"Tippi Airport",lat:7.2024,lng:35.415},
  {code:"BJM",n:"Bujumbura Melchior Ndadaye International Airport",lat:-3.32402,lng:29.318501},
  {code:"GID",n:"Gitega Airport",lat:-3.417209,lng:29.911308},
  {code:"KRE",n:"Kirundo Airport",lat:-2.544772,lng:30.094575},
  {code:"BSA",n:"Bosaso — Bender Qassim International Airport",lat:11.275235,lng:49.139231},
  {code:"HGA",n:"Hargeisa — Egal International Airport",lat:9.514082,lng:44.083469},
  {code:"BBO",n:"Berbera Airport",lat:10.385035,lng:44.936723},
  {code:"MGQ",n:"Mogadishu — Aden Adde International Airport",lat:2.01444,lng:45.304699},
  {code:"BLW",n:"Beledweyne Airport",lat:4.766976,lng:45.2388},
  {code:"GLK",n:"Galcaio Airport",lat:6.78082990646,lng:47.45470047},
  {code:"GGR",n:"Garowe Airport",lat:8.458474,lng:48.568136},
  {code:"JIB",n:"Djibouti City — Djibouti-Ambouli Airport",lat:11.5473,lng:43.1595},
  {code:"DBB",n:"El Alamein International Airport",lat:30.924324,lng:28.46161},
  {code:"AAC",n:"El Arish International Airport",lat:31.055324,lng:33.827964},
  {code:"ATZ",n:"Asyut International Airport",lat:27.045962,lng:31.01276},
  {code:"HBE",n:"Alexandria International Airport",lat:30.93249,lng:29.696437},
  {code:"ABS",n:"Abu Simbel Airport",lat:22.375924,lng:31.611734},
  {code:"CCE",n:"New Cairo — Capital International Airport",lat:30.06465,lng:31.839974},
  {code:"LXR",n:"Luxor International Airport",lat:25.671018,lng:32.706446},
  {code:"RMF",n:"Marsa Alam International Airport",lat:25.555548,lng:34.59245},
  {code:"MUH",n:"Marsa Matruh — Mersa Matruh International Airport",lat:31.324313,lng:27.22227},
  {code:"PSD",n:"Port Said International Airport",lat:31.279285,lng:32.240582},
  {code:"HMB",n:"Suhaj International Airport",lat:26.342515,lng:31.743017},
  {code:"ASW",n:"Aswan International Airport",lat:23.961075,lng:32.820382},
  {code:"SPX",n:"Al Jiza — Sphinx International Airport",lat:30.108179,lng:30.895728},
  {code:"TCP",n:"Taba International Airport",lat:29.594496,lng:34.775752},
  {code:"ASM",n:"Asmara International Airport",lat:15.2919,lng:38.910702},
  {code:"JUB",n:"Juba International Airport",lat:4.87201,lng:31.601101},
  {code:"ASV",n:"Ol Tukai — Amboseli Airport",lat:-2.644786,lng:37.252922},
  {code:"EDL",n:"Eldoret International Airport",lat:0.404458,lng:35.238899},
  {code:"NBO",n:"Nairobi — Jomo Kenyatta International Airport",lat:-1.318886,lng:36.928233},
  {code:"KIS",n:"Kisumu International Airport",lat:-0.086139,lng:34.728901},
  {code:"LAU",n:"Lamu — Manda Airport",lat:-2.252431,lng:40.912892},
  {code:"JJM",n:"Meru-Kinna — Mulika Lodge Airport",lat:0.165083,lng:38.195141},
  {code:"MYD",n:"Malindi International Airport",lat:-3.22931,lng:40.1017},
  {code:"MBA",n:"Mombasa — Moi International Airport",lat:-4.03483,lng:39.5942},
  {code:"MRE",n:"Mara Serena Lodge Airstrip",lat:-1.404588,lng:35.008349},
  {code:"NYK",n:"Gathiuru — Nanyuki Civil Airport",lat:-0.062352,lng:37.041296},
  {code:"WIL",n:"Nairobi Wilson Airport",lat:-1.32172,lng:36.8148},
  {code:"WJR",n:"Wajir Airport",lat:1.73324,lng:40.091599},
  {code:"AKF",n:"Kufra Airport",lat:24.178699493408203,lng:23.31399917602539},
  {code:"BEN",n:"Benina International Airport",lat:32.096802,lng:20.269501},
  {code:"MJI",n:"Tripoli — Mitiga International Airport",lat:32.89177,lng:13.287878},
  {code:"LAQ",n:"Al Albraq — Al Abraq International Airport",lat:32.789036,lng:21.954864},
  {code:"SEB",n:"Sabha Airport",lat:26.992452,lng:14.466162},
  {code:"MRA",n:"Misrata International Airport",lat:32.325001,lng:15.061},
  {code:"LTD",n:"Ghadames Airport",lat:30.145484,lng:9.702095},
  {code:"KGL",n:"Kigali International Airport",lat:-1.96863,lng:30.1395},
  {code:"KME",n:"Kamembe Airport",lat:-2.462239980697632,lng:28.907899856567383},
  {code:"DOG",n:"Dongola Airport",lat:19.153666,lng:30.430069},
  {code:"ELF",n:"El Fasher Airport",lat:13.614899635314941,lng:25.324600219726562},
  {code:"KSL",n:"Kassala Airport",lat:15.387499809265137,lng:36.328800201416016},
  {code:"UYL",n:"Nyala Airport",lat:12.0535,lng:24.9562},
  {code:"EBD",n:"El-Obeid Airport",lat:13.1532,lng:30.2327},
  {code:"PZU",n:"Port Sudan New International Airport",lat:19.434558,lng:37.234125},
  {code:"KRT",n:"Khartoum International Airport",lat:15.5895,lng:32.5532},
  {code:"MAK",n:"Malakal International Airport",lat:9.558739,lng:31.651937},
  {code:"WUU",n:"Wau Airport",lat:7.72583,lng:27.975},
  {code:"ARK",n:"Arusha Airport",lat:-3.3677899837493896,lng:36.63330078125},
  {code:"BKZ",n:"Bukoba Airport",lat:-1.332,lng:31.8212},
  {code:"DAR",n:"Dar es Salaam — Julius Nyerere International Airport",lat:-6.873499,lng:39.207288},
  {code:"DOD",n:"Dodoma Airport",lat:-6.170559,lng:35.756036},
  {code:"MBI",n:"Mbeya — Songwe Airport",lat:-8.919942,lng:33.273981},
  {code:"TKQ",n:"Kigoma Airport",lat:-4.8862,lng:29.6709},
  {code:"JRO",n:"Arusha — Kilimanjaro International Airport",lat:-3.427049,lng:37.07353},
  {code:"MFA",n:"Kilindoni — Mafia Airport",lat:-7.917478,lng:39.668502},
  {code:"MYW",n:"Mtwara Airport",lat:-10.336204,lng:40.181997},
  {code:"MUZ",n:"Musoma Airport",lat:-1.503,lng:33.8021},
  {code:"MWZ",n:"Mwanza International Airport",lat:-2.446563,lng:32.936049},
  {code:"SEU",n:"Seronera Airport",lat:-2.45806,lng:34.822498},
  {code:"SHY",n:"Shinyanga Airport",lat:-3.6093,lng:33.5035},
  {code:"TBO",n:"Tabora Airport",lat:-5.07639,lng:32.833302},
  {code:"TGT",n:"Tanga Airport",lat:-5.09236,lng:39.071201},
  {code:"ZNZ",n:"Zanzibar — Abeid Amani Karume International Airport",lat:-6.22202,lng:39.224899},
  {code:"RUA",n:"Arua Airport",lat:3.049152,lng:30.911714},
  {code:"EBB",n:"Entebbe International Airport",lat:0.042386,lng:32.443501},
  {code:"ULU",n:"Gulu Airport",lat:2.8055601119995117,lng:32.27180099487305},
  {code:"SRT",n:"Soroti Airport",lat:1.7276899814605713,lng:33.622798919677734},
  {code:"FSH",n:"Singkil — Syekh Hamzah Fansyuri Airport",lat:2.269614,lng:97.967863},
  {code:"DHX",n:"Kediri — Dhoho International Airport",lat:-7.749527,lng:111.946831},
  {code:"KRC",n:"Sungai Penuh — Departi Parbo Airport",lat:-2.094042,lng:101.47025},
  {code:"RKI",n:"Sipura Island — Mentawai Airport",lat:-2.1001,lng:99.7044},
  {code:"UGU",n:"Bilogai — Bilorai Airport",lat:-3.739503,lng:137.031183},
  {code:"AYJ",n:"Faizabad — Maharshi Valmiki International Airport",lat:26.747736,lng:82.163664},
  {code:"AVR",n:"Amravati  Airport",lat:20.814608,lng:77.717765},
  {code:"SDW",n:"Chipi — Sindhudurg Airport",lat:16.002552,lng:73.529846},
  {code:"NMI",n:"Navi Mumbai International Airport",lat:18.984597,lng:73.065253},
  {code:"HGI",n:"Itanagar Donyi Polo Hollongi Airport",lat:26.96683,lng:93.638792},
  {code:"DXN",n:"Gautam Buddha Nagar — Noida International Airport",lat:28.179868,lng:77.611843},
  {code:"AHA",n:"Ambikapur — Maa Mahamaya Airport",lat:22.98753,lng:83.19612},
  {code:"JGB",n:"Jagdalpur Airport",lat:19.074301,lng:82.036797},
  {code:"JIO",n:"Tiakur — Jos Orno Imsula Airport",lat:-8.140683,lng:127.909669},
  {code:"JUH",n:"Chizhou Jiuhuashan Airport",lat:30.7403,lng:117.6856},
  {code:"BLD",n:"Boulder City Municipal Airport",lat:35.947161,lng:-114.858799},
  {code:"OTS",n:"Anacortes Airport",lat:48.498513,lng:-122.662513},
  {code:"ABE",n:"Allentown/Bethlehem — Lehigh Valley International Airport",lat:40.651773,lng:-75.442797},
  {code:"ABI",n:"Abilene Regional Airport",lat:32.4113006592,lng:-99.68190002440001},
  {code:"ABQ",n:"Albuquerque International Sunport",lat:35.039976,lng:-106.608925},
  {code:"ABR",n:"Aberdeen Regional Airport",lat:45.449100494384766,lng:-98.42179870605469},
  {code:"ABY",n:"Albany — Southwest Georgia Regional Airport",lat:31.532946,lng:-84.196215},
  {code:"ACK",n:"Nantucket Memorial Airport",lat:41.25310135,lng:-70.06020355},
  {code:"ACT",n:"Waco Regional Airport",lat:31.611299514770508,lng:-97.23049926757812},
  {code:"ACV",n:"Arcata/Eureka — California Redwood Coast-Humboldt County Airport",lat:40.978101,lng:-124.109},
  {code:"ACY",n:"Atlantic City International Airport",lat:39.456201,lng:-74.577511},
  {code:"AEX",n:"Alexandria International Airport",lat:31.325828,lng:-92.546702},
  {code:"AGS",n:"Augusta Regional At Bush Field",lat:33.3699,lng:-81.9645},
  {code:"AIA",n:"Alliance Municipal Airport",lat:42.052543,lng:-102.803965},
  {code:"ALB",n:"Albany International Airport",lat:42.748299,lng:-73.801697},
  {code:"ALO",n:"Waterloo Regional Airport",lat:42.557098388671875,lng:-92.40029907226562},
  {code:"ALS",n:"Alamosa — San Luis Valley Regional Airport/Bergman Field",lat:37.434898,lng:-105.866997},
  {code:"ALW",n:"Walla Walla Regional Airport",lat:46.09489822,lng:-118.288002},
  {code:"AMA",n:"Rick Husband Amarillo International Airport",lat:35.217857,lng:-101.706444},
  {code:"AOO",n:"Altoona Blair County Airport",lat:40.296398,lng:-78.32},
  {code:"APN",n:"Alpena County Regional Airport",lat:45.0780983,lng:-83.56030273},
  {code:"ART",n:"Watertown International Airport",lat:43.991901,lng:-76.021698},
  {code:"ASE",n:"Aspen-Pitkin County Airport (Sardy Field)",lat:39.223202,lng:-106.869003},
  {code:"ATL",n:"Hartsfield Jackson Atlanta International Airport",lat:33.6367,lng:-84.428101},
  {code:"ATW",n:"Appleton International Airport",lat:44.258515,lng:-88.519},
  {code:"ATY",n:"Watertown Regional Airport",lat:44.91400146,lng:-97.15470123},
  {code:"AUG",n:"Augusta State Airport",lat:44.320598602299995,lng:-69.7973022461},
  {code:"AUS",n:"Austin Bergstrom International Airport",lat:30.197535,lng:-97.662015},
  {code:"AVL",n:"Asheville Regional Airport",lat:35.435488,lng:-82.541853},
  {code:"AVP",n:"Wilkes-Barre/Scranton International Airport",lat:41.337064,lng:-75.724232},
  {code:"AZO",n:"Kalamazoo/Battle Creek International Airport",lat:42.232105,lng:-85.549637},
  {code:"BKG",n:"Branson Airport",lat:36.532082,lng:-93.200544},
  {code:"BDL",n:"Hartford — Bradley International Airport",lat:41.938555,lng:-72.688016},
  {code:"BED",n:"Bedford — Laurence G Hanscom Field",lat:42.470001,lng:-71.289001},
  {code:"BFD",n:"Bradford Regional Airport",lat:41.8031005859375,lng:-78.64009857177734},
  {code:"BFF",n:"Scottsbluff — Western Neb. Rgnl/William B. Heilig Airport",lat:41.87400055,lng:-103.5960007},
  {code:"BFI",n:"Seattle — King County International Airport - Boeing Field",lat:47.527042,lng:-122.29995},
  {code:"BFL",n:"Bakersfield — Meadows Field",lat:35.433601,lng:-119.056999},
  {code:"BGM",n:"Greater Binghamton/Edwin A Link field",lat:42.20869827,lng:-75.97979736},
  {code:"BGR",n:"Bangor International Airport",lat:44.806364,lng:-68.826668},
  {code:"BHB",n:"Hancock County-Bar Harbor Airport",lat:44.45000076,lng:-68.3615036},
  {code:"BHM",n:"Birmingham-Shuttlesworth International Airport",lat:33.562877,lng:-86.750712},
  {code:"BID",n:"Block Island State Airport",lat:41.168446,lng:-71.578631},
  {code:"BIH",n:"Bishop — Eastern Sierra Regional Airport",lat:37.3731,lng:-118.363998},
  {code:"BIL",n:"Billings Logan International Airport",lat:45.808932,lng:-108.541242},
  {code:"BIS",n:"Bismarck Municipal Airport",lat:46.772734,lng:-100.746874},
  {code:"BJC",n:"Denver — Rocky Mountain Metropolitan Airport",lat:39.908798,lng:-105.116997},
  {code:"BKW",n:"Beaver — Raleigh County Memorial Airport",lat:37.7873,lng:-81.124199},
  {code:"BLI",n:"Bellingham International Airport",lat:48.79280090332031,lng:-122.53800201416016},
  {code:"BLV",n:"Belleville — Scott AFB/Midamerica Airport",lat:38.5452,lng:-89.835197},
  {code:"BMI",n:"Bloomington/Normal — Central Illinois Regional Airport at Bloomington-Normal",lat:40.4771,lng:-88.915901},
  {code:"BNA",n:"Nashville International Airport",lat:36.1245,lng:-86.6782},
  {code:"BOI",n:"Boise Air Terminal/Gowen Field",lat:43.5644,lng:-116.223},
  {code:"BOS",n:"Boston Logan International Airport",lat:42.36197,lng:-71.0079},
  {code:"BPT",n:"Beaumont/Port Arthur — Jack Brooks Regional Airport",lat:29.9508,lng:-94.020699},
  {code:"BQK",n:"Brunswick Golden Isles Airport",lat:31.258801,lng:-81.466499},
  {code:"BRD",n:"Brainerd Lakes Regional Airport",lat:46.402861,lng:-94.129727},
  {code:"BRL",n:"Burlington — Southeast Iowa Regional Airport",lat:40.783199310302734,lng:-91.12550354003906},
  {code:"BRO",n:"Brownsville South Padre Island International Airport",lat:25.907238,lng:-97.425235},
  {code:"BTM",n:"Butte — Bert Mooney Airport",lat:45.95479965209961,lng:-112.49700164794922},
  {code:"BTR",n:"Baton Rouge Metropolitan Airport",lat:30.533199,lng:-91.149597},
  {code:"BTV",n:"Patrick Leahy Burlington International Airport",lat:44.471901,lng:-73.153297},
  {code:"BUF",n:"Buffalo Niagara International Airport",lat:42.940498,lng:-78.732201},
  {code:"BUR",n:"Hollywood Burbank/Bob Hope Airport",lat:34.202834,lng:-118.35805},
  {code:"BWI",n:"Baltimore/Washington International Thurgood Marshall Airport",lat:39.1754,lng:-76.668297},
  {code:"BZN",n:"Bozeman Yellowstone International Airport",lat:45.778853,lng:-111.153711},
  {code:"CAE",n:"Columbia Metropolitan Airport",lat:33.938172,lng:-81.123022},
  {code:"CAK",n:"Akron Canton Regional Airport",lat:40.916099548339844,lng:-81.44219970703125},
  {code:"CCR",n:"Concord — Buchanan Field",lat:37.9897,lng:-122.056999},
  {code:"CDC",n:"Cedar City Regional Airport",lat:37.70100021362305,lng:-113.0989990234375},
  {code:"CDR",n:"Chadron Municipal Airport",lat:42.837601,lng:-103.095001},
  {code:"CEC",n:"Crescent City — Jack Mc Namara Field Airport",lat:41.778929,lng:-124.236403},
  {code:"CEZ",n:"Cortez Municipal Airport",lat:37.303001,lng:-108.627998},
  {code:"CGI",n:"Cape Girardeau Regional Airport",lat:37.2253,lng:-89.570801},
  {code:"CHA",n:"Chattanooga Metropolitan Airport (Lovell Field)",lat:35.035301,lng:-85.203796},
  {code:"CHO",n:"Charlottesville Albemarle Airport",lat:38.13859939575195,lng:-78.4529037475586},
  {code:"CHS",n:"Charleston International Airport",lat:32.896159,lng:-80.038151},
  {code:"CID",n:"Cedar Rapids — The Eastern Iowa Airport",lat:41.884701,lng:-91.7108},
  {code:"CIU",n:"Kincheloe — Chippewa County International Airport",lat:46.242038,lng:-84.462082},
  {code:"CKB",n:"Bridgeport — North Central West Virginia Airport",lat:39.2966,lng:-80.228104},
  {code:"CLE",n:"Cleveland Hopkins International Airport",lat:41.411701,lng:-81.8498},
  {code:"CLL",n:"College Station — Easterwood Field",lat:30.5886,lng:-96.3638},
  {code:"CLT",n:"Charlotte Douglas International Airport",lat:35.2140007019043,lng:-80.94309997558594},
  {code:"CMH",n:"John Glenn Columbus International Airport",lat:39.998001,lng:-82.891899},
  {code:"CMI",n:"Savoy — University of Illinois Willard Airport",lat:40.039819,lng:-88.276249},
  {code:"CMX",n:"Hancock — Houghton County Memorial Airport",lat:47.168399810791016,lng:-88.48909759521484},
  {code:"CNM",n:"Carlsbad — Cavern City Air Terminal",lat:32.337501525878906,lng:-104.26300048828125},
  {code:"CNY",n:"Moab — Canyonlands Regional Airport",lat:38.755001,lng:-109.754997},
  {code:"COD",n:"Cody — Yellowstone Regional Airport",lat:44.520199,lng:-109.024002},
  {code:"COS",n:"City of Colorado Springs Municipal Airport",lat:38.805801,lng:-104.700996},
  {code:"COU",n:"Columbia Regional Airport",lat:38.8181,lng:-92.219597},
  {code:"CPR",n:"Casper-Natrona County International Airport",lat:42.907381,lng:-106.461609},
  {code:"CRP",n:"Corpus Christi International Airport",lat:27.770399,lng:-97.501198},
  {code:"CLD",n:"Carlsbad — McClellan-Palomar Airport",lat:33.1283,lng:-117.279999},
  {code:"CRW",n:"Charleston — Yeager Airport",lat:38.3731,lng:-81.593201},
  {code:"CSG",n:"Columbus Airport",lat:32.516415,lng:-84.939602},
  {code:"CVG",n:"Cincinnati / Covington — Cincinnati Northern Kentucky International Airport",lat:39.048801,lng:-84.667801},
  {code:"CVN",n:"Clovis Municipal Airport",lat:34.426594,lng:-103.078794},
  {code:"CWA",n:"Mosinee — Central Wisconsin Airport",lat:44.777448,lng:-89.670238},
  {code:"CYS",n:"Cheyenne Regional Jerry Olson Field",lat:41.155701,lng:-104.811997},
  {code:"DAB",n:"Daytona Beach International Airport",lat:29.18255,lng:-81.059464},
  {code:"DAL",n:"Dallas Love Field",lat:32.844776,lng:-96.847653},
  {code:"DAY",n:"James M. Cox Dayton International Airport",lat:39.902401,lng:-84.219398},
  {code:"DBQ",n:"Dubuque Regional Airport",lat:42.402,lng:-90.709503},
  {code:"DCA",n:"Ronald Reagan Washington National Airport",lat:38.8521,lng:-77.037697},
  {code:"DDC",n:"Dodge City Regional Airport",lat:37.76340103149414,lng:-99.9655990600586},
  {code:"DEC",n:"Decatur Airport",lat:39.834598541259766,lng:-88.8656997680664},
  {code:"DEN",n:"Denver International Airport",lat:39.860027,lng:-104.673792},
  {code:"DFW",n:"Dallas-Fort Worth — Dallas Fort Worth International Airport",lat:32.896801,lng:-97.038002},
  {code:"DHN",n:"Dothan Regional Airport",lat:31.321300506591797,lng:-85.44960021972656},
  {code:"DIK",n:"Dickinson Theodore Roosevelt Regional Airport",lat:46.797533,lng:-102.801905},
  {code:"DLH",n:"Duluth International Airport",lat:46.841873,lng:-92.198746},
  {code:"DOV",n:"Dover Civil Air Terminal/Dover Air Force Base",lat:39.129501,lng:-75.466003},
  {code:"DRO",n:"Durango La Plata County Airport",lat:37.151501,lng:-107.753998},
  {code:"DSM",n:"Des Moines International Airport",lat:41.534027,lng:-93.656719},
  {code:"DSI",n:"Destin Executive Airport",lat:30.400101,lng:-86.471497},
  {code:"DTW",n:"Detroit Metropolitan Wayne County Airport",lat:42.21377,lng:-83.353786},
  {code:"DUJ",n:"DuBois Regional Airport",lat:41.17829895,lng:-78.8986969},
  {code:"DVL",n:"Devils Lake Regional Airport",lat:48.115454,lng:-98.908796},
  {code:"EAR",n:"Kearney Regional Airport",lat:40.727001,lng:-99.006798},
  {code:"EAT",n:"Wenatchee — Pangborn Memorial Airport",lat:47.398899,lng:-120.207001},
  {code:"EAU",n:"Eau Claire — Chippewa Valley Regional Airport",lat:44.86579895019531,lng:-91.48429870605469},
  {code:"KEB",n:"Nanwalek Airport",lat:59.3521,lng:-151.925003},
  {code:"ECP",n:"Panama City Beach — Northwest Florida Beaches International Airport",lat:30.357106,lng:-85.795414},
  {code:"EGE",n:"Eagle County Regional Airport",lat:39.64260101,lng:-106.9179993},
  {code:"EKO",n:"Elko Regional Airport",lat:40.82490158081055,lng:-115.79199981689453},
  {code:"ELD",n:"El Dorado — South Arkansas Regional Airport at Goodwin Field",lat:33.221001,lng:-92.813301},
  {code:"ELM",n:"Elmira/Corning — Elmira Corning Regional Airport",lat:42.1599006652832,lng:-76.8916015625},
  {code:"ELP",n:"El Paso International Airport",lat:31.809908,lng:-106.375607},
  {code:"ERI",n:"Erie International Tom Ridge Field",lat:42.083127,lng:-80.173867},
  {code:"ESC",n:"Escanaba — Delta County Airport",lat:45.723199,lng:-87.088623},
  {code:"EUG",n:"Eugene Airport",lat:44.124599,lng:-123.211998},
  {code:"EVV",n:"Evansville Regional Airport",lat:38.0369987488,lng:-87.5324020386},
  {code:"EWB",n:"New Bedford Regional Airport",lat:41.67610168457031,lng:-70.95690155029297},
  {code:"EWN",n:"New Bern — Coastal Carolina Regional Airport",lat:35.0730018616,lng:-77.04290008539999},
  {code:"EWR",n:"Newark Liberty International Airport",lat:40.6894,lng:-74.170545},
  {code:"EYW",n:"Key West International Airport",lat:24.556119,lng:-81.759579},
  {code:"FAR",n:"Fargo — Hector International Airport",lat:46.9207,lng:-96.815804},
  {code:"FAT",n:"Fresno Yosemite International Airport",lat:36.775767,lng:-119.718018},
  {code:"FAY",n:"Fayetteville Regional Airport - Grannis Field",lat:34.991199,lng:-78.880302},
  {code:"FRD",n:"Friday Harbor Airport",lat:48.523654,lng:-123.024645},
  {code:"FLG",n:"Flagstaff Pulliam Airport",lat:35.139757,lng:-111.669826},
  {code:"FLL",n:"Fort Lauderdale Hollywood International Airport",lat:26.072599,lng:-80.152702},
  {code:"FLO",n:"Florence Regional Airport",lat:34.18539810180664,lng:-79.7238998413086},
  {code:"FNT",n:"Flint — Bishop International Airport",lat:42.969294,lng:-83.743355},
  {code:"FOD",n:"Fort Dodge Regional Airport",lat:42.552624,lng:-94.191237},
  {code:"FSD",n:"Sioux Falls Regional Airport",lat:43.585463,lng:-96.741152},
  {code:"FSM",n:"Fort Smith Regional Airport",lat:35.336601,lng:-94.367401},
  {code:"FTW",n:"Fort Worth Meacham International Airport",lat:32.819919,lng:-97.360818},
  {code:"FWA",n:"Fort Wayne International Airport",lat:40.978896,lng:-85.194465},
  {code:"GCC",n:"Gillette — Northeast Wyoming Regional Airport",lat:44.3489,lng:-105.539001},
  {code:"GCK",n:"Garden City Regional Airport",lat:37.9275016785,lng:-100.723999023},
  {code:"GCN",n:"Grand Canyon - Tusayan — Grand Canyon National Park Airport",lat:35.9524,lng:-112.147003},
  {code:"GDV",n:"Glendive — Dawson Community Airport",lat:47.137658,lng:-104.80691},
  {code:"GEG",n:"Spokane International Airport",lat:47.6199,lng:-117.533997},
  {code:"GFK",n:"Grand Forks International Airport",lat:47.949299,lng:-97.176102},
  {code:"GGG",n:"Longview — East Texas Regional Airport",lat:32.38399887084961,lng:-94.71150207519531},
  {code:"GGW",n:"Glasgow Valley County Airport Wokal Field",lat:48.212502,lng:-106.614998},
  {code:"GJT",n:"Grand Junction Regional Airport",lat:39.126663,lng:-108.529387},
  {code:"GLH",n:"Greenville — Mid Delta Regional Airport",lat:33.482899,lng:-90.985603},
  {code:"GNV",n:"Gainesville Regional Airport",lat:29.6900997162,lng:-82.2717971802},
  {code:"FCA",n:"Kalispell — Glacier Park International Airport",lat:48.310501,lng:-114.255997},
  {code:"GPT",n:"Gulfport Biloxi International Airport",lat:30.405582,lng:-89.069836},
  {code:"GRB",n:"Green Bay — Austin Straubel International Airport",lat:44.483459,lng:-88.130805},
  {code:"GRI",n:"Grand Island — Central Nebraska Regional Airport",lat:40.967498779296875,lng:-98.30960083007812},
  {code:"GRK",n:"Fort Cavazos — Killeen Regional Airport / Robert Gray Army Airfield",lat:31.0672,lng:-97.828903},
  {code:"GRR",n:"Grand Rapids — Gerald R. Ford International Airport",lat:42.880798,lng:-85.522797},
  {code:"GSO",n:"Greensboro — Piedmont Triad International Airport",lat:36.09937,lng:-79.937262},
  {code:"GSP",n:"Greenville/Greer/Spartanburg — Greenville-Spartanburg International Airport",lat:34.895699,lng:-82.218903},
  {code:"GTF",n:"Great Falls International Airport",lat:47.481998,lng:-111.371002},
  {code:"GTR",n:"Columbus/W Point/Starkville — Golden Triangle Regional Airport",lat:33.450298,lng:-88.5914},
  {code:"GUC",n:"Gunnison Crested Butte Regional Airport",lat:38.534672,lng:-106.934566},
  {code:"GUP",n:"Gallup Municipal Airport",lat:35.511653,lng:-108.788166},
  {code:"KGX",n:"Grayling Airport",lat:62.895187,lng:-160.066289},
  {code:"GYY",n:"Gary/Chicago International Airport",lat:41.617087,lng:-87.413206},
  {code:"DSY",n:"Ta Noun — Dara Sakor International Airport",lat:10.914244,lng:103.226652},
  {code:"KTI",n:"Phnom Penh (Boeng Khyang) — Techo International Airport",lat:11.359987,lng:104.921272},
  {code:"HDN",n:"Hayden — Yampa Valley Airport",lat:40.481201,lng:-107.218002},
  {code:"HGR",n:"Hagerstown Regional Richard A Henson Field",lat:39.708771,lng:-77.728014},
  {code:"HHR",n:"Jack Northrop Field Hawthorne Municipal Airport",lat:33.922798,lng:-118.334999},
  {code:"HIB",n:"Hibbing — Range Regional Airport",lat:47.384831,lng:-92.836905},
  {code:"HII",n:"Lake Havasu City Airport",lat:34.570506,lng:-114.357745},
  {code:"HLN",n:"Helena Regional Airport",lat:46.6068,lng:-111.983002},
  {code:"HOB",n:"Hobbs — Lea County Regional Airport",lat:32.6875,lng:-103.217003},
  {code:"HOT",n:"Hot Springs — Memorial Field Airport",lat:34.4788,lng:-93.096262},
  {code:"HOU",n:"Houston — William P. Hobby Airport",lat:29.645336,lng:-95.276812},
  {code:"HPN",n:"White Plains — Westchester County Airport",lat:41.06700134277344,lng:-73.70760345458984},
  {code:"HRL",n:"Harlingen — Valley International Airport",lat:26.228500366210938,lng:-97.65440368652344},
  {code:"HRO",n:"Harrison — Boone County Airport",lat:36.26150131225586,lng:-93.15470123291016},
  {code:"HSV",n:"Huntsville International Airport",lat:34.636244,lng:-86.774378},
  {code:"HTS",n:"Huntington — Tri-State Airport / Milton J. Ferguson Field",lat:38.366699,lng:-82.557999},
  {code:"HVN",n:"Tweed New Haven Airport",lat:41.262869,lng:-72.887694},
  {code:"HVR",n:"Havre City County Airport",lat:48.541387,lng:-109.762859},
  {code:"HHH",n:"Hilton Head Island — Hilton Head Airport",lat:32.2244,lng:-80.697502},
  {code:"HYA",n:"Hyannis — Cape Cod Gateway Airport",lat:41.6693,lng:-70.280403},
  {code:"HYS",n:"Hays Regional Airport",lat:38.844521,lng:-99.273148},
  {code:"IAD",n:"Washington Dulles International Airport",lat:38.9445,lng:-77.455803},
  {code:"IAG",n:"Niagara Falls International Airport",lat:43.1073,lng:-78.946198},
  {code:"IAH",n:"Houston — George Bush Intercontinental Airport",lat:29.9844,lng:-95.3414},
  {code:"ICT",n:"Wichita Dwight D. Eisenhower National Airport",lat:37.650314,lng:-97.428583},
  {code:"IDA",n:"Idaho Falls Regional Airport",lat:43.514599,lng:-112.070999},
  {code:"ILG",n:"Wilmington Airport",lat:39.678699,lng:-75.606499},
  {code:"ILM",n:"Wilmington International Airport",lat:34.272345,lng:-77.905117},
  {code:"IMT",n:"Kingsford — Ford Airport",lat:45.81911,lng:-88.114557},
  {code:"IND",n:"Indianapolis International Airport",lat:39.7173,lng:-86.294403},
  {code:"INL",n:"International Falls — Falls International Airport",lat:48.566200256347656,lng:-93.4030990600586},
  {code:"IPL",n:"Imperial County Airport",lat:32.83539,lng:-115.574026},
  {code:"IPT",n:"Williamsport Regional Airport",lat:41.242126,lng:-76.92245},
  {code:"IRK",n:"Kirksville Regional Airport",lat:40.09349822998047,lng:-92.5448989868164},
  {code:"ISP",n:"Islip — Long Island MacArthur Airport",lat:40.796324,lng:-73.101703},
  {code:"ITH",n:"Ithaca Tompkins Regional Airport",lat:42.49100112915039,lng:-76.4583969116211},
  {code:"AZA",n:"Mesa Gateway Airport",lat:33.3078,lng:-111.654999},
  {code:"IWD",n:"Ironwood — Gogebic Iron County Airport",lat:46.525298,lng:-90.131578},
  {code:"JAC",n:"Jackson Hole Airport",lat:43.6073,lng:-110.737999},
  {code:"JAN",n:"Jackson-Medgar Wiley Evers International Airport",lat:32.311199,lng:-90.075897},
  {code:"JAX",n:"Jacksonville International Airport",lat:30.492469,lng:-81.687813},
  {code:"JBR",n:"Jonesboro Municipal Airport",lat:35.83169937133789,lng:-90.64640045166016},
  {code:"JFK",n:"New York — John F. Kennedy International Airport",lat:40.639447,lng:-73.779317},
  {code:"JLN",n:"Joplin Regional Airport",lat:37.151798,lng:-94.498299},
  {code:"JMS",n:"Jamestown Regional Airport",lat:46.92969894,lng:-98.67819977},
  {code:"USA",n:"Concord-Padgett Regional Airport",lat:35.387798,lng:-80.709099},
  {code:"JST",n:"John Murtha Johnstown Cambria County Airport",lat:40.31610107421875,lng:-78.83390045166016},
  {code:"LAF",n:"West Lafayette — Purdue University Airport",lat:40.412875,lng:-86.939363},
  {code:"LAL",n:"Lakeland Linder International Airport",lat:27.989267,lng:-82.020715},
  {code:"LAN",n:"Lansing — Capital Region International Airport",lat:42.777582,lng:-84.585721},
  {code:"LAR",n:"Laramie Regional Airport",lat:41.31209945678711,lng:-105.67500305175781},
  {code:"LAS",n:"Las Vegas — Harry Reid International Airport",lat:36.083361,lng:-115.151817},
  {code:"LAW",n:"Lawton Fort Sill Regional Airport",lat:34.567699,lng:-98.416603},
  {code:"LAX",n:"Los Angeles International Airport",lat:33.942501,lng:-118.407997},
  {code:"LBB",n:"Lubbock Preston Smith International Airport",lat:33.663601,lng:-101.822998},
  {code:"LBE",n:"Latrobe — Arnold Palmer Regional Airport",lat:40.275902,lng:-79.4048},
  {code:"LBF",n:"North Platte Regional Airport Lee Bird Field",lat:41.12620163,lng:-100.6839981},
  {code:"LBL",n:"Liberal Mid-America Regional Airport",lat:37.0442009,lng:-100.9599991},
  {code:"LCH",n:"Lake Charles Regional Airport",lat:30.126100540161133,lng:-93.22329711914062},
  {code:"LCK",n:"Columbus — Rickenbacker International Airport",lat:39.813801,lng:-82.927803},
  {code:"LEB",n:"Lebanon Municipal Airport",lat:43.626098632799994,lng:-72.30419921880001},
  {code:"LEX",n:"Lexington — Blue Grass Airport",lat:38.035066,lng:-84.606738},
  {code:"LFT",n:"Lafayette Regional Airport",lat:30.205299,lng:-91.987602},
  {code:"LGA",n:"New York — LaGuardia Airport",lat:40.777199,lng:-73.872597},
  {code:"LGB",n:"Long Beach International Airport",lat:33.816523,lng:-118.149891},
  {code:"LIT",n:"Little Rock — Bill & Hillary Clinton National Airport/Adams Field",lat:34.729222,lng:-92.223591},
  {code:"LNK",n:"Lincoln Airport",lat:40.844882,lng:-96.76178},
  {code:"LNS",n:"Lancaster Airport",lat:40.121700286865234,lng:-76.29609680175781},
  {code:"LRD",n:"Laredo International Airport",lat:27.5438,lng:-99.461601},
  {code:"LRU",n:"Las Cruces International Airport",lat:32.289398,lng:-106.921997},
  {code:"LSE",n:"La Crosse Regional Airport",lat:43.879002,lng:-91.256699},
  {code:"LUK",n:"Cincinnati Municipal Airport Lunken Field",lat:39.102357,lng:-84.418945},
  {code:"LWB",n:"Lewisburg — Greenbrier Valley Airport",lat:37.857914,lng:-80.400438},
  {code:"LWS",n:"Lewiston Nez Perce County Airport",lat:46.3745002746582,lng:-117.01499938964844},
  {code:"LYH",n:"Lynchburg Regional Airport - Preston Glenn Field",lat:37.326698,lng:-79.200401},
  {code:"MAF",n:"Midland International Air and Space Port",lat:31.942499,lng:-102.202003},
  {code:"MBL",n:"Manistee County Blacker Airport",lat:44.272707,lng:-86.246495},
  {code:"MBS",n:"Freeland — MBS International Airport",lat:43.533181,lng:-84.083104},
  {code:"MCE",n:"Merced Regional Macready Field",lat:37.284698,lng:-120.514},
  {code:"MCI",n:"Kansas City International Airport",lat:39.301699,lng:-94.713893},
  {code:"MCK",n:"McCook Ben Nelson Regional Airport",lat:40.207787,lng:-100.592794},
  {code:"MCN",n:"Macon — Middle Georgia Regional Airport",lat:32.69279861450195,lng:-83.64920043945312},
  {code:"MCO",n:"Orlando International Airport",lat:28.429399490356445,lng:-81.30899810791016},
  {code:"MCW",n:"Mason City Municipal Airport",lat:43.159801,lng:-93.329716},
  {code:"MDT",n:"Harrisburg International Airport",lat:40.192838,lng:-76.762333},
  {code:"MDW",n:"Chicago Midway International Airport",lat:41.785999,lng:-87.752403},
  {code:"MEI",n:"Key Field / Meridian Regional Airport",lat:32.3326,lng:-88.7519},
  {code:"MEM",n:"Memphis — Frederick W. Smith International Airport",lat:35.043845,lng:-89.97634},
  {code:"MFE",n:"McAllen Miller International Airport",lat:26.176141,lng:-98.237965},
  {code:"MFR",n:"Rogue Valley International-Medford Airport",lat:42.374199,lng:-122.873001},
  {code:"MGC",n:"Michigan City Municipal Airport",lat:41.7033,lng:-86.821198},
  {code:"MGM",n:"Montgomery Regional (Dannelly Field) Airport",lat:32.300598,lng:-86.393997},
  {code:"MGW",n:"Morgantown Municipal Airport Walter L. (Bill) Hart Field",lat:39.643305,lng:-79.917598},
  {code:"MHK",n:"Manhattan Regional Airport",lat:39.14099884033203,lng:-96.6707992553711},
  {code:"MHT",n:"Manchester-Boston Regional Airport",lat:42.932598,lng:-71.435699},
  {code:"MIA",n:"Miami International Airport",lat:25.796011,lng:-80.289751},
  {code:"MKE",n:"Milwaukee — General Mitchell International Airport",lat:42.947201,lng:-87.896599},
  {code:"MKG",n:"Muskegon County Airport",lat:43.169498,lng:-86.238197},
  {code:"MKL",n:"Jackson — McKellar-Sipes Regional Airport",lat:35.599899,lng:-88.915604},
  {code:"MLB",n:"Melbourne Orlando International Airport",lat:28.102009,lng:-80.641088},
  {code:"MLI",n:"Moline — Quad City International Airport",lat:41.448502,lng:-90.5075},
  {code:"MLU",n:"Monroe Regional Airport",lat:32.510899,lng:-92.037697},
  {code:"MMH",n:"Mammoth Lakes — Mammoth Yosemite Airport",lat:37.625381,lng:-118.84306},
  {code:"MOB",n:"Mobile Regional Airport",lat:30.6912,lng:-88.242798},
  {code:"MOT",n:"Minot International Airport",lat:48.25801,lng:-101.279123},
  {code:"MRY",n:"Monterey Regional Airport",lat:36.586777,lng:-121.844183},
  {code:"MSL",n:"Muscle Shoals — Northwest Alabama Regional Airport",lat:34.745123,lng:-87.612981},
  {code:"MSN",n:"Madison — Dane County Regional Truax Field",lat:43.1399,lng:-89.337502},
  {code:"MSO",n:"Missoula Montana Airport",lat:46.915816,lng:-114.091107},
  {code:"MSP",n:"Minneapolis–Saint Paul International Airport / Wold–Chamberlain Field",lat:44.880081,lng:-93.221741},
  {code:"MSS",n:"Massena International Airport Richards Field",lat:44.936157,lng:-74.844304},
  {code:"MSY",n:"Louis Armstrong New Orleans International Airport",lat:29.993401,lng:-90.264673},
  {code:"MTJ",n:"Montrose Regional Airport",lat:38.5098,lng:-107.893997},
  {code:"MTP",n:"Montauk Airport",lat:41.0765,lng:-71.920797},
  {code:"MVY",n:"Martha's Vineyard Airport",lat:41.3931007385,lng:-70.6143035889},
  {code:"MWA",n:"Marion — Veterans Airport of Southern Illinois",lat:37.751208,lng:-89.016568},
  {code:"MWL",n:"Mineral Wells Regional Airport",lat:32.781601,lng:-98.060204},
  {code:"MYL",n:"McCall Municipal Airport",lat:44.888837,lng:-116.101112},
  {code:"MYR",n:"Myrtle Beach International Airport",lat:33.679699,lng:-78.928299},
  {code:"YUM",n:"Yuma International Airport / Marine Corps Air Station Yuma",lat:32.650938,lng:-114.609375},
  {code:"OAJ",n:"Richlands — Albert J Ellis Airport",lat:34.829201,lng:-77.612099},
  {code:"OAK",n:"Oakland San Francisco Bay Airport",lat:37.720085,lng:-122.221184},
  {code:"OGD",n:"Ogden Hinckley Airport",lat:41.195899963379,lng:-112.0120010376},
  {code:"OGS",n:"Ogdensburg International Airport",lat:44.6819,lng:-75.4655},
  {code:"OKC",n:"Oklahoma City — OKC Will Rogers World Airport",lat:35.393388,lng:-97.598248},
  {code:"OLF",n:"Wolf Point — L M Clayton Airport",lat:48.094501,lng:-105.574997},
  {code:"OLM",n:"Olympia Regional Airport",lat:46.969399,lng:-122.903},
  {code:"OMA",n:"Omaha — Eppley Airfield",lat:41.3032,lng:-95.894096},
  {code:"ONT",n:"Ontario International Airport",lat:34.056,lng:-117.600998},
  {code:"OPF",n:"Miami-Opa Locka Executive Airport",lat:25.907,lng:-80.278397},
  {code:"ORD",n:"Chicago O'Hare International Airport",lat:41.9786,lng:-87.9048},
  {code:"ORF",n:"Norfolk International Airport",lat:36.895341,lng:-76.201},
  {code:"ORH",n:"Worcester Regional Airport",lat:42.2673,lng:-71.875702},
  {code:"ESD",n:"Eastsound — Orcas Island Airport",lat:48.708199,lng:-122.910004},
  {code:"OTH",n:"North Bend — Southwest Oregon Regional Airport",lat:43.41709899902344,lng:-124.24600219726562},
  {code:"OWB",n:"Owensboro Daviess County Airport",lat:37.74010086,lng:-87.16680145},
  {code:"OCE",n:"Ocean City Municipal Airport",lat:38.310398,lng:-75.124001},
  {code:"PAE",n:"Everett — Seattle Paine Field International Airport",lat:47.9063,lng:-122.281998},
  {code:"PAH",n:"Paducah — Barkley Regional Airport",lat:37.06079864501953,lng:-88.7738037109375},
  {code:"PBG",n:"Plattsburgh International Airport",lat:44.650902,lng:-73.468102},
  {code:"DJT",n:"West Palm Beach — President Donald J. Trump International Airport",lat:26.683201,lng:-80.095596},
  {code:"PDK",n:"Atlanta — DeKalb Peachtree Airport",lat:33.87633,lng:-84.30213},
  {code:"PDT",n:"Eastern Oregon Regional Airport at Pendleton",lat:45.695099,lng:-118.841003},
  {code:"PDX",n:"Portland International Airport",lat:45.588699,lng:-122.598},
  {code:"PGA",n:"Page Municipal Airport",lat:36.924234,lng:-111.447716},
  {code:"PGD",n:"Punta Gorda Airport",lat:26.9202,lng:-81.990501},
  {code:"PGV",n:"Pitt-Greenville Airport",lat:35.635535,lng:-77.384262},
  {code:"PHF",n:"Newport News Williamsburg International Airport",lat:37.131901,lng:-76.492996},
  {code:"PHL",n:"Philadelphia International Airport",lat:39.871899,lng:-75.241096},
  {code:"PHX",n:"Phoenix Sky Harbor International Airport",lat:33.435302,lng:-112.005905},
  {code:"PIA",n:"General Wayne A. Downing Peoria International Airport",lat:40.663841,lng:-89.692631},
  {code:"PIB",n:"Moselle — Hattiesburg Laurel Regional Airport",lat:31.4671,lng:-89.337097},
  {code:"PIE",n:"Pinellas Park — St. Petersburg Clearwater International Airport",lat:27.9102,lng:-82.687401},
  {code:"PIH",n:"Pocatello Regional Airport",lat:42.9098014831543,lng:-112.59600067138672},
  {code:"PIR",n:"Pierre Regional Airport",lat:44.38270187,lng:-100.2860031},
  {code:"PIT",n:"Pittsburgh International Airport",lat:40.491501,lng:-80.232903},
  {code:"PKB",n:"Parkersburg (Williamstown) — Mid Ohio Valley Regional Airport",lat:39.3451,lng:-81.439201},
  {code:"PLN",n:"Pellston Regional Airport of Emmet County Airport",lat:45.57089996,lng:-84.79669952},
  {code:"PNS",n:"Pensacola International Airport",lat:30.472718,lng:-87.186639},
  {code:"PQI",n:"Presque Isle International Airport",lat:46.688999,lng:-68.0448},
  {code:"PRC",n:"Prescott Regional Airport - Ernest A. Love Field",lat:34.653502,lng:-112.419883},
  {code:"PSC",n:"Pasco — Tri Cities Airport",lat:46.264702,lng:-119.119003},
  {code:"PSM",n:"Portsmouth International Airport at Pease",lat:43.0779,lng:-70.823303},
  {code:"PSP",n:"Palm Springs International Airport",lat:33.8297,lng:-116.507004},
  {code:"PUB",n:"Pueblo Memorial Airport",lat:38.289101,lng:-104.497002},
  {code:"PUW",n:"Pullman-Moscow Regional Airport",lat:46.741601,lng:-117.11163},
  {code:"PVD",n:"Providence/Warwick — Rhode Island T. F. Green International Airport",lat:41.725038,lng:-71.425668},
  {code:"PVU",n:"Provo Municipal Airport",lat:40.218894,lng:-111.722445},
  {code:"PWM",n:"Portland International Jetport",lat:43.646198,lng:-70.309303},
  {code:"RAP",n:"Rapid City Regional Airport",lat:44.0452995300293,lng:-103.05699920654297},
  {code:"RDD",n:"Redding Municipal Airport",lat:40.50899887,lng:-122.2929993},
  {code:"RDM",n:"Redmond — Roberts Field",lat:44.254101,lng:-121.150002},
  {code:"RDU",n:"Raleigh/Durham — Raleigh-Durham International Airport",lat:35.878659,lng:-78.7873},
  {code:"RFD",n:"Chicago/Rockford — Chicago Rockford International Airport",lat:42.1954,lng:-89.097198},
  {code:"RHI",n:"Rhinelander Oneida County Airport",lat:45.63119888305664,lng:-89.46749877929688},
  {code:"RIC",n:"Richmond International Airport",lat:37.505199,lng:-77.319702},
  {code:"RIW",n:"Riverton — Central Wyoming Regional Airport",lat:43.064201,lng:-108.459999},
  {code:"RKD",n:"Rockland — Knox County Regional Airport",lat:44.060101,lng:-69.099197},
  {code:"RKS",n:"Rock Springs — Southwest Wyoming Regional Airport",lat:41.5942,lng:-109.065001},
  {code:"RNO",n:"Reno Tahoe International Airport",lat:39.4991,lng:-119.767998},
  {code:"ROA",n:"Roanoke–Blacksburg Regional Airport",lat:37.3255,lng:-79.975403},
  {code:"ROC",n:"Frederick Douglass Greater Rochester International Airport",lat:43.1189,lng:-77.672401},
  {code:"ROW",n:"Roswell Air Center Airport",lat:33.301601,lng:-104.530998},
  {code:"RST",n:"Rochester International Airport",lat:43.908298,lng:-92.5},
  {code:"RSW",n:"Fort Myers — Southwest Florida International Airport",lat:26.534685,lng:-81.752816},
  {code:"RUT",n:"Rutland - Southern Vermont Regional Airport",lat:43.5294,lng:-72.9496},
  {code:"SAF",n:"Santa Fe Municipal Airport",lat:35.6171,lng:-106.088997},
  {code:"SAN",n:"San Diego International Airport",lat:32.733601,lng:-117.190002},
  {code:"SAT",n:"San Antonio International Airport",lat:29.533701,lng:-98.469803},
  {code:"SAV",n:"Savannah Hilton Head International Airport",lat:32.126591,lng:-81.19998},
  {code:"MQT",n:"Gwinn — Marquette Sawyer Regional Airport",lat:46.351498,lng:-87.395884},
  {code:"SBA",n:"Santa Barbara Municipal Airport",lat:34.426201,lng:-119.839996},
  {code:"SBD",n:"San Bernardino International Airport",lat:34.096717,lng:-117.236596},
  {code:"SBN",n:"South Bend International Airport",lat:41.708304,lng:-86.316922},
  {code:"SBP",n:"San Luis Obispo — San Luis County Regional Airport",lat:35.236801147499996,lng:-120.641998291},
  {code:"SBY",n:"Salisbury Ocean City Wicomico Regional Airport",lat:38.34049987792969,lng:-75.51029968261719},
  {code:"SCK",n:"Stockton Metropolitan Airport",lat:37.893279,lng:-121.238079},
  {code:"SDF",n:"Louisville Muhammad Ali International Airport",lat:38.1706,lng:-85.735076},
  {code:"SDY",n:"Sidney - Richland Regional Airport",lat:47.705141,lng:-104.194422},
  {code:"SEA",n:"Seattle–Tacoma International Airport",lat:47.447943,lng:-122.310276},
  {code:"SFB",n:"Orlando Sanford International Airport",lat:28.774277,lng:-81.234626},
  {code:"SFO",n:"San Francisco International Airport",lat:37.619806,lng:-122.374821},
  {code:"SGF",n:"Springfield Branson National Airport",lat:37.245047,lng:-93.388596},
  {code:"UST",n:"St Augustine — Northeast Florida Regional Airport",lat:29.9592,lng:-81.339798},
  {code:"SGU",n:"St George Regional Airport",lat:37.036389,lng:-113.510306},
  {code:"SHD",n:"Weyers Cave — Shenandoah Valley Regional Airport",lat:38.263802,lng:-78.8964},
  {code:"SHR",n:"Sheridan County Airport",lat:44.76919937133789,lng:-106.9800033569336},
  {code:"SHV",n:"Shreveport Regional Airport",lat:32.444747,lng:-93.826741},
  {code:"SJC",n:"Mineta San Jose International Airport",lat:37.362452,lng:-121.929188},
  {code:"SJT",n:"San Angelo Regional Mathis Field",lat:31.35770034790039,lng:-100.49600219726562},
  {code:"TSM",n:"Taos Regional Airport",lat:36.452494,lng:-105.67749},
  {code:"SLC",n:"Salt Lake City International Airport",lat:40.78886,lng:-111.979866},
  {code:"SLE",n:"Salem-Willamette Valley Airport/McNary Field",lat:44.9095,lng:-123.002998},
  {code:"SLK",n:"Saranac Lake — Adirondack Regional Airport",lat:44.38691,lng:-74.204629},
  {code:"SLN",n:"Salina Municipal Airport",lat:38.79100036621094,lng:-97.6521987915039},
  {code:"SMF",n:"Sacramento International Airport",lat:38.6954,lng:-121.591003},
  {code:"SMN",n:"Salmon — Lemhi County Airport",lat:45.122233,lng:-113.88196},
  {code:"SMX",n:"Santa Maria Public Airport Captain G Allan Hancock Field",lat:34.898899,lng:-120.457001},
  {code:"SNA",n:"Santa Ana — John Wayne Orange County International Airport",lat:33.675063,lng:-117.869281},
  {code:"SOW",n:"Show Low Regional Airport",lat:34.264062,lng:-110.007091},
  {code:"SPI",n:"Springfield — Abraham Lincoln Capital Airport",lat:39.844101,lng:-89.677902},
  {code:"SPS",n:"Wichita Falls Municipal Airport / Sheppard Air Force Base",lat:33.9888,lng:-98.491898},
  {code:"SQL",n:"San Carlos Airport",lat:37.51313,lng:-122.250838},
  {code:"SRQ",n:"Sarasota/Bradenton — Sarasota Bradenton International Airport",lat:27.394631,lng:-82.554359},
  {code:"STC",n:"Saint Cloud Regional Airport",lat:45.5466,lng:-94.059898},
  {code:"STL",n:"St Louis — St. Louis Lambert International Airport",lat:38.748697,lng:-90.370003},
  {code:"STS",n:"Santa Rosa — Charles M. Schulz Sonoma County Airport",lat:38.50899887,lng:-122.8130035},
  {code:"SUN",n:"Hailey — Friedman Memorial Airport",lat:43.50439835,lng:-114.2959976},
  {code:"SUX",n:"Sioux City — Sioux Gateway Airport / Brigadier General Bud Day Field",lat:42.397605,lng:-96.382237},
  {code:"SVC",n:"Silver City — Grant County Airport",lat:32.636701,lng:-108.154736},
  {code:"SWF",n:"Newburgh — New York Stewart International Airport",lat:41.50421,lng:-74.108901},
  {code:"SWO",n:"Stillwater Regional Airport",lat:36.162132,lng:-97.085581},
  {code:"SYR",n:"Syracuse Hancock International Airport",lat:43.11119842529297,lng:-76.1063003540039},
  {code:"TBN",n:"Fort Leonard Wood — Waynesville-St. Robert Regional Airport-Forney Field",lat:37.7416,lng:-92.140701},
  {code:"TEB",n:"Teterboro Airport",lat:40.850101,lng:-74.060799},
  {code:"TEX",n:"Telluride Regional Airport",lat:37.9538,lng:-107.907997},
  {code:"TIW",n:"Tacoma Narrows Airport",lat:47.267407,lng:-122.577295},
  {code:"TLH",n:"Tallahassee International Airport",lat:30.401209,lng:-84.35433},
  {code:"TOL",n:"Eugene F. Kranz Toledo Express Airport",lat:41.5868,lng:-83.8078},
  {code:"TPA",n:"Tampa International Airport",lat:27.9755,lng:-82.533203},
  {code:"TRI",n:"Blountville — Tri-Cities Regional TN/VA Airport",lat:36.475201,lng:-82.407401},
  {code:"TKF",n:"Truckee Tahoe Airport",lat:39.318628,lng:-120.140562},
  {code:"TTN",n:"Ewing Township — Trenton Mercer Airport",lat:40.276699,lng:-74.813499},
  {code:"TUL",n:"Tulsa International Airport",lat:36.197084,lng:-95.886225},
  {code:"TUP",n:"Tupelo Regional Airport",lat:34.26810073852539,lng:-88.7698974609375},
  {code:"TUS",n:"Tucson International Airport",lat:32.115004,lng:-110.938053},
  {code:"TVC",n:"Traverse City — Cherry Capital Airport",lat:44.741402,lng:-85.582199},
  {code:"TVF",n:"Thief River Falls Regional Airport",lat:48.065701,lng:-96.184998},
  {code:"TWF",n:"Twin Falls — Joslin Field Magic Valley Regional Airport",lat:42.4818,lng:-114.487999},
  {code:"TXK",n:"Texarkana Regional Airport (Webb Field)",lat:33.453701,lng:-93.990997},
  {code:"TYR",n:"Tyler Pounds Regional Airport",lat:32.35409927368164,lng:-95.40239715576172},
  {code:"TYS",n:"Knoxville/Maryville — McGhee Tyson Airport",lat:35.811001,lng:-83.994003},
  {code:"UIN",n:"Quincy Regional Airport Baldwin Field",lat:39.942699,lng:-91.194603},
  {code:"SCE",n:"State College Regional Airport",lat:40.849374,lng:-77.84852},
  {code:"NPT",n:"Newport State Airport",lat:41.532207,lng:-71.281039},
  {code:"VCT",n:"Victoria Regional Airport",lat:28.85260009765625,lng:-96.91850280761719},
  {code:"VEL",n:"Vernal Regional Airport",lat:40.436214,lng:-109.511661},
  {code:"VLD",n:"Valdosta Regional Airport",lat:30.782499313354492,lng:-83.27670288085938},
  {code:"VPS",n:"Valparaiso — Destin-Fort Walton Beach Airport",lat:30.481315,lng:-86.515839},
  {code:"VRB",n:"Vero Beach Regional Airport",lat:27.6556,lng:-80.417901},
  {code:"WST",n:"Westerly State Airport",lat:41.349602,lng:-71.803398},
  {code:"WYS",n:"West Yellowstone — Yellowstone Airport",lat:44.6884,lng:-111.117996},
  {code:"XNA",n:"Fayetteville/Springdale/Rogers — Northwest Arkansas National Airport",lat:36.281898,lng:-94.306801},
  {code:"XWA",n:"Williston Basin International Airport",lat:48.260863,lng:-103.75116},
  {code:"YKM",n:"Yakima Air Terminal McAllister Field",lat:46.56819916,lng:-120.5439987},
  {code:"BOR",n:"Ton Phueng — Bokeo International Airport",lat:20.323986,lng:100.165392},
  {code:"TIA",n:"Rinas — Tirana International Airport Mother Teresa",lat:41.4147,lng:19.7206},
  {code:"BOJ",n:"Burgas Airport",lat:42.569917,lng:27.515173},
  {code:"PDV",n:"Plovdiv International Airport",lat:42.067799,lng:24.8508},
  {code:"VAR",n:"Varna Airport",lat:43.232101,lng:27.8251},
  {code:"ECN",n:"Tymbou (Kirklar) — Ercan International Airport",lat:35.153064,lng:33.507352},
  {code:"DBV",n:"Dubrovnik Ruđer Bošković Airport",lat:42.562247,lng:18.265543},
  {code:"OSI",n:"Osijek(Klisa) — Osijek Airport",lat:45.462355,lng:18.811278},
  {code:"PUY",n:"Pula Airport",lat:44.893501,lng:13.9222},
  {code:"RJK",n:"Rijeka(Omišalj) — Rijeka Airport",lat:45.216376,lng:14.57085},
  {code:"BWK",n:"Gornji Humac — Brač Airport",lat:43.284454,lng:16.678362},
  {code:"SPU",n:"Split Saint Jerome Airport",lat:43.538898,lng:16.298},
  {code:"ZAD",n:"Zadar Airport",lat:44.096986,lng:15.353565},
  {code:"LEI",n:"Almería Airport",lat:36.843899,lng:-2.3701},
  {code:"OVD",n:"Ranón — Asturias Airport",lat:43.563599,lng:-6.03462},
  {code:"ODB",n:"Córdoba Airport",lat:37.841999,lng:-4.84888},
  {code:"BIO",n:"Bilbao Airport",lat:43.301102,lng:-2.91061},
  {code:"BJZ",n:"Badajoz Airport",lat:38.8913,lng:-6.82133},
  {code:"CDT",n:"Castellón de la Plana — Castellón-Costa Azahar Airport",lat:40.213889,lng:0.073333},
  {code:"LCG",n:"Culleredo — A Coruña Airport",lat:43.302101,lng:-8.37726},
  {code:"ILD",n:"Lleida-Alguaire Airport",lat:41.728185,lng:0.535023},
  {code:"GRO",n:"Girona-Costa Brava Airport",lat:41.904639,lng:2.761774},
  {code:"GRX",n:"F.G.L. Airport Granada-Jaén Airport",lat:37.188702,lng:-3.77736},
  {code:"XRY",n:"Jerez de la Frontera — Jerez Airport",lat:36.744598,lng:-6.06011},
  {code:"LEN",n:"La Virgen del Camino — León Airport",lat:42.590709,lng:-5.653406},
  {code:"RJL",n:"Logroño-Agoncillo Airport",lat:42.460953,lng:-2.322235},
  {code:"MAH",n:"Mahón (Maó) — Menorca Airport",lat:39.862598,lng:4.21865},
  {code:"RMU",n:"Corvera — Region of Murcia International Airport",lat:37.802852,lng:-1.124884},
  {code:"PNA",n:"Pamplona Airport",lat:42.77,lng:-1.64633},
  {code:"REU",n:"Reus Airport",lat:41.147509,lng:1.168354},
  {code:"SLM",n:"Salamanca Airport",lat:40.952099,lng:-5.50199},
  {code:"EAS",n:"Hondarribia — San Sebastián Airport",lat:43.356499,lng:-1.79061},
  {code:"SCQ",n:"Santiago de Compostela — Santiago-Rosalía de Castro Airport",lat:42.896301,lng:-8.41514},
  {code:"LEU",n:"La Seu d'Urgell Pyrenees and Andorra — Pirineus - la Seu d'Urgel Airport",lat:42.3386,lng:1.40917},
  {code:"VLL",n:"Valladolid Airport",lat:41.7061,lng:-4.85194},
  {code:"VIT",n:"Alava — Vitoria Airport",lat:42.882801,lng:-2.72447},
  {code:"VGO",n:"Vigo Airport",lat:42.2318,lng:-8.62677},
  {code:"SDR",n:"Seve Ballesteros-Santander Airport",lat:43.427101,lng:-3.82001},
  {code:"ZAZ",n:"Zaragoza Airport",lat:41.666199,lng:-1.04155},
  {code:"BOD",n:"Bordeaux–Mérignac Airport",lat:44.82865,lng:-0.715356},
  {code:"EGC",n:"Bergerac Dordogne-Périgord airport",lat:44.825298,lng:0.518611},
  {code:"LRH",n:"La Rochelle Île de Ré Airport",lat:46.179199,lng:-1.19528},
  {code:"PIS",n:"Poitiers/Biard — Poitiers-Biard Airport",lat:46.5877,lng:0.306666},
  {code:"LIG",n:"Limoges/Bellegarde — Limoges Airport",lat:45.862801,lng:1.17944},
  {code:"PUF",n:"Pau/Pyrénées (Uzein) — Pau Pyrénées Airport",lat:43.380001,lng:-0.418611},
  {code:"LDE",n:"Tarbes/Lourdes/Pyrénées — Tarbes-Lourdes-Pyrénées Airport",lat:43.178699,lng:-0.006439},
  {code:"BIQ",n:"Biarritz Pays Basque airport",lat:43.468372,lng:-1.523223},
  {code:"DCM",n:"Castres Mazamet Airport",lat:43.556301,lng:2.28918},
  {code:"RDZ",n:"Rodez/Marcillac — Rodez–Aveyron Airport",lat:44.407902,lng:2.48267},
  {code:"OUI",n:"Ushant — Ouessant Airport",lat:48.4632,lng:-5.06358},
  {code:"DLE",n:"Dole Tavaux Airport",lat:47.038955,lng:5.427589},
  {code:"LPY",n:"Chaspuzac, Haute-Loire — Le Puy-Loudes Airfield",lat:45.0807,lng:3.76289},
  {code:"ETZ",n:"Goin — Metz-Nancy-Lorraine Airport",lat:48.982101,lng:6.25132},
  {code:"BIA",n:"Bastia-Poretta International airport",lat:42.5527,lng:9.48373},
  {code:"CLY",n:"Calvi Sainte Catherine Airport",lat:42.530422,lng:8.792984},
  {code:"FSC",n:"Figari Sud-Corse Airport",lat:41.50185,lng:9.097092},
  {code:"AJA",n:"Ajaccio Napoléon Bonaparte airport",lat:41.923599,lng:8.80292},
  {code:"CMF",n:"Chambéry Aix les Bains airport",lat:45.6381,lng:5.88023},
  {code:"CFE",n:"Clermont-Ferrand Auvergne airport",lat:45.786701,lng:3.16917},
  {code:"NCY",n:"Annecy Meythet airport",lat:45.928947,lng:6.0987},
  {code:"GNB",n:"Grenoble Alpes Isère Airport",lat:45.3629,lng:5.32937},
  {code:"AUR",n:"Aurillac airport",lat:44.891399,lng:2.42194},
  {code:"CCF",n:"Carcassonne Salvaza Airport",lat:43.216,lng:2.30632},
  {code:"PGF",n:"Perpignan/Rivesaltes — Perpignan-Rivesaltes (Llabanère) Airport",lat:42.740398,lng:2.87067},
  {code:"MPL",n:"Montpellier/Méditerranée — Montpellier-Méditerranée Airport",lat:43.576199,lng:3.96301},
  {code:"BZR",n:"Béziers Vias airport",lat:43.323502,lng:3.3539},
  {code:"AVN",n:"Avignon Caumont airport",lat:43.907299,lng:4.90183},
  {code:"BVA",n:"Beauvais-Tillé airport",lat:49.454399,lng:2.11278},
  {code:"XCR",n:"Chalons en Champagne — Chalons Vatry airport",lat:48.77333,lng:4.20611},
  {code:"TUF",n:"Tours, Indre-et-Loire — Tours Val de Loire Airport",lat:47.432201,lng:0.727606},
  {code:"LIL",n:"Lesquin — Lille Airport",lat:50.566564,lng:3.102429},
  {code:"BES",n:"Brest Bretagne airport",lat:48.447899,lng:-4.41854},
  {code:"DOL",n:"Deauville Normandie airport",lat:49.365237,lng:0.154481},
  {code:"CFR",n:"Caen Carpiquet airport",lat:49.17678,lng:-0.454883},
  {code:"RNS",n:"Saint-Jacques-de-la-Lande, Ille-et-Vilaine — Rennes-Saint-Jacques Airport",lat:48.0695,lng:-1.73479},
  {code:"NTE",n:"Nantes Atlantique Airport",lat:47.153198,lng:-1.61073},
  {code:"BSL",n:"Bâle / Mulhouse — EuroAirport Basel–Mulhouse–Freiburg",lat:47.60068,lng:7.521117},
  {code:"BVE",n:"Brive Souillac airport",lat:45.039722,lng:1.485556},
  {code:"SXB",n:"Strasbourg Airport",lat:48.5383,lng:7.62823},
  {code:"TLN",n:"Hyères, Var — Toulon-Hyères Airport",lat:43.097301,lng:6.14603},
  {code:"FNI",n:"Nîmes/Garons — Nîmes-Arles-Camargue Airport",lat:43.757401,lng:4.41635},
  {code:"LTT",n:"Saint-Tropez — La Môle Airport",lat:43.205399,lng:6.482},
  {code:"MQC",n:"Miquelon Airport",lat:47.095501,lng:-56.380299},
  {code:"FSP",n:"Saint-Pierre Pointe-Blanche Airport",lat:46.762651,lng:-56.17499},
  {code:"AXD",n:"Alexandroupolis — Alexandroupoli Democritus Airport",lat:40.8559,lng:25.956301},
  {code:"VOL",n:"Nea Anchialos National Airport",lat:39.219601,lng:22.7943},
  {code:"JKH",n:"Chios Island National Airport",lat:38.34320068359375,lng:26.140600204467773},
  {code:"JIK",n:"Ikaria Island — Ikaria Airport",lat:37.6827011108,lng:26.3470993042},
  {code:"IOA",n:"Ioannina King Pyrrhus National Airport",lat:39.6964,lng:20.8225},
  {code:"KSO",n:"Argos Orestiko — Kastoria National Airport Aristotle",lat:40.446301,lng:21.2822},
  {code:"KIT",n:"Kithira Island — Kithira Airport",lat:36.273978,lng:23.016719},
  {code:"EFL",n:"Kefallinia Island — Kefalonia International Airport \"Anna Pollatou\"",lat:38.120098,lng:20.5005},
  {code:"KZS",n:"Kastelorizo Island — Kastelorizo Airport",lat:36.141701,lng:29.576401},
  {code:"KLX",n:"Kalamata Airport",lat:37.06829833984375,lng:22.02549934387207},
  {code:"KGS",n:"Kos Island — Kos International Airport \"Ippokratis\"",lat:36.794523,lng:27.09115},
  {code:"AOK",n:"Karpathos Island — Karpathos Airport",lat:35.421398,lng:27.146},
  {code:"CFU",n:"Kerkyra (Corfu) — Corfu Ioannis Kapodistrias International Airport",lat:39.60145,lng:19.912179},
  {code:"KSJ",n:"Kasos Island — Kasos Airport",lat:35.4213981628,lng:26.909999847399998},
  {code:"KVA",n:"Kavala Alexander the Great International Airport",lat:40.9133,lng:24.6192},
  {code:"JKL",n:"Kalymnos Island — Kalymnos Airport",lat:36.9632987976,lng:26.9405994415},
  {code:"KZI",n:"Kozani National Airport Filippos",lat:40.286098,lng:21.840799},
  {code:"LRS",n:"Leros Island — Leros Airport",lat:37.184898,lng:26.800301},
  {code:"LXS",n:"Limnos Island — Limnos Airport",lat:39.917098999,lng:25.236299514799995},
  {code:"JMK",n:"Mykonos Island National Airport",lat:37.435101,lng:25.348101},
  {code:"MLO",n:"Milos Island — Milos Airport",lat:36.696899,lng:24.4769},
  {code:"MJT",n:"Mytilene International Airport",lat:39.057406,lng:26.598629},
  {code:"JNX",n:"Naxos Island National Airport",lat:37.0811,lng:25.368099},
  {code:"PAS",n:"Paros National Airport",lat:37.020495,lng:25.113195},
  {code:"JTY",n:"Astypalaia Island — Astypalaia Airport",lat:36.5798988342,lng:26.3757991791},
  {code:"PVK",n:"Preveza — Aktion National Airport",lat:38.925499,lng:20.765301},
  {code:"GPA",n:"Patras Araxos Agamemnon Airport",lat:38.1511,lng:21.4256},
  {code:"CHQ",n:"Souda — Chania International Airport",lat:35.531207,lng:24.150673},
  {code:"JSI",n:"Skiathos Island National Airport",lat:39.177101,lng:23.5037},
  {code:"SMI",n:"Samos Island — Samos Airport",lat:37.689999,lng:26.911699},
  {code:"JSY",n:"Syros Island — Syros Airport",lat:37.4227981567,lng:24.950899124099998},
  {code:"JTR",n:"Santorini Island — Santorini International Airport",lat:36.400045,lng:25.478638},
  {code:"JSH",n:"Crete Island — Sitia Airport",lat:35.21609878540039,lng:26.101299285888672},
  {code:"SKU",n:"Skiros Island — Skiros Airport",lat:38.9676017761,lng:24.4871997833},
  {code:"ZTH",n:"Zakynthos International Airport \"Dionysios Solomos\"",lat:37.7509,lng:20.8843},
  {code:"DEB",n:"Debrecen International Airport",lat:47.489469,lng:21.616278},
  {code:"PEV",n:"Pécs-Pogány International Airport",lat:45.988891,lng:18.242044},
  {code:"SOB",n:"Sármellék — Hévíz–Balaton Airport",lat:46.686391,lng:17.159084},
  {code:"CRV",n:"Isola di Capo Rizzuto (KR) — Crotone Sant'Anna Pythagoras Airport",lat:38.9972,lng:17.0802},
  {code:"FOG",n:"Foggia (FG) — Foggia Gino Lisa Airport",lat:41.433596,lng:15.534566},
  {code:"PSR",n:"Pescara — Abruzzo Airport",lat:42.431079,lng:14.182981},
  {code:"CIY",n:"Comiso Airport",lat:36.99583,lng:14.60889},
  {code:"LMP",n:"Lampedusa Airport",lat:35.497898,lng:12.6181},
  {code:"PNL",n:"Pantelleria (TP) — Pantelleria Airport",lat:36.816502,lng:11.9689},
  {code:"REG",n:"Reggio Calabria Airport",lat:38.071201,lng:15.6516},
  {code:"TPS",n:"Trapani (TP) — Vincenzo Florio Airport Trapani-Birgi",lat:37.9114,lng:12.488},
  {code:"AHO",n:"Alghero-Fertilia Airport",lat:40.632099,lng:8.29077},
  {code:"PMF",n:"Parma (PR) — Parma Airport",lat:44.826351,lng:10.29705},
  {code:"CUF",n:"Levaldigi (CN) — Cuneo International Airport",lat:44.547458,lng:7.623045},
  {code:"BZO",n:"Bolzano (BZ) — Bolzano Airport",lat:46.459245,lng:11.326125},
  {code:"TSF",n:"Treviso (TV) — Treviso Airport",lat:45.648399,lng:12.1944},
  {code:"FRL",n:"Forlì (FC) — Forlì-Luigi Ridolfi International Airport",lat:44.194801,lng:12.0701},
  {code:"VBS",n:"Montichiari (BS) — Brescia Gabriele d'Annunzio Airport",lat:45.428902,lng:10.3306},
  {code:"RMI",n:"Rimini (RN) — Federico Fellini International Airport",lat:44.020024,lng:12.612198},
  {code:"QSR",n:"Salerno Costa d'Amalfi Airport",lat:40.620399,lng:14.9113},
  {code:"EBA",n:"Campo nell'Elba (LI) — Marina di Campo Airport",lat:42.760871,lng:10.239811},
  {code:"PEG",n:"Perugia (PG) — Perugia San Francesco d'Assisi – Umbria International Airport",lat:43.095901,lng:12.5132},
  {code:"MBX",n:"Maribor Edvard Rusjan Airport",lat:46.4799,lng:15.6861},
  {code:"JCL",n:"České Budějovice South Bohemian Airport",lat:48.948171,lng:14.42832},
  {code:"KLV",n:"Karlovy Vary Airport",lat:50.202999,lng:12.915},
  {code:"OSR",n:"Mošnov — Leoš Janáček Airport Ostrava",lat:49.696301,lng:18.111099},
  {code:"PED",n:"Pardubice Airport",lat:50.015049,lng:15.73981},
  {code:"BRQ",n:"Brno-Tuřany Airport",lat:49.151276,lng:16.693972},
  {code:"ETM",n:"Eilat — Ramon International Airport",lat:29.727009,lng:35.014116},
  {code:"HFA",n:"Uri Michaeli Haifa International Airport",lat:32.810219,lng:35.043719},
  {code:"MLA",n:"Valletta — Malta International Airport",lat:35.845932,lng:14.491546},
  {code:"GRZ",n:"Feldkirchen bei Graz — Graz Airport",lat:46.9911,lng:15.4396},
  {code:"INN",n:"Innsbruck Airport",lat:47.260201,lng:11.344},
  {code:"KLU",n:"Klagenfurt am Wörthersee — Klagenfurt Airport",lat:46.642502,lng:14.3377},
  {code:"LNZ",n:"Linz-Hörsching Airport",lat:48.235362,lng:14.188128},
  {code:"SZG",n:"Salzburg Airport",lat:47.793301,lng:13.0043},
  {code:"SMA",n:"Vila do Porto — Santa Maria Airport",lat:36.97140121459961,lng:-25.17060089111328},
  {code:"BGC",n:"Bragança Airport",lat:41.8578,lng:-6.70713},
  {code:"CVU",n:"Corvo Airport",lat:39.671501,lng:-31.1136},
  {code:"CAT",n:"Cascais Airport",lat:38.724998,lng:-9.35523},
  {code:"FLW",n:"Santa Cruz das Flores — Flores Airport",lat:39.455299377441406,lng:-31.131399154663086},
  {code:"FAO",n:"Faro - Gago Coutinho International Airport",lat:37.015909,lng:-7.970939},
  {code:"GRW",n:"Santa Cruz da Graciosa — Graciosa Airport",lat:39.092201232910156,lng:-28.029800415039062},
  {code:"HOR",n:"Horta Airport",lat:38.519901275634766,lng:-28.715900421142578},
  {code:"TER",n:"Praia da Vitória — Lajes Airport",lat:38.761799,lng:-27.090799},
  {code:"FNC",n:"Funchal — Cristiano Ronaldo International Airport",lat:32.697812,lng:-16.774613},
  {code:"PDL",n:"Ponta Delgada — João Paulo II Airport",lat:37.7411994934,lng:-25.6979007721},
  {code:"PIX",n:"Pico Island — Pico Airport",lat:38.554298,lng:-28.441299},
  {code:"PRM",n:"Portimão Airport",lat:37.1493,lng:-8.58396},
  {code:"PXO",n:"Vila Baleira — Porto Santo Airport",lat:33.0733985901,lng:-16.3500003815},
  {code:"SJZ",n:"Velas — São Jorge Airport",lat:38.665501,lng:-28.1758},
  {code:"VRL",n:"Vila Real Airport",lat:41.2743,lng:-7.72047},
  {code:"VSE",n:"Aerodromo Goncalves Lobato (Viseu Airport)",lat:40.725498,lng:-7.88899},
  {code:"BNX",n:"Mahovljani — Banja Luka International Airport",lat:44.941399,lng:17.297501},
  {code:"OMO",n:"Mostar International Airport",lat:43.282489,lng:17.846101},
  {code:"SJJ",n:"Sarajevo International Airport",lat:43.8246,lng:18.331499},
  {code:"TZL",n:"Dubrave Gornje — Tuzla International Airport",lat:44.459858,lng:18.723627},
  {code:"ARW",n:"Arad International Airport",lat:46.176136,lng:21.264322},
  {code:"BCM",n:"Bacău George Enescu International  Airport",lat:46.5219,lng:26.910299},
  {code:"BAY",n:"Tăuții-Măgherăuș — Maramureș International Airport",lat:47.658444,lng:23.464445},
  {code:"BBU",n:"Bucharest Băneasa Aurel Vlaicu International Airport",lat:44.503133,lng:26.102944},
  {code:"GHV",n:"Brașov (Ghimbav) — Brașov-Ghimbav International Airport",lat:45.70558,lng:25.522871},
  {code:"CND",n:"Constanța — Mihail Kogălniceanu International Airport",lat:44.362202,lng:28.4883},
  {code:"CLJ",n:"Cluj-Napoca — Avram Iancu Cluj International Airport",lat:46.786042,lng:23.685733},
  {code:"CRA",n:"Craiova International Airport",lat:44.3181,lng:23.888599},
  {code:"IAS",n:"Iaşi International Airport",lat:47.179633,lng:27.621431},
  {code:"OMR",n:"Oradea International Airport",lat:47.025299,lng:21.9025},
  {code:"SBZ",n:"Sibiu International Airport",lat:45.785841,lng:24.086666},
  {code:"SUJ",n:"Satu Mare International Airport",lat:47.7033,lng:22.8857},
  {code:"SCV",n:"Suceava Ștefan cel Mare International Airport",lat:47.6875,lng:26.354099},
  {code:"TGM",n:"Recea — Târgu Mureş Transilvania International Airport",lat:46.467701,lng:24.4125},
  {code:"TSR",n:"Timişoara — Timișoara Traian Vuia International Airport",lat:45.809898,lng:21.3379},
  {code:"LUG",n:"Agno — Lugano Airport",lat:46.004299,lng:8.91058},
  {code:"BRN",n:"Bern Airport",lat:46.912736,lng:7.498819},
  {code:"ACH",n:"St. Gallen — Sankt Gallen Altenrhein Airport",lat:47.485001,lng:9.56077},
  {code:"KFS",n:"Kastamonu Airport",lat:41.314201,lng:33.795799},
  {code:"KYA",n:"Konya Airport",lat:37.979,lng:32.561901},
  {code:"MZH",n:"Amasya Merzifon Airport",lat:40.829399,lng:35.521999},
  {code:"VAS",n:"Sivas Nuri Demirağ Airport",lat:39.813801,lng:36.9035},
  {code:"ONQ",n:"Zonguldak Çaycuma Airport",lat:41.506401,lng:32.0886},
  {code:"MLX",n:"Malatya Erhaç Airport",lat:38.435298919699996,lng:38.0909996033},
  {code:"TJK",n:"Tokat Airport",lat:40.32472,lng:36.39056},
  {code:"DNZ",n:"Denizli — Çardak Airport",lat:37.7855987549,lng:29.7012996674},
  {code:"NAV",n:"Nevşehir Kapadokya Airport",lat:38.7719,lng:34.5345},
  {code:"BZI",n:"Balıkesir Airport",lat:39.619301,lng:27.926001},
  {code:"CKZ",n:"Çanakkale Airport",lat:40.1376991272,lng:26.4267997742},
  {code:"YEI",n:"Bursa Yenişehir Airport",lat:40.255199,lng:29.562599},
  {code:"TEQ",n:"Tekirdağ Çorlu Airport",lat:41.138199,lng:27.9191},
  {code:"AOE",n:"Eskişehir — Hasan Polatkan Airport",lat:39.811644,lng:30.519268},
  {code:"KZR",n:"Altıntaş — Zafer Airport",lat:39.111107,lng:30.130405},
  {code:"EZS",n:"Elazığ Airport",lat:38.597974,lng:39.28348},
  {code:"OGU",n:"Ordu–Giresun Airport",lat:40.966872,lng:38.085995},
  {code:"DIY",n:"Diyarbakır Airport",lat:37.893902,lng:40.201},
  {code:"ERC",n:"Erzincan Airport",lat:39.7102012634,lng:39.527000427199994},
  {code:"ERZ",n:"Erzurum International Airport",lat:39.956501,lng:41.1702},
  {code:"KSY",n:"Kars Airport",lat:40.562198638916016,lng:43.1150016784668},
  {code:"VAN",n:"Van Ferit Melen Airport",lat:38.46820068359375,lng:43.332298278808594},
  {code:"BAL",n:"Batman Airport",lat:37.929001,lng:41.1166},
  {code:"MSR",n:"Muş Airport",lat:38.747798919677734,lng:41.66120147705078},
  {code:"NOP",n:"Sinop Airport",lat:42.018313,lng:35.071774},
  {code:"KCM",n:"Kahramanmaraş Airport",lat:37.5388259888,lng:36.9535217285},
  {code:"AJI",n:"Ağrı Airport",lat:39.655642,lng:43.025742},
  {code:"ADF",n:"Adıyaman Airport",lat:37.7314,lng:38.468899},
  {code:"MQM",n:"Mardin Airport",lat:37.223300933800004,lng:40.6316986084},
  {code:"GNY",n:"Şanlıurfa GAP Airport",lat:37.445663,lng:38.895592},
  {code:"IGD",n:"Iğdır Airport",lat:39.976627,lng:43.876648},
  {code:"BGG",n:"Bingöl Airport",lat:38.860131,lng:40.594489},
  {code:"NKT",n:"Şırnak Şerafettin Elçi Airport",lat:37.3647,lng:42.0582},
  {code:"YKO",n:"Hakkari Yüksekova Airport",lat:37.5497,lng:44.2381},
  {code:"HTY",n:"Antakya — Hatay Airport",lat:36.36079,lng:36.285589},
  {code:"COV",n:"Tarsus — Çukurova International Airport",lat:36.891478,lng:35.071235},
  {code:"ISE",n:"Isparta — Süleyman Demirel International Airport",lat:37.8554,lng:30.368401},
  {code:"EDO",n:"Edremit — Balıkesir Koca Seyit Airport",lat:39.552533,lng:27.010192},
  {code:"GZP",n:"Gazipaşa-Alanya Airport",lat:36.298832,lng:32.297017},
  {code:"SZF",n:"Samsun-Çarşamba Airport",lat:41.253988,lng:36.567546},
  {code:"RZV",n:"Rize–Artvin Airport",lat:41.179766,lng:40.848802},
  {code:"RMO",n:"Chişinău International Airport",lat:46.92774,lng:28.931704},
  {code:"OHD",n:"Ohrid St. Paul the Apostle Airport",lat:41.18,lng:20.7423},
  {code:"SKP",n:"Ilinden — Skopje International Airport",lat:41.958087,lng:21.622581},
  {code:"GIB",n:"Gibraltar Airport",lat:36.151679,lng:-5.34978},
  {code:"KVO",n:"Kraljevo — Morava Airport",lat:43.817519,lng:20.586662},
  {code:"INI",n:"Niš Constantine the Great Airport",lat:43.336538,lng:21.856242},
  {code:"TGD",n:"Podgorica Airport / Podgorica Golubovci Airbase",lat:42.359402,lng:19.2519},
  {code:"TIV",n:"Tivat Airport",lat:42.404701,lng:18.723301},
  {code:"LZG",n:"Nanchong (Langzhong) — Langzhong Gucheng Airport",lat:31.50191,lng:106.034417},
  {code:"BTS",n:"Bratislava — M. R. Štefánik Airport",lat:48.1702,lng:17.2127},
  {code:"KSC",n:"Košice International Airport",lat:48.663101,lng:21.2411},
  {code:"SLD",n:"Sliač Airport",lat:48.63779830932617,lng:19.13409996032715},
  {code:"TAT",n:"Poprad-Tatry Airport",lat:49.070994,lng:20.241394},
  {code:"GDT",n:"Cockburn Town — JAGS McCartney International Airport",lat:21.4445,lng:-71.142303},
  {code:"NCA",n:"North Caicos Airport",lat:21.916094,lng:-71.942954},
  {code:"PLS",n:"Providenciales International Airport",lat:21.773697,lng:-72.268321},
  {code:"XSC",n:"South Caicos Airport",lat:21.515699,lng:-71.528503},
  {code:"SLX",n:"Salt Cay Airport",lat:21.333000183099998,lng:-71.1999969482},
  {code:"BRX",n:"Barahona — Maria Montez International Airport",lat:18.25149917602539,lng:-71.12039947509766},
  {code:"AZS",n:"Samana — Samaná El Catey International Airport",lat:19.269259,lng:-69.737405},
  {code:"JBQ",n:"La Isabela International Airport",lat:18.572500228881836,lng:-69.98560333251953},
  {code:"LRM",n:"La Romana — Casa De Campo International Airport",lat:18.452222,lng:-68.911111},
  {code:"PUJ",n:"Punta Cana International Airport",lat:18.567093,lng:-68.364558},
  {code:"POP",n:"Puerto Plata — Gregorio Luperon International Airport",lat:19.7579,lng:-70.57},
  {code:"SDQ",n:"Santo Domingo — Las Américas International Airport",lat:18.42970085144,lng:-69.668899536133},
  {code:"STI",n:"Santiago — Cibao International Airport",lat:19.40406,lng:-70.604431},
  {code:"GUA",n:"Guatemala City — La Aurora International Airport",lat:14.582896,lng:-90.527515},
  {code:"HUG",n:"Huehuetenango Airport",lat:15.316667,lng:-91.505556},
  {code:"PBR",n:"Puerto Barrios Airport",lat:15.7309,lng:-88.583801},
  {code:"AAZ",n:"Quezaltenango Airport",lat:14.8656,lng:-91.501999},
  {code:"RER",n:"Retalhuleu Airport",lat:14.521431,lng:-91.697001},
  {code:"FRS",n:"San Benito — Mundo Maya International Airport",lat:16.913707,lng:-89.866143},
  {code:"UJE",n:"Ujae Atoll Airport",lat:8.92806,lng:165.761993},
  {code:"AUL",n:"Aur Atoll — Aur Island Airport",lat:8.14528,lng:171.173004},
  {code:"JEJ",n:"Ailinglapalap Atoll — Jeh Airport",lat:7.565350055690001,lng:168.962005615},
  {code:"LIK",n:"Likiep Island — Likiep Airport",lat:9.82316,lng:169.307999},
  {code:"MJE",n:"Majkin Airport",lat:8.163362,lng:168.173862},
  {code:"RNP",n:"Rongelap Island Airport",lat:11.1572,lng:166.886993},
  {code:"UIT",n:"Jabor Jaluit Atoll — Jaluit Airport",lat:5.909213,lng:169.637256},
  {code:"WTE",n:"Wotje Airport",lat:9.458333,lng:170.238611},
  {code:"WTO",n:"Wotho Island Airport",lat:10.1733,lng:166.003006},
  {code:"LCE",n:"La Ceiba — Golosón International Airport",lat:15.7425,lng:-86.852997},
  {code:"SAP",n:"San Pedro Sula — Ramón Villeda Morales International Airport",lat:15.4526,lng:-87.923599},
  {code:"GJA",n:"Guanaja — La Laguna Airport",lat:16.4454,lng:-85.906601},
  {code:"PEU",n:"Puerto Lempira Airport",lat:15.2622,lng:-83.781197},
  {code:"RTB",n:"Coxen Hole — Juan Manuel Gálvez International Airport",lat:16.316799,lng:-86.523003},
  {code:"XPL",n:"Palmerola International Airport",lat:14.3824,lng:-87.621201},
  {code:"TGU",n:"Tegucigalpa — Toncontín Airport",lat:14.0609,lng:-87.217201},
  {code:"UII",n:"Utila Island — Utila Airport",lat:16.1131,lng:-86.880302},
  {code:"OCJ",n:"Boscobel — Ian Fleming International Airport",lat:18.404079,lng:-76.969754},
  {code:"KIN",n:"Kingston — Norman Manley International Airport",lat:17.935699462890625,lng:-76.7874984741211},
  {code:"MBJ",n:"Montego Bay — Sangster International Airport",lat:18.50342,lng:-77.91323},
  {code:"KTP",n:"Tinson Pen Airport",lat:17.98859977722168,lng:-76.82379913330078},
  {code:"MIJ",n:"Mili Island Airport",lat:6.084754,lng:171.731419},
  {code:"ACA",n:"Acapulco — General Juan N. Álvarez International Airport",lat:16.757126,lng:-99.753113},
  {code:"AGU",n:"Aguascalientes International Airport",lat:21.699589,lng:-102.318372},
  {code:"HUX",n:"Bahías de Huatulco International Airport",lat:15.775437,lng:-96.260456},
  {code:"CME",n:"Ciudad del Carmen International Airport",lat:18.651516,lng:-91.799355},
  {code:"CUL",n:"Culiacán — Bachigualato Federal International Airport",lat:24.76504,lng:-107.475228},
  {code:"CTM",n:"Chetumal International Airport",lat:18.504985,lng:-88.328018},
  {code:"CEN",n:"Ciudad Obregón International Airport",lat:27.39259910583496,lng:-109.83300018310547},
  {code:"CPE",n:"Campeche — Ingeniero Alberto Acuña Ongay International Airport",lat:19.815969,lng:-90.500125},
  {code:"CJS",n:"Ciudad Juárez — Abraham González International Airport",lat:31.636673,lng:-106.428533},
  {code:"CUU",n:"Chihuahua — General Roberto Fierro Villalobos International Airport",lat:28.702649,lng:-105.963764},
  {code:"CVM",n:"Ciudad Victoria — General Pedro Jose Mendez International Airport",lat:23.7033,lng:-98.956497},
  {code:"CZM",n:"Cozumel International Airport",lat:20.514922,lng:-86.928538},
  {code:"CUA",n:"Comondú — Ciudad Constitución National Airport",lat:25.053801,lng:-111.614998},
  {code:"DGO",n:"Durango — General Guadalupe Victoria International Airport",lat:24.125468,lng:-104.527938},
  {code:"TPQ",n:"Tepic — Amado Nervo National Airport",lat:21.419833,lng:-104.842472},
  {code:"GDL",n:"Guadalajara International Airport",lat:20.523342,lng:-103.310108},
  {code:"GYM",n:"Guaymas — General José María Yáñez International Airport",lat:27.9689998626709,lng:-110.92500305175781},
  {code:"GUB",n:"San Quintín — Guerrero Negro Airport",lat:28.0261,lng:-114.024002},
  {code:"HMO",n:"Hermosillo — General Ignacio L. Pesqueira International Airport",lat:29.092811,lng:-111.053015},
  {code:"CLQ",n:"Colima — Licenciado Miguel de la Madrid International Airport",lat:19.277,lng:-103.577002},
  {code:"SLW",n:"Saltillo — Plan de Guadalupe International Airport",lat:25.53786,lng:-100.928346},
  {code:"IZT",n:"General Antonio Cárdenas Rodríguez National Airport / Ixtepec Air Base",lat:16.445961,lng:-95.093708},
  {code:"LMM",n:"Los Mochis — Valle del Fuerte International Airport",lat:25.685503,lng:-109.081159},
  {code:"BJX",n:"Silao — Guanajuato International Airport",lat:20.992695,lng:-101.480284},
  {code:"LAP",n:"La Paz — Manuel Márquez de León International Airport",lat:24.072331,lng:-110.362662},
  {code:"LTO",n:"Loreto International Airport",lat:25.989549,lng:-111.348408},
  {code:"MAM",n:"Matamoros — General Servando Canales International Airport",lat:25.7698993683,lng:-97.5252990723},
  {code:"MID",n:"Mérida — Manuel Crescencio Rejón International Airport",lat:20.930485,lng:-89.645462},
  {code:"MXL",n:"Mexicali — General Rodolfo Sánchez Taboada International Airport",lat:32.630629,lng:-115.242805},
  {code:"MLM",n:"Morelia — General Francisco J. Mujica International Airport",lat:19.849899,lng:-101.025002},
  {code:"MTT",n:"Cosoleacaque — Minatitlán/Coatzacoalcos International Airport",lat:18.103399,lng:-94.580704},
  {code:"MEX",n:"Mexico City Benito Juárez International Airport",lat:19.435822,lng:-99.07033},
  {code:"MTY",n:"Monterrey International Airport",lat:25.778521,lng:-100.106989},
  {code:"MZT",n:"Mazatlàn — General Rafael Buelna International Airport",lat:23.162823,lng:-106.264517},
  {code:"NLD",n:"Nuevo Laredo — Quetzalcóatl International Airport",lat:27.443899,lng:-99.570503},
  {code:"OAX",n:"Oaxaca — Xoxocotlán International Airport",lat:16.998773,lng:-96.726092},
  {code:"PAZ",n:"Poza Rica — El Tajín National Airport",lat:20.6026992798,lng:-97.46080017090001},
  {code:"PBC",n:"Puebla — Hermanos Serdán International Airport",lat:19.158465,lng:-98.371582},
  {code:"PPE",n:"Puerto Peñasco — Mar de Cortés International Airport",lat:31.351987,lng:-113.305177},
  {code:"PDS",n:"Piedras Negras International Airport",lat:28.627873,lng:-100.53524},
  {code:"UPN",n:"Uruapan - Licenciado y General Ignacio Lopez Rayon International Airport",lat:19.3967,lng:-102.039001},
  {code:"PVR",n:"Puerto Vallarta International Airport",lat:20.679913,lng:-105.254391},
  {code:"PXM",n:"Puerto Escondido International Airport",lat:15.876808,lng:-97.0891},
  {code:"QRO",n:"Querétaro Intercontinental Airport",lat:20.618779,lng:-100.186449},
  {code:"REX",n:"Reynosa — General Lucio Blanco International Airport",lat:26.0089,lng:-98.2285},
  {code:"SJD",n:"San José del Cabo — Los Cabos International Airport",lat:23.151919,lng:-109.720731},
  {code:"CSW",n:"Cabo San Lucas International Airport",lat:22.949072,lng:-109.939479},
  {code:"NLU",n:"Mexico City — Felipe Ángeles International Airport",lat:19.743824,lng:-99.01507},
  {code:"SLP",n:"San Luis Potosí — Ponciano Arriaga International Airport",lat:22.262026,lng:-100.935692},
  {code:"TRC",n:"Torreón — Francisco Sarabia Tinoco International Airport",lat:25.562265,lng:-103.404608},
  {code:"TGZ",n:"Tuxtla Gutiérrez — Angel Albino Corzo International Airport",lat:16.561611,lng:-93.025731},
  {code:"TIJ",n:"Tijuana — General Abelardo L. Rodriguez International Airport",lat:32.541043,lng:-116.969976},
  {code:"TQO",n:"Felipe Carrillo Puerto International Airport Tulum",lat:20.172098,lng:-87.660272},
  {code:"TAM",n:"Ciudad Madero — General Francisco Javier Mina International Airport",lat:22.292622,lng:-97.867058},
  {code:"TLC",n:"Toluca — Adolfo López Mateos International Airport",lat:19.3369,lng:-99.56583},
  {code:"TAP",n:"Tapachula International Airport",lat:14.794549,lng:-92.369871},
  {code:"CUN",n:"Cancún International Airport",lat:21.040817,lng:-86.87347},
  {code:"VSA",n:"Villahermosa — Carlos Rovirosa Pérez International Airport",lat:17.994283,lng:-92.818199},
  {code:"VER",n:"Veracruz — General Heriberto Jara International Airport",lat:19.139589,lng:-96.188602},
  {code:"ZCL",n:"Zacatecas — General Leobardo C. Ruiz International Airport",lat:22.894942,lng:-102.687154},
  {code:"ZIH",n:"Ixtapa-Zihuatanejo International Airport",lat:17.601771,lng:-101.460629},
  {code:"ZLO",n:"Manzanillo — Playa de Oro International Airport",lat:19.1448,lng:-104.558998},
  {code:"BEF",n:"Bluefields Airport",lat:11.991,lng:-83.774101},
  {code:"RNI",n:"Corn Island Airport",lat:12.174785,lng:-83.059445},
  {code:"MGA",n:"Augusto C. Sandino (Managua) International Airport",lat:12.1415,lng:-86.168198},
  {code:"PUZ",n:"Puerto Cabezas Airport",lat:14.047200202941895,lng:-83.38670349121094},
  {code:"MOH",n:"Morowali — Maleo Airport",lat:-2.201143,lng:121.662884},
  {code:"BOC",n:"Bocas del Toro \"Isla Colón\" International Airport",lat:9.34085,lng:-82.250801},
  {code:"CTD",n:"Chitré — Alonso Valderrama Airport",lat:7.98784,lng:-80.409837},
  {code:"CHX",n:"Changuinola Captain Manuel Niño International Airport",lat:9.458962,lng:-82.515062},
  {code:"DAV",n:"David — Enrique Malek International Airport",lat:8.388983,lng:-82.436425},
  {code:"ONX",n:"Colón — Enrique Adolfo Jimenez Airport",lat:9.35664,lng:-79.867401},
  {code:"BLB",n:"Panamá City — Panamá Pacífico International Airport",lat:8.91479,lng:-79.599602},
  {code:"PAC",n:"Albrook — Marcos A. Gelabert International Airport",lat:8.97334,lng:-79.555603},
  {code:"PDM",n:"Pedasí — Capt. J. Montenegro Airport",lat:7.534801,lng:-80.043347},
  {code:"RIH",n:"Río Hato — Scarlett Martinez International Airport",lat:8.375880241394,lng:-80.127899169922},
  {code:"PTY",n:"Tocumen International Airport",lat:9.07136,lng:-79.383499},
  {code:"FON",n:"La Fortuna Arenal Airport",lat:10.469311,lng:-84.579073},
  {code:"GLF",n:"Golfito Airport",lat:8.65401,lng:-83.182198},
  {code:"LIR",n:"Liberia — Daniel Oduber Quirós International Airport",lat:10.5933,lng:-85.544403},
  {code:"LIO",n:"Limón International Airport",lat:9.95796,lng:-83.022003},
  {code:"NOB",n:"Nicoya — Nosara Airport",lat:9.976490020750001,lng:-85.65299987790002},
  {code:"SJO",n:"San José (Alajuela) — Juan Santamaría International Airport",lat:9.99386,lng:-84.208801},
  {code:"PJM",n:"Puerto Jimenez Airport",lat:8.533329963684082,lng:-83.30000305175781},
  {code:"SYQ",n:"San Jose — Tobías Bolaños International Airport",lat:9.95705,lng:-84.139801},
  {code:"XQP",n:"Quepos Managua Airport",lat:9.44316,lng:-84.129799},
  {code:"SAL",n:"San Salvador (San Luis Talpa) — El Salvador International Airport Saint Óscar Arnulfo Romero y Galdámez",lat:13.44447,lng:-89.055784},
  {code:"ILS",n:"San Salvador — Ilopango International Airport",lat:13.6995,lng:-89.119904},
  {code:"CYA",n:"Les Cayes — Antoine-Simon International Airport",lat:18.271099,lng:-73.7883},
  {code:"CAP",n:"Cap Haitien International Airport",lat:19.725547,lng:-72.20071},
  {code:"JEE",n:"Carrefour Sanon — Jérémie Airport",lat:18.663099,lng:-74.170303},
  {code:"PAP",n:"Port-au-Prince — Toussaint Louverture International Airport",lat:18.580023,lng:-72.292596},
  {code:"BCA",n:"Baracoa — Gustavo Rizo Airport",lat:20.365299224853516,lng:-74.5062026977539},
  {code:"BYM",n:"Bayamo — Carlos Manuel de Cespedes Airport",lat:20.3964,lng:-76.621399},
  {code:"CCC",n:"Cayo Coco — Jardines Del Rey Airport",lat:22.461000442499998,lng:-78.32839965820001},
  {code:"CFG",n:"Cienfuegos — Jaime Gonzalez Airport",lat:22.149999618530273,lng:-80.41419982910156},
  {code:"CYO",n:"Cayo Largo del Sur — Vilo Acuña International Airport",lat:21.6165008545,lng:-81.5459976196},
  {code:"CMW",n:"Camaguey — Ignacio Agramonte International Airport",lat:21.419909,lng:-77.848039},
  {code:"SCU",n:"Santiago — Antonio Maceo International Airport",lat:19.97474,lng:-75.835504},
  {code:"HAV",n:"Havana — José Martí International Airport",lat:22.989200592041016,lng:-82.40910339355469},
  {code:"HOG",n:"Holguin — Frank Pais International Airport",lat:20.785148,lng:-76.315526},
  {code:"MZO",n:"Manzanillo — Sierra Maestra International Airport",lat:20.288605,lng:-77.087545},
  {code:"GER",n:"Nueva Gerona — Rafael Cabrera Airport",lat:21.834699630737305,lng:-82.78379821777344},
  {code:"SNU",n:"Santa Clara — Abel Santamaria International Airport",lat:22.492215,lng:-79.943119},
  {code:"TND",n:"Trinidad — Alberto Delgado Airport",lat:21.7883,lng:-79.9972},
  {code:"VRA",n:"Matanzas — Juan Gualberto Gomez International Airport",lat:23.034401,lng:-81.435303},
  {code:"VTU",n:"Las Tunas — Hermanos Ameijeiras Airport",lat:20.9876,lng:-76.935799},
  {code:"FMT",n:"Faresmaathodaa — Faresmaathoda Airport",lat:0.192647,lng:73.196755},
  {code:"CYB",n:"West End — Charles Kirkconnell International Airport",lat:19.687,lng:-79.882797},
  {code:"GCM",n:"George Town — Owen Roberts International Airport",lat:19.292801,lng:-81.357697},
  {code:"LBP",n:"Long Banga Airport",lat:3.202138,lng:115.401811},
  {code:"ASD",n:"Andros Town Airport",lat:24.697901,lng:-77.795601},
  {code:"TZN",n:"Andros — Congo Town Airport",lat:24.158701,lng:-77.589798},
  {code:"MHH",n:"Marsh Harbour — Leonard M. Thompson International Airport",lat:26.510711,lng:-77.084262},
  {code:"SAQ",n:"Andros Island — San Andros Airport",lat:25.053800582885742,lng:-78.04900360107422},
  {code:"AXP",n:"Spring Point Airport",lat:22.441799,lng:-73.970901},
  {code:"TCB",n:"Treasure Cay Airport",lat:26.745300293,lng:-77.3912963867},
  {code:"CCZ",n:"Chub Cay Airport",lat:25.417101,lng:-77.880898},
  {code:"BIM",n:"South Bimini Airport",lat:25.6998996735,lng:-79.2647018433},
  {code:"ATC",n:"Arthur's Town Airport",lat:24.6294,lng:-75.673797},
  {code:"TBI",n:"Cat Island — New Bight Airport",lat:24.3153,lng:-75.452301},
  {code:"CRI",n:"Colonel Hill Airport",lat:22.7456,lng:-74.182404},
  {code:"GGT",n:"Moss Town — Exuma International Airport",lat:23.562599,lng:-75.877998},
  {code:"ELH",n:"North Eleuthera Airport",lat:25.475823,lng:-76.680784},
  {code:"GHB",n:"Governor's Harbour Airport",lat:25.2847,lng:-76.331001},
  {code:"RSD",n:"Rock Sound International Airport",lat:24.89165,lng:-76.177602},
  {code:"FPO",n:"Freeport — Grand Bahama International Airport",lat:26.557996,lng:-78.695583},
  {code:"IGA",n:"Matthew Town — Inagua Airport",lat:20.975,lng:-73.666901},
  {code:"MYK",n:"May Creek Airport",lat:61.335701,lng:-142.686996},
  {code:"LGI",n:"Deadman's Cay Airport",lat:23.1790008545,lng:-75.09359741210001},
  {code:"SML",n:"Stella Maris Airport",lat:23.582317,lng:-75.268621},
  {code:"MYG",n:"Abraham Bay Settlement — Mayaguana Airport",lat:22.379499,lng:-73.013494},
  {code:"NAS",n:"Nassau — Lynden Pindling International Airport",lat:25.039,lng:-77.466202},
  {code:"ZSA",n:"San Salvador International Airport",lat:24.063041,lng:-74.523233},
  {code:"BZE",n:"Belize City — Philip S. W. Goldson International Airport",lat:17.539951,lng:-88.303556},
  {code:"PLJ",n:"Placencia Airport",lat:16.536957,lng:-88.361511},
  {code:"AIT",n:"Aitutaki Airport",lat:-18.837091,lng:-159.761008},
  {code:"AIU",n:"Atiu Island — Enua Airport",lat:-19.96780014038086,lng:-158.11900329589844},
  {code:"MHX",n:"Manihiki Island Airport",lat:-10.38091,lng:-160.999424},
  {code:"MUK",n:"Mauke Island — Mauke Airport",lat:-20.13610076904297,lng:-157.34500122070312},
  {code:"MOI",n:"Mitiaro Island Airport",lat:-19.842501,lng:-157.703003},
  {code:"RAR",n:"Avarua — Rarotonga International Airport",lat:-21.2027,lng:-159.806},
  {code:"ICI",n:"Cicia Airport",lat:-17.7432994843,lng:-179.341995239},
  {code:"NAN",n:"Nadi International Airport",lat:-17.761822,lng:177.437843},
  {code:"PTF",n:"Malolo Lailai Island Airport",lat:-17.778448,lng:177.196996},
  {code:"KDV",n:"Vunisea Airport",lat:-19.058099746699998,lng:178.156997681},
  {code:"MNF",n:"Mana Island Airport",lat:-17.672844,lng:177.0985},
  {code:"MFJ",n:"Moala Airport",lat:-18.566699981699998,lng:179.951004028},
  {code:"SUV",n:"Nausori International Airport",lat:-18.044226,lng:178.561486},
  {code:"LEV",n:"Bureta — Levuka Airfield",lat:-17.7110996246,lng:178.759002686},
  {code:"NGI",n:"Ngau Airport",lat:-18.115600585899998,lng:179.339996338},
  {code:"LKB",n:"Lakeba Island Airport",lat:-18.1991996765,lng:-178.817001343},
  {code:"LBS",n:"Labasa Airport",lat:-16.4667,lng:179.339996},
  {code:"TVU",n:"Matei Airport",lat:-16.690599,lng:-179.876999},
  {code:"KXF",n:"Koro Island Airport",lat:-17.3458003998,lng:179.42199707},
  {code:"RTA",n:"Rotuma Airport",lat:-12.482500076293945,lng:177.0709991455078},
  {code:"SVU",n:"Savusavu Airport",lat:-16.803394,lng:179.340587},
  {code:"YAS",n:"Yasawa Island Airport",lat:-16.7589,lng:177.544998},
  {code:"EUA",n:"Eua Island — Kaufana Airport",lat:-21.378299713100002,lng:-174.957992554},
  {code:"TBU",n:"Nuku'alofa — Fua'amotu International Airport",lat:-21.241438,lng:-175.149164},
  {code:"HPA",n:"Lifuka Island Airport",lat:-19.777000427246094,lng:-174.34100341796875},
  {code:"NTT",n:"Niuatoputapu — Kuini Lavenia Airport",lat:-15.977297,lng:-173.791089},
  {code:"VAV",n:"Vava'u Island — Vava'u International Airport",lat:-18.5853,lng:-173.962006},
  {code:"VBV",n:"Vanua Balavu Airport",lat:-17.268999099731445,lng:-178.9759979248047},
  {code:"PHG",n:"Port Harcourt City Airport / Port Harcourt Air Force Base",lat:4.846111,lng:7.021389},
  {code:"FUN",n:"Funafuti International Airport",lat:-8.523885,lng:179.196976},
  {code:"TRW",n:"South Tarawa — Bonriki International Airport",lat:1.38164,lng:173.147003},
  {code:"BBG",n:"Butaritari Airport",lat:3.08583,lng:172.811005},
  {code:"AAK",n:"Buariki — Aranuka Airport",lat:0.185278,lng:173.636993},
  {code:"IUE",n:"Alofi — Niue International Airport",lat:-19.080109,lng:-169.923493},
  {code:"NLH",n:"Ninglang Luguhu Airport",lat:27.5403,lng:100.7593},
  {code:"FUT",n:"Futuna Island — Pointe Vele Airport",lat:-14.311565,lng:-178.066492},
  {code:"WLS",n:"Wallis Island — Hihifo Airport",lat:-13.239445,lng:-176.19865},
  {code:"PHH",n:"Pokhara International Airport",lat:28.1838,lng:84.0147},
  {code:"OFU",n:"Ofu Airport",lat:-14.1844,lng:-169.669998},
  {code:"APW",n:"Apia — Faleolo International Airport",lat:-13.83,lng:-172.007996},
  {code:"FTI",n:"Fitiuta Village — Fitiuta Airport",lat:-14.216131,lng:-169.423771},
  {code:"PPG",n:"Pago Pago International Airport",lat:-14.331,lng:-170.710007},
  {code:"PPT",n:"Papeete — Fa'a'ā International Airport",lat:-17.553472,lng:-149.606936},
  {code:"RMT",n:"Rimatara Island — Rimatara Airport",lat:-22.63725,lng:-152.8059},
  {code:"RUR",n:"Rurutu Airport",lat:-22.434099197387695,lng:-151.36099243164062},
  {code:"TUB",n:"Tubuai Airport",lat:-23.365400314331055,lng:-149.5240020751953},
  {code:"RVV",n:"Raivavae Airport",lat:-23.885201,lng:-147.662003},
  {code:"AAA",n:"Anaa Airport",lat:-17.3526,lng:-145.509995},
  {code:"FGU",n:"Fangatau Airport",lat:-15.820044,lng:-140.888071},
  {code:"TIH",n:"Tuherahera — Tikehau Airport",lat:-15.1196,lng:-148.231003},
  {code:"APK",n:"Apataki Airport",lat:-15.5736,lng:-146.414993},
  {code:"FAV",n:"Fakarava Airport",lat:-16.054100036621094,lng:-145.65699768066406},
  {code:"HHZ",n:"Hikueru Airport",lat:-17.548297,lng:-142.612037},
  {code:"XMH",n:"Manihi Airport",lat:-14.436800003051758,lng:-146.07000732421875},
  {code:"GMR",n:"Totegegie Airport",lat:-23.07990074157715,lng:-134.88999938964844},
  {code:"KKR",n:"Raitahiti — Kaukura Airport",lat:-15.6633,lng:-146.884995},
  {code:"MKP",n:"Makemo Airport",lat:-16.5839,lng:-143.658005},
  {code:"NAU",n:"Napuka Island Airport",lat:-14.177397,lng:-141.266112},
  {code:"TKV",n:"Tatakoto Airport",lat:-17.355226,lng:-138.44734},
  {code:"PKP",n:"Puka Puka Airport",lat:-14.80955,lng:-138.812621},
  {code:"TKP",n:"Takapoto Airport",lat:-14.709500312805176,lng:-145.24600219726562},
  {code:"AXR",n:"Arutua Airport",lat:-15.248299598693848,lng:-146.61700439453125},
  {code:"MVT",n:"Mataiva Airport",lat:-14.8681001663208,lng:-148.7169952392578},
  {code:"AHE",n:"Ahe Atoll — Ahe Airport",lat:-14.428099632263184,lng:-146.2570037841797},
  {code:"KHZ",n:"Kauehi Airport",lat:-15.780622,lng:-145.128443},
  {code:"FHZ",n:"Fakahina Airport",lat:-15.992259,lng:-140.164246},
  {code:"NIU",n:"Naiu Atoll — Naiu Airport",lat:-16.119296,lng:-146.368768},
  {code:"RRR",n:"Raroia Airport",lat:-16.050485,lng:-142.476568},
  {code:"TKX",n:"Takaroa Airport",lat:-14.45580005645752,lng:-145.02499389648438},
  {code:"NHV",n:"Nuku Hiva Airport",lat:-8.7956,lng:-140.229004},
  {code:"AUQ",n:"Hiva Oa Island — Hiva Oa-Atuona Airport",lat:-9.76879024506,lng:-139.011001587},
  {code:"UAP",n:"Ua Pou Airport",lat:-9.35167,lng:-140.078003},
  {code:"UAH",n:"Ua Huka Airport",lat:-8.936228,lng:-139.554062},
  {code:"BOB",n:"Motu Mute — Bora Bora Airport",lat:-16.444400787353516,lng:-151.75100708007812},
  {code:"RGI",n:"Rangiroa Airport",lat:-14.954299926757812,lng:-147.66099548339844},
  {code:"HUH",n:"Huahine-Fare Airport",lat:-16.687084,lng:-151.021593},
  {code:"MOZ",n:"Moorea-Maiao — Moorea Temae Airport",lat:-17.48979,lng:-149.761777},
  {code:"HOI",n:"Otepa — Hao Airport",lat:-18.0748,lng:-140.945999},
  {code:"MAU",n:"Maupiti Airport",lat:-16.42650032043457,lng:-152.24400329589844},
  {code:"RFP",n:"Uturoa — Raiatea Airport",lat:-16.7229,lng:-151.466003},
  {code:"SLH",n:"Sola Airport",lat:-13.8516998291,lng:167.537002563},
  {code:"CCV",n:"Craig Cove Airport",lat:-16.264999,lng:167.923996},
  {code:"LOD",n:"Longana Airport",lat:-15.3066997528,lng:167.966995239},
  {code:"SSR",n:"Pentecost Island — Sara Airport",lat:-15.4708003998,lng:168.151992798},
  {code:"PBJ",n:"Paama Island — Tavie Airport",lat:-16.431955,lng:168.235511},
  {code:"LPM",n:"Lamap Airport",lat:-16.4611228,lng:167.829253},
  {code:"LNB",n:"Lamen Bay Airport",lat:-16.584199905400002,lng:168.158996582},
  {code:"LNE",n:"Lonorore Airport",lat:-15.865599632299999,lng:168.17199707},
  {code:"NUS",n:"Norsup Airport",lat:-16.0797,lng:167.401001},
  {code:"SON",n:"Luganville — Santo Pekoa International Airport",lat:-15.505000114399998,lng:167.220001221},
  {code:"TGH",n:"Tongoa Island — Tongoa Airport",lat:-16.8910999298,lng:168.550994873},
  {code:"VLS",n:"Epi Island — Valesdir Airport",lat:-16.796100616500002,lng:168.177001953},
  {code:"WLH",n:"Walaha Airport",lat:-15.412,lng:167.690994},
  {code:"OLJ",n:"Olpoi — North West Santo Airport",lat:-14.881699562099998,lng:166.557998657},
  {code:"FTA",n:"Futuna Island — Futuna Airport",lat:-19.516399383499998,lng:170.231994629},
  {code:"VLI",n:"Port Vila — Bauerfield International Airport",lat:-17.699301,lng:168.320007},
  {code:"TAH",n:"Tanna Island — Whitegrass Airport",lat:-19.455099,lng:169.223999},
  {code:"TGJ",n:"Tiga Airport",lat:-21.096407,lng:167.80379},
  {code:"BMY",n:"Île Art - Waala Airport",lat:-19.720521,lng:163.661077},
  {code:"KNQ",n:"Koné Airport",lat:-21.053551,lng:164.838768},
  {code:"ILP",n:"Île des Pins Airport",lat:-22.5889,lng:167.455994},
  {code:"KOC",n:"Koumac Airport",lat:-20.546323,lng:164.255648},
  {code:"LIF",n:"Lifou Airport",lat:-20.774563,lng:167.239328},
  {code:"GEA",n:"Nouméa Magenta Airport",lat:-22.257706,lng:166.472822},
  {code:"MEE",n:"Maré Airport",lat:-21.482438,lng:168.038465},
  {code:"TOU",n:"Touho Airport",lat:-20.790127,lng:165.259524},
  {code:"UVE",n:"Ouvéa Airport",lat:-20.640932,lng:166.573024},
  {code:"NOU",n:"Nouméa (La Tontouta) — La Tontouta International Airport",lat:-22.014601,lng:166.212997},
  {code:"AKL",n:"Auckland International Airport",lat:-37.01199,lng:174.786331},
  {code:"TUO",n:"Taupo Airport",lat:-38.73970031738281,lng:176.08399963378906},
  {code:"CHC",n:"Christchurch International Airport",lat:-43.489029,lng:172.532065},
  {code:"CHT",n:"Te One — Inia William Tuuta Memorial Airport",lat:-43.81189,lng:-176.46514},
  {code:"DUD",n:"Dunedin International Airport",lat:-45.929017,lng:170.197758},
  {code:"GBZ",n:"Claris — Great Barrier Aerodrome",lat:-36.241402,lng:175.472},
  {code:"GIS",n:"Gisborne Airport",lat:-38.6633,lng:177.977997},
  {code:"HKK",n:"Hokitika Airfield",lat:-42.713600158691406,lng:170.98500061035156},
  {code:"HLZ",n:"Hamilton International Airport",lat:-37.866961,lng:175.331952},
  {code:"KKE",n:"Kerikeri Airport",lat:-35.259148,lng:173.913317},
  {code:"KAT",n:"Awanui — Kaitaia Airport",lat:-35.069837,lng:173.287053},
  {code:"NPL",n:"New Plymouth Airport",lat:-39.00859832763672,lng:174.1790008544922},
  {code:"NPE",n:"Napier — Hawke's Bay Airport",lat:-39.465801,lng:176.869995},
  {code:"NSN",n:"Nelson Airport",lat:-41.296709,lng:173.224323},
  {code:"IVC",n:"Invercargill Airport",lat:-46.41239929199219,lng:168.31300354003906},
  {code:"PMR",n:"Palmerston North Airport",lat:-40.320599,lng:175.617004},
  {code:"PCN",n:"Koromiko — Picton Aerodrome",lat:-41.346099853516,lng:173.95599365234},
  {code:"ZQN",n:"Queenstown Airport",lat:-45.019205,lng:168.746379},
  {code:"ROT",n:"Rotorua Regional Airport",lat:-38.1092,lng:176.317001},
  {code:"TRG",n:"Tauranga Airport",lat:-37.67190170288086,lng:176.1959991455078},
  {code:"TIU",n:"Timaru Airport",lat:-44.302799224853516,lng:171.22500610351562},
  {code:"BHE",n:"Blenheim — Woodbourne Airport",lat:-41.5182991027832,lng:173.8699951171875},
  {code:"WKA",n:"Wanaka Airport",lat:-44.722091,lng:169.246287},
  {code:"WHK",n:"Whakatāne Airport",lat:-37.922224,lng:176.91696},
  {code:"WLG",n:"Wellington International Airport",lat:-41.326839,lng:174.806862},
  {code:"WRE",n:"Whangarei Airport",lat:-35.769253,lng:174.363713},
  {code:"WSZ",n:"Westport Airport",lat:-41.737111,lng:171.579033},
  {code:"WAG",n:"Wanganui Airport",lat:-39.963467,lng:175.02444},
  {code:"FBD",n:"Fayzabad Airport",lat:37.122148,lng:70.5201},
  {code:"HEA",n:"Guzara — Herat - Khwaja Abdullah Ansari International Airport",lat:34.209999,lng:62.228298},
  {code:"KBL",n:"Kabul International Airport",lat:34.565899,lng:69.212303},
  {code:"KDH",n:"Kandahar — Ahmad Shah Baba International Airport",lat:31.505769,lng:65.847963},
  {code:"KHT",n:"Khost International Airport",lat:33.284605,lng:69.80734},
  {code:"MZR",n:"Mazar-i-Sharif International Airport",lat:36.70412,lng:67.210459},
  {code:"OCS",n:"Corisco Island — Corisco International Airport",lat:0.910937,lng:9.33027},
  {code:"AHB",n:"Abha International Airport",lat:18.2404,lng:42.656601},
  {code:"HOF",n:"Hofuf — Al-Ahsa International Airport",lat:25.285299,lng:49.485199},
  {code:"ULH",n:"Al-Ula International Airport",lat:26.483634,lng:38.117048},
  {code:"ABT",n:"Al-Baha — King Saud Bin Abdulaziz (Al Baha) Airport",lat:20.298506,lng:41.636153},
  {code:"BHH",n:"Bisha Airport",lat:19.9844,lng:42.620899},
  {code:"DMM",n:"Ad Dammam — King Fahd International Airport",lat:26.4691,lng:49.798209},
  {code:"DWD",n:"Dawadmi Domestic Airport",lat:24.4499,lng:44.121201},
  {code:"GIZ",n:"Jizan Regional Airport / King Abdullah bin Abdulaziz Airport",lat:16.9011,lng:42.5858},
  {code:"ELQ",n:"Qassim — Prince Naif bin Abdulaziz International Airport",lat:26.302799,lng:43.774399},
  {code:"URY",n:"Gurayat Domestic Airport",lat:31.412413,lng:37.278898},
  {code:"HAS",n:"Hail International Airport",lat:27.437901,lng:41.686298},
  {code:"KMC",n:"King Khaled Military City Airport",lat:27.9009,lng:45.528198},
  {code:"MED",n:"Medina — Prince Mohammad Bin Abdulaziz Airport",lat:24.5534,lng:39.705101},
  {code:"EAM",n:"Najran Domestic Airport",lat:17.611401,lng:44.419201},
  {code:"NUM",n:"Sharma — Neom Bay Airport",lat:27.924261,lng:35.29358},
  {code:"AQI",n:"Qaisumah–Hafar Al-Batin International Airport",lat:28.335726,lng:46.127108},
  {code:"RAH",n:"Rafha Domestic Airport",lat:29.626399993896484,lng:43.4906005859375},
  {code:"RAE",n:"Arar Domestic Airport",lat:30.906600952148438,lng:41.13819885253906},
  {code:"SHW",n:"Sharurah Domestic Airport",lat:17.4669,lng:47.121399},
  {code:"AJF",n:"Al-Jawf International Airport",lat:29.783301,lng:40.100905},
  {code:"TUU",n:"Tabuk — Prince Sultan bin Abdulaziz International Airport",lat:28.3711,lng:36.624865},
  {code:"TIF",n:"Taif International Airport",lat:21.484739,lng:40.544074},
  {code:"TUI",n:"Turaif Domestic Airport",lat:31.692188,lng:38.731544},
  {code:"WAE",n:"Wadi Al Dawasir Domestic Airport",lat:20.504299,lng:45.1996},
  {code:"EJH",n:"Al Wajh Domestic Airport",lat:26.198601,lng:36.476398},
  {code:"YNB",n:"Yanbu — Prince Abdulmohsen Bin Abdulaziz International Airport",lat:24.144199,lng:38.0634},
  {code:"ABD",n:"Abadan Ayatollah Jami International Airport",lat:30.367887,lng:48.230075},
  {code:"DEF",n:"Dezful Airport",lat:32.434399,lng:48.397598},
  {code:"GCH",n:"Gachsaran Airport",lat:30.333869,lng:50.833796},
  {code:"MRX",n:"Mahshahr Airport",lat:30.5562,lng:49.151901},
  {code:"AWZ",n:"Ahvaz — Qasem Soleimani International Airport",lat:31.3364,lng:48.763789},
  {code:"AEU",n:"Abu Musa Island Airport",lat:25.8757,lng:55.033001},
  {code:"BUZ",n:"Bushehr Airport",lat:28.9447994232,lng:50.8345985413},
  {code:"KIH",n:"Kish Island — Kish International Airport",lat:26.525427,lng:53.980462},
  {code:"BDH",n:"Bandar Lengeh International Airport",lat:26.532283,lng:54.82484},
  {code:"PGU",n:"Khiyaroo — Persian Gulf International Airport",lat:27.379601,lng:52.737701},
  {code:"KHK",n:"Khark Airport",lat:29.260503,lng:50.322193},
  {code:"KSH",n:"Kermanshah — Shahid Ashrafi Esfahani Airport",lat:34.3459014893,lng:47.1581001282},
  {code:"KHD",n:"Khoram Abad Airport",lat:33.43539810180664,lng:48.282901763916016},
  {code:"SDG",n:"Sanandaj Airport",lat:35.24589920043945,lng:47.00920104980469},
  {code:"KKS",n:"Kashan Airport",lat:33.895302,lng:51.577},
  {code:"IFN",n:"Isfahan Shahid Beheshti International Airport",lat:32.755142,lng:51.883877},
  {code:"RAS",n:"Rasht — Sardar-e-Jangal Airport",lat:37.323333,lng:49.617778},
  {code:"HDM",n:"Hamadan Airport",lat:34.866416,lng:48.56069},
  {code:"IKA",n:"Tehran — Imam Khomeini International Airport",lat:35.416099548339844,lng:51.152198791503906},
  {code:"THR",n:"Tehran — Mehrabad International Airport",lat:35.689175,lng:51.314392},
  {code:"PYK",n:"Karaj — Payam International Airport",lat:35.7761,lng:50.826698},
  {code:"SNX",n:"Semnan Municipal Airport",lat:35.591099,lng:53.495098},
  {code:"BND",n:"Bandar Abbas International Airport",lat:27.2183,lng:56.3778},
  {code:"KER",n:"Kerman — Ayatollah Hashemi Rafsanjani International Airport",lat:30.271276,lng:56.949692},
  {code:"BXR",n:"Bam Airport",lat:29.0842,lng:58.450001},
  {code:"GSM",n:"Qeshm(Dayrestan) — Qeshm International Airport",lat:26.754639,lng:55.902353},
  {code:"RJN",n:"Rafsanjan Airport",lat:30.298345,lng:56.048979},
  {code:"XBJ",n:"Birjand International Airport",lat:32.896525,lng:59.281258},
  {code:"MHD",n:"Mashhad International Airport",lat:36.234821,lng:59.642949},
  {code:"BJB",n:"Bojnord Airport",lat:37.49300003051758,lng:57.30820083618164},
  {code:"AFZ",n:"Sabzevar National Airport",lat:36.16809844970703,lng:57.59519958496094},
  {code:"NSH",n:"Nowshahr Airport",lat:36.664286,lng:51.46273},
  {code:"RZR",n:"Ramsar Airport",lat:36.90701,lng:50.687316},
  {code:"SRY",n:"Sari Dasht-e Naz International Airport",lat:36.644408,lng:53.188761},
  {code:"LRR",n:"Lar Airport",lat:27.6747,lng:54.383301},
  {code:"LFM",n:"Lamerd Airport",lat:27.3727,lng:53.188801},
  {code:"SYZ",n:"Shiraz Shahid Dastghaib International Airport",lat:29.5392,lng:52.589802},
  {code:"ADU",n:"Ardabil Airport",lat:38.3256988525,lng:48.4244003296},
  {code:"PFQ",n:"Parsabad-Moghan Airport",lat:39.6036,lng:47.8815},
  {code:"OMH",n:"Urmia Airport",lat:37.6680984497,lng:45.0686988831},
  {code:"TBZ",n:"Tabriz International Airport",lat:38.1339,lng:46.235001},
  {code:"AZD",n:"Yazd — Shahid Sadooghi Airport",lat:31.9048995972,lng:54.2765007019},
  {code:"ZBR",n:"Chabahar Konarak International Airport",lat:25.44319,lng:60.382167},
  {code:"ZAH",n:"Zahedan International Airport",lat:29.4757,lng:60.9062},
  {code:"JSK",n:"Bandar-e-Jask — Jask Airport",lat:25.654757,lng:57.801718},
  {code:"ADJ",n:"Marka International (Amman Civil) Airport",lat:31.9727,lng:35.9916},
  {code:"AQJ",n:"Aqaba — King Hussein International Airport",lat:29.611601,lng:35.018101},
  {code:"BEY",n:"Beirut Rafic Hariri International Airport",lat:33.819833,lng:35.487443},
  {code:"OLH",n:"Old Harbor Airport",lat:57.218102,lng:-153.270004},
  {code:"DQM",n:"Duqm International Airport",lat:19.501944,lng:57.634167},
  {code:"AAN",n:"Al Ain International Airport",lat:24.2617,lng:55.6092},
  {code:"ZDY",n:"Delma Island — Delma Airport",lat:24.51,lng:52.3352},
  {code:"FJR",n:"Fujairah International Airport",lat:25.108411,lng:56.328061},
  {code:"RKT",n:"Ras Al Khaimah International Airport",lat:25.613501,lng:55.938801},
  {code:"KHS",n:"Khasab Airport",lat:26.171,lng:56.240601},
  {code:"SLL",n:"Salalah International Airport",lat:17.0387,lng:54.091301},
  {code:"OHS",n:"Suhar International Airport",lat:24.38604,lng:56.62541},
  {code:"BHV",n:"Bahawalpur Airport",lat:29.348100662231445,lng:71.71800231933594},
  {code:"CJL",n:"Chitral Airport",lat:35.886213,lng:71.799922},
  {code:"DBA",n:"Dalbandin Airport",lat:28.878299713100002,lng:64.3998031616},
  {code:"DEA",n:"Dera Ghazi Khan Airport",lat:29.961000442504883,lng:70.48590087890625},
  {code:"LYP",n:"Faisalabad International Airport",lat:31.364923,lng:72.995319},
  {code:"GWD",n:"Gurandani — New Gwadar International Airport",lat:25.296733,lng:62.498822},
  {code:"GIL",n:"Gilgit Airport",lat:35.918800354003906,lng:74.33360290527344},
  {code:"ISB",n:"Attock — Islamabad International Airport",lat:33.549,lng:72.82566},
  {code:"KHI",n:"Karachi — Jinnah International Airport",lat:24.9065,lng:67.160797},
  {code:"HDD",n:"Hyderabad Airport",lat:25.3181,lng:68.366096},
  {code:"KDD",n:"Khuzdar Airport",lat:27.790599823,lng:66.6473007202},
  {code:"LHE",n:"Lahore — Allama Iqbal International Airport",lat:31.521601,lng:74.403603},
  {code:"MFG",n:"Muzaffarabad Airport",lat:34.338835,lng:73.508886},
  {code:"MUX",n:"Multan International Airport",lat:30.203199,lng:71.419098},
  {code:"WNS",n:"Nawabashah — Shaheed Benazirabad Airport",lat:26.2194,lng:68.390099},
  {code:"PEW",n:"Peshawar — Bacha Khan International Airport",lat:33.9939,lng:71.514603},
  {code:"UET",n:"Quetta International Airport",lat:30.2514,lng:66.937798},
  {code:"RYK",n:"Rahim Yar Khan — Shaikh Zaid Airport",lat:28.383899688720703,lng:70.27960205078125},
  {code:"KDU",n:"Skardu International Airport",lat:35.33866,lng:75.538648},
  {code:"SKZ",n:"Begum Nusrat Bhutto International Airport Sukkur",lat:27.722,lng:68.791702},
  {code:"SKT",n:"Sialkot International Airport",lat:32.535941,lng:74.364623},
  {code:"TUK",n:"Turbat International Airport",lat:25.984767,lng:63.028856},
  {code:"PZH",n:"Fort Sandeman — Zhob Airport",lat:31.358400344848633,lng:69.4636001586914},
  {code:"BGW",n:"Baghdad International Airport / New Al Muthana Air Base",lat:33.262501,lng:44.2346},
  {code:"EBL",n:"Arbil — Erbil International Airport",lat:36.236047,lng:43.946615},
  {code:"ORI",n:"Port Lions Airport",lat:57.884905,lng:-152.847719},
  {code:"KIK",n:"Kirkuk International Airport",lat:35.469501,lng:44.3489},
  {code:"BSR",n:"Basra International Airport",lat:30.549101,lng:47.662102},
  {code:"NJF",n:"Al Najaf International Airport",lat:31.991116,lng:44.405019},
  {code:"ISU",n:"Sulaymaniyah — Jalal Talabani International Airport",lat:35.560487,lng:45.315137},
  {code:"ALP",n:"Aleppo International Airport",lat:36.181262,lng:37.226869},
  {code:"DAM",n:"Damascus International Airport",lat:33.4114990234375,lng:36.51559829711914},
  {code:"KAC",n:"Qamishli International Airport",lat:37.020599,lng:41.191399},
  {code:"LTK",n:"Latakia International Airport",lat:35.4011,lng:35.9487},
  {code:"DIA",n:"Doha International Airport",lat:25.259431,lng:51.565528},
  {code:"ADE",n:"Aden International Airport",lat:12.829564,lng:45.029976},
  {code:"AAY",n:"Al Ghaydah International Airport",lat:16.193341,lng:52.174186},
  {code:"RIY",n:"Mukalla(Riyan) — Riyan International Airport",lat:14.662241,lng:49.375289},
  {code:"SAH",n:"Sanaa International Airport",lat:15.4763,lng:44.2197},
  {code:"SCT",n:"Mori — Socotra Airport",lat:12.632093,lng:53.906173},
  {code:"GXF",n:"Seiyun Hadhramaut International Airport",lat:15.965887,lng:48.788146},
  {code:"TAI",n:"Taiz International Airport",lat:13.686,lng:44.139099},
  {code:"BFQ",n:"Puerto Piña — Bahia Piña Airport",lat:7.58737,lng:-78.179939},
  {code:"OTD",n:"Contadora Island — Raul Arias Espinoza Airport",lat:8.62876,lng:-79.034698},
  {code:"AKB",n:"Atka Airport",lat:52.220299,lng:-174.205994},
  {code:"BTI",n:"Barter Island Long Range Radar Station Airport",lat:70.134003,lng:-143.582001},
  {code:"BET",n:"Bethel Airport",lat:60.77980042,lng:-161.8379974},
  {code:"BKC",n:"Buckland Airport",lat:65.981598,lng:-161.149002},
  {code:"BRW",n:"Utqiaġvik — Wiley Post Will Rogers Memorial Airport",lat:71.285402,lng:-156.766008},
  {code:"BTT",n:"Bettles Airport",lat:66.913902,lng:-151.529007},
  {code:"CDB",n:"Cold Bay Airport",lat:55.207871,lng:-162.725029},
  {code:"CEM",n:"Central Airport",lat:65.573815,lng:-144.780707},
  {code:"CIK",n:"Chalkyitsik Airport",lat:66.644997,lng:-143.740005},
  {code:"CYF",n:"Chefornak Airport",lat:60.136667,lng:-164.279167},
  {code:"SCM",n:"Scammon Bay Airport",lat:61.84471,lng:-165.575209},
  {code:"IRC",n:"Circle City (New) Airport",lat:65.827673,lng:-144.076195},
  {code:"CDV",n:"Cordova — Merle K (Mudhole) Smith Airport",lat:60.491798,lng:-145.477997},
  {code:"CYT",n:"Yakataga Airport",lat:60.080974,lng:-142.494541},
  {code:"DRG",n:"Deering Airport",lat:66.068901,lng:-162.766914},
  {code:"ADK",n:"Adak Airport",lat:51.883564,lng:-176.642783},
  {code:"DLG",n:"Dillingham Airport",lat:59.04470062,lng:-158.5050049},
  {code:"MLL",n:"Marshall Don Hunter Sr Airport",lat:61.8643,lng:-162.026001},
  {code:"ADQ",n:"Kodiak Airport",lat:57.75,lng:-152.4940033},
  {code:"DUT",n:"Unalaska — Tom Madsen (Dutch Harbor) Airport",lat:53.89881,lng:-166.544996},
  {code:"KKH",n:"Kongiganak Airport",lat:59.9608,lng:-162.880997},
  {code:"EEK",n:"Eek Airport",lat:60.213173,lng:-162.044048},
  {code:"EAA",n:"Eagle Airport",lat:64.778003,lng:-141.150455},
  {code:"EMK",n:"Emmonak Airport",lat:62.78609848,lng:-164.4909973},
  {code:"ENA",n:"Kenai Municipal Airport",lat:60.570946,lng:-151.245174},
  {code:"WWT",n:"Mertarvik Airport",lat:60.81037,lng:-164.499511},
  {code:"FAI",n:"Fairbanks International Airport",lat:64.815102,lng:-147.856003},
  {code:"ABL",n:"Ambler Airport",lat:67.105529,lng:-157.855339},
  {code:"NIB",n:"Nikolai Airport",lat:63.017949,lng:-154.360399},
  {code:"GAL",n:"Galena — Edward G. Pitka Sr Airport",lat:64.736198,lng:-156.936997},
  {code:"KWK",n:"Kwigillingok Airport",lat:59.876499,lng:-163.169005},
  {code:"SHG",n:"Shungnak Airport",lat:66.88809967041,lng:-157.16200256348},
  {code:"GKN",n:"Gulkana Airport",lat:62.155859,lng:-145.454662},
  {code:"GLV",n:"Golovin Airport",lat:64.550499,lng:-163.007004},
  {code:"GAM",n:"Gambell Airport",lat:63.767694,lng:-171.733303},
  {code:"GST",n:"Gustavus Airport",lat:58.4253006,lng:-135.7070007},
  {code:"NME",n:"Nightmute Airport",lat:60.469129,lng:-164.70407},
  {code:"SGY",n:"Skagway Airport",lat:59.460343,lng:-135.316651},
  {code:"HCR",n:"Holy Cross Airport",lat:62.18830108642578,lng:-159.77499389648438},
  {code:"HSL",n:"Huslia Airport",lat:65.697899,lng:-156.350998},
  {code:"HNS",n:"Haines Airport",lat:59.243921,lng:-135.523925},
  {code:"HOM",n:"Homer Airport",lat:59.644456,lng:-151.479235},
  {code:"HPB",n:"Hooper Bay Airport",lat:61.523899,lng:-166.147003},
  {code:"HUS",n:"Hughes Airport",lat:66.04109955,lng:-154.2630005},
  {code:"IGG",n:"Igiugig Airport",lat:59.324001,lng:-155.901993},
  {code:"EGX",n:"Egegik Airport",lat:58.184386,lng:-157.374873},
  {code:"IAN",n:"Kiana — Bob Baker Memorial Airport",lat:66.976128,lng:-160.439014},
  {code:"ILI",n:"Iliamna Airport",lat:59.754398,lng:-154.910996},
  {code:"UTO",n:"Utopia Creek — Indian Mountain LRRS Airport",lat:65.992798,lng:-153.703995},
  {code:"WAA",n:"Wales Airport",lat:65.622593,lng:-168.095},
  {code:"KCG",n:"Chignik Airport",lat:56.311501,lng:-158.373001},
  {code:"JNU",n:"Juneau International Airport",lat:58.354935,lng:-134.574416},
  {code:"KGK",n:"Koliganek Airport",lat:59.726600647,lng:-157.259002686},
  {code:"KFP",n:"False Pass Airport",lat:54.84751,lng:-163.407168},
  {code:"AKK",n:"Akhiok Airport",lat:56.938702,lng:-154.182999},
  {code:"KPN",n:"Kipnuk Airport",lat:59.931796,lng:-164.028196},
  {code:"KKA",n:"Koyuk Alfred Adams Airport",lat:64.939499,lng:-161.154007},
  {code:"AKN",n:"King Salmon Airport",lat:58.677845,lng:-156.651965},
  {code:"IKO",n:"Nikolski Air Station",lat:52.941552,lng:-168.849478},
  {code:"AKP",n:"Anaktuvuk Pass Airport",lat:68.133598,lng:-151.742996},
  {code:"KTN",n:"Ketchikan International Airport",lat:55.35559845,lng:-131.7140045},
  {code:"KAL",n:"Kaltag Airport",lat:64.31864,lng:-158.74197},
  {code:"KLW",n:"Klawock Airport",lat:55.579201,lng:-133.076004},
  {code:"KYK",n:"Karluk Airport",lat:57.565919,lng:-154.453762},
  {code:"KLN",n:"Larsen Bay Airport",lat:57.53516,lng:-153.976455},
  {code:"KLG",n:"Kalskag Airport",lat:61.53630065917969,lng:-160.34100341796875},
  {code:"PTA",n:"Port Alsworth Airport",lat:60.201681,lng:-154.325863},
  {code:"LUR",n:"Cape Lisburne LRRS Airport",lat:68.875099,lng:-166.110001},
  {code:"KMO",n:"Manokotak Airport",lat:58.932056,lng:-158.901886},
  {code:"MCG",n:"McGrath Airport",lat:62.95289993,lng:-155.6060028},
  {code:"LMA",n:"Minchumina Airport",lat:63.886002,lng:-152.302002},
  {code:"SMK",n:"St Michael Airport",lat:63.49010086,lng:-162.1100006},
  {code:"MLY",n:"Manley Hot Springs Airport",lat:64.99188,lng:-150.644102},
  {code:"MOU",n:"Mountain Village Airport",lat:62.095401763916016,lng:-163.6820068359375},
  {code:"MRI",n:"Anchorage — Merrill Field",lat:61.212792,lng:-149.843988},
  {code:"MYU",n:"Mekoryuk Airport",lat:60.372338,lng:-166.269751},
  {code:"WNA",n:"Napakiak Airport",lat:60.6903,lng:-161.979004},
  {code:"ANC",n:"Ted Stevens Anchorage International Airport",lat:61.179004,lng:-149.992561},
  {code:"ANI",n:"Aniak Airport",lat:61.581600189208984,lng:-159.54299926757812},
  {code:"NUL",n:"Nulato Airport",lat:64.729301,lng:-158.074005},
  {code:"ANV",n:"Anvik Airport",lat:62.646702,lng:-160.190994},
  {code:"KNW",n:"New Stuyahok Airport",lat:59.451838,lng:-157.373829},
  {code:"OBU",n:"Kobuk Airport",lat:66.9123,lng:-156.897003},
  {code:"HNH",n:"Hoonah Airport",lat:58.0961,lng:-135.410111},
  {code:"OME",n:"Nome Airport",lat:64.51219940185547,lng:-165.44500732421875},
  {code:"OOK",n:"Toksook Bay Airport",lat:60.541401,lng:-165.087006},
  {code:"ORT",n:"Northway Airport",lat:62.9613,lng:-141.929001},
  {code:"OTZ",n:"Kotzebue — Ralph Wien Memorial Airport",lat:66.88469696,lng:-162.598999},
  {code:"NLG",n:"Nelson Lagoon Airport",lat:56.0075,lng:-161.160004},
  {code:"STG",n:"St George Airport",lat:56.577345,lng:-169.663823},
  {code:"KPV",n:"Perryville Airport",lat:55.9065,lng:-159.16091},
  {code:"PSG",n:"Petersburg James A Johnson Airport",lat:56.80170059,lng:-132.9450073},
  {code:"PTH",n:"Port Heiden Airport",lat:56.957893,lng:-158.630219},
  {code:"PKA",n:"Napaskiak Airport",lat:60.7029,lng:-161.778},
  {code:"PTU",n:"Platinum Airport",lat:59.017675,lng:-161.827927},
  {code:"PIP",n:"Pilot Point Airport",lat:57.580399,lng:-157.572006},
  {code:"PHO",n:"Point Hope Airport",lat:68.348801,lng:-166.798996},
  {code:"KWN",n:"Quinhagak Airport",lat:59.7551,lng:-161.845},
  {code:"NUI",n:"Nuiqsut Airport",lat:70.209999,lng:-151.005998},
  {code:"ARC",n:"Arctic Village Airport",lat:68.1147,lng:-145.578995},
  {code:"RSH",n:"Russian Mission Airport",lat:61.775071,lng:-161.319466},
  {code:"RBY",n:"Ruby Airport",lat:64.727203,lng:-155.470001},
  {code:"SVA",n:"Savoonga Airport",lat:63.686401,lng:-170.492996},
  {code:"SCC",n:"Deadhorse Airport",lat:70.19470215,lng:-148.4649963},
  {code:"SDP",n:"Sand Point Airport",lat:55.313908,lng:-160.522099},
  {code:"SHH",n:"Shishmaref Airport",lat:66.249604,lng:-166.089112},
  {code:"SIT",n:"Sitka Rocky Gutierrez Airport",lat:57.04710006713867,lng:-135.36199951171875},
  {code:"WLK",n:"Selawik Airport",lat:66.600098,lng:-159.985992},
  {code:"SLQ",n:"Sleetmute Airport",lat:61.7005,lng:-157.166},
  {code:"KSM",n:"St Mary's Airport",lat:62.060501,lng:-163.302002},
  {code:"SNP",n:"St Paul Island Airport",lat:57.166311,lng:-170.222555},
  {code:"SOV",n:"Seldovia Airport",lat:59.442981,lng:-151.705227},
  {code:"TAL",n:"Tanana — Ralph M Calhoun Memorial Airport",lat:65.1744,lng:-152.108994},
  {code:"TNC",n:"Tin City Long Range Radar Station Airport",lat:65.563103,lng:-167.921997},
  {code:"TLA",n:"Teller Airport",lat:65.240402,lng:-166.339005},
  {code:"TOG",n:"Togiak Village — Togiak Airport",lat:59.052799,lng:-160.397003},
  {code:"ATK",n:"Atqasuk Edward Burnell Sr Memorial Airport",lat:70.46704,lng:-157.436013},
  {code:"AUK",n:"Alakanuk Airport",lat:62.682653,lng:-164.722481},
  {code:"UNK",n:"Unalakleet Airport",lat:63.888401,lng:-160.798996},
  {code:"KQA",n:"Akutan Airport",lat:54.14459,lng:-165.604332},
  {code:"VAK",n:"Chevak Airport",lat:61.5409,lng:-165.6005},
  {code:"KVC",n:"King Cove Airport",lat:55.116299,lng:-162.266006},
  {code:"VDZ",n:"Valdez Pioneer Field",lat:61.132712,lng:-146.246567},
  {code:"VEE",n:"Venetie Airport",lat:67.008698,lng:-146.365997},
  {code:"KVL",n:"Kivalina Airport",lat:67.734565,lng:-164.559917},
  {code:"WBQ",n:"Beaver Airport",lat:66.362198,lng:-147.406998},
  {code:"WRG",n:"Wrangell Airport",lat:56.48429871,lng:-132.3699951},
  {code:"AIN",n:"Wainwright Airport",lat:70.638,lng:-159.994995},
  {code:"WMO",n:"White Mountain Airport",lat:64.689201,lng:-163.412994},
  {code:"WTK",n:"Noatak Airport",lat:67.561241,lng:-162.980461},
  {code:"YAK",n:"Yakutat Airport",lat:59.508717,lng:-139.660435},
  {code:"AKI",n:"Akiak Airport",lat:60.902646,lng:-161.23106},
  {code:"AET",n:"Allakaket Airport",lat:66.551804,lng:-152.621994},
  {code:"NCN",n:"Chenega Bay Airport",lat:60.077602,lng:-147.99468},
  {code:"CLP",n:"Clarks Point Airport",lat:58.833698,lng:-158.529007},
  {code:"ELI",n:"Elim Airport",lat:64.6147,lng:-162.272003},
  {code:"KUK",n:"Kasigluk Airport",lat:60.872747,lng:-162.5247},
  {code:"KNK",n:"Kokhanok Airport",lat:59.433248,lng:-154.80217},
  {code:"KOT",n:"Kotlik Airport",lat:63.030602,lng:-163.533005},
  {code:"KTS",n:"Brevig Mission Airport",lat:65.331826,lng:-166.467848},
  {code:"KYU",n:"Koyukuk Airport",lat:64.876099,lng:-157.727005},
  {code:"KWT",n:"Kwethluk Airport",lat:60.790298,lng:-161.444},
  {code:"ORV",n:"Noorvik — Robert (Bob) Curtis Memorial Airport",lat:66.817902,lng:-161.018997},
  {code:"SKK",n:"Shaktoolik Airport",lat:64.371101,lng:-161.223999},
  {code:"TKJ",n:"Tok Junction Airport",lat:63.32949829,lng:-142.9539948},
  {code:"WSN",n:"South Naknek Number 2 Airport",lat:58.702362,lng:-157.005444},
  {code:"FYU",n:"Fort Yukon Airport",lat:66.571651,lng:-145.249987},
  {code:"LMY",n:"Lake Murray Airport",lat:-7.00992,lng:141.494003},
  {code:"PGM",n:"Port Graham Airport",lat:59.348355,lng:-151.830025},
  {code:"ROP",n:"Rota Island — Rota International Airport",lat:14.173267,lng:145.241103},
  {code:"SPN",n:"I Fadang, Saipan — Saipan International Airport",lat:15.119384,lng:145.728848},
  {code:"GUM",n:"Hagåtña — Antonio B. Won Pat International Airport",lat:13.485,lng:144.797282},
  {code:"TIQ",n:"Tinian Island — Francisco Manglona Borja / Tinian International Airport",lat:14.999207,lng:145.619355},
  {code:"HNM",n:"Hana Airport",lat:20.795601,lng:-156.014008},
  {code:"JHM",n:"Lahaina — Kapalua Airport",lat:20.9629,lng:-156.673004},
  {code:"KOA",n:"Kailua-Kona — Ellison Onizuka Kona International Airport at Keāhole",lat:19.738783,lng:-156.045603},
  {code:"LIH",n:"Lihue, Kauai — Lihue Airport",lat:21.974393,lng:-159.337146},
  {code:"LUP",n:"Kalaupapa Airport",lat:21.211,lng:-156.973999},
  {code:"MKK",n:"Kaunakakai — Molokai Airport",lat:21.152901,lng:-157.095993},
  {code:"MUE",n:"Waimea (Kamuela) — Waimea Kohala Airport",lat:20.001301,lng:-155.667999},
  {code:"HNL",n:"Honolulu, Oahu — Daniel K. Inouye International Airport",lat:21.318387,lng:-157.92567},
  {code:"LNY",n:"Lanai City — Lanai Airport",lat:20.785675,lng:-156.951324},
  {code:"OGG",n:"Kahului International Airport",lat:20.896263,lng:-156.431837},
  {code:"ITO",n:"Hilo International Airport",lat:19.72135,lng:-155.045428},
  {code:"ENT",n:"Eniwetok Atoll — Eniwetok Airport",lat:11.340700149536133,lng:162.3280029296875},
  {code:"MAJ",n:"Majuro Atoll — Marshall Islands International Airport",lat:7.06511,lng:171.271656},
  {code:"KWA",n:"Kwajalein — Bucholz Army Air Field",lat:8.720120429992676,lng:167.73199462890625},
  {code:"CXI",n:"Kiritimati — Cassidy International Airport",lat:1.986278,lng:-157.350011},
  {code:"PIZ",n:"Point Lay LRRS Airport",lat:69.732903,lng:-163.005005},
  {code:"TKK",n:"Weno Island — Chuuk International Airport",lat:7.46187,lng:151.843002},
  {code:"PNI",n:"Pohnpei Island — Pohnpei International Airport",lat:6.985082,lng:158.20992},
  {code:"ROR",n:"Babelthuap Island — Roman Tmetuchl International Airport",lat:7.366965,lng:134.544085},
  {code:"KSA",n:"Okat — Kosrae International Airport",lat:5.35698,lng:162.957993},
  {code:"YAP",n:"Yap Island — Yap International Airport",lat:9.49891,lng:138.082993},
  {code:"AWK",n:"Wake Island Airfield",lat:19.282437,lng:166.636637},
  {code:"KIO",n:"Kili Island — Kili Airport",lat:5.64386,lng:169.124586},
  {code:"KNH",n:"Shang-I — Kinmen Airport",lat:24.4279,lng:118.359001},
  {code:"LZN",n:"Matsu (Nangan) — Matsu Nangan Airport",lat:26.159656,lng:119.958376},
  {code:"TTT",n:"Taitung City — Taitung Airport",lat:22.754856,lng:121.101794},
  {code:"KHH",n:"Kaohsiung (Xiaogang) — Kaohsiung International Airport",lat:22.577101,lng:120.349998},
  {code:"CYI",n:"Shuishang — Chiayi Airport",lat:23.462577,lng:120.390544},
  {code:"KYD",n:"Orchid Island — Lanyu Airport",lat:22.027000427246094,lng:121.53500366210938},
  {code:"RMQ",n:"Taichung (Qingshui) — Taichung International Airport / Ching Chuang Kang Air Base",lat:24.2647,lng:120.621002},
  {code:"MFK",n:"Matsu (Beigan) — Matsu Beigan Airport",lat:26.22414,lng:120.002679},
  {code:"TNN",n:"Tainan (Rende) — Tainan International Airport / Tainan Air Base",lat:22.950399,lng:120.206001},
  {code:"MZG",n:"Huxi — Penghu Magong Airport",lat:23.568701,lng:119.627998},
  {code:"TSA",n:"Taipei (Songshan) — Taipei Songshan International Airport",lat:25.067244,lng:121.552822},
  {code:"TPE",n:"Taiwan Taoyuan International Airport",lat:25.0777,lng:121.233002},
  {code:"HUN",n:"Hualien City — Hualien Chiashan Airport",lat:24.023163,lng:121.617991},
  {code:"RDV",n:"Red Devil Airport",lat:61.788101,lng:-157.350006},
  {code:"RHT",n:"Alxa Right Banner Badanjilin Airport",lat:39.225,lng:101.546},
  {code:"MMJ",n:"Shinshu-Matsumoto Airport",lat:36.166801,lng:137.923004},
  {code:"IBR",n:"Omitama — Ibaraki Airport",lat:36.181456,lng:140.414434},
  {code:"KIX",n:"Osaka — Kansai International Airport",lat:34.427299,lng:135.244003},
  {code:"SHM",n:"Nanki Shirahama Airport",lat:33.6622009277,lng:135.363998413},
  {code:"UKB",n:"Kobe Airport",lat:34.632801,lng:135.223999},
  {code:"TJH",n:"Toyooka — Konotori Tajima Airport",lat:35.512798,lng:134.787003},
  {code:"OBO",n:"Tokachi-Obihiro Airport",lat:42.7332992554,lng:143.216995239},
  {code:"CTS",n:"Sapporo — New Chitose Airport",lat:42.774753,lng:141.690414},
  {code:"HKD",n:"Hakodate Airport",lat:41.77,lng:140.822006},
  {code:"KUH",n:"Kushiro Airport",lat:43.041,lng:144.192993},
  {code:"MMB",n:"Ōzora — Memanbetsu Airport",lat:43.8805999756,lng:144.164001465},
  {code:"SHB",n:"Nakashibetsu Airport",lat:43.5774993896,lng:144.960006714},
  {code:"OKD",n:"Sapporo Okadama Airport",lat:43.117447,lng:141.38134},
  {code:"WKJ",n:"Wakkanai Airport",lat:45.4042015076,lng:141.800994873},
  {code:"AXJ",n:"Amakusa Airport",lat:32.482498,lng:130.158997},
  {code:"IKI",n:"Iki Airport",lat:33.7490005493,lng:129.785003662},
  {code:"UBJ",n:"Yamaguchi Ube Airport",lat:33.93,lng:131.279007},
  {code:"TSJ",n:"Tsushima Airport",lat:34.2849006653,lng:129.330993652},
  {code:"MBE",n:"Monbetsu Airport",lat:44.303901672399995,lng:143.404006958},
  {code:"AKJ",n:"Higashikagura — Asahikawa Airport",lat:43.670799,lng:142.447006},
  {code:"OIR",n:"Okushiri Island — Okushiri Airport",lat:42.0717010498,lng:139.432998657},
  {code:"RIS",n:"Rishiri Airport",lat:45.2420005798,lng:141.186004639},
  {code:"KUM",n:"Yakushima Airport",lat:30.385599,lng:130.658997},
  {code:"FUJ",n:"Goto — Fukue Airport",lat:32.666302,lng:128.832993},
  {code:"FUK",n:"Fukuoka Airport",lat:33.585899353027344,lng:130.4510040283203},
  {code:"TNE",n:"New Tanegashima Airport",lat:30.605100631699997,lng:130.990997314},
  {code:"KOJ",n:"Kagoshima Airport",lat:31.8034,lng:130.718994},
  {code:"KMI",n:"Miyazaki Airport",lat:31.877199,lng:131.449005},
  {code:"OIT",n:"Oita Airport",lat:33.479400634799994,lng:131.736999512},
  {code:"KKJ",n:"Kitakyushu Airport",lat:33.845901,lng:131.035004},
  {code:"HSG",n:"Kyushu Saga International Airport",lat:33.1497,lng:130.302002},
  {code:"KMJ",n:"Kumamoto Airport",lat:32.837299,lng:130.854996},
  {code:"NGS",n:"Nagasaki Airport",lat:32.916901,lng:129.914001},
  {code:"NGO",n:"Tokoname — Chubu Centrair International Airport",lat:34.858398,lng:136.804993},
  {code:"ASJ",n:"Amami Airport",lat:28.430599212646484,lng:129.71299743652344},
  {code:"OKE",n:"Wadomari — Okinoerabu Airport",lat:27.431604,lng:128.705564},
  {code:"KKX",n:"Kikai Airport",lat:28.321300506599997,lng:129.927993774},
  {code:"TKN",n:"Amagi — Tokunoshima Airport",lat:27.836382,lng:128.881356},
  {code:"NKM",n:"Nagoya Airport / JASDF Komaki Air Base",lat:35.255759,lng:136.924095},
  {code:"KMQ",n:"Kanazawa — Komatsu Airport / JASDF Komatsu Air Base",lat:36.393407,lng:136.406895},
  {code:"OKI",n:"Okinoshima — Oki Global Geopark Airport",lat:36.178388,lng:133.323566},
  {code:"FSZ",n:"Makinohara / Shimada — Mount Fuji Shizuoka Airport",lat:34.795022,lng:138.190976},
  {code:"TOY",n:"Toyama Kitokito Airport",lat:36.648416,lng:137.187359},
  {code:"NTQ",n:"Wajima — Noto Satoyama Airport",lat:37.293098,lng:136.962006},
  {code:"HIJ",n:"Hiroshima Airport",lat:34.4361,lng:132.919006},
  {code:"OKJ",n:"Okayama Momotaro Airport",lat:34.756901,lng:133.854996},
  {code:"IZO",n:"Izumo Enmusubi Airport",lat:35.413601,lng:132.889999},
  {code:"YGJ",n:"Yonago Kitaro Airport / JASDF Miho Air Base",lat:35.492199,lng:133.235992},
  {code:"IWK",n:"Iwakuni Kintaikyo Airport",lat:34.146333,lng:132.247238},
  {code:"KCZ",n:"Nankoku — Kochi Ryoma Airport",lat:33.545217,lng:133.670166},
  {code:"MYJ",n:"Matsuyama Airport",lat:33.826893,lng:132.700114},
  {code:"ITM",n:"Osaka Itami International Airport",lat:34.780853,lng:135.440829},
  {code:"TTJ",n:"Tottori Sand Dunes Conan Airport",lat:35.530058,lng:134.165023},
  {code:"TKS",n:"Tokushima Awaodori Airport / JMSDF Tokushima Air Base",lat:34.132559,lng:134.607816},
  {code:"TAK",n:"Takamatsu Airport",lat:34.214963,lng:134.015454},
  {code:"IWJ",n:"Masuda — Iwami Airport",lat:34.676399231,lng:131.789993286},
  {code:"AOJ",n:"Aomori Airport",lat:40.733777,lng:140.689477},
  {code:"GAJ",n:"Higashine — Yamagata Airport",lat:38.4119,lng:140.371002},
  {code:"SDS",n:"Sado Airport",lat:38.0601997375,lng:138.414001465},
  {code:"FKS",n:"Sukagawa — Fukushima Airport",lat:37.22740173339844,lng:140.43099975585938},
  {code:"HNA",n:"Iwate Hanamaki Airport",lat:39.4286,lng:141.134995},
  {code:"AXT",n:"Akita Airport",lat:39.615601,lng:140.218994},
  {code:"MSJ",n:"Misawa Airport / Misawa Air Base",lat:40.703201,lng:141.367996},
  {code:"KIJ",n:"Niigata Airport",lat:37.954166,lng:139.112189},
  {code:"ONJ",n:"Kitaakita — Odate Noshiro Airport",lat:40.191898,lng:140.371002},
  {code:"SDJ",n:"Natori — Sendai Airport",lat:38.139702,lng:140.917007},
  {code:"SYO",n:"Shonai Airport",lat:38.812199,lng:139.787003},
  {code:"HAC",n:"Hachijojima Airport",lat:33.114843,lng:139.785645},
  {code:"OIM",n:"Izu Oshima — Oshima Airport",lat:34.782001495399996,lng:139.36000061},
  {code:"MYE",n:"Miyakejima Airport",lat:34.073600769,lng:139.559997559},
  {code:"MWX",n:"Muan (Piseo-ri) — Muan International Airport",lat:34.991406,lng:126.382814},
  {code:"KWJ",n:"Gwangju Airport",lat:35.123173,lng:126.805444},
  {code:"KUV",n:"Gunsan Airport / Gunsan Air Base",lat:35.903801,lng:126.615997},
  {code:"RSU",n:"Yeosu Airport",lat:34.84230041503906,lng:127.61699676513672},
  {code:"WJU",n:"Wonju Airport / Hoengseong Air Base (K-38/K-46)",lat:37.437113,lng:127.960051},
  {code:"YNY",n:"Gonghang-ro — Yangyang International Airport",lat:38.060481,lng:128.669822},
  {code:"CJU",n:"Jeju City — Jeju International Airport",lat:33.512058,lng:126.492548},
  {code:"PUS",n:"Busan — Gimhae International Airport",lat:35.179501,lng:128.938004},
  {code:"HIN",n:"Sacheon Airport / Sacheon Air Base",lat:35.088591,lng:128.071747},
  {code:"USN",n:"Ulsan Airport",lat:35.59349823,lng:129.352005005},
  {code:"GMP",n:"Seoul Gimpo International Airport",lat:37.5583,lng:126.791},
  {code:"KPO",n:"Pohang Airport (G-815/K-3)",lat:35.987955,lng:129.420383},
  {code:"TAE",n:"Daegu International Airport",lat:35.894394,lng:128.656989},
  {code:"CJJ",n:"Cheongju International Airport/Cheongju Air Base (K-59/G-513)",lat:36.71556,lng:127.500289},
  {code:"RMP",n:"Rampart Airport",lat:65.507896,lng:-150.141007},
  {code:"OKA",n:"Naha International Airport",lat:26.192437,lng:127.639804},
  {code:"ISG",n:"New Ishigaki Airport",lat:24.396389,lng:124.245},
  {code:"UEO",n:"Kumejima Airport",lat:26.363445,lng:126.71384},
  {code:"MMD",n:"Minamidaito Airport",lat:25.8465,lng:131.263},
  {code:"MMY",n:"Miyakojima — Miyako Airport",lat:24.782801,lng:125.294998},
  {code:"AGJ",n:"Aguni Airport",lat:26.592755,lng:127.240335},
  {code:"KTD",n:"Kitadaitōjima — Kitadaito Airport",lat:25.9447002411,lng:131.32699585},
  {code:"SHI",n:"Miyakojima — Shimojishima Airport",lat:24.8267,lng:125.144997},
  {code:"TRA",n:"Tarama Airport",lat:24.653793,lng:124.675453},
  {code:"RNJ",n:"Yoron Airport",lat:27.043847,lng:128.401648},
  {code:"OGN",n:"Yonaguni Airport",lat:24.467298,lng:122.979827},
  {code:"ENI",n:"El Nido Airport",lat:11.202399,lng:119.416087},
  {code:"SFS",n:"Olongapo — Subic Bay International Airport / Naval Air Station Cubi Point",lat:14.794833,lng:120.271883},
  {code:"CRK",n:"Mabalacat — Clark International Airport / Clark Air Base",lat:15.186,lng:120.559998},
  {code:"LAO",n:"Laoag City — Laoag International Airport",lat:18.175089,lng:120.531006},
  {code:"DRP",n:"Legazpi — Bicol International Airport",lat:13.111915,lng:123.676829},
  {code:"CYU",n:"Cuyo Airport",lat:10.8581,lng:121.069},
  {code:"CBO",n:"Datu Odin Sinsuat — Cotabato (Awang) Airport",lat:7.164753,lng:124.209938},
  {code:"DVO",n:"Davao — Francisco Bangoy International Airport",lat:7.12552,lng:125.646004},
  {code:"BXU",n:"Butuan — Bancasi Airport",lat:8.9515,lng:125.4788},
  {code:"DPL",n:"Dipolog Airport",lat:8.601983,lng:123.341875},
  {code:"CGM",n:"Mambajao — Camiguin Airport",lat:9.253894,lng:124.709115},
  {code:"JOL",n:"Jolo Airport",lat:6.05367,lng:121.011002},
  {code:"TWT",n:"Bongao — Sanga Sanga Airport",lat:5.048196,lng:119.743338},
  {code:"OZC",n:"Ozamiz — Labo Airport",lat:8.17851,lng:123.842003},
  {code:"PAG",n:"Pagadian Airport",lat:7.825632,lng:123.459635},
  {code:"GES",n:"General Santos International Airport",lat:6.057208,lng:125.096243},
  {code:"SUG",n:"Surigao City — Surigao Airport",lat:9.755838325629998,lng:125.480947495},
  {code:"CGY",n:"Laguindingan International Airport",lat:8.612203,lng:124.456496},
  {code:"ZAM",n:"Zamboanga International Airport",lat:6.92242,lng:122.059998},
  {code:"IAO",n:"Del Carmen — Siargao Airport",lat:9.8591,lng:126.014},
  {code:"TAG",n:"Bohol-Panglao International Airport",lat:9.573045,lng:123.770143},
  {code:"SWL",n:"San Vicente Airport",lat:10.524298,lng:119.272899},
  {code:"SJI",n:"San Jose Airport",lat:12.361499786399998,lng:121.04699707},
  {code:"WNP",n:"Naga Airport",lat:13.58489990234375,lng:123.2699966430664},
  {code:"BSO",n:"Basco Airport",lat:20.4513,lng:121.980003},
  {code:"TUG",n:"Tuguegarao City — Tuguegarao Airport",lat:17.6433676823,lng:121.733150482},
  {code:"VRC",n:"Virac Airport",lat:13.576399803161621,lng:124.20600128173828},
  {code:"CYZ",n:"Cauayan City — Cauayan Airport",lat:16.9298992157,lng:121.752998352},
  {code:"TAC",n:"Tacloban City — Daniel Z. Romualdez Airport",lat:11.227761,lng:125.027783},
  {code:"BCD",n:"Bacolod City — Bacolod-Silay International Airport",lat:10.776237,lng:123.018879},
  {code:"CYP",n:"Calbayog City — Calbayog Airport",lat:12.072574,lng:124.54508},
  {code:"DGT",n:"Dumaguete City — Sibulan Airport",lat:9.334183,lng:123.30191},
  {code:"MPH",n:"Caticlan — Godofredo P. Ramos Airport",lat:11.9245,lng:121.954002},
  {code:"CRM",n:"Catarman National Airport",lat:12.50161,lng:124.635258},
  {code:"ILO",n:"Cabatuan — Iloilo International Airport",lat:10.833017,lng:122.493358},
  {code:"MBT",n:"Masbate — Moises R. Espinosa Airport",lat:12.369682,lng:123.630095},
  {code:"KLO",n:"Kalibo International Airport",lat:11.6794,lng:122.375999},
  {code:"CEB",n:"Cebu City/Lapu-Lapu City — Mactan Cebu International Airport",lat:10.309261,lng:123.97974},
  {code:"PPS",n:"Puerto Princesa International Airport / PAF Antonio Bautista Air Base",lat:9.742044,lng:118.75911},
  {code:"RXS",n:"Roxas City — Roxas Airport",lat:11.597700119018555,lng:122.75199890136719},
  {code:"TBH",n:"Tablas Island — Tugdan Airport",lat:12.3109998703,lng:122.084999084},
  {code:"USU",n:"Coron — Francisco B. Reyes (Busuanga) Airport",lat:12.121865,lng:120.100801},
  {code:"RSI",n:"Hanak — Red Sea International Airport",lat:25.627975,lng:37.088914},
  {code:"TKM",n:"Taksimo Airport",lat:56.361668,lng:114.93},
  {code:"MJY",n:"Motygino Airport",lat:58.180921,lng:94.745272},
  {code:"LPS",n:"Lopez Island Airport",lat:48.4838981628418,lng:-122.93800354003906},
  {code:"PRA",n:"Parana — General Urquiza Airport",lat:-31.7948,lng:-60.4804},
  {code:"ROS",n:"Rosario Islas Malvinas International Airport",lat:-32.9036,lng:-60.785},
  {code:"SFN",n:"Santa Fe — Sauce Viejo Airport",lat:-31.7117,lng:-60.8117},
  {code:"AEP",n:"Buenos Aires — Aeroparque Jorge Newbery",lat:-34.559419,lng:-58.415536},
  {code:"COR",n:"Cordoba — Ingeniero Aeronáutico Ambrosio L.V. Taravella International Airport",lat:-31.312346,lng:-64.208329},
  {code:"EZE",n:"Buenos Aires (Ezeiza) — Ezeiza International Airport - Ministro Pistarini",lat:-34.8222,lng:-58.5358},
  {code:"MDZ",n:"Mendoza — Governor Francisco Gabrielli International Airport",lat:-32.831699,lng:-68.7929},
  {code:"AFA",n:"San Rafael — Suboficial Ay Santiago Germano Airport",lat:-34.588299,lng:-68.4039},
  {code:"CTC",n:"Catamarca — Coronel Felipe Varela International Airport",lat:-28.593117,lng:-65.7512},
  {code:"SDE",n:"Santiago del Estero — Vicecomodoro Angel D. La Paz Aragonés Airport",lat:-27.765556335399996,lng:-64.3099975586},
  {code:"IRJ",n:"La Rioja — Capitan V A Almonacid Airport",lat:-29.381599,lng:-66.795799},
  {code:"RHD",n:"Termas de Río Hondo international Airport",lat:-27.4966,lng:-64.93595},
  {code:"TUC",n:"San Miguel de Tucumán — Teniente Benjamín Matienzo International Airport",lat:-26.837397,lng:-65.104195},
  {code:"UAQ",n:"San Juan — Domingo Faustino Sarmiento Airport",lat:-31.571501,lng:-68.418198},
  {code:"LUQ",n:"San Luis — Brigadier Mayor D Cesar Raul Ojeda Airport",lat:-33.273201,lng:-66.3564},
  {code:"CNQ",n:"Corrientes Airport",lat:-27.4455,lng:-58.7619},
  {code:"RES",n:"Resistencia International Airport",lat:-27.44991,lng:-59.056125},
  {code:"FMA",n:"Formosa National Airport",lat:-26.2127,lng:-58.2281},
  {code:"IGR",n:"Puerto Iguazu — Cataratas Del Iguazú International Airport",lat:-25.737301,lng:-54.4734},
  {code:"PSS",n:"Posadas — Libertador Gral D Jose De San Martin Airport",lat:-27.3858,lng:-55.9707},
  {code:"SLA",n:"Salta — Martín Miguel de Güemes International Airport",lat:-24.856001,lng:-65.486198},
  {code:"JUJ",n:"San Salvador de Jujuy — Gobernador Horacio Guzman International Airport",lat:-24.392799,lng:-65.097801},
  {code:"CRD",n:"Comodoro Rivadavia — General Enrique Mosconi International Airport",lat:-45.786941,lng:-67.463355},
  {code:"EQS",n:"Esquel Brigadier Antonio Parodi International Airport",lat:-42.908001,lng:-71.139503},
  {code:"LHS",n:"Las Heras Airport",lat:-46.538517,lng:-68.965323},
  {code:"OES",n:"San Antonio Oeste — Antoine de Saint Exupéry Airport",lat:-40.7512,lng:-65.0343},
  {code:"REL",n:"Rawson — Almirante Marco Andres Zar Airport",lat:-43.2105,lng:-65.2703},
  {code:"VDM",n:"Viedma / Carmen de Patagones — Gobernador Castello Airport",lat:-40.8692,lng:-63.0004},
  {code:"PMY",n:"Puerto Madryn — El Tehuelche Airport",lat:-42.7592,lng:-65.1027},
  {code:"FTE",n:"El Calafate - Commander Armando Tola International Airport",lat:-50.280267,lng:-72.053401},
  {code:"PUD",n:"Puerto Deseado Airport",lat:-47.7353,lng:-65.9041},
  {code:"RGA",n:"Rio Grande — Gobernador Ramón Trejo Noel International Airport",lat:-53.7777,lng:-67.7494},
  {code:"RGL",n:"Rio Gallegos — Piloto Civil Norberto Fernández International Airport",lat:-51.608791,lng:-69.308948},
  {code:"USH",n:"Ushuaia - Malvinas Argentinas International Airport",lat:-54.8433,lng:-68.2958},
  {code:"PMQ",n:"Perito Moreno Jalil Hamer Airport",lat:-46.537899,lng:-70.978699},
  {code:"GGS",n:"Gobernador Gregores Airport",lat:-48.7831,lng:-70.150002},
  {code:"RYO",n:"Rio Turbio — 28 de Noviembre Airport",lat:-51.605,lng:-72.2203},
  {code:"BHI",n:"Bahía Blanca — Comandante Espora Airport",lat:-38.725,lng:-62.1693},
  {code:"SST",n:"Santa Teresita Airport",lat:-36.5423,lng:-56.7218},
  {code:"MDQ",n:"Mar del Plata — Ástor Piazzola International Airport",lat:-37.9342,lng:-57.5733},
  {code:"NQN",n:"Neuquén — Presidente Perón International Airport",lat:-38.949001,lng:-68.155701},
  {code:"NEC",n:"Necochea Airport",lat:-38.490746,lng:-58.816337},
  {code:"RSA",n:"Santa Rosa Airport",lat:-36.588299,lng:-64.275703},
  {code:"BRC",n:"San Carlos de Bariloche — Teniente Luis Candelaria International Airport",lat:-41.151199,lng:-71.157501},
  {code:"CPC",n:"Chapelco/San Martin de los Andes — Aviador C. Campos Airport",lat:-40.075401,lng:-71.137299},
  {code:"JTC",n:"Bauru/Arealva–Moussa Nakhal Tobias State Airport",lat:-22.160755,lng:-49.070325},
  {code:"AQA",n:"Araraquara Airport",lat:-21.812,lng:-48.132999},
  {code:"AJU",n:"Aracaju - Santa Maria Airport",lat:-10.98394,lng:-37.072873},
  {code:"AFL",n:"Alta Floresta — Piloto Osvaldo Marques Dias Airport",lat:-9.866389,lng:-56.106298},
  {code:"ARU",n:"Araçatuba Airport",lat:-21.141479,lng:-50.424575},
  {code:"AAX",n:"Araxá — Romeu Zema Airport",lat:-19.5632,lng:-46.9604},
  {code:"BEL",n:"Belém — Val de Cans/Júlio Cezar Ribeiro International Airport",lat:-1.379279,lng:-48.476207},
  {code:"BSB",n:"Brasília — Presidente Juscelino Kubitschek International Airport",lat:-15.869167,lng:-47.920834},
  {code:"BVB",n:"Boa Vista — Atlas Brasil Cantanhede International Airport",lat:2.84615,lng:-60.690648},
  {code:"CAC",n:"Cascavel — Coronel Adalberto Mendes da Silva Airport",lat:-25.000323,lng:-53.501208},
  {code:"CFB",n:"Cabo Frio Airport",lat:-22.921485,lng:-42.071874},
  {code:"CNF",n:"Belo Horizonte — Tancredo Neves International Airport",lat:-19.63571,lng:-43.966928},
  {code:"CGR",n:"Campo Grande Airport",lat:-20.469998,lng:-54.673988},
  {code:"XAP",n:"Chapecó — Serafin Enoss Bertaso Airport",lat:-27.134199,lng:-52.656601},
  {code:"CKS",n:"Parauapebas — Carajás Airport",lat:-6.117841,lng:-50.003372},
  {code:"CLV",n:"Caldas Novas — Nelson Ribeiro Guimarães Airport",lat:-17.725096,lng:-48.606324},
  {code:"CAW",n:"Campos dos Goytacazes — Bartolomeu Lisandro Airport",lat:-21.698299,lng:-41.301701},
  {code:"CMG",n:"Corumbá International Airport",lat:-19.01193,lng:-57.672772},
  {code:"CWB",n:"Curitiba-Afonso Pena International Airport",lat:-25.5285,lng:-49.1758},
  {code:"CXJ",n:"Caxias Do Sul — Hugo Cantergiani Regional Airport",lat:-29.197183,lng:-51.187647},
  {code:"CGB",n:"Cuiabá — Várzea Grande–Marechal Rondon International Airport",lat:-15.6529,lng:-56.116699},
  {code:"CZS",n:"Cruzeiro do Sul Airport",lat:-7.59991,lng:-72.769501},
  {code:"BYO",n:"Bonito Airport",lat:-21.2473,lng:-56.452399},
  {code:"PPB",n:"Presidente Prudente Airport",lat:-22.1751,lng:-51.424599},
  {code:"MAO",n:"Manaus — Eduardo Gomes International Airport",lat:-3.03861,lng:-60.049702},
  {code:"IGU",n:"Foz do Iguaçu — Cataratas International Airport",lat:-25.594167,lng:-54.489444},
  {code:"FLN",n:"Florianópolis — Hercílio Luz International Airport",lat:-27.670279,lng:-48.552502},
  {code:"FEN",n:"Fernando de Noronha Airport",lat:-3.854534,lng:-32.423017},
  {code:"FOR",n:"Fortaleza — Pinto Martins International Airport",lat:-3.775833,lng:-38.532222},
  {code:"GIG",n:"Rio de Janeiro Galeão – Tom Jobim International Airport",lat:-22.809999,lng:-43.250557},
  {code:"GYN",n:"Goiânia — Santa Genoveva International Airport",lat:-16.632,lng:-49.220699},
  {code:"GRU",n:"São Paulo/Guarulhos–Governor André Franco Montoro International Airport",lat:-23.431274,lng:-46.469954},
  {code:"GVR",n:"Governador Valadares — Coronel Altino Machado Airport",lat:-18.895882,lng:-41.982869},
  {code:"ATM",n:"Altamira Interstate Airport",lat:-3.253144,lng:-52.253938},
  {code:"ITB",n:"Itaituba Airport",lat:-4.242131,lng:-56.000651},
  {code:"IOS",n:"Ilhéus — Bahia - Jorge Amado Airport",lat:-14.815929,lng:-39.033458},
  {code:"IPN",n:"Ipatinga — Usiminas Airport",lat:-19.470699,lng:-42.487598},
  {code:"IMP",n:"Imperatriz — Prefeito Renato Moreira Airport",lat:-5.53129,lng:-47.459999},
  {code:"JJG",n:"Jaguaruna — Humberto Ghizzo Bortoluzzi Regional Airport",lat:-28.6753,lng:-49.0596},
  {code:"JJD",n:"Cruz — Comandante Ariston Pessoa Airport",lat:-2.906425,lng:-40.357338},
  {code:"JDF",n:"Juiz de Fora — Francisco de Assis Airport",lat:-21.791482,lng:-43.386072},
  {code:"JPR",n:"Ji-Paraná Airport",lat:-10.870743,lng:-61.846675},
  {code:"JPA",n:"João Pessoa — Presidente Castro Pinto International Airport",lat:-7.148691,lng:-34.950554},
  {code:"JDO",n:"Juazeiro do Norte — Orlando Bezerra de Menezes Airport",lat:-7.21932,lng:-39.269096},
  {code:"JOI",n:"Joinville — Lauro Carneiro de Loyola Airport",lat:-26.224501,lng:-48.797401},
  {code:"CPV",n:"Campina Grande — Presidente João Suassuna Airport",lat:-7.269662,lng:-35.896057},
  {code:"VCP",n:"Campinas — Viracopos International Airport",lat:-23.007404,lng:-47.134502},
  {code:"LEC",n:"Lençóis — Coronel Horácio de Mattos Airport",lat:-12.4823,lng:-41.277},
  {code:"LAJ",n:"Lages Airport",lat:-27.782101,lng:-50.281502},
  {code:"LDB",n:"Londrina — Governor José Richa Airport",lat:-23.334375,lng:-51.128365},
  {code:"MAB",n:"Marabá — João Correa da Rocha Airport",lat:-5.36859,lng:-49.138},
  {code:"MGF",n:"Regional de Maringá - Sílvio Name Júnior Airport",lat:-23.47606,lng:-52.016187},
  {code:"MOC",n:"Montes Claros — Mário Ribeiro Airport",lat:-16.706919,lng:-43.818901},
  {code:"MII",n:"Frank Miloye Milenkowichi–Marília State Airport",lat:-22.196899,lng:-49.926485},
  {code:"MCZ",n:"Maceió — Zumbi dos Palmares International Airport",lat:-9.512559,lng:-35.791839},
  {code:"MCP",n:"Macapá - Alberto Alcolumbre International Airport",lat:0.050664,lng:-51.072201},
  {code:"MVF",n:"Mossoró — Dix-Sept Rosado Airport",lat:-5.20192,lng:-37.3643},
  {code:"MNX",n:"Manicoré Airport",lat:-5.81138,lng:-61.278301},
  {code:"NVT",n:"Navegantes — Ministro Victor Konder International Airport",lat:-26.879431,lng:-48.650979},
  {code:"GEL",n:"Santo Ângelo Airport",lat:-28.282503,lng:-54.169623},
  {code:"POA",n:"Porto Alegre-Salgado Filho International Airport",lat:-29.993984,lng:-51.167482},
  {code:"PHB",n:"Parnaíba - Prefeito Doutor João Silva Filho International Airport",lat:-2.89375,lng:-41.731998},
  {code:"PFB",n:"Passo Fundo — Lauro Kurtz Airport",lat:-28.243976,lng:-52.32777},
  {code:"PGZ",n:"Ponta Grossa Airport - Comandante Antonio Amilton Beraldo",lat:-25.184476,lng:-50.143822},
  {code:"PMW",n:"Palmas — Brigadeiro Lysias Rodrigues Airport",lat:-10.2915,lng:-48.356998},
  {code:"PET",n:"Pelotas — João Simões Lopes Neto International Airport",lat:-31.717189,lng:-52.327796},
  {code:"PNZ",n:"Petrolina — Senador Nilo Coelho Airport",lat:-9.362422,lng:-40.569098},
  {code:"PTO",n:"Pato Branco — Juvenal Loureiro Cardoso Airport",lat:-26.217184,lng:-52.694463},
  {code:"PMG",n:"Ponta Porã Airport",lat:-22.549601,lng:-55.702599},
  {code:"BPS",n:"Porto Seguro International Airport",lat:-16.438426,lng:-39.080584},
  {code:"PVH",n:"Porto Velho — Governador Jorge Teixeira de Oliveira International Airport",lat:-8.708491,lng:-63.902338},
  {code:"RBR",n:"Rio Branco-Plácido de Castro International Airport",lat:-9.869031,lng:-67.893984},
  {code:"ROO",n:"Rondonópolis — Maestro Marinho Franco Airport",lat:-16.584292,lng:-54.724803},
  {code:"REC",n:"Recife/Guararapes - Gilberto Freyre International Airport",lat:-8.12747,lng:-34.922961},
  {code:"SDU",n:"Rio de Janeiro — Santos Dumont Airport",lat:-22.910397,lng:-43.16282},
  {code:"RAO",n:"Ribeirão Preto — Leite Lopes Airport",lat:-21.134314,lng:-47.774053},
  {code:"NAT",n:"Natal — Rio Grande do Norte/São Gonçalo do Amarante–Governador Aluízio Alves International Airport",lat:-5.769822,lng:-35.36661},
  {code:"OPS",n:"Sinop — Presidente João Batista Figueiredo Airport",lat:-11.885001,lng:-55.586109},
  {code:"SJK",n:"São José Dos Campos — Professor Urbano Ernesto Stumpf Airport",lat:-23.2292,lng:-45.8615},
  {code:"SLZ",n:"São Luís — Marechal Cunha Machado International Airport",lat:-2.586386,lng:-44.235008},
  {code:"RIA",n:"Santa Maria Airport",lat:-29.711399,lng:-53.688202},
  {code:"STM",n:"Santarém - Maestro Wilson Fonseca International Airport",lat:-2.422423,lng:-54.79306},
  {code:"SMT",n:"Sorriso — Adolino Bedin Regional Airport",lat:-12.479177,lng:-55.672341},
  {code:"CGH",n:"São Paulo — Congonhas–Deputado Freitas Nobre Airport",lat:-23.627657,lng:-46.654601},
  {code:"SJP",n:"São José do Rio Preto — Prof. Eribelto Manoel Reino State Airport",lat:-20.817113,lng:-49.406963},
  {code:"SSA",n:"Salvador — Deputado Luiz Eduardo Magalhães International Airport",lat:-12.908611,lng:-38.322498},
  {code:"TMT",n:"Oriximiná — Trombetas Airport",lat:-1.4896,lng:-56.396801},
  {code:"UNA",n:"Una-Comandatuba Airport",lat:-15.354358,lng:-38.998729},
  {code:"TOW",n:"Toledo - Luiz Dalcanale Filho Municipal Airport",lat:-24.6863,lng:-53.697498},
  {code:"THE",n:"Teresina — Senador Petrônio Portela Airport",lat:-5.06025,lng:-42.823712},
  {code:"TFF",n:"Tefé Airport",lat:-3.38294,lng:-64.724098},
  {code:"TJL",n:"Três Lagoas — Plínio Alarcom Airport",lat:-20.752643,lng:-51.682026},
  {code:"TBT",n:"Tabatinga International Airport",lat:-4.25567,lng:-69.935799},
  {code:"TUR",n:"Tucuruí Airport",lat:-3.78601,lng:-49.720299},
  {code:"SJL",n:"São Gabriel da Cachoeira Airport",lat:-0.14835,lng:-66.9855},
  {code:"PAV",n:"Paulo Afonso Airport",lat:-9.40088,lng:-38.250599},
  {code:"URG",n:"Uruguaiana — Rubem Berta Airport",lat:-29.7822,lng:-57.0382},
  {code:"UDI",n:"Uberlândia — Ten. Cel. Aviador César Bombonato Airport",lat:-18.883579,lng:-48.225936},
  {code:"UBA",n:"Uberaba — Mário de Almeida Franco Airport",lat:-19.765036,lng:-47.964805},
  {code:"BVH",n:"Vilhena — Brigadeiro Camarão Airport",lat:-12.6944,lng:-60.098301},
  {code:"VIX",n:"Vitória — Eurico de Aguiar Salles International Airport",lat:-20.258,lng:-40.285},
  {code:"IZA",n:"Juiz de Fora — Presidente Itamar Franco Airport",lat:-21.513086,lng:-43.173069},
  {code:"ARI",n:"Arica — Chacalluta International Airport",lat:-18.348499,lng:-70.338699},
  {code:"CPO",n:"Copiapo — Desierto de Atacama Airport",lat:-27.2612,lng:-70.779198},
  {code:"BBA",n:"Balmaceda Airport",lat:-45.915968,lng:-71.689499},
  {code:"CJC",n:"Calama — El Loa Airport",lat:-22.498199,lng:-68.903603},
  {code:"PUQ",n:"Punta Arenas — President Carlos Ibáñez International Airport",lat:-53.002602,lng:-70.854599},
  {code:"IQQ",n:"Iquique — Diego Aracena International Airport",lat:-20.536273,lng:-70.181373},
  {code:"SCL",n:"Santiago — Comodoro Arturo Merino Benítez International Airport",lat:-33.393001556396484,lng:-70.78579711914062},
  {code:"ESR",n:"El Salvador — Ricardo García Posada Airport",lat:-26.3111,lng:-69.765198},
  {code:"ANF",n:"Antofagasta — Andrés Sabella Gálvez International Airport",lat:-23.445274,lng:-70.445232},
  {code:"CCP",n:"Concepcion — Carriel Sur International Airport",lat:-36.77235,lng:-73.062828},
  {code:"IPC",n:"Isla De Pascua — Mataveri International Airport",lat:-27.165411,lng:-109.421027},
  {code:"ZOS",n:"Osorno — Cañal Bajo Carlos Hott Siebert Airport",lat:-40.611198,lng:-73.060997},
  {code:"PNT",n:"Puerto Natales — Lieutenant Julio Gallardo Airport",lat:-51.67067,lng:-72.529078},
  {code:"ZPC",n:"Pucon — Pucón Airport",lat:-39.292801,lng:-71.915901},
  {code:"MHC",n:"Dalcahue — Mocopulli Airport",lat:-42.340388,lng:-73.715693},
  {code:"ZCO",n:"Temuco — La Araucanía International Airport",lat:-38.9259,lng:-72.6515},
  {code:"LSC",n:"La Serena-Coquimbo — La Florida Airport",lat:-29.916201,lng:-71.199501},
  {code:"PMC",n:"Puerto Montt — El Tepual International Airport",lat:-41.443093,lng:-73.094065},
  {code:"ZAL",n:"Valdivia — Pichoy Airport",lat:-39.6500015259,lng:-73.0860977173},
  {code:"SOD",n:"Sorocaba Airport",lat:-23.478001,lng:-47.490002},
  {code:"OCC",n:"Coca — Francisco De Orellana Airport",lat:-0.462886,lng:-76.986801},
  {code:"CUE",n:"Cuenca — Mariscal Lamar Airport",lat:-2.88947,lng:-78.984398},
  {code:"GPS",n:"Isla Baltra — Seymour Galapagos Ecological Airport",lat:-0.453758,lng:-90.2659},
  {code:"GYE",n:"Guayaquil — José Joaquín de Olmedo International Airport",lat:-2.15742,lng:-79.883598},
  {code:"IBB",n:"Puerto Villamil — General Villamil Airport",lat:-0.942628,lng:-90.953003},
  {code:"LTX",n:"Latacunga — Cotopaxi International Airport",lat:-0.906833,lng:-78.615799},
  {code:"XMS",n:"Macas — Coronel E Carvajal Airport",lat:-2.2991700172424316,lng:-78.12079620361328},
  {code:"MEC",n:"Manta — Eloy Alfaro International Airport",lat:-0.9460780024528503,lng:-80.67880249023438},
  {code:"UIO",n:"Quito — Mariscal Sucre International Airport",lat:-0.125399,lng:-78.354306},
  {code:"ETR",n:"Santa Rosa - Artillery Colonel Victor Larrea International Airport",lat:-3.441986,lng:-79.996957},
  {code:"SNC",n:"Salinas/La Libertad — General Ulpiano Paez International Airport",lat:-2.210057,lng:-80.985067},
  {code:"SCY",n:"Puerto Baquerizo Moreno — San Cristóbal Airport",lat:-0.910206,lng:-89.617401},
  {code:"LOH",n:"La Toma (Catamayo) — Ciudad de Catamayo Airport",lat:-3.995606,lng:-79.371902},
  {code:"ESM",n:"Tachina — Carlos Concha Torres International Airport",lat:0.978519,lng:-79.626602},
  {code:"TUA",n:"Tulcán — Lieutenant Colonel Luis A. Mantilla International Airport",lat:0.809506,lng:-77.708099},
  {code:"PSY",n:"Port Stanley Airport",lat:-51.685699,lng:-57.777599},
  {code:"ASU",n:"Asunción — Silvio Pettirossi International Airport",lat:-25.240156,lng:-57.519227},
  {code:"ENO",n:"Encarnación — Teniente Ramon A. Ayub Gonzalez International Airport",lat:-27.227537,lng:-55.837584},
  {code:"AGT",n:"Ciudad del Este — Guaraní International Airport",lat:-25.4555,lng:-54.843601},
  {code:"AXM",n:"Armenia — El Eden Airport",lat:4.45278,lng:-75.7664},
  {code:"PUU",n:"Puerto Asís — Tres De Mayo Airport",lat:0.505228,lng:-76.5008},
  {code:"BGA",n:"Bucaramanga — Palonegro Airport",lat:7.1265,lng:-73.1848},
  {code:"BOG",n:"Bogota — El Dorado International Airport",lat:4.70159,lng:-74.1469},
  {code:"BAQ",n:"Barranquilla — Ernesto Cortissoz International Airport",lat:10.8896,lng:-74.7808},
  {code:"BSC",n:"Bahía Solano — José Celestino Mutis Airport",lat:6.20292,lng:-77.3947},
  {code:"BUN",n:"Buenaventura — Gerardo Tobar López Airport",lat:3.81963,lng:-76.9898},
  {code:"CUC",n:"Cúcuta — Camilo Daza International Airport",lat:7.92757,lng:-72.5115},
  {code:"CTG",n:"Cartagena — Rafael Nuñez International Airport",lat:10.4424,lng:-75.513},
  {code:"CLO",n:"Cali — Alfonso Bonilla Aragon International Airport",lat:3.542717,lng:-76.381898},
  {code:"TCO",n:"Tumaco — La Florida Airport",lat:1.81442,lng:-78.7492},
  {code:"CZU",n:"Corozal — Las Brujas Airport",lat:9.33274,lng:-75.2856},
  {code:"EJA",n:"Barrancabermeja — Yariguíes Airport",lat:7.02433,lng:-73.8068},
  {code:"FLA",n:"Florencia — Gustavo Artunduaga Paredes Airport",lat:1.58919,lng:-75.5644},
  {code:"GPI",n:"Guapi Airport",lat:2.57013,lng:-77.897969},
  {code:"IBE",n:"Ibagué — Perales Airport",lat:4.42161,lng:-75.1333},
  {code:"IPI",n:"Ipiales — San Luis Airport",lat:0.861946,lng:-77.671783},
  {code:"APO",n:"Carepa — Antonio Roldán Betancur Airport",lat:7.81196,lng:-76.7164},
  {code:"LQM",n:"Puerto Leguízamo — Caucaya Airport",lat:-0.182278,lng:-74.7708},
  {code:"LPD",n:"La Pedrera Airport",lat:-1.324882,lng:-69.581294},
  {code:"LET",n:"Leticia — Alfredo Vásquez Cobo International Airport",lat:-4.191147,lng:-69.942003},
  {code:"EOH",n:"Medellín — Enrique Olaya Herrera Airport",lat:6.219686,lng:-75.590597},
  {code:"MTR",n:"Montería — Los Garzones Airport",lat:8.82374,lng:-75.8258},
  {code:"MVP",n:"Mitú — Fabio Alberto Leon Bentley Airport",lat:1.25366,lng:-70.2339},
  {code:"MZL",n:"Manizales — La Nubia Airport",lat:5.0296,lng:-75.4647},
  {code:"LMC",n:"La Macarena Airport",lat:2.17565,lng:-73.78674},
  {code:"NQU",n:"Nuquí — Reyes Murillo Airport",lat:5.710348,lng:-77.261868},
  {code:"NVA",n:"Neiva — Benito Salas Airport",lat:2.95015,lng:-75.294},
  {code:"PCR",n:"Puerto Carreño — German Olano Airport",lat:6.18472,lng:-67.4932},
  {code:"PDA",n:"Puerto Inírida — Obando Cesar Gaviria Trujillo Airport",lat:3.85353,lng:-67.9062},
  {code:"PEI",n:"Pereira — Matecaña International Airport",lat:4.81267,lng:-75.7395},
  {code:"PPN",n:"Popayán — Guillermo León Valencia Airport",lat:2.454359,lng:-76.609253},
  {code:"PSO",n:"Chachagüí — Antonio Nariño Airport",lat:1.396722,lng:-77.29093},
  {code:"PVA",n:"Providencia — El Embrujo Airport",lat:13.357461,lng:-81.357977},
  {code:"TCD",n:"Tarapacá Airport",lat:-2.895802,lng:-69.749762},
  {code:"MDE",n:"Medellín — Jose Maria Córdova International Airport",lat:6.16454,lng:-75.4231},
  {code:"RCH",n:"Riohacha — Almirante Padilla Airport",lat:11.5262,lng:-72.926},
  {code:"RVE",n:"Saravena — Los Colonizadores Airport",lat:6.951868,lng:-71.857179},
  {code:"SJE",n:"San José Del Guaviare — Jorge E. Gonzalez Torres Airport",lat:2.57969,lng:-72.6394},
  {code:"SMR",n:"Santa Marta — Simón Bolívar International Airport",lat:11.1196,lng:-74.2306},
  {code:"ADZ",n:"San Andrés — Gustavo Rojas Pinilla International Airport",lat:12.5836,lng:-81.7112},
  {code:"SVI",n:"San Vicente Del Caguán — Eduardo Falla Solano Airport",lat:2.15217,lng:-74.7663},
  {code:"TLU",n:"Santiago de Tolú — Golfo de Morrosquillo Airport",lat:9.50945,lng:-75.5854},
  {code:"TME",n:"Tame — Gustavo Vargas Airport",lat:6.45108,lng:-71.7603},
  {code:"AUC",n:"Arauca — Santiago Perez Airport",lat:7.06888,lng:-70.7369},
  {code:"UIB",n:"Quibdó — El Caraño Airport",lat:5.69076,lng:-76.6412},
  {code:"VUP",n:"Valledupar — Alfonso López Pumarejo Airport",lat:10.435,lng:-73.2495},
  {code:"VVC",n:"Villavicencio — Vanguardia Airport",lat:4.16787,lng:-73.6138},
  {code:"EYP",n:"El Alcaravan - Yopal Airport",lat:5.31911,lng:-72.384},
  {code:"SRE",n:"Sucre — Alcantarí International Airport",lat:-19.246835,lng:-65.149611},
  {code:"CBB",n:"Cochabamba — Jorge Wilsterman International Airport",lat:-17.421105,lng:-66.177102},
  {code:"CIJ",n:"Cobija — Capitán Aníbal Arab Airport",lat:-11.039109,lng:-68.782774},
  {code:"SRZ",n:"Santa Cruz — El Trompillo Airport",lat:-17.8115997314,lng:-63.1715011597},
  {code:"GYA",n:"Guayaramerín Airport",lat:-10.88856,lng:-65.380955},
  {code:"CCA",n:"Chimore Airport",lat:-16.976834,lng:-65.145568},
  {code:"LPB",n:"La Paz / El Alto — El Alto International Airport",lat:-16.510272,lng:-68.189416},
  {code:"ORU",n:"Oruro — Juan Mendoza International Airport",lat:-17.956151,lng:-67.075829},
  {code:"PUR",n:"Puerto Rico/Manuripi — Puerto Rico Airport",lat:-11.107663,lng:-67.551155},
  {code:"PSZ",n:"Puerto Suárez — Capitán Av. Salvador Ogaya G. airport",lat:-18.975301,lng:-57.820599},
  {code:"RIB",n:"Riberalta — Capitán Av. Selin Zeitun Lopez Airport",lat:-11.009355,lng:-66.075468},
  {code:"RBQ",n:"Rurrenabaque Airport",lat:-14.4279,lng:-67.496803},
  {code:"TJA",n:"Tarija — Capitan Oriel Lea Plaza Airport",lat:-21.5557,lng:-64.701302},
  {code:"TDD",n:"Trinidad — Teniente Av. Jorge Henrich Arauz Airport",lat:-14.8187,lng:-64.917999},
  {code:"UYU",n:"Quijarro — Joya Andina International Airport",lat:-20.441304,lng:-66.857553},
  {code:"VVI",n:"Santa Cruz — Viru Viru International Airport",lat:-17.6448,lng:-63.135399},
  {code:"DRJ",n:"Drietabbetje Airport",lat:4.111359,lng:-54.672766},
  {code:"PBM",n:"Paramaribo — Johan Adolf Pengel International Airport",lat:5.45283,lng:-55.187801},
  {code:"MOJ",n:"Moengo Airstrip",lat:5.6076,lng:-54.4003},
  {code:"AGI",n:"Wageningen Airstrip",lat:5.841252,lng:-56.673247},
  {code:"ORG",n:"Paramaribo — Zorg en Hoop Airport",lat:5.811211,lng:-55.192299},
  {code:"BRA",n:"Barreiras — Dom Ricardo Weberberger Airport",lat:-12.0789,lng:-45.008999},
  {code:"JPE",n:"Paragominas — Nagib Demachki Airport",lat:-3.019798,lng:-47.316474},
  {code:"GUZ",n:"Guarapari Airport",lat:-20.6465,lng:-40.491901},
  {code:"SET",n:"Serra Talhada — Santa Magalhães Airport",lat:-8.061433,lng:-38.328888},
  {code:"CAU",n:"Caruaru Airport",lat:-8.28239,lng:-36.0135},
  {code:"OPP",n:"Salinópolis Airport",lat:-0.696111,lng:-47.336111},
  {code:"VAL",n:"Valença Airport",lat:-13.2965,lng:-38.992401},
  {code:"BVS",n:"Breves Airport",lat:-1.63653,lng:-50.4436},
  {code:"GGF",n:"Almeirim Airport",lat:-1.479524,lng:-52.578214},
  {code:"PYT",n:"Paracatu — Pedro Rabelo de Souza Airport",lat:-17.242599,lng:-46.883099},
  {code:"CAY",n:"Matoury — Cayenne – Félix Eboué Airport",lat:4.819964,lng:-52.361326},
  {code:"MPY",n:"Maripasoula Airport",lat:3.655907,lng:-54.039431},
  {code:"LDX",n:"Saint-Laurent-du-Maroni Airport",lat:5.481891,lng:-54.034964},
  {code:"PCL",n:"Pucallpa — Cap FAP David Abenzur Rengifo International Airport",lat:-8.378064,lng:-74.574495},
  {code:"CHM",n:"Chimbote — FAP Lieutenant Jaime Andres de Montreuil Morales Airport",lat:-9.14961,lng:-78.523804},
  {code:"CIX",n:"Chiclayo — Capitán FAP José A. Quiñones González International Airport",lat:-6.789223,lng:-79.828254},
  {code:"AYP",n:"Ayacucho — Air Force Colonel Alfredo Mendivil Duarte Airport",lat:-13.1548,lng:-74.204399},
  {code:"ANS",n:"Andahuaylas Airport",lat:-13.706399917602539,lng:-73.35040283203125},
  {code:"LIM",n:"Lima — Jorge Chávez International Airport",lat:-12.0219,lng:-77.114305},
  {code:"JAE",n:"Jaén — Shumba Airport",lat:-5.59248,lng:-78.774002},
  {code:"JAU",n:"Jauja — Francisco Carle Airport",lat:-11.7831001282,lng:-75.47339630130001},
  {code:"JUL",n:"Juliaca — Inca Manco Capac International Airport",lat:-15.467689,lng:-70.15653},
  {code:"CJA",n:"Cajamarca — Mayor General FAP Armando Revoredo Iglesias Airport",lat:-7.13918,lng:-78.489403},
  {code:"ILQ",n:"Ilo — General Jorge Fernandez Maldon Airport",lat:-17.695,lng:-71.344002},
  {code:"TBP",n:"Tumbes — Captain Pedro Canga Rodríguez International Airport",lat:-3.552074,lng:-80.381086},
  {code:"YMS",n:"Yurimaguas — Moises Benzaquen Rengifo Airport",lat:-5.89377,lng:-76.118202},
  {code:"HUU",n:"Huánuco — Alferez Fap David Figueroa Fernandini Airport",lat:-9.878809928894043,lng:-76.20480346679688},
  {code:"CHH",n:"Chachapoyas Airport",lat:-6.201911,lng:-77.856195},
  {code:"IQT",n:"Iquitos — Coronel FAP Francisco Secada Vignetta International Airport",lat:-3.78474,lng:-73.3088},
  {code:"AQP",n:"Arequipa — Rodríguez Ballón International Airport",lat:-16.340786,lng:-71.569485},
  {code:"TRU",n:"Trujillo — Capitán FAP Carlos Martínez de Pinillos International Airport",lat:-8.082382,lng:-79.108821},
  {code:"TPP",n:"Tarapoto — Cadete FAP Guillermo Del Castillo Paredes Airport",lat:-6.508739948272705,lng:-76.37319946289062},
  {code:"TCQ",n:"Tacna — Coronel FAP Carlos Ciriani Santa Rosa International Airport",lat:-18.053300857500002,lng:-70.2758026123},
  {code:"PEM",n:"Puerto Maldonado — Padre Aldamiz International Airport",lat:-12.6135997772,lng:-69.2285995483},
  {code:"PIU",n:"Piura — PAF Captain Guillermo Concha Iberico International Airport",lat:-5.20575,lng:-80.616402},
  {code:"TYL",n:"Talara — Captain Victor Montes Arias International Airport",lat:-4.57664,lng:-81.254097},
  {code:"NZC",n:"Nazca — Maria Reiche Neuman Airport",lat:-14.854,lng:-74.961502},
  {code:"CUZ",n:"Cusco — Alejandro Velasco Astete International Airport",lat:-13.535699844400002,lng:-71.9387969971},
  {code:"EAX",n:"Kwatta — Eduard Alexander Gummels Airport",lat:5.863807,lng:-55.189504},
  {code:"SRL",n:"Mulegé — Palo Verde Airport",lat:27.0927,lng:-112.0985},
  {code:"SRV",n:"Stony River 2 Airport",lat:61.7897,lng:-156.589005},
  {code:"CEL",n:"Canela Airport",lat:-29.370091,lng:-50.831729},
  {code:"FBE",n:"Francisco Beltrão — Paulo Abdala Airport",lat:-26.05938,lng:-53.063827},
  {code:"GGJ",n:"Guaíra Airport",lat:-24.0811,lng:-54.1917},
  {code:"OAL",n:"Cacoal Airport",lat:-11.496,lng:-61.4508},
  {code:"UMU",n:"Umuarama — Orlando de Carvalho Airport",lat:-23.7987,lng:-53.313801},
  {code:"UVI",n:"União da Vitória — José Cleto Airport",lat:-26.233224,lng:-51.066754},
  {code:"SRA",n:"Santa Rosa — Luis Alberto Lehr Airport",lat:-27.90658,lng:-54.520628},
  {code:"PDP",n:"Punta del Este — Capitan Corbeta CA Curbelo International Airport",lat:-34.855099,lng:-55.094299},
  {code:"MVD",n:"Ciudad de la Costa — Carrasco General Cesáreo L. Berisso International Airport",lat:-34.835647,lng:-56.026497},
  {code:"RVY",n:"Rivera/Santana do Livramento — Pres. Gral. Óscar D. Gestido Binational Airport",lat:-30.9746,lng:-55.4762},
  {code:"BLA",n:"Barcelona — General José Antonio Anzoategui International Airport",lat:10.111111,lng:-64.692222},
  {code:"BNS",n:"Barinas Airport",lat:8.615,lng:-70.214167},
  {code:"BRM",n:"Barquisimeto — Jacinto Lara International Airport",lat:10.042747,lng:-69.35862},
  {code:"CAJ",n:"Canaima Airport",lat:6.231989,lng:-62.85485},
  {code:"CUP",n:"Carúpano — General Francisco Bermúdez Airport",lat:10.660014,lng:-63.261681},
  {code:"CZE",n:"Coro — José Leonardo Chirinos Airport",lat:11.414944,lng:-69.680901},
  {code:"CUM",n:"Cumaná — Antonio José de Sucre Airport",lat:10.450333,lng:-64.13047},
  {code:"ICC",n:"Isla de Coche — Andrés Miguel Salazar Marcano Airport",lat:10.794432,lng:-63.98159},
  {code:"LSP",n:"Paraguaná — Josefa Camejo International Airport",lat:11.780775,lng:-70.151497},
  {code:"MAR",n:"Maracaibo — La Chinita International Airport",lat:10.557542,lng:-71.729307},
  {code:"PMV",n:"Isla Margarita — Del Caribe Santiago Mariño International Airport",lat:10.912603,lng:-63.966599},
  {code:"CCS",n:"Maiquetía Simón Bolívar International Airport",lat:10.602214,lng:-66.991174},
  {code:"MUN",n:"Maturín — José Tadeo Monagas International Airport",lat:9.749023,lng:-63.153348},
  {code:"PZO",n:"Guyana City — General Manuel Carlos Piar International Airport",lat:8.28853,lng:-62.760399},
  {code:"LRV",n:"Gran Roque Island — Los Roques Airport",lat:11.946935,lng:-66.668333},
  {code:"SVS",n:"Stevens Village Airport",lat:66.016727,lng:-149.056835},
  {code:"SVZ",n:"San Antonio del Tachira — Juan Vicente Gómez International Airport",lat:7.840809,lng:-72.439878},
  {code:"SNV",n:"Santa Elena de Uairén Airport",lat:4.554699,lng:-61.145234},
  {code:"STD",n:"Santo Domingo — Mayor Buenaventura Vivas International Airport",lat:7.56538,lng:-72.035103},
  {code:"SOM",n:"El Tigre — San Tomé Airport",lat:8.9451465606689,lng:-64.151084899902},
  {code:"VLN",n:"Valencia — Arturo Michelena International Airport",lat:10.149733,lng:-67.928398},
  {code:"VIG",n:"El Vigía — Juan Pablo Pérez Alfonso Airport",lat:8.624139,lng:-71.672668},
  {code:"VLV",n:"Valera — Dr. Antonio Nicolás Briceño Airport",lat:9.340478,lng:-70.584061},
  {code:"BAZ",n:"Barcelos Airport",lat:-0.981191,lng:-62.918603},
  {code:"RBB",n:"Borba Airport",lat:-4.40634,lng:-59.602402},
  {code:"CAF",n:"Carauari Airport",lat:-4.871473,lng:-66.897552},
  {code:"AUX",n:"Araguaína Airport",lat:-7.22787,lng:-48.240501},
  {code:"LBR",n:"Lábrea Airport",lat:-7.27897,lng:-64.769501},
  {code:"IRZ",n:"Santa Isabel do Rio Negro — Tapuruquara Airport",lat:-0.378604,lng:-64.992558},
  {code:"TGQ",n:"Tangará da Serra Airport",lat:-14.662,lng:-57.443744},
  {code:"SXP",n:"Nunam Iqua Airport",lat:62.520599,lng:-164.848006},
  {code:"GEO",n:"Georgetown — Cheddi Jagan International Airport",lat:6.49855,lng:-58.254101},
  {code:"OGL",n:"Ogle — Eugene F. Correia International Airport",lat:6.805881,lng:-58.107657},
  {code:"KAI",n:"Kaieteur Falls — Kaieteur Airport",lat:5.177349,lng:-59.48898},
  {code:"LTM",n:"Lethem Airport",lat:3.37276,lng:-59.789398},
  {code:"ANU",n:"Osbourn — V. C. Bird International Airport",lat:17.1367,lng:-61.792702},
  {code:"BGI",n:"Bridgetown — Grantley Adams International Airport",lat:13.074667,lng:-59.491034},
  {code:"TCT",n:"Takotna Airport",lat:62.993206,lng:-156.029026},
  {code:"DCF",n:"Canefield Airport",lat:15.336693,lng:-61.392108},
  {code:"DOM",n:"Marigot — Douglas-Charles Airport",lat:15.546673,lng:-61.301082},
  {code:"DSD",n:"Grande Anse — La Désirade Airport",lat:16.296902,lng:-61.0844},
  {code:"BBR",n:"Basse-Terre Baillif Airport",lat:16.013648,lng:-61.742928},
  {code:"SFC",n:"St-François Airport",lat:16.257799,lng:-61.262501},
  {code:"FDF",n:"Fort-de-France — Martinique Aimé Césaire International Airport",lat:14.591,lng:-61.003201},
  {code:"SFG",n:"Grand Case-l'Espérance Airport",lat:18.100057,lng:-63.047444},
  {code:"SBH",n:"Gustavia — St. Jean Airport",lat:17.904398,lng:-62.843333},
  {code:"GBJ",n:"Grand-Bourg — Marie-Galante Airport",lat:15.868925,lng:-61.270087},
  {code:"PTP",n:"Pointe-à-Pitre — Maryse Condé International Airport",lat:16.265443,lng:-61.532754},
  {code:"GND",n:"Saint George's — Maurice Bishop International Airport",lat:12.003996,lng:-61.785302},
  {code:"CRU",n:"Carriacou Island — Lauriston Airport",lat:12.4761,lng:-61.472801},
  {code:"STT",n:"Charlotte Amalie — Cyril E. King Airport",lat:18.337091,lng:-64.977251},
  {code:"STX",n:"Christiansted — Henry E. Rohlsen Airport",lat:17.701413,lng:-64.802608},
  {code:"BQN",n:"Aguadilla — Rafael Hernández International Airport",lat:18.4949,lng:-67.129402},
  {code:"CPX",n:"Culebra — Benjamin Rivera Noriega Airport",lat:18.312954,lng:-65.303893},
  {code:"SIG",n:"San Juan — Fernando Luis Ribas Dominicci Airport",lat:18.45680046081543,lng:-66.09809875488281},
  {code:"MAZ",n:"Mayaguez — Eugenio Maria De Hostos Airport",lat:18.255699,lng:-67.148499},
  {code:"PSE",n:"Ponce — Mercedita International Airport",lat:18.008301,lng:-66.563004},
  {code:"NRR",n:"Ceiba — José Aponte de la Torre Airport",lat:18.247262,lng:-65.63979},
  {code:"SJU",n:"San Juan — Luis Munoz Marin International Airport",lat:18.4394,lng:-66.001801},
  {code:"VQS",n:"Vieques — Antonio Rivera Rodriguez Airport",lat:18.1348,lng:-65.493599},
  {code:"SKB",n:"Basseterre — Robert L. Bradshaw International Airport",lat:17.310845,lng:-62.719117},
  {code:"NEV",n:"Charlestown — Vance W. Amory International Airport",lat:17.2057,lng:-62.589901},
  {code:"SLU",n:"Castries — George F. L. Charles Airport",lat:14.0202,lng:-60.992901},
  {code:"UVF",n:"Vieux Fort — Hewanorra International Airport",lat:13.7332,lng:-60.952599},
  {code:"TLT",n:"Tuluksak Airport",lat:61.086973,lng:-160.922842},
  {code:"BKN",n:"Balkanabat International Airport",lat:39.681052,lng:54.206008},
  {code:"AUA",n:"Oranjestad — Queen Beatrix International Airport",lat:12.501056,lng:-70.014281},
  {code:"BON",n:"Kralendijk — Flamingo International Airport",lat:12.131,lng:-68.268501},
  {code:"CUR",n:"Willemstad — Hato International Airport",lat:12.1889,lng:-68.959801},
  {code:"EUX",n:"Oranjestad — F. D. Roosevelt Airport",lat:17.4965,lng:-62.979401},
  {code:"SXM",n:"Sint Maarten — Princess Juliana International Airport",lat:18.041,lng:-63.108898},
  {code:"SAB",n:"Zion's Hill — Juancho E. Yrausquin Airport",lat:17.64533,lng:-63.220514},
  {code:"AXA",n:"The Valley — Clayton J. Lloyd International Airport",lat:18.204773,lng:-63.05383},
  {code:"MNI",n:"Gerald's Park — John A. Osborne Airport",lat:16.791835,lng:-62.193204},
  {code:"TAB",n:"Scarborough — A.N.R. Robinson International Airport",lat:11.149571,lng:-60.831298},
  {code:"POS",n:"Port of Spain — Piarco International Airport",lat:10.59535,lng:-61.337568},
  {code:"EIS",n:"Beef Island — Terrance B. Lettsome International Airport",lat:18.445492,lng:-64.541707},
  {code:"VIJ",n:"Spanish Town — Virgin Gorda Airport",lat:18.446634,lng:-64.427932},
  {code:"SVD",n:"Kingstown — Argyle International Airport",lat:13.159725,lng:-61.148801},
  {code:"BQU",n:"Bequia — J F Mitchell Airport",lat:12.9884,lng:-61.262001},
  {code:"CIW",n:"Canouan Airport",lat:12.699,lng:-61.3424},
  {code:"MQS",n:"Lovell — Mustique Airport",lat:12.8879,lng:-61.180199},
  {code:"UNI",n:"Union Island International Airport",lat:12.600135,lng:-61.411945},
  {code:"TWC",n:"Tumxuk Tangwangcheng Airport",lat:39.886663,lng:79.233408},
  {code:"BDA",n:"Hamilton — L.F. Wade International Airport",lat:32.363802,lng:-64.67824},
  {code:"BXH",n:"Balkhash Airport",lat:46.894246,lng:75.004533},
  {code:"USJ",n:"Usharal Airport",lat:46.190767,lng:80.830922},
  {code:"TDK",n:"Taldykorgan Airport",lat:45.12255,lng:78.442758},
  {code:"KOV",n:"Kokshetau International Airport",lat:53.329102,lng:69.594597},
  {code:"BSZ",n:"Bishkek — Manas International Airport",lat:43.061298,lng:74.4776},
  {code:"IKG",n:"Karakol International Airport",lat:42.508099,lng:78.407799},
  {code:"HSA",n:"Turkıstan — Hazrat Sultan International Airport",lat:43.311087,lng:68.550352},
  {code:"DZN",n:"Zhezkazgan National Airport",lat:47.708953,lng:67.738094},
  {code:"BXY",n:"Baikonur Krayniy International Airport",lat:45.621994,lng:63.210773},
  {code:"SZI",n:"Zaysan Airport",lat:47.487491,lng:84.887675},
  {code:"GBB",n:"Gabala International Airport",lat:40.808617,lng:47.725389},
  {code:"LHL",n:"Lachin International Airport",lat:39.883787,lng:46.363137},
  {code:"IKU",n:"Tamchy — Issyk-Kul International Airport",lat:42.585584,lng:76.701181},
  {code:"UKG",n:"Ust-Kuyga Airport",lat:70.011002,lng:135.645004},
  {code:"MQJ",n:"Khonuu — Moma Airport",lat:66.450861,lng:143.261551},
  {code:"OLZ",n:"Olyokminsk Airport",lat:60.401833,lng:120.476094},
  {code:"USR",n:"Ust-Nera Airport",lat:64.550003,lng:143.115005},
  {code:"UMS",n:"Ust-Maya Airport",lat:60.357437,lng:134.43731},
  {code:"VYI",n:"Vilyuisk Airport",lat:63.756668,lng:121.693336},
  {code:"SYS",n:"Saskylakh Airport",lat:71.927902,lng:114.080002},
  {code:"ZKP",n:"Zyryanka Airport",lat:65.7485,lng:150.8889},
  {code:"KXO",n:"Kisoro Airport",lat:-1.2837,lng:29.7197},
  {code:"KHX",n:"Kihihi — Savannah Airstrip",lat:-0.7165,lng:29.6997},
  {code:"SUI",n:"Sukhumi — Vladislav Ardzinba Sukhum International Airport",lat:42.8582,lng:41.128101},
  {code:"KPW",n:"Keperveem Airport",lat:67.845001,lng:166.139999},
  {code:"KVM",n:"Markovo Airport",lat:64.665446,lng:170.417626},
  {code:"NGK",n:"Nogliki Airport",lat:51.783955,lng:143.141785},
  {code:"TLY",n:"Plastun Airport",lat:44.814999,lng:136.292007},
  {code:"ODO",n:"Bodaybo Airport",lat:57.866100311299995,lng:114.242996216},
  {code:"NZG",n:"Nizhneangarsk International Airport",lat:55.8008,lng:109.595001},
  {code:"VUS",n:"Velikiy Ustyug Airport",lat:60.7883,lng:46.259998},
  {code:"MVQ",n:"Mogilev Airport",lat:53.954898834228516,lng:30.09510040283203},
  {code:"VEO",n:"Severo-Yeniseysk Airport",lat:60.373299,lng:93.011703},
  {code:"GOY",n:"Tura Mountain Airport",lat:64.333511,lng:100.432892},
  {code:"VAQ",n:"Vanavara Airport",lat:60.356229,lng:102.309641},
  {code:"KCY",n:"Krasnoyarsk Cheremshanka Airport",lat:56.177584,lng:92.545881},
  {code:"KYZ",n:"Kyzyl Airport",lat:51.669399,lng:94.400597},
  {code:"THX",n:"Turukhansk Airport",lat:65.797203,lng:87.935303},
  {code:"PQS",n:"Pilot Station Airport",lat:61.96169,lng:-162.941944},
  {code:"BVJ",n:"Bovanenkovo Airport",lat:70.315278,lng:68.333611},
  {code:"EYK",n:"Beloyarskiy Airport",lat:63.686901,lng:66.698601},
  {code:"OVS",n:"Sovetskiy Airport",lat:61.326622009277344,lng:63.60191345214844},
  {code:"RMZ",n:"Tobolsk Remezov Airport",lat:58.059712,lng:68.347997},
  {code:"KRO",n:"Kurgan Airport",lat:55.4753,lng:65.415604},
  {code:"KRW",n:"Turkmenbaşy International Airport",lat:40.062833,lng:53.005085},
  {code:"TAZ",n:"Daşoguz — Dashoguz International Airport",lat:41.759853,lng:59.836149},
  {code:"KQT",n:"Bokhtar International Airport",lat:37.866315,lng:68.864475},
  {code:"NVI",n:"Navoi International Airport",lat:40.117599,lng:65.172658},
  {code:"KSQ",n:"Karshi Airport",lat:38.802246,lng:65.773068},
  {code:"TVT",n:"Tashkent-Khumo International Airport",lat:41.312889,lng:69.395535},
  {code:"OMN",n:"Zomin Airport",lat:40.01402,lng:68.41103},
  {code:"UCT",n:"Ukhta Airport",lat:63.566898,lng:53.804699},
  {code:"PEX",n:"Pechora Airport",lat:65.121101,lng:57.130798},
  {code:"ULV",n:"Ulyanovsk Baratayevka Airport",lat:54.27016,lng:48.225569},
  {code:"PEZ",n:"Penza Airport",lat:53.1106,lng:45.021099},
  {code:"UZR",n:"Urzhar Airport",lat:47.091786,lng:81.668216},
  {code:"REW",n:"Rewa Airport, Chorhata, REWA",lat:24.503401,lng:81.220299},
  {code:"DIU",n:"Diu Airport",lat:20.714185,lng:70.921855},
  {code:"GDB",n:"Gondia Airport",lat:21.526817,lng:80.290347},
  {code:"AMD",n:"Ahmedabad — Sardar Vallabh Patel International Airport",lat:23.0772,lng:72.634697},
  {code:"IXU",n:"Aurangabad Airport",lat:19.862875,lng:75.396312},
  {code:"BHJ",n:"Bhuj Airport",lat:23.2877998352,lng:69.6701965332},
  {code:"IXG",n:"Belgaum — Belagavi Airport",lat:15.8593,lng:74.618301},
  {code:"BDQ",n:"Vadodara International Airport",lat:22.336201,lng:73.226303},
  {code:"BHO",n:"Bhopal — Raja Bhoj International Airport",lat:23.2875,lng:77.337402},
  {code:"BHU",n:"Bhavnagar Airport",lat:21.752199173,lng:72.1852035522},
  {code:"HBX",n:"Hubballi Airport",lat:15.361084,lng:75.082096},
  {code:"HSR",n:"Rajkot International Airport",lat:22.378824,lng:71.039391},
  {code:"IDR",n:"Indore — Devi Ahilya Bai Holkar International Airport",lat:22.721404,lng:75.80051},
  {code:"JLR",n:"Jabalpur Airport",lat:23.177799,lng:80.052002},
  {code:"JLG",n:"Jalgaon Airport",lat:20.962678,lng:75.627492},
  {code:"JGA",n:"Jamnagar Airport",lat:22.465499877929688,lng:70.01260375976562},
  {code:"IXY",n:"Kandla Airport",lat:23.1127,lng:70.100304},
  {code:"HJR",n:"Khajuraho Airport",lat:24.8172,lng:79.918602},
  {code:"KLH",n:"Kolhapur Airport",lat:16.6647,lng:74.289398},
  {code:"IXK",n:"Keshod Airport",lat:21.317101,lng:70.270401},
  {code:"LTU",n:"Latur — Murod Kond Airport",lat:18.411501,lng:76.464699},
  {code:"NDC",n:"Nanded Airport",lat:19.1833,lng:77.316704},
  {code:"NAG",n:"Nagpur — Dr. Babasaheb Ambedkar International Airport",lat:21.092199,lng:79.047203},
  {code:"ISK",n:"Nashik International Airport",lat:20.119101,lng:73.912903},
  {code:"PNQ",n:"Pune International Airport",lat:18.5821,lng:73.919701},
  {code:"PBD",n:"Porbandar Airport",lat:21.649524,lng:69.656405},
  {code:"RPR",n:"Raipur — Swami Vivekananda Airport",lat:21.180401,lng:81.7388},
  {code:"SAG",n:"Kakadi — Shirdi International Airport",lat:19.689211,lng:74.373655},
  {code:"STV",n:"Surat International Airport",lat:21.115531,lng:72.743251},
  {code:"UDR",n:"Udaipur — Maharana Pratap Airport",lat:24.617700576799997,lng:73.89610290530001},
  {code:"CMB",n:"Bandaranaike International Colombo Airport",lat:7.180759906768799,lng:79.88410186767578},
  {code:"BTC",n:"Batticaloa International Airport",lat:7.705073,lng:81.677163},
  {code:"RML",n:"Colombo Ratmalana International Airport",lat:6.821638,lng:79.885859},
  {code:"JAF",n:"Jaffna International Airport",lat:9.79233,lng:80.070099},
  {code:"KCT",n:"Galle — Koggala Airport",lat:5.993680000305176,lng:80.32029724121094},
  {code:"TRR",n:"Trincomalee — China Bay Airport",lat:8.539159,lng:81.18128},
  {code:"HRI",n:"Mattala Rajapaksa International Airport",lat:6.283878,lng:81.124163},
  {code:"BBM",n:"Battambang Airport",lat:13.0956,lng:103.223999},
  {code:"SAI",n:"Siem Reap-Angkor International Airport",lat:13.36974,lng:104.223831},
  {code:"KOS",n:"Preah Sihanouk — Sihanouk International Airport",lat:10.570557,lng:103.632067},
  {code:"IXA",n:"Agartala - Maharaja Bir Bikram Airport",lat:23.886999,lng:91.240402},
  {code:"IXB",n:"Siliguri — Bagdogra Airport",lat:26.6812,lng:88.328598},
  {code:"SHL",n:"Shillong Airport",lat:25.70359992980957,lng:91.97869873046875},
  {code:"VNS",n:"Varanasi — Lal Bahadur Shastri International Airport",lat:25.452171,lng:82.862549},
  {code:"BBI",n:"Bhubaneswar — Biju Patnaik International Airport",lat:20.251021,lng:85.814747},
  {code:"PAB",n:"Bilaspur Airport",lat:21.9884,lng:82.111},
  {code:"CCU",n:"Kolkata — Netaji Subhash Chandra Bose International Airport",lat:22.654012,lng:88.44765},
  {code:"RDP",n:"Durgapur — Kazi Nazrul Islam Airport",lat:23.6225,lng:87.243},
  {code:"DBR",n:"Darbhanga Airport",lat:26.192801,lng:85.916901},
  {code:"DGH",n:"Deoghar Airport",lat:24.446842,lng:86.704955},
  {code:"GOP",n:"Gorakhpur Airport",lat:26.739700317399997,lng:83.4496994019},
  {code:"GAU",n:"Guwahati — Lokpriya Gopinath Bordoloi International Airport",lat:26.106654,lng:91.585226},
  {code:"GAY",n:"Gaya Airport",lat:24.744301,lng:84.951202},
  {code:"IMF",n:"Imphal — Bir Tikendrajit International Airport",lat:24.76,lng:93.896698},
  {code:"JRG",n:"Jharsuguda Airport",lat:21.9135,lng:84.0504},
  {code:"JRH",n:"Jorhat Airport",lat:26.730456,lng:94.175416},
  {code:"IXS",n:"Silchar Airport",lat:24.9129009247,lng:92.97869873050001},
  {code:"AJL",n:"Aizawl (Lengpui) — Lengpui Airport",lat:23.840599,lng:92.619698},
  {code:"IXI",n:"Lilabari North Lakhimpur Airport",lat:27.295682,lng:94.097266},
  {code:"DIB",n:"Dibrugarh Airport",lat:27.4839000702,lng:95.0168991089},
  {code:"DMU",n:"Dimapur Airport",lat:25.883899688699998,lng:93.77110290530001},
  {code:"PAT",n:"Patna — Jay Prakash Narayan Airport",lat:25.591299,lng:85.087997},
  {code:"IXR",n:"Ranchi — Birsa Munda Airport",lat:23.314300537100003,lng:85.3217010498},
  {code:"TEZ",n:"Tezpur Airport",lat:26.7091007232666,lng:92.78469848632812},
  {code:"UKE",n:"Bhawanipatna — Utkela Airport",lat:20.097778,lng:83.183333},
  {code:"BZL",n:"Barisal Airport",lat:22.801001,lng:90.301201},
  {code:"CXB",n:"Cox's Bazar Airport",lat:21.457517,lng:91.963263},
  {code:"CGP",n:"Chattogram (Chittagong) — Shah Amanat International Airport",lat:22.249599,lng:91.813301},
  {code:"DAC",n:"Dhaka — Hazrat Shahjalal International Airport",lat:23.843347,lng:90.397783},
  {code:"JSR",n:"Jashore (Jessore) — Jessore Airport",lat:23.1838,lng:89.160797},
  {code:"RJH",n:"Rajshahi — Shah Makhdum Airport",lat:24.437201,lng:88.616501},
  {code:"SPD",n:"Saidpur Airport",lat:25.759199,lng:88.908897},
  {code:"ZYL",n:"Sylhet — Osmany International Airport",lat:24.963993,lng:91.864749},
  {code:"AGR",n:"Agra Airport / Agra Air Force Station",lat:27.157975,lng:77.961025},
  {code:"IXD",n:"Allahabad — Prayagraj Airport",lat:25.4401,lng:81.733902},
  {code:"ATQ",n:"Amritsar — Sri Guru Ram Das Ji International Airport",lat:31.7096,lng:74.797302},
  {code:"AIP",n:"Adampur Airport",lat:31.4338,lng:75.758797},
  {code:"KUU",n:"Bhuntar — Kullu Manali Airport",lat:31.876699,lng:77.154404},
  {code:"BEK",n:"Bareilly Air Force Station",lat:28.4221,lng:79.450798},
  {code:"IXC",n:"Chandigarh — Shaheed Bhagat Singh International Airport",lat:30.6735,lng:76.788498},
  {code:"KNU",n:"Kanpur Airport",lat:26.404301,lng:80.410103},
  {code:"DED",n:"Dehradun (Jauligrant) — Dehradun Jolly Grant Airport",lat:30.189243,lng:78.176651},
  {code:"HDO",n:"Ghaziabad — Hindon Airport / Hindon Air Force Station",lat:28.707701,lng:77.358902},
  {code:"DHM",n:"Kangra Airport",lat:32.164902,lng:76.263018},
  {code:"GWL",n:"Gwalior Airport",lat:26.29330062866211,lng:78.22779846191406},
  {code:"HSS",n:"Hisar — Maharaja Agrasen International Airport",lat:29.186065,lng:75.74142},
  {code:"HWR",n:"Halwara International Airport",lat:30.748501,lng:75.629799},
  {code:"JDH",n:"Jodhpur Airport",lat:26.251100540161133,lng:73.04889678955078},
  {code:"JAI",n:"Jaipur International Airport",lat:26.8242,lng:75.812202},
  {code:"JSA",n:"Jaisalmer Airport",lat:26.8887,lng:70.864998},
  {code:"IXJ",n:"Jammu Airport",lat:32.688849,lng:74.838152},
  {code:"KQH",n:"Ajmer (Kishangarh) — Kishangarh Airport Ajmer",lat:26.591007,lng:74.812956},
  {code:"IXL",n:"Leh Kushok Bakula Rimpochee Airport",lat:34.135899,lng:77.546501},
  {code:"LKO",n:"Lucknow — Chaudhary Charan Singh International Airport",lat:26.760599,lng:80.889297},
  {code:"MZS",n:"Moradabad Airport",lat:28.81746,lng:78.92187},
  {code:"IXP",n:"Pathankot Airport",lat:32.233611,lng:75.634444},
  {code:"PGH",n:"Pantnagar Airport",lat:29.0334,lng:79.473701},
  {code:"SXR",n:"Srinagar International Airport",lat:33.987099,lng:74.7742},
  {code:"VSV",n:"Shravasti Airport",lat:27.499732,lng:82.032927},
  {code:"LPQ",n:"Luang Phabang International Airport",lat:19.904273,lng:102.167191},
  {code:"LXG",n:"Luang Namtha Airport",lat:20.966999,lng:101.400002},
  {code:"ODY",n:"Oudomsay Airport",lat:20.68269920349121,lng:101.99400329589844},
  {code:"PKZ",n:"Pakse International Airport",lat:15.133973,lng:105.779871},
  {code:"VTE",n:"Vientiane — Wattay International Airport",lat:17.985052,lng:102.566692},
  {code:"XKH",n:"Xieng Khouang Airport",lat:19.450001,lng:103.157997},
  {code:"MFM",n:"Nossa Senhora do Carmo — Macau International Airport",lat:22.149599,lng:113.592003},
  {code:"BHR",n:"Bharatpur Airport",lat:27.678101,lng:84.429398},
  {code:"BWA",n:"Siddharthanagar (Bhairahawa) — Gautam Buddha International Airport",lat:27.504636,lng:83.410381},
  {code:"BDP",n:"Bhadrapur Airport",lat:26.5708007812,lng:88.07959747310001},
  {code:"DOP",n:"Dolpa Airport",lat:28.985659,lng:82.818703},
  {code:"SIH",n:"Silgadi Doti Airport",lat:29.262226,lng:80.935968},
  {code:"JUM",n:"Jumla Airport",lat:29.2742,lng:82.193298},
  {code:"JKR",n:"Janakpur Airport",lat:26.708799,lng:85.922401},
  {code:"JMO",n:"Jomsom Airport",lat:28.780426,lng:83.723},
  {code:"KTM",n:"Kathmandu — Tribhuvan International Airport",lat:27.6966,lng:85.3591},
  {code:"LUA",n:"Lukla — Tenzing-Hillary Airport",lat:27.686768,lng:86.729479},
  {code:"KEP",n:"Nepalgunj Airport",lat:28.1036,lng:81.667},
  {code:"PKR",n:"Pokhara Domestic Airport",lat:28.200621,lng:83.981203},
  {code:"SIF",n:"Simara Airport",lat:27.159803,lng:84.980021},
  {code:"SKH",n:"Surkhet Airport",lat:28.586,lng:81.636002},
  {code:"IMK",n:"Simikot Airport",lat:29.9711,lng:81.818901},
  {code:"TPJ",n:"Taplejung Airport",lat:27.3509,lng:87.69525},
  {code:"TMI",n:"Tumling Tar Airport",lat:27.315001,lng:87.193298},
  {code:"BIR",n:"Biratnagar Airport",lat:26.48150062561035,lng:87.26399993896484},
  {code:"AGX",n:"Agatti Airport",lat:10.8237,lng:72.176003},
  {code:"BLR",n:"Kempegowda International Airport Bengaluru",lat:13.1979,lng:77.706299},
  {code:"VGA",n:"Vijayawada International Airport",lat:16.530011,lng:80.804888},
  {code:"CJB",n:"Coimbatore International Airport",lat:11.03,lng:77.043404},
  {code:"COK",n:"Kochi — Cochin International Airport",lat:10.151047,lng:76.400838},
  {code:"CCJ",n:"Calicut International Airport",lat:11.135996,lng:75.955152},
  {code:"CDP",n:"Kadapa Airport",lat:14.513154,lng:78.769183},
  {code:"GOX",n:"Mopa — Manohar International Airport",lat:15.744257,lng:73.860625},
  {code:"GBI",n:"Kalaburagi Airport",lat:17.308154,lng:76.965246},
  {code:"GOI",n:"Vasco da Gama — Goa Dabolim International Airport",lat:15.380062,lng:73.833328},
  {code:"HYD",n:"Hyderabad — Rajiv Gandhi International Airport",lat:17.231318,lng:78.429855},
  {code:"KJB",n:"Orvakal — Kurnool Airport",lat:15.716288,lng:78.16923},
  {code:"IXM",n:"Madurai Airport",lat:9.83450984955,lng:78.09339904790001},
  {code:"IXE",n:"Mangaluru International Airport",lat:12.95471,lng:74.886812},
  {code:"MAA",n:"Chennai International Airport",lat:12.990005,lng:80.169296},
  {code:"MYQ",n:"Mysore Airport",lat:12.229751,lng:76.653683},
  {code:"IXZ",n:"Port Blair — Veer Savarkar International Airport / INS Utkrosh",lat:11.640194,lng:92.72902},
  {code:"PNY",n:"Puducherry (Pondicherry) — Pondicherry Airport",lat:11.968,lng:79.812},
  {code:"RJA",n:"Madhurapudi — Rajahmundry Airport",lat:17.105799,lng:81.813204},
  {code:"TCR",n:"Vagaikulam — Tuticorin Airport",lat:8.724241,lng:78.025803},
  {code:"TIR",n:"Tirupati International Airport",lat:13.631988,lng:79.539869},
  {code:"TRZ",n:"Tiruchirappalli International Airport",lat:10.762915,lng:78.717741},
  {code:"TRV",n:"Thiruvananthapuram International Airport",lat:8.481889,lng:76.920029},
  {code:"VTZ",n:"Visakhapatnam — Alluri Sitarama Raju International Airport (Vizag)",lat:17.971512,lng:83.503617},
  {code:"BUT",n:"Jakar — Bathpalathang Airport",lat:27.5622,lng:90.7471},
  {code:"PBH",n:"Paro International Airport",lat:27.4032,lng:89.424599},
  {code:"YON",n:"Yongphulla Airport",lat:27.25627,lng:91.514633},
  {code:"HRF",n:"Hoarafushi Airport",lat:6.96967,lng:72.896287},
  {code:"HDK",n:"Kulhudhuffushi Airport",lat:6.630762,lng:73.067815},
  {code:"NMF",n:"Noonu Atoll — Maafaru International Airport",lat:5.817407,lng:73.468404},
  {code:"DRV",n:"Baa Atoll — Dharavandhoo Airport",lat:5.1561,lng:73.1302},
  {code:"GAN",n:"Gan International Airport",lat:-0.692975,lng:73.152627},
  {code:"HAQ",n:"Haa Dhaalu Atoll — Hanimaadhoo International Airport",lat:6.743235,lng:73.167072},
  {code:"KDO",n:"Kadhdhoo Airport",lat:1.8591699600219727,lng:73.52189636230469},
  {code:"MLE",n:"Malé — Velana International Airport",lat:4.19183,lng:73.529099},
  {code:"GKK",n:"Huvadhu Atoll — Kooddoo Airport",lat:0.7324,lng:73.4336},
  {code:"KDM",n:"Huvadhu Atoll — Kaadedhdhoo Airport",lat:0.488131,lng:72.996902},
  {code:"VAM",n:"Villa International Airport Maamigili",lat:3.471751,lng:72.832633},
  {code:"TMF",n:"Thimarafushi Airport",lat:2.211,lng:73.1533},
  {code:"RUL",n:"Maavaarulu — Maavaarulaa Airport",lat:0.338085,lng:73.512869},
  {code:"TDX",n:"Laem Ngop — Trat Airport",lat:12.2746,lng:102.319},
  {code:"HGN",n:"Mae Hong Son Airport",lat:19.3013,lng:97.9758},
  {code:"LPT",n:"Lampang Airport",lat:18.27090072631836,lng:99.50420379638672},
  {code:"NNT",n:"Nan Airport",lat:18.807899475097656,lng:100.78299713134766},
  {code:"PHY",n:"Phetchabun Airport",lat:16.6760005951,lng:101.194999695},
  {code:"HHQ",n:"Hua Hin Airport",lat:12.6361999512,lng:99.951499939},
  {code:"MAQ",n:"Mae Sot Airport",lat:16.699899673461914,lng:98.54509735107422},
  {code:"THS",n:"Sukhothai Airport",lat:17.238000869750977,lng:99.81819915771484},
  {code:"PHS",n:"Phitsanulok Airport",lat:16.7829,lng:100.278999},
  {code:"URT",n:"Surat Thani Airport",lat:9.13259983063,lng:99.135597229},
  {code:"NAW",n:"Narathiwat Airport",lat:6.5199198722839355,lng:101.74299621582031},
  {code:"CJM",n:"Chumphon Airport",lat:10.7112,lng:99.361702},
  {code:"NST",n:"Nakhon Si Thammarat Airport",lat:8.539620399475098,lng:99.9447021484375},
  {code:"UNN",n:"Ranong Airport",lat:9.77762,lng:98.585503},
  {code:"TST",n:"Trang Airport",lat:7.50874,lng:99.6166},
  {code:"UTH",n:"Udon Thani International Airport",lat:17.386186,lng:102.788577},
  {code:"SNO",n:"Sakon Nakhon Airport",lat:17.195100784301758,lng:104.11900329589844},
  {code:"PXR",n:"Surin Airport",lat:14.868300437927,lng:103.49800109863},
  {code:"KKC",n:"Khon Kaen Airport",lat:16.466600418099997,lng:102.783996582},
  {code:"LOE",n:"Loei Airport",lat:17.43910026550293,lng:101.72200012207031},
  {code:"BFV",n:"Buriram — Buri Ram Airport",lat:15.2295,lng:103.252998},
  {code:"UBP",n:"Ubon Ratchathani Airport",lat:15.2512998581,lng:104.870002747},
  {code:"ROI",n:"Roi Et Airport",lat:16.1168,lng:103.774002},
  {code:"KOP",n:"Nakhon Phanom Airport",lat:17.383801,lng:104.642998},
  {code:"BMV",n:"Buon Ma Thuot Airport",lat:12.668299675,lng:108.120002747},
  {code:"VCL",n:"Tam Nghĩa — Chu Lai Airport",lat:15.4033,lng:108.706001},
  {code:"HPH",n:"Haiphong (Hai An) — Cat Bi International Airport",lat:20.817428,lng:106.724315},
  {code:"CAH",n:"Ca Mau City — Cà Mau Airport",lat:9.177667,lng:105.177778},
  {code:"CXR",n:"Nha Trang/nha Trang aiurportCam Ranh — Cam Ranh International Airport / Cam Ranh Air Base",lat:11.9982,lng:109.219002},
  {code:"VCS",n:"Con Dao Airport",lat:8.73183,lng:106.633003},
  {code:"VCA",n:"Can Tho International Airport",lat:10.083397,lng:105.709371},
  {code:"DIN",n:"Dien Bien Phu Airport",lat:21.3974990845,lng:103.008003235},
  {code:"VDH",n:"Dong Hoi Airport",lat:17.515,lng:106.590556},
  {code:"DLI",n:"Da Lat — Lien Khuong Airport",lat:11.750556,lng:108.366997},
  {code:"DAD",n:"Da Nang International Airport",lat:16.0439,lng:108.198997},
  {code:"HUI",n:"Huế — Phu Bai International Airport",lat:16.400581,lng:107.704094},
  {code:"UIH",n:"Quy Nohn — Phu Cat Airport",lat:13.955,lng:109.042},
  {code:"PXU",n:"Pleiku Airport",lat:14.004500389099121,lng:108.01699829101562},
  {code:"PQC",n:"Phu Quoc Island — Phú Quốc International Airport",lat:10.169783,lng:103.99353},
  {code:"VKG",n:"Rach Gia Airport",lat:9.95802997234,lng:105.132379532},
  {code:"TBB",n:"Tuy Hoa — Dong Tac Airport",lat:13.0496,lng:109.334},
  {code:"THD",n:"Thanh Hóa — Tho Xuan Airport",lat:19.901667,lng:105.467778},
  {code:"VDO",n:"Van Don International Airport",lat:21.120693,lng:107.41539},
  {code:"VII",n:"Vinh Airport",lat:18.7376003265,lng:105.67099762},
  {code:"NYU",n:"Nyaung U — Bagan Airport",lat:21.178800582885742,lng:94.9301986694336},
  {code:"BMO",n:"Banmaw Airport",lat:24.27044,lng:97.2476},
  {code:"TVY",n:"Dawei Airport",lat:14.1039,lng:98.203598},
  {code:"HEH",n:"Heho Airport",lat:20.74714,lng:96.792029},
  {code:"KET",n:"Kengtung Airport",lat:21.301599502563477,lng:99.63600158691406},
  {code:"KHM",n:"Kanti Airport",lat:25.9883,lng:95.6744},
  {code:"KYP",n:"Kyaukpyu Airport",lat:19.42639923095703,lng:93.53479766845703},
  {code:"KAW",n:"Kawthoung Airport",lat:10.049300193786621,lng:98.53800201416016},
  {code:"LIW",n:"Loikaw Airport",lat:19.691499710083008,lng:97.21479797363281},
  {code:"LSH",n:"Lashio Airport",lat:22.9778995513916,lng:97.752197265625},
  {code:"MDL",n:"Mandalay International Airport",lat:21.702199935913086,lng:95.97789764404297},
  {code:"MGZ",n:"Mkeik — Myeik Airport",lat:12.439800262451172,lng:98.62149810791016},
  {code:"MYT",n:"Myitkyina Airport",lat:25.3836,lng:97.351898},
  {code:"MNU",n:"Mawlamyine Airport",lat:16.444700241088867,lng:97.66069793701172},
  {code:"MOG",n:"Mong Hsat Airport",lat:20.516799926757812,lng:99.25679779052734},
  {code:"MWQ",n:"Magway Airport",lat:20.1656,lng:94.941399},
  {code:"NYT",n:"Naypyitaw — Nay Pyi Taw International Airport",lat:19.623501,lng:96.200996},
  {code:"BSX",n:"Pathein Airport",lat:16.815201,lng:94.7799},
  {code:"PBU",n:"Putao Airport",lat:27.32990074157715,lng:97.42630004882812},
  {code:"AKY",n:"Sittwe Airport",lat:20.133165,lng:92.870693},
  {code:"SNW",n:"Thandwe Airport",lat:18.4606990814209,lng:94.30010223388672},
  {code:"THL",n:"Tachileik Airport",lat:20.483800888061523,lng:99.9354019165039},
  {code:"RGN",n:"Yangon International Airport",lat:16.907300949099998,lng:96.1332015991},
  {code:"RCE",n:"Roche Harbor Airport",lat:48.612301,lng:-123.139},
  {code:"UPG",n:"Makassar — Sultan Hasanuddin International Airport",lat:-5.075539,lng:119.553702},
  {code:"BIK",n:"Biak — Frans Kaisiepo Airport",lat:-1.19002,lng:136.108002},
  {code:"TIM",n:"Timika — Mozes Kilangin Airport",lat:-4.52978,lng:136.887388},
  {code:"BMU",n:"Bima — Sultan Muhammad Salahuddin Airport",lat:-8.537184,lng:118.685002},
  {code:"DPS",n:"Kuta, Badung — Denpasar I Gusti Ngurah Rai International Airport",lat:-8.748409,lng:115.167123},
  {code:"LOP",n:"Mataram (Pujut, Lombok Tengah) — Lombok International Airport",lat:-8.759962,lng:116.278169},
  {code:"SWQ",n:"Sumbawa Besar — Sultan Muhammad Kaharuddin III Airport",lat:-8.48904,lng:117.412003},
  {code:"TMC",n:"Radamata — Tambolaka Airport",lat:-9.409224,lng:119.242558},
  {code:"WGP",n:"Waingapu-Sumba Island — Umbu Mehang Kunda Airport",lat:-9.66922,lng:120.302002},
  {code:"BWX",n:"Rogojampi, Banyuwangi — Banyuwangi Airport",lat:-8.31015,lng:114.3401},
  {code:"TTE",n:"Ternate — Sultan Babullah Airport",lat:0.831012,lng:127.381611},
  {code:"TRT",n:"Toraja Airport",lat:-3.184359,lng:119.919104},
  {code:"LLO",n:"Bua - Palopo Lagaligo Airport",lat:-3.08227,lng:120.244823},
  {code:"PLW",n:"Palu — Mutiara - SIS Al-Jufrie Airport",lat:-0.916462,lng:119.908647},
  {code:"TLI",n:"Toli Toli-Celebes Island — Sultan Bantilan Airport",lat:1.123428,lng:120.793658},
  {code:"OJU",n:"Tojo Una-Una — Tanjung Api Airport",lat:-0.865437,lng:121.628625},
  {code:"HMS",n:"Muara Teweh — Haji Muhammad Sidik Airport",lat:-1.02581,lng:114.92881},
  {code:"KLP",n:"Seruyan Kuala Pembuang Airport",lat:-3.376062,lng:112.536521},
  {code:"PKY",n:"Palangkaraya — Tjilik Riwut Airport",lat:-2.227146,lng:113.943388},
  {code:"YIA",n:"Yogyakarta International Airport",lat:-7.905338,lng:110.057264},
  {code:"CXP",n:"Cilacap — Tunggul Wulung Airport",lat:-7.64506,lng:109.033997},
  {code:"KWB",n:"Karimunjawa — Dewadaru Airport",lat:-5.80091,lng:110.47838},
  {code:"BUI",n:"Bokondini Airport",lat:-3.68455,lng:138.677437},
  {code:"DJJ",n:"Sentani — Dortheys Hiyo Eluay International Airport",lat:-2.579627,lng:140.519857},
  {code:"OKL",n:"Oksibil Airport",lat:-4.9071,lng:140.6277},
  {code:"MKQ",n:"Merauke — Mopah International Airport",lat:-8.523898,lng:140.419693},
  {code:"TMH",n:"Tanah Merah Airport",lat:-6.09669,lng:140.303521},
  {code:"TJS",n:"Tanjung Selor-Borneo Island — Tanjung Harapan Airport",lat:2.838139,lng:117.374584},
  {code:"DTD",n:"Datadawai-Borneo Island — Datadawai Airport",lat:0.807028,lng:114.529052},
  {code:"BPN",n:"Balikpapan — Sultan Aji Muhammad Sulaiman Sepinggan International Airport",lat:-1.268342,lng:116.89452},
  {code:"TRK",n:"Tarakan — Juwata International Airport / Suharnoko Harbani AFB",lat:3.325145,lng:117.564169},
  {code:"AAP",n:"Samarinda — Aji Pangeran Tumenggung Pranoto International Airport",lat:-0.374478,lng:117.250128},
  {code:"GTO",n:"Gorontalo — Jalaluddin Airport",lat:0.637119,lng:122.849998},
  {code:"NAH",n:"Tabukan Utara, Sangihe Islands — Naha Airport",lat:3.68478,lng:125.527162},
  {code:"LKM",n:"Lolak — Bolaang Mongondow Airport",lat:0.88855,lng:124.033634},
  {code:"MDC",n:"Manado — Sam Ratulangi International Airport",lat:1.548591,lng:124.92625},
  {code:"UOL",n:"Buol - Pogogul Airport",lat:1.102318,lng:121.413358},
  {code:"BTW",n:"Batu Licin — Bersujud Airport",lat:-3.41241,lng:115.995003},
  {code:"PKN",n:"Pangkalanbun — Iskandar Airport",lat:-2.7052,lng:111.672997},
  {code:"KBU",n:"Stagen — Gusti Syamsir Alam Airport",lat:-3.294796,lng:116.163815},
  {code:"TJG",n:"Tanta-Tabalong — Warukin Airport",lat:-2.21656,lng:115.435997},
  {code:"BDJ",n:"Banjarbaru — Syamsudin Noor International Airport",lat:-3.440112,lng:114.761209},
  {code:"SMQ",n:"Sampit (H.Asan) Airport",lat:-2.499198,lng:112.974987},
  {code:"TBM",n:"Tumbang Samba-Borneo Island — Tumbang Samba Airport",lat:-1.469024,lng:113.080984},
  {code:"LUV",n:"Langgur — Karel Sadsuitubun Airport",lat:-5.760278,lng:132.759444},
  {code:"NAM",n:"Namniwel Airport",lat:-3.143159,lng:126.976469},
  {code:"AMQ",n:"Ambon — Pattimura International Airport",lat:-3.71026,lng:128.089005},
  {code:"LNU",n:"Malinau — Robert Atty Bessing",lat:3.575256,lng:116.619769},
  {code:"BEJ",n:"Tanjung Redeb - Borneo Island — Kalimarau Airport",lat:2.14776,lng:117.430705},
  {code:"MLG",n:"Malang — Abdul Rachman Saleh Airport",lat:-7.929099,lng:112.714233},
  {code:"JBB",n:"Jember — Notohadinegoro Airport",lat:-8.242494,lng:113.693476},
  {code:"JOG",n:"Yogyakarta — Adisutjipto International Airport",lat:-7.78818,lng:110.431999},
  {code:"SOC",n:"Surakarta — Adisoemarmo International Airport",lat:-7.516044,lng:110.757492},
  {code:"SUB",n:"Surabaya — Juanda International Airport",lat:-7.37983,lng:112.787003},
  {code:"SRG",n:"Semarang — Jenderal Ahmad Yani Airport",lat:-6.970732,lng:110.373244},
  {code:"FKQ",n:"Fakfak Airport",lat:-2.920508,lng:132.267011},
  {code:"KNG",n:"Kaimana — Utarom Airport",lat:-3.6446,lng:133.695116},
  {code:"RJM",n:"Waisai — Marinda Airport",lat:-0.424969,lng:130.773535},
  {code:"MKW",n:"Manokwari — Rendani Airport",lat:-0.891833,lng:134.048996},
  {code:"SOQ",n:"Sorong — Domine Eduard Osok Airport",lat:-0.894,lng:131.287},
  {code:"ABU",n:"Atambua — AA Bere Tallo (Haliwen) Airport",lat:-9.074841,lng:124.903285},
  {code:"MOF",n:"Waioti — Frans Xavier Seda Airport",lat:-8.639514,lng:122.238135},
  {code:"ENE",n:"H. Hasan Aroeboesman (Ende) Airport",lat:-8.849114,lng:121.66101},
  {code:"RTG",n:"Satar Tacik, Manggarai — Frans Sales Lega Airport",lat:-8.596171,lng:120.478177},
  {code:"LKA",n:"Tiwatobi — Larantuka Gewayentana Airport",lat:-8.274424,lng:123.002},
  {code:"ARD",n:"Kabola — Alor Island - Mali Airport",lat:-8.13234,lng:124.597},
  {code:"LBJ",n:"Labuan Bajo, Manggarai Barat — Komodo Airport",lat:-8.480694,lng:119.888306},
  {code:"RTI",n:"Ba'a - Rote Island — David Constantijn Saudale Airport",lat:-10.765834,lng:123.076046},
  {code:"KOE",n:"Kupang — El Tari Airport",lat:-10.1716,lng:123.670998},
  {code:"WMX",n:"Wamena Airport",lat:-4.097324,lng:138.952417},
  {code:"WNI",n:"Wangi-wangi Island — Matahora Airport",lat:-5.292123,lng:123.636233},
  {code:"KSR",n:"Benteng — Selayar - Haji Aroeppala Airport",lat:-6.17921,lng:120.437479},
  {code:"KXB",n:"Kolaka — Sangia Nibandera Airport",lat:-4.338158,lng:121.524047},
  {code:"KDI",n:"Kendari — Haluoleo Airport",lat:-4.08161,lng:122.417999},
  {code:"WBB",n:"Stebbins Airport",lat:63.515999,lng:-162.278},
  {code:"BTU",n:"Bintulu Airport",lat:3.12385010719,lng:113.019996643},
  {code:"LGL",n:"Long Datih — Long Lellang Airport",lat:3.4210000038099997,lng:115.153999329},
  {code:"KCH",n:"Kuching International Airport",lat:1.487364,lng:110.352859},
  {code:"ODN",n:"Long Seridan Airport",lat:3.976087,lng:115.067303},
  {code:"LMN",n:"Limbang Airport",lat:4.808300018310547,lng:115.01000213623047},
  {code:"MKM",n:"Mukah Airport",lat:2.881944,lng:112.043333},
  {code:"MUR",n:"Marudi Airport",lat:4.178734,lng:114.330318},
  {code:"BKM",n:"Bakalalan Airport",lat:3.974,lng:115.617996},
  {code:"MYY",n:"Miri Airport",lat:4.32201,lng:113.987},
  {code:"SBW",n:"Sibu Airport",lat:2.2616,lng:111.985001},
  {code:"LWY",n:"Lawas Airport",lat:4.84917,lng:115.407997},
  {code:"BBN",n:"Bario Airport",lat:3.734648,lng:115.478548},
  {code:"LDU",n:"Lahad Datu Airport",lat:5.03241,lng:118.32376},
  {code:"BKI",n:"Kota Kinabalu International Airport",lat:5.932743,lng:116.049324},
  {code:"LBU",n:"Labuan Airport",lat:5.301667,lng:115.248333},
  {code:"TMG",n:"Tomanggong Airport",lat:5.40257,lng:118.65763},
  {code:"SDK",n:"Sandakan Airport",lat:5.900899887084961,lng:118.05899810791016},
  {code:"KUD",n:"Kudat Airport",lat:6.924111,lng:116.837068},
  {code:"TWU",n:"Tawau Airport",lat:4.31338,lng:118.12152},
  {code:"MZV",n:"Mulu Airport",lat:4.048329830169678,lng:114.80500030517578},
  {code:"BWN",n:"Bandar Seri Begawan — Brunei International Airport",lat:4.9442,lng:114.928001},
  {code:"PKU",n:"Pekanbaru — Sultan Syarif Kasim II International Airport / Roesmin Nurjadin AFB",lat:0.458647,lng:101.444321},
  {code:"DUM",n:"Dumai — Pinang Kampai Airport",lat:1.609026,lng:101.433493},
  {code:"KJT",n:"Kertajati International Airport",lat:-6.647384,lng:108.165561},
  {code:"BDO",n:"Bandung — Husein Sastranegara International Airport",lat:-6.90063,lng:107.575996},
  {code:"CJN",n:"Cijulang — Nusawiru Airport",lat:-7.719895,lng:108.488995},
  {code:"BTH",n:"Batam — Hang Nadim International Airport",lat:1.12103,lng:104.119003},
  {code:"TNJ",n:"Tanjung Pinang-Bintan Island — Raja Haji Fisabilillah International Airport",lat:0.92397,lng:104.53341},
  {code:"MPC",n:"Muko Muko Airport",lat:-2.541058,lng:101.087651},
  {code:"HLP",n:"Jakarta — Halim Perdanakusuma International Airport",lat:-6.266989,lng:106.890318},
  {code:"TKG",n:"Bandar Lampung — Radin Inten II International Airport",lat:-5.246803,lng:105.182531},
  {code:"LSW",n:"Lhok Seumawe-Sumatra Island — Malikus Saleh Airport",lat:5.22668,lng:96.950302},
  {code:"GNS",n:"Gunungsitoli — Binaka Airport",lat:1.166275,lng:97.705196},
  {code:"KNO",n:"Beringin — Kualanamu International Airport",lat:3.637847,lng:98.870566},
  {code:"DTB",n:"Siborong-Borong — Silangit Airport",lat:2.25973,lng:98.991898},
  {code:"FLZ",n:"Sibolga (Pinangsori) — Dr. Ferdinand Lumban Tobing Airport",lat:1.557127,lng:98.887145},
  {code:"LSR",n:"Kutacane — Alas Leuser Airport",lat:3.391456,lng:97.863726},
  {code:"TJQ",n:"Tanjung Pandan — H A S Hanandjoeddin International Airport",lat:-2.744109,lng:107.754535},
  {code:"NPO",n:"Nanga Pinoh-Borneo Island — Nanga Pinoh Airport",lat:-0.34864,lng:111.746155},
  {code:"KTG",n:"Ketapang — Rahadi Osman Airport",lat:-1.817165,lng:109.963469},
  {code:"NTX",n:"Ranai-Natuna Besar Island — Ranai Airport",lat:3.90871,lng:108.388},
  {code:"PNK",n:"Pontianak — Supadio International Airport",lat:-0.152258,lng:109.404493},
  {code:"PSU",n:"Putussibau-Borneo Island — Pangsuma Airport",lat:0.834579,lng:112.940217},
  {code:"SQG",n:"Sintang — Tebelian Airport",lat:-0.045214,lng:111.458049},
  {code:"DJB",n:"Jambi — Sultan Thaha Airport",lat:-1.638685,lng:103.645063},
  {code:"BUU",n:"Muara Bungo Airport",lat:-1.541635,lng:102.181613},
  {code:"PGK",n:"Pangkal Pinang — Depati Amir Airport",lat:-2.1622,lng:106.139},
  {code:"BKS",n:"Bengkulu — Fatmawati Soekarno Airport",lat:-3.8637,lng:102.338997},
  {code:"PLM",n:"Palembang — Sultan Mahmud Badaruddin II Airport",lat:-2.897653,lng:104.698147},
  {code:"PDO",n:"Talang Gudang-Sumatra Island — Pendopo Airport",lat:-3.2860701084136963,lng:103.87999725341797},
  {code:"PDG",n:"Padang (Katapiang) — Minangkabau International Airport",lat:-0.785964,lng:100.280384},
  {code:"MEQ",n:"Kuala Pesisir — Cut Nyak Dhien Airport",lat:4.040998,lng:96.253312},
  {code:"LKI",n:"Lubang — Lasikin Airport",lat:2.411328,lng:96.327722},
  {code:"TXE",n:"Takengon — Rembele Airport",lat:4.72113,lng:96.851943},
  {code:"BTJ",n:"Banda Aceh — Sultan Iskandar Muda International Airport",lat:5.525087,lng:95.41997},
  {code:"TOD",n:"Tioman Island — Tioman Airport",lat:2.81818,lng:104.160004},
  {code:"AOR",n:"Alor Satar — Sultan Abdul Halim Airport",lat:6.189670085906982,lng:100.39800262451172},
  {code:"KBR",n:"Kota Baharu — Sultan Ismail Petra Airport",lat:6.1668500900268555,lng:102.29299926757812},
  {code:"KUA",n:"Kuantan Airport",lat:3.7753899097442627,lng:103.20899963378906},
  {code:"IPH",n:"Ipoh — Sultan Azlan Shah Airport",lat:4.56733,lng:101.091643},
  {code:"JHB",n:"Johor Bahru — Senai International Airport",lat:1.64131,lng:103.669998},
  {code:"LGK",n:"Langkawi International Airport",lat:6.32973,lng:99.728699},
  {code:"MKZ",n:"Malacca International Airport",lat:2.265613,lng:102.252778},
  {code:"TGG",n:"Kuala Terengganu — Sultan Mahmud Airport",lat:5.3826398849487305,lng:103.10299682617188},
  {code:"PEN",n:"Penang International Airport",lat:5.296303,lng:100.276185},
  {code:"PKG",n:"Pangkor Island — Pulau Pangkor Airport",lat:4.244719982147217,lng:100.5530014038086},
  {code:"SZB",n:"Subang — Sultan Abdul Aziz Shah International Airport",lat:3.13058,lng:101.549004},
  {code:"DTR",n:"Decatur Shores Airport",lat:48.500171,lng:-122.813973},
  {code:"SXK",n:"Saumlaki-Yamdena Island — Mathilda Batlayeri Airport",lat:-7.848354,lng:131.337068},
  {code:"UAI",n:"Suai — Commander in Chief of FALINTIL, Kay Rala Xanana Gusmão, International Airport",lat:-9.301856,lng:125.286302},
  {code:"DIL",n:"Dili — Presidente Nicolau Lobato International Airport",lat:-8.546562,lng:125.524507},
  {code:"BCH",n:"Baucau Airport",lat:-8.486479,lng:126.399981},
  {code:"OEC",n:"Oecussi-Ambeno — Oecusse Route of the Sandalwood International Airport",lat:-9.198419,lng:124.337873},
  {code:"LBW",n:"Long Bawan — Yuvai Semaring Airport",lat:3.900495,lng:115.690089},
  {code:"BXT",n:"Bontang-Borneo Island — LNG Badak Airport",lat:0.121656,lng:117.476558},
  {code:"LPU",n:"Long Apung-Borneo Island — Long Apung Airport",lat:1.706932,lng:114.969934},
  {code:"XSP",n:"Seletar Airport",lat:1.41555,lng:103.86673},
  {code:"ALH",n:"Albany Airport",lat:-34.943333,lng:117.808889},
  {code:"ARM",n:"Armidale Airport",lat:-30.528099060099997,lng:151.617004395},
  {code:"AUU",n:"Aurukun Airport",lat:-13.354019,lng:141.720028},
  {code:"AYQ",n:"Yulara — Ayers Rock Connellan Airport",lat:-25.185913,lng:130.97703},
  {code:"BCI",n:"Barcaldine Airport",lat:-23.566268,lng:145.302086},
  {code:"ASP",n:"Alice Springs Airport",lat:-23.806588,lng:133.903427},
  {code:"BDD",n:"Badu Island Airport",lat:-10.14955,lng:142.173665},
  {code:"BNE",n:"Brisbane International Airport",lat:-27.384199142456055,lng:153.11700439453125},
  {code:"OOL",n:"Gold Coast Airport",lat:-28.165962,lng:153.506641},
  {code:"BKQ",n:"Blackall Airport",lat:-24.431678,lng:145.429716},
  {code:"CNS",n:"Cairns International Airport",lat:-16.878921,lng:145.74948},
  {code:"CTL",n:"Charleville Airport",lat:-26.4132995605,lng:146.261993408},
  {code:"BXG",n:"Bendigo Airport",lat:-36.739399,lng:144.330002},
  {code:"BVI",n:"Birdsville Airport",lat:-25.897499084472656,lng:139.34800720214844},
  {code:"BHQ",n:"Broken Hill Airport",lat:-32.0013999939,lng:141.472000122},
  {code:"HTI",n:"Hamilton Island Airport",lat:-20.3581008911,lng:148.95199585},
  {code:"BEU",n:"Bedourie Airport",lat:-24.3461,lng:139.460007},
  {code:"BRK",n:"Bourke Airport",lat:-30.039199829101562,lng:145.95199584960938},
  {code:"BUC",n:"Burketown Airport",lat:-17.748600006103516,lng:139.53399658203125},
  {code:"BQB",n:"Busselton Margaret River Regional Airport",lat:-33.687222,lng:115.400278},
  {code:"ISA",n:"Mount Isa Airport",lat:-20.66638,lng:139.488468},
  {code:"MKY",n:"Mackay Airport",lat:-21.170816,lng:149.182588},
  {code:"BNK",n:"Ballina Byron Gateway Airport",lat:-28.833236,lng:153.561471},
  {code:"GIC",n:"Boigu Island Airport",lat:-9.23278,lng:142.218002},
  {code:"OKY",n:"Oakey Army Aviation Centre",lat:-27.409262,lng:151.736727},
  {code:"BQL",n:"Boulia Airport",lat:-22.913299560546875,lng:139.89999389648438},
  {code:"PPP",n:"Proserpine Whitsunday Coast Airport",lat:-20.494416,lng:148.553583},
  {code:"ROK",n:"Rockhampton Airport",lat:-23.380019,lng:150.475359},
  {code:"BME",n:"Broome International Airport",lat:-17.949194,lng:122.2283},
  {code:"MCY",n:"Maroochydore — Sunshine Coast Airport",lat:-26.593324,lng:153.08319},
  {code:"BHS",n:"Bathurst Airport",lat:-33.406817,lng:149.651161},
  {code:"TSV",n:"Townsville Airport / RAAF Base Townsville",lat:-19.252904,lng:146.766512},
  {code:"BDB",n:"Bundaberg Airport",lat:-24.905039,lng:152.322612},
  {code:"WEI",n:"Weipa Airport",lat:-12.677493,lng:141.922618},
  {code:"WTB",n:"Toowoomba Wellcamp Airport",lat:-27.558332,lng:151.793335},
  {code:"CVQ",n:"Carnarvon Airport",lat:-24.884337,lng:113.666393},
  {code:"CAZ",n:"Cobar Airport",lat:-31.538299560546875,lng:145.79400634765625},
  {code:"CPD",n:"Coober Pedy Airport",lat:-29.038312,lng:134.722166},
  {code:"CNC",n:"Coconut Island Airport",lat:-10.050139,lng:143.070007},
  {code:"CNJ",n:"Cloncurry Airport",lat:-20.668600082399998,lng:140.503997803},
  {code:"CED",n:"Ceduna Airport",lat:-32.13059997558594,lng:133.7100067138672},
  {code:"CFS",n:"Coffs Harbour Airport",lat:-30.320601,lng:153.115997},
  {code:"CKW",n:"Christmas Creek Mine — Christmas Creek Airport",lat:-22.354302,lng:119.642603},
  {code:"CTN",n:"Cooktown Airport",lat:-15.443649,lng:145.183221},
  {code:"CMA",n:"Cunnamulla Airport",lat:-28.030000686645508,lng:145.6219940185547},
  {code:"CNB",n:"Coonamble Airport",lat:-30.980946,lng:148.377833},
  {code:"CUQ",n:"Coen Airport",lat:-13.761133,lng:143.113311},
  {code:"OOM",n:"Cooma Snowy Mountains Airport",lat:-36.300445,lng:148.972408},
  {code:"DMD",n:"Doomadgee Airport",lat:-17.9403,lng:138.822006},
  {code:"NLF",n:"Darnley Island Airport",lat:-9.579176,lng:143.780276},
  {code:"DPO",n:"Devonport Airport",lat:-41.1697006226,lng:146.429992676},
  {code:"ELC",n:"Elcho Island Airport",lat:-12.019399642899998,lng:135.570999146},
  {code:"EMD",n:"Emerald Airport",lat:-23.5674991608,lng:148.179000854},
  {code:"EPR",n:"Esperance Airport",lat:-33.684399,lng:121.822998},
  {code:"FLS",n:"Whitemark — Flinders Island Airport",lat:-40.091702,lng:147.992996},
  {code:"FIZ",n:"Fitzroy Crossing Airport",lat:-18.183596,lng:125.559783},
  {code:"GET",n:"Moonyoonooka — Geraldton Airport",lat:-28.796101,lng:114.707001},
  {code:"GLT",n:"Gladstone Airport",lat:-23.869763,lng:151.225439},
  {code:"GTE",n:"Groote Eylandt Airport",lat:-13.972405,lng:136.458553},
  {code:"GFF",n:"Griffith Airport",lat:-34.2508010864,lng:146.067001343},
  {code:"HVB",n:"Hervey Bay Airport",lat:-25.320127,lng:152.880662},
  {code:"HID",n:"Horn Island Airport",lat:-10.585636,lng:142.29277},
  {code:"HOK",n:"Lajamanu — Hooker Creek Airport",lat:-18.3367004395,lng:130.638000488},
  {code:"MHU",n:"Mount Hotham Airport",lat:-37.0475006104,lng:147.333999634},
  {code:"HGD",n:"Hughenden Airport",lat:-20.815001,lng:144.225006},
  {code:"JCK",n:"Julia Creek Airport",lat:-20.66830062866211,lng:141.72300720214844},
  {code:"KQR",n:"Karara Airport",lat:-29.217223,lng:116.687154},
  {code:"KAX",n:"Kalbarri Airport",lat:-27.692813,lng:114.259169},
  {code:"KNS",n:"King Island Airport",lat:-39.877498626708984,lng:143.8780059814453},
  {code:"KFG",n:"Kalkgurung Airport",lat:-17.431900024414062,lng:130.80799865722656},
  {code:"KRB",n:"Karumba Airport",lat:-17.45669937133789,lng:140.8300018310547},
  {code:"KWM",n:"Kowanyama Airport",lat:-15.485369,lng:141.752572},
  {code:"KGC",n:"Kingscote Airport",lat:-35.71390151977539,lng:137.52099609375},
  {code:"KUG",n:"Kubin Island Airport",lat:-10.22648,lng:142.219619},
  {code:"LNO",n:"Leonora Airport",lat:-28.87809944152832,lng:121.31500244140625},
  {code:"LEL",n:"Lake Evella Airport",lat:-12.498900413513184,lng:135.80599975585938},
  {code:"LDH",n:"Lord Howe Island Airport",lat:-31.538204,lng:159.07546},
  {code:"IRG",n:"Lockhart River Airport",lat:-12.7869,lng:143.304993},
  {code:"LSY",n:"Lismore Airport",lat:-28.830689,lng:153.258419},
  {code:"LHG",n:"Lightning Ridge Airport",lat:-29.452857,lng:147.977146},
  {code:"LRE",n:"Longreach Airport",lat:-23.43202,lng:144.277492},
  {code:"LER",n:"Leinster Airport",lat:-27.843299865722656,lng:120.7030029296875},
  {code:"LVO",n:"Laverton Airport",lat:-28.614267,lng:122.428673},
  {code:"UBB",n:"Mabuiag Island Airport",lat:-9.950168,lng:142.19523},
  {code:"MYI",n:"Murray Island Airport",lat:-9.915105,lng:144.054644},
  {code:"AVV",n:"Geelong/Melbourne — Melbourne Avalon International Airport",lat:-38.040269,lng:144.467196},
  {code:"ABX",n:"East Albury — Albury Airport",lat:-36.066758,lng:146.959148},
  {code:"MKR",n:"Meekatharra Airport",lat:-26.6117000579834,lng:118.5479965209961},
  {code:"MEB",n:"Essendon Fields — Melbourne Essendon Airport",lat:-37.7281,lng:144.901993},
  {code:"MIM",n:"Merimbula Airport",lat:-36.9085998535,lng:149.901000977},
  {code:"MGT",n:"Milingimbi Island — Milingimbi Airport",lat:-12.0944004059,lng:134.893997192},
  {code:"MNG",n:"Maningrida Airport",lat:-12.0560998917,lng:134.23399353},
  {code:"HBA",n:"Hobart (Cambridge) — Hobart International Airport",lat:-42.837032,lng:147.513022},
  {code:"MCV",n:"McArthur River Mine Airport",lat:-16.4424991608,lng:136.083999634},
  {code:"MQL",n:"Mildura Airport",lat:-34.229198455799995,lng:142.085998535},
  {code:"LST",n:"Launceston (Western Junction) — Launceston Airport",lat:-41.544935,lng:147.210785},
  {code:"MBW",n:"Melbourne Moorabbin Airport",lat:-37.977765,lng:145.099799},
  {code:"MEL",n:"Melbourne Airport",lat:-37.670732,lng:144.837898},
  {code:"MMG",n:"Mount Magnet Airport",lat:-28.116100311279297,lng:117.84200286865234},
  {code:"MRZ",n:"Moree Airport",lat:-29.498899459799997,lng:149.845001221},
  {code:"MOV",n:"Moranbah Airport",lat:-22.057800293,lng:148.07699585},
  {code:"MYA",n:"Moruya Airport",lat:-35.8978004456,lng:150.143997192},
  {code:"MGB",n:"Mount Gambier Airport",lat:-37.744382,lng:140.780561},
  {code:"ONG",n:"Mornington Island Airport",lat:-16.662500381469727,lng:139.17799377441406},
  {code:"NRA",n:"Narrandera Airport",lat:-34.7022018433,lng:146.511993408},
  {code:"NAA",n:"Narrabri Airport",lat:-30.3192005157,lng:149.82699585},
  {code:"ABM",n:"Bamaga — Northern Peninsula Airport",lat:-10.946194,lng:142.455081},
  {code:"NTN",n:"Normanton Airport",lat:-17.68409,lng:141.069664},
  {code:"ZNE",n:"Newman Airport",lat:-23.417800903299998,lng:119.803001404},
  {code:"OLP",n:"Olympic Dam Airport",lat:-30.483861,lng:136.876699},
  {code:"ADL",n:"Adelaide International Airport",lat:-34.947512,lng:138.533393},
  {code:"PUG",n:"Port Augusta Airport",lat:-32.506900787353516,lng:137.7169952392578},
  {code:"PMK",n:"Palm Island Airport",lat:-18.755301,lng:146.580994},
  {code:"PBO",n:"Paraburdoo Airport",lat:-23.1711006165,lng:117.745002747},
  {code:"CCK",n:"West Island — Cocos (Keeling) Islands Airport",lat:-12.192218,lng:96.834103},
  {code:"DRW",n:"Darwin International Airport / RAAF Darwin",lat:-12.41497,lng:130.88185},
  {code:"GOV",n:"Nhulunbuy — Gove Airport",lat:-12.269399642899998,lng:136.817993164},
  {code:"KTA",n:"Karratha Airport",lat:-20.712200164799995,lng:116.773002625},
  {code:"KGI",n:"Broadwood — Kalgoorlie Boulder Airport",lat:-30.791543,lng:121.464586},
  {code:"PKE",n:"Parkes Airport",lat:-33.131401062,lng:148.238998413},
  {code:"KNX",n:"East Kimberley Regional (Kununurra) Airport",lat:-15.7781,lng:128.707993},
  {code:"PLO",n:"Port Lincoln Airport",lat:-34.6053009033,lng:135.880004883},
  {code:"LEA",n:"Exmouth — Learmonth Airport",lat:-22.235201,lng:114.090024},
  {code:"PXH",n:"Mount Eba — Prominent Hill Airport",lat:-29.716,lng:135.5244},
  {code:"EDR",n:"Pormpuraaw Airport",lat:-14.896451,lng:141.60908},
  {code:"PQQ",n:"Port Macquarie Airport",lat:-31.4358005524,lng:152.863006592},
  {code:"PTJ",n:"Portland Airport",lat:-38.31809997558594,lng:141.4709930419922},
  {code:"PHE",n:"Port Hedland International Airport",lat:-20.382787,lng:118.629789},
  {code:"PER",n:"Perth International Airport",lat:-31.94029998779297,lng:115.96700286865234},
  {code:"XCH",n:"Flying Fish Cove — Christmas Island International Airport",lat:-10.450387,lng:105.6911},
  {code:"ULP",n:"Quilpie Airport",lat:-26.609176,lng:144.253746},
  {code:"RCM",n:"Richmond Airport",lat:-20.701900482177734,lng:143.11500549316406},
  {code:"RAM",n:"Ramingining Airport",lat:-12.356399536132812,lng:134.8979949951172},
  {code:"RMA",n:"Roma Airport",lat:-26.545000076300003,lng:148.774993896},
  {code:"CBR",n:"Canberra Airport",lat:-35.3069,lng:149.195007},
  {code:"DBO",n:"Dubbo City Regional Airport",lat:-32.2167015076,lng:148.574996948},
  {code:"SGO",n:"St George Airport",lat:-28.049699783325195,lng:148.59500122070312},
  {code:"MJK",n:"Denham — Shark Bay Airport",lat:-25.897294,lng:113.575802},
  {code:"SBR",n:"Saibai Island Airport",lat:-9.37833,lng:142.625},
  {code:"SNB",n:"Milikapiti — Snake Bay Airport",lat:-11.417674,lng:130.648481},
  {code:"NLK",n:"Burnt Pine — Norfolk Island International Airport",lat:-29.041759,lng:167.939474},
  {code:"SYD",n:"Sydney (Mascot) — Sydney Kingsford Smith International Airport",lat:-33.946098,lng:151.177002},
  {code:"TMW",n:"Tamworth Airport",lat:-31.077898,lng:150.845484},
  {code:"WGA",n:"Forest Hill — Wagga Wagga Airport",lat:-35.163484,lng:147.46832},
  {code:"XTG",n:"Thargomindah Airport",lat:-27.986368,lng:143.812065},
  {code:"THG",n:"Biloela — Thangool Airport",lat:-24.494863,lng:150.577967},
  {code:"TCA",n:"Tennant Creek Airport",lat:-19.6343994140625,lng:134.18299865722656},
  {code:"SYU",n:"Sue Islet — Warraber Island Airport",lat:-10.20829963684082,lng:142.8249969482422},
  {code:"WNR",n:"Windorah Airport",lat:-25.410641,lng:142.668428},
  {code:"WYA",n:"Whyalla Airport",lat:-33.05889892578125,lng:137.51400756835938},
  {code:"WGE",n:"Walgett Airport",lat:-30.032801,lng:148.126007},
  {code:"NTL",n:"Williamtown — Newcastle Airport",lat:-32.796114,lng:151.835025},
  {code:"WUN",n:"Wiluna Airport",lat:-26.632691,lng:120.221906},
  {code:"WIN",n:"Winton Airport",lat:-22.36359977722168,lng:143.08599853515625},
  {code:"BWT",n:"Burnie — Wynyard Airport",lat:-40.997039,lng:145.726},
  {code:"OKR",n:"Yorke Island Airport",lat:-9.752801,lng:143.405673},
  {code:"XMY",n:"Yam Island Airport",lat:-9.899187,lng:142.774265},
  {code:"KKI",n:"Akiachak Airport",lat:60.913809,lng:-161.493329},
  {code:"KBC",n:"Birch Creek Airport",lat:66.2740020752,lng:-145.824005127},
  {code:"CDE",n:"Chengde Puning Airport",lat:41.1225,lng:118.073889},
  {code:"CIF",n:"Chifeng Yulong Airport",lat:42.159723,lng:118.840971},
  {code:"CIH",n:"Changzhi Wangcun Airport",lat:36.247501,lng:113.125999},
  {code:"BPE",n:"Qinhuangdao (Changli) — Qinhuangdao Beidaihe Airport",lat:39.666384,lng:119.061384},
  {code:"DSN",n:"Ordos Ejin Horo International Airport",lat:39.493514,lng:109.8599},
  {code:"DAT",n:"Datong Yungang International Airport",lat:40.06139,lng:113.480509},
  {code:"ERL",n:"Erenhot Saiwusu International Airport",lat:43.424079,lng:112.091081},
  {code:"YIE",n:"Arxan Yi'ershi Airport",lat:47.3106,lng:119.9117},
  {code:"HDG",n:"Handan Airport",lat:36.524824,lng:114.424126},
  {code:"HUO",n:"Holingol Huolinhe Airport",lat:45.487222,lng:119.407222},
  {code:"HLD",n:"Hulunbuir Hailar Airport",lat:49.208616,lng:119.822301},
  {code:"LFQ",n:"Linfen (Yaodu) — Linfen Yaodu Airport",lat:36.132629,lng:111.641236},
  {code:"LLV",n:"Lüliang Dawu Airport",lat:37.683333,lng:111.142778},
  {code:"NZH",n:"Manzhouli Xijiao Airport",lat:49.566667,lng:117.33},
  {code:"BAV",n:"Baotou Donghe International Airport",lat:40.560001,lng:109.997002},
  {code:"SZH",n:"Shuozhou Zirun Airport",lat:39.273241,lng:112.691552},
  {code:"SJW",n:"Shijiazhuang Zhengding International Airport",lat:38.280701,lng:114.696999},
  {code:"TVS",n:"Tangshan (Fengrun) — Tangshan Sannühe Airport",lat:39.7178,lng:118.002625},
  {code:"TGO",n:"Tongliao Airport",lat:43.556702,lng:122.199997},
  {code:"UCB",n:"Ulanqab Jining Airport",lat:41.130266,lng:113.107274},
  {code:"WUA",n:"Wuhai Airport",lat:39.7934,lng:106.7993},
  {code:"HLH",n:"Ulanhot Yilelite Airport",lat:46.195333,lng:122.008333},
  {code:"XIL",n:"Xilinhot Airport",lat:43.91559982299805,lng:115.96399688720703},
  {code:"WUT",n:"Xinzhou Wutaishan Airport",lat:38.597456,lng:112.969173},
  {code:"YCU",n:"Yuncheng (Yanhu) — Yuncheng Yanhu International Airport",lat:35.117823,lng:111.034023},
  {code:"TYN",n:"Taiyuan Wusu International Airport",lat:37.746899,lng:112.627998},
  {code:"RLK",n:"Bayannur Tianjitai Airport",lat:40.926358,lng:107.74093},
  {code:"ZQZ",n:"Zhangjiakou Ningyuan Airport",lat:40.738664,lng:114.933395},
  {code:"NZL",n:"Zhalantun Genghis Khan Airport",lat:47.865942,lng:122.768662},
  {code:"BHY",n:"Beihai Fucheng Airport",lat:21.538659,lng:109.293683},
  {code:"AEB",n:"Baise (Tianyang) — Baise (Bose) Bama Airport",lat:23.7206,lng:106.959999},
  {code:"CGD",n:"Changde (Dingcheng) — Changde Taohuayuan Airport",lat:28.9189,lng:111.639999},
  {code:"HJJ",n:"Huaihua Zhijiang Airport",lat:27.443087,lng:109.704666},
  {code:"HCZ",n:"Chenzhou Beihu Airport",lat:25.753419,lng:112.845404},
  {code:"DYG",n:"Zhangjiajie (Yongding) — Zhangjiajie Hehua International Airport",lat:29.104749,lng:110.442786},
  {code:"FUO",n:"Foshan (Nanhai) — Foshan Shadi Airport",lat:23.0825,lng:113.070833},
  {code:"HCJ",n:"Hechi (Jinchengjiang) — Hechi Jinchengjiang Airport",lat:24.804344,lng:107.710819},
  {code:"HNY",n:"Hengyang Nanyue Airport",lat:26.72208,lng:112.617958},
  {code:"HUZ",n:"Huizhou (Pingtan) — Huizhou Pingtan Airport",lat:23.049999,lng:114.599998},
  {code:"LLF",n:"Yongzhou Lingling Airport",lat:26.338661,lng:111.610043},
  {code:"MXZ",n:"Meizhou (Meixian) — Meizhou Meixian Changgangji International Airport",lat:24.263425,lng:116.097857},
  {code:"SWA",n:"Jieyang (Rongcheng) — Jieyang Chaoshan International Airport",lat:23.552,lng:116.5033},
  {code:"ZUH",n:"Zhuhai (Jinwan) — Zhuhai Jinwan Airport",lat:22.006399,lng:113.375999},
  {code:"WGN",n:"Shaoyang (Wugang) — Shaoyang Wugang Airport",lat:26.806123,lng:110.641042},
  {code:"WUZ",n:"Tangbu — Wuzhou Xijiang Airport",lat:23.40316,lng:111.09331},
  {code:"DXJ",n:"Xiangxi Biancheng Airport",lat:28.4972,lng:109.5218},
  {code:"YLX",n:"Yulin Fumian Airport",lat:22.433042,lng:110.119996},
  {code:"YYA",n:"Yueyang (Yueyanglou) — Yueyang Sanhe Airport",lat:29.311699,lng:113.281574},
  {code:"LZH",n:"Liuzhou (Liujiang) — Liuzhou Bailian Airport / Bailian Air Base",lat:24.2075,lng:109.390999},
  {code:"ZHA",n:"Zhanjiang Wuchuan International Airport",lat:21.481667,lng:110.590278},
  {code:"EHU",n:"Ezhou Huahu International Airport",lat:30.341178,lng:115.03926},
  {code:"ENH",n:"Enshi (Enshi) — Enshi Xujiaping Airport",lat:30.320299,lng:109.485001},
  {code:"SHS",n:"Jingzhou (Shashi) — Jingzhou Shashi Airport",lat:30.29281,lng:112.44854},
  {code:"LYA",n:"Luoyang (Laocheng) — Luoyang Beijiao Airport",lat:34.7411,lng:112.388},
  {code:"NNY",n:"Nanyang (Wancheng) — Nanyang Jiangying Airport",lat:32.982696,lng:112.617467},
  {code:"HQQ",n:"Anyang Hongqiqu Airport",lat:35.870833,lng:114.461944},
  {code:"HPG",n:"Shennongjia (Hongping) — Shennongjia Hongping Airport",lat:31.626,lng:110.34},
  {code:"WDS",n:"Shiyan (Maojian) — Shiyan Wudangshan Airport",lat:32.592889,lng:110.906296},
  {code:"XFN",n:"Xiangyang (Xiangzhou) — Xiangyang Liuji Airport",lat:32.152222,lng:112.291666},
  {code:"XAI",n:"Xinyang Minggang Airport",lat:32.540819,lng:114.079141},
  {code:"YIH",n:"Yichang (Xiaoting) — Yichang Sanxia Airport",lat:30.554132,lng:111.482563},
  {code:"BAR",n:"Qionghai (Basuo) — Qionghai Bo'ao Airport",lat:19.140951,lng:110.452766},
  {code:"RGO",n:"Hoemun-ri — Orang (Chongjin) Airport",lat:41.428538,lng:129.647555},
  {code:"FNJ",n:"Pyongyang Sunan International Airport",lat:39.224098,lng:125.669998},
  {code:"DSO",n:"Sŏndŏng-ni — Sondok Airport",lat:39.745201,lng:127.473999},
  {code:"WOS",n:"Wonsan Kalma Airport",lat:39.165219,lng:127.487931},
  {code:"AKA",n:"Ankang (Hanbin) — Ankang Fuqiang Airport",lat:32.75696,lng:108.87338},
  {code:"DNH",n:"Dunhuang Mogao International Airport",lat:40.161953,lng:94.812827},
  {code:"HXD",n:"Haixi Delingha Airport",lat:37.125286,lng:97.268658},
  {code:"GMQ",n:"Golog (Maqên) — Golog Maqên Airport",lat:34.418066,lng:100.301144},
  {code:"GOQ",n:"Golmud Airport",lat:36.4006,lng:94.786102},
  {code:"GYU",n:"Guyuan (Yuanzhou) — Guyuan Liupanshan Airport",lat:36.078889,lng:106.216944},
  {code:"HBQ",n:"Haibei (Qilian) — Haibei Qilian Airport",lat:38.008068,lng:100.645065},
  {code:"HTT",n:"Mengnai — Huatugou Airport",lat:38.201645,lng:90.837843},
  {code:"HZG",n:"Hanzhong (Chenggu) — Hanzhong Chenggu Airport",lat:33.133527,lng:107.203817},
  {code:"JIC",n:"Jinchang Jinchuan Airport",lat:38.542222,lng:102.348333},
  {code:"JGN",n:"Jiayuguan International Airport",lat:39.859052,lng:98.339344},
  {code:"LNL",n:"Longnan (Cheng) — Longnan Chengzhou Airport",lat:33.789918,lng:105.790014},
  {code:"IQN",n:"Qingyang (Xifeng) — Qingyang Xifeng Airport",lat:35.802638,lng:107.598896},
  {code:"THQ",n:"Tianshui (Maiji) — Tianshui Maijishan Airport",lat:34.5601,lng:105.860343},
  {code:"GXH",n:"Gannan (Xiahe) — Gannan Xiahe Airport",lat:34.819014,lng:102.622261},
  {code:"XNN",n:"Haidong (Huzhu Tu Autonomous County) — Xining Caojiabao International Airport",lat:36.52775,lng:102.040215},
  {code:"ENY",n:"Yan'an (Baota) — Yan'an Nanniwan Airport",lat:36.479413,lng:109.464083},
  {code:"UYN",n:"Yulin Yuyang Airport",lat:38.35971,lng:109.590927},
  {code:"YUS",n:"Yushu (Batang) — Yushu Batang Airport",lat:32.836389,lng:97.036389},
  {code:"ZHY",n:"Zhongwei (Shapotou) — Zhongwei Shapotou Airport",lat:37.573125,lng:105.154454},
  {code:"YZY",n:"Zhangye (Ganzhou) — Zhangye Ganzhou Airport",lat:38.801899,lng:100.675003},
  {code:"AVK",n:"Arvaikheer Airport",lat:46.250301361083984,lng:102.802001953125},
  {code:"LTI",n:"Altai Airport",lat:46.376399993896484,lng:96.22109985351562},
  {code:"BYN",n:"Bayankhongor Airport",lat:46.1633,lng:100.704002},
  {code:"UGA",n:"Bulgan Airport",lat:48.85499954223633,lng:103.47599792480469},
  {code:"COQ",n:"Choibalsan Airport",lat:48.135381,lng:114.647231},
  {code:"UBN",n:"Ulaanbaatar (Sergelen) — Ulaanbaatar Chinggis Khaan International Airport",lat:47.646916,lng:106.819833},
  {code:"ULZ",n:"Uliastai — Donoi Airport",lat:47.7093,lng:96.5258},
  {code:"DLZ",n:"Dalanzadgad Airport",lat:43.608628,lng:104.367734},
  {code:"HVD",n:"Khovd Airport",lat:47.954102,lng:91.628197},
  {code:"MXW",n:"Mandalgobi Airport",lat:45.7380981445,lng:106.268997192},
  {code:"MXV",n:"Mörön Airport",lat:49.663677,lng:100.100028},
  {code:"ULO",n:"Ulaangom Airport",lat:50.066588,lng:91.938273},
  {code:"ULG",n:"Ölgii Mongolei International Airport",lat:48.993301,lng:89.922501},
  {code:"BSD",n:"Baoshan (Longyang) — Baoshan Yunrui Airport",lat:25.053301,lng:99.168297},
  {code:"CWJ",n:"Lincang (Cangyuan) — Cangyuan Washan Airport",lat:23.276331,lng:99.373169},
  {code:"DLU",n:"Dali (Xiaguan) — Dali Fengyi Airport",lat:25.649401,lng:100.319},
  {code:"DIG",n:"Diqing (Shangri-La) — Diqing Shangri-La Airport",lat:27.7936,lng:99.6772},
  {code:"JHG",n:"Jinghong (Gasa) — Xishuangbanna Gasa International Airport",lat:21.974648,lng:100.762224},
  {code:"JMJ",n:"Pu'er (Lancang) — Lancang Jingmai Airport",lat:22.417733,lng:99.784012},
  {code:"LNJ",n:"Lincang Boshang Airport",lat:23.7381,lng:100.025002},
  {code:"LJG",n:"Lijiang Sanyi International Airport",lat:26.677483,lng:100.244944},
  {code:"LUM",n:"Dehong (Mangshi) — Dehong Mangshi International Airport",lat:24.4011,lng:98.5317},
  {code:"SYM",n:"Pu'er Simao Airport",lat:22.793301,lng:100.959},
  {code:"WNH",n:"Wenshan Puzhehei Airport",lat:23.5583,lng:104.3255},
  {code:"AQG",n:"Anqing Tianzhushan Airport / Anqing North Air Base",lat:30.582199,lng:117.050003},
  {code:"CZX",n:"Changzhou Benniu International Airport",lat:31.920485,lng:119.77546},
  {code:"KHN",n:"Nanchang Changbei International Airport",lat:28.864815,lng:115.90271},
  {code:"DOY",n:"Dongying (Kenli) — Dongying Shengli Airport",lat:37.50137,lng:118.789863},
  {code:"FUG",n:"Yingzhou, Fuyang — Fuyang Xiguan Airport",lat:32.882157,lng:115.734364},
  {code:"KOW",n:"Ganzhou Huangjin Airport",lat:25.853333,lng:114.778889},
  {code:"HZA",n:"Heze (Dingtao) — Heze Mudan Airport",lat:35.212972,lng:115.736748},
  {code:"JDZ",n:"Jingdezhen Luojia Airport",lat:29.3386,lng:117.176003},
  {code:"JNG",n:"Jining Da'an Airport",lat:35.647358,lng:116.743269},
  {code:"JIU",n:"Jiujiang Lushan Airport",lat:29.476944,lng:115.801111},
  {code:"JUZ",n:"Quzhou (Kezheng) — Quzhou Airport",lat:28.96613,lng:118.898793},
  {code:"LYG",n:"Lianyungang Huaguoshan International Airport",lat:34.41406,lng:119.17899},
  {code:"LCX",n:"Longyan (Liancheng) — Liancheng Guanzhishan Airport",lat:25.67592,lng:116.745907},
  {code:"HYN",n:"Taizhou (Luqiao) — Taizhou Luqiao Airport",lat:28.562201,lng:121.429001},
  {code:"LYI",n:"Linyi (Hedong) — Linyi Qiyang Airport",lat:35.052918,lng:118.411828},
  {code:"NTG",n:"Nantong (Tongzhou) — Nantong Xingdong International Airport",lat:32.073566,lng:120.980076},
  {code:"JJN",n:"Quanzhou Jinjiang International Airport",lat:24.795855,lng:118.588599},
  {code:"RIZ",n:"Rizhao (Donggang) — Rizhao Shanzihe Airport",lat:35.405033,lng:119.324403},
  {code:"HIA",n:"Huai'an Lianshui Airport",lat:33.792712,lng:119.126657},
  {code:"SQJ",n:"Sanming (Sha) — Sanming Shaxian Airport",lat:26.4263,lng:117.8336},
  {code:"SQD",n:"Shangrao (Hengfeng) — Shangrao Sanqingshan Airport",lat:28.3797,lng:117.9643},
  {code:"TXN",n:"Huangshan Tunxi International Airport",lat:29.733299,lng:118.255997},
  {code:"WHA",n:"Wuhu Xuanzhou Airport",lat:31.1045,lng:118.66687},
  {code:"WEF",n:"Weifang (Kuiwen) — Weifang Nanyuan Airport",lat:36.646702,lng:119.119003},
  {code:"WEH",n:"Weihai Dashuibo Airport",lat:37.187099,lng:122.228996},
  {code:"WUX",n:"Wuxi — Sunan Shuofang International Airport",lat:31.496952,lng:120.43038},
  {code:"WUS",n:"Nanping Wuyishan Airport",lat:27.7019,lng:118.000999},
  {code:"XUZ",n:"Xuzhou Guanyin International Airport",lat:34.059056,lng:117.555278},
  {code:"YTY",n:"Yangzhou Taizhou Airport",lat:32.5634,lng:119.7198},
  {code:"YIC",n:"Yichun Mingyueshan Airport",lat:27.8025,lng:114.3062},
  {code:"YNZ",n:"Yancheng (Tinghu) — Yancheng Nanyang International Airport",lat:33.428317,lng:120.20545},
  {code:"YNT",n:"Yantai Penglai International Airport",lat:37.659724,lng:120.978124},
  {code:"YIW",n:"Yiwu/Jinhua — Yiwu Airport",lat:29.342095,lng:120.03116},
  {code:"HSN",n:"Zhoushan Putuoshan International Airport",lat:29.933874,lng:122.362307},
  {code:"NGQ",n:"Shiquanhe — Ngari Gunsa Airport",lat:32.09794,lng:80.053971},
  {code:"AVA",n:"Anshun (Xixiu) — Anshun Huangguoshu Airport",lat:26.260556,lng:105.873333},
  {code:"BPX",n:"Qamdo Bangda Airport",lat:30.553600311279297,lng:97.1082992553711},
  {code:"BFJ",n:"Bijie Feixiong Airport",lat:27.267066,lng:105.472097},
  {code:"DZH",n:"Dazhou (Dachuan) — Dazhou Jinya Airport",lat:31.048815,lng:107.435646},
  {code:"DCY",n:"Garzê (Daocheng) — Daocheng Yading Airport",lat:29.31632,lng:100.060317},
  {code:"DAX",n:"Dazhou (Daxian) — Dachuan Airport",lat:31.1302,lng:107.4295},
  {code:"GYS",n:"Guangyuan (Lizhou) — Guangyuan Panlong Airport",lat:32.390254,lng:105.694571},
  {code:"GZG",n:"Garzê (Garzê) — Garze Gesar Airport",lat:31.7575,lng:99.554167},
  {code:"JZH",n:"Ngawa (Songpan) — Jiuzhai Huanglong Airport",lat:32.853333,lng:103.682222},
  {code:"KGT",n:"Garzê (Kangding) — Kangding Airport",lat:30.142464,lng:101.73872},
  {code:"KJH",n:"Kaili  (Huangping) — Kaili Huangping Airport",lat:26.972,lng:107.988},
  {code:"LLB",n:"Qiannan (Libo) — Libo Airport",lat:25.4525,lng:107.961667},
  {code:"LXA",n:"Shannan (Gonggar) — Lhasa Gonggar International Airport",lat:29.298001,lng:90.911951},
  {code:"LZO",n:"Luzhou (Yunlong) — Luzhou Yunlong Airport",lat:29.030357,lng:105.468407},
  {code:"WMT",n:"Zunyi Maotai Airport",lat:27.961837,lng:106.435416},
  {code:"MIG",n:"Mianyang (Fucheng) — Mianyang Nanjiao Airport",lat:31.428101,lng:104.740997},
  {code:"NAO",n:"Nanchong (Gaoping) — Nanchong Gaoping Airport",lat:30.798104,lng:106.16415},
  {code:"HZH",n:"Liping Airport",lat:26.32217,lng:109.1499},
  {code:"LZY",n:"Nyingchi (Mainling) — Nyingchi Mainling Airport",lat:29.303301,lng:94.335297},
  {code:"LPF",n:"Liupanshui (Zhongshan) — Liupanshui Yuezhao Airport",lat:26.609417,lng:104.979},
  {code:"JIQ",n:"Qianjiang Wulingshan Airport",lat:29.5133333333,lng:108.831111111},
  {code:"RKZ",n:"Xigazê (Samzhubzê) — Xigaze Peace Airport / Shigatse Air Base",lat:29.350876,lng:89.299157},
  {code:"LGZ",n:"Shannan Longzi Airport",lat:28.422422,lng:92.348082},
  {code:"TCZ",n:"Baoshan (Tengchong) — Tengchong Tuofeng Airport",lat:24.938056,lng:98.485833},
  {code:"TEN",n:"Tongren (Daxing) — Tongren Fenghuang Airport",lat:27.883333,lng:109.308889},
  {code:"CQW",n:"Wulong — Chongqing Xiannüshan Airport",lat:29.465658,lng:107.693664},
  {code:"WSK",n:"Chongqing Wushan Airport",lat:31.06896,lng:109.708958},
  {code:"WXN",n:"Wanzhou Wuqiao Airport",lat:30.8017,lng:108.433},
  {code:"XIC",n:"Liangshan (Xichang) — Xichang Qingshan Airport",lat:27.9891,lng:102.183998},
  {code:"YBP",n:"Yibin (Cuiping) — Yibin Wuliangye Airport",lat:28.858431,lng:104.526157},
  {code:"ACX",n:"Xingyi Wanfenglin Airport",lat:25.083423,lng:104.960804},
  {code:"PZI",n:"Panzhihua (Renhe) — Panzhihua Bao'anying Airport",lat:26.54,lng:101.79852},
  {code:"ZYI",n:"Zunyi Xinzhou Airport",lat:27.810723,lng:107.247189},
  {code:"AKU",n:"Aksu (Onsu) — Aksu Hongqipo Airport",lat:41.262501,lng:80.291702},
  {code:"ACF",n:"Aral Tarim Airport",lat:40.434748,lng:81.26206},
  {code:"AAT",n:"Altay Xuedu Airport",lat:47.749886,lng:88.085808},
  {code:"BPL",n:"Bole Alashankou Airport",lat:44.895461,lng:82.30007},
  {code:"IQM",n:"Qiemo Yudu Airport",lat:38.234516,lng:85.465462},
  {code:"FYN",n:"Fuyun Koktokay Airport",lat:46.804169,lng:89.512006},
  {code:"HMI",n:"Hami Airport",lat:42.8414,lng:93.669197},
  {code:"SHF",n:"Shihezi Huayuan Airport",lat:44.2421,lng:85.8905},
  {code:"KCA",n:"Kuqa Qiuci Airport",lat:41.677856,lng:82.872917},
  {code:"KRL",n:"Korla Licheng Airport",lat:41.614979,lng:86.140817},
  {code:"KRY",n:"Karamay Airport",lat:45.46655,lng:84.9527},
  {code:"KJI",n:"Burqin Kanas Airport",lat:48.2223,lng:86.9959},
  {code:"NLT",n:"Xinyuan Nalati Airport",lat:43.4318,lng:83.3786},
  {code:"RQA",n:"Ruoqiang Town — Ruoqiang Loulan Airport",lat:38.974722,lng:88.008333},
  {code:"QSZ",n:"Shache Airport",lat:38.24542,lng:77.056149},
  {code:"KHG",n:"Kashgar Laining International Airport",lat:39.542273,lng:76.02023},
  {code:"TCG",n:"Tacheng Qianquan Airport",lat:46.672501,lng:83.340797},
  {code:"TLQ",n:"Turpan Jiaohe Airport",lat:43.0308,lng:89.0987},
  {code:"HTN",n:"Hotan Airport",lat:37.03850173950195,lng:79.86489868164062},
  {code:"YIN",n:"Ili (Yining / Ghulja) — Ili Yining International Airport",lat:43.955799,lng:81.330299},
  {code:"YTW",n:"Hotan (Yutian) — Yutian Wanfang Airport",lat:36.8085,lng:81.7827},
  {code:"AOG",n:"Anshan Teng'ao Airport / Anshan Air Base",lat:41.105301,lng:122.853996},
  {code:"DBC",n:"Baicheng Chang'an Airport",lat:45.505278,lng:123.019722},
  {code:"NBS",n:"Changbaishan Airport",lat:42.066944,lng:127.602222},
  {code:"CNI",n:"Dalian (Changhai) — Changhai Dachangshandao Airport",lat:39.266441,lng:122.66696},
  {code:"CHG",n:"Shuangta, Chaoyang — Chaoyang Airport",lat:41.538101,lng:120.434998},
  {code:"DDG",n:"Dandong (Zhenxing) — Dandong Langtou International Airport",lat:40.025453,lng:124.28669},
  {code:"DQA",n:"Daqing Sartu Airport",lat:46.750883,lng:125.138642},
  {code:"DTU",n:"Heihe — Wudalianchi Dedu Airport",lat:48.441037,lng:126.128374},
  {code:"FYJ",n:"Fuyuan Dongji Airport",lat:48.197219,lng:134.36298},
  {code:"HEK",n:"Heihe Aihui Airport",lat:50.171621,lng:127.308884},
  {code:"JGD",n:"Jiagedaqi — Daxing'anling Elunchun Airport",lat:50.371389,lng:124.1175},
  {code:"JMU",n:"Jiamusi Songjiang International Airport",lat:46.842793,lng:130.46426},
  {code:"JSJ",n:"Jiansanjiang Shidi Airport",lat:47.108248,lng:132.65792},
  {code:"JXA",n:"Jixi Xingkaihu Airport",lat:45.293,lng:131.193},
  {code:"JNZ",n:"Jinzhou (Linghai) — Jinzhou Bay Airport",lat:40.936032,lng:121.277114},
  {code:"LDS",n:"Yichun Lindu Airport",lat:47.752056,lng:129.019125},
  {code:"MDG",n:"Mudanjiang Hailang International Airport",lat:44.525172,lng:129.568634},
  {code:"OHE",n:"Mohe Gulian Airport",lat:52.916871,lng:122.422759},
  {code:"NDG",n:"Qiqihar Sanjiazi Airport",lat:47.229969,lng:123.914179},
  {code:"YSQ",n:"Qian Gorlos Mongol Autonomous County — Songyuan Chaganhu Airport",lat:44.931143,lng:124.552121},
  {code:"TNH",n:"Tonghua Sanyuanpu Airport",lat:42.048435,lng:125.733963},
  {code:"YNJ",n:"Yanji Chaoyangchuan Airport",lat:42.8828010559,lng:129.451004028},
  {code:"YKH",n:"Yingkou (Laobian) — Yingkou Lanqi Airport",lat:40.542524,lng:122.3586}
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
    var err=document.getElementById("file-login-err");
    if(err) err.textContent="";
    var legal=document.getElementById("file-login-legal");
    if(legal && !legal.checked){
      if(err) err.textContent="Нужно принять соглашение и политику";
      return;
    }
    try{ localStorage.setItem("travelek-legal","1"); }catch(e2){}
    var ret=window.__localLogin && window.__localLogin(document.getElementById("file-login-name").value, document.getElementById("file-login-pass").value);
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
  n=n||96;
  var rad=Math.PI/180, toDeg=180/Math.PI;
  function vec(lat,lng){
    lat*=rad; lng*=rad;
    return [Math.cos(lat)*Math.cos(lng),Math.cos(lat)*Math.sin(lng),Math.sin(lat)];
  }
  var u=vec(a.lat,a.lng), v=vec(b.lat,b.lng);
  var dot=Math.max(-1,Math.min(1,u[0]*v[0]+u[1]*v[1]+u[2]*v[2]));
  var omega=Math.acos(dot), sinOmega=Math.sin(omega);
  if(omega<1e-5) return [[a.lat,a.lng],[b.lat,b.lng]];
  var out=[], prevLng=a.lng, i,t,x,y,z,lat,lng,p,q;
  for(i=0;i<=n;i++){
    t=i/n;
    if(Math.abs(sinOmega)<1e-7){ p=1-t; q=t; }
    else { p=Math.sin((1-t)*omega)/sinOmega; q=Math.sin(t*omega)/sinOmega; }
    x=p*u[0]+q*v[0]; y=p*u[1]+q*v[1]; z=p*u[2]+q*v[2];
    lat=Math.atan2(z,Math.sqrt(x*x+y*y))*toDeg;
    lng=Math.atan2(y,x)*toDeg;
    while(lng-prevLng>180) lng-=360;
    while(lng-prevLng<-180) lng+=360;
    out.push([lat,lng]); prevLng=lng;
  }
  out[0]=[a.lat,a.lng]; out[out.length-1]=[b.lat,b.lng];
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
/* Dedicated top pane: route lines must never sit beneath country/night polygons. */
var routePane=map.getPane("routePane")||map.createPane("routePane");
routePane.style.zIndex="680";
routePane.style.pointerEvents="none";
try{ window.__travelekMap=map; }catch(e){}
var baseLayer=null, worldLayer=null;
function mapPalette(){
  var theme=document.documentElement.getAttribute("data-theme")||"dark";
  if(theme==="light") return {land:"#f4f1ea", edge:"#d5dee8", line:"#b7c3cf", ru:"#e7efe6"};
  return {land:"#1a2c3d", edge:"#24384c", line:"#8fb4ce", ru:"#203448"};
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
  if(!poly||!poly.length) return;
  /* The first ring is the outer border; subsequent rings are holes. */
  var latlngs=poly.map(function(ring){
    if(!ring||ring.length<3) return [];
    var points=keepRaw ? ring : smoothRing(ring);
    return points.map(function(pt){ return [pt[1],pt[0]]; });
  }).filter(function(ring){ return ring.length>=3; });
  if(!latlngs.length) return;
  L.polygon(latlngs, style).addTo(group);
}
function drawWorld(){
  if(typeof map==="undefined" || !map || typeof L==="undefined") return;
  if(!worldLayer) worldLayer=L.layerGroup().addTo(map);
  worldLayer.clearLayers();
  if(typeof COUNTRY_LIST==="undefined" || !COUNTRY_LIST) return;
  var pal=mapPalette();
  var style={color:pal.line, weight:0.7, opacity:.9, lineJoin:"round", lineCap:"round", fillColor:pal.land, fillOpacity:1, interactive:false, smoothFactor:0};
  var ruStyle={color:pal.line, weight:0.85, opacity:1, lineJoin:"round", lineCap:"round", fillColor:pal.ru, fillOpacity:1, interactive:false, smoothFactor:0};
  var cnStyle={color:pal.line, weight:0.8, opacity:1, lineJoin:"round", lineCap:"round", fillColor:pal.land, fillOpacity:1, interactive:false, smoothFactor:0};
  var cover={HK:1,MO:1,AB:1,OS:1};
  /* Толстая обводка цветом заливки закрывает щели между соседними странами. */
  var landUnderlay={color:pal.land, weight:1.15, opacity:1, lineJoin:"round", lineCap:"round", fillColor:pal.land, fillOpacity:1, interactive:false, smoothFactor:0};
  var ruUnderlay={color:pal.ru, weight:1.15, opacity:1, lineJoin:"round", lineCap:"round", fillColor:pal.ru, fillOpacity:1, interactive:false, smoothFactor:0};
  COUNTRY_LIST.forEach(function(c){
    if(c.i==="RU" || typeof polysOf!=="function") return;
    polysOf(c).forEach(function(poly){ paintOn(worldLayer, poly, landUnderlay, true); });
  });
  var ruCountry=COUNTRY_LIST.find(function(c){ return c.i==="RU"; });
  if(ruCountry && typeof polysOf==="function"){
    polysOf(ruCountry).forEach(function(poly){ paintOn(worldLayer, poly, ruUnderlay, true); });
  }
  COUNTRY_LIST.forEach(function(c){
    if(c.i==="RU" || c.i==="CN" || cover[c.i]) return;
    if(typeof polysOf!=="function") return;
    polysOf(c).forEach(function(poly){ paintOn(worldLayer, poly, style, true); });
  });
  /* Силуэт страны под регионами закрывает щели между субъектами. */
  var ruBaseStyle={color:pal.ru, weight:0, opacity:0, fillColor:pal.ru, fillOpacity:1, interactive:false, smoothFactor:0};
  if(ruCountry && typeof polysOf==="function"){
    polysOf(ruCountry).forEach(function(poly){ paintOn(worldLayer, poly, ruBaseStyle, true); });
  }
  var regs=(typeof RUSSIA_REGIONS!=="undefined" && RUSSIA_REGIONS) ? RUSSIA_REGIONS : [];
  regs.forEach(function(reg){
    polysOf(reg).forEach(function(poly){ paintOn(worldLayer, poly, ruStyle, true); });
  });
  var cnBase={color:pal.land, weight:0, opacity:0, fillColor:pal.land, fillOpacity:1, interactive:false, smoothFactor:0};
  var cnCountry=COUNTRY_LIST.find(function(c){ return c.i==="CN"; });
  if(cnCountry && typeof polysOf==="function"){
    polysOf(cnCountry).forEach(function(poly){ paintOn(worldLayer, poly, cnBase, true); });
  }
  var cnRegs=(typeof CHINA_REGIONS!=="undefined" && CHINA_REGIONS) ? CHINA_REGIONS : [];
  cnRegs.forEach(function(reg){
    polysOf(reg).forEach(function(poly){ paintOn(worldLayer, poly, cnStyle, true); });
  });
  ["HK","MO","AB","OS"].forEach(function(id){
    var cap=COUNTRY_LIST.find(function(c){ return c.i===id; });
    if(!cap || typeof polysOf!=="function") return;
    polysOf(cap).forEach(function(poly){ paintOn(worldLayer, poly, style, true); });
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
    nightOn=true;
    if(typeof p.globe==="boolean") globeOn=p.globe;
  }catch(e){}
  nightOn=true;
}
function saveMapPrefs(){
  nightOn=true;
  try{localStorage.setItem("travelek-mapprefs",JSON.stringify({night:true,globe:globeOn}));}catch(e){}
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
      if(c.i==="RU" || c.i==="CN") return;
      var polys=polysOf(c);
      if(!polys.length) return;
      feats.push({type:"Feature", properties:{i:c.i}, geometry:{type:"MultiPolygon", coordinates:polys}});
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
  function fillShape(geom, color){
    ctx.fillStyle=color;
    try{
      ctx.beginPath();
      path(geom);
      ctx.fill();
    }catch(err){}
  }
  var feats=globeFeatures();
  var seen={};
  if(typeof visited!=="undefined") visited.forEach(function(id){ seen[id]=1; });
  feats.forEach(function(f){
    if(!seen[f.properties.i]) fillShape(f, "#1e3b32");
  });
  function fillRegs(list, color, only){
    if(!list) return;
    list.forEach(function(reg){
      if(only && !only[reg.id]) return;
      polysOf(reg).forEach(function(poly){
        fillShape({type:"Feature", geometry:{type:"Polygon", coordinates:poly}}, color);
      });
    });
  }
  fillRegs(typeof RUSSIA_REGIONS!=="undefined"?RUSSIA_REGIONS:null, "#1e3b32");
  fillRegs(typeof CHINA_REGIONS!=="undefined"?CHINA_REGIONS:null, "#1e3b32");
  if(seen["RU"]) fillRegs(RUSSIA_REGIONS, "rgba(59,130,246,.7)");
  if(seen["CN"]) fillRegs(CHINA_REGIONS, "rgba(59,130,246,.7)");
  feats.forEach(function(f){
    if(seen[f.properties.i]) fillShape(f, "rgba(59,130,246,.7)");
  });
  if(typeof visitedRegions!=="undefined" && visitedRegions.length){
    var ron={};
    visitedRegions.forEach(function(id){ ron[id]=1; });
    fillRegs(RUSSIA_REGIONS, "rgba(232,184,92,.88)", ron);
    fillRegs(CHINA_REGIONS, "rgba(232,184,92,.88)", ron);
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

/* ——— Подписи городов по всему видимому миру ——— */
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
try{window.__travelekMapRoutesLayer=layer;}catch(e){}
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
var worldLabelCache=null;
function labelCityName(raw){
  var s=String(raw||"").replace(/\s+/g," ").trim();
  if(!s) return "";
  if(s.indexOf(" — ")>=0) return s.split(" — ")[0].trim();
  var cut=s.split(" / ")[0].trim();
  var stripped=cut.replace(/\s+(international airport|airport|airbase|аэропорт).*$/i,"").trim();
  if(stripped!==cut) return stripped;
  var parts=cut.split(" ");
  if(parts.length===2) return parts[0];
  if(parts.length>2) return parts.slice(0,-1).join(" ");
  return cut;
}
function buildWorldLabels(){
  if(worldLabelCache) return worldLabelCache;
  var out=[], seen={};
  function add(name, lat, lng){
    name=labelCityName(name);
    if(!name || name.length<2 || lat==null || lng==null || isNaN(lat) || isNaN(lng)) return;
    var key=name.toLowerCase();
    if(seen[key]) return;
    seen[key]=1;
    out.push({name:name, lat:+lat, lng:+lng});
  }
  (typeof CITIES!=="undefined"?CITIES:[]).forEach(function(c){ add(c.n, c.lat, c.lng); });
  (typeof STATIONS!=="undefined"?STATIONS:[]).forEach(function(c){ add(c.n||c.name, c.lat, c.lng); });
  (typeof PORTS!=="undefined"?PORTS:[]).forEach(function(c){ add(c.n||c.name, c.lat, c.lng); });
  (typeof AIRPORTS!=="undefined"?AIRPORTS:[]).forEach(function(c){ add(c.n, c.lat, c.lng); });
  CITY_LABELS.forEach(function(c){ add(c.name, c.lat, c.lng); });
  worldLabelCache=out;
  return out;
}
function drawCityLabels(){
  labelsLayer.clearLayers();
  var z=map.getZoom();
  if(z<3.5) return;
  var theme=document.documentElement.getAttribute("data-theme")||"dark";
  var color=theme==="light"?"#1a1d26":"#eef0f5";
  var bg=theme==="light"?"rgba(255,255,255,.7)":"rgba(0,0,0,.55)";
  var list=(pickModeLabels || z>=4)?buildWorldLabels():CITY_LABELS;
  var b=map.getBounds();
  var center=map.getCenter();
  var cell=z>=8?0.28:(z>=6?0.7:1.6);
  var ranked=[], i, c, gk, fs, n=0;
  for(i=0;i<list.length;i++){
    c=list[i];
    if(!c || !b.contains([c.lat,c.lng])) continue;
    ranked.push(c);
  }
  ranked.sort(function(a,d){
    var da=(a.lat-center.lat)*(a.lat-center.lat)+(a.lng-center.lng)*(a.lng-center.lng);
    var dd=(d.lat-center.lat)*(d.lat-center.lat)+(d.lng-center.lng)*(d.lng-center.lng);
    return da-dd;
  });
  var used={};
  var maxLabels=pickModeLabels?160:(z>=8?110:(z>=6?70:40));
  for(i=0;i<ranked.length && n<maxLabels;i++){
    c=ranked[i];
    gk=Math.round(c.lat/cell)+"|"+Math.round(c.lng/cell);
    if(used[gk]) continue;
    used[gk]=1;
    fs=z>=8?11:(z>=6?10:9);
    L.marker([c.lat,c.lng],{interactive:false,keyboard:false,icon:L.divIcon({
      className:"city-lbl",
      html:'<div style="transform:translate(-50%,-100%);white-space:nowrap;font:500 '+fs+'px/1.15 -apple-system,sans-serif;color:'+color+';text-shadow:0 0 4px '+bg+',0 1px 2px '+bg+';opacity:.92;pointer-events:none">'+c.name+"</div>",
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

function routeRepeatKey(r){
  function endpoint(code,name){
    return String(code||name||"").trim().toLowerCase().replace(/\s+/g," ");
  }
  var a=endpoint(r.fromCode,r.from), b=endpoint(r.toCode,r.to);
  if((!a||!b) && r.coords && r.coords.length>=2){
    var p=r.coords[0], q=r.coords[r.coords.length-1];
    a=[Number(p[0]).toFixed(2),Number(p[1]).toFixed(2)].join(",");
    b=[Number(q[0]).toFixed(2),Number(q[1]).toFixed(2)].join(",");
  }
  return [a,b].sort().join(" ⇄ ");
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
  var routeCounts={};
  ROUTES.forEach(function(r){var k=routeRepeatKey(r);if(k&&k!==" ⇄ ")routeCounts[k]=(routeCounts[k]||0)+1;});

  list.forEach(function(r){
    var g=buildGeoSync(r); if(!g||!g.coords) return;
    if(g.needRoad) pending.push(r);
    var fut=isFuture(r);
    var col=COLORS[r.mode]||COLORS.plane;
    if(fut&&r.mode==="plane") col=COLORS.future;
    var theme=document.documentElement.getAttribute("data-theme")||"dark";
    var casing=theme==="light"?"#ffffff":"#f4f8fc";
    var repeats=routeCounts[routeRepeatKey(r)]||1;
    var w=repeats>1?5.2:2.15;
    if(selectedId===r.id) w+=1.2;
    L.polyline(g.coords,{pane:"routePane",color:casing,weight:w+(repeats>1?2.8:1.5),opacity:.94,lineJoin:"round",lineCap:"round",interactive:false,smoothFactor:0}).addTo(layer);
    L.polyline(g.coords,{pane:"routePane",color:col,weight:w,opacity:1,dashArray:fut?"7 6":null,lineJoin:"round",lineCap:"round",interactive:false,smoothFactor:0}).addTo(layer);
    [g.coords[0],g.coords[g.coords.length-1]].forEach(function(p){
      L.circleMarker(p,{pane:"routePane",radius:5,color:casing,fillColor:col,fillOpacity:1,weight:2.5}).addTo(layer);
    });
    g.coords.forEach(function(c){bounds.push(c);});
  });
  drawCityLabels();
  if(typeof syncVisited==="function") syncVisited();
  if(typeof drawCountries==="function") drawCountries();
  try{layer.bringToFront();labelsLayer.bringToFront();}catch(e){}
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
map.on("mousemove",function(e){
  if(pickTarget) return;
  showMapHover(e.latlng.lat,e.latlng.lng,e.containerPoint);
});
map.on("mouseout",function(){
  hoverKey="";
  if(hoverLayer) hoverLayer.clearLayers();
  var label=document.getElementById("map-hover-label");
  if(label) label.style.display="none";
});
map.on("click",function(e){
  if(pickTarget) finishPick(e.latlng);
  else openVisitPrompt(e.latlng.lat,e.latlng.lng);
});
var visitYesBtn=document.getElementById("visit-confirm-yes");
var visitNoBtn=document.getElementById("visit-confirm-no");
var visitModal=document.getElementById("visit-confirm");
if(visitYesBtn) visitYesBtn.addEventListener("click",confirmVisitedPlace);
if(visitNoBtn) visitNoBtn.addEventListener("click",closeVisitPrompt);
if(visitModal) visitModal.addEventListener("click",function(e){if(e.target===visitModal) closeVisitPrompt();});
document.addEventListener("keydown",function(e){if(e.key==="Escape") closeVisitPrompt();});
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
    var now=Date.now();
    if(!rs._armed || now-rs._armed>1600){
      rs._armed=now;
      rs.textContent="Нажмите ещё раз";
      clearTimeout(rs._timer);
      rs._timer=setTimeout(function(){
        rs._armed=0;
        rs.textContent="Сбросить мои маршруты";
      }, 1600);
      return;
    }
    rs._armed=0;
    rs.textContent="Сбросить мои маршруты";
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
  if(typeof syncMapSwitch==="function") syncMapSwitch();
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
  nightOn=true;
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
var regionScope="";
var countryLayer=null;
var COUNTRY_LIST=null;
var RUSSIA_REGIONS=null;
var CHINA_REGIONS=null;
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
manualRegions=loadArr("travelek-regions").map(function(id){
  var alias={
    "Карачаево-Черкесская Республика":"Карачаево-Черкесия",
    "Республика Карелия":"Карелия",
    "Кемеровская область — Кузбасс":"Кемеровская область",
    "Республика Хакасия":"Хакасия",
    "Республика Адыгея":"Адыгея",
    "Чеченская Республика":"Чечня",
    "Чувашская Республика":"Чувашия",
    "Республика Дагестан":"Дагестан",
    "Республика Ингушетия":"Ингушетия",
    "Кабардино-Балкарская Республика":"Кабардино-Балкария",
    "Республика Калмыкия":"Калмыкия",
    "Республика Марий Эл":"Марий Эл",
    "Республика Мордовия":"Мордовия",
    "Республика Северная Осетия — Алания":"Республика Северная Осетия-Алания",
    "Республика Саха (Якутия)":"Якутия",
    "Республика Татарстан":"Татарстан",
    "Республика Тыва":"Тыва",
    "Удмуртская Республика":"Удмуртия",
    "Республика Бурятия":"Бурятия"
  };
  return alias[id]||id;
});
offRegions=loadArr("travelek-regions-off");
(function migrateDiaryPlaces(){
  var iso={"FRA":"FR","NOR":"NO","KOS":"RS","XK":"RS","XKX":"RS"};
  var beforeC=manualCountries.join("\n"), beforeO=offCountries.join("\n"), beforeR=manualRegions.join("\n"), beforeRO=offRegions.join("\n");
  var hadTw=false;
  function mapC(id){
    if(id==="CN-TW"||id==="TW"||id==="TWN"){ hadTw=true; return "CN"; }
    return iso[id]||id;
  }
  function uniq(list){
    return list.filter(function(id,i,a){ return id && a.indexOf(id)===i; });
  }
  manualCountries=uniq(manualCountries.map(mapC));
  offCountries=uniq(offCountries.map(function(id){
    if(id==="CN-TW"||id==="TW"||id==="TWN") return "CN";
    return iso[id]||id;
  }));
  function mapR(id){
    if(id==="Тайвань"||id==="CN-TW"||id==="TW"||id==="TWN") return "CN:Тайвань";
    return id;
  }
  manualRegions=manualRegions.map(mapR);
  offRegions=offRegions.map(mapR);
  if(hadTw && manualRegions.indexOf("CN:Тайвань")<0) manualRegions.push("CN:Тайвань");
  if(beforeC!==manualCountries.join("\n")||beforeO!==offCountries.join("\n")||beforeR!==manualRegions.join("\n")||beforeRO!==offRegions.join("\n")) saveSets();
})();
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
  var i, c, k, polys, region;
  /* Personal map view: selected regions are assigned to Russia for country lookup
     as well as for drawing. Check them before Ukraine's country polygon. */
  region=regionAtList(RUSSIA_REGIONS, lat, lng);
  if(region==="Республика Крым" ||
     region==="Севастополь" ||
     region==="Донецкая Народная Республика" ||
     region==="Луганская Народная Республика" ||
     region==="Запорожская область" ||
     region==="Херсонская область") return "RU";
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
function regionAtList(list, lat, lng){
  if(!list) return null;
  var best=null, bestA=1e18, i, reg, b, area, polys, k;
  for(i=0;i<list.length;i++){
    reg=list[i];
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
function regionAt(lat, lng){ return regionAtList(RUSSIA_REGIONS, lat, lng); }
function chinaRegionAt(lat, lng){ return regionAtList(CHINA_REGIONS, lat, lng); }

var hoverLayer=null, hoverKey="", pendingVisit=null;
function ensureHoverLayer(){
  if(!hoverLayer && typeof L!=="undefined" && typeof map!=="undefined") hoverLayer=L.layerGroup().addTo(map);
  return hoverLayer;
}
function countryRecord(id){
  if(!COUNTRY_LIST) return null;
  for(var i=0;i<COUNTRY_LIST.length;i++) if(COUNTRY_LIST[i].i===id) return COUNTRY_LIST[i];
  return null;
}
function regionRecord(id){
  var lists=[RUSSIA_REGIONS||[],CHINA_REGIONS||[]], i,j;
  for(i=0;i<lists.length;i++) for(j=0;j<lists[i].length;j++) if(lists[i][j].id===id) return lists[i][j];
  return null;
}
function showMapHover(lat,lng,containerPoint){
  if(!COUNTRY_LIST || !COUNTRY_LIST.length) return;
  var cid=countryAt(lat,lng);
  var rid=cid==="RU"?regionAt(lat,lng):(cid==="CN"?chinaRegionAt(lat,lng):null);
  var key=(cid||"")+"|"+(rid||"");
  var label=document.getElementById("map-hover-label");
  if(key===hoverKey){
    if(label && cid && containerPoint){label.style.display="block";label.style.left=(containerPoint.x+14)+"px";label.style.top=(containerPoint.y+14)+"px";}
    return;
  }
  hoverKey=key;
  var hl=ensureHoverLayer();
  if(hl) hl.clearLayers();
  if(!cid){
    if(label) label.style.display="none";
    return;
  }
  var c=countryRecord(cid);
  var cStyle={color:"#78b9ff",weight:2.2,opacity:.95,fillColor:"#5ba3ff",fillOpacity:.10,lineJoin:"round",interactive:false,smoothFactor:0};
  if(c && hl && typeof polysOf==="function") polysOf(c).forEach(function(poly){paintOn(hl,poly,cStyle,true);});
  var reg=rid?regionRecord(rid):null;
  if(reg && hl){
    var rStyle={color:"#72c6ff",weight:2.8,opacity:1,fillColor:"#3189ff",fillOpacity:.43,lineJoin:"round",interactive:false,smoothFactor:0};
    polysOf(reg).forEach(function(poly){paintOn(hl,poly,rStyle,true);});
  }
  if(label){
    label.textContent=reg?(reg.n+" · "+(c?c.n:cid)):(c?c.n:cid);
    label.style.display="block";
    if(containerPoint){label.style.left=(containerPoint.x+14)+"px";label.style.top=(containerPoint.y+14)+"px";}
  }
  /* Keep route strokes above the hover polygons; labels may sit above routes. */
  try{if(typeof layer!=="undefined"&&layer)layer.bringToFront();}catch(e){}
}
function openVisitPrompt(lat,lng){
  if(pickTarget || !COUNTRY_LIST || !COUNTRY_LIST.length) return;
  var cid=countryAt(lat,lng);
  if(!cid) return;
  var rid=cid==="RU"?regionAt(lat,lng):(cid==="CN"?chinaRegionAt(lat,lng):null);
  var c=countryRecord(cid), reg=rid?regionRecord(rid):null;
  pendingVisit={countryId:cid,regionId:rid,name:reg?(reg.n+" · "+(c?c.n:cid)):(c?c.n:cid)};
  var modal=document.getElementById("visit-confirm");
  var title=document.getElementById("visit-confirm-title");
  var desc=document.getElementById("visit-confirm-desc");
  if(title) title.textContent="Вы были тут?";
  if(desc) desc.textContent=pendingVisit.name;
  if(modal) modal.classList.add("on");
}
function closeVisitPrompt(){
  var modal=document.getElementById("visit-confirm");
  if(modal) modal.classList.remove("on");
  pendingVisit=null;
}
function confirmVisitedPlace(){
  if(!pendingVisit) return;
  var cid=pendingVisit.countryId, rid=pendingVisit.regionId;
  if(rid){
    offRegions=offRegions.filter(function(id){return id!==rid;});
    if(manualRegions.indexOf(rid)<0) manualRegions.push(rid);
  }else if(manualCountries.indexOf(cid)<0) manualCountries.push(cid);
  offCountries=offCountries.filter(function(id){return id!==cid;});
  saveSets();
  syncVisited();
  closeVisitPrompt();
  hoverKey="";
  if(typeof drawCountries==="function") drawCountries();
  if(typeof renderCountryUi==="function") renderCountryUi();
  if(typeof render==="function") render();
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
    } else if(id==="CN"){
      var cid=chinaRegionAt(lat, lng);
      if(cid) autoR[cid]=1;
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
  if((Object.keys(autoR).some(function(id){ return id.indexOf("CN:")!==0; }) || manualRegions.some(function(id){ return id.indexOf("CN:")!==0; })) && offCountries.indexOf("RU")<0) addC("RU");
  if((Object.keys(autoR).some(function(id){ return id.indexOf("CN:")===0; }) || manualRegions.some(function(id){ return id.indexOf("CN:")===0; })) && offCountries.indexOf("CN")<0) addC("CN");
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
  var latlngs=poly.map(function(ring){
    return ring.map(function(pt){ return [pt[1], pt[0]]; });
  });
  L.polygon(latlngs, style).addTo(countryLayer);
}
function drawCountries(){
  if(!countryLayer||!COUNTRY_LIST) return;
  countryLayer.clearLayers();
  var on={}, i;
  for(i=0;i<visited.length;i++) on[visited[i]]=1;
  var blue={color:"#3b82f6", weight:1.2, opacity:.35, lineJoin:"round", fillColor:"#3b82f6", fillOpacity:.34, interactive:false, smoothFactor:0};
  var gold={color:"#8a5a12", weight:1.6, opacity:1, dashArray:"5 4", lineJoin:"round", fillColor:"#e8b85c", fillOpacity:.4, interactive:false, smoothFactor:0};
  COUNTRY_LIST.forEach(function(c){
    if(!on[c.i] || c.i==="RU" || c.i==="CN") return;
    polysOf(c).forEach(function(poly){ paintPoly(poly, blue); });
  });
  if(on["RU"] && RUSSIA_REGIONS){
    RUSSIA_REGIONS.forEach(function(reg){
      polysOf(reg).forEach(function(poly){ paintPoly(poly, blue); });
    });
  }
  if(on["CN"] && CHINA_REGIONS){
    CHINA_REGIONS.forEach(function(reg){
      polysOf(reg).forEach(function(poly){ paintPoly(poly, blue); });
    });
  }
  function paintVisited(list){
    if(!list || !visitedRegions.length) return;
    var ron={};
    visitedRegions.forEach(function(id){ ron[id]=1; });
    list.forEach(function(reg){
      if(!ron[reg.id]) return;
      polysOf(reg).forEach(function(poly){ paintPoly(poly, gold); });
    });
  }
  paintVisited(RUSSIA_REGIONS);
  paintVisited(CHINA_REGIONS);
  try{ if(worldLayer) worldLayer.bringToBack(); countryLayer.bringToFront(); }catch(e){}
  if(typeof layer!=="undefined" && layer) try{ layer.bringToFront(); }catch(e){}
}
function regionStats(){
  var total=RUSSIA_REGIONS?RUSSIA_REGIONS.length:0;
  var got=0, i;
  if(RUSSIA_REGIONS) for(i=0;i<RUSSIA_REGIONS.length;i++) if(visitedRegions.indexOf(RUSSIA_REGIONS[i].id)>=0) got++;
  return {total:total, got:got};
}
function chinaStats(){
  var total=CHINA_REGIONS?CHINA_REGIONS.length:0;
  var got=0, i;
  if(CHINA_REGIONS) for(i=0;i<CHINA_REGIONS.length;i++) if(visitedRegions.indexOf(CHINA_REGIONS[i].id)>=0) got++;
  return {total:total, got:got};
}
function regionMatches(r, q){
  if(!q) return "";
  if(r.n.toLowerCase().indexOf(q)>=0) return "";
  var cs=r._cities||[], i, loose=null, name;
  for(i=0;i<cs.length;i++){
    name=cs[i].toLowerCase();
    if(name.indexOf(q)<0) continue;
    if(name===q || name.indexOf(q)===0) return cs[i];
    if(!loose) loose=cs[i];
  }
  return loose;
}
function pctOf(got, total){
  if(!total) return "0%";
  return Math.round(100*got/total)+"%";
}
function renderCountryUi(){
  var count=document.getElementById("countries-count");
  var st=regionStats();
  var cst=chinaStats();
  if(count) count.textContent=String(visited.length);
  var countryTotal=COUNTRY_LIST?COUNTRY_LIST.length:0;
  var countryPct=pctOf(visited.length, countryTotal);
  var pctLine=countryTotal?("Посещено "+countryPct+" стран"):"Посещено 0% стран";
  var pctEl=document.getElementById("countries-pct");
  if(pctEl) pctEl.textContent=pctLine;
  var cp=document.getElementById("countries-progress");
  if(cp) cp.textContent=pctLine;
  var rp=document.getElementById("region-progress");
  if(rp){
    if(regionScope){
      var rsNow=regionScope==="CN"?cst:st;
      rp.textContent=rsNow.got+" из "+rsNow.total+" · "+pctOf(rsNow.got, rsNow.total);
    } else rp.textContent="";
  }
  var line=document.getElementById("visit-line");
  var stats=document.getElementById("visit-stats");
  var summary=visited.length+" стран";
  if(line) line.textContent=summary;
  if(stats){ stats.textContent=summary; stats.hidden=!!regionScope; }
  var title=document.getElementById("countries-title");
  var hint=document.getElementById("countries-hint");
  var back=document.getElementById("regions-back");
  var qEl=document.getElementById("country-q");
  var picked=document.getElementById("country-picked");
  var list=document.getElementById("country-list");
  var regions=document.getElementById("region-list");
  var fromBtn=document.getElementById("countries-from-routes");
  var scopeList=regionScope==="CN"?CHINA_REGIONS:regionScope==="RU"?RUSSIA_REGIONS:null;
  var scopeStats=regionScope==="CN"?cst:st;
  if(back) back.hidden=!regionScope;
  if(title) title.textContent=regionScope==="CN"?"Регионы Китая":regionScope==="RU"?"Регионы России":"Посещённые страны";
  if(hint) hint.textContent=regionScope?(scopeStats.got+" из "+scopeStats.total+" · "+pctOf(scopeStats.got, scopeStats.total)+". Можно найти по городу."):"Считаются по маршрутам. Можно отметить и вручную.";
  if(qEl) qEl.placeholder=regionScope?"Регион или город…":"Найти страну…";
  if(picked) picked.style.display=regionScope?"none":"";
  if(list) list.style.display=regionScope?"none":"";
  if(regions) regions.style.display=regionScope?"block":"none";
  if(fromBtn) fromBtn.style.display=regionScope?"none":"";
  if(!COUNTRY_LIST) return;
  var q=(qEl&&qEl.value||"").trim().toLowerCase();
  if(regionScope && regions && scopeList){
    var rowsR=scopeList.filter(function(r){ return regionMatches(r, q)!==null; });
    rowsR.sort(function(a,b){
      var as=visitedRegions.indexOf(a.id)>=0?0:1, bs=visitedRegions.indexOf(b.id)>=0?0:1;
      if(as!==bs) return as-bs;
      return a.n.localeCompare(b.n,"ru");
    });
    regions.innerHTML=rowsR.map(function(r){
      var on=visitedRegions.indexOf(r.id)>=0;
      var city=q?regionMatches(r, q):"";
      var sub=city?'<small style="display:block;color:var(--muted);font-weight:500">'+city+'</small>':"";
      return '<button type="button" class="'+(on?"on":"")+'" data-reg="'+r.id+'"><span>'+r.n+sub+'</span><span>'+(on?"✓":"")+'</span></button>';
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
    if(a.i==="CN") return -1;
    if(b.i==="CN") return 1;
    return a.n.localeCompare(b.n,"ru");
  });
  if(q) rows=rows.slice(0,80);
  list.innerHTML=rows.map(function(c){
    var on=visited.indexOf(c.i)>=0;
    if(c.i==="RU"){
      return '<button type="button" class="'+(on?"on":"")+'" data-open="RU"><span>Россия</span><span>'+st.got+' из '+st.total+' · '+pctOf(st.got, st.total)+'</span></button>';
    }
    if(c.i==="CN"){
      return '<button type="button" class="'+(on?"on":"")+'" data-open="CN"><span>Китай</span><span>'+cst.got+' из '+cst.total+' · '+pctOf(cst.got, cst.total)+'</span></button>';
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
    offCountries=offCountries.filter(function(x){ return x!==(id.indexOf("CN:")===0?"CN":"RU"); });
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
var PLACE_CITIES=[
  {n:"Донецк",lat:48.0159,lng:37.8028},{n:"Луганск",lat:48.574,lng:39.3078},
  {n:"Мариуполь",lat:47.097,lng:37.543},{n:"Мелитополь",lat:46.849,lng:35.366},
  {n:"Херсон",lat:46.635,lng:32.617},{n:"Геническ",lat:46.175,lng:34.799},
  {n:"Бердянск",lat:46.767,lng:36.783},{n:"Запорожье",lat:47.839,lng:35.140},
  {n:"Гуанчжоу",lat:23.13,lng:113.26},{n:"Чэнду",lat:30.67,lng:104.07},
  {n:"Сиань",lat:34.34,lng:108.94},{n:"Ухань",lat:30.59,lng:114.31},
  {n:"Харбин",lat:45.80,lng:126.53},{n:"Шэньян",lat:41.81,lng:123.43},
  {n:"Чунцин",lat:29.56,lng:106.55},{n:"Тяньцзинь",lat:39.13,lng:117.20},
  {n:"Нанкин",lat:32.06,lng:118.80},{n:"Ханчжоу",lat:30.27,lng:120.15},
  {n:"Куньмин",lat:25.04,lng:102.71},{n:"Урумчи",lat:43.83,lng:87.62},
  {n:"Лхаса",lat:29.65,lng:91.12},{n:"Хайкоу",lat:20.02,lng:110.35},
  {n:"Наньнин",lat:22.82,lng:108.32},{n:"Чанша",lat:28.23,lng:112.94},
  {n:"Чжэнчжоу",lat:34.75,lng:113.65},{n:"Цзинань",lat:36.65,lng:117.12},
  {n:"Фучжоу",lat:26.07,lng:119.30},{n:"Хэфэй",lat:31.82,lng:117.23},
  {n:"Наньчан",lat:28.68,lng:115.86},{n:"Тайюань",lat:37.87,lng:112.55},
  {n:"Хух-Хото",lat:40.84,lng:111.75},{n:"Иньчуань",lat:38.49,lng:106.23},
  {n:"Синин",lat:36.62,lng:101.78},{n:"Ланьчжоу",lat:36.06,lng:103.83},
  {n:"Гуйян",lat:26.65,lng:106.63},{n:"Шицзячжуан",lat:38.04,lng:114.51},
  {n:"Чанчунь",lat:43.82,lng:125.32},{n:"Тайбэй",lat:25.03,lng:121.57},
  {n:"Циндао",lat:36.10,lng:120.30},{n:"Сямэнь",lat:24.48,lng:118.09},
  {n:"Далянь",lat:38.91,lng:121.61},{n:"Сучжоу",lat:31.30,lng:120.59},
  {n:"Шэньчжэнь",lat:22.63,lng:114.12},{n:"Пекин",lat:39.90,lng:116.41},
  {n:"Шанхай",lat:31.23,lng:121.47}
];
function normalizeCountries(items){
  var iso={"FRA":"FR","NOR":"NO"};
  return (items||[]).map(function(c){
    if(iso[c.i]) c.i=iso[c.i];
    if(c.i==="CN") c.n="Китай";
    return c;
  }).filter(function(c){ return c && c.i && c.i!=="KOS" && c.i!=="TW" && c.i!=="TWN"; });
}
function bindRegionCities(){
  var lists=[RUSSIA_REGIONS, CHINA_REGIONS], i, by={};
  for(i=0;i<lists.length;i++){
    if(!lists[i]) continue;
    lists[i].forEach(function(r){ r._cities=[]; by[r.id]=r; });
  }
  var seen={};
  function add(raw, lat, lng){
    if(!raw || lat==null || lng==null || isNaN(lat) || isNaN(lng)) return;
    var id=regionAt(lat, lng)||chinaRegionAt(lat, lng);
    var reg=id&&by[id];
    if(!reg || reg._cities.length>=48) return;
    var full=String(raw).replace(/\s+/g," ").trim();
    var names=[full];
    var cut=full.split(/\s+/)[0];
    if(cut && cut.length>=3 && cut!==full) names.push(cut);
    names.forEach(function(name){
      var key=id+"|"+name.toLowerCase();
      if(seen[key] || name.toLowerCase()===reg.n.toLowerCase()) return;
      seen[key]=1;
      if(reg._cities.length<48) reg._cities.push(name);
    });
  }
  function walk(arr, key){
    if(!arr) return;
    for(var j=0;j<arr.length;j++) add(arr[j][key]||arr[j].n||arr[j].name, arr[j].lat, arr[j].lng);
  }
  walk(PLACE_CITIES,"n");
  walk(typeof CITIES!=="undefined"?CITIES:null,"n");
  walk(typeof CITY_LABELS!=="undefined"?CITY_LABELS:null,"name");
  walk(typeof AIRPORTS!=="undefined"?AIRPORTS:null,"n");
  walk(typeof STATIONS!=="undefined"?STATIONS:null,"n");
  walk(typeof PORTS!=="undefined"?PORTS:null,"n");
}
function loadGeo(url){
  return fetch(url).then(function(r){
    if(!r.ok) throw new Error(url);
    return r.json();
  });
}
function bootGeo(){
  var left=3;
  function finish(){
    if(--left>0) return;
    bindRegionCities();
    syncVisited();
    if(typeof drawWorld==="function") drawWorld();
    drawCountries();
    renderCountryUi();
    if(globeOn && typeof drawGlobe==="function") drawGlobe();
    if(window.__fillAccount && document.getElementById("account-panel") && document.getElementById("account-panel").classList.contains("on")) window.__fillAccount();
  }
  if(!countryLayer && typeof L!=="undefined" && typeof map!=="undefined") countryLayer=L.layerGroup().addTo(map);
  ensureHoverLayer();
  globeLand=null;
  loadGeo("./geo/countries.json?v=6").then(function(data){
    COUNTRY_LIST=normalizeCountries(data&&data.items);
    finish();
  }).catch(function(){ COUNTRY_LIST=COUNTRY_LIST||[]; finish(); });
  loadGeo("./geo/russia.json?v=6").then(function(data){
    RUSSIA_REGIONS=((data&&data.items)||[]).map(function(r){ r.id=r.id||r.n; return r; });
    finish();
  }).catch(function(){ RUSSIA_REGIONS=[]; finish(); });
  loadGeo("./geo/china.json?v=6").then(function(data){
    CHINA_REGIONS=((data&&data.items)||[]).map(function(r){ r.id=r.id||("CN:"+r.n); return r; });
    finish();
  }).catch(function(){ CHINA_REGIONS=[]; finish(); });
}
bootGeo();
function syncMapSwitch(){
  var sw=document.getElementById("map-switch");
  if(!sw) return;
  sw.classList.toggle("globe", !!globeOn);
  var buttons=sw.querySelectorAll("button");
  for(var i=0;i<buttons.length;i++){
    var on=buttons[i].getAttribute("data-view")===(globeOn?"globe":"map");
    buttons[i].classList.toggle("on", on);
    buttons[i].setAttribute("aria-pressed", on?"true":"false");
  }
}
function setMapView(globe){
  globeOn=!!globe;
  nightOn=true;
  saveMapPrefs();
  syncMapSwitch();
  if(typeof applyGlobeEffect==="function") applyGlobeEffect();
  if(typeof updateNightLayer==="function") updateNightLayer();
}
var mapSwitch=document.getElementById("map-switch");
if(mapSwitch) mapSwitch.onclick=function(e){
  var b=e.target.closest("button");
  if(!b) return;
  setMapView(b.getAttribute("data-view")==="globe");
};
syncMapSwitch();
function openLegal(which){
  var panel=document.getElementById("legal-panel");
  if(!panel) return;
  panel.classList.add("on");
  var terms=document.getElementById("legal-terms");
  var privacy=document.getElementById("legal-privacy");
  if(terms) terms.hidden=which==="privacy";
  if(privacy) privacy.hidden=which!=="privacy";
  var title=document.getElementById("legal-title");
  if(title) title.textContent=which==="privacy"?"Обработка данных":"Пользовательское соглашение";
}
document.querySelectorAll("[data-legal]").forEach(function(btn){
  btn.addEventListener("click", function(e){
    e.preventDefault();
    e.stopPropagation();
    openLegal(btn.getAttribute("data-legal"));
  });
});
var legalClose=document.getElementById("legal-close");
if(legalClose) legalClose.onclick=function(){ document.getElementById("legal-panel").classList.remove("on"); };
var legalOk=document.getElementById("legal-ok");
if(legalOk) legalOk.onclick=function(){
  var box=document.getElementById("file-login-legal");
  if(box) box.checked=true;
  document.getElementById("legal-panel").classList.remove("on");
};
var countriesOpen=document.getElementById("countries-open");
if(countriesOpen) countriesOpen.onclick=function(e){
  e.stopPropagation();
  regionScope="";
  var p=document.getElementById("countries-panel");
  if(p) p.classList.add("on");
  var s=document.getElementById("settings-panel"); if(s) s.classList.remove("on");
  var t=document.getElementById("track-panel"); if(t) t.classList.remove("on");
  renderCountryUi();
};
var countriesClose=document.getElementById("countries-close");
if(countriesClose) countriesClose.onclick=function(){
  regionScope="";
  document.getElementById("countries-panel").classList.remove("on");
};
var regionsBack=document.getElementById("regions-back");
if(regionsBack) regionsBack.onclick=function(){
  regionScope="";
  var qEl=document.getElementById("country-q");
  if(qEl) qEl.value="";
  renderCountryUi();
};
var countryQ=document.getElementById("country-q");
if(countryQ) countryQ.oninput=function(){ renderCountryUi(); };
var countryList=document.getElementById("country-list");
if(countryList) countryList.onclick=function(e){
  var open=e.target.closest("[data-open]");
  if(open){ regionScope=open.getAttribute("data-open")||"RU"; var qEl=document.getElementById("country-q"); if(qEl) qEl.value=""; renderCountryUi(); return; }
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
  var cst=chinaStats();
  alert("По маршрутам: "+n+" стран"+(st.total?(", Россия "+st.got+" из "+st.total):"")+(cst.total?(", Китай "+cst.got+" из "+cst.total):""));
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
    } else if(id==="CN" && typeof chinaRegionAt==="function"){
      var cid=chinaRegionAt(lat, lng);
      if(cid) autoR[cid]=1;
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
  var ruRegs=0;
  Object.keys(regions).forEach(function(id){
    if(String(id).indexOf("CN:")===0){ if(offC.indexOf("CN")<0) countries.CN=1; }
    else ruRegs++;
  });
  if(ruRegs && offC.indexOf("RU")<0) countries.RU=1;
  return {
    routesList:routes,
    routes:routes.length,
    countries:Object.keys(countries).length,
    regions:ruRegs,
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
    if(box) box.innerHTML=statBox(t.countries,"стран")+statBox((t.regions.got||0)+" из "+(t.regions.total||0)+" · "+pctOf(t.regions.got||0, t.regions.total||0),"регионов РФ")+statBox(t.plane.toLocaleString("ru-RU"),"небо, км")+statBox(t.train.toLocaleString("ru-RU"),"поезд, км")+statBox(t.car.toLocaleString("ru-RU"),"авто, км")+statBox(String(t.routes),"маршрутов");
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
          return '<div class="admin-row"><button type="button" data-user="'+r.userId+'"><b>'+ (r.name||login) +'</b> · '+login+'<br><span style="color:var(--muted);font-size:12px">'+(r.role==="admin"?"админ · ":"")+r.routes+' маршрутов · '+r.countries+' стран · РФ '+((typeof RUSSIA_REGIONS!=="undefined"&&RUSSIA_REGIONS&&RUSSIA_REGIONS.length)?(r.regions+" из "+RUSSIA_REGIONS.length+" · "+pctOf(r.regions, RUSSIA_REGIONS.length)):(r.regions+" рег."))+' · '+r.kmPlane+' / '+r.kmTrain+' / '+r.kmCar+' км</span>'+lines+'</button>'+(r.role==="admin"?"":'<button type="button" data-pass="'+r.userId+'" data-login="'+login+'">Сменить пароль</button>')+'</div>';
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

