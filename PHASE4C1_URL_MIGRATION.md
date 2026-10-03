# Phase 4C.1 — URL Migration Manifest
## Collision Group Disambiguation & Legacy Redirect Audit

This manifest documents all 30 legacy collision groups (comprising 67 public mosque entities) resolved during Phase 4C.1.

### Policy on Legacy Redirects

- **Ambiguous Slugs (All 30 Collision Groups):**
  Each of the 30 legacy slugs historically corresponded to multiple distinct physical entities across different states.
  Creating an automated 301 redirect from an ambiguous slug (e.g. `/mosque/masjid-ibrahim`) to an arbitrarily chosen facility (e.g. Austin, TX) would cause severe entity cross-contamination, sending users and crawlers seeking the Lutz, FL mosque to Texas.
  Therefore, all 30 ambiguous legacy slugs are marked **`Redirect Safe: NO — ambiguous legacy slug`**. Requests to these legacy paths return a controlled HTTP 404 (`notFound()`), and each physical entity is uniquely and independently reachable via its canonical disambiguated URL.

- **Preserved Unique Slugs (1,419 Entities):**
  All 1,419 mosque entities whose slugs were already globally unique remain **100% unchanged**. No URL churn occurred for non-colliding entities.

---

### Complete Collision Group Migration Table

