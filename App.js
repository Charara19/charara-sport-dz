
import { WebView } from 'react-native-webview';
import React, { useState, useRef, useEffect } from 'react';
import { VideoView, useVideoPlayer } from 'expo-video';
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Image,
  ImageBackground,
  Alert,
  Modal,
} from 'react-native';

import * as Speech from 'expo-speech';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const GREEN = '#00E676';
const BG = '#070B09';
const PANEL = '#111A15';
const MUTED = '#91A398';

const platforms = [
  {
    name: 'FIFA+',
    description: 'منصة الاتحاد الدولي لكرة القدم. تتوفر عليها مباريات ومحتويات مختارة حسب المنطقة.',
    icon: '🌍',
    url: 'https://www.plus.fifa.com/',
  },
  {
    name: 'UEFA.tv',
    description: 'المنصة الرسمية للاتحاد الأوروبي لكرة القدم. توفر محتوى ومباريات مختارة وفق حقوق البث.',
    icon: '🏆',
    url: 'https://www.uefa.tv/',
  },
  {
    name: 'beIN SPORTS',
    description: 'الموقع الرسمي للقنوات الرياضية. تحقق من خدمات المشاهدة المتاحة في بلدك.',
    icon: '📺',
    url: 'https://www.bein.com/',
  },
];

const algerianChannels = [
  { name: 'القناة الأولى TV1', subtitle: 'القناة الوطنية', icon: '🇩🇿', url: 'https://www.entv.dz/ar/tv1' },
  { name: 'قناة الجزائرية TV2', subtitle: 'Canal Algérie', icon: '📺', url: 'https://www.entv.dz/ar/tv2' },
  { name: 'القناة الثالثة TV3', subtitle: 'الإخبارية', icon: '📰', url: 'https://www.entv.dz/ar/tv3' },
  { name: 'القناة الرابعة TV4', subtitle: 'تمازيغت', icon: 'ⵣ', url: 'https://www.entv.dz/dz-tif/tv4' },
  { name: 'القناة الخامسة TV5', subtitle: 'القرآن الكريم', icon: '📖', url: 'https://www.entv.dz/ar/tv5' },
  { name: 'القناة السادسة TV6', subtitle: 'الشباب والعائلة', icon: '🎬', url: 'https://www.entv.dz/ar/tv6' },
  { name: 'القناة السابعة TV7', subtitle: 'المعرفة', icon: '📚', url: 'https://www.entv.dz/ar/tv7' },
  { name: 'القناة الثامنة TV8', subtitle: 'الذاكرة', icon: '🏛️', url: 'https://www.entv.dz/ar/tv8' },
  { name: 'القناة التاسعة TV9', subtitle: 'البرلمانية', icon: '🏛️', url: 'https://www.entv.dz/ar/tv9' },
];

const beinChannels = [
  ...Array.from({ length: 9 }, (_, i) => ({
    name: `beIN SPORTS ${i + 1}`,
    subtitle: 'القنوات الرياضية الرئيسية',
    group: 'القنوات الرئيسية',
    icon: '⚽',
  })),
  { name: 'beIN SPORTS NEWS', subtitle: 'الأخبار الرياضية',
    group: 'قنوات متخصصة', icon: '📰' },
  { name: 'beIN SPORTS 4K', subtitle: 'البث بجودة فائقة حسب الباقة',
    group: 'قنوات متخصصة', icon: '📺' },
  { name: 'beIN SPORTS NBA', subtitle: 'كرة السلة الأمريكية',
    group: 'قنوات متخصصة', icon: '🏀' },
  { name: 'beIN SPORTS ENGLISH 1', subtitle: 'البث باللغة الإنجليزية',
    group: 'قنوات متخصصة', icon: '🇬🇧' },
  { name: 'beIN SPORTS ENGLISH 2', subtitle: 'البث باللغة الإنجليزية', icon: '🇬🇧' },
  { name: 'beIN SPORTS FRENCH 1', subtitle: 'البث باللغة الفرنسية',
    group: 'قنوات متخصصة', icon: '🇫🇷' },
  { name: 'beIN SPORTS FRENCH 2', subtitle: 'البث باللغة الفرنسية', icon: '🇫🇷' },
  ...Array.from({ length: 9 }, (_, i) => ({
    name: `beIN SPORTS XTRA ${i + 1}`,
    subtitle: 'قنوات رياضية إضافية حسب التوفر',
    group: 'قنوات XTRA',
    icon: '➕',
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    name: `beIN SPORTS MAX ${i + 1}`,
    subtitle: 'قنوات فعاليات ومباريات حسب التوفر',
    group: 'قنوات MAX',
    icon: '🏆',
  })),
  ...Array.from({ length: 7 }, (_, i) => ({
    name: i === 0 ? 'beIN SPORTS AFC' : `beIN SPORTS AFC ${i}`,
    subtitle: 'قنوات مسابقات الاتحاد الآسيوي حسب التوفر',
    group: 'قنوات AFC',
    icon: '🌏',
  })),
];

const officialSportsChannels = [
  {
    name: 'Arryadia',
    country: 'المغرب',
    subtitle: 'القناة الرياضية المغربية - البث الرسمي عبر SNRT',
    icon: '🇲🇦',
    url: 'https://snrtlive.ma/arryadia',
    availability: 'قد يختلف التوفر حسب المنطقة وحقوق البث',
  },
  {
    name: 'CBS Sports Golazo',
    country: 'الولايات المتحدة',
    subtitle: 'شبكة CBS الرسمية لكرة القدم',
    icon: '⚽',
    url: 'https://www.cbs.com/live-tv/stream/golazo',
    availability: 'قد يكون البث مقيداً جغرافياً',
  },
  {
    name: 'A Spor',
    country: 'تركيا',
    subtitle: 'الموقع الرسمي للقناة الرياضية',
    icon: '🇹🇷',
    url: 'https://www.aspor.com.tr/',
    availability: 'تحقق من البث المتاح على الموقع الرسمي',
  },
  {
    name: 'TF1+ Sport',
    country: 'فرنسا',
    subtitle: 'قسم الرياضة الرسمي لخدمة TF1+',
    icon: '🇫🇷',
    url: 'https://www.tf1.fr/fr-dz/programmes-tv/sport',
    availability: 'المحتوى متاح وفق البلد وحقوق العرض',
  },
];

