# KAFConnect Mobile App Migration Guide

This document outlines how to port the KAFConnect Esports Ecosystem from the current Next.js web application to a native Flutter/Dart mobile app.

Because the system was built using **Supabase** as the single source of truth, all user identity, roles, clans, and tournament data can be accessed instantly in Flutter with zero backend rewriting.

## 1. Setup Flutter Project

```bash
flutter create kafconnect_mobile
cd kafconnect_mobile
flutter pub add supabase_flutter
```

## 2. Initialize Supabase in Dart

In your `main.dart`, initialize the connection using the exact same credentials used in the Next.js `.env.production.local` file.

```dart
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await Supabase.initialize(
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY',
  );
  
  runApp(const KAFConnectApp());
}

final supabase = Supabase.instance.client;
```

## 3. Authentication (Reusing the exact same users)

```dart
// Login
final AuthResponse res = await supabase.auth.signInWithPassword(
  email: 'testuser@kafesports.nl',
  password: 'testuser123',
);
```

## 4. Fetching Data

Your database schema will map perfectly to Dart models. 

### Fetching the Realtime Feed
```dart
final feed = await supabase
  .from('social_feed')
  .select('*, profiles(username, avatar_url)')
  .order('created_at', ascending: false);
```

### Fetching the Tournament Bracket
```dart
final matches = await supabase
  .from('matches')
  .select('*, player_a:profiles!matches_player_a_id_fkey(username), player_b:profiles!matches_player_b_id_fkey(username)')
  .eq('tournament_id', 'THE_TOURNAMENT_ID')
  .order('round', ascending: true);
```

## 5. Subscribing to Notifications (Realtime)

```dart
supabase.channel('public:notifications').onPostgresChanges(
  event: PostgresChangeEvent.insert,
  schema: 'public',
  table: 'notifications',
  filter: PostgresChangeFilter(
    type: PostgresChangeFilterType.eq,
    column: 'profile_id',
    value: supabase.auth.currentUser!.id,
  ),
  callback: (payload) {
    print('New Notification: \${payload.newRecord['title']}');
    // Trigger a local push notification here
  },
).subscribe();
```

## UI Conversion Blueprint
- **Tailwind to Flutter:** Convert the `bg-kaf-panel` (slate-900) and `brand-cyan` into a Flutter `ThemeData` object.
- **Bottom Dock:** The `MobileNav.tsx` translates perfectly into a `BottomNavigationBar` or a custom floating `Container` at the bottom of a `Scaffold`.
- **Cards:** Replace `<div className="kaf-card">` with `Card(elevation: 8, color: Color(0xFF0F172A), child: ...)`
