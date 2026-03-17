import 'package:flutter/material.dart';

class CropCalendarScreen extends StatefulWidget {
  final String cropName;

  const CropCalendarScreen({
    super.key,
    required this.cropName,
  });

  @override
  State<CropCalendarScreen> createState() => _CropCalendarScreenState();
}

class _CropCalendarScreenState extends State<CropCalendarScreen> {
  bool _isLoading = true;
  List<Map<String, dynamic>> _calendarData = [];

  @override
  void initState() {
    super.initState();
    _loadCalendarData();
  }

  Future<void> _loadCalendarData() async {
    // Simulate async data loading
    await Future.delayed(const Duration(milliseconds: 500));

    // Check if widget is still mounted before calling setState
    if (!mounted) return;

    setState(() {
      _calendarData = _getCalendarForCrop(widget.cropName);
      _isLoading = false;
    });
  }

  List<Map<String, dynamic>> _getCalendarForCrop(String cropName) {
    // Default calendar data - in real app, fetch from API or database
    final defaultCalendar = [
      {'day': 0, 'stage': 'Land Preparation', 'activity': 'Ploughing and leveling'},
      {'day': 1, 'stage': 'Sowing', 'activity': 'Seed sowing or transplanting'},
      {'day': 7, 'stage': 'Germination', 'activity': 'First irrigation if needed'},
      {'day': 15, 'stage': 'Vegetative', 'activity': 'Weeding and first fertilizer'},
      {'day': 30, 'stage': 'Growth', 'activity': 'Pest monitoring, second irrigation'},
      {'day': 45, 'stage': 'Flowering', 'activity': 'Critical irrigation period'},
      {'day': 60, 'stage': 'Grain Filling', 'activity': 'Final fertilizer, water management'},
      {'day': 90, 'stage': 'Maturity', 'activity': 'Stop irrigation, prepare for harvest'},
      {'day': 105, 'stage': 'Harvest', 'activity': 'Harvest when grains are hard'},
    ];

    // Crop-specific adjustments could be added here
    return defaultCalendar;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('${widget.cropName} Calendar'),
        backgroundColor: Colors.green,
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                color: Colors.green,
              ),
            )
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.green.shade100,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.cropName,
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.green,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Cultivation Calendar',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Calendar list
                  Expanded(
                    child: ListView.builder(
                      itemCount: _calendarData.length,
                      itemBuilder: (context, index) {
                        final item = _calendarData[index];
                        final isFirst = index == 0;
                        final isLast = index == _calendarData.length - 1;

                        return IntrinsicHeight(
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Timeline
                              Column(
                                children: [
                                  // Top line
                                  if (!isFirst)
                                    Container(
                                      width: 2,
                                      height: 20,
                                      color: Colors.green.shade300,
                                    )
                                  else
                                    const SizedBox(height: 20),
                                  
                                  // Dot
                                  Container(
                                    width: 12,
                                    height: 12,
                                    decoration: BoxDecoration(
                                      color: isFirst || isLast
                                          ? Colors.green
                                          : Colors.green.shade300,
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: Colors.white,
                                        width: 2,
                                      ),
                                    ),
                                  ),
                                  
                                  // Bottom line
                                  if (!isLast)
                                    Expanded(
                                      child: Container(
                                        width: 2,
                                        color: Colors.green.shade300,
                                      ),
                                    )
                                  else
                                    const SizedBox(height: 20),
                                ],
                              ),

                              const SizedBox(width: 12),

                              // Content
                              Expanded(
                                child: Card(
                                  margin: const EdgeInsets.only(bottom: 12),
                                  child: Padding(
                                    padding: const EdgeInsets.all(12.0),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.symmetric(
                                                horizontal: 8,
                                                vertical: 4,
                                              ),
                                              decoration: BoxDecoration(
                                                color: Colors.green.shade100,
                                                borderRadius: BorderRadius.circular(4),
                                              ),
                                              child: Text(
                                                'Day ${item['day']}',
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.bold,
                                                  color: Colors.green.shade800,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          item['stage'],
                                          style: const TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          item['activity'],
                                          style: const TextStyle(
                                            fontSize: 14,
                                            color: Colors.grey,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),

                  // Disclaimer
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.amber.shade50,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.amber.shade200),
                    ),
                    child: const Row(
                      children: [
                        Icon(
                          Icons.info_outline,
                          color: Colors.amber,
                          size: 20,
                        ),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'This calendar is advisory. Adjust based on local conditions and expert advice.',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.amber,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
