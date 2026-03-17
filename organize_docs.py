"""
Organize all markdown documentation files into categorized folders
"""
import os
import shutil
from pathlib import Path

# Define categories and their file patterns
CATEGORIES = {
    '01-ESSENTIALS': [
        'README*.md', 'QUICK_START*.md', 'API_REFERENCE.md', 
        'DEPLOYMENT_GUIDE.md', 'PROJECT_STRUCTURE.md'
    ],
    '02-IMPLEMENTATION': [
        'PHASE*.md', 'ML_IMPLEMENTATION*.md', 'MULTILANGUAGE*.md', 
        'VOICE*.md', 'AI_*.md', 'HYBRID_*.md'
    ],
    '03-FEATURES': [
        'CROP_*.md', 'SOIL_*.md', 'FARMER_*.md', 'MARKET_*.md', 
        'ALERTS*.md', 'HELP_*.md', 'NATURAL_FARMING*.md'
    ],
    '04-FIXES': [
        '*FIX*.md', '*ERROR*.md', '*DEBUG*.md', 'CONNECTION*.md', 
        'UPLOAD*.md', 'TROUBLESHOOTING*.md'
    ],
    '05-AUDIT': [
        'AUDIT*.md', 'SYSTEM_*.md', 'SECURITY_*.md', 'FINAL_*.md', 
        'EXECUTIVE_*.md', 'TECHNICAL_*.md'
    ],
    '06-REFERENCE': [
        'IMPLEMENTATION_STATUS*.md', 'FEATURES_*.md', 'MODULE_*.md', 
        'VERIFICATION*.md', 'CHECKLIST*.md'
    ],
    '07-MISC': [
        'FutureEnhancements.md', 'IEEE*.md', 'MASTER_PROMPT*.md', 
        'Before_After*.md', 'JUDGES*.md', 'OCR*.md', 'UI_DESIGN*.md',
        'LANGUAGE_*.md', 'DASHBOARD*.md', 'BOTTOM_NAV*.md',
        'RADIX_*.md', 'SIMPLIFIED_*.md', 'CLEANUP*.md', 'NEW_*.md',
        'PRODUCTION*.md', 'FULL_LANGUAGE*.md', 'CONSOLE*.md',
        'TEST_*.md', 'BACKEND_*.md', 'MONGODB_*.md', 'API_IMPORT*.md',
        'INDIAN_VOICE*.md', 'QUICK_REFERENCE*.md', 'SMART_FARMING*.md',
        'FEATURE_ADDITION*.md', 'ENHANCED_FEATURES*.md',
        'FEATURE_IMPLEMENTATION*.md'
    ]
}

def match_pattern(filename, pattern):
    """Simple glob-like pattern matching"""
    import fnmatch
    return fnmatch.fnmatch(filename, pattern)

def organize_files():
    root = Path('.')
    docs_root = root / 'docs'
    
    # Get all .md files in root (excluding subdirectories)
    md_files = [f for f in root.iterdir() if f.is_file() and f.suffix == '.md']
    
    organized = []
    skipped = []
    
    for file_path in md_files:
        filename = file_path.name
        categorized = False
        
        # Skip PROJECT_STRUCTURE.md as we just created it
        if filename == 'PROJECT_STRUCTURE.md':
            continue
            
        for category, patterns in CATEGORIES.items():
            for pattern in patterns:
                if match_pattern(filename, pattern):
                    dest_folder = docs_root / category
                    dest_folder.mkdir(parents=True, exist_ok=True)
                    
                    dest_path = dest_folder / filename
                    
                    # Handle duplicates
                    if dest_path.exists():
                        base, ext = dest_path.stem, dest_path.suffix
                        counter = 1
                        while dest_path.exists():
                            dest_path = dest_folder / f"{base}_{counter}{ext}"
                            counter += 1
                    
                    try:
                        shutil.move(str(file_path), str(dest_path))
                        organized.append((filename, category, dest_path.name))
                        categorized = True
                        break
                    except Exception as e:
                        print(f"Error moving {filename}: {e}")
                        skipped.append(filename)
            
            if categorized:
                break
        
        if not categorized:
            skipped.append(filename)
    
    # Print summary
    print("\n" + "="*80)
    print("📚 DOCUMENTATION ORGANIZATION COMPLETE")
    print("="*80)
    print(f"\n✅ Organized: {len(organized)} files")
    print(f"⚠️  Skipped: {len(skipped)} files (manual review needed)")
    
    if organized:
        print("\n📁 Files by Category:")
        print("-" * 80)
        
        # Group by category
        by_category = {}
        for orig, cat, new_name in organized:
            if cat not in by_category:
                by_category[cat] = []
            by_category[cat].append((orig, new_name))
        
        for cat in sorted(by_category.keys()):
            files = by_category[cat]
            print(f"\n{cat}:")
            for orig, new_name in sorted(files, key=lambda x: x[0]):
                rename_info = f" → {new_name}" if orig != new_name else ""
                print(f"  • {orig}{rename_info}")
    
    if skipped:
        print("\n⚠️  SKIPPED FILES (not matched to any category):")
        print("-" * 80)
        for filename in sorted(skipped):
            print(f"  • {filename}")
    
    print("\n" + "="*80)
    print(f"📂 Documentation folder: {docs_root.absolute()}")
    print("="*80)

if __name__ == '__main__':
    organize_files()
