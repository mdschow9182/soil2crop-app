import 'package:flutter/material.dart';
import 'crop_calendar_screen.dart';

class CropSelectionScreen extends StatefulWidget {
  final List<String> recommendedCrops;

  const CropSelectionScreen({
    super.key,
    required this.recommendedCrops,
  });

  @override
  State<CropSelectionScreen> createState() => _CropSelectionScreenState();
}

class _CropSelectionScreenState extends State<CropSelectionScreen> {
  String? _selectedCrop;

  void _onCropSelected(String crop) {
    setState(() {
      _selectedCrop = crop;
    });
  }

  void _navigateToCalendar() {
    // Check if crop is selected
    if (_selectedCrop == null) {
      // Show SnackBar if no crop selected
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select a crop first'),
          backgroundColor: Colors.red,
          duration: Duration(seconds: 2),
        ),
      );
      return;
    }

    // Navigate to CropCalendarScreen with selected crop
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => CropCalendarScreen(
          cropName: _selectedCrop!,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Crop'),
        backgroundColor: Colors.green,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Recommended Crops',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Select one crop to view its calendar',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 16),
            
            // Crop list
            Expanded(
              child: ListView.builder(
                itemCount: widget.recommendedCrops.length,
                itemBuilder: (context, index) {
                  final crop = widget.recommendedCrops[index];
                  final isSelected = _selectedCrop == crop;

                  return Card(
                    elevation: isSelected ? 4 : 1,
                    color: isSelected ? Colors.green.shade50 : Colors.white,
                    child: ListTile(
                      leading: Radio<String>(
                        value: crop,
                        groupValue: _selectedCrop,
                        onChanged: (String? value) {
                          if (value != null) {
                            _onCropSelected(value);
                          }
                        },
                        activeColor: Colors.green,
                      ),
                      title: Text(
                        crop,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          color: isSelected ? Colors.green.shade800 : Colors.black,
                        ),
                      ),
                      trailing: isSelected
                          ? const Icon(
                              Icons.check_circle,
                              color: Colors.green,
                            )
                          : null,
                      onTap: () => _onCropSelected(crop),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 16),

            // Selected crop display
            if (_selectedCrop != null)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.green.shade100,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'Selected: $_selectedCrop',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.green,
                  ),
                ),
              ),

            const SizedBox(height: 16),

            // Navigate button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _navigateToCalendar,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text(
                  'View Crop Calendar',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
