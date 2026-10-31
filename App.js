import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

const GREEN = '#00E676';
const BG = '#070B09';
const PANEL = '#111A15';
const MUTED = '#91A398';

export default function App() {
  const [tab, setTab] = useState('الرئيسية');
  const [category, setCategory] = useState('الكل');

  const tabs = ['الرئيسية', 'المباريات', 'البطولات', 'حسابي'];
  const categories = ['الكل', 'مباشر', 'اليوم', 'غداً'];

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

  const Home = () => (
    <>
      <View style={styles.hero}>
        <Text style={styles.heroSmall}>مرحباً بك في عالم كرة القدم</Text>
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
          <Text style={styles.heroButtonText}>اكتشف المباريات ←</Text>
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

    if (tab === 'المباريات') {
      description = 'ستظهر هنا المباريات القادمة والنتائج المباشرة بعد ربط مصدر البيانات.';
    } else if (tab === 'البطولات') {
      description = 'تابع أشهر البطولات والدوريات من مختلف أنحاء العالم.';
    } else {
      description = 'قريباً: حسابك الشخصي وعضوية شرارة Premium.';
    }

    return (
      <View style={styles.pageCard}>
        <Text style={styles.pageIcon}>
          {tab === 'المباريات' ? '⚽' :
           tab === 'البطولات' ? '🏆' : '👤'}
        </Text>
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
        {tab === 'الرئيسية' ? <Home /> : <OtherPage />}

        <Text style={styles.footer}>
          CHARARA SPORT DZ © 2026
        </Text>
      </ScrollView>

      <View style={styles.bottomNav}>
        {tabs.map((item, index) => {
          const icons = ['⌂', '⚽', '🏆', '♙'];
          const active = tab === item;

          return (
            <TouchableOpacity
              key={item}
              style={styles.navItem}
              onPress={() => setTab(item)}
            >
              <Text style={[
                styles.navIcon,
                active && { color: GREEN },
              ]}>
                {icons[index]}
              </Text>
              <Text style={[
                styles.navText,
                active && { color: GREEN },
              ]}>
                {item}
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
    minWidth: 65,
  },
  navIcon: {
    fontSize: 21,
    color: MUTED,
  },
  navText: {
    fontSize: 10,
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