export default function App() {
  const [tab, setTab] = useState('الرئيسية');
  const [language, setLanguage] = useState("ar");
  const languageLoadedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    const loadLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem("chararaLanguage");
        if (mounted && ["ar", "fr", "en"].includes(saved)) {
          setLanguage(saved);
        }
      } catch (error) {
        console.log("تعذر تحميل اللغة:", error);
      } finally {
        if (mounted) languageLoadedRef.current = true;
      }
    };
    loadLanguage();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!languageLoadedRef.current) return;
    AsyncStorage.setItem("chararaLanguage", language)
      .catch(error => console.log("تعذر حفظ اللغة:", error));
  }, [language]);

  const [category, setCategory] = useState('الكل');
  const [matches, setMatches] = useState([]);
  const [favoriteTeams, setFavoriteTeams] = useState([]);

  const toggleFavoriteTeam = async (teamName) => {
    const name = String(teamName || '').trim();
    if (!name) return;

    const updated = favoriteTeams.includes(name)
      ? favoriteTeams.filter(team => team !== name)
      : [...favoriteTeams, name];

    setFavoriteTeams(updated);

    try {
      await AsyncStorage.setItem(
        'chararaFavoriteTeams',
        JSON.stringify(updated)
      );
    } catch (error) {
      console.log('تعذر حفظ المفضلة:', error);
    }
  };

  const favoritesLoadedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const loadFavoriteTeams = async () => {
      try {
        const saved = await AsyncStorage.getItem('chararaFavoriteTeams');
        if (mounted && saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setFavoriteTeams(parsed);
        }
      } catch (error) {
        console.log('تعذر تحميل الفرق المفضلة:', error);
      } finally {
        if (mounted) favoritesLoadedRef.current = true;
      }
    };

    loadFavoriteTeams();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!favoritesLoadedRef.current) return;

    AsyncStorage.setItem(
      'chararaFavoriteTeams',
      JSON.stringify(favoriteTeams)
    ).catch(error => console.log('تعذر حفظ الفرق المفضلة:', error));
  }, [favoriteTeams]);

  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState('');
  const [matchDay, setMatchDay] = useState('today');
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState('الكل');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [matchStats, setMatchStats] = useState([]);
  const [matchEvents, setMatchEvents] = useState([]);
  const [matchLineups, setMatchLineups] = useState([]);
  const [matchPlayerRatings, setMatchPlayerRatings] = useState([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [lineupsLoading, setLineupsLoading] = useState(false);
  const [lineupsError, setLineupsError] = useState('');
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [fixtureStatus, setFixtureStatus] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pushStatus, setPushStatus] = useState('لم يتم التسجيل بعد');
  const previousEventsRef = useRef({});
  const matchesRequestInProgressRef = useRef(false);
  const liveUpdateInProgressRef = useRef(false);
  const currentFixtureIdRef = useRef(null);
  const currentFixtureTeamsRef = useRef({ homeId: null, awayId: null });
  const currentFixtureApiRef = useRef('');
  const fixturesCacheRef = useRef({});
  const [selectedBroadcastCountry, setSelectedBroadcastCountry] = useState('الجزائر');
  const [streamUrl, setStreamUrl] = useState('');
  const [internalMatchUrl, setInternalMatchUrl] = useState('');
  const videoViewRef = useRef(null);
  const player = useVideoPlayer(null);


  useEffect(() => {
    let mounted = true;

    const registerForPushNotifications = async () => {
      try {
        await Notifications.setNotificationChannelAsync('match-alerts', {
          name: 'تنبيهات المباريات',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#00E676',
        });

        let permission = await Notifications.getPermissionsAsync();

        if (!permission.granted) {
          permission = await Notifications.requestPermissionsAsync();
        }

        if (!permission.granted) {
          if (mounted) setPushStatus('إذن الإشعارات غير ممنوح');
          return;
        }

        const projectId =
          Constants.easConfig?.projectId ||
          Constants.expoConfig?.extra?.eas?.projectId;

        if (!projectId) {
          if (mounted) setPushStatus('معرّف المشروع غير متوفر');
          return;
        }

        const savedToken = await AsyncStorage.getItem('expoPushToken');

        if (savedToken) {
          if (mounted) setPushStatus('تم تسجيل الإشعارات على الجهاز');
          return;
        }

        const tokenResult = await Notifications.getExpoPushTokenAsync({
          projectId,
        });

        await AsyncStorage.setItem('expoPushToken', tokenResult.data);

        if (mounted) setPushStatus('تم تسجيل الإشعارات على الجهاز');
      } catch (error) {
        if (mounted) setPushStatus('خطأ: ' + (error?.message || String(error)));
        console.log('Push registration error:', error);
      }
    };

    registerForPushNotifications();

    return () => {
      mounted = false;
    };
  }, []);

  const speakMatchAlert = (message) => {
    if (!soundEnabled) return;
    Speech.stop();
    Speech.speak(message, {
      language: 'ar',
      rate: 0.95,
      pitch: 1.0,
    });
  };

  const tabs = [
    'الرئيسية',
    'المباريات',
    'المفضلة',
    'البث المباشر',
    'البطولات',
    'حسابي',
  ];

  const categories = ['الكل', 'مباشر', 'اليوم', 'غداً'];

  const API_URL = 'https://charara-sport-api.hasnnoui73.workers.dev/';
  const STATS_API_URL = 'https://charara-standings-api.hasnnoui73.workers.dev/';
  const AFCON_API_URL = 'https://charara-sport-standings-api.hasnnoui73.workers.dev/';

  const translateFixtureStatus = (code) => {
    const statuses = {
      NS: 'لم تبدأ بعد',
      TBD: 'موعد المباراة غير محدد',
      '1H': 'الشوط الأول',
      HT: 'استراحة بين الشوطين',
      '2H': 'الشوط الثاني',
      ET: 'وقت إضافي',
      BT: 'استراحة قبل الوقت الإضافي',
      P: 'ركلات الترجيح',
      SUSP: 'معلّقة',
      INT: 'توقفت مؤقتًا',
      FT: 'انتهت',
      AET: 'انتهت بعد وقت إضافي',
      PEN: 'انتهت بركلات الترجيح',
      PST: 'تأجلت',
      CANC: 'أُلغيت',
      ABD: 'توقفت',
      AWD: 'فوز اعتباري',
      WO: 'فوز بالانسحاب',
      LIVE: 'مباشرة',
    };

    return statuses[code] || '';
  };

  const findMatchingFixture = async (home, away, date, localTime) => {
    try {
      const needsPreviousUtcDate = /^00:/.test(String(localTime || ''));
      let expectedUtcDate = date;
      let fixtures = fixturesCacheRef.current[date];

      if (!fixtures) {
        const response = await fetch(`${STATS_API_URL}fixtures?date=${date}`);
        if (!response.ok) return null;

        const data = await response.json();
        fixtures = data.data?.response || [];
        fixturesCacheRef.current[date] = fixtures;
      }

      if (needsPreviousUtcDate) {
        const previousDate = new Date(`${date}T00:00:00Z`);
        previousDate.setUTCDate(previousDate.getUTCDate() - 1);
        const previousDateKey = previousDate.toISOString().slice(0, 10);
        expectedUtcDate = previousDateKey;
        let previousFixtures = fixturesCacheRef.current[previousDateKey];

        if (!previousFixtures) {
          const previousResponse = await fetch(`${STATS_API_URL}fixtures?date=${previousDateKey}`);
          if (previousResponse.ok) {
            const previousData = await previousResponse.json();
            previousFixtures = previousData.data?.response || [];
            fixturesCacheRef.current[previousDateKey] = previousFixtures;
          } else {
            previousFixtures = [];
          }
        }

        const uniqueFixtures = new Map();
        for (const item of [...fixtures, ...previousFixtures]) {
          const fixtureId = item.fixture?.id;
          if (fixtureId != null && !uniqueFixtures.has(fixtureId)) {
            uniqueFixtures.set(fixtureId, item);
          }
        }
        fixtures = [...uniqueFixtures.values()];
      }

      const timeMatch = String(localTime || '').match(/^([01][0-9]|2[0-3]):([0-5][0-9])$/);
      const targetMinutesUtc = timeMatch
        ? (Number(timeMatch[1]) * 60 + Number(timeMatch[2]) - 60 + 1440) % 1440
        : null;

      const aliases = {
  'لاتسيو': ['Lazio'],
  'إلتشي': ['Elche'],
  'صن داونز': ['Mamelodi Sundowns'],
  'رايو فاييكانو': ['Rayo Vallecano'],
  'الدفاع الحسني الجديدي': ['Difaa EL Jadida'],
        'ميلان': ['AC Milan'],
        'ريال مدريد': ['Real Madrid'],
        'فالنسيا': ['Valencia'],
        'فيرينتسفاروشي': ['Ferencvarosi TC', 'Ferencvárosi TC'],
        'كريستال بالاس': ['Crystal Palace'],
        'هوفنهايم': ['1899 Hoffenheim', 'Hoffenheim'],
        'ريال سوسيداد': ['Real Sociedad'],
        'أولمبيك ليون': ['Lyon', 'Olympique Lyonnais'],
        'ألكمار': ['AZ Alkmaar'],
      'خيتافي': ['Getafe'],
      'برايتون': ['Brighton'],
        'يوفنتوس': ['Juventus'],
        'باير ليفركوزن': ['Bayer Leverkusen'],
        'أولمبيك مارسيليا': ['Marseille', 'Olympique Marseille'],
        'الجيش الملكي': ['FAR Rabat', 'FAR'],
        'الرجاء البيضاوي': ['Raja Casablanca', 'Raja CA'],
        'برشلونة': ['Barcelona', 'FC Barcelona'],
        'اتحاد طنجة': ['Ittihad Tanger', 'Ittihad Tangier'],
        'لايبزيج': ['RB Leipzig', 'Leipzig'],
        'مانشستر سيتي': ['Manchester City'],
        'لانس': ['Lens'],
        'كومو': ['Como'],
        'بوروسيا دورتموند': ['Borussia Dortmund', 'Dortmund'],
        'ريال بيتيس': ['Real Betis'],
        'سلافيا براغ': ['Slavia Praha', 'Slavia Prague'],
        'أرسنال': ['Arsenal'],
        'آيندهوفن': ['PSV Eindhoven', 'PSV'],
        'كلوب بروج': ['Club Brugge KV', 'Club Brugge'],
        'بورتو': ['FC Porto', 'Porto'],
        'نابولي': ['Napoli'],
        'غلطة سراي': ['Galatasaray'],
        'شتوتجارت': ['VfB Stuttgart', 'Stuttgart'],
        'أتلتيكو مدريد': ['Atletico Madrid', 'Atlético Madrid'],
        'بايرن ميونخ': ['Bayern München', 'Bayern Munich'],
        'اتحاد العاصمة': ['USM Alger'],
        'مولودية الجزائر': ['MC Alger', 'Mouloudia Club d Alger'],
        'الاتحاد': ['Al-Ittihad FC'],
        'الحزم': ['Al-Hazm', 'Al Hazem'],
        'النصر': ['Al-Nassr', 'Al Nassr'],
        'نيوم': ['NEOM'],
        'إيفرتون': ['Everton'],
        'كوفنتري سيتي': ['Coventry', 'Coventry City'],
        'إشبيلية': ['Sevilla'],
        'ألافيس': ['Alaves', 'Deportivo Alaves'],
        'جنوى': ['Genoa'],
        'سندرلاند': ['Sunderland'],
        'تشيلسي': ['Chelsea'],
        'إبسويتش تاون': ['Ipswich', 'Ipswich Town'],
        'بورنموث': ['Bournemouth', 'AFC Bournemouth'],
        'ليفربول': ['Liverpool'],
        'برينتفورد': ['Brentford'],
        'كولن': ['1. FC Köln', 'FC Koln', 'Koln'],
        'مانشستر يونايتد': ['Manchester United'],
        'أستون فيلا': ['Aston Villa'],
        'إنتر ميلان': ['Inter', 'Internazionale'],
        'فياريال': ['Villarreal'],
        'سيلتا فيجو': ['Celta Vigo', 'Celta de Vigo'],
        'ليفانتي': ['Levante UD'],
        'فيورنتينا': ['Fiorentina']
      };

      const normalize = value =>
        String(value || '')
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '');

      const matchesName = (apiName, appName) => {
        const options = [appName, ...(aliases[appName] || [])];
        const apiNormalized = normalize(apiName);

        return Boolean(apiNormalized) &&
          options.some(name => normalize(name) === apiNormalized);
      };

      const candidates = fixtures.filter(item => {
        const homeName = item.teams?.home?.name || '';
        const awayName = item.teams?.away?.name || '';
        const competition =
          `${item.league?.name || ''} ${homeName} ${awayName}`;
        if (targetMinutesUtc !== null) {
          const kickoff = item.fixture?.date;
          if (kickoff == null || kickoff === '') return false;
          const kickoffDate = new Date(kickoff);
          if (Number.isNaN(kickoffDate.getTime())) return false;
          const fixtureUtcDate = kickoffDate.toISOString().slice(0, 10);
          if (fixtureUtcDate !== expectedUtcDate) return false;
          const fixtureMinutesUtc = kickoffDate.getUTCHours() * 60 + kickoffDate.getUTCMinutes();
          const difference = Math.abs(fixtureMinutesUtc - targetMinutesUtc);
          if (Math.min(difference, 1440 - difference) > 15) return false;
        }

        if (/\bu[- ]?(?:16|17|18|19|20|21|23)\b|\b(?:youth|women|woman|feminine|reserve|reserves|academy|II|III|B)\b|\bW\b/i.test(competition)) {
          return false;
        }

        return matchesName(homeName, home) &&
          matchesName(awayName, away);
      });

      return candidates.length === 1 ? candidates[0] : null;
    } catch (error) {
      console.log('Fixture matching error:', error.message);
      return null;
    }
  };


  const getDateForMatchDay = (day) => {
  const date = new Date();

  if (day === 'yesterday') {
    date.setDate(date.getDate() - 1);
  } else if (day === 'tomorrow') {
    date.setDate(date.getDate() + 1);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const dayNumber = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${dayNumber}`;
};

const fetchMatches = async (day = 'today') => {
  if (matchesRequestInProgressRef.current) return;

  matchesRequestInProgressRef.current = true;
  setMatchesLoading(true);
  setMatchesError('');

  try {
    const targetDate = getDateForMatchDay(day);
    let sportApiMatches = [];
    let faborMatches = [];

    // تحميل المباريات من API-Football وFabor
    const results = await Promise.allSettled([
      fetch(`${STATS_API_URL}fixtures?date=${targetDate}`),
      fetch(`${API_URL}?day=${day}`)
    ]);

    // المصدر الأساسي: API-Football
    try {
      if (results[0].status !== 'fulfilled' || !results[0].value.ok) {
        throw new Error('تعذر الاتصال بمصدر API-Football');
      }

      const data = await results[0].value.json();
      const fixtures = data?.data?.response;

      if (!data.success || !Array.isArray(fixtures)) {
        throw new Error('بيانات API-Football غير صالحة');
      }

      const allowedLeagueIds = new Set([2, 3, 6, 12, 17, 18, 36, 39, 61, 78, 135, 140, 186, 187, 514, 848]);
      const seenIds = new Set();

      sportApiMatches = fixtures
        .filter(item => {
          const id = item.fixture?.id;
          if (!id || !allowedLeagueIds.has(Number(item.league?.id)) || seenIds.has(id) ||
            !item.teams?.home?.name ||
            !item.teams?.away?.name
          ) return false;

          seenIds.add(id);
          return true;
        })
        .map(item => {
          const fixture = item.fixture;
          const kickoffDate = new Date(fixture.date);
          const time = Number.isNaN(kickoffDate.getTime())
            ? '--:--'
            : `${String(kickoffDate.getHours()).padStart(2, '0')}:${String(kickoffDate.getMinutes()).padStart(2, '0')}`;

          const homeScore = item.goals?.home;
          const awayScore = item.goals?.away;

          return {
            home: item.teams.home.name,
            away: item.teams.away.name,
            homeLogo: item.teams.home.logo || '',
            awayLogo: item.teams.away.logo || '',
            league: item.league?.name || 'بطولة أخرى',
            leagueLogo: item.league?.logo || '',
            time,
            score: homeScore == null || awayScore == null
              ? null
              : [String(homeScore), String(awayScore)],
            status:
              translateFixtureStatus(fixture.status?.short) ||
              fixture.status?.long ||
              'موعد المباراة',
            url: `apifootball:${fixture.id}`,
            matchDate: targetDate,
            isApiFootballFixture: true,
            apiFootballFixtureId: fixture.id,
            apiFootballFixture: item,
            streamUrl: null
          };
        });

    } catch (error) {
      console.log('SportAPI fixtures error:', error.message);
    }

    // تحميل روابط Fabor
    try {
      if (results[1].status !== 'fulfilled' || !results[1].value.ok) {
        throw new Error('تعذر الاتصال بمصدر Fabor');
      }

      const data = await results[1].value.json();

      if (data.success && Array.isArray(data.matches)) {
        faborMatches = data.matches.map(match => ({
          ...match,
          matchDate:
            (typeof match.url === 'string'
              ? match.url.match(/\d{4}-\d{2}-\d{2}/)?.[0]
              : null) || targetDate
        }));
      }
    } catch (error) {
      console.log('Fabor fixtures error:', error.message);
    }

    // ربط البث فقط عند تطابق الفريقين والتوقيت
    const normalizeTeam = value =>
      String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\u0600-\u06FF]/g, '');

    const getLocalMinutes = (date, time) => {
      if (!date || !/^\d{1,2}:\d{2}$/.test(String(time || ''))) return null;
      const parts = time.split(':').map(Number);
      const value = new Date(`${date}T00:00:00`);
      if (Number.isNaN(value.getTime())) return null;
      return value.getTime() / 60000 + parts[0] * 60 + parts[1];
    };

    for (const match of sportApiMatches) {
      const home = normalizeTeam(match.home);
      const away = normalizeTeam(match.away);
      const apiMinutes = getLocalMinutes(targetDate, match.time);

      if (!home || !away || apiMinutes == null) continue;

      const candidates = faborMatches.filter(fabor => {
        const sameTeams =
          home === normalizeTeam(fabor.home) &&
          away === normalizeTeam(fabor.away);

        const faborMinutes = getLocalMinutes(
          fabor.matchDate || targetDate,
          fabor.time
        );

        return sameTeams &&
          faborMinutes != null &&
          Math.abs(apiMinutes - faborMinutes) <= 15 &&
          typeof fabor.url === 'string' &&
          /^https?:\/\//i.test(fabor.url);
      });

      if (candidates.length === 1) {
        match.streamUrl = candidates[0].url;
      }
    }

    // Fabor للروابط فقط؛ لا يعرض مباريات دون بيانات API-Football
      const updatedMatches = sportApiMatches;

    setMatches(updatedMatches);

    setSelectedMatch(current => {
      if (!current) return current;
      const latestMatch = updatedMatches.find(
        match => match.url === current.url
      );
      return latestMatch ? { ...current, ...latestMatch } : current;
    });

    if (updatedMatches.length === 0) {
      setMatchesError('لا توجد مباريات متاحة حالياً من المصادر المتصلة.');
    }

  } catch (error) {
    console.log('Fetch matches error:', error.message);
    setMatchesError('تعذر تحميل المباريات. تحقق من الإنترنت وحاول مجدداً.');
  } finally {
    matchesRequestInProgressRef.current = false;
    setMatchesLoading(false);
  }
};

useEffect(() => {
    if (tab !== 'المباريات') return;

    // جلب المباريات فور فتح الصفحة
    fetchMatches(matchDay);

    // تحديث تلقائي كل دقيقة
    const timer = setInterval(() => {
      fetchMatches(matchDay);
    }, 60000);

    return () => clearInterval(timer);
  }, [tab, matchDay]);

  const fetchMatchStats = async (match) => {
    if (!match?.url) return;

    const date = match.matchDate || match.url.match(/\d{4}-\d{2}-\d{2}/)?.[0];
    if (!date) return;

    setStatsLoading(true);
    setStatsError('');
    setMatchStats([]);
    setLineupsLoading(true);
    setLineupsError('');
    setMatchLineups([]);
    setMatchPlayerRatings([]);
    setPlayersLoading(true);
    let ratingsRequestStarted = false;

    try {
      const fixture = (match.isApiFootballFixture || match.isAfconFixture || match.isSportApiFixture)
        ? (match.apiFootballFixture || match.afconFixture || match.sportApiFixture)
        : await findMatchingFixture(match.home, match.away, date, match.time);

      if (!fixture?.fixture?.id) {
        setStatsError('لم يتم العثور على مباراة مطابقة بشكل مؤكد.');
        setLineupsError('تعذر العثور على المباراة لجلب التشكيلة.');
        setPlayersLoading(false);
        return;
      }

      currentFixtureApiRef.current = match.isApiFootballFixture ? STATS_API_URL : (match.isAfconFixture || match.isSportApiFixture) ? AFCON_API_URL : STATS_API_URL;
      currentFixtureIdRef.current = fixture.fixture.id;
      currentFixtureTeamsRef.current = {
        homeId: fixture.teams?.home?.id,
        awayId: fixture.teams?.away?.id
      };
      setFixtureStatus(fixture.fixture.status?.short || '');

      // جلب تقييمات اللاعبين بشكل مستقل عن بقية بيانات المباراة
      ratingsRequestStarted = true;
      (async () => {
        try {
          const playersResponse = await fetch(
            `${currentFixtureApiRef.current}fixtures/players?fixture=${fixture.fixture.id}`
          );

          if (!playersResponse.ok) {
            throw new Error('تعذر تحميل تقييمات اللاعبين');
          }

          const playersData = await playersResponse.json();
          const teams = playersData.data?.response || [];

          const ratedPlayers = teams.flatMap(team =>
            (team.players || []).map(item => {
              const statistics = item.statistics?.[0] || {};
              const rawRating = statistics.games?.rating;

              return {
                ...item,
                teamName: team.team?.name || '',
                playerRating: rawRating == null || rawRating === ''
                  ? null
                  : Number(rawRating),
                minutesPlayed: Number(statistics.games?.minutes || 0),
                playerStats: {
                  goals: statistics.goals?.total ?? 0,
                  assists: statistics.goals?.assists ?? 0,
                  shots: statistics.shots?.total ?? 0,
                  shotsOnTarget: statistics.shots?.on ?? 0,
                  passes: statistics.passes?.total ?? 0,
                  passAccuracy: statistics.passes?.accuracy ?? null,
                  tackles: statistics.tackles?.total ?? 0,
                  yellowCards: statistics.cards?.yellow ?? 0,
                  redCards: statistics.cards?.red ?? 0,
                },
              };
            })
          ).filter(player =>
            Number.isFinite(player.playerRating) &&
            player.playerRating !== null &&
            player.minutesPlayed > 0
          ).sort((a, b) =>
          (b.playerRating - a.playerRating) ||
          (b.playerStats.goals - a.playerStats.goals) ||
          (b.playerStats.assists - a.playerStats.assists) ||
          (b.minutesPlayed - a.minutesPlayed)
        );

          setMatchPlayerRatings(ratedPlayers);
        } catch (playersError) {
          console.log('Player ratings:', playersError.message);
          setMatchPlayerRatings([]);
        } finally {
          setPlayersLoading(false);
        }
      })();

      try {
        const lineupsResponse = await fetch(
          `${currentFixtureApiRef.current}fixtures/lineups?fixture=${fixture.fixture.id}`
        );

        if (!lineupsResponse.ok) {
          throw new Error('تعذر تحميل التشكيلة');
        }

        const lineupsData = await lineupsResponse.json();
        const incomingLineups = lineupsData.data?.response || [];
        setMatchLineups(incomingLineups);

        if (incomingLineups.length === 0) {
          setLineupsError('لم تُعلن التشكيلة الرسمية بعد.');
        }
      } catch (lineupError) {
        setMatchLineups([]);
        setLineupsError('التشكيلة غير متاحة حاليًا.');
      }

      const eventsResponse = await fetch(
        `${currentFixtureApiRef.current}fixtures/events?fixture=${fixture.fixture.id}`
      );
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        const incomingEvents = eventsData.data?.response || [];
        const fixtureId = String(fixture.fixture.id);
        const eventKey = event => [
          event.time?.elapsed, event.time?.extra, event.team?.id,
          event.type, event.detail, event.player?.id
        ].join('|');
        const previousKeys = previousEventsRef.current[fixtureId];

        if (previousKeys) {
          incomingEvents.forEach(event => {
            if (previousKeys.has(eventKey(event))) return;
            const type = String(event.type || '');
            const detail = String(event.detail || '');
            if (/goal/i.test(type)) {
              speakMatchAlert('هدف! تم تسجيل هدف');
            } else if (/card/i.test(type) && /red/i.test(detail)) {
              speakMatchAlert('بطاقة حمراء!');
            }
          });
        }

        previousEventsRef.current[fixtureId] = new Set(incomingEvents.map(eventKey));
        setMatchEvents(incomingEvents);
      } else {
        setMatchEvents([]);
      }

      const response = await fetch(
        `${currentFixtureApiRef.current}fixtures/statistics?fixture=${fixture.fixture.id}`
      );
      if (!response.ok) throw new Error('تعذر تحميل الإحصائيات');

      const data = await response.json();
      const statistics = data.data?.response || [];

      const homeId = currentFixtureTeamsRef.current.homeId;
      const awayId = currentFixtureTeamsRef.current.awayId;
      const homeStats = statistics.find(team => String(team.team?.id) === String(homeId));
      const awayStats = statistics.find(team => String(team.team?.id) === String(awayId));

      if (!homeStats || !awayStats) {
        setStatsError('الإحصائيات ستظهر عند انطلاق المباراة.');
        return;
      }

      setMatchStats([homeStats, awayStats]);
    } catch (error) {
      setStatsError('تعذر تحميل إحصائيات المباراة حاليًا.');
      if (!ratingsRequestStarted) setPlayersLoading(false);
    } finally {
      setStatsLoading(false);
      setLineupsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMatch) fetchMatchStats(selectedMatch);
    else {
      setMatchStats([]);
      setMatchEvents([]);
      setMatchLineups([]);
      setMatchPlayerRatings([]);
      setPlayersLoading(false);
      setLineupsLoading(false);
      setLineupsError('');
      setStatsError('');
      setFixtureStatus('');
    }
  }, [selectedMatch?.url]);

  useEffect(() => {
    if (!selectedMatch) {
      currentFixtureIdRef.current = null;
      currentFixtureTeamsRef.current = { homeId: null, awayId: null };
      currentFixtureApiRef.current = '';
      return;
    }

    const timer = setInterval(async () => {
      if (liveUpdateInProgressRef.current) return;
      const fixtureId = currentFixtureIdRef.current;
      if (!fixtureId) return;
      liveUpdateInProgressRef.current = true;

      try {
        try {
          const statusResponse = await fetch(
            `${currentFixtureApiRef.current || STATS_API_URL}fixtures?id=${fixtureId}`
          );

          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            const latestFixture = statusData.data?.response?.[0];
            const latestStatus = latestFixture?.fixture?.status?.short;
            const homeGoals = latestFixture?.goals?.home;
            const awayGoals = latestFixture?.goals?.away;

            if (latestStatus) {
              setFixtureStatus(latestStatus);
            }

            if (Number.isFinite(homeGoals) && Number.isFinite(awayGoals)) {
              setSelectedMatch(current => {
                if (!current) return current;
                return { ...current, score: [homeGoals, awayGoals] };
              });
            }
          }
        } catch (statusError) {
          // لا نوقف تحديث الأحداث إذا تعذر جلب الحالة
        }

        const response = await fetch(
          `${currentFixtureApiRef.current || STATS_API_URL}fixtures/events?fixture=${fixtureId}`
        );
        if (!response.ok) return;

        const data = await response.json();
        const incomingEvents = data.data?.response || [];
        const id = String(fixtureId);
        const eventKey = event => [
          event.time?.elapsed, event.time?.extra, event.team?.id,
          event.type, event.detail, event.player?.id
        ].join('|');
        const previousKeys = previousEventsRef.current[id] || new Set();

        incomingEvents.forEach(event => {
          if (previousKeys.has(eventKey(event))) return;
          const type = String(event.type || '');
          const detail = String(event.detail || '');
          if (/goal/i.test(type)) {
            speakMatchAlert('هدف! تم تسجيل هدف');
          } else if (/card/i.test(type) && /red/i.test(detail)) {
            speakMatchAlert('بطاقة حمراء!');
          }
        });

        previousEventsRef.current[id] = new Set(incomingEvents.map(eventKey));
        setMatchEvents(incomingEvents);

        const statsResponse = await fetch(
          `${currentFixtureApiRef.current || STATS_API_URL}fixtures/statistics?fixture=${fixtureId}`
        );

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          const statistics = statsData.data?.response || [];
          const homeId = currentFixtureTeamsRef.current.homeId;
          const awayId = currentFixtureTeamsRef.current.awayId;
          const homeStats = statistics.find(team => String(team.team?.id) === String(homeId));
          const awayStats = statistics.find(team => String(team.team?.id) === String(awayId));

          if (homeStats && awayStats) {
            setMatchStats([homeStats, awayStats]);
            setStatsError('');
          }
        }
      } catch (error) {
        // تجاهل أخطاء التحديث المؤقتة
      } finally {
        liveUpdateInProgressRef.current = false;
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [selectedMatch?.url, soundEnabled]);

  const playStream = () => {
    const url = streamUrl.trim();

    if (!/^https?:\/\//i.test(url)) {
      Alert.alert('رابط غير صالح', 'أدخل رابطاً يبدأ بـ https:// أو http://');
      return;
    }

    try {
      const isHls = /\.m3u8(?:$|[?#])/i.test(url);
      player.replace({
        uri: url,
        ...(isHls ? { contentType: 'hls' } : {}),
      });
      player.play();
    } catch (error) {
      Alert.alert('تعذر التشغيل', 'تحقق من الرابط وحاول مرة أخرى.');
    }
  };

  const openMatchInsideApp = (url) => {
    if (!url || !/^https?:\/\//i.test(url)) {
      Alert.alert('تنبيه', 'رابط المباراة غير صالح.');
      return;
    }
    setInternalMatchUrl(url);
  };

  const openPlatform = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert(
        'تعذر فتح الرابط',
        'تحقق من اتصال الإنترنت وحاول مرة أخرى.'
      );
    }
  };

  const Header = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.brand}>
          CHARARA <Text style={{ color: GREEN }}>SPORT</Text>
        </Text>
        <Text style={styles.subtitle}>منصة الرياضة العالمية</Text>
      </View>
      <View style={styles.logo}>
        <Text style={styles.logoText}>⚽</Text>
      </View>
    </View>
  );

  const SectionTitle = ({ title, action }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Text style={styles.action}>{action}</Text>
      ) : null}
    </View>
  );

  const BroadcastPage = () => (
    <>
      <View style={styles.broadcastHero}>
        <Text style={styles.broadcastHeroIcon}>📺</Text>
        <Text style={styles.broadcastHeroTitle}>
          البث الرياضي الرسمي
        </Text>
        <Text style={styles.broadcastHeroDesc}>
          اكتشف المنصات الرياضية الرسمية لمتابعة المباريات
          والبرامج عبر الإنترنت.
        </Text>
        <View style={styles.officialBadge}>
          <Text style={styles.officialBadgeText}>
            ✓ مصادر رسمية
          </Text>
        </View>
      </View>

      <SectionTitle title="منصات المشاهدة الرسمية" />

      {platforms.map((platform) => (
        <View key={platform.name} style={styles.platformCard}>
          <View style={styles.platformTop}>
            <Text style={styles.platformIcon}>{platform.icon}</Text>
            <View style={styles.platformInfo}>
              <Text style={styles.platformName}>
                {platform.name}
              </Text>
              <Text style={styles.platformDescription}>
                {platform.description}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.watchButton}
            onPress={() => openPlatform(platform.url)}
            activeOpacity={0.8}
          >
            <Text style={styles.watchButtonText}>
              افتح المنصة الرسمية ←
            </Text>
          </TouchableOpacity>
        </View>
      ))}


            <SectionTitle title="قنوات ومنصات رياضية عالمية" />
            <Text style={styles.channelIntro}>
              روابط الناشرين الرسميين. قد يتطلب بعض المحتوى اشتراكاً أو يكون محدوداً جغرافياً.
            </Text>
            {officialSportsChannels.map((channel) => (
              <View key={channel.name} style={styles.channelCard}>
                <View style={styles.channelInfo}>
                  <Text style={styles.channelIcon}>{channel.icon}</Text>
                  <View style={styles.channelText}>
                    <Text style={styles.channelName}>{channel.name}</Text>
                    <Text style={styles.channelSubtitle}>
                      {channel.country} · {channel.subtitle}
                    </Text>
                    <Text style={styles.channelStatus}>{channel.availability}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.channelButton}
                  onPress={() => openPlatform(channel.url)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.channelButtonText}>افتح المصدر الرسمي ←</Text>
                </TouchableOpacity>
              </View>
            ))}

            <SectionTitle title="القنوات الجزائرية الرسمية" />

      <View style={styles.channelIntro}>
        <Text style={styles.channelIntroTitle}>🇩🇿 التلفزيون الجزائري EPTV</Text>
        <Text style={styles.channelIntroText}>
          اختر القناة لفتح صفحتها الرسمية. البث المباشر داخل التطبيق
          سيُفعّل عند توفر رابط بث رسمي قابل للتشغيل.
        </Text>
      </View>
      <View style={styles.playerCard}>
        <View style={styles.playerScreen}>
          <VideoView
            ref={videoViewRef}
            style={styles.videoView}
            player={player}
            nativeControls={false}
            allowsFullscreen
            allowsPictureInPicture={false}
          />
        </View>

        <TextInput
          value={streamUrl}
          onChangeText={setStreamUrl}
          placeholder="ألصق رابط البث هنا (.m3u8 أو MP4)"
          placeholderTextColor={MUTED}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          style={{
            backgroundColor: '#020403',
            color: '#FFFFFF',
            borderColor: '#205735',
            borderWidth: 1,
            borderRadius: 10,
            padding: 12,
            marginTop: 12,
            textAlign: 'left',
          }}
        />

        <TouchableOpacity
          style={[styles.playerButton, { marginTop: 10 }]}
          onPress={playStream}
          activeOpacity={0.8}
        >
          <Text style={styles.playerButtonText}>▶ تحميل وتشغيل الرابط</Text>
        </TouchableOpacity>

        <View style={styles.playerControls}>
          <TouchableOpacity
            style={styles.playerButton}
            onPress={playStream}
          >
            <Text style={styles.playerButtonText}>▶ تشغيل</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playerButton}
            onPress={() => videoViewRef.current?.enterFullscreen()}
          >
            <Text style={styles.playerButtonText}>⛶ ملء الشاشة</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.playerFootnote}>
          يدعم روابط الفيديو المباشرة مثل HLS عند توفر مصدر مرخّص.
        </Text>
      </View>

      <View style={{
        backgroundColor: '#101D16',
        borderRadius: 20,
        padding: 18,
        marginTop: 8,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#28613C',
      }}>
        <Text style={{ color: GREEN, fontSize: 12, fontWeight: '900', textAlign: 'right' }}>
          CHARARA SPORT DZ · ARABIC SPORTS
        </Text>
        <Text style={{ color: '#FFFFFF', fontSize: 23, fontWeight: '900', textAlign: 'right', marginTop: 9 }}>
          📺 القنوات الرياضية العربية
        </Text>
        <Text style={{ color: '#B5C8BA', fontSize: 13, lineHeight: 22, textAlign: 'right', marginTop: 8 }}>
          اكتشف قنوات beIN SPORTS وبرامجها ومواعيد المباريات عبر دليلها الرسمي.
        </Text>
        <View style={{
          alignSelf: 'flex-end',
          backgroundColor: '#173D28',
          borderRadius: 20,
          paddingHorizontal: 12,
          paddingVertical: 7,
          marginTop: 12,
        }}>
          <Text style={{ color: '#8BE6A9', fontSize: 11, fontWeight: '900' }}>
            ✓ دليل القنوات الرسمي
          </Text>
        </View>
        <Text style={{ color: '#E8C77A', fontSize: 11, textAlign: 'right', marginTop: 12, lineHeight: 19 }}>
          المشاهدة المباشرة داخل التطبيق ستتوفر بعد تأمين حقوق البث واتفاقية التوزيع في الجزائر.
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: GREEN,
            padding: 13,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: 14,
          }}
          onPress={() => openPlatform('https://www.beinsports.com/en-mena/tv-guide')}
          activeOpacity={0.8}
        >
          <Text style={{ color: '#06130A', fontSize: 13, fontWeight: '900' }}>
            افتح دليل beIN الرسمي ←
          </Text>
        </TouchableOpacity>
      </View>

      {[
        { title: 'القنوات الرئيسية', group: 'القنوات الرئيسية', icon: '⚽' },
        { title: 'قنوات XTRA', group: 'قنوات XTRA', icon: '➕' },
        { title: 'قنوات MAX', group: 'قنوات MAX', icon: '🏆' },
        { title: 'قنوات AFC', group: 'قنوات AFC', icon: '🌏' },
        { title: 'القنوات المتخصصة', group: 'قنوات متخصصة', icon: '📺' },
      ].map((section) => {
        const groupChannels = beinChannels.filter(
          channel => channel.group === section.group
        );

        if (groupChannels.length === 0) return null;

        return (
          <View key={section.group}>
            <SectionTitle title={section.icon + ' ' + section.title + ' (' + groupChannels.length + ')'} />
            {groupChannels.map((channel) => (
              <View key={channel.name} style={styles.channelCard}>
                <View style={styles.channelInfo}>
                  <Text style={styles.channelIcon}>{channel.icon}</Text>
                  <View style={styles.channelText}>
                    <Text style={styles.channelName}>{channel.name}</Text>
                    <Text style={styles.channelSubtitle}>{channel.subtitle}</Text>
                    <Text style={styles.channelStatus}>دليل beIN الرسمي</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.channelButton}
                  onPress={() => openPlatform('https://www.beinsports.com/en-mena/tv-guide')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.channelButtonText}>فتح دليل القنوات ←</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );
      })}

      <View style={{ backgroundColor: PANEL, padding: 14, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: '#205735' }}>
        <Text style={{ color: GREEN, fontSize: 16, fontWeight: '900', textAlign: 'right', marginBottom: 10 }}>
          🌍 اختر بلد القنوات
        </Text>
        <TouchableOpacity
          onPress={() => setSelectedBroadcastCountry('الجزائر')}
          activeOpacity={0.8}
          style={{
            backgroundColor: selectedBroadcastCountry === 'الجزائر' ? '#087A48' : '#14251D',
            padding: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: GREEN,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>🇩🇿 الجزائر</Text>
        </TouchableOpacity>
        <Text style={{ color: MUTED, fontSize: 11, textAlign: 'right', marginTop: 9 }}>
          ستضاف دول أخرى بعد التحقق من قنواتها ومصادر البث الرسمية.
        </Text>
      </View>

      {selectedBroadcastCountry === 'الجزائر' && algerianChannels.map((channel) => (
        <View key={channel.name} style={styles.channelCard}>
          <View style={styles.channelInfo}>
            <Text style={styles.channelIcon}>{channel.icon}</Text>
            <View style={styles.channelText}>
              <Text style={styles.channelName}>{channel.name}</Text>
              <Text style={styles.channelSubtitle}>{channel.subtitle}</Text>
              <Text style={styles.channelStatus}>صفحة رسمية للقناة</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.channelButton}
            onPress={() => openPlatform(channel.url)}
            activeOpacity={0.8}
          >
            <Text style={styles.channelButtonText}>فتح صفحة القناة ←</Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>
          ⚠️ ملاحظة حول حقوق البث
        </Text>
        <Text style={styles.noticeText}>
          لا تتوفر جميع المباريات على كل المنصات.
          يختلف البث حسب البلد والبطولة وحقوق النقل.
          قد تحتاج بعض الخدمات إلى اشتراك.
        </Text>
      </View>

      <View style={styles.emptyCard}>
        <Text style={styles.emptyIcon}>⚽</Text>
        <Text style={styles.emptyTitle}>
          روابط مشاهدة المباريات
        </Text>
        <Text style={styles.emptyDesc}>
          سنضيف روابط المشاهدة الرسمية الخاصة بكل مباراة
          بعد ربط التطبيق بمصدر بيانات رياضي والتحقق
          من حقوق البث وتوفر الروابط.
        </Text>
      </View>
    </>
  );

  const MatchesPage = () => (
    <>
      <View style={{
        backgroundColor: '#0D1D13',
        borderRadius: 22,
        padding: 18,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: '#28613C',
        overflow: 'hidden',
      }}>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#8BCFA4', fontSize: 11, fontWeight: '800', textAlign: 'right', letterSpacing: 1 }}>
              CHARARA SPORT DZ
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 25, fontWeight: '900', textAlign: 'right', marginTop: 5 }}>
              المباريات
            </Text>
            <Text style={{ color: '#A5B9AA', fontSize: 11, textAlign: 'right', marginTop: 5 }}>
              تابع النتائج والمواعيد لحظة بلحظة
            </Text>
          </View>
          <View style={{
            width: 58,
            height: 58,
            borderRadius: 29,
            backgroundColor: '#153D27',
            borderWidth: 1,
            borderColor: '#34794C',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 12,
          }}>
            <Text style={{ fontSize: 29 }}>⚽</Text>
          </View>
        </View>
        <View style={{
          marginTop: 16,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: '#244532',
          flexDirection: 'row-reverse',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Text style={{ color: '#A5B9AA', fontSize: 11 }}>
            اختر اليوم لمتابعة المباريات
          </Text>
          <Text style={{ color: GREEN, fontSize: 11, fontWeight: '900' }}>
            ● تغطية المباريات
          </Text>
        </View>
      </View>

      <View style={{
        flexDirection: 'row-reverse',
        gap: 9,
        marginBottom: 18,
      }}>
        {[
          { label: 'الأمس', value: 'yesterday', icon: '◀' },
          { label: 'اليوم', value: 'today', icon: '●' },
          { label: 'الغد', value: 'tomorrow', icon: '▶' },
        ].map(item => (
          <TouchableOpacity
            key={item.value}
            onPress={() => setMatchDay(item.value)}
            style={{
              flex: 1,
              paddingVertical: 13,
              borderRadius: 15,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: matchDay === item.value ? '#00E676' : '#111F16',
              borderWidth: 1,
              borderColor: matchDay === item.value ? '#00E676' : '#31543B',
              elevation: matchDay === item.value ? 4 : 0,
            }}
          >
            <Text style={{
              color: matchDay === item.value ? '#07140B' : '#91A398',
              fontSize: 10,
              marginBottom: 5,
              fontWeight: '800',
            }}>
              {item.icon}
            </Text>
            <Text style={{
              color: matchDay === item.value ? '#07140B' : '#FFFFFF',
              fontWeight: '900',
              fontSize: 13,
            }}>
              {item.label}
            </Text>
            {matchDay === item.value && (
              <View style={{
                width: 17,
                height: 3,
                borderRadius: 3,
                backgroundColor: '#07552C',
                marginTop: 6,
              }} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ marginBottom: 17 }}>
        <View style={{
          flexDirection: 'row-reverse',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 11,
        }}>
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '900' }}>
            🏆 البطولات
          </Text>
          <Text style={{ color: MUTED, fontSize: 10 }}>
            تصفية المباريات
          </Text>
        </View>
        <View style={{
          flexDirection: 'row-reverse',
          flexWrap: 'wrap',
          gap: 8,
        }}>
          {['الكل', ...new Set(matches.map(match => match.league || 'غير محدد'))].map(league => (
            <TouchableOpacity
              key={league}
              onPress={() => setSelectedLeagueFilter(league)}
              style={{
                backgroundColor: selectedLeagueFilter === league ? '#00E676' : '#111F16',
                borderColor: selectedLeagueFilter === league ? '#00E676' : '#31543B',
                borderWidth: 1,
                borderRadius: 13,
                paddingVertical: 10,
                paddingHorizontal: 15,
              }}
            >
              <Text style={{
                color: selectedLeagueFilter === league ? '#07140B' : '#DCE9DF',
                fontWeight: '900',
                fontSize: 11,
              }}>
                {league}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        onPress={() => fetchMatches(matchDay)}
        disabled={matchesLoading}
        activeOpacity={0.8}
        style={{
          backgroundColor: '#123D25',
          borderColor: '#267A43',
          borderWidth: 1,
          paddingVertical: 13,
          paddingHorizontal: 16,
          borderRadius: 15,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 18,
          flexDirection: 'row',
          gap: 9,
          opacity: matchesLoading ? 0.65 : 1,
        }}
      >
        <Text style={{ color: GREEN, fontSize: 17, fontWeight: '900' }}>
          {matchesLoading ? '◌' : '↻'}
        </Text>
        <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 13 }}>
          {matchesLoading ? 'جارٍ تحديث المباريات...' : 'تحديث المباريات'}
        </Text>
      </TouchableOpacity>

      {matchesLoading ? (
        <View style={styles.emptyCard}>
          <Text style={{ color: GREEN, fontSize: 16, fontWeight: '800' }}>جارٍ تحميل المباريات...</Text>
        </View>
      ) : matchesError ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyDesc}>{matchesError}</Text>
          <TouchableOpacity onPress={() => fetchMatches(matchDay)} style={styles.heroButton}>
            <Text style={styles.heroButtonText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>⚽</Text>
          <Text style={styles.emptyTitle}>لا توجد مباريات متاحة</Text>
        </View>
      ) : (
        matches.filter(match =>
          selectedLeagueFilter === 'الكل' ||
          (match.league || 'غير محدد') === selectedLeagueFilter
        ).map((match, index) => (
          <View
            key={`${match.url}-${index}`}
            style={{
              backgroundColor: '#0D1A12',
              borderRadius: 20,
              padding: 16,
              marginBottom: 14,
              borderWidth: (favoriteTeams.includes(match.home) || favoriteTeams.includes(match.away)) ? 2 : 1,
              borderColor: (favoriteTeams.includes(match.home) || favoriteTeams.includes(match.away)) ? '#FFD700' : (/الشوط الأول|الشوط الثاني|استراحة بين الشوطين|وقت إضافي|ركلات الترجيح|مباشرة/.test(String(match.status || '')) ? GREEN : '#28543A'),
              shadowColor: GREEN,
              shadowOpacity: 0.12,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <View style={{ flexDirection: 'row-reverse', alignItems: 'center', flex: 1 }}>
                {match.leagueLogo ? (
                  <Image source={{ uri: match.leagueLogo }} style={{ width: 22, height: 22, resizeMode: 'contain', marginLeft: 7 }} />
                ) : null}
                <Text numberOfLines={1} style={{ color: '#DCECE0', fontSize: 11, fontWeight: '800', flex: 1, textAlign: 'right' }}>
                  {match.league || 'بطولة أخرى'}
                </Text>
              </View>
              {/الشوط الأول|الشوط الثاني|استراحة بين الشوطين|وقت إضافي|ركلات الترجيح|مباشرة/.test(String(match.status || '')) ? (
                <View style={{ backgroundColor: '#153D27', borderColor: GREEN, borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, marginRight: 8, flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: GREEN, marginRight: 5 }} />
                  <Text style={{ color: GREEN, fontSize: 10, fontWeight: '900' }}>مباشر الآن</Text>
                </View>
              ) : null}
            </View>
            <Text style={{ color: '#A9BCAF', textAlign: 'center', fontSize: 11, marginBottom: 13, fontWeight: '700' }}>
              {match.status || 'موعد المباراة'}  •  {match.time || '--:--'}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                {match.homeLogo ? <Image source={{ uri: match.homeLogo }} style={{ width: 42, height: 42, resizeMode: 'contain', marginHorizontal: 6 }} onError={(e) => Alert.alert('خطأ تحميل الشعار', String(e.nativeEvent.error || 'تعذر تحميل الصورة'))} /> : null}
                <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: '900', fontSize: 13 }}>{match.home}</Text>
                <TouchableOpacity onPress={() => toggleFavoriteTeam(match.home)} style={{ padding: 5 }}>
                  <Text style={{ color: favoriteTeams.includes(match.home) ? '#FFD700' : MUTED, fontSize: 19 }}>★</Text>
                </TouchableOpacity>
              </View>
              <View style={{ backgroundColor: '#07100A', paddingHorizontal: 17, paddingVertical: 12, borderRadius: 13, borderWidth: 1, borderColor: '#28623D', minWidth: 76, alignItems: 'center' }}>
                <Text style={{ color: GREEN, fontSize: 17, fontWeight: '900', writingDirection: 'ltr' }}>
                  {Array.isArray(match.score) && match.score.length >= 2
                    ? `${match.score[0]} - ${match.score[1]}`
                    : 'VS'}
                </Text>
              </View>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                {match.awayLogo ? <Image source={{ uri: match.awayLogo }} style={{ width: 34, height: 34, resizeMode: 'contain', marginHorizontal: 5 }} onError={(e) => Alert.alert('خطأ تحميل الشعار', String(e.nativeEvent.error || 'تعذر تحميل الصورة'))} /> : null}
                <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: '900', fontSize: 13 }}>{match.away}</Text>
                <TouchableOpacity onPress={() => toggleFavoriteTeam(match.away)} style={{ padding: 5 }}>
                  <Text style={{ color: favoriteTeams.includes(match.away) ? '#FFD700' : MUTED, fontSize: 19 }}>★</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setSelectedMatch(match)}
              style={{ backgroundColor: '#25352A', borderRadius: 9, padding: 11, alignItems: 'center', marginTop: 13 }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 12 }}>
                تفاصيل المباراة
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => match.streamUrl ? openMatchInsideApp(match.streamUrl) : (match.isSportApiFixture || match.isAfconFixture) ? Alert.alert('تنبيه', 'لا يتوفر رابط بث مطابق لهذه المباراة حالياً.') : match.url ? openMatchInsideApp(match.url) : Alert.alert('تنبيه', 'رابط المباراة غير متوفر.')}
              style={{ backgroundColor: '#153D27', borderRadius: 9, padding: 11, alignItems: 'center', marginTop: 13 }}
            >
              <Text style={{ color: GREEN, fontWeight: '900', fontSize: 12 }}>
                ▶ مشاهدة داخل التطبيق
              </Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <Text style={{ color: MUTED, fontSize: 10, textAlign: 'center', marginTop: 8, marginBottom: 15 }}>
        بيانات المباريات من Fabor TV. يفتح زر التفاصيل صفحة المباراة على موقع المصدر.
      </Text>
    </>
  );

  const Home = () => (
    <>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1400&q=85' }}
        imageStyle={{ borderRadius: 26, opacity: 0.62 }}
        style={{
          backgroundColor: '#10251A',
          borderRadius: 26,
          overflow: 'hidden',
          marginBottom: 27,
          borderWidth: 1,
          borderColor: '#267A46',
          minHeight: 260,
        }}
      >
        <View style={{
          backgroundColor: 'rgba(4,12,7,0.62)',
          padding: 24,
          minHeight: 260,
          justifyContent: 'center',
        }}>
          <Text style={styles.heroSmall}>⚽ شرارة سبورت DZ • عالم كرة القدم</Text>
          <Text style={styles.heroTitle}>عِش شغف</Text>
          <Text style={[styles.heroTitle, { color: GREEN }]}>كرة القدم</Text>
          <Text style={styles.heroDesc}>
            النتائج والمباريات والبطولات العالمية في مكان واحد
          </Text>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => setTab('المباريات')}
          >
            <Text style={styles.heroButtonText}>اكتشف المباريات ←</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <View style={{ marginBottom: 25 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: 'bold', textAlign: 'right', marginBottom: 15 }}>
          الوصول السريع
        </Text>
        <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {[
            { icon: '⚽', label: 'المباريات', tab: 'المباريات' },
            { icon: '📺', label: 'البث المباشر', tab: 'البث المباشر' },
            { icon: '🏆', label: 'البطولات', tab: 'البطولات' },
            { icon: '⭐', label: 'المفضلة', tab: 'المفضلة' },
          ].map(item => (
            <TouchableOpacity
              key={item.tab}
              onPress={() => setTab(item.tab)}
              style={{ flex: 1, alignItems: 'center' }}
              activeOpacity={0.75}
            >
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: '#123522',
                borderWidth: 1.5,
                borderColor: GREEN,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
              }}>
                <Text style={{ fontSize: 25 }}>{item.icon}</Text>
              </View>
              <Text style={{
                color: '#EAF5ED',
                fontSize: 10,
                fontWeight: '600',
                textAlign: 'center',
              }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <SectionTitle title="المباريات" action="عرض الكل" />

      <View style={styles.categories}>
        {categories.map(item => (
          <TouchableOpacity
            key={item}
            onPress={() => setCategory(item)}
            style={[
              styles.category,
              category === item && styles.categoryActive,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                category === item && { color: BG },
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {matchesLoading ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>⚽</Text>
          <Text style={styles.emptyTitle}>جارٍ تحميل المباريات...</Text>
        </View>
      ) : matchesError ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyDesc}>{matchesError}</Text>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => fetchMatches(matchDay)}
          >
            <Text style={styles.heroButtonText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>⚽</Text>
          <Text style={styles.emptyTitle}>لا توجد مباريات متاحة حالياً</Text>
        </View>
      ) : (
        matches.slice(0, 3).map((match, index) => (
          <TouchableOpacity
            key={`${match.url}-home-${index}`}
            activeOpacity={0.85}
            onPress={() => setTab('المباريات')}
            style={{
              backgroundColor: '#101812',
              borderRadius: 18,
              padding: 15,
              marginBottom: 11,
              borderWidth: 1,
              borderColor: '#245235',
            }}
          >
            <Text style={{
              color: GREEN,
              textAlign: 'center',
              fontSize: 11,
              fontWeight: '800',
              marginBottom: 13,
            }}>
              {match.status || 'موعد المباراة'} • {match.time || '--:--'}
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                {match.homeLogo ? <Image source={{ uri: match.homeLogo }} style={{ width: 34, height: 34, resizeMode: 'contain', marginHorizontal: 5 }} onError={(e) => Alert.alert('خطأ تحميل الشعار', String(e.nativeEvent.error || 'تعذر تحميل الصورة'))} /> : null}
                <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: '900', fontSize: 13 }}>{match.home}</Text>
                <TouchableOpacity onPress={() => toggleFavoriteTeam(match.home)} style={{ padding: 5 }}>
                  <Text style={{ color: favoriteTeams.includes(match.home) ? '#FFD700' : MUTED, fontSize: 19 }}>★</Text>
                </TouchableOpacity>
              </View>
              <View style={{
                backgroundColor: '#07100A',
                paddingHorizontal: 13,
                paddingVertical: 9,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#245235',
              }}>
                <Text style={{
                  color: GREEN,
                  fontSize: 16,
                  fontWeight: '900',
                  writingDirection: 'ltr',
                }}>
                  {Array.isArray(match.score) && match.score.length >= 2
                    ? `${match.score[0]} - ${match.score[1]}`
                    : 'VS'}
                </Text>
              </View>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                {match.awayLogo ? <Image source={{ uri: match.awayLogo }} style={{ width: 34, height: 34, resizeMode: 'contain', marginHorizontal: 5 }} onError={(e) => Alert.alert('خطأ تحميل الشعار', String(e.nativeEvent.error || 'تعذر تحميل الصورة'))} /> : null}
                <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: '900', fontSize: 13 }}>{match.away}</Text>
                <TouchableOpacity onPress={() => toggleFavoriteTeam(match.away)} style={{ padding: 5 }}>
                  <Text style={{ color: favoriteTeams.includes(match.away) ? '#FFD700' : MUTED, fontSize: 19 }}>★</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={{
              color: MUTED,
              textAlign: 'center',
              fontSize: 10,
              marginTop: 12,
            }}>اضغط لعرض تفاصيل المباراة ←</Text>
          </TouchableOpacity>
        ))
      )}
      <TouchableOpacity
        onPress={() => setTab('المباريات')}
        style={{
          backgroundColor: '#153D27',
          borderRadius: 13,
          padding: 13,
          alignItems: 'center',
          marginBottom: 25,
        }}
      >
        <Text style={{ color: GREEN, fontWeight: '900' }}>
          عرض جميع المباريات ←
        </Text>
      </TouchableOpacity>

      <SectionTitle title="البث المباشر" action="شاهد المنصات" />

      <TouchableOpacity
        style={styles.broadcastBanner}
        onPress={() => setTab('البث المباشر')}
        activeOpacity={0.85}
      >
        <Text style={styles.broadcastBannerIcon}>📺</Text>
        <View style={styles.broadcastBannerInfo}>
          <Text style={styles.broadcastBannerTitle}>
            منصات البث الرسمية
          </Text>
          <Text style={styles.broadcastBannerDesc}>
            اكتشف طرق مشاهدة المباريات المرخصة
          </Text>
        </View>
        <Text style={styles.arrow}>‹</Text>
      </TouchableOpacity>

      <SectionTitle title="البطولات العالمية" action="استكشف" />

      <View style={styles.leagues}>
        {[
          ['🏆', 'دوري أبطال أوروبا'],
          ['🌍', 'كأس أمم إفريقيا'],
          ['🇬🇧', 'الدوري الإنجليزي'],
          ['🇪🇸', 'الدوري الإسباني'],
          ['🇩🇪', 'الدوري الألماني'],
          ['🇮🇹', 'الدوري الإيطالي'],
          ['🇫🇷', 'الدوري الفرنسي'],
          ['🇪🇺', 'الدوري الأوروبي'],
          ['⭐', 'دوري المؤتمر الأوروبي'],
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.league}
            onPress={() => setTab('البطولات')}
          >
            <Text style={styles.leagueIcon}>{item[0]}</Text>
            <Text style={styles.leagueName}>{item[1]}</Text>
            <Text style={styles.arrow}>‹</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.adBox}>
        <Text style={styles.adLabel}>مساحة إعلانية</Text>
        <Text style={styles.adText}>
          شركاؤنا ورعاتنا يظهرون هنا
        </Text>
      </View>
    </>
  );

  const FavoritesPage = () => (
    <View style={{ paddingBottom: 20 }}>
      <View style={{
        backgroundColor: '#101A14',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#245235',
        padding: 20,
        marginBottom: 16,
      }}>
        <Text style={{ color: GREEN, fontSize: 23, fontWeight: '900', textAlign: 'right' }}>
          ⭐ الفرق المفضلة
        </Text>
        <Text style={{ color: MUTED, fontSize: 13, textAlign: 'right', marginTop: 8 }}>
          تابع فرقك المفضلة بسهولة. يمكنك إضافة الفرق أو إزالتها من نجمة المباراة.
        </Text>
        <Text style={{ color: '#FFD700', fontSize: 15, fontWeight: '900', textAlign: 'right', marginTop: 12 }}>
          عدد الفرق: {favoriteTeams.length}
        </Text>
      </View>

      {favoriteTeams.length > 0 ? favoriteTeams.map((team, index) => (
        <View key={`${team}-${index}`} style={{
          backgroundColor: '#111A15',
          borderRadius: 14,
          borderWidth: 1,
          borderColor: '#294735',
          padding: 15,
          marginBottom: 10,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <TouchableOpacity
            onPress={() => toggleFavoriteTeam(team)}
            style={{ padding: 8 }}
          >
            <Text style={{ color: '#FF6B6B', fontSize: 20 }}>✕</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '900' }}>
              {team}
            </Text>
            <Text style={{ color: MUTED, fontSize: 11, marginTop: 4 }}>
              فريق ضمن مفضلتك
            </Text>
          </View>
          <Text style={{ color: '#FFD700', fontSize: 25, marginLeft: 12 }}>★</Text>
        </View>
      )) : (
        <View style={{
          backgroundColor: '#111A15',
          borderRadius: 16,
          padding: 25,
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: 38 }}>⭐</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '900', marginTop: 12 }}>
            لا توجد فرق مفضلة بعد
          </Text>
          <Text style={{ color: MUTED, textAlign: 'center', marginTop: 8, lineHeight: 22 }}>
            افتح المباريات واضغط على النجمة بجانب اسم الفريق لإضافته هنا.
          </Text>
          <TouchableOpacity
            onPress={() => setTab('المباريات')}
            style={{ backgroundColor: '#153D27', padding: 13, borderRadius: 10, marginTop: 18 }}
          >
            <Text style={{ color: GREEN, fontWeight: '900' }}>انتقل إلى المباريات</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const OtherPage = () => {
    const [selectedLeague, setSelectedLeague] = useState('دوري أبطال أوروبا');

    const [standings, setStandings] = useState([]);
    const [standingsLoading, setStandingsLoading] = useState(false);
    const [standingsError, setStandingsError] = useState('');
    const [leagueFixtures, setLeagueFixtures] = useState({ upcoming: [], results: [] });
    const [leagueFixturesLoading, setLeagueFixturesLoading] = useState(false);
    const [leagueFixturesError, setLeagueFixturesError] = useState('');
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [teamDetails, setTeamDetails] = useState(null);
    const [teamLoading, setTeamLoading] = useState(false);
    const [teamError, setTeamError] = useState('');

    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [playerDetails, setPlayerDetails] = useState(null);
    const [playerLoading, setPlayerLoading] = useState(false);
    const [playerError, setPlayerError] = useState('');

    const loadPlayerDetails = async (player) => {
      if (!player?.slug) {
        setPlayerError('لا تتوفر بيانات هذا اللاعب.');
        return;
      }

      setSelectedPlayer(player);
      setPlayerDetails(null);
      setPlayerError('');
      setPlayerLoading(true);

      try {
        const response = await fetch(
          `https://charara-sport-standings-api.hasnnoui73.workers.dev/players/slug/${encodeURIComponent(player.slug)}`
        );
        const payload = await response.json();

        if (!response.ok || !payload.success || !payload.player) {
          throw new Error('Player details request failed');
        }

        setPlayerDetails({
          ...payload.player,
          team: payload.team,
          league: payload.league,
          season: payload.season,
          career: payload.career,
          matches: payload.matches || [],
        });
      } catch (error) {
        setPlayerError('تعذر تحميل ملف اللاعب حالياً. حاول لاحقاً.');
      } finally {
        setPlayerLoading(false);
      }
    };

    const loadTeamDetails = async (team) => {
      if (!team) return;

      setSelectedTeam(team);
      setTeamDetails(null);
      setTeamError('');
      setTeamLoading(true);

      if (!team.slug) {
        setTeamError('لا تتوفر بيانات قائمة هذا المنتخب في مصدر البيانات الحالي.');
        setTeamLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://charara-sport-standings-api.hasnnoui73.workers.dev/teams/slug/${encodeURIComponent(team.slug)}`
        );
        const payload = await response.json();

        if (!response.ok || !payload.success || !payload.team) {
          throw new Error('Team details request failed');
        }

        setTeamDetails(payload);
      } catch (error) {
        setTeamError('تعذر تحميل مباريات المنتخب حالياً. حاول مرة أخرى.');
      } finally {
        setTeamLoading(false);
      }
    };

    const leagueIds = {
      'كأس أمم إفريقيا': '123',
      'دوري أبطال أوروبا': '18',
      'الدوري الإنجليزي': '24',
      'الدوري الإسباني': '1',
      'الدوري الألماني': '2',
      'الدوري الإيطالي': '3',
      'الدوري الفرنسي': '9',
      'دوري أبطال إفريقيا': '68116',
      'كأس الكونفدرالية الإفريقية': '68117',
      'تصفيات أمم إفريقيا': '72',
      'الدوري الأوروبي': '22',
      'دوري المؤتمر الأوروبي': '23',
      'كأس العالم': '14022',
      'تصفيات كأس العالم الأوروبية': '74',
      'تصفيات كأس العالم لأمريكا الشمالية': '104',
      'الدوري النيجيري': '66',
      'الدوري الجنوب إفريقي': '92',
      'دوري أبطال آسيا للنخبة': '68084',
      'دوري أبطال آسيا 2': '68085',
    };

    useEffect(() => {
      let active = true;
      setStandings([]);
      setStandingsError('');
      setStandingsLoading(true);

      const isAfcon = false; // كأس إفريقيا تستخدم SportAPI Worker
      const isAlgerian = selectedLeague === 'الدوري الجزائري';
      const leagueId = leagueIds[selectedLeague];

      if (!isAfcon && !isAlgerian && !leagueId) {
        setStandingsLoading(false);
        setStandingsError('الترتيب غير متوفر لهذه البطولة من مصدر البيانات الحالي.');
        return () => { active = false; };
      }

      const request = isAfcon
        ? fetch('https://site.api.espn.com/apis/v2/sports/soccer/caf.nations/standings')
            .then(async response => {
              const payload = await response.json();
              if (!response.ok || !Array.isArray(payload.children)) {
                throw new Error('AFCON standings request failed');
              }

              const rows = payload.children.flatMap(group => {
                const entries = group.standings?.entries || [];
                const groupRows = entries.map((entry, index) => {
                  const stats = Object.fromEntries(
                    (entry.stats || []).map(item => [
                      item.name,
                      item.displayValue ?? item.value ?? '0'
                    ])
                  );

                  const number = name => {
                    const value = Number.parseFloat(
                      String(stats[name] ?? '0').replace('+', '')
                    );
                    return Number.isFinite(value) ? value : 0;
                  };

                  return {
                    group: group.name,
                    position: number('rank') || index + 1,
                    team: {
                      id: entry.team?.id,
                      name: entry.team?.displayName || entry.team?.name || '—',
                      short_name: entry.team?.shortDisplayName || entry.team?.abbreviation || entry.team?.name || '—',
                    },
                    played: number('gamesPlayed'),
                    won: number('wins'),
                    draw: number('ties'),
                    lost: number('losses'),
                    goals_for: number('pointsFor'),
                    goals_against: number('pointsAgainst'),
                    goal_difference: number('pointDifferential'),
                    points: number('points'),
                  };
                });

                return groupRows.sort((a, b) => a.position - b.position);
              });

              if (!rows.length) throw new Error('No AFCON standings');
              return rows;
            })
        : isAlgerian
          ? fetch('https://charara-standings-api.hasnnoui73.workers.dev/standings?league=186&season=2024')
              .then(async response => {
                const payload = await response.json();
                const groups = payload.data?.response || [];
                const entries = groups.flatMap(item => item.league?.standings || []);

                if (!response.ok || !payload.success || !entries.length) {
                  throw new Error('Algerian standings unavailable');
                }

                return entries.map(row => ({
                  group: 'الدوري الجزائري • موسم 2024',
                  position: row.rank,
                  team: {
                    id: row.team?.id,
                    name: row.team?.name || '—',
                    short_name: row.team?.name || '—',
                  },
                  played: row.all?.played ?? 0,
                  won: row.all?.win ?? 0,
                  draw: row.all?.draw ?? 0,
                  lost: row.all?.lose ?? 0,
                  goals_for: row.all?.goals?.for ?? 0,
                  goals_against: row.all?.goals?.against ?? 0,
                  goal_difference: row.goalsDiff ?? 0,
                  points: row.points ?? 0,
                }));
              })
          : fetch(`https://charara-sport-standings-api.hasnnoui73.workers.dev/standings/${leagueId}`)
              .then(async response => {
              const payload = await response.json();
              if (!response.ok || !payload.success || !Array.isArray(payload.data)) {
                throw new Error('Standings request failed');
              }
              let rows = payload.data;

              const espnLeagueCodes = {
            '123': 'caf.nations',
            '18': 'uefa.champions',
            '24': 'eng.1',
            '1': 'esp.1',
            '2': 'ger.1',
            '3': 'ita.1',
            '9': 'fra.1',
            '22': 'uefa.europa',
            '23': 'uefa.europa.conf',
          };

          const espnCode = espnLeagueCodes[String(leagueId)];

          if (espnCode) {
            try {
              const espnResponse = await fetch(
                'https://site.api.espn.com/apis/v2/sports/soccer/' +
                espnCode + '/standings'
              );

              if (!espnResponse.ok) {
                throw new Error('ESPN logos request failed');
              }

              const espnPayload = await espnResponse.json();
              const logoMap = new Map();

              const normalizeName = value => {
                const name = String(value || '')
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, '');

                const aliases = {
                  psg: 'parissaintgermain',
                  parissg: 'parissaintgermain',
                  internazionale: 'intermilan',
                  inter: 'intermilan',
                  manutd: 'manchesterunited',
                  manunited: 'manchesterunited',
                  brighton: 'brightonandhovealbion',
                  leverkusen: 'bayerleverkusen',
                };

                return aliases[name] || name;
              };

              (espnPayload.children || []).forEach(group => {
                (group.standings?.entries || []).forEach(entry => {
                  const name = normalizeName(
                    entry.team?.displayName || entry.team?.name
                  );
                  const logo = entry.team?.logos?.[0]?.href;
                  if (name && logo) logoMap.set(name, logo);
                });
              });

              rows = rows.map(row => {
                const name = normalizeName(row.team?.name);
                return {
                  ...row,
                  team: {
                    ...row.team,
                    logo: logoMap.get(name) || row.team?.logo || '',
                  },
                };
              });
            } catch (error) {
              console.log('Team logos unavailable:', error.message);
            }
          }

          return rows;
            });

      request
        .then(data => {
          if (active) setStandings(data);
        })
        .catch(() => {
          if (active) {
            setStandingsError('تعذر تحميل الترتيب حالياً. حاول مرة أخرى لاحقاً.');
          }
        })
        .finally(() => {
          if (active) setStandingsLoading(false);
        });

      return () => { active = false; };
    }, [selectedLeague]);


    useEffect(() => {
      if (selectedLeague !== 'تصفيات أمم إفريقيا' && selectedLeague !== 'كأس أمم إفريقيا') return;
      const afconLeagueId = selectedLeague === 'كأس أمم إفريقيا' ? '123' : '72';

      const refreshAfconStandings = async () => {
        try {
          const response = await fetch(
            `https://charara-sport-standings-api.hasnnoui73.workers.dev/standings/${afconLeagueId}`
          );
          const payload = await response.json();

          if (response.ok && payload.success && Array.isArray(payload.data)) {
            setStandings(payload.data);
            setStandingsError('');
          }
        } catch (error) {
          console.log('AFCON standings refresh error:', error.message);
        }
      };

      const interval = setInterval(refreshAfconStandings, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }, [selectedLeague]);

    useEffect(() => {
      const leagueId = leagueIds[selectedLeague];
      let active = true;

      setLeagueFixtures({ upcoming: [], results: [] });
      setLeagueFixturesError('');

      if (!leagueId) {
        setLeagueFixturesLoading(false);
        setLeagueFixturesError('مواعيد الدوري الجزائري غير متاحة من المصدر الحالي.');
        return () => { active = false; };
      }

      const loadLeagueFixtures = async () => {
        setLeagueFixturesLoading(true);
        try {
          const response = await fetch(
            AFCON_API_URL + 'league-fixtures/' + leagueId
          );
          const payload = await response.json();

          if (!response.ok || !payload.success || !payload.data) {
            throw new Error('League fixtures request failed');
          }

          if (active) {
            setLeagueFixtures({
              upcoming: Array.isArray(payload.data.upcoming_fixtures)
                ? payload.data.upcoming_fixtures : [],
              results: Array.isArray(payload.data.recent_results)
                ? payload.data.recent_results : [],
            });
            setLeagueFixturesError('');
          }
        } catch (error) {
          if (active) {
            setLeagueFixtures({ upcoming: [], results: [] });
            setLeagueFixturesError('تعذر تحميل مباريات البطولة حالياً. حاول لاحقاً.');
          }
        } finally {
          if (active) setLeagueFixturesLoading(false);
        }
      };

      loadLeagueFixtures();
      const interval = setInterval(loadLeagueFixtures, 5 * 60 * 1000);

      return () => {
        active = false;
        clearInterval(interval);
      };
    }, [selectedLeague]);

    const leagues = [
      { name: 'دوري أبطال أوروبا', country: 'أوروبا', icon: '🏆', color: '#D9B45B' },
      { name: 'الدوري الإنجليزي', country: 'إنجلترا', icon: '🏴', color: '#A78BFA' },
      { name: 'الدوري الإسباني', country: 'إسبانيا', icon: '🇪🇸', color: '#F87171' },
      { name: 'الدوري الألماني', country: 'ألمانيا', icon: '🇩🇪', color: '#FBBF24' },
      { name: 'الدوري الإيطالي', country: 'إيطاليا', icon: '🇮🇹', color: '#60A5FA' },
      { name: 'الدوري الفرنسي', country: 'فرنسا', icon: '🇫🇷', color: '#818CF8' },
      { name: 'الدوري الجزائري', country: 'الجزائر • موسم 2024', icon: '🇩🇿', color: '#34D399' },
      { name: 'الدوري الأوروبي', country: 'أوروبا', icon: '🏆', color: '#F97316' },
      { name: 'دوري المؤتمر الأوروبي', country: 'أوروبا', icon: '🏆', color: '#A3A3A3' },
      { name: 'دوري أبطال إفريقيا', country: 'إفريقيا', icon: '🏆', color: '#FBBF24' },
      { name: 'كأس الكونفدرالية الإفريقية', country: 'إفريقيا', icon: '🏆', color: '#D97706' },
      { name: 'تصفيات أمم إفريقيا', country: 'إفريقيا', icon: '🌍', color: '#34D399' },
      { name: 'كأس أمم إفريقيا', country: 'إفريقيا • نسخة 2025', icon: '🏆', color: '#FBBF24' },
      { name: 'كأس العالم', country: 'العالم • FIFA', icon: '🌍', color: '#34D399' },
      { name: 'تصفيات كأس العالم الأوروبية', country: 'أوروبا', icon: '🌍', color: '#60A5FA' },
      { name: 'تصفيات كأس العالم لأمريكا الشمالية', country: 'أمريكا الشمالية والوسطى', icon: '🌎', color: '#F87171' },
      { name: 'الدوري النيجيري', country: 'نيجيريا • إفريقيا', icon: '🇳🇬', color: '#34D399' },
      { name: 'الدوري الجنوب إفريقي', country: 'جنوب إفريقيا', icon: '🇿🇦', color: '#FBBF24' },
      { name: 'دوري أبطال آسيا للنخبة', country: 'آسيا', icon: '🏆', color: '#60A5FA' },
      { name: 'دوري أبطال آسيا 2', country: 'آسيا', icon: '🏆', color: '#A78BFA' },
    ];

    if (tab === 'البطولات') {
      return (
        <View style={{ gap: 18, paddingBottom: 20 }}>
          <View style={{
            backgroundColor: '#101A14',
            borderWidth: 1,
            borderColor: '#245235',
            borderRadius: 22,
            padding: 20,
          }}>
            <Text style={{ color: GREEN, fontSize: 13, fontWeight: 'bold', textAlign: 'right' }}>
              CHARARA SPORT • LEAGUES
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 25, fontWeight: 'bold', textAlign: 'right', marginTop: 10 }}>
              عالم البطولات
            </Text>
            <Text style={{ color: MUTED, fontSize: 13, textAlign: 'right', marginTop: 7, lineHeight: 22 }}>
              اختر البطولة لمتابعة معلوماتها والترتيب عند توفر البيانات الرسمية.
            </Text>
          </View>

          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', textAlign: 'right' }}>
  اختر البطولة
</Text>

<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={{
    flexDirection: 'row-reverse',
    gap: 10,
    paddingVertical: 8,
  }}
>
  {leagues.map((league) => {
    const active = selectedLeague === league.name;
    return (
      <TouchableOpacity
        key={league.name}
        onPress={() => setSelectedLeague(league.name)}
        activeOpacity={0.8}
        style={{
          width: 155,
          minHeight: 112,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: active ? '#173522' : '#101713',
          borderWidth: active ? 2 : 1,
          borderColor: active ? GREEN : '#26372D',
          borderRadius: 17,
          padding: 12,
        }}
      >
        <Text style={{ fontSize: 27 }}>{league.icon}</Text>
        <Text
          numberOfLines={2}
          style={{
            color: active ? GREEN : '#FFFFFF',
            fontSize: 13,
            fontWeight: 'bold',
            textAlign: 'center',
            marginTop: 8,
          }}
        >
          {league.name}
        </Text>
        <Text style={{ color: MUTED, fontSize: 11, marginTop: 4 }}>
          {league.country}
        </Text>
      </TouchableOpacity>
    );
  })}
</ScrollView>
          <View style={{
            backgroundColor: '#101A14',
            borderWidth: 1,
            borderColor: '#245235',
            borderRadius: 20,
            padding: 18,
            marginTop: 4,
          }}>
            <Text style={{ color: GREEN, fontSize: 12, fontWeight: 'bold', textAlign: 'right' }}>
              البطولة المختارة
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 19, fontWeight: 'bold', textAlign: 'right', marginTop: 9 }}>
              {selectedLeague}
            </Text>
            <View style={{
              backgroundColor: '#19251E',
              borderRadius: 12,
              padding: 14,
              marginTop: 15,
            }}>
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', textAlign: 'right' }}>
                جدول الترتيب
              </Text>
              {standingsLoading ? (
                <Text style={{ color: MUTED, fontSize: 13, textAlign: 'right', marginTop: 12 }}>
                  جاري تحميل الترتيب...
                </Text>
              ) : standingsError ? (
                <Text style={{ color: MUTED, fontSize: 13, textAlign: 'right', marginTop: 12, lineHeight: 23 }}>
                  {standingsError}
                </Text>
              ) : standings.length > 0 ? (
                <View style={{ marginTop: 14 }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#203329',
                    paddingVertical: 11,
                    paddingHorizontal: 5,
                    borderRadius: 9,
                  }}>
                    <Text style={{ color: GREEN, width: 32, textAlign: 'center', fontSize: 11, fontWeight: '900' }}>م</Text>
                    <Text style={{ color: GREEN, flex: 1, textAlign: 'right', fontSize: 11, fontWeight: '900' }}>الفريق</Text>
                    <Text style={{ color: GREEN, width: 30, textAlign: 'center', fontSize: 10, fontWeight: '900' }}>لعب</Text>
                    {selectedLeague === 'تصفيات أمم إفريقيا' && <>
                      <Text style={{ color: GREEN, width: 23, textAlign: 'center', fontSize: 10, fontWeight: '900' }}>ف</Text>
                      <Text style={{ color: GREEN, width: 23, textAlign: 'center', fontSize: 10, fontWeight: '900' }}>ت</Text>
                      <Text style={{ color: GREEN, width: 23, textAlign: 'center', fontSize: 10, fontWeight: '900' }}>خ</Text>
                    </>}
                    <Text style={{ color: GREEN, width: 34, textAlign: 'center', fontSize: 10, fontWeight: '900' }}>فارق</Text>
                    <Text style={{ color: GREEN, width: 38, textAlign: 'center', fontSize: 11, fontWeight: '900' }}>نقاط</Text>
                  </View>

                  {standings.map((row, index) => (
                    <View key={`${row.group || selectedLeague}-${row.team?.id || row.position || index}`}>
                      {row.group && (index === 0 || standings[index - 1]?.group !== row.group) ? (
                        <Text style={{ color: '#FBBF24', fontSize: 14, fontWeight: '900', textAlign: 'right', marginTop: 16, marginBottom: 5 }}>
                          {row.group}
                        </Text>
                      ) : null}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: 13,
                          paddingHorizontal: 5,
                          borderBottomWidth: 1,
                          borderBottomColor: '#26372D',
                        }}
                      >
                        <Text style={{ color: MUTED, width: 32, textAlign: 'center', fontSize: 12 }}>
                          {row.position ?? index + 1}
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            if (row.team) {
                              loadTeamDetails(row.team);
                            }
                          }}
                          activeOpacity={0.7}
                          style={{ flex: 1 }}
                        >
                          <Text numberOfLines={1} style={{
                            color: ['تصفيات أمم إفريقيا', 'كأس أمم إفريقيا'].includes(selectedLeague) ? GREEN : '#FFFFFF',
                            textAlign: 'right',
                            fontSize: 12,
                            fontWeight: 'bold',
                          }}>
                            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', flex: 1 }}>
                        {row.team?.logo ? (
                          <Image
                            source={{ uri: row.team.logo }}
                            style={{ width: 24, height: 24, marginLeft: 8 }}
                            resizeMode="contain"
                          />
                        ) : null}
                        <Text numberOfLines={1} style={{ flex: 1, color: ['تصفيات أمم إفريقيا', 'كأس أمم إفريقيا'].includes(selectedLeague) ? GREEN : '#FFFFFF', textAlign: 'right', fontSize: 12, fontWeight: 'bold' }}>
                          {row.team?.short_name || row.team?.name || '—'}
                        </Text>
                      </View>
                          </Text>
                        </TouchableOpacity>
                        <Text style={{ color: '#FFFFFF', width: 30, textAlign: 'center', fontSize: 11 }}>
                          {row.played ?? 0}
                        </Text>
                        {selectedLeague === 'تصفيات أمم إفريقيا' && <>
                          <Text style={{ color: '#34D399', width: 23, textAlign: 'center', fontSize: 11 }}>{row.won ?? 0}</Text>
                          <Text style={{ color: '#FBBF24', width: 23, textAlign: 'center', fontSize: 11 }}>{row.draw ?? 0}</Text>
                          <Text style={{ color: '#F87171', width: 23, textAlign: 'center', fontSize: 11 }}>{row.lost ?? 0}</Text>
                        </>}
                        <Text style={{ color: '#FFFFFF', width: 34, textAlign: 'center', fontSize: 11 }}>
                          {row.goal_difference > 0 ? `+${row.goal_difference}` : (row.goal_difference ?? 0)}
                        </Text>
                        <Text style={{ color: GREEN, width: 38, textAlign: 'center', fontSize: 13, fontWeight: '900' }}>
                          {row.points ?? 0}
                        </Text>
                      </View>
                      {selectedLeague === 'تصفيات أمم إفريقيا' && Array.isArray(row.form) && row.form.length > 0 && (
                        <View style={{ alignItems: 'flex-end', paddingHorizontal: 8, paddingBottom: 9 }}>
                          <Text style={{ color: MUTED, fontSize: 10, marginBottom: 5 }}>آخر النتائج</Text>
                          <View style={{ flexDirection: 'row', gap: 5 }}>
                            {row.form.slice(-5).map((item, formIndex) => {
                              const result = item.result;
                              const resultColor = result === 'W' ? '#34D399' : result === 'D' ? '#FBBF24' : '#F87171';
                              const resultLabel = result === 'W' ? 'ف' : result === 'D' ? 'ت' : 'خ';
                              return (
                                <View key={item.date || formIndex} style={{
                                  width: 23,
                                  height: 23,
                                  borderRadius: 6,
                                  backgroundColor: resultColor + '22',
                                  borderWidth: 1,
                                  borderColor: resultColor,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                  <Text style={{ color: resultColor, fontSize: 11, fontWeight: '900' }}>{resultLabel}</Text>
                                </View>
                              );
                            })}
                          </View>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={{ color: MUTED, fontSize: 13, textAlign: 'right', marginTop: 12 }}>
                  لا توجد بيانات ترتيب متاحة حالياً.
                </Text>
              )}
            </View>

            <View style={{
              backgroundColor: '#111A15',
              borderWidth: 1,
              borderColor: '#245235',
              borderRadius: 14,
              padding: 14,
              marginTop: 15,
            }}>
              <Text style={{ color: GREEN, fontSize: 15, fontWeight: '900', textAlign: 'right' }}>
                مباريات البطولة
              </Text>

              {leagueFixturesLoading ? (
                <Text style={{ color: MUTED, textAlign: 'right', marginTop: 12 }}>
                  جاري تحميل مباريات البطولة...
                </Text>
              ) : leagueFixturesError ? (
                <Text style={{ color: MUTED, textAlign: 'right', marginTop: 12, lineHeight: 22 }}>
                  {leagueFixturesError}
                </Text>
              ) : (
                <>
                  <Text style={{ color: GREEN, fontWeight: '900', textAlign: 'right', marginTop: 15, marginBottom: 9 }}>
                    المباريات القادمة
                  </Text>
                  {leagueFixtures.upcoming.length ? (
                    leagueFixtures.upcoming.slice(0, 10).map((match, index) => (
                      <View key={String(match.id || index)} style={{
                        backgroundColor: '#19251E',
                        borderRadius: 9,
                        padding: 11,
                        marginBottom: 7,
                      }}>
                        <Text style={{ color: MUTED, textAlign: 'right', fontSize: 10 }}>
                          {match.date || match.datetime || '—'} • {match.stage || ''}
                        </Text>
                        <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: 13, fontWeight: 'bold', marginTop: 7 }}>
                          {match.home_team || '—'} ضد {match.away_team || '—'}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={{ color: MUTED, textAlign: 'right', fontSize: 12 }}>
                      لا توجد مباريات قادمة مسجلة حالياً.
                    </Text>
                  )}

                  <Text style={{ color: GREEN, fontWeight: '900', textAlign: 'right', marginTop: 15, marginBottom: 9 }}>
                    آخر النتائج
                  </Text>
                  {leagueFixtures.results.length ? (
                    leagueFixtures.results.slice(0, 10).map((match, index) => (
                      <View key={String(match.id || index)} style={{
                        backgroundColor: '#19251E',
                        borderRadius: 9,
                        padding: 11,
                        marginBottom: 7,
                      }}>
                        <Text style={{ color: MUTED, textAlign: 'right', fontSize: 10 }}>
                          {match.date || '—'} • {match.stage || ''}
                        </Text>
                        <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: 13, fontWeight: 'bold', marginTop: 7 }}>
                          {match.home_team || '—'} {match.home_score ?? '—'} - {match.away_score ?? '—'} {match.away_team || '—'}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={{ color: MUTED, textAlign: 'right', fontSize: 12 }}>
                      لا توجد نتائج سابقة مسجلة حالياً.
                    </Text>
                  )}
                </>
              )}
            </View>

            {['تصفيات أمم إفريقيا', 'كأس أمم إفريقيا'].includes(selectedLeague) && selectedTeam && (
              <View style={{
                backgroundColor: '#111A15',
                borderWidth: 1,
                borderColor: '#245235',
                borderRadius: 15,
                padding: 14,
                marginTop: 15,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedTeam(null);
                      setTeamDetails(null);
                      setTeamError('');
                    }}
                    style={{ padding: 7 }}
                  >
                    <Text style={{ color: '#F87171', fontSize: 13, fontWeight: 'bold' }}>إغلاق ✕</Text>
                  </TouchableOpacity>
                  <Text style={{ color: GREEN, fontSize: 17, fontWeight: '900', textAlign: 'right', flex: 1 }}>
                    {teamDetails?.team?.name || selectedTeam.name || selectedTeam.short_name}
                  </Text>
                </View>

                {teamDetails?.team?.coach_name ? (
                  <Text style={{ color: MUTED, textAlign: 'right', fontSize: 11, marginTop: 5 }}>
                    المدرب: {teamDetails.team.coach_name}
                  </Text>
                ) : null}

                {teamLoading ? (
                  <Text style={{ color: MUTED, textAlign: 'right', marginTop: 15 }}>
                    جاري تحميل مباريات المنتخب...
                  </Text>
                ) : teamError ? (
                  <Text style={{ color: '#F87171', textAlign: 'right', marginTop: 15 }}>
                    {teamError}
                  </Text>
                ) : teamDetails ? (
                  <>
                    <Text style={{ color: GREEN, textAlign: 'right', fontWeight: '900', marginTop: 18, marginBottom: 9 }}>
                      المباريات السابقة
                    </Text>
                    {teamDetails.results?.length ? teamDetails.results.map((match, index) => (
                      <View key={match.id || index} style={{
                        backgroundColor: '#19251E',
                        borderRadius: 9,
                        padding: 11,
                        marginBottom: 7,
                      }}>
                        <Text style={{ color: MUTED, textAlign: 'right', fontSize: 10 }}>
                          {match.date || '—'} • {match.league_name || ''}
                        </Text>
                        <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: 13, fontWeight: 'bold', marginTop: 7 }}>
                          {match.home_team}  {match.home_score ?? '—'} - {match.away_score ?? '—'}  {match.away_team}
                        </Text>
                      </View>
                    )) : (
                      <Text style={{ color: MUTED, textAlign: 'right', fontSize: 12 }}>لا توجد مباريات سابقة.</Text>
                    )}

                    <Text style={{ color: GREEN, textAlign: 'right', fontWeight: '900', marginTop: 15, marginBottom: 9 }}>
                      المباريات القادمة
                    </Text>
                    {teamDetails.upcoming?.length ? teamDetails.upcoming.map((match, index) => (
                      <View key={match.id || index} style={{
                        backgroundColor: '#19251E',
                        borderRadius: 9,
                        padding: 11,
                        marginBottom: 7,
                      }}>
                        <Text style={{ color: MUTED, textAlign: 'right', fontSize: 10 }}>
                          {match.date || '—'} • {match.league_name || ''}
                        </Text>
                        <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: 13, fontWeight: 'bold', marginTop: 7 }}>
                          {match.home_team}  ضد  {match.away_team}
                        </Text>
                        <Text style={{ color: GREEN, textAlign: 'center', fontSize: 11, marginTop: 5 }}>
                          {match.datetime || match.status || ''}
                        </Text>
                      </View>
                    )) : (
                      <Text style={{ color: MUTED, textAlign: 'right', fontSize: 12 }}>لا توجد مباريات قادمة حالياً.</Text>
                    )}

                    <Text style={{ color: GREEN, textAlign: 'right', fontWeight: '900', marginTop: 20, marginBottom: 10 }}>
                      قائمة لاعبي المنتخب ({teamDetails.squad?.length || 0})
                    </Text>
                    {teamDetails.squad?.length ? teamDetails.squad.map((player, index) => (
                      <TouchableOpacity
                        key={player.slug || index}
                        activeOpacity={0.8}
                        onPress={() => loadPlayerDetails(player)}
                        style={{
                          backgroundColor: '#19251E',
                          borderRadius: 9,
                          padding: 11,
                          marginBottom: 7,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text style={{ color: GREEN, fontSize: 13, fontWeight: '900' }}>
                          #{player.jersey_number ?? '—'}
                        </Text>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={{ color: '#FFFFFF', textAlign: 'right', fontSize: 13, fontWeight: 'bold' }}>
                            {player.full_name || 'لاعب'}
                          </Text>
                          <Text style={{ color: MUTED, textAlign: 'right', fontSize: 11, marginTop: 4 }}>
                            {player.position === 'Goalkeeper' ? 'حارس مرمى' :
                             player.position === 'Defender' ? 'مدافع' :
                             player.position === 'Midfielder' ? 'وسط ميدان' :
                             player.position === 'Attacker' || player.position === 'Forward' ? 'مهاجم' :
                             player.position || 'غير محدد'}
                          </Text>
                          <Text style={{ color: GREEN, textAlign: 'right', fontSize: 10, marginTop: 4 }}>
                            اضغط لعرض ملف اللاعب
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )) : (
                      <Text style={{ color: MUTED, textAlign: 'right', fontSize: 12 }}>
                        لا تتوفر قائمة اللاعبين حالياً.
                      </Text>
                    )}

                    {selectedPlayer ? (
                      <View style={{
                        backgroundColor: '#19251E',
                        borderColor: '#245235',
                        borderWidth: 1,
                        borderRadius: 12,
                        padding: 14,
                        marginTop: 12,
                      }}>
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedPlayer(null);
                            setPlayerDetails(null);
                            setPlayerError('');
                          }}
                          style={{ alignSelf: 'flex-start', padding: 6 }}
                        >
                          <Text style={{ color: GREEN, fontWeight: '900' }}>إغلاق ✕</Text>
                        </TouchableOpacity>

                        {playerLoading ? (
                          <Text style={{ color: MUTED, textAlign: 'center', padding: 18 }}>
                            جارٍ تحميل ملف اللاعب...
                          </Text>
                        ) : playerError ? (
                          <Text style={{ color: '#FF8A80', textAlign: 'center', padding: 12 }}>
                            {playerError}
                          </Text>
                        ) : playerDetails ? (
                          <>
                            {playerDetails.photo_url ? (
                              <Image
                                source={{ uri: playerDetails.photo_url }}
                                style={{ width: 110, height: 110, borderRadius: 55, alignSelf: 'center', marginBottom: 12, backgroundColor: '#26352B' }}
                                resizeMode="cover"
                              />
                            ) : (
                              <View style={{ width: 110, height: 110, borderRadius: 55, alignSelf: 'center', marginBottom: 12, backgroundColor: '#26352B', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: GREEN }}>
                                <Text style={{ color: GREEN, fontSize: 38, fontWeight: '900' }}>
                                  {(playerDetails.full_name || selectedPlayer.full_name || '?').charAt(0)}
                                </Text>
                                <Text style={{ color: MUTED, fontSize: 9, marginTop: 3 }}>لا توجد صورة</Text>
                              </View>
                            )}

                            <Text style={{ color: GREEN, textAlign: 'center', fontSize: 17, fontWeight: '900' }}>
                              {playerDetails.full_name || playerDetails.name || selectedPlayer.full_name}
                            </Text>
                            <Text style={{ color: MUTED, textAlign: 'center', fontSize: 12, marginTop: 6 }}>
                              {playerDetails.position || selectedPlayer.position || 'المركز غير متوفر'}
                            </Text>
                            <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: 12, marginTop: 8 }}>
                              {playerDetails.team?.full_name || 'النادي غير متوفر'}
                            </Text>
                            <Text style={{ color: MUTED, textAlign: 'center', fontSize: 11, marginTop: 4 }}>
                              {playerDetails.league?.name || 'البطولة غير متوفرة'}
                            </Text>

                            <View style={{ marginTop: 14, gap: 9 }}>
                              <Text style={{ color: '#FFFFFF', textAlign: 'right', fontSize: 12 }}>الجنسية: {playerDetails.nationality || selectedPlayer.nationality || 'غير متوفرة'}</Text>
                              <Text style={{ color: '#FFFFFF', textAlign: 'right', fontSize: 12 }}>رقم القميص: {playerDetails.jersey_number ?? selectedPlayer.jersey_number ?? '—'}</Text>
                              <Text style={{ color: '#FFFFFF', textAlign: 'right', fontSize: 12 }}>تاريخ الميلاد: {playerDetails.date_of_birth || 'غير متوفر'}</Text>
                              <Text style={{ color: '#FFFFFF', textAlign: 'right', fontSize: 12 }}>الطول: {playerDetails.height || 'غير متوفر'}</Text>
                              <Text style={{ color: '#FFFFFF', textAlign: 'right', fontSize: 12 }}>الوزن: {playerDetails.weight || 'غير متوفر'}</Text>
                            </View>

                            <View style={{ marginTop: 18, padding: 12, backgroundColor: '#111A15', borderRadius: 12 }}>
                              <Text style={{ color: GREEN, textAlign: 'right', fontSize: 14, fontWeight: '900', marginBottom: 12 }}>إحصائيات الموسم</Text>
                              {[
                                ['المشاركات', playerDetails.season?.appearances],
                                ['المباريات أساسياً', playerDetails.season?.starts],
                                ['دقائق اللعب', playerDetails.season?.minutes],
                                ['الأهداف', playerDetails.season?.goals],
                                ['التمريرات الحاسمة', playerDetails.season?.assists],
                                ['التصديات', playerDetails.season?.saves],
                                ['التمريرات', playerDetails.season?.passes],
                                ['دقة التمرير', playerDetails.season?.pass_accuracy == null ? null : playerDetails.season.pass_accuracy + '%'],
                                ['البطاقات الصفراء', playerDetails.season?.yellow],
                                ['البطاقات الحمراء', playerDetails.season?.red],
                              ].map(([label, value]) => (
                                <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#26352B' }}>
                                  <Text style={{ color: '#FFFFFF', fontSize: 12 }}>{value ?? '—'}</Text>
                                  <Text style={{ color: MUTED, fontSize: 12 }}>{label}</Text>
                                </View>
                              ))}
                            </View>

                            <View style={{ marginTop: 12, padding: 12, backgroundColor: '#111A15', borderRadius: 12 }}>
                              <Text style={{ color: GREEN, textAlign: 'right', fontSize: 14, fontWeight: '900', marginBottom: 12 }}>إحصائيات المسيرة</Text>
                              {[
                                ['المشاركات', playerDetails.career?.appearances],
                                ['دقائق اللعب', playerDetails.career?.minutes],
                                ['الأهداف', playerDetails.career?.goals],
                                ['التمريرات الحاسمة', playerDetails.career?.assists],
                                ['التصديات', playerDetails.career?.saves],
                                ['التمريرات', playerDetails.career?.passes],
                                ['دقة التمرير', playerDetails.career?.pass_accuracy == null ? null : playerDetails.career.pass_accuracy + '%'],
                              ].map(([label, value]) => (
                                <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#26352B' }}>
                                  <Text style={{ color: '#FFFFFF', fontSize: 12 }}>{value ?? '—'}</Text>
                                  <Text style={{ color: MUTED, fontSize: 12 }}>{label}</Text>
                                </View>
                              ))}
                            </View>

                            <View style={{ marginTop: 12, padding: 12, backgroundColor: '#111A15', borderRadius: 12 }}>
                              <Text style={{ color: GREEN, textAlign: 'right', fontSize: 14, fontWeight: '900', marginBottom: 12 }}>آخر خمس مباريات</Text>
                              {playerDetails.matches?.length ? (
                                playerDetails.matches.slice(0, 5).map((match, index) => (
                                  <View key={String(match.fixture_id || index)} style={{ paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#26352B' }}>
                                    <Text style={{ color: '#FFFFFF', textAlign: 'right', fontSize: 12, fontWeight: 'bold' }}>
                                      {match.home_team || '—'} {match.home_score ?? '—'} - {match.away_score ?? '—'} {match.away_team || '—'}
                                    </Text>
                                    <Text style={{ color: MUTED, textAlign: 'right', fontSize: 10, marginTop: 4 }}>
                                      {match.date || 'التاريخ غير متوفر'} • {match.league_name || ''}
                                    </Text>
                                    <Text style={{ color: MUTED, textAlign: 'right', fontSize: 10, marginTop: 3 }}>
                                      الدقائق: {match.mins_played ?? '—'} • الأهداف: {match.goals ?? 0} • التمريرات الحاسمة: {match.assists ?? 0}
                                    </Text>
                                  </View>
                                ))
                              ) : (
                                <Text style={{ color: MUTED, textAlign: 'right', fontSize: 12 }}>لا تتوفر مباريات حديثة لهذا اللاعب.</Text>
                              )}
                            </View>
                          </>
                        ) : null}
                      </View>
                    ) : null}
                  </>
                ) : null}
              </View>
            )}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.pageCard}>
        <Text style={styles.pageIcon}>👤</Text>
        <Text style={styles.pageTitle}>حسابي</Text>
        <Text style={styles.pageDesc}>
          قريباً: حسابك الشخصي وعضوية شرارة Premium.
        </Text>

        <Text style={{ color: GREEN, fontWeight: "900", marginTop: 18, marginBottom: 10 }}>
          لغة التطبيق / App language
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 8 }}>
          {[
            { code: "ar", label: "العربية" },
            { code: "fr", label: "Français" },
            { code: "en", label: "English" }
          ].map(item => (
            <TouchableOpacity
              key={item.code}
              onPress={() => setLanguage(item.code)}
              style={{
                backgroundColor: language === item.code ? "#153D27" : PANEL,
                borderWidth: 1,
                borderColor: language === item.code ? GREEN : "#26372D",
                paddingVertical: 11,
                paddingHorizontal: 13,
                borderRadius: 10
              }}
            >
              <Text style={{ color: language === item.code ? GREEN : "#FFFFFF", fontWeight: "bold" }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.coming}>قريباً بإذن الله</Text>
                <TouchableOpacity
                  onPress={() => setSoundEnabled(v => !v)}
                  style={{ backgroundColor: '#153D27', padding: 15, borderRadius: 12, marginTop: 18, alignItems: 'center' }}
                >
                  <Text style={{ color: GREEN, fontWeight: '900' }}>
                    {soundEnabled ? '🔊 الصوت مفعّل' : '🔇 الصوت مكتوم'}
                  </Text>
                </TouchableOpacity>
        <Text style={{ color: GREEN, fontSize: 14, textAlign: 'center', marginTop: 18, fontWeight: 'bold' }}>
          🔔 حالة الإشعارات
        </Text>
        <Text style={{ color: MUTED, fontSize: 13, textAlign: 'center', marginTop: 8 }}>
          {pushStatus}
        </Text>
        <Text style={{ color: MUTED, fontSize: 11, textAlign: 'center', marginTop: 6 }}>
          الإشعارات التلقائية للأهداف تحتاج ربط خادم الإرسال.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor={BG} barStyle="light-content" />

      <Header />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {internalMatchUrl ? (
          <View style={{ height: 650, backgroundColor: PANEL, borderRadius: 14, overflow: 'hidden', marginBottom: 15 }}>
            <TouchableOpacity
              onPress={() => setInternalMatchUrl('')}
              style={{ backgroundColor: '#153D27', padding: 14, alignItems: 'center' }}
            >
              <Text style={{ color: GREEN, fontWeight: '900' }}>
                ← العودة إلى المباريات
              </Text>
            </TouchableOpacity>

            <WebView
              source={{ uri: internalMatchUrl }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsFullscreenVideo={true}
              setSupportMultipleWindows={false}
              javaScriptCanOpenWindowsAutomatically={false}
              startInLoadingState={true}
              style={{ flex: 1, backgroundColor: BG }}
            />
          </View>
        ) : selectedMatch ? (
          <>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1400&q=85' }}
            style={{
              borderRadius: 22,
              overflow: 'hidden',
              marginBottom: 18,
              borderWidth: 1,
              borderColor: '#27834A',
            }}
            imageStyle={{ opacity: 0.72 }}
          >
            <View style={{
              backgroundColor: 'rgba(3,16,9,0.78)',
              padding: 17,
            }}>
              <View style={{ flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center', marginBottom: 17 }}>
                <View style={{
                  backgroundColor: 'rgba(0,230,118,0.15)',
                  borderWidth: 1,
                  borderColor: '#00A854',
                  borderRadius: 22,
                  paddingVertical: 9,
                  paddingHorizontal: 18,
                }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 14, textAlign: 'center' }}>
                    🏆 {selectedMatch.league || 'بطولة غير محددة'}
                  </Text>
                </View>
              </View>

              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-around',
                minHeight: 145,
              }}>
                <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 4 }}>
                  {selectedMatch.homeLogo ? (
                    <Image
                      source={{ uri: selectedMatch.homeLogo }}
                      style={{ width: 76, height: 76, resizeMode: 'contain', marginBottom: 10 }}
                    />
                  ) : (
                    <Text style={{ fontSize: 42 }}>⚽</Text>
                  )}
                  <Text style={{ color: '#FFFFFF', fontWeight: '900', textAlign: 'center', fontSize: 14 }}>
                    {selectedMatch.home || 'الفريق الأول'}
                  </Text>
                </View>

                <View style={{ alignItems: 'center', justifyContent: 'center', minWidth: 116 }}>
                  <View style={{
                    backgroundColor: 'rgba(0,0,0,0.78)',
                    borderWidth: 1,
                    borderColor: '#36764B',
                    borderRadius: 17,
                    paddingVertical: 12,
                    paddingHorizontal: 15,
                    minWidth: 112,
                    alignItems: 'center',
                  }}>
                    <Text style={{
                      color: '#FFFFFF',
                      fontSize: 34,
                      fontWeight: '900',
                      writingDirection: 'ltr',
                    }}>
                      {Array.isArray(selectedMatch.score) && selectedMatch.score.length >= 2
                        ? `${selectedMatch.score[0]} - ${selectedMatch.score[1]}`
                        : 'VS'}
                    </Text>
                  </View>
                  <View style={{
                    backgroundColor: GREEN,
                    borderRadius: 18,
                    paddingVertical: 6,
                    paddingHorizontal: 13,
                    marginTop: 11,
                  }}>
                    <Text style={{ color: '#06200F', fontSize: 12, fontWeight: '900' }}>
                      {translateFixtureStatus(fixtureStatus) || selectedMatch.status || 'موعد المباراة'}
                    </Text>
                  </View>
                  <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800', marginTop: 7 }}>
                    ◷ {selectedMatch.time || '--:--'}
                  </Text>
                </View>

                <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 4 }}>
                  {selectedMatch.awayLogo ? (
                    <Image
                      source={{ uri: selectedMatch.awayLogo }}
                      style={{ width: 76, height: 76, resizeMode: 'contain', marginBottom: 10 }}
                    />
                  ) : (
                    <Text style={{ fontSize: 42 }}>⚽</Text>
                  )}
                  <Text style={{ color: '#FFFFFF', fontWeight: '900', textAlign: 'center', fontSize: 14 }}>
                    {selectedMatch.away || 'الفريق الثاني'}
                  </Text>
                </View>
              </View>

              <View style={{
                marginTop: 17,
                paddingTop: 11,
                borderTopWidth: 1,
                borderTopColor: 'rgba(0,230,118,0.35)',
              }}>
                <Text style={{ color: '#B9D9C3', fontSize: 11, textAlign: 'center', fontWeight: '700' }}>
                  شرارة سبورت DZ • تفاصيل المباراة
                </Text>
              </View>
            </View>
          </ImageBackground>

            <View style={{ backgroundColor: '#101A14', borderRadius: 18, padding: 16, marginTop: 20, marginBottom: 12, borderWidth: 1, borderColor: '#245A38' }}>
  <Text style={{ color: GREEN, fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 14 }}>
    ⭐ أفضل لاعب وتقييمات اللاعبين
  </Text>

  {playersLoading ? (
    <Text style={{ color: MUTED, textAlign: 'center', padding: 12 }}>
      جارٍ تحميل تقييمات اللاعبين...
    </Text>
  ) : matchPlayerRatings.length > 0 ? (
    <>
      <View style={{ backgroundColor: '#172A1D', borderRadius: 15, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#397849', marginBottom: 14 }}>
        <Text style={{ color: '#FFD700', fontSize: 14, fontWeight: '900', marginBottom: 10 }}>
          🏆 رجل المباراة حسب التقييم
        </Text>
        {matchPlayerRatings[0].player?.photo ? (
          <Image source={{ uri: matchPlayerRatings[0].player.photo }} style={{ width: 76, height: 76, borderRadius: 38, marginBottom: 9, backgroundColor: '#26382B' }} />
        ) : null}
        <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '900', textAlign: 'center' }}>
          {matchPlayerRatings[0].player?.name || 'لاعب'}
        </Text>
        <Text style={{ color: MUTED, marginTop: 4 }}>
          {matchPlayerRatings[0].teamName}
        </Text>
        <Text style={{ color: '#FFD700', fontSize: 25, fontWeight: '900', marginTop: 8 }}>
          {matchPlayerRatings[0].playerRating.toFixed(1)} / 10
        </Text>
        <Text style={{ color: MUTED, fontSize: 12, marginTop: 4 }}>
          {matchPlayerRatings[0].minutesPlayed} دقيقة لعب
        </Text>
        <Text style={{ color: '#D5E5D9', fontSize: 11, textAlign: 'center', marginTop: 10, lineHeight: 23 }}>
          ⚽ أهداف: {matchPlayerRatings[0].playerStats?.goals ?? '--'}  •  🅰️ حاسمة: {matchPlayerRatings[0].playerStats?.assists ?? '--'}
          {"\n"}🎯 تسديدات: {matchPlayerRatings[0].playerStats?.shotsOnTarget ?? '--'}/{matchPlayerRatings[0].playerStats?.shots ?? '--'}  •  📊 تمريرات: {matchPlayerRatings[0].playerStats?.passes ?? '--'}
          {"\n"}دقة التمرير: {matchPlayerRatings[0].playerStats?.passAccuracy == null ? '--' : matchPlayerRatings[0].playerStats.passAccuracy + '%'}  •  🛡️ افتكاكات: {matchPlayerRatings[0].playerStats?.tackles ?? '--'}
          {"\n"}🟨 {matchPlayerRatings[0].playerStats?.yellowCards ?? '--'}  •  🟥 {matchPlayerRatings[0].playerStats?.redCards ?? '--'}
        </Text>
      </View>

      {matchPlayerRatings.length > 1 ? (
        <>
          <Text style={{ color: GREEN, fontWeight: '900', textAlign: 'center', marginBottom: 8 }}>
            أعلى تقييمات اللاعبين
          </Text>
          {matchPlayerRatings.slice(1, 5).map((item, index) => (
            <View key={item.player?.id || index} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#293A30' }}>
              {item.player?.photo ? (
                <Image source={{ uri: item.player.photo }} style={{ width: 38, height: 38, borderRadius: 19, marginLeft: 10, backgroundColor: '#26382B' }} />
              ) : null}
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '800', textAlign: 'right' }}>
                  {item.player?.name || 'لاعب'}
                </Text>
                <Text style={{ color: MUTED, fontSize: 11, textAlign: 'right', marginTop: 3 }}>
                  {item.teamName} • {item.minutesPlayed} دقيقة
                </Text>
                <Text style={{ color: '#AFC2B5', fontSize: 10, textAlign: 'right', marginTop: 5, lineHeight: 19 }}>
                  ⚽ {item.playerStats?.goals ?? '--'}  •  🅰️ {item.playerStats?.assists ?? '--'}  •  🎯 {item.playerStats?.shotsOnTarget ?? '--'}/{item.playerStats?.shots ?? '--'}
                  {"\n"}📊 {item.playerStats?.passes ?? '--'} تمريرة  •  دقة {item.playerStats?.passAccuracy == null ? '--' : item.playerStats.passAccuracy + '%'}  •  🛡️ {item.playerStats?.tackles ?? '--'}
                  {"\n"}🟨 {item.playerStats?.yellowCards ?? '--'}  •  🟥 {item.playerStats?.redCards ?? '--'}
                </Text>
              </View>
              <Text style={{ color: GREEN, fontWeight: '900', fontSize: 16, marginRight: 10 }}>
                {item.playerRating.toFixed(1)}
              </Text>
            </View>
          ))}
        </>
      ) : null}
    </>
  ) : (
    <Text style={{ color: MUTED, textAlign: 'center', padding: 10 }}>
      تقييمات اللاعبين غير متاحة لهذه المباراة حاليًا.
    </Text>
  )}