| Old Slug | Entity Name | State | City | New Canonical Slug | Redirect Safe? |
|---|---|---|---|---|---|
| `al-ansar-mosque` | Al-Ansar Mosque | CA | San Diego | `al-ansar-mosque-san-diego-ca` | NO — ambiguous legacy slug |
| `al-ansar-mosque` | Al-Ansar Mosque | FL | Miami | `al-ansar-mosque-miami-fl` | NO — ambiguous legacy slug |
| `al-ansar-mosque` | Al-Ansar Mosque | IL | Chicago | `al-ansar-mosque-chicago-il` | NO — ambiguous legacy slug |
| `al-ansar-mosque` | Al-Ansar Mosque | NY | Brooklyn | `al-ansar-mosque-brooklyn-ny` | NO — ambiguous legacy slug |
| `masjid` | Masjid | CA | Arcata | `masjid-arcata-ca` | NO — ambiguous legacy slug |
| `masjid` | Masjid | IL | Mt Prospect | `masjid-mt-prospect-il` | NO — ambiguous legacy slug |
| `masjid` | Masjid | NY | Queens | `masjid-queens-ny` | NO — ambiguous legacy slug |
| `masjid` | Masjid | TX | Marble Falls | `masjid-marble-falls-tx` | NO — ambiguous legacy slug |
| `makki-masjid` | Makki Masjid | CA | San Bernardino | `makki-masjid-san-bernardino-ca` | NO — ambiguous legacy slug |
| `makki-masjid` | Makki Masjid | IL | Chicago | `makki-masjid-chicago-il` | NO — ambiguous legacy slug |
| `makki-masjid` | Makki Masjid | TX | Houston | `makki-masjid-houston-tx` | NO — ambiguous legacy slug |
| `masjid-abu-bakr` | Masjid Abu Bakr | CA | Oakland | `masjid-abu-bakr-oakland-ca` | NO — ambiguous legacy slug |
| `masjid-abu-bakr` | Masjid Abu Bakr | FL | Tampa | `masjid-abu-bakr-tampa-fl` | NO — ambiguous legacy slug |
| `masjid-abu-bakr` | Masjid Abu Bakr | TX | Houston | `masjid-abu-bakr-houston-tx` | NO — ambiguous legacy slug |
| `masjid-al-huda` | Masjid Al-Huda مسجد | CA | Union City | `masjid-al-huda-union-city-ca` | NO — ambiguous legacy slug |
| `masjid-al-huda` | Masjid Al Huda | NY | Bronx | `masjid-al-huda-bronx-ny` | NO — ambiguous legacy slug |
| `masjid-al-huda` | Masjid Al Huda | TX | Manor | `masjid-al-huda-manor-tx` | NO — ambiguous legacy slug |
| `ahmadiyya-movement-in-islam` | Ahmadiyya Movement In Islam | NY | Hollis | `ahmadiyya-movement-in-islam-hollis-ny` | NO — ambiguous legacy slug |
| `ahmadiyya-movement-in-islam` | Ahmadiyya Movement In Islam | TX | Allen | `ahmadiyya-movement-in-islam-allen-tx` | NO — ambiguous legacy slug |
| `al-farooq-mosque` | Al Farooq Mosque | IL | Chicago | `al-farooq-mosque-chicago-il` | NO — ambiguous legacy slug |
| `al-farooq-mosque` | Al-Farooq Mosque | NY | Brooklyn | `al-farooq-mosque-brooklyn-ny` | NO — ambiguous legacy slug |
| `al-ihsaan-mosque` | Al Ihsaan Mosque | FL | Miami | `al-ihsaan-mosque-miami-fl` | NO — ambiguous legacy slug |
| `al-ihsaan-mosque` | Al-Ihsaan Mosque | NY | Brooklyn | `al-ihsaan-mosque-brooklyn-ny` | NO — ambiguous legacy slug |
| `al-iman-mosque` | Al-Iman Mosque | FL | Belle Glade | `al-iman-mosque-belle-glade-fl` | NO — ambiguous legacy slug |
| `al-iman-mosque` | AL-IMAN Mosque | NY | Brooklyn | `al-iman-mosque-brooklyn-ny` | NO — ambiguous legacy slug |
| `al-islam-mosque` | Al-Islam Mosque | CA | Chatsworth | `al-islam-mosque-chatsworth-ca` | NO — ambiguous legacy slug |
| `al-islam-mosque` | Al-Islam Mosque | IL | Bolingbrook | `al-islam-mosque-bolingbrook-il` | NO — ambiguous legacy slug |
| `al-noor-mosque` | Al Noor Mosque | CA | Westminster | `al-noor-mosque-westminster-ca` | NO — ambiguous legacy slug |
| `al-noor-mosque` | Al Noor Mosque | TX | Houston | `al-noor-mosque-houston-tx` | NO — ambiguous legacy slug |
| `al-rahma-mosque` | Al-Rahma Mosque | FL | Thonotosassa | `al-rahma-mosque-thonotosassa-fl` | NO — ambiguous legacy slug |
| `al-rahma-mosque` | Al-Rahma Mosque | TX | El Paso | `al-rahma-mosque-el-paso-tx` | NO — ambiguous legacy slug |
| `albanian-american-islamic-center` | Albanian-American Islamic Center | IL | Berkeley | `albanian-american-islamic-center-berkeley-il` | NO — ambiguous legacy slug |
| `albanian-american-islamic-center` | Albanian American Islamic Center | NY | Glendale | `albanian-american-islamic-center-glendale-ny` | NO — ambiguous legacy slug |
| `ar-rahman-islamic-center` | Ar-Rahman Islamic Center | CA | Fontana | `ar-rahman-islamic-center-fontana-ca` | NO — ambiguous legacy slug |
| `ar-rahman-islamic-center` | AR Rahman islamic center | FL | Estero | `ar-rahman-islamic-center-estero-fl` | NO — ambiguous legacy slug |
| `islamic-center` | Islamic center مسجد الرحمة | CA | Fresno | `islamic-center-fresno-ca` | NO — ambiguous legacy slug |
| `islamic-center` | Islamic Center | NY | Bronx | `islamic-center-bronx-ny` | NO — ambiguous legacy slug |
| `islamic-center-of-quad-cities` | Islamic Center of Quad Cities | IL | Moline | `islamic-center-of-quad-cities-moline-il` | NO — ambiguous legacy slug |
| `islamic-center-of-quad-cities` | Islamic Center of Quad Cities | TX | Frisco | `islamic-center-of-quad-cities-frisco-tx` | NO — ambiguous legacy slug |
| `masjid-abu-huraira` | Masjid Abu Huraira | NY | East Elmhurst | `masjid-abu-huraira-east-elmhurst-ny` | NO — ambiguous legacy slug |
| `masjid-abu-huraira` | Masjid Abu Huraira | TX | The Woodlands | `masjid-abu-huraira-the-woodlands-tx` | NO — ambiguous legacy slug |
| `masjid-al-ihsaan` | Masjid Al-Ihsaan | FL | Orlando | `masjid-al-ihsaan-orlando-fl` | NO — ambiguous legacy slug |
| `masjid-al-ihsaan` | Masjid Al-Ihsaan | NY | Brooklyn | `masjid-al-ihsaan-brooklyn-ny` | NO — ambiguous legacy slug |
| `masjid-al-ihsan` | Masjid-Al-Ihsan | IL | Chicago | `masjid-al-ihsan-chicago-il` | NO — ambiguous legacy slug |
| `masjid-al-ihsan` | Masjid Al Ihsan | TX | Houston | `masjid-al-ihsan-houston-tx` | NO — ambiguous legacy slug |
| `masjid-al-ikhlas` | Masjid Al-Ikhlas | NY | Astoria | `masjid-al-ikhlas-astoria-ny` | NO — ambiguous legacy slug |
| `masjid-al-ikhlas` | Masjid Al-Ikhlas | TX | San Antonio | `masjid-al-ikhlas-san-antonio-tx` | NO — ambiguous legacy slug |
| `masjid-al-noor` | Masjid Al-Noor | CA | Santa Clara | `masjid-al-noor-santa-clara-ca` | NO — ambiguous legacy slug |
| `masjid-al-noor` | Masjid Al Noor | FL | Tallahassee | `masjid-al-noor-tallahassee-fl` | NO — ambiguous legacy slug |
| `masjid-al-rahman` | Masjid Al Rahman | FL | Orlando | `masjid-al-rahman-orlando-fl` | NO — ambiguous legacy slug |
| `masjid-al-rahman` | MASJID AL RAHMAN | IL | Chicago | `masjid-al-rahman-chicago-il` | NO — ambiguous legacy slug |
| `masjid-hamza` | Masjid Hamza | CA | Stockton | `masjid-hamza-stockton-ca` | NO — ambiguous legacy slug |
| `masjid-hamza` | Masjid Hamza | FL | Largo | `masjid-hamza-largo-fl` | NO — ambiguous legacy slug |
| `masjid-ibrahim` | Masjid Ibrahim | FL | Lutz | `masjid-ibrahim-lutz-fl` | NO — ambiguous legacy slug |
| `masjid-ibrahim` | Masjid Ibrahim | TX | Austin | `masjid-ibrahim-austin-tx` | NO — ambiguous legacy slug |
| `masjid-salam` | Masjid Salam | IL | Elgin | `masjid-salam-elgin-il` | NO — ambiguous legacy slug |
| `masjid-salam` | Masjid Salam | NY | New York | `masjid-salam-new-york-ny` | NO — ambiguous legacy slug |
| `masjid-usman` | Masjid Usman | CA | Lemon Grove | `masjid-usman-lemon-grove-ca` | NO — ambiguous legacy slug |
| `masjid-usman` | Masjid Usman | TX | Spring | `masjid-usman-spring-tx` | NO — ambiguous legacy slug |
| `mosque` | MOSQUE | NY | Brooklyn | `mosque-brooklyn-ny` | NO — ambiguous legacy slug |
| `mosque` | Mosque | TX | Houston | `mosque-houston-tx` | NO — ambiguous legacy slug |
| `muhammad-mosque` | Muhammad Mosque | CA | Oakland | `muhammad-mosque-oakland-ca` | NO — ambiguous legacy slug |
| `muhammad-mosque` | Muhammad Mosque | TX | Dallas | `muhammad-mosque-dallas-tx` | NO — ambiguous legacy slug |
| `musalla` | Musalla | IL | Chicago | `musalla-chicago-il` | NO — ambiguous legacy slug |
| `musalla` | Musalla | TX | Clute | `musalla-clute-tx` | NO — ambiguous legacy slug |
| `umar-mosque` | Umar Mosque | FL | Tampa | `umar-mosque-tampa-fl` | NO — ambiguous legacy slug |
| `umar-mosque` | Umar Mosque | NY | Brooklyn | `umar-mosque-brooklyn-ny` | NO — ambiguous legacy slug |

---

### Summary Statistics

- **Total Collision Groups:** 30
- **Total Entities Migrated:** 67
- **Total Entities Preserved Unchanged:** 1,419
- **Total Public Mosque Entities:** 1,483 (1,379 verified + 104 needs_review)
- **Total Records in Dataset:** 1,486 (including 3 excluded)
- **Duplicate Slugs Remaining:** 0
