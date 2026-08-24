import os
import zipfile
import shutil
import yaml

BASE_DIR = r"D:\Web Development\Civic shield"
OUTPUT_DIR = os.path.join(BASE_DIR, "merged_civic_dataset")

# Map the zip files to our master class names
ZIP_MAPPING = {
    "GARBAGE CLASSIFICATION 3.v1-garbage-classification.yolov7pytorch.zip": "garbage",
    "Open-Manhole-Image-Dataset1.v1i.yolov7pytorch.zip": "open_manhole",
    "fallen-tree-detection.v1i.yolov7pytorch.zip": "fallen_tree",
    "water leak.v3i.yolov7pytorch.zip": "water_leak"
}

# The master IDs for our final YOLOv8 model
MASTER_CLASSES = {
    "garbage": 0,
    "open_manhole": 1,
    "fallen_tree": 2,
    "water_leak": 3
}

def merge_datasets():
    print("Starting dataset merge...")
    
    # 1. Create output directories
    for split in ['train', 'valid', 'test']:
        os.makedirs(os.path.join(OUTPUT_DIR, split, 'images'), exist_ok=True)
        os.makedirs(os.path.join(OUTPUT_DIR, split, 'labels'), exist_ok=True)
        
    # Use a very short path for extraction to avoid Windows 260 character path limit
    extract_dir = r"D:\t_ext"
    
    for zip_file, master_label in ZIP_MAPPING.items():
        zip_path = os.path.join(BASE_DIR, zip_file)
        if not os.path.exists(zip_path):
            print(f"Skipping {zip_file}, file not found.")
            continue
            
        print(f"Processing {zip_file} as '{master_label}'...")
        if os.path.exists(extract_dir):
            shutil.rmtree(extract_dir)
            
        # 2. Extract zip
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
            
        master_id = MASTER_CLASSES[master_label]
        
        # 3. Process train, valid, test folders
        for split in ['train', 'valid', 'test']:
            split_dir = os.path.join(extract_dir, split)
            if not os.path.exists(split_dir):
                continue
                
            img_dir = os.path.join(split_dir, 'images')
            lbl_dir = os.path.join(split_dir, 'labels')
            
            if not os.path.exists(img_dir) or not os.path.exists(lbl_dir):
                continue
                
            # Iterate through images
            import uuid
            for img_name in os.listdir(img_dir):
                base_name, ext = os.path.splitext(img_name)
                lbl_name = base_name + ".txt"
                
                src_img = os.path.join(img_dir, img_name)
                src_lbl = os.path.join(lbl_dir, lbl_name)
                
                if not os.path.exists(src_lbl):
                    continue
                    
                # Use a short UUID to prevent filename collisions and avoid Windows MAX_PATH length errors
                short_id = uuid.uuid4().hex[:8]
                dst_img = os.path.join(OUTPUT_DIR, split, 'images', f"{master_label}_{short_id}{ext}")
                dst_lbl = os.path.join(OUTPUT_DIR, split, 'labels', f"{master_label}_{short_id}.txt")
                
                shutil.copy(src_img, dst_img)
                
                # 4. Rewrite label to the new master ID
                with open(src_lbl, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    
                with open(dst_lbl, 'w', encoding='utf-8') as f:
                    for line in lines:
                        parts = line.strip().split()
                        if len(parts) > 0:
                            # Replace old class ID with the master ID
                            parts[0] = str(master_id) 
                            f.write(" ".join(parts) + "\n")

    # 5. Create the master data.yaml
    yaml_content = {
        'train': 'train/images',
        'val': 'valid/images',
        'test': 'test/images',
        'nc': len(MASTER_CLASSES),
        'names': [k for k, v in sorted(MASTER_CLASSES.items(), key=lambda item: item[1])]
    }
    
    with open(os.path.join(OUTPUT_DIR, 'data.yaml'), 'w') as f:
        yaml.dump(yaml_content, f, sort_keys=False)
        
    print("\n✅ Done! The merged dataset is ready at:")
    print(OUTPUT_DIR)
    
    # Cleanup
    if os.path.exists(extract_dir):
        shutil.rmtree(extract_dir)

if __name__ == "__main__":
    merge_datasets()
