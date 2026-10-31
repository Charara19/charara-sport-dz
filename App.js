
import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';

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

export default function App() {
  const [tab, setTab] = useState('الرئيسية');
  const [category, setCategory] = useState('الكل');

  const tabs = [
    'الرئيسية',
    'المباريات',
    'البث المباشر',
    'البطولات',
    'حسابي',
  ];

  const categories = ['الكل', 'مباشر', 'اليوم', 'غداً'];

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

      <View style={styles.emptyCard}>
        <Text style={styles.emptyIcon}>⚽</Text>
        <Text style={styles.emptyTitle}>
          لا توجد بيانات مباريات حالياً
        </Text>
        <Text style={styles.emptyDesc}>
          سيتم عرض المباريات والنتائج الحقيقية هنا
          بعد ربط التطبيق بمصدر بيانات رياضي.
        </Text>
      </View>

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
    let title = tab;
    let description = '';
    let icon = '👤';

    if (tab === 'المباريات') {
      description =
        'ستظهر هنا المباريات القادمة والنتائج المباشرة بعد ربط مصدر البيانات.';
      icon = '⚽';
    } else if (tab === 'البطولات') {
      description =
        'تابع أشهر البطولات والدوريات من مختلف أنحاء العالم.';
      icon = '🏆';
    } else {
      description =
        'قريباً: حسابك الشخصي وعضوية شرارة Premium.';
    }

    return (
      <View style={styles.pageCard}>
        <Text style={styles.pageIcon}>{icon}</Text>
        <Text style={styles.pageTitle}>{title}</Text>
        <Text style={styles.pageDesc}>{description}</Text>
        <Text style={styles.coming}>قريباً بإذن الله</Text>
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
        {tab === 'الرئيسية' ? (
          <Home />
        ) : tab === 'البث المباشر' ? (
          <BroadcastPage />
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
    height: 76,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1B2920',
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
    backgroundColor: '#10271A',
    borderRadius: 22,
    padding: 22,
    marginBottom: 27,
    borderWidth: 1,
    borderColor: '#205735',
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
    backgroundColor: PANEL,
    paddingVertical: 9,
    paddingHorizontal: 17,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#25352A',
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
    backgroundColor: PANEL,
    borderRadius: 18,
    padding: 23,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#24372B',
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
    backgroundColor: PANEL,
    padding: 15,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#203128',
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
  broadcastHero: {
    backgroundColor: '#10271A',
    borderRadius: 22,
    padding: 23,
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#205735',
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
    height: 70,
    backgroundColor: '#101713',
    borderTopWidth: 1,
    borderTopColor: '#24372B',
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    alignItems: 'center',
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