</View>

<View style={{ backgroundColor: '#0B120E', borderRadius: 16, padding: 16, marginTop: 22, marginBottom: 10, borderWidth: 1, borderColor: '#203D2B' }}>
              <Text style={{ color: GREEN, fontSize: 17, fontWeight: '900', textAlign: 'center', marginBottom: 12 }}>
                التشكيلة الرسمية
              </Text>

              {lineupsLoading ? (
                <Text style={{ color: MUTED, textAlign: 'center' }}>
                  جارٍ تحميل التشكيلة...
                </Text>
              ) : matchLineups.length > 0 ? (
                matchLineups.map((lineup, lineupIndex) => (
                  <View key={lineup.team?.id || lineupIndex} style={{ marginBottom: 18 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '900', textAlign: 'center', marginBottom: 6 }}>
                      {lineup.team?.name || `الفريق ${lineupIndex + 1}`}
                    </Text>

                    <Text style={{ color: GREEN, textAlign: 'center', fontWeight: '800', marginBottom: 5 }}>
                      خطة اللعب: {lineup.formation || '--'}
                    </Text>

                    <Text style={{ color: MUTED, textAlign: 'center', marginBottom: 12 }}>
                      المدرب: {lineup.coach?.name || 'غير متوفر'}
                    </Text>


                    {(() => {
                      const originalPlayers = (lineup.startXI || []).map((item, index) => ({
  player: item.player || {},
  index,
}));

const hasCompleteGrid = originalPlayers.length > 0 &&
  originalPlayers.every(entry => {
    const parts = String(entry.player.grid || '').split(':').map(Number);
    return parts.length === 2 &&
      Number.isFinite(parts[0]) &&
      Number.isFinite(parts[1]) &&
      parts[0] >= 1 &&
      parts[1] >= 1;
  });

let pitchPlayers;

if (hasCompleteGrid) {
  pitchPlayers = originalPlayers.map(entry => {
    const parts = String(entry.player.grid).split(':').map(Number);
    return {
      ...entry,
      row: parts[0],
      col: parts[1],
    };
  });
} else {
  const groups = [
    { rank: 1, test: /GOALKEEPER|KEEPER|\\bGK\\b/ },
    { rank: 2, test: /DEFENDER|\\bDEF\\b/ },
    { rank: 3, test: /MIDFIELDER|\\bMID\\b/ },
    { rank: 4, test: /FORWARD|ATTACKER|STRIKER|\\bFWD\\b/ },
  ];

  pitchPlayers = originalPlayers.map(entry => {
    const position = String(entry.player.pos || '').toUpperCase();
    const group = groups.find(item => item.test.test(position));
    return {
      ...entry,
      row: group ? group.rank : 3,
    };
  });

  pitchPlayers.forEach((entry, index) => {
    const sameLine = pitchPlayers.filter(item => item.row === entry.row);
    entry.col = sameLine.indexOf(entry) + 1;
  });
}

if (pitchPlayers.length === 0) {
  return (
    <Text style={{ color: MUTED, textAlign: 'center', marginBottom: 12 }}>
      التشكيلة غير متوفرة.
    </Text>
  );
}

const maxRow = Math.max(...pitchPlayers.map(p => p.row));
const maxCol = Math.max(...pitchPlayers.map(p => p.col));

                      return (
                        <View style={{
                          height: 290,
                          backgroundColor: '#126B3B',
                          borderWidth: 2,
                          borderColor: '#A8D5B5',
                          borderRadius: 12,
                          marginBottom: 18,
                          overflow: 'hidden',
                          position: 'relative',
                        }}>
                          {[0, 1, 2, 3, 4].map((stripe) => (
                            <View
                              key={`grass-${stripe}`}
                              style={{
                                position: 'absolute',
                                top: `${stripe * 20}%`,
                                left: 0,
                                right: 0,
                                height: '10%',
                                backgroundColor: stripe % 2 === 0
                                  ? '#167342'
                                  : '#126B3B',
                              }}
                            />
                          ))}
                          <View style={{
                            position: 'absolute',
                            top: '50%',
                            left: 0,
                            right: 0,
                            height: 1,
                            backgroundColor: '#A8D5B5',
                          }} />
                          <View style={{
                            position: 'absolute',
                            width: 76,
                            height: 76,
                            borderRadius: 38,
                            borderWidth: 1,
                            borderColor: '#A8D5B5',
                            top: '37%',
                            left: '50%',
                            marginLeft: -38,
                          }} />
                          <View style={{
                            position: 'absolute',
                            top: 0,
                            left: '25%',
                            right: '25%',
                            height: 28,
                            borderWidth: 1,
                            borderTopWidth: 0,
                            borderColor: '#A8D5B5',
                          }} />
                          <View style={{
                            position: 'absolute',
                            bottom: 0,
                            left: '25%',
                            right: '25%',
                            height: 28,
                            borderWidth: 1,
                            borderBottomWidth: 0,
                            borderColor: '#A8D5B5',
                          }} />

                          <View style={{
                            position: 'absolute',
                            top: 0,
                            left: '39%',
                            right: '39%',
                            height: 10,
                            borderWidth: 1,
                            borderTopWidth: 0,
                            borderColor: '#A8D5B5',
                          }} />
                          <View style={{
                            position: 'absolute',
                            bottom: 0,
                            left: '39%',
                            right: '39%',
                            height: 10,
                            borderWidth: 1,
                            borderBottomWidth: 0,
                            borderColor: '#A8D5B5',
                          }} />

                          {pitchPlayers.map((entry) => {
                            const left = maxCol === 1
                              ? 50
                              : 8 + ((entry.col - 1) / (maxCol - 1)) * 84;
                            const rowPosition = maxRow === 1
                              ? 50
                              : 8 + ((entry.row - 1) / (maxRow - 1)) * 84;
                            const top = lineupIndex % 2 === 0
                              ? rowPosition
                              : 100 - rowPosition;

                            const ratingPlayer = matchPlayerRatings.find(
                              item => String(item.player?.id) === String(entry.player.id)
                            );
                            const playerPhoto = ratingPlayer?.player?.photo || entry.player.photo;
                            const playerNumber = entry.player.number ?? entry.index + 1;

                            return (
                              <TouchableOpacity
                                key={entry.player.id || entry.index}
                                activeOpacity={0.8}
                                onPress={() => setSelectedPlayer({
                                  ...entry.player,
                                  photo: playerPhoto,
                                  teamName: lineup.team?.name || '',
                                  rating: ratingPlayer?.playerRating ?? null,
                                  stats: ratingPlayer?.playerStats || null,
                                  minutesPlayed: ratingPlayer?.minutesPlayed ?? 0,
                                })}
                                style={{
                                  position: 'absolute',
                                  left: `${left}%`,
                                  top: `${top}%`,
                                  width: 58,
                                  marginLeft: -29,
                                  marginTop: -15,
                                  alignItems: 'center',
                                  zIndex: 2,
                                }}
                              >
                                {playerPhoto ? (
                                  <View style={{ width: 34, height: 34, position: 'relative' }}>
                                    <Image
                                      source={{ uri: playerPhoto }}
                                      style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: 17,
                                        borderWidth: 2,
                                        borderColor: '#D8F5DF',
                                        backgroundColor: '#FFFFFF',
                                      }}
                                    />
                                    <View style={{
                                      position: 'absolute',
                                      bottom: -3,
                                      right: -5,
                                      minWidth: 17,
                                      height: 17,
                                      borderRadius: 9,
                                      backgroundColor: '#FFFFFF',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      borderWidth: 1,
                                      borderColor: '#087A48',
                                    }}>
                                      <Text style={{ color: '#087A48', fontSize: 9, fontWeight: '900' }}>
                                        {playerNumber}
                                      </Text>
                                    </View>
                                  </View>
                                ) : (
                                  <View style={{
                                    minWidth: 27,
                                    height: 27,
                                    borderRadius: 15,
                                    backgroundColor: '#FFFFFF',
                                    borderWidth: 2,
                                    borderColor: '#D8F5DF',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}>
                                    <Text style={{ color: '#087A48', fontSize: 11, fontWeight: '900' }}>
                                      {playerNumber}
                                    </Text>
                                  </View>
                                )}
                                <Text
                                  numberOfLines={1}
                                  style={{
                                    color: '#FFFFFF',
                                    fontSize: 9,
                                    fontWeight: '900',
                                    backgroundColor: '#084D2B',
                                    paddingHorizontal: 3,
                                    borderRadius: 4,
                                    maxWidth: 58,
                                    textAlign: 'center',
                                  }}
                                >
                                  {entry.player.name || 'لاعب'}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      );
                    })()}

                    <Text style={{ color: GREEN, fontWeight: '900', textAlign: 'center', marginBottom: 8 }}>
                      التشكيلة الأساسية
                    </Text>

                    {(lineup.startXI || []).map((item, playerIndex) => {
                      const player = item.player || {};
                      const positions = {
                        G: 'حارس',
                        D: 'دفاع',
                        M: 'وسط',
                        F: 'هجوم'
                      };

                      return (
                        <View key={player.id || playerIndex} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#293A30' }}>
                          <Text style={{ color: '#FFFFFF', flex: 1, textAlign: 'right' }}>
                            {player.name || 'لاعب'}
                          </Text>
                          <Text style={{ color: GREEN, marginHorizontal: 10, fontWeight: '900' }}>
                            #{player.number ?? '--'}
                          </Text>
                          <Text style={{ color: MUTED, width: 55, textAlign: 'left' }}>
                            {positions[player.pos] || player.pos || '--'}
                          </Text>
                        </View>
                      );
                    })}

                    <Text style={{ color: GREEN, fontWeight: '900', textAlign: 'center', marginTop: 14, marginBottom: 8 }}>
                      اللاعبون الاحتياطيون
                    </Text>

                    {(lineup.substitutes || []).length > 0 ? (
                      lineup.substitutes.map((item, playerIndex) => {
                        const player = item.player || {};
                        return (
                          <View key={player.id || playerIndex} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#293A30' }}>
                            <Text style={{ color: '#FFFFFF', flex: 1, textAlign: 'right' }}>
                              {player.name || 'لاعب'}
                            </Text>
                            <Text style={{ color: GREEN, marginHorizontal: 10, fontWeight: '900' }}>
                              #{player.number ?? '--'}
                            </Text>
                            <Text style={{ color: MUTED, width: 55, textAlign: 'left' }}>
                              {player.pos || '--'}
                            </Text>
                          </View>
                        );
                      })
                    ) : (
                      <Text style={{ color: MUTED, textAlign: 'center' }}>
                        لا توجد أسماء احتياطية متاحة.
                      </Text>
                    )}
                  </View>
                ))
              ) : (
                <Text style={{ color: MUTED, textAlign: 'center' }}>
                  {lineupsError || 'لم تُعلن التشكيلة الرسمية بعد.'}
                </Text>
              )}
            </View>

            <View style={{ backgroundColor: '#17231B', borderRadius: 14, padding: 14, marginTop: 18, marginBottom: 8, borderWidth: 1, borderColor: '#294735' }}>
              <Text style={{ color: GREEN, fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 14 }}>
                📊 مقارنة أداء الفريقين
              </Text>
              {statsLoading ? (
                <Text style={{ color: MUTED, textAlign: 'center' }}>جارٍ تحميل الإحصائيات...</Text>
              ) : matchStats.length === 2 ? (
                <>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
                    <Text style={{ color: GREEN, fontWeight: '900', flex: 1, textAlign: 'left' }}>{matchStats[0].team?.name || 'الفريق الأول'}</Text>
                    <Text style={{ color: GREEN, fontWeight: '900', flex: 1, textAlign: 'right' }}>{matchStats[1].team?.name || 'الفريق الثاني'}</Text>
                  </View>
                  {[...matchStats[0].statistics].sort((a, b) => {
                    const priority = [
                      /ball possession/i,
                      /total shots/i,
                      /shots on goal|shots on target/i,
                      /corner kicks/i,
                      /total passes/i,
                      /passes accurate|pass accuracy/i,
                      /shots insidebox/i,
                      /shots outsidebox/i,
                      /fouls/i,
                      /yellow cards/i,
                      /red cards/i,
                      /offsides/i,
                      /goalkeeper saves/i,
                    ];
                    const rank = type => {
                      const index = priority.findIndex(pattern => pattern.test(String(type)));
                      return index < 0 ? priority.length : index;
                    };
                    return rank(a.type) - rank(b.type);
                  }).map((stat, index) => {
                    const other = matchStats[1].statistics.find(item => item.type === stat.type);
                    const raw1 = stat.value;
                    const raw2 = other?.value;
                    const numberValue = value => {
                      if (value == null || value === '--') return null;
                      const parsed = Number(String(value).replace('%', '').replace(',', '.'));
                      return Number.isFinite(parsed) ? parsed : null;
                    };
                    const n1 = numberValue(raw1);
                    const n2 = numberValue(raw2);
                    const comparable = n1 !== null && n2 !== null && n1 + n2 > 0;
                    const percent1 = comparable ? (n1 / (n1 + n2)) * 100 : 50;
                    const percent2 = 100 - percent1;
                    const lowerIsBetter = /fouls|offsides|yellow cards|red cards|أخطاء|تسلل|بطاقات/i.test(String(stat.type));
                    const winner = !comparable || n1 === n2 ? 0 : ((n1 > n2) !== lowerIsBetter ? 1 : 2);

                    return (
                      <View key={stat.type || index} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#293A30' }}>
                        <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: '800', marginBottom: 9 }}>{stat.type}</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ color: winner === 1 ? GREEN : '#FFFFFF', fontWeight: '900', fontSize: 15 }}>{raw1 ?? '--'} {winner === 1 ? '▲' : ''}</Text>
                          <Text style={{ color: winner === 2 ? GREEN : '#FFFFFF', fontWeight: '900', fontSize: 15 }}>{raw2 ?? '--'} {winner === 2 ? '▲' : ''}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', height: 8, borderRadius: 8, overflow: 'hidden', backgroundColor: '#26382B', marginTop: 8 }}>
                          <View style={{ width: `${percent1}%`, backgroundColor: winner === 1 ? GREEN : '#668B70' }} />
                          <View style={{ width: `${percent2}%`, backgroundColor: winner === 2 ? GREEN : '#668B70' }} />
                        </View>
                        {winner !== 0 ? (
                          <Text style={{ color: GREEN, textAlign: 'center', fontSize: 10, marginTop: 5 }}>
                            {winner === 1 ? 'الأفضل: ' + (matchStats[0].team?.name || 'الفريق الأول') : 'الأفضل: ' + (matchStats[1].team?.name || 'الفريق الثاني')}
                          </Text>
                        ) : null}
                      </View>
                    );
                  })}
                </>
              ) : (
                <Text style={{ color: MUTED, textAlign: 'center', fontWeight: '700' }}>
                  {statsError || 'الإحصائيات غير متاحة حاليًا لهذه المباراة'}
                </Text>
              )}
            </View>


