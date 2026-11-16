/**
 * Structured Editorial Content Registry (Phase 2 Content Quality Pilot)
 *
 * POLICY & SAFEGUARDS:
 * - Contains verified, facility-specific editorial overviews and local city guides.
 * - Every fact is sourced from official websites, architectural records, or verified public archives.
 * - Prayer times are NOT fabricated; only verified service availability (e.g. "offers Friday Jumu'ah") is noted.
 * - Raw source datasets remain 100% immutable in data/raw/*.json.
 */

export interface MosqueEditorialEntry {
  slug: string;
  facilityName: string;
  headline: string;
  summary: string;
  locationContext: string;
  confirmedServices: string[];
  confirmedAmenities?: {
    parking?: string;
    accessibility?: string;
    prayerSpace?: string;
  };
  visitorGuidance?: string;
  verification: {
    status: 'verified';
    verifiedDate: string; // ISO format: YYYY-MM-DD
    sourceName: string;
    sourceUrl?: string;
    sourceType: 'official_website' | 'official_archive' | 'municipal_record';
  };
}

export interface CityEditorialEntry {
  stateCode: string;
  citySlug: string;
  headline: string;
  overview: string;
  communityContext: string;
  geographicDistribution: string;
  dataNotice: string;
  verification: {
    verifiedDate: string;
    sourceName: string;
  };
}

/**
 * 9 Controlled Pilot Mosque Entries across 8 States & 3 Information Tiers
 */
