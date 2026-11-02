import { createRoot } from 'react-dom/client';
import { ShaderBackground } from '@/Components/ui/dwd';

const container = document.getElementById('hero-shader');

if (container) {
    createRoot(container).render(<ShaderBackground className="hero-shader-canvas" />);
}