{matchStats.length === 2 ? (() => {
  const getMetric = (team, pattern) => {
    const item = (team.statistics || []).find(stat => pattern.test(String(stat.type || '')));
    if (!item || item.value == null || item.value === '--') return null;
    const value = Number(String(item.value).replace('%', '').replace(',', '.'));
    return Number.isFinite(value) ? value : null;
  };

  const definitions = [
    { name: 'إجمالي التسديدات', pattern: /^total shots$/i, weight: 1 },
    { name: 'التسديدات على المرمى', pattern: /shots on goal|shots on target/i, weight: 2 },
    { name: 'الركنيات', pattern: /corner kicks/i, weight: 1.5 },
    { name: 'التسديدات داخل المنطقة', pattern: /shots insidebox/i, weight: 1.5 },
  ];

  const factors = definitions.map(item => ({
    ...item,
    first: getMetric(matchStats[0], item.pattern),
    second: getMetric(matchStats[1], item.pattern),
  })).filter(item => item.first !== null && item.second !== null);

  if (factors.length === 0) {
    return (
      <View style={{ backgroundColor: '#17231B', borderRadius: 16, padding: 16, marginTop: 14, marginBottom: 10, borderWidth: 1, borderColor: '#294735' }}>
        <Text style={{ color: GREEN, fontSize: 18, fontWeight: '900', textAlign: 'center' }}>📈 مؤشر الضغط الهجومي</Text>
        <Text style={{ color: MUTED, textAlign: 'center', marginTop: 10 }}>لا تتوفر بيانات هجومية مشتركة كافية لحساب المؤشر.</Text>
      </View>
    );
  }

  const score1 = factors.reduce((sum, item) => sum + item.first * item.weight, 0);
  const score2 = factors.reduce((sum, item) => sum + item.second * item.weight, 0);
  const total = score1 + score2;
  const percent1 = total > 0 ? score1 / total * 100 : 50;
  const percent2 = 100 - percent1;
  const winner = score1 === score2 ? 0 : score1 > score2 ? 1 : 2;

  return (
    <View style={{ backgroundColor: '#17231B', borderRadius: 14, padding: 14, marginTop: 12, marginBottom: 8, borderWidth: 1, borderColor: '#294735' }}>
      <Text style={{ color: GREEN, fontSize: 19, fontWeight: '900', textAlign: 'center', marginBottom: 8, letterSpacing: 0.4 }}>📈 مؤشر الضغط الهجومي</Text>
      <Text style={{ color: MUTED, fontSize: 11, textAlign: 'center', marginBottom: 14 }}>مؤشر تقديري محسوب من إحصائيات المباراة المتاحة</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
        <Text style={{ color: '#FFFFFF', flex: 1, textAlign: 'left', fontWeight: '800' }}>{matchStats[0].team?.name || 'الفريق الأول'}</Text>
        <Text style={{ color: '#FFFFFF', flex: 1, textAlign: 'right', fontWeight: '800' }}>{matchStats[1].team?.name || 'الفريق الثاني'}</Text>
      </View>
      <View style={{ flexDirection: 'row', height: 16, borderRadius: 9, overflow: 'hidden', backgroundColor: '#26382B' }}>
        <View style={{ width: percent1 + '%', backgroundColor: winner === 1 ? GREEN : '#668B70' }} />
        <View style={{ width: percent2 + '%', backgroundColor: winner === 2 ? GREEN : '#668B70' }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginBottom: 12 }}>
        <Text style={{ color: GREEN, fontWeight: '900' }}>{Math.round(percent1)}%</Text>
        <Text style={{ color: GREEN, fontWeight: '900' }}>{Math.round(percent2)}%</Text>
      </View>
      <Text style={{ color: winner === 0 ? MUTED : GREEN, textAlign: 'center', fontWeight: '900', marginBottom: 10 }}>
        {winner === 0 ? 'الضغط الهجومي متعادل حسب البيانات المتاحة' : 'ضغط هجومي أكبر: ' + (matchStats[winner - 1].team?.name || 'الفريق')}
      </Text>
      {factors.map((item, index) => (
        <View key={item.name} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 10, marginTop: 6, backgroundColor: '#111A15', borderRadius: 10, borderWidth: 1, borderColor: '#294735' }}>
          <Text style={{ color: '#FFFFFF', flex: 1, textAlign: 'left' }}>{item.first}</Text>
          <Text style={{ color: MUTED, flex: 2, textAlign: 'center' }}>{item.name}</Text>
          <Text style={{ color: '#FFFFFF', flex: 1, textAlign: 'right' }}>{item.second}</Text>
        </View>
      ))}
    </View>
  );
})() : null}


