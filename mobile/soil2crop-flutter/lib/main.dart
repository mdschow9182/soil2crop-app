import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'screens/soil_input_screen.dart';
import 'screens/recommendation_screen.dart';
import 'screens/tutorial_screen.dart';
import 'screens/feedback_screen.dart';
import 'providers/auth_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(const ProviderScope(child: Soil2CropApp()));
}

class Soil2CropApp extends ConsumerWidget {
  const Soil2CropApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return ScreenUtilInit(
      designSize: const Size(375, 812),
      minTextAdapt: true,
      splitScreenMode: true,
      builder: (context, child) {
        return MaterialApp(
          title: 'Soil2Crop',
          debugShowCheckedModeBanner: false,
          theme: ThemeData(
            primarySwatch: Colors.green,
            fontFamily: 'Roboto',
            useMaterial3: true,
            textTheme: TextTheme(
              displayLarge: TextStyle(fontSize: 24.sp, fontWeight: FontWeight.bold),
              displayMedium: TextStyle(fontSize: 20.sp, fontWeight: FontWeight.bold),
              bodyLarge: TextStyle(fontSize: 16.sp),
              bodyMedium: TextStyle(fontSize: 14.sp),
              bodySmall: TextStyle(fontSize: 12.sp),
            ),
          ),
          initialRoute: '/',
          routes: {
            '/': (context) => authState.when(
                  data: (user) => user != null ? const HomeScreen() : const LoginScreen(),
                  loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
                  error: (_, __) => const LoginScreen(),
                ),
            '/home': (context) => const HomeScreen(),
            '/soil-input': (context) => const SoilInputScreen(),
            '/recommendation': (context) => const RecommendationScreen(),
            '/tutorials': (context) => const TutorialScreen(),
            '/feedback': (context) => const FeedbackScreen(),
          },
        );
      },
    );
  }
}
