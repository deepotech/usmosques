# PHASE 3B — DATA QUALITY REPORT
**Project:** US Mosque Finder  
**Phase:** 3B — Texas & New York Real Data Activation  
**Date:** 2026-09-28  

---

## 1. Executive Summary

This report provides an audit of real public records ingested for **Texas** and **New York**, alongside the baseline **California** dataset. All three states utilize the exact same generic ingestion pipeline, Zod validation schema, boundary validation, and quality gates.

No synthetic, fabricated, or fallback records were introduced.

---

## 2. Texas Data Quality Audit

### Overview
- **Source File:** `data/raw/texas.json` (copied from `Texas – about 332 mosques.json`)
- **File Size:** 3,397,041 bytes
- **Total Raw Records:** 332
- **Valid Schema Records:** 332 (100.0%)
- **Schema Errors:** 0
- **Boundary Mismatches:** 0 (100% within Texas geographic bounds)

### Classification Breakdown
- **Accepted / Verified:** 311 (93.7%)
- **Needs Review:** 20 (6.0%)
- **Excluded:** 1 (0.3%) — PPG Paints, Conroe, TX (retail paint store)

### Completeness Metrics
- **GPS Coverage:** 100.0% (332 / 332) — Passes Quality Gate (>= 95%)
- **Postal Code Completeness:** 98.2% (326 / 332)
- **Phone Completeness:** 74.4% (247 / 332)
- **Website Completeness:** 76.8% (255 / 332 verified external URLs)
- **Opening Hours Completeness:** 61.1% (203 / 332)
- **Image Completeness:** 95.8% (318 / 332)
- **Ratings & Reviews Availability:** 95.5% (317 / 332)
- **Amenities / Accessibility Coverage:** 97.0% (322 / 332)

### Category Distribution
| Category | Raw Count | Classification |
|---|---|---|
| Mosque | 320 | Verified |
| Religious organization | 3 | Needs Review |
| Non-profit organization | 2 | Needs Review |
| Religious school | 2 | Needs Review |
| Education center | 1 | Needs Review |
| School center | 1 | Needs Review |
| Religious institution | 1 | Verified / Needs Review |
| Association / Organization | 1 | Needs Review |
| Paint store | 1 | Excluded (Commercial Retail) |

### Duplicate & Collision Analysis
- **Duplicate Coordinate Clusters:** 6 pairs (e.g. shared facilities like Dar El-Eman / DFW Islamic Educational Center).
- **Handling:** All valid distinct entities are preserved with unique slugs and IDs. Zero records deleted.

---

## 3. New York Data Quality Audit

### Overview
- **Source File:** `data/raw/new-york.json` (copied from `New York – more than 340 mosques.json`)
- **File Size:** 620,814 bytes
- **Total Raw Records:** 374
- **Valid Schema Records:** 374 (100.0%)
- **Schema Errors:** 0
- **Boundary Mismatches:** 0 (100% within New York geographic bounds)

### Classification Breakdown
- **Accepted / Verified:** 340 (90.9%)
- **Needs Review:** 34 (9.1%)
- **Excluded:** 0 (0.0%)

### Completeness Metrics
- **GPS Coverage:** 100.0% (374 / 374) — Passes Quality Gate (>= 95%)
- **Postal Code Completeness:** 99.7% (373 / 374)
- **Phone Completeness:** 70.9% (265 / 374)
- **Website Completeness:** 52.4% (196 / 374)
- **Opening Hours Completeness:** 61.0% (228 / 374)
- **Image Completeness:** 98.4% (368 / 374)
- **Ratings & Reviews Availability:** 95.5% (357 / 374)
- **Amenities / Accessibility Coverage:** 94.9% (355 / 374)

### Category Distribution
| Category | Raw Count | Classification |
|---|---|---|
| Mosque | 370 | Verified |
| Place of worship | 1 | Verified |
| Community center | 1 | Needs Review |
| Religious organization | 1 | Needs Review |
| Association / Organization | 1 | Needs Review |

### Duplicate & Collision Analysis
- **Duplicate Coordinate Clusters:** 14 pairs.
- **Handling:** All retained and distinguished by unique slugs/IDs. Zero silent deletions.

---

## 4. Multi-State Dataset Comparison

| Dimension | California (CA) | Texas (TX) | New York (NY) |
|---|---|---|---|
| **Raw Records** | 412 | 332 | 374 |
| **Accepted (Verified)** | 399 | 311 | 340 |
| **Needs Review** | 8 | 20 | 34 |
| **Excluded** | 5 | 1 | 0 |
| **GPS Coverage** | 100.0% | 100.0% | 100.0% |
| **Phone Coverage** | 82.5% | 74.4% | 70.9% |
| **Website Coverage** | 68.4% | 76.8% | 52.4% |
| **Opening Hours** | 64.1% | 61.1% | 61.0% |
| **Images Available** | 97.6% | 95.8% | 98.4% |
| **Eligible Cities (>=5 Mosques)** | 14 | 16 | 13 |
| **Total Represented Cities** | 71 | 63 | 25 |
| **Primary Timezone** | `America/Los_Angeles` | `America/Chicago` | `America/New_York` |
| **Quality Gate Status** | ✅ Passed | ✅ Passed | ✅ Passed |
| **Public Activation Status** | ✅ Active | ✅ Active | ✅ Active |