export const MOSQUE_EDITORIAL_REGISTRY: Record<string, MosqueEditorialEntry> = {
  // ─── TIER 1: RICH INFORMATION FACILITIES (3) ─────────────────────────────
  
  'east-plano-islamic-center': {
    slug: 'east-plano-islamic-center',
    facilityName: 'East Plano Islamic Center (EPIC)',
    headline: 'Major Community Campus & Regional Islamic Center in Collin County',
    summary:
      'East Plano Islamic Center (EPIC) is one of the largest and most active Islamic community campuses in North Texas. Operating from a 33,000-square-foot facility on 14th Street, the center serves thousands of Muslim families across Plano, Richardson, Murphy, and neighboring Collin County communities with extensive religious, educational, and social services.',
    locationContext:
      'Located at 4700 14th St in eastern Plano, approximately two miles east of US-75 (Central Expressway), near the K Avenue commercial corridor.',
    confirmedServices: [
      'Daily congregational prayers',
      'Multiple Jumu\'ah (Friday) prayer shifts',
      'Full-time and part-time Quran memorization (Hifz) academy',
      'Weekend Islamic school for children and youth',
      'Free community health clinic (EPIC Medical Clinic at 4740 14th St)',
      'Weekly drive-thru food pantry & community charity distribution',
      'Indoor gymnasium & youth sports leagues',
      'Nikah (marriage) solemnization & Janazah bereavement coordination'
    ],
    confirmedAmenities: {
      parking: 'Dedicated paved parking lot on site with overflow arrangements during peak Jumu\'ah and Ramadan gatherings.',
      accessibility: 'Wheelchair accessible main entrance, designated accessible parking spaces, and accessible restroom facilities.',
      prayerSpace: 'Large multi-level prayer halls accommodating men and women with dedicated ablution (wudu) areas.'
    },
    visitorGuidance:
      'Due to high attendance, visitors attending Friday Jumu\'ah prayers are strongly advised to arrive early and follow on-site parking attendant directions. The EPIC Medical Clinic operates nearby on 14th Street with specialized walk-in and appointment hours.',
    verification: {
      status: 'verified',
      verifiedDate: '2026-10-31',
      sourceName: 'East Plano Islamic Center Official Website & Community Records',
      sourceUrl: 'https://www.epicmasjid.org/',
      sourceType: 'official_website'
    }
  },

  'al-farooq-mosque-atlanta-ga': {
    slug: 'al-farooq-mosque-atlanta-ga',
    facilityName: 'Al-Farooq Masjid of Atlanta',
    headline: 'Historic Landmark Mosque & Educational Center in Midtown Atlanta',
    summary:
      'Established in 1980 originally as The Atlanta Mosque, Al-Farooq Masjid is one of the oldest and largest Islamic institutions in the Southeastern United States. The landmark campus on 14th Street NW underwent a comprehensive $10 million reconstruction completed in 2008, featuring octagonal copper domes and minarets that form a prominent architectural presence near the Georgia Institute of Technology.',
    locationContext:
      'Located at 442 14th St NW in Atlanta\'s Home Park neighborhood, situated between Midtown Atlanta and the Georgia Tech campus.',
    confirmedServices: [
      'Five daily congregational prayers',
      'Multiple Friday Jumu\'ah prayer services with bilingual sermons',
      'Dar-un-Noor Academy (accredited full-time Islamic day school Pre-K to 8th grade)',
      'Dar-ul-Uloom of Atlanta (full-time Quranic memorization and Islamic studies)',
      'Community cemetery management (Lovejoy Muslim Cemetery)',
      'Weekend Islamic school for youth',
      'Marriage solemnization (Nikah) and funeral services',
      'Interfaith educational tours & public outreach'
    ],
    confirmedAmenities: {
      parking: 'On-site parking deck and surface lot; free parking for worshippers.',
      accessibility: 'Elevator access, wheelchair accessible entrance, parking stalls, and accessible restrooms.',
      prayerSpace: 'Expansive main prayer hall and dedicated women\'s prayer gallery with separate entrance and wudu areas.'
    },
    visitorGuidance:
      'Worshippers visiting during Friday Jumu\'ah should utilize the multi-level parking deck accessible from 14th Street. The mosque is located near the Georgia Institute of Technology campus, in Atlanta\'s Home Park neighborhood.',
    verification: {
      status: 'verified',
      verifiedDate: '2026-10-31',
      sourceName: 'Al-Farooq Masjid Official Website & Archnet Architectural Archive (Independent Archive)',
      sourceUrl: 'http://alfarooqmasjid.org/',
      sourceType: 'official_website'
    }
  },

  'king-fahad-mosque-los-angeles': {
    slug: 'king-fahad-mosque-los-angeles',
    facilityName: 'King Fahad Mosque',
    headline: 'Architectural Landmark & Cultural Center in Culver City',
    summary:
      'Opened in July 1998, the King Fahad Mosque is a prominent architectural landmark serving the Muslim community of Culver City, the Westside, and Greater Los Angeles. Managed by the Islamic Foundation of Shaikh Ibn Taymiyyah, the center covers over 63,000 square feet and features a striking white marble facade, custom Turkish ceramic tilework, and a distinctive 72-foot minaret topped with a golden crescent.',
    locationContext:
      'Situated at 10980 Washington Blvd in Culver City, near the intersection with Overland Avenue, convenient to the I-405 (San Diego Freeway) and I-10 (Santa Monica Freeway).',
    confirmedServices: [
      'Five daily congregational prayers',
      'Weekly Friday Jumu\'ah prayer and khutbah',
      'Islamic research library and bookstore on site',
      'Classrooms for community lectures and weekend study circles',
      'Community hall and conference space',
      'Annual Ramadan Iftar programs and Taraweeh prayers'
    ],
    confirmedAmenities: {
      parking: 'On-site parking lot adjacent to the main building with entrance from Washington Blvd.',
      accessibility: 'Ground-level wheelchair accessible entrance, accessible parking spaces, and accessible restrooms.',
      prayerSpace: 'Spacious central prayer hall with dome architecture oriented toward the Qiblah, alongside a dedicated women\'s prayer mezzanine.'
    },
    visitorGuidance:
      'Street parking along Washington Boulevard is metered during daytime commercial hours. Visitors are requested to park in the dedicated mosque lot when attending prayer services.',
    verification: {
      status: 'verified',
      verifiedDate: '2026-10-31',
      sourceName: 'King Fahad Mosque Official Profile & Archnet Architecture Records',
      sourceUrl: 'https://kingfahadmosque.org/',
      sourceType: 'official_website'
    }
  },

  // ─── TIER 2: MEDIUM INFORMATION FACILITIES (4) ───────────────────────────

  'masjid-ar-rahman': {
    slug: 'masjid-ar-rahman',
    facilityName: 'Masjid Ar-Rahman',
    headline: 'Historic Midtown Manhattan Storefront Mosque Serving Commuters & Residents',
    summary:
      'Incorporated in 1992, Masjid Ar-Rahman has provided a vital spiritual sanctuary for more than three decades in the heart of Midtown Manhattan. Located on West 29th Street between Fifth Avenue and Broadway in the NoMad neighborhood, the mosque primarily serves office workers, commuters, local residents, and international visitors navigating midtown New York.',
    locationContext:
      'Located at 15 W 29th St in Manhattan (ZIP 10001), steps from Broadway and Fifth Avenue, within walking distance of the 28th St subway station (N, R, W and 6 trains) and Herald Square.',
    confirmedServices: [
      'Five daily congregational prayers',
      'Multiple shifts of Friday Jumu\'ah prayer to accommodate midtown office schedules',
      'Ramadan Taraweeh prayers and communal gatherings',
      'Separate street-level access and dedicated prayer facilities for men and women'
    ],
    confirmedAmenities: {
      parking: 'No dedicated parking facility; visitors should utilize nearby commercial parking garages or public transit.',
      accessibility: 'Street-level entrance with accessible restroom; primary prayer hall is on the lower level.',
      prayerSpace: 'Basement and ground-level prayer space with separate men\'s and women\'s sections.'
    },
    visitorGuidance:
      'Because Midtown Manhattan street parking is heavily restricted, visiting via public transportation (MTA subway via 28th St or 34th St-Herald Sq) is strongly recommended. The facility observes five daily prayers and holds multiple Friday Jumu\'ah prayer shifts to accommodate midtown workers and community members. Regular commercial opening hours are not published; visitors should consult the official website for current prayer timetables.',
    verification: {
      status: 'verified',
      verifiedDate: '2026-10-31',
      sourceName: 'Masjid Ar-Rahman NYC Official Website & Archnet NYC Archive',
      sourceUrl: 'https://masjidarrahmannyc.org/',
      sourceType: 'official_website'
    }
  },

  'islamic-center-of-greater-cincinnati-icgc': {
    slug: 'islamic-center-of-greater-cincinnati-icgc',
    facilityName: 'Islamic Center of Greater Cincinnati (ICGC)',
    headline: '18-Acre Suburban Campus & Interfaith Resource in West Chester',
    summary:
      'Dedicated on November 9, 1995, the Islamic Center of Greater Cincinnati (ICGC) is an 18-acre institution in Butler County, Ohio. Designed by Egyptian architect Ramzi Mahallawi, the facility features traditional Moorish and Syrian architectural elements with an octagonal gold dome and minaret. It serves as a major congregational, educational, and interfaith bridge-building center for the tri-state area.',
    locationContext:
      'Situated at 8092 Plantation Dr in West Chester Township, just off I-75 at the Tylersville Road exit in the northern Cincinnati suburbs.',
    confirmedServices: [
      'Five daily congregational prayers',
      'Friday Jumu\'ah prayers and sermons',
      'El-Sewedy International Academy of Cincinnati (full-time private academic school on campus)',
      'Weekend educational programs and Quran study circles',
      'Multipurpose gymnasium and community gathering hall',
      'Extensive interfaith tour program, school visits, and educational open houses'
    ],
    confirmedAmenities: {
      parking: 'Extensive on-site paved surface parking accommodating hundreds of vehicles across campus.',
      accessibility: 'Wheelchair accessible ramps, designated accessible parking stalls, and accessible restrooms.',
      prayerSpace: 'Main prayer hall with imported marble ornamentation, alongside women\'s prayer gallery and dedicated wudu facilities.'
    },
    visitorGuidance:
      'The center regularly offers guided educational tours for school, civic, and church groups. Visitors must park in designated visitor spaces and register at the community administration building upon arrival.',
    verification: {
      status: 'verified',
      verifiedDate: '2026-10-31',
      sourceName: 'Islamic Center of Greater Cincinnati Official Website & Public Archive',
      sourceUrl: 'https://icgc.us/',
      sourceType: 'official_website'
    }
  },

  'masjid-alsalam-dearborn-mi': {
    slug: 'masjid-alsalam-dearborn-mi',
    facilityName: 'Dearborn Community Center (Masjid Alsalam)',
    headline: 'Community-Centered Mosque & Educational Center on Schaefer Road',
    summary:
      'Operating under the Dearborn Community Center (DCC), Masjid Alsalam is a 501(c)(3) religious and social organization serving families across eastern Dearborn and Wayne County. Located on Schaefer Road, the center provides daily prayers, educational classes for youth, and family support services within one of North America\'s most established Muslim communities.',
    locationContext:
      'Located at 3900 Schaefer Rd in Dearborn, MI 48126, situated between Ford Road (M-153) and Michigan Avenue (US-12).',
    confirmedServices: [
      'Daily congregational prayers',
      'Friday Jumu\'ah prayers with Arabic and English khutbah offerings',
      'Weekend school offering Arabic language and Quranic instruction for youth',
      'Youth mentoring and educational halaqas',
      'Islamic family counseling and dispute mediation',
      'Nikah (marriage) solemnization services'
    ],
    confirmedAmenities: {
      parking: 'Dedicated surface parking lot adjoining the facility on Schaefer Road.',
      accessibility: 'Wheelchair accessible entrance, accessible parking spaces, and accessible restrooms.',
      prayerSpace: 'Spacious prayer facilities with separate ablution and prayer spaces for men and women.'
    },
    visitorGuidance:
      'The facility is located in an active commercial and civic district of Dearborn. Visitors are encouraged to verify current Jumu\'ah shift schedules directly via the center\'s office line at (313) 584-9494.',
    verification: {
      status: 'verified',
      verifiedDate: '2026-10-31',
      sourceName: 'Dearborn Community Center (DCC Masjid Alsalam) Official Records',
      sourceUrl: 'https://www.dccalsalam.org/',
      sourceType: 'official_website'
    }
  },

  'mclean-islamic-center': {
    slug: 'mclean-islamic-center',
    facilityName: 'McLean Islamic Center (MIC)',
    headline: 'Community-Founded Islamic Center in Northern Virginia',
    summary:
      'Founded in 2009 by local residents under the McLean Islamic Community Center, MIC is an active 501(c)(3) religious institution serving Muslims across McLean, Vienna, Tysons, and northern Fairfax County. The center emphasizes Quranic grounding, youth education, community service, and local civic engagement.',
    locationContext:
      'Located at 8800 Jarrett Valley Dr in Vienna, VA 22182, near the Leesburg Pike (VA-7) corridor and minutes from Tysons Corner.',
    confirmedServices: [
      'Five daily congregational prayers',
      'Weekly Friday Jumu\'ah prayers',
      'MIC Sunday School and "MIC Middle" programs for youth character development',
      'Adult Quran study clubs and women\'s reflection halaqas',
      'Community charitable food drives ("MIC Service Saturday")',
      'Nikah solemnization and family counseling support'
    ],
    confirmedAmenities: {
      parking: 'On-site parking spaces with overflow protocols managed during high-volume gatherings.',
      accessibility: 'Wheelchair accessible building entrance, designated accessible parking, and accessible restrooms.',
      prayerSpace: 'Community prayer hall accommodating congregational worship for men and women.'
    },
    visitorGuidance:
      'Due to proximity to residential neighborhoods, visitors are asked to observe community speed limits along Jarrett Valley Drive and park strictly in designated marked stalls.',
    verification: {
      status: 'verified',
      verifiedDate: '2026-10-31',
      sourceName: 'McLean Islamic Center Official Website & Virginia Non-Profit Registry',
      sourceUrl: 'http://www.mcleanmuslims.org/',
      sourceType: 'official_website'
    }
  },

  // ─── TIER 3: SPARSE INFORMATION FACILITIES (2) ───────────────────────────
  // Note: Daly City Musalla editorial profile removed following independent fact audit
  // (unverified storefront / empirical evidence indicates relocation to 7330 Mission St).
  // Facility remains active as a standard directory listing based on immutable raw data.

  'oviedo-musalla-masjid': {
    slug: 'oviedo-musalla-masjid',
    facilityName: 'Oviedo Musalla (Masjid)',
    headline: 'Suburban Prayer Space in Eastern Seminole County',
    summary:
      'Oviedo Musalla provides a dedicated Islamic prayer facility in eastern Seminole County, Florida. Located within the Alexandria Boulevard commercial park, the facility offers a local prayer space for residents of Oviedo, Winter Springs, and surrounding communities.',
    locationContext:
      'Located at 100 Alexandria Blvd, Suite 24, Oviedo, FL 32765, positioned just off Central Florida Greeneway (SR 417) and Aloma Avenue (SR 426).',
    confirmedServices: [
      'Daily congregational prayers',
      'Friday Jumu\'ah prayer gatherings'
    ],
    confirmedAmenities: {
      parking: 'Commercial business park surface parking fronting Suite 24.',
      accessibility: 'Ground-floor wheelchair accessible entrance, accessible parking spaces, and accessible restrooms.',
      prayerSpace: 'Indoor commercial suite prayer space with ablution area.'
    },
    visitorGuidance:
      'Worshippers should park in general visitor stalls fronting Suite 24 and avoid reserved stalls for neighboring commercial tenants. Contact (407) 603-0431 for current Jumu\'ah timing.',
    verification: {
      status: 'verified',
      verifiedDate: '2026-10-31',
      sourceName: 'Florida Division of Corporations Public Records & Regional Community Directories',
      sourceType: 'official_archive'
    }
  },

  'harrisburg-mosque': {
    slug: 'harrisburg-mosque',
    facilityName: 'Harrisburg Mosque',
    headline: 'Neighborhood Masjid in Allison Hill, Harrisburg',
    summary:
      'Harrisburg Mosque (also known locally as Harrisburg Masjid) is a neighborhood place of worship located on South 17th Street in the Allison Hill section of Harrisburg, Pennsylvania, serving local Dauphin County residents in the city\'s historic urban core.',
    locationContext:
      'Located at 200 S 17th St in Harrisburg, PA 17104, at the corner of 17th Street and Chestnut Street in the Allison Hill neighborhood.',
    confirmedServices: [],
    confirmedAmenities: {
      parking: 'Neighborhood on-street parking along South 17th Street and Chestnut Street.',
      accessibility: 'Ground-level entrance from the sidewalk.',
      prayerSpace: 'Neighborhood prayer facility.'
    },
    visitorGuidance:
      'Because congregational prayer schedules are not publicly posted and entrance doors may not remain open outside specific prayer times, worshippers are strongly advised to contact the facility in advance at (717) 232-4545 to confirm current prayer times and visitor access. Note that this location is distinct from the Islamic Center Al-Sabereen located on South Cameron Street.',
    verification: {
      status: 'verified',
      verifiedDate: '2026-10-31',
      sourceName: 'Dauphin County Public Records & Regional Community Directories',
      sourceType: 'official_archive'
    }
  }
};

