import torch
import torchvision.models as models
from torchvision import transforms
from PIL import Image
import random
import numpy as np
import matplotlib.pyplot as plt
import io

class WealthEstimator:
    def __init__(self, model_path: str = None):
        """
        Loads a pre-trained EfficientNet model for wealth inference.
        In MVP, this acts as a robust dummy wrapper matching production signatures.
        """
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # In production:
        # self.model = models.efficientnet_b0()
        # self.model.classifier[1] = torch.nn.Linear(in_features=1280, out_features=1)
        # self.model.load_state_dict(torch.load(model_path))
        
        # Setup image transforms mimicking the trained methodology
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

    def predict(self, image_stream) -> dict:
        """
        Perform inference to estimate wealth score.
        MVP: Simulates inference returning normalized index, confidence and categorized label.
        """
        try:
            img = Image.open(image_stream).convert('RGB')
            tensor = self.transform(img).unsqueeze(0).to(self.device)
            
            # Dummy inference block
            predicted_score = random.uniform(0.1, 99.9)
            confidence = random.uniform(0.70, 0.99)
            
            if predicted_score > 75:
                category = "High Wealth"
            elif predicted_score > 40:
                category = "Medium Wealth"
            else:
                category = "Low Wealth"
                
            # Generate mock Grad-CAM overlay
            heatmap_stream = self._generate_mock_heatmap(img)
                
            return {
                "wealth_index": round(predicted_score, 2),
                "confidence": round(confidence, 4),
                "category": category,
                "heatmap_stream": heatmap_stream
            }
        except Exception as e:
            raise RuntimeError(f"AI Inference failed: {str(e)}")

    def _generate_mock_heatmap(self, original_img) -> io.BytesIO:
        # Create a mock heatmap (random gaussian-like spots)
        img_array = np.array(original_img.resize((224, 224)))
        heatmap = np.random.rand(224, 224) 
        
        # Apply jet colormap
        cmap = plt.get_cmap('jet')
        heatmap_colored = cmap(heatmap)[:, :, :3] * 255
        
        # Overlay
        overlay = (img_array * 0.5 + heatmap_colored * 0.5).astype(np.uint8)
        
        buf = io.BytesIO()
        Image.fromarray(overlay).save(buf, format='JPEG')
        buf.seek(0)
        return buf
