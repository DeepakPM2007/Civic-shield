from ultralytics import YOLO
import os

def train_model():
    print("Initializing YOLOv8 Training...")
    
    # Path to check for existing interrupted training
    checkpoint_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'runs', 'detect', 'civicshield_v1', 'weights', 'last.pt'))
    
    # Path to our unified dataset configuration
    dataset_yaml = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'merged_civic_dataset', 'data.yaml'))

    # If the script finds a checkpoint from a previous run, it resumes from exactly where it crashed/stopped!
    if os.path.exists(checkpoint_path):
        print(f"\n[!] Found previous checkpoint at {checkpoint_path}")
        print("[!] Resuming training from the last saved epoch...")
        model = YOLO(checkpoint_path)
        results = model.train(resume=True)
    else:
        print("\n[*] Starting fresh training process...")
        model = YOLO('yolov8n.pt') 
        results = model.train(
            data=dataset_yaml,
            epochs=300,            # Increased to 300 for overnight training
            imgsz=640,
            batch=4,               
            workers=1,             
            mosaic=0.0,            
            device=0,              
            name='civicshield_v1', 
            project='runs/detect',
            exist_ok=True,         # Ensures it saves to the exact same folder every time
            save=True,             # Ensures checkpoints are saved every epoch
            save_period=1          # Hardcode save every 1 epoch
        )

    print("\n✅ Training complete! Your model weights are saved in runs/detect/civicshield_v1/weights/best.pt")

if __name__ == '__main__':
    train_model()
