
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
  Alert,
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
    icon: '⚽',
  })),
  { name: 'beIN SPORTS NEWS', subtitle: 'الأخبار الرياضية', icon: '📰' },
  { name: 'beIN SPORTS 4K', subtitle: 'البث بجودة فائقة حسب الباقة', icon: '📺' },
  { name: 'beIN SPORTS NBA', subtitle: 'كرة السلة الأمريكية', icon: '🏀' },
  { name: 'beIN SPORTS ENGLISH 1', subtitle: 'البث باللغة الإنجليزية', icon: '🇬🇧' },
  { name: 'beIN SPORTS ENGLISH 2', subtitle: 'البث باللغة الإنجليزية', icon: '🇬🇧' },
  { name: 'beIN SPORTS FRENCH 1', subtitle: 'البث باللغة الفرنسية', icon: '🇫🇷' },
  { name: 'beIN SPORTS FRENCH 2', subtitle: 'البث باللغة الفرنسية', icon: '🇫🇷' },
  ...Array.from({ length: 9 }, (_, i) => ({
    name: `beIN SPORTS XTRA ${i + 1}`,
    subtitle: 'قنوات رياضية إضافية حسب التوفر',
    icon: '➕',
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    name: `beIN SPORTS MAX ${i + 1}`,
    subtitle: 'قنوات فعاليات ومباريات حسب التوفر',
    icon: '🏆',
  })),
  ...Array.from({ length: 7 }, (_, i) => ({
    name: i === 0 ? 'beIN SPORTS AFC' : `beIN SPORTS AFC ${i}`,
    subtitle: 'قنوات مسابقات الاتحاد الآسيوي حسب التوفر',
    icon: '🌏',
  })),
];

