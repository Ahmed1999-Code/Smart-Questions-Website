# EduAI Pro — Complete Feature Report

> A full review of every feature, page, and system on the platform.

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Technology Stack](#2-technology-stack)
3. [Shared Systems (platform.js / platform.css)](#3-shared-systems)
4. [Page-by-Page Feature Breakdown](#4-page-by-page-feature-breakdown)
   - 4.1 Landing Page (`index.html`)
   - 4.2 Authentication Page (`auth.html`)
   - 4.3 Student Dashboard (`dashboard.html`)
   - 4.4 Question Feed (`question-feed.html`)
   - 4.5 Exam Settings (`exam-settings.html`)
   - 4.6 Custom Quiz (`custom-quiz.html`)
   - 4.7 Adaptive Quiz (`adaptive-quiz.html`)
   - 4.8 Classic Quiz (`questions.html`)
   - 4.9 Results Page (`results.html`)
   - 4.10 START Page (`START.html`)
5. [Global AI Tutor Widget](#5-global-ai-tutor-widget)
6. [Navigation Flow](#6-navigation-flow)
7. [Data & State Architecture](#7-data--state-architecture)
8. [Gamification System](#8-gamification-system)
9. [Design System](#9-design-system)

---

## 1. Platform Overview

**EduAI Pro** is a complete, client-side educational platform. It requires no backend server — all data is stored in the browser using `localStorage` and `sessionStorage`. It is designed for students studying multiple academic fields and features an adaptive quiz engine, a real AI-powered tutor, a full analytics dashboard, gamification mechanics, and a professional results system.

**Brand identity:** EduAI Pro  
**Color theme:** Dark mode by default (purple/violet primary `#6c63ff`, purple secondary `#a855f7`, orange accent `#f7931e`)  
**Supported languages:** English interface, Arabic congratulatory message on Results page  
**Total HTML pages:** 11  
**Shared JS/CSS:** `platform.js`, `platform.css`, `style.css`, `questions.js`

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 (Semantic) |
| Styling | Vanilla CSS (`platform.css`, `style.css`) + inline page-specific `<style>` blocks |
| Logic | Vanilla JavaScript (no frameworks) |
| Fonts | Google Fonts: Inter (body), Space Grotesk (headings), JetBrains Mono (code) |
| Icons | Font Awesome 6.4.0 |
| AI Backend | Google Gemini API (`gemini-2.0-flash` model) via direct `fetch()` |
| Data Storage | `localStorage` (persistent user data, API key, theme) + `sessionStorage` (quiz flow state) |
| Animations | CSS keyframes, CSS transitions |
| SEO | Proper `<meta charset>`, `<meta name="description">`, `<title>` on every page |
| Encoding | All files: UTF-8 (no BOM), enforced via PowerShell |

---

## 3. Shared Systems

### `platform.css` (81 KB)
The single global stylesheet used by all 11 pages.

**CSS custom properties (design tokens):**
- `--bg`, `--bg2`, `--bg3`, `--bg4` — layered dark background hierarchy
- `--card`, `--card2` — card surfaces
- `--border`, `--border2` — border opacities
- `--text`, `--text2`, `--text3` — text colour hierarchy
- `--primary` (`#6c63ff`), `--primary2` (`#a855f7`) — brand colours
- `--accent` (`#f7931e`), `--success` (`#22c55e`), `--danger` (`#ef4444`), `--warn` (`#f59e0b`), `--gold` (`#ffd700`)
- `--font-main`, `--font-alt`, `--font-code` — typography tokens
- `--radius`, `--radius-lg`, `--radius-xl` — border radii
- `--shadow`, `--shadow-lg`, `--glow` — shadow presets
- `--transition` — cubic-bezier easing preset

**Light Mode Support:**  
Full `[data-theme="light"]` override block redefines all background and text tokens for a clean, professional light appearance.

**Global AI Tutor widget CSS** is appended at the end of `platform.css` (see Section 5).

---

### `platform.js` (33 KB)
The single global JavaScript file loaded on every page. Contains:

#### Theme System
- `initTheme()` — reads `eduai_theme` from `localStorage` on load, applies immediately
- `applyTheme(theme)` — sets `data-theme` attribute, saves to `localStorage`, updates toggle icon
- `toggleTheme()` — switches between dark/light, called by the moon/sun button on every page

#### Toast Notification System
- `showToast(message, type, duration)` — injects a styled toast into the page
- Types: `success` (green), `error` (red), `info` (blue)
- Auto-dismisses after `duration` milliseconds (default 3000)
- Includes smooth slide-in/slide-out animation

#### Confetti System
- `launchConfetti()` — generates animated coloured particles for high-score celebrations
- Triggered automatically on Results page when score ≥ 90%

#### Utility Functions
- `formatTime(seconds)` → `"MM:SS"` string
- `formatXP(xp)` → `"2.8K XP"` human-readable string
- `getGrade(pct)` → returns `{ label, color }` object (A+, A, B+, B, C, D, F)
- `getDifficultyConfig(level)` → returns time limits and XP multipliers by difficulty
- `calculateXP(score, total, streak, hints, time)` → full XP formula
- `getNextBadges(user, quizResult)` → determines which badges are newly earned
- `getAntiCheatReport()` → returns a basic anti-cheat summary object

#### Quiz State Persistence
- `saveQuizProgress(data)` → saves mid-quiz state to `sessionStorage`
- `loadQuizProgress()` → restores mid-quiz state
- `clearQuizProgress()` → wipes in-progress quiz state

#### Global Export
`window.EduAI` exposes all utilities for use across pages.

#### **Global AI Tutor Widget** (appended to `platform.js`)
Fully detailed in Section 5 below.

---

### `questions.js` (926 bytes)
Contains the question bank array. Used by `questions.html` and `results.html`.

### `style.css` (41 KB)
Legacy/supplementary stylesheet, primarily used by `results.html`.

---

## 4. Page-by-Page Feature Breakdown

---

### 4.1 Landing Page — `index.html`

**Purpose:** Public-facing homepage and marketing page.

#### Navigation Bar
- Fixed/sticky top bar with scroll effect: becomes glass-blurred with border on scroll (`nav-scrolled` class)
- Brand logo: brain icon + "EduAI **Pro**"
- Navigation links: Features, How It Works, Analytics, Gamification (smooth-scroll anchors)
- Right actions: **Dark/Light mode toggle**, **Login** button (→ `auth.html`), **Get Started Free** button (→ `auth.html?mode=signup`)
- **Hamburger menu** for mobile — toggles `.nav-open` class on nav links

#### Hero Section
- Animated background with 3 floating gradient orbs (CSS `orbFloat` keyframe animation)
- Particle canvas placeholder (`hero-particles`)
- Left side:
  - Badge: "AI-Powered Education Platform" with "NEW" pill
  - H1 headline with gradient text on "Adaptive AI"
  - Subtitle paragraph
  - Two CTA buttons: "Start Learning Free" and "Take a Demo Quiz"
  - **Animated stats counter** — counts up from 0 to target on scroll using `IntersectionObserver`:
    - 50,000 Active Students
    - 500 Questions
    - 98% Satisfaction
- Right side: Live UI preview card showing a sample MCQ question with AI feedback, streak, XP, and score stat row

#### Features Section (`#features`)
- Section badge, H2, subtitle
- **Responsive grid** (3-col → 2-col → 1-col) with 6 feature cards:
  1. **Adaptive Learning Engine** (large card) — real-time adaptation, personalised path tags
  2. **AI Tutor** — instant explanations
  3. **Analytics Dashboard** — progress tracking
  4. **Code Editor** — live coding environment
  5. **Gamification** — XP, achievements, leaderboards
  6. **8 Question Types** (large card) — MCQ, Fill-in-Blank, Coding, Essay, Drag & Drop tags
- Hover: `translateY(-6px)` lift, shadow glow, purple gradient overlay

#### How It Works Section (`#how-it-works`)
- 4 sequential step cards with connector arrows:
  1. Create Profile → 2. Get Learning Path → 3. Adaptive Practice → 4. Track & Improve
- Responsive: connectors rotate 90° on mobile

#### Platform Stats Section (`#stats`)
- Radial glow background decoration
- 4-column stat card grid: 50K+ Learners, 500+ Questions, **98% Satisfaction** (highlighted gold), 2.4M Study Hours
- Each card has a progress bar fill

#### Gamification Section (`#gamification`)
- 2×2 grid of gamification preview cards:
  - **XP Points** — XP bar at 68%, shows "2,840 / 4,000 XP"
  - **Achievement Badges** — badge showcase (earned + locked states)
  - **Learning Streaks** — M/T/W/T/F/S/S day pills with active state
  - **Leaderboards** — mini gold/silver/bronze ranking preview

#### CTA Section
- Gradient orb background animation
- "Ready to Transform Your Learning?" headline
- "Start Learning Now – It's Free" button
- **"View Team Profile"** button → opens Team Modal

#### Footer
- Brand logo + tagline
- Footer links: Classic Quiz, Login, Sign Up, Dashboard
- Copyright: "© 2026 EduAI Pro. All rights reserved. Built with AI ❤️"

#### Team Profile Modal
- Triggered by "View Team Profile" button
- Glass-blur overlay (`backdrop-filter: blur(8px)`)
- **Animated modal** scales in with `cubic-bezier(0.175, 0.885, 0.32, 1.275)` bounce
- Purple gradient top border
- Profile photo: `ahmed-mukhtar.png` with `onerror` fallback to UI-Avatars API
- Gold crown badge overlay
- Name: **Ahmed Mukhtar**, Role: "Founder & Visionary"
- Bio paragraph
- Social buttons: LinkedIn, GitHub, Globe (with hover lift + glow)
- Close: X button rotates 90° on hover; also closes on overlay click

---

### 4.2 Authentication Page — `auth.html`

**Purpose:** User login and registration.

#### Background
- 3 floating glassmorphic orbs (purple, violet, orange)
- "← Back to Home" link (top-left)
- Dark/Light mode toggle (top-right)

#### Layout
- Two-column grid: Left branding panel (dark) + Right form panel

#### Left Panel
- EduAI Pro logo + tagline
- 4 feature highlight items with icons:
  - Adaptive AI Engine
  - Deep Analytics
  - Gamified Learning
  - AI Tutor
- Student testimonial with 5-star rating: *"EduAI Pro completely changed how I study. My scores improved by 40% in just 3 weeks!"* — Sara K.

#### Right Panel — Login Form
- Tab switcher: Login / Sign Up (active tab gets gradient fill)
- **Role selector:** Student / Teacher buttons (visual toggle, currently cosmetic)
- Email/Username input
- Password input with **show/hide eye toggle**
- "Remember me" checkbox
- "Forgot password?" link
- **Login button** with spinner loader while processing
- Social login buttons: Google, GitHub (visual only)
- Switch to Sign Up link

#### Right Panel — Sign Up Form
- Role selector: Student / Teacher
- First Name + Last Name (two-column row)
- Email input
- Password input with **real-time password strength meter**:
  - Evaluates length, uppercase, numbers, special chars
  - Animated fill bar: red (Weak) → orange (Fair) → green (Strong/Very Strong)
  - Text label updates dynamically
- **Study Level selector:** Beginner / Intermediate / Advanced / Expert
- Terms & Privacy Policy checkbox
- **Create Free Account** button with spinner

#### Authentication Logic
- **No real backend** — accounts stored in `localStorage` as JSON under `eduai_users`
- Login validates email+password against stored users
- Signup: checks for duplicate email, validates all fields, hashes nothing (plain storage)
- On success: saves `eduai_current_user` to `localStorage`, redirects to `dashboard.html`
- Error/success messages rendered with styled alert boxes
- **URL param detection:** `auth.html?mode=signup` auto-switches to Sign Up tab on load

---

### 4.3 Student Dashboard — `dashboard.html`

**Purpose:** Central hub for all student activity. A Single-Page Application (SPA) within the page — sections are shown/hidden dynamically without page reloads.

#### Sidebar Navigation
Fixed left sidebar (260px wide):
- Brand: Brain icon + "EduAI **Pro**"
- Navigation links (all switch content without page reload):
  - **Dashboard** (Overview section)
  - **Start Quiz** (Quiz Setup section)
  - **Analytics** (Analytics section)
  - **Learning Path** (Learning Path section)
  - **Achievements** (Achievements section)
  - **Leaderboard** (Leaderboard section)
  - **AI Tutor** (opens Global Floating Widget)
  - **Specify Question Type** (opens SQT Modal) — has "NEW" badge
  - Divider separator
  - **Home** → `index.html`
  - **Logout** (clears session, returns to home)
- Bottom user mini-card: avatar initial, name, level
- **Mobile:** Sidebar collapses, hamburger toggle appears, tap overlay closes it

#### Top Bar
- Dynamic page title + subtitle (updates per section)
- **XP display:** bolt icon + live XP from `localStorage`
- **Streak display:** fire icon + day streak count
- Dark/Light mode toggle
- User avatar initial circle

#### Section — Overview (Default)
4 stat widgets in a grid:
- **Success Rate %** (with "+4% this week" trend)
- **Day Streak** (with "Personal best!" label)
- **Total XP** (with "Level up soon!")
- **Study Time** (hours)

Two-column content grid:
**Left column:**
- **Level Progress card:** Current level badge, XP progress bar (animated fill), milestone dots (Lv1→Lv5)
- **Topic Mastery card:** 5 topic bars (colour-coded: green=strong ≥70%, orange=medium, red=weak <50%)

**Right column:**
- **Quick Start card:**
  - Active Field Banner (shown when a field is configured) — displays field name, Change button
  - No-questions Banner (shown when no field set) — "Set Up Now" prompt
  - 4 launch buttons:
    1. **Start Exam** → runs configured custom quiz
    2. **Specify Question Type** → opens SQT Modal
    3. **Timed Challenge** → starts timed quiz
    4. **Classic Quiz** → `questions.html`
- **Recent Badges card:** Shows 4 most recent badge items (earned/locked states)
- **AI Recommendation card:** Purple-tinted, shows AI-suggested focus topic with weak tags, "Start AI-Guided Session" CTA

#### Section — Start Quiz (Quiz Setup)
A centred card with:
- Brain icon header
- H2: "Configure Your Quiz"
- **Quiz Type grid:** Adaptive AI, Practice Mode, Timed Challenge, Classic Mode (selectable cards)
- **Question Count options:** 5, 10, 15, 20, 30 (pill buttons)
- **Difficulty options:** Easy, Medium, Hard, Mixed (pill buttons)
- **Topic Focus options:** All Topics, Weak Areas Only, Single Topic (pill buttons)
- **Mode toggles:** Adaptive Difficulty (on/off), Show Hints (on/off), Timed Mode (on/off)
- **"Start Learning →"** launch button

#### Section — Analytics
- Full chart/analysis section with topic performance bars
- Detailed breakdown of performance over time

#### Section — Learning Path
- Visual roadmap of learning milestones and recommended topics

#### Section — Achievements
- Full badge gallery (earned and locked badges with descriptions)

#### Section — Leaderboard
- **Podium display:** Gold/Silver/Bronze podium blocks for top 3 with avatars
- **Full ranked list table:** Rank, Student name, XP, Streak, Accuracy Rate
- Student's own row highlighted

#### SQT Modal — "Specify Question Type"
A full-screen overlay modal:
- **Pre-defined Field Grid** (12 fields with icon + English name + Arabic name):
  - Medicine (الطب), Engineering (الهندسة), Law (القانون), Computer Science (علوم الحاسوب), Business (إدارة الأعمال), Pharmacy (الصيدلة), Dentistry (طب الأسنان), Architecture (العمارة), Education (التربية), Nursing (التمريض), Science (العلوم), Mathematics (الرياضيات)
- **Custom Field input** button — free-text field for any subject not listed
- Selected field badge animates in below the grid
- **"Proceed to Question Feed →"** button (disabled until field selected)
- Stores selection in `sessionStorage` as `questionField`
- Navigates to `question-feed.html`
- Closes on overlay click or X button

---

### 4.4 Question Feed — `question-feed.html`

**Purpose:** Admin/teacher question-input panel. Students add their exam questions here before the exam starts.

#### Top Navigation Bar
- Brand logo (links back to dashboard)
- **Field badge** — shows the currently selected subject (read from `sessionStorage`)
- Question count badge (live count: "X Questions")
- Back to Dashboard button

#### Page Header
- Large brain icon with gradient
- H1: "Feed Questions for [Field]"
- Subtitle explaining the purpose

#### Question Cards
- Dynamic list of question input cards — starts with one card, can add more
- Each card contains:
  - **Question number** badge (purple gradient)
  - **Remove (×)** button (top-right, hides if only 1 card)
  - **Question text** textarea (auto-resize, placeholder guidance)
  - **Option type toggle:** 4 radio options (A/B/C/D)
  - **Option A, B, C, D** text inputs
  - **Correct Answer selector:** 4 letter-pill buttons (A/B/C/D) — click to mark correct
  - **Points** field (numeric, default: 1)

#### Add Question Button
- "+ Add Another Question" — appends a new card to the list

#### Question Format Selection Panel
Below the question cards, a dedicated section for format selection:
- **Section title:** "Question Format"
- **Format buttons** (multi-select toggle pills):
  - MCQ (Multiple Choice)
  - True / False
  - Short Answer
  - Coding
- Selected formats stored in `sessionStorage` as `selectedFormats`
- Passed to `exam-settings.html` for format-aware exam mode selection

#### Fixed Bottom Action Bar
- Summary text: "X question(s) ready for [Field]"
- **"Continue to Exam Settings →"** button — validates that all questions have text and a correct answer marked, then stores questions in `sessionStorage` and navigates to `exam-settings.html`

---

### 4.5 Exam Settings — `exam-settings.html`

**Purpose:** Configure exam parameters before launching the custom quiz.

#### Top Navigation
- Brand + field badge
- Step progress indicator (3 steps): 
  - Step 1: Add Questions ✓ (done)
  - Step 2: **Exam Settings** (active)
  - Step 3: Start Exam

#### Hero Header
- Gear icon + "Configure Your Exam" headline

#### Configuration Sections

**Exam Mode:**
- Uniform Mode — all questions same type
- Mixed Mode — multiple question types
- *(Auto-selected based on formats chosen in question-feed.html)*

**Selected Formats Badge:**
If formats were passed from the question feed, a confirmation badge appears showing which formats are active (MCQ, T/F, Short Answer, Coding).

**Mixed Mode Split (when Mixed selected):**
- 3-column input grid: MCQ %, True/False %, Coding %
- Warning note: "Percentages must add up to 100%"

**Grading Mode:**
- Standard (pass/fail per question)
- Partial Credit (marks awarded for partial answers)

**Timing:**
- Two-column grid:
  - **Time per Question:** dropdown (30s, 60s, 90s, 120s, 180s, No Limit)
  - **Total Exam Time:** number input (minutes)

**Difficulty Level:**
- Easy, Medium, Hard, Expert (selectable cards with icon, title, description)

#### Fixed Bottom Launch Bar
- Summary text showing question count and selected field
- **"Launch Exam →"** button — saves all settings to `sessionStorage`, navigates to `custom-quiz.html`

---

### 4.6 Custom Quiz — `custom-quiz.html`

**Purpose:** The actual exam runner for custom (user-fed) questions.

- Reads questions from `sessionStorage` (set in `question-feed.html`)
- Reads settings from `sessionStorage` (set in `exam-settings.html`)
- Displays questions one at a time with A/B/C/D option buttons
- Per-question timer countdown (if time limit was set)
- **Progress bar** at top showing question X of N
- **Skip** and **Hint** buttons
- On completion: stores results in `sessionStorage` as `quizResults`, navigates to `results.html`

---

### 4.7 Adaptive Quiz — `adaptive-quiz.html`

**Purpose:** AI-adaptive quiz that adjusts difficulty based on student performance in real time.

> Note: Two versions exist: `adaptive-quiz.html` (76 KB) and `adaptive-quiz.fixed.html` (68 KB).

**Key adaptive features:**
- Starts at a configured difficulty
- After each answer: difficulty increases on correct, decreases on wrong
- Tracks `maxStreak`, `hintsUsed`, `skipsUsed`, `timeTaken`
- Sets `adaptiveMode: true` in results payload so Results page shows the Adaptive Learning Summary
- Full exam UI: question card, options, timer, progress bar, hint panel
- On completion: saves to `sessionStorage` and navigates to `results.html`

---

### 4.8 Classic Quiz — `questions.html`

**Purpose:** Simple, straightforward quiz using the built-in question bank (`questions.js`).

- Loads all questions from `questions.js`
- Displays MCQ format
- No adaptive logic — fixed sequence
- Submits results to `results.html` via `localStorage` (`latestQuizResults`)

---

### 4.9 Results Page — `results.html`

**Purpose:** Comprehensive post-quiz results analysis.

> Reads from `sessionStorage` (adaptive/custom quiz) or `localStorage` (classic quiz).

#### Top Bar
- Logo → `index.html`
- **Dashboard** button → `dashboard.html`
- **"Try Again"** button — retries the same quiz type

#### Score Hero Card
- Animated colour gradient bar at top (shifts through 4 colours in loop)
- **Score emoji** (🏆/🎯/⭐/💪/📚) bounces in with spring animation
- Performance message (5 levels: Perfect/Excellent/Great Work/Good Effort/Keep Practicing)
- Student name + date
- **3 animated SVG circles:**
  - Accuracy % (colour: green/orange/red based on score)
  - Grade badge (A+/A/B+/B/C/D/F) with matching colour
  - Correct/Total questions
- All circles animate stroke-dashoffset from 0 to target over 1.5s

#### XP Earned Card
- Gradient purple border
- Shows **total XP earned** in large purple text
- Breakdown of XP components:
  - Correct answers × 10 XP
  - Streak bonus (+25 XP if streak ≥ 5)
  - Perfect score bonus (+50 XP if 100%)
  - No-hints bonus (+15 XP)
- **New Badges earned** displayed on the right (animated bounce-in)
- XP is automatically added to user's `localStorage` profile

#### Stats Grid (4 cards)
- ✅ Correct count (green)
- ❌ Wrong count (red)
- 🔥 Best Streak (orange)
- ⏱️ Time Taken (formatted MM:SS, purple)

#### Adaptive Learning Summary (adaptive mode only)
- Shows the learning journey: Started level → Adapted → Peak level reached
- AI recommendation message (3 tiers based on score: ≥80, ≥60, <60)

#### Topic Performance Breakdown
- 5 animated progress bars, one per topic
- Colour-coded: green (≥80%), orange (60–79%), red (<60%)
- Widths animate on load

#### Answer Review Section
- **Filter tabs:** All / Wrong (N) / Correct (N)
- Click filter to show/hide items
- Each question item is an expandable card:
  - Colour-coded left border: green (correct), red (wrong), orange (skipped)
  - Question text truncated to 90 chars
  - Click to expand → shows:
    - Your Answer (red if wrong)
    - Correct Answer (green)
    - **AI Explanation** bubble with robot icon
  - Expand icon rotates 180° when opened

#### Congratulatory Footer
- Green gradient card
- **Arabic message (RTL):** "تهانينا على إتمام الاختبار، نقدر جهودك، ونتمنى لك المزيد من النجاح والتميز 🌟"
- English translation below in italic

#### Special Effects
- **Confetti** launches automatically if score ≥ 90%
- **Toast notification** appears after 1.5s if new badges were earned

---

### 4.10 START Page — `START.html`

**Purpose:** Quick entry / splash page for direct quiz access.

- Simple entry point linking into the quiz flow
- Minimal UI, acts as an alternate entry to the platform

---

## 5. Global AI Tutor Widget

**Files:** CSS appended to `platform.css`, JS appended to `platform.js`  
**Scope:** Present on ALL 11 pages automatically

The AI Tutor is a fully functional chat widget injected into every page's `<body>` on DOM load via an IIFE in `platform.js`.

### Visual Design
- **Floating Action Button (FAB):** Circular purple-to-violet gradient button, bottom-right corner (28px from edges), with robot (`fa-robot`) icon
  - Green dot indicator (always-online status)
  - On hover: lifts and scales up with stronger shadow glow
  - On open: icon changes to chevron-down
- **Chat Panel:** 400px wide, max 580px tall, slides up with scale+opacity animation
  - Border: `rgba(108,99,255,0.3)` — purple glow
  - Dark glass background `#12141f`
  - Smooth open/close transition (0.28s cubic-bezier)

### Panel Structure
**Header:**
- Robot avatar (gradient)
- "EduAI Tutor" title
- Green "Online & Ready to Help" status dot
- 3 action buttons: 🗑️ Clear Chat, 🔑 API Key, ✕ Close

**Context Bar:**
- Shows current academic context: reads `questionField` from `sessionStorage`, then `eduai_field_*` from `localStorage`, then college name
- Example: "Context: Computer Science"
- Updates dynamically every time the panel opens

**API Key Setup Screen (first-time only):**
- Shown when no API key is stored
- Instructions + link to Google AI Studio
- Password-type input field for key entry
- "Save & Start Chatting" button
- Key saved to `localStorage` as `eduai_tutor_api_key`

**Chat Body:**
- Scrollable message list
- Messages render with markdown-like formatting:
  - ` ``` ``` ` → `<pre><code>` blocks (dark background, monospace)
  - `**text**` → `<strong>` (purple)
  - `*text*` → `<em>` (green)
  - `` `code` `` → inline code span with purple tint
- Bot messages: purple-tinted bubble, top-left corner flat
- User messages: glass bubble, top-right corner flat

**Typing Indicator:**
- 3 bouncing dots animation (staggered delays) appears while waiting for AI response

**Quick Suggestions (welcome message):**
- Context-aware buttons based on detected subject:
  - Computer Science → "Explain OOP concepts", "Give me a Python quiz", "What is Big O notation?"
  - Medicine → "Explain the cardiac cycle", "Give me a pharmacology MCQ", "What is Virchow's Triad?"
  - Engineering → "Explain Ohm's Law", "Solve a circuit problem", "Summarize Newton's Laws"
  - Law → "Explain contract law basics", "What is habeas corpus?", "Give me a legal MCQ"
  - Business → "Explain supply and demand", "Give me an accounting quiz", "What is ROI?"
  - General → "Explain a concept", "Give me a quiz", "Generate an exam question"

**Input Area:**
- Auto-resizing textarea
- Send button with paper-plane icon
- **Enter** = send, **Shift+Enter** = new line

### AI System Prompt
The full professional system prompt is injected on every API request and includes:
- Student's current college, field, and level (read dynamically)
- Adaptation rules per faculty (CS, Medicine, Engineering, Education, Business, Law)
- Supported question formats (MCQ, T/F, Essay, Coding, Case Study, Scenario, etc.)
- Difficulty levels: Easy / Medium / Hard / Advanced
- Interaction triggers: "Explain" → detailed explanation, "Quiz me" → formatted quiz, "Solve" → step-by-step, "Summarize" → organised summary, "Generate exam" → full exam
- Strict safety rules (no politics, no harmful content, no hallucinated facts)
- Maintains session memory across messages

### AI Backend
- Model: `gemini-2.0-flash` (via Google Generative Language API v1beta)
- Temperature: 0.7, TopP: 0.9, Max tokens: 1024
- Safety settings: BLOCK_MEDIUM_AND_ABOVE for all harm categories
- `system_instruction` passed as a separate field (not in the messages array)

### Chat History Persistence
- Stored in `sessionStorage` under `eduai_tutor_history`
- Max 40 messages kept to avoid storage limits
- **Conversation is preserved across page navigations within the same browser session**
- Clear button wipes history and shows fresh welcome message

### Dashboard Sidebar Integration
- The "AI Tutor" link in `dashboard.html`'s sidebar opens the floating widget directly instead of navigating to a separate page

---

## 6. Navigation Flow

```
index.html (Landing)
    └── auth.html (Login/Signup)
            └── dashboard.html (SPA Hub)
                    ├── → SQT Modal → question-feed.html → exam-settings.html → custom-quiz.html → results.html
                    ├── → quiz setup section → adaptive-quiz.html → results.html
                    ├── → questions.html (Classic Quiz) → results.html
                    └── → results.html (direct retry)
```

---

## 7. Data & State Architecture

### localStorage (Persistent)
| Key | Contents |
|---|---|
| `eduai_theme` | `"dark"` or `"light"` |
| `eduai_users` | JSON array of all registered user objects |
| `eduai_current_user` | JSON object of logged-in user (name, email, xp, badges, streak, level) |
| `eduai_tutor_api_key` | Gemini API key string |
| `latestQuizResults` | Results from last Classic Quiz |

### sessionStorage (Per-Tab / Per-Session)
| Key | Contents |
|---|---|
| `questionField` | Selected academic field (e.g. `"Computer Science"`) |
| `customQuestions` | JSON array of questions from Question Feed |
| `examSettings` | JSON object of settings from Exam Settings |
| `selectedFormats` | JSON array of selected question formats |
| `quizResults` | Results object from Adaptive or Custom Quiz |
| `quizMode` | `"adaptive"` or `"custom"` for retry routing |
| `eduai_tutor_history` | JSON array of AI Tutor chat messages (up to 40) |

---

## 8. Gamification System

### XP (Experience Points)
- Correct answer: **10 XP** each
- Answer streak ≥ 5: **+25 XP** bonus
- Perfect score (100%): **+50 XP** bonus
- No hints used: **+15 XP** bonus
- XP accumulates in `localStorage` user profile
- Displayed in dashboard top bar and Overview stats

### Levels
- Lv.1 → Lv.2 → Lv.3 → Lv.4 → Lv.5 milestone system
- Level bar shows current XP progress between levels
- Level badge displayed in dashboard sidebar and overview card

### Badges
| Badge | Trigger |
|---|---|
| ⭐ First Steps | Completing first quiz |
| 🔥 On Fire! | Achieving a 5+ answer streak |
| 👑 Perfectionist | Scoring 100% |
| 🎓 Scholar | Completing 10 quizzes (displayed but not yet auto-triggered) |

- Earned badges saved to user profile in `localStorage`
- New badges announced via toast notification on Results page
- Badge icons shown in Results page XP card

### Streaks
- Daily login/quiz streak tracked
- Displayed in dashboard top bar and Overview stats
- Used in XP bonus calculation

### Leaderboard
- Dashboard section shows Top 7 students
- Podium visual for gold/silver/bronze
- Student's own row highlighted in bronze

### Confetti
- Launched via `EduAI.launchConfetti()` on Results page when score ≥ 90%

---

## 9. Design System

### Typography
- **Body / UI:** Inter (300–900 weight)
- **Headings / Brand:** Space Grotesk (400–700 weight)
- **Code:** JetBrains Mono (400–500 weight)

### Colour Palette
| Name | Hex | Usage |
|---|---|---|
| Primary | `#6c63ff` | Buttons, active states, borders |
| Secondary | `#a855f7` | Gradients, AI elements |
| Accent | `#f7931e` | Streak, warning elements |
| Success | `#22c55e` | Correct answers, badges |
| Danger | `#ef4444` | Wrong answers, errors |
| Warning | `#f59e0b` | Skipped, medium difficulty |
| Gold | `#ffd700` | Top rank, achievements |
| Dark BG | `#0d0f1a` | Main page background |
| Card | `#1e2035` | Card surfaces |

### Animations
- `orbFloat` — hero orbs floating up/down 8s loop
- `heroFloat` — dashboard preview card 6s float
- `fadeInUp` — section entry animation
- `tutorDotBounce` — AI tutor typing dots
- `gradShift` — Results hero gradient scroll
- `bounce-in` — Score emoji entrance

### Responsive Breakpoints
- `max-width: 1024px` — hero visual hides
- `max-width: 900px` — sidebar collapses, grid changes to 1-col
- `max-width: 700px` — results stats 2-col
- `max-width: 600px` — exam settings 1-col
- `max-width: 480px` — AI tutor panel fills screen width
- `max-width: 640px` — hero padding reduces

### Glassmorphism
Used consistently for: Navbar on scroll, Auth modals, AI Tutor panel, SQT overlay, sidebar overlay, toast notifications — all via `backdrop-filter: blur(10–20px)` with semi-transparent backgrounds.

---

*Report generated: June 14, 2026 — EduAI Pro Platform*