/**
 * 3 Controlled Pilot City Entries across Rich, Medium, and Limited Directory Coverage
 */
export const CITY_EDITORIAL_REGISTRY: Record<string, CityEditorialEntry> = {
  'TX|houston': {
    stateCode: 'TX',
    citySlug: 'houston',
    headline: 'Guide to Mosques & Islamic Centers in Houston, Texas',
    overview:
      'Covering a sprawling metropolitan region across Harris and neighboring Fort Bend counties, the City of Houston hosts Texas\'s largest Muslim population. Our directory documents 70 verified mosques and Islamic centers within the City of Houston municipal listings, alongside two records currently under administrative review. The directory spans prominent regional campuses affiliated with the Islamic Society of Greater Houston (ISGH) branch network to neighborhood prayer spaces across major urban corridors.',
    communityContext:
      'The Houston Muslim community is organized largely through community-governed centers and regional networks such as the Islamic Society of Greater Houston (ISGH). Independent sociological and demographic studies document that the metropolitan Muslim population represents diverse backgrounds, including South Asian, Arab, West African, Latino, and African American communities.',
    geographicDistribution:
      'Facilities are distributed across several major municipal corridors: the Southwest Houston corridor (including Hillcroft, Bissonnet, and Harwin), the North Houston corridor along FM 1960, West Houston / Energy Corridor (along Westheimer), and Southeast Houston in the Clear Lake area. Surrounding communities such as Spring and Pasadena maintain separate community listings.',
    dataNotice:
      'Our directory contains 72 listing records in the City of Houston: 70 verified facilities and 2 records associated with a shared address currently under review. Thirty-nine facilities have confirmed opening hours and 47 provide direct official website links (including 45 standalone websites and two social media community pages). Worshippers are advised to verify Friday Jumu\'ah times directly with individual centers, as many large Houston facilities hold multiple sequential prayer shifts.',
    verification: {
      verifiedDate: '2026-10-31',
      sourceName: 'City of Houston Mosque Directory & Municipal Public Records'
    }
  },

  'MI|dearborn': {
    stateCode: 'MI',
    citySlug: 'dearborn',
    headline: 'Historic Muslim Community & Mosque Directory in Dearborn, Michigan',
    overview:
      'With the American Moslem Society founded in 1937 among the earliest formal Islamic institutions in North America, Dearborn represents nearly nine decades of continuous Arab and Muslim American civic and cultural heritage in Wayne County. Our directory indexes 12 verified mosques and Islamic centers in Dearborn, reflecting one of the most historically rooted Muslim communities on the continent.',
    communityContext:
      'The Muslim community in Dearborn is notable for establishing some of the earliest and most architecturally significant Islamic institutions in North America. These include the Islamic Center of America—an institution founded in 1963 whose landmark campus at 19500 Ford Road opened in 2005 as one of the largest mosques in North America—alongside historic congregations such as the American Moslem Society (established in 1937 on Dix Avenue, now on Vernor Highway) and community institutions like the Dearborn Community Center Masjid Alsalam.',
    geographicDistribution:
      'Dearborn\'s Islamic facilities are primarily clustered in two main areas: East Dearborn along the Schaefer Road and Warren Avenue commercial corridors, and West Dearborn along the Ford Road (M-153) and Michigan Avenue (US-12) thoroughfares.',
    dataNotice:
      'In Dearborn, 9 of the 12 listed facilities maintain published hours, and 9 provide direct official websites (including eight direct organizational websites and one social media community page). Facilities are easily accessible via Michigan Avenue (US-12) and Ford Road (M-153), connecting worshippers across metropolitan Wayne County.',
    verification: {
      verifiedDate: '2026-10-31',
      sourceName: 'Dearborn Islamic Institutions Survey & Wayne County Public Records'
    }
  },

  'PA|mechanicsburg': {
    stateCode: 'PA',
    citySlug: 'mechanicsburg',
    headline: 'Mosques & Islamic Centers in Mechanicsburg, Pennsylvania',
    overview:
      'Situated along the West Shore of the Susquehanna River in Cumberland County, Mechanicsburg serves as an important suburban center for Muslim families across the greater Harrisburg capital region. Our directory indexes 5 verified listing records across 4 physical properties in Mechanicsburg, meeting directory inclusion criteria for Cumberland County\'s West Shore communities.',
    communityContext:
      'The facilities in Mechanicsburg serve both local resident families and regional communities, including the Bosnia & Herzegovina Islamic Center of Pennsylvania on Simpson Ferry Road (supporting the regional Bosnian-American population), alongside community centers like Al-Nur Mosque and the Islamic Center of PA.',
    geographicDistribution:
      'Facilities in Mechanicsburg are situated along three primary transit corridors: Simpson Ferry Road (Al-Nur Mosque and the Bosnia & Herzegovina Islamic Center), East Trindle Road (where the Islamic Center of PA and Al-Hikmeh Institute are co-located at 5138 E Trindle Rd), and Wertzville Road (American Islamic Cultural Center).',
    dataNotice:
      'The directory documents 5 listing records representing 4 distinct physical properties, as the Islamic Center of PA and the Al-Hikmeh Institute share the 5138 E Trindle Rd facility. Among these listings, 4 maintain direct telephone contacts and 4 have active web links. Due to modest facility sizes, visitors attending Friday Jumu\'ah prayers are advised to contact individual centers in advance.',
    verification: {
      verifiedDate: '2026-10-31',
      sourceName: 'Cumberland County Mosque Directory & West Shore Public Records'
    }
  },

  // ─── PHASE 4A METROPOLITAN CITY GUIDES (BATCH 1) ─────────────────────────

  'CA|san-diego': {
    stateCode: 'CA',
    citySlug: 'san-diego',
    headline: 'Guide to Mosques & Islamic Centers in San Diego, California',
    overview:
      'Anchored by diverse coastal, mesa, and urban neighborhoods across California\'s second-largest city, San Diego features a vibrant and geographically diverse Muslim community. Our directory documents 13 verified mosques and Islamic centers within the City of San Diego municipal boundaries, ranging from prominent regional campuses like the Islamic Center of San Diego (ICSD) in Clairemont and the Muslim Community Center (MCC) in northeastern San Diego to neighborhood urban masajid.',
    communityContext:
      'The San Diego Muslim community reflects remarkable cultural breadth, bringing together established Arab, Somali, Afghan, South Asian, East African, and African American populations. The Islamic Center of San Diego (ICSD) on Eckstrom Avenue, founded between 1987 and 1990 with distinctive purpose-built architecture designed by architect Robert de Lauriers, serves as the central institutional anchor for regional community life. In inland North County, the Muslim Community Center (MCC) of Greater San Diego on Via Fiesta operates a major spiritual and educational campus including the Al-Manar school. Along the historic Imperial Avenue corridor, Masjidul Taqwa has long anchored community life and social service outreach in Southeastern San Diego.',
    geographicDistribution:
      'Facilities are distributed across four primary municipal sectors: Central / Clairemont Mesa (anchored by ICSD and the Afghan Community Center); the Miramar and Mira Mesa commercial corridor (including MAS Community Center, Masjid Hamza, and Darululoom San Diego); Mid-City / City Heights along University Avenue and El Cajon Boulevard (neighborhood congregations including Huda Community Center, Masjid An-Nur, Masjid Al-Ansar, and Masjid Al-Ribat); and Southeastern San Diego along Imperial Avenue (Masjidul Taqwa, Masjid Omar, and Masjid Sunnah). East County communities such as El Cajon maintain independent municipal listings.',
    dataNotice:
      'Of the 13 listed facilities in the City of San Diego directory, 9 display published opening hours in directory records, while 4 state "Hours Not Listed." Telephone contacts are listed for 12 facilities and website links for 10. Worshippers are advised to contact individual centers directly to confirm current prayer times and visitor access.',
    verification: {
      verifiedDate: '2026-11-02',
      sourceName: 'San Diego Islamic Institutions Directory & Municipal Archives'
    }
  },

  'NY|brooklyn': {
    stateCode: 'NY',
    citySlug: 'brooklyn',
    headline: 'Borough Directory of Mosques & Islamic Centers in Brooklyn, New York',
    overview:
      'Reflecting more than a century of immigrant and indigenous Muslim history, Brooklyn (Kings County) represents the most facility-dense Islamic directory in New York, indexing 103 listing records across historic brownstone, storefront, and purpose-built congregational spaces. The borough\'s Islamic landscape is anchored by prominent institutions including Masjid Al-Farooq on Atlantic Avenue in Boerum Hill and the Islamic Society of Bay Ridge (ISBR) on 5th Avenue.',
    communityContext:
      'Brooklyn\'s Islamic history spans multiple generations and traditions. Masjid Al-Farooq, established in 1976 within an adapted 1928 industrial building on Atlantic Avenue, stands as one of the borough\'s foremost religious and educational institutions. At 143 State Street, the Islamic Mission of America represents a historic 20th-century Brooklyn Heights institution with mid-20th-century roots founded by Sheikh Dawood. The borough also encompasses the thriving South Asian cultural and commercial corridor along Coney Island Avenue in Midwood and Kensington, alongside longstanding urban congregations such as Masjid At-Taqwa in Bedford-Stuyvesant serving multi-generational African American and immigrant Muslim families.',
    geographicDistribution:
      'Facilities span five principal neighborhood corridors: the Atlantic Avenue / Boerum Hill / Brooklyn Heights corridor; the Bay Ridge commercial corridor along 5th and 6th Avenues; Flatbush, Kensington, and Midwood along Coney Island Avenue and Foster Avenue; Central Brooklyn across Crown Heights and Bedford-Stuyvesant; and Coastal Southern Brooklyn including Bensonhurst, Sheepshead Bay, and Brighton Beach.',
    dataNotice:
      'Our directory contains 103 listing records in Brooklyn. Of these, 93 currently have verified data status, while 10 records associated with shared addresses remain under review. These records should not be interpreted as 10 independently verified facilities. The directory includes phone and website fields for some listings; availability and accuracy should be confirmed with each facility.',
    verification: {
      verifiedDate: '2026-11-02',
      sourceName: 'Kings County Mosque Survey, NYC Department of City Planning & Public Records'
    }
  },

  'IL|chicago': {
    stateCode: 'IL',
    citySlug: 'chicago',
    headline: 'Guide to Mosques & Islamic Centers in Chicago, Illinois',
    overview:
      'Defined by historic urban architecture, active neighborhood hubs, and a major downtown workforce, Chicago is home to one of the largest, oldest, and most institutionally established Muslim metropolitan populations in the United States. Our directory indexes 64 listing records within the municipal boundaries of the City of Chicago, including 62 verified facilities and two educational institutions currently under administrative review. The directory is anchored by major civic and religious institutions including the Downtown Islamic Center (DIC) in The Loop and the Muslim Community Center (MCC) on North Elston Avenue.',
    communityContext:
      'The Chicago Muslim community is distinguished by deep institutional maturity and multicultural leadership. The Muslim Community Center (MCC), founded in 1969, acquired and preserved the historic 1923 Rivoli Theater building at 4380 N Elston Ave in 1980, operating as a regional mother institution for religious and civic life. In the heart of downtown, the Downtown Islamic Center (DIC) at 231 S State Street was established in 1976 to serve downtown office workers, legal professionals, and university students in The Loop. Along South Stony Island Avenue, Mosque Maryam stands as an indigenous American Muslim historic and civil rights landmark and the National Center of the Nation of Islam, alongside other longstanding South Side congregations such as Masjid Al-Fatir. The city also features dynamic neighborhood hubs such as the Devon Avenue international corridor in West Ridge, serving diverse South Asian, Arab, and West African communities.',
    geographicDistribution:
      'Facilities are organized across four major urban sectors: The Loop / Central Business District (Downtown Islamic Center at 231 S State St, easily accessible via CTA Red and Blue lines); the North and Northwest corridor along Elston Avenue, Kimball Avenue, and Devon Avenue in West Ridge; West Side community centers serving Garfield Park and Humboldt Park; and South Side historic urban corridors. Surrounding Cook County suburban campuses (such as the Mosque Foundation in Bridgeview or the Muslim Education Center in Morton Grove) fall outside Chicago municipal limits and are indexed under their respective municipal directories.',
    dataNotice:
      'Our directory contains 64 listing records in the City of Chicago: 62 verified facilities and 2 educational institutions currently under administrative review. Among all listings, 32 (50%) display published opening hours in directory records, while 32 state "Hours Not Listed." Phone contacts are listed for 46 facilities and 45 provide web links (including 44 standalone websites and one social media community page). Worshippers are advised to contact individual centers in advance to confirm current prayer schedules and visitor access.',
    verification: {
      verifiedDate: '2026-11-02',
      sourceName: 'City of Chicago Islamic Institutions Survey & CIOGC Regional Directory'
    }
  },

  // ─── PHASE 4A METROPOLITAN CITY GUIDES (BATCH 2) ─────────────────────────

  'CA|los-angeles': {
    stateCode: 'CA',
    citySlug: 'los-angeles',
    headline: 'Mosques and Islamic Centers in Los Angeles, California',
    overview:
      'The City of Los Angeles directory documents twenty verified mosques and Islamic centers, alongside one facility currently pending administrative review. The directory spans facilities across Central Los Angeles, South Los Angeles, the Hollywood corridor, and neighborhoods along major transit routes. Prominent congregations include the Islamic Center of Southern California—an institution established in 1952 that relocated to Vermont Avenue in 1976—as well as neighborhood masajid in South Los Angeles and West Adams. Among the twenty verified facilities, fifteen have published opening hours listed in directory records, and fifteen list direct telephone numbers. Visitors should contact individual centers directly to confirm current prayer times and visitor policies.',
    communityContext:
      'The Islamic institutions in the City of Los Angeles reflect a decades-long presence across diverse urban neighborhoods. The Islamic Center of Southern California, established in 1952, operates civic, educational, and interfaith outreach programs from its campus on South Vermont Avenue, where the center has been based since 1976. In South Los Angeles, institutions such as Masjid Bilal Islamic Center on Central Avenue, Masjid Omar Ibn Al-Khattab near Exposition Park, and El-Hajj Malik El-Shabazz Islamic Center on West Jefferson Boulevard maintain active community services, daily congregational worship, and educational lectures. These centers provide regular religious instruction, charitable programs, and community gathering spaces across the municipal core.',
    geographicDistribution:
      'The directory\'s verified facilities are distributed across several distinct corridors within the municipal boundaries of the City of Los Angeles. In the Wilshire Center and Koreatown area, facilities including the Islamic Center of Southern California, Los Angeles Islamic Center, and Masjid At-Thohir are accessible via the Metro B and D Lines at Wilshire/Vermont. The South Los Angeles corridor hosts multiple masajid along Central Avenue, Crenshaw Boulevard, and Western Avenue. Additional facilities include suite-based prayer spaces in Hollywood along Fountain Avenue and Sunset Boulevard, as well as neighborhood locations in West Adams and Watts. Facilities located in neighboring municipalities, such as Culver City, fall under separate municipal listings.',
    dataNotice:
      'This directory includes 21 total records with Los Angeles postal addresses: 20 verified facilities and 1 facility classified as pending review, which is excluded from public recommendations. Among the 20 verified facilities, 15 display published opening hours in directory records, while 5 do not list hours. Telephone contacts are listed for 15 verified facilities and website links for 11. Visitors are advised to contact individual facilities directly to confirm prayer times and visiting arrangements.',
    verification: {
      verifiedDate: '2026-11-02',
      sourceName: 'Phase 4A Batch 2 Research, November 2026'
    }
  },

  'FL|tampa': {
    stateCode: 'FL',
    citySlug: 'tampa',
    headline: 'Mosques and Islamic Centers in Tampa, Florida',
    overview:
      'The Tampa directory indexes fourteen verified Islamic facilities carrying a Tampa postal address. Because a Tampa postal address does not necessarily mean the facility is within the City\'s municipal boundaries, listed facilities are located across the incorporated City of Tampa and surrounding unincorporated areas of Hillsborough County. Prominent institutions include the Islamic Society of Tampa Bay Area (ISTABA), incorporated as a non-profit organization in January 1979 on East Sligh Avenue in unincorporated Hillsborough County, which offers daily prayers, religious education, and community services. Six of the fourteen directory listings display published opening hours in directory records. Worshippers are advised to contact individual facilities directly to verify current prayer schedules and visitor access.',
    communityContext:
      'Islamic facilities associated with Tampa postal addresses serve worshippers across Hillsborough County. On East Sligh Avenue in the East Lake area, the Islamic Society of Tampa Bay Area provides regular congregational prayers, youth religious education, and community support programs, including a Red Crescent health clinic. Within the incorporated City of Tampa, institutions such as Omar Almoktar Mosque in West Tampa and Masjid Abu Bakr on North 30th Street host daily prayers and Friday services for local community members. In northwestern Hillsborough County, the Ismaili Jamatkhana on Carlson Circle functions as a private place of worship reserved for registered members of the Shia Ismaili community.',
    geographicDistribution:
      'The fourteen facilities indexed under Tampa postal addresses reflect the geographic distribution of Islamic spaces across both incorporated city neighborhoods and unincorporated county areas. Because a Tampa postal address does not necessarily mean the facility is within the City\'s municipal boundaries, facilities are located across the incorporated City of Tampa and surrounding unincorporated areas of Hillsborough County. Facilities within municipal Tampa limits include Omar Almoktar Mosque near Hyde Park and Masjid Abu Bakr along North 30th Street, while other facilities serve unincorporated Hillsborough County communities such as East Lake-Orient Park along East Sligh Avenue and North 56th Street, Egypt Lake-Leto along West Waters Avenue, Carrollwood along Gunn Highway, and Keystone in the northwest county. An in-store prayer space operates on East Fowler Avenue, while specialized facilities such as funeral services are documented separately from congregational mosques.',
    dataNotice:
      'This directory contains 14 verified listings carrying Tampa postal addresses. These facilities are located across the incorporated City of Tampa and surrounding unincorporated areas of Hillsborough County; a Tampa postal address does not necessarily mean the facility is within the City\'s municipal boundaries. Eight of the 14 facilities do not display published opening hours in directory records. Web links are listed for eight facilities, including one social media page. One listing is a private Ismaili worship center not open for general public attendance. Visitors should contact facilities individually to confirm prayer times and access.',
    verification: {
      verifiedDate: '2026-11-02',
      sourceName: 'Phase 4A Batch 2 Research, November 2026'
    }
  },

  // ─── PHASE 47 FRESNO CITY GUIDE ──────────────────────────────────────────

  'CA|fresno': {
    stateCode: 'CA',
    citySlug: 'fresno',
    headline: 'Directory of Publicly Listed Mosques & Islamic Centers in Fresno, California',
    overview:
      'This directory documents publicly cataloged mosques, Islamic centers, and prayer facilities with Fresno postal addresses in California\'s Central Valley. Our database records 10 total listings in Fresno: seven verified places of worship and three co-located records maintained under administrative review. The directory is intended as a public reference for locating community facilities, viewing street addresses, and finding confirmed contact points. Because congregational schedules and facility access vary by location, worshippers and visitors are encouraged to contact facilities directly before visiting.',
    communityContext:
      'Worship and community facilities in Fresno serve local residents across distinct corridors of the city. On East Shaw Avenue near the university area, Masjid Fresno Islamic Center operates an established place of worship with dome architecture and a documented seven-day schedule. In Northwest Fresno along North Milburn Avenue, Badr Islamic Center maintains a dedicated suburban facility with published regular hours and direct telephone contact. On East Bullard Avenue in Northeast Fresno, My Deen Center provides an Islamic community facility with published opening hours. In South Fresno along Waterman Avenue, Masjid Al-Aqabah provides a neighborhood place of worship with direct telephone contact.',
    geographicDistribution:
      'Publicly cataloged facilities are distributed across several primary street corridors in the Fresno area. In the north and northeast sectors, facilities are situated along East Nees Avenue, East Bullard Avenue, and West Bedford Avenue. In Central Fresno, facilities are located along the East Shaw Avenue corridor. In the south and downtown sectors, facilities are listed along Waterman Avenue, B Street, and Fulton Street, serving central and southern neighborhoods. Individual facilities outside Fresno city limits maintain separate municipal listings.',
    dataNotice:
      'This directory indexes 10 listing records with Fresno postal addresses: seven verified places of worship and three records retained under administrative review. The three records under review include one outreach listing sharing an address on East Shaw Avenue and two co-located listings on East Nees Avenue undergoing deduplication; these records should not be interpreted as independent verified facilities. Among all 10 listings, six display published regular hours in public records, eight list telephone numbers, and four provide verified standalone websites. Worshippers are advised that directory opening hours reflect general building accessibility and do not constitute verified prayer, Iqamah, or Friday Jummah schedules. Visitors should contact individual centers directly to confirm current congregational schedules and visitor access.',
    verification: {
      verifiedDate: '2026-11-16',
      sourceName: 'Fresno Public Directory Records & Facility Ingestion Audit'
    }
  }
};

/**
 * Helper to retrieve editorial content for a mosque by slug
 */
export function getMosqueEditorial(slug: string): MosqueEditorialEntry | undefined {
  return MOSQUE_EDITORIAL_REGISTRY[slug];
}

/**
 * Helper to retrieve editorial content for a city by stateCode and citySlug
 */
export function getCityEditorial(stateCode: string, citySlug: string): CityEditorialEntry | undefined {
  const key = `${stateCode.toUpperCase()}|${citySlug.toLowerCase()}`;
  return CITY_EDITORIAL_REGISTRY[key];
}
