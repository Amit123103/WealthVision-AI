import os
from PIL import Image, ImageDraw

def generate_placeholders():
    static_dir = os.path.join(os.path.dirname(__file__), "static", "uploads")
    os.makedirs(static_dir, exist_ok=True)
    
    colors = [
        (234, 179, 8),   # Gold
        (16, 185, 129),  # Green
        (239, 68, 68),   # Red
        (59, 130, 246),  # Blue
        (168, 85, 247)   # Purple
    ]
    
    print(f"Generating seeded images in {static_dir}...")
    
    for i in range(20):
        filename = f"seeded-img-{i}.jpg"
        filepath = os.path.join(static_dir, filename)
        
        # 300x200 placeholder with a simple pattern
        img = Image.new('RGB', (300, 200), color=(10, 10, 10))
        draw = ImageDraw.Draw(img)
        
        # Simple geometric pattern
        color = colors[i % len(colors)]
        draw.rectangle([50, 50, 250, 150], outline=color, width=2)
        draw.text((100, 90), f"SEEDED DATA NODE {i}", fill=color)
        
        img.save(filepath, "JPEG")
        print(f"Created {filename}")

if __name__ == "__main__":
    generate_placeholders()
