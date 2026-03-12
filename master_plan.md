# One Line News - Master Plan

This document serves as the permanent reference for the "One Line" news application project. 

## 1. Project Overview
"One Line" is a quick news platform for government preparation students, providing 10 daily news items in a concise, "one-line" format.

## 2. Technology Stack
| Layer | Technology |
| :--- | :--- |
| **Web Frontend** | Next.js 15 (React), Tailwind CSS 4, Framer Motion |
| **Mobile App** | React Native (Expo) - Upcoming |
| **Backend & Database** | Supabase (PostgreSQL) |
| **Key Icons** | Lucide React |

## 3. Database Schema (`news` table)
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key (auto-generated) |
| `content` | TEXT | The one-line news content |
| `category` | TEXT | Tag (National, International, etc.) |
| `published_at`| DATE | Date the news is intended for |
| `created_at` | TIMESTAMP | Audit log of creation time |

## 4. Current Web Components
- **Home Feed**: Displays news for the current date. Revalidates every 1 hour.
- **Admin Dashboard (`/admin`)**: Secure entry point for the 10 news items.
- **Archive (`/archive`)**: Calendar-based navigation for historical news.

## 5. Mobile Roadmap (Next Phase)
1. **Initialize Expo**: Use `npx -y create-expo-app` to set up the mobile project.
2. **Reuse Supabase Client**: Connect the mobile app to the same Supabase instance.
3. **Animations**: Use React Native Reanimated to match the "premium" web feel.
4. **Offline Mode**: Cache the daily 10 news for students with limited internet.

## 6. How to Run Locally

### Web
1. Ensure `.env.local` exists in the root with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```
2. Run `npm install`.
3. Run `npm run dev`.

### Mobile (Phase 2)
1. Install Expo Go on your phone.
2. Run `npx expo start`.

---
*Created on 2026-03-12 - Managed by Antigravity AI*