export default function App() {
  const [tab, setTab] = useState('الرئيسية');
  const [category, setCategory] = useState('الكل');
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState('');
  const [matchDay, setMatchDay] = useState('today');
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState('الكل');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchStats, setMatchStats] = useState([]);
  const [matchEvents, setMatchEvents] = useState([]);
  const [matchLineups, setMatchLineups] = useState([]);
  const [lineupsLoading, setLineupsLoading] = useState(false);
  const [lineupsError, setLineupsError] = useState('');
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [fixtureStatus, setFixtureStatus] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pushStatus, setPushStatus] = useState('لم يتم التسجيل بعد');
  const previousEventsRef = useRef({});
  const currentFixtureIdRef = useRef(null);
  const currentFixtureTeamsRef = useRef({ homeId: null, awayId: null });
  const [streamUrl, setStreamUrl] = useState('');
  const [showSirTv, setShowSirTv] = useState(false);
  const [sirTvReload, setSirTvReload] = useState(0);
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
    'البث المباشر',
    'البطولات',
    'حسابي',
  ];

  const categories = ['الكل', 'مباشر', 'اليوم', 'غداً'];

  const API_URL = 'https://charara-sport-api.hasnnoui73.workers.dev/';
  const STATS_API_URL = 'https://charara-standings-api.hasnnoui73.workers.dev/';


  const findMatchingFixture = async (home, away, date) => {
    try {
      const response = await fetch(`${STATS_API_URL}fixtures?date=${date}`);
      if (!response.ok) return null;

      const data = await response.json();
      const fixtures = data.data?.response || [];

      const aliases = {
        'ميلان': ['AC Milan'],
        'فيرينتسفاروشي': ['Ferencvarosi TC', 'Ferencvárosi TC'],
        'كريستال بالاس': ['Crystal Palace'],
        'هوفنهايم': ['1899 Hoffenheim', 'Hoffenheim'],
        'ريال سوسيداد': ['Real Sociedad'],
        'أولمبيك ليون': ['Lyon', 'Olympique Lyonnais'],
        'ألكمار': ['AZ Alkmaar'],
        'يوفنتوس': ['Juventus'],
        'باير ليفركوزن': ['Bayer Leverkusen'],
        'أولمبيك مارسيليا': ['Marseille', 'Olympique Marseille'],
        'الجيش الملكي': ['FAR Rabat', 'FAR'],
        'الرجاء البيضاوي': ['Raja Casablanca', 'Raja CA'],
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
        'مولودية الجزائر': ['MC Alger', 'Mouloudia Club d Alger']
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

        if (/u19|u-19|u21|u-21|u17|u-17|youth|women|feminine|reserve/i.test(competition)) {
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


  const fetchMatches = async (day = 'today') => {
    setMatchesLoading(true);
    setMatchesError('');

    try {
      const response = await fetch(`${API_URL}?day=${day}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !Array.isArray(data.matches)) {
        throw new Error('بيانات المباريات غير صالحة');
      }

      setMatches(data.matches);
    } catch (error) {
      setMatchesError('تعذر تحميل المباريات. تحقق من الإنترنت وحاول مجدداً.');
    } finally {
      setMatchesLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches(matchDay);
  }, [matchDay]);

  useEffect(() => {
    if (tab !== 'المباريات') return;

    const timer = setInterval(() => {
      fetchMatches(matchDay);
    }, 60000);

    return () => clearInterval(timer);
  }, [tab, matchDay]);

  const fetchMatchStats = async (match) => {
    if (!match?.url) return;

    const date = match.url.match(/\d{4}-\d{2}-\d{2}/)?.[0];
    if (!date) return;

    setStatsLoading(true);
    setStatsError('');
    setMatchStats([]);
    setLineupsLoading(true);
    setLineupsError('');
    setMatchLineups([]);

    try {
      const fixture = await findMatchingFixture(match.home, match.away, date);

      if (!fixture?.fixture?.id) {
        setStatsError('لم يتم العثور على مباراة مطابقة بشكل مؤكد.');
        setLineupsError('تعذر العثور على المباراة لجلب التشكيلة.');
        return;
      }

      currentFixtureIdRef.current = fixture.fixture.id;
      currentFixtureTeamsRef.current = {
        homeId: fixture.teams?.home?.id,
        awayId: fixture.teams?.away?.id
      };
      setFixtureStatus(fixture.fixture.status?.short || '');

      try {
        const lineupsResponse = await fetch(
          `${STATS_API_URL}fixtures/lineups?fixture=${fixture.fixture.id}`
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
        `${STATS_API_URL}fixtures/events?fixture=${fixture.fixture.id}`
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
        `${STATS_API_URL}fixtures/statistics?fixture=${fixture.fixture.id}`
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
      setLineupsLoading(false);
      setLineupsError('');
      setStatsError('');
      setFixtureStatus('');
    }
  }, [selectedMatch]);

  useEffect(() => {
    if (!selectedMatch) {
      currentFixtureIdRef.current = null;
      currentFixtureTeamsRef.current = { homeId: null, awayId: null };
      return;
    }

    const timer = setInterval(async () => {
      const fixtureId = currentFixtureIdRef.current;
      if (!fixtureId) return;

      try {
        const response = await fetch(
          `${STATS_API_URL}fixtures/events?fixture=${fixtureId}`
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
          `${STATS_API_URL}fixtures/statistics?fixture=${fixtureId}`
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
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [selectedMatch, soundEnabled]);

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

      <SectionTitle title="منصات المشاهدة" />

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

      <SectionTitle title="القنوات الجزائرية الرسمية" />

      <View style={styles.channelIntro}>
        <Text style={styles.channelIntroTitle}>🇩🇿 التلفزيون الجزائري EPTV</Text>
        <Text style={styles.channelIntroText}>
          اختر القناة لفتح صفحتها الرسمية. البث المباشر داخل التطبيق
          سيُفعّل عند توفر رابط بث رسمي قابل للتشغيل.
        </Text>
      </View>

      <SectionTitle title="مشغل شرارة الداخلي" />
      <View style={styles.playerCard}>
        <Text style={styles.sectionTitle}>
          📺 مشاهدة المباراة عبر Siiir TV
        </Text>

        <TouchableOpacity
          style={[styles.playerButton, { marginTop: 12 }]}
          onPress={() => setShowSirTv(!showSirTv)}
          activeOpacity={0.8}
        >
          <Text style={styles.playerButtonText}>
            {showSirTv ? 'إخفاء المشغّل ▲' : '▶ فتح مشاهدة المباراة'}
          </Text>
        </TouchableOpacity>

        {showSirTv && (
          <>
            <WebView
              key={sirTvReload}
              source={{
                uri: 'https://912acsss8af382.sirtv.top/playerv5.php?match=4732643&key=9f39972b67d6ce22189507d008acwc26'
              }}
              style={{ height: 260, marginTop: 12, backgroundColor: '#000000' }}
              javaScriptEnabled
              domStorageEnabled
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction={false}
              onError={() => Alert.alert(
                'تعذر تحميل المشغّل',
                'تحقق من الإنترنت أو جرّب فتح الصفحة لاحقاً.'
              )}
            />

            <TouchableOpacity
              style={[styles.playerButton, { marginTop: 10 }]}
              onPress={() => setSirTvReload(value => value + 1)}
            >
              <Text style={styles.playerButtonText}>
                ↻ إعادة تحميل المشغّل
              </Text>
            </TouchableOpacity>
          </>
        )}
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

      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>📺 قنوات beIN SPORTS</Text>
        <Text style={styles.noticeText}>
          قائمة القنوات الرياضية. اضغط لفتح دليل beIN الرسمي والتحقق من البرامج والتوفر.
        </Text>
      </View>

      {beinChannels.map((channel) => (
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

      {algerianChannels.map((channel) => (
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
      <View style={{ backgroundColor: PANEL, borderRadius: 16, padding: 15, marginBottom: 16, borderWidth: 1, borderColor: '#205735' }}>
        <Text style={{ color: GREEN, fontSize: 20, fontWeight: '900', textAlign: 'right' }}>
          ⚽ مباريات كرة القدم
        </Text>
        <Text style={{ color: MUTED, fontSize: 11, textAlign: 'right', marginTop: 6 }}>
          النتائج والمواعيد من مصدر بيانات المباريات
        </Text>
      </View>

      <View style={{ flexDirection: 'row-reverse', gap: 8, marginBottom: 15 }}>
        {[
          { label: 'الأمس', value: 'yesterday' },
          { label: 'اليوم', value: 'today' },
          { label: 'الغد', value: 'tomorrow' },
        ].map(item => (
          <TouchableOpacity
            key={item.value}
            onPress={() => setMatchDay(item.value)}
            style={{
              flex: 1,
              padding: 11,
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: matchDay === item.value ? GREEN : PANEL,
              borderWidth: 1,
              borderColor: matchDay === item.value ? GREEN : '#25352A',
            }}
          >
            <Text style={{ color: matchDay === item.value ? BG : '#FFFFFF', fontWeight: '800', fontSize: 12 }}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginBottom: 15 }}>
        {['الكل', ...new Set(matches.map(match => match.league || 'غير محدد'))].map(league => (
          <TouchableOpacity
            key={league}
            onPress={() => setSelectedLeagueFilter(league)}
            style={{
              backgroundColor: selectedLeagueFilter === league ? GREEN : PANEL,
              borderColor: selectedLeagueFilter === league ? GREEN : '#25352A',
              borderWidth: 1,
              borderRadius: 20,
              paddingVertical: 8,
              paddingHorizontal: 13,
            }}
          >
            <Text style={{ color: selectedLeagueFilter === league ? BG : '#FFFFFF', fontWeight: '800', fontSize: 11 }}>
              {league}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={() => fetchMatches(matchDay)}
        style={{ backgroundColor: '#153D27', padding: 11, borderRadius: 10, alignItems: 'center', marginBottom: 15 }}
      >
        <Text style={{ color: GREEN, fontWeight: '900' }}>↻ تحديث المباريات</Text>
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
              backgroundColor: PANEL,
              borderRadius: 15,
              padding: 14,
              marginBottom: 11,
              borderWidth: 1,
              borderColor: '#24372B',
            }}
          >
            <Text style={{ color: MUTED, textAlign: 'center', fontSize: 11, marginBottom: 12 }}>
              {match.status || 'موعد المباراة'}  •  {match.time || '--:--'}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                {match.homeLogo ? <Image source={{ uri: match.homeLogo }} style={{ width: 34, height: 34, resizeMode: 'contain', marginHorizontal: 5 }} onError={(e) => Alert.alert('خطأ تحميل الشعار', String(e.nativeEvent.error || 'تعذر تحميل الصورة'))} /> : null}
                <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: '900', fontSize: 13 }}>{match.home}</Text>
              </View>
              <View style={{ backgroundColor: '#07100A', paddingHorizontal: 13, paddingVertical: 9, borderRadius: 9 }}>
                <Text style={{ color: GREEN, fontSize: 17, fontWeight: '900', writingDirection: 'ltr' }}>
                  {Array.isArray(match.score) && match.score.length >= 2
                    ? `${match.score[0]} - ${match.score[1]}`
                    : 'VS'}
                </Text>
              </View>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                {match.awayLogo ? <Image source={{ uri: match.awayLogo }} style={{ width: 34, height: 34, resizeMode: 'contain', marginHorizontal: 5 }} onError={(e) => Alert.alert('خطأ تحميل الشعار', String(e.nativeEvent.error || 'تعذر تحميل الصورة'))} /> : null}
                <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: '900', fontSize: 13 }}>{match.away}</Text>
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
              onPress={() => match.url ? openMatchInsideApp(match.url) : Alert.alert('تنبيه', 'رابط المباراة غير متوفر.')}
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
      <View style={styles.hero}>
        <Text style={styles.heroSmall}>
          مرحباً بك في عالم كرة القدم
        </Text>
        <Text style={styles.heroTitle}>كل الرياضة،</Text>
        <Text style={[styles.heroTitle, { color: GREEN }]}>
          في مكان واحد
        </Text>
        <Text style={styles.heroDesc}>
          تابع النتائج والمباريات والبطولات العالمية
        </Text>
        <TouchableOpacity
          style={styles.heroButton}
          onPress={() => setTab('المباريات')}
        >
          <Text style={styles.heroButtonText}>
            اكتشف المباريات ←
          </Text>
        </TouchableOpacity>
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
          ['🇬🇧', 'الدوري الإنجليزي'],
          ['🇪🇸', 'الدوري الإسباني'],
          ['🇩🇪', 'الدوري الألماني'],
          ['🇮🇹', 'الدوري الإيطالي'],
          ['🇫🇷', 'الدوري الفرنسي'],
          ['🇩🇿', 'الدوري الجزائري'],
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

  const OtherPage = () => {
    const [selectedLeague, setSelectedLeague] = useState('دوري أبطال أوروبا');

    const [standings, setStandings] = useState([]);
    const [standingsLoading, setStandingsLoading] = useState(false);
    const [standingsError, setStandingsError] = useState('');

    const leagueIds = {
      'دوري أبطال أوروبا': '18',
      'الدوري الإنجليزي': '24',
      'الدوري الإسباني': '1',
      'الدوري الألماني': '2',
      'الدوري الإيطالي': '3',
    };

    useEffect(() => {
      let active = true;
      const leagueId = leagueIds[selectedLeague];

      setStandings([]);
      setStandingsError('');

      if (!leagueId) {
        setStandingsLoading(false);
        setStandingsError('الترتيب غير متوفر لهذه البطولة من مصدر البيانات الحالي.');
        return () => { active = false; };
      }

      setStandingsLoading(true);

      fetch(`https://charara-sport-standings-api.hasnnoui73.workers.dev/standings/${leagueId}`)
        .then(async response => {
          const payload = await response.json();

          if (!response.ok || !payload.success) {
            throw new Error('Standings request failed');
          }

          if (!Array.isArray(payload.data)) {
            throw new Error('Invalid standings data');
          }

          if (active) setStandings(payload.data);
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


    const leagues = [
      { name: 'دوري أبطال أوروبا', country: 'أوروبا', icon: '🏆', color: '#D9B45B' },
      { name: 'الدوري الإنجليزي', country: 'إنجلترا', icon: '🏴', color: '#A78BFA' },
      { name: 'الدوري الإسباني', country: 'إسبانيا', icon: '🇪🇸', color: '#F87171' },
      { name: 'الدوري الألماني', country: 'ألمانيا', icon: '🇩🇪', color: '#FBBF24' },
      { name: 'الدوري الإيطالي', country: 'إيطاليا', icon: '🇮🇹', color: '#60A5FA' },
      { name: 'الدوري الفرنسي', country: 'فرنسا', icon: '🇫🇷', color: '#818CF8' },
      { name: 'الدوري الجزائري', country: 'الجزائر', icon: '🇩🇿', color: '#34D399' },
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
            البطولات المتاحة
          </Text>

          {leagues.map((league) => {
            const active = selectedLeague === league.name;
            return (
              <TouchableOpacity
                key={league.name}
                onPress={() => setSelectedLeague(league.name)}
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: active ? '#14251A' : '#101713',
                  borderWidth: 1,
                  borderColor: active ? GREEN : '#203329',
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <Text style={{ color: GREEN, fontSize: 20 }}>‹</Text>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' }}>
                    {league.name}
                  </Text>
                  <Text style={{ color: MUTED, fontSize: 12, marginTop: 5 }}>
                    {league.country}
                  </Text>
                </View>
                <Text style={{ fontSize: 27, marginLeft: 13 }}>{league.icon}</Text>
              </TouchableOpacity>
            );
          })}

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
                    <Text style={{ color: GREEN, width: 34, textAlign: 'center', fontSize: 11, fontWeight: '900' }}>لعب</Text>
                    <Text style={{ color: GREEN, width: 38, textAlign: 'center', fontSize: 11, fontWeight: '900' }}>فارق</Text>
                    <Text style={{ color: GREEN, width: 38, textAlign: 'center', fontSize: 11, fontWeight: '900' }}>نقاط</Text>
                  </View>

                  {standings.map((row, index) => (
                    <View
                      key={String(row.team?.id || row.position || index)}
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
                      <Text numberOfLines={1} style={{ color: '#FFFFFF', flex: 1, textAlign: 'right', fontSize: 12, fontWeight: 'bold' }}>
                        {row.team?.short_name || row.team?.name || '—'}
                      </Text>
                      <Text style={{ color: '#FFFFFF', width: 34, textAlign: 'center', fontSize: 12 }}>
                        {row.played ?? 0}
                      </Text>
                      <Text style={{ color: '#FFFFFF', width: 38, textAlign: 'center', fontSize: 12 }}>
                        {row.goal_difference > 0 ? `+${row.goal_difference}` : (row.goal_difference ?? 0)}
                      </Text>
                      <Text style={{ color: GREEN, width: 38, textAlign: 'center', fontSize: 13, fontWeight: '900' }}>
                        {row.points ?? 0}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={{ color: MUTED, fontSize: 13, textAlign: 'right', marginTop: 12 }}>
                  لا توجد بيانات ترتيب متاحة حالياً.
                </Text>
              )}
            </View>
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
          <View style={{ backgroundColor: PANEL, borderRadius: 16, padding: 18, marginBottom: 15, borderWidth: 1, borderColor: '#245235' }}>
            <Text style={{ color: GREEN, fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 18 }}>
              تفاصيل المباراة
            </Text>

            <Text style={{ color: MUTED, textAlign: 'center', marginBottom: 8 }}>
              {selectedMatch.league || 'بطولة غير محددة'}
            </Text>
            <Text style={{ color: GREEN, textAlign: 'center', fontWeight: '800', marginBottom: 20 }}>
              {selectedMatch.status || 'موعد المباراة'} • {selectedMatch.time || '--:--'}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                {selectedMatch.homeLogo ? <Image source={{ uri: selectedMatch.homeLogo }} style={{ width: 65, height: 65, resizeMode: 'contain', marginBottom: 8 }} /> : null}
                <Text style={{ color: '#FFFFFF', fontWeight: '900', textAlign: 'center' }}>
                  {selectedMatch.home || 'الفريق الأول'}
                </Text>
              </View>

              <Text style={{ color: GREEN, fontSize: 22, fontWeight: '900', marginHorizontal: 10, writingDirection: 'ltr' }}>
                {Array.isArray(selectedMatch.score) && selectedMatch.score.length >= 2
                  ? `${selectedMatch.score[0]} - ${selectedMatch.score[1]}`
                  : 'VS'}
              </Text>

              <View style={{ flex: 1, alignItems: 'center' }}>
                {selectedMatch.awayLogo ? <Image source={{ uri: selectedMatch.awayLogo }} style={{ width: 65, height: 65, resizeMode: 'contain', marginBottom: 8 }} /> : null}
                <Text style={{ color: '#FFFFFF', fontWeight: '900', textAlign: 'center' }}>
                  {selectedMatch.away || 'الفريق الثاني'}
                </Text>
              </View>
            </View>

            <View style={{ backgroundColor: '#17231B', borderRadius: 10, padding: 14, marginTop: 18, marginBottom: 8 }}>
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

            <View style={{ backgroundColor: '#17231B', borderRadius: 10, padding: 14, marginTop: 18, marginBottom: 8 }}>
              <Text style={{ color: GREEN, fontSize: 17, fontWeight: '900', textAlign: 'center', marginBottom: 12 }}>
                إحصائيات المباراة
              </Text>
              {statsLoading ? (
                <Text style={{ color: MUTED, textAlign: 'center' }}>جارٍ تحميل الإحصائيات...</Text>
              ) : matchStats.length === 2 ? (
                matchStats[0].statistics.map((stat, index) => {
                  const other = matchStats[1].statistics.find(item => item.type === stat.type);
                  const value1 = stat.value ?? '--';
                  const value2 = other?.value ?? '--';
                  return (
                    <View key={stat.type || index} style={{ paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#293A30' }}>
                      <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: '700' }}>{stat.type}</Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                        <Text style={{ color: GREEN, fontWeight: '900' }}>{String(value1)}</Text>
                        <Text style={{ color: '#FFFFFF' }}>—</Text>
                        <Text style={{ color: GREEN, fontWeight: '900' }}>{String(value2)}</Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={{ color: MUTED, textAlign: 'center', fontWeight: '700' }}>
                  {statsError || 'الإحصائيات غير متاحة حاليًا لهذه المباراة'}
                </Text>
              )}
            </View>

<View style={{ backgroundColor: '#17231B', borderRadius: 10, padding: 14, marginTop: 12, marginBottom: 8 }}>
  <Text style={{ color: GREEN, fontSize: 17, fontWeight: '900', textAlign: 'center', marginBottom: 12 }}>أحداث المباراة</Text>
  {matchEvents.length > 0 ? matchEvents.map((event, index) => {
    const type = String(event.type || '');
    const detail = String(event.detail || '');
    const symbol = /goal/i.test(type) ? '⚽' : /card/i.test(type) ? (/red/i.test(detail) ? '🟥' : '🟨') : /subst/i.test(type) ? '🔄' : '•';
    return (
      <View key={index} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#293A30' }}>
        <Text style={{ color: GREEN, fontWeight: '900', textAlign: 'center' }}>{event.time?.elapsed ?? '--'}' {symbol} {type} {detail}</Text>
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
              onPress={() => selectedMatch.url ? openMatchInsideApp(selectedMatch.url) : Alert.alert('تنبيه', 'رابط المباراة غير متوفر.')}
              style={{ backgroundColor: '#153D27', borderRadius: 10, padding: 13, alignItems: 'center', marginTop: 10 }}
            >
              <Text style={{ color: GREEN, fontWeight: '900' }}>▶ مشاهدة داخل التطبيق</Text>
            </TouchableOpacity>
          </View>
        ) : tab === 'الرئيسية' ? (
          <Home />
        ) : tab === 'البث المباشر' ? (
          <BroadcastPage />
        ) : tab === 'المباريات' ? (
          <MatchesPage />
        ) : (
          <OtherPage />
        )}

        <Text style={styles.footer}>
          CHARARA SPORT DZ © 2026
        </Text>
      </ScrollView>

      <View style={styles.bottomNav}>
        {tabs.map((item, index) => {
          const icons = ['⌂', '⚽', '📺', '🏆', '♙'];
          const active = tab === item;
          const labels = [
            'الرئيسية',
            'المباريات',
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
    gap: 10,
    marginBottom: 25,
  },
  league: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#111A15',
    padding: 17,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#294535',
  },
  leagueIcon: {
    fontSize: 22,
    marginLeft: 12,
  },
  leagueName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
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