{(() => {
  const periods = [
    { label: '0–15', min: 0, max: 15 },
    { label: '16–30', min: 16, max: 30 },
    { label: '31–45+', min: 31, max: 45 },
    { label: '46–60', min: 46, max: 60 },
    { label: '61–75', min: 61, max: 75 },
    { label: '76–90+', min: 76, max: Infinity },
  ];

  const firstTeam = matchStats[0]?.team || {};
  const secondTeam = matchStats[1]?.team || {};

  const getTeamIndex = event => {
    const id = event.team?.id;
    const name = String(event.team?.name || '');

    if (id != null && String(id) === String(firstTeam.id)) return 0;
    if (id != null && String(id) === String(secondTeam.id)) return 1;
    if (name && name === String(firstTeam.name || '')) return 0;
    if (name && name === String(secondTeam.name || '')) return 1;
    return -1;
  };

  const getSymbol = event => {
    const type = String(event.type || '');
    const detail = String(event.detail || '');
    if (/goal/i.test(type)) return '⚽';
    if (/card/i.test(type)) return /red/i.test(detail) ? '🟥' : '🟨';
    if (/subst/i.test(type)) return '🔄';
    return '•';
  };

  const events = matchEvents.filter(event =>
    Number.isFinite(Number(event.time?.elapsed))
  );

  return (
    <View style={{ backgroundColor: '#17231B', borderRadius: 16, padding: 16, marginTop: 14, marginBottom: 10, borderWidth: 1, borderColor: '#294735' }}>
      <Text style={{ color: GREEN, fontSize: 19, fontWeight: '900', textAlign: 'center', marginBottom: 8 }}>
        📊 توزيع أحداث المباراة حسب الدقائق
      </Text>
      <Text style={{ color: MUTED, fontSize: 11, textAlign: 'center', marginBottom: 14 }}>
        توزيع الأحداث المسجلة فعلياً خلال فترات المباراة
      </Text>

      {events.length > 0 ? periods.map(period => {
        const periodEvents = events.filter(event => {
          const minute = Number(event.time.elapsed);
          return minute >= period.min && minute <= period.max;
        });

        const firstCount = periodEvents.filter(event => getTeamIndex(event) === 0).length;
        const secondCount = periodEvents.filter(event => getTeamIndex(event) === 1).length;
        const unknownCount = periodEvents.length - firstCount - secondCount;
        const total = periodEvents.length;

        return (
          <View key={period.label} style={{ paddingVertical: 12, paddingHorizontal: 10, marginBottom: 9, backgroundColor: '#111A15', borderRadius: 12, borderWidth: 1, borderColor: '#294735' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>{period.label} دقيقة</Text>
              <Text style={{ color: MUTED, fontSize: 11 }}>{total} حدث</Text>
            </View>

            <View style={{ flexDirection: 'row', height: 12, borderRadius: 8, overflow: 'hidden', backgroundColor: '#26382B' }}>
              <View style={{ width: total ? (firstCount / total * 100) + '%' : '0%', backgroundColor: GREEN }} />
              <View style={{ width: total ? (secondCount / total * 100) + '%' : '0%', backgroundColor: '#668B70' }} />
              <View style={{ width: total ? (unknownCount / total * 100) + '%' : '0%', backgroundColor: '#A0A0A0' }} />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
              <Text style={{ color: GREEN, fontSize: 11 }}>{firstTeam.name || 'الفريق الأول'}: {firstCount}</Text>
              <Text style={{ color: '#A0A0A0', fontSize: 11 }}>غير محدد: {unknownCount}</Text>
              <Text style={{ color: '#9DBCA4', fontSize: 11 }}>{secondTeam.name || 'الفريق الثاني'}: {secondCount}</Text>
            </View>

            {total > 0 ? (
              <Text style={{ color: '#FFFFFF', textAlign: 'center', marginTop: 7, fontSize: 13 }}>
                {periodEvents.map((event, index) =>
                  getSymbol(event) + ' ' + event.time.elapsed + (event.time.extra ? '+' + event.time.extra : '') + "'"
                ).join('   ')}
              </Text>
            ) : null}
          </View>
        );
      }) : (
        <Text style={{ color: MUTED, textAlign: 'center' }}>
          لا توجد أحداث مسجلة لعرضها في الرسم البياني حتى الآن.
        </Text>
      )}
    </View>
  );
})()}

<View style={{ backgroundColor: '#17231B', borderRadius: 16, padding: 16, marginTop: 14, marginBottom: 10, borderWidth: 1, borderColor: '#294735' }}>
  <Text style={{ color: GREEN, fontSize: 19, fontWeight: '900', textAlign: 'center', marginBottom: 16, letterSpacing: 0.4 }}>أحداث المباراة</Text>
  {matchEvents.length > 0 ? matchEvents.map((event, index) => {
    const type = String(event.type || '');
    const detail = String(event.detail || '');
    const symbol = /goal/i.test(type) ? '⚽' : /card/i.test(type) ? (/red/i.test(detail) ? '🟥' : '🟨') : /subst/i.test(type) ? '🔄' : '•';
    return (
      <View key={index} style={{ paddingVertical: 12, paddingHorizontal: 10, marginBottom: 8, backgroundColor: '#111A15', borderRadius: 12, borderWidth: 1, borderColor: '#294735' }}>
        <Text style={{ color: GREEN, fontWeight: '900', textAlign: 'center', fontSize: 14 }}>{event.time?.elapsed ?? '--'}' {symbol} {type} {detail}</Text>
        <Text style={{ color: '#FFFFFF', textAlign: 'center', marginTop: 4 }}>{event.team?.name || ''}</Text>
        <Text style={{ color: MUTED, textAlign: 'center', marginTop: 3 }}>{event.player?.name || ''}{event.assist?.name ? ' ← ' + event.assist.name : ''}</Text>
      </View>
    );
  }) : <Text style={{ color: MUTED, textAlign: 'center' }}>لا توجد أحداث مسجلة لهذه المباراة حتى الآن.</Text>}
</View>

<TouchableOpacity
              onPress={() => setSelectedMatch(null)}
              style={{ backgroundColor: '#25352A', borderRadius: 10, padding: 13, alignItems: 'center', marginTop: 22 }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>← العودة إلى المباريات</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => selectedMatch.streamUrl ? openMatchInsideApp(selectedMatch.streamUrl) : (selectedMatch.isSportApiFixture || selectedMatch.isAfconFixture) ? Alert.alert('تنبيه', 'لا يتوفر رابط بث مطابق لهذه المباراة حالياً.') : selectedMatch.url ? openMatchInsideApp(selectedMatch.url) : Alert.alert('تنبيه', 'رابط المباراة غير متوفر.')}
              style={{ backgroundColor: '#153D27', borderRadius: 10, padding: 13, alignItems: 'center', marginTop: 10 }}
            >
              <Text style={{ color: GREEN, fontWeight: '900' }}>▶ مشاهدة داخل التطبيق</Text>
            </TouchableOpacity>
                  </>
        ) : tab === 'الرئيسية' ? (
          <Home />
        ) : tab === 'البث المباشر' ? (
          <BroadcastPage />
        ) : tab === 'المباريات' ? (
          <MatchesPage />
        ) : tab === 'المفضلة' ? (
          <FavoritesPage />
        ) : (
          <OtherPage />
        )}

        <Text style={styles.footer}>
          CHARARA SPORT DZ © 2026
        </Text>
      </ScrollView>

      {/* CHARARA_PLAYER_PROFILE_MODAL */}
      <Modal
        visible={!!selectedPlayer}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setSelectedPlayer(null)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.82)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 18,
        }}>
          <View style={{
            width: '100%',
            maxWidth: 430,
            maxHeight: '88%',
            backgroundColor: '#101A16',
            borderRadius: 22,
            borderWidth: 1,
            borderColor: '#245B42',
            padding: 18,
          }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                onPress={() => setSelectedPlayer(null)}
                style={{
                  alignSelf: 'flex-end',
                  backgroundColor: '#263B31',
                  borderRadius: 20,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  marginBottom: 12,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 15 }}>
                  ✕ إغلاق
                </Text>
              </TouchableOpacity>

              <View style={{ alignItems: 'center', marginBottom: 18 }}>
                {selectedPlayer?.photo ? (
                  <Image
                    source={{ uri: selectedPlayer.photo }}
                    style={{
                      width: 105,
                      height: 105,
                      borderRadius: 53,
                      borderWidth: 3,
                      borderColor: GREEN,
                      backgroundColor: '#263B31',
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{
                    width: 105,
                    height: 105,
                    borderRadius: 53,
                    backgroundColor: '#263B31',
                    borderWidth: 3,
                    borderColor: GREEN,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Text style={{ color: GREEN, fontSize: 38, fontWeight: '900' }}>
                      {selectedPlayer?.number ?? '⚽'}
                    </Text>
                  </View>
                )}

                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 21,
                  fontWeight: '900',
                  textAlign: 'center',
                  marginTop: 12,
                }}>
                  {selectedPlayer?.name || 'لاعب'}
                </Text>

                <Text style={{
                  color: '#A7C5B4',
                  fontSize: 14,
                  fontWeight: '700',
                  marginTop: 5,
                }}>
                  {selectedPlayer?.teamName || 'الفريق'}
                </Text>

                <Text style={{
                  color: GREEN,
                  fontSize: 14,
                  fontWeight: '800',
                  marginTop: 7,
                }}>
                  رقم القميص: {selectedPlayer?.number ?? '--'}  •  المركز: {selectedPlayer?.pos || '--'}
                </Text>

                <View style={{
                  backgroundColor: '#173D2B',
                  borderRadius: 14,
                  paddingHorizontal: 24,
                  paddingVertical: 10,
                  marginTop: 12,
                }}>
                  <Text style={{ color: '#B7D9C5', fontSize: 12, textAlign: 'center' }}>
                    تقييم اللاعب
                  </Text>
                  <Text style={{
                    color: '#FFFFFF',
                    fontSize: 27,
                    fontWeight: '900',
                    textAlign: 'center',
                  }}>
                    {selectedPlayer?.rating != null
                      ? Number(selectedPlayer.rating).toFixed(1) + ' / 10'
                      : '-- / 10'}
                  </Text>
                </View>
              </View>

              <Text style={{
                color: GREEN,
                fontSize: 16,
                fontWeight: '900',
                textAlign: 'right',
                marginBottom: 12,
              }}>
                إحصائيات اللاعب
              </Text>

              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }}>
                {[
                  ['الأهداف', selectedPlayer?.stats?.goals],
                  ['التمريرات الحاسمة', selectedPlayer?.stats?.assists],
                  ['التسديدات', selectedPlayer?.stats?.shots],
                  ['على المرمى', selectedPlayer?.stats?.shotsOnTarget],
                  ['التمريرات', selectedPlayer?.stats?.passes],
                  ['دقة التمرير', selectedPlayer?.stats?.passAccuracy != null
                    ? selectedPlayer.stats.passAccuracy + '%'
                    : null],
                  ['التدخلات', selectedPlayer?.stats?.tackles],
                  ['بطاقات صفراء', selectedPlayer?.stats?.yellowCards],
                  ['بطاقات حمراء', selectedPlayer?.stats?.redCards],
                  ['الدقائق', selectedPlayer?.minutesPlayed],
                ].map((item, index) => (
                  <View
                    key={index}
                    style={{
                      width: '48%',
                      backgroundColor: '#1A2B23',
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 9,
                      borderWidth: 1,
                      borderColor: '#294638',
                    }}
                  >
                    <Text style={{
                      color: '#A7C5B4',
                      fontSize: 12,
                      textAlign: 'center',
                      marginBottom: 6,
                    }}>
                      {item[0]}
                    </Text>
                    <Text style={{
                      color: '#FFFFFF',
                      fontSize: 19,
                      fontWeight: '900',
                      textAlign: 'center',
                    }}>
                      {item[1] != null ? String(item[1]) : '--'}
                    </Text>
                  </View>
                ))}
              </View>

              <Text style={{
                color: '#789889',
                fontSize: 11,
                textAlign: 'center',
                marginTop: 8,
                marginBottom: 8,
              }}>
                الإحصائيات المعروضة حسب البيانات المتاحة للمباراة
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>


      <View style={styles.bottomNav}>
        {tabs.map((item, index) => {
          const icons = ['⌂', '⚽', '★', '📺', '🏆', '♙'];
          const active = tab === item;
          const labels = [
            'الرئيسية',
            'المباريات',
            'المفضلة',
            'البث',
            'البطولات',
            'حسابي',
          ];

          return (
            <TouchableOpacity
              key={item}
              style={styles.navItem}
              onPress={() => setTab(item)}
            >
              <Text
                style={[
                  styles.navIcon,
                  active && { color: GREEN },
                ]}
              >
                {icons[index]}
              </Text>
              <Text
                style={[
                  styles.navText,
                  active && { color: GREEN },
                ]}
              >
                {labels[index]}
              </Text>
              {active && <View style={styles.navDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    height: 82,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#090E0B',
    borderBottomWidth: 1,
    borderBottomColor: '#183A27',
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitle: {
    color: MUTED,
    fontSize: 11,
    marginTop: 4,
  },
  logo: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#153322',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: GREEN,
  },
  logoText: {
    fontSize: 25,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 17,
    paddingBottom: 25,
  },
  hero: {
    backgroundColor: '#10251A',
    borderRadius: 26,
    padding: 24,
    marginBottom: 27,
    borderWidth: 1,
    borderColor: '#267A46',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
  },
  heroSmall: {
    color: GREEN,
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'right',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '900',
    textAlign: 'right',
    lineHeight: 39,
  },
  heroDesc: {
    color: '#B2C5B8',
    fontSize: 13,
    textAlign: 'right',
    marginTop: 12,
    lineHeight: 23,
  },
  heroButton: {
    backgroundColor: GREEN,
    borderRadius: 12,
    padding: 13,
    alignSelf: 'flex-end',
    marginTop: 20,
  },
  heroButtonText: {
    color: BG,
    fontWeight: '900',
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
  },
  action: {
    color: GREEN,
    fontSize: 12,
  },
  categories: {
    flexDirection: 'row-reverse',
    marginBottom: 15,
    gap: 9,
  },
  category: {
    backgroundColor: '#111A15',
    paddingVertical: 11,
    paddingHorizontal: 19,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#294535',
  },
  categoryActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#101812',
    borderRadius: 22,
    padding: 25,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#294535',
  },
  emptyIcon: {
    fontSize: 37,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyDesc: {
    color: MUTED,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 9,
  },
  leagues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 11,
    marginBottom: 25,
  },
  league: {
    width: '48.5%',
    minHeight: 112,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111A15',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#294535',
  },
  leagueIcon: {
    fontSize: 27,
    marginBottom: 8,
  },
  leagueName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  arrow: {
    color: GREEN,
    fontSize: 25,
  },
  adBox: {
    backgroundColor: '#101712',
    borderRadius: 15,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#45634E',
    padding: 20,
    alignItems: 'center',
  },
  adLabel: {
    color: GREEN,
    fontWeight: '800',
    fontSize: 13,
  },
  adText: {
    color: MUTED,
    fontSize: 11,
    marginTop: 7,
  },
  playerCard: {
    backgroundColor: '#101812',
    borderRadius: 22,
    padding: 15,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#267A46',
  },
  playerScreen: {
    height: 190,
    backgroundColor: '#020403',
    borderRadius: 13,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoView: {
    width: '100%',
    height: '100%',
  },
  playerOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    width: '100%',
    height: '100%',
  },
  playerIcon: {
    color: GREEN,
    fontSize: 34,
    marginBottom: 8,
  },
  playerMessage: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  playerHint: {
    color: '#B2C5B8',
    fontSize: 11,
    marginTop: 7,
  },
  playerControls: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginTop: 12,
  },
  playerButton: {
    flex: 1,
    backgroundColor: '#153D27',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GREEN,
  },
  playerButtonText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '900',
  },
  playerFootnote: {
    color: MUTED,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 10,
  },

  broadcastHero: {
    backgroundColor: '#10251A',
    borderRadius: 26,
    padding: 25,
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#267A46',
  },
  broadcastHeroIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  broadcastHeroTitle: {
    color: GREEN,
    fontSize: 23,
    fontWeight: '900',
  },
  broadcastHeroDesc: {
    color: '#B2C5B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 23,
    marginTop: 12,
  },
  officialBadge: {
    backgroundColor: '#153D27',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginTop: 17,
  },
  officialBadgeText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '800',
  },
  platformCard: {
    backgroundColor: PANEL,
    borderRadius: 17,
    padding: 17,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#24372B',
  },
  platformTop: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  platformIcon: {
    fontSize: 35,
    marginLeft: 14,
  },
  platformInfo: {
    flex: 1,
  },
  platformName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'right',
  },
  platformDescription: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 21,
    textAlign: 'right',
    marginTop: 7,
  },
  watchButton: {
    backgroundColor: GREEN,
    borderRadius: 11,
    padding: 13,
    alignItems: 'center',
    marginTop: 17,
  },
  watchButtonText: {
    color: BG,
    fontSize: 13,
    fontWeight: '900',
  },
  channelIntro: {
    backgroundColor: '#10271A',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#205735',
    padding: 16,
    marginBottom: 13,
  },
  channelIntroTitle: {
    color: GREEN,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'right',
  },
  channelIntroText: {
    color: '#B2C5B8',
    fontSize: 12,
    lineHeight: 21,
    textAlign: 'right',
    marginTop: 8,
  },
  channelCard: {
    backgroundColor: PANEL,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#24372B',
    padding: 15,
    marginBottom: 11,
  },
  channelInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  channelIcon: {
    fontSize: 29,
    marginLeft: 13,
  },
  channelText: {
    flex: 1,
  },
  channelName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'right',
  },
  channelSubtitle: {
    color: MUTED,
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
  },
  channelStatus: {
    color: GREEN,
    fontSize: 10,
    textAlign: 'right',
    marginTop: 6,
  },
  channelButton: {
    backgroundColor: GREEN,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 13,
  },
  channelButtonText: {
    color: BG,
    fontSize: 12,
    fontWeight: '900',
  },
  noticeCard: {
    backgroundColor: '#211B0D',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#66502A',
    padding: 16,
    marginTop: 10,
    marginBottom: 18,
  },
  noticeTitle: {
    color: '#FFD166',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'right',
  },
  noticeText: {
    color: '#D5C7A6',
    fontSize: 12,
    lineHeight: 22,
    textAlign: 'right',
    marginTop: 9,
  },
  broadcastBanner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: PANEL,
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#205735',
    marginBottom: 27,
  },
  broadcastBannerIcon: {
    fontSize: 30,
    marginLeft: 13,
  },
  broadcastBannerInfo: {
    flex: 1,
  },
  broadcastBannerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'right',
  },
  broadcastBannerDesc: {
    color: MUTED,
    fontSize: 11,
    textAlign: 'right',
    marginTop: 5,
  },
  bottomNav: {
    height: 76,
    backgroundColor: '#0B110D',
    borderTopWidth: 1,
    borderTopColor: '#245235',
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 4,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 55,
    flex: 1,
  },
  navIcon: {
    fontSize: 20,
    color: MUTED,
  },
  navText: {
    fontSize: 9,
    color: MUTED,
    marginTop: 3,
  },
  navDot: {
    width: 4,
    height: 4,
    borderRadius: 3,
    backgroundColor: GREEN,
    marginTop: 3,
  },
  pageCard: {
    backgroundColor: PANEL,
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    marginTop: 45,
    borderWidth: 1,
    borderColor: '#253B2D',
  },
  pageIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  pageTitle: {
    color: GREEN,
    fontSize: 23,
    fontWeight: '900',
  },
  pageDesc: {
    color: '#B0C0B5',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 13,
    marginTop: 14,
  },
  coming: {
    color: GREEN,
    marginTop: 20,
    fontWeight: '800',
  },
  footer: {
    color: '#526258',
    textAlign: 'center',
    fontSize: 10,
    marginTop: 30,
  },
});

